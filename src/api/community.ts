import { COUNT, IN, jsonKeys, PostgresDatabaseInterface } from '@jace1995/postgres-helpers'
import { DialogPrevented } from '@jace1995/telegram-handler/build/start/error-handler'
import { generateUniqueID } from '../helpers/utils'
import { CommunityApiInterface, EditCommunity, NewCommunity, StatisticsAlliesInputData, StatisticsResult } from '../types/api'
import { IdProvider, Community, t, Member, TaskCommunity } from '../types/models'
import { worker } from '../helpers/run-worker'

export class CommunityApi implements CommunityApiInterface {
  constructor(private pg: PostgresDatabaseInterface) { }

  async create(community: NewCommunity) {
    const communityId = await generateUniqueID(id => this.pg.select(v => ({
      table: t.community,
      where: {
        [t.community.id]: v(id)
      },
      first: `${COUNT()} = 0`
    })))

    const newCommunity: IdProvider = await this.pg.insert<Community>(v => ({
      table: t.community,
      value: {
        [t.community.id]: v(communityId),
        [t.community.type]: v(community.type),
        [t.community.name]: v(community.name),
        [t.community.description]: v(community.description),
        [t.community.image]: v(community.image),
      },
      returning: [t.community.id],
    }))
    return newCommunity.id
  }

  nameExists(name: Community['name']) {
    return this.pg.select<Community, boolean>(v => ({
      table: t.community,
      where: {
        [t.community.name]: v(name)
      },
      first: `${t.community.name} = ${v(name)}`,
    }))
  }

  async findById(communityId: Community['id']) {
    const value = await this.pg.select<Community>(v => ({
      table: t.community,
      where: {
        [t.community.id]: v(communityId)
      },
      first: true,
    }))

    if (!value) {
      throw new DialogPrevented()
    }

    return value
  }

  async findByIds(communityIds: Community['id'][]) {
    const value = await this.pg.select<Community>(v => ({
      table: t.community,
      where: `${t.community.id} ${IN(communityIds.map(v))}`, // ! refactoring
    }))

    if (!value || value.length < communityIds.length) {
      throw new DialogPrevented()
    }

    return value
  }

  async edit(communityId: Community['id'], value: EditCommunity) {
    const editableProps = jsonKeys<EditCommunity>()

    await this.pg.update<Community>(v => ({
      table: t.community,
      value: (() => {
        const props = {}

        if (editableProps.name in value) {
          props[t.community.name] = v(value.name)
        }

        if (editableProps.image in value) {
          props[t.community.image] = v(value.image)
        }

        if (editableProps.description in value) {
          props[t.community.description] = v(value.description)
        }

        if (editableProps.locations in value) {
          props[t.community.locations] = v(value.locations)
        }

        return props
      })(),
      where: {
        [t.community.id]: v(communityId)
      },
    }))
  }

  async close(communityIds: Community['id'] | Community['id'][]) {
    const [communities] = await Promise.all([
      this.pg.update<Community>(v => ({
        table: t.community,
        value: {
          [t.community.closed]: v(true)
        },
        where: (
          Array.isArray(communityIds) ?
            `${[t.community.id]} ${IN(communityIds.map(v))}` :
            {
              [t.community.id]: v(communityIds)
            }
        ),
        returning: true,
      })),

      this.pg.update<TaskCommunity>(v => ({
        table: t.task_community,
        value: {
          [t.task_community.closed]: v(true)
        },
        where: (
          Array.isArray(communityIds) ?
            `${[t.task_community.community_id]} ${IN(communityIds.map(v))}` :
            {
              [t.task_community.community_id]: v(communityIds)
            }
        ),
      })),
    ])

    await this.pg.delete<Member>(v => ({
      table: t.member,
      where: (
        Array.isArray(communityIds) ?
          `${[t.member.community_id]} ${IN(communityIds.map(v))}` :
          {
            [t.member.community_id]: v(communityIds)
          }
      ),
    }))

    return communities
  }

  statistics(data: StatisticsAlliesInputData) {
    return worker<StatisticsAlliesInputData, StatisticsResult>(
      './src/api/workers/allies-stats/index.ts',
      data
    )
  }
}

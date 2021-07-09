import { PostgresDatabaseInterface } from '@jace1995/postgres-helpers'
import { DialogPrevented } from '@jace1995/telegram-handler/build/start/error-handler'
import { LocationsApiInterface } from '../types/api'
import { Community, locationsSequence, t, UnionLocation } from '../types/models'

export class LocationsApi implements LocationsApiInterface {
  constructor(private pg: PostgresDatabaseInterface) { }

  list(communityId: Community['id']) {
    return this.pg.select<Community, Community['locations']>(v => ({
      table: t.community,
      where: {
        [t.community.id]: v(communityId)
      },
      first: t.community.locations,
    }))
  }

  async findById(communityId: Community['id'], locationId: string) {
    const value = await this.pg.select<Community, UnionLocation>(v => ({
      table: t.community,
      where: {
        [t.community.id]: v(communityId)
      },
      first: `${t.community.locations}->${v(locationId)}`,
    }))

    if (!value) {
      throw new DialogPrevented()
    }

    return value
  }

  async create(communityId: Community['id'], location: UnionLocation) {
    await this.pg.update<Community>(v => ({
      table: t.community,
      value: {
        [t.community.locations]: (
          `jsonb_set(${t.community.locations}, array[nextval(${v(locationsSequence)})::text], ${v(location)})`
        )
      },
      where: {
        [t.community.id]: v(communityId)
      },
    }))
  }

  async update(
    communityId: Community['id'],
    locationId: string,
    location: UnionLocation
  ) {
    await this.pg.update<Community>(v => ({
      table: t.community,
      value: {
        [t.community.locations]: (
          `jsonb_set(${t.community.locations}, array[${v(locationId)}], ${v(location)})`
        )
      },
      where: {
        [t.community.id]: v(communityId)
      },
    }))
  }

  async delete(communityId: Community['id'], locationId: string) {
    await this.pg.update<Community>(v => ({
      table: t.community,
      value: {
        [t.community.locations]: `${t.community.locations} - ${v(locationId)}`
      },
      where: {
        [t.community.id]: v(communityId)
      },
    }))
  }
}

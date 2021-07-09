import {
  PostgresDatabaseInterface, select,
  ARRAY, full, IN, join, jsonKeys, pgArray, pgCast, pgType, table, view,
} from '@jace1995/postgres-helpers'
import { DialogPrevented } from '@jace1995/telegram-handler/build/start/error-handler'
import { worker } from '../helpers/run-worker'
import { QueueAction } from '../queue/types'

import {
  AssignTask,
  NewTask,
  TaskApiInterface,
  RequestAssign,
  CancelRequestAssign,
  ChangeMembersProgress,
  ChangeClosed,
  ValidateTask,
  TaskInfoProps,
  TaskValidationInfo,
  StatisticsTaskInputData,
  StatisticsResult,
  AddTaskLocationsProps,
} from '../types/api'

import {
  IdProvider,
  Community,
  t,
  Task,
  TaskCommunity,
  TaskWaitAssign,
  TaskListItem,
  TaskInfo,
  LocationTaskDetails,
  TaskType,
  TaskProgress,
  TaskQueue,
  User,
  Role,
  FullTaskDetails,
  Member,
  TaskUnionsCounter,
  TasksCondition,
} from '../types/models'

import { Queue } from './utils'

interface JsonIndividual {
  key: string
  value: string
}

export class TaskApi implements TaskApiInterface {
  constructor(
    private pg: PostgresDatabaseInterface,
    private queue: Queue
  ) { }

  async create(task: NewTask) {
    const newTask: IdProvider = await this.pg.insert<Task>(v => ({
      table: t.task,
      value: {
        [t.task.title]: v(task.title),
        [t.task.type]: v(task.type),
        [t.task.role]: v(task.role),
        [t.task.details]: v(task.details),
      },
      returning: [t.task.id]
    }))

    return newTask.id
  }

  async requestAssign(props: RequestAssign) {
    await this.pg.insert(v => ({
      table: t.task_wait_assign,
      value: props.recipientsIds.map(recipientId => ({
        task_id: v(props.taskId),
        from_id: v(props.senderId),
        to_id: v(recipientId),
      })),
    }))
  }

  async cancelRequestAssign(props: CancelRequestAssign) {
    await this.pg.delete(v => ({
      table: t.task_wait_assign,
      where: {
        task_id: v(props.taskId),
        from_id: v(props.senderId),
        to_id: v(props.recipientId),
      },
    }))
  }

  requests(recipientId: Community['id']) {
    return this.pg.select<TaskWaitAssign, TaskListItem>(v => ({
      table: t.task_wait_assign,
      columns: {
        [t.task_list_item.id]: t.task.id,
        [t.task_list_item.title]: t.task.title,
      },
      join: join<Task>({
        table: t.task,
        on: {
          [t.task.id]: t.task_wait_assign.task_id
        },
      }),
      where: {
        [t.task_wait_assign.to_id]: v(recipientId),
      },
    }))
  }

  assignsList(taskId: Task['id']) {
    return this.pg.select<TaskCommunity>(v => ({
      table: t.task_community,
      where: {
        [t.task_community.task_id]: v(taskId),
      },
    }))
  }

  async assign(props: AssignTask) {
    await this.queue.add([QueueAction.assign_task, props])
  }
  
  list(communityId: Community['id'], roles: Task['role'][], closed = false): Promise<TaskListItem[]> {
    return this.pg.select<TaskCommunity, TaskListItem>(v => ({
      table: t.task_community,
      columns: {
        [t.task_list_item.id]: t.task.id,
        [t.task_list_item.title]: t.task.title,
        [t.task_list_item.type]: t.task.type,
        [t.task_list_item.community_id]: t.task_community.community_id,
      },
      join: join<Task>({
        table: t.task,
        on: {
          [t.task.id]: t.task_community.task_id
        },
      }),
      where: (
        `${t.task_community.community_id} = ${v(communityId)} and ` +
        `${t.task.role} ${IN(roles.map(v))} and ` + // ! refactoring "in"
        `${t.task_community.closed} = ${v(closed)}`
      )
    }))
  }

  async activeList(conditions: TasksCondition[]): Promise<TaskListItem[]> {
    if (!conditions.length) {
      return []
    }

    return this.pg.select<TaskCommunity, TaskListItem>(v => ({
      table: t.task_community,
      columns: {
        [t.task_list_item.id]: t.task.id,
        [t.task_list_item.title]: t.task.title,
        [t.task_list_item.type]: t.task.type,
        [t.task_list_item.community_id]: `(array_agg(${t.task_community.community_id}))[1]`,
      },
      join: join<Task>({
        table: t.task,
        on: {
          [t.task.id]: t.task_community.task_id
        },
      }),
      where: (
        conditions.map(c => (
          '(' +
          `${t.task_community.community_id} = ${v(c.community_id)} and ` +
          `${t.task.role} ${IN(c.roles.map(v))}` +
          ')'
        )).join(' or ') +
        ` and ${t.task_community.closed} = ${v(false)}`
      ),
      group: t.task.id,
    }))
  }

  async findById(taskId: Task['id']) {
    const value = await this.pg.select<Task>(v => ({
      table: t.task,
      where: {
        [t.task.id]: v(taskId)
      },
      first: true,
    }))

    if (!value) {
      throw new DialogPrevented()
    }

    return value
  }

  async info(props: TaskInfoProps) {
    const d = jsonKeys<FullTaskDetails>()
    const u = jsonKeys<TaskUnionsCounter>()

    // ! refactoring
    const waitCount = (
      `case when (${t.task.type} = '${TaskType.single}') ` +
      `then ` +
      `(select count(*) from jsonb_each(${t.task.details}->'${d.participants}') as "p" ` +
      `where "p"."value" = '"${TaskQueue.wait}"') else 0 ` +
      `end`
    )
    const doingCount = (
      `case when (${t.task.type} = '${TaskType.single}' or ${t.task.type} = '${TaskType.individual}') ` +
      `then ` +
      `(select count(*) from jsonb_each(${t.task.details}->'${d.participants}') as "p" ` +
      `where "p"."value" = '"${TaskProgress.doing}"') else 0 ` +
      `end`
    )
    const doneCount = (
      `case when (${t.task.type} = '${TaskType.single}' or ${t.task.type} = '${TaskType.individual}') ` +
      `then ` +
      `(select count(*) from jsonb_each(${t.task.details}->'${d.participants}') as "p" ` +
      `where "p"."value" = '"${TaskProgress.done}"') else 0 ` +
      `end`
    )

    const value = await this.pg.select<TaskCommunity, TaskInfo>(v => ({
      table: t.task_community,
      // !! full
      columns: {
        [t.task_info.id]: t.task.id,
        [t.task_info.type]: t.task.type,
        [t.task_info.title]: t.task.title,
        [t.task_info.role]: t.task.role,
        [t.task_info.closed]: t.task_community.closed,
        [t.task_info.unions_count]: `${t.task.unions}->'${u.count}'`,
        [t.task_info.ready]: `${t.task.details}->'${d.ready}'`,

        [t.task_info.description]: `${t.task.details}->'${d.description}'`,
        [t.task_info.images]: `${t.task.details}->'${d.images}'`,
        [t.task_info.documents]: `${t.task.details}->'${d.documents}'`,
        [t.task_info.locations]: `${t.task.details}->'${d.locations}'`,

        [t.task_info.required]: `${t.task.details}->'${d.required}'`,
        [t.task_info.progress]: `${t.task.details}->'${d.participants}'->${v(String(props.userId))}`,
        [t.task_info.wait]: waitCount,
        [t.task_info.doing]: doingCount,
        [t.task_info.done]: doneCount,
      },
      join: join<Task>({
        table: t.task,
        on: {
          [t.task.id]: t.task_community.task_id
        },
      }),
      where: {
        [t.task_community.task_id]: v(props.taskId),
        [t.task_community.community_id]: v(props.communityId),
      },
      first: true,
    }))

    if (!value) {
      throw new DialogPrevented()
    }

    return value
  }

  async updateLocations(
    props: TaskInfoProps,
    locations: LocationTaskDetails['locations'][Community['id']]
  ) {
    interface ValueContainer {
      value: LocationTaskDetails['locations'][Community['id']]
    }

    const d = jsonKeys<FullTaskDetails>()
    const r = view<ValueContainer>()
    const { details } = t.task

    const result: ValueContainer = await this.pg.update<Task>(v => ({
      table: t.task,
      value: {
        [details]: (
          `jsonb_set(` +
            `${details}, ` +
            pgCast(ARRAY([d.locations, props.communityId].map(v)), pgArray(pgType.text)) + ', ' +
            v(locations) +
          `)`
        )
      },
      where: {
        [t.task.id]: v(props.taskId)
      },
      returning: `${t.task.details}->'${d.locations}'->${v(String(props.communityId))} as ${r.value}`,
      first: true,
    })) as any // ! refactoring

    return result.value
  }

  async addLocations(props: AddTaskLocationsProps): Promise<Task> {
    const d = jsonKeys<FullTaskDetails>()
    const { details } = t.task

    return this.pg.update<Task>(v => ({
      table: t.task,
      value: {
        [details]: (
          `jsonb_set(` +
            `${details}, ` +
            pgCast(ARRAY([d.locations, props.communityId].map(v)), pgArray(pgType.text)) + ', ' +
            v(props.locations) +
          `)`
        )
      },
      where: {
        [t.task.id]: v(props.taskId)
      },
      returning: true,
      first: true,
    }))
  }
  
  async changeMembersProgress(props: ChangeMembersProgress) {
    const { details } = t.task
    const { participants } = t.single_task_details

    await this.pg.update<Task>(v => ({
      table: t.task,
      value: {
        [details]: (
          `jsonb_set(` +
            `${details}, ` +
            `'{${participants}}', ` +
            `(${details}->'${participants}') - ${v(String(props.userId))}` +
            (props.progress !== undefined ? ` || ${v({ [props.userId]: props.progress })}` : '') +
          `)`
        )
      },
      where: {
        [t.task.id]: v(props.taskId)
      },
      first: true,
    }))
  }

  async changeClosed(props: ChangeClosed) {
    await this.pg.update<TaskCommunity>(v => ({
      table: t.task_community,
      value: {
        [t.task_community.closed]: v(props.closed)
      },
      where: {
        [t.task_community.task_id]: v(props.taskId),
        ...props.communityId ? {
          [t.task_community.community_id]: v(props.communityId),
        } : {},
      },
    }))
  }

  async accessInfo(props: ValidateTask) {
    const r = view<TaskValidationInfo>()
    
    const value = await this.pg.select<TaskCommunity, TaskValidationInfo>(v => ({
      table: t.task_community,
      columns: {
        [r.role]: full(t.task).role,
        [r.closed]: full(t.task_community).closed,
      },
      join: join<Task>({
        table: t.task,
        on: {
          [full(t.task).id]: full(t.task_community).task_id
        },
      }),
      where: {
        [full(t.task_community).task_id]: v(props.taskId),
        [full(t.task_community).community_id]: v(props.communityId),
        // [full(t.task_community).closed]: v(false), // !
      },
      first: true,
    }))

    if (!value) {
      throw new DialogPrevented()
    }

    return value
  }

  async setReady(taskId: Task['id']) {
    const { details } = t.task
    const { ready } = t.single_task_details

    await this.pg.update<Task>(v => ({
      table: t.task,
      value: {
        [details]: `${details} || '{"${ready}": true}'`
      },
      where: {
        [t.task.id]: v(taskId)
      }
    }))
  }

  participantsWait(taskId: Task['id']) {
    const p = full(table<JsonIndividual>('p'))
    const d = jsonKeys<FullTaskDetails>()

    return this.pg.select<Task, number[]>(v => ({
      table: t.task,
      where: {
        [t.task.id]: v(taskId)
      },
      first: select({
        inside: true,
        table: `jsonb_each(${t.task.details}->'${d.participants}') as ${p}`,
        first: `json_agg(${p.key})`,
        where: {
          [p.value]: v(JSON.stringify(TaskQueue.wait))
        },
      })
    }))
  }

  participantsDoing(taskId: Task['id']) {
    const p = full(table<JsonIndividual>('p'))
    const d = jsonKeys<FullTaskDetails>()

    return this.pg.select<Task, number[]>(v => ({
      table: t.task,
      where: {
        [t.task.id]: v(taskId)
      },
      first: select({
        inside: true,
        table: `jsonb_each(${t.task.details}->'${d.participants}') as ${p}`,
        first: `json_agg(${p.key})`,
        where: {
          [p.value]: v(JSON.stringify(TaskProgress.doing))
        },
      })
    }))
  }

  participantsLeader(taskId: Task['id']) {
    return this.pg.select<TaskCommunity, number[]>(v => ({
      table: t.task_community,
      first: `json_agg(${full(t.user).chat})`,
      join: [
        join<Member>({
          table: t.member,
          on: {
            [full(t.member).community_id]: full(t.task_community).community_id
          },
        }),
        join<User>({
          table: t.user,
          on: {
            [full(t.member).user_id]: full(t.user).id
          },
        }),
      ],
      where: {
        [full(t.task_community).task_id]: v(taskId),
        [full(t.member).role]: v(Role.leader),
      },
      location: full(t.user).chat
    }))
  }

  statistics(data: StatisticsTaskInputData) {
    return worker<StatisticsTaskInputData, StatisticsResult>(
      './src/api/workers/task-stats/index.ts',
      data
    )
  }
}

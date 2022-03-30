import { gql } from 'apollo-boost'
import {
  CreateIssueInput,
  generateCreateIssueInputFromEntity,
} from '~/graphhql/mutations/createIssue'
import {
  CreateTargetInput,
  generateCreateTargetInputFromEntity,
} from '~/graphhql/mutations/createTarget'
import { CreateTodoInput, generateCreateTodoInputFromEntity } from '~/graphhql/mutations/createTodo'
import {
  CreateStudyContentInput,
  generateCreateStudyContentInputFromEntity,
} from '~/graphhql/mutations/createStudyContent'
import {
  CreateInvestigationInput,
  generateCreateInvestigationInputFromEntity,
} from '~/graphhql/mutations/createInvestigation'
import {
  CreateOtherInput,
  generateCreateOtherInputFromEntity,
} from '~/graphhql/mutations/createOther'

export type CreateTaskRequestTypes = {
  taskInput: {
    project_id: number
    name?: string
    taskStatus?: string
    taskType?: number
    startDate?: string
    endDate?: string
    issue?: CreateIssueInput
    targets?: CreateTargetInput[]
    todos?: CreateTodoInput[]
    studyContents?: CreateStudyContentInput[]
    investigations?: CreateInvestigationInput[]
    others?: CreateOtherInput[]
  }
}

export type CreateTaskResponse = {
  createTask: Task
}

export const generateCreateTaskInputFromEntity = (entity: Task) => ({
  project_id: entity.project_id,
  name: entity.name,
  taskStatus: entity.taskStatus,
  taskType: entity.taskType,
  startDate: entity.startDate,
  endDate: entity.endDate,
  targets: entity?.targets?.map((target) => generateCreateTargetInputFromEntity(target)) ?? [],
  todos: entity?.todos?.map((todo) => generateCreateTodoInputFromEntity(todo)) ?? [],
  studyContents:
    entity?.studyContents?.map((studyContent) =>
      generateCreateStudyContentInputFromEntity(studyContent)
    ) ?? [],
  investigations:
    entity?.investigations?.map((investigation) =>
      generateCreateInvestigationInputFromEntity(investigation)
    ) ?? [],
  others: entity?.others?.map((other) => generateCreateOtherInputFromEntity(other)) ?? [],
  issue: entity.issue ? generateCreateIssueInputFromEntity(entity.issue) : undefined,
})

export const CREATE_TASK = gql`
  mutation($taskInput: TaskInput!) {
    createTask(taskInput: $taskInput) {
      id
      name
      taskStatus
      taskType
      startDate
      endDate
      targets {
        id
        taskId
        text
        createdAt
        updatedAt
      }
      todos {
        id
        taskId
        text
        createdAt
        updatedAt
      }
      studyContents {
        id
        taskId
        text
        createdAt
        updatedAt
      }
      investigations {
        id
        taskId
        text
        createdAt
        updatedAt
      }
      others {
        id
        taskId
        text
        createdAt
        updatedAt
      }
      issue {
        id
        taskId
        occurStatus
        occurCount
        occurFrequency
        occurFrequencyDetail
        contents
        impact
        causes {
          id
          issueId
          text
          isHypothesis
          createdAt
          updatedAt
          causeConditions {
            id
            causeId
            achievementCondition
            createdAt
            updatedAt
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`

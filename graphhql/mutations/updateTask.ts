import { gql } from 'apollo-boost'
import {
  generateUpdateTargetInputFromEntity,
  UpdateTargetInput,
} from '~/graphhql/mutations/updateTarget'
import { generateUpdateTodoInputFromEntity, UpdateTodoInput } from '~/graphhql/mutations/updateTodo'
import {
  generateUpdateOtherInputFromEntity,
  UpdateOtherInput,
} from '~/graphhql/mutations/updateOther'
import {
  generateUpdateInvestigationInputFromEntity,
  UpdateInvestigationInput,
} from '~/graphhql/mutations/updateInvestigation'
import {
  generateUpdateStudyContentInputFromEntity,
  UpdateStudyContentInput,
} from '~/graphhql/mutations/updateStudyContent'
import {
  generateUpdateIssueInputFromEntity,
  UpdateIssueInput,
} from '~/graphhql/mutations/updateIssue'

export type UpdateTaskRequestTypes = {
  taskInput: {
    id?: number
    project_id: number
    name?: string
    taskStatus?: string
    taskType?: number
    startDate?: string
    endDate?: string
    issue?: UpdateIssueInput
    targets?: Array<UpdateTargetInput>
    todos?: Array<UpdateTodoInput>
    investigations?: Array<UpdateInvestigationInput>
    studyContents?: Array<UpdateStudyContentInput>
    others?: Array<UpdateOtherInput>
    version: number
  }
}

export type UpdateTaskResponse = {
  updateTask: Task
}

export const generateUpdateTaskInputFromEntity = (entity: Task) => ({
  id: entity.id,
  project_id: entity.project_id,
  name: entity.name,
  taskStatus: entity.taskStatus,
  taskType: entity.taskType,
  targets: entity?.targets?.map((target) => generateUpdateTargetInputFromEntity(target)) ?? [],
  todos: entity?.todos?.map((todo) => generateUpdateTodoInputFromEntity(todo)) ?? [],
  studyContents:
    entity?.studyContents?.map((studyContent) =>
      generateUpdateStudyContentInputFromEntity(studyContent)
    ) ?? [],
  investigations:
    entity?.investigations?.map((investigation) =>
      generateUpdateInvestigationInputFromEntity(investigation)
    ) ?? [],
  others: entity?.others?.map((other) => generateUpdateOtherInputFromEntity(other)) ?? [],
  issue: entity.issue ? generateUpdateIssueInputFromEntity(entity.issue) : undefined,
  version: entity.version,
  startDate: entity.startDate,
  endDate: entity.endDate,
})

export const UPDATE_TASK = gql`
  mutation($taskInput: TaskInput!) {
    updateTask(taskInput: $taskInput) {
      id
      name
      startDate
      endDate
      version
      targets {
        id
        taskId
        text
        createdAt
        updatedAt
        version
      }
      todos {
        id
        taskId
        text
        createdAt
        updatedAt
        version
      }
      studyContents {
        id
        taskId
        text
        createdAt
        updatedAt
        version
      }
      investigations {
        id
        taskId
        text
        createdAt
        updatedAt
        version
      }
      others {
        id
        taskId
        text
        createdAt
        updatedAt
        version
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
        version
        causes {
          id
          issueId
          text
          isHypothesis
          createdAt
          updatedAt
          version
          causeConditions {
            id
            causeId
            achievementCondition
            createdAt
            updatedAt
            version
          }
        }
        createdAt
        updatedAt
        version
      }
    }
  }
`

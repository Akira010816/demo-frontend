import gql from 'graphql-tag'

export type FindAllTasksResponse = {
  findAllTasks: Array<Task>
}

export const FIND_ALL_TASKS = gql`
  query findAllTasks($projectId: Int!) {
    findAllTasks(projectId: $projectId) {
      id
      name
      registeredUser {
        id
        name
      }
      startDate
      endDate
      taskStatus
      registeredAt
      version
      createdAt
      updatedAt
    }
  }
`

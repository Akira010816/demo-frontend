import gql from 'graphql-tag'

export type FindTasksByProjectIdResponse = {
  findTasksByProjectId: Array<Task>
}

export const FIND_TASKS_BY_PROJECT_ID = gql`
  query findTasksByProjectId($projectId: Int!) {
    findTasksByProjectId(projectId: $projectId) {
      id
      name
      registeredUser {
        id
        name
      }
      taskType
      startDate
      endDate
      taskStatus
      registeredAt
      issue {
        id
        contents
        causes {
          id
          text
          measures {
            id
            name
            startDate
            endDate
          }
        }
      }
      targets {
        id
        text
        measures {
          id
          name
          startDate
          endDate
        }
      }
      todos {
        id
        text
        measures {
          id
          name
          startDate
          endDate
        }
      }
      investigations {
        id
        text
        measures {
          id
          name
          startDate
          endDate
        }
      }
      studyContents {
        id
        text
        measures {
          id
          name
          startDate
          endDate
        }
      }
      others {
        id
        text
        measures {
          id
          name
          startDate
          endDate
        }
      }
    }
  }
`

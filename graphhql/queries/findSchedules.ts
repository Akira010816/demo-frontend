import gql from 'graphql-tag'

export type Project = {
  id: number
  code: string
  name: string
  status: ProjectStatus
  raisedUser: Pick<User, 'id' | 'name'>
  raisedDepartment: Pick<Department, 'id' | 'name'>
  startDate: string
  milestones: Array<Milestone>
  priority: Priority
  version: number
  createdAt: Date
  updatedAt: Date
  progressReports: Array<ProjectProgressReport>
  tasks: Array<Task>
}

export type FindSchedulesResponse = {
  findSchedules: Array<Project>
}

export const FIND_SCHEDULES = gql`
  query findSchedules {
    findSchedules {
      id
      name
      raisedDepartment {
        id
        name
      }
      milestones {
        id
        type
        targetDate
        description
      }
      tasks {
        id
        taskType
        name
        startDate
        endDate
        taskStatus
        registeredAt
        issue {
          id
          causes {
            id
            measures {
              id
              name
              startDate
              endDate
              links
              measureImplementationTasks {
                id
                ganttId
                name
                startAt
                endAt
              }
            }
          }
        }
        targets {
          id
          measures {
            id
            name
            startDate
            endDate
            links
            measureImplementationTasks {
              ganttId
              id
              name
              startAt
              endAt
            }
          }
        }
        todos {
          id
          measures {
            id
            name
            startDate
            endDate
            links
            measureImplementationTasks {
              ganttId
              id
              name
              startAt
              endAt
            }
          }
        }
        investigations {
          id
          measures {
            id
            name
            startDate
            endDate
            links
            measureImplementationTasks {
              id
              ganttId
              name
              startAt
              endAt
            }
          }
        }
        studyContents {
          id
          measures {
            id
            name
            startDate
            endDate
            links
            measureImplementationTasks {
              id
              ganttId
              name
              startAt
              endAt
            }
          }
        }
        others {
          id
          measures {
            id
            name
            startDate
            endDate
            links
            measureImplementationTasks {
              id
              ganttId
              name
              startAt
              endAt
            }
          }
        }
      }
      startDate
      priority
      status
    }
  }
`

import gql from 'graphql-tag'

export type Project = {
  id: number
  code: string
  name: string
  status: ProjectStatus
  raisedUser: Pick<User, 'id' | 'name'>
  raisedDepartment: Pick<Department, 'id' | 'name'>
  owner: UserDepartment
  members: Array<UserDepartment>
  startDate: string
  milestones: Array<Milestone>
  priority: Priority
  version: number
  createdAt: Date
  updatedAt: Date
  progressReports: Array<ProjectProgressReport>
  tasks: Array<Task>
}

export type FindAllProjectsResponse = {
  findAllProjects: Array<Project>
}

export const FIND_ALL_PROJECTS = gql`
  query findAllProjects {
    findAllProjects {
      id
      code: projectCode
      name
      raisedUser {
        id
        name
      }
      owner {
        user {
          id
        }
      }
      members {
        user {
          id
        }
      }
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
        taskStatus
      }
      progressReports {
        id
        targetDate
        status
        unit
        delay
        avoidDelayPlan
        impact
        progress
        reportBody
        quality
        cost
        member
        reportedAt
        projectStatus
        version
      }
      startDate
      priority
      status
      version
      createdAt
      updatedAt
    }
  }
`

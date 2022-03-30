import { gql } from 'apollo-boost'

export type CreateProjectRequestTypes = {
  projectInput: {
    name?: string
    description?: string
    priority?: string
    raised_user_id?: number
    raised_department_id?: number
    owner_id?: number
    milestones?: Array<Omit<Milestone, 'id'>>
    members?: any
    startDate?: string
    achievementConditions: Array<AchievementCondition>
  }
}

export const CREATE_PROJECT = gql`
  mutation($projectInput: ProjectInput!) {
    createProject(projectInput: $projectInput) {
      id
      name
      description
      raisedDepartment {
        id
        name
      }
      raisedUser {
        id
        name
      }
      owner {
        id
      }
      startDate
      milestones {
        id
      }
      createdAt
      updatedAt
    }
  }
`

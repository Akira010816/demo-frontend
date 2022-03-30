import { gql } from 'apollo-boost'

export type UpdateProjectBaseInfoRequestTypes = {
  projectInput: {
    id: number
    name?: string
    status: string
    description?: string
    impact: string
    premiseCondition: string
    priority?: string
    raised_user_id?: number
    raised_department_id?: number
    achievementConditions?: Array<AchievementCondition>
    progressReports?: Array<ProjectProgressReport>
    version: number
  }
}

export type UpdateProjectOwnerMembersRequestTypes = {
  projectInput: {
    id: number
    owner_id?: number
    members?: any
    version: number
  }
}

export type UpdateProjectScheduleRequestTypes = {
  projectInput: {
    id: number
    milestones?: Array<Omit<Milestone, 'id'>>
    startDate?: string
    schedules?: Array<Omit<Schedule, 'id'>>
    version: number
  }
}

export type UpdateProjectProgressReportRequestTypes = {
  projectInput: {
    id: number
    version: number
    progressReports: Array<Omit<ProjectProgressReport, 'id'>> | undefined
  }
}

export const UPDATE_PROJECT = gql`
  mutation($projectInput: ProjectInput!) {
    updateProject(projectInput: $projectInput) {
      id
    }
  }
`

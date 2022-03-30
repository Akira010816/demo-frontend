import { gql } from 'apollo-boost'

export type UpdateScheduleProject = {
  projectId: number
  startDate: string
  endDate: string
}

export type UpdateScheduleProjectMilestone = {
  projectMilestoneId: number
  targetDate: string
}

export type UpdateScheduleTask = {
  taskId: number
  startDate: string
  endDate: string
}

export type UpdateScheduleMeasure = {
  measureId: number
  startDate: string
  endDate: string
}

export type UpdateScheduleMeasureImplementationTask = {
  measureImplementationTaskId: number
  startDate: string
  endDate: string
}

export type UpdateScheduleRequestTypes = {
  scheduleInput: {
    projects: Array<UpdateScheduleProject>
    projectMilestones: Array<UpdateScheduleProjectMilestone>
    tasks: Array<UpdateScheduleTask>
    measures: Array<UpdateScheduleMeasure>
    measureImplementationTasks: Array<UpdateScheduleMeasureImplementationTask>
  }
}

export type UpdateScheduleResponseTypes = {
  updateSchedule: boolean
}

export const UPDATE_SCHEDULE = gql`
  mutation($scheduleInput: UpdateScheduleInput!) {
    updateSchedules(scheduleInput: $scheduleInput)
  }
`

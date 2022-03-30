import { gql } from 'apollo-boost'

export type CopyPlanMeasureRequest = {
  copyPlanMeasureInput: {
    planMeasureId: PlanMeasure['id']
    startBusinessYear: BusinessYear['year']
    endBusinessYear: BusinessYear['year']
    copyToNextYear: boolean
    aggregationType?: Array<keyof Pick<PlanMeasure, 'risks' | 'tasks' | 'costs' | 'sales'>>
  }
}

export type CopyPlanMeasureResponse = {
  copyPlanMeasure: PlanMeasure['id']
}

export const COPY_PLAN_MEASURE = gql`
  mutation($copyPlanMeasureInput: CopyPlanMeasureInput!) {
    copyPlanMeasure(copyPlanMeasureInput: $copyPlanMeasureInput) {
      id
    }
  }
`

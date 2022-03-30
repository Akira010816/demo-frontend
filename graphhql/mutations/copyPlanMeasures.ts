import { gql } from 'apollo-boost'

export type CopyPlanMeasuresRequest = {
  copyPlanMeasuresInput: {
    planMeasureIds: Array<PlanMeasure['id']>
    startBusinessYear: BusinessYear['year']
    endBusinessYear: BusinessYear['year']
    copyToNextYear: boolean
  }
}

export type CopyPlanMeasuresResponse = {
  copyPlanMeasures: Array<PlanMeasure['id']>
}

export const COPY_PLAN_MEASURES = gql`
  mutation($copyPlanMeasuresInput: CopyPlanMeasuresInput!) {
    copyPlanMeasures(copyPlanMeasuresInput: $copyPlanMeasuresInput) {
      id
    }
  }
`

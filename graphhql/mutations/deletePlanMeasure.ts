import { gql } from 'apollo-boost'

export type DeletePlanMeasureRequest = {
  deletePlanMeasureInput: {
    id: PlanMeasure['id']
    version?: PlanMeasure['version']
  }
}

export type DeletePlanMeasureResponse = {
  deletePlanMeasure: PlanMeasure['id']
}

export const DELETE_PLAN_MEASURE = gql`
  mutation($deletePlanMeasureInput: DeletePlanMeasureInput!) {
    deletePlanMeasure(deletePlanMeasureInput: $deletePlanMeasureInput) {
      id
      version
    }
  }
`

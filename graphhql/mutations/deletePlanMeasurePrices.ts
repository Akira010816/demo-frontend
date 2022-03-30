import { gql } from 'apollo-boost'

export type DeletePlanMeasurePricesRequest = {
  deletePlanMeasurePricesInput: {
    planMeasureId: PlanMeasure['id']
    startBusinessYear: BusinessYear['year']
    endBusinessYear: BusinessYear['year']
    aggregationType?: Array<keyof Pick<PlanMeasure, 'risks' | 'tasks' | 'costs' | 'sales'>>
  }
}

export type DeletePlanMeasurePricesResponse = {
  deletePlanMeasurePrices: PlanMeasure['id']
}

export const DELETE_PLAN_MEASURE_PRICES = gql`
  mutation($deletePlanMeasurePricesInput: DeletePlanMeasurePricesInput!) {
    deletePlanMeasurePrices(deletePlanMeasurePricesInput: $deletePlanMeasurePricesInput) {
      id
    }
  }
`

import { gql } from 'apollo-boost'

export type UpdateAnnualPlanInput = {
  id: Plan['id']
  status: AnnualPlan['status']
}

export type UpdateAnnualPlanRequestTypes = {
  updateAnnualPlanInput: UpdateAnnualPlanInput
}

export type UpdateAnnualPlanResponseTypes = {
  updateAnnualPlan: AnnualPlan
}

export const UPDATE_ANNUAL_PLAN = gql`
  mutation($updateAnnualPlanInput: UpdateAnnualPlanInput!) {
    updateAnnualPlan(updateAnnualPlanInput: $updateAnnualPlanInput) {
      id
      status
      plans {
        id
        status
        targetSales
        targetSalesCost
        targetSellingExpense
        targetGeneralAdministrativeExpense
        createdAt
        updatedAt
        department {
          id
          name
        }
      }
    }
  }
`

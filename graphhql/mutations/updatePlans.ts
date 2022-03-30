import { gql } from 'apollo-boost'

export type UpdatePlanInput = {
  id: Plan['id']
  targetSales?: Plan['targetSales']
  deemedSales?: Plan['deemedSales']
  targetSalesCost?: Plan['targetSalesCost']
  targetSellingExpense?: Plan['targetSellingExpense']
  targetGeneralAdministrativeExpense?: Plan['targetGeneralAdministrativeExpense']
  version: Plan['version']
}

export type UpdatePlansRequestTypes = {
  updatePlansInput: {
    plans: Array<UpdatePlanInput>
  }
}

export type UpdatePlansResponseTypes = {
  updatePlans: Array<Plan>
}

export const UPDATE_PLANS = gql`
  mutation($updatePlansInput: UpdatePlansInput!) {
    updatePlans(updatePlansInput: $updatePlansInput) {
      id
      version
      deemedSales
      targetSales
      targetSalesCost
      targetSellingExpense
      targetGeneralAdministrativeExpense
    }
  }
`

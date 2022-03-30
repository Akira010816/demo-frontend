import { gql } from 'apollo-boost'

export type ConfirmPlanInput = {
  id: Plan['id']
}

export type ConfirmPlansRequestTypes = {
  confirmPlansInput: {
    plans: Array<ConfirmPlanInput>
  }
}

export type ConfirmPlansResponseTypes = {
  confirmPlans: Array<Plan>
}

export const CONFIRM_PLANS = gql`
  mutation($confirmPlansInput: ConfirmPlansInput!) {
    confirmPlans(confirmPlansInput: $confirmPlansInput) {
      id
      targetSales
      targetSalesCost
      targetSellingExpense
      targetGeneralAdministrativeExpense
    }
  }
`

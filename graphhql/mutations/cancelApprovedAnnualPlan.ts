import { gql } from 'apollo-boost'

export type CancelApprovedAnnualPlanInput = {
  id: AnnualPlan['id']
  version?: AnnualPlan['version']
}

export type CancelApprovedAnnualPlanRequestTypes = {
  cancelApprovedAnnualPlanInput: CancelApprovedAnnualPlanInput
}

export type CancelApprovedAnnualPlanResponseTypes = {
  cancelApprovedAnnualPlan: AnnualPlan
}

export const CANCEL_APPROVED_ANNUAL_PLAN = gql`
  mutation($cancelApprovedAnnualPlanInput: CancelApprovedAnnualPlanInput!) {
    cancelApprovedAnnualPlan(cancelApprovedAnnualPlanInput: $cancelApprovedAnnualPlanInput) {
      status
    }
  }
`

import { gql } from 'apollo-boost'

export type ApproveAnnualPlanInput = {
  id: AnnualPlan['id']
  version: AnnualPlan['version']
}

export type ApproveAnnualPlanRequestTypes = {
  approveAnnualPlanInput: ApproveAnnualPlanInput
}

export type ApproveAnnualPlanResponseTypes = {
  approvePlan: AnnualPlan
}

export const APPROVE_ANNUAL_PLAN = gql`
  mutation($approveAnnualPlanInput: ApproveAnnualPlanInput!) {
    approveAnnualPlan(approveAnnualPlanInput: $approveAnnualPlanInput) {
      status
    }
  }
`

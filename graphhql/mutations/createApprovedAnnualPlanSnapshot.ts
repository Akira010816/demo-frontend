import { gql } from 'apollo-boost'

export type CreateApprovedAnnualPlanSnapshotInput = {
  approvedAnnualPlanId: AnnualPlan['id']
}

export type CreateApprovedAnnualPlanSnapshotRequestTypes = {
  createApprovedAnnualPlanSnapshotInput: CreateApprovedAnnualPlanSnapshotInput
}

export type CreateApprovedAnnualPlanSnapshotResponseTypes = {
  approvedAnnualPlanSnapshot: ApprovedAnnualPlanSnapshot
}

export const CREATE_APPROVED_ANNUAL_PLAN_SNAPSHOT = gql`
  mutation($createApprovedAnnualPlanSnapshotInput: CreateApprovedAnnualPlanSnapshotInput!) {
    createApprovedAnnualPlanSnapshot(
      createApprovedAnnualPlanSnapshotInput: $createApprovedAnnualPlanSnapshotInput
    ) {
      id
    }
  }
`

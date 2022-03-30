import { gql } from 'apollo-boost'

export type UpdateApprovalRequestInput = Pick<ApprovalRequest, 'id' | 'status'>

export type UpdateApprovalRequestRequestTypes = {
  updateApprovalRequestInput: UpdateApprovalRequestInput
}

export type UpdateApprovalRequestResponse = {
  ApprovalRequest: ApprovalRequest
}

export const generateUpdateApprovalRequestInputFromEntity = (
  entity: ApprovalRequest
): UpdateApprovalRequestInput => ({
  id: entity.id,
  status: entity.status,
})

export const UPDATE_APPROVAL_REQUEST = gql`
  mutation($updateApprovalRequestInput: UpdateApprovalRequestInput!) {
    updateApprovalRequest(updateApprovalRequestInput: $updateApprovalRequestInput) {
      id
    }
  }
`

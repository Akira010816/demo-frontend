import { gql } from 'apollo-boost'

export type CancelApprovalRequestInput = Pick<ApprovalRequest, 'id'>

export type CancelApprovalRequestRequestTypes = {
  cancelApprovalRequestInput: CancelApprovalRequestInput
}

export type CancelApprovalRequestResponse = {
  ApprovalRequest: ApprovalRequest
}

export const generateCancelApprovalRequestInputFromEntity = (
  entity: ApprovalRequest
): CancelApprovalRequestInput => ({
  id: entity.id,
})

export const CANCEL_APPROVAL_REQUEST = gql`
  mutation($cancelApprovalRequestInput: CancelApprovalRequestInput!) {
    cancelApprovalRequest(cancelApprovalRequestInput: $cancelApprovalRequestInput) {
      id
    }
  }
`

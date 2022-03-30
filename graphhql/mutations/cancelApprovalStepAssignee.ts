import { gql } from 'apollo-boost'

export type CancelApprovalStepAssigneeInput = {
  id: ApprovalStepAssignee['id']
  comment: ApprovalStepAssignee['comment']
}

export type CancelApprovalStepAssigneeRequestTypes = {
  cancelApprovalStepAssigneeInput: CancelApprovalStepAssigneeInput
}

export type CancelApprovalStepAssigneeResponse = {
  ApprovalStepAssignee: ApprovalStepAssignee
}

export const generateCancelApprovalStepAssigneeInputFromEntity = (
  entity: ApprovalStepAssignee
): CancelApprovalStepAssigneeInput => ({
  id: entity.id,
  comment: entity.comment,
})

export const CANCEL_APPROVAL_STEP_ASSIGNEE = gql`
  mutation($cancelApprovalStepAssigneeInput: CancelApprovalStepAssigneeInput!) {
    cancelApprovalStepAssignee(cancelApprovalStepAssigneeInput: $cancelApprovalStepAssigneeInput) {
      id
      comment
      approvalStatus
      createdAt
      updatedAt
      userDepartment {
        department {
          name
        }
        user {
          id
          name
        }
      }
    }
  }
`

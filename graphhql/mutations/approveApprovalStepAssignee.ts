import { gql } from 'apollo-boost'

export type ApproveApprovalStepAssigneeInput = {
  id: ApprovalStepAssignee['id']
  comment: ApprovalStepAssignee['comment']
}

export type ApproveApprovalStepAssigneeRequestTypes = {
  approveApprovalStepAssigneeInput: ApproveApprovalStepAssigneeInput
}

export type ApproveApprovalStepAssigneeResponse = {
  ApprovalStepAssignee: ApprovalStepAssignee
}

export const generateApproveApprovalStepAssigneeInputFromEntity = (
  entity: ApprovalStepAssignee
): ApproveApprovalStepAssigneeInput => ({
  id: entity.id,
  comment: entity.comment,
})

export const APPROVE_APPROVAL_STEP_ASSIGNEE = gql`
  mutation($approveApprovalStepAssigneeInput: ApproveApprovalStepAssigneeInput!) {
    approveApprovalStepAssignee(
      approveApprovalStepAssigneeInput: $approveApprovalStepAssigneeInput
    ) {
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

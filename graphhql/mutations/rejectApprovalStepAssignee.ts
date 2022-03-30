import { gql } from 'apollo-boost'

export type RejectApprovalStepAssigneeInput = {
  id: ApprovalStepAssignee['id']
  comment: ApprovalStepAssignee['comment']
}

export type RejectApprovalStepAssigneeRequestTypes = {
  rejectApprovalStepAssigneeInput: RejectApprovalStepAssigneeInput
}

export type RejectApprovalStepAssigneeResponse = {
  ApprovalStepAssignee: ApprovalStepAssignee
}

export const generateRejectApprovalStepAssigneeInputFromEntity = (
  entity: ApprovalStepAssignee
): RejectApprovalStepAssigneeInput => ({
  id: entity.id,
  comment: entity.comment,
})

export const REJECT_APPROVAL_STEP_ASSIGNEE = gql`
  mutation($rejectApprovalStepAssigneeInput: RejectApprovalStepAssigneeInput!) {
    rejectApprovalStepAssignee(rejectApprovalStepAssigneeInput: $rejectApprovalStepAssigneeInput) {
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

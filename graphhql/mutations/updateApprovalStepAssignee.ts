import { gql } from 'apollo-boost'

export type UpdateApprovalStepAssigneeInput = {
  id: ApprovalStepAssignee['id']
  comment: ApprovalStepAssignee['comment']
  approvalStatus: ApprovalStepAssignee['approvalStatus']
}

export type UpdateApprovalStepAssigneeRequestTypes = {
  updateApprovalStepAssigneeInput: UpdateApprovalStepAssigneeInput
}

export type UpdateApprovalStepAssigneeResponse = {
  ApprovalStepAssignee: ApprovalStepAssignee
}

export const generateUpdateApprovalStepAssigneeInputFromEntity = (
  entity: ApprovalStepAssignee
): UpdateApprovalStepAssigneeInput => ({
  id: entity.id,
  comment: entity.comment,
  approvalStatus: entity.approvalStatus,
})

export const UPDATE_APPROVAL_STEP_ASSIGNEE = gql`
  mutation($updateApprovalStepAssigneeInput: UpdateApprovalStepAssigneeInput!) {
    updateApprovalStepAssignee(updateApprovalStepAssigneeInput: $updateApprovalStepAssigneeInput) {
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

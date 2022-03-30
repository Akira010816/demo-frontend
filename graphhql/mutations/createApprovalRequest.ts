import { gql } from 'apollo-boost'

export type CreateApprovalRequestInput = {
  approvalCategory: { id: ApprovalCategory['id'] }
  message?: ApprovalRequest['message']
  until?: ApprovalRequest['until']
  approvalFlow: CreateApprovalFlowInput
}

export const generateCreateApprovalRequestInputFromEntity = (
  entity: ApprovalRequest
): CreateApprovalRequestInput => ({
  approvalCategory: { id: entity.approvalCategory?.id ?? 0 },
  approvalFlow: {
    name: entity.approvalFlow?.name,
    description: entity.approvalFlow?.description,
    approvalSteps:
      entity.approvalFlow?.approvalSteps?.map((step) => ({
        ...step,
        approvalStepAssignees:
          step.approvalStepAssignees?.map((assignee) => ({
            comment: assignee.comment,
            approvalStatus: assignee.approvalStatus,
            userDepartment: { id: assignee.userDepartment?.id },
          })) || [],
      })) || [],
  },
  message: entity.message,
  until: entity.until ? new Date(entity.until).toDateString() : undefined,
})

export type CreateApprovalRequestRequestTypes = {
  createApprovalRequestInput: CreateApprovalRequestInput
}

export type CreateApprovalRequestResponse = {
  createApprovalRequest: ApprovalRequest
}

export const CREATE_APPROVAL_REQUEST = gql`
  mutation($createApprovalRequestInput: CreateApprovalRequestInput!) {
    create(createApprovalRequestInput: $createApprovalRequestInput) {
      id
      message
      until
    }
  }
`

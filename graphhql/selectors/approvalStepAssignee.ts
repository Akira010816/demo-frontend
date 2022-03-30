import { ApprovalStepAssigneeStatus, approvalStepAssigneeStatuses } from '~/lib/displaySetting'

export const selectApprovalStepAssigneeStatusLabel = (
  status: ApprovalStepAssigneeStatus | undefined
): string => {
  switch (status) {
    case 'approved':
      return approvalStepAssigneeStatuses['approved'].label
    case 'rejected':
      return approvalStepAssigneeStatuses['rejected'].label
    case 'canceled':
      return approvalStepAssigneeStatuses['canceled'].label
    case 'processing':
    default:
      return approvalStepAssigneeStatuses['processing'].label
  }
}

import { ApprovalStepType, approvalStepTypes } from '~/lib/displaySetting'

export const selectApprovalStepTypeLabel = (type: ApprovalStepType | undefined): string | null => {
  switch (type) {
    case 'everyone':
      return approvalStepTypes['everyone'].label
    case 'atLeastOne':
      return approvalStepTypes['atLeastOne'].label
    default:
      return null
  }
}

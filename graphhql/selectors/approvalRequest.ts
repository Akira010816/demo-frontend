import {
  approvalRequestStatuses,
  ApprovalRequestStatusLabel,
  ApprovalStepAssigneeStatus,
  approvalStepAssigneeStatuses,
  ApprovalStepAssigneeStatusLabel,
} from '~/lib/displaySetting'
import { Diff } from '~/lib/type-utilities'

/**
 * 任意の承認依頼の、自分の担当の承認/却下等のアクションをすべて行ったかどうか
 *
 * @param approvalRequest
 * @param userId
 * @returns boolean
 */
export const selectDidHandleApprovalRequest = (
  approvalRequest?: ApprovalRequest,
  userId?: User['id']
): boolean => {
  const status = selectMyStatusOfAnApprovalRequest(approvalRequest, userId)
  return !!status && status !== approvalStepAssigneeStatuses.processing.label
}

/**
 * 任意の承認依頼から、自分が担当者になっているApprovalStepAssigneeを全て取得
 *
 * @param approvalRequest
 * @param userId
 * @returns Array<ApprovalStepAssignee | undefined>
 */
export const selectMyApprovalStepAssignees = (
  approvalRequest?: ApprovalRequest,
  userId?: User['id']
): Array<ApprovalStepAssignee | undefined> => {
  if (!approvalRequest || !userId) {
    return []
  }

  return [...(approvalRequest?.approvalFlow?.approvalSteps ?? [])]
    .sort(({ order: orderA }, { order: orderB }) => (orderA ?? 0) - (orderB ?? 0))
    .flatMap((approvalStep) => approvalStep.approvalStepAssignees)
    .filter((assignee) => assignee?.userDepartment?.user?.id === userId)
}

/**
 * 任意の承認依頼から、自分が担当者になっているかつ、承認/却下等のアクションが必要な直近のApprovalStepAssigneeを取得
 *
 * @param approvalRequest
 * @param userId
 * @returns ApprovalStepAssignee | undefined
 */
export const selectMyCurrentApprovalStepAssigneeToAction = (
  approvalRequest?: ApprovalRequest,
  userId?: User['id']
): ApprovalStepAssignee | undefined => {
  return selectMyApprovalStepAssignees(approvalRequest, userId).find(
    (assignee) =>
      assignee?.approvalStatus === approvalStepAssigneeStatuses.processing.id ||
      assignee?.approvalStatus === approvalStepAssigneeStatuses.canceled.id
  )
}

/**
 * 任意の承認依頼から、自分が担当者になっているかつ、承認取消処理を行う直近のApprovalStepAssigneeを取得
 *
 * @param approvalRequest
 * @param userId
 * @returns ApprovalStepAssignee | undefined
 */
export const selectMyCurrentApprovalStepAssigneeToCancel = (
  approvalRequest?: ApprovalRequest,
  userId?: User['id']
): ApprovalStepAssignee | undefined => {
  return selectMyApprovalStepAssignees(approvalRequest, userId)
    .reverse()
    .find(
      (assignee) =>
        assignee?.approvalStatus === approvalStepAssigneeStatuses.approved.id ||
        assignee?.approvalStatus === approvalStepAssigneeStatuses.rejected.id
    )
}

/**
 * 任意の承認依頼の、自分の担当の承認状況を取得 (担当になっている最後の承認ステップの承認状況を返却する)
 *
 * @param approvalRequest
 * @param userId
 * @returns ApprovalStepAssigneeStatusLabel | undefined
 */
export const selectMyStatusOfAnApprovalRequest = (
  approvalRequest?: ApprovalRequest,
  userId?: User['id']
): ApprovalStepAssigneeStatusLabel | undefined => {
  const myStatuses = selectMyApprovalStepAssignees(approvalRequest, userId).map(
    (assignee) => assignee?.approvalStatus
  )

  const type = myStatuses[myStatuses.length - 1]
  return type ? approvalStepAssigneeStatuses[type].label : undefined
}

/**
 * 任意の承認依頼の小児ステータスを返却
 *
 * @param approvalRequest
 * @returns ApprovalRequestStatusLabel | undefined
 */
export const selectApprovalRequestStatus = (
  approvalRequest: ApprovalRequest
): ApprovalRequestStatusLabel | undefined => {
  // 依頼取り消しの場合
  if (approvalRequest?.status === approvalRequestStatuses.canceled.id) {
    return approvalRequestStatuses.canceled.label
  }

  const orderedSteps = [...(approvalRequest?.approvalFlow?.approvalSteps ?? [])].sort(
    ({ order: orderA }, { order: orderB }) => (orderA ?? 0) - (orderB ?? 0)
  )

  const statusesOfEveryStep: Array<Diff<ApprovalStepAssigneeStatus, 'canceled'>> = orderedSteps.map(
    (step) => {
      switch (step?.type) {
        // 「全員」の「承認」が必要な場合
        case 'everyone': {
          // すべて「承認」の場合
          const isAllApproved = step?.approvalStepAssignees?.every(
            (assignee) => assignee.approvalStatus === approvalStepAssigneeStatuses.approved.id
          )
          if (isAllApproved) {
            return approvalStepAssigneeStatuses.approved.id
          }

          // 「却下」が一つでも含まれる場合
          const hasAtLeastOneRejected = step?.approvalStepAssignees?.some(
            (assignee) => assignee.approvalStatus === approvalStepAssigneeStatuses.rejected.id
          )
          if (hasAtLeastOneRejected) {
            return approvalStepAssigneeStatuses.rejected.id
          }

          // それ以外は「処理中」
          return approvalStepAssigneeStatuses.processing.id
        }

        // 「少なくとも一人」の「承認」が必要な場合
        case 'atLeastOne': {
          // 「承認」が一つでも含まれる場合
          const hasAtLeastOneApproved = step?.approvalStepAssignees?.some(
            (assignee) => assignee.approvalStatus === approvalStepAssigneeStatuses.approved.id
          )
          if (hasAtLeastOneApproved) {
            return approvalStepAssigneeStatuses.approved.id
          }

          // 「却下」が一つでも含まれる場合
          const hasAtLeastOneRejected = step?.approvalStepAssignees?.some(
            (assignee) => assignee.approvalStatus === approvalStepAssigneeStatuses.rejected.id
          )
          if (hasAtLeastOneRejected) {
            return approvalStepAssigneeStatuses.rejected.id
          }

          // それ以外は「処理中」
          return approvalStepAssigneeStatuses.processing.id
        }

        default:
          return approvalStepAssigneeStatuses.processing.id
      }
    }
  )

  return statusesOfEveryStep.some((status) => status === approvalStepAssigneeStatuses.rejected.id)
    ? approvalRequestStatuses.rejected.label
    : statusesOfEveryStep.every((status) => status === approvalStepAssigneeStatuses.approved.id)
    ? approvalRequestStatuses.approved.label
    : statusesOfEveryStep.some((status) => status === approvalStepAssigneeStatuses.approved.id)
    ? approvalRequestStatuses.processing.label
    : approvalRequestStatuses.processing.label
}

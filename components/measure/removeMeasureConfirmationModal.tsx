import { FC } from 'react'
import { Typography } from 'antd'
import Modal from '../modal'
import { displaySetting, replacePlaceholder } from '~/lib/displaySetting'
import { RemoveMeasureConfirmationModalProps } from './types'

/**
 * 施策の削除確認モーダル
 */
export const RemoveMeasureConfirmationModal: FC<RemoveMeasureConfirmationModalProps> = (props) => {
  return (
    <Modal.Confirm {...props}>
      <Typography.Paragraph>
        {replacePlaceholder(
          displaySetting.projectCounter.labelConfig.deleteMeasureDescription,
          props?.measure?.name ?? ''
        )}
      </Typography.Paragraph>
    </Modal.Confirm>
  )
}

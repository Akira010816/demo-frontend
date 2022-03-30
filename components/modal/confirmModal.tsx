import { FC } from 'react'
import { Modal } from 'antd'
import Button from '../Button'
import { ConfirmModalProps } from './types'

/**
 * 確認モーダル
 */
export const ConfirmModal: FC<ConfirmModalProps> = (props) => {
  return (
    <Modal
      {...props}
      footer={[
        <Button key="back" type="primary" onClick={props.onOk} loading={!!props.loading}>
          {props.okText ?? 'OK'}
        </Button>,
        <Button key="submit" onClick={props.onCancel} type={'ghost'} loading={!!props.loading}>
          {props.cancelText ?? 'キャンセル'}
        </Button>,
      ]}
    >
      {props.content}
      {props.children}
    </Modal>
  )
}

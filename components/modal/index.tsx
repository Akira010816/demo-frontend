import { FC } from 'react'
import { Modal as AntdModal } from 'antd'
import { ModalFuncProps, ModalProps } from 'antd/es/modal'
import { NormalModal } from './normalModal'
import { ConfirmModal } from './confirmModal'
import { ModalTypes } from './types'

const Modal: FC<ModalFuncProps & ModalProps> & ModalTypes = (props) => {
  return <AntdModal {...props} />
}

Modal.Normal = NormalModal
Modal.Confirm = ConfirmModal

export default Modal

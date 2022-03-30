import { FC } from 'react'
import { ModalFuncProps, ModalProps } from 'antd/es/modal'

export type NormalModalProps = ModalFuncProps & ModalProps

export type ConfirmModalProps = ModalFuncProps & ModalProps & { loading?: boolean }

export type ModalTypes = {
  Normal: FC<NormalModalProps>
  Confirm: FC<ConfirmModalProps>
}

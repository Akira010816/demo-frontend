import React, { FC } from 'react'
import { Row, Space } from 'antd'
import Button from './Button'
import { useRouter } from 'next/router'

export type SaveOrCancelProps = {
  onSave?: () => void | Promise<void>
  onCancel?: () => void
  cancelText?: string
  okText?: string
}

export const SaveOrCancel: FC<SaveOrCancelProps> = (props) => {
  const { back } = useRouter()
  const onSave = props.onSave
  const onCancel = props.onCancel ?? back

  return (
    <Row justify={'center'}>
      <Space>
        {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
        <Button type={'primary'} onClick={onSave} style={{ width: '200px' }}>
          {props.okText ?? '保存'}
        </Button>
        <Button type={'ghost'} onClick={onCancel} style={{ width: '200px' }}>
          {props.cancelText ?? 'キャンセル'}
        </Button>
      </Space>
      {props.children}
    </Row>
  )
}

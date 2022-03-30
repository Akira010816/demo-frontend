import React, { FC } from 'react'
import { Col, Row, Modal as AntdModal } from 'antd'
import Button from '../Button'
import { NormalModalProps } from './types'

export const NormalModal: FC<NormalModalProps> = (props) => {
  return (
    <AntdModal
      width={'90%'}
      footer={[
        <Row justify="center" key={'normal-modal-footer'}>
          <Col>
            {props.onOk ? (
              <Button
                type={'primary'}
                key="save"
                onClick={props.onOk}
                style={{ margin: '10px' }}
                {...props.okButtonProps}
              >
                {props.okText ?? '保存'}
              </Button>
            ) : null}
            <Button
              type={'primary'}
              key="back"
              onClick={props.onCancel}
              style={{ margin: '10px' }}
              {...props.cancelButtonProps}
            >
              {props.cancelText ?? '閉じる'}
            </Button>
          </Col>
        </Row>,
      ]}
      {...props}
    >
      {props.children}
    </AntdModal>
  )
}

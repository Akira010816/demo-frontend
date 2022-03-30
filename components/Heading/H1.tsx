import React, { FC } from 'react'
import { Col, Row } from 'antd'
import { title as titleStyle } from '../../pages/style'
import { HeadingProps } from './index'

export const H1: FC<HeadingProps> = (props) => {
  return (
    <Row>
      <Col style={{ width: '95%' }}>
        <div style={titleStyle}>{props.title}</div>
      </Col>
    </Row>
  )
}

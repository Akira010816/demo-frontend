import { Color } from '../lib/styles'
import { Col } from 'antd'
import React, { FC } from 'react'
import { ColProps } from 'antd/lib/col'

export const DivTableHeader: FC<ColProps & React.RefAttributes<HTMLDivElement>> = (props) => {
  const RowTableHeaderStyle = {
    fontSize: '14px',
    backgroundColor: Color.background.lightGrey,
    height: '32px',
    color: Color.font.grey,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid rgb(223, 223, 223)',
  }
  return (
    <Col {...props} style={{ ...RowTableHeaderStyle, ...props.style }} span={props.span}>
      {props.children}
    </Col>
  )
}

export const DivTableBody: FC<ColProps & React.RefAttributes<HTMLDivElement>> = (props) => {
  const RowTableBodyStyle = {
    fontSize: '14px',
    height: '48px',
    color: Color.font.black,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottom: '1px solid rgb(240, 240, 240)',
    borderRight: '1px solid rgb(240, 240, 240)',
    borderLeft: '1px solid rgb(240, 240, 240)',
    paddingLeft: '5px',
    paddingRight: '5px',
  }
  return (
    <Col {...props} style={{ ...RowTableBodyStyle, ...props.style }} span={props.span}>
      {props.children}
    </Col>
  )
}

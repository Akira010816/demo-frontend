import React, { FC, useEffect, useState } from 'react'
import { Row, Col, Input, Tooltip, Form, DatePicker } from 'antd'
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons'
import { internalDateFormat } from '../../lib/date'
import { dateFormat } from '../../lib/displaySetting'
import moment from 'moment'
import { skipEnter } from '~/lib/keyDown'

const styleIcon = { marginTop: '5px', fontSize: '20px' }
const styleIcon2nd = { marginTop: '5px', marginLeft: '20px', fontSize: '20px' }

type MilestoneProps = {
  data?: Array<Milestone>
  onChange?: (values: Array<Milestone>) => void
}

const MilestoneForm: FC<MilestoneProps> = ({ data, ...props }) => {
  const [milestoneData, setMilestoneData] = useState<Array<Milestone>>([])
  const newMilestone = (): Milestone => ({
    id: Math.random(),
    type: 'others',
    targetDate: undefined,
    description: undefined,
  })

  useEffect(() => {
    setMilestoneData(data && data.length > 0 ? data : [newMilestone()])
  }, [data])

  useEffect(() => {
    props.onChange && props.onChange(milestoneData)
  }, [milestoneData, props])

  const updateTargetDate = (targetDate: moment.Moment | null, milestoneId: number): void => {
    setMilestoneData(
      milestoneData.map((ms) => {
        if (ms.id === milestoneId) {
          ms.targetDate = targetDate?.format(internalDateFormat)
          return ms
        } else {
          return ms
        }
      })
    )
  }

  const updateDescription = (
    event: React.ChangeEvent<HTMLInputElement>,
    milestoneId: number
  ): void => {
    setMilestoneData(
      milestoneData.map((ms) => {
        if (ms.id === milestoneId) {
          ms.description = event.target.value
          return ms
        } else {
          return ms
        }
      })
    )
  }

  const removeRow = (milestoneId: number): void => {
    setMilestoneData(milestoneData.filter((ms) => ms.id !== milestoneId))
  }

  return (
    <>
      <Form.Item name={'otherMilestones'} style={{ display: 'none' }}>
        <Input type={'hidden'} />
      </Form.Item>
      <Row style={{ marginBottom: '1rem' }}>その他の重要なマイルストーンを入力して下さい</Row>
      {milestoneData.map((milestone, index: number) => (
        <Row key={milestone.id}>
          <Col span={4}>
            <Form.Item labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
              <DatePicker
                name={milestone.id.toString()}
                placeholder={'日付を入力してください'}
                format={dateFormat}
                defaultValue={
                  milestone.targetDate
                    ? moment(milestone.targetDate, internalDateFormat)
                    : undefined
                }
                onChange={(value) => updateTargetDate(value, milestone.id)}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              name={[milestone.id, 'description']}
              rules={[
                {
                  max: 2048,
                  message: `2048文字以内で入力してください。`,
                },
              ]}
              initialValue={milestone.description}
            >
              <Input
                onKeyDown={skipEnter}
                size="middle"
                name={milestone.id.toString() + 'input'}
                onChange={(event) => updateDescription(event, milestone.id)}
              />
            </Form.Item>
          </Col>
          <Col offset={1}>
            <Tooltip placement="topLeft" title="新規に追加">
              <PlusSquareOutlined
                style={{
                  ...styleIcon,
                  pointerEvents: index === milestoneData.length - 1 ? 'initial' : 'none',
                  opacity: index === milestoneData.length - 1 ? 1 : 0,
                }}
                onClick={() => setMilestoneData(milestoneData.concat(newMilestone()))}
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip placement="topLeft" title="削除">
              <MinusSquareOutlined
                style={{
                  ...styleIcon2nd,
                  pointerEvents: milestoneData.length === 1 ? 'none' : 'initial',
                  opacity: milestoneData.length === 1 ? 0 : 1,
                }}
                onClick={() => removeRow(milestone.id)}
              />
            </Tooltip>
          </Col>
        </Row>
      ))}
    </>
  )
}

export default MilestoneForm

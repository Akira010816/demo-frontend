import React, { ChangeEvent, FC, useEffect } from 'react'
import debounce from 'lodash.debounce'
import update from 'immutability-helper'
import { PlusSquareOutlined } from '@ant-design/icons'
import { Col, Input, Radio, Row } from 'antd'
import Button from '~/components/Button'
import CauseComponent from './cause'
import FormItem from '~/components/form/FormItem'
import { displaySetting } from '~/lib/displaySetting'
import { FormInstance } from 'antd/es/form'

const defaultCause: Cause = {
  id: 0,
  issueId: 0,
  text: '',
  isHypothesis: false,
  version: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const defaultCauseCondition: CauseCondition = {
  id: 0,
  causeId: 0,
  achievementCondition: '',
  version: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const defaultIssue: Issue = {
  id: 0,
  taskId: 0,
  occurStatus: 'occurred',
  occurCount: 0,
  occurFrequency: 'once',
  occurFrequencyDetail: '',
  contents: '',
  impact: '',
  version: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  causes: [{ ...defaultCause, causeConditions: [defaultCauseCondition] }],
}

export type IssueProps = {
  form: FormInstance
  projectId: number
  taskId: number
  issue?: Issue | null
  onChange: (issue: Issue) => void
}

const PAGE_ID = 'taskIssue'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const Issue: FC<IssueProps> = (props) => {
  const issue = props.issue ?? defaultIssue

  const onCauseChange = (cause: CauseWithCauseConditions | null, index: number): void => {
    props.onChange(
      cause === null
        ? update(issue, { causes: { $splice: [[index, 1]] } })
        : update(issue, { causes: { [index]: { $set: cause } } })
    )
  }

  useEffect(() => {
    props.form.setFieldsValue({ issue })
  }, [issue, props.form])

  return (
    <>
      <Row justify={'space-between'} style={{ marginBottom: '1rem' }}>
        <Col span={24}>{labelConfig.title}</Col>
      </Row>
      <Row align={'bottom'}>
        <Col span={24}>
          <FormItem name={['issue', 'contents']} itemId="contents" pageId={PAGE_ID}>
            <Input.TextArea
              placeholder={labelConfig.contentsPlaceholder}
              value={issue.contents}
              onChange={debounce(
                (e: ChangeEvent<HTMLTextAreaElement>) =>
                  props.onChange(update(issue, { contents: { $set: e.target.value } })),
                500
              )}
            />
          </FormItem>

          <FormItem name={['issue', 'occurStatus']} itemId="occurStatus" pageId={PAGE_ID}>
            <Radio.Group
              value={issue.occurStatus}
              onChange={(e) =>
                props.onChange(update(issue, { occurStatus: { $set: e.target.value } }))
              }
            >
              <Radio value={'occurred'}>{labelConfig.occurStatusOccurred}</Radio>
              <Radio value={'mayOccur'}>{labelConfig.occurStatusMayOccur}</Radio>
            </Radio.Group>
          </FormItem>

          <Row style={{ width: '100%' }}>
            <Col span={12}>
              <FormItem
                name={['issue', 'occurFrequency']}
                itemId="occurFrequency"
                pageId={PAGE_ID}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <Radio.Group
                  value={issue.occurFrequency}
                  onChange={(e) =>
                    props.onChange(update(issue, { occurFrequency: { $set: e.target.value } }))
                  }
                >
                  <Radio value={'once'}>{labelConfig.occurFrequencyOne}</Radio>
                  <Radio value={'multiple'}>{labelConfig.occurFrequencyMultiple}</Radio>
                </Radio.Group>
              </FormItem>
            </Col>

            <Col style={{ marginLeft: '-5rem' }}>
              <FormItem
                name={['issue', 'occurFrequencyDetail']}
                itemId="occurFrequencyDetail"
                label=""
                pageId={PAGE_ID}
              >
                <Input
                  placeholder={labelConfig.occurFrequencyDetailPlaceholder}
                  value={issue.occurFrequencyDetail}
                  onChange={debounce(
                    (e) =>
                      props.onChange(
                        update(issue, { occurFrequencyDetail: { $set: e.target.value } })
                      ),
                    500
                  )}
                />
              </FormItem>
            </Col>
          </Row>

          <Row justify={'space-between'} style={{ marginBottom: '1rem' }}>
            <Col span={24}>{labelConfig.impactTitle}</Col>
          </Row>

          <FormItem name={['issue', 'impact']} pageId={PAGE_ID} itemId="impact">
            <Input.TextArea
              placeholder={labelConfig.impactPlaceholder}
              value={issue.impact}
              onChange={debounce(
                (e) => props.onChange(update(issue, { impact: { $set: e.target.value } })),
                500
              )}
            />
          </FormItem>
          {issue?.causes &&
            issue?.causes.map((cause, index) => (
              <CauseComponent
                key={`cause-component-${index}`}
                index={index}
                cause={cause}
                onChange={onCauseChange}
              />
            ))}
          <Button
            style={{ marginTop: '10px' }}
            type="primary"
            onClick={() =>
              props.onChange(
                update(issue, {
                  causes: {
                    $push: [{ ...defaultCause, causeConditions: [defaultCauseCondition] }],
                  },
                })
              )
            }
          >
            {labelConfig.addCauseButtonTitle}
            <PlusSquareOutlined />
          </Button>
        </Col>
      </Row>
    </>
  )
}

export default Issue

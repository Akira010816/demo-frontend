import React, { ChangeEvent, FC } from 'react'
import debounce from 'lodash.debounce'
import { Button, Checkbox, Col, Input, Row } from 'antd'
import update from 'immutability-helper'
import { subTitle } from '~/pages/style'
import AddableInput, { ADDABLE_INPUT_INDEX_PLACEHOLDER } from '~/components/input/addableInput'
import FormItem from '~/components/form/FormItem'
import { displaySetting } from '~/lib/displaySetting'

export type CauseProps = {
  cause: CauseWithCauseConditions
  index: number
  onChange: (cause: CauseWithCauseConditions | null, index: number) => void
}

const defaultCauseCondition: CauseCondition = {
  id: 0,
  causeId: 0,
  achievementCondition: '',
  version: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const PAGE_CAUSE_ID = 'taskIssueCause'
const PAGE_CAUSE_CONDITION_ID = 'taskIssueCauseCauseCondition'
const labelConfigCause = displaySetting[PAGE_CAUSE_ID].labelConfig
const labelConfigCauseCondition = displaySetting[PAGE_CAUSE_CONDITION_ID].labelConfig

const Cause: FC<CauseProps> = (props) => {
  return (
    <>
      <Row
        style={{ ...subTitle, borderBottom: 'none', alignItems: 'center' }}
        justify={'space-between'}
      >
        <Col>{labelConfigCause.title}</Col>
        <Col>
          <Button
            danger
            type="primary"
            size="middle"
            onClick={() => props.onChange(null, props.index)}
          >
            {labelConfigCause.deleteCauseButtonTitle}
          </Button>
        </Col>
      </Row>

      <Row align="bottom">
        <Col span={24} style={{ border: '1px solid #ddd', padding: '16px' }}>
          <FormItem
            name={['issue', 'causes', props.index, 'text']}
            pageId={PAGE_CAUSE_ID}
            itemId={'text'}
          >
            <Input.TextArea
              placeholder={labelConfigCause.causePlaceholder}
              value={props.cause.text}
              onChange={debounce(
                (e: ChangeEvent<HTMLTextAreaElement>) =>
                  props.onChange(
                    update(props.cause, { text: { $set: e.target.value } }),
                    props.index
                  ),
                500
              )}
            />
          </FormItem>
          <FormItem
            name={['issue', 'causes', props.index, 'isHypothesis']}
            pageId={PAGE_CAUSE_ID}
            itemId="isHypothesis"
          >
            <Checkbox
              onChange={(e) =>
                props.onChange(
                  update(props.cause, { isHypothesis: { $set: e.target.checked } }),
                  props.index
                )
              }
              checked={props.cause.isHypothesis}
            >
              {labelConfigCause.isHypothesisTitle}
            </Checkbox>
          </FormItem>

          <Row justify={'space-between'} style={{ marginBottom: '1rem' }}>
            <Col span={24}>{labelConfigCauseCondition.title}</Col>
          </Row>

          {props.cause.causeConditions && (
            <AddableInput
              placeholder={labelConfigCauseCondition.achievementConditionPlaceholder}
              pageId={PAGE_CAUSE_CONDITION_ID}
              itemId="achievementCondition"
              inputs={props.cause.causeConditions}
              defaultInput={defaultCauseCondition}
              updateInput={(input, text) => ({ ...input, text: text })}
              inputToString={(causeCondition) => causeCondition.achievementCondition}
              name={[
                'issue',
                'causes',
                props.index,
                'causeConditions',
                ADDABLE_INPUT_INDEX_PLACEHOLDER,
                'achievementCondition',
              ]}
              onChange={debounce((text: string, index: number) => {
                props.onChange(
                  update(props.cause, {
                    causeConditions: {
                      [index]: {
                        achievementCondition: { $set: text },
                      },
                    },
                  }),
                  props.index
                )
              }, 500)}
              onAdd={() => {
                const cause = update(props.cause, {
                  causeConditions: { $push: [defaultCauseCondition] },
                })
                props.onChange(cause, props.index)
              }}
              onDelete={(index) => {
                const cause = update(props.cause, {
                  causeConditions: { $splice: [[index, 1]] },
                })
                props.onChange(cause, props.index)
              }}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            />
          )}
        </Col>
      </Row>
    </>
  )
}

export default Cause

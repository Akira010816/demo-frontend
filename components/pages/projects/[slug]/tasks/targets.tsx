import React, { FC, useEffect } from 'react'
import debounce from 'lodash.debounce'
import { Col, Row } from 'antd'
import update from 'immutability-helper'
import { displaySetting } from '~/lib/displaySetting'
import { FormInstance } from 'antd/es/form'
import AddableInput, { ADDABLE_INPUT_INDEX_PLACEHOLDER } from '~/components/input/addableInput'

export type TargetsProps = {
  form: FormInstance
  projectId: number
  taskId: number
  targets?: Array<Target>
  onChange: (targets: Array<Target>) => void
}

const defaultTargets: Array<Target> = [
  {
    id: 0,
    taskId: 0,
    text: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const PAGE_ID = 'taskTarget'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const Targets: FC<TargetsProps> = (props) => {
  const targets = props.targets && props.targets.length > 0 ? props.targets : defaultTargets

  useEffect(() => {
    props.form.setFieldsValue({ targets })
  }, [targets, props.form])

  return (
    <>
      <Row justify={'space-between'} style={{ marginBottom: '1rem' }}>
        <Col span={24}>{labelConfig.title}</Col>
      </Row>

      {targets && (
        <AddableInput
          inputType={'textarea'}
          placeholder={labelConfig.textPlaceholder}
          pageId={PAGE_ID}
          itemId="text"
          inputs={targets}
          updateInput={(input, text) => ({ ...input, text: text })}
          defaultInput={defaultTargets[0]}
          inputToString={(target) => target.text}
          name={['targets', ADDABLE_INPUT_INDEX_PLACEHOLDER, 'text']}
          onAdd={() => {
            props.onChange(update(targets, { $push: defaultTargets }))
          }}
          onChange={debounce((text: string, index: number) => {
            props.onChange(
              update(targets, {
                [index]: { text: { $set: text } },
              })
            )
          }, 500)}
          onDelete={(index) => {
            props.onChange(update(targets, { $splice: [[index, 1]] }))
          }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        />
      )}
    </>
  )
}

export default Targets

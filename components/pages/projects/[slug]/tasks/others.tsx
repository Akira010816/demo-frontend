import React, { FC, useEffect } from 'react'
import debounce from 'lodash.debounce'
import { Col, Row } from 'antd'
import update from 'immutability-helper'
import { displaySetting } from '~/lib/displaySetting'
import { FormInstance } from 'antd/es/form'
import AddableInput, { ADDABLE_INPUT_INDEX_PLACEHOLDER } from '~/components/input/addableInput'

export type OthersProps = {
  form: FormInstance
  projectId: number
  taskId: number
  others?: Array<Other>
  onChange: (others: Array<Other>) => void
}

const defaultOthers: Array<Other> = [
  {
    id: 0,
    taskId: 0,
    text: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const PAGE_ID = 'taskOther'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const Others: FC<OthersProps> = (props) => {
  const others = props.others && props.others.length > 0 ? props.others : defaultOthers

  useEffect(() => {
    props.form.setFieldsValue({ others })
  }, [others, props.form])

  return (
    <>
      <Row justify={'space-between'} style={{ marginBottom: '1rem' }}>
        <Col span={24}>{labelConfig.title}</Col>
      </Row>

      {others && (
        <AddableInput
          inputType={'textarea'}
          placeholder={labelConfig.textPlaceholder}
          pageId={PAGE_ID}
          itemId="text"
          inputs={others}
          updateInput={(input, text) => ({ ...input, text: text })}
          defaultInput={defaultOthers[0]}
          inputToString={(other) => other.text}
          name={['others', ADDABLE_INPUT_INDEX_PLACEHOLDER, 'text']}
          onAdd={() => {
            props.onChange(update(others, { $push: defaultOthers }))
          }}
          onChange={debounce((text: string, index: number) => {
            props.onChange(
              update(others, {
                [index]: { text: { $set: text } },
              })
            )
          }, 500)}
          onDelete={(index) => {
            props.onChange(update(others, { $splice: [[index, 1]] }))
          }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        />
      )}
    </>
  )
}

export default Others

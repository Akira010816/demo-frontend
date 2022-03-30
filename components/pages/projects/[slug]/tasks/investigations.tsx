import React, { FC, useEffect } from 'react'
import debounce from 'lodash.debounce'
import { Col, Row } from 'antd'
import update from 'immutability-helper'
import { displaySetting } from '~/lib/displaySetting'
import { FormInstance } from 'antd/es/form'
import AddableInput, { ADDABLE_INPUT_INDEX_PLACEHOLDER } from '~/components/input/addableInput'

export type InvestigationsProps = {
  form: FormInstance
  projectId: number
  taskId: number
  investigations: Array<Investigation>
  onChange: (investigations: Array<Investigation>) => void
}

const defaultInvestigations: Array<Investigation> = [
  {
    id: 0,
    taskId: 0,
    text: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const PAGE_ID = 'taskInvestigation'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const Investigations: FC<InvestigationsProps> = (props) => {
  const investigations =
    props.investigations && props.investigations.length > 0
      ? props.investigations
      : defaultInvestigations

  useEffect(() => {
    props.form.setFieldsValue({ investigations })
  }, [investigations, props.form])

  return (
    <>
      <Row justify={'space-between'} style={{ marginBottom: '1rem' }}>
        <Col span={24}>{labelConfig.title}</Col>
      </Row>

      {investigations && (
        <AddableInput
          inputType={'textarea'}
          placeholder={labelConfig.textPlaceholder}
          pageId={PAGE_ID}
          itemId="text"
          inputs={investigations}
          updateInput={(input, text) => ({ ...input, text: text })}
          defaultInput={defaultInvestigations[0]}
          inputToString={(investigation) => investigation.text}
          name={['investigations', ADDABLE_INPUT_INDEX_PLACEHOLDER, 'text']}
          onAdd={() => {
            props.onChange(update(investigations, { $push: defaultInvestigations }))
          }}
          onChange={debounce((text: string, index: number) => {
            props.onChange(
              update(investigations, {
                [index]: { text: { $set: text } },
              })
            )
          }, 500)}
          onDelete={(index) => {
            props.onChange(update(investigations, { $splice: [[index, 1]] }))
          }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        />
      )}
    </>
  )
}

export default Investigations

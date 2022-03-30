import React, { FC, useEffect } from 'react'
import debounce from 'lodash.debounce'
import { Col, Row } from 'antd'
import update from 'immutability-helper'
import { displaySetting } from '~/lib/displaySetting'
import { FormInstance } from 'antd/es/form'
import AddableInput, { ADDABLE_INPUT_INDEX_PLACEHOLDER } from '~/components/input/addableInput'

export type StudyContentsProps = {
  form: FormInstance
  projectId: number
  taskId: number
  studyContents?: Array<StudyContent>
  onChange: (studyContents: Array<StudyContent>) => void
}

const defaultStudyContents: Array<StudyContent> = [
  {
    id: 0,
    taskId: 0,
    text: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const PAGE_ID = 'taskStudyContent'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const StudyContents: FC<StudyContentsProps> = (props) => {
  const studyContents =
    props.studyContents && props.studyContents.length > 0
      ? props.studyContents
      : defaultStudyContents

  useEffect(() => {
    props.form.setFieldsValue({ studyContents })
  }, [studyContents, props.form])

  return (
    <>
      <Row justify={'space-between'} style={{ marginBottom: '1rem' }}>
        <Col span={24}>{labelConfig.title}</Col>
      </Row>

      {studyContents && (
        <AddableInput
          inputType={'textarea'}
          placeholder={labelConfig.textPlaceholder}
          pageId={PAGE_ID}
          itemId="text"
          inputs={studyContents}
          updateInput={(input, text) => ({ ...input, text: text })}
          defaultInput={defaultStudyContents[0]}
          inputToString={(studyContent) => studyContent.text}
          name={['studyContents', ADDABLE_INPUT_INDEX_PLACEHOLDER, 'text']}
          onChange={debounce((text: string, index: number) => {
            props.onChange(
              update(studyContents, {
                [index]: { text: { $set: text } },
              })
            )
          }, 500)}
          onAdd={() => {
            props.onChange(update(studyContents, { $push: defaultStudyContents }))
          }}
          onDelete={(index) => {
            props.onChange(update(studyContents, { $splice: [[index, 1]] }))
          }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        />
      )}
    </>
  )
}

export default StudyContents

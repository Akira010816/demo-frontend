import React, { ReactElement, useEffect, useState } from 'react'
import { Row, Col, Input, Tooltip } from 'antd'
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons'
import { skipEnter } from '~/lib/keyDown'
import { FormInstance, FormItemProps } from 'antd/es/form'
import FormItem, { P2FormItemProps } from '~/components/form/FormItem'

export const ADDABLE_INPUT_INDEX_PLACEHOLDER = '#ADDIBLE_INPUT_INDEX'

const styleRow = { marginBottom: '16px' }
const styleInput = { marginLeft: '4px' }
const styleIcon = { marginTop: '5px', fontSize: '20px' }
const styleIcon2nd = { marginTop: '5px', marginLeft: '20px', fontSize: '20px' }

type InputType = 'input' | 'textarea'

export type AddableInputProps<T> = {
  inputType?: InputType
  inputs?: Array<T>
  defaultInput: T
  placeholder?: string
  name?: FormItemProps['name']
  rules?: FormItemProps['rules']
  onChange?: (value: string, index: number, inputs: Array<T>) => void
  onAdd?: (inputs: Array<T>) => void
  onDelete?: (index: number, inputs: Array<T>) => void
  inputToString: (dataItem: T) => string
  updateInput: (input: T, text: string) => T
  form?: FormInstance
} & P2FormItemProps

// eslint-disable-next-line @typescript-eslint/ban-types
const AddableInput = <T extends string | object>(props: AddableInputProps<T>): ReactElement => {
  const defaultPlaceholder = ''
  const [inputs, setInputs] = useState<Array<T>>(props.inputs ?? [props.defaultInput])

  const getIndexedName = (name: FormItemProps['name'], index: number): FormItemProps['name'] => {
    return Array.isArray(name)
      ? name.map((item) =>
          typeof item === 'string' && item === ADDABLE_INPUT_INDEX_PLACEHOLDER ? index : item
        )
      : name
  }

  useEffect(() => {
    setInputs(props.inputs ?? [props.defaultInput])
  }, [props.defaultInput, props.inputs])

  return (
    <>
      {inputs?.map((input: T, index) => {
        return (
          <Row style={styleRow} key={index}>
            <Col span={17}>
              <FormItem
                style={{ marginBottom: 0 }}
                pageId={props.pageId ?? ''}
                itemId={props.itemId ?? ''}
                name={props.name ? getIndexedName(props.name, index) : ['addableInput', index]}
                initialValue={props.inputToString(input)}
              >
                {(() => {
                  switch (props.inputType) {
                    case 'textarea':
                      return (
                        <Input.TextArea
                          style={styleInput}
                          placeholder={props.placeholder || defaultPlaceholder}
                          onChange={(e) => {
                            const newInputs = inputs.map((input, inputIndex) =>
                              inputIndex === index
                                ? props.updateInput(input, e.target.value)
                                : input
                            )
                            setInputs(newInputs)
                            props.onChange?.(e.target.value, index, newInputs)
                          }}
                        />
                      )
                    case 'input':
                    default:
                      return (
                        <Input
                          onKeyDown={skipEnter}
                          style={styleInput}
                          placeholder={props.placeholder || defaultPlaceholder}
                          onChange={(e) => {
                            const newInputs = inputs.map((input, inputIndex) =>
                              inputIndex === index
                                ? props.updateInput(input, e.target.value)
                                : input
                            )
                            setInputs(newInputs)
                            props.onChange?.(e.target.value, index, newInputs)
                          }}
                        />
                      )
                  }
                })()}
              </FormItem>
            </Col>

            <Col offset={1}>
              <Tooltip placement="topLeft" title="新規に追加">
                <PlusSquareOutlined
                  style={{
                    ...styleIcon,
                    pointerEvents: index === inputs.length - 1 ? 'initial' : 'none',
                    opacity: index === inputs.length - 1 ? 1 : 0,
                  }}
                  onClick={() => {
                    const newInputs = [...inputs, props.defaultInput]
                    setInputs(newInputs)
                    props.onAdd?.(newInputs)
                  }}
                />
              </Tooltip>
            </Col>

            <Col>
              <Tooltip placement="topLeft" title="削除">
                <MinusSquareOutlined
                  style={{
                    ...styleIcon2nd,
                    pointerEvents: inputs.length === 1 ? 'none' : 'initial',
                    opacity: inputs.length === 1 ? 0 : 1,
                  }}
                  onClick={() => {
                    const newInputs = inputs.filter((_, inputIndex) => inputIndex !== index)
                    setInputs(newInputs)
                    props.onDelete?.(index, newInputs)
                  }}
                />
              </Tooltip>
            </Col>
          </Row>
        )
      })}
    </>
  )
}

export default AddableInput

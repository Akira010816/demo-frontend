import React, { FC, useEffect } from 'react'
import debounce from 'lodash.debounce'
import update from 'immutability-helper'
import { Col, Row } from 'antd'
import { displaySetting } from '~/lib/displaySetting'
import { FormInstance } from 'antd/es/form'
import AddableInput, { ADDABLE_INPUT_INDEX_PLACEHOLDER } from '~/components/input/addableInput'

export type TodosProps = {
  form: FormInstance
  projectId: number
  taskId: number
  todos?: Array<Todo>
  onChange: (todos: Array<Todo>) => void
}

const defaultTodos: Array<Todo> = [
  {
    id: 0,
    taskId: 0,
    text: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const PAGE_ID = 'taskTodo'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const Todos: FC<TodosProps> = (props) => {
  const todos = props.todos && props.todos.length > 0 ? props.todos : defaultTodos

  useEffect(() => {
    props.form.setFieldsValue({ todos })
  }, [todos, props.form])

  return (
    <>
      <Row justify={'space-between'} style={{ marginBottom: '1rem' }}>
        <Col span={24}>{labelConfig.title}</Col>
      </Row>

      {todos && (
        <AddableInput
          inputType={'textarea'}
          placeholder={labelConfig.textPlaceholder}
          pageId={PAGE_ID}
          itemId="text"
          inputs={todos}
          updateInput={(input, text) => ({ ...input, text: text })}
          defaultInput={defaultTodos[0]}
          inputToString={(todo) => todo.text}
          name={['todos', ADDABLE_INPUT_INDEX_PLACEHOLDER, 'text']}
          onAdd={() => {
            props.onChange(update(todos, { $push: defaultTodos }))
          }}
          onChange={debounce((text: string, index: number) => {
            props.onChange(
              update(todos, {
                [index]: { text: { $set: text } },
              })
            )
          }, 500)}
          onDelete={(index) => {
            props.onChange(update(todos, { $splice: [[index, 1]] }))
          }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        />
      )}
    </>
  )
}

export default Todos

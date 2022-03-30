import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useToggle } from 'react-use'
import { Col, Layout, Typography, Row, Space, Input, Form } from 'antd'
import Table from 'components/table'
import { ColumnsType, ColumnType } from 'antd/es/table'
import { InputProps } from 'antd/es/input'
import { ButtonProps } from 'antd/es/button'
import Heading from '~/components/Heading'
import Button from '~/components/Button'
import { displaySetting, replacePlaceholder } from '~/lib/displaySetting'
import Modal from '~/components/modal'
import { ConfirmModalProps, NormalModalProps } from '~/components/modal/types'
import FormItem from '~/components/form/FormItem'
import ImplementationTaskDetailForm from '~/components/measure/measureImplementationTaskDetailForm'
import { SaveOrCancel, SaveOrCancelProps } from '~/components/SaveOrCancel'
import { skipEnter } from '~/lib/keyDown'
import { getRandomString } from '~/lib/randomString'

export type ImplementationTaskFormProps = {
  measureImplementationTasks: Array<MeasureImplementationTask>
  onChange: ({
    measureImplementationTasks,
  }: {
    measureImplementationTasks: Array<MeasureImplementationTask>
  }) => Promise<void> | void
}

const PAGE_ID = 'measureImplementationTaskForm'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const MeasureImplementationTaskForm: FC<ImplementationTaskFormProps> = (props) => {
  const measureImplementationTasks = props.measureImplementationTasks
  const [
    currentMeasureImplementationTaskIndex,
    setCurrentMeasureImplementationTaskIndex,
  ] = useState(0)

  const selectedImplementationTask: MeasureImplementationTask = useMemo(
    () => props.measureImplementationTasks[currentMeasureImplementationTaskIndex],
    [currentMeasureImplementationTaskIndex, props.measureImplementationTasks]
  )

  const [visibleEditTaskModal, toggleVisibleEditTaskModal] = useToggle(false)
  const [visibleDeleteTaskModal, toggleVisibleDeleteTaskModal] = useToggle(false)
  const [visibleAddTaskModal, toggleVisibleAddTaskModal] = useToggle(false)
  const [newImplementationTask, setNewImplementationTask] = useState<MeasureImplementationTask>()

  const [form] = Form.useForm()

  const renderTask: ColumnType<MeasureImplementationTask>['render'] = useCallback(
    (_, task, index) => {
      const onClick: ButtonProps['onClick'] = () => {
        setCurrentMeasureImplementationTaskIndex(index)
        toggleVisibleEditTaskModal()
      }

      return {
        children: (
          <Typography.Link underline onClick={onClick}>
            {task.name}
          </Typography.Link>
        ),
      }
    },
    [toggleVisibleEditTaskModal]
  )

  const renderAction: ColumnType<MeasureImplementationTask>['render'] = useCallback(
    (_, task, index) => {
      const onDelete: ButtonProps['onClick'] = () => {
        setCurrentMeasureImplementationTaskIndex(index)
        toggleVisibleDeleteTaskModal()
      }

      return {
        children: (
          <Col key={`delete-task-button-${index}`}>
            <Button type={'primary'} danger onClick={onDelete}>
              {labelConfig.deleteTaskButton}
            </Button>
          </Col>
        ),
      }
    },
    [toggleVisibleDeleteTaskModal]
  )

  const columns: ColumnsType<MeasureImplementationTask> = useMemo(
    () => [
      {
        title: labelConfig.tableColumnTask,
        width: '70%',
        key: 'measureTasks',
        ellipsis: {
          showTitle: true,
        },
        render: renderTask,
      },
      {
        title: labelConfig.tableColumnAction,
        width: '30%',
        key: 'measureActions',
        render: renderAction,
        align: 'center',
      },
    ],
    [renderTask, renderAction]
  )

  const onAddTaskClick: ButtonProps['onClick'] = () => {
    toggleVisibleAddTaskModal()
  }

  const onNameChange: InputProps['onChange'] = (e) => {
    setNewImplementationTask({
      id: measureImplementationTasks?.length ?? 0,
      name: e.target.value,
      ganttId: getRandomString(),
    })
  }

  const nameList = [['measureImplementationTasks', measureImplementationTasks.length, 'name']]
  const onNameSave: NormalModalProps['onOk'] = async () => {
    await form.validateFields(nameList)
    if (newImplementationTask) {
      props.onChange({
        measureImplementationTasks: [...measureImplementationTasks, newImplementationTask],
      })
    }
    setNewImplementationTask(undefined)
    form.resetFields(['newTaskName'])
    toggleVisibleAddTaskModal()
  }

  const onNameCancel: NormalModalProps['onCancel'] = () => {
    form.resetFields(nameList)
    toggleVisibleAddTaskModal()
  }

  const onImplementationTaskDelete: ConfirmModalProps['onOk'] = () => {
    props.onChange({
      measureImplementationTasks: measureImplementationTasks
        .filter(
          (measureImplementationTask, index) => index !== currentMeasureImplementationTaskIndex
        )
        .map((measureImplementationTask, index) => ({
          ...(measureImplementationTask ?? {}),
          id: index,
        })),
    })
    toggleVisibleDeleteTaskModal()
  }

  const onImplementationTaskCancel: ConfirmModalProps['onCancel'] = () => {
    toggleVisibleDeleteTaskModal()
  }

  const onImplementationTaskDetailSave: SaveOrCancelProps['onSave'] = async () => {
    await form.validateFields()
    toggleVisibleEditTaskModal()
  }

  const onImplementationTaskDetailCancel: SaveOrCancelProps['onCancel'] = async () => {
    toggleVisibleEditTaskModal()
  }

  useEffect(() => {
    if (!measureImplementationTasks.length) {
      form.resetFields(['measureImplementationTasks', measureImplementationTasks.length, 'name'])
    }
  }, [form, measureImplementationTasks])

  return (
    <Layout>
      <Layout.Content style={{ padding: '2rem', paddingTop: '1rem' }}>
        <Form form={form} initialValues={measureImplementationTasks} component={'div'}>
          <Col>
            <Heading.H1 title={labelConfig.title} />
            <Row>
              <Typography.Paragraph>{labelConfig.subTitle}</Typography.Paragraph>
            </Row>
          </Col>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Col>
              <Button type={'primary'} onClick={onAddTaskClick}>
                {labelConfig.addTaskButton}
              </Button>

              <Modal.Normal
                visible={visibleAddTaskModal}
                onCancel={onNameCancel}
                onOk={onNameSave}
                okText="追加"
                cancelText="キャンセル"
                cancelButtonProps={{ type: 'ghost' }}
              >
                {props.measureImplementationTasks?.map((measureImplementationTask, index) => (
                  <FormItem
                    key={`implementation-task-name-${index}`}
                    pageId={PAGE_ID}
                    itemId={'newTaskName'}
                    hidden={true}
                    name={['measureImplementationTasks', index, 'name']}
                  >
                    <Input onKeyDown={skipEnter} onChange={onNameChange} />
                  </FormItem>
                ))}
                <FormItem
                  key={`implementation-task-name-${measureImplementationTasks.length}`}
                  pageId={PAGE_ID}
                  itemId={'newTaskName'}
                  name={['measureImplementationTasks', measureImplementationTasks.length, 'name']}
                >
                  <Input onKeyDown={skipEnter} onChange={onNameChange} />
                </FormItem>
              </Modal.Normal>
            </Col>

            <Col>
              <Table
                size={'small'}
                columns={columns}
                dataSource={measureImplementationTasks}
                pagination={false}
                rowKey="id"
              />
            </Col>
          </Space>

          <Modal.Normal
            visible={visibleEditTaskModal}
            onCancel={toggleVisibleEditTaskModal}
            onOk={toggleVisibleEditTaskModal}
            cancelButtonProps={{ type: 'ghost' }}
            footer={[
              <SaveOrCancel
                key={'modal-footer'}
                onSave={onImplementationTaskDetailSave}
                onCancel={onImplementationTaskDetailCancel}
                cancelText={'キャンセル'}
                okText={'OK'}
              />,
            ]}
          >
            <ImplementationTaskDetailForm
              form={form}
              measureImplementationTask={
                measureImplementationTasks.filter(
                  (measureImplementationTask, index) =>
                    index === currentMeasureImplementationTaskIndex
                )[0] ?? {}
              }
              onChange={(updatedMeasureImplementationTask) => {
                const tasks = {
                  measureImplementationTasks: measureImplementationTasks.map(
                    (measureImplementationTask) =>
                      measureImplementationTask.id === updatedMeasureImplementationTask.id
                        ? {
                            ...(measureImplementationTask ?? {}),
                            ...(updatedMeasureImplementationTask ?? {}),
                          }
                        : measureImplementationTask
                  ),
                }
                props.onChange(tasks)
              }}
            />
          </Modal.Normal>

          <Modal.Confirm
            visible={visibleDeleteTaskModal}
            onOk={onImplementationTaskDelete}
            onCancel={onImplementationTaskCancel}
          >
            <Typography.Paragraph>
              {replacePlaceholder(
                labelConfig.deleteTaskConfirmation,
                selectedImplementationTask?.name ?? ''
              )}
            </Typography.Paragraph>
          </Modal.Confirm>
        </Form>
      </Layout.Content>
    </Layout>
  )
}
export default MeasureImplementationTaskForm

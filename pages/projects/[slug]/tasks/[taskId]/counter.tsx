import React, { FC, HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useToggle } from 'react-use'
import { Col, Form, Layout, Row, Popover, Space, Divider, Typography, message } from 'antd'
import { ColumnsType, ColumnType } from 'antd/es/table'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import Heading from '~/components/Heading'
import Button from '~/components/Button'
import Table from '~/components/table'
import {
  RemoveMeasureConfirmationModal,
  AddOrEditMeasureModal,
  ColumnItem,
  TaskCounterColumn,
  AddExistingMeasureModal,
  AddOrEditMeasureModalProps,
  RemoveMeasureConfirmationModalProps,
} from '~/components/measure'
import { SaveOrCancel } from '~/components/SaveOrCancel'
import { displaySetting } from '~/lib/displaySetting'
import { useQuery } from '@apollo/client'
import {
  FIND_TASK_BY_ID,
  FindTaskByIdResponse,
  FindTaskByIdVars,
} from '~/graphhql/queries/findTaskById'
import {
  getTaskProposalPrefix,
  selectProposalPropertyName,
  selectTaskProposals,
} from '~/graphhql/selectors/task'
import { UpdateTaskResponse } from '~/graphhql/mutations/updateTask'
import {
  SET_MEASURES_TO_CAUSES,
  SetMeasuresRequestType,
} from '~/graphhql/mutations/setMeasuresToCauses'
import { useMutation } from '@apollo/react-hooks'
import {
  SET_MEASURES_TO_TARGETS,
  SetMeasuresToTargetsRequestType,
} from '~/graphhql/mutations/setMeasuresToTargets'
import {
  SET_MEASURES_TO_TODOS,
  SetMeasuresToTodosRequestType,
} from '~/graphhql/mutations/setMeasuresToTodos'
import {
  SET_MEASURES_TO_STUDY_CONTENTS,
  SetMeasuresToStudyContentsRequestType,
} from '~/graphhql/mutations/setMeasuresToStudyContents'
import {
  SET_MEASURES_TO_INVESTIGATIONS,
  SetMeasuresToInvestigationsRequestType,
} from '~/graphhql/mutations/setMeasuresToInvestigations'
import {
  SET_MEASURES_TO_OTHERS,
  SetMeasuresToOthersRequestType,
} from '~/graphhql/mutations/setMeasuresToOthers'

const ADD_MEASURE_ID = -1
const addMeasureItem = {
  id: ADD_MEASURE_ID,
  name: displaySetting.projectCounter.labelConfig.addMeasureButtonDescription,
}

const Counter: FC = () => {
  const { back, query, push } = useRouter()
  const [addOrEditMeasureModalVisible, toggleAddOrEditMeasureModalVisible] = useToggle(false)
  const [addExistingMeasureModalVisible, toggleAddExistingMeasureModalVisible] = useToggle(false)
  const [
    removeMeasureConfirmationModalVisible,
    toggleRemoveMeasureConfirmationModalVisible,
  ] = useToggle(false)
  const [currentCounterColumn, setCurrentCounterColumn] = useState<TaskCounterColumn | null>(null)

  const { data } = useQuery<FindTaskByIdResponse, FindTaskByIdVars>(FIND_TASK_BY_ID, {
    variables: {
      id: Number(query?.taskId),
    },
    skip: !query?.taskId,
  })

  const [setMeasuresToCauses] = useMutation<UpdateTaskResponse, SetMeasuresRequestType>(
    SET_MEASURES_TO_CAUSES,
    {
      refetchQueries: [{ query: FIND_TASK_BY_ID, variables: { id: Number(query?.taskId) } }],
      onCompleted: async () => {
        message.success(displaySetting.projectCounter.labelConfig.mutationSuccess)
      },
      onError: async () => {
        message.error(displaySetting.projectCounter.labelConfig.mutationError)
      },
    }
  )
  const [setMeasuresToTargets] = useMutation<UpdateTaskResponse, SetMeasuresToTargetsRequestType>(
    SET_MEASURES_TO_TARGETS,
    {
      refetchQueries: [{ query: FIND_TASK_BY_ID, variables: { id: Number(query?.taskId) } }],
      onCompleted: async () => {
        message.success(displaySetting.projectCounter.labelConfig.mutationSuccess)
      },
      onError: async () => {
        message.error(displaySetting.projectCounter.labelConfig.mutationError)
      },
    }
  )

  const [setMeasuresToTodos] = useMutation<UpdateTaskResponse, SetMeasuresToTodosRequestType>(
    SET_MEASURES_TO_TODOS,
    {
      refetchQueries: [{ query: FIND_TASK_BY_ID, variables: { id: Number(query?.taskId) } }],
      onCompleted: async () => {
        message.success(displaySetting.projectCounter.labelConfig.mutationSuccess)
      },
      onError: async () => {
        message.error(displaySetting.projectCounter.labelConfig.mutationError)
      },
    }
  )

  const [setMeasuresToStudyContents] = useMutation<
    UpdateTaskResponse,
    SetMeasuresToStudyContentsRequestType
  >(SET_MEASURES_TO_STUDY_CONTENTS, {
    refetchQueries: [{ query: FIND_TASK_BY_ID, variables: { id: Number(query?.taskId) } }],
    onCompleted: async () => {
      message.success(displaySetting.projectCounter.labelConfig.mutationSuccess)
    },
    onError: async () => {
      message.error(displaySetting.projectCounter.labelConfig.mutationError)
    },
  })

  const [setMeasuresToInvestigations] = useMutation<
    UpdateTaskResponse,
    SetMeasuresToInvestigationsRequestType
  >(SET_MEASURES_TO_INVESTIGATIONS, {
    refetchQueries: [{ query: FIND_TASK_BY_ID, variables: { id: Number(query?.taskId) } }],
    onCompleted: async () => {
      message.success(displaySetting.projectCounter.labelConfig.mutationSuccess)
    },
    onError: async () => {
      message.error(displaySetting.projectCounter.labelConfig.mutationError)
    },
  })

  const [setMeasuresToOthers] = useMutation<UpdateTaskResponse, SetMeasuresToOthersRequestType>(
    SET_MEASURES_TO_OTHERS,
    {
      refetchQueries: [{ query: FIND_TASK_BY_ID, variables: { id: Number(query?.taskId) } }],
      onCompleted: async () => {
        message.success(displaySetting.projectCounter.labelConfig.mutationSuccess)
      },
      onError: async () => {
        message.error(displaySetting.projectCounter.labelConfig.mutationError)
      },
    }
  )

  const [task, setTask] = useState<Task | undefined>(data?.findTaskById)

  useEffect(() => {
    setTask(data?.findTaskById)
    return () => undefined
  }, [data?.findTaskById])

  const taskProposals = useMemo(() => (!task ? [] : selectTaskProposals(task)), [task])

  const columnData = useMemo(() => {
    if (!task) return []

    // 課題に紐づく施策の数
    const numOfMeasures = taskProposals
      .map((proposal) => Number(proposal.measures?.length) + 1)
      .reduce((acc, number) => acc + number, 0)

    return taskProposals
      .map((proposal, proposalIndex) => {
        return (
          proposal.measures?.concat(addMeasureItem).map(
            (measure, measureIndex): TaskCounterColumn => ({
              key: `${proposalIndex}-${measureIndex}`,
              task: {
                id: task.id,
                colSpan: proposalIndex === 0 && measureIndex === 0 ? 1 : 0,
                rowSpan: proposalIndex === 0 && measureIndex === 0 ? numOfMeasures + 1 : 0,
                name: task.name,
                entity: task,
                isAddMeasure: measure.id === ADD_MEASURE_ID,
              },
              proposal: {
                id: proposal.id,
                colSpan: measureIndex === 0 ? 1 : 0,
                rowSpan: measureIndex === 0 ? Number(proposal.measures?.length) + 1 : 0,
                name: getTaskProposalPrefix(task) + proposal.text,
                entity: proposal,
                isAddMeasure: measure.id === ADD_MEASURE_ID,
              },
              measure: {
                id: measure.id ?? ADD_MEASURE_ID,
                colSpan: 1,
                rowSpan: 1,
                name: measure.name ?? '',
                entity: measure,
                isAddMeasure: measure.id === ADD_MEASURE_ID,
                onClick: (column) => (event) => {
                  event.preventDefault()
                  setCurrentCounterColumn(
                    column.measure.isAddMeasure
                      ? {
                          ...column,
                          measure: {
                            ...column.measure,
                            entity: {
                              causeConditions:
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                column?.proposal?.entity?.causeConditions?.length === 1
                                  ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    column?.proposal?.entity?.causeConditions
                                  : [],
                            },
                          },
                        }
                      : column
                  )
                  toggleAddOrEditMeasureModalVisible(!addOrEditMeasureModalVisible)
                },
              },
            })
          ) ?? []
        )
      })
      .flat(2)
  }, [
    addOrEditMeasureModalVisible,
    currentCounterColumn,
    task,
    taskProposals,
    toggleAddOrEditMeasureModalVisible,
  ])

  const AddMeasurePopoverContent: FC<TaskCounterColumn> = useCallback(
    (column) => {
      const onAddNew: HTMLAttributes<HTMLButtonElement>['onClick'] = (event) => {
        event.preventDefault()
        setCurrentCounterColumn(
          column.measure.isAddMeasure
            ? {
                ...column,
                measure: {
                  ...column.measure,
                  entity: {
                    causeConditions:
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      column?.proposal?.entity?.causeConditions?.length === 1
                        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          column?.proposal?.entity?.causeConditions
                        : [],
                  },
                },
              }
            : column
        )
        toggleAddOrEditMeasureModalVisible(!addOrEditMeasureModalVisible)
      }

      const onAddExistingOne: HTMLAttributes<HTMLButtonElement>['onClick'] = (event) => {
        event.preventDefault()
        setCurrentCounterColumn(column)
        toggleAddExistingMeasureModalVisible(!addExistingMeasureModalVisible)
      }

      return (
        <Space>
          <Button type={'primary'} onClick={onAddNew}>
            {displaySetting.projectCounter.labelConfig.addNewMeasureButtonDescription}
          </Button>
          <Button type={'primary'} onClick={onAddExistingOne}>
            {displaySetting.projectCounter.labelConfig.chooseExistingMeasureButtonDescription}
          </Button>
        </Space>
      )
    },
    [
      addExistingMeasureModalVisible,
      addOrEditMeasureModalVisible,
      toggleAddExistingMeasureModalVisible,
      toggleAddOrEditMeasureModalVisible,
    ]
  )

  const EditMeasurePopoverContent: FC<TaskCounterColumn> = useCallback(
    (props) => {
      const onEdit: HTMLAttributes<HTMLButtonElement>['onClick'] = (event) => {
        event.preventDefault()
        setCurrentCounterColumn(props)
        toggleAddOrEditMeasureModalVisible(!addOrEditMeasureModalVisible)
      }

      const onRemove: HTMLAttributes<HTMLButtonElement>['onClick'] = (event) => {
        event.preventDefault()
        setCurrentCounterColumn(props)
        toggleRemoveMeasureConfirmationModalVisible(!removeMeasureConfirmationModalVisible)
      }

      return (
        <Space>
          <Button type={'primary'} onClick={onEdit}>
            {displaySetting.projectCounter.labelConfig.editMeasureButtonDescription}
          </Button>
          <Button type={'primary'} danger onClick={onRemove}>
            {displaySetting.projectCounter.labelConfig.deleteMeasureButtonDescription}
          </Button>
        </Space>
      )
    },
    [
      addOrEditMeasureModalVisible,
      removeMeasureConfirmationModalVisible,
      toggleAddOrEditMeasureModalVisible,
      toggleRemoveMeasureConfirmationModalVisible,
    ]
  )

  const onRemoveMeasure: RemoveMeasureConfirmationModalProps['onOk'] = () => {
    if (!task) {
      return
    }

    const proposalPropertyName = selectProposalPropertyName(task.taskType)
    const newProposals = taskProposals.map((proposal) => ({
      ...proposal,
      measures: !proposal.measures
        ? []
        : proposal.measures.filter((measure) =>
            task.id === currentCounterColumn?.task.id &&
            proposal.id === currentCounterColumn?.proposal.id
              ? measure.id !== currentCounterColumn?.measure.id
              : true
          ),
    }))

    setTask({
      ...task,
      [proposalPropertyName]:
        proposalPropertyName === 'issue'
          ? {
              ...task[proposalPropertyName],
              causes: newProposals,
            }
          : newProposals,
    })
    toggleRemoveMeasureConfirmationModalVisible(!removeMeasureConfirmationModalVisible)
  }

  const onSaveMeasure: AddOrEditMeasureModalProps['onSave'] = (
    column,
    savedMeasure,
    isUpdated = false
  ) => {
    if (!task || !column) {
      return
    }

    const proposalPropertyName = selectProposalPropertyName(task.taskType)
    const newProposals = taskProposals.map((proposal) =>
      proposal.id === column.proposal.id
        ? {
            ...proposal,
            measures: isUpdated
              ? proposal.measures?.map((measure) =>
                  measure.code === savedMeasure.code ? savedMeasure : measure
                )
              : [...(proposal.measures ?? []), savedMeasure],
          }
        : proposal
    )

    // if proposal id and its measure id match then set the saved measure otherwise original measure
    setTask({
      ...task,
      [proposalPropertyName]:
        proposalPropertyName === 'issue'
          ? {
              ...task[proposalPropertyName],
              causes: newProposals,
            }
          : newProposals,
    })

    toggleAddOrEditMeasureModalVisible()
  }

  const renderItem: ColumnType<TaskCounterColumn>['render'] = useCallback(
    (columnItem: ColumnItem, taskCounterColumn: TaskCounterColumn) => {
      if (!columnItem) {
        return { children: <></> }
      }

      return {
        children: columnItem?.onClick ? (
          <Popover
            content={
              columnItem.id === ADD_MEASURE_ID ? (
                <AddMeasurePopoverContent {...taskCounterColumn} />
              ) : (
                <EditMeasurePopoverContent {...taskCounterColumn} />
              )
            }
            trigger="hover"
            placement="right"
          >
            <Typography.Link onClick={columnItem.onClick(taskCounterColumn)} underline>
              {columnItem.name}
            </Typography.Link>
          </Popover>
        ) : (
          columnItem.name
        ),
        props: {
          style: columnItem.id === ADD_MEASURE_ID ? { backgroundColor: '#fbfbfb' } : {},
          rowSpan: columnItem.rowSpan,
          colSpan: columnItem.colSpan,
        },
      }
    },
    [EditMeasurePopoverContent, AddMeasurePopoverContent]
  )

  const columns: ColumnsType<TaskCounterColumn> = useMemo(
    () => [
      {
        title: displaySetting.projectCounter.labelConfig.addMeasureTableTaskColumnHeader,
        width: '30%',
        colSpan: 2,
        dataIndex: 'task',
        render: renderItem,
      },
      {
        title: '',
        width: '30%',
        colSpan: 0,
        dataIndex: 'proposal',
        render: renderItem,
      },
      {
        title: displaySetting.projectCounter.labelConfig.addMeasureTableMeasureColumnHeader,
        width: '40%',
        dataIndex: 'measure',
        ellipsis: {
          showTitle: true,
        },
        render: renderItem,
      },
    ],
    [renderItem]
  )

  const [form] = Form.useForm()

  const onSaveCounter = async (): Promise<void> => {
    if (task) {
      switch (task.taskType) {
        case 1:
          setMeasuresToCauses({
            variables: {
              causesInput:
                task.issue?.causes?.map((cause) => {
                  return {
                    id: Number(cause.id),
                    measures: cause.measures?.map((m) => {
                      return { id: Number(m.id) }
                    }),
                  }
                }) || [],
            },
          })
          break
        case 2:
          setMeasuresToTargets({
            variables: {
              targetsInput:
                task.targets?.map((target) => {
                  return {
                    id: Number(target.id),
                    measures: target.measures?.map((m) => {
                      return { id: Number(m.id) }
                    }),
                  }
                }) || [],
            },
          })
          break
        case 3:
          setMeasuresToTodos({
            variables: {
              todosInput:
                task.todos?.map((todo) => {
                  return {
                    id: Number(todo.id),
                    measures: todo.measures?.map((m) => {
                      return { id: Number(m.id) }
                    }),
                  }
                }) || [],
            },
          })
          break
        case 4:
          setMeasuresToStudyContents({
            variables: {
              studyContentsInput:
                task.studyContents?.map((st) => {
                  return {
                    id: Number(st.id),
                    measures: st.measures?.map((m) => {
                      return { id: Number(m.id) }
                    }),
                  }
                }) || [],
            },
          })
          break
        case 5:
          setMeasuresToInvestigations({
            variables: {
              investigationsInput:
                task.investigations?.map((i) => {
                  return {
                    id: Number(i.id),
                    measures: i.measures?.map((m) => {
                      return { id: Number(m.id) }
                    }),
                  }
                }) || [],
            },
          })
          break
        case 6:
          setMeasuresToOthers({
            variables: {
              othersInput:
                task.others?.map((other) => {
                  return {
                    id: Number(other.id),
                    measures: other.measures?.map((m) => {
                      return { id: Number(m.id) }
                    }),
                  }
                }) || [],
            },
          })
          break
      }
      back()
    }
  }

  const onCancelCounter = (): void => {
    back()
  }

  const onSelected = (selectedMeasures: Array<Measure>): void => {
    if (!task || !selectedMeasures) {
      return
    }

    const proposalPropertyName = selectProposalPropertyName(task.taskType)
    const newProposals = taskProposals.map((proposal) =>
      proposal.id === currentCounterColumn?.proposal.id
        ? {
            ...proposal,
            measures: selectedMeasures,
          }
        : proposal
    )

    // if proposal id and its measure id match then set the saved measure otherwise original measure
    setTask({
      ...task,
      [proposalPropertyName]:
        proposalPropertyName === 'issue'
          ? {
              ...task[proposalPropertyName],
              causes: newProposals,
            }
          : newProposals,
    })

    if (currentCounterColumn) {
      setCurrentCounterColumn({
        ...currentCounterColumn,
        proposal: {
          ...currentCounterColumn.proposal,
          entity: {
            ...currentCounterColumn.proposal.entity,
            measures: selectedMeasures,
          },
        },
      })
    }
  }

  const currentProposalMeasureIds: Array<Measure['id']> = useMemo(() => {
    if (!task) {
      return []
    }

    return (
      selectTaskProposals(task)
        ?.filter((proposal) => proposal.id === currentCounterColumn?.proposal.id)[0]
        ?.measures?.map((measure) => measure.id) ?? []
    )
  }, [currentCounterColumn?.proposal.id, task])

  return (
    <PageTitleContext.Provider value={displaySetting.projectCounter.labelConfig.pageTitle}>
      <MainLayout>
        <Layout style={{ paddingLeft: '2rem' }}>
          <Row>
            <Col offset={20} span={2}>
              <Button type={'primary'} onClick={() => push(`/projects/${query?.slug}`)}>
                企画へ戻る
              </Button>
            </Col>
          </Row>
          <Heading.H1 title={displaySetting.projectCounter.labelConfig.addMeasuresTitle} />
          <Row>
            <Typography.Paragraph>
              {displaySetting.projectCounter.labelConfig.linkCounterWithMeasuresDescription}
            </Typography.Paragraph>
          </Row>
          <Row>
            <Col span={24}>
              <Form form={form}>
                <Table columns={columns} dataSource={columnData} pagination={false} />
                <Divider />
                <SaveOrCancel onSave={onSaveCounter} onCancel={onCancelCounter} />
              </Form>
            </Col>
          </Row>

          {/* 施策案作成/編集モーダル */}
          <AddOrEditMeasureModal
            counterColumn={currentCounterColumn}
            visible={addOrEditMeasureModalVisible}
            onCancel={toggleAddOrEditMeasureModalVisible}
            onSave={onSaveMeasure}
          />

          {/* 既存の施策案追加モーダル */}
          <AddExistingMeasureModal
            defaultValues={currentProposalMeasureIds}
            visible={addExistingMeasureModalVisible}
            onCancel={toggleAddExistingMeasureModalVisible}
            onSelected={onSelected}
          />

          {/* 施策案削除モーダル */}
          <RemoveMeasureConfirmationModal
            measure={currentCounterColumn?.measure ?? null}
            visible={removeMeasureConfirmationModalVisible}
            onCancel={toggleRemoveMeasureConfirmationModalVisible}
            onOk={onRemoveMeasure}
          />
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default Counter

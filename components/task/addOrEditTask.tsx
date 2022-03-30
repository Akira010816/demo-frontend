import React, { FC, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { useRouter } from 'next/router'
import { Divider, Form, Layout, Menu, message } from 'antd'
import BaseInfoForm, {
  TaskBaseInfoFormProps,
} from '~/components/pages/projects/[slug]/tasks/baseInfoForm'
import TaskContentForm from '~/components/pages/projects/[slug]/tasks/taskContentForm'
import ScheduleForm, {
  TaskScheduleFormProps,
} from '~/components/pages/projects/[slug]/tasks/scheduleForm'
import { SaveOrCancel } from '~/components/SaveOrCancel'
import { dateFormat, displaySetting } from '~/lib/displaySetting'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { FIND_TASK_BY_ID, FindTaskByIdResponse } from '~/graphhql/queries/findTaskById'
import {
  CREATE_TASK,
  CreateTaskRequestTypes,
  CreateTaskResponse,
  generateCreateTaskInputFromEntity,
} from '~/graphhql/mutations/createTask'
import { FIND_ALL_TASKS } from '~/graphhql/queries/findAllTasks'
import {
  generateUpdateTaskInputFromEntity,
  UPDATE_TASK,
  UpdateTaskRequestTypes,
  UpdateTaskResponse,
} from '~/graphhql/mutations/updateTask'
import { ValidateErrorEntity } from '~/types/exception'

const ACTIVE_TABS = {
  BASE_INFO: '1',
  CONTENT: '2',
  SCHEDULE: '3',
}

const PAGE_ID = 'taskBaseInfoForm'

export type AddOrEditTaskProps = {
  notFoundRedirection?: boolean
}

export const AddOrEditTask: FC<AddOrEditTaskProps> = ({ notFoundRedirection }) => {
  const router = useRouter()
  const { slug: projectId, taskId } = router.query

  const defaultDate = useMemo(() => moment(new Date(), dateFormat), [])

  const defaultTask: Task = useMemo(
    () => ({
      id: 0,
      taskType: 1,
      taskStatus: 'registered',
      startDate: defaultDate.format(dateFormat),
      endDate: defaultDate.format(dateFormat),
      code: '',
      name: '',
      project_id: Number(projectId),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      registeredAt: defaultDate.toString(),
      registeredUser: {
        id: 0,
        name: '',
      },
    }),
    [defaultDate, projectId]
  )

  const { loading, data: { findTaskById } = {} } = useQuery<FindTaskByIdResponse>(FIND_TASK_BY_ID, {
    variables: { id: Number(taskId) },
    skip: !taskId,
  })
  const [activeTabKey, setActiveTabKey] = useState<string>(ACTIVE_TABS.BASE_INFO)
  const [task, setTask] = useState<Task>(defaultTask)
  const [form] = Form.useForm()

  const [createTask] = useMutation<CreateTaskResponse, CreateTaskRequestTypes>(CREATE_TASK, {
    refetchQueries: [
      { query: FIND_ALL_TASKS, variables: { projectId: Number(projectId) } },
      task?.id ? { query: FIND_TASK_BY_ID, variables: { id: task?.id } } : '',
    ],
    onCompleted: async () => {
      message.success(displaySetting[PAGE_ID].labelConfig.createSuccess)
    },
    onError: async () => {
      message.error(displaySetting[PAGE_ID].labelConfig.createError)
    },
  })

  const [updateTask] = useMutation<UpdateTaskResponse, UpdateTaskRequestTypes>(UPDATE_TASK, {
    refetchQueries: [
      { query: FIND_ALL_TASKS, variables: { projectId: Number(projectId) } },
      task?.id ? { query: FIND_TASK_BY_ID, variables: { id: task?.id } } : '',
    ],
    onCompleted: async () => {
      message.success(displaySetting[PAGE_ID].labelConfig.updateSuccess)
    },
    onError: async () => {
      message.error(displaySetting[PAGE_ID].labelConfig.updateError)
    },
  })

  const onBaseInfoChange: TaskBaseInfoFormProps['onChange'] = async (updatedBaseInfo) => {
    setTask({ ...task, ...updatedBaseInfo })
  }

  const onIssueChange = (updatedIssue?: Issue | null): void => {
    if (updatedIssue) {
      setTask({ ...task, issue: updatedIssue })
    }
  }

  const onTargetsChange = (updatedTargets: Target[]): void => {
    setTask({ ...task, targets: updatedTargets })
  }

  const onOthersChange = (updatedOthers: Other[]): void => {
    setTask({ ...task, others: updatedOthers })
  }

  const onTodosChange = (updatedTodos: Todo[]): void => {
    setTask({ ...task, todos: updatedTodos })
  }

  const onInvestigationsChange = (updatedInvestigations: Investigation[]): void => {
    setTask({ ...task, investigations: updatedInvestigations })
  }

  const onStudyContentsChange = (updatedStudyContents: StudyContent[]): void => {
    setTask({ ...task, studyContents: updatedStudyContents })
  }

  const onScheduleChange: TaskScheduleFormProps['onChange'] = (updatedSchedule): void => {
    setTask({ ...task, ...updatedSchedule })
  }

  const onCancelTask = async (): Promise<void> => {
    await router.back()
  }

  const onSaveTask = async (): Promise<void> => {
    try {
      await form.validateFields()
    } catch (err) {
      const error = err as ValidateErrorEntity
      const errorFieldName = error && error.errorFields?.[0]?.name?.[0]
      switch (errorFieldName) {
        case 'issue':
        case 'targets':
        case 'others':
        case 'todos':
        case 'studyContents':
        case 'investigations':
          setActiveTabKey(ACTIVE_TABS.CONTENT)
          break
        case 'startDate':
        case 'endDate':
          setActiveTabKey(ACTIVE_TABS.SCHEDULE)
          break
        default:
          setActiveTabKey(ACTIVE_TABS.BASE_INFO)
          break
      }
      return
    }

    const finalTask = getFinalTask(task)

    if (task.id === 0) {
      await createTask({
        variables: { taskInput: generateCreateTaskInputFromEntity(finalTask) },
      })
    } else {
      await updateTask({
        variables: { taskInput: generateUpdateTaskInputFromEntity(finalTask) },
      })
    }

    await router.back()
  }

  useEffect(() => {
    void (async () => {
      if (!loading && notFoundRedirection && !findTaskById) {
        await router.push(`/projects/${projectId}/tasks/new`)
      }
    })()
  }, [findTaskById, loading, notFoundRedirection, projectId, router])

  useEffect(() => {
    setTask(findTaskById ?? defaultTask)
  }, [defaultTask, findTaskById])

  const getFinalTask = (task: Task): Task => {
    switch (task?.taskType) {
      case 1:
        return {
          ...task,
          targets: [],
          todos: [],
          studyContents: [],
          investigations: [],
          others: [],
        }
      case 2:
        return {
          ...task,
          issue: undefined,
          todos: [],
          studyContents: [],
          investigations: [],
          others: [],
        }
      case 3:
        return {
          ...task,
          issue: undefined,
          targets: [],
          studyContents: [],
          investigations: [],
          others: [],
        }
      case 4:
        return {
          ...task,
          issue: undefined,
          targets: [],
          todos: [],
          investigations: [],
          others: [],
        }
      case 5:
        return {
          ...task,
          issue: undefined,
          targets: [],
          todos: [],
          studyContents: [],
          others: [],
        }
      case 6:
        return {
          ...task,
          issue: undefined,
          targets: [],
          todos: [],
          studyContents: [],
          investigations: [],
        }
      default:
        return task
    }
  }

  return (
    <Layout className={'content-root'}>
      <Layout.Sider
        style={{
          backgroundColor: 'rgba(255,255,255,1.0)',
          borderRight: '1px solid rgba(230,230,230,1.0)',
        }}
      >
        <Menu
          defaultSelectedKeys={[ACTIVE_TABS.BASE_INFO]}
          selectedKeys={[activeTabKey]}
          mode="inline"
          onClick={({ key }) => setActiveTabKey(key.toString())}
        >
          <Menu.Item key={ACTIVE_TABS.BASE_INFO}>概要</Menu.Item>
          <Menu.Item key={ACTIVE_TABS.CONTENT}>課題内容</Menu.Item>
          <Menu.Item key={ACTIVE_TABS.SCHEDULE}>スケジュール</Menu.Item>
        </Menu>
      </Layout.Sider>

      <Layout.Content style={{ paddingLeft: '2rem' }}>
        <Form form={form}>
          <div
            style={{
              display: !loading && activeTabKey === ACTIVE_TABS.BASE_INFO ? 'block' : 'none',
            }}
          >
            <BaseInfoForm
              form={form}
              slug={Number(projectId)}
              onChange={onBaseInfoChange}
              data={{
                code: task?.code ?? '',
                name: task?.name ?? '',
                taskType: task?.taskType ?? 1,
                taskStatus: task?.taskStatus ?? '',
              }}
            />
          </div>

          <div
            style={{
              display: !loading && activeTabKey === ACTIVE_TABS.CONTENT ? 'block' : 'none',
            }}
          >
            <TaskContentForm
              form={form}
              projectId={Number(projectId)}
              task={task}
              onIssueChange={onIssueChange}
              onTargetsChange={onTargetsChange}
              onOthersChange={onOthersChange}
              onTodosChange={onTodosChange}
              onInvestigationsChange={onInvestigationsChange}
              onStudyContentsChange={onStudyContentsChange}
            />
          </div>

          <div
            style={{
              display: !loading && activeTabKey === ACTIVE_TABS.SCHEDULE ? 'block' : 'none',
            }}
          >
            <ScheduleForm
              form={form}
              projectId={Number(projectId)}
              onChange={onScheduleChange}
              data={{
                startDate: task.startDate,
                endDate: task.endDate,
              }}
            />
          </div>

          <Divider />
          <SaveOrCancel onSave={onSaveTask} onCancel={onCancelTask} />
        </Form>
      </Layout.Content>
    </Layout>
  )
}

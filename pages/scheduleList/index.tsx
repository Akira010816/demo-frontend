import MainLayout, { PageTitleContext } from '../../layouts/main'
import {
  Typography,
  Form,
  Layout,
  Button,
  Row,
  Col,
  DatePicker,
  Select,
  Collapse,
  message,
} from 'antd'
import dynamic from 'next/dynamic'
import './index.module.css'
import React, { useState, FC, useEffect, useCallback } from 'react'
import { commonButton } from './../style'
import { useQuery, useMutation } from '@apollo/react-hooks'
import {
  FindAllDepartmentsResponse,
  FIND_ALL_DEPARTMENTS,
} from '../../graphhql/queries/findAllDepartments'
import {
  FindSchedulesResponse,
  FIND_SCHEDULES,
  Project,
} from '../../graphhql/queries/findSchedules'
import { DateUnitType, GanttData, GanttTask } from '../../components/gantt/gantt'
import moment, { Moment } from 'moment'
import {
  dateFormat,
  monthTerms,
  yearTerms,
  dateUnits,
  taskTypeNames,
  firstMonth,
  taskStatusLabels,
  projectStatusLabels,
} from '../../lib/displaySetting'
import dayjs from 'dayjs'
import { internalDateFormat } from '../../lib/date'
import {
  UpdateScheduleProject,
  UpdateScheduleProjectMilestone,
  UpdateScheduleRequestTypes,
  UpdateScheduleResponseTypes,
  UpdateScheduleTask,
  UpdateScheduleMeasure,
  UpdateScheduleMeasureImplementationTask,
  UPDATE_SCHEDULE,
} from '../../graphhql/mutations/updateSchedules'
import { selectTaskProposals } from '~/graphhql/selectors/task'
import { getRandomString } from '~/lib/randomString'

const { Option } = Select
const { Title } = Typography
const FormItem = Form.Item
const { Content } = Layout
const { Panel } = Collapse

const Gantt = dynamic(
  () => {
    return import('../../components/gantt')
  },
  { ssr: false }
)

const ScheduleList: FC = () => {
  // ガントに表示するデータ
  const [ganttData, setGanttData] = useState<GanttData>({
    tasks: [],
    links: [],
  })

  // 変更前のガントに表示するデータ
  const [originGanttData, setOriginGanttData] = useState<GanttData>({
    tasks: [],
    links: [],
  })

  // 表示開始日
  const [startDate, setStartDate] = useState<Moment | null>(() => moment(new Date()))

  // 選択した表示開始日
  const [ganttStartDate, setGanttStartDate] = useState<Date>(() => new Date())

  // 選択した表示単位
  const [dateUnitType, setDateUnitType] = useState<DateUnitType>('month')

  // 表示期間一覧
  const [dateTerms, setDateTerms] = useState(monthTerms)

  // 表示期間一覧
  const [editSchedule, setEditSchedule] = useState(false)

  // 表示期間の初期値を取得
  const getDefaultDateTermMonth = useCallback(
    (dateTerms: DateTerm[], dateTermMonth?: number): number => {
      if (dateTermMonth) {
        // 対象の表示期間一覧の中に現在選択中の項目が存在する場合は、そのまま選択状態にする
        const defaultDateTerm = dateTerms.find((monthTerm) => monthTerm.month == dateTermMonth)
        if (defaultDateTerm) {
          return dateTermMonth
        }
      }

      // 初期値を選択させる
      const defaultDateTerm = dateTerms.find((monthTerm) => monthTerm.default)
      return defaultDateTerm && defaultDateTerm.month ? defaultDateTerm.month : 12
    },
    []
  )

  // 選択した表示期間月
  const [dateTermMonth, setDateTermMonth] = useState(() => getDefaultDateTermMonth(monthTerms))

  // 選択した種類一覧
  const [taskTypes, setTaskTypes] = useState<string[]>([])

  // 選択した部署
  const [departmentId, setDepartmentId] = useState(0)

  // 全て展開
  const [taskOpen, setTaskOpen] = useState('true')

  // 企画一覧
  const [projects, setProjects] = useState<Array<Project>>([])

  // スケジュール一覧を取得
  const { refetch: refetchFindSchedules } = useQuery<FindSchedulesResponse>(FIND_SCHEDULES, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      setProjects([...data.findSchedules])
    },
  })

  // 部署一覧を取得
  const [departments, setDepartments] = useState<Array<Department>>([])
  useQuery<FindAllDepartmentsResponse>(FIND_ALL_DEPARTMENTS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      let departments = data.findAllDepartments
      const allDepartment: Department = {
        id: 0,
        code: '',
        name: '（すべて）',
      }
      departments = [allDepartment].concat(departments)
      setDepartments(departments)

      // 選択中の部署IDが存在しない場合は、全ての部署を表示
      if (departmentId != 0) {
        const departmentIds = departments.map((department: Department) => {
          return department.id
        })
        if (departmentIds.indexOf(departmentId) == -1) {
          // 全ての部署を表示
          setDepartmentId(0)
        }
      }
    },
  })

  // スケジュールを変更
  const [updateSchedule] = useMutation<UpdateScheduleResponseTypes, UpdateScheduleRequestTypes>(
    UPDATE_SCHEDULE,
    {
      onCompleted: () => {
        setEditSchedule(false)

        refetchFindSchedules()

        message.success('スケジュールの変更に成功しました。')
      },
      onError: () => {
        // スケジュール一覧を再読み込み
        refetchFindSchedules()

        message.error('スケジュールの変更に失敗しました。')
      },
    }
  )

  /**
   * ガントデータを設定
   */
  useEffect(() => {
    const todayDate = dayjs().format(internalDateFormat)
    const today = dayjs(todayDate).toDate()

    const tasks = new Array<GanttTask>()
    let links = new Array<GanttLink>()

    let i = 0

    // 企画一覧をソート
    const sortProjects = projects.sort(
      (a, b) =>
        dayjs(a.startDate).diff(dayjs(b.startDate)) ||
        Object.keys(projectStatusLabels).indexOf(a.status) -
          Object.keys(projectStatusLabels).indexOf(b.status)
    )

    sortProjects.forEach((project: Project) => {
      // 部署名を取得
      const departmentName = project.raisedDepartment ? project.raisedDepartment.name : undefined

      // フィルタで部署が設定されている場合は、対象の部署のみを表示
      let hideParent = false
      if (departmentId != 0) {
        hideParent = !project.raisedDepartment || project.raisedDepartment.id != departmentId
      }

      // 企画でフィルターをかける
      let hideProject = hideParent
      if (taskTypes.length != 0 && taskTypes.indexOf('plan') == -1) {
        hideProject = true
      }

      // 課題でフィルターをかける
      let hidePlanTask = hideParent
      if (taskTypes.length != 0 && taskTypes.indexOf('planTask') == -1) {
        hidePlanTask = true
      }

      // 施策でフィルターをかける
      let hideMeasure = hideParent
      if (taskTypes.length != 0 && taskTypes.indexOf('measure') == -1) {
        hideMeasure = true
      }

      // タスクでフィルターをかける
      let hideMeasureTask = hideParent
      if (taskTypes.length != 0 && taskTypes.indexOf('measureTask') == -1) {
        hideMeasureTask = true
      }

      // 終了日を取得
      let projectEndDate
      project.milestones.forEach((milestone: Milestone) => {
        if (!milestone.targetDate || milestone.type != 'projectEndDate') {
          return
        }
        projectEndDate = milestone.targetDate
      })

      // 企画を追加
      i++
      const parantProjectId = i
      const task: GanttTask = {
        id: i.toString(),
        text: '[企画] ' + (project.name ? project.name : ''),
        start_date: project.startDate ? dayjs(project.startDate).toDate() : today,
        end_date: projectEndDate ? dayjs(projectEndDate).toDate() : today,
        originStartDate: project.startDate ? project.startDate : todayDate,
        originEndDate: projectEndDate ? projectEndDate : todayDate,
        type: 'plan',
        hide: hideProject,
        departmentName: departmentName,
        priority: project.priority,
        projectId: project.id,
      }
      console.log('projectStartDate', project.startDate)

      tasks.push(task)

      // マイルストーン一覧をid順でソートする
      const projectMilestones = [...project.milestones]?.sort((a, b) => a.id - b.id)

      projectMilestones.forEach((milestone: Milestone) => {
        // マイルストーンの名前を設定
        let name = milestone.description ? milestone.description : ''
        if (milestone.type == 'projectEndDate') {
          name = '施策実施完了'
        } else if (milestone.type == 'decisionDueDate') {
          name = '施策決定'
        }

        // マイルストーンでフィルターをかける
        let hideMilestone = hideParent
        if (taskTypes.length != 0 && taskTypes.indexOf('milestone') == -1) {
          hideMilestone = true
        }

        // マイルストーンを追加
        i++
        const task2: GanttTask = {
          id: i.toString(),
          parent: parantProjectId,
          text: '[マイルストーン] ' + name,
          start_date: milestone.targetDate ? dayjs(milestone.targetDate).toDate() : today,
          originStartDate: milestone.targetDate ? milestone.targetDate : todayDate,
          type: 'milestone',
          hide: hideMilestone,
          departmentName: departmentName,
          projectMilestoneId: milestone.id,
          projectId: project.id,
        }
        tasks.push(task2)
      })

      // 課題一覧をソートする
      const projectTasks = [...project.tasks]?.sort(
        (a, b) =>
          dayjs(a.startDate).diff(dayjs(b.startDate)) ||
          Object.keys(taskStatusLabels).indexOf(b.taskStatus) -
            Object.keys(taskStatusLabels).indexOf(a.taskStatus) ||
          dayjs(a.registeredAt).diff(dayjs(b.registeredAt))
      )

      projectTasks.forEach((projectTask: Task) => {
        // 課題を追加
        i++
        const task3: GanttTask = {
          id: i.toString(),
          parent: parantProjectId,
          text: '[課題] ' + (projectTask.name ? projectTask.name : ''),
          start_date: projectTask.startDate ? dayjs(projectTask.startDate).toDate() : today,
          end_date: projectTask.endDate ? dayjs(projectTask.endDate).toDate() : today,
          originStartDate: projectTask.startDate ? projectTask.startDate : todayDate,
          originEndDate: projectTask.endDate ? projectTask.endDate : todayDate,
          type: 'planTask',
          hide: hidePlanTask,
          departmentName: departmentName,
          projectId: project.id,
          taskId: projectTask.id,
        }
        tasks.push(task3)

        const parantTaskId = i

        // 施策
        const taskProposals = selectTaskProposals(projectTask)
        let measures = Array<Measure>()
        taskProposals.forEach((taskProposal: TaskProposal) => {
          if (taskProposal.measures) {
            measures = measures.concat(taskProposal.measures)
          }
        })
        measures.forEach((measure: Measure) => {
          // 施策を追加
          i++
          const task3: GanttTask = {
            id: i.toString(),
            parent: parantTaskId,
            text: '[施策] ' + (measure.name ? measure.name : ''),
            start_date: measure.startDate ? dayjs(measure.startDate).toDate() : today,
            end_date: measure.endDate ? dayjs(measure.endDate).toDate() : today,
            originStartDate: measure.startDate ? measure.startDate : todayDate,
            originEndDate: measure.endDate ? measure.endDate : todayDate,
            type: 'measure',
            hide: hideMeasure,
            departmentName: departmentName,
            projectId: project.id,
            taskId: projectTask.id,
            measureId: measure.id,
          }
          tasks.push(task3)
          links = links.concat(measure.links || [])
          const parantMeasurId = i

          // タスク一覧をid順でソートする
          const measureImplementationTasks = (measure.measureImplementationTasks
            ? [...measure.measureImplementationTasks]
            : []
          )?.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))

          // タスク
          measureImplementationTasks?.forEach((measureTask: MeasureImplementationTask) => {
            const startDate = measureTask.startAt
              ? dayjs(measureTask.startAt).format(internalDateFormat)
              : undefined
            const endDate = measureTask.endAt
              ? dayjs(measureTask.endAt).format(internalDateFormat)
              : undefined

            // タスクを追加
            const task3: GanttTask = {
              id: measureTask.ganttId || getRandomString(),
              parent: parantMeasurId,
              text: '[タスク] ' + (measureTask.name ? measureTask.name : ''),
              start_date: startDate ? dayjs(startDate).toDate() : today,
              end_date: endDate ? dayjs(endDate).toDate() : today,
              originStartDate: startDate ? startDate : todayDate,
              originEndDate: endDate ? endDate : todayDate,
              type: 'measureTask',
              hide: hideMeasureTask,
              departmentName: departmentName,
              projectId: project.id,
              taskId: projectTask.id,
              measureImplementationTaskId: measureTask.id,
            }
            tasks.push(task3)
          })
        })
      })
    })

    setGanttData({
      tasks: tasks,
      links: links,
    })

    setOriginGanttData({
      tasks: tasks.map((list) => ({ ...list })),
      links: links,
    })
  }, [projects, departmentId, taskTypes])

  // スケジュールを保存
  const saveSchedule = useCallback((): void => {
    const projects = Array<UpdateScheduleProject>()
    const projectMilestones = Array<UpdateScheduleProjectMilestone>()
    const tasks = Array<UpdateScheduleTask>()
    const measures = Array<UpdateScheduleMeasure>()
    const measureImplementationTasks = Array<UpdateScheduleMeasureImplementationTask>()

    ganttData.tasks.forEach((task: GanttTask) => {
      const startDate = dayjs(task.start_date).format(internalDateFormat)
      const endDate = dayjs(task.end_date).format(internalDateFormat)
      let update = false
      if (task.originStartDate && task.originStartDate != startDate) {
        update = true
      }
      if (task.originEndDate && task.originEndDate != endDate) {
        update = true
      }

      if (update) {
        if (task.type == 'plan' && task.projectId) {
          projects.push({
            projectId: task.projectId,
            startDate: startDate,
            endDate: endDate,
          })
        } else if (task.type == 'milestone' && task.projectMilestoneId) {
          projectMilestones.push({
            projectMilestoneId: task.projectMilestoneId,
            targetDate: startDate,
          })
        } else if (task.type == 'planTask' && task.taskId) {
          tasks.push({
            taskId: task.taskId,
            startDate: startDate,
            endDate: endDate,
          })
        } else if (task.type == 'measure' && task.measureId) {
          measures.push({
            measureId: task.measureId,
            startDate: startDate,
            endDate: endDate,
          })
        } else if (task.type == 'measureTask' && task.measureImplementationTaskId) {
          measureImplementationTasks.push({
            measureImplementationTaskId: task.measureImplementationTaskId,
            startDate: startDate,
            endDate: endDate,
          })
        }
      }
    })

    setOriginGanttData({
      tasks: ganttData.tasks.map((list) => ({ ...list })),
      links: ganttData.links,
    })

    if (
      projects.length ||
      projectMilestones.length ||
      tasks.length ||
      measures.length ||
      measureImplementationTasks.length
    ) {
      // スケジュールの更新
      updateSchedule({
        variables: {
          scheduleInput: {
            projects,
            projectMilestones,
            tasks,
            measures,
            measureImplementationTasks,
          },
        },
      })
    } else {
      // スケジュール一覧を再読み込み
      refetchFindSchedules()

      setEditSchedule(false)
    }
  }, [ganttData.tasks, refetchFindSchedules, updateSchedule])

  // 表示開始日
  const setConditionStartDate = useCallback((value: Date): void => {
    sessionStorage.setItem(
      'scheduleListConditionStartDate',
      dayjs(value).format(internalDateFormat)
    )
    setGanttStartDate(value)
  }, [])

  // 表示単位を設定
  const setConditionDateUnitType = useCallback(
    (value: DateUnitType, saveSessionStorage = true): void => {
      setDateUnitType(value)
      let dateTerms = monthTerms
      if (value == 'year' || value == 'halfPeriod' || value == 'quarter') {
        dateTerms = yearTerms
      }
      setDateTerms(dateTerms)

      const dateTermMonth2 = getDefaultDateTermMonth(dateTerms, dateTermMonth)
      setDateTermMonth(dateTermMonth2)

      if (saveSessionStorage) {
        sessionStorage.setItem('scheduleListConditionDateUnitType', value)
        sessionStorage.setItem('scheduleListConditionDateTermMonth', String(dateTermMonth2))
      }
    },
    [dateTermMonth, getDefaultDateTermMonth]
  )

  // 表示期間
  const setConditionDateTermMonth = useCallback((value: number): void => {
    sessionStorage.setItem('scheduleListConditionDateTermMonth', String(value))
    setDateTermMonth(value)
  }, [])

  // 計画・企画・施策
  const setConditionTaskTypes = useCallback((value: string[]): void => {
    sessionStorage.setItem('scheduleListConditionTaskTypes', value.join(','))
    setTaskTypes(value)
  }, [])

  // 部署
  const setConditionDepartmentId = useCallback((value: number): void => {
    sessionStorage.setItem('scheduleListConditionDepartmentId', String(value))
    setDepartmentId(value)
  }, [])

  // 展開
  const setConditionTaskOpen = useCallback((value: string): void => {
    sessionStorage.setItem('scheduleListConditionTaskOpen', String(value))
    setTaskOpen(value)
  }, [])

  useEffect(() => {
    // 表示条件を前回の状態から復元

    // 表示開始日
    const conditionStartDate = sessionStorage.getItem('scheduleListConditionStartDate')
    if (conditionStartDate) {
      const startDate = moment(conditionStartDate)
      setStartDate(startDate)
      setGanttStartDate(startDate.toDate())
    }

    // 表示単位
    const conditionDateUnitType = sessionStorage.getItem('scheduleListConditionDateUnitType')
    if (conditionDateUnitType) {
      setConditionDateUnitType(conditionDateUnitType as DateUnitType, false)
    }

    // 表示期間
    const conditionDateTermMonth = sessionStorage.getItem('scheduleListConditionDateTermMonth')
    if (conditionDateTermMonth) {
      setDateTermMonth(parseInt(conditionDateTermMonth))
    }

    // 計画・企画・施策
    const conditionTaskTypes = sessionStorage.getItem('scheduleListConditionTaskTypes')
    if (conditionTaskTypes) {
      setTaskTypes(conditionTaskTypes.split(','))
    }

    // 部署
    const conditionDepartmentId = sessionStorage.getItem('scheduleListConditionDepartmentId')
    if (conditionDepartmentId) {
      setDepartmentId(parseInt(conditionDepartmentId))
    }

    // 展開
    const conditionTaskOpen = sessionStorage.getItem('scheduleListConditionTaskOpen')
    if (conditionTaskOpen) {
      setTaskOpen(conditionTaskOpen)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageTitleContext.Provider value={'スケジュール一覧'}>
      <MainLayout>
        <Layout className={'schedule-list'}>
          <Content style={{ marginLeft: '20px' }}>
            <Collapse style={{ minWidth: '870px' }}>
              <Panel key="1" header={<span>&nbsp;&nbsp;&nbsp;&nbsp;表示条件</span>}>
                <Form layout="horizontal">
                  <Row>
                    <Col>
                      <FormItem label="表示開始日" labelAlign="right">
                        <DatePicker
                          name="startDate"
                          placeholder={'日付を選択'}
                          value={startDate}
                          format={dateFormat}
                          allowClear={false}
                          onChange={(value) => setStartDate(value)}
                        />
                        <Button
                          type={'primary'}
                          className={commonButton}
                          style={{ marginLeft: '7px' }}
                          onClick={() => {
                            if (startDate) {
                              setConditionStartDate(startDate.toDate())
                            }
                          }}
                        >
                          表示
                        </Button>
                        <Button
                          type={'primary'}
                          className={commonButton}
                          style={{ marginLeft: '7px' }}
                          onClick={() => setStartDate(moment(new Date()))}
                        >
                          今日
                        </Button>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col flex="265px" style={{ marginRight: '20px' }}>
                      <Title
                        level={5}
                        style={{ backgroundColor: 'lightgrey', marginRight: '1rem' }}
                      >
                        表示条件
                      </Title>
                    </Col>
                    <Col flex="385px">
                      <Title level={5} style={{ backgroundColor: 'lightgrey' }}>
                        フィルター
                      </Title>
                    </Col>
                  </Row>
                  <Row>
                    <Col flex="130px">表示単位</Col>
                    <Col flex="150px">表示期間</Col>
                    <Col flex="180px">計画・企画・施策</Col>
                    <Col flex="220px">部署</Col>
                  </Row>
                  <Row>
                    <Col flex="130px">
                      <Select
                        defaultValue={dateUnitType}
                        style={{ width: 120 }}
                        onChange={(value) => setConditionDateUnitType(value)}
                      >
                        {dateUnits.map((dateUnit: DateUnit, index) => (
                          <Option value={dateUnit.type} key={index}>
                            {dateUnit.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col flex="150px">
                      <Select
                        value={dateTermMonth}
                        style={{ width: 120 }}
                        onChange={(value) => setConditionDateTermMonth(value)}
                      >
                        {dateTerms.map((dateTerm: DateTerm, index) => (
                          <Option value={dateTerm.month} key={index}>
                            {dateTerm.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col flex="180px">
                      {/*
                      <div
                        style={{
                          width: '140px',
                          height: '32px',
                          border: '1px solid #d9d9d9',
                          borderRadius: '5px',
                          padding: '4px 11px',
                        }}
                      >

                        <Dropdown overlay={menu} trigger={['click']}>
                          <a className="ant-dropdown-link" href="">
                            （すべて）&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <DownOutlined />
                          </a>
                        </Dropdown>

                      </div>
                          */}
                      <Select
                        mode="multiple"
                        maxTagCount="responsive"
                        style={{ width: 170 }}
                        placeholder="（すべて）"
                        className="task_type_names"
                        value={taskTypes}
                        onChange={(value) => setConditionTaskTypes(value)}
                      >
                        {taskTypeNames.map((taskTypeName: TaskTypeName, index) => (
                          <Option value={taskTypeName.type} key={index}>
                            {taskTypeName.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col flex="220px">
                      <Select
                        value={departmentId}
                        style={{ width: 210 }}
                        onChange={(value) => setConditionDepartmentId(value)}
                      >
                        {departments.map((department: Department, index) => (
                          <Option value={department.id} key={index}>
                            {department.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col flex="120px">
                      <Select
                        value={taskOpen}
                        style={{ width: 140 }}
                        onChange={(value) => setConditionTaskOpen(value)}
                      >
                        <Option value="true">全て展開</Option>
                        <Option value="false">全て折り畳み</Option>
                      </Select>
                    </Col>
                  </Row>
                </Form>
              </Panel>
            </Collapse>

            <Row style={{ marginTop: '1rem' }}>
              <Col span={20}>
                {/*
                <Button type={'primary'} className={commonButton}>
                  Excel出力
                </Button>
                */}
                <Button
                  type={'primary'}
                  className={commonButton}
                  disabled={editSchedule}
                  onClick={() => {
                    setEditSchedule(true)
                  }}
                >
                  スケジュール変更
                </Button>
                <Button
                  type={'primary'}
                  style={{ marginLeft: '7px' }}
                  disabled={!editSchedule}
                  onClick={saveSchedule}
                >
                  保存
                </Button>
                <Button
                  type={'primary'}
                  style={{ marginLeft: '7px' }}
                  disabled={!editSchedule}
                  onClick={() => {
                    setGanttData({
                      tasks: originGanttData.tasks.map((list) => ({ ...list })),
                      links: originGanttData.links,
                    })

                    // スケジュール一覧を再読み込み
                    refetchFindSchedules()

                    setEditSchedule(false)
                  }}
                >
                  変更破棄
                </Button>
              </Col>
            </Row>
            <div className="gantt-container" style={{ marginTop: '1rem' }}>
              <Gantt
                data={ganttData}
                dateUnitType={dateUnitType}
                dateTermMonth={dateTermMonth}
                firstMonth={firstMonth}
                startDate={ganttStartDate}
                taskOpen={taskOpen == 'true'}
                editSchedule={editSchedule}
                showLinks={!editSchedule}
                columns={[
                  {
                    name: 'text',
                    label: '計画・企画・施策',
                    tree: true,
                    width: 150,
                    min_width: 10,
                  },
                  {
                    name: 'alert',
                    label: `<div style="display: flex; justify-content: center; align-items: center; height: 100%">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="#a6a6a6" style="width: 15px; height: 15px;">
                                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
                                <path d="M464 688a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z"/>
                              </svg>
                            </div>`,
                    tree: false,
                    width: 15,
                  },
                ]}
              />
            </div>
          </Content>
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default ScheduleList

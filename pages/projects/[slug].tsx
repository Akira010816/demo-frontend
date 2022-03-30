import { CSSProperties, FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Col, Layout, Row } from 'antd'
import { TablePaginationConfig } from 'antd/lib/table'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import Button from '~/components/Button'
import Table from '~/components/table'
import { FIND_PROJECT_BY_ID } from '~/graphhql/queries/findProjectById'
import {
  FindTasksByProjectIdResponse,
  FIND_TASKS_BY_PROJECT_ID,
} from '~/graphhql/queries/findTasksByProjectId'
import { ColumnsType } from 'antd/es/table'
import { getTaskProposalPrefix, selectTaskProposals } from '~/graphhql/selectors/task'
import { internalDateFormat } from '~/lib/date'
import { displaySetting, dateFormat, taskStatusLabels } from '~/lib/displaySetting'
import { title } from '../style'

const PAGE_ID = 'projectSummary'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const PAGINATION_PAGE_SIZE = 5

const labelStyle: CSSProperties = {
  backgroundColor: '#f2f2f2',
  border: '1px solid lightgray',
  display: 'flex',
  justifyContent: 'left',
  minHeight: '3rem',
  padding: '8px',
}
const descStyle: CSSProperties = {
  border: '1px solid lightgray',
  justifyContent: 'left',
  lineHeight: 'initial',
  padding: '8px',
  wordBreak: 'break-all',
}

type TaskColumn = {
  key: number
  id: number
  name?: string
  registeredAt?: string
  startDate?: string
  endDate?: string
  registeredUser?: string
  status?: string
}

export type MeasureColumn = {
  key: number
  task: MeasureColumnItem
  proposal: MeasureColumnItem
  measure: MeasureColumnItem
}

export type MeasureColumnItem = {
  id: number
  name: string
  entity: Task | TaskProposal | Measure
}

const ProjectDetail: FC = () => {
  const router = useRouter()
  const { slug } = router.query
  const [schedule, setSchedule] = useState({
    planningDate: undefined,
    problemAnalysisDate: undefined,
    measuresDate: undefined,
    policyPlanningDate: undefined,
    policyDecisionDate: undefined,
  })

  const { data: { findProjectById: project } = {} } = useQuery(FIND_PROJECT_BY_ID, {
    variables: { id: Number(slug) },
    skip: !slug,
    fetchPolicy: 'no-cache',
  })
  const { data: { findTasksByProjectId: tasks } = {} } = useQuery<FindTasksByProjectIdResponse>(
    FIND_TASKS_BY_PROJECT_ID,
    {
      variables: { projectId: Number(slug) },
      skip: !slug,
      fetchPolicy: 'no-cache',
    }
  )
  const [taskData, setTaskData] = useState<Array<TaskColumn>>([])
  const [measurData, setMeasurData] = useState<Array<MeasureColumn>>([])
  const [measurTablePaginationInfo, setMeasurTablePaginationInfo] = useState<TablePaginationConfig>(
    {
      current: 1,
      pageSize: PAGINATION_PAGE_SIZE,
    }
  )

  useEffect(() => {
    if (!project) return
    let planningDate
    let problemAnalysisDate
    let measuresDate
    let policyPlanningDate
    let policyDecisionDate
    project.schedules?.forEach((schedule: Schedule) => {
      const date =
        dayjs(schedule.startDate, internalDateFormat).format(dateFormat) +
        '～' +
        dayjs(schedule.endDate, internalDateFormat).format(dateFormat)
      if (schedule.type == 'planning') {
        planningDate = date
      } else if (schedule.type == 'problemAnalysis') {
        problemAnalysisDate = date
      } else if (schedule.type == 'measures') {
        measuresDate = date
      } else if (schedule.type == 'policyPlanning') {
        policyPlanningDate = date
      } else if (schedule.type == 'policyDecision') {
        policyDecisionDate = date
      }
    })
    setSchedule({
      planningDate,
      problemAnalysisDate,
      measuresDate,
      policyPlanningDate,
      policyDecisionDate,
    })
  }, [project])

  /**
   * 課題の列一覧
   */
  const taskColumns: ColumnsType<TaskColumn> = useMemo(
    () => [
      {
        title: labelConfig.taskName,
        dataIndex: 'name',
        key: 'name',
        width: '30%',
        render: (columnItem, task: TaskColumn) => {
          const obj = {
            children: (
              <Link href={`/projects/${slug}/tasks/${task.id}/edit`}>
                <a style={{ textDecoration: 'underline', color: 'rgb(51, 108, 97)' }}>
                  {task.name}
                </a>
              </Link>
            ),
          }
          return obj
        },
      },
      {
        title: labelConfig.registeredAt,
        dataIndex: 'registeredAt',
        key: 'registeredAt',
        align: 'center',
      },
      {
        title: labelConfig.startDate,
        dataIndex: 'startDate',
        key: 'startDate',
        align: 'center',
      },
      {
        title: labelConfig.endDate,
        dataIndex: 'endDate',
        key: 'endDate',
        align: 'center',
      },
      {
        title: labelConfig.registeredUser,
        dataIndex: 'registeredUser',
        key: 'registeredUser',
        align: 'center',
      },
      {
        title: labelConfig.status,
        dataIndex: 'status',
        key: 'status',
        align: 'center',
      },
    ],
    [slug]
  )

  const handleMeasurTableChange = useCallback((pagination: TablePaginationConfig): void => {
    setMeasurTablePaginationInfo(pagination)
  }, [])

  /**
   * 施策の列一覧
   */
  const counterColumns = useMemo(
    () => [
      {
        title: labelConfig.taskName,
        width: '30%',
        colSpan: 2,
        dataIndex: 'task',
        render: (columnItem: MeasureColumnItem, measureColumn: MeasureColumn, index: number) => {
          const obj = {
            children: (
              <Link href={`/projects/${slug}/tasks/${measureColumn.task.id}/counter`}>
                <a style={{ textDecoration: 'underline', color: 'rgb(51, 108, 97)' }}>
                  {measureColumn.task.name}
                </a>
              </Link>
            ),
            props: {
              rowSpan: 1,
            },
          }
          // ページネーションをした場合でも課題の列が正しく表示できるように制御
          const trueIndex =
            index +
            Number(measurTablePaginationInfo.pageSize) *
              (Number(measurTablePaginationInfo.current) - 1)
          const value = measureColumn.task.id
          if (index >= 1 && value === measurData[trueIndex - 1].task.id) {
            obj.props.rowSpan = 0
          } else {
            for (
              let i = 0;
              trueIndex + i !== measurData.length && value === measurData[trueIndex + i].task.id;
              i += 1
            ) {
              obj.props.rowSpan = i + 1
            }
          }
          return obj
        },
      },
      {
        title: '',
        width: '30%',
        colSpan: 0,
        dataIndex: 'proposal',
        render: (columnItem: MeasureColumnItem, measureColumn: MeasureColumn, index: number) => {
          const obj = {
            children: measureColumn.proposal.name,
            props: {
              rowSpan: 1,
            },
          }
          // ページネーションをした場合でも課題の列が正しく表示できるように制御
          const trueIndex =
            index +
            Number(measurTablePaginationInfo.pageSize) *
              (Number(measurTablePaginationInfo.current) - 1)
          const value = measureColumn.task.id + ':' + measureColumn.proposal.id
          if (
            index >= 1 &&
            value ===
              measurData[trueIndex - 1].task.id + ':' + measurData[trueIndex - 1].proposal.id
          ) {
            obj.props.rowSpan = 0
          } else {
            for (
              let i = 0;
              trueIndex + i !== measurData.length &&
              value ===
                measurData[trueIndex + i].task.id + ':' + measurData[trueIndex + i].proposal.id;
              i += 1
            ) {
              obj.props.rowSpan = i + 1
            }
          }
          return obj
        },
      },
      {
        title: labelConfig.MeasurePlan,
        width: '40%',
        dataIndex: 'measure',
        render: (columnItem: MeasureColumnItem, measureColumn: MeasureColumn) => {
          return {
            children: measureColumn.measure.name,
          }
        },
      },
    ],
    [measurData, measurTablePaginationInfo, slug]
  )

  useEffect(() => {
    if (!tasks) {
      return
    }

    // 課題一覧をソート
    const sortTasks = [...tasks].sort(
      (a, b) =>
        dayjs(a.startDate).diff(dayjs(b.startDate)) ||
        Object.keys(taskStatusLabels).indexOf(a.taskStatus) -
          Object.keys(taskStatusLabels).indexOf(b.taskStatus) ||
        dayjs(a.registeredAt).diff(dayjs(b.registeredAt))
    )

    // 課題一覧のデータを作成
    setTaskData(
      sortTasks.map(
        (task: Task): TaskColumn => ({
          key: task.id,
          id: task.id,
          name: task.name,
          registeredAt: dayjs(task.registeredAt).format(dateFormat),
          startDate: task.startDate
            ? dayjs(task.startDate, internalDateFormat).format(dateFormat)
            : '',
          endDate: task.endDate ? dayjs(task.endDate, internalDateFormat).format(dateFormat) : '',
          registeredUser: task.registeredUser?.name,
          status: taskStatusLabels[task.taskStatus],
        })
      )
    )

    // 施策一覧のデータを作成
    const measures = Array<MeasureColumn>()
    let columnId = 0
    sortTasks.forEach((task: Task) => {
      const taskProposals = selectTaskProposals(task)
      taskProposals.forEach((proposal) => {
        ;(proposal.measures?.length ? proposal.measures : [{}]).forEach((measure) => {
          columnId++
          measures.push({
            key: columnId,
            task: {
              id: task.id,
              name: task.name,
              entity: task,
            },
            proposal: {
              id: proposal.id,
              name: getTaskProposalPrefix(task) + proposal.text,
              entity: task,
            },
            measure: {
              id: measure.id ?? -1,
              name: measure.name ?? '',
              entity: measure,
            },
          })
        })
      })
    })
    setMeasurData(measures)
  }, [tasks])

  return (
    <PageTitleContext.Provider value={labelConfig.pageTitle}>
      <MainLayout>
        <Layout style={{ paddingLeft: '2rem' }}>
          <Row>
            <Col>{labelConfig.description}</Col>
          </Row>
          <Row>
            <Col style={{ width: '95%' }}>
              <div style={title}>{labelConfig.projectTitle}</div>
            </Col>
          </Row>
          <Row>
            <Col span={5} style={labelStyle}>
              <Link href={`/projects/${slug}/editBaseInfo`}>
                <a style={{ textDecoration: 'underline', color: 'rgb(51, 108, 97)' }}>
                  {labelConfig.summary}
                </a>
              </Link>
            </Col>
            <Col span={18}>
              <Row>
                <Col span={4} style={labelStyle}>
                  {labelConfig.projectName}
                </Col>
                <Col span={20} style={descStyle}>
                  {project?.name}
                </Col>
              </Row>
              <Row>
                <Col span={4} style={labelStyle}>
                  {labelConfig.summary}
                </Col>
                <Col span={20} style={descStyle}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{project?.description}</div>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={5} style={labelStyle}>
              <Link href={`/projects/${slug}/editOwnerMembers`}>
                <a style={{ textDecoration: 'underline', color: 'rgb(51, 108, 97)' }}>
                  {labelConfig.ownerMemberTitle}
                </a>
              </Link>
            </Col>
            <Col span={18} style={descStyle}>
              <div>
                {labelConfig.owner}：{project?.owner?.user?.name}
              </div>
              <div>
                {labelConfig.member}：
                {[
                  ...new Set(project?.members?.map((member: UserDepartment) => member.user.name)),
                ].join('、')}
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={5} style={labelStyle}>
              <Link href={`/projects/${slug}/editSchedule`}>
                <a style={{ textDecoration: 'underline', color: 'rgb(51, 108, 97)' }}>
                  {labelConfig.scheduleTitle}
                </a>
              </Link>
            </Col>
            <Col span={18} style={descStyle}>
              <div>
                {labelConfig.planning}：{schedule.planningDate}
              </div>
              <div>
                {labelConfig.problemAnalysis}：{schedule.problemAnalysisDate}
              </div>
              <div>
                {labelConfig.measures}：{schedule.measuresDate}
              </div>
              <div>
                {labelConfig.policyPlanning}：{schedule.policyPlanningDate}
              </div>
              <div>
                {labelConfig.policyDecision}：{schedule.policyDecisionDate}
              </div>
            </Col>
          </Row>
          <Row>
            <Col style={{ width: '95%' }}>
              <div style={title}>{labelConfig.taskTitle}</div>
            </Col>
          </Row>
          <Row>
            <Col
              style={{
                alignItems: 'flex-end',
                display: 'flex',
              }}
            >
              <Button type={'primary'} href={`/projects/${slug}/tasks`}>
                {labelConfig.taskButton}
              </Button>
            </Col>
          </Row>
          <Row style={{ marginTop: '20px' }}>
            <Col span={23}>
              <Table
                size={'small'}
                columns={taskColumns}
                dataSource={taskData}
                pagination={{ pageSize: PAGINATION_PAGE_SIZE }}
              />
            </Col>
          </Row>
          <Row>
            <Col style={{ width: '95%' }}>
              <div style={title}>{labelConfig.measuresTitle}</div>
            </Col>
          </Row>
          <Row>
            <Col span={23}>
              <Table
                size={'small'}
                onChange={handleMeasurTableChange}
                columns={counterColumns}
                dataSource={measurData}
                pagination={{ pageSize: PAGINATION_PAGE_SIZE }}
              />
            </Col>
          </Row>
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default ProjectDetail

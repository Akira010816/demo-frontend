import { FC, useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useToggle } from 'react-use'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Checkbox, Layout, Row, Col, message, Space } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import Button from '~/components/Button'
import Table from '~/components/table'
import Modal from '~/components/modal'
import ProgressReportModal from '~/components/project/progressReportModal'
import {
  FIND_ALL_PROJECTS,
  FindAllProjectsResponse,
  Project,
} from '~/graphhql/queries/findAllProjects'
import { DELETE_PROJECT } from '~/graphhql/mutations/deleteProject'
import { useAuth } from '~/hooks/useAuth'
import { displaySetting, projectStatusLabels } from '~/lib/displaySetting'

const PAGINATION_PAGE_SIZE = 5

const ProjectList: FC = () => {
  const { userId } = useAuth()
  const [projects, setProjects] = useState<Array<Project>>([])
  const [reportTarget, setReportTarget] = useState<Project>()
  const { data } = useQuery<FindAllProjectsResponse>(FIND_ALL_PROJECTS, {
    fetchPolicy: 'no-cache',
  })

  const getMyProjects = useCallback(
    (projects: Array<Project> | undefined) =>
      projects?.filter(
        (project) =>
          project.raisedUser?.id == userId ||
          project.owner.user.id == userId ||
          project.members.map((member) => member.user.id).includes(userId ?? 0)
      ) ?? [],
    [userId]
  )

  const sortProjectsByStartDate = (projects: Array<Project>): Array<Project> =>
    [...projects].sort(
      (a, b) =>
        dayjs(a.startDate).diff(dayjs(b.startDate)) ||
        Object.keys(projectStatusLabels).indexOf(a.status) -
          Object.keys(projectStatusLabels).indexOf(b.status)
    )

  useEffect(() => {
    if (!data) return
    setProjects(sortProjectsByStartDate(getMyProjects(data.findAllProjects)))
  }, [data, getMyProjects])

  const [mutate] = useMutation(DELETE_PROJECT, {
    refetchQueries: ['findAllProjects'],
    onCompleted: () => {
      message.success(displaySetting.projectList.labelConfig.deleteSuccess)
    },
    onError: () => {
      message.error(displaySetting.projectList.labelConfig.deleteError)
    },
  })
  const [deleteConfirmModalState, setDeleteConfirmModalState] = useState<{
    visible: boolean
    project?: Project
  }>({
    visible: false,
  })
  const [visibleProgressReportModal, toggleVisibleProgressReportModal] = useToggle(false)
  const handleOnChange = (event: CheckboxChangeEvent): void => {
    if (event.target.checked && data) {
      const myProjects = sortProjectsByStartDate(getMyProjects(data?.findAllProjects))
      setProjects(myProjects || [])
    } else if (!event.target.checked && data) {
      setProjects(sortProjectsByStartDate(data.findAllProjects))
    }
  }

  const columns: ColumnsType<Project> = [
    {
      title: displaySetting.projectList.labelConfig.projectName,
      key: 'projectName',
      ellipsis: true,
      colSpan: 7,
      render: (_, project) => ({
        props: { colSpan: 7 },
        children: (
          <Link href={`/projects/${project.id}`}>
            <a style={{ textDecoration: 'underline', color: 'rgb(51, 108, 97)' }}>{project.name}</a>
          </Link>
        ),
      }),
    },
    {
      // eslint-disable-next-line react/display-name
      title: () => <ExclamationCircleOutlined />,
      key: 'alert',
      align: 'center',
      ellipsis: true,
      colSpan: 1,
      render: () => ({
        props: { colSpan: 1 },
        children: <>{/*<ExclamationCircleTwoTone twoToneColor={Color.font.red} />*/}</>,
      }),
    },
    {
      title: displaySetting.projectList.labelConfig.raisedDepartmentName,
      key: 'raisedDepartmentName',
      align: 'center',
      ellipsis: true,
      colSpan: 4,
      render: (_, project) => ({
        props: { colSpan: 4 },
        children: <>{project.raisedDepartment?.name}</>,
      }),
    },
    {
      title: displaySetting.projectList.labelConfig.raisedUserName,
      key: 'raisedUserName',
      align: 'center',
      ellipsis: true,
      colSpan: 2,
      render: (_, project) => ({
        props: { colSpan: 2 },
        children: <>{project.raisedUser?.name}</>,
      }),
    },
    {
      title: displaySetting.projectList.labelConfig.startDate,
      key: 'startDate',
      align: 'center',
      ellipsis: true,
      colSpan: 2,
      render: (_, project) => ({
        props: { colSpan: 2 },
        children: <>{project.startDate?.replace(/-/g, '/')}</>,
      }),
    },
    {
      title: displaySetting.projectList.labelConfig.endDate,
      key: 'endDate',
      align: 'center',
      ellipsis: true,
      colSpan: 2,
      render: (_, project) => ({
        props: { colSpan: 2 },
        children: (
          <>
            {project.milestones?.length > 0 &&
              project.milestones
                ?.filter((milestone: Milestone) => milestone.type === 'projectEndDate')?.[0]
                .targetDate?.replace(/-/g, '/')}
          </>
        ),
      }),
    },
    {
      title: displaySetting.projectList.labelConfig.status,
      key: 'status',
      align: 'center',
      ellipsis: true,
      colSpan: 2,
      render: (_, project) => ({
        props: { colSpan: 2 },
        children: <>{projectStatusLabels[project.status]}</>,
      }),
    },
    {
      title: displaySetting.projectList.labelConfig.actions,
      key: 'actions',
      align: 'center',
      colSpan: 4,
      render: (_, project) => ({
        props: { colSpan: 4 },
        children: (
          <Row style={{ justifyContent: 'space-evenly' }}>
            <Space>
              <Button
                type={'primary'}
                onClick={() => {
                  setReportTarget(project)
                  toggleVisibleProgressReportModal()
                }}
              >
                進捗報告
              </Button>
              <Button
                type={'primary'}
                danger={true}
                onClick={() => setDeleteConfirmModalState({ visible: true, project })}
              >
                削除
              </Button>
            </Space>
          </Row>
        ),
      }),
    },
  ]

  return (
    <PageTitleContext.Provider value={displaySetting.projectList.labelConfig.pageTitle}>
      <MainLayout>
        <Layout className={'project-list'}>
          <Row>
            <Checkbox
              style={{ display: 'inline-block', marginTop: '10px' }}
              onChange={handleOnChange}
              defaultChecked={true}
            >
              自分が担当の企画のみ表示
            </Checkbox>
          </Row>
          <Row>
            <Col
              style={{
                height: '60px',
                alignItems: 'flex-end',
                display: 'flex',
              }}
            >
              <Button type={'primary'} href={'/projects/new'}>
                {displaySetting.projectList.labelConfig.registerProjectButton}
              </Button>
            </Col>
          </Row>
          <div style={{ marginTop: '2rem' }}>
            <Table
              columns={columns}
              dataSource={projects ?? []}
              rowKey="id"
              pagination={{ pageSize: PAGINATION_PAGE_SIZE }}
              size={'small'}
            />
          </div>
          <ProgressReportModal
            project={reportTarget}
            tasks={reportTarget?.tasks}
            visible={visibleProgressReportModal}
            onCancel={toggleVisibleProgressReportModal}
            onOk={toggleVisibleProgressReportModal}
          />
        </Layout>
      </MainLayout>
      <Modal.Confirm
        title={displaySetting.projectList.labelConfig.deleteConfirmModalTitle}
        content={displaySetting.projectList.labelConfig.deleteConfirmModalContent.replace(
          '{name}',
          deleteConfirmModalState.project ? deleteConfirmModalState.project.name : ''
        )}
        visible={deleteConfirmModalState.visible}
        onOk={() => {
          if (deleteConfirmModalState.project) {
            mutate({
              variables: {
                id: Number(deleteConfirmModalState.project.id),
                version: deleteConfirmModalState.project.version,
              },
            })
          }
          setDeleteConfirmModalState({ visible: false })
        }}
        onCancel={() => setDeleteConfirmModalState({ visible: false })}
      />
    </PageTitleContext.Provider>
  )
}

export default ProjectList

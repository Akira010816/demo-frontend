import { Col, Layout, message, Row } from 'antd'
import React, { FC, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useMutation, useQuery } from '@apollo/react-hooks'
import dayjs from 'dayjs'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import Table from '~/components/table'
import Button from '~/components/Button'
import Modal from '~/components/modal'
import { displaySetting, MAX_DATE_VALUE, taskStatusLabels } from '~/lib/displaySetting'
import { FindAllTasksResponse, FIND_ALL_TASKS } from '~/graphhql/queries/findAllTasks'
import { DELETE_TASK } from '~/graphhql/mutations/deleteTask'
import { title } from '~/pages/style'
import { ColumnsType } from 'antd/es/table'

const PAGE_ID = 'taskIndex'
const PAGINATION_PAGE_SIZE = 5

const TaskIndex: FC = () => {
  const labelConfig = displaySetting[PAGE_ID].labelConfig
  const router = useRouter()
  const { slug } = router.query
  const { data: { findAllTasks } = {} } = useQuery<FindAllTasksResponse>(FIND_ALL_TASKS, {
    variables: { projectId: Number(slug) },
    skip: !slug,
  })
  const tasks = [...(findAllTasks ?? [])].sort(
    (a, b) =>
      dayjs(a.startDate || MAX_DATE_VALUE).diff(dayjs(b.startDate || MAX_DATE_VALUE)) ||
      Object.keys(taskStatusLabels).indexOf(a.taskStatus) -
        Object.keys(taskStatusLabels).indexOf(b.taskStatus) ||
      dayjs(a.registeredAt || MAX_DATE_VALUE).diff(dayjs(b.registeredAt || MAX_DATE_VALUE))
  )
  const [visibleConfirmModal, setVisibleConfirmModal] = useState<boolean>(false)
  const [deleteTarget, setDeleteTarget] = useState<Task>()
  const [mutate] = useMutation(DELETE_TASK, {
    refetchQueries: ['findAllTasks'],
    onCompleted: () => message.success(labelConfig.deleteSuccess),
    onError: () => message.error(labelConfig.deleteError),
  })

  const columns: ColumnsType<Task> = [
    {
      title: labelConfig.taskName,
      key: 'name',
      dataIndex: 'name',
      render: (_, task) => ({
        children: (
          <Link href={`/projects/${slug}/tasks/${task.id}/edit`}>
            <a style={{ textDecoration: 'underline', color: 'rgb(51, 108, 97)' }}>{task.name}</a>
          </Link>
        ),
      }),
    },
    {
      title: labelConfig.registeredAt,
      key: 'registeredAt',
      dataIndex: 'registeredAt',
      align: 'center',
      render: (_, task) => ({
        children: <>{dayjs(task.registeredAt).format('YYYY/MM/DD')}</>,
      }),
    },
    {
      title: labelConfig.startDate,
      key: 'startDate',
      dataIndex: 'startDate',
      align: 'center',
      render: (_, task) => ({
        children: <>{task.startDate?.replace(/-/g, '/')}</>,
      }),
    },
    {
      title: labelConfig.endDate,
      key: 'endDate',
      dataIndex: 'endDate',
      align: 'center',
      render: (_, task) => ({
        children: <>{task.endDate?.replace(/-/g, '/')}</>,
      }),
    },
    {
      title: labelConfig.registeredUser,
      key: 'registeredUser',
      dataIndex: 'registeredUser',
      align: 'center',
      render: (_, task) => ({
        children: <>{task.registeredUser?.name}</>,
      }),
    },
    {
      title: labelConfig.status,
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      render: (_, task) => ({
        children: <>{taskStatusLabels[task.taskStatus]}</>,
      }),
    },
    {
      title: labelConfig.action,
      key: 'action',
      dataIndex: 'action',
      align: 'center',
      render: (_, task) => ({
        children: (
          <Button
            type={'primary'}
            danger={true}
            onClick={() => {
              setVisibleConfirmModal(true)
              setDeleteTarget(task)
            }}
          >
            削除
          </Button>
        ),
      }),
    },
  ]

  return (
    <PageTitleContext.Provider value={labelConfig.pageTitle}>
      <MainLayout>
        <Layout style={{ paddingLeft: '2rem' }}>
          <Row>
            <Col offset={20} span={2}>
              <Button type={'primary'} onClick={() => router.push(`/projects/${slug}`)}>
                企画へ戻る
              </Button>
            </Col>
          </Row>
          <Row>
            <Col style={{ width: '95%' }}>
              <div style={title}>課題設定</div>
            </Col>
          </Row>
          <Row style={{ marginBottom: '1rem' }}>課題を登録して下さい。</Row>
          <Row style={{ marginBottom: '2rem' }}>
            <Col span={4} style={{ marginTop: '1rem' }}>
              <Button type={'primary'} onClick={() => router.push(`/projects/${slug}/tasks/new`)}>
                課題を追加
              </Button>
            </Col>
          </Row>

          <Col span={22}>
            <Table
              columns={columns}
              dataSource={tasks ?? []}
              rowKey="id"
              pagination={{ pageSize: PAGINATION_PAGE_SIZE }}
              size={'small'}
            />
          </Col>

          <Modal.Confirm
            title={labelConfig.deleteConfirmModalTitle}
            content={labelConfig.deleteConfirmModalContent.replace(
              '{name}',
              deleteTarget ? deleteTarget.name : ''
            )}
            visible={visibleConfirmModal}
            onOk={() => {
              if (!deleteTarget) return
              mutate({ variables: { id: deleteTarget.id, version: deleteTarget.version } })
              setVisibleConfirmModal(false)
            }}
            onCancel={() => setVisibleConfirmModal(false)}
          />
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}
export default TaskIndex

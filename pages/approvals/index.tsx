import React, { FC, useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { useToggle } from 'react-use'
import moment from 'moment'
import { Col, Divider, Layout, Row, Typography } from 'antd'
import { ColumnsType } from 'antd/es/table'
import Heading from '~/components/Heading'
import Button from '~/components/Button'
import Table from '~/components/table'
import { ApproveModal } from '~/components/approvals/approveModal'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import { approvalStepAssigneeStatuses, dateTimeFormat, displaySetting } from '~/lib/displaySetting'
import {
  FIND_APPROVAL_REQUESTS_ASSIGNED_TO_ME,
  FindApprovalRequestsAssignedToMeResponse,
} from '~/graphhql/queries/findApprovalRequestsAssignedToMe'
import { selectMyStatusOfAnApprovalRequest } from '~/graphhql/selectors/approvalRequest'
import { useAuth } from '~/hooks/useAuth'
import { ButtonProps } from 'antd/es/button'
import { useRouter } from 'next/router'

const PAGE_ID = 'approvals'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const Approvals: FC = () => {
  const router = useRouter()
  const { code: targetApprovalCode } = router.query
  const { data: approvals } = useQuery<FindApprovalRequestsAssignedToMeResponse>(
    FIND_APPROVAL_REQUESTS_ASSIGNED_TO_ME
  )

  useEffect(() => {
    const targetApprovalRequest = approvals?.findApprovalRequestsAssignedToMe.filter(
      (a) => a.code === targetApprovalCode
    )?.[0]
    if (targetApprovalRequest) {
      setSelectedApprovalRequest(targetApprovalRequest)
      toggleApproveModalVisible()
    }
  }, [approvals])

  const [approveModalVisible, toggleApproveModalVisible] = useToggle(false)
  const [selectedApprovalRequest, setSelectedApprovalRequest] = useState<ApprovalRequest>()
  const { userId } = useAuth()

  const columns: ColumnsType<ApprovalRequest> = [
    {
      title: labelConfig.code,
      dataIndex: 'code',
      key: 'code',
      render: (code: ApprovalRequest['code'], column) => ({
        children: (
          <Button
            type="link"
            onClick={async () => {
              await setSelectedApprovalRequest(column)
              toggleApproveModalVisible()
            }}
          >
            <Typography.Link underline={true}>{code}</Typography.Link>
          </Button>
        ),
      }),
    },
    {
      title: labelConfig.requestedBy,
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      render: (requestedBy: ApprovalRequest['requestedBy']) => ({
        children: <Typography.Text>{requestedBy?.user?.name}</Typography.Text>,
      }),
    },
    {
      title: labelConfig.status,
      key: 'category',
      render: (_, approvalRequest) => ({
        children: <Typography.Text>{approvalRequest.approvalCategory?.name}</Typography.Text>,
      }),
    },
    {
      title: labelConfig.myStatus,
      key: 'myStatus',
      render: (_, approvalRequest) => {
        const myStatus = selectMyStatusOfAnApprovalRequest(approvalRequest, userId)
        return {
          children: <Typography.Text>{myStatus}</Typography.Text>,
        }
      },
    },
    {
      title: labelConfig.createdAt,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: ApprovalRequest['createdAt']) => ({
        children: <Typography.Text>{moment(createdAt).format(dateTimeFormat)}</Typography.Text>,
      }),
    },
  ]

  const close: ButtonProps['onClick'] = () => {
    router.back()
  }

  return (
    <PageTitleContext.Provider value={'承認一覧'}>
      <MainLayout>
        <Layout style={{ marginLeft: '2rem' }}>
          <Col>
            <Heading.H1 title={'承認依頼'} />
            <Col span={22}>
              <Table
                columns={columns}
                dataSource={approvals?.findApprovalRequestsAssignedToMe}
                size={'small'}
                rowKey={'id'}
                rowClassName={(approvalRequest: ApprovalRequest) => {
                  const status = selectMyStatusOfAnApprovalRequest(approvalRequest, userId)
                  const isProcessing = status === approvalStepAssigneeStatuses.processing.label
                  return isProcessing ? 'active' : 'inactive'
                }}
              />
            </Col>
          </Col>

          <ApproveModal
            visible={approveModalVisible}
            toggleModal={toggleApproveModalVisible}
            approvalRequest={selectedApprovalRequest}
          />

          <Divider />

          <Row justify={'center'}>
            <Button type={'ghost'} onClick={close} style={{ width: '200px' }}>
              {labelConfig.closePageButton}
            </Button>
          </Row>
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default Approvals

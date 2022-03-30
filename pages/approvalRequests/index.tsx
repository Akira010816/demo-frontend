import React, { FC, useState } from 'react'
import { Col, Typography, Layout, Divider, Row } from 'antd'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import Heading from '~/components/Heading'
import { ColumnsType } from 'antd/es/table'
import {
  approvalCategorySlugs,
  approvalRequestStatuses,
  dateTimeFormat,
  displaySetting,
} from '~/lib/displaySetting'
import { useQuery } from '@apollo/client'
import {
  FIND_APPROVAL_REQUESTS_REQUESTED_BY_ME,
  FindApprovalRequestsRequestedByMeRequestTypes,
  FindApprovalRequestsRequestedByMeResponse,
} from '~/graphhql/queries/findApprovalRequestsRequestedByMe'
import Table from '~/components/table'
import moment from 'moment'
import Button from '~/components/Button'
import { useToggle } from 'react-use'
import { AddNewApprovalRequestModal } from '~/components/approvals/addNewApprovalRequestModal'
import { ApprovalRequestConfirmationModal } from '~/components/approvals/approvalRequestConfirmationModal'
import {
  FIND_APPROVAL_CATEGORY_BY_SLUG,
  FindApprovalCategoryBySlugRequest,
  FindApprovalCategoryBySlugResponse,
} from '~/graphhql/queries/findApprovalCategoryBySlug'
import { useRouter } from 'next/router'
import { selectApprovalRequestStatus } from '~/graphhql/selectors/approvalRequest'
import { ButtonProps } from 'antd/es/button'

const PAGE_ID = 'approvalRequests'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const ApprovalRequests: FC = () => {
  const router = useRouter()

  const approvalCategorySlug =
    (router.query.category?.toString() as ApprovalCategorySlug) ?? approvalCategorySlugs.plan.slug

  const { data: approvalCategory } = useQuery<
    FindApprovalCategoryBySlugResponse,
    FindApprovalCategoryBySlugRequest
  >(FIND_APPROVAL_CATEGORY_BY_SLUG, {
    variables: { slug: approvalCategorySlug },
  })

  const category = approvalCategory?.findApprovalCategoryBySlug

  const { data: approvalRequests } = useQuery<
    FindApprovalRequestsRequestedByMeResponse,
    FindApprovalRequestsRequestedByMeRequestTypes
  >(FIND_APPROVAL_REQUESTS_REQUESTED_BY_ME, {
    variables: {
      findApprovalRequestsRequestedByMeInput: {
        approvalCategorySlug: approvalCategorySlug,
      },
    },
  })

  const [selectedApprovalRequest, setSelectedApprovalRequest] = useState<ApprovalRequest>()

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
              toggleApprovalRequestConfirmationModalVisible()
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
      dataIndex: 'status',
      key: 'status',
      render: (_, approvalRequest) => ({
        children: <Typography>{selectApprovalRequestStatus(approvalRequest)}</Typography>,
      }),
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

  const [newApprovalRequestModalVisible, toggleNewApprovalRequestModalVisible] = useToggle(false)
  const [
    approvalRequestConfirmationModalVisible,
    toggleApprovalRequestConfirmationModalVisible,
  ] = useToggle(false)

  const close: ButtonProps['onClick'] = () => {
    router.back()
  }

  return (
    <PageTitleContext.Provider value={'承認依頼一覧'}>
      <MainLayout>
        <Layout style={{ marginLeft: '2rem' }}>
          <Col style={{ marginBottom: '1rem' }}>
            <Col style={{ marginBottom: '1rem' }}>
              <Typography.Text>
                対象 : {category ? category?.name : '無効な承認区分'}
              </Typography.Text>
            </Col>
            <Col>
              <Button
                type={'primary'}
                onClick={toggleNewApprovalRequestModalVisible}
                disabled={!category}
              >
                承認依頼
              </Button>
            </Col>
          </Col>
          <Col>
            <Heading.H1 title={'過去の承認依頼'} />
            <Col span={22}>
              <Table
                columns={columns}
                dataSource={approvalRequests?.findApprovalRequestsRequestedByMe}
                size={'small'}
                rowKey={'id'}
                rowClassName={(approvalRequest: ApprovalRequest) => {
                  const isProcessing =
                    selectApprovalRequestStatus(approvalRequest) ===
                    approvalRequestStatuses.processing.label
                  return isProcessing ? 'active' : 'inactive'
                }}
              />
            </Col>
          </Col>

          {category ? (
            <AddNewApprovalRequestModal
              approvalCategory={category}
              visible={newApprovalRequestModalVisible}
              toggleModal={toggleNewApprovalRequestModalVisible}
            />
          ) : null}

          <ApprovalRequestConfirmationModal
            approvalCategory={category}
            approvalRequest={selectedApprovalRequest}
            visible={approvalRequestConfirmationModalVisible}
            toggleModal={toggleApprovalRequestConfirmationModalVisible}
          />
        </Layout>

        <Divider />

        <Row justify={'center'}>
          <Button type={'ghost'} onClick={close} style={{ width: '200px' }}>
            {labelConfig.closePageButton}
          </Button>
        </Row>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default ApprovalRequests

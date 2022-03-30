import React, { FC } from 'react'
import { useMutation } from '@apollo/react-hooks'
import moment from 'moment'
import { Col, DatePicker, Form, Input, message, Row } from 'antd'
import { ModalProps } from 'antd/es/modal'
import { ButtonProps } from 'antd/es/button'
import Modal from '~/components/modal'
import Heading from '~/components/Heading'
import { ApprovalFlow } from '~/components/approvals/approvalFlow'
import FormItem from '~/components/form/FormItem'
import Button from '~/components/Button'
import { grayButton } from '~/pages/style'
import { useAuth } from '~/hooks/useAuth'
import { dateFormat, displaySetting } from '~/lib/displaySetting'
import {
  selectDidHandleApprovalRequest,
  selectMyCurrentApprovalStepAssigneeToAction,
  selectMyCurrentApprovalStepAssigneeToCancel,
} from '~/graphhql/selectors/approvalRequest'
import { FIND_APPROVAL_REQUESTS_REQUESTED_BY_ME } from '~/graphhql/queries/findApprovalRequestsRequestedByMe'
import { FIND_APPROVAL_REQUESTS_ASSIGNED_TO_ME } from '~/graphhql/queries/findApprovalRequestsAssignedToMe'
import {
  REJECT_APPROVAL_STEP_ASSIGNEE,
  RejectApprovalStepAssigneeRequestTypes,
  RejectApprovalStepAssigneeResponse,
} from '~/graphhql/mutations/rejectApprovalStepAssignee'
import {
  APPROVE_APPROVAL_STEP_ASSIGNEE,
  ApproveApprovalStepAssigneeRequestTypes,
  ApproveApprovalStepAssigneeResponse,
} from '~/graphhql/mutations/approveApprovalStepAssignee'
import {
  CANCEL_APPROVAL_STEP_ASSIGNEE,
  CancelApprovalStepAssigneeRequestTypes,
  CancelApprovalStepAssigneeResponse,
} from '~/graphhql/mutations/cancelApprovalStepAssignee'

type ApproveModalProps = {
  visible: ModalProps['visible']
  toggleModal: () => void
  approvalRequest?: ApprovalRequest
}

const PAGE_ID = 'approveModal'
const labelConfig = displaySetting[PAGE_ID].labelConfig

type ActionType = 'close' | 'approve' | 'cancel' | 'reject'

export const ApproveModal: FC<ApproveModalProps> = ({ visible, toggleModal, approvalRequest }) => {
  const { userId } = useAuth()
  const didHandle = selectDidHandleApprovalRequest(approvalRequest, userId)

  const mutationOptions = {
    refetchQueries: [
      {
        query: FIND_APPROVAL_REQUESTS_REQUESTED_BY_ME,
        variables: {
          findApprovalRequestsRequestedByMeInput: {
            approvalCategorySlug: approvalRequest?.approvalCategory?.slug,
          },
        },
      },
      { query: FIND_APPROVAL_REQUESTS_ASSIGNED_TO_ME },
    ],
    onCompleted: async () => {
      await message.success(labelConfig.mutationSuccess)
    },
    onError: async () => {
      await message.error(labelConfig.mutationError)
    },
  }

  const [cancelApprovalStepAssignee] = useMutation<
    CancelApprovalStepAssigneeResponse,
    CancelApprovalStepAssigneeRequestTypes
  >(CANCEL_APPROVAL_STEP_ASSIGNEE, mutationOptions)

  const [rejectApprovalStepAssignee] = useMutation<
    RejectApprovalStepAssigneeResponse,
    RejectApprovalStepAssigneeRequestTypes
  >(REJECT_APPROVAL_STEP_ASSIGNEE, mutationOptions)

  const [approveApprovalStepAssignee] = useMutation<
    ApproveApprovalStepAssigneeResponse,
    ApproveApprovalStepAssigneeRequestTypes
  >(APPROVE_APPROVAL_STEP_ASSIGNEE, mutationOptions)

  const doAction = (actionType: ActionType): ButtonProps['onClick'] => async () => {
    if (actionType !== 'close') {
      const targetApprovalStepAssignee =
        actionType === 'cancel'
          ? selectMyCurrentApprovalStepAssigneeToCancel(approvalRequest, userId)
          : selectMyCurrentApprovalStepAssigneeToAction(approvalRequest, userId)

      if (targetApprovalStepAssignee) {
        const input = {
          id: targetApprovalStepAssignee.id,
          approvalRequestId: approvalRequest?.id,
          comment: form.getFieldValue('comment'),
        }

        switch (actionType) {
          case 'cancel': {
            await cancelApprovalStepAssignee({
              variables: {
                cancelApprovalStepAssigneeInput: input,
              },
            })
            break
          }
          case 'approve': {
            await approveApprovalStepAssignee({
              variables: {
                approveApprovalStepAssigneeInput: input,
              },
            })
            break
          }
          case 'reject': {
            await rejectApprovalStepAssignee({
              variables: {
                rejectApprovalStepAssigneeInput: input,
              },
            })
          }
        }
      }
    }

    form.resetFields()
    toggleModal()
  }

  const [form] = Form.useForm()
  const hasStatusToCancel = !!selectMyCurrentApprovalStepAssigneeToCancel(approvalRequest, userId)

  return approvalRequest ? (
    <Modal.Normal
      visible={visible}
      onCancel={toggleModal}
      footer={
        <>
          {!didHandle && (
            <Form form={form} style={{ marginTop: '1rem' }}>
              <FormItem pageId={PAGE_ID} itemId={'comment'} wrapperCol={{ span: 22 }}>
                <Input.TextArea autoSize={{ minRows: 3, maxRows: 10 }} style={{ flex: 1 }} />
              </FormItem>
            </Form>
          )}

          <Row justify="center">
            {!didHandle && (
              <Button type="primary" onClick={doAction('approve')}>
                {labelConfig.approveButton}
              </Button>
            )}
            {(hasStatusToCancel || didHandle) && (
              <Button type="primary" warning={true} onClick={doAction('cancel')}>
                {labelConfig.cancelButton}
              </Button>
            )}
            {!didHandle && (
              <Button type="primary" danger={true} onClick={doAction('reject')}>
                {labelConfig.rejectButton}
              </Button>
            )}
            <Button style={{ ...grayButton, marginLeft: '3rem' }} onClick={doAction('close')}>
              {labelConfig.closeButton}
            </Button>
          </Row>
        </>
      }
    >
      <Col>
        <Heading.H1 title={labelConfig.requesterInfoTitle} />
        <Form>
          <FormItem
            pageId={PAGE_ID}
            itemId={'requestedBy'}
            name={['approvalRequests', approvalRequest.id, 'requestedBy', 'name']}
            initialValue={`${approvalRequest.requestedBy?.user?.name} ${
              approvalRequest.requestedBy?.department?.name
                ? `(${approvalRequest.requestedBy?.department?.name})`
                : ''
            }`}
          >
            <Input.TextArea
              disabled={true}
              style={{ resize: 'none' }}
              value={approvalRequest.approvalCategory?.name}
            />
          </FormItem>

          <FormItem
            pageId={PAGE_ID}
            itemId={'approvalCategory'}
            name={['approvalRequests', approvalRequest.id, 'approvalCategory', 'name']}
            initialValue={approvalRequest.approvalCategory?.name}
          >
            <Input.TextArea
              disabled={true}
              style={{ resize: 'none' }}
              value={approvalRequest.approvalCategory?.name}
            />
          </FormItem>

          <FormItem
            pageId={PAGE_ID}
            itemId={'approvalRequestMessage'}
            name={['approvalRequests', approvalRequest.id, 'message']}
            initialValue={approvalRequest.message}
          >
            <Input.TextArea autoSize={{ minRows: 4, maxRows: 15 }} disabled={true} />
          </FormItem>

          <FormItem
            pageId={PAGE_ID}
            itemId={'until'}
            name={['approvalRequests', approvalRequest.id, 'until']}
            initialValue={approvalRequest.until ? moment(approvalRequest.until, dateFormat) : null}
          >
            <DatePicker disabled={true} format={dateFormat} />
          </FormItem>
        </Form>
      </Col>
      <Col>
        <Heading.H1 title={labelConfig.progressStatusTitle} />
        <ApprovalFlow approvalFlow={approvalRequest.approvalFlow} noBorder={true} />
      </Col>
    </Modal.Normal>
  ) : null
}

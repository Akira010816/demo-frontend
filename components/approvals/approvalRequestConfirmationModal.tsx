import React, { FC } from 'react'
import moment from 'moment'
import { DatePicker, Form, Input, message, Row } from 'antd'
import { ModalProps } from 'antd/es/modal'
import { ButtonProps } from 'antd/es/button'
import FormItem from '~/components/form/FormItem'
import Button from '~/components/Button'
import Modal from '~/components/modal'
import { ApprovalFlow } from '~/components/approvals/approvalFlow'
import { dateFormat, displaySetting } from '~/lib/displaySetting'
import { grayButton } from '~/pages/style'
import { useMutation } from '@apollo/react-hooks'
import {
  CANCEL_APPROVAL_REQUEST,
  CancelApprovalRequestRequestTypes,
  CancelApprovalRequestResponse,
} from '~/graphhql/mutations/cancelApprovalRequest'
import { FIND_APPROVAL_REQUESTS_REQUESTED_BY_ME } from '~/graphhql/queries/findApprovalRequestsRequestedByMe'
import { FIND_APPROVAL_REQUESTS_ASSIGNED_TO_ME } from '~/graphhql/queries/findApprovalRequestsAssignedToMe'

const PAGE_ID = 'addNewApprovalRequest'
const labelConfig = displaySetting[PAGE_ID].labelConfig

type ApprovalRequestConfirmationProps = {
  approvalCategory?: ApprovalCategory
  approvalRequest?: ApprovalRequest
  toggleModal: () => void
  visible: ModalProps['visible']
}

export const ApprovalRequestConfirmationModal: FC<ApprovalRequestConfirmationProps> = (props) => {
  const [cancelApprovalRequest] = useMutation<
    CancelApprovalRequestResponse,
    CancelApprovalRequestRequestTypes
  >(CANCEL_APPROVAL_REQUEST, {
    refetchQueries: [
      {
        query: FIND_APPROVAL_REQUESTS_REQUESTED_BY_ME,
        variables: {
          findApprovalRequestsRequestedByMeInput: {
            approvalCategorySlug: props.approvalCategory?.slug,
          },
        },
      },
      { query: FIND_APPROVAL_REQUESTS_ASSIGNED_TO_ME },
    ],
    onCompleted: async () => {
      await message.success(labelConfig.cancelMutationSuccess)
    },
    onError: async () => {
      await message.error(labelConfig.cancelMutationError)
    },
  })

  const cancelRequest: ButtonProps['onClick'] = async () => {
    if (props.approvalRequest) {
      await cancelApprovalRequest({
        variables: {
          cancelApprovalRequestInput: {
            id: props.approvalRequest.id,
          },
        },
      })
    }
    props.toggleModal()
  }

  return props.approvalRequest ? (
    <Modal.Normal
      visible={props.visible}
      onCancel={props.toggleModal}
      footer={
        <Row justify="center">
          <Button
            key="back"
            type="primary"
            onClick={cancelRequest}
            disabled={props.approvalRequest.status === 'canceled'}
          >
            {labelConfig.cancelApprovalRequestButton}
          </Button>
          <Button style={grayButton} key="submit" onClick={props.toggleModal}>
            {labelConfig.closeModalButton}
          </Button>
        </Row>
      }
    >
      <Form>
        <FormItem
          pageId={PAGE_ID}
          itemId={'approvalCategory'}
          name={['approvalRequests', props.approvalRequest.id, 'approvalCategory', 'name']}
          initialValue={props.approvalRequest.approvalCategory?.name}
        >
          <Input.TextArea
            disabled={true}
            style={{ resize: 'none' }}
            value={props.approvalRequest.approvalCategory?.name}
          />
        </FormItem>

        <FormItem
          pageId={PAGE_ID}
          itemId={'approvalRequestMessage'}
          name={['approvalRequests', props.approvalRequest.id, 'message']}
          initialValue={props.approvalRequest.message}
        >
          <Input.TextArea autoSize={{ minRows: 4, maxRows: 15 }} disabled={true} />
        </FormItem>

        <FormItem
          pageId={PAGE_ID}
          itemId={'until'}
          name={['approvalRequests', props.approvalRequest.id, 'until']}
          initialValue={
            props.approvalRequest.until ? moment(props.approvalRequest.until, dateFormat) : null
          }
        >
          <DatePicker disabled={true} format={dateFormat} />
        </FormItem>

        <FormItem pageId={PAGE_ID} itemId={'approvalFlowConfirmation'}>
          <ApprovalFlow approvalFlow={props.approvalRequest.approvalFlow} />
        </FormItem>
      </Form>
    </Modal.Normal>
  ) : null
}

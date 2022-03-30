import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import debounce from 'lodash.debounce'
import { DatePicker, Form, Input, message, Row } from 'antd'
import { ModalProps } from 'antd/es/modal'
import { ButtonProps } from 'antd/es/button'
import FormItem from '~/components/form/FormItem'
import Button from '~/components/Button'
import Modal from '~/components/modal'
import { dateFormat, displaySetting } from '~/lib/displaySetting'
import { grayButton } from '~/pages/style'
import { FIND_APPROVAL_REQUESTS_REQUESTED_BY_ME } from '~/graphhql/queries/findApprovalRequestsRequestedByMe'
import {
  CREATE_APPROVAL_REQUEST,
  CreateApprovalRequestRequestTypes,
  CreateApprovalRequestResponse,
  generateCreateApprovalRequestInputFromEntity,
} from '~/graphhql/mutations/createApprovalRequest'
import { ApprovalFlow } from '~/components/approvals/approvalFlow'
import { useQuery } from '@apollo/client'
import { FIND_APPROVAL_FLOW, FindApprovalFlowResponse } from '~/graphhql/queries/findApprovalFlow'

const PAGE_ID = 'addNewApprovalRequest'
const labelConfig = displaySetting[PAGE_ID].labelConfig

type AddNewApprovalRequestProps = {
  approvalCategory: ApprovalCategory
  toggleModal: () => void
  visible: ModalProps['visible']
}

export const AddNewApprovalRequestModal: FC<AddNewApprovalRequestProps> = (props) => {
  const [form] = Form.useForm()

  const defaultApprovalRequest: ApprovalRequest = {
    id: 0,
    approvalCategory: props.approvalCategory,
    message: props.approvalCategory?.approvalRequestMessageTemplate?.message,
    code: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest>(defaultApprovalRequest)
  const { data } = useQuery<FindApprovalFlowResponse>(FIND_APPROVAL_FLOW)

  useEffect(() => {
    if (data) {
      setApprovalRequest({ ...approvalRequest, approvalFlow: data.findApprovalFlow })
    }
  }, [data])

  const [createApprovalRequest] = useMutation<
    CreateApprovalRequestResponse,
    CreateApprovalRequestRequestTypes
  >(CREATE_APPROVAL_REQUEST, {
    refetchQueries: [
      {
        query: FIND_APPROVAL_REQUESTS_REQUESTED_BY_ME,
        variables: {
          findApprovalRequestsRequestedByMeInput: {
            approvalCategorySlug: props.approvalCategory.slug,
          },
        },
      },
    ],
    onCompleted: async () => {
      message.success(labelConfig.mutationSuccess)
      await form.resetFields()
      props.toggleModal()
    },
    onError: async () => {
      message.error(labelConfig.mutationError)
    },
  })

  const createNewApprovalRequest: ButtonProps['onClick'] = async () => {
    await form.validateFields()
    await createApprovalRequest({
      variables: {
        createApprovalRequestInput: generateCreateApprovalRequestInputFromEntity(approvalRequest),
      },
    })
  }

  const cancel: ButtonProps['onClick'] = () => {
    setApprovalRequest({ ...defaultApprovalRequest, approvalFlow: data?.findApprovalFlow })
    form.resetFields()
    props.toggleModal()
  }

  return (
    <Modal.Normal
      visible={props.visible}
      onCancel={cancel}
      footer={
        <Row justify="center">
          <Button key="back" type="primary" onClick={createNewApprovalRequest}>
            承認依頼
          </Button>
          <Button style={grayButton} key="submit" onClick={cancel}>
            キャンセル
          </Button>
        </Row>
      }
    >
      <Form form={form}>
        <FormItem
          pageId={PAGE_ID}
          itemId={'approvalCategory'}
          initialValue={props.approvalCategory.name}
        >
          <Input.TextArea disabled={true} style={{ resize: 'none' }} />
        </FormItem>

        <FormItem
          pageId={PAGE_ID}
          itemId={'approvalRequestMessage'}
          initialValue={props.approvalCategory?.approvalRequestMessageTemplate?.message}
        >
          <Input.TextArea
            autoSize={{ minRows: 4, maxRows: 15 }}
            onChange={debounce(
              (e: ChangeEvent<HTMLTextAreaElement>) =>
                setApprovalRequest({ ...approvalRequest, message: e.target.value }),
              200
            )}
          />
        </FormItem>

        <FormItem pageId={PAGE_ID} itemId={'until'}>
          <DatePicker
            format={dateFormat}
            onChange={(e) =>
              setApprovalRequest({ ...approvalRequest, until: e ? e.toString() : undefined })
            }
          />
        </FormItem>

        <FormItem pageId={PAGE_ID} itemId={'approvalFlow'}>
          <ApprovalFlow approvalFlow={approvalRequest.approvalFlow} />
        </FormItem>
      </Form>
    </Modal.Normal>
  )
}

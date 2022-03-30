import { FC, useMemo, useState } from 'react'
import { useToggle } from 'react-use'
import { Col, DatePicker, Form, message, Modal, Row, Typography } from 'antd'
import { ButtonProps } from 'antd/es/button'
import { ModalFuncProps, ModalProps } from 'antd/lib/modal'
import { ColumnsType } from 'antd/es/table'
import { useMutation } from '@apollo/react-hooks'
import { Moment } from 'moment'
import { dateFormat, displaySetting } from '~/lib/displaySetting'
import {
  CREATE_PLAN_FORMULATION_REQUEST,
  CreatePlanFormulationRequestRequestTypes,
  CreatePlanFormulationRequestResponse,
  generateCreatePlanFormulationRequestInputFromEntity,
} from '~/graphhql/mutations/createPlanFormulationRequest'
import {
  CREATE_PLAN_MEASURE_REGISTRATION_REQUEST,
  CreatePlanMeasureRegistrationRequestRequestTypes,
  CreatePlanMeasureRegistrationRequestResponse,
  generateCreatePlanMeasureRegistrationRequestInputFromEntity,
} from '~/graphhql/mutations/createPlanMeasureRegistrationRequest'
import Button from '../Button'
import Table from '../table'
import UserSelectWithPositionModal from '../user/userSelectWithPositionModal'

const PAGE_ID = 'formulatePlanMeasureRequest'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const PAGINATION_PAGE_SIZE = 7

const { Text } = Typography

type DestinationColumn = {
  key: number
  assigneeId: number
  assigneeName?: string
  organizationCode?: string
  organizationName?: string
  positionWeight: number
}

export type RequestType = 'planFomulation' | 'planMeasureRegistration'

export type FormulatePlanMeasureRequestModalProps = ModalProps &
  ModalFuncProps & {
    requestType: RequestType
    visible: boolean
    planId: number
  }

/**
 * 事業計画策定・施策登録依頼モーダル
 */
const FormulatePlanMeasureRequestModal: FC<FormulatePlanMeasureRequestModalProps> = ({
  ...props
}: FormulatePlanMeasureRequestModalProps) => {
  const [destinationData, setDestinationData] = useState<Array<DestinationColumn>>([])

  const [userSelectWithPositionModalVisible, toggleUserSelectWithPositionModalVisible] = useToggle(
    false
  )

  const [
    planMeasureRegistrationRequest,
    setPlanMeasureRegistrationRequest,
  ] = useState<PlanMeasureRegistrationRequest>({
    planId: props.planId,
    until: '',
    requestedTo: [],
  })

  const [until, setUntil] = useState<Moment>()

  const [createPlanFormulationRequest] = useMutation<
    CreatePlanFormulationRequestResponse,
    CreatePlanFormulationRequestRequestTypes
  >(CREATE_PLAN_FORMULATION_REQUEST, {
    onCompleted: async () => {
      message.success(labelConfig.planFormulationRequestMutationSuccess)
      if (props.onOk) {
        props.onOk()
      }
    },
    onError: async () => {
      message.error(labelConfig.planFormulationRequestMutationError)
    },
  })

  const [createPlanMeasureRegistrationRequest] = useMutation<
    CreatePlanMeasureRegistrationRequestResponse,
    CreatePlanMeasureRegistrationRequestRequestTypes
  >(CREATE_PLAN_MEASURE_REGISTRATION_REQUEST, {
    onCompleted: async () => {
      message.success(labelConfig.planMeasureRegistrationRequestMutationSuccess)
      if (props.onOk) {
        props.onOk()
      }
    },
    onError: async () => {
      message.error(labelConfig.planMeasureRegistrationRequestMutationError)
    },
  })

  const createRequest: ButtonProps['onClick'] = async () => {
    if (props.requestType == 'planFomulation') {
      await createPlanFormulationRequest({
        variables: {
          createPlanFormulationRequestInput: generateCreatePlanFormulationRequestInputFromEntity({
            planId: props.planId,
            until: until ? until.toString() : '',
            requestedTo: destinationData.map((value) => value.key),
          }),
        },
      })
    } else {
      setPlanMeasureRegistrationRequest({
        ...planMeasureRegistrationRequest,
        until: until ? until.toString() : '',
        requestedTo: destinationData.map((value) => value.key),
      })
      await createPlanMeasureRegistrationRequest({
        variables: {
          createPlanMeasureRegistrationRequestInput: generateCreatePlanMeasureRegistrationRequestInputFromEntity(
            {
              planId: props.planId,
              until: until ? until.toString() : '',
              requestedTo: destinationData.map((value) => value.key),
            }
          ),
        },
      })
    }
  }

  /**
   * 依頼先の列一覧
   */
  const destinationColumns: ColumnsType<DestinationColumn> = useMemo(
    () => [
      {
        title: labelConfig.organizationName,
        dataIndex: 'organizationName',
        key: 'organizationName',
        width: '60%',
      },
      {
        title: labelConfig.assigneeName,
        dataIndex: 'assigneeName',
        key: 'assigneeName',
      },
    ],
    []
  )

  return (
    <Modal
      {...props}
      width="640px"
      bodyStyle={{ height: '550px', paddingTop: 0, paddingBottom: 0 }}
      style={{ top: 10 }}
      title={
        props.requestType == 'planFomulation'
          ? labelConfig.planFormulationTitle
          : labelConfig.planMeasureRegistrationTitle
      }
      destroyOnClose={true}
      afterClose={() => setDestinationData([])}
      footer={[
        <Row key="row" style={{ marginTop: 0, marginBottom: '1rem' }} justify={'center'}>
          <Button
            style={{ width: '180px' }}
            disabled={destinationData.length == 0 || !until}
            key="back"
            type="primary"
            onClick={createRequest}
          >
            依頼
          </Button>
          <Button
            style={{ width: '180px', marginLeft: '24px' }}
            key="submit"
            onClick={props.onCancel}
            type={'ghost'}
          >
            キャンセル
          </Button>
        </Row>,
      ]}
    >
      <div
        style={{
          color: 'black',
          padding: '8px',
          marginTop: '5px',
          marginBottom: '5px',
          width: '100%',
          borderLeft: 'solid 15px rgb(0,71,58)',
          borderBottom: 'solid 3px rgb(0,71,58)',
          fontSize: 'large',
          fontWeight: 500,
        }}
      >
        提出期限と依頼先の入力
      </div>
      <Row style={{ marginBottom: 12 }}>
        {(props.requestType == 'planFomulation'
          ? labelConfig.planFormulationText
          : labelConfig.planMeasureRegistrationText) +
          'の提出期限と依頼先を入力して下さい。【依頼】ボタンをクリックすると、依頼先にメールが送信されます。'}
      </Row>
      <Row style={{ maxHeight: 44 }}>
        <Form.Item
          colon={false}
          labelAlign="left"
          label={<Text style={{ width: '100px' }}>{labelConfig.endDate}</Text>}
        >
          <DatePicker
            name={'until'}
            placeholder={'日付を入力してください'}
            format={dateFormat}
            onChange={(e) => setUntil(e ?? undefined)}
          />
        </Form.Item>
      </Row>
      <Row style={{ marginBottom: '0.5rem' }}>
        <Button
          style={{ width: '160px' }}
          type="default"
          onClick={() => {
            toggleUserSelectWithPositionModalVisible(true)
          }}
        >
          依頼先を設定
        </Button>
        <UserSelectWithPositionModal
          title="依頼先設定"
          visible={userSelectWithPositionModalVisible}
          selectType="checkbox"
          style={{ top: 10 }}
          onSelected={(rows) => {
            const destinations = rows.map<DestinationColumn>((userDepartment) => ({
              key: userDepartment.id,
              assigneeId: userDepartment.userId,
              assigneeName: userDepartment.userName,
              organizationCode: userDepartment.departmentCode,
              organizationName: userDepartment.departmentName,
              positionWeight: userDepartment.positionWeight,
            }))
            destinations &&
              setDestinationData(
                destinations.sort((a, b) =>
                  a.organizationCode &&
                  b.organizationCode &&
                  a.organizationCode < b.organizationCode
                    ? -1
                    : a.organizationCode &&
                      b.organizationCode &&
                      a.organizationCode > b.organizationCode
                    ? 1
                    : a.positionWeight > b.positionWeight
                    ? -1
                    : a.positionWeight < b.positionWeight
                    ? 1
                    : a.assigneeId < b.assigneeId
                    ? -1
                    : 1
                )
              )
          }}
          onOk={() => toggleUserSelectWithPositionModalVisible(false)}
          onCancel={() => toggleUserSelectWithPositionModalVisible(false)}
          defaultValues={destinationData.map((value) => value.key)}
        />
      </Row>
      <Row>
        <Col span={24}>
          <Table
            size="small"
            columns={destinationColumns}
            dataSource={destinationData}
            pagination={{ pageSize: PAGINATION_PAGE_SIZE }}
          />
          <style jsx>{`
            :global(.ant-modal-body
                .ant-pagination.mini.ant-table-pagination.ant-table-pagination-right) {
              margin-top: 10px;
            }
          `}</style>
        </Col>
      </Row>
    </Modal>
  )
}

export default FormulatePlanMeasureRequestModal

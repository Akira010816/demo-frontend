import React, { FC } from 'react'
import moment from 'moment'
import _orderBy from 'lodash.orderby'
import { Col, Row, Typography } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { inactiveChart } from '~/pages/style'
import { approvalStepAssigneeStatuses, dateTimeFormat } from '~/lib/displaySetting'
import { selectApprovalStepAssigneeStatusLabel } from '~/graphhql/selectors/approvalStepAssignee'
import { selectApprovalStepTypeLabel } from '~/graphhql/selectors/selectApprovalStepTypeLabel'

const approvedChart = { ...inactiveChart, backgroundColor: 'lightblue' }
const rejectedChart = { ...inactiveChart, backgroundColor: 'darkorange' }

type ApprovalFlowProps = {
  approvalFlow: ApprovalFlow | undefined
  noBorder?: boolean
}

export const ApprovalFlow: FC<ApprovalFlowProps> = ({ approvalFlow, noBorder }) => {
  return (
    <Col span={24} style={{ border: noBorder ? 'none' : '1px dashed lightgray', padding: '1rem' }}>
      {[...(approvalFlow?.approvalSteps ?? [])]
        .sort(({ order: orderA }, { order: orderB }) => (orderA ?? 0) - (orderB ?? 0))
        .map((step, stepIndex) => (
          <Col
            key={`approval-step-${stepIndex}`}
            style={{ marginTop: stepIndex !== 0 ? '1rem' : 9 }}
          >
            <Col>
              <Typography.Paragraph>
                <Typography.Text>{stepIndex + 1}.</Typography.Text>{' '}
                <Typography.Text>{step.name}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph>
                ({selectApprovalStepTypeLabel(step.type)})
              </Typography.Paragraph>
            </Col>
            <Col span={24}>
              {_orderBy(
                [...(step.approvalStepAssignees ?? [])],
                [
                  (assignee) => assignee.userDepartment?.department.name,
                  (assignee) => assignee.userDepartment?.user.name,
                ],
                ['asc', 'asc']
              ).map((assignee, assigneeIndex) => (
                <Row
                  style={{ width: '100%', flexWrap: 'nowrap' }}
                  align={'middle'}
                  key={`approval-step-assignee-${assigneeIndex}`}
                >
                  <Col
                    span={6}
                    style={{
                      padding: '1rem',
                      borderColor: 'lightgrey',
                      borderStyle: 'solid',
                      borderTopWidth: assigneeIndex === 0 ? '1px' : 0,
                      borderRightWidth: '1px',
                      borderBottomWidth:
                        assigneeIndex === (step.approvalStepAssignees?.length ?? 0) - 1 ? '1px' : 0,
                      borderLeftWidth: '1px',
                    }}
                  >
                    <div
                      style={
                        assignee.approvalStatus === approvalStepAssigneeStatuses.approved.id
                          ? approvedChart
                          : assignee.approvalStatus === approvalStepAssigneeStatuses.rejected.id
                          ? rejectedChart
                          : assignee.approvalStatus === approvalStepAssigneeStatuses.canceled.id
                          ? inactiveChart
                          : inactiveChart
                      }
                    >
                      <Typography.Text
                        style={
                          assignee.approvalStatus === approvalStepAssigneeStatuses.processing.id ||
                          assignee.approvalStatus === approvalStepAssigneeStatuses.canceled.id
                            ? { opacity: 0 }
                            : {}
                        }
                      >
                        {selectApprovalStepAssigneeStatusLabel(assignee.approvalStatus)}
                      </Typography.Text>
                    </div>
                  </Col>
                  <Col offset={1} span={7} style={{ textAlign: 'left' }}>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      <Typography.Text>{assignee.userDepartment?.user?.name}さん </Typography.Text>
                      {assignee.userDepartment?.department?.name ? (
                        <Typography.Text>
                          ({assignee.userDepartment.department.name})
                        </Typography.Text>
                      ) : null}
                    </Typography.Paragraph>
                    {(assignee.approvalStatus === 'approved' ||
                      assignee.approvalStatus === 'rejected') &&
                    assignee.statusChangedAt ? (
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        <Typography.Text>
                          {moment(assignee.statusChangedAt).format(dateTimeFormat)}
                        </Typography.Text>
                      </Typography.Paragraph>
                    ) : null}
                  </Col>
                  {assignee.comment?.length ? (
                    <Col
                      span={9}
                      offset={1}
                      style={{ padding: '1rem', border: '1px solid lightgrey' }}
                    >
                      {assignee.comment}
                    </Col>
                  ) : null}
                </Row>
              ))}
            </Col>

            {stepIndex !== (approvalFlow?.approvalSteps?.length ?? 0) - 1 ? (
              <Row style={{ marginTop: '1rem' }}>
                <Col span={6} style={{ textAlign: 'center' }}>
                  <ArrowDownOutlined style={{ fontSize: '2rem', color: 'lightGray' }} />
                </Col>
              </Row>
            ) : null}
          </Col>
        ))}
    </Col>
  )
}

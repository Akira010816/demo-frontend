import React, { FC, useCallback, useEffect, useState } from 'react'
import {
  Form,
  Divider,
  Col,
  DatePicker,
  Row,
  Input,
  Layout,
  Radio,
  message,
  Typography,
  InputNumber,
} from 'antd'
import Table from '../table'
import moment from 'moment'
import Modal from '../../components/modal/index'
import {
  calculateProjectProgress,
  dateFormat,
  displaySetting,
  projectProgressReportStatusLabels,
  projectStatusLabels,
  replacePlaceholder,
  timestampFormat,
} from '~/lib/displaySetting'
import { ModalFuncProps } from 'antd/lib/modal'
import FormItem from '~/components/form/FormItem'
import { SaveOrCancel } from '~/components/SaveOrCancel'
import Button from '~/components/Button'
import { Project } from '~/graphhql/queries/findAllProjects'
const { TextArea } = Input
import { title } from '~/pages/style'
import dayjs from 'dayjs'
import {
  UPDATE_PROJECT,
  UpdateProjectProgressReportRequestTypes,
} from '~/graphhql/mutations/updateProject'
import { useMutation } from '@apollo/react-hooks'
import { ColumnsType } from 'antd/lib/table'
import { useToggle } from 'react-use'

type ProjectProgressReportColumn = {
  key: number
  targetDate: string
  status: string
  progress: string
  projectStatus: string
  reportedAt: string
}

type ProgressReportModalProps = {
  project?: Project
  tasks?: Array<Task>
} & ModalFuncProps

const ProgressReportModal: FC<ProgressReportModalProps> = ({ project, tasks, ...props }) => {
  const [form] = Form.useForm()
  const [progressReports, setProgressReports] = useState<Array<ProjectProgressReport> | undefined>()
  const [update] = useMutation<Project, UpdateProjectProgressReportRequestTypes>(UPDATE_PROJECT, {
    onCompleted: () => {
      form.resetFields()
      message.success(labelConfig.mutateSuccess)
      props?.onOk && props.onOk()
    },
    onError: (error) => {
      message.error(`${labelConfig.mutateError}
      ${error.message}`)
    },
    refetchQueries: ['findAllProjects'],
    awaitRefetchQueries: true,
  })
  const { labelConfig } = displaySetting.projectProgressReportModal
  const [visibleConfirmModal, toggleVisibleConfirmModal] = useToggle(false)
  const [visibleDeleteConfirmModal, toggleVisibleDeleteConfirmModal] = useToggle(false)
  const [progressStatus, setProgressStatus] = useState<string>()
  const [currentTargetDate, setCurrentTargetDate] = useState<string>()
  const PAGE_ID = 'projectProgressReportModal'

  useEffect(() => {
    setProgressReports(project?.progressReports)
  }, [project])
  const taskLength = tasks?.length || 0

  const onFinish = (values: ProjectProgressReport): void => {
    if (!project?.id) return
    const currentFormReport: Omit<ProjectProgressReport, 'id'> = {
      targetDate: moment(values.targetDate).format(dateFormat),
      status: values.status,
      unit: values.unit,
      delay: values.delay,
      avoidDelayPlan: values.avoidDelayPlan,
      impact: values.impact,
      progress: Number(values.progress),
      reportBody: values.reportBody,
      projectStatus: project.status,
      reportedAt: moment().toString(),
      quality: values.quality,
      cost: values.cost,
      member: values.member,
    }
    let reports = progressReports?.map((report) =>
      moment(report.targetDate).format(dateFormat) ===
      moment(currentFormReport.targetDate).format(dateFormat)
        ? currentFormReport
        : report
    )
    if (
      reports &&
      reports.filter(
        (r) =>
          moment(r.targetDate).format(dateFormat) ===
          moment(currentFormReport.targetDate).format(dateFormat)
      ).length === 0
    ) {
      reports = [...reports, currentFormReport]
    }
    const params: UpdateProjectProgressReportRequestTypes['projectInput'] = {
      id: project.id,
      progressReports: reports,
      version: project.version,
    }
    update({ variables: { projectInput: params } })
  }

  const deleteReport = (targetDate: string) => {
    if (!project?.id) return
    const filteredReports = progressReports?.filter((p) => p.targetDate !== targetDate)
    setProgressReports(filteredReports)
    const params: UpdateProjectProgressReportRequestTypes['projectInput'] = {
      id: project.id,
      version: project.version,
      progressReports: filteredReports,
    }
    update({ variables: { projectInput: params } })
  }

  const checkDuplicate = (): boolean => {
    const currentTargetDate = form.getFieldValue('targetDate')
    const dup = progressReports?.filter(
      (report) =>
        moment(report.targetDate).format(dateFormat) ===
        moment(currentTargetDate).format(dateFormat)
    )?.length
    return dup !== undefined && dup > 0
  }

  const columns: ColumnsType<ProjectProgressReportColumn> = [
    {
      key: 'targetDate',
      title: labelConfig.targetDate,
      dataIndex: 'targetDate',
      sorter: (a, b) => dayjs(a.targetDate).diff(b.targetDate),
      defaultSortOrder: 'descend',
    },
    {
      key: 'status',
      title: labelConfig.status,
      dataIndex: 'status',
    },
    {
      key: 'progress',
      title: labelConfig.progress,
      dataIndex: 'progress',
    },
    {
      key: 'projectStatus',
      title: labelConfig.projectStatus,
      dataIndex: 'projectStatus',
    },
    {
      key: 'reportedAt',
      title: labelConfig.reportedAt,
      dataIndex: 'reportedAt',
    },
  ]

  const calcProjectProgress = () => {
    if (project === undefined) return 0
    switch (project.status) {
      case 'planning':
        return calculateProjectProgress['projectStatus.planning']
      case 'doing':
        if (!tasks?.length) return 0
        return tasks
          ?.map((task) => {
            if (task == undefined) return 0
            switch (task.taskStatus) {
              case 'registered':
                return calculateProjectProgress['projectStatus.doing']['taskStatus.registered']
              case 'planningCounter':
                return calculateProjectProgress['projectStatus.doing']['taskStatus.planningCounter']
              case 'planningMeasure':
                return calculateProjectProgress['projectStatus.doing']['taskStatus.planningMeasure']
              case 'evaluatingMeasure':
                return calculateProjectProgress['projectStatus.doing'][
                  'taskStatus.evaluatingMeasure'
                ]
              case 'fixedMeasure':
                return calculateProjectProgress['projectStatus.doing']['taskStatus.fixedMeasure']
              case 'canceled':
                return 0
            }
          })
          ?.reduce((a, b) => (a || 0) + (b || 0), 0)
      case 'done':
        return calculateProjectProgress['projectStatus.done']
    }
  }
  const calculatedData = (): number => {
    const sum: number = calcProjectProgress() ?? 0
    const canceledData: number = tasks?.filter((task) => task.taskStatus === 'canceled').length ?? 0
    if (project?.status == 'doing') {
      return sum / (taskLength - canceledData)
    } else {
      return sum
    }
  }

  const getData = useCallback(() => {
    return progressReports?.map((progress, index) => ({
      key: index,
      targetDate: dayjs(progress.targetDate).format(dateFormat),
      status: projectProgressReportStatusLabels.filter(
        (label) => label.value === progress.status
      )?.[0]?.text,
      progress: `${progress.progress || 0}%`,
      projectStatus: projectStatusLabels[progress.projectStatus],
      reportedAt: moment(progress.reportedAt).format(timestampFormat),
    }))
  }, [progressReports])

  return (
    <Modal
      title={`${labelConfig.title} ${project?.code} ${project?.name}`}
      {...props}
      width={'75vw'}
      footer={null}
      onCancel={() => {
        form.resetFields()
        props.onCancel && props.onCancel()
      }}
    >
      <Layout style={{ width: '100%', paddingLeft: '2rem' }}>
        <Row>
          <Col span={3}>{labelConfig.history}</Col>
          <Col span={20}>
            <Table
              dataSource={getData()}
              columns={columns}
              pagination={{ pageSize: 3 }}
              onRow={(record) => {
                console.log('record', record)
                return {
                  onClick: () => {
                    const selected = progressReports?.filter(
                      (pr) => dayjs(pr.targetDate).format(dateFormat) === record.targetDate
                    )?.[0]
                    console.log('selected', selected)
                    setProgressStatus(selected?.status)
                    setCurrentTargetDate(selected?.targetDate)
                    form.setFieldsValue({
                      targetDate: moment(selected?.targetDate),
                      status: selected?.status,
                      unit: selected?.unit,
                      delay: selected?.delay,
                      avoidDelayPlan: selected?.avoidDelayPlan,
                      impact: selected?.impact,
                      progress: selected?.progress,
                      reportBody: selected?.reportBody,
                      projectStatus: selected?.status,
                      reportedAt: moment().toString(),
                      quality: selected?.quality,
                      cost: selected?.cost,
                      member: selected?.member,
                    })
                  },
                }
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col offset={3}>
            <p style={{ marginBottom: 0 }}>{labelConfig.notice}</p>
          </Col>
        </Row>
        <Divider />
        <Row style={{ marginBottom: '1rem' }}>
          <Col style={{ width: '95%' }}>
            <div style={title}>{labelConfig.reportBody}</div>
          </Col>
        </Row>
        <Form
          form={form}
          layout="horizontal"
          validateMessages={{ required: '${name}は必須項目です。入力してください。' }}
          onFinish={onFinish}
        >
          <Row>
            <Col span={24}>
              <FormItem pageId={PAGE_ID} itemId={'targetDate'} wrapperCol={{ span: 20 }}>
                <DatePicker
                  name={'targetDate'}
                  placeholder={''}
                  format={dateFormat}
                  onChange={(value) => {
                    form.setFieldsValue({ targetDate: value })
                    setCurrentTargetDate(value?.format(dateFormat))
                  }}
                />
              </FormItem>
            </Col>
          </Row>
          <Row style={{ marginTop: '1rem' }}>
            <Col span={24}>
              <FormItem pageId={PAGE_ID} itemId={'status'} labelCol={{ span: 4 }}>
                <Radio.Group onChange={(e) => setProgressStatus(e.target.value)} name={'status'}>
                  {projectProgressReportStatusLabels.map((label, index) => (
                    <Radio key={index} value={label.value}>
                      {label.text}
                    </Radio>
                  ))}
                </Radio.Group>
              </FormItem>
            </Col>
          </Row>
          {progressStatus === 'delayed' && (
            <Row>
              <Col span={16} offset={4}>
                <div style={{ padding: '1rem', border: 'solid 1px #dfdfdf' }}>
                  <Row>
                    <Col span={24}>
                      <FormItem pageId={PAGE_ID} itemId={'unit'}>
                        <Radio.Group name={'unit'}>
                          <Radio key="unit1" value={'day'}>
                            日数
                          </Radio>
                          <Radio key="unit2" value={'manHour'}>
                            工数
                          </Radio>
                        </Radio.Group>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        pageId={PAGE_ID}
                        itemId={'delay'}
                        wrapperCol={{ span: 24 }}
                        labelCol={{ span: 12 }}
                      >
                        <InputNumber min={0} max={999} size={'middle'} style={{ width: '60px' }} />
                      </FormItem>
                    </Col>
                    <Col style={{ lineHeight: '2rem', marginLeft: '-2rem' }}> 日(or人月)</Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <FormItem pageId={PAGE_ID} itemId={'avoidDelayPlan'}>
                        <Input.TextArea autoSize={{ minRows: 4 }} />
                      </FormItem>
                    </Col>
                    <Col span={24}>
                      <FormItem pageId={PAGE_ID} itemId={'impact'}>
                        <Input.TextArea autoSize={{ minRows: 4 }} />
                      </FormItem>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          )}

          <Row style={{ marginTop: '1rem' }}>
            <Col span={12}>
              <FormItem
                pageId={PAGE_ID}
                itemId={'progress'}
                wrapperCol={{ span: 24 }}
                labelCol={{ span: 8 }}
              >
                <InputNumber min={0} max={100} size={'middle'} style={{ width: '60px' }} />
              </FormItem>
            </Col>
            <Col style={{ lineHeight: '2rem', marginLeft: '-13rem' }}>%</Col>
          </Row>
          <Row>
            <Col span={8} offset={4}>
              {labelConfig.calculatedProgress}
            </Col>
            <Col span={2}>
              <Input
                disabled
                value={Math.floor(calculatedData() || 0)}
                size={'small'}
                style={{ width: '50px' }}
              />
            </Col>
            <Col>%</Col>
          </Row>
          <Row style={{ marginTop: '1rem' }}>
            <Col span={24}>
              <FormItem pageId={PAGE_ID} itemId={'reportBody'}>
                <TextArea autoSize={{ minRows: 4 }} />
              </FormItem>
            </Col>
          </Row>
          <Row>{labelConfig.escalationItem}</Row>
          <Row>
            <Col span={24}>
              <FormItem pageId={PAGE_ID} itemId={'quality'}>
                <Input.TextArea autoSize={{ minRows: 4 }} />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem pageId={PAGE_ID} itemId={'cost'}>
                <Input.TextArea autoSize={{ minRows: 4 }} />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem pageId={PAGE_ID} itemId={'member'}>
                <Input.TextArea autoSize={{ minRows: 4 }} />
              </FormItem>
            </Col>
          </Row>
          <Divider style={{ marginBottom: '3rem' }} />
          <SaveOrCancel
            onSave={() => (checkDuplicate() ? toggleVisibleConfirmModal() : form.submit())}
            onCancel={() => {
              form.resetFields()
              props.onCancel && props.onCancel()
            }}
          >
            {checkDuplicate() && dayjs(currentTargetDate).diff(dayjs()) > 0 && (
              <Button
                danger
                type={'primary'}
                style={{ marginLeft: '3rem' }}
                onClick={toggleVisibleDeleteConfirmModal}
              >
                {labelConfig.deleteButton}
              </Button>
            )}
          </SaveOrCancel>
        </Form>
        <Modal.Confirm
          visible={visibleConfirmModal}
          onOk={() => {
            form.submit()
            toggleVisibleConfirmModal()
          }}
          onCancel={toggleVisibleConfirmModal}
        >
          <Typography.Paragraph>{labelConfig.confirmMessage}</Typography.Paragraph>
        </Modal.Confirm>
        <Modal.Confirm
          visible={visibleDeleteConfirmModal}
          onOk={() => {
            currentTargetDate && deleteReport(currentTargetDate)
            toggleVisibleDeleteConfirmModal()
          }}
          onCancel={toggleVisibleDeleteConfirmModal}
        >
          <Typography.Paragraph>
            {replacePlaceholder(labelConfig.deleteConfirmMessage, currentTargetDate || '')}
          </Typography.Paragraph>
        </Modal.Confirm>
      </Layout>
    </Modal>
  )
}

export default ProgressReportModal

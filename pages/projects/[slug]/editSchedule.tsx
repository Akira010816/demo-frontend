import MainLayout, { PageTitleContext } from '../../../layouts/main'
import React, { FC, useState } from 'react'
import { useRouter } from 'next/router'
import { Layout, Row, Col, Input, Form, Divider, Tag, DatePicker, message } from 'antd'
import Button from '../../../components/Button'
import { title } from '../../style'
import FormItem from '../../../components/form/FormItem'
import { Project } from '../../../graphhql/queries/findAllProjects'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { FIND_PROJECT_BY_ID } from '../../../graphhql/queries/findProjectById'
import {
  UPDATE_PROJECT,
  UpdateProjectScheduleRequestTypes,
} from '../../../graphhql/mutations/updateProject'
import MilestoneForm from '../../../components/milestone/form'
import { dateFormat, displaySetting } from '../../../lib/displaySetting'
import moment from 'moment'
import { internalDateFormat } from '../../../lib/date'

const PAGE_ID = 'projectUpdateScheduleInfo'

const { RangePicker } = DatePicker

const ProjectEditForm: FC = () => {
  const router = useRouter()
  const [form] = Form.useForm()
  const { slug } = router.query
  const [projectVersion, setProjectVersion] = useState<number>()
  const [update] = useMutation<Project, UpdateProjectScheduleRequestTypes>(UPDATE_PROJECT, {
    onCompleted: () => {
      message.success(displaySetting[PAGE_ID].labelConfig.updateSuccess)
      router.back()
    },
    onError: (error) => {
      message.error(`${displaySetting[PAGE_ID].labelConfig.updateError}
      ${error.message}`)
    },
  })
  const [otherMilestones, setOtherMilestones] = useState<Milestone[]>([])

  useQuery(FIND_PROJECT_BY_ID, {
    variables: { id: Number(slug) },
    skip: !slug,
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      const project = data.findProjectById
      if (!project) {
        return
      }
      let endDateMilestone // 施策実施完了の期限
      let decisionDueDateMilestone // 施策決定の期限
      const otherMilestones: Milestone[] = [] // その他の重要なマイルストーン
      project.milestones?.forEach((milestone: Milestone) => {
        const targetDate = milestone.targetDate
          ? moment(milestone.targetDate, internalDateFormat)
          : null
        if (milestone.type == 'projectEndDate') {
          endDateMilestone = targetDate
        } else if (milestone.type == 'decisionDueDate') {
          decisionDueDateMilestone = targetDate
        } else if (milestone.type == 'others') {
          otherMilestones.push({
            id: milestone.id,
            type: milestone.type,
            description: milestone.description,
            targetDate: milestone.targetDate,
          })
        }
      })
      setOtherMilestones(otherMilestones)
      setProjectVersion(project.version)

      let planningDate
      let problemAnalysisDate
      let measuresDate
      let policyPlanningDate
      let policyDecisionDate
      project.schedules?.forEach((schedule: Schedule) => {
        const date = [
          moment(schedule.startDate, internalDateFormat),
          moment(schedule.endDate, internalDateFormat),
        ]
        if (schedule.type == 'planning') {
          planningDate = date
        } else if (schedule.type == 'problemAnalysis') {
          problemAnalysisDate = date
        } else if (schedule.type == 'measures') {
          measuresDate = date
        } else if (schedule.type == 'policyPlanning') {
          policyPlanningDate = date
        } else if (schedule.type == 'policyDecision') {
          policyDecisionDate = date
        }
      })

      form.setFieldsValue({
        endDateMilestone,
        decisionDueDateMilestone,
        startDate: project.startDate ? moment(project.startDate, internalDateFormat) : null,
        planningDate,
        problemAnalysisDate,
        measuresDate,
        policyPlanningDate,
        policyDecisionDate,
      })
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (values: any): void => {
    const milestones: Array<Omit<Milestone, 'id'>> = [
      {
        type: 'projectEndDate',
        targetDate: values.endDateMilestone?.format(internalDateFormat),
        description: '施策実施完了の期限',
      },
      {
        type: 'decisionDueDate',
        targetDate: values.decisionDueDateMilestone?.format(internalDateFormat),
        description: '施策決定の期限',
      },
      ...values.otherMilestones,
    ]

    const schedules: Array<Omit<Schedule, 'id'>> = []
    if (values.planningDate) {
      schedules.push({
        type: 'planning',
        startDate: values.planningDate[0]?.format(internalDateFormat),
        endDate: values.planningDate[1]?.format(internalDateFormat),
      })
    }
    if (values.problemAnalysisDate) {
      schedules.push({
        type: 'problemAnalysis',
        startDate: values.problemAnalysisDate[0]?.format(internalDateFormat),
        endDate: values.problemAnalysisDate[1]?.format(internalDateFormat),
      })
    }
    if (values.measuresDate) {
      schedules.push({
        type: 'measures',
        startDate: values.measuresDate[0]?.format(internalDateFormat),
        endDate: values.measuresDate[1]?.format(internalDateFormat),
      })
    }
    if (values.policyPlanningDate) {
      schedules.push({
        type: 'policyPlanning',
        startDate: values.policyPlanningDate[0]?.format(internalDateFormat),
        endDate: values.policyPlanningDate[1]?.format(internalDateFormat),
      })
    }
    if (values.policyDecisionDate) {
      schedules.push({
        type: 'policyDecision',
        startDate: values.policyDecisionDate[0]?.format(internalDateFormat),
        endDate: values.policyDecisionDate[1]?.format(internalDateFormat),
      })
    }

    const params: UpdateProjectScheduleRequestTypes['projectInput'] = {
      id: Number(slug),
      milestones: milestones,
      startDate: values.startDate ? values.startDate.format(internalDateFormat) : null,
      schedules: schedules,
      version: projectVersion || 0,
    }
    update({ variables: { projectInput: params } })
  }

  return (
    <PageTitleContext.Provider value={displaySetting[PAGE_ID]?.labelConfig.pageTitle}>
      <MainLayout>
        <Layout style={{ paddingLeft: '2rem' }}>
          <Row>
            <Col offset={20} span={2}>
              <Button type={'primary'} onClick={() => router.push(`/projects/${slug}`)}>
                企画へ戻る
              </Button>
            </Col>
          </Row>
          <Form
            form={form}
            layout="horizontal"
            validateMessages={{ required: '${name}は必須項目です。入力してください。' }}
            onFinish={onFinish}
          >
            <Row>
              <Col style={{ width: '95%' }}>
                <div style={title}>マイルストーン</div>
              </Col>
            </Row>
            <Row style={{ marginBottom: '1rem' }}>
              {displaySetting[PAGE_ID]?.inputConfig?.endDateMilestone.require && (
                <Tag color={'red'}>必須</Tag>
              )}
              {displaySetting[PAGE_ID]?.labelConfig.endDateMilestoneDescription}
            </Row>
            <Row>
              <Col span={4}>
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'endDateMilestone'}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <DatePicker
                    name={'endDateMilestone'}
                    placeholder={'日付を入力してください'}
                    format={dateFormat}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Input size="middle" disabled value={'施策実施完了の期限'} />
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ marginBottom: '1rem' }}>
              {displaySetting[PAGE_ID]?.inputConfig?.decisionDueDateMilestone.require && (
                <Tag color={'red'}>必須</Tag>
              )}
              {displaySetting[PAGE_ID]?.labelConfig.decisionDueDateMilestoneDescription}
            </Row>
            <Row>
              <Col span={4}>
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'decisionDueDateMilestone'}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <DatePicker
                    name={'decisionDueDateMilestone'}
                    placeholder={'日付を入力してください'}
                    format={dateFormat}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Input size="middle" disabled value={'施策決定の期限'} />
                </Form.Item>
              </Col>
            </Row>
            <MilestoneForm
              data={otherMilestones}
              onChange={(values) =>
                form.setFieldsValue({
                  otherMilestones: values?.map((value) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...rest } = value
                    return rest
                  }),
                })
              }
            />
            <Row>
              <Col style={{ width: '95%' }}>
                <div style={title}>スケジュール</div>
              </Col>
            </Row>
            <Row style={{ marginBottom: '1rem' }}>
              {displaySetting[PAGE_ID]?.labelConfig.scheduleDescription}
            </Row>
            <FormItem pageId={PAGE_ID} itemId={'startDate'} wrapperCol={{ span: 20 }}>
              <DatePicker
                name={'startDate'}
                placeholder={'日付を入力してください'}
                format={dateFormat}
              />
            </FormItem>
            <FormItem pageId={PAGE_ID} itemId={'planningDate'} wrapperCol={{ span: 20 }}>
              <RangePicker name={'planningDate'} format={dateFormat} />
            </FormItem>
            <FormItem pageId={PAGE_ID} itemId={'problemAnalysisDate'} wrapperCol={{ span: 20 }}>
              <RangePicker name={'problemAnalysisDate'} format={dateFormat} />
            </FormItem>
            <FormItem pageId={PAGE_ID} itemId={'measuresDate'} wrapperCol={{ span: 20 }}>
              <RangePicker name={'measuresDate'} format={dateFormat} />
            </FormItem>
            <FormItem pageId={PAGE_ID} itemId={'policyPlanningDate'} wrapperCol={{ span: 20 }}>
              <RangePicker name={'policyPlanningDate'} format={dateFormat} />
            </FormItem>
            <FormItem pageId={PAGE_ID} itemId={'policyDecisionDate'} wrapperCol={{ span: 20 }}>
              <RangePicker name={'policyDecisionDate'} format={dateFormat} />
            </FormItem>
            <Divider />
            <Row justify={'center'}>
              <Button style={{ width: '200px' }} type={'primary'} htmlType={'submit'}>
                保存
              </Button>
              <Button
                style={{ width: '200px', marginLeft: '8px' }}
                type={'ghost'}
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
            </Row>
          </Form>
        </Layout>
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default ProjectEditForm

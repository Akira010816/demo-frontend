import { FC, useEffect, useState } from 'react'
import { Col, DatePicker, Form, Layout, Row, Select, Typography } from 'antd'
import { FormInstance } from 'antd/es/form'
import { H1 } from '~/components/Heading/H1'
import { dateFormat, displaySetting } from '~/lib/displaySetting'
import moment, { Moment } from 'moment'
import { commonButton } from '~/pages/style'
import Button from '~/components/Button'
import { GanttData, GanttLink, GanttProps } from '~/components/gantt/gantt'
import dynamic from 'next/dynamic'
import { getRandomString } from '~/lib/randomString'
const Gantt = dynamic(
  () => {
    return import('../../components/gantt')
  },
  { ssr: false }
)

export type ScheduleFormProps = {
  form: FormInstance
  measureImplementationTasks: Array<MeasureImplementationTask>
  links: GanttLink[]
  onChange: ({
    measureImplementationTasks,
    links,
  }: {
    measureImplementationTasks: Array<MeasureImplementationTask>
    links: Array<GanttLink>
  }) => Promise<void> | void
}

const PAGE_ID = 'measureScheduleForm'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const DATE_PERIODS = {
  oneMonth: '1ヶ月',
  twoMonths: '2ヶ月',
  threeMonths: '3ヶ月',
  fourMonths: '4ヶ月',
  fiveMonths: '5ヶ月',
  sixMonths: '6ヶ月',
  sevenMonths: '7ヶ月',
  eightMonths: '8ヶ月',
  nineMonths: '9ヶ月',
  tenMonths: '10ヶ月',
  elevenMonths: '11ヶ月',
  oneYear: '12ヶ月',
  twoYears: '2年',
  threeYears: '3年',
  fourYears: '4年',
  fiveYears: '5年',
} as const

const PERIOD_VALUES = {
  oneMonth: 1,
  twoMonths: 2,
  threeMonths: 3,
  fourMonths: 4,
  fiveMonths: 5,
  sixMonths: 6,
  sevenMonths: 7,
  eightMonths: 8,
  nineMonths: 9,
  tenMonths: 10,
  elevenMonths: 11,
  oneYear: 12,
  twoYears: 24,
  threeYears: 36,
  fourYears: 48,
  fiveYears: 60,
} as const

const DATE_UNITS = {
  month: '月',
  week: '週',
  day: '日',
} as const

export const ScheduleForm: FC<ScheduleFormProps> = (props) => {
  const currentDate = (): Date => {
    const current = new Date()
    current.setHours(0, 0, 0, 0)
    return current
  }
  // ガントに表示するデータ
  const ganttData: GanttData = {
    tasks: props.measureImplementationTasks.map((measureImplementationTask) => ({
      id: measureImplementationTask.ganttId || getRandomString(),
      text: measureImplementationTask.name ?? '',
      start_date:
        moment(measureImplementationTask.startAt ?? currentDate(), dateFormat).toDate() ??
        currentDate(),
      end_date:
        moment(measureImplementationTask.endAt ?? currentDate(), dateFormat).toDate() ??
        currentDate(),
      duration: 30,
    })),
    links: props.links,
  }

  const [since, setSince] = useState<Moment>(moment())
  const [dateUnit, setDateUnit] = useState<keyof typeof DATE_UNITS>('month')
  const [period, setPeriod] = useState<keyof typeof DATE_PERIODS>('oneYear')

  useEffect(() => {
    switch (dateUnit) {
      case 'month':
        setPeriod('oneYear')
        break
      case 'week':
      case 'day':
        setPeriod('oneMonth')
        break
    }
  }, [dateUnit])

  const onAfterTaskUpdate: GanttProps['onAfterTaskUpdate'] = (id, task, links) => {
    props.onChange({
      measureImplementationTasks: props.measureImplementationTasks.map(
        (measureImplementationTask) =>
          id === measureImplementationTask.ganttId
            ? {
                ...(measureImplementationTask ?? {}),
                startAt: moment(task.start_date, dateFormat).toDate(),
                endAt: moment(task.end_date, dateFormat).toDate(),
              }
            : measureImplementationTask
      ),
      links: links,
    })
  }

  const onAfterLinkUpdate: GanttProps['onAfterLinkUpdate'] = (links) => {
    props.onChange({
      measureImplementationTasks: props.measureImplementationTasks,
      links: links,
    })
  }

  return (
    <Layout>
      <Layout.Content style={{ padding: '2rem', paddingTop: '1rem' }}>
        <Col>
          <H1 title={labelConfig.title} />
          <Col>
            <Form.Item
              label={'表示開始日'}
              initialValue={moment()}
              labelCol={{ span: 2 }}
              labelAlign={'left'}
            >
              <DatePicker
                defaultPickerValue={moment()}
                onChange={(e) => setSince(e ?? moment())}
                value={since}
                format={dateFormat}
              />
              <Button
                type={'primary'}
                className={commonButton}
                style={{ marginLeft: '7px' }}
                onClick={() => {
                  if (since) {
                    setSince(moment(since.toDate()))
                  }
                }}
              >
                表示
              </Button>
              <Button
                type={'primary'}
                className={commonButton}
                style={{ marginLeft: '7px' }}
                onClick={() => setSince(moment(new Date()))}
              >
                今日
              </Button>
            </Form.Item>
          </Col>

          <Row>
            <Col span={3}>日付単位</Col>
            <Col span={6}>表示期間</Col>
          </Row>
          <Row>
            <Col span={3}>
              <Form.Item
                label={''}
                initialValue={dateUnit}
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 12 }}
                labelAlign={'left'}
              >
                <Select value={dateUnit} onChange={(e) => setDateUnit(e)}>
                  {Object.entries(DATE_UNITS).map(([key, value]) => (
                    <Select.Option key={`measure-schedule-period-option-${key}`} value={key}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={''}
                initialValue={period}
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 12 }}
                labelAlign={'left'}
              >
                <Select value={period} onChange={(e) => setPeriod(e)}>
                  {Object.entries(DATE_PERIODS).map(([key, value]) => (
                    <Select.Option key={`measure-schedule-period-option-${key}`} value={key}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Col>

        <Col>
          <Typography.Paragraph>
            {labelConfig.measureImplementationTaskScheduleDescription}
          </Typography.Paragraph>
        </Col>
        <div className="gantt-container" style={{ marginTop: '1rem' }}>
          {ganttData.tasks.length > 0 && (
            <Gantt
              data={ganttData}
              showTooltip={false}
              dateUnitType={dateUnit}
              dateTermMonth={PERIOD_VALUES[period]}
              firstMonth={4}
              startDate={since.toDate()}
              inlineEditing={true}
              onAfterTaskUpdate={onAfterTaskUpdate}
              onAfterLinkUpdate={onAfterLinkUpdate}
              gridWidth={530}
              editSchedule={true}
              columns={[
                {
                  name: 'text',
                  label: '実施タスク',
                  tree: true,
                  width: 250,
                },
                {
                  name: 'start_date',
                  label: '開始日',
                  tree: true,
                  width: 150,
                  resize: true,
                  editor: {
                    type: 'date',
                    map_to: 'start_date',
                  },
                },
                {
                  name: 'end_date',
                  label: '終了日',
                  tree: true,
                  width: 150,
                  resize: true,
                  editor: {
                    type: 'date',
                    map_to: 'end_date',
                  },
                },
              ]}
            />
          )}
        </div>
      </Layout.Content>
    </Layout>
  )
}

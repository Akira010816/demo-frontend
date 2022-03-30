import React, { ChangeEvent, FC, useEffect, useMemo } from 'react'
import debounce from 'lodash.debounce'
import update from 'immutability-helper'
import moment from 'moment'
import {
  Checkbox,
  Col,
  ConfigProvider,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Layout,
  Row,
  Select,
  Typography,
} from 'antd'
import { FormInstance } from 'antd/es/form'
import Table from '../table'
import { ColumnsType } from 'antd/es/table'
import FormItem from '~/components/form/FormItem'
import { H1 } from '~/components/Heading/H1'
import { costUnitLabels, dateFormat, displaySetting } from '~/lib/displaySetting'

export type measureImplementationEffectFormProps = {
  form: FormInstance
  measureImplementationEffects: Array<MeasureImplementationEffect>
  measureCauseConditions: Array<CauseCondition>
  causeConditions: Array<CauseCondition>
  onChange: ({
    measureImplementationEffects,
    measureCauseConditions,
    costUnit,
  }: {
    measureImplementationEffects?: Array<MeasureImplementationEffect>
    measureCauseConditions?: Array<CauseCondition>
    costUnit?: Measure['costUnit']
  }) => Promise<void> | void
  costUnit?: string
}

const PAGE_ID = 'measureImplementationEffectForm'
const labelConfig = displaySetting[PAGE_ID].labelConfig
const defaultMeasureImplementationEffect: MeasureImplementationEffect = {
  id: 0,
  evaluation: '',
  valueBeforeImprovement: '',
  valueAfterImprovement: '',
  calculationBasis: '',
  startAt: undefined,
  startAtMemo: '',
  measuringMethod: '',
  annualCostEffect: 0,
}

const inputStyle = {
  normal: {
    minWidth: '150px',
    marginBottom: 0,
    height: '80px',
  },
  half: {
    minWidth: '150px',
    marginBottom: 0,
    height: '40px',
  },
  formItem: {
    marginBottom: 0,
  },
  numberItem: {
    minWidth: '150px',
    marginBottom: 0,
    height: '40px',
    overflow: 'hidden',
  },
}

const autoSize = {
  minRows: 3,
  maxRows: 10,
}

const MeasureImplementationEffectForm: FC<measureImplementationEffectFormProps> = (props) => {
  const measureImplementationEffects = useMemo(
    () =>
      props.measureImplementationEffects.length
        ? props.measureImplementationEffects
        : [defaultMeasureImplementationEffect],
    [props.measureImplementationEffects]
  )

  useEffect(() => {
    props.form.setFieldsValue({
      measureImplementationEffects: measureImplementationEffects.map((effect) => ({
        ...effect,
        startAt: effect.startAt ? moment(effect.startAt, dateFormat) : null,
      })),
      causeConditions: props.measureCauseConditions.map((causeCondition) => causeCondition.id),
      costUnit: props.costUnit || costUnitLabels[0],
    })
  }, [measureImplementationEffects, props.costUnit, props.form, props.measureCauseConditions])

  const measureCauseConditionIds = useMemo(
    () => props.measureCauseConditions.map((causeCondition) => causeCondition.id),
    [props.measureCauseConditions]
  )

  const finalMeasureCauseConditions = useMemo(
    () =>
      props.causeConditions.filter((causeCondition) =>
        measureCauseConditionIds.includes(causeCondition.id)
      ),
    [measureCauseConditionIds, props.causeConditions]
  )
  const columns: ColumnsType<MeasureImplementationEffect> = useMemo(
    () => [
      {
        title: <Typography.Text ellipsis={true}>No.</Typography.Text>,
        key: 'No',
        dataIndex: 'labelNumber',
        render: (_, __, index) => ({
          children: <Form style={inputStyle.formItem}>{index + 1}</Form>,
        }),
      },
      {
        title: <Typography.Text ellipsis={true}>{labelConfig.evaluation}</Typography.Text>,
        key: 'evaluation',
        dataIndex: 'evaluation',
        render: (evaluation: any, column: any, index: string | number) => ({
          children: (
            <FormItem
              pageId={PAGE_ID}
              name={['measureImplementationEffects', index, 'evaluation']}
              itemId={'evaluation'}
              label=""
              initialValue={evaluation}
              key={`column-evaluation-${index}`}
              style={inputStyle.formItem}
            >
              <Input.TextArea
                autoSize={autoSize}
                style={inputStyle.normal}
                onChange={debounce(
                  (e: ChangeEvent<HTMLTextAreaElement>) =>
                    props.onChange({
                      measureImplementationEffects: update(measureImplementationEffects, {
                        [index]: { evaluation: { $set: e.target.value } },
                      }),
                      measureCauseConditions: finalMeasureCauseConditions,
                    }),
                  500
                )}
              />
            </FormItem>
          ),
        }),
      },
      {
        title: (
          <Typography.Text ellipsis={true}>{labelConfig.valueBeforeImprovement}</Typography.Text>
        ),
        key: 'valueBeforeImprovement',
        dataIndex: 'valueBeforeImprovement',
        render: (valueBeforeImprovement, column, index) => ({
          children: (
            <FormItem
              pageId={PAGE_ID}
              name={['measureImplementationEffects', index, 'valueBeforeImprovement']}
              itemId={'valueBeforeImprovement'}
              initialValue={valueBeforeImprovement}
              label=""
              key={`column-value-before-improvement-${index}`}
              style={inputStyle.formItem}
            >
              <Input.TextArea
                autoSize={autoSize}
                style={inputStyle.normal}
                onChange={debounce(
                  (e: ChangeEvent<HTMLTextAreaElement>) =>
                    props.onChange({
                      measureImplementationEffects: update(measureImplementationEffects, {
                        [index]: { valueBeforeImprovement: { $set: e.target.value } },
                      }),
                      measureCauseConditions: finalMeasureCauseConditions,
                    }),
                  500
                )}
              />
            </FormItem>
          ),
        }),
      },
      {
        title: (
          <Typography.Text ellipsis={true}>{labelConfig.valueAfterImprovement}</Typography.Text>
        ),
        key: 'valueAfterImprovement',
        dataIndex: 'valueAfterImprovement',
        render: (valueAfterImprovement, column, index) => ({
          children: (
            <FormItem
              pageId={PAGE_ID}
              name={['measureImplementationEffects', index, 'valueAfterImprovement']}
              itemId={'valueAfterImprovement'}
              initialValue={valueAfterImprovement}
              label=""
              key={`column-value-after-improvement-${index}`}
              style={inputStyle.formItem}
            >
              <Input.TextArea
                autoSize={autoSize}
                style={inputStyle.normal}
                onChange={debounce(
                  (e: ChangeEvent<HTMLTextAreaElement>) =>
                    props.onChange({
                      measureImplementationEffects: update(measureImplementationEffects, {
                        [index]: { valueAfterImprovement: { $set: e.target.value } },
                      }),
                      measureCauseConditions: finalMeasureCauseConditions,
                    }),
                  500
                )}
              />
            </FormItem>
          ),
        }),
      },
      {
        title: <Typography.Text ellipsis={true}>{labelConfig.calculationBasis}</Typography.Text>,
        key: 'calculationBasis',
        dataIndex: 'calculationBasis',
        render: (calculationBasis, column, index) => ({
          children: (
            <FormItem
              pageId={PAGE_ID}
              name={['measureImplementationEffects', index, 'calculationBasis']}
              itemId={'calculationBasis'}
              initialValue={calculationBasis}
              label=""
              key={`column-calculation-basis-${index}`}
              style={inputStyle.formItem}
            >
              <Input.TextArea
                autoSize={autoSize}
                style={inputStyle.normal}
                onChange={debounce(
                  (e: ChangeEvent<HTMLTextAreaElement>) =>
                    props.onChange({
                      measureImplementationEffects: update(measureImplementationEffects, {
                        [index]: { calculationBasis: { $set: e.target.value } },
                      }),
                      measureCauseConditions: finalMeasureCauseConditions,
                    }),
                  500
                )}
              />
            </FormItem>
          ),
        }),
      },
      {
        title: <Typography.Text ellipsis={true}>{labelConfig.startAt}</Typography.Text>,
        key: 'startAt',
        dataIndex: 'startAt',
        render: (startAt, column, index) => ({
          children: (
            <Col key={`column-startAt-${index}`}>
              <Col>
                <FormItem
                  pageId={PAGE_ID}
                  name={['measureImplementationEffects', index, 'startAt']}
                  itemId={'startAt'}
                  initialValue={moment(startAt ?? new Date(), dateFormat)}
                  label=""
                  style={{ ...inputStyle.formItem, marginBottom: '4px' }}
                >
                  <DatePicker
                    style={inputStyle.half}
                    name="startAt"
                    placeholder={'日付を選択'}
                    value={moment(startAt ?? new Date(), dateFormat)}
                    format={dateFormat}
                    onChange={(e) =>
                      e &&
                      props.onChange({
                        measureImplementationEffects: update(measureImplementationEffects, {
                          [index]: { startAt: { $set: moment(e).toDate() } },
                        }),
                        measureCauseConditions: finalMeasureCauseConditions,
                      })
                    }
                  />
                </FormItem>
              </Col>
              <Col>
                <FormItem
                  pageId={PAGE_ID}
                  name={['measureImplementationEffects', index, 'startAtMemo']}
                  itemId={'startAtMemo'}
                  initialValue={column.startAtMemo}
                  label=""
                  style={inputStyle.formItem}
                >
                  <Input.TextArea
                    autoSize={{ ...autoSize, minRows: 1 }}
                    style={inputStyle.half}
                    onChange={debounce(
                      (e: ChangeEvent<HTMLTextAreaElement>) =>
                        props.onChange({
                          measureImplementationEffects: update(measureImplementationEffects, {
                            [index]: { startAtMemo: { $set: e.target.value } },
                          }),
                          measureCauseConditions: finalMeasureCauseConditions,
                        }),
                      500
                    )}
                  />
                </FormItem>
              </Col>
            </Col>
          ),
        }),
      },
      {
        title: <Typography.Text ellipsis={true}>{labelConfig.measuringMethod}</Typography.Text>,
        key: 'measuringMethod',
        dataIndex: 'measuringMethod',
        render: (measuringMethod, column, index) => ({
          children: (
            <FormItem
              pageId={PAGE_ID}
              name={['measureImplementationEffects', index, 'measuringMethod']}
              itemId={'measuringMethod'}
              initialValue={measuringMethod}
              label=""
              key={`column-measuring-method-${index}`}
              style={inputStyle.formItem}
            >
              <Input.TextArea
                autoSize={autoSize}
                style={inputStyle.normal}
                onChange={debounce(
                  (e: ChangeEvent<HTMLTextAreaElement>) =>
                    props.onChange({
                      measureImplementationEffects: update(measureImplementationEffects, {
                        [index]: { measuringMethod: { $set: e.target.value } },
                      }),
                      measureCauseConditions: finalMeasureCauseConditions,
                    }),
                  500
                )}
              />
            </FormItem>
          ),
        }),
      },
      {
        title: <Typography.Text ellipsis={true}>{labelConfig.annualCostEffect}</Typography.Text>,
        key: 'annualCostEffect',
        dataIndex: 'annualCostEffect',
        render: (annualCostEffect, column, index) => ({
          children: (
            <ConfigProvider direction="rtl">
              <FormItem
                pageId={PAGE_ID}
                name={['measureImplementationEffects', index, 'annualCostEffect']}
                itemId={'annualCostEffect'}
                initialValue={annualCostEffect}
                label=""
                key={`column-annual-cost-effect-${index}`}
                style={inputStyle.numberItem}
              >
                <InputNumber
                  style={inputStyle.numberItem}
                  // P2FW-443
                  maxLength={25}
                  formatter={(value) =>
                    `${value}`.replace(/\./g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => `${value}`.replace(/\./g, '').replace(/,/g, '')}
                  onChange={debounce(
                    (value) =>
                      props.onChange({
                        measureImplementationEffects: update(measureImplementationEffects, {
                          [index]: {
                            annualCostEffect: {
                              $set: value,
                            },
                          },
                        }),
                        measureCauseConditions: finalMeasureCauseConditions,
                      }),
                    500
                  )}
                />
              </FormItem>
            </ConfigProvider>
          ),
        }),
      },
    ],
    [finalMeasureCauseConditions, measureImplementationEffects, props]
  )

  return (
    <Layout>
      <Layout.Content style={{ padding: '2rem', paddingTop: '1rem' }}>
        {props.causeConditions?.length ? (
          <Col>
            <H1 title={labelConfig.causeConditionTitle} />
            <Typography.Paragraph>{labelConfig.causeConditionSubTitle}</Typography.Paragraph>
            <Col>
              <FormItem
                pageId={''}
                itemId={''}
                name={'causeConditions'}
                initialValue={measureCauseConditionIds}
              >
                <Checkbox.Group
                  style={{ display: 'flex', flexDirection: 'column' }}
                  onChange={(checkedCauseConditions) => {
                    props.onChange({
                      measureImplementationEffects: props.measureImplementationEffects,
                      measureCauseConditions: props.causeConditions.filter((condition) =>
                        checkedCauseConditions.includes(condition.id)
                      ),
                    })
                  }}
                  options={props.causeConditions.map((condition) => ({
                    label: condition.achievementCondition,
                    value: condition.id,
                  }))}
                />
              </FormItem>
            </Col>
          </Col>
        ) : null}

        <Col>
          <H1 title={labelConfig.effectTitle} />
          <Typography.Paragraph>{labelConfig.effectSubTitle}</Typography.Paragraph>
          <Row>
            <Col span={24}>
              <FormItem
                pageId={PAGE_ID}
                itemId={'costUnit'}
                initialValue={props.costUnit || costUnitLabels[0]}
                labelCol={{ span: 2 }}
                wrapperCol={{ span: 2 }}
              >
                <Select
                  size="middle"
                  key={'costUnit'}
                  onChange={(value) =>
                    props.onChange({
                      costUnit: (value && value.toString()) || undefined,
                    })
                  }
                >
                  {costUnitLabels.map((value) => (
                    <Select.Option value={value} key={value}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>

          <div className={'measure-effect-table'}>
            <Row style={{ overflow: 'scroll', flexFlow: 'row' }}>
              <Table
                size={'small'}
                columns={columns}
                dataSource={measureImplementationEffects}
                pagination={false}
                rowKey={'id'}
                style={{ overflow: 'scroll', marginRight: '20px' }}
                addable={true}
                onAddRow={() => {
                  props.onChange({
                    measureImplementationEffects: [
                      ...measureImplementationEffects,
                      {
                        ...defaultMeasureImplementationEffect,
                        id:
                          props.measureImplementationEffects
                            .map((effect) => effect.id ?? 0)
                            .reduce((a, b) => Math.max(a, b), 0) + 1,
                      },
                    ],
                    measureCauseConditions: finalMeasureCauseConditions,
                  })
                }}
                onDeleteRow={(_, index) => {
                  props.onChange({
                    measureImplementationEffects: measureImplementationEffects.filter(
                      (effect, effectIndex) => index !== effectIndex
                    ),
                    measureCauseConditions: finalMeasureCauseConditions,
                  })
                }}
              />
            </Row>
          </div>
        </Col>

        <Divider />

        <Col>
          <Typography.Paragraph>
            年間金額効果:{' '}
            {props.measureImplementationEffects
              .map((effect) => effect.annualCostEffect ?? 0)
              .reduce((a, b) => a + b, 0)
              .toLocaleString()}
            {props.costUnit || costUnitLabels[0]}
          </Typography.Paragraph>
        </Col>
      </Layout.Content>
    </Layout>
  )
}
export default MeasureImplementationEffectForm

import { Col, Input, Layout, Radio, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import FormItem from '../form/FormItem'
import Form, { FormInstance } from 'antd/lib/form'
import { style } from 'typestyle'
import { PlanMeasureClassificationType, PlanMeasureClassificationTypes } from '~/lib/displaySetting'
import _ from 'lodash'
import { useRouter } from 'next/router'

export type summaryFormProps = {
  setRiskRequired?: (state: boolean) => void
  setUnsaved: (state: boolean) => void
  setShouldRefreshData: (state: boolean) => void
  name?: string
  summary?: string
  isUpdate?: boolean
  loading?: boolean
  planMeasure: PlanMeasure
  form: FormInstance
  editable: boolean | undefined
  unsaved: boolean
  shouldRefreshData: boolean
}

export const PlanMeasuresSummaryForm = (props: summaryFormProps): JSX.Element => {
  const router = useRouter()
  const {
    setRiskRequired,
    setUnsaved,
    planMeasure,
    isUpdate,
    loading,
    form,
    editable,
    unsaved,
    shouldRefreshData,
    setShouldRefreshData,
  } = props
  const PAGE_ID = 'planMeasuresSummaryForm'
  const [checkedButton, setCheckedButton] = useState<PlanMeasureClassificationType>(
    PlanMeasureClassificationTypes.new.propertyName
  )
  const [planMeasureCode, setPlanMeasureCode] = useState<string>()

  const inputStyle = {
    CategoryButton: {
      width: '80%',
      marginRight: '20%',
      display: 'block',
      paddingBottom: '10px',
      paddingTop: '10px',
      paddingLeft: '5px',
      marginBottom: '1em',
      borderRadius: '6px',
      border: 'solid 2px rgb(230, 230, 230)',
    },
    CategoryButtonChecked: {
      width: '80%',
      marginRight: '20%',
      display: 'block',
      paddingBottom: '10px',
      paddingTop: '10px',
      paddingLeft: '5px',
      marginBottom: '1em',
      borderRadius: '6px',
      border: 'solid 2px rgb(230, 230, 230)',
      backgroundColor: 'rgb(204,218,216)',
    },
  }

  const categoryButton = style({
    $nest: {
      '&:hover': {
        backgroundColor: 'rgb(204,218,216)',
        color: 'rgb(0,71,58)',
      },
    },
  })

  useEffect(() => {
    if (isUpdate) {
      void (async () => {
        if (loading && !planMeasure) {
          await router.push(`/planMeasures/new`)
        }
      })()
    }
  }, [planMeasure, isUpdate, loading, router])

  //Check tab change to refresh plan measure effect risk data
  useEffect(() => {
    if (shouldRefreshData) {
      form.setFieldsValue({
        code: planMeasure.code,
        measureName: planMeasure.measureName,
        overview: planMeasure.overview,
        classification: planMeasure.classification || null,
      })
      setShouldRefreshData(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShouldRefreshData, shouldRefreshData, planMeasure])

  useEffect(() => {
    if ((!planMeasure && !isUpdate) || !planMeasure) {
      form.setFieldsValue({
        code: '',
        measureName: '',
        overview: '',
        classification: null,
      })
      return
    }
    setPlanMeasureCode(planMeasure.code)
    form.setFieldsValue({
      id: planMeasure.id,
      code: planMeasure.code,
      measureName: planMeasure.measureName,
      overview: planMeasure.overview,
      classification: planMeasure.classification || null,
    })
    setCheckedButton(planMeasure.classification as PlanMeasureClassificationType)
  }, [planMeasure, isUpdate, form])

  const changeStyle = (value: string): Record<string, unknown> => {
    return value === checkedButton ? inputStyle.CategoryButtonChecked : inputStyle.CategoryButton
  }

  const onChangeClassificationType = (type: PlanMeasureClassificationType): void => {
    setCheckedButton(type)
    if (type == PlanMeasureClassificationTypes.riskAvoidance.propertyName) {
      setRiskRequired && setRiskRequired(true)
    } else {
      setRiskRequired && setRiskRequired(false)
    }
  }

  return (
    <>
      {/* <Save onSave={submitForm} /> */}
      <Layout>
        <Col span={24}>
          <Form form={form}>
            <FormItem pageId={PAGE_ID} itemId={'id'} style={{ display: 'none' }}>
              <Input type={'hidden'} disabled={!editable} />
            </FormItem>
            <FormItem pageId={PAGE_ID} itemId={'code'} style={{ display: 'none' }}>
              <Input type={'hidden'} disabled={!editable} />
            </FormItem>
            <Row justify="center">
              <Col span={18} style={{ marginBottom: '20px', borderBottom: 'solid 1px #ddd' }}>
                {!_.isEmpty(planMeasureCode) && <p style={{ color: 'gray' }}>{planMeasureCode}</p>}
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'measureName'}
                  wrapperCol={{ span: 22 }}
                  style={{ fontWeight: 'bold', border: '2px' }}
                >
                  <Input
                    size={'middle'}
                    name="measureName"
                    style={{ marginLeft: '3em' }}
                    disabled={!editable}
                    onChange={() => {
                      if (!unsaved) setUnsaved(true)
                    }}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row justify="center">
              <Col span={18} style={{ marginBottom: '20px', borderBottom: 'solid 1px #ddd' }}>
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'overview'}
                  wrapperCol={{ span: 22 }}
                  style={{ fontWeight: 'bold' }}
                >
                  <Input.TextArea
                    size={'middle'}
                    name="overview"
                    style={{ marginLeft: '3em' }}
                    autoSize={{ minRows: 4 }}
                    disabled={!editable}
                    onChange={() => {
                      if (!unsaved) setUnsaved(true)
                    }}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row justify="center">
              <Col span={18} style={{ marginBottom: '20px', borderBottom: 'solid 1px #ddd' }}>
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'classification'}
                  wrapperCol={{ span: 22, style: { marginLeft: '3em' } }}
                  style={{ fontWeight: 'bold' }}
                  name={'classification'}
                  initialValue={planMeasure.classification}
                >
                  <Radio.Group
                    disabled={!editable}
                    style={{
                      width: '100%',
                      fontWeight: 'normal',
                      borderRadius: '0px',
                      marginLeft: '3em',
                    }}
                  >
                    {Object.values(PlanMeasureClassificationTypes).map((type, index) => (
                      <Radio
                        key={`${type.propertyName}-${index}`}
                        value={type.propertyName}
                        className={categoryButton}
                        style={changeStyle(type.propertyName)}
                        onChange={(type) => {
                          const typeSelect = type.target.value as PlanMeasureClassificationType
                          if (!typeSelect) return
                          onChangeClassificationType(typeSelect)
                          if (!unsaved) setUnsaved(true)
                        }}
                      >
                        {type.label}
                      </Radio>
                    ))}
                  </Radio.Group>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Col>
      </Layout>
    </>
  )
}
export default PlanMeasuresSummaryForm

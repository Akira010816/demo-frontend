import React, { FC, useEffect, useMemo, useState } from 'react'
import { useLazyQuery, useMutation, useQuery } from '@apollo/react-hooks'
import { Col, Divider, Layout, message, Row, Space, Typography } from 'antd'
import { ButtonProps } from 'antd/es/button'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import { useAuth } from '~/hooks/useAuth'
import Button from '~/components/Button'
import { PriceUnits } from '~/components/priceUnit'
import { displaySetting, priceUnits, firstMonth } from '~/lib/displaySetting'
import {
  FIND_ALL_BUSINESS_YEARS,
  FindAllBusinessYearsResponse,
} from '../../graphhql/queries/findAllBusinessYears'
import {
  FIND_ALL_DEPARTMENTS,
  FindAllDepartmentsResponse,
} from '~/graphhql/queries/findAllDepartments'
import {
  FIND_PLAN_MEASURES_BY_DEPARTMENT_IDS,
  FindPlanMeasuresByDepartmentIdsResponse,
} from '~/graphhql/queries/findPlanMeasuresByDepartmentIds'
import {
  DECIDE_TARGET_PLAN_MEASURES_REQUEST,
  DecideTargetPlanMeasuresRequestTypes,
  DecideTargetPlanMeasuresResponse,
  DecideTargetPlanMeasureInput,
} from '~/graphhql/mutations/decideTargetPlanMeasures'
import PlanMeasureGapTable from '~/components/planMeasure/planMeasureGapTable'
import PlanMeasureSummaryTable from '~/components/planMeasure/planMeasureSummaryTable'
import PlanMeasuresSelectionTable from '~/components/planMeasure/planMeasuresSelectionTable'
import { youCanDoIt } from '~/lib/handlePermission'
import { FIND_PRICE_UNIT, FindPriceUnit } from '~/graphhql/queries/findPriceUnit'

const PAGE_ID = 'planMeasuresConfirmForm'
const labelConfig = displaySetting[PAGE_ID].labelConfig

const PlanMeasuresConfirmForm: FC = () => {
  const { profile, currentUserDepartmentId } = useAuth()
  const [youCanAccessThisPage, setYouCanAccessThisPage] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    if (profile && currentUserDepartmentId) {
      const accessable = youCanDoIt(profile, currentUserDepartmentId, 'planMeasureConfirm')
      setYouCanAccessThisPage(accessable)
    }
  }, [profile, currentUserDepartmentId])

  const { data: { findAllBusinessYears } = {} } = useQuery<FindAllBusinessYearsResponse>(
    FIND_ALL_BUSINESS_YEARS,
    { fetchPolicy: 'no-cache' }
  )

  const { data: { findAllDepartments } = {} } = useQuery<FindAllDepartmentsResponse>(
    FIND_ALL_DEPARTMENTS,
    { fetchPolicy: 'no-cache' }
  )

  // 対象年度
  const nextBusinessYear = useMemo<BusinessYear | undefined>(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return findAllBusinessYears?.find((value) => {
      const startDate = new Date(value.startYear, value.startMonth - 1, value.startDate)
      const endDate = new Date(value.endYear, value.endMonth - 1, value.endDate)
      endDate.setDate(endDate.getDate() + 1)
      return startDate <= date && date < endDate
    })
  }, [findAllBusinessYears])
  const targetYear = useMemo<number>(() => {
    if (nextBusinessYear) {
      return nextBusinessYear.year
    } else {
      const date = new Date()
      return date.getMonth() + 1 < firstMonth ? date.getFullYear() : date.getFullYear() + 1
    }
  }, [nextBusinessYear])

  const [planMeasures, setPlanMeasures] = useState<Array<PlanMeasure>>([])
  const [renderState, setRenderState] = useState<'Prepare' | 'Ready' | 'Finish' | undefined>()

  // ①自部署を親に持つ部署を芋蔓式に全て取得
  const departmentIds = useMemo<number[] | undefined>(() => {
    if (profile && findAllDepartments) {
      const currentDepartment = findAllDepartments.find(
        (value) => value.id == profile.currentDepartmentId
      )
      if (currentDepartment) {
        const lowerDepartments: Department[] = []
        findAllDepartments.forEach((value) => {
          let department: Department | undefined = value
          while (
            department &&
            department.departmentLevel?.order != undefined &&
            department.departmentLevel?.order >= 1
          ) {
            if (department.id == currentDepartment.id) {
              lowerDepartments.push(value)
              break
            }
            department = findAllDepartments.find((value) => value.id == department?.parent?.id)
          }
        })
        const currentDepartmentIndex = lowerDepartments.findIndex(
          (value) => value.id == currentDepartment.id
        )
        if (currentDepartmentIndex >= 0) {
          lowerDepartments.splice(currentDepartmentIndex, 1)
        }
        // 課以下の所属のユーザーの場合は自分が所属する課も対象に加える
        if (
          currentDepartment.departmentLevel?.order != undefined &&
          currentDepartment.departmentLevel?.order > 4
        ) {
          let department: Department | undefined = currentDepartment
          while (department && department.departmentLevel?.order != undefined) {
            if (department.departmentLevel?.order == 5) {
              lowerDepartments.push(department)
              break
            }
            department = findAllDepartments.find((value) => value.id == department?.parent?.id)
          }
        }
        if (lowerDepartments.length > 0) {
          return lowerDepartments.map((value) => value.id)
        }
      }
    }
  }, [profile, findAllDepartments])
  // ②①の各部署に紐付く、事業計画年度が次年度となっている施策を取得
  const [findPlanMeasuresByDepartmentIds] = useLazyQuery<FindPlanMeasuresByDepartmentIdsResponse>(
    FIND_PLAN_MEASURES_BY_DEPARTMENT_IDS,
    {
      fetchPolicy: 'no-cache',
      onCompleted: (data) => {
        setRenderState('Prepare')
        setPlanMeasures(data.findPlanMeasuresByDepartmentIds)
      },
    }
  )
  useEffect(() => {
    if (departmentIds) {
      findPlanMeasuresByDepartmentIds({
        variables: {
          findPlanMeasuresByDepartmentIdsInput: {
            departmentIds: departmentIds,
            startBusinessYear: targetYear,
            endBusinessYear: targetYear + 1,
            startAggregationBusinessYear: targetYear,
            endAggregationBusinessYear: targetYear + 4,
          },
        },
      })
    }
  }, [departmentIds, findPlanMeasuresByDepartmentIds, targetYear])

  const [decideTargetPlanMeasures] = useMutation<
    DecideTargetPlanMeasuresResponse,
    DecideTargetPlanMeasuresRequestTypes
  >(DECIDE_TARGET_PLAN_MEASURES_REQUEST, {
    onCompleted: async () => {
      message.success(labelConfig.decidePlanMeasures)
    },
    onError: async () => {
      message.error(labelConfig.decidePlanMeasuresError)
    },
  })

  const [selectedRowIds, setSelectedRowIds] = useState<Array<number>>([])

  useEffect(() => {
    if (renderState == 'Prepare') {
      setSelectedRowIds(
        planMeasures
          .filter((planMeasure) => planMeasure.implementationTarget == 'Target')
          ?.map((x) => x.id || 0) || []
      )
      setRenderState('Ready')
    }
  }, [planMeasures, renderState])

  const onDecidePlanMeasures: ButtonProps['onClick'] = async () => {
    const input: Array<DecideTargetPlanMeasureInput> = []
    planMeasures.forEach(
      (value) =>
        value.id &&
        input.push({
          id: value.id,
          implementationTarget: selectedRowIds.includes(value.id) ? 'Target' : 'NonTarget',
          version: value.version || 1,
        })
    )
    await decideTargetPlanMeasures({
      variables: {
        decideTargetPlanMeasuresInput: {
          targetPlanMeasures: input,
        },
      },
    })
  }

  const [priceUnitType, setPriceUnitType] = useState<string>(
    priceUnits.filter((priceUnit) => priceUnit.isDefault)[0].type
  )
  const priceUnit: number = useMemo(() => {
    switch (priceUnitType) {
      case 'yen':
        return 1
      case 'senYen':
        return 1000
      case 'manYen':
        return 10000
      case 'hyakumanYen':
        return 1000000
      default:
        return 1
    }
  }, [priceUnitType])

  const [currentPriceUnit, setCurrentPriceUnit] = useState<PriceUnit>()
  const { data: defaultPriceUnit } = useQuery<FindPriceUnit>(FIND_PRICE_UNIT)
  useEffect(() => {
    if (defaultPriceUnit) {
      setCurrentPriceUnit(
        priceUnits.filter(
          (priceUnit) => priceUnit.digitLength === defaultPriceUnit.findPriceUnit?.digitLength
        )[0]
      )
    }
  }, [defaultPriceUnit])

  return (
    <PageTitleContext.Provider value={labelConfig.pageTitle}>
      <MainLayout>
        {(youCanAccessThisPage && (
          <Layout>
            <Row wrap style={{ width: '100%' }}>
              <Space wrap direction={'horizontal'}>
                <Button
                  type="default"
                  onClick={onDecidePlanMeasures}
                  disabled={planMeasures.length == 0}
                >
                  {labelConfig.decideButton}
                </Button>
              </Space>
            </Row>

            <Divider />

            <div
              style={{
                width: '100%',
                position: 'sticky',
                top: 0,
                background: '#fff',
                zIndex: 5,
              }}
            >
              <Space direction={'vertical'} size={'middle'}>
                <Row align={'middle'}>
                  <Space>
                    <Row align={'middle'}>
                      <Space>
                        <Col>
                          <Typography.Text strong>{labelConfig.targetYear}: </Typography.Text>
                          <Typography.Text strong>{targetYear}年度</Typography.Text>
                        </Col>
                      </Space>
                    </Row>
                  </Space>

                  <Row style={{ marginLeft: 'auto' }}>
                    <Space>
                      <Typography.Text>単位</Typography.Text>
                      {currentPriceUnit && (
                        <PriceUnits
                          defaultValue={currentPriceUnit.type}
                          onChange={(_previousPriceUnit, nextPriceUnit) =>
                            setPriceUnitType(nextPriceUnit.type)
                          }
                        />
                      )}
                    </Space>
                  </Row>
                </Row>

                <Row>
                  <PlanMeasureGapTable
                    planMeasures={planMeasures}
                    ids={selectedRowIds}
                    priceUnit={priceUnit}
                    targetYear={targetYear}
                    firstMonth={nextBusinessYear ? nextBusinessYear.startMonth : firstMonth}
                  />
                </Row>
              </Space>

              <Divider />
            </div>

            <Row>
              <PlanMeasureSummaryTable
                planMeasures={planMeasures}
                ids={selectedRowIds}
                priceUnit={priceUnit}
                targetYear={targetYear}
                firstMonth={nextBusinessYear ? nextBusinessYear.startMonth : firstMonth}
              />
            </Row>

            <Row>
              <Typography.Paragraph style={{ marginTop: '1rem' }}>
                {labelConfig.selectPlanMeasuresSubTitle}
              </Typography.Paragraph>
            </Row>

            <Row>
              <div className={'planmeasure-selection-table'}>
                <style jsx>{`
                  .planmeasure-selection-table :global(th .ant-table-cell-content) {
                    background-color: #1a77d4;
                  }
                  .planmeasure-selection-table :global(th.ant-table-cell.ant-table-cell-ellipsis) {
                    background-color: #3e8cdb;
                  }
                `}</style>
                <PlanMeasuresSelectionTable
                  planMeasures={planMeasures}
                  priceUnit={priceUnit}
                  targetYear={targetYear}
                  selectedRowIds={selectedRowIds}
                  renderState={renderState}
                  firstMonth={nextBusinessYear ? nextBusinessYear.startMonth : firstMonth}
                  setRenderState={setRenderState}
                  onSelected={(ids) => {
                    setSelectedRowIds(ids)
                  }}
                />
              </div>
            </Row>
          </Layout>
        )) ||
          (youCanAccessThisPage == false && <div>{labelConfig.doYouNotHavePermission}</div>)}
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default PlanMeasuresConfirmForm

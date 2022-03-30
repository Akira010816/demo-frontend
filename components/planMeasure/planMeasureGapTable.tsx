import { FC, useState, useMemo, useEffect, CSSProperties } from 'react'
import { useLazyQuery, useQuery } from '@apollo/react-hooks'
import { Space, Typography } from 'antd'
import { ColumnsType } from 'antd/es/table'
import Table from '../table'
import {
  displaySetting,
  EffectSaleProjectTypes,
  PlanMeasureCostItemTypes,
  TaskCostRecordingDestinationTypes,
} from '~/lib/displaySetting'
import {
  FIND_ANNUAL_PLAN_BY_YEAR,
  FindAnnualPlanByYearResponse,
} from '~/graphhql/queries/findAnnualPlanByYear'
import {
  FIND_ALL_DEPARTMENTS,
  FindAllDepartmentsResponse,
} from '~/graphhql/queries/findAllDepartments'
import { useAuth } from '~/hooks/useAuth'

const PAGE_ID = 'planMeasuresConfirmForm'
const labelConfig = displaySetting[PAGE_ID].labelConfig

export type PlanMeasureGapProps = {
  planMeasures?: Array<PlanMeasure>
  ids?: Array<number>
  priceUnit: number
  targetYear: number
  firstMonth: number
}

type PlanIndexes = {
  sales: number // 売上
  deemedSales: number // みなし売上
  cost: number // '売上原価'
  ownSellingExpense: number // '販売費(自部門コスト)'
  sellingExpense: number // '販売費'
  generalAdministrativeExpense: number // '一般管理費'
  operatingIncome: number // '営業利益'
  operatingIncomeRatio: number // '営業利益率'
}

type PlanColumns = {
  key: string
  type: 'target' | 'total' | 'diff'
} & PlanIndexes

const defaultTotalPlan: PlanColumns = {
  key: 'default_total_plan',
  type: 'total',
  sales: 0,
  deemedSales: 0,
  cost: 0,
  ownSellingExpense: 0,
  sellingExpense: 0,
  generalAdministrativeExpense: 0,
  operatingIncome: 0,
  operatingIncomeRatio: 0,
}

const defaultDiffPlan: PlanColumns = {
  key: 'default_diff_plan',
  type: 'diff',
  sales: 0,
  deemedSales: 0,
  cost: 0,
  ownSellingExpense: 0,
  sellingExpense: 0,
  generalAdministrativeExpense: 0,
  operatingIncome: 0,
  operatingIncomeRatio: 0,
}

const isPartOfCurrentDepartment = (
  departments: Department[] | undefined,
  currentDepartmentId: number | undefined,
  targetDepartmentId: number | undefined
): boolean => {
  if (
    departments == undefined ||
    currentDepartmentId == undefined ||
    targetDepartmentId == undefined
  ) {
    return false
  }
  const currentDepartment = departments.find((value) => value.id == currentDepartmentId)
  if (currentDepartment == undefined) {
    return false
  }
  let targetDepartment = departments.find((value) => value.id == targetDepartmentId)
  while (targetDepartment != undefined) {
    if (currentDepartment.id == targetDepartment.id) {
      return true
    }
    if (targetDepartment.parent == undefined) {
      break
    }
    targetDepartment = departments.find((value) => value.id == targetDepartment?.parent?.id)
  }
  return false
}

const PlanMeasureGapTable: FC<PlanMeasureGapProps> = ({
  planMeasures,
  ids,
  priceUnit,
  targetYear,
  firstMonth,
}) => {
  const selectedPlanMeasures = useMemo(
    () => planMeasures?.filter((planMeasure) => planMeasure.id && ids?.includes(planMeasure.id)),
    [planMeasures, ids]
  )

  const { profile, currentDepartmentId, currentUserDepartmentId } = useAuth()

  const { data: { findAllDepartments } = {} } = useQuery<FindAllDepartmentsResponse>(
    FIND_ALL_DEPARTMENTS,
    { fetchPolicy: 'no-cache' }
  )

  const [
    nextYearAnnualPlanFromHigherOrganization,
    setNextYearAnnualPlanFromHigherOrganization,
  ] = useState<AnnualPlan | undefined>(undefined)

  const [findAnnualPlanByYear] = useLazyQuery<FindAnnualPlanByYearResponse>(
    FIND_ANNUAL_PLAN_BY_YEAR,
    {
      fetchPolicy: 'no-cache',
      onCompleted: (data) => setNextYearAnnualPlanFromHigherOrganization(data.findAnnualPlanByYear),
    }
  )

  const [currentDepartment, setCurrentDepartment] = useState<Department | undefined>()

  useEffect(() => {
    if (profile && findAllDepartments) {
      setCurrentDepartment(
        findAllDepartments.find((value) => value.id == profile.currentDepartmentId)
      )
    }
  }, [profile, findAllDepartments])

  useEffect(() => {
    if (currentDepartment && currentDepartment.departmentLevel?.order != undefined) {
      findAnnualPlanByYear({
        variables: {
          findAnnualPlanByYearInput: {
            year: targetYear,
            organizationLevel:
              currentDepartment.departmentLevel?.order > 4
                ? 4
                : currentDepartment.departmentLevel?.order,
          },
        },
      })
    }
  }, [currentDepartment, findAnnualPlanByYear, targetYear])

  const [nextYearPlansFromHigherOrganization, setNextYearPlansFromHigherOrganization] = useState<
    Plan[] | undefined
  >()

  useEffect(() => {
    if (nextYearAnnualPlanFromHigherOrganization && findAllDepartments) {
      if (currentDepartment && currentDepartment.departmentLevel?.order != undefined) {
        const targetLevel =
          currentDepartment.departmentLevel?.order == 2
            ? 1
            : currentDepartment.departmentLevel?.order > 4
            ? 4
            : currentDepartment.departmentLevel?.order
        const departments = findAllDepartments.filter(
          (value) => value.departmentLevel?.order == targetLevel
        )
        let department: Department | undefined = currentDepartment
        while (
          department &&
          department.departmentLevel?.order != undefined &&
          department.departmentLevel?.order >= 1
        ) {
          if (departments.find((value) => value.id == department?.id)) {
            setNextYearPlansFromHigherOrganization(
              nextYearAnnualPlanFromHigherOrganization.plans?.filter((value) =>
                value.department ? value.department.id == department?.id : false
              )
            )
            return
          }
          department = findAllDepartments.find((value) => value.id == department?.parent?.id)
        }
      }
    }
    setNextYearPlansFromHigherOrganization(undefined)
  }, [nextYearAnnualPlanFromHigherOrganization, currentDepartment, findAllDepartments])

  const [targetPlanFromHigherOrganization, setTargetPlanFromHigherOrganization] = useState<
    PlanColumns | undefined
  >(undefined)

  const [totalPlan, setTotalPlan] = useState<PlanColumns>(defaultTotalPlan)

  const [diffPlan, setDiffPlan] = useState<PlanColumns>(defaultDiffPlan)

  const negativeValueStyles = (value: number): CSSProperties => ({
    color: value < 0 ? 'red' : 'initial',
  })

  useEffect(() => {
    if (nextYearPlansFromHigherOrganization) {
      const obj: PlanColumns = { ...defaultTotalPlan }
      obj.key = 'target_plan'
      obj.type = 'target'
      nextYearPlansFromHigherOrganization.forEach((value) => {
        obj.sales += value.targetSales
        obj.deemedSales += value.deemedSales
        obj.cost += value.targetSalesCost
        obj.ownSellingExpense += value.targetSellingExpenseOfOwnDepartment
        obj.sellingExpense += value.targetSellingExpense
        obj.generalAdministrativeExpense += value.targetGeneralAdministrativeExpense
        obj.operatingIncome +=
          value.targetSales -
          (value.targetSalesCost +
            value.targetSellingExpenseOfOwnDepartment +
            value.targetSellingExpense +
            value.targetGeneralAdministrativeExpense)
      })
      const ratio = (obj.operatingIncome / obj.sales) * 100
      obj.operatingIncomeRatio = Number.isNaN(ratio) ? 0 : ratio
      setTargetPlanFromHigherOrganization(obj)
    } else {
      setTargetPlanFromHigherOrganization(undefined)
    }
  }, [nextYearPlansFromHigherOrganization])

  useEffect(() => {
    if (findAllDepartments == undefined) {
      return
    }
    const obj: PlanColumns = { ...defaultTotalPlan }
    selectedPlanMeasures?.forEach((planMeasure) => {
      // 効果(売上)の「売上」は「売上」に合算
      planMeasure.sales &&
        planMeasure.sales
          .filter((sale) => sale.project != EffectSaleProjectTypes.deemedSales.propertyName)
          ?.forEach((planMeasureSale) => {
            planMeasureSale.prices
              .filter(
                (planMeasurePrice) =>
                  (planMeasurePrice.yearOfOccurrence == targetYear &&
                    planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                  (planMeasurePrice.yearOfOccurrence == targetYear + 1 &&
                    planMeasurePrice.monthOfOccurrence < firstMonth)
              )
              .forEach((value) => {
                obj.sales += value.cost
              })
          })
      // 効果(売上)の「みなし売上」は「みなし売上」に合算
      planMeasure.sales &&
        planMeasure.sales
          .filter((sale) => sale.project == EffectSaleProjectTypes.deemedSales.propertyName)
          ?.forEach((planMeasureSale) => {
            planMeasureSale.prices
              .filter(
                (planMeasurePrice) =>
                  (planMeasurePrice.yearOfOccurrence == targetYear &&
                    planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                  (planMeasurePrice.yearOfOccurrence == targetYear + 1 &&
                    planMeasurePrice.monthOfOccurrence < firstMonth)
              )
              .forEach((value) => {
                obj.deemedSales += value.cost
              })
          })
      // 効果(コスト)の中で、売上原価に分類される勘定科目は「売上原価」に合算
      // 〃販売費に分類される勘定科目はコスト計上先に応じて「販売費(自部門コスト)」または「販売費」に合算
      // 〃一般管理費に分類される勘定科目は「一般管理費」に合算
      planMeasure.costs &&
        planMeasure.costs
          .filter((cost) => cost.item != PlanMeasureCostItemTypes.deemedCost.propertyName)
          .forEach((planMeasureCost) => {
            planMeasureCost.prices
              .filter(
                (planMeasurePrice) =>
                  (planMeasurePrice.yearOfOccurrence == targetYear &&
                    planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                  (planMeasurePrice.yearOfOccurrence == targetYear + 1 &&
                    planMeasurePrice.monthOfOccurrence < firstMonth)
              )
              .forEach((value) => {
                switch (planMeasureCost.accountTitle?.accountDisplayTitle?.type) {
                  case 'cost':
                    obj.cost += value.cost
                    break
                  case 'sellingExpense':
                    if (
                      planMeasureCost.assigns?.findIndex(
                        (assign) =>
                          isPartOfCurrentDepartment(
                            findAllDepartments,
                            currentDepartmentId,
                            assign.costTD?.department?.id
                          ) ||
                          isPartOfCurrentDepartment(
                            findAllDepartments,
                            currentDepartmentId,
                            assign.costTI?.userDpm?.department.id
                          )
                      ) != -1
                    ) {
                      obj.ownSellingExpense += value.cost
                    } else {
                      obj.sellingExpense += value.cost
                    }
                    break
                  case 'generalAdministrativeExpense':
                    obj.generalAdministrativeExpense += value.cost
                    break
                }
              })
          })
      // コストの中で、売上原価に分類される勘定科目は「売上原価」に合算
      // 〃自部門の販売費に分類される勘定科目は「販売費(自部門コスト)」に合算
      // 〃共通部門の販売費に分類される勘定科目は「販売費」に合算
      // 〃一般管理費に分類される勘定科目は「一般管理費」に合算
      planMeasure.tasks?.forEach((planMeasureTask) => {
        planMeasureTask.prices
          .filter(
            (planMeasurePrice) =>
              (planMeasurePrice.yearOfOccurrence == targetYear &&
                planMeasurePrice.monthOfOccurrence >= firstMonth) ||
              (planMeasurePrice.yearOfOccurrence == targetYear + 1 &&
                planMeasurePrice.monthOfOccurrence < firstMonth)
          )
          .forEach((planMeasurePrice) => {
            switch (planMeasureTask.accountTitle?.accountDisplayTitle?.type) {
              case 'cost':
                obj.cost += planMeasurePrice.cost
                break
              case 'sellingExpense':
                if (
                  planMeasureTask.costRecordingDestination ==
                  TaskCostRecordingDestinationTypes.ownDepartment.propertyName
                ) {
                  obj.ownSellingExpense += planMeasurePrice.cost
                } else {
                  obj.sellingExpense += planMeasurePrice.cost
                }
                break
              case 'generalAdministrativeExpense':
                obj.generalAdministrativeExpense += planMeasurePrice.cost
                break
            }
          })
      })
      // リスクは上位設定目標との差異には影響しない
    })
    obj.operatingIncome =
      obj.sales -
      (obj.cost + obj.ownSellingExpense + obj.sellingExpense + obj.generalAdministrativeExpense)
    const ratio = (obj.operatingIncome / obj.sales) * 100
    obj.operatingIncomeRatio = Number.isNaN(ratio) ? 0 : ratio
    setTotalPlan(obj)
  }, [
    selectedPlanMeasures,
    targetYear,
    firstMonth,
    currentDepartmentId,
    currentUserDepartmentId,
    findAllDepartments,
  ])

  useEffect(() => {
    const obj: PlanColumns = { ...totalPlan }
    obj.key = 'diff_plan'
    obj.type = 'diff'
    if (targetPlanFromHigherOrganization) {
      obj.sales -= targetPlanFromHigherOrganization.sales
      obj.deemedSales -= targetPlanFromHigherOrganization.deemedSales
      obj.cost -= targetPlanFromHigherOrganization.cost
      obj.ownSellingExpense -= targetPlanFromHigherOrganization.ownSellingExpense
      obj.sellingExpense -= targetPlanFromHigherOrganization.sellingExpense
      obj.sellingExpense += totalPlan.ownSellingExpense
      obj.generalAdministrativeExpense -=
        targetPlanFromHigherOrganization.generalAdministrativeExpense
      obj.operatingIncome -= targetPlanFromHigherOrganization.operatingIncome
      obj.operatingIncomeRatio -= targetPlanFromHigherOrganization.operatingIncomeRatio
    }
    setDiffPlan(obj)
  }, [targetPlanFromHigherOrganization, totalPlan])

  const higherOrganizationColumnData: Array<PlanColumns> | null = useMemo(
    () => (targetPlanFromHigherOrganization ? [targetPlanFromHigherOrganization] : null),
    [targetPlanFromHigherOrganization]
  )

  const totalPlanColumnData: Array<PlanColumns> = useMemo(() => [totalPlan], [totalPlan])

  const diffPlanColumnData: Array<PlanColumns> = useMemo(() => [diffPlan], [diffPlan])

  const detailPlanColumns: ColumnsType<PlanColumns> = useMemo(
    () => [
      {
        title: labelConfig.contents,
        render: (_value, record) => {
          const obj = {
            children: (
              <Typography.Text>{labelConfig.targetPlanFromHigherOrganization}</Typography.Text>
            ),
            props: {
              colSpan: 2,
            },
          }
          if (record.type == `total`) {
            obj.children = (
              <Typography.Text>{labelConfig.selectedPlanMeasuresTotal}</Typography.Text>
            )
          } else if (record.type == 'diff') {
            obj.children = <Typography.Text>{labelConfig.gap}</Typography.Text>
          }
          return obj
        },
        ellipsis: true,
        colSpan: 2,
      },
      {
        title: labelConfig.sales,
        render: (_value, record) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(record.sales)}>
              {(record.sales / priceUnit).toLocaleString()}
            </Typography.Text>
          ),
          props: {
            style: {
              backgroundColor: record.type == 'diff' && record.sales != 0 ? 'peachpuff' : 'initial',
              textAlign: 'right',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.deemedSales,
        render: (_value, record) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(record.deemedSales)}>
              {(record.deemedSales / priceUnit).toLocaleString()}
            </Typography.Text>
          ),
          props: {
            style: {
              backgroundColor:
                record.type == 'diff' && record.deemedSales != 0 ? 'peachpuff' : 'initial',
              textAlign: 'right',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.salesCost,
        render: (_value, record) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(record.cost)}>
              {(record.cost / priceUnit).toLocaleString()}
            </Typography.Text>
          ),
          props: {
            style: {
              backgroundColor: record.type == 'diff' && record.cost != 0 ? 'peachpuff' : 'initial',
              textAlign: 'right',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: () => {
          const ownSellingExpenseTitle = (
            <div style={{ whiteSpace: 'pre' }}>{labelConfig.ownSellingExpense}</div>
          )
          return ownSellingExpenseTitle
        },
        render: (_value, record) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(record.ownSellingExpense)}>
              {record.type == 'total'
                ? (record.ownSellingExpense / priceUnit).toLocaleString()
                : ''}
            </Typography.Text>
          ),
          props: {
            style: {
              backgroundColor: 'initial',
              textAlign: 'right',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.sellingExpense,
        render: (_value, record) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(record.sellingExpense)}>
              {(record.sellingExpense / priceUnit).toLocaleString()}
            </Typography.Text>
          ),
          props: {
            style: {
              backgroundColor:
                record.type == 'diff' && record.sellingExpense != 0 ? 'peachpuff' : 'initial',
              textAlign: 'right',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.generalAdministrativeExpense,
        render: (_value, record) => ({
          children: (
            <Typography.Text
              ellipsis={true}
              style={negativeValueStyles(record.generalAdministrativeExpense)}
            >
              {(record.generalAdministrativeExpense / priceUnit).toLocaleString()}
            </Typography.Text>
          ),
          props: {
            style: {
              backgroundColor:
                record.type == 'diff' && record.generalAdministrativeExpense != 0
                  ? 'peachpuff'
                  : 'initial',
              textAlign: 'right',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.operatingIncome,
        render: (_value, record) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(record.operatingIncome)}>
              {(record.operatingIncome / priceUnit).toLocaleString()}
            </Typography.Text>
          ),
          props: {
            style: {
              backgroundColor:
                record.type == 'diff' && record.operatingIncome != 0 ? 'peachpuff' : 'initial',
              textAlign: 'right',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.operatingIncomeRatio,
        render: (_value, record) => ({
          children: (
            <Typography.Text style={negativeValueStyles(record.operatingIncomeRatio)}>
              {record.operatingIncomeRatio.toFixed(1)}%
            </Typography.Text>
          ),
          props: {
            style: {
              backgroundColor:
                record.type == 'diff' && record.operatingIncomeRatio != 0 ? 'peachpuff' : 'initial',
              textAlign: 'right',
            },
          },
        }),
      },
    ],
    [priceUnit]
  )

  return (
    <Space direction={'vertical'}>
      {higherOrganizationColumnData &&
        currentDepartment &&
        currentDepartment.departmentLevel?.order != undefined &&
        currentDepartment.departmentLevel?.order > 1 && (
          <Table
            size={'small'}
            columns={detailPlanColumns}
            dataSource={higherOrganizationColumnData}
            rowKey={'key'}
            pagination={false}
            extraSmall={true}
          />
        )}

      <div
        style={{
          borderTop:
            higherOrganizationColumnData &&
            currentDepartment &&
            currentDepartment.departmentLevel?.order != undefined &&
            currentDepartment.departmentLevel?.order > 1
              ? '1px solid #f0f0f0'
              : 'none',
        }}
      >
        <Table
          size={'small'}
          className={'noHeaderTable'}
          columns={detailPlanColumns}
          dataSource={totalPlanColumnData}
          rowKey={'key'}
          pagination={false}
          showHeader={
            !(
              higherOrganizationColumnData &&
              currentDepartment &&
              currentDepartment.departmentLevel?.order != undefined &&
              currentDepartment.departmentLevel?.order > 1
            )
          }
          extraSmall={true}
        />
      </div>

      {higherOrganizationColumnData &&
        currentDepartment &&
        currentDepartment.departmentLevel?.order != undefined &&
        currentDepartment.departmentLevel?.order > 1 && (
          <div style={{ borderTop: '1px solid #f0f0f0' }}>
            <Table
              size={'small'}
              className={'noHeaderTable'}
              columns={detailPlanColumns}
              dataSource={diffPlanColumnData}
              rowKey={'key'}
              pagination={false}
              showHeader={false}
              extraSmall={true}
            />
          </div>
        )}
    </Space>
  )
}

export default PlanMeasureGapTable

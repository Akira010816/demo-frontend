import React, { FC, useCallback, useMemo, useState } from 'react'
import { groupBy as _groupBy } from 'lodash'
import _orderBy from 'lodash.orderby'
import { Button, Checkbox, Tooltip, Typography } from 'antd'
import { ColumnsType, ColumnType } from 'antd/es/table'
import Table from '~/components/table'
import { convertValueByCurrentPriceUnit } from '~/components/priceUnit'
import {
  displaySetting,
  EffectSaleProjectTypes,
  PlanMeasureCostItemTypes,
  RiskTargetTypes,
} from '~/lib/displaySetting'
import { SelectPlanMeasureTableProps } from '~/components/planMeasure/selectPlanMeasuresTable'
import { CheckboxProps } from 'antd/es/checkbox'
import { useQuery } from '@apollo/react-hooks'
import {
  FIND_BUSINESS_YEARS_BY_RANGE,
  FindBusinessYearsByRangeRequest,
  FindBusinessYearsByRangeResponse,
} from '~/graphhql/queries/findBusinessYearsByRange'
import { getYearAndMonths } from '~/lib/businessYear'

export type PlanMeasureRow = {
  id: PlanMeasure['id']
  version?: PlanMeasure['version']
  planMeasureName: PlanMeasure['measureName']
  planMeasureOverview?: PlanMeasure['overview']
  planMeasureCode?: PlanMeasure['code']
  planMeasureClassification?: PlanMeasure['classification']
  typeName:
    | '効果 (売上)'
    | '効果(売上)リスク込み'
    | '効果 (コスト)'
    | '効果 (コスト) リスク込み'
    | 'コスト'
    | 'リスク'
  type:
    | 'effectSales'
    | 'effectSaleIncludingRisk'
    | 'effectCost'
    | 'effectCostIncludingRisk'
    | 'cost'
    | 'risk'
  aggregationType: Array<keyof Pick<PlanMeasure, 'sales' | 'costs' | 'risks' | 'tasks'>>
  implementationTarget: boolean
  results: {
    [year in number]: {
      [month in number]: number
    }
  }
}

const PAGE_ID = 'selectPlanMeasuresTable'
const { labelConfig } = displaySetting[PAGE_ID]

type PlanMeasureTableProps = {
  startYear: number
  endYear: number
  priceUnit: PriceUnit
  prependedColumns?: ColumnsType<PlanMeasureRow>
  appendedColumns?: ColumnsType<PlanMeasureRow>
  showImplementationTarget?: boolean
  selectable?: boolean
  dataSource: Array<PlanMeasureRow>
  clickableName?: boolean
  canCopy?: boolean // P2FW-775
  onSelectPlanMeasure?: SelectPlanMeasureTableProps['onSelectPlanMeasure']
}

type PriceYear = {
  businessYear?: { year: number }
  cost?: number
  yearOfOccurrence?: number
}

type Property = {
  assigns?: Array<Assign>
  prices: Array<PriceYear>
  accountTitle?: AccountTitle
}

const calcTotal = (
  properties: Array<Property>,
  userDepartments: Array<UserDepartment>
): PlanMeasureRow['results'] =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  properties
    .flatMap((property): PlanMeasureRow['results'] =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      calcTotalAggregations(
        property?.prices ?? [],
        property?.accountTitle?.type,
        property?.assigns,
        userDepartments
      )
    )
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .reduce((acc: PlanMeasureRow['results'], years: PlanMeasureRow['results']) => {
      Object.entries(years).map(([year, months]) => {
        Object.entries(months).map(([month, value]) => {
          const yearNumber = Number(year)
          const monthNumber = Number(month)
          if (!acc[yearNumber]) {
            acc[yearNumber] = {}
          }
          if (!acc[yearNumber][monthNumber]) {
            acc[yearNumber][monthNumber] = 0
          }
          acc[yearNumber][monthNumber] += value
        })
      })
      return acc
    }, {})

type Assign = {
  costTD?: Pick<PlanMeasureCostTargetDepartment, 'department'> | null
  costTI?: Pick<PlanMeasureCostTargetIndividual, 'userDpm'> | null
}

const calcLaborCost = (
  laborCost: PriceYear,
  assigns?: Array<Assign>,
  userDepartments?: Array<UserDepartment>
): number => {
  return (
    assigns?.reduce((acc, assign) => {
      const targetIndividualCost =
        (assign.costTI?.userDpm?.user?.salary?.salary ?? 0) * (laborCost?.cost ?? 0)
      const targetDepartmentId = assign.costTD?.department?.id

      if (!targetDepartmentId) {
        return acc + targetIndividualCost
      }

      const targetUserDepartment = userDepartments?.find(
        (userDepartment) => userDepartment.department.id === targetDepartmentId
      )

      if (!targetUserDepartment) {
        return acc + targetIndividualCost
      }

      const departmentIds: Array<Department['id']> = []
      let nextDepartments: Array<Department> = []

      const getDepartmentIds = (departments: Array<Department>): Array<Department['id']> => {
        if (!departments.length) {
          return departmentIds
        }

        departments.map((dep) => {
          departmentIds.push(dep.id)
        })

        nextDepartments = departments
          .flatMap((dp) => dp.children)
          .filter((dp): dp is Exclude<typeof dp, null | undefined> => !!dp)

        return getDepartmentIds(nextDepartments)
      }

      const targetDepartmentIds = [
        targetUserDepartment.department.id,
        getDepartmentIds(targetUserDepartment?.department?.children ?? []),
      ]

      const users =
        userDepartments
          ?.filter((userDepartment) => targetDepartmentIds.includes(userDepartment.department.id))
          .map((userDepartment) => userDepartment.user) ?? []

      const uniqueUsers = Array.from(new Map(users.map((user) => [user.id, user])).values())

      const targetDepartmentCost = uniqueUsers.reduce(
        (acc, user) => acc + (user.salary?.salary ?? 0) * (laborCost?.cost ?? 0),
        0
      )

      return acc + targetIndividualCost + targetDepartmentCost
    }, 0) ?? 0
  )
}

const calcTotalAggregations = (
  aggregations: Array<PriceYear>,
  accountTitleType?: AccountTitleType,
  assigns?: Array<Assign>,
  userDepartments?: Array<UserDepartment>
): PlanMeasureRow['results'] => {
  const groupedByYear = _groupBy(aggregations, (item) => item.yearOfOccurrence)
  return Object.entries(groupedByYear)
    .map(([year, data]) => ({
      [year]: Object.entries(_groupBy(data, 'monthOfOccurrence'))
        .map(([month, monthItems]) => ({
          [month]: monthItems.reduce(
            (acc, data) =>
              acc +
              (accountTitleType === 'laborCost'
                ? calcLaborCost(data, assigns, userDepartments)
                : data?.cost ?? data?.cost ?? 0),
            0
          ),
        }))
        .reduce((acc, v) => ({ ...acc, [Object.keys(v)[0]]: Object.values(v)[0] }), {}),
    }))
    .reduce((acc, v) => ({ ...acc, [Object.keys(v)[0]]: Object.values(v)[0] }), {})
}

const calcCostIncludingRisk = (
  costPriceAggregation: Array<Property>,
  riskPriceAggregation: Array<Property>,
  userDepartments: Array<UserDepartment>
): PlanMeasureRow['results'] => {
  const costTotal = calcTotal(costPriceAggregation, userDepartments)
  const riskTotal = calcTotal(riskPriceAggregation, userDepartments)
  const years = [...new Set([...Object.keys(costTotal), ...Object.keys(riskTotal)])].map((year) =>
    Number(year)
  )

  return years
    .map((year) => ({
      [year]: Array.from({ length: 12 }, (v, month) => ({
        [month + 1]: (costTotal?.[year]?.[month + 1] ?? 0) + (riskTotal?.[year]?.[month + 1] ?? 0),
      })).reduce((acc, v) => ({ ...acc, [Object.keys(v)[0]]: Object.values(v)[0] }), {}),
    }))
    .reduce((acc, v) => ({ ...acc, [Object.keys(v)[0]]: Object.values(v)[0] }), {})
}

const calcSaleIncludingRisk = (
  salePriceAggregation: Array<Property>,
  riskPriceAggregation: Array<Property>,
  userDepartments: Array<UserDepartment>
): PlanMeasureRow['results'] => {
  const saleTotal = calcTotal(salePriceAggregation, userDepartments)
  const riskTotal = calcTotal(riskPriceAggregation, userDepartments)
  const years = [...new Set([...Object.keys(saleTotal), ...Object.keys(riskTotal)])].map((year) =>
    Number(year)
  )

  return years
    .map((year) => ({
      [year]: Array.from({ length: 12 }, (v, month) => ({
        [month + 1]: (saleTotal?.[year]?.[month + 1] ?? 0) + (riskTotal?.[year]?.[month + 1] ?? 0),
      })).reduce((acc, v) => ({ ...acc, [Object.keys(v)[0]]: Object.values(v)[0] }), {}),
    }))
    .reduce((acc, v) => ({ ...acc, [Object.keys(v)[0]]: Object.values(v)[0] }), {})
}

export const generatePlanMeasureRows = (
  planMeasure: PlanMeasure,
  userDepartments: Array<UserDepartment>
): Array<PlanMeasureRow> => {
  return [
    {
      id: planMeasure.id,
      planMeasureName: planMeasure.measureName ?? '',
      planMeasureCode: planMeasure.code,
      planMeasureOverview: planMeasure.overview,
      planMeasureClassification: planMeasure.classification,
      typeName: '効果 (売上)',
      type: 'effectSales',
      aggregationType: ['sales'],
      implementationTarget: planMeasure.implementationTarget === 'Target',
      results: calcTotal(
        (planMeasure.sales &&
          planMeasure.sales.filter(
            (pm) => pm.project != EffectSaleProjectTypes.deemedSales.propertyName
          )) ??
          [],
        userDepartments
      ),
      version: planMeasure.version,
    },
    {
      id: planMeasure.id,
      planMeasureName: planMeasure.measureName ?? '',
      planMeasureCode: planMeasure.code,
      planMeasureOverview: planMeasure.overview,
      planMeasureClassification: planMeasure.classification,
      typeName: '効果(売上)リスク込み',
      type: 'effectSaleIncludingRisk',
      aggregationType: ['risks', 'sales'],
      implementationTarget: planMeasure.implementationTarget === 'Target',
      results: calcSaleIncludingRisk(
        planMeasure.sales || [],
        // (planMeasure.sales &&
        //   planMeasure.sales.filter(
        //     (sale) => sale.project != EffectSaleProjectTypes.deemedSales.propertyName
        //   )) ??
        //   [],
        (planMeasure.risks &&
          planMeasure.risks.filter(
            (risk) => risk.targetType == RiskTargetTypes.RiskSales.propertyName
          )) ??
          [],
        userDepartments
      ),
      version: planMeasure.version,
    },
    {
      id: planMeasure.id,
      planMeasureName: planMeasure.measureName ?? '',
      planMeasureCode: planMeasure.code,
      planMeasureOverview: planMeasure.overview,
      planMeasureClassification: planMeasure.classification,
      typeName: '効果 (コスト)',
      type: 'effectCost',
      aggregationType: ['costs'],
      implementationTarget: planMeasure.implementationTarget === 'Target',
      results: calcTotal(
        (planMeasure.costs &&
          planMeasure.costs.filter(
            (cost) => cost.item != PlanMeasureCostItemTypes.deemedCost.propertyName
          )) ??
          [],
        userDepartments
      ),
      version: planMeasure.version,
    },
    {
      id: planMeasure.id,
      planMeasureName: planMeasure.measureName ?? '',
      planMeasureCode: planMeasure.code,
      planMeasureOverview: planMeasure.overview,
      planMeasureClassification: planMeasure.classification,
      typeName: '効果 (コスト) リスク込み',
      type: 'effectCostIncludingRisk',
      aggregationType: ['risks', 'costs'],
      implementationTarget: planMeasure.implementationTarget === 'Target',
      results: calcCostIncludingRisk(
        planMeasure.costs || [],
        // (planMeasure.costs &&
        //   planMeasure.costs.filter(
        //     (cost) => cost.item != PlanMeasureCostItemTypes.deemedCost.propertyName
        //   )) ??
        //   [],
        (planMeasure.risks &&
          planMeasure.risks.filter(
            (risk) => risk.targetType == RiskTargetTypes.riskCosts.propertyName
          )) ??
          [],
        userDepartments
      ),
      version: planMeasure.version,
    },
    {
      id: planMeasure.id,
      planMeasureName: planMeasure.measureName ?? '',
      planMeasureCode: planMeasure.code,
      planMeasureOverview: planMeasure.overview,
      planMeasureClassification: planMeasure.classification,
      typeName: 'コスト',
      type: 'cost',
      aggregationType: ['tasks'],
      implementationTarget: planMeasure.implementationTarget === 'Target',
      results: calcTotal(planMeasure.tasks ?? [], userDepartments),
      version: planMeasure.version,
    },
    {
      id: planMeasure.id,
      planMeasureName: planMeasure.measureName ?? '',
      planMeasureCode: planMeasure.code,
      planMeasureOverview: planMeasure.overview,
      planMeasureClassification: planMeasure.classification,
      typeName: 'リスク',
      type: 'risk',
      aggregationType: ['risks'],
      implementationTarget: true,
      results: calcTotal(planMeasure.risks ?? [], userDepartments),
      version: planMeasure.version,
    },
  ]
}

// P2FW-739
type ColorProperty = {
  backgroundColor: string
}

// P2FW-739
export const renderBGColorOfColumnByMonth = (month: number): ColorProperty => {
  const quarter = Math.floor((month - 1) / 3)
  switch (quarter) {
    case 0:
    case 2:
      return { backgroundColor: '#ffffff' }
    default:
      return { backgroundColor: '#eaf3fb' }
  }
}

export const getPlanMeasuresTableBaseColumns = (
  clickableName = true
): ColumnsType<PlanMeasureRow> => [
  {
    title: labelConfig.columnPlanMeasureNameTitle,
    align: 'center',
    dataIndex: 'planMeasureName',
    width: 200,
    render: (measureName, planMeasureRow, rowIndex) => ({
      children: clickableName ? (
        <Typography.Link
          href={`planMeasures/${planMeasureRow.planMeasureCode}`}
          ellipsis={true}
          underline={true}
          target="createPlanMeasure"
        >
          <Tooltip title={planMeasureRow.planMeasureOverview}>{measureName}</Tooltip>
        </Typography.Link>
      ) : (
        <Typography.Text ellipsis={true}>{measureName}</Typography.Text>
      ),
      props: {
        rowSpan: rowIndex % 6 === 0 ? 6 : 0,
      },
    }),
    ellipsis: true,
    fixed: 'left',
    colSpan: 2,
    rowSpan: 5,
  },
  {
    title: '',
    align: 'left',
    dataIndex: 'typeName',
    width: 200,
    ellipsis: true,
    fixed: 'left',
    colSpan: 0,
  },
]

export const PlanMeasuresTable: FC<PlanMeasureTableProps> = (props) => {
  const { data } = useQuery<FindBusinessYearsByRangeResponse, FindBusinessYearsByRangeRequest>(
    FIND_BUSINESS_YEARS_BY_RANGE,
    {
      variables: {
        findBusinessYearsByRangeInput: { startYear: props.startYear, endYear: props.endYear },
      },
    }
  )

  const businessYears = _orderBy(
    data?.findBusinessYearsByRange ?? [],
    ['year', 'startYear', 'startMonth'],
    ['asc', 'asc', 'asc']
  )

  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  const [selectedPlanMeasureIds, setSelectedPlanMeasureIds] = useState<
    Array<Exclude<PlanMeasure['id'], undefined>>
  >([])
  const onCheckedPlanMeasureRow = (planMeasureRow: PlanMeasureRow): CheckboxProps['onChange'] => (
    event
  ) => {
    const currentSelectedIds = event.target.checked
      ? [...selectedPlanMeasureIds, planMeasureRow.id ?? 0]
      : selectedPlanMeasureIds.filter(
          (id): id is Exclude<PlanMeasure['id'], undefined> =>
            id !== undefined && id !== planMeasureRow.id
        )
    setSelectedPlanMeasureIds(currentSelectedIds)
    props.onSelectPlanMeasure?.(planMeasureRow.id ?? 0, currentSelectedIds, event.target.checked)
  }

  const onClickYearColumn = useCallback(
    (year: number) => {
      setSelectedYear(year === selectedYear ? undefined : year)
    },
    [selectedYear]
  )

  // const onHeaderCell = useCallback(
  //   (year: number, month?: number) => ({
  //     onClick: () => {
  //       setSelectedYear(year === selectedYear && !month ? undefined : year)
  //     },
  //     style: Object.assign(
  //       {},
  //       month
  //         ? {
  //             backgroundColor: month ? '#3e8cdb' : 'inherit',
  //           }
  //         : {}
  //     ),
  //   }),
  //   [selectedYear]
  // )

  const onHeaderCell = useCallback(
    (year: number, month?: number): ColumnType<PlanMeasureRow>['onHeaderCell'] => () => ({
      onClick: () => {
        setSelectedYear(year === selectedYear && !month ? undefined : year)
      },
      style: Object.assign(
        {},
        month
          ? {
              backgroundColor: month ? '#3e8cdb' : 'inherit',
            }
          : {}
      ),
    }),
    [selectedYear]
  )

  const yearColumns: ColumnsType<PlanMeasureRow> = useMemo(() => {
    return businessYears.flatMap((businessYear) => {
      const yearColumn: ColumnsType<PlanMeasureRow>[number] = {
        // title: `${businessYear.year}年度`,
        title: (
          <Typography.Text ellipsis={true}>
            {businessYear.year}
            {labelConfig.year}
            <Button
              type={'text'}
              size={'small'}
              onClick={() => {
                onClickYearColumn(businessYear.year)
              }}
            >
              月表示
            </Button>
          </Typography.Text>
        ),
        align: 'center',
        children: [
          {
            title: '年度累計',
            width: 120,
            render: (_, row) => {
              let total = 0
              if (!row.results) {
                total = 0
              } else {
                Object.entries(row.results).map(([year, months]) => {
                  if (parseInt(year) == businessYear.startYear) {
                    Object.entries(months).map(([month, value]) => {
                      if (parseInt(month) >= businessYear.startMonth) total += value
                    })
                  } else if (parseInt(year) == businessYear.endYear) {
                    Object.entries(months).map(([month, value]) => {
                      if (parseInt(month) < businessYear.startMonth) total += value
                    })
                  }
                })
              }
              return {
                children: (
                  <Typography.Text style={{ color: total < 0 ? 'red' : 'initial' }}>
                    {convertValueByCurrentPriceUnit(props.priceUnit, total, true)}
                  </Typography.Text>
                ),
                props: {
                  style: { textAlign: 'right' },
                },
              }
            },
          },
        ],
        // onHeaderCell: onHeaderCell(businessYear.year),
        width: 120,
        render: () => {
          return {
            children: <></>,
          }
        },
        ellipsis: true,
      }

      const months: ColumnsType<PlanMeasureRow> =
        businessYear.year === selectedYear
          ? getYearAndMonths(businessYear).map(({ year, month }) => ({
              title: `${year}年${month}月`,
              align: 'center',
              // onHeaderCell: onHeaderCell(year, month),
              width: 120,
              render: (_, row) => {
                const value = row.results?.[year]?.[month] ?? 0
                return {
                  children: (
                    <Typography.Text style={{ color: value < 0 ? 'red' : 'initial' }}>
                      {convertValueByCurrentPriceUnit(props.priceUnit, value, true)}
                    </Typography.Text>
                  ),
                  props: {
                    style: { textAlign: 'right', ...renderBGColorOfColumnByMonth(month) },
                  },
                }
              },
              ellipsis: true,
            }))
          : []
      if (months.length > 0) {
        yearColumn.title = (
          <>
            <Typography.Text
              ellipsis={true}
              style={{ float: 'left', paddingLeft: '20px', lineHeight: '44px' }}
            >
              {businessYear.year}
              {labelConfig.year}
            </Typography.Text>
            <Button
              type={'text'}
              size={'small'}
              style={{ float: 'left' }}
              onClick={() => {
                onClickYearColumn(businessYear.year)
              }}
            >
              年度累計
            </Button>
          </>
        )
        yearColumn.children = months
      }
      return yearColumn
      // return [yearColumn].concat(months)
    })
  }, [businessYears, onHeaderCell, selectedYear, props.priceUnit])

  const selectableColumn: ColumnsType<PlanMeasureRow>[number] = {
    title: labelConfig.columnSelectTitle,
    align: 'center',
    width: 50,
    render: (_, planMeasureRow, rowIndex) => ({
      children: (
        // P2FW-775
        <Checkbox onChange={onCheckedPlanMeasureRow(planMeasureRow)} disabled={!props.canCopy} />
      ),
      props: {
        rowSpan: rowIndex % 6 === 0 ? 6 : 0,
      },
    }),
    ellipsis: true,
    fixed: 'left',
    colSpan: 1,
    rowSpan: 6,
  }

  const implementationTargetColumn: ColumnsType<PlanMeasureRow>[number] = {
    title: labelConfig.columnImplementationTargetTitle,
    align: 'center',
    dataIndex: 'implementationTarget',
    width: 100,
    render: (implementationTarget, _, rowIndex) => ({
      children: <Checkbox checked={implementationTarget} disabled={true} />,
      props: {
        rowSpan: rowIndex % 6 === 0 ? 6 : 0,
      },
    }),
    fixed: 'left',
    ellipsis: true,
  }

  const columns = [
    ...[props.selectable ? selectableColumn : null],
    ...(props.prependedColumns ?? []),
    ...getPlanMeasuresTableBaseColumns(props.clickableName ?? true),
    ...[props.showImplementationTarget ? implementationTargetColumn : null],
    ...yearColumns,
    ...(props.appendedColumns ?? []),
  ].filter((column): column is Exclude<typeof column, null> => !!column)

  return (
    <Table
      columns={columns}
      dataSource={props.dataSource}
      size={'small'}
      pagination={false}
      rowKey={(row) => `${row.id}${row.planMeasureName}${row.typeName}${row.type}`}
      scroll={{ x: '100%' }}
    />
  )
}

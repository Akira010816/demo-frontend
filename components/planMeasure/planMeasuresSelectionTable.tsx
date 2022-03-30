import { FC, useEffect, useMemo, useState } from 'react'
import { Tooltip, Typography } from 'antd'
import { ColumnsType } from 'antd/es/table'
import Table from '../table'
import {
  displaySetting,
  EffectSaleProjectTypes,
  PlanMeasureCostItemTypes,
} from '~/lib/displaySetting'

const PAGE_ID = 'planMeasuresConfirmForm'
const labelConfig = displaySetting[PAGE_ID].labelConfig

export type PlanMeasuresProps = {
  planMeasures?: Array<PlanMeasure>
  priceUnit: number
  targetYear: number
  firstMonth: number
  selectedRowIds: number[]
  renderState: 'Prepare' | 'Ready' | 'Finish' | undefined
  setRenderState: (state: 'Prepare' | 'Ready' | 'Finish' | undefined) => void
  onSelected: (ids: Array<number>) => void
}

type PlanMeasureColumn = {
  key: string
  id: number
  name: string
  code: string
  overview: string
  data: number[]
}

const PlanMeasuresSelectionTable: FC<PlanMeasuresProps> = ({
  planMeasures,
  priceUnit,
  targetYear,
  firstMonth,
  selectedRowIds,
  renderState,
  setRenderState,
  ...props
}) => {
  const [planMeasureColumnDataRaw, setPlanMeasureColumnDataRaw] = useState<
    Array<PlanMeasureColumn>
  >([])

  useEffect(() => {
    const columnDataRaw: Array<PlanMeasureColumn> = []
    planMeasures?.forEach((planMeasure, index) => {
      const columnDataRawForEachPlanMeasure: Array<PlanMeasureColumn> = [
        {
          // 効果(売上)の初期データ
          key: index + '_1',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          code: planMeasure.code ?? '',
          overview: planMeasure.overview ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          // 効果(コスト)の初期データ
          key: index + '_2',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          code: planMeasure.code ?? '',
          overview: planMeasure.overview ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          // コストの初期データ
          key: index + '_3',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          code: planMeasure.code ?? '',
          overview: planMeasure.overview ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          // リスク(売上)の初期データ
          key: index + '_4',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          code: planMeasure.code ?? '',
          overview: planMeasure.overview ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          // リスク(コスト)の初期データ
          key: index + '_5',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          code: planMeasure.code ?? '',
          overview: planMeasure.overview ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ]
      // 効果(売上)を初期データに加算
      planMeasure.sales &&
        planMeasure.sales
          .filter((sale) => sale.project != EffectSaleProjectTypes.deemedSales.propertyName)
          ?.forEach((planMeasureSale) =>
            planMeasureSale.prices?.forEach((planMeasurePrice) => {
              if (
                (planMeasurePrice.yearOfOccurrence == targetYear &&
                  planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                (planMeasurePrice.yearOfOccurrence == targetYear + 1 &&
                  planMeasurePrice.monthOfOccurrence < firstMonth)
              ) {
                const dataIndex =
                  planMeasurePrice.monthOfOccurrence - firstMonth >= 0
                    ? planMeasurePrice.monthOfOccurrence - firstMonth
                    : 12 + planMeasurePrice.monthOfOccurrence - firstMonth
                columnDataRawForEachPlanMeasure[0].data[dataIndex] += planMeasurePrice.cost
              } else {
                for (let i = 0; i < 4; i++) {
                  if (
                    (planMeasurePrice.yearOfOccurrence == targetYear + i + 1 &&
                      planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                    (planMeasurePrice.yearOfOccurrence == targetYear + 1 + i + 1 &&
                      planMeasurePrice.monthOfOccurrence < firstMonth)
                  ) {
                    columnDataRawForEachPlanMeasure[0].data[12 + i] += planMeasurePrice.cost
                  }
                }
              }
            })
          )
      // 効果(コスト)を初期データに加算
      planMeasure.costs &&
        planMeasure.costs
          .filter((cost) => cost.item != PlanMeasureCostItemTypes.deemedCost.propertyName)
          .forEach((planMeasureCost) =>
            planMeasureCost.prices?.forEach((planMeasurePrice) => {
              if (
                (planMeasurePrice.yearOfOccurrence == targetYear &&
                  planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                (planMeasurePrice.yearOfOccurrence == targetYear + 1 &&
                  planMeasurePrice.monthOfOccurrence < firstMonth)
              ) {
                const dataIndex =
                  planMeasurePrice.monthOfOccurrence - firstMonth >= 0
                    ? planMeasurePrice.monthOfOccurrence - firstMonth
                    : 12 + planMeasurePrice.monthOfOccurrence - firstMonth
                columnDataRawForEachPlanMeasure[1].data[dataIndex] += planMeasurePrice.cost
              } else {
                for (let i = 0; i < 4; i++) {
                  if (
                    (planMeasurePrice.yearOfOccurrence == targetYear + i + 1 &&
                      planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                    (planMeasurePrice.yearOfOccurrence == targetYear + 1 + i + 1 &&
                      planMeasurePrice.monthOfOccurrence < firstMonth)
                  ) {
                    columnDataRawForEachPlanMeasure[1].data[12 + i] += planMeasurePrice.cost
                  }
                }
              }
            })
          )
      // コストを初期データに加算
      planMeasure.tasks?.forEach((planMeasureTask) =>
        planMeasureTask.prices?.forEach((planMeasurePrice) => {
          if (
            (planMeasurePrice.yearOfOccurrence == targetYear &&
              planMeasurePrice.monthOfOccurrence >= firstMonth) ||
            (planMeasurePrice.yearOfOccurrence == targetYear + 1 &&
              planMeasurePrice.monthOfOccurrence < firstMonth)
          ) {
            const dataIndex =
              planMeasurePrice.monthOfOccurrence - firstMonth >= 0
                ? planMeasurePrice.monthOfOccurrence - firstMonth
                : 12 + planMeasurePrice.monthOfOccurrence - firstMonth
            columnDataRawForEachPlanMeasure[2].data[dataIndex] += planMeasurePrice.cost
          } else {
            for (let i = 0; i < 4; i++) {
              if (
                (planMeasurePrice.yearOfOccurrence == targetYear + i + 1 &&
                  planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                (planMeasurePrice.yearOfOccurrence == targetYear + 1 + i + 1 &&
                  planMeasurePrice.monthOfOccurrence < firstMonth)
              ) {
                columnDataRawForEachPlanMeasure[2].data[12 + i] += planMeasurePrice.cost
              }
            }
          }
        })
      )
      // リスク(売上)を初期データに加算
      planMeasure.risks
        ?.filter((value) => value.targetType == 'RiskSales')
        .forEach((planMeasureRisk) =>
          planMeasureRisk.prices?.forEach((planMeasurePrice) => {
            if (
              (planMeasurePrice.yearOfOccurrence == targetYear &&
                planMeasurePrice.monthOfOccurrence >= firstMonth) ||
              (planMeasurePrice.yearOfOccurrence == targetYear + 1 &&
                planMeasurePrice.monthOfOccurrence < firstMonth)
            ) {
              const dataIndex =
                planMeasurePrice.monthOfOccurrence - firstMonth >= 0
                  ? planMeasurePrice.monthOfOccurrence - firstMonth
                  : 12 + planMeasurePrice.monthOfOccurrence - firstMonth
              columnDataRawForEachPlanMeasure[3].data[dataIndex] += planMeasurePrice.cost
            } else {
              for (let i = 0; i < 4; i++) {
                if (
                  (planMeasurePrice.yearOfOccurrence == targetYear + i + 1 &&
                    planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                  (planMeasurePrice.yearOfOccurrence == targetYear + 1 + i + 1 &&
                    planMeasurePrice.monthOfOccurrence < firstMonth)
                ) {
                  columnDataRawForEachPlanMeasure[3].data[12 + i] += planMeasurePrice.cost
                }
              }
            }
          })
        )
      // リスク(コスト)を初期データに加算
      planMeasure.risks
        ?.filter((value) => value.targetType == 'RiskCosts')
        .forEach((planMeasureRisk) =>
          planMeasureRisk.prices?.forEach((planMeasurePrice) => {
            if (
              (planMeasurePrice.yearOfOccurrence == targetYear &&
                planMeasurePrice.monthOfOccurrence >= firstMonth) ||
              (planMeasurePrice.yearOfOccurrence == targetYear + 1 &&
                planMeasurePrice.monthOfOccurrence < firstMonth)
            ) {
              const dataIndex =
                planMeasurePrice.monthOfOccurrence - firstMonth >= 0
                  ? planMeasurePrice.monthOfOccurrence - firstMonth
                  : 12 + planMeasurePrice.monthOfOccurrence - firstMonth
              columnDataRawForEachPlanMeasure[4].data[dataIndex] += planMeasurePrice.cost
            } else {
              for (let i = 0; i < 4; i++) {
                if (
                  (planMeasurePrice.yearOfOccurrence == targetYear + i + 1 &&
                    planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                  (planMeasurePrice.yearOfOccurrence == targetYear + 1 + i + 1 &&
                    planMeasurePrice.monthOfOccurrence < firstMonth)
                ) {
                  columnDataRawForEachPlanMeasure[4].data[12 + i] += planMeasurePrice.cost
                }
              }
            }
          })
        )
      columnDataRaw.push(...columnDataRawForEachPlanMeasure)
    })
    setPlanMeasureColumnDataRaw(columnDataRaw)
  }, [planMeasures, targetYear, firstMonth])

  const planMeasureColumnData: Array<PlanMeasureColumn> = useMemo(() => {
    const obj: Array<PlanMeasureColumn> = [...planMeasureColumnDataRaw]
    for (let i = 0; i < obj.length; i += 5) {
      // 効果(売上)リスク込みの行を挿入
      obj.splice(i + 1, 0, {
        key: obj[i].key.slice(0, obj[i].key.length - 1) + '6',
        id: obj[i].id,
        name: obj[i].name,
        code: obj[i].code,
        overview: obj[i].overview,
        data: obj[i].data.map((value, index) => value + obj[i + 3].data[index]),
      })
      // 効果(コスト)リスク込みの行を挿入
      obj.splice(i + 3, 0, {
        key: obj[i].key.slice(0, obj[i].key.length - 1) + '7',
        id: obj[i].id,
        name: obj[i].name,
        code: obj[i].code,
        overview: obj[i].overview,
        data: obj[i + 2].data.map((value, index) => value + obj[i + 5].data[index]),
      })
      // リスク(売上)の行にリスク(コスト)のデータを足してリスク(コスト)の行を削除
      obj[i + 5].data = obj[i + 5].data.map((value, index) => value + obj[i + 6].data[index])
      obj.splice(i + 6, 1)
      i++
    }
    return obj
  }, [planMeasureColumnDataRaw])

  const planMeasureColumns: ColumnsType<PlanMeasureColumn> = [
    {
      title: labelConfig.planMeasureName,
      colSpan: 2,
      render: (_value, record, index) => ({
        children: (
          <Typography.Link href={`${record.code}`} ellipsis={true} underline={true} target="_blank">
            <Tooltip title={record.overview}>{record.name}</Tooltip>
          </Typography.Link>
        ),
        props: {
          rowSpan: index % 6 === 0 ? 6 : 0,
          style: {
            background: expandedSelectedRowKeys.includes(record.key) ? '#8ec26e' : '#ffffff',
          },
        },
      }),
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '',
      colSpan: 0,
      render: (_value, record, index) => {
        const obj = {
          children: <Typography.Text>{labelConfig.effectSale}</Typography.Text>,
          props: {
            style: {
              background: expandedSelectedRowKeys.includes(record.key) ? '#8ec26e' : '#ffffff',
            },
          },
        }
        switch (index % 6) {
          case 1:
            obj.children = <Typography.Text>{labelConfig.effectSaleWithRisk}</Typography.Text>
            break
          case 2:
            obj.children = <Typography.Text>{labelConfig.effectCost}</Typography.Text>
            break
          case 3:
            obj.children = <Typography.Text>{labelConfig.effectCostWithRisk}</Typography.Text>
            break
          case 4:
            obj.children = <Typography.Text>{labelConfig.cost}</Typography.Text>
            break
          case 5:
            obj.children = <Typography.Text>{labelConfig.risk}</Typography.Text>
            break
        }
        return obj
      },
      ellipsis: true,
      fixed: 'left',
    },
  ]
  for (let i = 0; i < 12; i++) {
    planMeasureColumns.push({
      title:
        (firstMonth + i <= 12 ? targetYear : targetYear + 1) +
        '年' +
        ((firstMonth + i) % 12 == 0 ? 12 : (firstMonth + i) % 12) +
        '月',
      colSpan: 1,
      render: (_value, record) => ({
        children: (
          <Typography.Text>{(record.data[i] / priceUnit).toLocaleString()}</Typography.Text>
        ),
        props: {
          style: {
            textAlign: 'right',
            background: expandedSelectedRowKeys.includes(record.key) ? '#8ec26e' : '#ffffff',
          },
        },
      }),
      ellipsis: true,
    })
  }
  for (let i = 0; i < 4; i++) {
    planMeasureColumns.push({
      title: targetYear + i + 1 + '年度',
      colSpan: 1,
      render: (_value, record) => ({
        children: (
          <Typography.Text>{(record.data[i + 12] / priceUnit).toLocaleString()}</Typography.Text>
        ),
        props: {
          style: {
            textAlign: 'right',
            background: expandedSelectedRowKeys.includes(record.key) ? '#8ec26e' : '#ffffff',
          },
        },
      }),
      ellipsis: true,
    })
  }

  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>()

  useEffect(() => {
    if (renderState == 'Ready') {
      const obj: (string | number)[] = []
      if (selectedRowIds && selectedRowIds.length > 0) {
        selectedRowIds?.forEach((value) => {
          const indexSelected = planMeasures?.findIndex((planMeasure) => planMeasure.id == value)
          if (indexSelected != -1) {
            obj.push(`${indexSelected}_1`)
            obj.push(`${indexSelected}_2`)
            obj.push(`${indexSelected}_3`)
            obj.push(`${indexSelected}_4`)
            obj.push(`${indexSelected}_6`)
            obj.push(`${indexSelected}_7`)
          }
        })
        setSelectedRowKeys(obj)
        setRenderState('Finish')
      } else {
        setRenderState('Finish')
      }
    }
  }, [planMeasures, renderState, selectedRowIds, setRenderState])

  const expandedSelectedRowKeys = useMemo(() => {
    const obj: (string | number)[] = []
    selectedRowKeys?.forEach((value) => {
      if (value.toString().endsWith('_1')) {
        obj.push(value)
        obj.push(value.toString().slice(0, value.toString().length - 1) + '2')
        obj.push(value.toString().slice(0, value.toString().length - 1) + '3')
        obj.push(value.toString().slice(0, value.toString().length - 1) + '4')
        obj.push(value.toString().slice(0, value.toString().length - 1) + '6')
        obj.push(value.toString().slice(0, value.toString().length - 1) + '7')
      }
    })
    return obj
  }, [selectedRowKeys])

  return (
    <Table
      rowSelection={{
        columnTitle: '選択',
        type: 'checkbox',
        hideSelectAll: true,
        onChange: (selectedRowKeys, selectedRows) => {
          setSelectedRowKeys(selectedRowKeys)
          props.onSelected(
            selectedRows.filter((value) => value.key.endsWith('_1')).map((value) => value.id)
          )
        },
        renderCell: (value, _record, index, originNode) => ({
          children: originNode,
          props: {
            rowSpan: index % 6 === 0 ? 6 : 0,
            style: { background: value ? '#8ec26e' : '#ffffff' },
          },
        }),
        selectedRowKeys: expandedSelectedRowKeys,
      }}
      columns={planMeasureColumns}
      dataSource={planMeasureColumnData}
      size={'small'}
      pagination={false}
      scroll={{ x: true }}
    />
  )
}

export default PlanMeasuresSelectionTable

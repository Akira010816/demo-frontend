import { FC, useEffect, useMemo, useState } from 'react'
import { Typography } from 'antd'
import { ColumnsType } from 'antd/es/table'
import Table from '../table'
import {
  displaySetting,
  EffectSaleProjectTypes,
  PlanMeasureCostItemTypes,
} from '~/lib/displaySetting'

const PAGE_ID = 'planMeasuresConfirmForm'
const labelConfig = displaySetting[PAGE_ID].labelConfig

export type PlanMeasureSummaryProps = {
  planMeasures?: Array<PlanMeasure>
  ids?: Array<number>
  priceUnit: number
  targetYear: number
  firstMonth: number
}

type PlanMeasureSummaryColumn = { key: string; id: number; name: string; data: number[] }

const defaultPlanMeasureSummaryData: PlanMeasureSummaryColumn = {
  key: '0',
  id: 0,
  name: '',
  data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
}

const PlanMeasureSummaryTable: FC<PlanMeasureSummaryProps> = ({
  planMeasures,
  ids,
  priceUnit,
  targetYear,
  firstMonth,
}) => {
  const [planMeasureSummaryColumnDataRaw, setPlanMeasureSummaryColumnDataRaw] = useState<
    Array<PlanMeasureSummaryColumn>
  >([])

  const selectedPlanMeasures = useMemo(
    () =>
      planMeasures?.filter(
        (planMeasure) => planMeasure.id != undefined && ids?.includes(planMeasure.id)
      ),
    [planMeasures, ids]
  )

  useEffect(() => {
    const columnDataRaw: Array<PlanMeasureSummaryColumn> = []
    selectedPlanMeasures?.forEach((planMeasure, index) => {
      const columnDataRawForEachPlanMeasure: Array<PlanMeasureSummaryColumn> = [
        {
          // 効果(売上 - 売上)の初期データ
          key: index + '_1',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          // 効果(売上 - みなし売上)の初期データ
          key: index + '_2',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          // 効果(コスト)の初期データ
          key: index + '_3',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          // コストの初期データ
          key: index + '_4',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          // リスク(売上)の初期データ
          key: index + '_5',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          // リスク(コスト)の初期データ
          key: index + '_6',
          id: planMeasure.id ?? 0,
          name: planMeasure.measureName ?? '',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ]
      // 効果(売上 - 売上)を初期データに加算
      planMeasure.sales &&
        planMeasure.sales
          .filter((sale) => sale.project !== EffectSaleProjectTypes.deemedSales.propertyName)
          .forEach((planMeasureSale) =>
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
      // 効果(売上 - みなし売上)を初期データに加算
      planMeasure.sales &&
        planMeasure.sales
          .filter((sale) => sale.project === EffectSaleProjectTypes.deemedSales.propertyName)
          .forEach((planMeasureSale) =>
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
      // 効果(コスト)を初期データに加算
      planMeasure.costs &&
        planMeasure.costs
          .filter((cost) => cost.item !== PlanMeasureCostItemTypes.deemedCost.propertyName)
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
              columnDataRawForEachPlanMeasure[5].data[dataIndex] += planMeasurePrice.cost
            } else {
              for (let i = 0; i < 4; i++) {
                if (
                  (planMeasurePrice.yearOfOccurrence == targetYear + i + 1 &&
                    planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                  (planMeasurePrice.yearOfOccurrence == targetYear + 1 + i + 1 &&
                    planMeasurePrice.monthOfOccurrence < firstMonth)
                ) {
                  columnDataRawForEachPlanMeasure[5].data[12 + i] += planMeasurePrice.cost
                }
              }
            }
          })
        )
      columnDataRaw.push(...columnDataRawForEachPlanMeasure)
    })
    setPlanMeasureSummaryColumnDataRaw(columnDataRaw)
  }, [selectedPlanMeasures, targetYear, firstMonth])

  const planMeasureSummaryColumnData: Array<PlanMeasureSummaryColumn> = useMemo(() => {
    const obj: Array<PlanMeasureSummaryColumn> = []
    const numOfRawDataColumns = 6
    const rawEffectSaleIndex = 0
    const rawDeemedSaleIndex = 1
    const rawEffectCostIndex = 2
    const rawCostIndex = 3
    const rawRiskSaleIndex = 4
    const rawRiskCostIndex = 5
    const effectSaleIndex = 0
    const deemedSaleIndex = 1
    const effectSaleIncludingRiskIndex = 2
    const effectCostIndex = 3
    const effectCostIncludingRiskIndex = 4
    const costIndex = 5
    const riskIndex = 6

    // 最初に表示用のデフォルトデータを用意
    for (let i = 0; i < 7; i++) {
      obj.push({
        key: defaultPlanMeasureSummaryData.key + '_' + i,
        id: defaultPlanMeasureSummaryData.id,
        name: defaultPlanMeasureSummaryData.name,
        data: [...defaultPlanMeasureSummaryData.data],
      })
    }
    if (planMeasureSummaryColumnDataRaw.length > 0) {
      // 効果(売上 - 売上)のデータを選択された施策の合計値に更新
      obj[effectSaleIndex].data = [
        ...planMeasureSummaryColumnDataRaw
          .map((value) => value.data)
          .filter((_value, index) => index % numOfRawDataColumns == rawEffectSaleIndex)
          .reduce(
            (previousValue, currentValue) =>
              previousValue.map((value, index) => value + currentValue[index]),
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          ),
      ]
      // 効果(売上 - みなし売上)のデータを選択された施策の合計値に更新
      obj[deemedSaleIndex].data = [
        ...planMeasureSummaryColumnDataRaw
          .map((value) => value.data)
          .filter((_value, index) => index % numOfRawDataColumns == rawDeemedSaleIndex)
          .reduce(
            (previousValue, currentValue) =>
              previousValue.map((value, index) => value + currentValue[index]),
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          ),
      ]
      // 効果(コスト)のデータを選択された施策の合計値に更新
      obj[effectCostIndex].data = [
        ...planMeasureSummaryColumnDataRaw
          .map((value) => value.data)
          .filter((_value, index) => index % numOfRawDataColumns == rawEffectCostIndex)
          .reduce(
            (previousValue, currentValue) =>
              previousValue.map((value, index) => value + currentValue[index]),
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          ),
      ]
      // コストのデータを選択された施策の合計値に更新
      obj[costIndex].data = [
        ...planMeasureSummaryColumnDataRaw
          .map((value) => value.data)
          .filter((_value, index) => index % numOfRawDataColumns == rawCostIndex)
          .reduce(
            (previousValue, currentValue) =>
              previousValue.map((value, index) => value + currentValue[index]),
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          ),
      ]
      // リスクのデータを選択された施策のリスク(売上)の合計値に更新
      obj[riskIndex].data = [
        ...planMeasureSummaryColumnDataRaw
          .map((value) => value.data)
          .filter((_value, index) => index % numOfRawDataColumns == rawRiskSaleIndex)
          .reduce(
            (previousValue, currentValue) =>
              previousValue.map((value, index) => value + currentValue[index]),
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          ),
      ]
      // 効果(売上)リスク込みのデータを効果(売上)とリスク(売上)のデータから計算して更新
      obj[effectSaleIncludingRiskIndex].data = [
        ...obj[effectSaleIndex].data.map((value, index) => value + obj[riskIndex].data[index]),
      ]
      // 効果(売上)リスク込みのデータの計算に使った後は、リスクのデータを選択された施策のリスク(コスト)の合計値に更新
      obj[riskIndex].data = [
        ...planMeasureSummaryColumnDataRaw
          .map((value) => value.data)
          .filter((_value, index) => index % numOfRawDataColumns == rawRiskCostIndex)
          .reduce(
            (previousValue, currentValue) =>
              previousValue.map((value, index) => value + currentValue[index]),
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          ),
      ]
      // 効果(コスト)リスク込みのデータを効果(コスト)とリスク(コスト)のデータから計算して更新
      obj[effectCostIncludingRiskIndex].data = [
        ...obj[effectCostIndex].data.map((value, index) => value + obj[riskIndex].data[index]),
      ]
    }
    // 効果(売上)リスク込み/効果(コスト)リスク込みのデータの計算に使った後は、リスクのデータを全ての施策の合計値に更新
    obj[riskIndex].data = [...defaultPlanMeasureSummaryData.data]
    planMeasures?.forEach((planMeasure) => {
      planMeasure.risks?.forEach((planMeasureRisk) =>
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
            obj[riskIndex].data[dataIndex] += planMeasurePrice.cost
          } else {
            for (let i = 0; i < 4; i++) {
              if (
                (planMeasurePrice.yearOfOccurrence == targetYear + i + 1 &&
                  planMeasurePrice.monthOfOccurrence >= firstMonth) ||
                (planMeasurePrice.yearOfOccurrence == targetYear + 1 + i + 1 &&
                  planMeasurePrice.monthOfOccurrence < firstMonth)
              ) {
                obj[riskIndex].data[12 + i] += planMeasurePrice.cost
              }
            }
          }
        })
      )
    })
    return obj
  }, [planMeasures, targetYear, firstMonth, planMeasureSummaryColumnDataRaw])

  const planMeasureSummaryColumns: ColumnsType<PlanMeasureSummaryColumn> = [
    {
      title: labelConfig.contents,
      colSpan: 2,
      render: (_value, _record, index) => ({
        children: <Typography.Text>{labelConfig.sum}</Typography.Text>,
        props: {
          rowSpan: index % 7 === 0 ? 7 : 0,
          colSpan: 1,
        },
      }),
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '',
      colSpan: 0,
      render: (_value, _record, index) => {
        const obj = {
          children: <Typography.Text>{labelConfig.effectSale}</Typography.Text>,
        }
        switch (index % 8) {
          case 1:
            obj.children = <Typography.Text>{labelConfig.deemedSales}</Typography.Text>
            break
          case 2:
            obj.children = <Typography.Text>{labelConfig.effectSaleWithRisk}</Typography.Text>
            break
          case 3:
            obj.children = <Typography.Text>{labelConfig.effectCost}</Typography.Text>
            break
          case 4:
            obj.children = <Typography.Text>{labelConfig.effectCostWithRisk}</Typography.Text>
            break
          case 5:
            obj.children = <Typography.Text>{labelConfig.cost}</Typography.Text>
            break
          case 6:
            obj.children = <Typography.Text>{labelConfig.risk}</Typography.Text>
            break
          case 7:
            obj.children = <Typography.Text>{labelConfig.effectMinusCostMinusRisk}</Typography.Text>
            break
        }
        return obj
      },
      ellipsis: true,
      fixed: 'left',
    },
  ]
  for (let i = 0; i < 12; i++) {
    planMeasureSummaryColumns.push({
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
          },
        },
      }),
      ellipsis: true,
    })
  }
  for (let i = 0; i < 4; i++) {
    planMeasureSummaryColumns.push({
      title: targetYear + i + 1 + '年度',
      colSpan: 1,
      render: (_value, record) => ({
        children: (
          <Typography.Text>{(record.data[i + 12] / priceUnit).toLocaleString()}</Typography.Text>
        ),
        props: {
          style: {
            textAlign: 'right',
          },
        },
      }),
      ellipsis: true,
    })
  }

  return (
    <div className={'planmeasure-summary-table'}>
      <style jsx>{`
        .planmeasure-summary-table :global(th .ant-table-cell-content) {
          background-color: #1a77d4;
        }
        .planmeasure-summary-table :global(th.ant-table-cell.ant-table-cell-ellipsis) {
          background-color: #3e8cdb;
        }
      `}</style>
      <Table
        columns={planMeasureSummaryColumns}
        dataSource={planMeasureSummaryColumnData}
        size={'small'}
        pagination={false}
        scroll={{ x: true }}
      />
    </div>
  )
}

export default PlanMeasureSummaryTable

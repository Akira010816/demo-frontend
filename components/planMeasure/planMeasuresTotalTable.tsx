import React, { FC, useCallback } from 'react'
import { PlanMeasureRow, PlanMeasuresTable } from '~/components/planMeasure/planMeasuresTable'

type PlanMeasuresTotalTableProps = {
  startYear: number
  endYear: number
  priceUnit: PriceUnit
  planMeasureRows: Array<PlanMeasureRow>
  clickableName?: boolean
}

export const PlanMeasuresTotalTable: FC<PlanMeasuresTotalTableProps> = (props) => {
  const calcPlanMeasureTotal = useCallback(
    (type: PlanMeasureRow['type']): PlanMeasureRow['results'] => {
      const yearRange = props.endYear - props.startYear + 2
      const years = Array.from({ length: yearRange }, (v, i) => props.startYear + i)
      return years
        .map((year) => ({
          [year]: Array.from({ length: 12 }, (v, i) => i + 1)
            .map((month) => ({
              [month]: props.planMeasureRows
                .filter((row) => row.type === type)
                .reduce((acc, planMeasure) => acc + (planMeasure.results?.[year]?.[month] ?? 0), 0),
            }))
            .reduce((acc, v) => ({ ...acc, [Object.keys(v)[0]]: Object.values(v)[0] }), {}),
        }))
        .reduce((acc, v) => ({ ...acc, [Object.keys(v)[0]]: Object.values(v)[0] }), {})
    },
    [props.endYear, props.planMeasureRows, props.startYear]
  )

  const planMeasureRows: Array<PlanMeasureRow> = [
    {
      id: undefined,
      planMeasureName: '合計',
      typeName: '効果 (売上)',
      type: 'effectSales',
      aggregationType: ['sales'],
      implementationTarget: true,
      results: calcPlanMeasureTotal('effectSales'),
    },
    {
      id: undefined,
      planMeasureName: '合計',
      typeName: '効果(売上)リスク込み',
      type: 'effectSaleIncludingRisk',
      aggregationType: ['risks', 'sales'],
      implementationTarget: true,
      results: calcPlanMeasureTotal('effectSaleIncludingRisk'),
    },
    {
      id: undefined,
      planMeasureName: '合計',
      typeName: '効果 (コスト)',
      type: 'effectCost',
      aggregationType: ['costs'],
      implementationTarget: true,
      results: calcPlanMeasureTotal('effectCost'),
    },
    {
      id: undefined,
      planMeasureName: '合計',
      typeName: '効果 (コスト) リスク込み',
      type: 'effectCostIncludingRisk',
      aggregationType: ['risks', 'costs'],
      implementationTarget: true,
      results: calcPlanMeasureTotal('effectCostIncludingRisk'),
    },
    {
      id: undefined,
      planMeasureName: '合計',
      typeName: 'コスト',
      type: 'cost',
      aggregationType: ['tasks'],
      implementationTarget: true,
      results: calcPlanMeasureTotal('cost'),
    },
    {
      id: undefined,
      planMeasureName: '合計',
      typeName: 'リスク',
      type: 'risk',
      aggregationType: ['risks'],
      implementationTarget: true,
      results: calcPlanMeasureTotal('risk'),
    },
  ]

  // const appendedColumns = [
  //   {
  //     title: '',
  //     colSpan: 0,
  //     rowSpan: 0,
  //     width: 0,
  //     onCell: () => ({
  //       style: {
  //         border: 'none',
  //       },
  //     }),
  //   },
  // ]

  return (
    <div className={'planMeasuresTotalTable'}>
      <style jsx>{`
        .planMeasuresTotalTable :global(.ant-table-tbody > tr.ant-table-row:hover > td:last-child) {
          background: transparent !important;
        }
      `}</style>
      <PlanMeasuresTable
        // appendedColumns={appendedColumns}
        dataSource={planMeasureRows}
        startYear={props.startYear}
        endYear={props.endYear}
        priceUnit={props.priceUnit}
        clickableName={props.clickableName}
      />
    </div>
  )
}

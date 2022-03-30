import React, { FC } from 'react'
import { Row, Space } from 'antd'
import { ColumnsType } from 'antd/es/table'
import Button from '~/components/Button'
import { PlanMeasureRow, PlanMeasuresTable } from '~/components/planMeasure/planMeasuresTable'
import { ButtonProps } from 'antd/es/button'

export type NextYearPlanMeasuresTableProps = {
  startYear: number
  endYear: number
  priceUnit: PriceUnit
  planMeasureRows: Array<PlanMeasureRow>
  clickableName?: boolean
  onCopy: (planMeasureRow: PlanMeasureRow) => ButtonProps['onClick']
  onDelete: (planMeasureRow: PlanMeasureRow) => ButtonProps['onClick']
  loading?: boolean
}

export const NextYearPlanMeasuresTable: FC<NextYearPlanMeasuresTableProps> = (props) => {
  const appendedColumns: ColumnsType<PlanMeasureRow> = [
    {
      title: '操作',
      align: 'center',
      width: 200,
      render: (_, planMeasureRow, rowIndex) => ({
        children: (
          <Space direction={'vertical'} style={{ width: '100%' }}>
            <Row justify={'center'} align={'middle'} style={{ width: '100%' }}>
              <Button
                type="default"
                onClick={props.onCopy(planMeasureRow)}
                loading={!!props.loading}
                style={{ width: '100%' }}
              >
                コピー
              </Button>
            </Row>
            <Row justify={'center'} align={'middle'} style={{ width: '100%' }}>
              <Button
                type="ghost"
                onClick={props.onDelete(planMeasureRow)}
                danger
                loading={!!props.loading}
                style={{ width: '100%', backgroundColor: '#ffffff' }}
              >
                削除
              </Button>
            </Row>
          </Space>
        ),
        props: {
          rowSpan: rowIndex % 6 === 0 ? 6 : 0,
        },
      }),
      rowSpan: 6,
      colSpan: 1,
      fixed: 'right',
    },
  ]

  return (
    <PlanMeasuresTable
      appendedColumns={appendedColumns}
      dataSource={props.planMeasureRows}
      startYear={props.startYear}
      endYear={props.endYear}
      priceUnit={props.priceUnit}
      clickableName={props.clickableName}
    />
  )
}

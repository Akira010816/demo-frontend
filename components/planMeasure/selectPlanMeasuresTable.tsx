import React, { FC } from 'react'
import { PlanMeasureRow, PlanMeasuresTable } from '~/components/planMeasure/planMeasuresTable'

export type SelectPlanMeasureTableProps = {
  startYear: number
  endYear: number
  priceUnit: PriceUnit
  planMeasureRows: Array<PlanMeasureRow>
  onSelectPlanMeasure?: (
    changedPlanMeasureId: Exclude<PlanMeasure['id'], undefined>,
    allSelectedPlanMeasureIds: Array<Exclude<PlanMeasure['id'], undefined>>,
    checked: boolean
  ) => void
  canCopy?: boolean // P2FW-775
}

export const SelectPlanMeasuresTable: FC<SelectPlanMeasureTableProps> = (props) => {
  return (
    <PlanMeasuresTable
      canCopy={props.canCopy} // P2FW-775
      selectable={true}
      showImplementationTarget={true}
      dataSource={props.planMeasureRows}
      startYear={props.startYear}
      endYear={props.endYear}
      priceUnit={props.priceUnit}
      onSelectPlanMeasure={props.onSelectPlanMeasure}
    />
  )
}

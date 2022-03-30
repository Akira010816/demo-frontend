import { DOMAttributes } from 'react'
import { ModalProps } from 'antd/es/modal'

export type TaskCounterResponse = {
  id: string | number
  name: string
  conditions: Array<{
    id: string | number
    name: string
    measures: Array<{
      id: string | number
      name: string
    }>
  }>
}

export type TaskCounterColumn = {
  key: string | number
  task: ColumnItem
  proposal: ColumnItem
  measure: ColumnItem
}

export type ColumnItem = {
  id: string | number
  colSpan: number
  rowSpan: number
  name: string
  entity: Task | TaskProposal | Measure
  isAddMeasure: boolean
  onClick?: (
    taskCounterColumn: TaskCounterColumn
  ) => DOMAttributes<HTMLButtonElement | HTMLAnchorElement>['onClick']
}

export type AddOrEditMeasureModalProps = {
  counterColumn: TaskCounterColumn | null
  onSave?: (column: TaskCounterColumn | null, savedMeasure: Measure, isUpdated?: boolean) => void
  // onClose?: () => void
} & ModalProps

export type AddExistingMeasureModalTypes = ModalProps & {
  measuresOfATask: Array<TaskCounterColumn>
}

export type RemoveMeasureConfirmationModalProps = {
  measure: ColumnItem | null
} & ModalProps

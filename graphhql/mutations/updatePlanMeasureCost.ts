export type PlanMeasureCostInput = {
  id?: number
  item?: PlanMeasureCostItemType
  accountTitle?: Partial<Pick<AccountTitle, 'id'>>
  effectIncDec?: PlanMeasureCostIncDecType
  costRecordingDestination?: string
  department: DepartmentInput
  businessYear: BusinessYearInput
  prices: Array<PlanMeasurePriceInput>
  assigns?: Array<PlanMeasureAssignInput>
  version?: number
}

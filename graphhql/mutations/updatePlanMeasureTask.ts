export type PlanMeasureTaskInput = {
  id?: number
  taskName: string
  accountTitle?: Partial<Pick<AccountTitle, 'id'>>
  costRecordingDestination?: TaskCostRecordingDestinationType
  KPIType?: KPIType
  KPIPeriods?: KPIPeriodType | null
  responsiblePerson?: string
  OtherTypeInput?: string
  KPIThreshold?: string
  KPIThresholdLabel?: string
  KPIThresholdScheduleType?: string
  department: DepartmentInput
  businessYear: BusinessYearInput
  assigns?: Array<PlanMeasureAssignInput>
  prices: Array<PlanMeasurePriceInput>
  allocations: Array<PlanMeasureTaskAllocationInput>
  isNew?: boolean
  version?: number
}

export type PlanMeasureRiskInput = {
  id?: number
  riskName?: string
  accountId?: string
  businessYear: BusinessYearInput
  department: DepartmentInput
  prices?: Array<PlanMeasurePriceInput>
  assigns?: Array<PlanMeasureAssignInput>
  version?: number
}

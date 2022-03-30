export type PlanMeasureSaleInput = {
  id?: number
  project: string
  effectIncDec: string
  department: DepartmentInput
  businessYear: BusinessYearInput
  prices?: Array<PlanMeasurePriceInput>
  version?: number
}

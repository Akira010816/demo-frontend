export type CreatePlanMeasureCostInput = {
  item?: string
  accountId?: string
  effectIncDec?: string
  costRecordingDestination?: string
  prices?: Array<PlanMeasurePrice>
  assigns?: Array<PlanMeasureAssign>
}

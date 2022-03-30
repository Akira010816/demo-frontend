export type CreateMeasureImplementationEffectInput = {
  evaluation: MeasureImplementationEffect['evaluation']
  valueBeforeImprovement: MeasureImplementationEffect['valueBeforeImprovement']
  valueAfterImprovement: MeasureImplementationEffect['valueAfterImprovement']
  calculationBasis: MeasureImplementationEffect['calculationBasis']
  startAt: MeasureImplementationEffect['startAt']
  startAtMemo: MeasureImplementationEffect['startAtMemo']
  measuringMethod: MeasureImplementationEffect['measuringMethod']
  annualCostEffect: MeasureImplementationEffect['annualCostEffect']
}

export const generateCreateMeasureImplementationEffectInputFromEntity = (
  entity: MeasureImplementationEffect
): CreateMeasureImplementationEffectInput => ({
  evaluation: entity.evaluation,
  valueBeforeImprovement: entity.valueAfterImprovement,
  valueAfterImprovement: entity.valueAfterImprovement,
  calculationBasis: entity.calculationBasis,
  startAt: entity.startAt,
  startAtMemo: entity.startAtMemo,
  measuringMethod: entity.measuringMethod,
  annualCostEffect: entity.annualCostEffect,
})

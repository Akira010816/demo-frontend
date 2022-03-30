export type UpdateMeasureImplementationEffectInput = {
  id?: MeasureImplementationEffect['id']
  evaluation: MeasureImplementationEffect['evaluation']
  valueBeforeImprovement: MeasureImplementationEffect['valueBeforeImprovement']
  valueAfterImprovement: MeasureImplementationEffect['valueAfterImprovement']
  calculationBasis: MeasureImplementationEffect['calculationBasis']
  startAt: MeasureImplementationEffect['startAt']
  startAtMemo: MeasureImplementationEffect['startAtMemo']
  measuringMethod: MeasureImplementationEffect['measuringMethod']
  annualCostEffect: MeasureImplementationEffect['annualCostEffect']
}

export const generateUpdateMeasureImplementationEffectInputFromEntity = (
  entity: MeasureImplementationEffect
): UpdateMeasureImplementationEffectInput => ({
  id: entity.id,
  evaluation: entity.evaluation,
  valueBeforeImprovement: entity.valueAfterImprovement,
  valueAfterImprovement: entity.valueAfterImprovement,
  calculationBasis: entity.calculationBasis,
  startAt: entity.startAt,
  startAtMemo: entity.startAtMemo,
  measuringMethod: entity.measuringMethod,
  annualCostEffect: entity.annualCostEffect,
})

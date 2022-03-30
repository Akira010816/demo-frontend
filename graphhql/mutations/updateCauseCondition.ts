export type UpdateCauseConditionInput = {
  achievementCondition: CauseCondition['achievementCondition']
}

export type UpdateCauseConditionRequestTypes = {
  causeConditionInput: UpdateCauseConditionInput
}

export type UpdateCauseConditionResponse = {
  CauseCondition: CauseCondition
}

export const generateUpdateCauseConditionInputFromEntity = (
  entity: CauseCondition
): UpdateCauseConditionInput => ({
  achievementCondition: entity.achievementCondition,
})

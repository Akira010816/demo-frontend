export type CauseConditionInput = {
  id?: CauseCondition['id']
  causeId?: Cause['id']
  achievementCondition: CauseCondition['achievementCondition']
}

export type CreateCauseConditionRequestTypes = {
  causeConditionInput: CauseConditionInput
}

export type CreateCauseConditionResponse = {
  CauseCondition: CauseCondition
}

export const generateCreateCauseConditionInputFromEntity = (
  entity: CauseCondition
): CauseConditionInput => ({
  achievementCondition: entity.achievementCondition,
})

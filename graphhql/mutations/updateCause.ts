export type UpdateCauseInput = {
  text?: Cause['text']
  isHypothesis?: Cause['isHypothesis']
  causeConditions?: Array<CauseCondition>
}

export type UpdateCauseRequestTypes = {
  causeInput: UpdateCauseInput
}

export type UpdateCauseResponse = {
  CauseCause: Cause
}

export const generateUpdateCauseInputFromEntity = (entity: Cause): UpdateCauseInput => ({
  text: entity.text,
  isHypothesis: entity.isHypothesis,
  causeConditions: entity.causeConditions,
})

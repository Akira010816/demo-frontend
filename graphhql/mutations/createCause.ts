export type CauseInput = {
  id?: Cause['id']
  issueId?: Cause['issueId']
  text?: Cause['text']
  isHypothesis?: Cause['isHypothesis']
  causeConditions?: Array<CauseCondition>
}

export type CreateCauseCauseRequestTypes = {
  causeInput: CauseInput
}

export type CreateCauseResponse = {
  CauseCause: Cause
}

export const generateCreateCauseInputFromEntity = (entity: Cause): CauseInput => ({
  text: entity.text,
  isHypothesis: entity.isHypothesis,
  causeConditions: entity.causeConditions,
})

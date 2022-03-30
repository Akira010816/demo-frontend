export type UpdateInvestigationInput = {
  text?: Investigation['text']
}

export type UpdateInvestigationRequestTypes = {
  targetInput: UpdateInvestigationInput
}

export type UpdateInvestigationResponse = {
  updateInvestigation: Investigation
}

export const generateUpdateInvestigationInputFromEntity = (
  entity: Investigation
): UpdateInvestigationInput => ({
  text: entity.text,
})

export type CreateInvestigationInput = {
  text?: Investigation['text']
}

export const generateCreateInvestigationInputFromEntity = (
  entity: Investigation
): CreateInvestigationInput => ({
  text: entity.text,
})

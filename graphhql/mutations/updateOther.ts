export type UpdateOtherInput = {
  text?: Other['text']
}

export type UpdateOtherRequestTypes = {
  targetInput: UpdateOtherInput
}

export type UpdateOtherResponse = {
  updateOther: Other
}

export const generateUpdateOtherInputFromEntity = (entity: Other): UpdateOtherInput => ({
  text: entity.text,
})

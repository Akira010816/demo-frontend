export type CreateOtherInput = {
  text?: Other['text']
}

export const generateCreateOtherInputFromEntity = (entity: Other): CreateOtherInput => ({
  text: entity.text,
})

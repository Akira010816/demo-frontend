export type CreateTargetInput = {
  text?: Target['text']
}

export const generateCreateTargetInputFromEntity = (entity: Target): CreateTargetInput => ({
  text: entity.text,
})

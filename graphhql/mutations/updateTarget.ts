export type UpdateTargetInput = {
  text?: Target['text']
}

export type UpdateTargetRequestTypes = {
  targetInput: UpdateTargetInput
}

export type UpdateTargetResponse = {
  updateTarget: Target
}

export const generateUpdateTargetInputFromEntity = (entity: Target): UpdateTargetInput => ({
  text: entity.text,
})

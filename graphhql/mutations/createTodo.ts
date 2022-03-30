export type CreateTodoInput = {
  text?: Todo['text']
}

export const generateCreateTodoInputFromEntity = (entity: Todo): CreateTodoInput => ({
  text: entity.text,
})

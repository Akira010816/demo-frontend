export type UpdateTodoInput = {
  text?: Todo['text']
}

export type UpdateTodoRequestTypes = {
  targetInput: UpdateTodoInput
}

export type UpdateTodoResponse = {
  updateTodo: Todo
}

export const generateUpdateTodoInputFromEntity = (entity: Todo): UpdateTodoInput => ({
  text: entity.text,
})

import { gql } from 'apollo-boost'
import { SetMeasureInput } from '~/graphhql/mutations/updateMeasure'

export type SetMeasuresToTodosRequestType = {
  todosInput: Array<{
    id?: number
    measures?: Array<SetMeasureInput>
  }>
}

export const SET_MEASURES_TO_TODOS = gql`
  mutation($todosInput: [TodoInput!]!) {
    setMeasuresToTodos(todosInput: $todosInput) {
      id
    }
  }
`

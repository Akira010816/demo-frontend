import { gql } from 'apollo-boost'

export const DELETE_TASK = gql`
  mutation($id: Float!, $version: Float!) {
    deleteTask(deleteTaskInput: { id: $id, version: $version }) {
      __typename
    }
  }
`

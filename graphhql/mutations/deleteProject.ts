import { gql } from 'apollo-boost'

export const DELETE_PROJECT = gql`
  mutation($id: Float!, $version: Float!) {
    deleteProject(deleteProjectInput: { id: $id, version: $version }) {
      __typename
    }
  }
`

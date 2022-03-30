import { gql } from 'apollo-boost'

export const LOGIN = gql`
  mutation($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      userId
      departmentId
      userDepartmentId
      positionWeight
    }
  }
`

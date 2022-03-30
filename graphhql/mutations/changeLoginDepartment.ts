import { gql } from 'apollo-boost'

export const CHANGE_LOGIN_DEPARTMENT = gql`
  mutation($changeDepartmentInput: ChangeDepartmentInput!) {
    changeLoginDepartment(changeDepartmentInput: $changeDepartmentInput) {
      accessToken
      userId
      departmentId
      userDepartmentId
      positionWeight
    }
  }
`

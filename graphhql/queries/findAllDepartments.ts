import gql from 'graphql-tag'

export type FindAllDepartmentsResponse = {
  findAllDepartments: Array<Department>
}

export const FIND_ALL_DEPARTMENTS = gql`
  query findAllDepartments {
    findAllDepartments {
      id
      code
      name
      departmentLevel {
        order
        name
      }
      isCommon
      version
      parent {
        id
      }
    }
  }
`

import gql from 'graphql-tag'

export type FindAllUserDepartmentsResponse = {
  findAllUserDepartments: Array<UserDepartment>
}

export const FIND_ALL_USERDEPARTMENTS = gql`
  query findAllUserDepartments {
    findAllUserDepartments {
      id
      user {
        id
        name
        salary {
          salary
        }
      }
      department {
        id
        name
        departmentLevel {
          order
        }
      }
      createdAt
      updatedAt
    }
  }
`

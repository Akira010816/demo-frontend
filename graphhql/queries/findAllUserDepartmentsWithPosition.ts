import gql from 'graphql-tag'

export type FindAllUserDepartmentsWithPositionResponse = {
  findAllUserDepartments: Array<UserDepartmentWithPosition>
}

export const FIND_ALL_USERDEPARTMENTS_WITH_POSITION = gql`
  query findAllUserDepartmentsWithPosition {
    findAllUserDepartments {
      id
      user {
        id
        name
      }
      department {
        id
        code
        name
        departmentLevel {
          order
        }
      }
      position {
        id
        name
        weight
      }
      createdAt
      updatedAt
    }
  }
`

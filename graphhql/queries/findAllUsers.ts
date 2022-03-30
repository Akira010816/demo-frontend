import gql from 'graphql-tag'

export type FindAllUsersResponse = {
  findAllUsers: Array<User>
}

export const FIND_ALL_USERS = gql`
  query findAllUsers {
    findAllUsers {
      id
      name
      client {
        id
        name
      }
      userDepartments {
        departments {
          id
          name
        }
      }
      createdAt
      updatedAt
    }
  }
`

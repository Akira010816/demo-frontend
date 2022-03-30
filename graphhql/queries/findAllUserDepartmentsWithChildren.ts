import gql from 'graphql-tag'

export type FindAllUserDepartmentsWithChildrenResponse = {
  findAllUserDepartmentsWithChildren: UserDepartment[]
}

export const FIND_ALL_USER_DEPARTMENTS_WITH_CHILDREN = gql`
  query findAllUserDepartmentsWithChildren {
    findAllUserDepartmentsWithChildren {
      id
      version
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
        # GraphQL doesn't allow recursive fields
        # ref => https://github.com/graphql/graphql-spec/issues/91#issuecomment-514657401
        # Manually allow up to 10 levels for now
        children {
          id
          name
          children {
            id
            name
            children {
              id
              name
              children {
                id
                name
                children {
                  id
                  name
                  children {
                    id
                    name
                    children {
                      id
                      name
                      children {
                        id
                        name
                        children {
                          id
                          name
                          children {
                            id
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

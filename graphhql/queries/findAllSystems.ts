import gql from 'graphql-tag'

export type FindAllSystemsResponse = {
  findAllSystems: Array<System>
}

export const FIND_ALL_SYSTEMS = gql`
  query findAllSystems {
    findAllSystems {
      id
      name
    }
  }
`

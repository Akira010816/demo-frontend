import gql from 'graphql-tag'

export type FindAllPositionsResponse = {
  findAllPositions: Array<Position>
}

export const FIND_ALL_POSITIONS = gql`
  query findAllPositions {
    findAllPositions {
      id
      name
      weight
    }
  }
`

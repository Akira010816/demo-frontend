import gql from 'graphql-tag'

export type FindPriceUnit = {
  findPriceUnit: PriceUnit
}

export const FIND_PRICE_UNIT = gql`
  query findPriceUnit {
    findPriceUnit {
      id
      digitLength
    }
  }
`

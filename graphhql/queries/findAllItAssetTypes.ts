import gql from 'graphql-tag'

export type FindAllItAssetTypesResponse = {
  findAllItAssetTypes: Array<ItAssetType>
}

export const FIND_ALL_IT_ASSET_TYPES = gql`
  query findAllItAssetTypes {
    findAllItAssetTypes {
      id
      code
    }
  }
`

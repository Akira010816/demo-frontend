import gql from 'graphql-tag'

export type FindAllAccountTitlesResponse = {
  findAllAccountTitles: Array<AccountTitle>
}

export const FIND_ALL_ACCOUNT_TITLES = gql`
  query findAllAccountTitles {
    findAllAccountTitles {
      id
      name
      type
      version
      accountDisplayTitle {
        id
        name
        type
      }
    }
  }
`

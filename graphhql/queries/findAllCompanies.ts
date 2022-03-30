import gql from 'graphql-tag'

export type FindAllCompaniesResponse = {
  findAllCompanies: Array<Company>
}

export const FIND_ALL_COMPANIES = gql`
  query findAllCompanies {
    findAllCompanies {
      id
      name
    }
  }
`

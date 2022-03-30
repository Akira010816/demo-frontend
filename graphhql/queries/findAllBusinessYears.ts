import gql from 'graphql-tag'

export type FindAllBusinessYearsResponse = {
  findAllBusinessYears: Array<BusinessYear>
}

export const FIND_ALL_BUSINESS_YEARS = gql`
  query findAllBusinessYears {
    findAllBusinessYears {
      id
      year
      name
      startYear
      startMonth
      startDate
      endYear
      endMonth
      endDate
      version
    }
  }
`

import gql from 'graphql-tag'

export type FindBusinessYearsByRangeRequest = {
  findBusinessYearsByRangeInput: {
    startYear: BusinessYear['year']
    endYear: BusinessYear['year']
  }
}

export type FindBusinessYearsByRangeResponse = {
  findBusinessYearsByRange: Array<BusinessYear>
}

export const FIND_BUSINESS_YEARS_BY_RANGE = gql`
  query findBusinessYearsByRange($findBusinessYearsByRangeInput: FindBusinessYearsByRangeInput!) {
    findBusinessYearsByRange(findBusinessYearsByRangeInput: $findBusinessYearsByRangeInput) {
      id
      year
      startYear
      startMonth
      endYear
      endMonth
    }
  }
`

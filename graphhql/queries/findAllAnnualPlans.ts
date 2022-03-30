import gql from 'graphql-tag'

export type FindAllAnnualPlansResponse = {
  findAllAnnualPlans: Array<AnnualPlan>
}

export const FIND_ALL_ANNUAL_PLANS = gql`
  query findAllAnnualPlans {
    findAllAnnualPlans {
      id
      version
      department {
        id
      }
      businessYear {
        id
        year
      }
      client {
        id
      }
    }
  }
`

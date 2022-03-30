import gql from 'graphql-tag'

export type FindAnnualPlanByYearRequestTypes = {
  findAnnualPlanByYearInput: {
    year: number
    organizationLevel: number
  }
}

export type FindAnnualPlanByYearResponse = {
  findAnnualPlanByYear: AnnualPlan | undefined
}

export const FIND_ANNUAL_PLAN_BY_YEAR = gql`
  query findAnnualPlanByYear($findAnnualPlanByYearInput: FindAnnualPlanByYearInput!) {
    findAnnualPlanByYear(findAnnualPlanByYearInput: $findAnnualPlanByYearInput) {
      id
      status
      updatedAt
      version
      plans {
        id
        status
        targetSales
        deemedSales
        targetSalesCost
        targetSellingExpense
        targetSellingExpenseOfOwnDepartment
        targetGeneralAdministrativeExpense
        createdAt
        updatedAt
        version
        department {
          id
          name
        }
      }
    }
  }
`

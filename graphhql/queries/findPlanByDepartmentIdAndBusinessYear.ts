import gql from 'graphql-tag'

export type FindPlanByDepartmentIdAndBusinessYearRequestTypes = {
  findPlanByDepartmentIdAndBusinessYearInput: {
    departmentId: Department['id']
    businessYear: BusinessYear['year']
  }
}

export type FindPlanByDepartmentIdAndBusinessYearResponse = {
  findPlanByDepartmentIdAndBusinessYear?: Plan
}

export const FIND_PLAN_BY_DEPARTMENT_ID_AND_BUSINESS_YEAR = gql`
  query findPlanByDepartmentIdAndBusinessYear(
    $findPlanByDepartmentIdAndBusinessYearInput: FindPlanByDepartmentIdAndBusinessYearInput!
  ) {
    findPlanByDepartmentIdAndBusinessYear(
      findPlanByDepartmentIdAndBusinessYearInput: $findPlanByDepartmentIdAndBusinessYearInput
    ) {
      id
      planMeasureRegistrationRequests {
        id
        code
        until
        requestedBy {
          id
          user {
            name
          }
        }
        plan {
          id
        }
      }
      createdAt
      updatedAt
    }
  }
`

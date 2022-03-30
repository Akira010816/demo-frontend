import { gql } from 'apollo-boost'

export type CreateAnnualPlanInput = {
  businessYearId: BusinessYear['id']
}

export const generateCreateAnnualPlanInputFromEntity = (
  entity: BusinessYear
): CreateAnnualPlanInput => ({
  businessYearId: entity.id,
})

export type CreateAnnualPlanRequest = {
  createAnnualPlanInput: CreateAnnualPlanInput
}

export type CreateAnnualPlanResponse = {
  createAnnualPlan: AnnualPlan
}

export const CREATE_ANNUAL_PLAN = gql`
  mutation($createAnnualPlanInput: CreateAnnualPlanInput!) {
    createAnnualPlan(createAnnualPlanInput: $createAnnualPlanInput) {
      id
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

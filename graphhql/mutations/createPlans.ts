import { gql } from 'apollo-boost'

export type CreatePlanInput = {
  departmentId: Department['id']
  targetSales?: Plan['targetSales']
  deemedSales?: Plan['deemedSales']
  targetSalesCost?: Plan['targetSalesCost']
  targetSellingExpense?: Plan['targetSellingExpense']
  targetGeneralAdministrativeExpense?: Plan['targetGeneralAdministrativeExpense']
  annualPlanId: AnnualPlan['id']
}

export const generateCreatePlanInputFromEntity = (
  department: Department,
  annualPlan: AnnualPlan,
  plan?: Plan
): CreatePlanInput => ({
  departmentId: department.id,
  targetSales: plan ? plan.targetSales : undefined,
  deemedSales: plan ? plan.deemedSales : undefined,
  targetSalesCost: plan ? plan.targetSalesCost : undefined,
  targetSellingExpense: plan ? plan.targetSellingExpense : undefined,
  targetGeneralAdministrativeExpense: plan ? plan.targetGeneralAdministrativeExpense : undefined,
  annualPlanId: annualPlan.id,
})

export type CreatePlansRequest = {
  createPlansInput: {
    plans: Array<CreatePlanInput>
  }
}

export type CreatePlansResponse = {
  createPlans: Array<Plan>
}

export const CREATE_PLANS = gql`
  mutation($createPlansInput: CreatePlansInput!) {
    createPlans(createPlansInput: $createPlansInput) {
      id
      department {
        id
      }
      deemedSales
      targetSales
      targetSalesCost
      targetSellingExpense
      targetGeneralAdministrativeExpense
      annualPlan {
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
  }
`

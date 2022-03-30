import { gql } from 'apollo-boost'

export type CreatePlanFormulationRequestInput = {
  planId: PlanFormulationRequest['planId']
  until: PlanFormulationRequest['until']
  requestedTo: PlanFormulationRequest['requestedTo']
}

export const generateCreatePlanFormulationRequestInputFromEntity = (
  entity: PlanFormulationRequest
): CreatePlanFormulationRequestInput => ({
  planId: entity.planId,
  until: new Date(entity.until).toDateString(),
  requestedTo: entity.requestedTo,
})

export type CreatePlanFormulationRequestRequestTypes = {
  createPlanFormulationRequestInput: CreatePlanFormulationRequestInput
}

export type CreatePlanFormulationRequestResponse = {
  createPlanFormulationRequest: PlanFormulationRequest
}

export const CREATE_PLAN_FORMULATION_REQUEST = gql`
  mutation($createPlanFormulationRequestInput: CreatePlanFormulationRequestInput!) {
    createPlanFormulationRequest(
      createPlanFormulationRequestInput: $createPlanFormulationRequestInput
    ) {
      id
      plan {
        id
      }
      until
      requestedTo {
        id
      }
    }
  }
`

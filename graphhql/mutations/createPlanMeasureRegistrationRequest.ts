import { gql } from 'apollo-boost'

export type CreatePlanMeasureRegistrationRequestInput = {
  planId: PlanMeasureRegistrationRequest['planId']
  until: PlanMeasureRegistrationRequest['until']
  requestedTo: PlanMeasureRegistrationRequest['requestedTo']
}

export const generateCreatePlanMeasureRegistrationRequestInputFromEntity = (
  entity: PlanMeasureRegistrationRequest
): CreatePlanMeasureRegistrationRequestInput => ({
  planId: entity.planId,
  until: new Date(entity.until).toDateString(),
  requestedTo: entity.requestedTo,
})

export type CreatePlanMeasureRegistrationRequestRequestTypes = {
  createPlanMeasureRegistrationRequestInput: CreatePlanMeasureRegistrationRequestInput
}

export type CreatePlanMeasureRegistrationRequestResponse = {
  createPlanMeasureRegistrationRequest: PlanMeasureRegistrationRequest
}

export const CREATE_PLAN_MEASURE_REGISTRATION_REQUEST = gql`
  mutation($createPlanMeasureRegistrationRequestInput: CreatePlanMeasureRegistrationRequestInput!) {
    createPlanMeasureRegistrationRequest(
      createPlanMeasureRegistrationRequestInput: $createPlanMeasureRegistrationRequestInput
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

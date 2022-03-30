import { gql } from 'apollo-boost'

export type CompleteRegistrationPlanMeasureInput = {
  planMeasureRegistrationRequestId: PlanMeasureRegistrationRequest['id']
  comment?: string
}

export type CompleteRegistrationPlanMeasuresRequestTypes = {
  completeRegistrationPlanMeasuresInput: CompleteRegistrationPlanMeasureInput
}

export type CompleteRegistrationPlanMeasuresResponse = boolean

export const COMPLETE_REGISTRATION_PLAN_MEASURES = gql`
  mutation($completeRegistrationPlanMeasuresInput: CompleteRegistrationPlanMeasuresInput!) {
    completeRegistrationPlanMeasures(
      completeRegistrationPlanMeasuresInput: $completeRegistrationPlanMeasuresInput
    )
  }
`

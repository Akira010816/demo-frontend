import { gql } from 'apollo-boost'

export const DELETE_PLAN_MEASURE_RISK = gql`
  mutation($id: Float!, $version: Float!) {
    deletePlanMeasureRisk(deletePlanMeasureRisk: { id: $id, version: $version }) {
      __typename
    }
  }
`

import { gql } from 'apollo-boost'
import { SetMeasureInput } from '~/graphhql/mutations/updateMeasure'

export type SetMeasuresToTargetsRequestType = {
  targetsInput: Array<{
    id?: number
    measures?: Array<SetMeasureInput>
  }>
}

export const SET_MEASURES_TO_TARGETS = gql`
  mutation($targetsInput: [TargetInput!]!) {
    setMeasuresToTargets(targetsInput: $targetsInput) {
      id
    }
  }
`

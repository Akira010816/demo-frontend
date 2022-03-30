import { gql } from 'apollo-boost'
import { SetMeasureInput } from '~/graphhql/mutations/updateMeasure'

export type SetMeasuresRequestType = {
  causesInput: Array<{
    id?: number
    measures?: Array<SetMeasureInput>
  }>
}

export const SET_MEASURES_TO_CAUSES = gql`
  mutation($causesInput: [CauseInput!]!) {
    setMeasuresToCauses(causesInput: $causesInput) {
      id
    }
  }
`

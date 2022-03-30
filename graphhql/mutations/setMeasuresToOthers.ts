import { gql } from 'apollo-boost'
import { SetMeasureInput } from '~/graphhql/mutations/updateMeasure'

export type SetMeasuresToOthersRequestType = {
  othersInput: Array<{
    id?: number
    measures?: Array<SetMeasureInput>
  }>
}

export const SET_MEASURES_TO_OTHERS = gql`
  mutation($othersInput: [OtherInput!]!) {
    setMeasuresToOthers(othersInput: $othersInput) {
      id
    }
  }
`

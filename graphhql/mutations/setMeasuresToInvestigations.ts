import { gql } from 'apollo-boost'
import { SetMeasureInput } from '~/graphhql/mutations/updateMeasure'

export type SetMeasuresToInvestigationsRequestType = {
  investigationsInput: Array<{
    id?: number
    measures?: Array<SetMeasureInput>
  }>
}

export const SET_MEASURES_TO_INVESTIGATIONS = gql`
  mutation($investigationsInput: [InvestigationInput!]!) {
    setMeasuresToInvestigations(investigationsInput: $investigationsInput) {
      id
    }
  }
`

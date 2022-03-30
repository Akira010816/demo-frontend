import { gql } from 'apollo-boost'
import { SetMeasureInput } from '~/graphhql/mutations/updateMeasure'

export type SetMeasuresToStudyContentsRequestType = {
  studyContentsInput: Array<{
    id?: number
    measures?: Array<SetMeasureInput>
  }>
}

export const SET_MEASURES_TO_STUDY_CONTENTS = gql`
  mutation($studyContentsInput: [StudyContentInput!]!) {
    setMeasuresToStudyContents(studyContentsInput: $studyContentsInput) {
      id
    }
  }
`

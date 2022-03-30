import { gql } from 'apollo-boost'
import {
  UpdateCauseInput,
  generateUpdateCauseInputFromEntity,
} from '~/graphhql/mutations/updateCause'
import {
  UpdateCauseConditionInput,
  generateUpdateCauseConditionInputFromEntity,
} from '~/graphhql/mutations/updateCauseCondition'

export type UpdateIssueInput = {
  id: Issue['id']
  occurStatus?: Issue['occurStatus']
  occurCount?: Issue['occurCount']
  occurFrequency?: Issue['occurFrequency']
  occurFrequencyDetail?: Issue['occurFrequencyDetail']
  contents?: Issue['contents']
  impact?: Issue['impact']
  causes?: Array<UpdateCauseInput> & { causeConditions?: Array<UpdateCauseConditionInput> }
}

export type UpdateIssueRequestTypes = {
  issueInput: UpdateIssueInput
}

export type UpdateIssueResponse = {
  updateIssue: Issue
}

export const generateUpdateIssueInputFromEntity = (entity: Issue): UpdateIssueInput => ({
  id: entity.id,
  occurStatus: entity.occurStatus,
  occurCount: entity.occurCount,
  occurFrequency: entity.occurFrequency,
  occurFrequencyDetail: entity.occurFrequencyDetail,
  contents: entity.contents,
  impact: entity.impact,
  causes: entity.causes?.map((cause) =>
    generateUpdateCauseInputFromEntity({
      ...cause,
      causeConditions: cause.causeConditions?.map((causeCondition) =>
        generateUpdateCauseConditionInputFromEntity(causeCondition)
      ) as Array<CauseCondition>,
    })
  ),
})

export const UPDATE_ISSUE = gql`
  mutation($issueInput: IssueInput!) {
    updateIssue(issueInput: $issueInput) {
      id
      occurStatus
      occurCount
      occurFrequency
      occurFrequencyDetail
      contents
      impact
      causes {
        id
        issueId
        text
        isHypothesis
        createdAt
        updatedAt
        causeConditions {
          id
          causeId
          achievementCondition
          createdAt
          updatedAt
        }
      }
      createdAt
      updatedAt
    }
  }
`

import { gql } from 'apollo-boost'
import { CauseInput, generateCreateCauseInputFromEntity } from '~/graphhql/mutations/createCause'
import {
  CauseConditionInput,
  generateCreateCauseConditionInputFromEntity,
} from '~/graphhql/mutations/createCauseCondition'
import { SetMeasureInput } from '~/graphhql/mutations/updateMeasure'

export type CreateIssueInput = {
  occurStatus?: Issue['occurStatus']
  occurCount?: Issue['occurCount']
  occurFrequency?: Issue['occurFrequency']
  occurFrequencyDetail?: Issue['occurFrequencyDetail']
  contents?: Issue['contents']
  impact?: Issue['impact']
  causes?: Array<CauseInput> & { causeConditions?: Array<CauseConditionInput> }
  measures?: Array<SetMeasureInput>
}

export type CreateIssueRequestTypes = {
  issueInput: CreateIssueInput
}

export type CreateIssueResponse = {
  createIssue: Issue
}

export const generateCreateIssueInputFromEntity = (entity: Issue): CreateIssueInput => ({
  occurStatus: entity.occurStatus,
  occurCount: entity.occurCount,
  occurFrequency: entity.occurFrequency,
  occurFrequencyDetail: entity.occurFrequencyDetail,
  contents: entity.contents,
  impact: entity.impact,
  causes: entity.causes?.map((cause) =>
    generateCreateCauseInputFromEntity({
      ...cause,
      causeConditions: cause.causeConditions?.map((causeCondition) =>
        generateCreateCauseConditionInputFromEntity(causeCondition)
      ) as Array<CauseCondition>,
    })
  ),
})

export const CREATE_ISSUE = gql`
  mutation($issueInput: IssueInput!) {
    createIssue(issueInput: $issueInput) {
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

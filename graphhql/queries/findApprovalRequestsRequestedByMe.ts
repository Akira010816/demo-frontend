import gql from 'graphql-tag'

export type FindApprovalRequestsRequestedByMeRequestTypes = {
  findApprovalRequestsRequestedByMeInput: {
    approvalCategorySlug?: string
  }
}

export type FindApprovalRequestsRequestedByMeResponse = {
  findApprovalRequestsRequestedByMe: Array<ApprovalRequest>
}

export const FIND_APPROVAL_REQUESTS_REQUESTED_BY_ME = gql`
  query findApprovalRequestsRequestedByMe(
    $findApprovalRequestsRequestedByMeInput: FindApprovalRequestsRequestedByMeInput!
  ) {
    findApprovalRequestsRequestedByMe(
      findApprovalRequestsRequestedByMeInput: $findApprovalRequestsRequestedByMeInput
    ) {
      id
      code
      until
      message
      status
      createdAt
      updatedAt
      approvalCategory {
        id
        name
        slug
        approvalEmailTemplate {
          id
          approvalNextMessage
          approvalRequesterMessage
          cancelMessage
          rejectMessage
          requestMessage
        }
        approvalRequestMessageTemplate {
          id
          message
        }
      }
      requestedBy {
        id
        user {
          id
          name
        }
        department {
          name
        }
      }
      approvalFlow {
        id
        approvalSteps {
          id
          name
          type
          order
          department {
            id
            name
          }
          approvalStepAssignees {
            id
            comment
            approvalStatus
            statusChangedAt
            userDepartment {
              department {
                name
              }
              user {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`

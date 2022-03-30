import gql from 'graphql-tag'

export type FindApprovalRequestsAssignedToMeResponse = {
  findApprovalRequestsAssignedToMe: Array<ApprovalRequest>
}

export const FIND_APPROVAL_REQUESTS_ASSIGNED_TO_ME = gql`
  query findApprovalRequestsAssignedToMe {
    findApprovalRequestsAssignedToMe {
      id
      code
      until
      message
      createdAt
      updatedAt
      approvalCategory {
        id
        name
        slug
      }
      requestedBy {
        id
        user {
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

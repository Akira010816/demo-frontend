import gql from 'graphql-tag'

export type FindApprovalFlowResponse = {
  findApprovalFlow: ApprovalFlow
}

export const FIND_APPROVAL_FLOW = gql`
  query findApprovalFlow {
    findApprovalFlow {
      name
      approvalSteps {
        name
        type
        order
        isEditableFlow
        isSkippableFlow
        isRequesterIncluded
        approverType
        department {
          id
          name
        }
        approvalStepAssignees {
          comment
          approvalStatus
          userDepartment {
            id
            user {
              id
              name
            }
            department {
              id
              name
            }
          }
        }
      }
    }
  }
`

import gql from 'graphql-tag'

export type FindApprovalCategoryBySlugRequest = {
  slug: ApprovalCategory['slug']
}

export type FindApprovalCategoryBySlugResponse = {
  findApprovalCategoryBySlug: ApprovalCategory
}

export const FIND_APPROVAL_CATEGORY_BY_SLUG = gql`
  query findApprovalCategoryBySlug($slug: String!) {
    findApprovalCategoryBySlug(slug: $slug) {
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
  }
`

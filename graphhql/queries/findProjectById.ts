import gql from 'graphql-tag'

export const FIND_PROJECT_BY_ID = gql`
  query($id: Int!) {
    findProjectById(id: $id) {
      id
      name
      status
      projectCode
      description
      impact
      premiseCondition
      raisedDepartment {
        id
        name
      }
      raisedUser {
        id
        name
      }
      achievementConditions {
        description
      }
      owner {
        id
        department {
          name
        }
        user {
          name
        }
      }
      members {
        id
        department {
          name
        }
        user {
          name
        }
      }
      startDate
      milestones {
        id
        type
        targetDate
        description
      }
      schedules {
        id
        type
        startDate
        endDate
      }
      priority
      updatedAt
      updatedAt
      version
    }
  }
`

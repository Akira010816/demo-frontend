import gql from 'graphql-tag'

export type Position = {
  id: string
  name: string
  weight: number
  accessControl?: AccessControl[]
}

export type Profile = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  client?: { slug: string }
  userDepartments?: Array<{
    id: number
    department: { id: number; code: string; name: string }
    position: Position
    accessControl?: AccessControl[]
  }>
  currentDepartmentId?: number
  currentUserDepartmentId?: number
  currentPositionWeight?: number
}

export type FindProfileResponse = {
  findProfile: Profile
}

export const FIND_PROFILE = gql`
  query {
    findProfile {
      id
      name
      client {
        slug
      }
      userDepartments {
        id
        department {
          id
          name
        }
        position {
          id
          name
          weight
          accessControl {
            identityType
            planAccessType
            planMeasureAccessType
            planApprovalAccessType
            planFormulationRequestFlag
            planMeasureRegistrationRequestFlag
            planMeasureConfirmFlag
            # P2FW-719
            # targetDepartmentCategory
            targetDepartmentLevel {
              id
              name
              order
            }
          }
        }
        accessControl {
          identityType
          planAccessType
          planMeasureAccessType
          planApprovalAccessType
          planFormulationRequestFlag
          planMeasureRegistrationRequestFlag
          planMeasureConfirmFlag
          # P2FW-719
          # targetDepartmentCategory
          targetDepartmentLevel {
            id
            name
            order
          }
        }
      }
      currentDepartmentId
      currentUserDepartmentId
      currentPositionWeight
      createdAt
      updatedAt
    }
  }
`

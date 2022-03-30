import gql from 'graphql-tag'

export type FindPlanMeasuresByDepartmentIdsRequestInput = {
  findPlanMeasuresByDepartmentIdsInput: {
    departmentIds: Array<Department['id']>
    startBusinessYear?: BusinessYear['year']
    endBusinessYear?: BusinessYear['year']
    startAggregationBusinessYear?: BusinessYear['year']
    endAggregationBusinessYear?: BusinessYear['year']
    createdByMe?: boolean
    implementationTarget?: PlanMeasure['implementationTarget']
  }
}

export type FindPlanMeasuresByDepartmentIdsResponse = {
  findPlanMeasuresByDepartmentIds: Array<PlanMeasure>
}

export const FIND_PLAN_MEASURES_BY_DEPARTMENT_IDS = gql`
  query findPlanMeasuresByDepartmentIds(
    $findPlanMeasuresByDepartmentIdsInput: FindPlanMeasuresByDepartmentIdsInput!
  ) {
    findPlanMeasuresByDepartmentIds(
      findPlanMeasuresByDepartmentIdsInput: $findPlanMeasuresByDepartmentIdsInput
    ) {
      id
      measureName
      overview
      classification
      code
      implementationTarget
      version
      department {
        id
        name
      }
      businessYear {
        id
        startYear
        startMonth
        startDate
        year
      }
      department {
        id
      }
      risks {
        id
        riskName
        targetType
        version
        prices {
          id
          cost
          version
          monthOfOccurrence
          yearOfOccurrence
          businessYear {
            year
          }
        }
        accountTitle {
          id
          name
          version
          accountDisplayTitle {
            id
            name
            type
          }
        }
      }
      tasks {
        id
        taskName
        version
        prices {
          id
          cost
          version
          monthOfOccurrence
          yearOfOccurrence
          businessYear {
            year
          }
        }
        accountTitle {
          id
          name
          accountDisplayTitle {
            id
            name
            type
          }
        }
        costRecordingDestination
      }
      costs {
        id
        costName
        item
        version
        assigns {
          id
          version
          costTD {
            id
            version
            department {
              id
            }
          }
          costTI {
            id
            version
            userDpm {
              id
              department {
                id
              }
            }
          }
        }
        prices {
          id
          cost
          version
          monthOfOccurrence
          yearOfOccurrence
          businessYear {
            year
          }
        }
        accountTitle {
          id
          name
          accountDisplayTitle {
            id
            name
            type
          }
        }
      }
      sales {
        id
        project
        version
        prices {
          id
          cost
          version
          monthOfOccurrence
          yearOfOccurrence
          businessYear {
            year
          }
        }
      }
      overview
      createdAt
      updatedAt
    }
  }
`

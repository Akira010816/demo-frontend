import gql from 'graphql-tag'

export type FindPlanMeasuresByDepartmentIdRequestInput = {
  findPlanMeasuresByDepartmentIdInput: {
    departmentId: Department['id']
    startBusinessYear?: BusinessYear['year']
    endBusinessYear?: BusinessYear['year']
    startAggregationBusinessYear?: BusinessYear['year']
    endAggregationBusinessYear?: BusinessYear['year']
    createdByMe?: boolean
  }
}

export type FindPlanMeasuresByDepartmentIdResponse = {
  findPlanMeasuresByDepartmentId: Array<PlanMeasure>
}

export const FIND_PLAN_MEASURES_BY_DEPARTMENT_ID = gql`
  query findPlanMeasuresByDepartmentId(
    $findPlanMeasuresByDepartmentIdInput: FindPlanMeasuresByDepartmentIdInput!
  ) {
    findPlanMeasuresByDepartmentId(
      findPlanMeasuresByDepartmentIdInput: $findPlanMeasuresByDepartmentIdInput
    ) {
      id
      measureName
      overview
      classification
      code
      implementationTarget
      version
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
        assigns {
          version
          costTD {
            version
            department {
              id
              departmentLevel {
                order
              }
            }
          }
          costTI {
            version
            userDpm {
              user {
                salary {
                  salary
                }
              }
            }
          }
        }
        accountTitle {
          id
          name
          type
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
        assigns {
          version
          costTD {
            version
            department {
              id
              departmentLevel {
                order
              }
            }
          }
          costTI {
            version
            userDpm {
              user {
                salary {
                  salary
                }
              }
            }
          }
        }
        accountTitle {
          id
          name
          type
        }
        costRecordingDestination
      }
      costs {
        id
        costName
        item
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
        assigns {
          version
          costTD {
            version
            department {
              id
              departmentLevel {
                order
              }
            }
          }
          costTI {
            version
            userDpm {
              user {
                salary {
                  salary
                }
              }
              department {
                id
              }
            }
          }
        }
        accountTitle {
          id
          name
          type
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

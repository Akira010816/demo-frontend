// eslint-disable-next-line import/no-named-as-default
import gql from 'graphql-tag'

export type FindPlanMeasureByCodeResponse = {
  findPlanMeasureById?: PlanMeasure
}

export type FindPlanMeasureByCodeVars = {
  code?: string | number
}

export const FIND_PLAN_MEASURE_BY_CODE = gql`
  query($code: String!) {
    findPlanMeasureById(code: $code) {
      id
      code
      measureName
      overview
      classification
      version
      businessYear {
        id
      }
      risks {
        id
        riskName
        targetType
        version
        accountTitle {
          id
          name
        }
        prices {
          id
          yearOfOccurrence
          monthOfOccurrence
          cost
          version
          businessYear {
            id
            year
          }
        }
        assigns {
          id
          version
          costTD {
            id
            version
            department {
              id
              name
            }
          }
          costTI {
            id
            userDpm {
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
      sales {
        id
        project
        effectIncDec
        version
        prices {
          id
          yearOfOccurrence
          monthOfOccurrence
          cost
          version
          businessYear {
            id
            year
          }
        }
      }
      costs {
        id
        item
        effectIncDec
        version
        accountTitle {
          id
          name
        }
        prices {
          id
          yearOfOccurrence
          monthOfOccurrence
          cost
          version
          businessYear {
            id
            year
          }
        }
        assigns {
          id
          version
          costTD {
            id
            version
            department {
              id
              name
            }
          }
          costTI {
            id
            userDpm {
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
      tasks {
        id
        taskName
        version
        accountTitle {
          id
          name
        }
        costRecordingDestination
        kpiType
        kpiOther
        kpiThreshold
        kpiPeriod
        prices {
          id
          version
          yearOfOccurrence
          monthOfOccurrence
          cost
          businessYear {
            id
            year
          }
        }
        allocations {
          id
          allocationRate
          version
          distriDpm {
            id
            name
          }
        }
        assigns {
          id
          version
          costTD {
            id
            version
            department {
              id
              name
            }
          }
          costTI {
            id
            userDpm {
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
  }
`

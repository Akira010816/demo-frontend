import gql from 'graphql-tag'

export type FindTaskByIdResponse = {
  findTaskById: Task
}

export type FindTaskByIdVars = {
  id: number
}

export const FIND_TASK_BY_ID = gql`
  query($id: Int!) {
    findTaskById(id: $id) {
      id
      code
      name
      registeredUser {
        id
        name
      }
      targets {
        id
        text
        measures {
          id
          code
          name
          overview
          prerequisites
          effectMethod
          implementationMethod
          usedTechnology
          systemLinking
          specification
          purchaseAmount
          implementationDetail
          startDate
          endDate
          isAdopted
          costUnit
          links
          version
          createdAt
          updatedAt
          createdUserId
          updatedUserId
          causeConditions {
            id
            achievementCondition
          }
          measureImplementationEffects {
            id
            measureId
            evaluation
            valueBeforeImprovement
            valueAfterImprovement
            calculationBasis
            startAt
            startAtMemo
            measuringMethod
            annualCostEffect
            createdUserId
            updatedUserId
            createdAt
            updatedAt
          }
          measureImplementationTasks {
            ganttId
            id
            measureId
            type
            name
            overview
            newSystemName
            systemOverview
            startAt
            endAt
            affectedSystems {
              id
              name
            }
            targetSystem {
              id
              name
            }
            modificationDescription
            purchaseTargets {
              id
              code
              displayOrder
            }
            abandonmentTargets {
              id
              code
              displayOrder
            }
            implementationDetail
            investigationDescription
            procurementDescription
            procurementScope
            implementTarget
            participants
            scopes
            participantScopeRoles
            startAt
            endAt
            createdAt
            updatedAt
          }
        }
        createdAt
        updatedAt
      }
      todos {
        id
        text
        measures {
          id
          code
          name
          overview
          prerequisites
          effectMethod
          implementationMethod
          usedTechnology
          systemLinking
          specification
          purchaseAmount
          implementationDetail
          startDate
          endDate
          isAdopted
          costUnit
          links
          version
          links
          createdAt
          updatedAt
          createdUserId
          updatedUserId
          causeConditions {
            id
            achievementCondition
          }
          measureImplementationEffects {
            id
            measureId
            evaluation
            valueBeforeImprovement
            valueAfterImprovement
            calculationBasis
            startAt
            startAtMemo
            measuringMethod
            annualCostEffect
            createdUserId
            updatedUserId
            createdAt
            updatedAt
          }
          measureImplementationTasks {
            id
            ganttId
            measureId
            type
            name
            overview
            newSystemName
            systemOverview
            affectedSystems {
              id
              name
            }
            targetSystem {
              id
              name
            }
            modificationDescription
            purchaseTargets {
              id
              code
              displayOrder
            }
            abandonmentTargets {
              id
              code
              displayOrder
            }
            implementationDetail
            investigationDescription
            procurementDescription
            procurementScope
            implementTarget
            participants
            scopes
            participantScopeRoles
            startAt
            endAt
            createdAt
            updatedAt
          }
        }
        createdAt
        updatedAt
      }
      investigations {
        id
        text
        measures {
          id
          code
          name
          overview
          prerequisites
          effectMethod
          implementationMethod
          usedTechnology
          systemLinking
          specification
          purchaseAmount
          implementationDetail
          startDate
          endDate
          isAdopted
          costUnit
          links
          version
          createdAt
          updatedAt
          createdUserId
          updatedUserId
          causeConditions {
            id
            achievementCondition
          }
          measureImplementationEffects {
            id
            measureId
            evaluation
            valueBeforeImprovement
            valueAfterImprovement
            calculationBasis
            startAt
            startAtMemo
            measuringMethod
            annualCostEffect
            createdUserId
            updatedUserId
            createdAt
            updatedAt
          }
          measureImplementationTasks {
            id
            ganttId
            measureId
            type
            name
            overview
            newSystemName
            systemOverview
            affectedSystems {
              id
              name
            }
            targetSystem {
              id
              name
            }
            modificationDescription
            purchaseTargets {
              id
              code
              displayOrder
            }
            abandonmentTargets {
              id
              code
              displayOrder
            }
            implementationDetail
            investigationDescription
            procurementDescription
            procurementScope
            implementTarget
            participants
            scopes
            participantScopeRoles
            startAt
            endAt
            createdAt
            updatedAt
          }
        }
        createdAt
        updatedAt
      }
      studyContents {
        id
        text
        measures {
          id
          code
          name
          overview
          prerequisites
          effectMethod
          implementationMethod
          usedTechnology
          systemLinking
          specification
          purchaseAmount
          implementationDetail
          startDate
          endDate
          isAdopted
          costUnit
          links
          version
          createdAt
          updatedAt
          createdUserId
          updatedUserId
          causeConditions {
            id
            achievementCondition
          }
          measureImplementationEffects {
            id
            measureId
            evaluation
            valueBeforeImprovement
            valueAfterImprovement
            calculationBasis
            startAt
            startAtMemo
            measuringMethod
            annualCostEffect
            createdUserId
            updatedUserId
            createdAt
            updatedAt
          }
          measureImplementationTasks {
            id
            ganttId
            measureId
            type
            name
            overview
            newSystemName
            systemOverview
            affectedSystems {
              id
              name
            }
            targetSystem {
              id
              name
            }
            modificationDescription
            purchaseTargets {
              id
              code
              displayOrder
            }
            abandonmentTargets {
              id
              code
              displayOrder
            }
            implementationDetail
            investigationDescription
            procurementDescription
            procurementScope
            implementTarget
            participants
            scopes
            participantScopeRoles
            startAt
            endAt
            createdAt
            updatedAt
          }
        }
        createdAt
        updatedAt
      }
      others {
        id
        text
        measures {
          id
          code
          name
          overview
          prerequisites
          effectMethod
          implementationMethod
          usedTechnology
          systemLinking
          specification
          purchaseAmount
          implementationDetail
          startDate
          endDate
          isAdopted
          costUnit
          links
          version
          createdAt
          updatedAt
          createdUserId
          updatedUserId
          causeConditions {
            id
            achievementCondition
          }
          measureImplementationEffects {
            id
            measureId
            evaluation
            valueBeforeImprovement
            valueAfterImprovement
            calculationBasis
            startAt
            startAtMemo
            measuringMethod
            annualCostEffect
            createdUserId
            updatedUserId
            createdAt
            updatedAt
          }
          measureImplementationTasks {
            ganttId
            id
            measureId
            type
            name
            overview
            newSystemName
            systemOverview
            affectedSystems {
              id
              name
            }
            targetSystem {
              id
              name
            }
            modificationDescription
            purchaseTargets {
              id
              code
              displayOrder
            }
            abandonmentTargets {
              id
              code
              displayOrder
            }
            implementationDetail
            investigationDescription
            procurementDescription
            procurementScope
            implementTarget
            participants
            scopes
            participantScopeRoles
            startAt
            endAt
            createdAt
            updatedAt
          }
        }
        createdAt
        updatedAt
      }
      issue {
        id
        occurStatus
        occurCount
        occurFrequency
        occurFrequencyDetail
        contents
        impact
        causes {
          id
          text
          isHypothesis
          measures {
            id
            code
            name
            overview
            prerequisites
            effectMethod
            implementationMethod
            usedTechnology
            systemLinking
            specification
            purchaseAmount
            implementationDetail
            startDate
            endDate
            isAdopted
            costUnit
            version
            links
            createdAt
            updatedAt
            createdUserId
            updatedUserId
            causeConditions {
              id
              achievementCondition
            }
            measureImplementationEffects {
              id
              measureId
              evaluation
              valueBeforeImprovement
              valueAfterImprovement
              calculationBasis
              startAt
              startAtMemo
              measuringMethod
              annualCostEffect
              createdUserId
              updatedUserId
              createdAt
              updatedAt
            }
            measureImplementationTasks {
              id
              ganttId
              measureId
              type
              name
              overview
              newSystemName
              systemOverview
              affectedSystems {
                id
                name
              }
              targetSystem {
                id
                name
              }
              modificationDescription
              purchaseTargets {
                id
                code
                displayOrder
              }
              abandonmentTargets {
                id
                code
                displayOrder
              }
              implementationDetail
              investigationDescription
              procurementDescription
              procurementScope
              implementTarget
              participants
              scopes
              participantScopeRoles
              startAt
              endAt
              createdAt
              updatedAt
            }
          }
          createdAt
          updatedAt
          causeConditions {
            id
            achievementCondition
            createdAt
            updatedAt
          }
        }
        createdAt
        updatedAt
      }
      startDate
      endDate
      taskStatus
      taskType
      registeredAt
      version
      createdAt
      updatedAt
    }
  }
`

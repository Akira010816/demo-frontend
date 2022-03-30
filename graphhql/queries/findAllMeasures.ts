import gql from 'graphql-tag'

export type FindAllMeasuresResponse = {
  findAllMeasures: Array<Measure>
}

export const FIND_ALL_MEASURES = gql`
  query findAllMeasures {
    findAllMeasures {
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
      version
      links
      costUnit
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
  }
`

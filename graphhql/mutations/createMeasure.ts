import { gql } from 'apollo-boost'
import {
  CreateMeasureImplementationTaskInput,
  generateCreateMeasureImplementationTaskInputFromEntity,
} from '~/graphhql/mutations/createMeasureImplementationTask'
import {
  CreateMeasureImplementationEffectInput,
  generateCreateMeasureImplementationEffectInputFromEntity,
} from '~/graphhql/mutations/createMeasureImplementationEffect'
import { GanttLink } from '~/components/gantt/gantt'

export type CreateMeasureInput = {
  name?: string
  overview?: string
  measureImplementationTaskInputs?: Array<CreateMeasureImplementationTaskInput>
  measureImplementationEffectInputs?: Array<CreateMeasureImplementationEffectInput>
  causeConditionInputs?: Array<CauseCondition['id']>
  causes?: Array<Cause['id']>
  todos?: Array<Todo['id']>
  investigations?: Array<Investigation['id']>
  studyContents?: Array<StudyContent['id']>
  targets?: Array<Target['id']>
  others?: Array<Other['id']>
  links?: GanttLink[]
  costUnit?: string
}

export type CreateMeasureRequestVars = {
  createMeasureInput: CreateMeasureInput
}

export type CreateMeasureResponse = {
  createMeasure: Measure
}

export const generateCreateMeasureInputFromEntity = (entity: Measure): CreateMeasureInput => ({
  name: entity.name,
  overview: entity.overview,
  costUnit: entity.costUnit,
  links: entity.links,
  measureImplementationTaskInputs:
    entity.measureImplementationTasks?.map((measureImplementationTask) =>
      generateCreateMeasureImplementationTaskInputFromEntity(measureImplementationTask)
    ) ?? [],
  measureImplementationEffectInputs:
    entity.measureImplementationEffects?.map((measureImplementationEffect) =>
      generateCreateMeasureImplementationEffectInputFromEntity(measureImplementationEffect)
    ) ?? [],
  causeConditionInputs: entity.causeConditions?.map((i) => i.id) ?? [],
  // causes: entity.causes?.map((i) => i.id),
  // targets: entity.targets?.map((i) => i.id),
  // todos: entity.todos?.map((i) => i.id),
  // studyContents: entity.studyContents?.map((i) => i.id),
  // investigations: entity.investigations?.map((i) => i.id),
  // others: entity.others?.map((i) => i.id),
})

export const CREATE_MEASURE = gql`
  mutation($createMeasureInput: CreateMeasureInput!) {
    createMeasure(createMeasureInput: $createMeasureInput) {
      id
      code
      name
      overview
      startDate
      endDate
      costUnit
      version
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
      causeConditions {
        id
        achievementCondition
      }
      links
      createdAt
      updatedAt
    }
  }
`

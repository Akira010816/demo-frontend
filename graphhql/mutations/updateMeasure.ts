import { gql } from 'apollo-boost'
import {
  generateUpdateMeasureImplementationTaskInputFromEntity,
  UpdateMeasureImplementationTaskInput,
} from '~/graphhql/mutations/updateMeasureImplementationTask'
import {
  generateUpdateMeasureImplementationEffectInputFromEntity,
  UpdateMeasureImplementationEffectInput,
} from '~/graphhql/mutations/updateMeasureImplementationEffect'
import { GanttLink } from '~/components/gantt/gantt'

export type SetMeasureInput = {
  id: number
}

export type UpdateMeasureInput = {
  id: number
  name?: string
  overview?: string
  measureImplementationTaskInputs?: Array<UpdateMeasureImplementationTaskInput>
  measureImplementationEffectInputs?: Array<UpdateMeasureImplementationEffectInput>
  causeConditionInputs?: Array<CauseCondition['id']>
  causes?: Array<Cause['id']>
  todos?: Array<Todo['id']>
  investigations?: Array<Investigation['id']>
  studyContents?: Array<StudyContent['id']>
  targets?: Array<Target['id']>
  others?: Array<Other['id']>
  links?: GanttLink[]
  costUnit?: string
  version: number
}

export type UpdateMeasureRequestVars = {
  updateMeasureInput: UpdateMeasureInput
}

export type UpdateMeasureResponse = {
  updateMeasure: Measure
}

export const generateUpdateMeasureInputFromEntity = (entity: Measure): UpdateMeasureInput => ({
  id: entity.id ?? 0,
  name: entity.name,
  overview: entity.overview,
  version: entity.version ?? 1,
  costUnit: entity.costUnit,
  links: entity.links,
  measureImplementationTaskInputs:
    entity.measureImplementationTasks?.map((entity) =>
      generateUpdateMeasureImplementationTaskInputFromEntity(entity)
    ) ?? [],
  measureImplementationEffectInputs:
    entity.measureImplementationEffects?.map((entity) =>
      generateUpdateMeasureImplementationEffectInputFromEntity(entity)
    ) ?? [],
  causeConditionInputs: entity.causeConditions?.map((i) => i.id) ?? [],
  // causes: entity.causes?.map((i) => i.id),
  // targets: entity.targets?.map((i) => i.id),
  // todos: entity.todos?.map((i) => i.id),
  // studyContents: entity.studyContents?.map((i) => i.id),
  // investigations: entity.investigations?.map((i) => i.id),
  // others: entity.others?.map((i) => i.id),
})

export const UPDATE_MEASURE = gql`
  mutation($updateMeasureInput: UpdateMeasureInput!) {
    updateMeasure(updateMeasureInput: $updateMeasureInput) {
      id
      code
      name
      overview
      startDate
      endDate
      costUnit
      version
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
        #startAt
        startAtMemo
        measuringMethod
        annualCostEffect
        createdUserId
        updatedUserId
        #createdAt
        #updatedAt
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
        #startAt
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
        #startAt
        endAt
        #createdAt
        #updatedAt
      }
      links
      createdAt
      updatedAt
    }
  }
`

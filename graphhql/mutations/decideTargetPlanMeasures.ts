import { gql } from 'apollo-boost'

export type DecideTargetPlanMeasureInput = {
  id: PlanMeasure['id']
  implementationTarget: PlanMeasure['implementationTarget']
  version?: PlanMeasure['version']
}

export type DecideTargetPlanMeasuresRequestTypes = {
  decideTargetPlanMeasuresInput: {
    targetPlanMeasures: Array<DecideTargetPlanMeasureInput>
  }
}

export type DecideTargetPlanMeasuresResponse = {
  planMeasures: Array<PlanMeasure>
}

export const DECIDE_TARGET_PLAN_MEASURES_REQUEST = gql`
  mutation($decideTargetPlanMeasuresInput: DecideTargetPlanMeasuresInput!) {
    decideTargetPlanMeasures(decideTargetPlanMeasuresInput: $decideTargetPlanMeasuresInput) {
      id
      code
      implementationTarget
      version
    }
  }
`

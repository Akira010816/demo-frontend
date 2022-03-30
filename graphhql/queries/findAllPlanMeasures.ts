import gql from 'graphql-tag'

export type FindAllPlanMeasuresResponse = {
  findAllPlanMeasures: Array<PlanMeasure>
}

export const FIND_ALL_PLAN_MEASURES = gql`
  query findAllPlanMeasures {
    findAllPlanMeasures {
      id
      measureName
      code
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
      }
      tasks {
        id
        taskName
      }
      costs {
        id
        costName
      }
      sales {
        id
      }
      overview
      createdAt
      updatedAt
    }
  }
`

import { gql } from 'apollo-boost'

export const UPDATE_TASK_BASE_INFO = gql`
  mutation(
    $id: String!
    $name: String
    $overview: String
    $contentType: [Int!]
    $background: String
    $impact: String
    $targets: [TargetInput]
    $todos: [TodoInput]
    $solutionConditionList: [String!]
    $raisedDept: DepartmentInput
  ) {
    updateTask(
      updateTaskInput: {
        id: $id
        name: $name
        overview: $overview
        content_type: $contentType
        background: $background
        impact: $impact
        targets: $targets
        todos: $todos
        solution_condition_list: $solutionConditionList
        raised_dept: $raisedDept
      }
    ) {
      id
      name
      overview
      createdTime: created_time
      updatedTime: updated_time
      contentType: content_type
      background
      impact
      solution_condition_list
      raised_dept {
        deptId
        name
      }
    }
  }
`

import { TaskTypePropertyName, taskTypes } from '~/lib/displaySetting'

export const selectTaskProposals = (task: Task): Array<TaskProposal> => {
  switch (task.taskType) {
    case taskTypes.issue.id:
      return task.issue?.causes || []
    case taskTypes.target.id:
      return task.targets || []
    case taskTypes.todo.id:
      return task.todos || []
    case taskTypes.studyContent.id:
      return task.studyContents || []
    case taskTypes.investigation.id:
      return task.investigations || []
    case taskTypes.other.id:
      return task.others || []
    default:
      return []
  }
}

export const getTaskProposalPrefix = (task: Task): string => {
  switch (task.taskType) {
    case taskTypes.issue.id:
      return `問題：${task.issue?.contents}\n原因：`
    case taskTypes.target.id:
      return '目標：'
    case taskTypes.todo.id:
      return 'TODO：'
    case taskTypes.studyContent.id:
      return '方針検討：'
    case taskTypes.investigation.id:
      return '調査：'
    case taskTypes.other.id:
      return 'その他：'
    default:
      return ''
  }
}

export const selectProposalPropertyName = (taskType: TaskType): TaskTypePropertyName => {
  switch (taskType) {
    case taskTypes.issue.id:
      return taskTypes.issue.propertyName
    case taskTypes.target.id:
      return taskTypes.target.propertyName
    case taskTypes.todo.id:
      return taskTypes.todo.propertyName
    case taskTypes.studyContent.id:
      return taskTypes.studyContent.propertyName
    case taskTypes.investigation.id:
      return taskTypes.investigation.propertyName
    case taskTypes.other.id:
      return taskTypes.other.propertyName
  }
}

import { FC } from 'react'
import IssueComponent, { IssueProps } from './issue'
import TargetsComponent, { TargetsProps } from './targets'
import TodosComponent, { TodosProps } from './todos'
import OthersComponent, { OthersProps } from './others'
import InvestigationsComponent, { InvestigationsProps } from './investigations'
import StudyContentsComponent, { StudyContentsProps } from './studyContents'
import { taskTypes } from '~/lib/displaySetting'
import { FormInstance } from 'antd/es/form'

export type TaskContentFormProps = {
  task: Task | undefined | null
  projectId: number
  form: FormInstance
  onIssueChange: (issue: Issue | undefined | null) => void
  onTargetsChange: (targets: Array<Target>) => void
  onTodosChange: (todos: Array<Todo>) => void
  onOthersChange: (others: Array<Other>) => void
  onInvestigationsChange: (investigations: Array<Investigation>) => void
  onStudyContentsChange: (studyContents: Array<StudyContent>) => void
}

const TaskContentForm: FC<TaskContentFormProps> = ({
  onIssueChange,
  onTargetsChange,
  onTodosChange,
  onOthersChange,
  onInvestigationsChange,
  onStudyContentsChange,
  task,
  form,
  projectId,
}) => {
  const onChangeIssueFinal: IssueProps['onChange'] = (issue) => {
    onIssueChange(issue)
  }

  const onChangeTargetsFinal: TargetsProps['onChange'] = (targets) => {
    onTargetsChange(targets)
  }

  const onChangeTodosFinal: TodosProps['onChange'] = (todos) => {
    onTodosChange(todos)
  }

  const onChangeOthersFinal: OthersProps['onChange'] = (others) => {
    onOthersChange(others)
  }

  const onChangeInvestigationsFinal: InvestigationsProps['onChange'] = (investigations) => {
    onInvestigationsChange(investigations)
  }

  const onChangeStudyContentsFinal: StudyContentsProps['onChange'] = (studyContents) => {
    onStudyContentsChange(studyContents)
  }

  return (
    <>
      {(() => {
        switch (task?.taskType) {
          // 問題解決
          case taskTypes.issue.id:
            return (
              <IssueComponent
                form={form}
                onChange={onChangeIssueFinal}
                issue={task?.issue}
                projectId={projectId}
                taskId={task?.id ?? 0}
              />
            )
          // 目標
          case taskTypes.target.id:
            return (
              <TargetsComponent
                form={form}
                onChange={onChangeTargetsFinal}
                targets={task?.targets ?? []}
                projectId={projectId}
                taskId={task?.id ?? 0}
              />
            )
          // ToDo
          case taskTypes.todo.id:
            return (
              <TodosComponent
                form={form}
                onChange={onChangeTodosFinal}
                todos={task?.todos ?? []}
                projectId={projectId}
                taskId={task?.id ?? 0}
              />
            )
          // 方針検討
          case taskTypes.studyContent.id:
            return (
              <StudyContentsComponent
                form={form}
                onChange={onChangeStudyContentsFinal}
                studyContents={task?.studyContents ?? []}
                projectId={projectId}
                taskId={task?.id ?? 0}
              />
            )
          // 調査
          case taskTypes.investigation.id:
            return (
              <InvestigationsComponent
                form={form}
                onChange={onChangeInvestigationsFinal}
                investigations={task?.investigations ?? []}
                projectId={projectId}
                taskId={task?.id ?? 0}
              />
            )
          // その他
          case taskTypes.other.id:
            return (
              <OthersComponent
                form={form}
                onChange={onChangeOthersFinal}
                others={task?.others ?? []}
                projectId={projectId}
                taskId={task?.id ?? 0}
              />
            )
          default:
            return null
        }
      })()}
    </>
  )
}

export default TaskContentForm

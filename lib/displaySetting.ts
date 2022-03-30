type InputConfig = {
  require: boolean
  visible: boolean
  maxlength?: number | undefined
}
export type DisplaySetting = {
  [pageId: string]: {
    inputConfig?: {
      [itemId: string]: InputConfig
    }
    labelConfig: {
      [itemId: string]: string
    }
  }
}

const PLACEHOLDER = '{PLACEHOLDER}'
export const replacePlaceholder = (description: string, stringToReplace: string): string =>
  description.replace(PLACEHOLDER, stringToReplace)

export const displaySetting: DisplaySetting = {
  dashboard: {
    inputConfig: {},
    labelConfig: {
      title: 'ダッシュボード',
    },
  },
  // 企画一覧
  projectList: {
    inputConfig: {
      projectName: {
        require: true,
        visible: true,
      },
    },
    labelConfig: {
      pageTitle: '企画一覧',
      registerProjectButton: '企画を登録',
      projectName: '企画名',
      raisedDepartmentName: 'オーナー部署',
      raisedUserName: '企画立案者',
      startDate: '開始日',
      endDate: '終了日',
      status: 'ステータス',
      actions: '操作',
      deleteConfirmModalTitle: '企画削除',
      deleteConfirmModalContent: '企画「{name}」を削除してよろしいですか？',
      deleteSuccess: '企画の削除に成功しました。',
      deleteError: '企画の削除に失敗しました。',
    },
  },
  // 承認一覧
  approvals: {
    labelConfig: {
      code: '番号',
      requestedBy: '承認依頼者',
      status: '承認対象',
      myStatus: 'ステータス',
      createdAt: '依頼日時',
      closePageButton: '閉じる',
    },
  },
  // 承認依頼一覧
  approvalRequests: {
    labelConfig: {
      code: '番号',
      requestedBy: '承認依頼者',
      status: 'ステータス',
      createdAt: '依頼日時',
      closePageButton: '閉じる',
    },
  },
  // 新規承認依頼
  addNewApprovalRequest: {
    inputConfig: {
      approvalCategory: {
        require: false,
        visible: true,
      },
      approvalRequestMessage: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
      until: {
        require: false,
        visible: true,
      },
    },
    labelConfig: {
      closeModalButton: '閉じる',
      cancelApprovalRequestButton: '依頼取消',
      approvalCategory: '承認対象',
      approvalRequestMessage: '承認メッセージ',
      until: '承認期限',
      approvalFlow: '承認フロー',
      approvalFlowConfirmation: '承認状況',
      mutationSuccess: '承認依頼を作成しました。',
      mutationError: '承認依頼の作成に失敗しました。',
      cancelMutationSuccess: '依頼取消を行いました。',
      cancelMutationError: '依頼取消に失敗しました。',
    },
  },
  // 承認モーダル
  approveModal: {
    inputConfig: {
      comment: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
    },
    labelConfig: {
      requestedBy: '承認依頼者',
      approvalCategory: '承認対象',
      approvalRequestMessage: '依頼メッセージ',
      until: '承認期限',
      requesterInfoTitle: '承認依頼情報',
      progressStatusTitle: '進行状況',
      approveButton: '承認',
      cancelButton: '承認取消',
      rejectButton: '却下',
      closeButton: '閉じる',
      comment: 'コメント',
      mutationSuccess: '承認情報を更新に成功しました。',
      mutationError: '承認情報の更新に失敗しました。',
    },
  },
  // 企画新規
  projectCreate: {
    inputConfig: {
      projectName: {
        require: true,
        visible: true,
        maxlength: 200,
      },
      description: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
      raised_department_id: {
        require: true,
        visible: true,
      },
      raisedUser: {
        require: true,
        visible: true,
      },
      priority: {
        require: true,
        visible: true,
      },
      startDate: {
        require: true,
        visible: true,
      },
      achievementConditions: {
        require: true,
        visible: true,
      },
      endDateMilestone: {
        require: true,
        visible: true,
      },
      decisionDueDateMilestone: {
        require: true,
        visible: true,
      },
      otherMilestones: {
        require: false,
        visible: true,
      },
      owner: {
        require: true,
        visible: true,
      },
      members: {
        require: false,
        visible: true,
      },
    },
    labelConfig: {
      pageTitle: '企画一覧,企画 新規作成',
      projectName: '企画名',
      description: '概要',
      raised_department_id: 'オーナー部署',
      raisedUser: '企画立案者',
      priority: '優先度',
      startDate: '開始日',
      achievementConditionsDescription: '企画の達成条件を入力してください。',
      achievementConditions: '',
      endDateMilestoneDescription: '企画の解決期限(施策実施完了までの期限)を入力して下さい。',
      decisionDueDateMilestoneDescription: '企画の検討期限(施策決定までの期限)を入力して下さい。',
      otherMilestonesDescription: 'その他の重要なマイルストーンを入力して下さい',
      owner: 'オーナー',
      members: 'メンバー',
    },
  },
  // 企画サマリー
  projectSummary: {
    labelConfig: {
      pageTitle: '企画一覧,企画サマリー',
      description: 'リンクをクリックすると、詳細画面が表示されます',
      projectTitle: '企画',
      projectName: '企画名',
      summary: '概要',
      ownerMemberTitle: 'オーナー・メンバー',
      owner: 'オーナー',
      member: 'メンバー',
      scheduleTitle: 'スケジュール',
      planning: '企画立案',
      problemAnalysis: '課題分析',
      measures: '対策検討',
      policyPlanning: '施策立案',
      policyDecision: '施策決定',
      taskTitle: '課題',
      taskName: '課題',
      registeredAt: '登録日',
      startDate: '予定開始日',
      endDate: '解決期限',
      registeredUser: '登録者',
      status: 'ステータス',
      taskButton: '課題分析',
      measuresTitle: '施策',
      MeasurePlan: '施策案',
    },
  },
  // 企画修正 概要
  projectUpdateBaseInfo: {
    inputConfig: {
      projectName: {
        require: true,
        visible: true,
        maxlength: 200,
      },
      projectCode: {
        require: false,
        visible: true,
      },
      status: {
        require: true,
        visible: true,
      },
      description: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
      premiseCondition: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
      impact: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
      raised_department_id: {
        require: true,
        visible: true,
      },
      raisedUser: {
        require: true,
        visible: true,
      },
      priority: {
        require: true,
        visible: true,
      },
      achievementConditions: {
        require: true,
        visible: true,
      },
    },
    labelConfig: {
      pageTitle: '企画一覧,企画サマリー,企画立案',
      projectName: '企画名',
      projectCode: '企画ID',
      status: 'ステータス',
      description: '概要',
      premiseCondition: '前提条件',
      impact: '影響',
      raised_department_id: 'オーナー部署',
      raisedUser: '企画立案者',
      priority: '優先度',
      achievementConditionsDescription: '企画の達成条件を入力してください。',
      achievementConditions: '',
      updateSuccess: '企画の保存に成功しました。',
      updateError: '企画の保存に失敗しました。',
    },
  },
  // 企画修正 オーナーメンバー
  projectUpdateOwnerMembers: {
    inputConfig: {
      owner: {
        require: true,
        visible: true,
      },
      members: {
        require: false,
        visible: true,
      },
    },
    labelConfig: {
      pageTitle: '企画一覧,企画サマリー,企画立案',
      owner: '',
      ownerDescription: '企画の主担当となるオーナーを選択してください。',
      members: 'メンバー',
      membersDescription: '企画の検討や作業にかかわるメンバーを選択して下さい。',
      updateSuccess: '企画の保存に成功しました。',
      updateError: '企画の保存に失敗しました。',
    },
  },

  // 対策検討
  projectCounter: {
    labelConfig: {
      pageTitle: '企画一覧,企画サマリー,対策検討',
      addMeasuresTitle: '施策案の検討',
      addMeasureTableTaskColumnHeader: '課題',
      addMeasureTableMeasureColumnHeader: '施策案',
      linkCounterWithMeasuresDescription: '検討した施策案を登録して下さい。',
      addMeasureButtonDescription: '(施策案を追加)',
      addNewMeasureButtonDescription: '新規追加',
      editMeasureButtonDescription: '修正',
      deleteMeasureButtonDescription: '削除',
      chooseExistingMeasureButtonDescription: '既存の施策案を選択',
      searchMeasuresPlaceholder: '施策案を検索',
      deleteMeasureDescription: `「${PLACEHOLDER}」を削除しますか?`,
      addExistingMeasuresModalHeaderColumn: '施策案名',
      mutationSuccess: '対策検討を保存しました。',
      mutationError: '対策検討の保存に失敗しました。',
    },
  },
  taskNew: {
    labelConfig: {
      pageTitle: '企画一覧,企画サマリー,課題分析,課題登録',
    },
  },
  taskEdit: {
    labelConfig: {
      pageTitle: '企画一覧,企画サマリー,課題分析,課題編集',
    },
  },
  // 課題分析一覧
  taskIndex: {
    labelConfig: {
      pageTitle: '企画一覧,企画サマリー,課題分析',
      taskName: '課題名',
      registeredAt: '登録日',
      startDate: '予定開始日',
      endDate: '解決期限',
      registeredUser: '登録者',
      status: 'ステータス',
      action: '操作',
      deleteConfirmModalTitle: '課題削除',
      deleteConfirmModalContent: '課題「{name}」を削除してよろしいですか？',
      deleteSuccess: '課題の削除が成功しました。',
      deleteError: '課題の削除に失敗しました。',
    },
  },
  // 課題分析概要
  taskBaseInfoForm: {
    inputConfig: {
      taskName: {
        require: true,
        visible: true,
        maxlength: 50,
      },
      taskCode: {
        require: false,
        visible: true,
      },
      taskStatus: {
        require: true,
        visible: true,
      },
      taskType: {
        require: true,
        visible: true,
      },
    },
    labelConfig: {
      taskName: '課題名',
      taskCode: '課題ID',
      taskStatus: 'ステータス',
      taskType: '',
      taskTypeDescription: '課題の内容に該当する項目を選択して下さい。',
      createSuccess: '課題の作成に成功しました。',
      createError: '課題の作成に失敗しました。',
      updateSuccess: '課題の更新に成功しました。',
      updateError: '課題の更新に失敗しました。',
    },
  },
  // 企画スケジュール
  projectUpdateScheduleInfo: {
    inputConfig: {
      endDateMilestone: {
        require: true,
        visible: true,
      },
      decisionDueDateMilestone: {
        require: true,
        visible: true,
      },
      otherMilestones: {
        require: false,
        visible: true,
      },
      startDate: {
        require: true,
        visible: true,
      },
    },
    labelConfig: {
      pageTitle: '企画一覧,企画サマリー,企画立案',
      endDateMilestoneDescription: '企画の解決期限(施策実施完了までの期限)を入力して下さい。',
      decisionDueDateMilestoneDescription: '企画の検討期限(施策決定までの期限)を入力して下さい。',
      otherMilestonesDescription: 'その他の重要なマイルストーンを入力して下さい',
      scheduleDescription:
        'マイルストーンを参考に、企画立案～施策決定のスケジュールを設定して下さい。',
      startDate: '開始日',
      planningDate: '企画立案',
      problemAnalysisDate: '課題分析',
      measuresDate: '対策検討',
      policyPlanningDate: '施策立案',
      policyDecisionDate: '施策決定',
      updateSuccess: '企画の保存に成功しました。',
      updateError: '企画の保存に失敗しました。',
    },
  },
  // 企画進捗報告モーダル
  projectProgressReportModal: {
    inputConfig: {
      targetDate: {
        require: true,
        visible: true,
      },
      status: {
        require: true,
        visible: true,
      },
      unit: {
        require: false,
        visible: true,
      },
      delay: {
        require: false,
        visible: true,
      },
      avoidDelayPlan: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
      impact: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
      progress: {
        require: true,
        visible: true,
      },
      reportBody: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
      quality: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
      member: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
      cost: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
    },
    labelConfig: {
      title: '企画の進捗報告',
      targetDate: '基準日',
      history: '過去履歴',
      status: '状況',
      progress: '進捗率',
      projectStatus: '企画ステータス',
      reportedAt: '報告内容の更新日時',
      notice:
        '過去履歴を再利用して進捗報告する場合は、対象の行を選択して下の報告内容に表示された基準日を変更した後、保存して下さい。',
      reportBody: '報告内容',
      unit: '入力単位',
      delay: '遅延',
      avoidDelayPlan: '遅延解消の対策と見込み',
      impact: '他作業への影響',
      calculatedProgress: '(課題のステータスから計算した進捗率)',
      escalationItem: 'エスカレーション事項',
      quality: '品質',
      cost: 'コスト',
      member: '要員',
      deleteButton: '報告内容の削除',
      mutateSuccess: '進捗報告に成功しました',
      mutateError: '進捗報告に失敗しました',
      confirmMessage: '過去の進捗報告ですが、修正内容を保存しても良いですか？',
      deleteConfirmMessage: '「{PLACEHOLDER}」の進捗報告を削除しても良いですか？',
    },
  },
  taskIssue: {
    inputConfig: {
      contents: {
        require: true,
        visible: true,
        maxlength: 2048,
      },
      occurStatus: {
        require: true,
        visible: true,
      },
      occurFrequency: {
        require: true,
        visible: true,
      },
      occurFrequencyDetail: {
        require: false,
        visible: true,
        maxlength: 50,
      },
      impact: {
        require: true,
        visible: true,
        maxlength: 2048,
      },
    },
    labelConfig: {
      contents: '問題',
      occurStatus: '問題の発生状況',
      occurFrequency: '問題発生の頻度',
      occurFrequencyDetail: '問題発生の頻度',
      impact: '影響',
      mutationSuccess: '課題内容の更新に成功しました。',
      mutationError: '課題内容の更新に失敗しました。',
      title: '解決すべき問題を入力してください。',
      contentsPlaceholder: '解決すべき問題',
      occurStatusOccurred: '既に発生している',
      occurStatusMayOccur: '今後発生する可能性あり',
      occurFrequencyOne: '1回のみ',
      occurFrequencyMultiple: '複数回発生',
      occurFrequencyDetailPlaceholder: '1日1回など',
      impactTitle: 'この問題による影響を入力してください。',
      impactPlaceholder: 'この問題による影響を入力してください。',
      addCauseButtonTitle: '原因を追加',
    },
  },
  taskIssueCause: {
    inputConfig: {
      text: {
        require: true,
        visible: true,
        maxlength: 2048,
      },
    },
    labelConfig: {
      text: '原因',
      title: '問題の発生原因を調査し、原因を入力して下さい。',
      deleteCauseButtonTitle: '削除',
      causePlaceholder: '問題の発生原因を入力してください。',
      isHypothesisTitle: '上記の原因が仮説の場合は、チェックして下さい。',
    },
  },
  taskIssueCauseCauseCondition: {
    inputConfig: {
      achievementCondition: {
        require: true,
        visible: true,
        maxlength: 2048,
      },
    },
    labelConfig: {
      title: 'この問題が解決したと判断する条件を入力してください。',
      achievementCondition: '解決条件',
      achievementConditionPlaceholder: '課題が解決したと判断する条件',
    },
  },
  taskTarget: {
    inputConfig: {
      text: {
        require: true,
        visible: true,
        maxlength: 2048,
      },
    },
    labelConfig: {
      text: '目標',
      textPlaceholder: '解決すべき対象と目標値',
      mutationSuccess: '課題内容の更新に成功しました。',
      mutationError: '課題内容の更新に失敗しました。',
      title: 'この課題での解決すべき対象と目標値を入力して下さい。',
    },
  },
  taskTodo: {
    inputConfig: {
      text: {
        require: true,
        visible: true,
        maxlength: 2048,
      },
    },
    labelConfig: {
      text: '対応内容',
      textPlaceholder: '対応内容',
      mutationSuccess: '課題内容の更新に成功しました。',
      mutationError: '課題内容の更新に失敗しました。',
      title: '対象とすべき業務やシステムごとに、対応内容を入力して下さい。',
    },
  },
  taskInvestigation: {
    inputConfig: {
      text: {
        require: true,
        visible: true,
        maxlength: 2048,
      },
    },
    labelConfig: {
      text: '調査内容',
      textPlaceholder: '調査内容',
      mutationSuccess: '課題内容の更新に成功しました。',
      mutationError: '課題内容の更新に失敗しました。',
      title: '何を対象に、どのような調査を行うのか、入力して下さい。',
    },
  },
  taskStudyContent: {
    inputConfig: {
      text: {
        require: true,
        visible: true,
        maxlength: 2048,
      },
    },
    labelConfig: {
      text: '検討内容',
      textPlaceholder: '検討内容',
      mutationSuccess: '課題内容の更新に成功しました。',
      mutationError: '課題内容の更新に失敗しました。',
      title: '何を対象に、どのような検討を行うのか、入力して下さい。',
    },
  },
  taskOther: {
    inputConfig: {
      text: {
        require: true,
        visible: true,
        maxlength: 2048,
      },
    },
    labelConfig: {
      text: '内容',
      textPlaceholder: '内容',
      mutationSuccess: '課題内容の更新に成功しました。',
      mutationError: '課題内容の更新に失敗しました。',
      title: '課題の内容を記載して下さい。',
    },
  },
  taskSchedule: {
    inputConfig: {
      startDate: {
        require: true,
        visible: true,
      },
      endDate: {
        require: true,
        visible: true,
      },
    },
    labelConfig: {
      startDate: '予定開始日',
      startDatePlaceholder: '日付を入力してください',
      endDate: '課題の解決期限',
      endDatePlaceholder: '日付を入力してください',
      mutationSuccess: 'スケジュールの更新に成功しました。',
      mutationError: 'スケジュールの更新に失敗しました。',
    },
  },
  // 企画修正 概要
  measureBaseInfoForm: {
    inputConfig: {
      name: {
        require: true,
        visible: true,
        maxlength: 200,
      },
      code: {
        require: false,
        visible: true,
      },
      overview: {
        require: false,
        visible: true,
        maxlength: 2048,
      },
    },
    labelConfig: {
      code: '施策案ID',
      name: '施策案名',
      overview: '施策の概要',
    },
  },
  measureImplementationTaskForm: {
    inputConfig: {
      newTaskName: {
        visible: true,
        require: false,
        maxlength: 200,
      },
    },
    labelConfig: {
      newTaskName: 'タスク',
      title: '実施タスク',
      subTitle: 'この施策で実施するタスクを登録して下さい。',
      addTaskButton: 'タスクを追加',
      deleteTaskButton: '削除',
      deleteTaskConfirmation: `「${PLACEHOLDER}」を削除しますか?`,
      tableColumnTask: 'タスク',
      tableColumnAction: '操作',
    },
  },
  measureImplementationTaskDetailForm: {
    inputConfig: {
      type: {
        visible: true,
        require: true,
      },
      newSystemName: {
        visible: true,
        require: true,
        maxlength: 2048,
      },
      systemOverview: {
        visible: true,
        require: true,
        maxlength: 2048,
      },
      affectedSystems: {
        visible: true,
        require: true,
      },
      targetSystem: {
        visible: true,
        require: true,
      },
      modificationDescription: {
        visible: true,
        require: true,
        maxlength: 2048,
      },
      purchaseTarget: {
        visible: true,
        require: true,
      },
      abandonmentTarget: {
        visible: true,
        require: true,
      },
      implementationDetail: {
        visible: true,
        require: true,
        maxlength: 2048,
      },
      investigationDetail: {
        visible: true,
        require: true,
        maxlength: 2048,
      },
      procurementDetail: {
        visible: true,
        require: true,
        maxlength: 2048,
      },
      procurementScope: {
        visible: true,
        require: true,
        maxlength: 2048,
      },
      implementTarget: {
        visible: true,
        require: true,
        maxlength: 2048,
      },
      measureImplementationTaskScopeRole: {
        visible: true,
        require: false,
      },
      measureImplementationTaskScopeScope: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
      measureImplementationTaskRoleParticipant: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
      measureImplementationTaskRoleRole: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
      measureImplementationTaskRoleLocation: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
    },
    labelConfig: {
      type: 'タスクの種類',
      newSystemName: '新システムの名称',
      systemOverview: 'システムの概要',
      affectedSystems: '影響のあるシステム',
      targetSystem: '対象システム',
      modificationDescription: '改修内容',
      purchaseTarget: '購入対象',
      abandonmentTarget: '廃棄対象',
      implementationDetail: '実施内容',
      investigationDetail: '調査内容',
      procurementDetail: '調達内容',
      procurementScope: '調達範囲',
      implementTarget: '実施対象',
      tableColumnMeasureParticipantRoleLocationTitle: '担当・役割・場所',
      tableColumnMeasureScopeTitle: '責任範囲',
      tableColumnMeasureParticipant: '担当者',
      tableColumnMeasureRole: '役割',
      tableColumnMeasureLocation: '場所',
      tableColumnMeasureScopeRole: '作業項目',
    },
  },
  addOrEditMeasureModal: {
    labelConfig: {
      createMeasureSuccess: '施策案の作成に成功しました。',
      createMeasureFailure: '施策案の作成に失敗しました。',
      updateMeasureSuccess: '施策案の更新に成功しました。',
      updateMeasureFailure: '施策案の更新に失敗しました。',
    },
  },
  measureImplementationEffectForm: {
    inputConfig: {
      evaluation: {
        visible: true,
        require: false,
        maxlength: 200,
      },
      valueBeforeImprovement: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
      valueAfterImprovement: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
      calculationBasis: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
      startAt: {
        visible: true,
        require: false,
      },
      startAtMemo: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
      measuringMethod: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
      annualCostEffect: {
        visible: true,
        require: false,
      },
      costUnit: {
        visible: true,
        require: false,
      },
    },
    labelConfig: {
      evaluation: '効果を評価する項目',
      valueBeforeImprovement: '改善前の値',
      valueAfterImprovement: '改善後の値',
      calculationBasis: '効果算定の根拠や計算方法',
      startAt: '効果検証開始時期',
      measuringMethod: '効果測定方法',
      annualCostEffect: '年間の金額効果',
      causeConditionTitle: '課題の解決条件を選択',
      causeConditionSubTitle: 'この施策が、課題のどの解決条件を解消するか選択して下さい。',
      effectTitle: '実施効果',
      effectSubTitle: 'この施策の実施により期待できる効果を登録して下さい。',
      costUnit: '金額単位',
    },
  },
  measureScheduleForm: {
    inputConfig: {},
    labelConfig: {
      title: 'スケジュールの入力',
      measureImplementationTaskScheduleDescription:
        '実施内容ごとのスケジュールを入力して下さい。\n',
    },
  },
  //Define config plan new
  planMeasureNew: {
    inputConfig: {},
    labelConfig: {
      save: '保存',
      pageTitle: '事業計画,施策登録',
      returnToPlanning: '企画へ戻る',
      unsavedContent: '入力内容が保存されていません。他の情報を表示してもよろしいですか？',
      warningTitle: '情報破棄の確認',
      createSuccess: '追加完了しました。',
      createError: '追加完了しませんでした。',
      updateSuccess: '施策の更新に成功しました。',
      updateError: '施策の更新に失敗しました。',
      doYouNotHavePermission: '使用権限がありません',
      close: '閉じる',
    },
  },
  //Define config for measure risk form
  measureRiskForm: {
    inputConfig: {
      riskName: {
        require: true,
        visible: true,
        maxlength: 200,
      },
      targetType: {
        require: true,
        visible: true,
      },
      accountLabor: {
        require: true,
        visible: true,
      },
      costRecordingDestination: {
        require: true,
        visible: true,
      },
      costRecordingDestinationNotLaborCost: {
        require: false,
        visible: true,
      },
    },
    labelConfig: {
      riskName: 'リスク名',
      accountLabor: '勘定科目',
      addRiskButton: 'リスクを追加',
      risk: 'リスク',
      account: '勘定科目',
      costRecordingDestination: 'コスト計上先',
      costRecordingDestinationNotLaborCost: 'コスト計上先',
      action: '操作',
      year: '年度',
      yearLabel: '年',
      month: '月',
      remove: '削除',
      edit: '編集',
      riskSubTitle: 'この施策を実施しない事により発生する可能性があるリスクを追加して下さい。',
      createSuccess: '追加完了しました。',
      updateSuccess: '更新完了しました。',
      targetType: 'リスク対象',
      deleteConfirmText: 'データを削除しますか?',
      close: '閉じる',
      dialogTitle: 'リスク',
    },
  },
  // PlanMeasuresEntryForm: {},
  planMeasuresSummaryForm: {
    inputConfig: {
      measureName: {
        visible: true,
        require: true,
        maxlength: 200,
      },
      overview: {
        visible: true,
        require: false,
        maxlength: 2048,
      },
      classification: {
        visible: true,
        require: false,
      },
    },
    labelConfig: {
      measureName: '施策名',
      overview: '概要',
      classification: '分類',
      code: 'MERS-xxx',
      mutateSuccess: '施策の作成に成功しました。',
      mutateError: '施策の作成に失敗しました。',
      updateSuccess: '施策の更新に成功しました。',
      updateError: '施策の更新に失敗しました。',
    },
  },
  //Define config for measure effect sale form
  effectSaleForm: {
    inputConfig: {
      newProjectName: {
        require: true,
        visible: true,
      },
      incrDecrState: {
        require: true,
        visible: true,
      },
    },
    labelConfig: {
      project: '項目',
      effectIncDec: '増加／減少／現状維持',
      year: '年度',
      effectSaleSubTitle:
        'この施策を実施することによるプラスの効果(売上増)とマイナスの効果(売上減)を入力して下さい。',
      month: '月',
      yearLabel: '年',
      updateSuccess: '施策の更新に成功しました。',
      updateError: '施策の更新に失敗しました。',
      deleteConfirmText: 'データを削除しますか?',
      close: '閉じる',
    },
  },
  plansForm: {
    inputConfig: {
      nextYearTargetSales: {
        require: true,
        visible: true,
      },
      nextYearTargetCost: {
        require: true,
        visible: true,
      },
      nextYearTargetSellingExpense: {
        require: true,
        visible: true,
      },
      nextYearTargetGeneralAdministrativeExpense: {
        require: true,
        visible: true,
      },
    },
    labelConfig: {
      sellingExpense: '販売費',
      sales: '売上',
      deemedSales: 'みなし売上',
      cost: '売上原価',
      generalAdministrativeExpense: '一般管理費',
      operatingIncome: '営業利益',
      operatingIncomeRatio: '営業利益率',
      organizationName: '組織名',
      thisYearExpectation: '今年度見込み',
      nextYearTarget: '次年度目標',
      yearOnYear: '年度比',
      higherOrganizationTargetPlan: '上位設定目標',
      totalPlan: '各組織の計画値合計',
      diffPlan: '上位設定目標と合計の差',
      pageTitle: '事業計画,事業計画策定',
      confirmPlanButton: '入力内容確定',
      requestPlanButton: '事業計画策定依頼',
      registerButton: '施策登録依頼',
      saveButton: '保存',
      targetYear: '対象年度',
      targetOrganization: '対象組織',
      updatePlansSuccess: '事業計画情報を更新しました。',
      updatePlansError: '事業計画情報の更新に失敗しました。',
      confirmPlansSuccess: '入力内容を確定しました。',
      confirmPlansError: '入力内容の確定に失敗しました。',
      doYouNotHavePermission: '使用権限がありません',
    },
  },
  approveAnnualPlan: {
    labelConfig: {
      sellingExpense: '販売費',
      sales: '売上',
      deemedSales: 'みなし売上',
      sellingExpenseOfOwnDepartment: '販売費 (自部門コスト)',
      cost: '売上原価',
      generalAdministrativeExpense: '一般管理費',
      operatingIncome: '営業利益',
      operatingIncomeRatio: '営業利益率',
      organizationName: '組織名',
      thisYearExpectation: '今年度見込み',
      nextYearTarget: '次年度目標',
      yearOnYear: '年度比',
      higherOrganizationTargetPlan: '上位設定目標',
      totalPlan: '各組織の計画値合計',
      diffPlan: '上位設定目標と合計の差',
      pageTitle: '事業計画,事業計画承認',
      approveButton: '承認',
      targetYear: '対象年度',
      targetOrganization: '対象組織',
      approveAnnualPlanSuccess: '事業計画を承認しました。',
      approveAnnualPlanError: '事業計画の承認に失敗しました。',
      createApprovedAnnualPlanSnapshotSuccess: '事業計画の断面を保存しました。',
      createApprovedAnnualPlanSnapshotError: '事業計画の断面の保存に失敗しました。',
      doYouNotHavePermission: '使用権限がありません',
    },
  },
  planMeasures: {
    labelConfig: {
      pageTitle: '事業計画,施策登録',
      targetYear: '対象年度',
      confirmButton: '入力内容確定',
      notifyButton: '通知',
      planMeasureRegisteredNotification: '施策登録完了通知',
      comment: 'コメント',
      deletePlanMeasureSuccess: '選択した施策を削除しました。',
      deletePlanMeasureError: '選択した施策の削除に失敗しました。',
      copyPlanMeasureSuccess: '選択した施策をコピーしました。',
      copyPlanMeasureError: '選択した施策のコピーに失敗しました。',
      copyPlanMeasuresSuccess: '選択した施策を次年度へコピーしました。',
      copyPlanMeasuresError: '選択した施策のコピーに失敗しました。',
      copyPlanMeasureButton: '施策を次年度にコピー',
      copyPlanMeasureDesc: '次年度も引き続き実施する施策を選択し、次年度にコピーして下さい。',
      copyPlanMeasuresConfirmText: '選択した施策を次年度にコピーしますか？',
      deletePlanMeasuresConfirmText: '選択した施策を削除しますか？',
      copyPlanMeasuresButton: 'コピー',
      completeRegistrationPlanMeasuresSuccess: '施策登録の完了を通知しました。',
      completeRegistrationPlanMeasuresError: '施策登録の完了通知に失敗しました。',
      addPlanMeasureButton: '施策を追加',
      addPlanMeasureDesc: '新規に実施する施策を追加してください。',
      thisYearResultsTabName: '今年度実績',
      nextYearPlansTabName: '次年度計画',
      year: '年度',
      cancelBtn: 'キャンセル',
    },
  },
  selectPlanMeasuresTable: {
    labelConfig: {
      columnSelectTitle: '選択',
      columnPlanMeasureNameTitle: '施策名',
      columnImplementationTargetTitle: '実施対象',
      year: '年度',
    },
  },
  //Define config for measure effect cost form
  planMeasureCostForm: {
    inputConfig: {
      item: {
        require: true,
        visible: true,
      },
      effectIncDec: {
        require: true,
        visible: true,
      },
      accountId: {
        require: true,
        visible: true,
      },
      costRecordingDestination: {
        require: true,
        visible: true,
      },
      costRecordingDestinationNotLaborCost: {
        require: false,
        visible: true,
      },
    },
    labelConfig: {
      item: '項目',
      effectIncDec: '効果増減',
      accountId: '勘定科目',
      costRecordingDestination: 'コスト計上先',
      costRecordingDestinationNotLaborCost: 'コスト計上先',
      year: '年度',
      planMeasureCostSubTitle:
        'この施策を実施することによるプラスの効果(コスト削減)とマイナスの効果(コスト増加)を入力して下さい。',
      addCostButton: '効果を追加',
      month: '月',
      yearLabel: '年',
      action: '操作',
      remove: '削除',
      edit: '編集',
      createSuccess: '追加完了しました。',
      updateSuccess: '更新完了しました。',
      deleteConfirmText: 'データを削除しますか?',
      close: '閉じる',
      dialogTitle: '効果(コスト)',
    },
  },
  //Define config for plan measure task form
  planMeasureTaskForm: {
    inputConfig: {
      taskName: {
        require: true,
        visible: true,
        maxlength: 200,
      },
      accountId: {
        require: true,
        visible: true,
      },
      costRecordingDestination: {
        require: true,
        visible: true,
      },
      responsiblePerson: {
        require: true,
        visible: true,
      },
      kpiOther: {
        require: false,
        visible: true,
      },
      kpiType: {
        require: false,
        visible: true,
      },
      kpiPeriod: {
        require: false,
        visible: true,
      },
      kpiThreshold: {
        require: false,
        visible: true,
      },
    },
    labelConfig: {
      taskName: 'タスク',
      accountId: '勘定科目',
      responsiblePerson: '担当',
      costRecordingDestination: 'コスト計上先',
      kpiType: 'KPI種類',
      kpiThreshold: 'KPI閾値',
      year: '年度',
      month: '月',
      yearLabel: '年',
      registrationTaskSubTitle: 'この施策で行う作業(タスク)を追加して下さい。',
      addRegistrationTaskButton: 'タスクを追加',
      action: '操作',
      remove: '削除',
      edit: '編集',
      createSuccess: '追加完了しました。',
      updateSuccess: '更新完了しました。',
      deleteConfirmText: 'データを削除しますか?',
      close: '閉じる',
      dialogTitle: 'タスク',
    },
  },
  //Define config for measure registration task cost allocation
  registrationTaskCost: {
    inputConfig: {},
    labelConfig: {
      task: 'タスク',
      accountId: '勘定科目',
      allocationAmount: '配賦金額',
      taskCostSubTitle: 'タスクの共通コスト配賦先組織および配布割合を設定して下さい。',
      addRegistrationTaskButton: '配賦先を追加',
      validateTotalRowByPercent: '配賦割合は合計100%になるよう入力して下さい。',
      allocations: '配賦割合',
      updateSuccess: '更新完了しました。',
    },
  },
  // 事業計画策定・施策登録依頼
  formulatePlanMeasureRequest: {
    labelConfig: {
      endDate: '提出期限',
      organizationName: '組織名',
      assigneeName: '担当者',
      planFormulationTitle: '事業計画策定依頼',
      planFormulationText: '計画策定',
      planMeasureRegistrationTitle: '施策登録依頼',
      planMeasureRegistrationText: '施策登録',
      planFormulationRequestMutationSuccess: '事業計画策定依頼に成功しました。',
      planFormulationRequestMutationError: '事業計画策定依頼に失敗しました。',
      planMeasureRegistrationRequestMutationSuccess: '施策登録依頼に成功しました。',
      planMeasureRegistrationRequestMutationError: '施策登録依頼に失敗しました。',
    },
  },
  planMeasuresConfirmForm: {
    labelConfig: {
      pageTitle: '事業計画,施策決定',
      decideButton: '実施施策決定',
      targetYear: '計画対象年度',
      decidePlanMeasures: '施策を決定しました。',
      decidePlanMeasuresError: '施策の決定に失敗しました。',
      selectPlanMeasuresSubTitle: '次年度に実施する施策を選択して下さい。',
      contents: '表示内容',
      targetPlanFromHigherOrganization: '上位設定目標',
      selectedPlanMeasuresTotal: '選択した施策の合計',
      gap: '上位設定目標と合計の差',
      sales: '売上',
      deemedSales: 'みなし売上',
      salesCost: '売上原価',
      ownSellingExpense: '販売費\n(自部門コスト)',
      sellingExpense: '販売費',
      generalAdministrativeExpense: '一般管理費',
      operatingIncome: '営業利益',
      operatingIncomeRatio: '営業利益率',
      sum: '合計',
      effectSale: '効果(売上)',
      effectSaleWithRisk: '効果(売上)リスク込み',
      effectCost: '効果(コスト)',
      effectCostWithRisk: '効果(コスト)リスク込み',
      cost: 'コスト',
      risk: 'リスク',
      effectMinusCostMinusRisk: '効果-コスト-リスク',
      planMeasureName: '施策名',
      doYouNotHavePermission: '使用権限がありません',
    },
  },
}

type LabelWithValue = {
  value: string
  text: string
}

/**
 * 企画進捗報告スタータス
 */
export const projectProgressReportStatusLabels: Array<LabelWithValue> = [
  { value: 'advanced', text: '前倒し' },
  { value: 'onTime', text: 'オンスケ' },
  { value: 'delayed', text: '遅延' },
]
export const projectProgressReportStatusValues = projectProgressReportStatusLabels.map(
  (label) => label.value
)
export type ProjectProgressReportStatus = typeof projectProgressReportStatusValues[number]

/**
 * 企画進捗報告入力単位
 */
export const projectProgressReportUnit = ['日数', '工数']
export const projectProgressReportUnitValues = ['day', 'manHour']
export type ProjectProgressReportUnit = typeof projectProgressReportUnitValues[number]

/**
 * 施策案実施効果金額単位
 */
export const costUnitLabels: Array<string> = ['円', '千円', '万円']

/**
 * 表示用日付フォーマット
 */
export const dateFormat = 'YYYY/MM/DD'

/**
 * 表示用和暦日付フォーマット
 */
export const japaneseDateFormat = 'YYYY年M月D日'

/**
 * 表示用和暦日時フォーマット
 */
export const japaneseDateTimeFormat = 'YYYY年M月D日 HH:mm:ss'

/**
 * 表示日時フォーマット
 */
export const dateTimeFormat = 'YYYY/MM/DD HH:mm:ss'

/**
 * 最大日付
 */
export const MAX_DATE_VALUE = 8640000000000000

/**
 * 企画ステータスの表示ラベル一覧
 */
export const projectStatusLabels = {
  planning: '企画立案中',
  doing: '課題対応中',
  done: '完了',
  canceled: '中止',
}

/**
 * 優先度の表示ラベル一覧
 */
export const priorityLabels = {
  high: '高',
  middle: '中',
  low: '低',
}

/**
 * 課題ステータスの表示ラベル一覧
 */
export const taskStatusLabels: { [index: string]: string } = {
  registered: '起票',
  planningCounter: '対策検討中',
  planningMeasure: '施策立案中',
  evaluatingMeasure: '施策評価中',
  fixedMeasure: '施策決定',
  canceled: '中止',
}

/**
 * 課題タイプの表示ラベル一覧
 */
export const taskTypes = {
  // 問題
  issue: {
    id: 1,
    propertyName: 'issue',
    label: '問題を解決',
  },
  // 目標
  target: {
    id: 2,
    propertyName: 'targets',
    label: '目標を達成',
  },
  // TODO
  todo: {
    id: 3,
    propertyName: 'todos',
    label: 'ToDo(法令対応や機器更新など、対応する内容が決まっている)',
  },
  // 検討内容
  studyContent: {
    id: 4,
    propertyName: 'studyContents',
    label: '対応方針を検討',
  },
  // 調査
  investigation: {
    id: 5,
    propertyName: 'investigations',
    label: '調査',
  },
  // その他
  other: {
    id: 6,
    propertyName: 'others',
    label: 'その他',
  },
} as const
export type TaskType = typeof taskTypes[keyof typeof taskTypes]['id']
export type TaskTypePropertyName = typeof taskTypes[keyof typeof taskTypes]['propertyName']

export const OCCUR_STATUSES = ['occurred', 'mayOccur'] as const
export type OccurStatus = typeof OCCUR_STATUSES[number]

export const OCCUR_FREQUENCIES = ['once', 'multiple']
export type OccurFrequency = typeof OCCUR_FREQUENCIES[number]

/**
 * タイムスタンプ
 */
export const timestampFormat = 'YYYY/MM/DD HH:mm:ss'

export const calculateProjectProgress = {
  'projectStatus.planning': 10,
  'projectStatus.doing': {
    'taskStatus.registered': 20,
    'taskStatus.planningCounter': 40,
    'taskStatus.planningMeasure': 60,
    'taskStatus.evaluatingMeasure': 80,
    'taskStatus.fixedMeasure': 100,
  },
  'projectStatus.done': 100,
}

export const measureImplementationTaskTypes = {
  introduceNewSystem: {
    key: 'introduceNewSystem',
    label: '新システム導入',
  },
  rebuildExistingSystem: {
    key: 'rebuildExistingSystem',
    label: '既存システム再構築',
  },
  modifyExistingSystem: {
    key: 'modifyExistingSystem',
    label: '既存システム改修',
  },
  purchase: {
    key: 'purchase',
    label: '購入',
  },
  abandon: {
    key: 'abandon',
    label: '廃棄',
  },
  implementPoc: {
    key: 'implementPoc',
    label: 'PoC実施',
  },
  investigate: {
    key: 'investigate',
    label: '調査',
  },
  procure: {
    key: 'procure',
    label: '調達',
  },
  other: {
    key: 'other',
    label: 'その他',
  },
} as const
export type ImplementationTaskType = typeof measureImplementationTaskTypes[keyof typeof measureImplementationTaskTypes]['key']

export const measureImplementationTaskParticipantScopeRoles = {
  manager: {
    label: '主担当',
    value: 1,
    icon: '◎',
  },
  provider: {
    label: '情報提供者',
    value: 2,
    icon: '○',
  },
  approver: {
    label: '承認者',
    value: 3,
    icon: '□',
  },
  other: {
    label: 'その他',
    value: 4,
    icon: '△',
  },
} as const
export type ImplementationTaskParticipantScopeRole = typeof measureImplementationTaskParticipantScopeRoles[keyof typeof measureImplementationTaskParticipantScopeRoles]['value']

/**
 * 価格表示単位一覧
 */
export const priceUnits: PriceUnit[] = [
  { type: 'yen', name: '円', isDefault: false, digitLength: 1 },
  { type: 'senYen', name: '千円', isDefault: true, digitLength: 4 },
  { type: 'manYen', name: '万円', isDefault: false, digitLength: 5 },
  { type: 'hyakumanYen', name: '百万', isDefault: false, digitLength: 7 },
]

// 期初めの開始月
export const firstMonth = 4

/**
 * 表示単位一覧
 */
export const dateUnits: DateUnit[] = [
  { type: 'year', name: '年' },
  { type: 'halfPeriod', name: '半期' },
  { type: 'quarter', name: '四半期' },
  { type: 'month', name: '月' },
  { type: 'week', name: '週' },
  { type: 'day', name: '日' },
]

// 表示期間一覧（年の場合）
export const yearTerms: DateTerm[] = [
  { name: '1年', month: 12, default: true },
  { name: '2年', month: 12 * 2 },
  { name: '3年', month: 12 * 3 },
  { name: '4年', month: 12 * 4 },
  { name: '5年', month: 12 * 5 },
]

// 表示期間一覧（月の場合）
export const monthTerms: DateTerm[] = [
  { name: '1ヶ月', month: 1 },
  { name: '2ヶ月', month: 2 },
  { name: '3ヶ月', month: 3 },
  { name: '4ヶ月', month: 4 },
  { name: '5ヶ月', month: 5 },
  { name: '6ヶ月', month: 6 },
  { name: '7ヶ月', month: 7 },
  { name: '8ヶ月', month: 8 },
  { name: '9ヶ月', month: 9 },
  { name: '10ヶ月', month: 10 },
  { name: '11ヶ月', month: 11 },
  { name: '12ヶ月', month: 12, default: true },
  { name: '2年', month: 12 * 2 },
]

// タスク種類名一覧
export const taskTypeNames: TaskTypeName[] = [
  /*
  {
    type: 'longterm',
    name: '中長期計画',
  },
  {
    type: 'yearly',
    name: '年度計画',
  },
  */
  {
    type: 'plan',
    name: '企画',
  },
  {
    type: 'planTask',
    name: '課題',
  },
  {
    type: 'measure',
    name: '施策',
  },
  {
    type: 'measureTask',
    name: 'タスク',
  },
  {
    type: 'milestone',
    name: 'マイルストーン',
  },
]

/**
 * 承認対象
 */
export const approvalCategorySlugs = {
  plan: {
    slug: 'plan',
    label: '事業計画',
  },
  plan_project: {
    slug: 'plan_project',
    label: '事業計画 (企画)',
  },
  plan_modification: {
    slug: 'plan_modification',
    label: '事業計画 (修正)',
  },
  project: {
    slug: 'project',
    label: '企画',
  },
  task: {
    slug: 'task',
    label: '課題',
  },
  measure: {
    slug: 'measure',
    label: '施策',
  },
  proposal_evaluation: {
    slug: 'proposal_evaluation',
    label: '提案評価',
  },
} as const

export type ApprovalCategorySlug = typeof approvalCategorySlugs[keyof typeof approvalCategorySlugs]['slug']

export const approvalStepTypes = {
  everyone: {
    id: 'everyone',
    label: '全員',
  },
  atLeastOne: {
    id: 'atLeastOne',
    label: '誰か一人',
  },
} as const
export type ApprovalStepType = typeof approvalStepTypes[keyof typeof approvalStepTypes]['id']

export const approvalStepApproverTypes = {
  departments: {
    id: 'departments',
    label: '役職全て',
  },
  departmentsAndAnySuperior: {
    id: 'departmentsAndAnySuperior',
    label: '役職且つ上長',
  },
  departmentsAndRecentSuperior: {
    id: 'departmentsAndRecentSuperior',
    label: '役職且つ直近の上長一人',
  },
} as const
export type ApprovalStepApproverType = typeof approvalStepApproverTypes[keyof typeof approvalStepApproverTypes]['id']

export const approvalStepAssigneeStatuses = {
  processing: {
    id: 'processing',
    label: '未処理',
  },
  approved: {
    id: 'approved',
    label: '承認',
  },
  rejected: {
    id: 'rejected',
    label: '却下',
  },
  canceled: {
    id: 'canceled',
    label: '未処理',
  },
} as const

export type ApprovalStepAssigneeStatus = typeof approvalStepAssigneeStatuses[keyof typeof approvalStepAssigneeStatuses]['id']
export type ApprovalStepAssigneeStatusLabel = typeof approvalStepAssigneeStatuses[keyof typeof approvalStepAssigneeStatuses]['label']

export const approvalRequestStatuses = {
  processing: {
    id: 'processing',
    label: '処理中',
  },
  approved: {
    id: 'approved',
    label: '承認',
  },
  rejected: {
    id: 'rejected',
    label: '却下',
  },
  canceled: {
    id: 'canceled',
    label: '依頼取消',
  },
} as const
export type ApprovalRequestStatus = typeof approvalRequestStatuses[keyof typeof approvalRequestStatuses]['id']
export type ApprovalRequestStatusLabel = typeof approvalRequestStatuses[keyof typeof approvalRequestStatuses]['label']

type NotificationType = {
  [slug: string]: {
    id: string
    label: string
    bgColor: string
  }
}

export const notificationTypes: NotificationType = {
  planMeasureRegistrationCompleted: {
    id: 'planMeasureRegistrationCompleted',
    label: '施策登録完了報告',
    bgColor: 'grey',
  },
  planMeasureRegistrationRequest: {
    id: 'planMeasureRegistrationRequest',
    label: '施策登録依頼',
    bgColor: 'grey',
  },
  planFormulationCompleted: {
    id: 'planFormulationCompleted',
    label: '事業計画策定完了報告',
    bgColor: 'grey',
  },
  planFormulationRequest: {
    id: 'planFormulationRequest',
    label: '事業計画策定依頼',
    bgColor: 'grey',
  },
  approvalRequest: {
    id: 'approvalRequest',
    label: '承認依頼',
    bgColor: 'grey',
  },
  reviewRequest: {
    id: 'reviewRequest',
    label: 'レビュー依頼',
    bgColor: 'grey',
  },
  alert: {
    id: 'alert',
    label: 'アラート',
    bgColor: '#BF1919',
  },
  surveyRequest: {
    id: 'surveyRequest',
    label: 'アンケート依頼',
    bgColor: 'grey',
  },
  assignedTaskOwner: {
    id: 'assignedTaskOwner',
    label: '課題オーナー',
    bgColor: '#1d70c9',
  },
  assignedMeasureOwner: {
    id: 'assignedMeasureOwner',
    label: '施策責任者',
    bgColor: '#1f9973',
  },
  system: {
    id: 'system',
    label: 'システム',
    bgColor: 'clear',
  },
  other: {
    id: 'other',
    label: 'その他',
    bgColor: 'clear',
  },
} as const

export type NotificationTypes = typeof notificationTypes[keyof typeof notificationTypes]['id']
export type NotificationTypeLabel = typeof notificationTypes[keyof typeof notificationTypes]['label']

/**
 * 年間事業計画ステータス
 */
export const annualPlanStatuses = {
  inProgress: {
    id: 'inProgress',
    label: '進行中',
  },
  approved: {
    id: 'approved',
    label: '承認済み',
  },
} as const

export type AnnualPlanStatus = typeof annualPlanStatuses[keyof typeof annualPlanStatuses]['id']

/**
 * 事業計画ステータス
 */
const planStatuses = {
  inProgress: {
    id: 'inProgress',
    label: '進行中',
  },
  confirmed: {
    id: 'confirmed',
    label: '確定済み',
  },
} as const

export type PlanStatus = typeof planStatuses[keyof typeof planStatuses]['id']

export const organizationLevelMap: Array<OrganizationLevel> = [
  { name: '全社', level: 1 },
  { name: '事業部', level: 3 },
  { name: '部', level: 4 },
  { name: '課', level: 5 },
]

export const departmentTypeOrganizationLevelMap: Array<DepartmentTypeOrganizationLevel> = [
  { departmentType: 'hub', organizationLevel: organizationLevelMap[0] },
  { departmentType: 'businessUnit', organizationLevel: organizationLevelMap[1] },
  { departmentType: 'department', organizationLevel: organizationLevelMap[2] },
  { departmentType: 'division', organizationLevel: organizationLevelMap[3] },
]

/**
 * 分類
 * @value new -> 新規
 * @value existing -> 既存
 * @value riskAvoidance -> リスク回避
 * @value legalComplianceOrEtc -> 法令対応等
 */
export const PlanMeasureClassificationTypes = {
  // 新規
  new: {
    propertyName: 'New',
    label: '新規（新たに実施する施策）',
  },
  // 既存
  existing: {
    propertyName: 'Existing',
    label: '既存（今年度から引き続き実施する施策）',
  },
  // リスク回避
  riskAvoidance: {
    propertyName: 'RiskAvoidance',
    label: 'リスク回避（BCPやセキュリティ対策など、リスクを回避する施策）',
  },
  // 法令対応等
  legalComplianceOrEtc: {
    propertyName: 'LegalComplianceOrEtc',
    label: 'その他（効果が見込めないが、必ず実施する必要のある施策。法令対応など）',
  },
} as const
export type PlanMeasureClassificationType = typeof PlanMeasureClassificationTypes[keyof typeof PlanMeasureClassificationTypes]['propertyName']

/**
 * コスト計上先
 * @value ownDepartment -> 自部門
 * @value common -> 共通
 */
export const TaskCostRecordingDestinationTypes = {
  // 自部門
  ownDepartment: {
    propertyName: 'OwnDepartment',
    label: '自部門',
  },
  // 共通
  common: {
    propertyName: 'Common',
    label: '共通',
  },
} as const
export type TaskCostRecordingDestinationType = typeof TaskCostRecordingDestinationTypes[keyof typeof TaskCostRecordingDestinationTypes]['propertyName']

/**
 * Define 項目 in measure effect sale
 */
export const EffectSaleProjectTypes = {
  // 売上
  sales: {
    propertyName: 'Sales',
    label: '売上',
  },
  // みなし売上
  deemedSales: {
    propertyName: 'DeemedSales',
    label: 'みなし売上',
  },
} as const
export type EffectSaleProjectType = typeof EffectSaleProjectTypes[keyof typeof EffectSaleProjectTypes]['propertyName']

/**
 * Define status of 項目 in measure effect sale
 */
export const EffectSaleStatusTypes = {
  // 増加
  increase: {
    propertyName: 'Increase',
    label: '増加',
  },
  // 減少
  decrease: {
    propertyName: 'Decrease',
    label: '減少',
  },
  //現状維持
  maintainStatusQuo: {
    propertyName: 'MaintainStatusQuo',
    label: '現状維持',
  },
} as const
export type EffectSaleStatusType = typeof EffectSaleStatusTypes[keyof typeof EffectSaleStatusTypes]['propertyName']

/**
 * types of 項目 in measure effect cost
 * @value cost -> コスト
 * @value deemedCost -> みなしコスト
 * @value other -> その他
 */
export const PlanMeasureCostItemTypes = {
  // コスト
  cost: {
    propertyName: 'Cost',
    label: 'コスト',
  },
  // みなしコスト
  deemedCost: {
    propertyName: 'DeemedCost',
    label: 'みなしコスト',
  },
  // その他
  other: {
    propertyName: 'Other',
    label: 'その他',
  },
} as const
export type PlanMeasureCostItemType = typeof PlanMeasureCostItemTypes[keyof typeof PlanMeasureCostItemTypes]['propertyName']
export type PlanMeasureCostItemKey = typeof PlanMeasureCostItemTypes[keyof typeof PlanMeasureCostItemTypes]

/**
 * types of 効果増減 in measure effect cost
 * @value increase -> 増加
 * @value decrease -> 減少
 * @value maintainStatusQuo -> 現状維持
 */
export const PlanMeasureCostIncDecTypes = {
  // 増加
  increase: {
    propertyName: 'Increase',
    label: '増加',
  },
  // 減少
  decrease: {
    propertyName: 'Decrease',
    label: '減少',
  },
  //現状維持
  maintainStatusQuo: {
    propertyName: 'MaintainStatusQuo',
    label: '現状維持',
  },
} as const
export type PlanMeasureCostIncDecType = typeof PlanMeasureCostIncDecTypes[keyof typeof PlanMeasureCostIncDecTypes]['propertyName']

/**
 * KPI期間 types
 * @value Monthly -> 毎月
 * @value Quarter -> 四半期
 * @value HalfPeriod -> 半期
 * @value Yearly -> 年間
 */
export const KPIPeriodTypes = {
  // 毎月
  monthly: {
    propertyName: 'Monthly',
    label: '毎月',
  },
  // 四半期
  quarter: {
    propertyName: 'Quarter',
    label: '四半期',
  },
  // 半期
  halfPeriod: {
    propertyName: 'HalfPeriod',
    label: '半期',
  },
  // 年間
  yearly: {
    propertyName: 'Yearly',
    label: '年間',
  },
} as const
export type KPIPeriodType = typeof KPIPeriodTypes[keyof typeof KPIPeriodTypes]['propertyName']

/**
 * KPI種類 types
 * @value Effect -> 効果
 * @value Schedule -> スケジュール
 * @value Others -> その他
 */

export const KPITypes = {
  // 効果
  effect: {
    propertyName: 'Effect',
    label: '効果',
  },
  // スケジュール
  schedule: {
    propertyName: 'Schedule',
    label: 'スケジュール',
  },
  // その他
  others: {
    propertyName: 'Others',
    label: 'その他',
  },
} as const
export type KPIType = typeof KPITypes[keyof typeof KPITypes]['propertyName']

export const AccessActions = ['view', 'edit', 'deny'] as const
export type AccessAction = typeof AccessActions[number]

export const DepartmentTypes = [
  'hub', //拠点
  'businessUnit', //事業部
  'department', //部
  'division', //課
  'unit', //係
] as const
export type DepartmentType = typeof DepartmentTypes[number]

export const AccountTitleTypes = ['laborCost'] as const
export type AccountTitleType = typeof AccountTitleTypes[number]

export const AccountDisplayTitleTypes = [
  'cost',
  'sellingExpense',
  'generalAdministrativeExpense',
] as const
export type AccountDisplayTitleType = typeof AccountDisplayTitleTypes[number]

//Risk target types
export const RiskTargetTypes = {
  // 売上
  RiskSales: {
    propertyName: 'RiskSales',
    label: '売上',
  },
  //コスト
  riskCosts: {
    propertyName: 'RiskCosts',
    label: 'コスト',
  },
} as const
export type RiskTargetType = typeof RiskTargetTypes[keyof typeof RiskTargetTypes]['propertyName']

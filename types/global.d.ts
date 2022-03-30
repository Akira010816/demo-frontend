type GanttLink = import('~/components/gantt/gantt').GanttLink
type TaskStatus = import('../lib/displaySetting').TaskStatus
type TaskType = import('../lib/displaySetting').TaskType
type OccurStatus = import('../lib/displaySetting').OccurStatus
type OccurFrequency = import('../lib/displaySetting').OccurFrequency
type ProjectProgressReportStatus = import('../lib/displaySetting').ProjectProgressReportStatus
type ProjectProgressReportUnit = import('../lib/displaySetting').ProjectProgressReportUnit
type ImplementationTaskType = import('../lib/displaySetting').ImplementationTaskType
type ImplementationTaskParticipantScopeRole = import('../lib/displaySetting').ImplementationTaskParticipantScopeRole
type DepartmentType = import('../lib/displaySetting').DepartmentType
type AccountTitleType = import('../lib/displaySetting').AccountTitleType
type AccountDisplayTitleType = import('../lib/displaySetting').AccountDisplayTitleType

type ApprovalCategorySlug = import('../lib/displaySetting').ApprovalCategorySlug
type ApprovalStepAssigneeStatus = import('../lib/displaySetting').ApprovalStepAssigneeStatus
type ApprovalStepType = import('../lib/displaySetting').ApprovalStepType
type ApprovalStepApproverType = import('../lib/displaySetting').ApprovalStepApproverType
type ApprovalRequestStatus = import('../lib/displaySetting').ApprovalRequestStatus
type AnnualPlanStatus = import('../lib/displaySetting').AnnualPlanStatus
type PlanStatus = import('../lib/displaySetting').PlanStatus
type EffectSaleProjectType = import('../lib/displaySetting').EffectSaleProjectType
type EffectSaleStatusType = import('../lib/displaySetting').EffectSaleStatusType
type PlanMeasureClassificationType = import('../lib/displaySetting').PlanMeasureClassificationType
type PlanMeasureCostItemType = import('../lib/displaySetting').PlanMeasureCostItemType
type PlanMeasureCostIncDecType = import('../lib/displaySetting').PlanMeasureCostIncDecType
type KPIType = import('../lib/displaySetting').KPIType
type KPIPeriodType = import('../lib/displaySetting').KPIPeriodType
type TaskCostRecordingDestinationType = import('../lib/displaySetting').TaskCostRecordingDestinationType
type AccessAction = import('../lib/displaySetting').AccessAction
type RiskTargetType = import('../lib/displaySetting').RiskTargetType

/**
 * 課題
 */
type Task = {
  id: number
  project_id: number
  code: string
  name: string
  registeredUser: Pick<User, 'id' | 'name'>
  registeredAt: string
  taskType: TaskType
  startDate: string
  endDate: string
  taskStatus: TaskStatus
  targets?: Array<Target>
  todos?: Array<Todo>
  others?: Array<Other>
  investigations?: Array<Investigation>
  studyContents?: Array<StudyContent>
  issue?: Issue
  version: number
  createdAt: Date
  updatedAt: Date
}

type TaskProposal = Cause | Target | Todo | Other | Investigation | StudyContent

type Target = {
  id: number
  taskId: number
  text: string
  measures?: Array<Measure>
  createdAt: Date
  updatedAt: Date
}

type Todo = {
  id: number
  taskId: number
  text: string
  measures?: Array<Measure>
  createdAt: Date
  updatedAt: Date
}

type Investigation = {
  id: number
  taskId: number
  text: string
  measures?: Array<Measure>
  createdAt: Date
  updatedAt: Date
}

type StudyContent = {
  id: number
  taskId: number
  text: string
  measures?: Array<Measure>
  createdAt: Date
  updatedAt: Date
}

type Other = {
  id: number
  taskId: number
  text: string
  measures?: Array<Measure>
  createdAt: Date
  updatedAt: Date
}

type Issue = {
  id: number
  taskId: number
  occurStatus: OccurStatus
  occurCount: number
  occurFrequency: OccurFrequency
  occurFrequencyDetail: string
  contents: string
  impact: string
  version: number
  causes?: Array<CauseWithCauseConditions>
  createdAt: Date
  updatedAt: Date
}

type Cause = {
  id: number
  issueId: number
  text: string
  isHypothesis: boolean
  version: number
  measures?: Array<Measure>
  causeConditions?: Array<CauseCondition>
  createdAt: Date
  updatedAt: Date
}

type CauseWithCauseConditions = Cause & { causeConditions?: Array<CauseCondition> }

type CauseCondition = {
  id: number
  causeId: number
  achievementCondition: string
  version: number
  createdAt: Date
  updatedAt: Date
}

type DeptProps = {
  deptId: string
  name: string
}

type BaseInfoProps = {
  data?: {
    id: string
    name: string
    overview: string
    files: any[]
    mentioner: string
    taskType: number[]
    mileStone: Date
    raisedDept: DeptProps
    contentType: number[]
    createdTime: Date
    updatedTime: Date
  }
  clickNext: (id: number) => void
  next?: number
}

type LoginRequestParams = {
  loginInput: {
    loginId: string
    password: string
    //clientSlug: string
  }
}
type LoginResponse = {
  login: JWTResponse
}

type GraphqlErrorMessage = {
  [key: string]: {
    status: string
    message: string
  }
}

type ChangeLoginDepartmentResponse = {
  changeLoginDepartment: JWTResponse
}

type JWTResponse = {
  accessToken: string
  userId: number | undefined
  departmentId: number | undefined
  userDepartmentId: number | undefined
  positionWeight: number | undefined
}

type Salary = {
  id: number
  name: string
  salary: number
}

type User = {
  id: number
  name: string
  userId: number
  loginId: string
  client?: Client
  salary?: Salary
  userDepartments?: { departments: Array<Department> }
}

type UserDepartment = {
  id: number
  user: User
  department: Department
}

type Client = {
  id: number
  name: string
}

type AchievementCondition = {
  id: number
  description: string
}

type Company = {
  id: number
  name: string
}

type Measure = {
  id?: number
  code?: string
  name?: string
  overview?: string
  measureImplementationTasks?: MeasureImplementationTask[]
  measureImplementationEffects?: MeasureImplementationEffect[]
  causeConditions?: CauseCondition[]
  causes?: Cause[]
  targets?: Target[]
  todos?: Todo[]
  studyContents?: StudyContent[]
  investigations?: Investigation[]
  others?: Other[]
  startDate?: string
  endDate?: string
  links?: GanttLink[]
  version?: number
  costUnit?: string
}

type MeasureImplementationTaskParticipant = {
  name: string
  role: string
  location: string
}

type MeasureImplementationTaskScope = {
  name: string
}

type MeasureImplementationTaskParticipantScopeRole = ImplementationTaskParticipantScopeRole

type MeasureImplementationEffect = {
  id?: number
  evaluation?: string
  valueBeforeImprovement?: string
  valueAfterImprovement?: string
  calculationBasis?: string
  startAt?: Date
  startAtMemo?: string
  measuringMethod?: string
  annualCostEffect?: number
  causeConditions?: CauseCondition[]
  version?: number
  createdUserId?: number
  updatedUserId?: number
  createdAt?: Date
  updatedAt?: Date
}

type MeasureImplementationTask = {
  id?: number
  ganttId?: string
  name?: string
  type?: ImplementationTaskType
  overview?: string
  newSystemName?: string
  systemOverview?: string
  targetSystem?: System
  affectedSystems?: System[]
  purchaseTargets?: ItAssetType[]
  abandonmentTargets?: ItAssetType[]
  participants?: MeasureImplementationTaskParticipant[]
  scopes?: MeasureImplementationTaskScope[]
  participantScopeRoles?: MeasureImplementationTaskParticipantScopeRole[][]
  procurementScope?: string
  implementationDetail?: string
  modificationDescription?: string
  investigationDescription?: string
  procurementDescription?: string
  implementTarget?: string
  startAt?: Date
  endAt?: Date
  version?: number
  createdUserId?: number
  updatedUserId?: number
  createdAt?: Date
  updatedAt?: Date
} & MeasureImplementationTaskType

type MeasureImplementationTaskType =
  | MeasureImplementationTaskChild.IntroduceNewSystem
  | MeasureImplementationTaskChild.RebuildExistingSystem
  | MeasureImplementationTaskChild.ModifyExistingSystem
  | MeasureImplementationTaskChild.Purchase
  | MeasureImplementationTaskChild.Abandon
  | MeasureImplementationTaskChild.ImplementPoc
  | MeasureImplementationTaskChild.Procure
  | MeasureImplementationTaskChild.Investigate
  | MeasureImplementationTaskChild.Other

namespace MeasureImplementationTaskChild {
  export type IntroduceNewSystem = {
    systemOverview?: string
    newSystemName?: string
  }

  export type RebuildExistingSystem = void

  export type ModifyExistingSystem = {
    modificationDescription?: string
  }

  export type Purchase = void

  export type Abandon = void

  export type ImplementPoc = {
    implementationDetail?: string
  }

  export type Procure = {
    procurementDescription?: string
    procurementScope?: string
  }

  export type Investigate = {
    investigationDescription?: string
  }

  export type Other = {
    implementTarget?: string
  }
}

type System = {
  id?: number
  name?: string
  version?: number
  createdUserId?: number
  updatedUserId?: number
  createdAt?: Date
  updatedAt?: Date
}

type ItAssetType = {
  id?: number
  code?: string
}

type Department = {
  id: number
  code: string
  name: string
  isCommon?: boolean
  parent?: Department
  departmentLevel?: DepartmentLevel
  children?: Array<Department>
}

type DepartmentLevel = {
  id: number
  order: number
  name: string
}

type ProjectOwner = {
  id: number
  name: string
  department: string
}

type ProjectMember = {
  id: number
  name: string
  department: string
}

/**
 * マイルストーン種類
 */
type MilestoneType =
  | 'projectEndDate' // 施策実施完了の期限
  | 'decisionDueDate' // 施策決定の期限
  | 'others' // その他の重要なマイルストーン

/**
 * マイルストーン
 */
type Milestone = {
  id: number
  type: MilestoneType
  description?: string
  targetDate?: string
}

/**
 * スケジュール種類
 */
type ScheduleType =
  | 'planning' // 企画立案
  | 'problemAnalysis' // 課題分析
  | 'measures' // 対策検討
  | 'policyPlanning' // 施策立案
  | 'policyDecision' // 施策決定

/**
 * スケジュール
 */
type Schedule = {
  id: number
  type: ScheduleType
  startDate?: string
  endDate?: string
}

/**
 * 優先度
 */
type Priority =
  | 'high' // 高
  | 'middle' // 中
  | 'low' //低

/**
 * 企画ステータス
 */
type ProjectStatus =
  | 'planning' // 企画立案中
  | 'doing' // 課題対応中
  | 'done' // 完了
  | 'canceled' // 中止

/**
 * 企画進捗報告
 */
type ProjectProgressReport = {
  id: number
  targetDate: string
  status: ProjectProgressReportStatus
  projectStatus: ProjectStatus
  unit: ProjectProgressReportUnit
  delay: number
  avoidDelayPlan: string
  impact: string
  progress: number
  reportBody: string
  quality: string
  cost: string
  member: string
  reportedAt: string
}

/**
 * 価格表示単位
 */
type PriceUnit = {
  type: 'yen' | 'senYen' | 'manYen' | 'hyakumanYen'
  name: string
  isDefault: boolean
  digitLength: number
}

/**
 * 日付表示単位
 */
type DateUnit = {
  type: string
  name: string
}

/**
 * 日付表示期間
 */
type DateTerm = {
  name: string
  month: number
  default?: boolean
}

/**
 * タスク種類名
 */
type TaskTypeName = {
  type: string
  name: string
}

/**
 * 承認依頼
 */
type ApprovalRequest = {
  id: number
  status?: ApprovalRequestStatus
  code: string // 連番
  approvalCategory?: ApprovalCategory // 依頼対象
  requestedBy?: UserDepartment // 依頼人
  message?: string // 依頼メッセージ
  until?: string // 承認期限
  approvalFlow?: ApprovalFlow // フロー
  createdAt: Date
  updatedAt: Date
}

type ApprovalEmailTemplate = {
  id: number
  approvalNextMessage: string
  approvalRequesterMessage: string
  cancelMessage: string
  rejectMessage: string
  requestMessage: string
}

type ApprovalRequestMessageTemplate = {
  id: number
  message: string
}

type ApprovalCategory = {
  id: number
  name: string
  slug: ApprovalCategorySlug
  approvalEmailTemplate?: ApprovalEmailTemplate
  approvalRequestMessageTemplate?: ApprovalRequestMessageTemplate
}

type ApprovalFlow = {
  id: number
  name?: string
  description?: string
  approvalSteps?: Array<ApprovalStep>
  updatedAt: Date
  createdAt: Date
}

type CreateApprovalFlowInput = {
  name?: string
  description?: string
  approvalSteps: Array<CreateApprovalStepInput>
}

type ApprovalStep = {
  id: number
  name?: string
  order?: number
  type?: ApprovalStepType
  department?: Department
  isEditableFlow: boolean
  isSkippableFlow: boolean
  approverType: ApprovalStepApproverType
  isRequesterIncluded: boolean
  approvalStepAssignees?: Array<ApprovalStepAssignee>
}

type CreateApprovalStepInput = {
  name?: string
  order?: number
  type?: ApprovalStepType
  department?: Department
  isEditableFlow?: boolean
  isSkippableFlow?: boolean
  approverType: ApprovalStepApproverType
  isRequesterIncluded?: boolean
  approvalStepAssignees?: Array<CreateApprovalStepAssigneeInput>
}

type ApprovalStepAssignee = {
  id: number
  comment?: string
  approvalStatus: ApprovalStepAssigneeStatus
  statusChangedAt?: Date
  userDepartment?: UserDepartment
}

type CreateApprovalStepAssigneeInput = {
  comment?: string
  approvalStatus: ApprovalStepAssigneeStatus
  userDepartment?: UserDepartment.id
}

// 承認済み年間事業計画スナップショット
type ApprovedAnnualPlanSnapshot = {
  id: number
  annualPlan: AnnualPlan
  plans: Array<Plan>
  createdAt: Date
  updatedAt: Date
}

// 年間事業計画
type AnnualPlan = {
  id: number
  businessYear: BusinessYear
  status: AnnualPlanStatus
  plans?: Array<Plan>
  createdAt: Date
  updatedAt: Date
  version?: number
}

// 事業計画
type Plan = {
  id: number
  department?: Department
  status: PlanStatus
  targetSales: number
  targetSalesYearOnYear: number
  targetSalesCost: number
  deemedSales: number
  targetSalesCostYearOnYear: number
  targetSellingExpenseOfOwnDepartment: number
  targetSellingExpense: number
  targetSellingExpenseYearOnYear: number
  targetGeneralAdministrativeExpense: number
  targetGeneralAdministrativeExpenseYearOnYear: number
  annualPlan?: AnnualPlan
  planMeasureRegistrationRequests?: Array<PlanMeasureRegistrationRequest>
  createdAt: Date
  updatedAt: Date
  version?: number
}

//Define type PlanMeasureTaskCostTargetIndividual
type PlanMeasureTaskCostTargetIndividual = {
  id?: number
  userDpm?: UserDepartment
}

type Position = {
  id: number
  name: string
  weight: number
}

type UserDepartmentWithPosition = {
  id: number
  user: User
  department: Department
  position: Position
}

type OrganizationLevel = {
  level: number
  name: string
}

type DepartmentTypeOrganizationLevel = {
  departmentType: DepartmentType
  organizationLevel: OrganizationLevel
}

type PlanFormulationRequest = {
  planId: number
  until: string
  requestedTo: number[]
}

type PlanMeasureRegistrationRequest = {
  id?: number
  planId: number
  until: string
  plan?: Plan
  requestedTo: number[]
  requestedBy?: UserDepartment
}

// 年度
type BusinessYear = {
  id?: number
  year: number
  name: string
  startYear: number
  startMonth: number
  startDate: number
  endYear: number
  endMonth: number
  endDate: number
}

type PlanMeasure = {
  id?: number
  code?: string
  overview?: string
  measureName?: string
  riskUnitPrice?: PriceUnit
  implementationTarget?: 'Target' | 'NonTarget'
  version?: number
  costs?: Array<PlanMeasureCost>
  sales?: Array<PlanMeasureSale>
  risks?: Array<PlanMeasureRisk>
  tasks?: Array<PlanMeasureTask>
  classification?: PlanMeasureClassificationType
  businessYear?: BusinessYear
  department?: Department
}

//Define type of plan measure assign
type PlanMeasureAssign = {
  id?: number
  costTD?: PlanMeasureCostTargetDepartment
  costTI?: PlanMeasureCostTargetIndividual
  version?: number
}

//Define type of plan measure task allocation
type PlanMeasureTaskAllocation = {
  id?: number
  businessYear?: BusinessYear
  department?: Department
  distriDpm: Department
  allocationRate: number
  tempId?: string
  version?: number
}

//Define type PlanMeasureCostTargetDepartment
type PlanMeasureCostTargetDepartment = {
  id?: number
  department?: Department
  version?: number
}

//Define type PlanMeasureCostTargetIndividual
type PlanMeasureCostTargetIndividual = {
  id?: number
  userDpm?: UserDepartment
}

//Define type of plan measure risk price
type PlanMeasurePrice = {
  id?: number
  cost: number
  yearOfOccurrence: number
  monthOfOccurrence: number
  tempId?: string
  businessYear?: BusinessYear
  version?: number
}

type AccountTitle = {
  id: number
  name: string
  type: AccountTitleType
  accountDisplayTitle?: AccountDisplayTitle
}

type AccountDisplayTitle = {
  id: number
  name: string
  type: AccountDisplayTitleType
}

//Define type of plan measure task
type PlanMeasureTask = {
  id?: number
  taskName: string
  accountTitle?: AccountTitle
  costRecordingDestination: TaskCostRecordingDestinationType
  kpiType?: KPIType
  kpiOther?: string
  kpiThreshold?: number
  kpiPeriod?: KPIPeriodType
  assigns?: Array<PlanMeasureAssign>
  prices: Array<PlanMeasurePrice>
  allocations: Array<PlanMeasureTaskAllocation>
  isNew?: boolean
  version?: number
}

//Define type of plan measure cost
type PlanMeasureCost = {
  id?: number
  item?: PlanMeasureCostItemType
  effectIncDec?: PlanMeasureCostIncDecType
  accountTitle?: AccountTitle
  assigns?: Array<PlanMeasureAssign>
  prices: Array<PlanMeasurePrice>
  isNew?: boolean
  version?: number
}

//Define type of plan measure risk
type PlanMeasureRisk = {
  id?: number
  riskName?: string
  accountTitle?: AccountTitle
  costRecordingDestination?: string
  assigns?: Array<PlanMeasureAssign>
  prices: Array<PlanMeasurePrice>
  isNew?: boolean
  targetType?: RiskTargetType
  version?: number
}

//Define type of plan measure sale
type PlanMeasureSale = {
  id: number
  project: EffectSaleProjectType
  effectIncDec: string
  isNew?: boolean
  prices: Array<PlanMeasurePrice>
  version?: number
}

//Define type of plan measure assign input
type PlanMeasureAssignInput = {
  id?: number
  department: DepartmentInput
  businessYear: BusinessYearInput
  costTD?: PlanMeasureCostTargetDepartmentInput | null
  costTI?: PlanMeasureCostTargetIndividualInput | null
  version?: number
}

//Define type of plan measure price input
type PlanMeasurePriceInput = {
  id?: number
  cost: number
  yearOfOccurrence: number
  monthOfOccurrence: number
  businessYear: BusinessYearInput
  department: DepartmentInput
  version?: number
}

//Define task allocation input
type PlanMeasureTaskAllocationInput = {
  id?: number
  businessYear?: BusinessYearInput
  department?: DepartmentInput
  distriDpm: DepartmentInput
  allocationRate: number
  tempId?: string
}

//Define type PlanMeasureCostTargetDepartment input
type PlanMeasureCostTargetDepartmentInput = {
  id?: number
  department: DepartmentInput
  businessYear: BusinessYearInput
  version?: number
}

//Define type PlanMeasureCostTargetIndividual input
type PlanMeasureCostTargetIndividualInput = {
  id?: number
  userDpm?: UserDepartmentInput
  businessYear: BusinessYearInput
  department: DepartmentInput
  version?: number
}

//Define type UserDepartmentInput
type UserDepartmentInput = {
  id?: number
  userId?: number
  departmentId?: number
}

//Define type DepartmentInput
type DepartmentInput = {
  id?: number
  name?: string
}

//Define type RegisterBy
type RegisterByInput = {
  id: number
}

//Define type BusinessYearInputInput
type BusinessYearInput = {
  id: number
}

type AccessControl = {
  identityType: string
  planAccessType: AccessAction
  planMeasureAccessType: AccessAction
  planApprovalAccessType: boolean
  planFormulationRequestFlag: boolean
  planMeasureRegistrationRequestFlag: boolean
  planMeasureConfirmFlag: boolean
  // P2FW-719
  targetDepartmentLevel?: DepartmentLevel
  // targetDepartmentLevel: DepartmentType
}

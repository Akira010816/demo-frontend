import { Profile } from '~/graphhql/queries/findProfile'
import { AccessAction } from '~/lib/displaySetting'

export const AccessControls = {
  //メニューの事業計画策定を表示
  //事業計画画面を参照モードで表示
  businessPlanViewMode: {
    accessField: 'planAccessType',
    roles: ['edit', 'view'],
  },
  //メニューの事業計画策定を表示
  //事業計画画面を更新モードで表示
  //事業計画画面の入力内容確定ボタンを表示
  businessPlanEditMode: {
    accessField: 'planAccessType',
    roles: ['edit'],
  },
  //事業計画画面を参照モードで表示
  businessPlanFormulation: {
    accessField: 'planAccessType',
    roles: ['edit', 'view'],
  },
  //事業計画画面の入力内容確定ボタンを表示
  businessPlanConfirmButton: {
    accessField: 'planAccessType',
    roles: ['edit'],
  },
  //メニューの事業計画(承認)を表示
  //承認ページを参照モードで表示
  planApprovalViewMode: {
    accessField: 'planApprovalAccessType',
    roles: ['edit', 'view'],
  },
  //メニューの事業計画(承認)を表示
  //承認ページを編集モードで表示
  planApprovalEditMode: {
    accessField: 'planApprovalAccessType',
    roles: ['edit'],
  },
  //事業計画画面の事業計画策定依頼ボタンを表示
  planFormulationRequestFlag: {
    accessField: 'planFormulationRequestFlag',
    roles: [true],
  },
  //事業計画画面の施策登録依頼ボタンを表示
  planMeasureRegistrationRequestFlag: {
    accessField: 'planMeasureRegistrationRequestFlag',
    roles: [true],
  },
  //メニューの施策登録を表示
  //施策登録画面を参照モードで表示
  planMeasureViewMode: {
    accessField: 'planMeasureAccessType',
    roles: ['edit', 'view'],
  },
  //メニューの施策登録を表示
  //施策登録画面を更新モードで表示
  planMeasureEditMode: {
    accessField: 'planMeasureAccessType',
    roles: ['edit'],
  },
  //メニューの施策決定を表示
  planMeasureConfirm: {
    accessField: 'planMeasureConfirmFlag',
    roles: [true],
  },
} as const

export type AccessControlKey = keyof typeof AccessControls

export const youCanDoIt = (
  profile: Profile,
  currentUserDepartmentId: number | undefined,
  accessKey: AccessControlKey
): boolean => {
  if (!currentUserDepartmentId || !profile || !profile.userDepartments) return false
  const currentUserDepartmentIdx = profile.userDepartments.findIndex(
    (userDpm) => userDpm.id === currentUserDepartmentId
  )
  if (currentUserDepartmentIdx == -1) return false
  const currentDepartment = profile.userDepartments[currentUserDepartmentIdx]
  if (
    (!currentDepartment.accessControl || currentDepartment.accessControl.length < 1) &&
    (!currentDepartment.position.accessControl ||
      currentDepartment.position.accessControl.length < 1)
  )
    return false
  let currentTypeAccessByKey: (AccessAction | boolean)[] =
    currentDepartment.accessControl?.map((ac) => ac[AccessControls[accessKey].accessField]) || []
  const currentTypeAccessPositionByKey: (AccessAction | boolean)[] =
    currentDepartment.position.accessControl?.map(
      (ac) => ac[AccessControls[accessKey].accessField]
    ) || []
  currentTypeAccessByKey = currentTypeAccessByKey.concat(currentTypeAccessPositionByKey)
  return (
    AccessControls[accessKey].roles.findIndex(
      (role: AccessAction | true) => currentTypeAccessByKey.findIndex((cta) => cta == role) != -1
    ) != -1
  )
}

// P2FW-719
// export const getTargetOrganizationCategories = (
//   profile: Profile,
//   currentUserDepartmentId?: number
// ): Array<DepartmentType> => {
//   const currentUserDepartment = profile?.userDepartments?.filter(
//     (userDepartment) => userDepartment.id === currentUserDepartmentId
//   )?.[0]

//   if (!currentUserDepartment) {
//     return []
//   }

//   return [
//     ...new Set([
//       ...(currentUserDepartment.accessControl?.map(
//         (accessControl) => accessControl.targetDepartmentCategory
//       ) ?? []),
//       ...(currentUserDepartment.position?.accessControl?.map(
//         (accessControl) => accessControl.targetDepartmentCategory
//       ) ?? []),
//     ]),
//   ].filter(
//     (
//       departmentCategory
//     ): departmentCategory is Exclude<typeof departmentCategory, null | undefined> =>
//       !!departmentCategory
//   )
// }

// P2FW-719
export const getTargetOrganizationCategories = (
  profile: Profile,
  currentUserDepartmentId?: number
): Array<number> => {
  const currentUserDepartment = profile?.userDepartments?.filter(
    (userDepartment) => userDepartment.id === currentUserDepartmentId
  )?.[0]

  if (!currentUserDepartment) {
    return []
  }

  return [
    ...new Set([
      ...(currentUserDepartment.accessControl
        ?.filter((accessControl) => accessControl.targetDepartmentLevel)
        .map((accessControl) => accessControl.targetDepartmentLevel?.order) ?? []),
      ...(currentUserDepartment.position?.accessControl?.map(
        (accessControl) => accessControl.targetDepartmentLevel?.order
      ) ?? []),
    ]),
  ].filter(
    (departmentLevel): departmentLevel is Exclude<typeof departmentLevel, null | undefined> =>
      !!departmentLevel
  )
}

// P2FW-719
// export const getHighestTargetOrganizationCategory = (
//   profile: Profile,
//   currentUserDepartmentId?: number
// ): DepartmentType | null => {
//   const categories = getTargetOrganizationCategories(profile, currentUserDepartmentId)

//   if (!categories.length) {
//     return null
//   }

//   // order of if statements below matters
//   if (categories.includes('hub')) {
//     return 'hub'
//   }

//   if (categories.includes('businessUnit')) {
//     return 'businessUnit'
//   }

//   if (categories.includes('department')) {
//     return 'department'
//   }

//   if (categories.includes('department')) {
//     return 'department'
//   }

//   if (categories.includes('division')) {
//     return 'division'
//   }

//   return 'unit'
// }

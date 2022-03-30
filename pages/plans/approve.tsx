import React, { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLazyQuery, useMutation, useQuery } from '@apollo/react-hooks'
import { Col, Divider, Form, Layout, message, Row, Space, Typography } from 'antd'
import { ButtonProps } from 'antd/es/button'
import { ColumnsType } from 'antd/es/table'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import Button from '~/components/Button'
import Table from '~/components/table'
import { PriceUnitProps, PriceUnits } from '~/components/priceUnit'
import { youCanDoIt } from '~/lib/handlePermission'
import {
  FIND_ANNUAL_PLAN_BY_YEAR,
  FindAnnualPlanByYearResponse,
} from '~/graphhql/queries/findAnnualPlanByYear'
import {
  displaySetting,
  firstMonth,
  departmentTypeOrganizationLevelMap,
  AccountDisplayTitleType,
  priceUnits,
  EffectSaleProjectTypes,
} from '~/lib/displaySetting'
import {
  FIND_ALL_BUSINESS_YEARS,
  FindAllBusinessYearsResponse,
} from '~/graphhql/queries/findAllBusinessYears'
import {
  FIND_ALL_DEPARTMENTS,
  FindAllDepartmentsResponse,
} from '~/graphhql/queries/findAllDepartments'
import { calcByUnitAndFormat, numberFormatter, toFixed } from '~/lib/number'

import { useAuth } from '~/hooks/useAuth'
import _ from 'lodash'
import {
  APPROVE_ANNUAL_PLAN,
  ApproveAnnualPlanRequestTypes,
  ApproveAnnualPlanResponseTypes,
} from '~/graphhql/mutations/approveAnnualPlan'
import {
  CANCEL_APPROVED_ANNUAL_PLAN,
  CancelApprovedAnnualPlanRequestTypes,
  CancelApprovedAnnualPlanResponseTypes,
} from '~/graphhql/mutations/cancelApprovedAnnualPlan'
import {
  CREATE_APPROVED_ANNUAL_PLAN_SNAPSHOT,
  CreateApprovedAnnualPlanSnapshotRequestTypes,
  CreateApprovedAnnualPlanSnapshotResponseTypes,
} from '~/graphhql/mutations/createApprovedAnnualPlanSnapshot'
import dayjs from 'dayjs'
import {
  FIND_PLAN_MEASURES_BY_DEPARTMENT_IDS,
  FindPlanMeasuresByDepartmentIdsRequestInput,
  FindPlanMeasuresByDepartmentIdsResponse,
} from '~/graphhql/queries/findPlanMeasuresByDepartmentIds'
import { FIND_PRICE_UNIT, FindPriceUnit } from '~/graphhql/queries/findPriceUnit'

const PAGE_ID = 'approveAnnualPlan'
const labelConfig = displaySetting[PAGE_ID].labelConfig

export type ConfirmedPlanIndexes = {
  key: string
  type: 'thisYearExpectation' | 'nextYearTarget' | 'yearOnYear'
  tableType?: 'higherOrganizationTotal' | 'lowerOrganizationTotal' | 'diff'
  name: string
  sales: number // 売上
  deemedSales: number // みなし売上
  cost: number // '売上原価'
  sellingExpense: number // '販売費'
  sellingExpenseOfOwnDepartment: number // '販売費（自部門コスト）'
  generalAdministrativeExpense: number // '一般管理費'
  operatingIncome: number // '営業利益'
  operatingIncomeRatio: number // '営業利益率'
}

export type PlanIndexes = {
  key: string
  type: 'thisYearExpectation' | 'nextYearTarget' | 'yearOnYear'
  tableType?: 'higherOrganizationTotal' | 'lowerOrganizationTotal' | 'diff'
  name: string
  sales: number // 売上
  deemedSales: number // みなし売上
  cost: number // '売上原価'
  sellingExpense: number // '販売費'
  sellingExpenseOfOwnDepartment: number // '販売費（自部門コスト）'
  generalAdministrativeExpense: number // '一般管理費'
  operatingIncome: number // '営業利益'
  operatingIncomeRatio: number // '営業利益率'
}

export type PlanRow = {
  key: string
  name: string
  thisYearExpectation?: ConfirmedPlanIndexes
  nextYearTarget?: ConfirmedPlanIndexes
  yearOnYear?: ConfirmedPlanIndexes
}

export type PlanRowDataKey = keyof Omit<PlanRow, 'key' | 'name'>

export type PlanColumn = {
  parentKey: PlanRow['key']
  parentName: PlanRow['name']
} & PlanIndexes

type ExtendedPlan = { index: number; registered: boolean } & Plan

const defaultPlan: PlanRow = {
  key: 'default',
  name: '',
  thisYearExpectation: {
    key: 'thisYearExpectation',
    type: 'thisYearExpectation',
    name: labelConfig.thisYearExpectation,
    sales: 0,
    deemedSales: 0,
    cost: 0,
    sellingExpense: 0,
    sellingExpenseOfOwnDepartment: 0,
    generalAdministrativeExpense: 0,
    operatingIncome: 0,
    operatingIncomeRatio: 0,
  },
  nextYearTarget: {
    key: 'nextYearTarget',
    type: 'nextYearTarget',
    name: labelConfig.nextYearTarget,
    sales: 0,
    deemedSales: 0,
    cost: 0,
    sellingExpense: 0,
    sellingExpenseOfOwnDepartment: 0,
    generalAdministrativeExpense: 0,
    operatingIncome: 0,
    operatingIncomeRatio: 0,
  },
  yearOnYear: {
    key: 'yearOnYear',
    type: 'yearOnYear',
    name: labelConfig.yearOnYear,
    sales: 0,
    deemedSales: 0,
    cost: 0,
    sellingExpense: 0,
    sellingExpenseOfOwnDepartment: 0,
    generalAdministrativeExpense: 0,
    operatingIncome: 0,
    operatingIncomeRatio: 0,
  },
}

const defaultDiffPlan: PlanRow = {
  key: 'default_diff_plan',
  name: '',
  nextYearTarget: {
    key: 'nextYearTarget',
    type: 'nextYearTarget',
    tableType: 'diff',
    name: labelConfig.nextYearTarget,
    sales: 0,
    deemedSales: 0,
    cost: 0,
    sellingExpense: 0,
    sellingExpenseOfOwnDepartment: 0,
    generalAdministrativeExpense: 0,
    operatingIncome: 0,
    operatingIncomeRatio: 0,
  },
}

const priceUnitAsYen: PriceUnit = {
  digitLength: 1,
  isDefault: false,
  name: 'yen',
  type: 'yen',
}

const priceUnitAsManYen: PriceUnit = {
  digitLength: 4,
  isDefault: true,
  name: 'manYen',
  type: 'manYen',
}

const Plans: FC = () => {
  const { currentUserDepartmentId, profile } = useAuth()
  const [youCanAccessThisPage, setYouCanAccessThisPage] = useState<boolean | undefined>(undefined)
  const [youCanEditThisPage, setYouCanEditThisPage] = useState<boolean | undefined>(undefined)
  const [isAnnualPlanApproved, setIsAnnualPlanApproved] = useState<boolean>(false)

  useEffect(() => {
    if (profile && currentUserDepartmentId) {
      const accessable = youCanDoIt(profile, currentUserDepartmentId, 'planApprovalViewMode')
      setYouCanAccessThisPage(accessable)

      const editable = youCanDoIt(profile, currentUserDepartmentId, 'planApprovalEditMode')
      setYouCanEditThisPage(editable)
    }
  }, [profile, currentUserDepartmentId])

  const { data: { findAllBusinessYears } = {} } = useQuery<FindAllBusinessYearsResponse>(
    FIND_ALL_BUSINESS_YEARS,
    { fetchPolicy: 'no-cache' }
  )

  const { data: { findAllDepartments } = {} } = useQuery<FindAllDepartmentsResponse>(
    FIND_ALL_DEPARTMENTS,
    { fetchPolicy: 'no-cache' }
  )

  // 権限
  const accessControls = useMemo<AccessControl[] | undefined>(() => {
    if (profile) {
      const positionalAccessControl = profile?.userDepartments?.find(
        (value) => value.id == profile.currentUserDepartmentId
      )?.position.accessControl
      const personalAccessControl = profile?.userDepartments?.find(
        (value) => value.id == profile.currentUserDepartmentId
      )?.accessControl
      if (positionalAccessControl) {
        if (personalAccessControl) {
          return positionalAccessControl.concat(personalAccessControl)
        } else {
          return positionalAccessControl
        }
      } else {
        return personalAccessControl
      }
    }
  }, [profile])

  // 対象年度
  const nextBusinessYear = useMemo<BusinessYear | undefined>(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return findAllBusinessYears?.find((value) => {
      const startDate = new Date(value.startYear, value.startMonth - 1, value.startDate)
      const endDate = new Date(value.endYear, value.endMonth - 1, value.endDate)
      endDate.setDate(endDate.getDate() + 1)
      return startDate <= date && date < endDate
    })
  }, [findAllBusinessYears])
  const targetYear = useMemo<number>(() => {
    if (nextBusinessYear) {
      return nextBusinessYear.year
    } else {
      const date = new Date()
      return date.getMonth() + 1 < firstMonth ? date.getFullYear() : date.getFullYear() + 1
    }
  }, [nextBusinessYear])

  const thisYear = useMemo<number>(() => targetYear - 1, [targetYear])

  // 対象組織
  const targetOrganizationLevels = useMemo<OrganizationLevel[]>(() => {
    const organizationLevels: OrganizationLevel[] = []
    accessControls?.forEach((accessControl) => {
      const organizationLevel = departmentTypeOrganizationLevelMap.find(
        // P2FW-719
        // (value) => value.departmentType == accessControl.targetDepartmentCategory
        (value) => value.organizationLevel.level == accessControl.targetDepartmentLevel?.order
      )?.organizationLevel
      if (organizationLevel != undefined) {
        if (!organizationLevels.find((value) => value.level == organizationLevel.level)) {
          organizationLevels.push(organizationLevel)
        }
      }
    })
    return organizationLevels.sort((a, b) => a.level - b.level)
  }, [accessControls])
  const [currentTargetOrganizationLevel, setCurrentTargetOrganizationLevel] = useState<
    DepartmentLevel['order']
  >()
  useEffect(() => {
    if (targetOrganizationLevels.length > 0) {
      setCurrentTargetOrganizationLevel(
        targetOrganizationLevels
          .map((value) => value.level)
          .reduce((previousValue, currentValue) =>
            previousValue < currentValue ? previousValue : currentValue
          )
      )
    } else {
      setCurrentTargetOrganizationLevel(undefined)
    }
  }, [targetOrganizationLevels])

  // 上位設定目標
  const [higherOrganizationTargetPlan, setHigherOrganizationTargetPlan] = useState<
    PlanRow | undefined
  >(undefined)

  // 合計
  const [totalPlan, setTotalPlan] = useState<PlanRow>(defaultPlan)

  // 上位設定目標と合計の差
  const [diffPlan, setDiffPlan] = useState<PlanRow>(defaultDiffPlan)

  // 下位組織の事業計画一覧
  const [lowerOrganizationPlans, setLowerOrganizationPlans] = useState<
    Array<PlanRow & { id?: number }>
  >([])

  // 自組織の配下で、対象組織として選択した階層の一階層下の組織
  const lowerOrganizations = useMemo<Department[] | undefined>(() => {
    if (profile && findAllDepartments) {
      const currentDepartment = findAllDepartments.find(
        (value) => value.id == profile.currentDepartmentId
      )
      if (
        currentDepartment &&
        currentDepartment.departmentLevel?.order != undefined &&
        currentTargetOrganizationLevel != undefined
      ) {
        const departments = findAllDepartments
          .filter(
            (value) =>
              value.departmentLevel?.order ==
              currentTargetOrganizationLevel + 1 + (currentTargetOrganizationLevel == 1 ? 1 : 0)
          )
          .filter((value) => !value.isCommon)
        if (currentTargetOrganizationLevel == 1) {
          if (departments.length > 0) {
            return departments
          }
        } else if (currentTargetOrganizationLevel < currentDepartment.departmentLevel?.order) {
          let department: Department | undefined = currentDepartment
          while (
            department &&
            department.departmentLevel?.order != undefined &&
            department.departmentLevel?.order > 1
          ) {
            if (departments.find((value) => value.id == department?.id)) {
              return [department]
            }
            department = findAllDepartments.find((value) => value.id == department?.parent?.id)
          }
        } else {
          const lowerDepartments: Department[] = []
          departments.forEach((value) => {
            let department: Department | undefined = value
            while (
              department &&
              department.departmentLevel?.order != undefined &&
              department.departmentLevel?.order >= 1
            ) {
              if (department.id == currentDepartment.id) {
                lowerDepartments.push(value)
                break
              }
              department = findAllDepartments.find((value) => value.id == department?.parent?.id)
            }
          })
          if (lowerDepartments.length > 0) {
            return lowerDepartments
          }
        }
      }
    }
  }, [profile, findAllDepartments, currentTargetOrganizationLevel])

  const [planMeasures, setPlanMeasures] = useState<Array<PlanMeasure>>([])

  const departmentIds = useMemo(
    () => [
      ...(lowerOrganizations?.map((org) => org.id) ?? []),
      ...(
        findAllDepartments?.filter(
          (department) =>
            lowerOrganizations
              ?.map((org) => org.id)
              .some((orgId) => orgId === department?.parent?.id) ?? false
        ) ?? []
      ).map((org) => org.id),
    ],
    [findAllDepartments, lowerOrganizations]
  )

  const [findPlanMeasuresByDepartmentIds] = useLazyQuery<
    FindPlanMeasuresByDepartmentIdsResponse,
    FindPlanMeasuresByDepartmentIdsRequestInput
  >(FIND_PLAN_MEASURES_BY_DEPARTMENT_IDS, {
    fetchPolicy: 'no-cache',
    variables: {
      findPlanMeasuresByDepartmentIdsInput: {
        departmentIds,
        implementationTarget: 'Target',
        startBusinessYear: thisYear,
        endBusinessYear: targetYear,
        startAggregationBusinessYear: thisYear,
        endAggregationBusinessYear: targetYear,
      },
    },
    onCompleted: (data) => {
      setPlanMeasures(data?.findPlanMeasuresByDepartmentIds ?? [])
    },
  })

  useEffect(() => {
    if (lowerOrganizations && departmentIds.length) {
      findPlanMeasuresByDepartmentIds()
    }
  }, [findPlanMeasuresByDepartmentIds, lowerOrganizations, departmentIds])

  // 次年度の下位組織の事業計画を取得
  const [
    nextYearAnnualPlanWithLowerOrganizations,
    setNextYearAnnualPlanWithLowerOrganizations,
  ] = useState<FindAnnualPlanByYearResponse>()

  const [findNextYearAnnualPlanWithLowerOrganizations] = useLazyQuery<FindAnnualPlanByYearResponse>(
    FIND_ANNUAL_PLAN_BY_YEAR,
    {
      fetchPolicy: 'no-cache',
      onCompleted: (data) => {
        if (currentPriceUnit === undefined || defaultPriceUnit === undefined) return
        if (currentPriceUnit.digitLength != defaultPriceUnit.findPriceUnit.digitLength) {
          const diffDigit =
            currentPriceUnit.digitLength - defaultPriceUnit.findPriceUnit.digitLength
          const decimalLen = currentPriceUnit.digitLength + 1
          const dataTemp = _.cloneDeep(data)
          dataTemp.findAnnualPlanByYear?.plans?.map((plan) => {
            plan.targetGeneralAdministrativeExpense = calcByUnitAndFormat(
              plan.targetGeneralAdministrativeExpense,
              diffDigit,
              decimalLen
            )
            plan.targetSales = calcByUnitAndFormat(plan.targetSales, diffDigit, decimalLen)
            plan.targetSalesCost = calcByUnitAndFormat(plan.targetSalesCost, diffDigit, decimalLen)
            plan.targetSellingExpense = calcByUnitAndFormat(
              plan.targetSellingExpense,
              diffDigit,
              decimalLen
            )
            plan.targetSellingExpenseOfOwnDepartment = calcByUnitAndFormat(
              plan.targetSellingExpenseOfOwnDepartment,
              diffDigit,
              decimalLen
            )
          })
          setNextYearAnnualPlanWithLowerOrganizations({ ...dataTemp })
        } else {
          setNextYearAnnualPlanWithLowerOrganizations(data)
        }
      },
    }
  )

  useEffect(() => {
    if (currentTargetOrganizationLevel) {
      findNextYearAnnualPlanWithLowerOrganizations({
        variables: {
          findAnnualPlanByYearInput: {
            year: targetYear,
            organizationLevel:
              currentTargetOrganizationLevel + 1 + (currentTargetOrganizationLevel == 1 ? 1 : 0),
          },
        },
      })
    }
  }, [targetYear, currentTargetOrganizationLevel, findNextYearAnnualPlanWithLowerOrganizations])

  // 次年度の下位組織の事業計画
  const nextYearLowerOrganizationPlans = useMemo<ExtendedPlan[] | undefined>(() => {
    if (lowerOrganizations) {
      const obj: ExtendedPlan[] = []
      lowerOrganizations.forEach((value, index) =>
        obj.push({
          index: index,
          registered: false,
          id: 0,
          department: { ...value },
          status: 'inProgress',
          targetSales: 0,
          deemedSales: 0,
          targetSalesYearOnYear: 0,
          targetSalesCost: 0,
          targetSalesCostYearOnYear: 0,
          targetSellingExpenseOfOwnDepartment: 0,
          targetSellingExpense: 0,
          targetSellingExpenseYearOnYear: 0,
          targetGeneralAdministrativeExpense: 0,
          targetGeneralAdministrativeExpenseYearOnYear: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
      obj.sort((a, b) =>
        a.department && b.department
          ? a.department?.code > b.department?.code
            ? 1
            : a.department?.code < b.department?.code
            ? -1
            : 0
          : 0
      )
      obj.forEach((value) => {
        const plan = nextYearAnnualPlanWithLowerOrganizations?.findAnnualPlanByYear?.plans?.find(
          (plan) => plan.department?.id == value.department?.id
        )
        if (plan) {
          value.id = plan.id
          value.registered = true
          value.status = plan.status
          value.targetSales = plan.targetSales
          value.targetSalesYearOnYear = plan.targetSalesYearOnYear
          value.targetSalesCost = plan.targetSalesCost
          value.targetSalesCostYearOnYear = plan.targetSalesCostYearOnYear
          value.targetSellingExpenseOfOwnDepartment = plan.targetSellingExpenseOfOwnDepartment
          value.targetSellingExpense = plan.targetSellingExpense
          value.targetSellingExpenseYearOnYear = plan.targetSellingExpenseYearOnYear
          value.targetGeneralAdministrativeExpense = plan.targetGeneralAdministrativeExpense
          value.targetGeneralAdministrativeExpenseYearOnYear =
            plan.targetGeneralAdministrativeExpenseYearOnYear
        }
      })
      return obj
    }
    return undefined
  }, [lowerOrganizations, nextYearAnnualPlanWithLowerOrganizations])

  // 今年度の下位組織の事業計画を取得
  const [
    thisYearAnnualPlanWithLowerOrganizations,
    setThisYearAnnualPlanWithLowerOrganizations,
  ] = useState<FindAnnualPlanByYearResponse>()
  const [findThisYearAnnualPlanWithLowerOrganizations] = useLazyQuery<FindAnnualPlanByYearResponse>(
    FIND_ANNUAL_PLAN_BY_YEAR,
    {
      fetchPolicy: 'no-cache',
      onCompleted: (data) => {
        if (currentPriceUnit === undefined || defaultPriceUnit?.findPriceUnit === undefined) return
        if (currentPriceUnit.digitLength != defaultPriceUnit.findPriceUnit.digitLength) {
          const diffDigit =
            currentPriceUnit.digitLength - defaultPriceUnit.findPriceUnit.digitLength
          const decimalLen = currentPriceUnit.digitLength + 1
          const dataTemp = _.cloneDeep(data)
          dataTemp.findAnnualPlanByYear?.plans?.map((plan) => {
            plan.targetGeneralAdministrativeExpense = calcByUnitAndFormat(
              plan.targetGeneralAdministrativeExpense,
              diffDigit,
              decimalLen
            )
            plan.targetSales = calcByUnitAndFormat(plan.targetSales, diffDigit, decimalLen)
            plan.targetSalesCost = calcByUnitAndFormat(plan.targetSalesCost, diffDigit, decimalLen)
            plan.targetSellingExpense = calcByUnitAndFormat(
              plan.targetSellingExpense,
              diffDigit,
              decimalLen
            )
            plan.targetSellingExpenseOfOwnDepartment = calcByUnitAndFormat(
              plan.targetSellingExpenseOfOwnDepartment,
              diffDigit,
              decimalLen
            )
          })
          setThisYearAnnualPlanWithLowerOrganizations({ ...dataTemp })
        } else {
          setThisYearAnnualPlanWithLowerOrganizations(data)
        }
      },
    }
  )
  useEffect(() => {
    if (currentTargetOrganizationLevel) {
      findThisYearAnnualPlanWithLowerOrganizations({
        variables: {
          findAnnualPlanByYearInput: {
            year: targetYear - 1,
            organizationLevel:
              currentTargetOrganizationLevel + 1 + (currentTargetOrganizationLevel == 1 ? 1 : 0),
          },
        },
      })
    }
  }, [targetYear, currentTargetOrganizationLevel, findThisYearAnnualPlanWithLowerOrganizations])

  // 今年度の下位組織の事業計画
  const thisYearLowerOrganizationPlans = useMemo<ExtendedPlan[] | undefined>(() => {
    if (lowerOrganizations) {
      const obj: ExtendedPlan[] = []
      lowerOrganizations.forEach((value, index) =>
        obj.push({
          index: index,
          registered: false,
          id: 0,
          department: { ...value },
          status: 'inProgress',
          targetSales: 0,
          deemedSales: 0,
          targetSalesYearOnYear: 0,
          targetSalesCost: 0,
          targetSalesCostYearOnYear: 0,
          targetSellingExpenseOfOwnDepartment: 0,
          targetSellingExpense: 0,
          targetSellingExpenseYearOnYear: 0,
          targetGeneralAdministrativeExpense: 0,
          targetGeneralAdministrativeExpenseYearOnYear: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
      obj.sort((a, b) =>
        a.department && b.department
          ? a.department?.code > b.department?.code
            ? 1
            : a.department?.code < b.department?.code
            ? -1
            : 0
          : 0
      )
      obj.forEach((value) => {
        const plan = thisYearAnnualPlanWithLowerOrganizations?.findAnnualPlanByYear?.plans?.find(
          (plan) => plan.department?.id == value.department?.id
        )
        if (plan) {
          value.id = plan.id
          value.registered = true
          value.status = plan.status
          value.targetSales = plan.targetSales
          value.targetSalesYearOnYear = plan.targetSalesYearOnYear
          value.targetSalesCost = plan.targetSalesCost
          value.targetSalesCostYearOnYear = plan.targetSalesCostYearOnYear
          value.targetSellingExpenseOfOwnDepartment = plan.targetSellingExpenseOfOwnDepartment
          value.targetSellingExpense = plan.targetSellingExpense
          value.targetSellingExpenseYearOnYear = plan.targetSellingExpenseYearOnYear
          value.targetGeneralAdministrativeExpense = plan.targetGeneralAdministrativeExpense
          value.targetGeneralAdministrativeExpenseYearOnYear =
            plan.targetGeneralAdministrativeExpenseYearOnYear
        }
      })
      return obj
    }
    return undefined
  }, [lowerOrganizations, thisYearAnnualPlanWithLowerOrganizations])

  // 自組織の配下で、対象組織として選択した階層の組織
  const targetOrganizations = useMemo<Department[] | undefined>(() => {
    if (findAllDepartments) {
      const currentDepartment = findAllDepartments.find(
        (value) => value.id == profile?.currentDepartmentId
      )
      if (
        currentDepartment &&
        currentDepartment.departmentLevel?.order != undefined &&
        currentTargetOrganizationLevel != undefined
      ) {
        const departments = findAllDepartments
          .filter((value) => value.departmentLevel?.order == currentTargetOrganizationLevel)
          .filter((value) => !value.isCommon)
        if (
          currentTargetOrganizationLevel <= currentDepartment.departmentLevel?.order &&
          currentTargetOrganizationLevel > 1
        ) {
          let department: Department | undefined = currentDepartment
          while (
            department &&
            department.departmentLevel?.order != undefined &&
            department.departmentLevel?.order >= 1
          ) {
            if (departments.find((value) => value.id == department?.id)) {
              return [department]
            }
            department = findAllDepartments.find((value) => value.id == department?.parent?.id)
          }
        } else {
          if (departments.length > 0) {
            return departments
          }
        }
      }
    }
  }, [profile, findAllDepartments, currentTargetOrganizationLevel])

  // 次年度の対象組織の事業計画(=上位設定目標)を取得
  const [
    nextYearAnnualPlanWithHigherOrganizations,
    setNextYearAnnualPlanWithHigherOrganizations,
  ] = useState<FindAnnualPlanByYearResponse>()
  const [
    findNextYearAnnualPlanWithHigherOrganizations,
  ] = useLazyQuery<FindAnnualPlanByYearResponse>(FIND_ANNUAL_PLAN_BY_YEAR, {
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      if (currentPriceUnit === undefined || defaultPriceUnit?.findPriceUnit === undefined) return
      if (currentPriceUnit.digitLength != defaultPriceUnit.findPriceUnit.digitLength) {
        const diffDigit = currentPriceUnit.digitLength - defaultPriceUnit.findPriceUnit.digitLength
        const decimalLen = currentPriceUnit.digitLength + 1
        const dataTemp = _.cloneDeep(data)
        dataTemp.findAnnualPlanByYear?.plans?.map((plan) => {
          plan.targetGeneralAdministrativeExpense = calcByUnitAndFormat(
            plan.targetGeneralAdministrativeExpense,
            diffDigit,
            decimalLen
          )
          plan.targetSales = calcByUnitAndFormat(plan.targetSales, diffDigit, decimalLen)
          plan.targetSalesCost = calcByUnitAndFormat(plan.targetSalesCost, diffDigit, decimalLen)
          plan.targetSellingExpense = calcByUnitAndFormat(
            plan.targetSellingExpense,
            diffDigit,
            decimalLen
          )
          plan.targetSellingExpenseOfOwnDepartment = calcByUnitAndFormat(
            plan.targetSellingExpenseOfOwnDepartment,
            diffDigit,
            decimalLen
          )
        })
        setNextYearAnnualPlanWithHigherOrganizations({ ...dataTemp })
      } else {
        setNextYearAnnualPlanWithHigherOrganizations(data)
      }
    },
  })
  useEffect(() => {
    if (currentTargetOrganizationLevel) {
      findNextYearAnnualPlanWithHigherOrganizations({
        variables: {
          findAnnualPlanByYearInput: {
            year: targetYear,
            organizationLevel: currentTargetOrganizationLevel,
          },
        },
      })
    }
  }, [targetYear, currentTargetOrganizationLevel, findNextYearAnnualPlanWithHigherOrganizations])

  // 次年度の対象組織の事業計画(=上位設定目標)
  const nextYearHigherOrganizationPlans = useMemo<ExtendedPlan[] | undefined>(() => {
    if (targetOrganizations) {
      const obj: ExtendedPlan[] = []
      targetOrganizations.forEach((value, index) =>
        obj.push({
          index: index,
          registered: false,
          id: 0,
          department: { ...value },
          status: 'inProgress',
          targetSales: 0,
          deemedSales: 0,
          targetSalesYearOnYear: 0,
          targetSalesCost: 0,
          targetSalesCostYearOnYear: 0,
          targetSellingExpenseOfOwnDepartment: 0,
          targetSellingExpense: 0,
          targetSellingExpenseYearOnYear: 0,
          targetGeneralAdministrativeExpense: 0,
          targetGeneralAdministrativeExpenseYearOnYear: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
      obj.sort((a, b) =>
        a.department && b.department
          ? a.department?.code > b.department?.code
            ? 1
            : a.department?.code < b.department?.code
            ? -1
            : 0
          : 0
      )
      obj.forEach((value) => {
        const plan = nextYearAnnualPlanWithHigherOrganizations?.findAnnualPlanByYear?.plans?.find(
          (plan) => plan.department?.id == value.department?.id
        )
        if (plan) {
          value.id = plan.id
          value.registered = true
          value.status = plan.status
          value.targetSales = plan.targetSales
          value.deemedSales = plan.deemedSales
          value.targetSalesYearOnYear = plan.targetSalesYearOnYear
          value.targetSalesCost = plan.targetSalesCost
          value.targetSalesCostYearOnYear = plan.targetSalesCostYearOnYear
          value.targetSellingExpenseOfOwnDepartment = plan.targetSellingExpenseOfOwnDepartment
          value.targetSellingExpense = plan.targetSellingExpense
          value.targetSellingExpenseYearOnYear = plan.targetSellingExpenseYearOnYear
          value.targetGeneralAdministrativeExpense = plan.targetGeneralAdministrativeExpense
          value.targetGeneralAdministrativeExpenseYearOnYear =
            plan.targetGeneralAdministrativeExpenseYearOnYear
        }
      })
      return obj
    }
    return undefined
  }, [targetOrganizations, nextYearAnnualPlanWithHigherOrganizations])

  // 今年度の対象組織の事業計画(=上位設定目標)を取得
  const [
    thisYearAnnualPlanWithHigherOrganization,
    setThisYearAnnualPlanWithHigherOrganization,
  ] = useState<FindAnnualPlanByYearResponse>()
  const [
    findThisYearAnnualPlanWithHigherOrganizations,
  ] = useLazyQuery<FindAnnualPlanByYearResponse>(FIND_ANNUAL_PLAN_BY_YEAR, {
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      if (currentPriceUnit.digitLength != priceUnitAsYen.digitLength) {
        const diffDigit = priceUnitAsYen.digitLength - currentPriceUnit.digitLength
        const decimalLen = currentPriceUnit.digitLength + 1
        const dataTemp = _.cloneDeep(data)
        dataTemp.findAnnualPlanByYear?.plans?.map((plan) => {
          plan.targetGeneralAdministrativeExpense = calcByUnitAndFormat(
            plan.targetGeneralAdministrativeExpense,
            diffDigit,
            decimalLen
          )
          plan.targetSales = calcByUnitAndFormat(plan.targetSales, diffDigit, decimalLen)
          plan.deemedSales = calcByUnitAndFormat(plan.deemedSales, diffDigit, decimalLen)
          plan.targetSalesCost = calcByUnitAndFormat(plan.targetSalesCost, diffDigit, decimalLen)
          plan.targetSellingExpense = calcByUnitAndFormat(
            plan.targetSellingExpense,
            diffDigit,
            decimalLen
          )
          plan.targetSellingExpenseOfOwnDepartment = calcByUnitAndFormat(
            plan.targetSellingExpenseOfOwnDepartment,
            diffDigit,
            decimalLen
          )
        })
        setThisYearAnnualPlanWithHigherOrganization({ ...dataTemp })
      } else {
        setThisYearAnnualPlanWithHigherOrganization(data)
      }
    },
  })
  useEffect(() => {
    if (currentTargetOrganizationLevel) {
      findThisYearAnnualPlanWithHigherOrganizations({
        variables: {
          findAnnualPlanByYearInput: {
            year: targetYear - 1,
            organizationLevel: currentTargetOrganizationLevel,
          },
        },
      })
    }
  }, [targetYear, currentTargetOrganizationLevel, findThisYearAnnualPlanWithHigherOrganizations])

  // 今年度の対象組織の事業計画(=上位設定目標)
  const thisYearHigherOrganizationPlans = useMemo<ExtendedPlan[] | undefined>(() => {
    if (targetOrganizations) {
      const obj: ExtendedPlan[] = []
      targetOrganizations.forEach((value, index) =>
        obj.push({
          index: index,
          registered: false,
          id: 0,
          department: { ...value },
          status: 'inProgress',
          targetSales: 0,
          deemedSales: 0,
          targetSalesYearOnYear: 0,
          targetSalesCost: 0,
          targetSalesCostYearOnYear: 0,
          targetSellingExpenseOfOwnDepartment: 0,
          targetSellingExpense: 0,
          targetSellingExpenseYearOnYear: 0,
          targetGeneralAdministrativeExpense: 0,
          targetGeneralAdministrativeExpenseYearOnYear: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
      obj.sort((a, b) =>
        a.department && b.department
          ? a.department?.code > b.department?.code
            ? 1
            : a.department?.code < b.department?.code
            ? -1
            : 0
          : 0
      )
      obj.forEach((value) => {
        const plan = thisYearAnnualPlanWithHigherOrganization?.findAnnualPlanByYear?.plans?.find(
          (plan) => plan.department?.id == value.department?.id
        )
        if (plan) {
          value.id = plan.id
          value.registered = true
          value.status = plan.status
          value.targetSales = plan.targetSales
          value.deemedSales = plan.deemedSales
          value.targetSalesYearOnYear = plan.targetSalesYearOnYear
          value.targetSalesCost = plan.targetSalesCost
          value.targetSalesCostYearOnYear = plan.targetSalesCostYearOnYear
          value.targetSellingExpenseOfOwnDepartment = plan.targetSellingExpenseOfOwnDepartment
          value.targetSellingExpense = plan.targetSellingExpense
          value.targetSellingExpenseYearOnYear = plan.targetSellingExpenseYearOnYear
          value.targetGeneralAdministrativeExpense = plan.targetGeneralAdministrativeExpense
          value.targetGeneralAdministrativeExpenseYearOnYear =
            plan.targetGeneralAdministrativeExpenseYearOnYear
        }
      })
      return obj
    }
    return undefined
  }, [targetOrganizations, thisYearAnnualPlanWithHigherOrganization])

  const [currentPriceUnit, setCurrentPriceUnit] = useState<PriceUnit>(priceUnitAsManYen)
  const { data: defaultPriceUnit } = useQuery<FindPriceUnit>(FIND_PRICE_UNIT)
  useEffect(() => {
    if (defaultPriceUnit) {
      setCurrentPriceUnit(
        priceUnits.filter(
          (priceUnit) => priceUnit.digitLength === defaultPriceUnit.findPriceUnit?.digitLength
        )[0]
      )
    }
  }, [defaultPriceUnit])

  useEffect(() => {
    if (nextYearAnnualPlanWithHigherOrganizations === undefined) return
    const isApproved =
      nextYearAnnualPlanWithHigherOrganizations?.findAnnualPlanByYear?.status === 'approved'
    setIsAnnualPlanApproved(isApproved)
  }, [nextYearAnnualPlanWithHigherOrganizations])

  const convertValue = useCallback((value: number) => {
    if (currentPriceUnit === undefined) return
    const decimalLen = currentPriceUnit.digitLength + 1
    value = toFixed(value, decimalLen)
    const valueSpl = value.toString().split('.')
    let totalPriceByYearFormat = ''
    if (valueSpl.length > 1) {
      const suffix = valueSpl.slice(1, valueSpl.length).join('')
      totalPriceByYearFormat = `${`${valueSpl[0]}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${suffix}`
    } else {
      totalPriceByYearFormat = `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    return totalPriceByYearFormat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPriceUnitChange: PriceUnitProps['onChange'] = (_priceUnit, nextPriceUnit) => {
    if (_priceUnit.digitLength != nextPriceUnit.digitLength) {
      const diffDigit = _priceUnit.digitLength - nextPriceUnit.digitLength
      const decimalLen = nextPriceUnit.digitLength + 1
      const lowerOrganizationPlansTemp = [..._.cloneDeep(lowerOrganizationPlans)]
      lowerOrganizationPlansTemp.map((lOP) => {
        if (lOP.nextYearTarget) {
          lOP.nextYearTarget.cost = calcByUnitAndFormat(
            lOP.nextYearTarget.cost,
            diffDigit,
            decimalLen
          )
          lOP.nextYearTarget.generalAdministrativeExpense = calcByUnitAndFormat(
            lOP.nextYearTarget.generalAdministrativeExpense,
            diffDigit,
            decimalLen
          )
          lOP.nextYearTarget.sales = calcByUnitAndFormat(
            lOP.nextYearTarget.sales,
            diffDigit,
            decimalLen
          )
          lOP.nextYearTarget.deemedSales = calcByUnitAndFormat(
            lOP.nextYearTarget.deemedSales,
            diffDigit,
            decimalLen
          )
          lOP.nextYearTarget.operatingIncome = calcByUnitAndFormat(
            lOP.nextYearTarget.operatingIncome,
            diffDigit,
            decimalLen
          )
          lOP.nextYearTarget.sellingExpense = calcByUnitAndFormat(
            lOP.nextYearTarget.sellingExpense,
            diffDigit,
            decimalLen
          )
        }
        if (lOP.thisYearExpectation) {
          lOP.thisYearExpectation.generalAdministrativeExpense = calcByUnitAndFormat(
            lOP.thisYearExpectation.generalAdministrativeExpense,
            diffDigit,
            decimalLen
          )
          lOP.thisYearExpectation.cost = calcByUnitAndFormat(
            lOP.thisYearExpectation.cost,
            diffDigit,
            decimalLen
          )
          lOP.thisYearExpectation.sales = calcByUnitAndFormat(
            lOP.thisYearExpectation.sales,
            diffDigit,
            decimalLen
          )
          lOP.thisYearExpectation.deemedSales = calcByUnitAndFormat(
            lOP.thisYearExpectation.deemedSales,
            diffDigit,
            decimalLen
          )
          lOP.thisYearExpectation.operatingIncome = calcByUnitAndFormat(
            lOP.thisYearExpectation.operatingIncome,
            diffDigit,
            decimalLen
          )
          lOP.thisYearExpectation.sellingExpense = calcByUnitAndFormat(
            lOP.thisYearExpectation.sellingExpense,
            diffDigit,
            decimalLen
          )
        }
        //P2FW-774
        // if (lOP.yearOnYear) {
        //   lOP.yearOnYear.generalAdministrativeExpense = calcByUnitAndFormat(
        //     lOP.yearOnYear.generalAdministrativeExpense,
        //     diffDigit,
        //     decimalLen
        //   )
        //   lOP.yearOnYear.cost = calcByUnitAndFormat(lOP.yearOnYear.cost, diffDigit, decimalLen)
        //   lOP.yearOnYear.sales = calcByUnitAndFormat(lOP.yearOnYear.sales, diffDigit, decimalLen)
        //   lOP.yearOnYear.operatingIncome = calcByUnitAndFormat(
        //     lOP.yearOnYear.operatingIncome,
        //     diffDigit,
        //     decimalLen
        //   )
        //   lOP.yearOnYear.sellingExpense = calcByUnitAndFormat(
        //     lOP.yearOnYear.sellingExpense,
        //     diffDigit,
        //     decimalLen
        //   )
        // }
      })
      setLowerOrganizationPlans([...lowerOrganizationPlansTemp])
      if (higherOrganizationTargetPlan) {
        setHigherOrganizationTargetPlan({
          ...higherOrganizationTargetPlan,
          thisYearExpectation: higherOrganizationTargetPlan.thisYearExpectation
            ? {
                ...higherOrganizationTargetPlan.thisYearExpectation,
                sales: calcByUnitAndFormat(
                  higherOrganizationTargetPlan?.thisYearExpectation?.sales ?? 0,
                  diffDigit,
                  decimalLen
                ),
                deemedSales: calcByUnitAndFormat(
                  higherOrganizationTargetPlan?.thisYearExpectation?.deemedSales ?? 0,
                  diffDigit,
                  decimalLen
                ),
                cost: calcByUnitAndFormat(
                  higherOrganizationTargetPlan?.thisYearExpectation?.cost ?? 0,
                  diffDigit,
                  decimalLen
                ),
                sellingExpense: calcByUnitAndFormat(
                  higherOrganizationTargetPlan?.thisYearExpectation?.sellingExpense ?? 0,
                  diffDigit,
                  decimalLen
                ),
                generalAdministrativeExpense: calcByUnitAndFormat(
                  higherOrganizationTargetPlan?.thisYearExpectation?.generalAdministrativeExpense ??
                    0,
                  diffDigit,
                  decimalLen
                ),
                operatingIncome: calcByUnitAndFormat(
                  higherOrganizationTargetPlan?.thisYearExpectation?.operatingIncome ?? 0,
                  diffDigit,
                  decimalLen
                ),
                // P2FW-774
                // operatingIncomeRatio: calcByUnitAndFormat(
                //   higherOrganizationTargetPlan?.thisYearExpectation?.operatingIncomeRatio ?? 0,
                //   diffDigit,
                //   decimalLen
                // ),
              }
            : defaultPlan.thisYearExpectation,
          nextYearTarget: higherOrganizationTargetPlan.nextYearTarget
            ? {
                ...higherOrganizationTargetPlan.nextYearTarget,
                sales: calcByUnitAndFormat(
                  higherOrganizationTargetPlan.nextYearTarget?.sales ?? 0,
                  diffDigit,
                  decimalLen
                ),
                deemedSales: calcByUnitAndFormat(
                  higherOrganizationTargetPlan?.nextYearTarget?.deemedSales ?? 0,
                  diffDigit,
                  decimalLen
                ),
                cost: calcByUnitAndFormat(
                  higherOrganizationTargetPlan.nextYearTarget?.cost ?? 0,
                  diffDigit,
                  decimalLen
                ),
                sellingExpense: calcByUnitAndFormat(
                  higherOrganizationTargetPlan.nextYearTarget?.sellingExpense ?? 0,
                  diffDigit,
                  decimalLen
                ),
                generalAdministrativeExpense: calcByUnitAndFormat(
                  higherOrganizationTargetPlan.nextYearTarget?.generalAdministrativeExpense ?? 0,
                  diffDigit,
                  decimalLen
                ),
                operatingIncome: calcByUnitAndFormat(
                  higherOrganizationTargetPlan.nextYearTarget?.operatingIncome ?? 0,
                  diffDigit,
                  decimalLen
                ),
                // P2FW-774
                // operatingIncomeRatio: calcByUnitAndFormat(
                //   higherOrganizationTargetPlan.nextYearTarget?.operatingIncomeRatio ?? 0,
                //   diffDigit,
                //   decimalLen
                // ),
              }
            : defaultPlan.nextYearTarget,
        })
      }
    }
    setCurrentPriceUnit(nextPriceUnit)
  }

  const [approveAnnualPlan] = useMutation<
    ApproveAnnualPlanResponseTypes,
    ApproveAnnualPlanRequestTypes
  >(APPROVE_ANNUAL_PLAN, {
    onCompleted: async () => {
      message.success(labelConfig.approveAnnualPlanSuccess)
      findNextYearAnnualPlanWithHigherOrganizations({
        variables: {
          findAnnualPlanByYearInput: {
            year: targetYear,
            organizationLevel: currentTargetOrganizationLevel,
          },
        },
      })
      setIsAnnualPlanApproved(true)
    },
    onError: () => {
      message.error(labelConfig.approveAnnualPlanError)
    },
  })

  const [cancelApprovedAnnualPlan] = useMutation<
    CancelApprovedAnnualPlanResponseTypes,
    CancelApprovedAnnualPlanRequestTypes
  >(CANCEL_APPROVED_ANNUAL_PLAN, {
    onCompleted: async () => {
      message.success('承認を取り消しました。')
      setIsAnnualPlanApproved(false)
    },
    onError: () => {
      message.error('承認の取り消しに失敗しました。')
    },
  })

  const planCalculator = useMemo(
    () => ({
      // 各組織の事業計画の計算
      organization: {
        // 今年度見込み
        thisYearExpectation: {
          sum: (
            nextYearPlan: Plan,
            propertyName:
              | keyof Pick<PlanMeasure, 'sales' | 'costs' | 'risks' | 'tasks'>
              | keyof Pick<Plan, 'deemedSales'>,
            accountDisplayTitleType?: AccountDisplayTitleType
          ) => {
            return planMeasures
              .filter((planMeasure) => {
                const childDepartment = findAllDepartments?.find(
                  (department) => department.id === planMeasure.department?.id
                )
                return (
                  (planMeasure?.department?.id === nextYearPlan?.department?.id ||
                    childDepartment?.parent?.id === nextYearPlan?.department?.id) &&
                  planMeasure.businessYear?.year === thisYear
                )
              })
              .reduce((acc, planMeasure) => {
                const properties =
                  // 効果(売上)にみなし売上は含めない
                  propertyName === 'sales'
                    ? planMeasure[propertyName]?.filter(
                        (property) =>
                          property.project !== EffectSaleProjectTypes.deemedSales.propertyName
                      )
                    : // 効果(売上 - みなし売上)
                    propertyName === 'deemedSales'
                    ? planMeasure['sales']?.filter(
                        (property: PlanMeasureSale) =>
                          property.project === EffectSaleProjectTypes.deemedSales.propertyName
                      )
                    : // その他
                      planMeasure[propertyName]

                return (
                  acc +
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  (properties?.reduce(
                    (
                      propertyAcc: number,
                      property:
                        | PlanMeasureSale
                        | PlanMeasureCost
                        | PlanMeasureTask
                        | PlanMeasureRisk
                    ) =>
                      propertyAcc +
                      (property.prices
                        ?.filter((price) => {
                          const isInThisBusinessYear =
                            (price.yearOfOccurrence === thisYear && price.monthOfOccurrence >= 4) ||
                            (price.yearOfOccurrence === thisYear + 1 &&
                              price.monthOfOccurrence <= 3)

                          const isSpecifiedAccountDisplayType = accountDisplayTitleType
                            ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                              // @ts-ignore
                              property.accountTitle?.accountDisplayTitle?.type ===
                              accountDisplayTitleType
                            : true
                          return isInThisBusinessYear && isSpecifiedAccountDisplayType
                        })
                        .reduce((priceAcc, price) => priceAcc + price.cost, 0) ?? 0),
                    0
                  ) ?? 0)
                )
              }, 0)
          },
          sales: (thisYearPlan: Plan) =>
            planCalculator.organization.thisYearExpectation.sum(thisYearPlan, 'sales'),
          deemedSales: (thisYearPlan: Plan) =>
            planCalculator.organization.thisYearExpectation.sum(thisYearPlan, 'deemedSales'),
          cost: (nextYearPlan: Plan) => {
            return (
              planCalculator.organization.thisYearExpectation.sum(nextYearPlan, 'costs', 'cost') +
              planCalculator.organization.thisYearExpectation.sum(nextYearPlan, 'tasks', 'cost')
            )
          },
          sellingExpense: (nextYearPlan: Plan) => {
            return (
              planCalculator.organization.thisYearExpectation.sum(
                nextYearPlan,
                'costs',
                'sellingExpense'
              ) +
              planCalculator.organization.thisYearExpectation.sum(
                nextYearPlan,
                'tasks',
                'sellingExpense'
              )
            )
          },
          sellingExpenseOfOwnDepartment: (nextYearPlan: Plan) => {
            return (
              planCalculator.organization.thisYearExpectation.sum(
                nextYearPlan,
                'costs',
                'sellingExpense'
              ) +
              planCalculator.organization.thisYearExpectation.sum(
                nextYearPlan,
                'tasks',
                'sellingExpense'
              )
            )
          },
          generalAdministrativeExpense: (nextYearPlan: Plan) => {
            return (
              planCalculator.organization.thisYearExpectation.sum(
                nextYearPlan,
                'costs',
                'generalAdministrativeExpense'
              ) +
              planCalculator.organization.thisYearExpectation.sum(
                nextYearPlan,
                'tasks',
                'generalAdministrativeExpense'
              )
            )
          },
          operatingIncome: (nextYearPlan: Plan) => {
            return (
              planCalculator.organization.thisYearExpectation.sales(nextYearPlan) -
              planCalculator.organization.thisYearExpectation.cost(nextYearPlan) -
              planCalculator.organization.thisYearExpectation.sellingExpense(nextYearPlan) -
              planCalculator.organization.thisYearExpectation.generalAdministrativeExpense(
                nextYearPlan
              )
            )
          },
          operatingIncomeRatio: (nextYearPlan: Plan) => {
            const thisYearExpectationSale = planCalculator.organization.thisYearExpectation.sales(
              nextYearPlan
            )
            if (thisYearExpectationSale == 0) return 0
            const ratio =
              (planCalculator.organization.thisYearExpectation.operatingIncome(nextYearPlan) /
                thisYearExpectationSale) *
              100
            return Number.isNaN(ratio) ? 0 : ratio
          },
        },
        // 次年度目標
        nextYearTarget: {
          sum: (
            nextYearPlan: Plan,
            propertyName:
              | keyof Pick<PlanMeasure, 'sales' | 'costs' | 'risks' | 'tasks'>
              | keyof Pick<Plan, 'deemedSales'>,
            accountDisplayTitleType?: AccountDisplayTitleType
          ) => {
            return planMeasures
              .filter((planMeasure) => {
                const childDepartment = findAllDepartments?.find(
                  (department) => department.id === planMeasure.department?.id
                )
                return (
                  (planMeasure?.department?.id === nextYearPlan?.department?.id ||
                    childDepartment?.parent?.id === nextYearPlan?.department?.id) &&
                  planMeasure.businessYear?.year === targetYear
                )
              })
              .reduce((acc, planMeasure) => {
                const properties =
                  // 効果(売上)にみなし売上は含めない
                  propertyName === 'sales'
                    ? planMeasure[propertyName]?.filter(
                        (property) =>
                          property.project !== EffectSaleProjectTypes.deemedSales.propertyName
                      )
                    : // 効果(売上 - みなし売上)
                    propertyName === 'deemedSales'
                    ? planMeasure['sales']?.filter(
                        (property: PlanMeasureSale) =>
                          property.project === EffectSaleProjectTypes.deemedSales.propertyName
                      )
                    : // その他
                      planMeasure[propertyName]

                return (
                  acc +
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  (properties?.reduce(
                    (
                      propertyAcc: number,
                      property:
                        | PlanMeasureSale
                        | PlanMeasureCost
                        | PlanMeasureTask
                        | PlanMeasureRisk
                    ) =>
                      propertyAcc +
                      (property.prices
                        ?.filter((price) => {
                          const isInThisBusinessYear =
                            (price.yearOfOccurrence === targetYear &&
                              price.monthOfOccurrence >= 4) ||
                            (price.yearOfOccurrence === targetYear + 1 &&
                              price.monthOfOccurrence <= 3)

                          const isSpecifiedAccountDisplayType = accountDisplayTitleType
                            ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                              // @ts-ignore
                              property.accountTitle?.accountDisplayTitle?.type ===
                              accountDisplayTitleType
                            : true
                          return isInThisBusinessYear && isSpecifiedAccountDisplayType
                        })
                        .reduce((priceAcc, price) => priceAcc + price.cost, 0) ?? 0),
                    0
                  ) ?? 0)
                )
              }, 0)
          },
          sales: (nextYearPlan: Plan) =>
            planCalculator.organization.nextYearTarget.sum(nextYearPlan, 'sales'),
          deemedSales: (nextYearPlan: Plan) =>
            planCalculator.organization.nextYearTarget.sum(nextYearPlan, 'deemedSales', 'cost'),
          cost: (nextYearPlan: Plan) => {
            return (
              planCalculator.organization.nextYearTarget.sum(nextYearPlan, 'costs', 'cost') +
              planCalculator.organization.nextYearTarget.sum(nextYearPlan, 'tasks', 'cost')
            )
          },
          sellingExpense: (nextYearPlan: Plan) => {
            return (
              planCalculator.organization.nextYearTarget.sum(
                nextYearPlan,
                'costs',
                'sellingExpense'
              ) +
              planCalculator.organization.nextYearTarget.sum(
                nextYearPlan,
                'tasks',
                'sellingExpense'
              )
            )
          },
          sellingExpenseOfOwnDepartment: (nextYearPlan: Plan) => {
            return (
              planCalculator.organization.nextYearTarget.sum(
                nextYearPlan,
                'costs',
                'sellingExpense'
              ) +
              planCalculator.organization.nextYearTarget.sum(
                nextYearPlan,
                'tasks',
                'sellingExpense'
              )
            )
          },
          generalAdministrativeExpense: (nextYearPlan: Plan) => {
            return (
              planCalculator.organization.nextYearTarget.sum(
                nextYearPlan,
                'costs',
                'generalAdministrativeExpense'
              ) +
              planCalculator.organization.nextYearTarget.sum(
                nextYearPlan,
                'tasks',
                'generalAdministrativeExpense'
              )
            )
          },
          operatingIncome: (nextYearPlan: Plan) => {
            return (
              planCalculator.organization.nextYearTarget.sales(nextYearPlan) -
              planCalculator.organization.nextYearTarget.cost(nextYearPlan) -
              planCalculator.organization.nextYearTarget.sellingExpense(nextYearPlan) -
              planCalculator.organization.nextYearTarget.generalAdministrativeExpense(nextYearPlan)
            )
          },
          operatingIncomeRatio: (nextYearPlan: Plan) => {
            const nextYearTargetSale = planCalculator.organization.nextYearTarget.sales(
              nextYearPlan
            )
            if (nextYearTargetSale == 0) return 0
            const ratio =
              (planCalculator.organization.nextYearTarget.operatingIncome(nextYearPlan) /
                nextYearTargetSale) *
              100
            return Number.isNaN(ratio) ? 0 : ratio
          },
        },
        // 年度比
        yearOnYear: {
          sales: (thisYearPlan: Plan, nextYearPlan: Plan) => {
            // P2FW-770
            const targetSalesThisYear = planCalculator.organization.thisYearExpectation.sales(
              thisYearPlan
            )
            const targetSalesNextYear = planCalculator.organization.nextYearTarget.sales(
              nextYearPlan
            )
            if (targetSalesThisYear == 0) return 0
            const ratio = ((targetSalesNextYear - targetSalesThisYear) / targetSalesThisYear) * 100
            return Number.isNaN(ratio) ? 0 : ratio
          },
          deemedSales: (thisYearPlan: Plan, nextYearPlan: Plan) => {
            const targetDeemedSalesThisYear = planCalculator.organization.thisYearExpectation.deemedSales(
              thisYearPlan
            )
            const targetDeemedSalesNextYear = planCalculator.organization.nextYearTarget.deemedSales(
              nextYearPlan
            )
            if (targetDeemedSalesThisYear == 0) return 0
            const ratio =
              ((targetDeemedSalesNextYear - targetDeemedSalesThisYear) /
                targetDeemedSalesThisYear) *
              100
            return Number.isNaN(ratio) ? 0 : ratio
          },
          cost: (thisYearPlan: Plan, nextYearPlan: Plan) => {
            const targetCostThisYear = planCalculator.organization.thisYearExpectation.cost(
              thisYearPlan
            )
            const targetCostNextYear = planCalculator.organization.nextYearTarget.cost(nextYearPlan)
            if (targetCostThisYear == 0) return 0
            const ratio = ((targetCostNextYear - targetCostThisYear) / targetCostThisYear) * 100
            return Number.isNaN(ratio) ? 0 : ratio
          },
          sellingExpenseOfOwnDepartment: (thisYearPlan: Plan, nextYearPlan: Plan) => {
            if (thisYearPlan.targetSellingExpenseOfOwnDepartment == 0) return 0
            const ratio =
              ((nextYearPlan.targetSellingExpenseOfOwnDepartment -
                thisYearPlan.targetSellingExpenseOfOwnDepartment) /
                thisYearPlan.targetSellingExpenseOfOwnDepartment) *
              100
            return Number.isNaN(ratio) ? 0 : ratio
          },
          sellingExpense: (thisYearPlan: Plan, nextYearPlan: Plan) => {
            const thisYearTargetSellingExpense = planCalculator.organization.thisYearExpectation.sellingExpense(
              thisYearPlan
            )
            const nextYearTargetSellingExpense = planCalculator.organization.nextYearTarget.sellingExpense(
              nextYearPlan
            )
            if (thisYearTargetSellingExpense == 0) return 0
            const ratio =
              ((nextYearTargetSellingExpense - thisYearTargetSellingExpense) /
                thisYearTargetSellingExpense) *
              100
            return Number.isNaN(ratio) ? 0 : ratio
          },
          generalAdministrativeExpense: (thisYearPlan: Plan, nextYearPlan: Plan) => {
            const thisYearTargetGenAdminExpense = planCalculator.organization.thisYearExpectation.generalAdministrativeExpense(
              thisYearPlan
            )
            const nextYearTargetGenAdminExpense = planCalculator.organization.nextYearTarget.generalAdministrativeExpense(
              nextYearPlan
            )
            if (thisYearTargetGenAdminExpense == 0) return 0
            const ratio =
              ((nextYearTargetGenAdminExpense - thisYearTargetGenAdminExpense) /
                thisYearTargetGenAdminExpense) *
              100
            return Number.isNaN(ratio) ? 0 : ratio
          },
          operatingIncome: (thisYearPlan: Plan, nextYearPlan: Plan) => {
            const thisYearOperatingIncome = planCalculator.organization.thisYearExpectation.operatingIncome(
              thisYearPlan
            )
            const nextYearOperatingIncome = planCalculator.organization.nextYearTarget.operatingIncome(
              nextYearPlan
            )
            if (thisYearOperatingIncome == 0) return 0
            const ratio =
              ((nextYearOperatingIncome - thisYearOperatingIncome) / thisYearOperatingIncome) * 100
            return Number.isNaN(ratio) ? 0 : ratio
          },
          operatingIncomeRatio: (thisYearPlan: Plan, nextYearPlan: Plan) => {
            const ratio =
              planCalculator.organization.nextYearTarget.operatingIncomeRatio(nextYearPlan) -
              planCalculator.organization.thisYearExpectation.operatingIncomeRatio(thisYearPlan)
            return Number.isNaN(ratio) ? 0 : ratio
          },
        },
      },

      // 組織の合計
      total: {
        common: {
          sales: (plans: Array<PlanRow>, planRowDataKey: PlanRowDataKey) =>
            plans.reduce((acc, plan) => acc + (plan[planRowDataKey]?.sales ?? 0), 0),
          deemedSales: (plans: Array<PlanRow>, planRowDataKey: PlanRowDataKey) =>
            plans.reduce((acc, plan) => acc + (plan[planRowDataKey]?.deemedSales ?? 0), 0),
          cost: (plans: Array<PlanRow>, planRowDataKey: PlanRowDataKey) =>
            plans.reduce((acc, plan) => acc + (plan[planRowDataKey]?.cost ?? 0), 0),
          sellingExpense: (plans: Array<PlanRow>, planRowDataKey: PlanRowDataKey) =>
            plans.reduce((acc, plan) => acc + (plan[planRowDataKey]?.sellingExpense ?? 0), 0),
          sellingExpenseOfOwnDepartment: (plans: Array<PlanRow>, planRowDataKey: PlanRowDataKey) =>
            plans.reduce(
              (acc, plan) => acc + (plan[planRowDataKey]?.sellingExpenseOfOwnDepartment ?? 0),
              0
            ),
          generalAdministrativeExpense: (plans: Array<PlanRow>, planRowDataKey: PlanRowDataKey) =>
            plans.reduce(
              (acc, plan) => acc + (plan[planRowDataKey]?.generalAdministrativeExpense ?? 0),
              0
            ),
          yearOnYear: (
            plans: Array<PlanRow>,
            planKey: keyof Pick<
              PlanIndexes,
              | 'sales'
              | 'deemedSales'
              | 'cost'
              | 'sellingExpense'
              | 'generalAdministrativeExpense'
              | 'sellingExpenseOfOwnDepartment'
            >
          ) => {
            const thisYearPlansTotal = planCalculator.total.common[planKey](
              plans,
              'thisYearExpectation'
            )
            const nextYearPlansTotal = planCalculator.total.common[planKey](plans, 'nextYearTarget')
            if (thisYearPlansTotal == 0) return 0
            const yearOnYear =
              ((nextYearPlansTotal - thisYearPlansTotal) / thisYearPlansTotal) * 100
            return Number.isNaN(yearOnYear) ? 0 : yearOnYear
          },
        },
        // 今年度見込み
        thisYearExpectation: {
          sales: (plans: Array<PlanRow>) =>
            planCalculator.total.common.sales(plans, 'thisYearExpectation'),
          deemedSales: (plans: Array<PlanRow>) =>
            planCalculator.total.common.deemedSales(plans, 'thisYearExpectation'),
          cost: (plans: Array<PlanRow>) =>
            planCalculator.total.common.cost(plans, 'thisYearExpectation'),
          sellingExpense: (plans: Array<PlanRow>) =>
            planCalculator.total.common.sellingExpense(plans, 'thisYearExpectation'),
          sellingExpenseOfOwnDepartment: (plans: Array<PlanRow>) =>
            planCalculator.total.common.sellingExpenseOfOwnDepartment(plans, 'thisYearExpectation'),
          generalAdministrativeExpense: (plans: Array<PlanRow>) =>
            planCalculator.total.common.generalAdministrativeExpense(plans, 'thisYearExpectation'),
          operatingIncome: (plans: Array<PlanRow>) =>
            plans.reduce((acc, plan) => {
              if (!plan.thisYearExpectation) return acc
              const {
                sales,
                cost,
                sellingExpense,
                generalAdministrativeExpense,
              } = plan.thisYearExpectation
              return acc + (sales - cost - sellingExpense - generalAdministrativeExpense)
            }, 0),
          operatingIncomeRatio: (plans: Array<PlanRow>) => {
            const totalCommonSaleThisYearExpectation = planCalculator.total.common.sales(
              plans,
              'thisYearExpectation'
            )
            if (totalCommonSaleThisYearExpectation == 0) return 0
            const ratio =
              (planCalculator.total.thisYearExpectation.operatingIncome(plans) /
                totalCommonSaleThisYearExpectation) *
              100
            return Number.isNaN(ratio) ? 0 : ratio
          },
        },
        // 次年度目標
        nextYearTarget: {
          sales: (plans: Array<PlanRow>) =>
            planCalculator.total.common.sales(plans, 'nextYearTarget'),
          deemedSales: (plans: Array<PlanRow>) =>
            planCalculator.total.common.deemedSales(plans, 'nextYearTarget'),
          cost: (plans: Array<PlanRow>) =>
            planCalculator.total.common.cost(plans, 'nextYearTarget'),
          sellingExpense: (plans: Array<PlanRow>) =>
            planCalculator.total.common.sellingExpense(plans, 'nextYearTarget'),
          sellingExpenseOfOwnDepartment: (plans: Array<PlanRow>) =>
            planCalculator.total.common.sellingExpenseOfOwnDepartment(plans, 'nextYearTarget'),
          generalAdministrativeExpense: (plans: Array<PlanRow>) =>
            planCalculator.total.common.generalAdministrativeExpense(plans, 'nextYearTarget'),
          operatingIncome: (plans: Array<PlanRow>) =>
            plans.reduce((acc, plan) => {
              if (!plan.nextYearTarget) return acc
              const {
                sales,
                cost,
                sellingExpense,
                generalAdministrativeExpense,
              } = plan.nextYearTarget
              return acc + (sales - cost - sellingExpense - generalAdministrativeExpense)
            }, 0),
          operatingIncomeRatio: (plans: Array<PlanRow>) => {
            const totalCommonSaleNextYearTarget = planCalculator.total.common.sales(
              plans,
              'nextYearTarget'
            )
            if (totalCommonSaleNextYearTarget == 0) return 0
            const ratio =
              (planCalculator.total.nextYearTarget.operatingIncome(plans) /
                totalCommonSaleNextYearTarget) *
              100
            return Number.isNaN(ratio) ? 0 : ratio
          },
        },
        // 年度比
        yearOnYear: {
          sales: (plans: Array<PlanRow>) => planCalculator.total.common.yearOnYear(plans, 'sales'),
          deemedSales: (plans: Array<PlanRow>) =>
            planCalculator.total.common.yearOnYear(plans, 'deemedSales'),
          cost: (plans: Array<PlanRow>) => planCalculator.total.common.yearOnYear(plans, 'cost'),
          sellingExpense: (plans: Array<PlanRow>) =>
            planCalculator.total.common.yearOnYear(plans, 'sellingExpense'),
          sellingExpenseOfOwnDepartment: (plans: Array<PlanRow>) =>
            planCalculator.total.common.yearOnYear(plans, 'sellingExpenseOfOwnDepartment'),
          generalAdministrativeExpense: (plans: Array<PlanRow>) =>
            planCalculator.total.common.yearOnYear(plans, 'generalAdministrativeExpense'),
          operatingIncome: (plans: Array<PlanRow>) => {
            const thisYearExpectation = planCalculator.total.thisYearExpectation.operatingIncome(
              plans
            )
            const nextYearExpectation = planCalculator.total.nextYearTarget.operatingIncome(plans)
            if (thisYearExpectation == 0) return 0
            const ratio = ((nextYearExpectation - thisYearExpectation) / thisYearExpectation) * 100
            return Number.isNaN(ratio) ? 0 : ratio
          },
          operatingIncomeRatio: (plans: Array<PlanRow>) => {
            const ratio =
              planCalculator.total.nextYearTarget.operatingIncomeRatio(plans) -
              planCalculator.total.thisYearExpectation.operatingIncomeRatio(plans)

            return Number.isNaN(ratio) ? 0 : ratio
          },
        },
      },
    }),
    [planMeasures, targetYear, thisYear]
  )

  // 上位設定目標
  const calcHigherOrganizationsTargetPlan = useCallback(
    (plans: Array<PlanRow>): PlanRow => ({
      key: 'HOTP',
      name: labelConfig.higherOrganizationTargetPlan,
      thisYearExpectation: {
        key: 'HOTP_TYE',
        type: 'thisYearExpectation',
        name: labelConfig.thisYearExpectation,
        sales: planCalculator.total.thisYearExpectation.sales(plans),
        deemedSales: planCalculator.total.thisYearExpectation.deemedSales(plans),
        cost: planCalculator.total.thisYearExpectation.cost(plans),
        sellingExpense: planCalculator.total.thisYearExpectation.sellingExpense(plans),
        sellingExpenseOfOwnDepartment: planCalculator.total.thisYearExpectation.sellingExpenseOfOwnDepartment(
          plans
        ),
        generalAdministrativeExpense: planCalculator.total.thisYearExpectation.generalAdministrativeExpense(
          plans
        ),
        operatingIncome: planCalculator.total.thisYearExpectation.operatingIncome(plans),
        operatingIncomeRatio: planCalculator.total.thisYearExpectation.operatingIncomeRatio(plans),
      },
      nextYearTarget: {
        key: 'HOTP_NYT',
        type: 'nextYearTarget',
        name: labelConfig.nextYearTarget,
        sales: planCalculator.total.nextYearTarget.sales(plans),
        deemedSales: planCalculator.total.nextYearTarget.deemedSales(plans),
        cost: planCalculator.total.nextYearTarget.cost(plans),
        sellingExpense: planCalculator.total.nextYearTarget.sellingExpense(plans),
        sellingExpenseOfOwnDepartment: planCalculator.total.nextYearTarget.sellingExpenseOfOwnDepartment(
          plans
        ),
        generalAdministrativeExpense: planCalculator.total.nextYearTarget.generalAdministrativeExpense(
          plans
        ),
        operatingIncome: planCalculator.total.nextYearTarget.operatingIncome(plans),
        operatingIncomeRatio: planCalculator.total.nextYearTarget.operatingIncomeRatio(plans),
      },
      yearOnYear: {
        key: 'HOTP_YOY',
        type: 'yearOnYear',
        name: labelConfig.yearOnYear,
        sales: planCalculator.total.yearOnYear.sales(plans),
        deemedSales: planCalculator.total.yearOnYear.deemedSales(plans),
        cost: planCalculator.total.yearOnYear.cost(plans),
        sellingExpense: planCalculator.total.yearOnYear.sellingExpense(plans),
        sellingExpenseOfOwnDepartment: planCalculator.total.yearOnYear.sellingExpenseOfOwnDepartment(
          plans
        ),
        generalAdministrativeExpense: planCalculator.total.yearOnYear.generalAdministrativeExpense(
          plans
        ),
        operatingIncome: planCalculator.total.yearOnYear.operatingIncome(plans),
        operatingIncomeRatio: planCalculator.total.yearOnYear.operatingIncomeRatio(plans),
      },
    }),
    [
      planCalculator.total.nextYearTarget,
      planCalculator.total.thisYearExpectation,
      planCalculator.total.yearOnYear,
    ]
  )

  // 合計
  const calcTotalPlan: PlanRow = useMemo(
    () => ({
      key: 'TP',
      name: labelConfig.totalPlan,
      thisYearExpectation: {
        key: 'TP_TYE',
        type: 'thisYearExpectation',
        name: labelConfig.thisYearExpectation,
        sales: planCalculator.total.thisYearExpectation.sales(lowerOrganizationPlans),
        deemedSales: planCalculator.total.thisYearExpectation.deemedSales(lowerOrganizationPlans),
        cost: planCalculator.total.thisYearExpectation.cost(lowerOrganizationPlans),
        sellingExpense: planCalculator.total.thisYearExpectation.sellingExpense(
          lowerOrganizationPlans
        ),
        sellingExpenseOfOwnDepartment: planCalculator.total.thisYearExpectation.sales(
          lowerOrganizationPlans
        ),
        generalAdministrativeExpense: planCalculator.total.thisYearExpectation.generalAdministrativeExpense(
          lowerOrganizationPlans
        ),
        operatingIncome: planCalculator.total.thisYearExpectation.operatingIncome(
          lowerOrganizationPlans
        ),
        operatingIncomeRatio: planCalculator.total.thisYearExpectation.operatingIncomeRatio(
          lowerOrganizationPlans
        ),
      },
      nextYearTarget: {
        key: 'TP_NYT',
        type: 'nextYearTarget',
        name: labelConfig.nextYearTarget,
        sales: planCalculator.total.nextYearTarget.sales(lowerOrganizationPlans),
        deemedSales: planCalculator.total.nextYearTarget.deemedSales(lowerOrganizationPlans),
        cost: planCalculator.total.nextYearTarget.cost(lowerOrganizationPlans),
        sellingExpense: planCalculator.total.nextYearTarget.sellingExpense(lowerOrganizationPlans),
        sellingExpenseOfOwnDepartment: planCalculator.total.nextYearTarget.sales(
          lowerOrganizationPlans
        ),
        generalAdministrativeExpense: planCalculator.total.nextYearTarget.generalAdministrativeExpense(
          lowerOrganizationPlans
        ),
        operatingIncome: planCalculator.total.nextYearTarget.operatingIncome(
          lowerOrganizationPlans
        ),
        operatingIncomeRatio: planCalculator.total.nextYearTarget.operatingIncomeRatio(
          lowerOrganizationPlans
        ),
      },
      yearOnYear: {
        key: 'TP_YOY',
        type: 'yearOnYear',
        name: labelConfig.yearOnYear,
        sales: planCalculator.total.yearOnYear.sales(lowerOrganizationPlans),
        deemedSales: planCalculator.total.yearOnYear.deemedSales(lowerOrganizationPlans),
        cost: planCalculator.total.yearOnYear.cost(lowerOrganizationPlans),
        sellingExpense: planCalculator.total.yearOnYear.sellingExpense(lowerOrganizationPlans),
        sellingExpenseOfOwnDepartment: planCalculator.total.yearOnYear.sales(
          lowerOrganizationPlans
        ),
        generalAdministrativeExpense: planCalculator.total.yearOnYear.generalAdministrativeExpense(
          lowerOrganizationPlans
        ),
        operatingIncome: planCalculator.total.yearOnYear.operatingIncome(lowerOrganizationPlans),
        operatingIncomeRatio: planCalculator.total.yearOnYear.operatingIncomeRatio(
          lowerOrganizationPlans
        ),
      },
    }),
    [
      lowerOrganizationPlans,
      planCalculator.total.nextYearTarget,
      planCalculator.total.thisYearExpectation,
      planCalculator.total.yearOnYear,
    ]
  )

  // 上位設定目標と合計の差
  const calcDiffPlan: PlanRow = useMemo(
    () => ({
      key: `DP`,
      name: labelConfig.diffPlan,
      nextYearTarget: {
        key: 'DP_NYT',
        type: 'nextYearTarget',
        tableType: 'diff',
        name: labelConfig.nextYearTarget,
        sales:
          (calcTotalPlan.nextYearTarget?.sales ?? 0) -
          (higherOrganizationTargetPlan?.nextYearTarget?.sales ?? 0),
        deemedSales:
          (calcTotalPlan.nextYearTarget?.deemedSales ?? 0) -
          (higherOrganizationTargetPlan?.nextYearTarget?.deemedSales ?? 0),
        cost:
          (calcTotalPlan.nextYearTarget?.cost ?? 0) -
          (higherOrganizationTargetPlan?.nextYearTarget?.cost ?? 0),
        sellingExpense:
          (calcTotalPlan?.nextYearTarget?.sellingExpense ?? 0) -
          (higherOrganizationTargetPlan?.nextYearTarget?.sellingExpense ?? 0),
        sellingExpenseOfOwnDepartment:
          (calcTotalPlan.nextYearTarget?.sellingExpenseOfOwnDepartment ?? 0) -
          (higherOrganizationTargetPlan?.nextYearTarget?.sellingExpenseOfOwnDepartment ?? 0),
        generalAdministrativeExpense:
          (calcTotalPlan?.nextYearTarget?.generalAdministrativeExpense ?? 0) -
          (higherOrganizationTargetPlan?.nextYearTarget?.generalAdministrativeExpense ?? 0),
        operatingIncome:
          (calcTotalPlan?.nextYearTarget?.operatingIncome ?? 0) -
          (higherOrganizationTargetPlan?.nextYearTarget?.operatingIncome ?? 0),
        operatingIncomeRatio:
          (calcTotalPlan?.nextYearTarget?.operatingIncomeRatio ?? 0) -
          (higherOrganizationTargetPlan?.nextYearTarget?.operatingIncomeRatio ?? 0),
      },
    }),
    [calcTotalPlan, higherOrganizationTargetPlan]
  )

  // 組織
  const calcOrganizationPlan = useCallback(
    (thisYearPlan: ExtendedPlan, nextYearPlan: ExtendedPlan): PlanRow => ({
      key: `OP_${thisYearPlan.index}`,
      name: thisYearPlan.department?.name ?? '',
      thisYearExpectation: {
        key: `OP_${thisYearPlan.index}_TYE`,
        type: 'thisYearExpectation',
        name: labelConfig.thisYearExpectation,
        sales: planCalculator.organization.thisYearExpectation.sales(thisYearPlan),
        deemedSales: planCalculator.organization.thisYearExpectation.deemedSales(thisYearPlan),
        cost: planCalculator.organization.thisYearExpectation.cost(thisYearPlan),
        sellingExpense: planCalculator.organization.thisYearExpectation.sellingExpense(
          thisYearPlan
        ),
        sellingExpenseOfOwnDepartment: planCalculator.organization.thisYearExpectation.sellingExpenseOfOwnDepartment(
          thisYearPlan
        ),
        generalAdministrativeExpense: planCalculator.organization.thisYearExpectation.generalAdministrativeExpense(
          thisYearPlan
        ),
        operatingIncome: planCalculator.organization.thisYearExpectation.operatingIncome(
          thisYearPlan
        ),
        operatingIncomeRatio: planCalculator.organization.thisYearExpectation.operatingIncomeRatio(
          thisYearPlan
        ),
      },
      nextYearTarget: {
        key: `OP_${nextYearPlan.index}_NYT`,
        type: 'nextYearTarget',
        name: labelConfig.nextYearTarget,
        sales: planCalculator.organization.nextYearTarget.sales(nextYearPlan),
        deemedSales: planCalculator.organization.nextYearTarget.deemedSales(nextYearPlan),
        cost: planCalculator.organization.nextYearTarget.cost(nextYearPlan),
        sellingExpense: planCalculator.organization.nextYearTarget.sellingExpense(nextYearPlan),
        sellingExpenseOfOwnDepartment: planCalculator.organization.nextYearTarget.sellingExpenseOfOwnDepartment(
          nextYearPlan
        ),
        generalAdministrativeExpense: planCalculator.organization.nextYearTarget.generalAdministrativeExpense(
          nextYearPlan
        ),
        operatingIncome: planCalculator.organization.nextYearTarget.operatingIncome(nextYearPlan),
        operatingIncomeRatio: planCalculator.organization.nextYearTarget.operatingIncomeRatio(
          nextYearPlan
        ),
      },
      yearOnYear: {
        key: `OP_${thisYearPlan.index}_YOY`,
        type: 'yearOnYear',
        name: labelConfig.yearOnYear,
        sales: planCalculator.organization.yearOnYear.sales(thisYearPlan, nextYearPlan),
        deemedSales: planCalculator.organization.yearOnYear.deemedSales(thisYearPlan, nextYearPlan),
        cost: planCalculator.organization.yearOnYear.cost(thisYearPlan, nextYearPlan),
        sellingExpense: planCalculator.organization.yearOnYear.sellingExpense(
          thisYearPlan,
          nextYearPlan
        ),
        sellingExpenseOfOwnDepartment: planCalculator.organization.yearOnYear.sellingExpenseOfOwnDepartment(
          thisYearPlan,
          nextYearPlan
        ),
        generalAdministrativeExpense: planCalculator.organization.yearOnYear.generalAdministrativeExpense(
          thisYearPlan,
          nextYearPlan
        ),
        operatingIncome: planCalculator.organization.yearOnYear.operatingIncome(
          thisYearPlan,
          nextYearPlan
        ),
        operatingIncomeRatio: planCalculator.organization.yearOnYear.operatingIncomeRatio(
          thisYearPlan,
          nextYearPlan
        ),
      },
    }),
    [
      planCalculator.organization.nextYearTarget,
      planCalculator.organization.thisYearExpectation,
      planCalculator.organization.yearOnYear,
    ]
  )

  const planColumnData: Array<PlanColumn> = useMemo(
    () =>
      lowerOrganizationPlans.flatMap((plan, parentIndex) => {
        return [plan.thisYearExpectation, plan.nextYearTarget, plan.yearOnYear]
          .filter((data): data is Exclude<typeof data, undefined> => !!data)
          .map((data, index) => ({
            key: `plan-${parentIndex}-${index}`,
            type: data.type,
            parentKey: plan.key,
            parentName: plan.name,
            name: data.name,
            sales: data.sales,
            deemedSales: data.deemedSales,
            cost: data.cost,
            sellingExpense: data.sellingExpense,
            sellingExpenseOfOwnDepartment: data.sellingExpenseOfOwnDepartment,
            generalAdministrativeExpense: data.generalAdministrativeExpense,
            operatingIncome: data.operatingIncome,
            operatingIncomeRatio: data.operatingIncomeRatio,
          }))
      }),
    [lowerOrganizationPlans]
  )

  const higherOrganizationColumnData: Array<PlanColumn> | null = useMemo(
    () =>
      higherOrganizationTargetPlan
        ? [
            higherOrganizationTargetPlan.thisYearExpectation,
            higherOrganizationTargetPlan.nextYearTarget,
            higherOrganizationTargetPlan.yearOnYear,
          ]
            .filter((data): data is Exclude<typeof data, undefined> => !!data)
            .map((data, index) => ({
              key: `HOTP-${index}`,
              type: data.type,
              parentKey: higherOrganizationTargetPlan.key,
              parentName: higherOrganizationTargetPlan.name,
              name: data.name,
              sales: data.sales,
              deemedSales: data.deemedSales,
              cost: data.cost,
              sellingExpense: data.sellingExpense,
              sellingExpenseOfOwnDepartment: data.sellingExpenseOfOwnDepartment,
              generalAdministrativeExpense: data.generalAdministrativeExpense,
              operatingIncome: data.operatingIncome,
              operatingIncomeRatio: data.operatingIncomeRatio,
            }))
        : null,
    [higherOrganizationTargetPlan]
  )

  const totalPlanColumnData: Array<PlanColumn> = useMemo(
    () =>
      [totalPlan.thisYearExpectation, totalPlan.nextYearTarget, totalPlan.yearOnYear]
        .filter((data): data is Exclude<typeof data, undefined> => !!data)
        .map((data, index) => ({
          key: `TP-${index}`,
          type: data.type,
          parentKey: totalPlan.key,
          parentName: totalPlan.name,
          name: data.name,
          sales: data.sales,
          deemedSales: data.deemedSales,
          cost: data.cost,
          sellingExpense: data.sellingExpense,
          sellingExpenseOfOwnDepartment: data.sellingExpenseOfOwnDepartment,
          generalAdministrativeExpense: data.generalAdministrativeExpense,
          operatingIncome: data.operatingIncome,
          operatingIncomeRatio: data.operatingIncomeRatio,
        })),
    [totalPlan]
  )

  const diffPlanColumnData: Array<PlanColumn> = useMemo(
    () =>
      [diffPlan.thisYearExpectation, diffPlan.nextYearTarget, diffPlan.yearOnYear]
        .filter((data): data is Exclude<typeof data, undefined> => !!data)
        .map((data, index) => ({
          key: `TP-${index}`,
          tableType: data.tableType,
          type: data.type,
          parentKey: diffPlan.key,
          parentName: diffPlan.name,
          name: data.name,
          sales: data.sales,
          deemedSales: data.deemedSales,
          cost: data.cost,
          sellingExpense: data.sellingExpense,
          sellingExpenseOfOwnDepartment: data.sellingExpenseOfOwnDepartment,
          generalAdministrativeExpense: data.generalAdministrativeExpense,
          operatingIncome: data.operatingIncome,
          operatingIncomeRatio: data.operatingIncomeRatio,
        })),
    [diffPlan]
  )

  // 今年度と次年度の下位組織の事業計画を取得後、今年度見込み・次年度目標・年度比を計算
  useEffect(() => {
    if (thisYearLowerOrganizationPlans && nextYearLowerOrganizationPlans) {
      const lowerOrganizationPlansTemp = thisYearLowerOrganizationPlans.map((thisYearPlan) => {
        const nextYearPlan = nextYearLowerOrganizationPlans.filter(
          (plan) => plan.department?.id && plan.department.id === thisYearPlan.department?.id
        )[0]
        return {
          id: nextYearPlan.index,
          ...calcOrganizationPlan(thisYearPlan, nextYearPlan),
        }
      })
      if (currentPriceUnit === undefined || defaultPriceUnit?.findPriceUnit === undefined) return
      if (currentPriceUnit.digitLength != defaultPriceUnit.findPriceUnit.digitLength) {
        const diffDigit = currentPriceUnit.digitLength - defaultPriceUnit.findPriceUnit.digitLength
        const decimalLen = currentPriceUnit.digitLength + 1
        lowerOrganizationPlansTemp.map((lOP) => {
          if (lOP.nextYearTarget) {
            lOP.nextYearTarget.generalAdministrativeExpense = calcByUnitAndFormat(
              lOP.nextYearTarget.generalAdministrativeExpense,
              diffDigit,
              decimalLen
            )
            lOP.nextYearTarget.cost = calcByUnitAndFormat(
              lOP.nextYearTarget.cost,
              diffDigit,
              decimalLen
            )
            lOP.nextYearTarget.sales = calcByUnitAndFormat(
              lOP.nextYearTarget.sales,
              diffDigit,
              decimalLen
            )
          }
          if (lOP.thisYearExpectation) {
            lOP.thisYearExpectation.generalAdministrativeExpense = calcByUnitAndFormat(
              lOP.thisYearExpectation.generalAdministrativeExpense,
              diffDigit,
              decimalLen
            )
            lOP.thisYearExpectation.cost = calcByUnitAndFormat(
              lOP.thisYearExpectation.cost,
              diffDigit,
              decimalLen
            )
            lOP.thisYearExpectation.operatingIncome = calcByUnitAndFormat(
              lOP.thisYearExpectation.operatingIncome,
              diffDigit,
              decimalLen
            )
            lOP.thisYearExpectation.sellingExpense = calcByUnitAndFormat(
              lOP.thisYearExpectation.sellingExpense,
              diffDigit,
              decimalLen
            )
            lOP.thisYearExpectation.sales = calcByUnitAndFormat(
              lOP.thisYearExpectation.sales,
              diffDigit,
              decimalLen
            )
          }
          if (lOP.yearOnYear) {
            lOP.yearOnYear.generalAdministrativeExpense = calcByUnitAndFormat(
              lOP.yearOnYear.generalAdministrativeExpense,
              diffDigit,
              decimalLen
            )
            lOP.yearOnYear.operatingIncome = calcByUnitAndFormat(
              lOP.yearOnYear.operatingIncome,
              diffDigit,
              decimalLen
            )
            lOP.yearOnYear.sellingExpense = calcByUnitAndFormat(
              lOP.yearOnYear.sellingExpense,
              diffDigit,
              decimalLen
            )
            lOP.yearOnYear.cost = calcByUnitAndFormat(lOP.yearOnYear.cost, diffDigit, decimalLen)
            lOP.yearOnYear.sales = calcByUnitAndFormat(lOP.yearOnYear.sales, diffDigit, decimalLen)
          }
        })
      }
      setLowerOrganizationPlans(lowerOrganizationPlansTemp)
    } else {
      setLowerOrganizationPlans([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcOrganizationPlan, nextYearLowerOrganizationPlans, thisYearLowerOrganizationPlans])

  // 今年度と次年度の上位組織の事業計画を取得後、今年度見込み・次年度目標・年度比の合計を計算
  useEffect(() => {
    if (thisYearHigherOrganizationPlans && nextYearHigherOrganizationPlans) {
      setHigherOrganizationTargetPlan(
        calcHigherOrganizationsTargetPlan(
          thisYearHigherOrganizationPlans.map((thisYearPlan) =>
            calcOrganizationPlan(
              thisYearPlan,
              nextYearHigherOrganizationPlans.filter(
                (nextYearPlan) =>
                  nextYearPlan.department?.id &&
                  nextYearPlan.department.id === thisYearPlan.department?.id
              )[0]
            )
          )
        )
      )
    } else {
      setHigherOrganizationTargetPlan(undefined)
    }
  }, [
    calcHigherOrganizationsTargetPlan,
    calcOrganizationPlan,
    nextYearHigherOrganizationPlans,
    thisYearHigherOrganizationPlans,
  ])

  useEffect(() => {
    setTotalPlan(calcTotalPlan)
  }, [calcTotalPlan])

  useEffect(() => {
    setDiffPlan(calcDiffPlan)
  }, [calcDiffPlan])

  const negativeValueStyles = (value: number): CSSProperties => ({
    color: value < 0 ? 'red' : 'initial',
  })

  const detailPlanColumns: ColumnsType<PlanColumn> = useMemo(
    () => [
      {
        title: '',
        render: (_, column, index) => ({
          children: <Typography.Text>{column.parentName}</Typography.Text>,
          props: {
            rowSpan: index % 3 === 0 ? 3 : 0,
            colSpan: 2,
            key: `parent-name-${index}`,
          },
        }),
        colSpan: 3,
        ellipsis: true,
      },
      {
        title: '',
        render: (_, column, index) => ({
          children: <Typography.Text ellipsis={true}>{column.name}</Typography.Text>,
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `name-${index}`,
          },
        }),
        align: 'right',
        colSpan: 0,
        rowSpan: 1,
        ellipsis: true,
      },
      {
        title: labelConfig.sales,
        render: (_, column, index) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(column.sales)}>
              {column.type === 'yearOnYear' ? toFixed(column.sales) : convertValue(column.sales)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `sales-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' &&
                column.tableType === 'diff' &&
                column.sales !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.deemedSales,
        render: (_, column, index) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(column.deemedSales)}>
              {column.type === 'yearOnYear'
                ? toFixed(column.deemedSales)
                : convertValue(column.deemedSales)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `deemedSales-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' &&
                column.tableType === 'diff' &&
                column.deemedSales !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.cost,
        render: (_, column, index) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(column.cost)}>
              {column.type === 'yearOnYear' ? toFixed(column.cost) : convertValue(column.cost)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `cost-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' && column.tableType === 'diff' && column.cost !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.sellingExpense,
        render: (_, column, index) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(column.sellingExpense)}>
              {column.type === 'yearOnYear'
                ? toFixed(column.sellingExpense)
                : convertValue(column.sellingExpense)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `sellingExpense-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' &&
                column.tableType === 'diff' &&
                column.sellingExpense !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.generalAdministrativeExpense,
        render: (_, column, index) => ({
          children: (
            <Typography.Text
              ellipsis={true}
              style={negativeValueStyles(column.generalAdministrativeExpense)}
            >
              {column.type === 'yearOnYear'
                ? toFixed(column.generalAdministrativeExpense)
                : convertValue(column.generalAdministrativeExpense)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `generalAdministrativeExpense-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' &&
                column.tableType === 'diff' &&
                column.generalAdministrativeExpense !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.operatingIncome,
        key: 'operatingIncome',
        render: (_, column, index) => ({
          children: (
            <Typography.Text style={negativeValueStyles(column.operatingIncome)}>
              {column.type === 'yearOnYear'
                ? toFixed(column.operatingIncome)
                : convertValue(column.operatingIncome)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `operatingIncome-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' &&
                column.tableType === 'diff' &&
                column.operatingIncome !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
      },
      {
        title: labelConfig.operatingIncomeRatio,
        render: (_, column, index) => ({
          children: (
            <Typography.Text style={negativeValueStyles(column.operatingIncomeRatio)}>
              {toFixed(column.operatingIncomeRatio)}%
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `operatingIncomeRatio-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' &&
                column.tableType === 'diff' &&
                column.operatingIncomeRatio !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
      },
    ],
    [convertValue]
  )

  const organizationPlanColumns: ColumnsType<PlanColumn> = useMemo(
    () => [
      {
        title: labelConfig.organizationName,
        render: (_, column, index) => ({
          children: <Typography.Text>{column.parentName}</Typography.Text>,
          props: {
            rowSpan: index % 3 === 0 ? 3 : 0,
            colSpan: 2,
            key: `plan-org-name-${index}`,
          },
        }),
        colSpan: 3,
        ellipsis: true,
      },
      {
        title: '',
        render: (_, column, index) => ({
          children: <Typography.Text ellipsis={true}>{column.name}</Typography.Text>,
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `plan-name-${index}`,
          },
        }),
        align: 'right',
        colSpan: 0,
        rowSpan: 1,
        ellipsis: true,
      },
      {
        title: labelConfig.sales,
        render: (_, column, index) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(column.sales)}>
              {column.type === 'yearOnYear' ? toFixed(column.sales) : convertValue(column.sales)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            style: {
              textAlign: 'right',
            },
            colSpan: 1,
            rowSpan: 1,
            key: `plan-sales-${index}`,
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.deemedSales,
        render: (_, column, index) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(column.deemedSales)}>
              {column.type === 'yearOnYear'
                ? toFixed(column.deemedSales)
                : convertValue(column.deemedSales)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            style: {
              textAlign: 'right',
            },
            colSpan: 1,
            rowSpan: 1,
            key: `plan-deemedSales-${index}`,
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.cost,
        render: (_, column, index) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(column.cost)}>
              {column.type === 'yearOnYear' ? toFixed(column.cost) : convertValue(column.cost)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            style: {
              textAlign: 'right',
            },
            colSpan: 1,
            rowSpan: 1,
            key: `plan-cost-${index}`,
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.sellingExpense,
        render: (_, column, index) => ({
          children: (
            <Typography.Text ellipsis={true} style={negativeValueStyles(column.sellingExpense)}>
              {column.type === 'yearOnYear'
                ? toFixed(column.sellingExpense)
                : convertValue(column.sellingExpense)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `sellingExpense-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' &&
                column.tableType === 'diff' &&
                column.sellingExpense !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.generalAdministrativeExpense,
        render: (_, column, index) => ({
          children: (
            <Typography.Text
              ellipsis={true}
              style={negativeValueStyles(column.generalAdministrativeExpense)}
            >
              {column.type === 'yearOnYear'
                ? toFixed(column.generalAdministrativeExpense)
                : convertValue(column.generalAdministrativeExpense)}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `generalAdministrativeExpense-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' &&
                column.tableType === 'diff' &&
                column.generalAdministrativeExpense !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
        ellipsis: true,
      },
      {
        title: labelConfig.operatingIncome,
        key: 'operatingIncome',
        render: (_, column, index) => ({
          children: (
            <Typography.Text style={negativeValueStyles(column.operatingIncome)}>
              {column.type === 'yearOnYear'
                ? toFixed(column.operatingIncome)
                : numberFormatter.format(toFixed(column.operatingIncome))}
              {column.type === 'yearOnYear' ? '%' : null}
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `operatingIncome-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' &&
                column.tableType === 'diff' &&
                column.operatingIncome !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
      },
      {
        title: labelConfig.operatingIncomeRatio,
        render: (_, column, index) => ({
          children: (
            <Typography.Text style={negativeValueStyles(column.operatingIncomeRatio)}>
              {toFixed(column.operatingIncomeRatio)}%
            </Typography.Text>
          ),
          props: {
            colSpan: 1,
            rowSpan: 1,
            key: `operatingIncomeRatio-${index}`,
            style: {
              textAlign: 'right',
              backgroundColor:
                column.type === 'nextYearTarget' &&
                column.tableType === 'diff' &&
                column.operatingIncomeRatio !== 0
                  ? 'peachpuff'
                  : 'initial',
            },
          },
        }),
      },
    ],
    [convertValue]
  )

  const [createApprovedAnnualPlanSnapshot] = useMutation<
    CreateApprovedAnnualPlanSnapshotResponseTypes,
    CreateApprovedAnnualPlanSnapshotRequestTypes
  >(CREATE_APPROVED_ANNUAL_PLAN_SNAPSHOT, {
    onCompleted: async () => {
      await message.success(labelConfig.createApprovedAnnualPlanSnapshotSuccess)
    },
    onError: async () => {
      await message.error(labelConfig.createApprovedAnnualPlanSnapshotError)
    },
  })

  const [form] = Form.useForm<{ lowerOrganizationPlans: PlanRow[] }>()
  const formRef = useRef(null)

  useEffect(() => {
    if (formRef.current) {
      form.resetFields()
      form.setFieldsValue({ lowerOrganizationPlans })
    }
  }, [form, lowerOrganizationPlans])

  const onSave: ButtonProps['onClick'] = async () => {
    if (isAnnualPlanApproved) {
      await cancelApprovedAnnualPlan({
        variables: {
          cancelApprovedAnnualPlanInput: {
            id: nextYearAnnualPlanWithHigherOrganizations?.findAnnualPlanByYear?.id || -1,
            version: nextYearAnnualPlanWithHigherOrganizations?.findAnnualPlanByYear?.version || 1,
          },
        },
      })
    } else {
      await approveAnnualPlan({
        variables: {
          approveAnnualPlanInput: {
            id: nextYearAnnualPlanWithHigherOrganizations?.findAnnualPlanByYear?.id || -1,
            version: nextYearAnnualPlanWithHigherOrganizations?.findAnnualPlanByYear?.version || 1,
          },
        },
      })
      await createApprovedAnnualPlanSnapshot({
        variables: {
          createApprovedAnnualPlanSnapshotInput: {
            approvedAnnualPlanId:
              nextYearAnnualPlanWithHigherOrganizations?.findAnnualPlanByYear?.id || -1,
          },
        },
      })
    }
    if (currentTargetOrganizationLevel) {
      findNextYearAnnualPlanWithHigherOrganizations({
        variables: {
          findAnnualPlanByYearInput: {
            year: targetYear,
            organizationLevel: currentTargetOrganizationLevel,
          },
        },
      })
    }
  }

  return (
    <PageTitleContext.Provider value={labelConfig.pageTitle}>
      <MainLayout>
        <style jsx>{`
          :global(.ant-input-number-input) {
            text-align: right !important;
          }
          :global(.ant-input-number-handler-wrap) {
            display: none;
          }
        `}</style>

        {(youCanAccessThisPage && (
          <Layout>
            <Row>
              <Row wrap style={{ width: '100%' }}>
                <Space wrap direction={'horizontal'}>
                  {profile && (
                    <Row style={{ alignItems: 'center' }}>
                      <Button
                        type="default"
                        onClick={onSave}
                        style={{ paddingRight: '60px', paddingLeft: '60px', marginRight: '1rem' }}
                        disabled={!youCanEditThisPage}
                      >
                        {isAnnualPlanApproved ? '承認取消' : '承認'}
                      </Button>
                      <Typography.Text style={{ fontWeight: 'bold' }}>
                        {isAnnualPlanApproved
                          ? `承認済 ${dayjs(
                              nextYearAnnualPlanWithHigherOrganizations?.findAnnualPlanByYear
                                ?.updatedAt ?? new Date()
                            ).format('YYYY/MM/DD HH:mm:ss')}`
                          : '未承認'}
                      </Typography.Text>
                    </Row>
                  )}
                </Space>
              </Row>

              <Divider />

              <div>
                <div
                  style={{
                    width: '100%',
                    position: 'sticky',
                    top: 0,
                    background: '#fff',
                    zIndex: 10,
                  }}
                >
                  <Row align={'middle'} style={{ paddingTop: '10px' }}>
                    <Space>
                      <Row align={'middle'}>
                        <Space>
                          <Col>
                            <Typography.Text strong>{labelConfig.targetYear}: </Typography.Text>
                            <Typography.Text strong>{targetYear}年度</Typography.Text>
                          </Col>
                        </Space>
                      </Row>
                    </Space>

                    <Row style={{ marginLeft: 'auto' }}>
                      <Space>
                        <Typography.Text>単位</Typography.Text>
                        {currentPriceUnit && (
                          <PriceUnits
                            defaultValue={currentPriceUnit.type}
                            onChange={onPriceUnitChange}
                          />
                        )}
                      </Space>
                    </Row>
                  </Row>

                  <Space direction={'vertical'}>
                    {higherOrganizationColumnData &&
                      currentTargetOrganizationLevel &&
                      currentTargetOrganizationLevel > 1 && (
                        <Table
                          size={'small'}
                          columns={detailPlanColumns}
                          dataSource={higherOrganizationColumnData}
                          rowKey={'key'}
                          pagination={false}
                          extraSmall={true}
                        />
                      )}

                    <div
                      style={{
                        borderTop:
                          higherOrganizationColumnData &&
                          currentTargetOrganizationLevel &&
                          currentTargetOrganizationLevel > 1
                            ? '1px solid #dfdfdf'
                            : 'none',
                      }}
                    >
                      <Table
                        size={'small'}
                        className={'noHeaderTable'}
                        columns={detailPlanColumns}
                        dataSource={totalPlanColumnData}
                        rowKey={'key'}
                        pagination={false}
                        showHeader={
                          !(
                            higherOrganizationColumnData &&
                            currentTargetOrganizationLevel &&
                            currentTargetOrganizationLevel > 1
                          )
                        }
                        extraSmall={true}
                      />
                    </div>

                    {higherOrganizationColumnData &&
                      currentTargetOrganizationLevel &&
                      currentTargetOrganizationLevel > 1 && (
                        <div style={{ borderTop: '1px solid #dfdfdf' }}>
                          <Table
                            size={'small'}
                            className={'noHeaderTable'}
                            columns={detailPlanColumns}
                            dataSource={diffPlanColumnData}
                            rowKey={'key'}
                            pagination={false}
                            showHeader={false}
                            extraSmall={true}
                          />
                        </div>
                      )}
                  </Space>
                </div>

                <Divider />
                {profile && (
                  <Form form={form} ref={formRef}>
                    <Table
                      size={'small'}
                      columns={organizationPlanColumns}
                      dataSource={planColumnData}
                      rowKey={'key'}
                      pagination={false}
                    />
                  </Form>
                )}
              </div>
            </Row>
          </Layout>
        )) ||
          (youCanAccessThisPage == false && <div>{labelConfig.doYouNotHavePermission}</div>)}
      </MainLayout>
    </PageTitleContext.Provider>
  )
}

export default Plans

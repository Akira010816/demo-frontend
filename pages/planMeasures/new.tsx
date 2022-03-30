import { Col, Layout, Row, Tabs, Modal, Form, message, Spin } from 'antd'
import React, { FC, useEffect, useMemo, useState } from 'react'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import Button from '~/components/Button'
import { PlanMeasuresSummaryForm } from '~/components/planMeasure/summaryForm'
import { RiskForm } from '~/components/planMeasure/riskForm'
import { PlanMeasureSaleForm } from '~/components/planMeasure/saleForm'
import { PlanMeasureCostForm } from '~/components/planMeasure/costForm'
import { PlanMeasureTaskForm } from '~/components/planMeasure/taskForm'
import { TaskAllocationForm } from '~/components/planMeasure/registrationTaskCost'
import {
  displaySetting,
  EffectSaleProjectTypes,
  EffectSaleStatusTypes,
  priceUnits,
} from '~/lib/displaySetting'
import {
  CreatePlanMeasureRequestVars,
  CreatePlanMeasureResponse,
  CREATE_PLAN_MEASURE,
  generateCreatePlanMeasureInputFromEntity,
} from '~/graphhql/mutations/createPlanMeasure'
import {
  FIND_ALL_BUSINESS_YEARS,
  FindAllBusinessYearsResponse,
} from '~/graphhql/queries/findAllBusinessYears'
import { useMutation, useQuery } from '@apollo/client'
import { useLazyQuery } from '@apollo/react-hooks'
import { getRandomString } from '~/lib/randomString'
import { useAuth } from '~/hooks/useAuth'
import { youCanDoIt } from '~/lib/handlePermission'
import { toFixed } from '~/lib/number'
import { DepartmentTableRow } from '~/components/department/departmentSelectTable'
import {
  FIND_ALL_ACCOUNT_TITLES,
  FindAllAccountTitlesResponse,
} from '~/graphhql/queries/findAllAccountTitles'
import _ from 'lodash'
import { useRouter } from 'next/router'
import { FindPriceUnit, FIND_PRICE_UNIT } from '~/graphhql/queries/findPriceUnit'

const PAGE_ID = 'planMeasureNew'
const labelConfig = displaySetting[PAGE_ID].labelConfig

//Define save props
interface SaveProps {
  onSave?: () => void
  editable: boolean | undefined
}

/**
 * Plan measure tab enum
 * @value measure_summary -> 概要
 * @value measure_risk -> リスク
 * @value sales_effects -> 効果(売上)
 * @value sales_cost ->  効果(コスト)
 * @value measure_tasks -> タスク
 * @value tasks_cost -> タスクのコスト配賦
 */
export const PLAN_MEASURE_TAB_ITEM = [
  'measure_summary', // 概要
  'measure_risk', // リスク
  'sales_effects', // 効果(売上)
  'sales_cost', // 効果(コスト)
  'measure_tasks', // タスク
  'tasks_cost', // タスクのコスト配賦
] as const
export type PlanMeasureTabs = typeof PLAN_MEASURE_TAB_ITEM[number]

//Save component
export const Save = (props: SaveProps): JSX.Element => {
  const { onSave, editable } = props
  return (
    <Col span={24}>
      <Row
        style={{
          marginTop: '10px',
          marginBottom: '32px',
          paddingBottom: '10px',
          borderBottom: 'solid 2px rgb(230, 230, 230)',
          textAlign: 'right',
        }}
      >
        <Col span={22} style={{ textAlign: 'right' }}>
          <Button
            onClick={() => onSave && onSave()}
            type={'primary'}
            htmlType={'submit'}
            disabled={!editable}
          >
            {labelConfig.save}
          </Button>
        </Col>
      </Row>
    </Col>
  )
}

export const generateDataMonthByNext5Year = (businessYears: BusinessYear[]): PlanMeasurePrice[] => {
  businessYears = _.sortBy(businessYears, (x: BusinessYear) => x.startYear)
  //Define new list cost prices
  const newPlanMeasureCostPrices: PlanMeasurePrice[] = []
  for (let i = 0; i < businessYears.length; i++) {
    for (let j = businessYears[i].startMonth; j < 12 + businessYears[i].startMonth; j++) {
      const randomId = `${businessYears[i].startYear}-${i + 1}-${getRandomString()}`
      newPlanMeasureCostPrices.push({
        yearOfOccurrence: j <= 12 ? businessYears[i].startYear : businessYears[i].startYear + 1,
        monthOfOccurrence: j <= 12 ? j : j - 12,
        cost: 0,
        tempId: randomId,
      })
    }
  }
  return newPlanMeasureCostPrices
}

export const additionalPrices = (
  businessYears: BusinessYear[],
  prices: PlanMeasurePrice[]
): PlanMeasurePrice[] => {
  businessYears = _.sortBy(businessYears, (x: BusinessYear) => x.startYear)
  //Define additional list prices
  const newPlanMeasureCostPrices: PlanMeasurePrice[] = []
  for (let i = 0; i < businessYears.length; i++) {
    for (let j = businessYears[i].startMonth; j < 12 + businessYears[i].startMonth; j++) {
      const year = j <= 12 ? businessYears[i].startYear : businessYears[i].startYear + 1
      const month = j <= 12 ? j : j - 12
      const checkPriceIdx = prices.findIndex(
        (price) => price.yearOfOccurrence == year && price.monthOfOccurrence == month
      )
      if (checkPriceIdx != -1) continue
      const randomId = `${businessYears[i].startYear}-${i + 1}-${getRandomString()}`
      newPlanMeasureCostPrices.push({
        yearOfOccurrence: year,
        monthOfOccurrence: month,
        cost: 0,
        tempId: randomId,
      })
    }
  }
  return newPlanMeasureCostPrices
}

//Define risk price unit default
const riskPriceUnitDefault: PriceUnit = {
  digitLength: 1,
  isDefault: true,
  name: 'yen',
  type: 'yen',
}
//Define cost price unit default
const costPriceUnitDefault: PriceUnit = {
  digitLength: 1,
  isDefault: true,
  name: 'yen',
  type: 'yen',
}
//Define sale price unit default
const salePriceUnitDefault: PriceUnit = {
  digitLength: 1,
  isDefault: true,
  name: 'yen',
  type: 'yen',
}
//Define task price unit default
const taskPriceUnitDefault: PriceUnit = {
  digitLength: 1,
  isDefault: true,
  name: 'yen',
  type: 'yen',
}

const PlanMeasuresCreateForm: FC = () => {
  const { currentUserDepartmentId, profile } = useAuth()
  const [youCanAccessThisPage, setYouCanAccessThisPage] = useState<boolean | undefined>(undefined)
  const [youCanEditThisPage, setYouCanEditThisPage] = useState<boolean | undefined>(undefined)
  const router = useRouter()

  const { data: accountTitlesData } = useQuery<FindAllAccountTitlesResponse>(
    FIND_ALL_ACCOUNT_TITLES,
    {
      fetchPolicy: 'no-cache',
    }
  )

  const accountTitles = accountTitlesData?.findAllAccountTitles ?? []

  useEffect(() => {
    if (profile && currentUserDepartmentId) {
      const accessable = youCanDoIt(profile, currentUserDepartmentId, 'planMeasureViewMode')
      setYouCanAccessThisPage(accessable)

      const editable = youCanDoIt(profile, currentUserDepartmentId, 'planMeasureEditMode')
      setYouCanEditThisPage(editable)
    }
  }, [profile, currentUserDepartmentId])

  const { TabPane } = Tabs

  const [businessYears, setBusinessYears] = useState<BusinessYear[]>([])
  const [nextFiveYears, setNextFiveYears] = useState<BusinessYear[]>([])
  const [findAllBusinessYears] = useLazyQuery<FindAllBusinessYearsResponse>(
    FIND_ALL_BUSINESS_YEARS,
    {
      fetchPolicy: 'no-cache',
      onCompleted: (data) => {
        setBusinessYears(data.findAllBusinessYears)
      },
    }
  )
  useEffect(() => findAllBusinessYears(), [findAllBusinessYears])

  const nextBusinessYear = useMemo<BusinessYear | undefined>(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return businessYears.find((value) => {
      const startDate = new Date(value.startYear, value.startMonth - 1, value.startDate)
      const endDate = new Date(value.endYear, value.endMonth - 1, value.endDate)
      endDate.setDate(endDate.getDate() + 1)
      return startDate <= date && date < endDate
    })
  }, [businessYears])

  //Common state
  const [visibleModal, setVisibleModal] = useState<boolean>(false) //Variable to check modal warning show or hide
  const [currentTab, setCurrentTab] = useState<PlanMeasureTabs>(PLAN_MEASURE_TAB_ITEM[0]) //Variable to check modal warning show or hide
  const [targetTab, setTargetTab] = useState<PlanMeasureTabs>(PLAN_MEASURE_TAB_ITEM[0]) //Variable to check modal warning show or hide

  //Loading state
  const [creating, setCreating] = useState<boolean>(false)

  //Summary state
  const [unsavedSummary, setUnsavedSummary] = useState<boolean>(false) //Variable check unsaved summary
  const [shouldRefreshDataSummary, setShouldRefreshDataSummary] = useState<boolean>(false) //Variable to handle call refresh data in summary tab

  //Risk state
  const [riskRequired, setRiskRequired] = useState<boolean>(false)
  const [unsavedRisk, setUnsavedRisk] = useState<boolean>(false) //Variable check unsaved risk
  const [shouldRefreshDataRisk, setShouldRefreshDataRisk] = useState<boolean>(false) //Variable to handle call refresh data in risk tab
  const [riskPriceUnit, setRiskPriceUnit] = useState<PriceUnit>(priceUnits[0])

  //Effect sale state
  const [shouldRefreshDataSale, setShouldRefreshDataSale] = useState<boolean>(false) //Variable to handle call refresh data in effect sale tab
  const [unsavedEffectSale, setUnsavedSale] = useState<boolean>(false) //Variable check unsaved effect sale
  const [salePriceUnit, setSalePriceUnit] = useState<PriceUnit>(priceUnits[0])

  //Cost state
  const [unsavedCost, setUnsavedCost] = useState<boolean>(false) //Variable check unsaved cost
  const [shouldRefreshDataCost, setShouldRefreshDataCost] = useState<boolean>(false) //Variable to handle call refresh data in risk tab
  const [costPriceUnit, setCostPriceUnit] = useState<PriceUnit>(priceUnits[0])

  //Task state
  const [unsavedTask, setUnsavedTask] = useState<boolean>(false) //Variable check unsaved task
  const [shouldRefreshDataTask, setShouldRefreshDataTask] = useState<boolean>(false) //Variable to handle call refresh data in task data
  const [taskPriceUnit, setTaskPriceUnit] = useState<PriceUnit>(priceUnits[0])

  //Task allocation state
  const [taskAllocationRatioIsValid, setTaskAllocationRatioIsValid] = useState<boolean>(true) //Variable check ratio task allocation isValid
  const [unsavedTaskAllocation, setUnsavedTaskAllocation] = useState<boolean>(false) //Variable check unsaved task allocation
  const [shouldRefreshDataTaskAllocation, setShouldRefreshDataTaskAllocation] = useState<boolean>(
    false
  ) //Variable to handle call refresh data in task allocation data
  const [taskAllocationPriceUnit, setTaskAllocationPriceUnit] = useState<PriceUnit>(priceUnits[0])
  //List task allocation department selected
  const [taskAllocationDepartments, setDepartments] = useState<DepartmentTableRow[]>([])
  //Data state
  const [risks, setRisks] = useState<PlanMeasureRisk[]>([])
  const [sales, setSales] = useState<PlanMeasureSale[]>([])
  const [costs, setCosts] = useState<PlanMeasureCost[]>([])
  const [tasks, setTasks] = useState<PlanMeasureTask[]>([])
  const [planMeasure, setPlanMeasure] = useState<PlanMeasure>({})

  //Form
  const [planMeasureForm] = Form.useForm()
  const [riskForm] = Form.useForm()
  const [costForm] = Form.useForm()
  const [taskForm] = Form.useForm()

  const [createPlanMeasure] = useMutation<CreatePlanMeasureResponse, CreatePlanMeasureRequestVars>(
    CREATE_PLAN_MEASURE,
    {
      onCompleted: async (response) => {
        setCreating(false)
        setRiskRequired(false)
        message.success(labelConfig.createSuccess)
        localStorage.setItem('shouldRefreshPlanMeasures', 'true')

        if (response.createPlanMeasure.code) {
          await router.push(`/planMeasures/${response.createPlanMeasure.code}`)
          return
        }
        setRisks([])
        setSales([])
        setCosts([])
        setPlanMeasure({})
      },
      onError: async () => {
        setCreating(false)
        message.error(labelConfig.createError)
      },
      notifyOnNetworkStatusChange: true,
    }
  )

  const { data: defaultPriceUnit } = useQuery<FindPriceUnit>(FIND_PRICE_UNIT)
  useEffect(() => {
    if (defaultPriceUnit) {
      const priceUnit = priceUnits.filter(
        (priceUnit) => priceUnit.digitLength === defaultPriceUnit.findPriceUnit?.digitLength
      )[0]
      setCostPriceUnit(priceUnit)
      setTaskPriceUnit(priceUnit)
      setRiskPriceUnit(priceUnit)
      setSalePriceUnit(priceUnit)
      setTaskAllocationPriceUnit(priceUnit)
    }
  }, [defaultPriceUnit])

  useEffect(() => {
    if (businessYears && businessYears.length > 0) {
      const nextFiveYearTemp: BusinessYear[] = []
      const date = new Date()
      for (let i = 1; i <= 5; i++) {
        date.setFullYear(date.getFullYear() + 1)
        const businessYear = businessYears.find((value) => {
          const startDate = new Date(value.startYear, value.startMonth - 1, value.startDate)
          const endDate = new Date(value.endYear, value.endMonth - 1, value.endDate)
          endDate.setDate(endDate.getDate() + 1)
          return startDate <= date && date < endDate
        })
        if (businessYear != undefined) {
          nextFiveYearTemp.push(businessYear)
        }
      }
      setNextFiveYears([...nextFiveYearTemp])
    }
  }, [businessYears])

  useEffect(() => {
    if (nextFiveYears.length > 0 && sales.length < 1) {
      setSales([
        {
          id: 1,
          project: EffectSaleProjectTypes.sales.propertyName,
          effectIncDec: EffectSaleStatusTypes.maintainStatusQuo.propertyName,
          prices: [...(generateDataMonthByNext5Year(nextFiveYears) || [])],
          isNew: true,
        },
      ])
    }
  }, [nextFiveYears, sales])

  //Function on choose save unsaved content
  const onOkUnsavedContent = async (): Promise<void> => {
    //Summary tab
    if (currentTab == PLAN_MEASURE_TAB_ITEM[0]) {
      const planMeasureInput: PlanMeasure = await planMeasureForm.getFieldsValue()
      setPlanMeasure({ ...planMeasureInput })
      setUnsavedSummary(false)
    }
    //Choose save unsaved content    //Risk tab
    if (currentTab == PLAN_MEASURE_TAB_ITEM[1]) {
      setUnsavedRisk(false)
    }
    //Effect sale tab
    if (currentTab == PLAN_MEASURE_TAB_ITEM[2]) {
      setUnsavedSale(false)
    }
    //Effect cost tab
    if (currentTab == PLAN_MEASURE_TAB_ITEM[3]) {
      setUnsavedCost(false)
    }
    //Effect task tab
    if (currentTab == PLAN_MEASURE_TAB_ITEM[4]) {
      setUnsavedTask(false)
    }
    //Task allocation tab
    if (currentTab == PLAN_MEASURE_TAB_ITEM[5]) {
      setUnsavedTaskAllocation(false)
    }
    setCurrentTab(targetTab)
    setVisibleModal(false)
  }

  //Function handle on tab change
  const onChangeTab = (tabSelected: PlanMeasureTabs): void => {
    //If target tab not exist in PlanMeasureTabs then return
    if (!tabSelected) return

    //If target tab is not risk or effect sale and unsaved content then show popup confirm
    if (
      (tabSelected != PLAN_MEASURE_TAB_ITEM[0] && unsavedSummary) ||
      (tabSelected != PLAN_MEASURE_TAB_ITEM[1] && unsavedRisk) ||
      (tabSelected != PLAN_MEASURE_TAB_ITEM[2] && unsavedEffectSale) ||
      (tabSelected != PLAN_MEASURE_TAB_ITEM[3] && unsavedCost) ||
      (tabSelected != PLAN_MEASURE_TAB_ITEM[4] && unsavedTask) ||
      (tabSelected != PLAN_MEASURE_TAB_ITEM[5] && unsavedTaskAllocation)
    ) {
      setVisibleModal(true)
    } else {
      setCurrentTab(tabSelected)
    }

    //Refresh summary data when the target tab is it
    if (tabSelected == PLAN_MEASURE_TAB_ITEM[0]) {
      setShouldRefreshDataSummary(true)
    }

    //Refresh risk data when the target tab is it
    if (tabSelected == PLAN_MEASURE_TAB_ITEM[1]) {
      setShouldRefreshDataRisk(true)
    }

    //Refresh sale data when the target tab is it
    if (tabSelected == PLAN_MEASURE_TAB_ITEM[2]) {
      setShouldRefreshDataSale(true)
    }

    //Refresh cost data when the target tab is it
    if (tabSelected == PLAN_MEASURE_TAB_ITEM[3]) {
      setShouldRefreshDataCost(true)
    }

    //Refresh task data when the target tab is it
    if (tabSelected == PLAN_MEASURE_TAB_ITEM[4]) {
      setShouldRefreshDataTask(true)
    }

    //Refresh task allocation data when the target tab is it
    if (tabSelected == PLAN_MEASURE_TAB_ITEM[5]) {
      setShouldRefreshDataTaskAllocation(true)
    }

    //Set target tab
    setTargetTab(tabSelected)
  }

  //Function submit form
  const onSubmitForm = async (): Promise<void> => {
    //Handling unsaved summary case
    if (unsavedSummary) {
      setUnsavedSummary(false)
    }
    //Handling unsaved risk case
    if (unsavedRisk) {
      setUnsavedRisk(false)
    }
    //Handling unsaved sale case
    if (unsavedEffectSale) {
      setUnsavedSale(false)
    }
    //Handling unsaved cost case
    if (unsavedCost) {
      setUnsavedCost(false)
    }
    //Handling unsaved task or task allocation case
    if (unsavedTask || unsavedTaskAllocation) {
      setUnsavedTask(false)
      setUnsavedTaskAllocation(false)
    }

    await planMeasureForm
      .validateFields()
      .then(async (data) => {
        if (data && data.errorFields && data.errorFields.length > 0) {
          setCurrentTab(PLAN_MEASURE_TAB_ITEM[0])
          setTargetTab(PLAN_MEASURE_TAB_ITEM[0])
          return
        }
        await getValueAndSubmit()
      })
      .catch((err) => {
        setCreating(false)
        setCurrentTab(PLAN_MEASURE_TAB_ITEM[0])
        setTargetTab(PLAN_MEASURE_TAB_ITEM[0])
        console.log('error when create plan measure', err)
      })
  }

  //Function handle data and create
  const getValueAndSubmit = async (): Promise<void> => {
    const planMeasureInput: PlanMeasure = await planMeasureForm.getFieldsValue()

    if (nextBusinessYear) {
      planMeasureInput.businessYear = { ...nextBusinessYear }
    }

    //Assign risks by current risk price unit
    if (riskPriceUnit.type != riskPriceUnitDefault.type) {
      const diffDigit = riskPriceUnit.digitLength - riskPriceUnitDefault.digitLength
      const risksByStandardUnit = risks.map((risk) => {
        return {
          ...risk,
          prices: risk.prices.map((price) => ({
            ...price,
            cost: toFixed(price.cost * Math.pow(10, diffDigit), 2),
          })),
        }
      })
      planMeasureInput.risks = [...risksByStandardUnit]
    } else {
      planMeasureInput.risks = [...risks]
    }

    //Assign sales by current sale price unit
    if (salePriceUnit.type != salePriceUnitDefault.type) {
      const diffDigit = salePriceUnit.digitLength - salePriceUnitDefault.digitLength
      const salesByStandardUnit = sales.map((sale) => {
        return {
          ...sale,
          prices: sale.prices.map((price) => ({
            ...price,
            cost: toFixed(price.cost * Math.pow(10, diffDigit), 2),
          })),
        }
      })
      planMeasureInput.sales = [...salesByStandardUnit]
    } else {
      planMeasureInput.sales = [...sales]
    }

    //Assign costs by current cost price unit
    if (costPriceUnit.type != costPriceUnitDefault.type) {
      const diffDigit = costPriceUnit.digitLength - costPriceUnitDefault.digitLength
      const costsByStandardUnit = costs.map((cost) => {
        return {
          ...cost,
          prices: cost.prices.map((price) => ({
            ...price,
            cost: toFixed(price.cost * Math.pow(10, diffDigit), 2),
          })),
        }
      })
      planMeasureInput.costs = [...costsByStandardUnit]
    } else {
      planMeasureInput.costs = [...costs]
    }

    //Assign tasks by current task price unit
    if (taskPriceUnit.type != taskPriceUnitDefault.type) {
      const diffDigit = taskPriceUnit.digitLength - taskPriceUnitDefault.digitLength
      const tasksByStandardUnit = tasks.map((task) => {
        return {
          ...task,
          prices: task.prices.map((price) => ({
            ...price,
            cost: toFixed(price.cost * Math.pow(10, diffDigit), 2),
          })),
        }
      })
      planMeasureInput.tasks = [...tasksByStandardUnit]
    } else {
      planMeasureInput.tasks = [...tasks]
    }

    //Task allocation check any row must be 100 percent
    if (!taskAllocationRatioIsValid) {
      setCurrentTab(PLAN_MEASURE_TAB_ITEM[5])
      setTargetTab(PLAN_MEASURE_TAB_ITEM[5])
      return
    }

    setCreating(true)

    //Start create
    await createPlanMeasure({
      variables: {
        createPlanMeasureInput: generateCreatePlanMeasureInputFromEntity(planMeasureInput, profile),
      },
    })
  }

  return (
    <PageTitleContext.Provider value={labelConfig.pageTitle}>
      <MainLayout>
        {(youCanAccessThisPage && (
          <Spin spinning={creating}>
            <Layout style={{ paddingLeft: '2rem' }}>
              <Row>
                <Col offset={20} span={2} style={{ marginLeft: 'auto' }}></Col>
              </Row>
              <div className="card-container" style={{ marginTop: 25 }}>
                <Tabs
                  type="card"
                  onChange={(current) => onChangeTab(current as PlanMeasureTabs)}
                  activeKey={currentTab}
                >
                  <TabPane
                    tab={
                      <div>
                        {/* {unsavedSummary && <span style={{ color: '#FF0000' }}>[未入力] </span>} */}
                        概要
                      </div>
                    }
                    key={PLAN_MEASURE_TAB_ITEM[0]}
                    disabled={!youCanEditThisPage}
                  >
                    <Save
                      onSave={onSubmitForm}
                      editable={
                        youCanEditThisPage && businessYears.length > 0 && profile != undefined
                      }
                    />
                    <PlanMeasuresSummaryForm
                      unsaved={unsavedSummary}
                      planMeasure={planMeasure}
                      form={planMeasureForm}
                      editable={youCanEditThisPage}
                      shouldRefreshData={shouldRefreshDataSummary}
                      setRiskRequired={setRiskRequired}
                      setUnsaved={setUnsavedSummary}
                      setShouldRefreshData={setShouldRefreshDataSummary}
                    />
                  </TabPane>
                  {riskRequired && nextFiveYears.length > 0 && (
                    <TabPane
                      tab={
                        <div>
                          {/* {(unsavedRisk || risks.length < 1) && (
                            <span style={{ color: '#FF0000' }}>[未入力] </span>
                          )} */}
                          リスク
                        </div>
                      }
                      key={PLAN_MEASURE_TAB_ITEM[1]}
                      forceRender
                      disabled={!youCanEditThisPage}
                    >
                      <Save
                        onSave={onSubmitForm}
                        editable={
                          youCanEditThisPage && businessYears.length > 0 && profile != undefined
                        }
                      />
                      <RiskForm
                        setShouldRefreshDataRisk={setShouldRefreshDataRisk}
                        setUnsaved={setUnsavedRisk}
                        setRisks={setRisks}
                        setRiskPriceUnit={setRiskPriceUnit}
                        shouldRefreshDataRisk={shouldRefreshDataRisk}
                        unsaved={unsavedRisk}
                        risks={risks}
                        form={riskForm}
                        editable={youCanEditThisPage}
                        accountTitles={accountTitles}
                        nextFiveYears={nextFiveYears}
                        riskPriceUnit={riskPriceUnit}
                      />
                    </TabPane>
                  )}
                  {nextFiveYears.length > 0 && (
                    <TabPane
                      tab={
                        <div>
                          {/* {unsavedEffectSale && <span style={{ color: '#FF0000' }}>[未入力] </span>} */}
                          効果(売上)
                        </div>
                      }
                      key={PLAN_MEASURE_TAB_ITEM[2]}
                      disabled={!youCanEditThisPage}
                    >
                      <Save
                        onSave={onSubmitForm}
                        editable={
                          youCanEditThisPage && businessYears.length > 0 && profile != undefined
                        }
                      />
                      <PlanMeasureSaleForm
                        setUnsaved={setUnsavedSale}
                        setShouldRefreshDataSale={setShouldRefreshDataSale}
                        setSales={setSales}
                        setSalePriceUnit={setSalePriceUnit}
                        shouldRefreshDataSale={shouldRefreshDataSale}
                        unsaved={unsavedEffectSale}
                        sales={sales}
                        editable={youCanEditThisPage}
                        nextFiveYears={nextFiveYears}
                        salePriceUnit={salePriceUnit}
                      />
                    </TabPane>
                  )}
                  {nextFiveYears.length > 0 && (
                    <TabPane
                      tab={
                        <div>
                          {/* {unsavedCost && <span style={{ color: '#FF0000' }}>[未入力] </span>} */}
                          効果(コスト)
                        </div>
                      }
                      key={PLAN_MEASURE_TAB_ITEM[3]}
                      disabled={!youCanEditThisPage}
                    >
                      <Save
                        onSave={onSubmitForm}
                        editable={
                          youCanEditThisPage && businessYears.length > 0 && profile != undefined
                        }
                      />
                      <PlanMeasureCostForm
                        setShouldRefreshDataCost={setShouldRefreshDataCost}
                        setUnsaved={setUnsavedCost}
                        setCosts={setCosts}
                        setCostPriceUnit={setCostPriceUnit}
                        shouldRefreshDataCost={shouldRefreshDataCost}
                        unsaved={unsavedCost}
                        costs={costs}
                        form={costForm}
                        editable={youCanEditThisPage}
                        accountTitles={accountTitles}
                        nextFiveYears={nextFiveYears}
                        costPriceUnit={costPriceUnit}
                      />
                    </TabPane>
                  )}
                  {nextFiveYears.length > 0 && (
                    <TabPane
                      tab={
                        <div>
                          {/* {unsavedTask && <span style={{ color: '#FF0000' }}>[未入力] </span>} */}
                          タスク
                        </div>
                      }
                      key={PLAN_MEASURE_TAB_ITEM[4]}
                      disabled={!youCanEditThisPage}
                    >
                      <Save
                        onSave={onSubmitForm}
                        editable={
                          youCanEditThisPage && businessYears.length > 0 && profile != undefined
                        }
                      />
                      <PlanMeasureTaskForm
                        setShouldRefreshDataTask={setShouldRefreshDataTask}
                        setUnsaved={setUnsavedTask}
                        setTasks={setTasks}
                        setTaskPriceUnit={setTaskPriceUnit}
                        shouldRefreshDataTask={shouldRefreshDataTask}
                        unsaved={unsavedTask}
                        tasks={tasks}
                        form={taskForm}
                        editable={youCanEditThisPage}
                        accountTitles={accountTitles}
                        nextFiveYears={nextFiveYears}
                        taskPriceUnit={taskPriceUnit}
                      />
                    </TabPane>
                  )}
                  <TabPane
                    tab={
                      <div>
                        {/* {unsavedTaskAllocation && (
                          <span style={{ color: '#FF0000' }}>[未入力] </span>
                        )} */}
                        タスクのコスト配賦
                      </div>
                    }
                    key={PLAN_MEASURE_TAB_ITEM[5]}
                    disabled={!youCanEditThisPage}
                  >
                    <Save
                      onSave={onSubmitForm}
                      editable={
                        youCanEditThisPage && businessYears.length > 0 && profile != undefined
                      }
                    />
                    <TaskAllocationForm
                      setTasks={setTasks}
                      setUnsaved={setUnsavedTaskAllocation}
                      setShouldRefreshData={setShouldRefreshDataTaskAllocation}
                      setRatioIsValid={setTaskAllocationRatioIsValid}
                      setDepartments={setDepartments}
                      setTaskAllocationPriceUnit={setTaskAllocationPriceUnit}
                      tasks={tasks}
                      unsaved={unsavedTaskAllocation}
                      shouldRefreshData={shouldRefreshDataTaskAllocation}
                      ratioIsValid={taskAllocationRatioIsValid}
                      departments={taskAllocationDepartments}
                      editable={youCanEditThisPage}
                      accountTitles={accountTitles}
                      taskAllocationPriceUnit={taskAllocationPriceUnit}
                      taskPriceUnit={taskPriceUnit}
                    />
                  </TabPane>
                </Tabs>
              </div>
              <Modal
                title={labelConfig.warningTitle}
                style={{ top: 20 }}
                visible={visibleModal}
                onOk={() => onOkUnsavedContent()}
                onCancel={() => {
                  setVisibleModal(false)
                  setTargetTab(currentTab)
                }}
                footer={[
                  <Button key="submit" type="primary" onClick={() => onOkUnsavedContent()}>
                    OK
                  </Button>,
                  <Button
                    key="back"
                    type="ghost"
                    onClick={() => {
                      setVisibleModal(false), setTargetTab(currentTab)
                    }}
                  >
                    {labelConfig.close}
                  </Button>,
                ]}
              >
                <p>{labelConfig.unsavedContent}</p>
              </Modal>
            </Layout>
          </Spin>
        )) ||
          (youCanAccessThisPage == false && <div>{labelConfig.doYouNotHavePermission}</div>)}
      </MainLayout>
    </PageTitleContext.Provider>
  )
}
export default PlanMeasuresCreateForm

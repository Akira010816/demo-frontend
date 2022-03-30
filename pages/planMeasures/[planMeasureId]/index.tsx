import { Col, Layout, Row, Tabs, Modal, Spin, Form, message } from 'antd'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import MainLayout, { PageTitleContext } from '~/layouts/main'
import Button from '~/components/Button'
import { useRouter } from 'next/router'
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
  PlanMeasureClassificationTypes,
  priceUnits,
} from '~/lib/displaySetting'
import { useMutation, useQuery } from '@apollo/client'
import {
  FindPlanMeasureByCodeResponse,
  FindPlanMeasureByCodeVars,
  FIND_PLAN_MEASURE_BY_CODE,
} from '~/graphhql/queries/findPlanMeasureByCode'
import {
  additionalPrices,
  generateDataMonthByNext5Year,
  PlanMeasureTabs,
  PLAN_MEASURE_TAB_ITEM,
} from '../new'
import {
  generateUpdatePlanMeasureInputFromEntity,
  UpdatePlanMeasureRequestVars,
  UpdatePlanMeasureResponse,
  UPDATE_PLAN_MEASURE,
} from '~/graphhql/mutations/updatePlanMeasure'
import _ from 'lodash'
import { useAuth } from '~/hooks/useAuth'
import { youCanDoIt } from '~/lib/handlePermission'
import { toFixed } from '~/lib/number'
import { DepartmentTableRow } from '~/components/department/departmentSelectTable'
import {
  FIND_ALL_ACCOUNT_TITLES,
  FindAllAccountTitlesResponse,
} from '~/graphhql/queries/findAllAccountTitles'
import {
  FindAllBusinessYearsResponse,
  FIND_ALL_BUSINESS_YEARS,
} from '~/graphhql/queries/findAllBusinessYears'
import { useLazyQuery } from '@apollo/react-hooks'
import { FindPriceUnit, FIND_PRICE_UNIT } from '~/graphhql/queries/findPriceUnit'

const PAGE_ID = 'planMeasureNew'
const labelConfig = displaySetting[PAGE_ID].labelConfig

interface SaveProps {
  onSave?: () => void
  editable: boolean | undefined
}

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
            onClick={() => editable && onSave && onSave()}
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

//Define risk price unit default
const riskPriceUnitDefault: PriceUnit = {
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

//Define cost price unit default
const costPriceUnitDefault: PriceUnit = {
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
  const router = useRouter()
  const { planMeasureId } = router.query

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
  const [currentTab, setCurrentTab] = useState<PlanMeasureTabs>(PLAN_MEASURE_TAB_ITEM[0]) //Variable to check modal warning show or hide
  const [targetTab, setTargetTab] = useState<PlanMeasureTabs>(PLAN_MEASURE_TAB_ITEM[0]) //Variable to check modal warning show or hide
  const [visibleModal, setVisibleModal] = useState<boolean>(false) //Variable to check modal warning show or hide

  //Summary state
  const [unsavedSummary, setUnsavedSummary] = useState<boolean>(false) //Variable check unsaved summary
  const [shouldRefreshDataSummary, setShouldRefreshDataSummary] = useState<boolean>(false) //Variable to handle call refresh data in summary tab

  //Risk state
  const [unsavedRisk, setUnsavedRisk] = useState<boolean>(false) //Variable check unsaved risk
  const [shouldRefreshDataRisk, setShouldRefreshDataRisk] = useState<boolean>(false) //Variable to handle call refresh data in risk tab
  const [riskRequired, setRiskRequired] = useState<boolean>(false)
  const [riskPriceUnit, setRiskPriceUnit] = useState<PriceUnit>(priceUnits[0])

  //Loading
  const [loadingDone, setLoadingDone] = useState<boolean>(false)
  const [updating, setUpdating] = useState<boolean>(false)

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
  const [shouldRefreshDataTask, setShouldRefreshDataTask] = useState<boolean>(false) //Variable to handle call refresh data in task tab
  const [taskPriceUnit, setTaskPriceUnit] = useState<PriceUnit>(priceUnits[0])

  //Task allocation state
  const [taskAllocationRatioIsValid, setTaskAllocationRatioIsValid] = useState<boolean>(true) //Variable check ratio task allocation isValid
  const [unsavedTaskAllocation, setUnsavedTaskAllocation] = useState<boolean>(false) //Variable check unsaved task allocation
  const [shouldRefreshDataTaskAllocation, setShouldRefreshDataTaskAllocation] = useState<boolean>(
    false
  )
  const [taskAllocationPriceUnit, setTaskAllocationPriceUnit] = useState<PriceUnit>(priceUnits[0])

  //List task allocation department selected
  const [taskAllocationDepartments, setDepartments] = useState<DepartmentTableRow[]>([])

  //Data state
  const [planMeasure, setPlanMeasure] = useState<PlanMeasure>({})
  const [risks, setRisks] = useState<PlanMeasureRisk[]>([])
  const [sales, setSales] = useState<PlanMeasureSale[]>([])
  const [costs, setCosts] = useState<PlanMeasureCost[]>([])
  const [tasks, setTasks] = useState<PlanMeasureTask[]>([])
  //Form
  const [planMeasureForm] = Form.useForm()
  const [riskForm] = Form.useForm()
  const [costForm] = Form.useForm()
  const [taskForm] = Form.useForm()

  //Get plan measure mutation
  const { refetch } = useQuery<FindPlanMeasureByCodeResponse, FindPlanMeasureByCodeVars>(
    FIND_PLAN_MEASURE_BY_CODE,
    {
      variables: {
        code: planMeasureId?.toString(),
      },
      skip: !planMeasureId,
      fetchPolicy: 'no-cache',
      onCompleted: async (data) => {
        setLoadingDone(true)
        if (!data || !data.findPlanMeasureById) {
          setPlanMeasure({})
          setRisks([])
          setSales([
            {
              id: 1,
              project: EffectSaleProjectTypes.sales.propertyName,
              effectIncDec: EffectSaleStatusTypes.maintainStatusQuo.propertyName,
              prices: [...((nextFiveYears && generateDataMonthByNext5Year(nextFiveYears)) || [])],
              isNew: true,
            },
          ])
          setCosts([])
          setTasks([])
          window.open('planMeasures', '_blank')
          return
        }
        const planMeasureData = _.cloneDeep(data.findPlanMeasureById as PlanMeasure)
        if (planMeasureData.risks && planMeasureData.risks.length > 0) {
          const risksTemp = _.sortBy(planMeasureData.risks, (risk) => risk.id)
          if (riskPriceUnit.type != riskPriceUnitDefault.type) {
            const diffDigit = riskPriceUnit.digitLength - riskPriceUnitDefault.digitLength
            const measureRiskTemp = [...risksTemp]
            measureRiskTemp.map((risk) => {
              risk.prices.map((price) => {
                price.cost = toFixed(
                  price.cost * Math.pow(10, -diffDigit),
                  riskPriceUnit.digitLength + 1
                )
              })
            })
            setRisks([...measureRiskTemp])
          } else {
            setRisks([...risksTemp])
          }
        } else {
          setRisks([])
        }
        if (planMeasureData && planMeasureData.sales && planMeasureData.sales.length > 0) {
          const salesTemp = _.sortBy(planMeasureData.sales, (sale) => sale.id)
          if (salePriceUnit.type != salePriceUnitDefault.type) {
            const diffDigit = salePriceUnit.digitLength - salePriceUnitDefault.digitLength
            const measureSaleTemp = [...salesTemp]
            measureSaleTemp.map((sale) => {
              sale.prices.map((price) => {
                price.cost = toFixed(
                  price.cost * Math.pow(10, -diffDigit),
                  salePriceUnit.digitLength + 1
                )
              })
            })
            setSales([...measureSaleTemp])
          } else {
            setSales([...salesTemp])
          }
        } else {
          setSales([
            {
              id: 1,
              project: EffectSaleProjectTypes.sales.propertyName,
              effectIncDec: EffectSaleStatusTypes.maintainStatusQuo.propertyName,
              prices: [...((nextFiveYears && generateDataMonthByNext5Year(nextFiveYears)) || [])],
              isNew: true,
            },
          ])
        }

        if (planMeasureData.costs && planMeasureData.costs.length > 0) {
          const costsTemp = _.sortBy(planMeasureData.costs, (costs) => costs.id)
          if (costPriceUnit.type != costPriceUnitDefault.type) {
            const diffDigit = costPriceUnit.digitLength - costPriceUnitDefault.digitLength
            const measureCostTemp = [...costsTemp]
            measureCostTemp.map((cost) => {
              cost.prices.map((price) => {
                price.cost = toFixed(
                  price.cost * Math.pow(10, -diffDigit),
                  costPriceUnit.digitLength + 1
                )
              })
            })
            setCosts([...measureCostTemp])
          } else {
            setCosts([...costsTemp])
          }
        } else {
          setCosts([])
        }

        if (planMeasureData.tasks && planMeasureData.tasks.length > 0) {
          const tasksTemp = _.sortBy(planMeasureData.tasks, (task) => task.id)
          if (taskPriceUnit.type != taskPriceUnitDefault.type) {
            const diffDigit = taskPriceUnit.digitLength - taskPriceUnitDefault.digitLength
            const measureTaskTemp = [...tasksTemp]
            measureTaskTemp.map((task) => {
              task.prices.map((price) => {
                price.cost = toFixed(
                  price.cost * Math.pow(10, -diffDigit),
                  taskPriceUnit.digitLength + 1
                )
              })
            })
            setTasks([...measureTaskTemp])
          } else {
            setTasks([...tasksTemp])
          }
          setTasks([...tasksTemp])
        } else {
          setTasks([])
        }

        setPlanMeasure(data.findPlanMeasureById)
        if (
          data.findPlanMeasureById.classification ==
          PlanMeasureClassificationTypes.riskAvoidance.propertyName
        ) {
          setRiskRequired(true)
        } else {
          setRiskRequired(false)
        }
      },
      onError: async () => {
        setPlanMeasure({})
        setRisks([])
        setCosts([])
        setTasks([])
        setSales([
          {
            id: 1,
            project: EffectSaleProjectTypes.sales.propertyName,
            effectIncDec: EffectSaleStatusTypes.maintainStatusQuo.propertyName,
            prices: [...((nextFiveYears && generateDataMonthByNext5Year(nextFiveYears)) || [])],
            isNew: true,
          },
        ])
        setLoadingDone(true)
        await router.push(`/planMeasures/new`)
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
    if (businessYears && businessYears.length > 0 && planMeasure.businessYear?.id) {
      const nextYearIdx = businessYears.findIndex(
        (businessYear: BusinessYear) => businessYear.id == planMeasure.businessYear?.id
      )
      if (nextYearIdx == -1) return
      setNextFiveYears(
        businessYears.filter(
          (x: BusinessYear) =>
            x.startYear >= businessYears[nextYearIdx].startYear &&
            x.startYear < businessYears[nextYearIdx].startYear + 5
        ) || []
      )
    }
  }, [businessYears, planMeasure.businessYear?.id])

  const additionalListPrice = useCallback((): void => {
    if (risks && risks.length > 0) {
      const risksTemp = [...risks]
      risksTemp.map((risk) => {
        risk.prices = risk.prices.concat([...additionalPrices(nextFiveYears, risk.prices)])
      })
    }

    if (sales && sales.length > 0) {
      const salesTemp = [...sales]
      salesTemp.map((sale) => {
        sale.prices = sale.prices.concat([...additionalPrices(nextFiveYears, sale.prices)])
      })
    }

    if (costs && costs.length > 0) {
      const costsTemp = [...costs]
      costsTemp.map((cost) => {
        cost.prices = cost.prices.concat([...additionalPrices(nextFiveYears, cost.prices)])
      })
    }

    if (tasks && tasks.length > 0) {
      const tasksTemp = [...tasks]
      tasksTemp.map((task) => {
        task.prices = task.prices.concat([...additionalPrices(nextFiveYears, task.prices)])
      })
    }
  }, [costs, nextFiveYears, risks, sales, tasks])

  useEffect(() => {
    if (planMeasure && planMeasure.id && nextFiveYears && nextFiveYears.length > 0) {
      additionalListPrice()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextFiveYears, planMeasure.id])

  //Update plan measure mutation
  const [updatePlanMeasure] = useMutation<UpdatePlanMeasureResponse, UpdatePlanMeasureRequestVars>(
    UPDATE_PLAN_MEASURE,
    {
      onCompleted: async () => {
        setUpdating(false)
        setLoadingDone(false)
        await refetch()
        message.success(labelConfig.updateSuccess)
      },
      onError: async (error) => {
        setUpdating(false)
        const textMessage = error.message ?? labelConfig.updateError
        message.error(textMessage)
      },
    }
  )

  //Function on choose save unsaved content
  const onOkUnsavedContent = async (): Promise<void> => {
    //Summary tab
    if (currentTab == PLAN_MEASURE_TAB_ITEM[0]) {
      const planMeasureInput: PlanMeasure = await planMeasureForm.getFieldsValue()
      setPlanMeasure({ ...planMeasure, ...planMeasureInput })
      setUnsavedSummary(false)
    }
    //Risk tab
    if (currentTab == PLAN_MEASURE_TAB_ITEM[1]) {
      setUnsavedRisk(false)
    }
    //Effect sale tab
    if (currentTab == PLAN_MEASURE_TAB_ITEM[2]) {
      setUnsavedSale(false)
    }
    //Cost tab
    if (currentTab == PLAN_MEASURE_TAB_ITEM[3]) {
      setUnsavedCost(false)
    }
    //Task tab
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

    //Refresh task data when the target tab is it
    if (tabSelected == PLAN_MEASURE_TAB_ITEM[5]) {
      setShouldRefreshDataTaskAllocation(true)
    }

    //Set target tab
    setTargetTab(tabSelected)
  }

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
        if (!taskAllocationRatioIsValid) {
          setCurrentTab(PLAN_MEASURE_TAB_ITEM[5])
          setTargetTab(PLAN_MEASURE_TAB_ITEM[5])
          return
        }
        await getValueAndSubmit()
      })
      .catch((err) => {
        setUpdating(false)
        setCurrentTab(PLAN_MEASURE_TAB_ITEM[0])
        setTargetTab(PLAN_MEASURE_TAB_ITEM[0])
        console.log('err submit plan measure', err)
      })
  }

  const getValueAndSubmit = async (): Promise<void> => {
    const planMeasureFormInput: PlanMeasure = await planMeasureForm.getFieldsValue()
    const planMeasureInput: PlanMeasure = { ...planMeasure, ...planMeasureFormInput }

    if (nextBusinessYear) {
      planMeasureInput.businessYear = { ...nextBusinessYear }
    }

    //Assign risks to input
    if (riskPriceUnit.type != riskPriceUnitDefault.type) {
      const diffDigit = riskPriceUnit.digitLength - riskPriceUnitDefault.digitLength
      const risksByStandardUnit = risks.map((risk) => {
        return {
          ...risk,
          prices: risk.prices.map((price) => ({
            ...price,
            cost: toFixed(price.cost * Math.pow(10, diffDigit), 2),
          })),
          version: risk.version || 1,
        }
      })
      planMeasureInput.risks = [...risksByStandardUnit]
    } else {
      planMeasureInput.risks = [...risks]
    }

    //Assign sales to input
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

    //Assign cost to input
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

    //Assign tasks to input
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

    setUpdating(true)
    await updatePlanMeasure({
      variables: {
        updatePlanMeasureInput: generateUpdatePlanMeasureInputFromEntity(planMeasureInput, profile),
      },
    })
  }

  return (
    <PageTitleContext.Provider
      value={`${labelConfig.pageTitle}${
        planMeasure.code ? `,${planMeasure.code} ${planMeasure.measureName}` : ''
      }`}
    >
      <MainLayout>
        {(youCanAccessThisPage && (
          <Spin spinning={!loadingDone || updating}>
            <Layout style={{ paddingLeft: '2rem' }}>
              <Row>
                <Col offset={20} span={2} style={{ marginLeft: 'auto' }} />
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
                      isUpdate={true}
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
                      tasks={[...tasks]}
                      unsaved={unsavedTaskAllocation}
                      shouldRefreshData={shouldRefreshDataTaskAllocation}
                      ratioIsValid={taskAllocationRatioIsValid}
                      editable={youCanEditThisPage}
                      departments={taskAllocationDepartments}
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

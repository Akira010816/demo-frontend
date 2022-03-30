import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Col,
  Input,
  Layout,
  Row,
  Typography,
  Select,
  Button,
  Form,
  InputNumber,
  message,
} from 'antd'
import { FormInstance } from 'antd/es/form'
import Table from '../table'
import { ColumnGroupType, ColumnsType, ColumnType } from 'antd/es/table'
import FormItem from '~/components/form/FormItem'
import {
  displaySetting,
  PlanMeasureCostIncDecTypes,
  PlanMeasureCostItemTypes,
} from '~/lib/displaySetting'
import _ from 'lodash'
import { skipEnter } from '~/lib/keyDown'
import Modal from '~/components/modal'
import ChargeSelectModal from '../charge/chargeSelectModal'
import { PriceUnitProps, PriceUnits } from '../priceUnit'
import { UserTableRow } from '../user/userSelectTable'
import { DepartmentTableRow } from '../department/departmentSelectTable'
import { generateDataMonthByNext5Year } from '~/pages/planMeasures/new'
import { toFixed } from '~/lib/number'
import { onTableInputFocus } from '~/lib/table'
import { PlusCircleOutlined } from '@ant-design/icons'
import { renderBGColorOfColumnByMonth } from './planMeasuresTable'

const PAGE_ID = 'planMeasureCostForm'

//Define type of measure Cost props
export type PlanMeasureCostProps = {
  setShouldRefreshDataCost: (state: boolean) => void
  setUnsaved: (state: boolean) => void
  setCosts: (data: PlanMeasureCost[]) => void
  setCostPriceUnit: (data: PriceUnit) => void
  shouldRefreshDataCost: boolean
  unsaved: boolean
  costs: PlanMeasureCost[]
  form: FormInstance
  editable: boolean | undefined
  accountTitles: AccountTitle[]
  nextFiveYears: BusinessYear[]
  costPriceUnit: PriceUnit
}

export type planMeasurePlanMeasureCostTableProps = {
  form?: FormInstance
  costs?: Array<PlanMeasureCost>
  columnProps: ColumnsType<PlanMeasureCost>
}

//Get label config from display setting
const labelConfig = displaySetting[PAGE_ID].labelConfig

//Define input style
const inputStyle = {
  normal: {
    width: 110,
    marginBottom: 0,
    height: '40px',
  },
  formItem: {
    marginBottom: 0,
  },
}

//Component PlanMeasureCostTable, show list measure effect cost
const PlanMeasureCostTable = (props: planMeasurePlanMeasureCostTableProps): JSX.Element => {
  const { columnProps, costs } = props
  const planMeasureCost = useMemo(() => (costs && costs.length ? [...costs] : []), [costs])

  const columns: ColumnsType<PlanMeasureCost> = useMemo(() => columnProps, [columnProps])

  return (
    <Table
      id={'costTable'}
      size={'small'}
      columns={[...columns]}
      dataSource={[...planMeasureCost]}
      pagination={false}
      rowKey={'id'}
      scroll={{ x: 'max-content' }}
    />
  )
}

//Init measure effect cost columns, use global variable because event in column table not update new useState
let columnsTemp: (ColumnGroupType<PlanMeasureCost> | ColumnType<PlanMeasureCost>)[]

//Declare global var currentUnitPrice, because useState not update new value in table column
// let globalCurrentPriceUnit: PriceUnit = {
//   digitLength: 1,
//   isDefault: true,
//   name: 'yen',
//   type: 'yen',
// }

//Define type Cost assign selected
type CostAssignSelected = {
  id?: number
  costId?: number
  objectId?: number
  userName?: string
  departmentName?: string
  userId?: number
  departmentId?: number
  version?: number
  costTDversion?: number
}

//Function render cost record destination label from plan measure cost assign
const renderCostRecordDestination = (assign?: PlanMeasureAssign[]): string => {
  //Check if plan measure cost assign is null or empty then return
  if (!assign || assign.length < 1) return ''

  //Initial label of cost recort destination
  let label = ''

  //Concat label by type of plan measure cost assign
  assign.map((pMRA: PlanMeasureAssign) => {
    if (pMRA.costTD) {
      label += (pMRA.costTD?.department?.name || '') + '\n'
    } else if (pMRA.costTI) {
      label +=
        (pMRA.costTI?.userDpm?.department?.name || '') +
        '/' +
        (pMRA.costTI?.userDpm?.user?.name || '') +
        '\n'
    } else {
      label += ''
    }
  })
  return label
}

//Declare temporary variable for array plan measure Cost
let costsTemp: PlanMeasureCost[] = []

//Define measure effect cost form
export const PlanMeasureCostForm = (props: PlanMeasureCostProps): JSX.Element => {
  const {
    setUnsaved,
    setCosts,
    setShouldRefreshDataCost,
    setCostPriceUnit,
    unsaved,
    costs,
    form,
    shouldRefreshDataCost,
    editable,
    nextFiveYears,
    costPriceUnit,
  } = props

  const [visibleDeleteConfirm, setVisibleDeleteConfirm] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<PlanMeasureCost['id']>(undefined)
  const [visibleAddCost, setVisibleAddCost] = useState<boolean>(false)
  const [isEternal, setEternal] = useState<boolean>(true)
  const [flagHasChangeDepartment, setFlagHasChangeDepartment] = useState<boolean>(false)
  const [flagHasChangeUserDepartment, setFlagHasChangeUserDepartment] = useState<boolean>(false)
  const [visibleCostRecordingDestination, setVisibleCostRecordingDestination] = useState<boolean>(
    false
  )
  const [defaultUserDepartmentsLabel, setDefaultUserDepartmentLabel] = useState<string>('')
  const [departmentsSelected, setDepartmentsSelected] = useState<CostAssignSelected[] | undefined>(
    []
  )
  const [defaultDepartmentsLabel, setDefaultDepartmentLabel] = useState<string>('')
  const [userDepartmentsSelected, setUserDepartmentsSelected] = useState<
    CostAssignSelected[] | undefined
  >([])
  const [defaultDepartments, setDefaultDepartment] = useState<CostAssignSelected[] | undefined>([])
  const [defaultUserDepartments, setDefaultUserDepartment] = useState<
    CostAssignSelected[] | undefined
  >([])

  const defaultAccountTitle = props.accountTitles?.[0]
  const [accountTitleSelected, setAccountTitleSelected] = useState<AccountTitle | undefined>(
    defaultAccountTitle
  )

  //This function render next 5 year plan measure Cost column
  const yearSummaryColumn = (
    targetBusinessYear: BusinessYear
  ): ColumnGroupType<PlanMeasureCost> | ColumnType<PlanMeasureCost> => ({
    title: '年度累計',
    dataIndex: targetBusinessYear.startYear,
    key: targetBusinessYear.startYear,
    width: 120,
    render: (id: number, item: PlanMeasureCost, index: number) => {
      const listPriceByYear = item.prices
        .filter(
          (x: PlanMeasurePrice) =>
            (x.yearOfOccurrence == targetBusinessYear.startYear &&
              x.monthOfOccurrence >= targetBusinessYear.startMonth) ||
            (x.yearOfOccurrence == targetBusinessYear.startYear + 1 &&
              x.monthOfOccurrence < targetBusinessYear.startMonth)
        )
        ?.map(
          (price: PlanMeasurePrice): PlanMeasurePrice => ({
            ...price,
            cost: (price.cost && parseFloat(price.cost.toString())) || 0,
          })
        )
      const totalPriceByYear = toFixed(
        (item.prices && _.sumBy(listPriceByYear, 'cost')) || 0,
        costPriceUnit.digitLength + 1
      )
      const valueSpl = totalPriceByYear.toString().split('.')
      let totalPriceByYearFormat = ''
      if (valueSpl.length > 1) {
        const suffix = valueSpl.slice(1, valueSpl.length).join('')
        totalPriceByYearFormat = `${`${valueSpl[0]}`.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ','
        )}.${suffix}`
      } else {
        totalPriceByYearFormat = `${totalPriceByYear}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
      return {
        children: (
          <div key={`${id}-${index}-${item.id}`} style={{ textAlign: 'right' }}>
            {totalPriceByYearFormat}
          </div>
        ),
      }
    },
  })

  //This function render next 5 year plan measure Cost column
  const renderFiveYearPlanColumn = (
    nextFiveYears: BusinessYear[]
  ): ColumnsType<PlanMeasureCost> => {
    const fiveYearPlanColumn: ColumnsType<PlanMeasureCost> = []
    for (let i = 0; i < nextFiveYears.length; i++) {
      fiveYearPlanColumn.push({
        title: (
          <Typography.Text ellipsis={true}>
            {nextFiveYears[i].startYear}
            {labelConfig.year}
            <Button
              type={'text'}
              size={'small'}
              onClick={() => {
                onClickYearColumn(nextFiveYears[i], i + 0)
              }}
            >
              月表示
            </Button>
          </Typography.Text>
        ),
        key: nextFiveYears[i].startYear,
        dataIndex: nextFiveYears[i].startYear,
        children: [yearSummaryColumn(nextFiveYears[i])],
        width: 120,
      })
    }
    return [...fiveYearPlanColumn]
  }

  /**
   * Define column table
   */
  const [columnProps, setColumnProps] = useState<ColumnsType<PlanMeasureCost>>([
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.action}</Typography.Text>,
      key: 'action',
      dataIndex: 'action',
      align: 'center',
      colSpan: 1,
      fixed: false,
      width: 150,
      render: (id: number, item: PlanMeasureCost, index: number) => {
        return {
          children: (
            <>
              <Button
                key={`edit-${id}-${index}`}
                style={{ width: 70, marginRight: 10, minHeight: 30 }}
                type={'primary'}
                onClick={() => showPopup(item)}
                disabled={!editable}
              >
                {labelConfig.edit}
              </Button>
              <Button
                key={`remove-${id}-${item.id}-${index}`}
                type="primary"
                danger={true}
                style={{ width: 70, minHeight: 30 }}
                onClick={() => onClickRemoveButton(item.id)}
                disabled={!editable}
              >
                {labelConfig.remove}
              </Button>
            </>
          ),
        }
      },
    },
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.item}</Typography.Text>,
      key: 'item',
      dataIndex: 'item',
      colSpan: 1,
      rowSpan: 2,
      children: [],
      width: 135,
      fixed: false,
      render: (item: PlanMeasureCostItemType, entity: PlanMeasureCost, index: number) => {
        if (item) {
          return {
            children: (
              <div
                key={`item-${entity.id}-${index}`}
                onClick={() => showPopup(entity)}
                onKeyDown={skipEnter}
                role="button"
                style={{ textDecoration: 'underline', color: 'rgb(51, 108, 97)' }}
                tabIndex={index}
              >
                <a role="button" href="#">
                  {
                    Object.values(PlanMeasureCostItemTypes).find((x) => x.propertyName === item)
                      ?.label
                  }
                </a>
              </div>
            ),
          }
        } else {
          return null
        }
      },
    },
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.effectIncDec}</Typography.Text>,
      key: 'effectIncDec',
      dataIndex: 'effectIncDec',
      colSpan: 1,
      width: 150,
      fixed: false,
      render: (effectIncDec: PlanMeasureCostIncDecType, item: PlanMeasureCost, index: number) => ({
        children: (
          <div key={`${item.id}-${index}`}>
            {(effectIncDec &&
              Object.values(PlanMeasureCostIncDecTypes).find((x) => x.propertyName === effectIncDec)
                ?.label) ||
              ''}
          </div>
        ),
      }),
    },
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.accountId}</Typography.Text>,
      key: 'accountTitle',
      dataIndex: 'accountTitle',
      colSpan: 1,
      children: [],
      width: 150,
      fixed: false,
      render: (accountTitle: AccountTitle, item: PlanMeasureCost, index: number) => ({
        children: <div key={`accountId-${item.id}-${index}`}>{accountTitle?.name ?? ''}</div>,
      }),
    },
    {
      title: (
        <Typography.Text ellipsis={true}>{labelConfig.costRecordingDestination}</Typography.Text>
      ),
      key: 'costRecordingDestination',
      dataIndex: 'costRecordingDestination',
      colSpan: 1,
      children: [],
      width: 150,
      fixed: false,
      render: (id: number, item: PlanMeasureCost, index: number) => ({
        children: (
          <div
            title={renderCostRecordDestination(item?.assigns) || ''}
            key={`plan-measure-cost-rec-${id}-${index}`}
          >
            {item?.assigns &&
              item.assigns.length > 0 &&
              renderCostRecordDestination([item?.assigns[0]])}
            {item?.assigns && item?.assigns.length > 1 && '…'}
          </div>
        ),
      }),
    },
    ...(nextFiveYears && nextFiveYears.length > 0 ? renderFiveYearPlanColumn(nextFiveYears) : []),
  ])

  //Init value for plan measure cost temporary
  useEffect(() => {
    const dataCopy: PlanMeasureCost[] = JSON.parse(JSON.stringify(costs))
    costsTemp = [...dataCopy]
  }, [costs])

  //Call only once
  useEffect(() => {
    columnsTemp = [...columnProps]
    setEternal(true)
  }, [isEternal, columnProps])

  //Check tab change to refresh plan measure cost data
  useEffect(() => {
    if (shouldRefreshDataCost) {
      const dataCopy: PlanMeasureCost[] = JSON.parse(JSON.stringify(costs))
      costsTemp = [...dataCopy]
      setShouldRefreshDataCost(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShouldRefreshDataCost, shouldRefreshDataCost])

  /**
   * onClick column year function, display extend month of year selected
   * @param keyyearSelectedIndex -> year selected
   * @param keyIndex -> year index
   * @returns void
   */
  const onClickYearColumn = useCallback(
    (yearSelected: BusinessYear, keyIndex: number): void => {
      //Set key for column extend
      const keyExtend = yearSelected.id + '-extend'

      //Find index year column
      const indexYear = columnsTemp.findIndex(
        (x: ColumnGroupType<PlanMeasureCost> | ColumnType<PlanMeasureCost>) =>
          x.key == yearSelected.startYear
      )

      const indexYearExtend = columnsTemp.findIndex(
        (x: ColumnGroupType<PlanMeasureCost> | ColumnType<PlanMeasureCost>) => x.key == keyExtend
      )

      //click on Extended column
      if (indexYearExtend > -1) {
        const targetBusinessYear = nextFiveYears.filter(
          (businessYear: BusinessYear) => businessYear.startYear === yearSelected.startYear
        )[0]
        if (targetBusinessYear === undefined) return
        const targetBusinessYearIndex = nextFiveYears.findIndex(
          (businessYear: BusinessYear) => businessYear.startYear === indexYear
        )
        columnsTemp.splice(indexYearExtend, 1, {
          title: (
            <Typography.Text ellipsis={true}>
              {targetBusinessYear.startYear}
              {labelConfig.year}
              <Button
                type={'text'}
                size={'small'}
                onClick={() => {
                  onClickYearColumn(targetBusinessYear, targetBusinessYearIndex + 0)
                }}
              >
                月表示
              </Button>
            </Typography.Text>
          ),
          key: targetBusinessYear.startYear,
          dataIndex: targetBusinessYear.startYear,
          children: [yearSummaryColumn(targetBusinessYear)],
          width: 120,
        })
      } else {
        //click on not extended column
        const childColumns: (ColumnGroupType<PlanMeasureCost> | ColumnType<PlanMeasureCost>)[] = []
        for (let i = yearSelected.startMonth; i < 12 + yearSelected.startMonth; i++) {
          const month = i > 12 ? i % 12 : i
          const year = i > 12 ? yearSelected.year + 1 : yearSelected.year
          childColumns.push({
            title: `${year}${labelConfig.yearLabel}${month}${labelConfig.month}`,
            dataIndex: [`prices[${keyIndex * 12 + (month - 1)}]`, 'cost'],
            key: `plan-measure-cost-prices-${yearSelected}-${month}`,
            width: 150,
            render: (id: number, item: PlanMeasureCost, index: number) => {
              const indexById = item.prices?.findIndex(
                (x) => x.yearOfOccurrence == year && x.monthOfOccurrence == month
              )
              if (indexById == undefined || indexById < 0) return null
              return {
                children: (
                  <InputNumber
                    disabled={!editable}
                    key={`key-${item.id}-${month}-${id}-${index}`}
                    style={{
                      ...inputStyle.normal,
                      width: '100%',
                      color:
                        ((item.prices && item.prices[indexById].cost) || 0) >= 0
                          ? '#000000'
                          : '#FF0000',
                      textAlignLast: 'right',
                      paddingRight: '15px',
                    }}
                    maxLength={18} //Set max length 18(14digit) because max value of bigint is 9007199254740991(16 digit)
                    formatter={(value) => {
                      if (value == undefined) return ''
                      const valueSpl = value.toString().split('.')
                      if (valueSpl.length > 1) {
                        let suffix = valueSpl.slice(1, valueSpl.length).join('')
                        if (suffix.length > costPriceUnit.digitLength + 1) {
                          suffix = suffix.substr(0, costPriceUnit.digitLength + 1)
                        }
                        return `${`${valueSpl[0]}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${suffix}`
                      } else {
                        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    parser={(value): any => {
                      if (value == undefined) return ''
                      const valueSpl = value.split('.')
                      let valueFormat = ''
                      if (valueSpl.length > 1) {
                        let suffix = valueSpl.slice(1, valueSpl.length).join('')
                        if (suffix.length > costPriceUnit.digitLength + 1) {
                          suffix = suffix.substr(0, costPriceUnit.digitLength + 1)
                        }
                        valueFormat = `${`${valueSpl[0]}`.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ','
                        )}.${suffix}`
                      } else {
                        valueFormat = `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      return valueFormat.replace(/\$\s?|(,*)/g, '')
                    }}
                    value={(item.prices && item.prices[indexById].cost) || undefined}
                    onChange={(value) =>
                      onChangeInputNumber(
                        value,
                        item.id || 0,
                        item.prices[indexById].id || 0,
                        item.prices[indexById].tempId
                      )
                    }
                  />
                ),
                // P2FW-739
                props: {
                  style: {
                    ...renderBGColorOfColumnByMonth(month),
                  },
                },
              }
            },
          })
        }
        columnsTemp.splice(indexYear, 1, {
          title: (
            <>
              <Typography.Text
                ellipsis={true}
                style={{ float: 'left', paddingLeft: '20px', lineHeight: '44px' }}
              >
                {yearSelected.startYear}
                {labelConfig.year}
              </Typography.Text>
              <Button
                style={{ float: 'left' }}
                type={'text'}
                size={'small'}
                onClick={() => {
                  onClickYearColumn(yearSelected, 1)
                }}
              >
                年度累計
              </Button>
            </>
          ),
          key: keyExtend,
          dataIndex: 'prices',
          colSpan: 12,
          children: childColumns,
          render: (id: number, item: PlanMeasureCost, index: string | number) => ({
            children: (
              <FormItem
                pageId={PAGE_ID}
                itemId={'prices'}
                key={`column-prices-${index}-${id}-${item.id}`}
                style={inputStyle.formItem}
              >
                <Input style={inputStyle.normal} disabled={!editable} />
              </FormItem>
            ),
          }),
        })
      }
      setColumnProps([...columnsTemp])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editable, costPriceUnit]
  )

  //This function handle change price by month and year
  const onChangeInputNumber = useCallback(
    (
      value: number | string | undefined,
      costId: number,
      priceId: number,
      tempId?: string
    ): void => {
      if (!priceId && !tempId) return
      const indexItem = costsTemp.findIndex((x) => x.id == costId)
      if (indexItem < 0) return
      const indexPrice = costsTemp[indexItem].prices?.findIndex(
        (x) => (priceId && x.id == priceId) || (tempId && x.tempId == tempId)
      )
      if (indexPrice == undefined || indexPrice < 0) return
      costsTemp[indexItem].prices[indexPrice].cost =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value == '' || value == null ? 0 : (value as any)
      setCosts([...costsTemp])
      if (!unsaved) setUnsaved(true)
    },
    [setCosts, unsaved, setUnsaved]
  )

  const onClickRemoveButton = (id: PlanMeasureCost['id']): void => {
    if (!id) return
    setDeleteId(id)
    setVisibleDeleteConfirm(true)
  }

  /**
   * Remove an item in array function
   * @param id -> id of item remove
   */
  const onRemoveCost = async (): Promise<void> => {
    if (!deleteId) return
    _.remove(costsTemp, (x) => x.id === deleteId)
    setCosts([...costsTemp])
    if (!unsaved) setUnsaved(true)
    setVisibleDeleteConfirm(false)
    setDeleteId(undefined)
  }

  const onCancelRemove = (): void => {
    setDeleteId(undefined)
    setVisibleDeleteConfirm(false)
  }

  /**
   * When call this function, modal add or update measure Cost is displayed
   * @param item -> value of row in table
   */
  const showPopup = (item?: PlanMeasureCost): void => {
    //If the item is not null, set item to update, otherwise add a new one
    if (item) {
      //Set account labor value
      setAccountTitleSelected(item.accountTitle)

      //Set default userDpm values
      const defaultUserDepartmentsTemp: CostAssignSelected[] = []
      const defaultDepartmentsTemp: CostAssignSelected[] = []
      item.assigns?.map((pMRA: PlanMeasureAssign) => {
        if (pMRA.costTI) {
          defaultUserDepartmentsTemp.push({
            id: pMRA.id,
            costId: pMRA.costTI.id,
            objectId: pMRA.costTI?.userDpm?.id || 0,
            userId: pMRA.costTI?.userDpm?.user.id || 0,
            departmentId: pMRA.costTI?.userDpm?.department.id || 0,
            userName: pMRA.costTI?.userDpm?.user.name || '',
            departmentName: pMRA.costTI?.userDpm?.department.name || '',
            version: pMRA.version,
          })
        }
        if (pMRA.costTD) {
          defaultDepartmentsTemp.push({
            id: pMRA.id,
            costId: pMRA.costTD.id,
            objectId: pMRA.costTD.department?.id || 0,
            userId: 0,
            departmentId: pMRA.costTD.department?.id || 0,
            userName: '',
            departmentName: pMRA.costTD.department?.name || '',
            version: pMRA.version,
            costTDversion: pMRA.costTD?.version,
          })
        }
      })
      setDefaultDepartment([...defaultDepartmentsTemp])
      setDepartmentsSelected([...defaultDepartmentsTemp])
      setDefaultUserDepartment([...defaultUserDepartmentsTemp])
      setUserDepartmentsSelected([...defaultUserDepartmentsTemp])
      //Set default list user department name label
      setDefaultUserDepartmentLabel(
        renderCostRecordDestination(item.assigns?.filter((item: PlanMeasureAssign) => item.costTI))
      )
      //Set default list department name label
      setDefaultDepartmentLabel(
        renderCostRecordDestination(item.assigns?.filter((item: PlanMeasureAssign) => item.costTD))
      )

      //Set form default value
      form.setFieldsValue({
        id: item.id,
        item: item.item,
        costRecordingDestination: renderCostRecordDestination(item.assigns),
        costRecordingDestinationNotLaborCost: renderCostRecordDestination(item.assigns),
        accountTitle: item.accountTitle,
        effectIncDec: item.effectIncDec,
      })
    }

    //Show popup
    setVisibleAddCost(true)
  }

  /**
   * Save change function
   */
  const onSave = (): void => {
    //Here form.submit() validate form and call function onFinish
    form.submit()
  }

  /**
   * Cancel change function
   */
  const onCancel = (): void => {
    hidePopup()
  }

  /**
   * resetUserAndDepartment function
   * -> Reset all state User and Department selected
   */
  const resetUserAndDepartment = (): void => {
    //Reset all department state
    setDefaultDepartmentLabel('')
    setDefaultDepartment([])
    setDepartmentsSelected([])
    setFlagHasChangeDepartment(false)

    //Reset all user department state
    setDefaultUserDepartmentLabel('')
    setDefaultUserDepartment([])
    setUserDepartmentsSelected([])
    setFlagHasChangeUserDepartment(false)
  }

  /**
   * Hide popup and reset value form function
   */
  const hidePopup = (): void => {
    //Set account selected as default
    setAccountTitleSelected(defaultAccountTitle)
    //Reset all state User and Department selected
    resetUserAndDepartment()
    //Reset form
    form.resetFields()
    //Hide modal add or update
    setVisibleAddCost(false)
  }

  /**
   * Handle submit form function
   */
  const onFinish = async (): Promise<void> => {
    //Get all input from form
    const formInput = form.getFieldsValue()
    //Get list cost assign by user and department selected
    const planMeasureCostAssigns: PlanMeasureAssign[] =
      [...(departmentsSelected || []), ...(userDepartmentsSelected || [])]?.map(
        (item): PlanMeasureAssign => {
          if (item.userId) {
            const assignUserDepartment: PlanMeasureAssign = {
              id: item.id,
              version: item.version,
              costTI: {
                id: item.costId,
                userDpm: {
                  id: item.objectId || 0,
                  user: {
                    id: 0,
                    userId: item.userId,
                    name: item.userName || '',
                    loginId: '',
                  },
                  department: {
                    id: 0,
                    code: '',
                    name: item.departmentName || '',
                  },
                },
              },
            }
            if (!item.id) {
              delete assignUserDepartment.id
              delete assignUserDepartment.version
            }
            if (!item.costId) delete assignUserDepartment.costTI?.id
            return assignUserDepartment
          } else {
            const assignDepartment: PlanMeasureAssign = {
              id: item.id,
              version: item.version,
              costTD: {
                id: item.costId,
                version: item.costTDversion,
                department: {
                  id: item.objectId || 0,
                  code: '0',
                  name: item.departmentName || '',
                },
              },
            }

            if (!assignDepartment.id) {
              delete assignDepartment.id
              delete assignDepartment.version
            }
            if (!assignDepartment.costTD?.id) {
              delete assignDepartment.costTD?.id
              delete assignDepartment.costTD?.version
            }
            return assignDepartment
          }
        }
      ) || []
    //Check update or add new item, if has id then update else then add new
    if (formInput.id) {
      //Find item index to update, if exist then update, otherwise return
      const itemIdx = costsTemp.findIndex((x) => x.id === formInput.id)
      if (itemIdx < 0) return
      //Copy item to update
      const itemUpdate = { ...costsTemp[itemIdx] }
      //Define Cost input to update
      const updateInput: PlanMeasureCost = {
        id: formInput.id,
        item: formInput.item,
        accountTitle: props.accountTitles.filter((ac) => ac.id === formInput.accountTitle?.id)?.[0],
        effectIncDec: formInput.effectIncDec,
        prices: itemUpdate.prices,
        assigns: [...planMeasureCostAssigns],
        version: itemUpdate.version,
      }
      costsTemp[itemIdx] = { ...updateInput }
      setCosts([...costsTemp])
      message.success(labelConfig.updateSuccess)
    } else {
      //Define new list Cost prices
      const newPlanMeasurePrices = generateDataMonthByNext5Year(nextFiveYears)
      //increment current id
      const nextId = (_.maxBy(costsTemp, (x) => x.id)?.id || 0) + 1
      //Define create plan measure input
      const input: PlanMeasureCost = {
        id: nextId,
        item: formInput.item,
        accountTitle: props.accountTitles.filter((ac) => ac.id === formInput.accountTitle?.id)?.[0],
        effectIncDec: formInput.effectIncDec,
        prices: newPlanMeasurePrices,
        assigns: [...planMeasureCostAssigns],
        isNew: true,
      }
      //Add new plan measure cost to list
      costsTemp.push(input)
      setCosts([...costsTemp])
      message.success(labelConfig.createSuccess)
    }
    hidePopup()
    setUnsaved(true)
  }

  /**
   * Check type account labor when change value account labor function
   * @param accountTitleId -> value of account labor
   */
  const onChangeAccountValue = (accountTitleId: AccountTitle['id']): void => {
    //Clear old cose recording destination
    form.setFieldsValue({
      costRecordingDestination: '',
      costRecordingDestinationNotLaborCost: '',
    })

    setDepartmentsSelected([])
    setUserDepartmentsSelected([])
    setDefaultDepartment([])
    setDefaultUserDepartment([])
    setDefaultDepartmentLabel('')
    setDefaultUserDepartmentLabel('')
    setFlagHasChangeDepartment(false)
    setFlagHasChangeUserDepartment(false)

    setAccountTitleSelected(
      props.accountTitles.filter((accountTitle) => accountTitle?.id === accountTitleId)?.[0]
    )
  }

  const onPriceUnitChange: PriceUnitProps['onChange'] = (_priceUnit, nextPriceUnit) => {
    if (_priceUnit.digitLength != nextPriceUnit.digitLength) {
      const diffDigit = nextPriceUnit.digitLength - _priceUnit.digitLength
      const measureCostTemp = [..._.cloneDeep(costs)]
      measureCostTemp.map((cost) => {
        cost.prices.map((price) => {
          price.cost = toFixed(price.cost * Math.pow(10, -diffDigit), nextPriceUnit.digitLength + 1)
        })
      })
      setCosts([...measureCostTemp])
    }
    // globalCurrentPriceUnit = nextPriceUnit
    setCostPriceUnit(nextPriceUnit)
  }
  // const [currentPriceUnit, setCurrentPriceUnit] = useState<PriceUnit>(priceUnits[0])
  // const { data: defaultPriceUnit } = useQuery<FindPriceUnit>(FIND_PRICE_UNIT)
  // useEffect(() => {
  //   if (defaultPriceUnit) {
  //     setCurrentPriceUnit(
  //       priceUnits.filter(
  //         (priceUnit) => priceUnit.digitLength === defaultPriceUnit.findPriceUnit?.digitLength
  //       )[0]
  //     )
  //   }
  // }, [defaultPriceUnit])

  return (
    <>
      <Layout>
        <Modal.Confirm
          visible={visibleDeleteConfirm}
          onCancel={() => onCancelRemove()}
          okText={labelConfig.deleteCostButton}
          onOk={onRemoveCost}
          // cancelText={labelConfig.close} //P2FW-757
        >
          <Typography.Text>{labelConfig.deleteConfirmText}</Typography.Text>
        </Modal.Confirm>
        <Layout.Content style={{ padding: '2rem', paddingTop: '1rem' }}>
          <Col>
            <Row>
              <Typography.Paragraph>{labelConfig.planMeasureCostSubTitle}</Typography.Paragraph>
            </Row>
            <Row style={{ marginBottom: '20px' }}>
              <Col span={6} style={{ marginTop: 'auto' }}>
                <Button
                  disabled={!editable}
                  type="default"
                  onClick={() => showPopup()}
                  style={{
                    marginTop: 'auto',
                  }}
                >
                  <PlusCircleOutlined />
                  {labelConfig.addCostButton}
                </Button>
              </Col>
              <div style={{ marginLeft: 'auto' }}>
                <div style={{ marginLeft: 'auto' }}>
                  <Row>
                    <div style={{ width: 130 }}>
                      <Typography.Text>単位(人件費):</Typography.Text>
                    </div>
                    <Typography.Text>：人月</Typography.Text>
                  </Row>
                </div>
                <div style={{ marginLeft: 'auto', marginTop: 5, width: '100%' }}>
                  <Row style={{ alignItems: 'center' }}>
                    <div style={{ width: 130 }}>
                      <Typography.Text>単位(人件費以外)</Typography.Text>
                    </div>
                    {costPriceUnit && (
                      <PriceUnits
                        style={{ width: 80 }}
                        onChange={onPriceUnitChange}
                        defaultValue={costPriceUnit.type}
                      />
                    )}
                  </Row>
                </div>
              </div>
            </Row>

            <div>
              <Row onFocus={onTableInputFocus('#costTable')}>
                <PlanMeasureCostTable columnProps={columnProps} costs={[...costs]} />
              </Row>
            </div>
          </Col>
          <Modal.Normal
            visible={visibleAddCost}
            onCancel={onCancel}
            onOk={editable ? onSave : undefined}
            okText="OK"
            cancelText="キャンセル"
            cancelButtonProps={{ type: 'ghost' }}
            width="60%"
            title={labelConfig.dialogTitle}
          >
            <Form
              form={form}
              layout="horizontal"
              validateMessages={{ required: '${name}は必須項目です。入力してください。' }}
              onFinish={onFinish}
            >
              <FormItem pageId={PAGE_ID} itemId={'id'} style={{ display: 'none' }}>
                <Input type={'hidden'} />
              </FormItem>
              <FormItem
                pageId={PAGE_ID}
                itemId={'item'}
                wrapperCol={{ span: 8 }}
                labelCol={{ span: 6 }}
                initialValue={''}
              >
                <Select onKeyDown={skipEnter} size="middle" allowClear={true} disabled={!editable}>
                  {Object.values(PlanMeasureCostItemTypes).map((item, index) => (
                    <Select.Option key={`${item.propertyName}-${index}`} value={item.propertyName}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem
                pageId={PAGE_ID}
                itemId={'effectIncDec'}
                wrapperCol={{ span: 8 }}
                labelCol={{ span: 6 }}
                initialValue={''}
              >
                <Select onKeyDown={skipEnter} size="middle" allowClear={true} disabled={!editable}>
                  {Object.values(PlanMeasureCostIncDecTypes).map((item, index) => (
                    <Select.Option key={`${item.propertyName}-${index}`} value={item.propertyName}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem
                pageId={PAGE_ID}
                itemId={'accountId'}
                name={['accountTitle', 'id']}
                wrapperCol={{ span: 8 }}
                labelCol={{ span: 6 }}
                initialValue={defaultAccountTitle?.id ?? 0}
              >
                <Select
                  onKeyDown={skipEnter}
                  size="middle"
                  allowClear={false}
                  onSelect={(accountTitleId: AccountTitle['id']) =>
                    onChangeAccountValue(accountTitleId)
                  }
                  disabled={!editable}
                >
                  {props.accountTitles.map((item, index) => (
                    <Select.Option key={`${item.name}-${index}`} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </FormItem>
              <Col span={24}>
                <Row>
                  <Col span={14}>
                    {(accountTitleSelected?.type === 'laborCost' && (
                      <FormItem
                        pageId={PAGE_ID}
                        itemId={'costRecordingDestination'}
                        wrapperCol={{ span: 14 }}
                        labelCol={{ span: 10, style: { marginRight: '1%' } }}
                      >
                        <Input.TextArea
                          size="middle"
                          disabled
                          style={{ maxLines: 5, minHeight: 120 }}
                        />
                      </FormItem>
                    )) || (
                      <FormItem
                        pageId={PAGE_ID}
                        itemId={'costRecordingDestinationNotLaborCost'}
                        wrapperCol={{ span: 14 }}
                        labelCol={{ span: 10, style: { marginRight: '1%' } }}
                      >
                        <Input.TextArea
                          size="middle"
                          disabled
                          style={{ maxLines: 5, minHeight: 120 }}
                        />
                      </FormItem>
                    )}
                  </Col>
                  <Col>
                    <Button
                      type="default"
                      onClick={() => {
                        setVisibleCostRecordingDestination(true)
                      }}
                      style={{ marginLeft: 5 }}
                      disabled={!editable}
                    >
                      一覧から選択
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Form>
          </Modal.Normal>
          <ChargeSelectModal
            isFromMeasure={true}
            measureAccountTitle={accountTitleSelected}
            selectType="checkbox"
            visible={visibleCostRecordingDestination}
            defaultDepartmentValues={defaultDepartments?.map((x) => x.objectId || 0)}
            defaultUserValues={defaultUserDepartments?.map((x) => x.objectId || 0)}
            setFlagHasChangeUserDepartment={setFlagHasChangeUserDepartment}
            setFlagHasChangeDepartment={setFlagHasChangeDepartment}
            onSelected={(rows) => {
              let targetNameUser = ''
              let targetNameDepartment = ''
              if (rows.user && flagHasChangeUserDepartment) {
                const userDepartmentsOld: CostAssignSelected[] =
                  (userDepartmentsSelected &&
                    userDepartmentsSelected.length > 0 && [...userDepartmentsSelected]) ||
                  (defaultUserDepartments &&
                    defaultUserDepartments.length > 0 && [...defaultUserDepartments]) ||
                  []
                const userDepartmentsTemp: CostAssignSelected[] = []
                rows.user.map((item) => {
                  //Casting user item to UserTableRow
                  const itemTypeUserTable = item as UserTableRow
                  const oldUserDepartmentByItem:
                    | CostAssignSelected
                    | undefined = userDepartmentsOld?.find(
                    (x) => x.objectId == itemTypeUserTable.id
                  )
                  userDepartmentsTemp.push({
                    id: oldUserDepartmentByItem?.id || undefined,
                    costId: oldUserDepartmentByItem?.costId || undefined,
                    objectId: itemTypeUserTable.id,
                    userName: itemTypeUserTable.name,
                    departmentName: itemTypeUserTable.department,
                    userId: itemTypeUserTable.userId,
                    departmentId: itemTypeUserTable.departmentId,
                    version: oldUserDepartmentByItem?.version,
                  })
                  targetNameUser += `${itemTypeUserTable.department}/${itemTypeUserTable.name}\n`
                })
                setDefaultUserDepartmentLabel(targetNameUser)
                setUserDepartmentsSelected([...userDepartmentsTemp])
                setDefaultUserDepartment([...userDepartmentsTemp])
                setFlagHasChangeUserDepartment(false)
              } else if (defaultUserDepartments && !flagHasChangeUserDepartment) {
                targetNameUser += defaultUserDepartmentsLabel
                setUserDepartmentsSelected([...defaultUserDepartments])
                setFlagHasChangeUserDepartment(false)
              } else {
                setDefaultUserDepartment([])
                setUserDepartmentsSelected([])
                setFlagHasChangeUserDepartment(false)
              }

              if (rows.department && flagHasChangeDepartment) {
                const departmentsOld: CostAssignSelected[] =
                  (departmentsSelected &&
                    departmentsSelected.length > 0 && [...departmentsSelected]) ||
                  (defaultDepartments &&
                    defaultDepartments.length > 0 && [...defaultDepartments]) ||
                  []

                const departmentSelectedsTemp: CostAssignSelected[] = []
                //Casting department item to DepartmentTableRow
                rows.department.map((item) => {
                  const itemTypeDepartmentTable = item as DepartmentTableRow
                  const oldDepartmentByItem: CostAssignSelected | undefined = departmentsOld?.find(
                    (x) => x.objectId == itemTypeDepartmentTable.id
                  )
                  departmentSelectedsTemp.push({
                    id: oldDepartmentByItem?.id || undefined,
                    costId: oldDepartmentByItem?.costId || undefined,
                    objectId: itemTypeDepartmentTable.id,
                    departmentName: itemTypeDepartmentTable.name,
                    departmentId: itemTypeDepartmentTable.id,
                    version: oldDepartmentByItem?.version,
                    costTDversion: oldDepartmentByItem?.costTDversion,
                  })
                  targetNameDepartment += itemTypeDepartmentTable.name + '\n'
                })
                setDefaultDepartmentLabel(targetNameDepartment)
                setDepartmentsSelected([...departmentSelectedsTemp])
                setDefaultDepartment([...departmentSelectedsTemp])
                setFlagHasChangeDepartment(false)
              } else if (defaultDepartments && !flagHasChangeDepartment) {
                targetNameDepartment += defaultDepartmentsLabel
                setDepartmentsSelected([...defaultDepartments])
                setFlagHasChangeDepartment(false)
              } else {
                setDefaultDepartment([])
                setDepartmentsSelected([])
                setFlagHasChangeDepartment(false)
                setDefaultDepartmentLabel('')
              }
              if (accountTitleSelected?.type === 'laborCost') {
                form.setFieldsValue({
                  costRecordingDestination: targetNameUser + targetNameDepartment,
                  costRecordingDestinationNotLaborCost: '',
                })
              } else {
                form.setFieldsValue({
                  costRecordingDestinationNotLaborCost: targetNameUser + targetNameDepartment,
                  costRecordingDestination: '',
                })
              }
              setVisibleCostRecordingDestination(false)
            }}
            onCancel={() => setVisibleCostRecordingDestination(false)}
          />
        </Layout.Content>
      </Layout>
    </>
  )
}

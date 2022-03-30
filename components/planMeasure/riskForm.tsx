import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Col, Input, Layout, Row, Select, Typography, Form, InputNumber, message } from 'antd'
import { FormInstance } from 'antd/es/form'
import Table from '../table'
import { ColumnGroupType, ColumnsType, ColumnType } from 'antd/es/table'
import FormItem from '~/components/form/FormItem'
import { displaySetting, RiskTargetType, RiskTargetTypes } from '~/lib/displaySetting'
import Button from '~/components/Button'
import Modal from '~/components/modal'
import { skipEnter } from '~/lib/keyDown'
import ChargeSelectModal from '../charge/chargeSelectModal'
import _ from 'lodash'
import { UserTableRow } from '../user/userSelectTable'
import { DepartmentTableRow } from '../department/departmentSelectTable'
import { PriceUnitProps, PriceUnits } from '../priceUnit'
import { generateDataMonthByNext5Year } from '~/pages/planMeasures/new'
import { toFixed } from '~/lib/number'
import { PlusCircleOutlined } from '@ant-design/icons'
import { renderBGColorOfColumnByMonth } from './planMeasuresTable'

const PAGE_ID = 'measureRiskForm'

//Define type of measure risk props
export type MeasureRiskProps = {
  setShouldRefreshDataRisk: (state: boolean) => void
  setUnsaved: (state: boolean) => void
  setRisks: (data: PlanMeasureRisk[]) => void
  setRiskPriceUnit: (data: PriceUnit) => void
  shouldRefreshDataRisk: boolean
  unsaved: boolean
  risks: PlanMeasureRisk[]
  form: FormInstance
  editable: boolean | undefined
  accountTitles: AccountTitle[]
  nextFiveYears: BusinessYear[]
  riskPriceUnit: PriceUnit
}

//Define type measure risk form props
export type MeasureRiskFormProps = {
  form?: FormInstance
  risks?: Array<PlanMeasureRisk>
  columnProps: ColumnsType<PlanMeasureRisk>
}

//Define type risk assign selected
type RiskAssignSelected = {
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

//Get labor config from display setting
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

//Component PlanMeasureRiskTable, show list plan measure risk
const PlanMeasureRiskTable = (props: MeasureRiskFormProps): JSX.Element => {
  const measureRisk = useMemo(() => (props.risks && props.risks.length ? [...props.risks] : []), [
    props.risks,
  ])
  const columns: ColumnsType<PlanMeasureRisk> = useMemo(
    () => props.columnProps,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.columnProps]
  )
  return (
    <Table
      size={'small'}
      columns={columns}
      dataSource={measureRisk}
      pagination={false}
      rowKey={'id'}
      scroll={{ x: 'max-content' }}
    />
  )
}

//Function render cost record destination label from plan measure risk assign
const renderCostRecordDestination = (pMRAs?: PlanMeasureAssign[]): string => {
  //Check if plan measure risk assign is null or empty then return
  if (!pMRAs || pMRAs.length < 1) return ''

  //Initial label of cost recort destination
  let label = ''

  //Concat label by type of plan measure risk assign
  pMRAs.map((pMRA: PlanMeasureAssign) => {
    if (pMRA && pMRA.costTD) {
      label += (pMRA.costTD?.department?.name || '') + '\n'
    } else if (pMRA && pMRA.costTI) {
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

//Init measure effect risk, use global variable because event in column table not update with useState
let columnsTemp: (ColumnGroupType<PlanMeasureRisk> | ColumnType<PlanMeasureRisk>)[]

//Declare temporary variable for array plan measure risk
let risksTemp: PlanMeasureRisk[] = []

//Declare global var currentUnitPrice, because useState not update new value in table column
// let globalCurrentPriceUnit: PriceUnit = {
//   digitLength: 1,
//   isDefault: true,
//   name: 'yen',
//   type: 'yen',
// }

//Create risk form
export const RiskForm = (props: MeasureRiskProps): JSX.Element => {
  const {
    setUnsaved,
    setRisks,
    setShouldRefreshDataRisk,
    setRiskPriceUnit,
    unsaved,
    risks,
    form,
    shouldRefreshDataRisk,
    editable,
    accountTitles,
    nextFiveYears,
    riskPriceUnit,
  } = props

  //Define risk state
  const [visibleDeleteConfirm, setVisibleDeleteConfirm] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<PlanMeasureRisk['id']>(undefined)
  const defaultAccountTitle = accountTitles?.[0]
  const [accountTitleSelected, setAccountTitleSelected] = useState<AccountTitle | undefined>()
  const [riskTargetSelected, setRiskTargetSelected] = useState<RiskTargetType | undefined>(
    RiskTargetTypes.riskCosts.propertyName
  )
  const [defaultDepartments, setDefaultDepartment] = useState<RiskAssignSelected[] | undefined>([])
  const [defaultUserDepartments, setDefaultUserDepartment] = useState<
    RiskAssignSelected[] | undefined
  >([])
  const [departmentsSelected, setDepartmentsSelected] = useState<RiskAssignSelected[] | undefined>(
    []
  )
  const [userDepartmentsSelected, setUserDepartmentsSelected] = useState<
    RiskAssignSelected[] | undefined
  >([])
  const [defaultUserDepartmentsLabel, setDefaultUserDepartmentLabel] = useState<string>('')
  const [defaultDepartmentsLabel, setDefaultDepartmentLabel] = useState<string>('')
  const [flagHasChangeUserDepartment, setFlagHasChangeUserDepartment] = useState<boolean>(false)
  const [flagHasChangeDepartment, setFlagHasChangeDepartment] = useState<boolean>(false)
  const [isEternal, setEternal] = useState<boolean>(true)
  const [visibleAddRisk, setVisibleAddRisk] = useState<boolean>(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [_currentPriceUnit, setCurrentPriceUnit] = useState<PriceUnit>({
  //   name: 'yen',
  //   digitLength: 1,
  //   isDefault: true,
  //   type: 'yen',
  // })
  const [visibleCostRecordingDestination, setVisibleCostRecordingDestination] = useState<boolean>(
    false
  )

  const yearSummaryColumn = (
    targetBusinessYear: BusinessYear
  ): ColumnGroupType<PlanMeasureRisk> | ColumnType<PlanMeasureRisk> => ({
    title: '年度累計',
    dataIndex: targetBusinessYear.startYear,
    key: targetBusinessYear.startYear,
    width: 120,
    render: (id: number, item: PlanMeasureRisk, index: number) => {
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
        riskPriceUnit.digitLength + 1
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

  //This function render next 5 year plan measure risk column
  const renderFiveYearPlanColumn = (
    nextFiveYears: BusinessYear[]
  ): ColumnsType<PlanMeasureRisk> => {
    const fiveYearPlanColumn: ColumnsType<PlanMeasureRisk> = []
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
  const [columnProps, setColumnProps] = useState<ColumnsType<PlanMeasureRisk>>([
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.action}</Typography.Text>,
      key: 'action',
      dataIndex: 'action',
      align: 'center',
      colSpan: 1,
      // fixed: true,
      width: 150,
      render: (id: number, item: PlanMeasureRisk, index: number) => {
        return {
          children: (
            <>
              <Button
                key={`edit-${id}-${item.id}-${index}`}
                style={{ width: 70, marginRight: 10, minHeight: 30 }}
                type={'primary'}
                onClick={() => showPopup(item)}
                disabled={!editable}
              >
                {labelConfig.edit}
              </Button>
              <Button
                key={`remove-${id}-${item.id}-${index}`}
                type={'primary'}
                style={{ width: 70, minHeight: 30 }}
                danger={true}
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
      title: <Typography.Text ellipsis={true}>{labelConfig.risk}</Typography.Text>,
      key: 'riskName',
      dataIndex: 'riskName',
      colSpan: 1,
      rowSpan: 2,
      children: [],
      width: 350,
      render: (riskName: string, item: PlanMeasureRisk, index: number) => {
        return {
          children: (
            <div
              onClick={() => showPopup(item)}
              onKeyDown={skipEnter}
              role="button"
              style={{ textDecoration: 'underline', color: 'rgb(51, 108, 97)' }}
              tabIndex={index}
            >
              <a role="button" href="#">
                {riskName}
              </a>
            </div>
          ),
        }
      },
    },
    // {
    //   title: <Typography.Text ellipsis={true}>{labelConfig.targetType}</Typography.Text>,
    //   key: 'targetType',
    //   dataIndex: 'targetType',
    //   colSpan: 1,
    //   children: [],
    //   width: 150,
    //   render: (id: number, item: PlanMeasureRisk, index: number) => ({
    //     children: (
    //       <div key={`accountTitle-${id}-${index}`}>
    //         {Object.values(RiskTargetTypes).find((x) => x.propertyName === item.targetType)
    //           ?.label || ''}
    //       </div>
    //     ),
    //   }),
    // },
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.account}</Typography.Text>,
      key: 'accountTitle',
      dataIndex: 'accountTitle',
      colSpan: 1,
      children: [],
      width: 150,
      render: (accountTitle: AccountTitle, item: PlanMeasureRisk, index: number) => ({
        children: (
          <div key={`accountTitle-${item.id}-${index}`}>
            {item.targetType == RiskTargetTypes.riskCosts.propertyName
              ? accountTitle?.name ?? ''
              : '売上'}
          </div>
        ),
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
      width: 250,
      render: (id: number, item: PlanMeasureRisk) => {
        return {
          children: (
            <div title={renderCostRecordDestination(item?.assigns) || ''} key={id}>
              {item?.assigns &&
                renderCostRecordDestination((item?.assigns[0] && [item?.assigns[0]]) || [])}
              {item?.assigns && item?.assigns.length > 1 && '…'}
            </div>
          ),
        }
      },
    },
    ...(nextFiveYears.length > 0 ? renderFiveYearPlanColumn(nextFiveYears) : []),
  ])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //This function handle event click to year in header
  const onClickYearColumn = (yearSelected: BusinessYear, keyIndex: number): void => {
    //Set key for column extend
    const keyExtend = yearSelected.id + '-extend'

    //Find index year column
    const indexYear = columnsTemp.findIndex(
      (x: ColumnGroupType<PlanMeasureRisk> | ColumnType<PlanMeasureRisk>) =>
        x.key == yearSelected.startYear
    )

    const indexYearExtend = columnsTemp.findIndex(
      (x: ColumnGroupType<PlanMeasureRisk> | ColumnType<PlanMeasureRisk>) => x.key == keyExtend
    )
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
      const childColumns: (ColumnGroupType<PlanMeasureRisk> | ColumnType<PlanMeasureRisk>)[] = []
      for (let i = yearSelected.startMonth; i < 12 + yearSelected.startMonth; i++) {
        const month = i > 12 ? i % 12 : i
        const year = i > 12 ? yearSelected.year + 1 : yearSelected.year
        childColumns.push({
          title: `${year}${labelConfig.yearLabel}${month}${labelConfig.month}`,
          dataIndex: [`prices[${keyIndex * 12 + (month - 1)}]`, 'cost'],
          key: `plan-measure-risk-prices-${yearSelected}-${month}`,
          width: 150,
          render: (id: number, item: PlanMeasureRisk, index: number) => {
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
                      if (suffix.length > riskPriceUnit.digitLength + 1) {
                        suffix = suffix.substr(0, riskPriceUnit.digitLength + 1)
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
                      if (suffix.length > riskPriceUnit.digitLength + 1) {
                        suffix = suffix.substr(0, riskPriceUnit.digitLength + 1)
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
        render: (id: number, item: PlanMeasureRisk, index: string | number) => ({
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
  }

  //Init value for plan measure risk temporary
  useEffect(() => {
    const dataCopy: PlanMeasureRisk[] = JSON.parse(JSON.stringify(risks))
    risksTemp = [...dataCopy]
  }, [risks])

  //Copy column to column temporary
  useEffect(() => {
    columnsTemp = [...columnProps]
    setEternal(true)
  }, [isEternal, columnProps])

  //Check tab change to refresh plan measure effect risk data
  useEffect(() => {
    if (shouldRefreshDataRisk) {
      const dataCopy: PlanMeasureRisk[] = JSON.parse(JSON.stringify(risks))
      risksTemp = [...dataCopy]
      setShouldRefreshDataRisk(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShouldRefreshDataRisk, shouldRefreshDataRisk])

  /**
   * When call this function, modal add or update measure risk is displayed
   * @param item -> value of row in table
   */
  const showPopup = (item?: PlanMeasureRisk): void => {
    //If the item is not null, set item to update, otherwise add a new one
    if (item && item.id) {
      //Set account labor value
      setAccountTitleSelected(item.accountTitle)
      setRiskTargetSelected(item.targetType)
      //Set default department values
      const defaultUserDepartmentsTemp: RiskAssignSelected[] = []
      const defaultDepartmentsTemp: RiskAssignSelected[] = []
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
        riskName: item.riskName,
        costRecordingDestination: renderCostRecordDestination(item.assigns),
        costRecordingDestinationNotLaborCost: renderCostRecordDestination(item.assigns),
        accountTitle: item.accountTitle,
        targetType: item.targetType,
      })
    } else {
      form.setFieldsValue({
        targetType: RiskTargetTypes.riskCosts.propertyName,
        accountTitle: defaultAccountTitle,
      })
      setAccountTitleSelected(defaultAccountTitle)
      setRiskTargetSelected(RiskTargetTypes.riskCosts.propertyName)
    }
    //Show popup
    setVisibleAddRisk(true)
  }

  /**
   * This function does hide popup and reset value form
   */
  const hidePopup = (): void => {
    //Reset all user and department selected
    resetAllUserAndDepartment()
    //Set account labor as default
    setAccountTitleSelected(defaultAccountTitle)
    setRiskTargetSelected(RiskTargetTypes.riskCosts.propertyName)
    //Reset form
    form.resetFields()
    //Hide popup
    setVisibleAddRisk(false)
  }

  /**
   * resetUserAndDepartment function
   * -> Reset all state User and Department selected
   */
  const resetAllUserAndDepartment = (): void => {
    //Reset department state
    setDefaultDepartmentLabel('')
    setDefaultDepartment([])
    setDepartmentsSelected([])
    setFlagHasChangeDepartment(false)

    //Reset user department state
    setDefaultUserDepartmentLabel('')
    setDefaultUserDepartment([])
    setUserDepartmentsSelected([])
    setFlagHasChangeUserDepartment(false)
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
   * Handle submit form function
   */
  const onFinish = async (): Promise<void> => {
    //Get all input from form
    const formInput = form.getFieldsValue()
    //Copy list measure risk
    const measureRiskTemp = [...risks]
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
            if (!item.id) delete assignUserDepartment.id
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
      const itemIdx = measureRiskTemp.findIndex((x) => x.id === formInput.id)
      if (itemIdx < 0) return
      //Copy item to update
      const itemUpdate = { ...measureRiskTemp[itemIdx] }
      //Define risk input to update
      const updateInput: PlanMeasureRisk = {
        id: formInput.id,
        riskName: formInput.riskName,
        accountTitle: accountTitles.filter((ac) => ac.id === formInput.accountTitle?.id)?.[0],
        prices: itemUpdate.prices,
        assigns: [...planMeasureCostAssigns],
        targetType: formInput.targetType,
        version: itemUpdate.version,
      }
      //Start update risk
      measureRiskTemp[itemIdx] = { ...updateInput }
      setRisks([...measureRiskTemp])
      message.success(labelConfig.updateSuccess)
    } else {
      //increment current id
      const nextId = (_.maxBy(risksTemp, (x) => x.id)?.id || 0) + 1
      //Define new list risk prices
      const newPlanMeasurePrices = generateDataMonthByNext5Year(nextFiveYears)
      //Define create plan measure input
      const input: PlanMeasureRisk = {
        id: nextId,
        riskName: formInput.riskName,
        accountTitle: accountTitles.filter((ac) => ac.id === formInput.accountTitle?.id)?.[0],
        prices: newPlanMeasurePrices,
        assigns: [...planMeasureCostAssigns],
        isNew: true,
        targetType: formInput.targetType,
      }

      //Add new plan measure risk to list
      measureRiskTemp.push(input)
      setRisks([...measureRiskTemp])
      message.success(labelConfig.createSuccess)
    }
    setUnsaved(true)
    hidePopup()
  }

  const onChangeInputNumber = useCallback(
    (
      value: number | string | undefined,
      riskId: number,
      priceId: number,
      tempId?: string
    ): void => {
      if (!priceId && !tempId) return
      const indexItem = risksTemp.findIndex((x) => x.id == riskId)
      if (indexItem < 0) return
      const indexPrice = risksTemp[indexItem].prices?.findIndex(
        (x) => (priceId && x.id == priceId) || (tempId && x.tempId == tempId)
      )
      if (indexPrice == undefined || indexPrice < 0) return
      risksTemp[indexItem].prices[indexPrice].cost =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value == '' || value == null ? 0 : (value as any)
      setRisks([...risksTemp])
      if (!unsaved) setUnsaved(true)
    },
    [setRisks, unsaved, setUnsaved]
  )

  const onClickRemoveButton = (id: PlanMeasureRisk['id']): void => {
    if (!id) return
    setDeleteId(id)
    setVisibleDeleteConfirm(true)
  }

  const onCancelRemove = (): void => {
    setDeleteId(undefined)
    setVisibleDeleteConfirm(false)
  }

  /**
   * Remove an item in array function
   * @param id -> id of item remove
   */
  const onRemoveRisk = async (): Promise<void> => {
    _.remove(risksTemp, (x) => x.id === deleteId)
    setRisks([...risksTemp])
    setDeleteId(undefined)
    setVisibleDeleteConfirm(false)
    if (!unsaved) setUnsaved(true)
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
    resetAllUserAndDepartment()
    setAccountTitleSelected(
      accountTitles.filter((accountTitle) => accountTitle?.id === accountTitleId)?.[0]
    )
  }

  const onChangeTargetValue = (riskTarget: RiskTargetType): void => {
    form.setFieldsValue({
      costRecordingDestination: '',
      costRecordingDestinationNotLaborCost: '',
      accountTitle: undefined,
    })
    resetAllUserAndDepartment()
    setRiskTargetSelected(riskTarget)
    setAccountTitleSelected(undefined)
  }

  const onPriceUnitChange: PriceUnitProps['onChange'] = (_priceUnit, nextPriceUnit) => {
    if (_priceUnit.digitLength != nextPriceUnit.digitLength) {
      const diffDigit = nextPriceUnit.digitLength - _priceUnit.digitLength
      const measureRiskTemp = [..._.cloneDeep(risks)]
      measureRiskTemp.map((risk) => {
        risk.prices.map((price) => {
          price.cost = toFixed(price.cost * Math.pow(10, -diffDigit), nextPriceUnit.digitLength + 1)
        })
      })
      setRisks([...measureRiskTemp])
    }
    // globalCurrentPriceUnit = nextPriceUnit
    setRiskPriceUnit(nextPriceUnit)
  }

  return (
    <>
      <Layout>
        <Modal.Confirm
          visible={visibleDeleteConfirm}
          onCancel={() => onCancelRemove()}
          okText={labelConfig.deleteCostButton}
          onOk={onRemoveRisk}
          // cancelText={labelConfig.close} //P2FW-757
        >
          <Typography.Text>{labelConfig.deleteConfirmText}</Typography.Text>
        </Modal.Confirm>
        <Layout.Content style={{ padding: '2rem', paddingTop: '1rem' }}>
          <Col>
            <Row>
              <Typography.Paragraph>{labelConfig.riskSubTitle}</Typography.Paragraph>
            </Row>
            <Row style={{ marginBottom: '20px' }}>
              <Col span={6} style={{ marginTop: 'auto' }}>
                <Button
                  type={'default'}
                  onClick={() => showPopup()}
                  style={{
                    marginTop: 'auto',
                  }}
                  disabled={!editable}
                >
                  <PlusCircleOutlined />
                  {labelConfig.addRiskButton}
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
                    ：
                    {riskPriceUnit && (
                      <PriceUnits
                        style={{ width: 80 }}
                        onChange={onPriceUnitChange}
                        defaultValue={riskPriceUnit.type}
                      />
                    )}
                  </Row>
                </div>
              </div>
            </Row>

            <div className={'measure-risk-table'}>
              <Row>
                <PlanMeasureRiskTable columnProps={columnProps} risks={[...risks]} />
              </Row>
            </div>
          </Col>
          <Modal.Normal
            visible={visibleAddRisk}
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
              <FormItem
                key={`risk-name-input`}
                pageId={PAGE_ID}
                itemId={'riskName'}
                labelCol={{ span: 6 }}
              >
                <Input onKeyDown={skipEnter} disabled={!editable} />
              </FormItem>
              <FormItem
                pageId={PAGE_ID}
                itemId={'targetType'}
                wrapperCol={{ span: 8 }}
                labelCol={{ span: 6 }}
                initialValue={''}
              >
                <Select
                  onKeyDown={skipEnter}
                  size="middle"
                  allowClear={true}
                  disabled={!editable}
                  onSelect={(riskTarget: RiskTargetType) => onChangeTargetValue(riskTarget)}
                >
                  {Object.values(RiskTargetTypes).map((item, index) => (
                    <Select.Option key={`${item.propertyName}-${index}`} value={item.propertyName}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </FormItem>
              {riskTargetSelected !== RiskTargetTypes.RiskSales.propertyName && (
                <FormItem
                  pageId={PAGE_ID}
                  itemId={'accountLabor'}
                  name={['accountTitle', 'id']}
                  wrapperCol={{ span: 8 }}
                  labelCol={{ span: 6 }}
                  initialValue={undefined}
                  itemRequired={riskTargetSelected == RiskTargetTypes.riskCosts.propertyName}
                >
                  <Select
                    onKeyDown={skipEnter}
                    size="middle"
                    allowClear={true}
                    onSelect={(accountTitleId: AccountTitle['id']) =>
                      onChangeAccountValue(accountTitleId)
                    }
                    disabled={!editable}
                  >
                    {accountTitles.map((accountTitle, index) => (
                      <Select.Option key={`${accountTitle.name}-${index}`} value={accountTitle?.id}>
                        {accountTitle.name}
                      </Select.Option>
                    ))}
                  </Select>
                </FormItem>
              )}
              <FormItem pageId={PAGE_ID} itemId={'id'} style={{ display: 'none' }}>
                <Input type={'hidden'} disabled={!editable} />
              </FormItem>
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
                <Col style={{ paddingLeft: '5px' }}>
                  <Button
                    type={'default'}
                    onClick={() => {
                      setVisibleCostRecordingDestination(true)
                    }}
                    disabled={!editable}
                  >
                    一覧から選択
                  </Button>
                </Col>
              </Row>
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
            disabled={!editable}
            onSelected={(rows) => {
              let targetNameUser = ''
              let targetNameDepartment = ''
              if (rows.user && flagHasChangeUserDepartment) {
                const userDepartmentsOld: RiskAssignSelected[] =
                  (userDepartmentsSelected &&
                    userDepartmentsSelected.length > 0 && [...userDepartmentsSelected]) ||
                  (defaultUserDepartments &&
                    defaultUserDepartments.length > 0 && [...defaultUserDepartments]) ||
                  []
                const userDepartmentsTemp: RiskAssignSelected[] = []
                rows.user.map((item) => {
                  //Casting user item to UserTableRow
                  const itemTypeUserTable = item as UserTableRow
                  const oldUserDepartmentByItem:
                    | RiskAssignSelected
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
                const departmentsOld: RiskAssignSelected[] =
                  (departmentsSelected &&
                    departmentsSelected.length > 0 && [...departmentsSelected]) ||
                  (defaultDepartments &&
                    defaultDepartments.length > 0 && [...defaultDepartments]) ||
                  []

                const departmentSelectedsTemp: RiskAssignSelected[] = []
                //Casting department item to DepartmentTableRow
                rows.department.map((item) => {
                  const itemTypeDepartmentTable = item as DepartmentTableRow
                  const oldDepartmentByItem: RiskAssignSelected | undefined = departmentsOld?.find(
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

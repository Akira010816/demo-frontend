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
  Radio,
  Space,
  InputNumber,
  message,
} from 'antd'
import { FormInstance } from 'antd/es/form'
import Table from '../table'
import { ColumnGroupType, ColumnsType, ColumnType } from 'antd/es/table'
import FormItem from '~/components/form/FormItem'
import {
  displaySetting,
  KPITypes,
  TaskCostRecordingDestinationTypes,
  KPIPeriodTypes,
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

const PAGE_ID = 'planMeasureTaskForm'

export type registrationTaskTableProps = {
  form?: FormInstance
  tasks?: Array<PlanMeasureTask>
  columnProps: ColumnsType<PlanMeasureTask>
}

type PlanMeasureTaskProps = {
  setShouldRefreshDataTask: (state: boolean) => void
  setUnsaved: (state: boolean) => void
  setTasks: (data: PlanMeasureTask[]) => void
  setTaskPriceUnit: (data: PriceUnit) => void
  shouldRefreshDataTask: boolean
  unsaved: boolean
  tasks: PlanMeasureTask[]
  form: FormInstance
  editable: boolean | undefined
  accountTitles: AccountTitle[]
  nextFiveYears: BusinessYear[]
  taskPriceUnit: PriceUnit
}

//Define type task assign selected
type TaskAssignSelected = {
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

//Component RegistrationTaskTable, show list measure effect task
const RegistrationTaskTable = (props: registrationTaskTableProps): JSX.Element => {
  const { columnProps, tasks } = props
  const planMeasureTask = useMemo(() => (tasks && tasks.length ? [...tasks] : []), [tasks])
  const columns: ColumnsType<PlanMeasureTask> = useMemo(() => columnProps, [columnProps])
  return (
    <Table
      id={'registrationTaskTable'}
      size={'small'}
      columns={[...columns]}
      dataSource={[...planMeasureTask]}
      pagination={false}
      rowKey={'id'}
      scroll={{ x: 'max-content' }}
      showFullWithAddble={true}
    />
  )
}

//Function render cost record destination label from plan measure task assign
const renderCostRecordDestination = (assign?: PlanMeasureAssign[]): string => {
  //Check if plan measure task assign is null or empty then return
  if (!assign || assign.length < 1) return ''
  //Initial label of cost record destination
  let label = ''
  //Concat label by type of plan measure task assign
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

//Declare global var currentUnitPrice, because useState not update new value in table column
// let globalCurrentPriceUnit: PriceUnit = {
//   digitLength: 1,
//   isDefault: true,
//   name: 'yen',
//   type: 'yen',
// }
//Init measure effect task columns, use global variable because event in column table not update new useState
let columnsTemp: (ColumnGroupType<PlanMeasureTask> | ColumnType<PlanMeasureTask>)[]

let tasksTemp: PlanMeasureTask[] = []

//Define measure effect task form
export const PlanMeasureTaskForm = (props: PlanMeasureTaskProps): JSX.Element => {
  const {
    setShouldRefreshDataTask,
    setTasks,
    setUnsaved,
    setTaskPriceUnit,
    form,
    shouldRefreshDataTask,
    tasks,
    unsaved,
    editable,
    accountTitles,
    nextFiveYears,
    taskPriceUnit,
  } = props

  const [visibleDeleteConfirm, setVisibleDeleteConfirm] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<PlanMeasureTask['id']>(undefined)
  const [visibleAddRegistrationTask, setVisibleAddRegistrationTask] = useState<boolean>(false)
  const [isEternal, setEternal] = useState<boolean>(true)
  const [visibleResponsiblePerson, setVisibleResponsiblePerson] = useState<boolean>(false)
  const defaultAccountTitle = accountTitles?.[0]
  const [accountTitleSelected, setAccountTitleSelected] = useState<AccountTitle | undefined>(
    defaultAccountTitle
  )
  const [kpiTypeSelected, setKPITypeSelected] = useState<KPIType>(KPITypes.effect.propertyName)
  const [defaultUserDepartmentsLabel, setDefaultUserDepartmentLabel] = useState<string>('')
  const [departmentsSelected, setDepartmentsSelected] = useState<TaskAssignSelected[] | undefined>(
    []
  )
  const [defaultDepartmentsLabel, setDefaultDepartmentLabel] = useState<string>('')
  const [userDepartmentsSelected, setUserDepartmentsSelected] = useState<
    TaskAssignSelected[] | undefined
  >([])
  const [flagHasChangeDepartment, setFlagHasChangeDepartment] = useState<boolean>(false)
  const [flagHasChangeUserDepartment, setFlagHasChangeUserDepartment] = useState<boolean>(false)
  const [defaultDepartments, setDefaultDepartment] = useState<TaskAssignSelected[] | undefined>([])
  const [defaultUserDepartments, setDefaultUserDepartment] = useState<
    TaskAssignSelected[] | undefined
  >([])

  const yearSummaryColumn = (
    targetBusinessYear: BusinessYear
  ): ColumnGroupType<PlanMeasureTask> | ColumnType<PlanMeasureTask> => ({
    title: '年度累計',
    dataIndex: targetBusinessYear.startYear,
    key: targetBusinessYear.startYear,
    width: 120,
    render: (id: number, item: PlanMeasureTask, index: number) => {
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
        taskPriceUnit.digitLength + 1
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

  //This function render next 5 year plan measure task column
  const renderFiveYearPlanColumn = (
    nextFiveYears: BusinessYear[]
  ): ColumnsType<PlanMeasureTask> => {
    const fiveYearPlanColumn: ColumnsType<PlanMeasureTask> = []
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
  const [columnProps, setColumnProps] = useState<ColumnsType<PlanMeasureTask>>([
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.action}</Typography.Text>,
      key: 'action',
      dataIndex: 'action',
      align: 'center',
      colSpan: 1,
      fixed: false,
      width: 150,
      render: (id: number, item: PlanMeasureTask, index: number) => {
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
                key={`remove-btn-${id}-${index}`}
                type="primary"
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
      title: <Typography.Text ellipsis={true}>{labelConfig.taskName}</Typography.Text>,
      key: 'task',
      dataIndex: 'task',
      colSpan: 1,
      rowSpan: 2,
      children: [],
      width: 135,
      fixed: false,
      render: (id: number, item: PlanMeasureTask, index: number) => {
        return {
          children: (
            <div
              key={`task-${id}-${index}`}
              onClick={() => showPopup(item)}
              onKeyDown={skipEnter}
              role="button"
              style={{
                textDecoration: 'underline',
                color: 'rgb(51, 108, 97)',
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'inline-block',
                whiteSpace: 'nowrap',
              }}
              title={item.taskName}
              tabIndex={index}
            >
              <a role="button" href="#">
                {item.taskName}
              </a>
            </div>
          ),
        }
      },
    },
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.accountId}</Typography.Text>,
      key: 'accountTitle',
      dataIndex: 'accountTitle',
      colSpan: 1,
      children: [],
      width: 150,
      fixed: false,
      render: (accountTitle: AccountTitle, item: PlanMeasureTask, index: number) => ({
        children: (
          <div key={`accountId-${accountTitle?.id}-${index}`}>{accountTitle?.name ?? ''}</div>
        ),
      }),
    },
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.responsiblePerson}</Typography.Text>,
      key: 'responsiblePerson',
      dataIndex: 'responsiblePerson',
      colSpan: 1,
      children: [],
      width: 150,
      fixed: false,
      render: (id: number, item: PlanMeasureTask, index: number) => ({
        children: (
          <div
            title={renderCostRecordDestination(item?.assigns) || ''}
            key={`plan-measure-task-rec-${id}-${index}`}
          >
            {item?.assigns &&
              item.assigns.length > 0 &&
              renderCostRecordDestination([item?.assigns[0]])}
            {item?.assigns && item?.assigns.length > 1 && '…'}
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
      width: 150,
      fixed: false,
      render: (id: number, item: PlanMeasureTask, index: number) => ({
        children: (
          <div key={`task-rec-${id}-${index}`}>
            {(item.costRecordingDestination &&
              Object.values(TaskCostRecordingDestinationTypes).find(
                (x) => x.propertyName === item.costRecordingDestination
              )?.label) ||
              ''}
          </div>
        ),
      }),
    },
    ...(nextFiveYears && nextFiveYears.length > 0 ? renderFiveYearPlanColumn(nextFiveYears) : []),
  ])

  //Init value for plan measure cost temporary
  useEffect(() => {
    const dataCopy: PlanMeasureTask[] = JSON.parse(JSON.stringify(tasks))
    tasksTemp = [...dataCopy]
  }, [tasks])

  //Check tab change to refresh plan measure task data
  useEffect(() => {
    if (shouldRefreshDataTask) {
      const dataCopy: PlanMeasureTask[] = JSON.parse(JSON.stringify(tasks))
      tasksTemp = [...dataCopy]
      setShouldRefreshDataTask(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShouldRefreshDataTask, shouldRefreshDataTask])

  //Call only once
  useEffect(() => {
    columnsTemp = [...columnProps]
    setEternal(true)
  }, [isEternal, columnProps])

  /**
   * onClick column year function, display extend month of year selected
   * @param yearSelected
   * @param keyIndex -> year selected
   * @returns null
   */
  const onClickYearColumn = (yearSelected: BusinessYear, keyIndex: number): void => {
    //Set key for column extend
    const keyExtend = yearSelected.id + '-extend'
    //Find index year column
    const indexYear = columnsTemp.findIndex(
      (x: ColumnGroupType<PlanMeasureTask> | ColumnType<PlanMeasureTask>) =>
        x.key == yearSelected.startYear
    )
    //If keyIndex not exist, return
    // if (indexYear < 0) return
    //Find index Year extend, if index > -1 then remove column by index, otherwise add new column extend
    const indexYearExtend = columnsTemp.findIndex(
      (x: ColumnGroupType<PlanMeasureTask> | ColumnType<PlanMeasureTask>) => x.key == keyExtend
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
      const childColumns: (ColumnGroupType<PlanMeasureTask> | ColumnType<PlanMeasureTask>)[] = []
      for (let i = yearSelected.startMonth; i < 12 + yearSelected.startMonth; i++) {
        const month = i > 12 ? i % 12 : i
        const year = i > 12 ? yearSelected.year + 1 : yearSelected.year
        childColumns.push({
          title: `${year}${labelConfig.yearLabel}${month}${labelConfig.month}`,
          dataIndex: [`prices[${keyIndex * 12 + (month - 1)}]`, 'cost'],
          key: `plan-measure-task-prices-${yearSelected}-${month}`,
          width: 150,
          render: (id: number, item: PlanMeasureTask, index: number) => {
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
                      if (suffix.length > taskPriceUnit.digitLength + 1) {
                        suffix = suffix.substr(0, taskPriceUnit.digitLength + 1)
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
                      if (suffix.length > taskPriceUnit.digitLength + 1) {
                        suffix = suffix.substr(0, taskPriceUnit.digitLength + 1)
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
        render: (id: number, item: PlanMeasureTask, index: string | number) => ({
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

  const onClickRemoveButton = (id: PlanMeasureTask['id']): void => {
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
  const onRemoveRow = (): void => {
    //Remove item by id
    _.remove(tasksTemp, (x) => x.id === deleteId)
    //Set task tab as unsaved
    if (!unsaved) setUnsaved(true)
    //Set new list to list task
    setTasks([...tasksTemp])
    setVisibleDeleteConfirm(false)
    setDeleteId(undefined)
  }

  /**
   * When call this function, modal add or update measure task is displayed
   * @param item -> value of row in table
   */
  const showPopup = (item?: PlanMeasureTask): void => {
    //If the item is not null, set item to update, otherwise add a new one
    if (item) {
      //Check and update labor accountId type
      setAccountTitleSelected(item.accountTitle)
      setKPITypeSelected(item.kpiType || KPITypes.effect.propertyName)
      //Set default userDpm values
      const defaultUserDepartmentsTemp: TaskAssignSelected[] = []
      const defaultDepartmentsTemp: TaskAssignSelected[] = []
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
        taskName: item.taskName,
        responsiblePerson: renderCostRecordDestination(item.assigns),
        costRecordingDestination: item.costRecordingDestination,
        accountTitle: item.accountTitle,
        kpiType: item.kpiType,
        kpiOther: item.kpiOther,
        kpiThreshold: item.kpiThreshold,
        kpiPeriod: item.kpiPeriod,
      })
    } else {
      //Set default task recording destination choose value
      setAccountTitleSelected(defaultAccountTitle)
      setKPITypeSelected(KPITypes.effect.propertyName)
      form.setFieldsValue({
        id: '',
        task: '',
        accountTitle: defaultAccountTitle,
        responsiblePerson: '',
        costRecordingDestination: TaskCostRecordingDestinationTypes.ownDepartment.propertyName,
        kpiType: null,
        kpiOther: '',
        kpiThreshold: '',
        kpiPeriod: KPIPeriodTypes.monthly.propertyName,
      })
    }
    //Show popup
    setVisibleAddRegistrationTask(true)
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
   * Hide popup and reset value form function
   */
  const hidePopup = (): void => {
    //Set account selected as default
    setAccountTitleSelected(defaultAccountTitle)
    //Reset form
    form.resetFields()
    //Reset all state User and Department selected
    resetAllUserAndDepartment()
    //Hide modal add or update
    setVisibleAddRegistrationTask(false)
  }

  /**
   * Handle submit form function
   */
  const onFinish = (): void => {
    //Get all input from form
    const inputs = form.getFieldsValue()
    //Get list cost assign by user and department selected
    const planMeasureTaskAssigns: PlanMeasureAssign[] =
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
    //Check update or add new item
    if (inputs.id) {
      //Find item index to update, if exist then update, otherwise return
      const itemIdx = tasksTemp.findIndex((x) => x.id === inputs.id)
      if (itemIdx > -1) {
        tasksTemp.splice(itemIdx, 1, {
          ...tasksTemp[itemIdx],
          taskName: inputs.taskName,
          accountTitle: props.accountTitles.filter((ac) => ac.id === inputs.accountTitle?.id)?.[0],
          costRecordingDestination: inputs.costRecordingDestination,
          kpiType: inputs.kpiType,
          kpiOther: inputs.kpiOther,
          kpiThreshold: inputs.kpiThreshold,
          kpiPeriod: inputs.kpiPeriod,
          assigns: [...planMeasureTaskAssigns],
          allocations:
            inputs.costRecordingDestination != TaskCostRecordingDestinationTypes.common.propertyName
              ? []
              : tasksTemp[itemIdx].allocations,
          version: tasksTemp[itemIdx].version,
        })
      }
      message.success(labelConfig.updateSuccess)
    } else {
      //Define new list task prices
      const newPlanMeasurePrices = generateDataMonthByNext5Year(nextFiveYears)
      //increment current id
      const nextId = (_.maxBy(tasksTemp, (x) => x.id)?.id || 0) + 1
      //Push new item to list measure task
      tasksTemp.push({
        id: nextId,
        taskName: inputs.taskName,
        accountTitle: props.accountTitles.filter((ac) => ac.id === inputs.accountTitle?.id)?.[0],
        costRecordingDestination: inputs.costRecordingDestination,
        kpiType: inputs.kpiType,
        kpiOther: inputs.kpiOther,
        kpiThreshold: inputs.kpiThreshold,
        kpiPeriod: inputs.kpiPeriod,
        prices: newPlanMeasurePrices,
        assigns: [...planMeasureTaskAssigns],
        isNew: true,
        allocations: [],
      })
      message.success(labelConfig.createSuccess)
    }
    //Set new list to list measure task
    setTasks(tasksTemp)
    //Set task tab as unsaved
    if (!unsaved) setUnsaved(true)
    //Hide popup and reset form
    hidePopup()
  }

  //This function handle change price by month and year
  const onChangeInputNumber = useCallback(
    (
      value: number | string | undefined,
      taskId: number,
      priceId: number,
      tempId?: string
    ): void => {
      if (!priceId && !tempId) return
      const indexItem = tasksTemp.findIndex((x) => x.id == taskId)
      if (indexItem < 0) return
      const indexPrice = tasksTemp[indexItem].prices?.findIndex(
        (x) => (priceId && x.id == priceId) || (tempId && x.tempId == tempId)
      )
      if (indexPrice == undefined || indexPrice < 0) return
      tasksTemp[indexItem].prices[indexPrice].cost =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value == '' || value == null ? 0 : (value as any)
      setTasks([...tasksTemp])
      if (!unsaved) setUnsaved(true)
    },
    [setTasks, unsaved, setUnsaved]
  )

  /**
   * Check type accountId labor when change value accountId labor function
   * @param accountTitleId -> value of accountId labor
   */
  const onChangeAccountValue = (accountTitleId: AccountTitle['id']): void => {
    //Set val to account selected
    setAccountTitleSelected(
      accountTitles.filter((accountTitle) => accountTitle?.id === accountTitleId)?.[0]
    )
    //Reset all state User and Department selected
    resetAllUserAndDepartment()
    //Clear responsiblePerson field in form
    form.setFieldsValue({
      responsiblePerson: '',
    })
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
   * Check type accountId labor when change value accountId labor function
   * @param val -> value of accountId labor
   */
  const onChangeKPIType = (val: KPIType): void => {
    //Clear old cose recording destination
    setKPITypeSelected(val)
    if (val === KPITypes.schedule.propertyName) {
      form.setFieldsValue({
        kpiThreshold: 'スケジュール通り',
        kpiPeriod: '',
      })
    } else {
      form.setFieldsValue({
        kpiThreshold: '',
        kpiPeriod: KPIPeriodTypes.monthly.propertyName,
      })
    }
  }

  const onPriceUnitChange: PriceUnitProps['onChange'] = (_priceUnit, nextPriceUnit) => {
    if (_priceUnit.digitLength != nextPriceUnit.digitLength) {
      const diffDigit = nextPriceUnit.digitLength - _priceUnit.digitLength
      const measureTaskTemp = [..._.cloneDeep(tasks)]
      measureTaskTemp.map((task) => {
        task.prices.map((price) => {
          price.cost = toFixed(price.cost * Math.pow(10, -diffDigit), nextPriceUnit.digitLength + 1)
        })
      })
      setTasks([...measureTaskTemp])
    }
    //globalCurrentPriceUnit = nextPriceUnit
    setTaskPriceUnit(nextPriceUnit)
  }

  return (
    <Layout>
      <Modal.Confirm
        visible={visibleDeleteConfirm}
        onCancel={() => onCancelRemove()}
        okText={labelConfig.deleteCostButton}
        onOk={onRemoveRow}
        // cancelText={labelConfig.close} // P2FW-757
      >
        <Typography.Text>{labelConfig.deleteConfirmText}</Typography.Text>
      </Modal.Confirm>
      <Layout.Content style={{ padding: '2rem', paddingTop: '1rem' }}>
        <Col>
          <Row>
            <Typography.Paragraph>{labelConfig.registrationTaskSubTitle}</Typography.Paragraph>
          </Row>
          <Row style={{ marginBottom: '20px' }}>
            <Col span={6} style={{ marginTop: 'auto' }}>
              <Button
                type="default"
                onClick={() => showPopup()}
                style={{
                  marginTop: 'auto',
                }}
                disabled={!editable}
              >
                <PlusCircleOutlined />
                {labelConfig.addRegistrationTaskButton}
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
                  {taskPriceUnit && (
                    <PriceUnits
                      style={{ width: 80 }}
                      onChange={onPriceUnitChange}
                      defaultValue={taskPriceUnit.type}
                    />
                  )}
                </Row>
              </div>
            </div>
          </Row>
          <div>
            <Row onFocus={onTableInputFocus('#registrationTaskTable')}>
              <RegistrationTaskTable columnProps={columnProps} tasks={[...tasks]} />
            </Row>
          </div>
        </Col>
        <Modal.Normal
          visible={visibleAddRegistrationTask}
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
              <Input type={'hidden'} disabled={!editable} />
            </FormItem>
            <FormItem
              pageId={PAGE_ID}
              itemId={'taskName'}
              wrapperCol={{ span: 14 }}
              labelCol={{ span: 6 }}
              initialValue={''}
            >
              <Input onKeyDown={skipEnter} disabled={!editable} />
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
                {accountTitles.map((accountTitle, index) => (
                  <Select.Option key={`${accountTitle.name}-${index}`} value={accountTitle?.id}>
                    {accountTitle.name}
                  </Select.Option>
                ))}
              </Select>
            </FormItem>
            <Col span={24}>
              <Row>
                <Col span={14}>
                  <FormItem
                    pageId={PAGE_ID}
                    itemRequired={accountTitleSelected?.type === 'laborCost'}
                    itemId={'responsiblePerson'}
                    wrapperCol={{ span: 14 }}
                    labelCol={{ span: 10, style: { marginRight: '1%' } }}
                  >
                    <Input.TextArea
                      size="middle"
                      disabled
                      style={{ maxLines: 5, minHeight: 120 }}
                    />
                  </FormItem>
                </Col>
                <Col>
                  <Button
                    type="default"
                    onClick={() => {
                      setVisibleResponsiblePerson(true)
                    }}
                    style={{ marginLeft: 5 }}
                    disabled={!editable}
                  >
                    一覧から選択
                  </Button>
                </Col>
              </Row>
            </Col>
            <FormItem
              pageId={PAGE_ID}
              itemId={'costRecordingDestination'}
              labelCol={{ span: 6 }}
              name={'costRecordingDestination'}
            >
              <Radio.Group disabled={!editable}>
                <Space direction="horizontal">
                  {Object.values(TaskCostRecordingDestinationTypes).map((item, index) => (
                    <Radio key={`${item.propertyName}-${index}`} value={item.propertyName}>
                      {item.label}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </FormItem>
            <Col span={24}>
              <Row>
                <Col span={14}>
                  <FormItem
                    pageId={PAGE_ID}
                    itemId={'kpiType'}
                    wrapperCol={{ span: 14 }}
                    labelCol={{ span: 10, style: { marginRight: '1%' } }}
                  >
                    <Select
                      disabled={!editable}
                      onKeyDown={skipEnter}
                      size="middle"
                      allowClear={false}
                      onSelect={(val: KPIType) => {
                        if (!val) return
                        onChangeKPIType(val)
                      }}
                    >
                      {Object.values(KPITypes).map((item, index) => (
                        <Select.Option
                          key={`${item.propertyName}-${index}`}
                          value={item.propertyName}
                        >
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </FormItem>
                </Col>
                {kpiTypeSelected === KPITypes.others.propertyName && (
                  <Col>
                    <FormItem
                      pageId={PAGE_ID}
                      itemId={'kpiOther'}
                      wrapperCol={{ span: 24 }}
                      style={{ marginLeft: 5 }}
                    >
                      <Input onKeyDown={skipEnter} disabled={!editable} />
                    </FormItem>
                  </Col>
                )}
              </Row>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={14}>
                  <FormItem
                    pageId={PAGE_ID}
                    itemId={'kpiThreshold'}
                    wrapperCol={{ span: 14 }}
                    labelCol={{ span: 10, style: { marginRight: '1%' } }}
                  >
                    <Input
                      onKeyDown={skipEnter}
                      disabled={
                        !editable || kpiTypeSelected == KPITypes.schedule.propertyName || false
                      }
                    />
                  </FormItem>
                </Col>
                {kpiTypeSelected != KPITypes.schedule.propertyName && (
                  <Col>
                    <FormItem
                      pageId={PAGE_ID}
                      itemId={'kpiPeriod'}
                      wrapperCol={{ span: 24 }}
                      style={{ marginLeft: 5, minWidth: 183 }}
                    >
                      <Select
                        onKeyDown={skipEnter}
                        size="middle"
                        allowClear={false}
                        disabled={!editable}
                      >
                        {Object.values(KPIPeriodTypes).map((item, index) => (
                          <Select.Option
                            key={`${item.propertyName}-${index}`}
                            value={item.propertyName}
                          >
                            {item.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </FormItem>
                  </Col>
                )}
              </Row>
            </Col>
          </Form>
        </Modal.Normal>
        <ChargeSelectModal
          isFromMeasure={true}
          measureAccountTitle={accountTitleSelected}
          selectType="checkbox"
          visible={visibleResponsiblePerson}
          defaultDepartmentValues={defaultDepartments?.map((x) => x.objectId || 0)}
          defaultUserValues={defaultUserDepartments?.map((x) => x.objectId || 0)}
          setFlagHasChangeUserDepartment={setFlagHasChangeUserDepartment}
          setFlagHasChangeDepartment={setFlagHasChangeDepartment}
          onSelected={(rows) => {
            let targetNameUser = ''
            let targetNameDepartment = ''
            if (rows.user && flagHasChangeUserDepartment) {
              const userDepartmentsOld: TaskAssignSelected[] =
                (userDepartmentsSelected &&
                  userDepartmentsSelected.length > 0 && [...userDepartmentsSelected]) ||
                (defaultUserDepartments &&
                  defaultUserDepartments.length > 0 && [...defaultUserDepartments]) ||
                []
              const userDepartmentsTemp: TaskAssignSelected[] = []
              rows.user.map((item) => {
                //Casting user item to UserTableRow
                const itemTypeUserTable = item as UserTableRow
                const oldUserDepartmentByItem:
                  | TaskAssignSelected
                  | undefined = userDepartmentsOld?.find((x) => x.objectId == itemTypeUserTable.id)
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
              const departmentsOld: TaskAssignSelected[] =
                (departmentsSelected &&
                  departmentsSelected.length > 0 && [...departmentsSelected]) ||
                (defaultDepartments && defaultDepartments.length > 0 && [...defaultDepartments]) ||
                []

              const departmentSelectedsTemp: TaskAssignSelected[] = []
              //Casting department item to DepartmentTableRow
              rows.department.map((item) => {
                const itemTypeDepartmentTable = item as DepartmentTableRow
                const oldDepartmentByItem: TaskAssignSelected | undefined = departmentsOld?.find(
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
                responsiblePerson: targetNameUser + targetNameDepartment,
              })
            } else {
              form.setFieldsValue({
                responsiblePerson: targetNameUser + targetNameDepartment,
              })
            }
            setVisibleResponsiblePerson(false)
          }}
          onCancel={() => setVisibleResponsiblePerson(false)}
        />
      </Layout.Content>
    </Layout>
  )
}

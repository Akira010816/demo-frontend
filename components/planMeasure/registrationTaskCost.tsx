import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Col, Input, InputNumber, Layout, message, Row, Typography } from 'antd'
import { FormInstance } from 'antd/es/form'
import Table from '../table'
import { ColumnGroupType, ColumnsType, ColumnType } from 'antd/es/table'
import FormItem from '~/components/form/FormItem'
import { PriceUnitProps, PriceUnits } from '../priceUnit'
import { displaySetting, TaskCostRecordingDestinationTypes } from '~/lib/displaySetting'
import ChargeSelectModal from '../charge/chargeSelectModal'
import { DepartmentTableRow } from '../department/departmentSelectTable'
import _ from 'lodash'
import { getRandomString } from '~/lib/randomString'
import { PlusCircleOutlined } from '@ant-design/icons'

const PAGE_ID = 'registrationTaskCost'

//Get label config from display setting
const labelConfig = displaySetting[PAGE_ID].labelConfig

//Plan measure task allocation props type
type PlanMeasureTaskAllocationProps = {
  setShouldRefreshData: (state: boolean) => void
  setUnsaved: (state: boolean) => void
  setTasks: (data: PlanMeasureTask[]) => void
  setRatioIsValid: (state: boolean) => void
  setDepartments: (department: DepartmentTableRow[]) => void
  setTaskAllocationPriceUnit: (priceUnit: PriceUnit) => void
  shouldRefreshData: boolean
  unsaved: boolean
  tasks: PlanMeasureTask[]
  ratioIsValid: boolean
  editable: boolean | undefined
  departments: DepartmentTableRow[]
  accountTitles: AccountTitle[]
  taskAllocationPriceUnit: PriceUnit
  taskPriceUnit: PriceUnit
}

//Task allocation props type
export type tasksTableProps = {
  form?: FormInstance
  tasks?: Array<PlanMeasureTask>
  columnProps: ColumnsType<PlanMeasureTask>
}

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

//Component TaskAllocationTable, show list registration task cost
const TaskAllocationTable = (props: tasksTableProps): JSX.Element => {
  const { tasks, columnProps } = props

  const planMeasureTasks = useMemo(() => (tasks && tasks.length ? tasks : []), [tasks])
  const columns: ColumnsType<PlanMeasureTask> = useMemo(() => [...columnProps], [columnProps])

  return (
    <Table
      size={'small'}
      columns={[...columns]}
      dataSource={[
        ...planMeasureTasks.filter(
          (task) =>
            task.costRecordingDestination == TaskCostRecordingDestinationTypes.common.propertyName
        ),
      ]}
      pagination={false}
      rowKey={'id'}
      scroll={{ x: 'max-content' }}
    />
  )
}

//Init registration task cost columns, use global variable because event in column table not update by useState
let columnsTemp: (ColumnGroupType<PlanMeasureTask> | ColumnType<PlanMeasureTask>)[] = []

//Declare global var currentUnitPrice, because useState not update new value in table column
// let globalCurrentUnitPrice: PriceUnit = {
//   digitLength: 1,
//   isDefault: true,
//   name: 'yen',
//   type: 'yen',
// }
//Init default department selected
let departmentDefaultTemp: DepartmentTableRow[] = []

//Init task temporary
let tasksTemp: PlanMeasureTask[] = []

//Define measure registration task cost form
export const TaskAllocationForm = (props: PlanMeasureTaskAllocationProps): JSX.Element => {
  const {
    setShouldRefreshData,
    setTasks,
    setUnsaved,
    setRatioIsValid,
    setDepartments,
    setTaskAllocationPriceUnit,
    shouldRefreshData,
    tasks,
    unsaved,
    ratioIsValid,
    editable,
    departments,
    accountTitles,
    taskAllocationPriceUnit,
    taskPriceUnit,
  } = props

  //Define state to show or hide Department popup
  const [visibleDepartment, setVisibleDepartment] = useState<boolean>(false)

  const calcTotalAmount = useCallback(
    (item: PlanMeasureTask, index: number, id: number) => {
      return (
        <div key={`${id}-${index}-${item.id}`} style={{ textAlign: 'right' }}>
          {new Intl.NumberFormat('ja-JP', {
            currency: 'JPY',
            maximumFractionDigits: 14,
            maximumSignificantDigits: 14,
          }).format(
            parseFloat(
              (
                _.sumBy(item.prices, (s) => Number(s.cost) || 0) /
                Math.pow(10, taskAllocationPriceUnit.digitLength - taskPriceUnit.digitLength)
              ).toFixed(14) || '0'
            )
          )}
        </div>
      )
    },
    [taskAllocationPriceUnit.digitLength, taskPriceUnit.digitLength]
  )

  //Function validate ratio
  const checkRatioTypeIsValid = useCallback(
    (departmentLength: number): void => {
      let ratioInAllItemIsValid = true
      departmentLength &&
        tasksTemp
          .filter(
            (task) =>
              task.costRecordingDestination == TaskCostRecordingDestinationTypes.common.propertyName
          )
          .map((x) => {
            if (_.sumBy(x.allocations, (s) => Number(s.allocationRate)) != 100) {
              ratioInAllItemIsValid = false
            }
          })
      setRatioIsValid(ratioInAllItemIsValid)
    },
    [setRatioIsValid]
  )

  const onChangeRatioByDepartment = useCallback(
    (value: number, taskId: number, allocationId: number, tempId?: string): void => {
      if (value > 100 || value < 0 || !taskId || (!allocationId && !tempId)) return
      const indexItem = tasksTemp.findIndex((x) => x.id == taskId)
      if (indexItem < 0) return
      const indexDepartment = tasksTemp[indexItem].allocations.findIndex(
        (x) => x.id == allocationId || (x.tempId && x.tempId == tempId)
      )
      if (indexDepartment < 0) return
      tasksTemp[indexItem].allocations[indexDepartment].allocationRate = value
      setTasks([...tasksTemp])
      if (!unsaved) setUnsaved(true)
      checkRatioTypeIsValid(tasksTemp[indexItem].allocations.length)
    },
    [checkRatioTypeIsValid, setTasks, setUnsaved, unsaved]
  )

  /**
   * Define column table
   */
  const columnProps: (
    | ColumnGroupType<PlanMeasureTask>
    | ColumnType<PlanMeasureTask>
  )[] = useMemo(() => {
    const childColumns: ColumnsType<PlanMeasureTask> = departments.map((department, i) => ({
      title: `${department.name}`,
      dataIndex: [`allocations[${i}]`, 'allocationRate'],
      key: `allocation-ratio-${department.id}`,
      width: 150,
      render: (id: number, item: PlanMeasureTask, index: number) => {
        const indexById = item.allocations.findIndex((x) => x.distriDpm.id == department.id)
        if (indexById < 0) return null
        return {
          children: (
            <InputNumber
              disabled={!editable}
              key={`key-${item.id}-${i}-${id}-${index}`}
              style={{
                ...inputStyle.normal,
                width: '100%',
                textAlignLast: 'right',
                paddingRight: '15px',
              }}
              value={item.allocations[indexById].allocationRate || 0}
              min={0}
              max={100}
              formatter={(value) => `${value}%`}
              parser={(value) => {
                const parseValue = (value && parseFloat(value.replace('%', ''))) || 0
                if (parseValue < 0) return 0
                if (parseValue > 100) return 100
                return parseValue
              }}
              onChange={(e) =>
                onChangeRatioByDepartment(
                  (e && parseFloat(e?.toString())) || 0,
                  item.id || 0,
                  item.allocations[indexById].id || 0,
                  item.allocations[indexById].tempId || ''
                )
              }
            />
          ),
        }
      },
    }))

    const columns: (ColumnGroupType<PlanMeasureTask> | ColumnType<PlanMeasureTask>)[] = [
      {
        title: <Typography.Text ellipsis={true}>{labelConfig.task}</Typography.Text>,
        key: 'task',
        dataIndex: 'task',
        colSpan: 1,
        rowSpan: 2,
        children: [],
        width: 135,
        fixed: true,
        render: (id: number, item: PlanMeasureTask, index: number) => {
          return {
            children: (
              <div
                key={`task-cost-${id}-${index}`}
                role="button"
                style={{
                  // textDecoration: 'underline',
                  // color: 'rgb(51, 108, 97)',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                }}
                title={item.taskName}
                tabIndex={index}
              >
                {/* <a role="button" href="#"> */}
                {item.taskName}
                {/* </a> */}
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
        fixed: true,
        render: (accountTitle: AccountTitle, item: PlanMeasureTask, index: number) => ({
          children: (
            <div key={`accountId-${accountTitle?.id}-${index}`}>
              {(item.accountTitle && accountTitles.find((x) => x.id === accountTitle?.id)?.name) ||
                ''}
            </div>
          ),
        }),
      },
      {
        title: <Typography.Text ellipsis={true}>{labelConfig.allocationAmount}</Typography.Text>,
        key: 'allocationAmount',
        dataIndex: 'allocationAmount',
        colSpan: 1,
        children: [],
        width: 150,
        fixed: true,
        render: (id: number, item: PlanMeasureTask, index: number) => {
          return calcTotalAmount(item, index, id)
        },
      },
    ]
    if (childColumns.length > 0) {
      columns.push({
        title: <Typography.Text ellipsis={true}>{labelConfig.allocations}</Typography.Text>,
        key: `allocations-column-${getRandomString()}`,
        dataIndex: 'allocations',
        colSpan: departments.length,
        children: [...childColumns],
        render: (id: number, item: PlanMeasureTask, index: string | number) => ({
          children: (
            <FormItem
              pageId={PAGE_ID}
              itemId={'task'}
              initialValue={item.id}
              key={`column-task-${index}-${id}`}
              style={inputStyle.formItem}
            >
              <Input style={inputStyle.normal} disabled={!editable} />
            </FormItem>
          ),
        }),
      })
    }
    return columns
  }, [accountTitles, calcTotalAmount, departments, editable, onChangeRatioByDepartment])

  //Check tab change to refresh plan measure task data
  useEffect(() => {
    if (shouldRefreshData) {
      columnsTemp = [...columnProps]
      tasksTemp = JSON.parse(JSON.stringify(tasks))
      departmentDefaultTemp =
        (tasksTemp.length > 0 &&
          tasksTemp[0].allocations.map(
            (allocation): DepartmentTableRow => {
              return {
                id: allocation.distriDpm.id,
                name: allocation.distriDpm.name,
                key: allocation.distriDpm.id,
              }
            }
          )) ||
        []
      if (departmentDefaultTemp.length < 1) {
        departmentDefaultTemp = departmentDefaultTemp.concat([...departments])
      }
      onSaveDepartment(departmentDefaultTemp || [], true)
      setShouldRefreshData(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShouldRefreshData, shouldRefreshData])

  //Show department popup function
  const showPopup = (): void => {
    setVisibleDepartment(true)
  }

  /**
   * On save list department, extend columns department selected in table
   * @param departments -> List department selected
   * @returns void
   */
  const onSaveDepartment = (departments: DepartmentTableRow[], isFirstRender?: boolean): void => {
    //Order and set department selected
    departments = _.sortBy(departments, (x) => x.id)
    setDepartments([...departments])
    //Check columns not have ratio column and department selected is empty then return
    if (columnsTemp && columnsTemp.length < 3 && departments.length < 1) {
      tasksTemp.map((item) => {
        item.allocations = []
      })
      setTasks([...tasksTemp])
      if (!unsaved && !isFirstRender) setUnsaved(true)
      checkRatioTypeIsValid(0)
      if (!isFirstRender) message.success(labelConfig.updateSuccess)
      return
    }
    //If it isn't displayed for the first time, process all task allocation, otherwise only handle in new task
    if (!isFirstRender) {
      tasksTemp.map((task) => {
        _.remove(task.allocations, (x) => departments.findIndex((d) => d.id == x.distriDpm.id) < 0)
        departments.map((x) => {
          if (task.allocations.findIndex((alloc) => alloc.distriDpm.id == x.id) < 0) {
            const randomId = getRandomString()
            task.allocations.push({
              allocationRate: 0,
              distriDpm: {
                id: x.id,
                name: x.name,
                code: x.name,
              },
              tempId: randomId,
            })
          }
        })
      })
      if (!unsaved && !isFirstRender) setUnsaved(true)
      message.success(labelConfig.updateSuccess)
    } else {
      tasksTemp.map((task) => {
        if (task.allocations.length != departments.length) {
          departments.map((x) => {
            if (task.allocations.findIndex((alloc) => alloc.distriDpm.id == x.id) < 0) {
              const randomId = getRandomString()
              task.allocations.push({
                allocationRate: 0,
                distriDpm: {
                  id: x.id,
                  name: x.name,
                  code: x.name,
                },
                tempId: randomId,
              })
            }
          })
        }
      })
    }
    setTasks([...tasksTemp])
    checkRatioTypeIsValid(departments.length)
  }

  const onChangePriceUnit: PriceUnitProps['onChange'] = (_priceUnit, nextPriceUnit) => {
    setTaskAllocationPriceUnit(nextPriceUnit)
  }

  return (
    <Layout>
      <Layout.Content style={{ padding: '2rem', paddingTop: '1rem' }}>
        <Col>
          <Row>
            <Typography.Paragraph>{labelConfig.taskCostSubTitle}</Typography.Paragraph>
          </Row>
          <Row style={{ marginBottom: '20px' }}>
            <Col style={{ marginTop: 'auto' }}>
              <Button
                disabled={!editable}
                type="default"
                onClick={() => showPopup()}
                style={{
                  marginTop: 'auto',
                }}
              >
                <PlusCircleOutlined />
                {labelConfig.addRegistrationTaskButton}
              </Button>
            </Col>
            <div style={{ marginLeft: departments.length > 0 ? '205px' : 'auto' }}>
              <div style={{ marginLeft: 'auto', marginTop: 5, width: '100%' }}>
                <Row style={{ alignItems: 'center' }}>
                  <div style={{ width: 35 }}>
                    <Typography.Text>単位</Typography.Text>
                  </div>
                  {taskAllocationPriceUnit && (
                    <PriceUnits
                      style={{ width: 80 }}
                      onChange={onChangePriceUnit}
                      defaultValue={taskAllocationPriceUnit.type}
                    />
                  )}
                </Row>
              </div>
            </div>
          </Row>
          <div>
            <Row>
              <TaskAllocationTable columnProps={[...columnProps]} tasks={[...tasks]} />
            </Row>
            {!ratioIsValid && departments.length > 0 && (
              <Row>
                <Typography.Paragraph
                  style={{
                    color: '#FF0000',
                    marginTop: 5,
                  }}
                >
                  {labelConfig.validateTotalRowByPercent}
                </Typography.Paragraph>
              </Row>
            )}
          </div>
        </Col>
        <ChargeSelectModal
          isFromMeasure={true}
          selectType="checkbox"
          defaultDepartmentValues={[...departments.map((d) => d.id)]}
          visible={visibleDepartment}
          onSelected={(rows) => {
            if (rows.department) {
              const listDepartMentSelected: DepartmentTableRow[] = []
              //Casting department item to DepartmentTableRow
              rows.department.map((item) => {
                listDepartMentSelected.unshift(item as DepartmentTableRow)
              })
              onSaveDepartment(listDepartMentSelected)
            }
            setVisibleDepartment(false)
          }}
          onCancel={() => setVisibleDepartment(false)}
        />
      </Layout.Content>
    </Layout>
  )
}

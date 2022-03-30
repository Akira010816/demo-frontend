import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Col, Input, Layout, Row, Typography, Select, InputNumber } from 'antd'
import Table from '../table'
import { ColumnGroupType, ColumnsType, ColumnType } from 'antd/es/table'
import FormItem from '~/components/form/FormItem'
import { displaySetting, EffectSaleProjectTypes, EffectSaleStatusTypes } from '~/lib/displaySetting'
import _ from 'lodash'
import { skipEnter } from '~/lib/keyDown'
import { PriceUnitProps, PriceUnits } from '../priceUnit'
import { generateDataMonthByNext5Year } from '~/pages/planMeasures/new'
import { toFixed } from '~/lib/number'
import Button from '../Button'
import Modal from '~/components/modal'
import { onTableInputFocus } from '~/lib/table'
import { renderBGColorOfColumnByMonth } from './planMeasuresTable'

const PAGE_ID = 'effectSaleForm'

//Define type of plan measure effect sale props
export type PlanMeasureSaleProps = {
  setShouldRefreshDataSale: (state: boolean) => void
  setUnsaved: (state: boolean) => void
  setSales: (data: PlanMeasureSale[]) => void
  setSalePriceUnit: (data: PriceUnit) => void
  shouldRefreshDataSale: boolean
  unsaved: boolean
  sales: PlanMeasureSale[]
  editable: boolean | undefined
  nextFiveYears: BusinessYear[]
  salePriceUnit: PriceUnit
}

//Define effect sale table props
export type effectSaleTableProps = {
  sales?: Array<PlanMeasureSale>
  columnProps: ColumnsType<PlanMeasureSale>
  onAddRow: () => void
  onRemoveRow: (id: number) => void
  editable: boolean | undefined
}

//Get label config effect sale from display setting
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

//Component PlanMeasureEffectSaleTable, show list measure effect sale
const PlanMeasureEffectSaleTable = (props: effectSaleTableProps): JSX.Element => {
  const { sales, columnProps, editable } = props
  const { onAddRow, onRemoveRow } = props
  const effectSale = useMemo(() => (sales && sales.length ? sales : []), [sales])
  const columns: ColumnsType<PlanMeasureSale> = useMemo(() => [...columnProps], [columnProps])

  return (
    <Table
      id={'effectSaleTable'}
      size={'small'}
      columns={[...columns]}
      dataSource={[...effectSale]}
      pagination={false}
      rowKey={'id'}
      scroll={{ x: 'max-content' }}
      addable={editable}
      onAddRow={
        editable
          ? () => {
              onAddRow()
            }
          : undefined
      }
      onDeleteRow={
        editable
          ? (item) => {
              item && item.id && onRemoveRow(item.id)
            }
          : undefined
      }
    />
  )
}

//Declare global var currentUnitPrice, because useState not update new value in table column
// let globalCurrentPriceUnit: PriceUnit = {
//   digitLength: 1,
//   isDefault: true,
//   name: 'yen',
//   type: 'yen',
// }

//Init measure effect sale, use global variable because event in column not working with useState
let salesTemp: PlanMeasureSale[] = []

//Init measure effect sale, use global variable because event in column table not update new useState
let columnsTemp: (ColumnGroupType<PlanMeasureSale> | ColumnType<PlanMeasureSale>)[]

//Define measure effect sale form
export const PlanMeasureSaleForm = (props: PlanMeasureSaleProps): JSX.Element => {
  const {
    setShouldRefreshDataSale,
    setUnsaved,
    setSales,
    setSalePriceUnit,
    shouldRefreshDataSale,
    unsaved,
    sales,
    editable,
    nextFiveYears,
    salePriceUnit,
  } = props

  //Define effect sale state
  const [isEternal, setEternal] = useState<boolean>(true)
  const [visibleDeleteConfirm, setVisibleDeleteConfirm] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<PlanMeasureCost['id']>(undefined)

  const yearSummaryColumn = (
    targetBusinessYear: BusinessYear
  ): ColumnGroupType<PlanMeasureSale> | ColumnType<PlanMeasureSale> => ({
    title: '年度累計',
    dataIndex: targetBusinessYear.startYear,
    key: targetBusinessYear.startYear,
    width: 120,
    render: (id: number, item: PlanMeasureSale, index: number) => {
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
        salePriceUnit.digitLength + 1
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

  //This function render next 5 year plan measure effect sale column
  const renderFiveYearPlanColumn = (
    nextFiveYears: BusinessYear[]
  ): ColumnsType<PlanMeasureSale> => {
    const fiveYearPlanColumn: ColumnsType<PlanMeasureSale> = []
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
   * Define table columns
   */
  const [columnProps, setColumnProps] = useState<ColumnsType<PlanMeasureSale>>([
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.project}</Typography.Text>,
      key: 'project',
      dataIndex: 'project',
      colSpan: 1,
      rowSpan: 2,
      children: [],
      width: 135,
      fixed: false,
      render: (project: string, item: PlanMeasureSale) => {
        return {
          children: (
            <Select
              onKeyDown={skipEnter}
              size="middle"
              onChange={(val: string) =>
                onChangeSelect(item?.id || -1, val as EffectSaleProjectType, true)
              }
              style={{ minWidth: 130 }}
              defaultValue={project}
              disabled={!editable}
            >
              {Object.values(EffectSaleProjectTypes).map((type, index) => (
                <Select.Option key={`${type.propertyName}-${index}`} value={type.propertyName}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
          ),
        }
      },
    },
    {
      title: <Typography.Text ellipsis={true}>{labelConfig.effectIncDec}</Typography.Text>,
      key: 'effectIncDec',
      dataIndex: 'effectIncDec',
      colSpan: 1,
      children: [],
      width: 150,
      fixed: false,
      render: (effectIncDec: string, item: PlanMeasureSale, index: number) => {
        return {
          children: (
            <Select
              key={`effectIncDec-${index}-${item.id}`}
              onKeyDown={skipEnter}
              size="middle"
              onChange={(val: string) =>
                onChangeSelect(item?.id || -1, val as EffectSaleProjectType, false)
              }
              style={{ minWidth: 130 }}
              defaultValue={effectIncDec}
              disabled={!editable}
            >
              {Object.values(EffectSaleStatusTypes).map((type, index) => (
                <Select.Option key={`${type.propertyName}-${index}`} value={type.propertyName}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
          ),
        }
      },
    },
    ...(nextFiveYears && nextFiveYears.length > 0 ? renderFiveYearPlanColumn(nextFiveYears) : []),
  ])

  /**
   * Function onClick column year, display extend month of year selected
   * @param yearSelected -> year selected
   * @param keyIndex -> index of year selected
   * @returns void
   */
  const onClickYearColumn = (yearSelected: BusinessYear, keyIndex: number): void => {
    //Set key for column extend
    const keyExtend = yearSelected.id + '-extend'

    //Find index year column
    const indexYear = columnsTemp.findIndex(
      (x: ColumnGroupType<PlanMeasureSale> | ColumnType<PlanMeasureSale>) =>
        x.key == yearSelected.startYear
    )

    const indexYearExtend = columnsTemp.findIndex(
      (x: ColumnGroupType<PlanMeasureSale> | ColumnType<PlanMeasureSale>) => x.key == keyExtend
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
      const childColumns: (ColumnGroupType<PlanMeasureSale> | ColumnType<PlanMeasureSale>)[] = []
      for (let i = yearSelected.startMonth; i < 12 + yearSelected.startMonth; i++) {
        const month = i > 12 ? i % 12 : i
        const year = i > 12 ? yearSelected.year + 1 : yearSelected.year
        childColumns.push({
          title: `${year}${labelConfig.yearLabel}${month}${labelConfig.month}`,
          dataIndex: [`prices[${keyIndex * 12 + (month - 1)}]`, 'cost'],
          key: `plan-measure-effect-sale-prices-${yearSelected}-${month}`,
          width: 150,
          render: (id: number, item: PlanMeasureSale, index: number) => {
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
                  // Format price value to currency format
                  formatter={(value) => {
                    if (value == undefined) return ''
                    const valueSpl = value.toString().split('.')
                    if (valueSpl.length > 1) {
                      let suffix = valueSpl.slice(1, valueSpl.length).join('')
                      if (suffix.length > salePriceUnit.digitLength + 1) {
                        suffix = suffix.substr(0, salePriceUnit.digitLength + 1)
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
                      if (suffix.length > salePriceUnit.digitLength + 1) {
                        suffix = suffix.substr(0, salePriceUnit.digitLength + 1)
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
        render: (id: number, item: PlanMeasureSale, index: string | number) => ({
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

  //Init plan measure effect sales
  useEffect(() => {
    const dataCopy: PlanMeasureSale[] = JSON.parse(JSON.stringify(sales))
    salesTemp = [...dataCopy]
  }, [sales])

  //Call only once
  useEffect(() => {
    columnsTemp = [...columnProps]
    setEternal(true)
  }, [isEternal, columnProps])

  //Check tab change to refresh plan measure effect sale data
  useEffect(() => {
    if (shouldRefreshDataSale) {
      const dataCopy: PlanMeasureSale[] = JSON.parse(JSON.stringify(sales))
      salesTemp = [...dataCopy]
      setShouldRefreshDataSale(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShouldRefreshDataSale, shouldRefreshDataSale])

  /**
   * On change select item type or status label
   * @param id -> Id of item
   * @param value -> value select
   * @param isChangeItemType -> type change (true: change item type, false: change status)
   * @returns void
   */
  const onChangeSelect = (
    id: number,
    value: EffectSaleProjectType | EffectSaleStatusType,
    isChangeItemType = false
  ): void => {
    //find index of item by id
    const itemIdx = salesTemp.findIndex((x) => x.id === id)
    //if not exist then return
    if (itemIdx < 0) return
    //check type change to update
    if (isChangeItemType) {
      salesTemp[itemIdx].project = value as EffectSaleProjectType
    } else {
      salesTemp[itemIdx].effectIncDec = value as EffectSaleStatusType
    }
    //update list measure effect sale
    setSales([...salesTemp])
    if (!unsaved) setUnsaved(true)
  }

  /**
   * On add row function, add an item to list measure effect sale
   */
  const onAddRow = (): void => {
    //increment current id
    const nextId = (_.maxBy(salesTemp, (x) => x.id)?.id || 0) + 1
    //push new item to list measure effect sale
    salesTemp.push({
      project: EffectSaleProjectTypes.sales.propertyName,
      effectIncDec: EffectSaleStatusTypes.maintainStatusQuo.propertyName,
      isNew: true,
      id: nextId,
      prices: [
        ...((nextFiveYears &&
          nextFiveYears.length > 0 &&
          generateDataMonthByNext5Year(nextFiveYears)) ||
          []),
      ],
    })
    //update list measure effect sale
    setSales([...salesTemp])
    if (!unsaved) setUnsaved(true)
  }

  const onClickRemoveButton = (id: PlanMeasureSale['id']): void => {
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
    _.remove(salesTemp, (x) => x.id === deleteId)
    //Set new list to list measure effect sale
    setSales([...salesTemp])
    if (!unsaved) setUnsaved(true)
    setVisibleDeleteConfirm(false)
    setDeleteId(undefined)
  }

  /**
   * This function handle change price by month and year
   * @param value -> price value
   * @param saleId -> effect sale ID
   * @param priceId -> price ID
   * @param tempId -> temp ID, use in case price is new
   * @returns void
   */
  const onChangeInputNumber = useCallback(
    (
      value: number | string | undefined,
      saleId: number,
      priceId: number,
      tempId?: string
    ): void => {
      if (!priceId && !tempId) return
      const indexItem = salesTemp.findIndex((x) => x.id == saleId)
      if (indexItem < 0) return
      const indexPrice = salesTemp[indexItem].prices?.findIndex(
        (x) => (priceId && x.id == priceId) || (tempId && x.tempId == tempId)
      )
      if (indexPrice == undefined || indexPrice < 0) return
      salesTemp[indexItem].prices[indexPrice].cost =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value == '' || value == null ? 0 : (value as any)
      setSales([...salesTemp])
      if (!unsaved) setUnsaved(true)
    },
    [setSales, unsaved, setUnsaved]
  )

  /**
   * Function onChangeUnitPrice, handle event unit price change
   */
  const onPriceUnitChange: PriceUnitProps['onChange'] = (_priceUnit, nextPriceUnit) => {
    if (_priceUnit.digitLength != nextPriceUnit.digitLength) {
      const diffDigit = nextPriceUnit.digitLength - _priceUnit.digitLength
      const measureSaleTemp = [..._.cloneDeep(sales)]
      measureSaleTemp.map((cost) => {
        cost.prices.map((price) => {
          price.cost = toFixed(price.cost * Math.pow(10, -diffDigit), nextPriceUnit.digitLength + 1)
        })
      })
      setSales([...measureSaleTemp])
    }
    // globalCurrentPriceUnit = nextPriceUnit
    setSalePriceUnit(nextPriceUnit)
  }

  return (
    <>
      <Layout>
        <Modal.Confirm
          visible={visibleDeleteConfirm}
          onCancel={() => onCancelRemove()}
          okText={labelConfig.deleteCostButton}
          onOk={onRemoveRow}
          // cancelText={labelConfig.close} //P2FW-757
        >
          <Typography.Text>{labelConfig.deleteConfirmText}</Typography.Text>
        </Modal.Confirm>
        <Layout.Content style={{ padding: '2rem', paddingTop: '1rem' }}>
          <Col>
            <Row>
              <Typography.Paragraph>{labelConfig.effectSaleSubTitle}</Typography.Paragraph>
              <div style={{ marginLeft: 'auto' }}>
                <Row style={{ alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <Typography.Text>単位</Typography.Text>
                  </div>
                  ：
                  {salePriceUnit && (
                    <PriceUnits
                      style={{ width: 80 }}
                      onChange={onPriceUnitChange}
                      defaultValue={salePriceUnit.type}
                    />
                  )}
                </Row>
              </div>
            </Row>
            <div>
              <Row onFocus={onTableInputFocus('#effectSaleTable')}>
                <PlanMeasureEffectSaleTable
                  columnProps={[...columnProps]}
                  sales={[...sales]}
                  onAddRow={onAddRow}
                  onRemoveRow={onClickRemoveButton}
                  editable={editable}
                />
              </Row>
            </div>
          </Col>
        </Layout.Content>
      </Layout>
    </>
  )
}

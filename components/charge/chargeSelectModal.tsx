import React, { FC, useEffect, useState } from 'react'
import { Modal, Tabs } from 'antd'
import { ModalFuncProps, ModalProps } from 'antd/lib/modal'
import Button from '../Button'
import UserSelectTable from '../user/userSelectTable'
import DepartmentSelectTable from '../department/departmentSelectTable'
import CompanySelectTable from '../company/companySelectTable'

const { TabPane } = Tabs

export type ChargeSelectedRows = {
  user?: Array<{ id: number; name: string }>
  department?: Array<{ id: number; name: string }>
  company?: Array<{ id: number; name: string }>
}

export type SelectedRows = Array<{ id: number; name: string }>

export type ChargeSelectModalProps = ModalProps &
  ModalFuncProps & {
    title?: string
    name?: string
    selectName?: string
    onSelected: (rows: ChargeSelectedRows) => void
    visible: boolean
    selectType?: 'radio' | 'checkbox'
    defaultUserValues?: Array<number>
    defaultDepartmentValues?: Array<number>
    defaultCompanyValues?: Array<number>
    isFromMeasure?: boolean //this param to check is show on plan measure form
    measureAccountTitle?: AccountTitle //this param to check type of account when show on plan measure form
    setFlagHasChangeUserDepartment?: (hasChange: boolean) => void
    setFlagHasChangeDepartment?: (hasChange: boolean) => void
    disabled?: boolean
  }

/**
 * 担当・役割・場所選択モーダル(社員、部署、事業者を選択)
 */
const ChargeSelectModal: FC<ChargeSelectModalProps> = ({
  defaultUserValues,
  defaultDepartmentValues,
  defaultCompanyValues,
  selectType,
  isFromMeasure,
  measureAccountTitle,
  setFlagHasChangeUserDepartment,
  setFlagHasChangeDepartment,
  ...props
}: ChargeSelectModalProps) => {
  const [tabDefaultActiveKey, setTabDefaultActiveKey] = useState('user')
  const [tabKey, setTabKey] = useState('user')

  const [userSelectedRows, setUserSelectedRows] = useState<SelectedRows>()
  const [defaultUserSelectedRows, setDefaultUserSelectedRows] = useState<Array<number>>([])
  const [departmentSelectedRows, setDepartmentSelectedRows] = useState<SelectedRows>()
  const [defaultDepartmentSelectedRows, setDefaultDepartmentSelectedRows] = useState<Array<number>>(
    []
  )
  const [companySelectedRows, setCompanySelectedRows] = useState<SelectedRows>()
  const [defaultCompanySelectedRows, setDefaultCompanySelectedRows] = useState<Array<number>>([])

  useEffect(() => {
    //Check if from measure risk then set default values both
    if (isFromMeasure) {
      if (defaultUserValues) setDefaultUserSelectedRows(defaultUserValues)
      if (defaultDepartmentValues) setDefaultDepartmentSelectedRows(defaultDepartmentValues)
      setTabDefaultActiveKey('user')
      return
    }

    if (defaultUserValues && 1 <= defaultUserValues.length) {
      setDefaultUserSelectedRows(defaultUserValues)
      setTabDefaultActiveKey('user')
    } else if (defaultDepartmentValues && 1 <= defaultDepartmentValues.length) {
      setDefaultDepartmentSelectedRows(defaultDepartmentValues)
      setTabDefaultActiveKey('department')
    } else if (defaultCompanyValues && 1 <= defaultCompanyValues.length) {
      setDefaultCompanySelectedRows(defaultCompanyValues)
      setTabDefaultActiveKey('company')
    }
  }, [defaultUserValues, defaultDepartmentValues, defaultCompanyValues, isFromMeasure])

  useEffect(() => {
    setUserSelectedRows(undefined)
    setDepartmentSelectedRows(undefined)
    setCompanySelectedRows(undefined)
  }, [props.visible])

  return (
    <Modal
      {...props}
      title={props.title}
      destroyOnClose={true}
      style={{ top: 10 }}
      footer={[
        <Button
          key="back"
          type="primary"
          onClick={() => {
            //Check is open with form mearureRisk, get both user and department. Otherwise, done as before
            if (isFromMeasure) {
              props.onSelected({
                user: userSelectedRows,
                department: departmentSelectedRows,
              })
            } else {
              if (tabKey == 'user' && userSelectedRows) {
                props.onSelected({
                  user: userSelectedRows,
                })
              } else if (tabKey == 'department' && departmentSelectedRows) {
                props.onSelected({
                  department: departmentSelectedRows,
                })
              } else if (tabKey == 'company' && companySelectedRows) {
                props.onSelected({
                  company: companySelectedRows,
                })
              }
            }
            if (props.onOk) {
              props.onOk()
            }
          }}
        >
          {isFromMeasure ? 'OK' : '選択'}
        </Button>,
        <Button key="submit" onClick={props.onCancel} type={'ghost'}>
          キャンセル
        </Button>,
      ]}
    >
      <Tabs
        defaultActiveKey={tabDefaultActiveKey}
        onChange={(key) => {
          setTabKey(key)
        }}
        type="card"
      >
        {/* Check if show on measureRiskForm then only show with type LaborCost */}
        {!isFromMeasure ||
          (isFromMeasure && measureAccountTitle?.type === 'laborCost' && (
            <TabPane tab="担当者" key="user">
              <UserSelectTable
                onSelected={(rows: SelectedRows) => setUserSelectedRows(rows)}
                selectType={selectType}
                defaultValues={defaultUserSelectedRows}
                setFlagHasChangeUserDepartment={setFlagHasChangeUserDepartment}
              />
            </TabPane>
          ))}
        <TabPane tab="部署" key="department">
          <DepartmentSelectTable
            onSelected={(rows: SelectedRows) => setDepartmentSelectedRows(rows)}
            selectType={selectType}
            defaultValues={defaultDepartmentSelectedRows}
            setFlagHasChangeDepartment={setFlagHasChangeDepartment}
          />
        </TabPane>
        {/* Check if show on measureRiskForm then not display */}
        {!isFromMeasure && (
          <TabPane tab="事業者" key="company">
            <CompanySelectTable
              onSelected={(rows: SelectedRows) => setCompanySelectedRows(rows)}
              selectType={selectType}
              defaultValues={defaultCompanySelectedRows}
            />
          </TabPane>
        )}
      </Tabs>
    </Modal>
  )
}

export default ChargeSelectModal

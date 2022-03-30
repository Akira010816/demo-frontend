import React, { FC, ReactText, useEffect, useState } from 'react'
import { Input, Row, Col } from 'antd'
import { useQuery } from '@apollo/react-hooks'
import Table from '../table'
import SelectDepartment from '../department/selectDepartment'
import SelectPosition from '../position/selectPosition'
import {
  FIND_ALL_USERDEPARTMENTS_WITH_POSITION,
  FindAllUserDepartmentsWithPositionResponse,
} from '../../graphhql/queries/findAllUserDepartmentsWithPosition'
import _ from 'lodash'

const PAGINATION_PAGE_SIZE = 10

type UserTableWithPositionRow = {
  key: number
  id: number
  userId: number
  userName: string
  departmentCode: string
  departmentName: string
  positionWeight: number
  positionName: string
}

type UserTableWithPositionProps = {
  selectType?: 'radio' | 'checkbox'
  onSelected: (
    rows: Array<{
      id: number
      userId: number
      userName: string
      departmentCode: string
      departmentName: string
      positionWeight: number
    }>
  ) => void
  defaultValues?: Array<UserDepartmentWithPosition['id']>
  defaultUserId?: User['id']
}

const UserSelectWithPositionTable: FC<UserTableWithPositionProps> = ({
  defaultValues,
  defaultUserId,
  selectType = 'radio',
  ...props
}) => {
  const { data } = useQuery<FindAllUserDepartmentsWithPositionResponse>(
    FIND_ALL_USERDEPARTMENTS_WITH_POSITION
  )
  const [filterDepartmentId, setFilterDepartmentId] = useState<number>(0)
  const [filterPositionId, setFilterPositionId] = useState<number>(0)
  const [userDepartmentsWithPosition, setUserDepartmentsWithPosition] = useState<
    Array<UserDepartmentWithPosition>
  >([])
  const [selectedKeys, setSelectedKeys] = useState<Array<ReactText>>([])
  const [searchText, setSearchText] = useState<string>()

  useEffect(() => {
    setSelectedKeys(defaultValues === undefined ? [] : defaultValues)
  }, [defaultValues])

  useEffect(() => {
    if (defaultUserId === undefined) return
    const allUserDepartmentsWithPosition = data ? [..._.cloneDeep(data.findAllUserDepartments)] : []
    if (allUserDepartmentsWithPosition === undefined) return
    const selectUserDepartmentWithPosition = allUserDepartmentsWithPosition.find(
      (userDepartmentWithPosition: UserDepartmentWithPosition) =>
        userDepartmentWithPosition.user.id == defaultUserId
    )
    if (selectUserDepartmentWithPosition) {
      setSelectedKeys([selectUserDepartmentWithPosition.id])
    }
  }, [defaultUserId, data])

  useEffect(() => {
    const allUserDepartmentsWithPosition = data ? [..._.cloneDeep(data.findAllUserDepartments)] : []
    if (allUserDepartmentsWithPosition === undefined) return
    // P2FW-779
    allUserDepartmentsWithPosition.sort(
      (a, b) =>
        a.department.id - b.department.id ||
        b.position.weight - a.position.weight ||
        a.user.id - b.user.id
    )
    const departmentFilteredTarget = filterDepartmentId
      ? allUserDepartmentsWithPosition.filter(
          (userDepartmentWithPosition) =>
            userDepartmentWithPosition.department.id == filterDepartmentId
        )
      : allUserDepartmentsWithPosition
    const positionFilteredTarget = filterPositionId
      ? departmentFilteredTarget.filter(
          (userDepartmentWithPosition) => userDepartmentWithPosition.position.id == filterPositionId
        )
      : departmentFilteredTarget
    if (searchText && searchText.length > 0) {
      setUserDepartmentsWithPosition(
        positionFilteredTarget.filter((userDepartmentWithPosition) =>
          userDepartmentWithPosition.user.name.match(new RegExp(searchText))
        )
      )
    } else {
      setUserDepartmentsWithPosition(positionFilteredTarget)
    }
  }, [data, filterDepartmentId, filterPositionId, searchText])

  const columns = [
    {
      title: '所属',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: '40%',
    },
    {
      title: '役職',
      dataIndex: 'positionName',
      key: 'positionName',
      width: '20%',
    },
    {
      title: '氏名',
      dataIndex: 'userName',
      key: 'userName',
    },
  ]

  return (
    <div>
      <Row style={{ marginTop: '0.5rem', marginLeft: '3.5rem' }}>
        <Col>
          <SelectDepartment<number>
            style={{ width: '350px' }}
            size={'middle'}
            onChange={setFilterDepartmentId}
            name={'departmentSelector'}
            placeholder="所属"
          />
        </Col>
        <Col style={{ marginLeft: '1rem' }}>
          <SelectPosition<number>
            style={{ width: '150px' }}
            size={'middle'}
            onChange={setFilterPositionId}
            name={'positionSelector'}
          />
        </Col>
        <Col style={{ marginLeft: '1rem' }}>
          <Input.Search
            style={{ width: '300px' }}
            placeholder="氏名"
            enterButton
            allowClear
            onSearch={(value) => setSearchText(value)}
          />
        </Col>
      </Row>
      <Row style={{ marginTop: '2rem' }}>
        <Col style={{ marginLeft: '1rem' }} span={23}>
          <Table
            size={'small'}
            columns={columns}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              type: selectType,
              onChange: (selectedRowKeys, selectedRows: UserTableWithPositionRow[]) => {
                setSelectedKeys(selectedRowKeys)
                props.onSelected(selectedRows.map((row) => ({ ...row })))
              },
            }}
            dataSource={userDepartmentsWithPosition.map<UserTableWithPositionRow>(
              (userDepartmentWithPosition) => ({
                key: userDepartmentWithPosition.id,
                id: userDepartmentWithPosition.id,
                userId: userDepartmentWithPosition.user.id,
                userName: userDepartmentWithPosition.user.name,
                departmentCode: userDepartmentWithPosition.department.code,
                departmentName: userDepartmentWithPosition.department.name,
                positionWeight: userDepartmentWithPosition.position.weight,
                positionName: userDepartmentWithPosition.position.name,
              })
            )}
            pagination={{ pageSize: PAGINATION_PAGE_SIZE }}
          />
        </Col>
      </Row>
    </div>
  )
}

export default UserSelectWithPositionTable

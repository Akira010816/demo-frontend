import React, { FC, ReactText, useEffect, useState } from 'react'
import { Input, Row, Col, Table } from 'antd'
import SelectDepartment from '../department/selectDepartment'
import { useQuery } from '@apollo/react-hooks'
import {
  FIND_ALL_USERDEPARTMENTS,
  FindAllUserDepartmentsResponse,
} from '~/graphhql/queries/findAllUserDepartments'

export type UserTableRow = {
  id: number
  name: string
  key: number
  department: string
  userId: number
  departmentId: number
}

type UserTableProps = {
  selectType?: 'radio' | 'checkbox'
  onSelected: (
    arg0: Array<{ id: number; name: string; department: string; userId: number }>
  ) => void
  defaultValues?: Array<UserDepartment['id']>
  defaultUserId?: User['id']
  setFlagHasChangeUserDepartment?: (hasChange: boolean) => void
}

const UserSelectTable: FC<UserTableProps> = ({
  defaultValues,
  defaultUserId,
  selectType = 'radio',
  setFlagHasChangeUserDepartment,
  ...props
}) => {
  const { data } = useQuery<FindAllUserDepartmentsResponse>(FIND_ALL_USERDEPARTMENTS)
  const [filterId, setFilterId] = useState<number>(0)
  const [userDepartments, setUserDepartments] = useState<Array<UserDepartment>>([])
  const [selectedKeys, setSelectedKeys] = useState<Array<ReactText>>([])
  const [searchText, setSearchText] = useState<string>()

  useEffect(() => {
    setSelectedKeys(defaultValues === undefined ? [] : defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (defaultUserId === undefined) return
    const allUserDepartments = data?.findAllUserDepartments
    if (allUserDepartments === undefined) return
    const selectUserDepartment = allUserDepartments.find(
      (userDepartment: UserDepartment) => userDepartment.user.id == defaultUserId
    )
    if (selectUserDepartment) {
      setSelectedKeys([selectUserDepartment.id])
    }
  }, [defaultUserId, data])

  useEffect(() => {
    const allUserDepartments = data?.findAllUserDepartments
    if (allUserDepartments === undefined) return
    const target = filterId
      ? allUserDepartments.filter((userDepartment) => userDepartment.department.id == filterId)
      : allUserDepartments
    if (searchText && searchText.length > 0) {
      setUserDepartments(
        target.filter((userDepartment) => userDepartment.user.name.match(new RegExp(searchText)))
      )
    } else {
      setUserDepartments(target)
    }
  }, [data, filterId, searchText])

  const columns = [
    {
      title: '部署',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '氏名',
      dataIndex: 'name',
      key: 'name',
    },
  ]

  return (
    <div>
      <Row>
        <Col>
          <SelectDepartment<number>
            style={{ width: '200px' }}
            size={'middle'}
            onChange={setFilterId}
            name={'departmentSelector'}
          />
        </Col>
        <Col>
          <Input.Search
            style={{ marginLeft: '10px', width: '262px' }}
            placeholder="氏名"
            enterButton
            allowClear
            onSearch={(value) => setSearchText(value)}
          />
        </Col>
      </Row>
      <Table
        style={{ marginTop: '2rem' }}
        size={'small'}
        columns={[...columns]}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          type: selectType,
          onChange: (selectedRowKeys, selectedRows: UserTableRow[]) => {
            setFlagHasChangeUserDepartment && setFlagHasChangeUserDepartment(true)
            setSelectedKeys([...selectedRowKeys])
            props.onSelected(
              selectedRows.map((row) => ({
                name: row.name,
                id: row.id,
                department: row.department,
                userId: row.userId,
                departmentId: row.departmentId,
              }))
            )
          },
        }}
        dataSource={[
          ...userDepartments.map<UserTableRow>((userDepartment) => ({
            key: userDepartment.id,
            id: userDepartment.id,
            department: userDepartment.department.name,
            name: userDepartment.user.name,
            userId: userDepartment.user.id,
            departmentId: userDepartment.department.id,
          })),
        ]}
        pagination={{ pageSize: 8 }}
      />
    </div>
  )
}

export default UserSelectTable

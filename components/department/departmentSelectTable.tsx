import React, { FC, ReactText, useEffect, useState } from 'react'
import { Input, Row, Table } from 'antd'
import { useQuery } from '@apollo/react-hooks'
import {
  FIND_ALL_DEPARTMENTS,
  FindAllDepartmentsResponse,
} from '~/graphhql/queries/findAllDepartments'

export type DepartmentTableRow = {
  id: number
  name: string
  key: number
}

type DepartmentTableProps = {
  selectType?: 'radio' | 'checkbox'
  onSelected: (arg0: Array<{ id: number; name: string }>) => void
  defaultValues?: Array<Department['id']>
  setFlagHasChangeDepartment?: (hasChange: boolean) => void
}

const DepartmentSelectTable: FC<DepartmentTableProps> = ({
  defaultValues,
  selectType = 'radio',
  setFlagHasChangeDepartment,
  ...props
}) => {
  const { data } = useQuery<FindAllDepartmentsResponse>(FIND_ALL_DEPARTMENTS)
  const [departments, setDepartments] = useState<Array<Department>>([])
  const [selectedKeys, setSelectedKeys] = useState<Array<ReactText>>([])
  const [searchText, setSearchText] = useState<string>()

  useEffect(() => {
    setSelectedKeys(defaultValues === undefined ? [] : defaultValues)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const allDepartments = data?.findAllDepartments
    if (allDepartments === undefined) return
    if (searchText && searchText.length > 0) {
      setDepartments(
        allDepartments.filter((department) => department.name.match(new RegExp(searchText)))
      )
    } else {
      setDepartments(allDepartments)
    }
  }, [data, searchText])

  const columns = [
    {
      title: '部署',
      dataIndex: 'name',
      key: 'name',
    },
  ]

  return (
    <div>
      <Row>
        <Input.Search
          placeholder="部署"
          enterButton
          allowClear
          onSearch={(value) => setSearchText(value)}
        />
      </Row>
      <Table
        style={{ marginTop: '2rem' }}
        size={'small'}
        columns={columns}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          type: selectType,
          onChange: (selectedRowKeys, selectedRows: DepartmentTableRow[]) => {
            setFlagHasChangeDepartment && setFlagHasChangeDepartment(true)
            setSelectedKeys(selectedRowKeys)
            props.onSelected(
              selectedRows.map((row) => ({
                name: row.name,
                id: row.id,
              }))
            )
          },
        }}
        dataSource={departments.map<DepartmentTableRow>((department) => ({
          key: department.id,
          id: department.id,
          name: department.name,
        }))}
        pagination={{ pageSize: 8 }}
      />
    </div>
  )
}

export default DepartmentSelectTable

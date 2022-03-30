import React, { FC, ReactText, useEffect, useState } from 'react'
import { Input, Row, Table } from 'antd'
import { useQuery } from '@apollo/react-hooks'
import {
  FIND_ALL_COMPANIES,
  FindAllCompaniesResponse,
} from '../../graphhql/queries/findAllCompanies'

export type CompanyTableRow = {
  id: number
  name: string
  key: number
}

type CompanyTableProps = {
  selectType?: 'radio' | 'checkbox'
  onSelected: (arg0: Array<{ id: number; name: string }>) => void
  defaultValues?: Array<Company['id']>
}

const CompanySelectTable: FC<CompanyTableProps> = ({
  defaultValues,
  selectType = 'radio',
  ...props
}) => {
  const { data } = useQuery<FindAllCompaniesResponse>(FIND_ALL_COMPANIES)
  const [companies, setCompanies] = useState<Array<Company>>([])
  const [selectedKeys, setSelectedKeys] = useState<Array<ReactText>>([])
  const [searchText, setSearchText] = useState<string>()

  useEffect(() => {
    setSelectedKeys(defaultValues === undefined ? [] : defaultValues)
  }, [defaultValues])

  useEffect(() => {
    const allCompanies = data?.findAllCompanies
    if (allCompanies === undefined) return
    if (searchText && searchText.length > 0) {
      setCompanies(allCompanies.filter((company) => company.name.match(new RegExp(searchText))))
    } else {
      setCompanies(allCompanies)
    }
  }, [data, searchText])

  const columns = [
    {
      title: '事業者',
      dataIndex: 'name',
      key: 'name',
    },
  ]

  return (
    <div>
      <Row>
        <Input.Search
          placeholder="事業者"
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
          onChange: (selectedRowKeys, selectedRows: CompanyTableRow[]) => {
            setSelectedKeys(selectedRowKeys)
            props.onSelected(
              selectedRows.map((row) => ({
                name: row.name,
                id: row.id,
              }))
            )
          },
        }}
        dataSource={companies.map<CompanyTableRow>((company) => ({
          key: company.id,
          id: company.id,
          name: company.name,
        }))}
        pagination={{ pageSize: 8 }}
      />
    </div>
  )
}

export default CompanySelectTable

import React from 'react'
import { Select } from 'antd'
import {
  FIND_ALL_DEPARTMENTS,
  FindAllDepartmentsResponse,
} from '../../graphhql/queries/findAllDepartments'
import { useQuery } from '@apollo/react-hooks'
import { SelectProps } from 'antd/lib/select'
import { SelectValue } from 'antd/lib/tree-select'
import { skipEnter } from '~/lib/keyDown'

type SelectDepartmentProps<T> = SelectProps<T> & { allowAll?: boolean; name: string }

function SelectDepartment<T extends SelectValue>({
  allowAll = false,
  ...props
}: SelectDepartmentProps<T>) {
  const { data } = useQuery<FindAllDepartmentsResponse>(FIND_ALL_DEPARTMENTS)
  return (
    <Select<T>
      {...props}
      onKeyDown={skipEnter}
      allowClear={true}
      placeholder={props.placeholder ? props.placeholder : '部署'}
      options={
        allowAll
          ? [
              { label: 'すべて', value: 0 },
              ...(data?.findAllDepartments.map<{ label: string; value: string }>((department) => ({
                label: department.name,
                value: department.id.toString(),
              })) ?? []),
            ]
          : data?.findAllDepartments.map<{ label: string; value: string }>((department) => ({
              label: department.name,
              value: department.id.toString(),
            }))
      }
    />
  )
}

export default SelectDepartment

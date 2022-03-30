import React, { FC, useState } from 'react'
import { Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { CHANGE_LOGIN_DEPARTMENT } from '~/graphhql/mutations/changeLoginDepartment'
import { useMutation } from '@apollo/react-hooks'
import { useAuth } from '~/hooks/useAuth'
import { useApolloClient } from '@apollo/client'

type SelectLoginDepartmentProps = {
  departments?: Array<Department>
  currentDepartmentId: number
  onChange?: (departmentId: number) => void
}

const SelectLoginDepartment: FC<SelectLoginDepartmentProps> = (props) => {
  const { changeLoginDepartment } = useAuth()
  const [selectedId, setSelectedId] = useState(props.currentDepartmentId)
  const client = useApolloClient()
  const [mutate] = useMutation<ChangeLoginDepartmentResponse>(CHANGE_LOGIN_DEPARTMENT, {
    async onCompleted({
      changeLoginDepartment: { accessToken, departmentId, userDepartmentId, positionWeight },
    }) {
      await changeLoginDepartment(
        accessToken,
        departmentId || -1,
        userDepartmentId || -1,
        positionWeight || -1
      )
      props.onChange && props.onChange(departmentId || -1)
      client.resetStore()
    },
  })

  const onChange = (event: RadioChangeEvent): void => {
    setSelectedId(event.target.value)
    mutate({ variables: { changeDepartmentInput: { departmentId: event.target.value } } })
  }
  return (
    <div className={'department-selector'}>
      <style jsx>{`
        .department-selector
          :global(.ant-radio-group-solid
            .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)) {
          color: white;
          background-color: #1f9973;
          border-color: lightgray;
          border-radius: 0;
        }
        .department-selector :global(.ant-radio-group-solid .ant-radio-button-wrapper) {
          border-color: lightgray;
          border-radius: 0;
        }
      `}</style>
      <Radio.Group
        onChange={onChange}
        defaultValue={selectedId}
        buttonStyle={'solid'}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {props.departments?.map((department) => (
          <Radio.Button key={department.id} value={department.id}>
            {department.name}
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  )
}

export default SelectLoginDepartment

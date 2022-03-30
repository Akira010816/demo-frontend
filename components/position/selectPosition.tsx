import React from 'react'
import { Select } from 'antd'
import { useQuery } from '@apollo/react-hooks'
import { SelectProps } from 'antd/lib/select'
import { SelectValue } from 'antd/lib/tree-select'
import { skipEnter } from '~/lib/keyDown'
import {
  FIND_ALL_POSITIONS,
  FindAllPositionsResponse,
} from '../../graphhql/queries/findAllPositions'

type SelectPositionProps<T> = SelectProps<T> & { allowAll?: boolean; name: string }

function SelectPosition<T extends SelectValue>({
  allowAll = false,
  ...props
}: SelectPositionProps<T>): JSX.Element {
  const { data } = useQuery<FindAllPositionsResponse>(FIND_ALL_POSITIONS)

  return (
    <Select<T>
      {...props}
      onKeyDown={skipEnter}
      allowClear={true}
      placeholder={props.placeholder ? props.placeholder : '役職'}
      options={
        allowAll
          ? [
              { label: 'すべて', value: 0 },
              ...(data?.findAllPositions.map<{ label: string; value: string }>((position) => ({
                label: position.name,
                value: position.id.toString(),
              })) ?? []),
            ]
          : data?.findAllPositions.map<{ label: string; value: string }>((position) => ({
              label: position.name,
              value: position.id.toString(),
            }))
      }
    />
  )
}

export default SelectPosition

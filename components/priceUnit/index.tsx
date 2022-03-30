import React, { FC, CSSProperties, useState } from 'react'
import { Select } from 'antd'
import { SelectProps } from 'antd/es/select'
import { priceUnits } from '~/lib/displaySetting'
import { numberFormatter } from '~/lib/number'

export type PriceUnitProps = {
  defaultValue: PriceUnit['type']
  onChange?: (previousPriceUnit: PriceUnit, nextPriceUnit: PriceUnit) => void
  style?: CSSProperties
}

export const convertValueByCurrentPriceUnit = (
  currentPriceUnit: PriceUnit,
  value: number,
  format?: boolean
): number | string => {
  const digits = Number(
    `1${Array.from({ length: Math.abs(currentPriceUnit.digitLength - 1) })
      .fill(0)
      .join('')}`
  )
  const result = value / Number(digits)
  return format ? numberFormatter.format(result) : result
}

export const PriceUnits: FC<PriceUnitProps> = (props) => {
  const [currentPriceUnit, setCurrentPriceUnit] = useState<PriceUnit | null>(
    priceUnits.filter((priceUnit) => priceUnit.type === props.defaultValue)[0]
  )

  const onChange: SelectProps<PriceUnit['type']>['onChange'] = (priceUnitType) => {
    const targetPriceUnit = priceUnits.filter((priceUnit) => priceUnit.type === priceUnitType)[0]
    if (currentPriceUnit) {
      props.onChange?.(currentPriceUnit, targetPriceUnit)
    }
    setCurrentPriceUnit(targetPriceUnit)
  }

  return (
    <Select {...props} defaultValue={currentPriceUnit?.type} onChange={onChange}>
      {priceUnits.map((priceUnit, index) => (
        <Select.Option
          key={`price-unit-${index}`}
          value={priceUnit.type}
          disabled={priceUnit.type === currentPriceUnit?.type}
        >
          {priceUnit.name}
        </Select.Option>
      ))}
    </Select>
  )
}

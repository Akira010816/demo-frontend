import React, { FC, ReactText, useEffect, useState } from 'react'
import { Col, Row, Input } from 'antd'
import Table from '../table'
import { ColumnsType } from 'antd/es/table'
import { SearchProps } from 'antd/es/input'
import { ModalFuncProps } from 'antd/es/modal'
import { useQuery } from '@apollo/react-hooks'
import Modal from '../modal'
import { displaySetting } from '~/lib/displaySetting'
import { FIND_ALL_MEASURES, FindAllMeasuresResponse } from '~/graphhql/queries/findAllMeasures'
import Button from '~/components/Button'
import { grayButton } from '~/pages/style'

export type MeasureTableRow = {
  id: number
  name: string
  key: number
}

type MeasureTableProps = ModalFuncProps & {
  selectType?: 'radio' | 'checkbox'
  onSelected: (measures: Array<Measure>) => void
  defaultValues?: Array<Measure['id']>
}

/**
 * 既存の施策の追加モーダル
 */
export const AddExistingMeasureModal: FC<MeasureTableProps> = (props) => {
  const [searchText, setSearchText] = useState<string>('')
  const { data } = useQuery<FindAllMeasuresResponse>(FIND_ALL_MEASURES)
  const [measures, setMeasures] = useState<Array<Measure>>([])
  const [selectedKeys, setSelectedKeys] = useState<Array<ReactText>>([])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setSelectedKeys(props.defaultValues === undefined ? [] : props.defaultValues)
  }, [props.defaultValues])

  useEffect(() => {
    const allMeasures = data?.findAllMeasures
    if (allMeasures === undefined) return
    if (searchText && searchText.length > 0) {
      setMeasures(allMeasures.filter((measure) => measure.name?.match(new RegExp(searchText))))
    } else {
      setMeasures(allMeasures)
    }
  }, [data, searchText])

  const columns: ColumnsType<MeasureTableRow> = [
    {
      title: displaySetting.projectCounter.labelConfig.addExistingMeasuresModalHeaderColumn,
      dataIndex: 'name',
      key: 'name',
    },
  ]

  const onSearch: SearchProps['onSearch'] = (input) => {
    setSearchText(input)
  }

  return (
    <Modal.Normal
      {...props}
      onCancel={() => {
        setSelectedKeys([])
        props.onCancel?.()
      }}
      width={'40vw'}
      footer={
        <Row justify="space-between">
          <Button
            key="back"
            type="primary"
            onClick={() => {
              props.onSelected(measures.filter((measure) => selectedKeys.includes(measure.id ?? 0)))
              props.onCancel?.()
            }}
          >
            選択
          </Button>
          <Button
            style={grayButton}
            key="submit"
            onClick={() => {
              setSelectedKeys([])
              props.onCancel?.()
            }}
          >
            キャンセル
          </Button>
        </Row>
      }
    >
      <Row>
        <Col style={{ width: '100%', maxWidth: '400px' }}>
          <Input.Search
            placeholder={displaySetting.projectCounter.labelConfig.searchMeasuresPlaceholder}
            allowClear
            onSearch={onSearch}
            enterButton
          />
        </Col>
      </Row>
      <Table
        style={{ marginTop: '2rem' }}
        size={'small'}
        columns={columns}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          type: props.selectType,
          onChange: (selectedRowKeys) => setSelectedKeys(selectedRowKeys),
        }}
        dataSource={measures.map((measure) => ({
          key: measure.id ?? -1,
          id: measure.id ?? -1,
          name: measure.name ?? '',
        }))}
        pagination={{ pageSize: 8 }}
      />
    </Modal.Normal>
  )
}

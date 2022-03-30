import { FC, useEffect, useState } from 'react'
import { Modal } from 'antd'
import { ModalFuncProps, ModalProps } from 'antd/lib/modal'
import Button from '../Button'
import CompanySelectTable from './companySelectTable'

export type SelectedRows = Array<{ id: number; name: string }>

export type CompanySelectModalProps = ModalProps &
  ModalFuncProps & {
    title?: string
    name?: string
    selectName?: string
    onSelected: (rows: SelectedRows) => void
    visible: boolean
    selectType?: 'radio' | 'checkbox'
    defaultValues?: Array<number>
  }

/**
 * 事業者選択モーダル
 */
const CompanySelectModal: FC<CompanySelectModalProps> = ({
  defaultValues,
  selectType,
  ...props
}: CompanySelectModalProps) => {
  const [selectedRows, setSelectedRows] = useState<SelectedRows>()
  const [defaultSelectedRows, setDefaultSelectedRows] = useState<Array<number>>([])
  useEffect(() => {
    setDefaultSelectedRows(defaultValues === undefined ? [] : defaultValues)
  }, [defaultValues])

  useEffect(() => {
    setSelectedRows(undefined)
  }, [props.visible])

  return (
    <Modal
      {...props}
      title={props.title}
      destroyOnClose={true}
      footer={[
        <Button
          key="back"
          type="primary"
          onClick={() => {
            if (selectedRows) {
              props.onSelected(selectedRows)
            }
            if (props.onOk) {
              props.onOk()
            }
          }}
        >
          選択
        </Button>,
        <Button key="submit" onClick={props.onCancel} type={'ghost'}>
          キャンセル
        </Button>,
      ]}
    >
      <CompanySelectTable
        onSelected={(rows: SelectedRows) => setSelectedRows(rows)}
        selectType={selectType}
        defaultValues={defaultSelectedRows}
      />
    </Modal>
  )
}

export default CompanySelectModal

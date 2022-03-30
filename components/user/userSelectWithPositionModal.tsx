import { FC, useEffect, useState } from 'react'
import { Modal, Row } from 'antd'
import { ModalFuncProps, ModalProps } from 'antd/lib/modal'
import Button from '../Button'
import UserSelectWithPositionTable from './userSelectWithPositionTable'

export type SelectedRowsWithDepartmentId = Array<{
  id: number
  userId: number
  userName: string
  departmentCode: string
  departmentName: string
  positionWeight: number
}>

export type UserSelectWithPositionModalProps = ModalProps &
  ModalFuncProps & {
    title?: string
    name?: string
    selectName?: string
    onSelected: (rows: SelectedRowsWithDepartmentId) => void
    visible: boolean
    selectType?: 'radio' | 'checkbox'
    defaultValues?: Array<number>
    defaultUserId?: number
  }

/**
 * 社員選択(役職選択付き)モーダル
 */
const UserSelectWithPositionModal: FC<UserSelectWithPositionModalProps> = ({
  defaultValues,
  defaultUserId,
  selectType,
  ...props
}: UserSelectWithPositionModalProps) => {
  const [selectedRows, setSelectedRows] = useState<SelectedRowsWithDepartmentId>()
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
      width="960px"
      style={{ top: 10 }}
      bodyStyle={{ height: '550px', paddingTop: 10 }}
      title={props.title}
      destroyOnClose={true}
      footer={[
        <Row key="row" style={{ marginTop: '1rem', marginBottom: '1rem' }} justify={'center'}>
          <Button
            style={{ width: '180px' }}
            disabled={
              !(
                (!selectedRows && defaultSelectedRows.length > 0) ||
                (selectedRows && selectedRows.length > 0)
              )
            }
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
          </Button>
          <Button
            style={{ width: '180px', marginLeft: '24px' }}
            key="submit"
            onClick={props.onCancel}
            type={'ghost'}
          >
            キャンセル
          </Button>
        </Row>,
      ]}
    >
      <UserSelectWithPositionTable
        onSelected={(rows: SelectedRowsWithDepartmentId) => setSelectedRows(rows)}
        selectType={selectType}
        defaultValues={defaultSelectedRows}
        defaultUserId={defaultUserId}
      />
    </Modal>
  )
}

export default UserSelectWithPositionModal

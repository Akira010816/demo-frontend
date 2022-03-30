import React, { FC, useEffect, useState } from 'react'
import { Modal, Button } from 'antd'
import SelectLoginDepartment from './changeDepartment'
import { FIND_PROFILE, FindProfileResponse } from '~/graphhql/queries/findProfile'
import { useQuery } from '@apollo/react-hooks'
import { ModalFuncProps } from 'antd/lib/modal'
import auth from '~/components/auth/authService'
import { useAuth } from '~/hooks/useAuth'

const styleFakeButton = {
  top: '-10px',
  boxShadow: 'none',
  border: 'none',
  background: 'transparent',
  color: 'gray',
  marginLeft: '10px',
  cursor: 'pointer',
  width: 'auto',
}

type ChangeDeparemtnModalProps = ModalFuncProps

/*部署選択モーダル*/
const ChangeDepartmentModal: FC<ChangeDeparemtnModalProps> = ({ title, ...props }) => {
  const { storeDepartmentId, storePositionWeight } = auth()
  const { currentDepartmentId, getProfile } = useAuth()
  const { data, refetch } = useQuery<FindProfileResponse>(FIND_PROFILE, {
    fetchPolicy: 'no-cache',
    onCompleted: async (data) => {
      getProfile(data.findProfile)
      await storeDepartmentId(data.findProfile?.currentDepartmentId || -1)
      await storePositionWeight(data.findProfile?.currentPositionWeight || -1)
    },
    notifyOnNetworkStatusChange: true,
  })
  if (title == undefined) {
    title = 'ログイン部署を変更'
  }
  const [visible, setVisible] = useState(false)
  const [currentDepartment, setCurrentDepartment] = useState<string>()

  useEffect(() => {
    refetch()
    // P2FW-719
  }, [currentDepartmentId, refetch])

  // P2FW-719
  useEffect(() => {
    setCurrentDepartment(
      data?.findProfile?.userDepartments?.filter(
        (ud) => ud.department.id === currentDepartmentId
      )?.[0]?.department.name
    )
  }, [data, currentDepartmentId])

  const onChange = (departmentId: number): void => {
    setCurrentDepartment(
      data?.findProfile?.userDepartments?.filter((ud) => ud.department.id === departmentId)?.[0]
        ?.department.name
    )
  }

  const handleOk = (): void => {
    setVisible(false)
  }

  const handleCancel = (): void => {
    setVisible(false)
  }
  return (
    <>
      <Button style={styleFakeButton} onClick={() => setVisible(true)}>
        <span>{data?.findProfile?.client?.slug ?? ''}</span>
        <br />
        <span>{`${data?.findProfile?.name || 'デモユーザー'} / ${currentDepartment || ''}`}</span>
      </Button>
      <Modal
        {...props}
        title={title}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={<></>}
        visible={visible}
      >
        <SelectLoginDepartment
          onChange={onChange}
          currentDepartmentId={currentDepartmentId ?? 0}
          departments={data?.findProfile?.userDepartments?.map((ud) => ud.department)}
        />
      </Modal>
    </>
  )
}

export default ChangeDepartmentModal

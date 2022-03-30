import { OperationVariables, QueryTuple, useLazyQuery } from '@apollo/react-hooks'
import { FIND_PROFILE, FindProfileResponse } from '~/graphhql/queries/findProfile'
import auth from '~/components/auth/authService'
import { useAuth } from './useAuth'

export const useLazyFindProfile = (
  onCompleted?: () => void
): QueryTuple<FindProfileResponse, OperationVariables> => {
  const { storeDepartmentId, storeUserDepartmentId, storePositionWeight } = auth()
  const { getProfile, changeCurrentUserInfo } = useAuth()
  return useLazyQuery<FindProfileResponse>(FIND_PROFILE, {
    fetchPolicy: 'no-cache',
    onCompleted: async (data) => {
      getProfile(data.findProfile)
      await storeDepartmentId(data.findProfile?.currentDepartmentId || -1)
      await storeUserDepartmentId(data.findProfile?.currentUserDepartmentId || -1)
      await storePositionWeight(data.findProfile?.currentPositionWeight || -1)
      await changeCurrentUserInfo(
        data.findProfile.currentDepartmentId || -1,
        data.findProfile.currentUserDepartmentId || -1,
        data.findProfile.currentPositionWeight || -1
      )
      onCompleted && onCompleted()
    },
    notifyOnNetworkStatusChange: true,
  })
}

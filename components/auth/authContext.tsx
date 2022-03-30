import React from 'react'
import { Position, Profile } from '~/graphhql/queries/findProfile'

const AuthContext = React.createContext<{
  isLoggedIn?: boolean
  userId: number | undefined
  logout: () => void
  currentDepartmentId: number | undefined
  profile: Profile | undefined
  currentUserDepartmentId: number | undefined
  currentPositionWeight: number | undefined
  changeLoginDepartment: (
    accessToken: string,
    departmentId: Department['id'],
    userDepartmentId: UserDepartment['id'],
    positionWeight: Position['weight']
  ) => void
  changeCurrentUserInfo: (
    departmentId: Department['id'],
    userDepartmentId: UserDepartment['id'],
    positionWeight: Position['weight']
  ) => void
  changeUserDepartmentId: (userDepartmentId: UserDepartment['id']) => void
  getProfile: (profile: Profile) => void
}>({
  isLoggedIn: undefined,
  userId: undefined,
  currentDepartmentId: undefined,
  profile: undefined,
  currentUserDepartmentId: undefined,
  logout: async () => null,
  currentPositionWeight: undefined,
  changeLoginDepartment: async () => null,
  changeCurrentUserInfo: async () => null,
  getProfile: () => null,
  changeUserDepartmentId: async () => null,
})

export default AuthContext

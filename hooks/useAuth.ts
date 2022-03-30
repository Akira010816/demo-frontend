import { useContext } from 'react'
import AuthContext from '../components/auth/authContext'
import { Position, Profile } from '~/graphhql/queries/findProfile'

export const useAuth = (): {
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
} => useContext(AuthContext)

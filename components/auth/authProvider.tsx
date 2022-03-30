import React, { useState } from 'react'
import auth from './authService'
import AuthContext from './authContext'
import { useLogout } from '~/hooks/useLogout'
import { Profile } from '~/graphhql/queries/findProfile'
const {
  existsAccessToken,
  getCurrentUserId,
  getCurrentDepartmentId,
  getCurrentUserDepartmentId,
  getCurrentPositionWeight,
  storeToken,
  storeDepartmentId,
  storeUserDepartmentId,
  storePositionWeight,
} = auth()

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const isLoggedIn = existsAccessToken()
  const userId = Number(getCurrentUserId())
  const [currentDepartmentId, setCurrentDepartmentId] = useState(Number(getCurrentDepartmentId()))
  const [profile, setProfile] = useState<Profile | undefined>()
  const [currentUserDepartmentId, setCurrentUserDepartmentId] = useState(
    Number(getCurrentUserDepartmentId())
  )
  const [currentPositionWeight, setCurrentPositionWeight] = useState(
    Number(getCurrentPositionWeight())
  )
  const logout = useLogout()
  const changeLoginDepartment = async (
    accessToken: string,
    departmentId: number,
    userDepartmentId: number,
    positionWeight: number
  ): Promise<void> => {
    storeToken(accessToken)
    storeDepartmentId(departmentId || -1)
    storeUserDepartmentId(userDepartmentId || -1)
    storePositionWeight(positionWeight || -1)
    setCurrentDepartmentId(departmentId)
    setCurrentUserDepartmentId(userDepartmentId)
    setCurrentPositionWeight(positionWeight)
  }

  const changeCurrentUserInfo = async (
    departmentId: number,
    userDepartmentId: number,
    positionWeight: number
  ): Promise<void> => {
    storeDepartmentId(departmentId || -1)
    storeUserDepartmentId(userDepartmentId || -1)
    storePositionWeight(positionWeight || -1)
    setCurrentDepartmentId(departmentId)
    setCurrentUserDepartmentId(userDepartmentId)
    setCurrentPositionWeight(positionWeight)
  }

  const changeUserDepartmentId = async (userDepartmentId: number): Promise<void> => {
    setCurrentUserDepartmentId(userDepartmentId)
  }

  const getProfile = (profile: Profile): void => {
    setProfile(profile)
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        logout,
        userId,
        currentDepartmentId,
        currentUserDepartmentId,
        changeLoginDepartment,
        changeCurrentUserInfo,
        currentPositionWeight,
        profile,
        getProfile,
        changeUserDepartmentId,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

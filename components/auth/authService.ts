type AuthFunctions = {
  storeToken: (token: string) => void
  storeUserId: (usetId: number) => void
  storeDepartmentId: (departmentId: number) => void
  storeUserDepartmentId: (userDepartmentId: number) => void
  storePositionWeight: (positionWeight: number) => void
  clearToken: () => void
  clearUserId: () => void
  clearDepartmentId: () => void
  clearUserDepartmentId: () => void
  getCurrentToken: () => string | null
  getCurrentUserId: () => string | null
  getCurrentDepartmentId: () => string | null
  getCurrentUserDepartmentId: () => string | null
  getCurrentPositionWeight: () => string | null
  existsAccessToken: () => boolean
}

export default function auth(): AuthFunctions {
  const storeKey = 'accessToken'
  const userIdKey = 'userId'
  const departmentIdKey = 'departmentId'
  const userDepartmentIdKey = 'userDepartmentId'
  const positionWeightKey = 'positionWeight'
  const storeToken = (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(storeKey, token)
  }
  const storeUserId = (userId: number): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(userIdKey, userId.toString())
  }
  const storeDepartmentId = (departmentId: number): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(departmentIdKey, departmentId.toString())
  }
  const storeUserDepartmentId = (userDepartmentId: number): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(userDepartmentIdKey, userDepartmentId.toString())
  }
  const storePositionWeight = (positionWeight: number): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(positionWeightKey, positionWeight.toString())
  }
  const clearToken = (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(storeKey)
  }
  const clearUserId = (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(userIdKey)
  }
  const clearDepartmentId = (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(departmentIdKey)
  }
  const clearUserDepartmentId = (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(userDepartmentIdKey)
  }
  const getCurrentToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(storeKey)
  }
  const getCurrentUserId = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(userIdKey)
  }
  const getCurrentDepartmentId = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(departmentIdKey)
  }
  const getCurrentUserDepartmentId = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(userDepartmentIdKey)
  }
  const getCurrentPositionWeight = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(positionWeightKey)
  }
  const existsAccessToken = (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(storeKey) !== null
  }
  return {
    storeToken: storeToken,
    storeUserId: storeUserId,
    storeDepartmentId: storeDepartmentId,
    storeUserDepartmentId: storeUserDepartmentId,
    clearToken: clearToken,
    clearUserId: clearUserId,
    clearDepartmentId: clearDepartmentId,
    clearUserDepartmentId: clearUserDepartmentId,
    getCurrentToken: getCurrentToken,
    getCurrentUserId: getCurrentUserId,
    getCurrentDepartmentId: getCurrentDepartmentId,
    getCurrentUserDepartmentId: getCurrentUserDepartmentId,
    existsAccessToken: existsAccessToken,
    getCurrentPositionWeight: getCurrentPositionWeight,
    storePositionWeight: storePositionWeight,
  }
}

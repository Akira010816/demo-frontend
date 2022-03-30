import auth from '~/components/auth/authService'
import { useRouter } from 'next/router'

export const useLogout = () => {
  const { clearToken, clearUserId, getCurrentUserId, clearDepartmentId } = auth()
  const router = useRouter()
  const isReady = router.isReady
  if (!isReady) return () => Promise.reject(null)
  if (!getCurrentUserId()) return () => new Promise(() => router.push('/'))
  return async () => {
    await clearToken()
    await clearUserId()
    await clearDepartmentId()
    return new Promise(() => router.push('/'))
  }
}

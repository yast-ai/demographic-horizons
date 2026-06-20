import { useCallback, useMemo } from 'react'
import {
  AuthKitProvider,
  useAccessToken,
  useAuth,
} from '@workos/authkit-tanstack-react-start/client'
import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react'
import type { AuthKitProviderProps } from '@workos/authkit-tanstack-react-start/client'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL

const convex = CONVEX_URL
  ? new ConvexReactClient(CONVEX_URL)
  : null

export default function AppConvexProvider({
  children,
  initialAuth,
}: {
  children: React.ReactNode
  initialAuth?: AuthKitProviderProps['initialAuth']
}) {
  if (!convex) {
    return <>{children}</>
  }

  return (
    <AuthKitProvider initialAuth={initialAuth}>
      <ConvexAuthBridge>{children}</ConvexAuthBridge>
    </AuthKitProvider>
  )
}

function ConvexAuthBridge({ children }: { children: React.ReactNode }) {
  if (!convex) return <>{children}</>

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>
      {children}
    </ConvexProviderWithAuth>
  )
}

function useAuthFromAuthKit() {
  const { loading, user } = useAuth()
  const { getAccessToken, refresh } = useAccessToken()

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken?: boolean } = {}) => {
      if (!user) return null

      try {
        if (forceRefreshToken) {
          return (await refresh()) ?? null
        }
        return (await getAccessToken()) ?? null
      } catch (error) {
        console.error('Failed to get WorkOS access token for Convex', error)
        return null
      }
    },
    [getAccessToken, refresh, user],
  )

  return useMemo(
    () => ({
      isLoading: loading,
      isAuthenticated: !!user,
      fetchAccessToken,
    }),
    [fetchAccessToken, loading, user],
  )
}

export { convex }

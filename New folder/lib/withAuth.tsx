'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface WithAuthOptions {
  redirectTo?: string
  loadingMessage?: string
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = '/auth/signin',
    loadingMessage = 'Checking authentication...'
  } = options

  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        const currentPath = window.location.pathname
        const redirectUrl = `${redirectTo}?next=${encodeURIComponent(currentPath)}`
        router.push(redirectUrl)
      }
    }, [user, loading, router])

    if (loading) {
      return <LoadingSpinner message={loadingMessage} />
    }

    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}

export default withAuth
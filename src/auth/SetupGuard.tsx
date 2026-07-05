import { useEffect } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useSetupStatus } from '@/api/hooks/useSetup'

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { data, isLoading, isError } = useSetupStatus()

  const isSetupRoute = pathname === '/setup'
  const isLoginRoute = pathname === '/login'

  useEffect(() => {
    if (isLoading || isError) return

    if (!data?.completed && !isSetupRoute) {
      void navigate({ to: '/setup' })
      return
    }

    if (data?.completed && isSetupRoute) {
      void navigate({ to: '/login' })
    }
  }, [data?.completed, isError, isLoading, isSetupRoute, navigate])

  if (isLoading && !isSetupRoute && !isLoginRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Cargando configuración…
      </div>
    )
  }

  return children
}

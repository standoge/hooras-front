import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/auth/AuthProvider'
import { SetupGuard } from '@/auth/SetupGuard'
import { queryClient } from '@/lib/query-client'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isLoginRoute = pathname === '/login'
  const isSetupRoute = pathname === '/setup'

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SetupGuard>
            <TooltipProvider>
              <AppShell bare={isLoginRoute || isSetupRoute}>
                <Outlet />
              </AppShell>
              <Toaster />
              {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
            </TooltipProvider>
          </SetupGuard>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

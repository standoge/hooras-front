import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { useAuth } from '@/auth/AuthProvider'

export const capabilitiesQueryKey = ['capabilities'] as const

export function useCapabilities() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: capabilitiesQueryKey,
    queryFn: () =>
      api.get('/api/v1/capabilities') as Promise<{
        modules: Array<{ key: string; enabled: boolean }>
      }>,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

export function useEnabledModuleKeys(): Set<string> | null {
  const { data, isLoading, isError } = useCapabilities()

  if (isLoading || isError || !data) return null

  return new Set(data.modules.filter((m) => m.enabled).map((m) => m.key))
}

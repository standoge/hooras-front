import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { setupApi } from '@/api/setup'

export const setupStatusQueryKey = ['setup', 'status'] as const
export const setupModulesQueryKey = ['setup', 'modules'] as const

export function useSetupStatus() {
  return useQuery({
    queryKey: setupStatusQueryKey,
    queryFn: () => setupApi.getStatus(),
    staleTime: 5_000,
  })
}

export function useSetupModules(type?: string) {
  return useQuery({
    queryKey: [...setupModulesQueryKey, type ?? 'all'],
    queryFn: () => setupApi.getModules(type),
    staleTime: 30_000,
  })
}

export function useSetupMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: setupStatusQueryKey })

  return {
    saveInstance: useMutation({
      mutationFn: setupApi.saveInstance,
      onSuccess: invalidate,
    }),
    configureAuthConnector: useMutation({
      mutationFn: (body: Parameters<typeof setupApi.configureConnector>[1]) =>
        setupApi.configureConnector('auth', body),
      onSuccess: invalidate,
    }),
    configureStudentDataConnector: useMutation({
      mutationFn: (body: Parameters<typeof setupApi.configureConnector>[1]) =>
        setupApi.configureConnector('student-data', body),
      onSuccess: invalidate,
    }),
    configureModules: useMutation({
      mutationFn: setupApi.configureModules,
      onSuccess: invalidate,
    }),
    createAdmin: useMutation({
      mutationFn: setupApi.createAdmin,
      onSuccess: invalidate,
    }),
    testConnectors: useMutation({
      mutationFn: setupApi.testConnectors,
    }),
    complete: useMutation({
      mutationFn: setupApi.complete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: setupStatusQueryKey })
      },
    }),
  }
}

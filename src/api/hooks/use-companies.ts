import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/hooks/query-keys'
import type { CompanyInput, CompanyPatch } from '@/api/types'

export function useCompanies() {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: () => api.get('/api/v1/companies'),
  })
}

export function useCompany(companyId: string) {
  return useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => api.get('/api/v1/companies/{companyId}', { path: { companyId } }),
    enabled: Boolean(companyId),
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CompanyInput) => api.post('/api/v1/companies', { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.companies })
    },
  })
}

export function useUpdateCompany(companyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CompanyPatch) =>
      api.patch('/api/v1/companies/{companyId}', { path: { companyId }, body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.companies })
      void queryClient.invalidateQueries({ queryKey: queryKeys.company(companyId) })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (companyId: string) =>
      api.delete('/api/v1/companies/{companyId}', { path: { companyId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.companies })
    },
  })
}

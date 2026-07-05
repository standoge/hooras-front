import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys, type QueryParams } from '@/api/hooks/query-keys'
import type { ApplicationInput, ApplicationStatus, ProjectApplication } from '@/api/types'

export interface ApplicationFilters {
  status?: ApplicationStatus
  projectId?: string
}

export interface ApplicationQueryOptions {
  studentScope?: boolean
}

export function useApplications(
  filters?: ApplicationFilters,
  options?: ApplicationQueryOptions,
) {
  const studentScope = options?.studentScope ?? false
  const params = !studentScope && filters?.status ? { status: filters.status } : undefined

  return useQuery({
    queryKey: studentScope
      ? queryKeys.myApplications(filters as QueryParams | undefined)
      : queryKeys.applications(filters as QueryParams | undefined),
    queryFn: async () => {
      const applications = studentScope
        ? await api.get('/api/v1/me/applications')
        : await api.get('/api/v1/applications', { params })
      return applications as ProjectApplication[]
    },
    select: (applications) => {
      let result = applications
      if (studentScope && filters?.status) {
        result = result.filter((application) => application.status === filters.status)
      }
      if (filters?.projectId) {
        result = result.filter((application) => application.projectId === filters.projectId)
      }
      return result
    },
  })
}

export function useCreateApplication(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ApplicationInput) =>
      api.post('/api/v1/projects/{projectId}/applications', { path: { projectId }, body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] })
      void queryClient.invalidateQueries({ queryKey: ['me', 'applications'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projectApplications(projectId) })
    },
  })
}

export function useApproveApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (applicationId: string) =>
      api.post('/api/v1/applications/{applicationId}/approve', { path: { applicationId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useRejectApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, reason }: { applicationId: string; reason?: string }) =>
      api.post('/api/v1/applications/{applicationId}/reject', {
        path: { applicationId },
        body: { reason },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

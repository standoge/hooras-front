import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys, type QueryParams } from '@/api/hooks/query-keys'
import type { ProjectInput, ProjectPatch, ProjectSourceType, ProjectStatus } from '@/api/types'

export interface ProjectFilters {
  status?: ProjectStatus
  sourceType?: ProjectSourceType
  category?: string
}

export function useProjects(filters?: ProjectFilters) {
  const params = filters as QueryParams | undefined
  return useQuery({
    queryKey: queryKeys.projects(params),
    queryFn: () => api.get('/api/v1/projects', { params }),
  })
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => api.get('/api/v1/projects/{projectId}', { path: { projectId } }),
    enabled: Boolean(projectId),
  })
}

export function useProjectApplications(projectId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.projectApplications(projectId),
    queryFn: () => api.get('/api/v1/applications'),
    select: (applications) => applications.filter((application) => application.projectId === projectId),
    enabled: Boolean(projectId) && enabled,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ProjectInput) => api.post('/api/v1/projects', { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ProjectPatch) =>
      api.patch('/api/v1/projects/{projectId}', { path: { projectId }, body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
    },
  })
}

export function usePublishProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) =>
      api.post('/api/v1/projects/{projectId}/publish', { path: { projectId } }),
    onSuccess: (_data, projectId) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
    },
  })
}

export function useArchiveProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) =>
      api.post('/api/v1/projects/{projectId}/archive', { path: { projectId } }),
    onSuccess: (_data, projectId) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
    },
  })
}

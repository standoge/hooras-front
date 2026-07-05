import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys, type QueryParams } from '@/api/hooks/query-keys'
import type { ApprovalStatus, HourLog, HourLogInput } from '@/api/types'

export interface HourLogFilters {
  assignmentId?: string
  status?: ApprovalStatus
}

export interface HourLogQueryOptions {
  studentScope?: boolean
}

export function useHourLogs(filters?: HourLogFilters, options?: HourLogQueryOptions) {
  const studentScope = options?.studentScope ?? false
  const params = !studentScope ? (filters as QueryParams | undefined) : undefined

  return useQuery({
    queryKey: studentScope
      ? queryKeys.myHourLogs(filters as QueryParams | undefined)
      : queryKeys.hourLogs(params),
    queryFn: async () => {
      if (studentScope) {
        return (await api.get('/api/v1/me/hour-logs')) as unknown as HourLog[]
      }
      return api.get('/api/v1/hour-logs', { params })
    },
    select: (hourLogs) => {
      if (!studentScope || !filters) return hourLogs
      return hourLogs.filter((log) => {
        if (filters.assignmentId && log.assignmentId !== filters.assignmentId) return false
        if (filters.status && log.status !== filters.status) return false
        return true
      })
    },
  })
}

export function useCreateHourLog(options?: HourLogQueryOptions) {
  const studentScope = options?.studentScope ?? false
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: HourLogInput) =>
      studentScope
        ? api.postJson<HourLog>('/api/v1/me/hour-logs', { body })
        : api.post('/api/v1/hour-logs', { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hour-logs'] })
      void queryClient.invalidateQueries({ queryKey: ['me', 'hour-logs'] })
    },
  })
}

export function useApproveHourLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hourLogId: string) =>
      api.post('/api/v1/hour-logs/{hourLogId}/approve', { path: { hourLogId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hour-logs'] })
    },
  })
}

export function useRejectHourLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hourLogId, reason }: { hourLogId: string; reason?: string }) =>
      api.post('/api/v1/hour-logs/{hourLogId}/reject', {
        path: { hourLogId },
        body: { reason: reason ?? '' },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['hour-logs'] })
    },
  })
}

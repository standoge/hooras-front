import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys, type QueryParams } from '@/api/hooks/query-keys'
import type { Assignment, Project } from '@/api/types'

export interface AssignmentFilters {
  studentRef?: string
  projectId?: string
}

export interface AssignmentQueryOptions {
  studentScope?: boolean
}

export type StudentAssignment = Assignment & {
  project?: Pick<Project, 'id' | 'title' | 'organizationName'>
}

export function useAssignments(
  filters?: AssignmentFilters,
  options?: AssignmentQueryOptions,
) {
  const studentScope = options?.studentScope ?? false
  const params = !studentScope ? (filters as QueryParams | undefined) : undefined

  return useQuery({
    queryKey: studentScope
      ? queryKeys.myAssignments(filters as QueryParams | undefined)
      : queryKeys.assignments(params),
    queryFn: async () => {
      if (studentScope) {
        return (await api.get('/api/v1/me/assignments')) as unknown as StudentAssignment[]
      }
      return api.get('/api/v1/assignments', { params })
    },
    select: (assignments) => {
      if (!studentScope || !filters) return assignments
      return assignments.filter((assignment) => {
        if (filters.studentRef && assignment.studentRef !== filters.studentRef) return false
        if (filters.projectId && assignment.projectId !== filters.projectId) return false
        return true
      })
    },
  })
}

export function useSetAssignmentSupervisor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      assignmentId,
      supervisorRef,
    }: {
      assignmentId: string
      supervisorRef: string
    }) =>
      api.put('/api/v1/assignments/{assignmentId}/supervisor', {
        path: { assignmentId },
        body: { supervisorRef },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

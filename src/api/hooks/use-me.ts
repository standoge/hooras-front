import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { parseEvidenceUploadResponse } from '@/api/files'
import { queryKeys } from '@/api/hooks/query-keys'
import type { DocumentUpload } from '@/api/types'

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api.get('/api/v1/me'),
  })
}

export function useStudentProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => api.get('/api/v1/me/profile'),
    enabled,
  })
}

export function useRefreshProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/api/v1/me/profile/refresh'),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile, data)
    },
  })
}

export function useUploadEvidence() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.postFormData('/api/v1/me/evidence', formData)
      return parseEvidenceUploadResponse(response)
    },
  })
}

export function useUploadMyDocument(requirementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.postFormData(
        '/api/v1/me/document-requirements/{requirementId}/upload',
        formData,
        { requirementId },
      )
      return response as DocumentUpload
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myDocumentRequirements })
      void queryClient.invalidateQueries({ queryKey: queryKeys.myDocumentUploads })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys, type QueryParams } from '@/api/hooks/query-keys'
import type {
  ApprovalStatus,
  DocumentRequirement,
  DocumentRequirementInput,
  DocumentUpload,
  DocumentUploadInput,
} from '@/api/types'

export interface DocumentFilters {
  ownerRef?: string
  status?: string
}

export interface DocumentQueryOptions {
  studentScope?: boolean
}

export type MyDocumentRequirement = DocumentRequirement & {
  uploadStatus?: ApprovalStatus | 'missing'
  latestUpload?: DocumentUpload
}

export function useDocumentRequirements(options?: DocumentQueryOptions) {
  const studentScope = options?.studentScope ?? false

  return useQuery({
    queryKey: studentScope ? queryKeys.myDocumentRequirements : queryKeys.documentRequirements,
    queryFn: async () => {
      if (studentScope) {
        return (await api.get('/api/v1/me/document-requirements')) as unknown as MyDocumentRequirement[]
      }
      return api.get('/api/v1/document-requirements')
    },
  })
}

export function useDocuments(filters?: DocumentFilters, options?: DocumentQueryOptions) {
  const studentScope = options?.studentScope ?? false
  const params = !studentScope ? (filters as QueryParams | undefined) : undefined

  return useQuery({
    queryKey: studentScope
      ? queryKeys.myDocumentUploads
      : queryKeys.documents(params),
    queryFn: async () => {
      if (studentScope) {
        return (await api.get('/api/v1/me/document-uploads')) as unknown as DocumentUpload[]
      }
      return api.get('/api/v1/documents', { params })
    },
    select: (documents) => {
      if (!studentScope || !filters) return documents
      return documents.filter((doc) => {
        if (filters.ownerRef && doc.ownerRef !== filters.ownerRef) return false
        if (filters.status && doc.status !== filters.status) return false
        return true
      })
    },
  })
}

export function useCreateDocumentRequirement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: DocumentRequirementInput) =>
      api.post('/api/v1/document-requirements', { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documentRequirements })
    },
  })
}

export function useRegisterDocumentUpload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: DocumentUploadInput) => api.post('/api/v1/documents', { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useApproveDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) =>
      api.post('/api/v1/documents/{documentId}/approve', { path: { documentId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useRejectDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ documentId, reason }: { documentId: string; reason?: string }) =>
      api.post('/api/v1/documents/{documentId}/reject', {
        path: { documentId },
        body: { reason: reason ?? '' },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

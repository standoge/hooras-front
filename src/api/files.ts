import { API_BASE_URL, buildApiUrl, getStoredToken, ApiError } from '@/api/client'

function normalizeStoragePath(storageRef: string): string {
  const trimmed = storageRef.replace(/^\/+/, '')
  if (trimmed.startsWith('api/v1/files/')) {
    return `/${trimmed}`
  }
  return `/api/v1/files/${trimmed}`
}

export function buildFileUrl(storageRef: string): string {
  return new URL(normalizeStoragePath(storageRef), API_BASE_URL).toString()
}

export function parseEvidenceUploadResponse(body: unknown): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (typeof record.id === 'string') return record.id
    if (typeof record.evidenceId === 'string') return record.evidenceId
  }
  throw new Error('Unexpected evidence upload response')
}

export function parseDocumentUploadResponse(body: unknown): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (typeof record.storageRef === 'string') return record.storageRef
    if (typeof record.id === 'string') return record.id
  }
  throw new Error('Unexpected document upload response')
}

export async function fetchAuthenticatedFile(storageRef: string): Promise<Blob> {
  const headers = new Headers()
  const token = getStoredToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildFileUrl(storageRef), { headers })
  if (!response.ok) {
    const text = await response.text()
    let body: unknown = text
    try {
      body = JSON.parse(text) as unknown
    } catch {
      // keep text body
    }
    throw new ApiError(response.status, body)
  }

  return response.blob()
}

export function getEvidenceUploadUrl(): string {
  return buildApiUrl('/api/v1/me/evidence')
}

export function getDocumentUploadUrl(requirementId: string): string {
  return buildApiUrl('/api/v1/me/document-requirements/{requirementId}/upload', {
    requirementId,
  })
}

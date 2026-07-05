type QueryParams = Record<string, string | number | boolean | undefined | null>

export type { QueryParams }

export const queryKeys = {
  me: ['me'] as const,
  profile: ['me', 'profile'] as const,
  projects: (filters?: QueryParams) => ['projects', filters] as const,
  project: (id: string) => ['projects', id] as const,
  projectApplications: (projectId: string) => ['projects', projectId, 'applications'] as const,
  applications: (filters?: QueryParams) => ['applications', filters] as const,
  myApplications: (filters?: QueryParams) => ['me', 'applications', filters] as const,
  assignments: (filters?: QueryParams) => ['assignments', filters] as const,
  myAssignments: (filters?: QueryParams) => ['me', 'assignments', filters] as const,
  hourLogs: (filters?: QueryParams) => ['hour-logs', filters] as const,
  myHourLogs: (filters?: QueryParams) => ['me', 'hour-logs', filters] as const,
  documentRequirements: ['document-requirements'] as const,
  myDocumentRequirements: ['me', 'document-requirements'] as const,
  documents: (filters?: QueryParams) => ['documents', filters] as const,
  myDocumentUploads: ['me', 'document-uploads'] as const,
  rules: (filters?: QueryParams) => ['rules', filters] as const,
  progressReport: ['reports', 'progress'] as const,
  projectReport: ['reports', 'projects'] as const,
  companies: ['companies'] as const,
  company: (id: string) => ['companies', id] as const,
}

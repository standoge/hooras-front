import { buildApiUrl } from './client'

export type SetupTier = 'required' | 'recommended' | 'optional'

export interface SetupModuleOption {
  moduleKey: string
  displayName: string
  version: string
  moduleType: string
  description?: string
  dependencies: string[]
  capabilities: string[]
  features: Array<{
    key: string
    name: string
    description?: string
    default: boolean
    capabilities?: string[]
  }>
  setupTier: SetupTier
  configurationSchema: Record<string, unknown>
  requiredSecrets: string[]
  defaultConfig: { values?: Record<string, unknown>; secrets?: Record<string, string> } | null
  installed: boolean
}

export interface SetupStatus {
  completed: boolean
  collegeName: string
  settings: {
    locale: string
    timezone: string
    demoMode: boolean
    activeConnectors: {
      auth?: string
      student_data?: string
    }
  }
  steps: {
    instance: boolean
    authConnector: boolean
    studentDataConnector: boolean
    modules: boolean
    admin: boolean
  }
  missingRequirements: string[]
}

export interface ConnectorTestResult {
  results: Array<{ type: string; moduleKey: string; ok: boolean; message?: string }>
  allOk: boolean
}

async function setupRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const text = await response.text()
  const body = text ? (JSON.parse(text) as unknown) : undefined

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message?: unknown }).message)
        : `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return body as T
}

export const setupApi = {
  getStatus: () => setupRequest<SetupStatus>('/api/v1/setup/status'),
  getModules: async (type?: string) => {
    const url = buildApiUrl('/api/v1/setup/modules', undefined, type ? { type } : undefined)
    const response = await fetch(url)
    const body = await response.json()
    if (!response.ok) {
      throw new Error(
        body && typeof body === 'object' && 'message' in body
          ? String((body as { message?: unknown }).message)
          : 'Failed to load modules',
      )
    }
    return body as SetupModuleOption[]
  },
  saveInstance: (body: {
    collegeName: string
    locale?: string
    timezone?: string
    demoMode?: boolean
  }) =>
    setupRequest<SetupStatus>('/api/v1/setup/instance', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  configureConnector: (
    type: 'auth' | 'student-data',
    body: {
      moduleKey: string
      useDemoProvider?: boolean
      values?: Record<string, unknown>
      secrets?: Record<string, string>
      features?: Array<{ featureKey: string; enabled: boolean }>
    },
  ) =>
    setupRequest<SetupStatus>(`/api/v1/setup/connectors/${type}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  configureModules: (moduleKeys: string[]) =>
    setupRequest<SetupStatus>('/api/v1/setup/modules', {
      method: 'PUT',
      body: JSON.stringify({ moduleKeys }),
    }),
  createAdmin: (body: {
    username: string
    password: string
    displayName?: string
    email?: string
  }) =>
    setupRequest<SetupStatus>('/api/v1/setup/admin', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  testConnectors: () =>
    setupRequest<ConnectorTestResult>('/api/v1/setup/test', { method: 'POST' }),
  complete: () =>
    setupRequest<{ completed: boolean; completedAt?: string; baseUrl?: string }>(
      '/api/v1/setup/complete',
      { method: 'POST' },
    ),
}

export function expandModuleDependencies(
  selected: string[],
  catalog: SetupModuleOption[],
): string[] {
  const byKey = new Map(catalog.map((m) => [m.moduleKey, m]))
  const result = new Set(selected)

  const visit = (key: string) => {
    const mod = byKey.get(key)
    if (!mod) return
    for (const dep of mod.dependencies) {
      if (!result.has(dep)) {
        result.add(dep)
        visit(dep)
      }
    }
    for (const other of catalog) {
      if (other.moduleType === 'notification_connector' || other.moduleKey === 'notifications') {
        if (selected.includes('applications') || selected.includes('hours') || selected.includes('documents')) {
          result.add('notifications')
        }
      }
    }
  }

  for (const key of selected) visit(key)
  return Array.from(result)
}

export const RECOMMENDED_DOMAIN_MODULES = [
  'rules',
  'projects',
  'assignments',
  'hours',
  'applications',
  'documents',
  'notifications',
]

import type { paths } from './schema'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://social-hours.example.edu'

const TOKEN_STORAGE_KEY = 'hooras-token'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'
type SuccessStatus = 200 | 201 | 202 | 204 | '200' | '201' | '202' | '204'

type OperationPath<Method extends HttpMethod> = {
  [Path in keyof paths]: Method extends keyof paths[Path]
    ? paths[Path][Method] extends never
      ? never
      : Path
    : never
}[keyof paths]

type Operation<Method extends HttpMethod, Path extends OperationPath<Method>> = paths[Path][Method]

type OperationQuery<Method extends HttpMethod, Path extends OperationPath<Method>> =
  Operation<Method, Path> extends { parameters: { query?: infer Query } }
    ? Query extends never
      ? never
      : Query
    : never

type OperationPathParams<Method extends HttpMethod, Path extends OperationPath<Method>> =
  Operation<Method, Path> extends { parameters: { path: infer PathParams } }
    ? PathParams
    : never

type OperationBody<Method extends HttpMethod, Path extends OperationPath<Method>> =
  Operation<Method, Path> extends {
    requestBody?: { content: { 'application/json': infer Body } }
  }
    ? Body
    : never

type OperationResponse<Method extends HttpMethod, Path extends OperationPath<Method>> =
  Operation<Method, Path> extends { responses: infer Responses }
    ? Responses[Extract<keyof Responses, SuccessStatus>] extends {
        content: { 'application/json': infer Body }
      }
      ? Body
      : undefined
    : never

type QueryParams = Record<string, string | number | boolean | undefined | null>

type RequestOptions<Method extends HttpMethod, Path extends OperationPath<Method>> =
  (OperationQuery<Method, Path> extends never
    ? { params?: never }
    : { params?: OperationQuery<Method, Path> }) &
    (OperationPathParams<Method, Path> extends never
      ? { path?: never }
      : { path: OperationPathParams<Method, Path> })

type BodyRequestOptions<Method extends HttpMethod, Path extends OperationPath<Method>> =
  RequestOptions<Method, Path> &
    (OperationBody<Method, Path> extends never
      ? { body?: never }
      : { body?: OperationBody<Method, Path> })

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

let tokenGetter: () => string | null = () => localStorage.getItem(TOKEN_STORAGE_KEY)

export function setTokenGetter(getter: () => string | null) {
  tokenGetter = getter
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

function expandPath(path: string, params?: Record<string, unknown>): string {
  if (!params) return path
  return path.replace(/\{([^}]+)\}/g, (_match, key: string) => {
    const value = params[key]
    return encodeURIComponent(String(value))
  })
}

export function buildApiUrl(
  path: string,
  pathParams?: Record<string, unknown>,
  params?: QueryParams,
): string {
  const url = new URL(expandPath(path, pathParams), API_BASE_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function getErrorMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return undefined
}

async function request<T>(
  path: string,
  init: RequestInit & { params?: QueryParams; pathParams?: Record<string, unknown> } = {},
): Promise<T> {
  const { params, pathParams, headers: initHeaders, ...rest } = init
  const headers = new Headers(initHeaders)

  const token = tokenGetter()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (rest.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildApiUrl(path, pathParams, params), {
    ...rest,
    headers,
  })

  const body = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(response.status, body, getErrorMessage(body))
  }

  return body as T
}

export const api = {
  get<Path extends OperationPath<'get'>>(path: Path, options?: RequestOptions<'get', Path>) {
    return request<OperationResponse<'get', Path>>(path, {
      method: 'GET',
      params: options?.params as QueryParams | undefined,
      pathParams: options?.path as Record<string, unknown> | undefined,
    })
  },
  post<Path extends OperationPath<'post'>>(path: Path, options?: BodyRequestOptions<'post', Path>) {
    return request<OperationResponse<'post', Path>>(path, {
      method: 'POST',
      params: options?.params as QueryParams | undefined,
      pathParams: options?.path as Record<string, unknown> | undefined,
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
    })
  },
  put<Path extends OperationPath<'put'>>(path: Path, options?: BodyRequestOptions<'put', Path>) {
    return request<OperationResponse<'put', Path>>(path, {
      method: 'PUT',
      params: options?.params as QueryParams | undefined,
      pathParams: options?.path as Record<string, unknown> | undefined,
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
    })
  },
  patch<Path extends OperationPath<'patch'>>(path: Path, options?: BodyRequestOptions<'patch', Path>) {
    return request<OperationResponse<'patch', Path>>(path, {
      method: 'PATCH',
      params: options?.params as QueryParams | undefined,
      pathParams: options?.path as Record<string, unknown> | undefined,
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
    })
  },
  delete<Path extends OperationPath<'delete'>>(path: Path, options?: RequestOptions<'delete', Path>) {
    return request<OperationResponse<'delete', Path>>(path, {
      method: 'DELETE',
      params: options?.params as QueryParams | undefined,
      pathParams: options?.path as Record<string, unknown> | undefined,
    })
  },
  postJson<T = unknown>(
    path: string,
    options?: { body?: unknown; path?: Record<string, unknown>; params?: QueryParams },
  ): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      params: options?.params,
      pathParams: options?.path,
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
    })
  },
  postFormData(path: string, formData: FormData, pathParams?: Record<string, unknown>) {
    const headers = new Headers()
    const token = tokenGetter()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return fetch(buildApiUrl(path, pathParams), {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (response) => {
      const body = await parseResponseBody(response)
      if (!response.ok) {
        throw new ApiError(response.status, body, getErrorMessage(body))
      }
      return body
    })
  },
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || 'https://harf.roshan-ai.ir/api'

const API_TOKEN = (import.meta.env.VITE_API_TOKEN as string | undefined)?.trim() || ''

const API_AUTH_HEADER =
  (import.meta.env.VITE_API_AUTH_HEADER as string | undefined)?.trim() || ''

function getAuthorizationValue(): string {
  if (API_AUTH_HEADER.length > 0) {
    return API_AUTH_HEADER
  }

  if (API_TOKEN.length === 0) {
    return ''
  }

  if (API_TOKEN.startsWith('Bearer ') || API_TOKEN.startsWith('Token ')) {
    return API_TOKEN
  }

  return `Bearer ${API_TOKEN}`
}

function extractApiError(payload: unknown): string {
  if (payload && typeof payload === 'object') {
    const details = payload as Record<string, unknown>

    if (typeof details.detail === 'string') {
      return details.detail
    }

    if (typeof details.error === 'string') {
      return details.error
    }

    if (typeof details.message === 'string') {
      return details.message
    }
  }

  return 'خطا در ارتباط با سرور.'
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const authValue = getAuthorizationValue()
  const isFormDataBody = typeof FormData !== 'undefined' && init.body instanceof FormData

  if (authValue.length > 0 && !headers.has('Authorization')) {
    headers.set('Authorization', authValue)
  }

  if (!headers.has('Content-Type') && init.body && !isFormDataBody) {
    headers.set('Content-Type', 'application/json')
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...init,
    headers,
  })

  if (response.status === 204) {
    return {} as T
  }

  const text = await response.text()
  const payload = text.length > 0 ? (JSON.parse(text) as unknown) : null

  if (!response.ok) {
    throw new Error(extractApiError(payload))
  }

  return payload as T
}

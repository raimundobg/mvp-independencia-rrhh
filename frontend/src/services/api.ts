import { auth } from '../firebase'

const BASE = import.meta.env.VITE_API_URL || ''

async function getToken(): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  return user.getIdToken()
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const tok = token || await getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tok}`,
      ...options.headers,
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
  return json.data
}

export const api = {
  get: <T = any>(path: string, token?: string) => request<T>(path, { method: 'GET' }, token),
  post: <T = any>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = any>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export async function downloadFile(path: string, filename: string) {
  const tok = await getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${tok}` }
  })
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

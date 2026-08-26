const TOKEN_KEY = 'esbr_token'

export function getToken (): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken (token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api<T> (path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, { ...options, headers })

  let data: any = null
  try { data = await res.json() } catch { /* noop */ }

  if (!res.ok) {
    const message = data?.error || 'Algo deu errado. Tente novamente.'
    throw new ApiError(res.status, message)
  }
  return data as T
}

export class ApiError extends Error {
  status: number
  constructor (status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function formatMonth (mes: string): string {
  const [y, m] = mes.split('-')
  const nomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return `${nomes[Number(m) - 1]} de ${y}`
}

export function currentMonth (): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

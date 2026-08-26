import { useEffect, useState } from 'react'
import { Loader2, Save, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ApiError, api } from '../lib/api'
import type { Catalog, User } from '../lib/types'

export default function Profile () {
  const { user, setUser } = useAuth()
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [form, setForm] = useState({ nome: '', uf: '', moradores: '1', metaKwh: '' })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api<Catalog>('/catalog').then(setCatalog).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome,
        uf: user.uf || 'SP',
        moradores: String(user.moradores),
        metaKwh: user.metaKwh != null ? String(user.metaKwh) : ''
      })
    }
  }, [user])

  async function handleSubmit (e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        nome: form.nome,
        uf: form.uf,
        moradores: Number(form.moradores) || 1
      }
      if (form.metaKwh && Number(form.metaKwh) > 0) {
        body.metaKwh = Number(form.metaKwh)
      } else {
        body.metaKwh = null
      }
      const res = await api<{ user: User }>('/auth/me', { method: 'PUT', body: JSON.stringify(body) })
      setUser(res.user)
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift">
          <UserCircle size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">Seu perfil</h1>
        <p className="mt-1 text-stone-500">{user.email} · {user.pontos} pontos</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        {saved && (
          <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700" role="status">
            Perfil atualizado com sucesso.
          </div>
        )}

        <div>
          <label className="label" htmlFor="nome">Nome</label>
          <input
            id="nome"
            type="text"
            required
            className="input"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          />
        </div>
        <div>
          <label className="label" htmlFor="uf">Estado</label>
          <select
            id="uf"
            className="input cursor-pointer"
            value={form.uf}
            onChange={(e) => setForm((f) => ({ ...f, uf: e.target.value }))}
          >
            {catalog?.states.map((s) => (
              <option key={s.uf} value={s.uf}>{s.uf} — {s.nome}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-500">Usado para comparar com a média regional.</p>
        </div>
        <div>
          <label className="label" htmlFor="moradores">Moradores da casa</label>
          <input
            id="moradores"
            type="number"
            min={1}
            max={30}
            required
            className="input"
            value={form.moradores}
            onChange={(e) => setForm((f) => ({ ...f, moradores: e.target.value }))}
          />
        </div>
        <div>
          <label className="label" htmlFor="meta">Meta mensal de consumo (kWh)</label>
          <div className="relative">
            <input
              id="meta"
              type="number"
              min={0}
              step="0.1"
              inputMode="decimal"
              className="input pr-16"
              placeholder="ex.: 120"
              value={form.metaKwh}
              onChange={(e) => setForm((f) => ({ ...f, metaKwh: e.target.value }))}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-400">kWh</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Deixe vazio para remover a meta. Dica: a média nacional é {catalog?.mediaNacionalKwh ?? 152} kWh.
          </p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Salvar alterações
        </button>
      </form>
    </div>
  )
}

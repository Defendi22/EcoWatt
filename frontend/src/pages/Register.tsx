import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ApiError, api } from '../lib/api'
import type { Catalog } from '../lib/types'

export default function Register () {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    uf: 'SP',
    moradores: '2'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api<Catalog>('/catalog').then(setCatalog).catch(() => {})
  }, [])

  function set (field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit (e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        uf: form.uf,
        moradores: Number(form.moradores) || 1
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift">
          <Zap size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">Crie sua conta</h1>
        <p className="mt-1 text-stone-500">Comece a economizar energia hoje.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="nome">Seu nome</label>
          <input
            id="nome"
            type="text"
            required
            autoComplete="name"
            className="input"
            placeholder="Maria da Silva"
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="input"
            placeholder="voce@email.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="input"
            placeholder="Mínimo de 6 caracteres"
            value={form.senha}
            onChange={(e) => set('senha', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="uf">Estado</label>
            <select id="uf" className="input cursor-pointer" value={form.uf} onChange={(e) => set('uf', e.target.value)}>
              {catalog?.states.map((s) => (
                <option key={s.uf} value={s.uf}>{s.uf} — {s.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="moradores">Moradores</label>
            <input
              id="moradores"
              type="number"
              min={1}
              max={30}
              required
              className="input"
              value={form.moradores}
              onChange={(e) => set('moradores', e.target.value)}
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Criar conta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">Entrar</Link>
      </p>
    </div>
  )
}

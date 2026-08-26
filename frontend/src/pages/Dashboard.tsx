import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart as LineIcon, PlusCircle, Flame, Users, Landmark, CloudFog, Target, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts'
import { api } from '../lib/api'
import type { Statistics, Reading, Rewards } from '../lib/types'
import Gauge from '../components/Gauge'

export default function Dashboard () {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([
        api<Statistics>('/statistics'),
        api<{ readings: Reading[] }>('/readings')
      ])
      setStats(s)
      setReadings(r.readings)
    } catch {
      setError('Não foi possível carregar seus dados.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function removeReading (id: number) {
    if (!confirm('Excluir este registro?')) return
    try {
      await api<{ rewards: Rewards }>(`/readings/${id}`, { method: 'DELETE' })
      await load()
    } catch { /* noop */ }
  }

  if (loading) {
    return <Skeleton />
  }
  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-stone-600">{error}</p>
        <button onClick={load} className="btn-primary mt-4">Tentar novamente</button>
      </div>
    )
  }
  if (!stats) return null

  const hasData = readings.length > 0
  const currentMonthLabel = stats.current ? formatLongMonth(stats.current.mes) : null

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Olá, {stats.user.nome.split(' ')[0]}!</h1>
          <p className="text-stone-500">
            {stats.badgeCount} medalha(s) · {stats.user.pontos} pontos
            {stats.current && currentMonthLabel ? ` · consumo de ${currentMonthLabel}` : ''}
          </p>
        </div>
        <Link to="/registrar" className="btn-primary">
          <PlusCircle size={18} /> Registrar consumo
        </Link>
      </div>

      {!hasData ? (
        <div className="card py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
            <Flame size={30} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-stone-900">Comece registrando seu consumo</h2>
          <p className="mx-auto mt-2 max-w-md text-stone-600">
            Anote os kWh da sua conta de luz ou estime pelos aparelhos. Em um mês você já terá sua
            primeira comparação com a média dos brasileiros.
          </p>
          <Link to="/registrar" className="btn-primary mt-6">Fazer primeiro registro</Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Flame size={20} />}
              label="Seu consumo (mês atual)"
              value={stats.current ? `${stats.current.kwh}` : '—'}
              unit="kWh"
              tone="brand"
              hint={stats.current ? (stats.current.differenceNational <= 0 ? `Economizou ${Math.abs(stats.current.differenceNational)} kWh vs Brasil` : `+${stats.current.differenceNational} kWh vs Brasil`) : ''}
            />
            <StatCard
              icon={<Users size={20} />}
              label="Média nacional"
              value={`${stats.averages.nacional}`}
              unit="kWh/mês"
              tone="stone"
            />
            <StatCard
              icon={<Landmark size={20} />}
              label={`Média ${stats.user.uf || '—'}`}
              value={`${stats.averages.estadual}`}
              unit="kWh/mês"
              tone="stone"
            />
            <StatCard
              icon={<CloudFog size={20} />}
              label="Pegada de carbono"
              value={`${stats.co2Kg}`}
              unit="kg CO₂"
              tone="energy"
              hint="estimativa do mês"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              {stats.current ? (
                <Gauge kwh={stats.current.kwh} average={stats.averages.nacional} label="Consumo atual vs média nacional" />
              ) : (
                <div className="card flex h-full items-center justify-center text-stone-500">
                  Registre um mês para ver a comparação.
                </div>
              )}
            </div>
            <div className="card lg:col-span-3">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-stone-900">
                <LineIcon size={18} className="text-brand-600" /> Evolução mensal (kWh)
              </h3>
              {stats.evolution.values.length >= 2 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={toChartData(stats.evolution.labels, stats.evolution.values)} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#78716c' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="kWh" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-stone-500">
                  Registre ao menos 2 meses para ver a evolução.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-2">
              <h3 className="mb-4 font-bold text-stone-900">Comparativo — mês atual (kWh)</h3>
              {stats.current ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={[
                      { nome: 'Você', kWh: stats.current.kwh },
                      { nome: 'Nacional', kWh: stats.averages.nacional },
                      { nome: stats.user.uf || 'Seu estado', kWh: stats.averages.estadual }
                    ]}
                    margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis dataKey="nome" tick={{ fontSize: 12, fill: '#78716c' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                    <Tooltip />
                    <Bar dataKey="kWh" radius={[8, 8, 0, 0]}>
                      <Cell fill="#16a34a" />
                      <Cell fill="#a8a29e" />
                      <Cell fill="#f97316" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-stone-500">Sem dados do mês atual.</p>
              )}
            </div>

            <div className="card">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-stone-900">
                <Target size={18} className="text-brand-600" /> Sua meta
              </h3>
              {stats.goal ? (
                <>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="font-mono text-2xl font-bold text-stone-900">{stats.goal.atualKwh}</span>
                    <span className="text-sm text-stone-500">/ {stats.goal.metaKwh} kWh</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${stats.goal.atingida ? 'bg-brand-500' : 'bg-energy-500'}`}
                      style={{ width: `${Math.min(stats.goal.progresso, 100)}%` }}
                    />
                  </div>
                  <p className={`mt-2 text-sm font-medium ${stats.goal.atingida ? 'text-brand-700' : 'text-energy-600'}`}>
                    {stats.goal.atingida ? 'Meta atingida! Parabéns!' : `Faltam ${Math.max(0, stats.goal.metaKwh - stats.goal.atualKwh).toFixed(1)} kWh`}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-stone-500">
                    Defina uma meta mensal de consumo e acompanhe seu progresso.
                  </p>
                  <Link to="/perfil" className="btn-ghost mt-4 w-full !py-2 text-sm">Definir meta</Link>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card">
              <h3 className="mb-4 font-bold text-stone-900">Dicas para economizar</h3>
              {stats.tips.length > 0 ? (
                <ul className="space-y-3">
                  {stats.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-2xl bg-brand-50 p-3 text-sm text-brand-900">
                      <span className="mt-0.5">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-stone-500">Registre um consumo para receber dicas personalizadas.</p>
              )}
            </div>

            <div className="card">
              <h3 className="mb-4 font-bold text-stone-900">Suas medalhas</h3>
              <div className="grid grid-cols-2 gap-3">
                {stats.badges.map((b) => (
                  <div
                    key={b.id}
                    className={`rounded-2xl border p-3 ${b.conquistado ? 'border-brand-200 bg-brand-50' : 'border-stone-100 bg-stone-50 opacity-50'}`}
                    title={b.descricao}
                  >
                    <span className="text-2xl">{b.icone}</span>
                    <p className="mt-1 text-sm font-semibold text-stone-800">{b.nome}</p>
                    <p className="text-xs text-stone-500">{b.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-4 font-bold text-stone-900">Histórico de registros</h3>
            {readings.length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-500">Nenhum registro ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-500">
                      <th className="py-2 pr-4 font-medium">Mês</th>
                      <th className="py-2 pr-4 font-medium">Modo</th>
                      <th className="py-2 pr-4 font-medium">Consumo</th>
                      <th className="py-2 pr-4 font-medium">Comparação</th>
                      <th className="py-2 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((r) => (
                      <tr key={r.id} className="border-b border-stone-50 last:border-0">
                        <td className="py-3 pr-4 font-medium text-stone-800">{formatLongMonth(r.mes)}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.modo === 'conta' ? 'bg-stone-100 text-stone-700' : 'bg-brand-100 text-brand-800'}`}>
                            {r.modo === 'conta' ? 'Conta de luz' : 'Estimativa'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono font-semibold text-stone-800">{r.kwh} kWh</td>
                        <td className="py-3 pr-4">
                          {r.kwh <= 152 ? (
                            <span className="text-brand-700">Abaixo da média</span>
                          ) : (
                            <span className="text-energy-600">Acima da média</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/registrar?editar=${r.id}`}
                            className="mr-2 inline-flex cursor-pointer items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => removeReading(r.id)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            aria-label={`Excluir registro de ${formatLongMonth(r.mes)}`}
                          >
                            <Trash2 size={14} /> Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard ({ icon, label, value, unit, tone, hint }: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  tone: 'brand' | 'stone' | 'energy'
  hint?: string
}) {
  const toneClass = {
    brand: 'bg-brand-50 text-brand-700',
    stone: 'bg-stone-100 text-stone-600',
    energy: 'bg-energy-50 text-energy-600'
  }[tone]
  return (
    <div className="card">
      <div className="flex items-center gap-2">
        <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${toneClass}`}>{icon}</span>
        <p className="text-sm font-medium text-stone-500">{label}</p>
      </div>
      <p className="mt-3 font-mono text-3xl font-bold text-stone-900">{value} <span className="text-sm font-medium text-stone-400">{unit}</span></p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  )
}

function toChartData (labels: string[], values: number[]) {
  return labels.map((mes, i) => ({ mes, kWh: values[i] }))
}

function formatLongMonth (mes: string): string {
  const [y, m] = mes.split('-')
  const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${nomes[Number(m) - 1]} ${y}`
}

function Skeleton () {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6 px-4 py-8">
      <div className="h-10 w-72 rounded-2xl bg-stone-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 rounded-3xl bg-stone-100" />)}
      </div>
      <div className="h-72 rounded-3xl bg-stone-100" />
    </div>
  )
}

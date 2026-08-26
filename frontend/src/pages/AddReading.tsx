import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Calculator, Loader2, Receipt, CheckCircle2, Trash2 } from 'lucide-react'
import { api, currentMonth, formatMonth } from '../lib/api'
import type { Appliance, ApplianceItem, Catalog, Reading, Rewards } from '../lib/types'

type Mode = 'conta' | 'estimativa'

export default function AddReading () {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('editar')

  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [mode, setMode] = useState<Mode>('conta')
  const [mes, setMes] = useState(currentMonth())
  const [kwh, setKwh] = useState('')
  const [items, setItems] = useState<ApplianceItem[]>([])
  const [editing, setEditing] = useState<Reading | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<Rewards | null>(null)

  useEffect(() => {
    api<Catalog>('/catalog').then(setCatalog).catch(() => {})
  }, [])

  useEffect(() => {
    if (!editId) return
    api<{ readings: Reading[] }>('/readings').then(({ readings }) => {
      const found = readings.find((r) => r.id === Number(editId))
      if (found) {
        setEditing(found)
        setMode(found.modo)
        setMes(found.mes)
        setKwh(found.modo === 'conta' ? String(found.kwh) : '')
        setItems(found.aparelhos.length ? found.aparelhos : [{ id: 'geladeira', qtd: 1, horasDia: 12 }])
      }
    }).catch(() => {})
  }, [editId])

  const estimatedKwh = useMemo(() => {
    if (!catalog) return 0
    const total = items.reduce((sum, item) => {
      const a = catalog.appliances.find((x) => x.id === item.id)
      if (!a || !item.qtd || item.horasDia <= 0) return sum
      return sum + (a.potenciaW * item.qtd * item.horasDia * 30) / 1000
    }, 0)
    return Math.round(total * 100) / 100
  }, [items, catalog])

  function addItem () {
    setItems((prev) => [...prev, { id: catalog?.appliances[0]?.id || 'geladeira', qtd: 1, horasDia: 1 }])
  }

  function updateItem (index: number, field: keyof ApplianceItem, value: string | number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: Number(value) || 0 } : it)))
  }

  function removeItem (index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit (e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body: Record<string, unknown> = { mes, modo: mode }
      if (mode === 'conta') {
        body.kwh = Number(kwh)
      } else {
        body.aparelhos = items.filter((it) => it.qtd > 0 && it.horasDia > 0)
      }
      if (editing) {
        body.kwh = Number(kwh)
        await api<{ rewards: Rewards }>(`/readings/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
        navigate('/dashboard')
      } else {
        const res = await api<{ reading: Reading; rewards: Rewards }>('/readings', { method: 'POST', body: JSON.stringify(body) })
        setSuccess(res.rewards)
        setMes(currentMonth())
        setKwh('')
        setItems([{ id: 'geladeira', qtd: 1, horasDia: 12 }])
      }
    } catch (err: any) {
      setError(err?.message || 'Não foi possível salvar o registro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {success && (
        <div className="card mb-6 border-brand-200 bg-brand-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-brand-600" size={26} />
            <div>
              <p className="font-bold text-brand-800">Registro salvo com sucesso!</p>
              {success.newBadges.length > 0 && (
                <p className="text-sm text-brand-700">
                  Novas medalhas: {success.newBadges.map((b) => `${b.icone} ${b.nome}`).join(', ')}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/dashboard" className="btn-primary !py-2 text-sm">Ver painel</Link>
            <button onClick={() => setSuccess(null)} className="btn-ghost !py-2 text-sm">Registrar outro mês</button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          {editing ? `Editar registro de ${formatMonth(editing.mes)}` : 'Registrar consumo'}
        </h1>
        <p className="mt-1 text-stone-500">Escolha como quer informar o consumo de energia.</p>
      </div>

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('conta')}
              className={`flex cursor-pointer flex-col items-start gap-2 rounded-3xl border-2 p-4 text-left transition-all duration-200 ${mode === 'conta' ? 'border-brand-500 bg-brand-50 shadow-soft' : 'border-stone-200 bg-white hover:border-brand-300'}`}
            >
              <Receipt size={22} className={mode === 'conta' ? 'text-brand-600' : 'text-stone-400'} />
              <span className="font-semibold text-stone-900">Conta de luz</span>
              <span className="text-xs text-stone-500">Digite os kWh da sua fatura</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('estimativa')}
              className={`flex cursor-pointer flex-col items-start gap-2 rounded-3xl border-2 p-4 text-left transition-all duration-200 ${mode === 'estimativa' ? 'border-brand-500 bg-brand-50 shadow-soft' : 'border-stone-200 bg-white hover:border-brand-300'}`}
            >
              <Calculator size={22} className={mode === 'estimativa' ? 'text-brand-600' : 'text-stone-400'} />
              <span className="font-semibold text-stone-900">Estimativa</span>
              <span className="text-xs text-stone-500">Calcule pelos aparelhos</span>
            </button>
          </div>

          <div>
            <label className="label" htmlFor="mes">Mês de referência</label>
            <input
              id="mes"
              type="month"
              required
              className="input"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          {mode === 'conta' ? (
            <div>
              <label className="label" htmlFor="kwh">Consumo do mês (kWh)</label>
              <div className="relative">
                <input
                  id="kwh"
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  inputMode="decimal"
                  className="input pr-16"
                  placeholder="ex.: 152"
                  value={kwh}
                  onChange={(e) => setKwh(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-400">kWh</span>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                Procure o campo "consumo em kWh" na sua conta de luz, geralmente na coluna de leitura.
              </p>
            </div>
          ) : (
            <div className="card space-y-3 !p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-stone-800">Aparelhos</p>
                <button type="button" onClick={addItem} className="btn-ghost !py-1.5 !px-3 text-xs">
                  + Adicionar aparelho
                </button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="flex flex-wrap items-end gap-3 rounded-2xl bg-stone-50 p-3">
                  <div className="min-w-40 flex-1">
                    <label className="label !mb-1 text-xs">Aparelho</label>
                    <select
                      className="input cursor-pointer !py-2 text-sm"
                      value={item.id}
                      onChange={(e) => updateItem(index, 'id', e.target.value)}
                    >
                      {catalog?.appliances.map((a: Appliance) => (
                        <option key={a.id} value={a.id}>
                          {a.nome} ({a.potenciaW}W)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="label !mb-1 text-xs">Qtd</label>
                    <input
                      type="number"
                      min={1}
                      className="input !py-2 text-sm"
                      value={item.qtd}
                      onChange={(e) => updateItem(index, 'qtd', e.target.value)}
                    />
                  </div>
                  <div className="w-28">
                    <label className="label !mb-1 text-xs">Horas/dia</label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      className="input !py-2 text-sm"
                      value={item.horasDia}
                      onChange={(e) => updateItem(index, 'horasDia', e.target.value)}
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mb-1 inline-flex cursor-pointer items-center justify-center rounded-xl p-2 text-red-500 transition-colors hover:bg-red-50"
                      aria-label="Remover aparelho"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between rounded-2xl bg-brand-600 p-4 text-white">
                <span className="text-sm font-medium">Consumo estimado no mês</span>
                <span className="font-mono text-2xl font-bold">{estimatedKwh} kWh</span>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : editing ? 'Salvar alterações' : 'Salvar registro'}
          </button>
        </form>
      )}
    </div>
  )
}

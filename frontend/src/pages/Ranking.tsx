import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Medal, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import type { RankingEntry } from '../lib/types'

export default function Ranking () {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ ranking: RankingEntry[] }>('/ranking')
      .then((d) => setRanking(d.ranking))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-energy-400 to-energy-600 text-white shadow-lift">
          <Trophy size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">Ranking da economia</h1>
        <p className="mt-1 text-stone-500">
          Quem mais economiza em relação à média nacional ({152} kWh/mês).
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-brand-600" />
        </div>
      ) : ranking.length === 0 ? (
        <div className="card py-14 text-center">
          <p className="text-stone-600">Nenhum registro ainda no ranking.</p>
          <Link to="/registrar" className="btn-primary mt-4">Seja o primeiro</Link>
        </div>
      ) : (
        <div className="card overflow-hidden !p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-stone-500">
                <th className="px-5 py-3 font-medium">Posição</th>
                <th className="px-5 py-3 font-medium">Usuário</th>
                <th className="px-5 py-3 font-medium text-right">Média (kWh)</th>
                <th className="px-5 py-3 font-medium text-right">Economia</th>
                <th className="hidden px-5 py-3 font-medium text-right sm:table-cell">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, index) => (
                <tr key={entry.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/60">
                  <td className="px-5 py-3">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      index === 0 ? 'bg-energy-100 text-energy-600'
                      : index === 1 ? 'bg-stone-200 text-stone-700'
                      : index === 2 ? 'bg-amber-100 text-amber-700'
                      : 'bg-stone-100 text-stone-500'
                    }`}>
                      {index === 0 ? <Medal size={16} /> : index + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-stone-800">{entry.nome}</p>
                    <p className="text-xs text-stone-400">{entry.uf || 'Brasil'} · {entry.leituras} registro(s)</p>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-stone-600">{entry.mediaKwh}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${entry.economiaPercent > 0 ? 'bg-brand-50 text-brand-700' : 'bg-energy-50 text-energy-600'}`}>
                      {entry.economiaPercent > 0 ? `${entry.economiaPercent}% abaixo` : `${Math.abs(entry.economiaPercent)}% acima`}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-right font-semibold text-stone-700 sm:table-cell">{entry.pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

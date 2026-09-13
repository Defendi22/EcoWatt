import { useState } from "react";
import { EnergyEntry, REGIONAL_AVG, BRAZIL_AVG, MONTHS_FULL } from "../App";

interface Props {
  entries: EnergyEntry[];
  onDelete: (id: string) => void;
}

function formatMonth(m: string) {
  const [year, mon] = m.split("-");
  return `${MONTHS_FULL[parseInt(mon) - 1]} ${year}`;
}

function getStatus(e: EnergyEntry): { label: string; color: string; icon: string } {
  const r = REGIONAL_AVG[e.region];
  if (e.kwh < BRAZIL_AVG && e.kwh < r) {
    return { label: "Abaixo de todas as médias", color: "text-yellow-400", icon: "🏆" };
  }
  if (e.kwh < r) {
    return { label: "Abaixo da média regional", color: "text-emerald-400", icon: "🌟" };
  }
  if (e.kwh < BRAZIL_AVG) {
    return { label: "Abaixo da média nacional", color: "text-blue-400", icon: "✅" };
  }
  return { label: "Acima das médias", color: "text-orange-400", icon: "📈" };
}

export default function History({ entries, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...entries].sort((a, b) => b.month.localeCompare(a.month));

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="text-5xl">📋</div>
        <h2 className="text-xl font-bold text-white">Nenhum lançamento ainda</h2>
        <p className="text-slate-400 text-sm max-w-xs">
          Adicione seu primeiro lançamento na aba "Lançar" para ver seu histórico aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Histórico</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {entries.length} lançamento{entries.length !== 1 ? "s" : ""} registrado{entries.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Region Filter Info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
        <p className="text-xs text-slate-400 text-center">
          Médias: 🇧🇷 Brasil = <span className="text-white font-semibold">{BRAZIL_AVG} kWh</span> &nbsp;|&nbsp;
          Veja detalhes regionais em cada lançamento
        </p>
      </div>

      <div className="space-y-3">
        {sorted.map((entry, idx) => {
          const prev = sorted[idx + 1]; // previous chronologically (next in desc order)
          const status = getStatus(entry);
          const vsPrev = prev
            ? ((entry.kwh - prev.kwh) / prev.kwh) * 100
            : null;
          const isExpanded = expandedId === entry.id;
          const regionalAvg = REGIONAL_AVG[entry.region];

          return (
            <div
              key={entry.id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <button
                className="w-full text-left p-4"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{status.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {formatMonth(entry.month)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {entry.region} · {entry.kwh} kWh · R$ {entry.value.toFixed(2)}
                      </p>
                      <p className={`text-xs mt-1 font-medium ${status.color}`}>
                        {status.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {vsPrev !== null && (
                      <div
                        className={`text-xs font-bold ${
                          vsPrev < 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {vsPrev < 0 ? "▼" : "▲"} {Math.abs(vsPrev).toFixed(1)}%
                      </div>
                    )}
                    <div className="text-slate-600 text-xs mt-1">
                      {isExpanded ? "▲" : "▼"}
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 p-4 space-y-4">
                  {/* Comparison Bars */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Comparação
                    </p>

                    <HistoryBar
                      label="Seu consumo"
                      value={entry.kwh}
                      reference={Math.max(entry.kwh, regionalAvg, BRAZIL_AVG) * 1.05}
                      color="#FBBF24"
                    />
                    <HistoryBar
                      label={`Média ${entry.region}`}
                      value={regionalAvg}
                      reference={Math.max(entry.kwh, regionalAvg, BRAZIL_AVG) * 1.05}
                      color="#60A5FA"
                    />
                    <HistoryBar
                      label="Média Brasil"
                      value={BRAZIL_AVG}
                      reference={Math.max(entry.kwh, regionalAvg, BRAZIL_AVG) * 1.05}
                      color="#34D399"
                    />
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 rounded-xl p-2.5">
                      <p className="text-slate-500">Tarifa média</p>
                      <p className="text-white font-semibold mt-0.5">
                        R$ {(entry.value / entry.kwh).toFixed(3)}/kWh
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5">
                      <p className="text-slate-500">vs. Mês anterior</p>
                      <p
                        className={`font-semibold mt-0.5 ${
                          vsPrev === null
                            ? "text-slate-400"
                            : vsPrev < 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {vsPrev === null
                          ? "—"
                          : `${vsPrev < 0 ? "▼" : "▲"} ${Math.abs(vsPrev).toFixed(1)}%`}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5">
                      <p className="text-slate-500">vs. Regional</p>
                      <p
                        className={`font-semibold mt-0.5 ${
                          entry.kwh < regionalAvg ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {entry.kwh < regionalAvg ? "▼" : "▲"}{" "}
                        {Math.abs(((entry.kwh - regionalAvg) / regionalAvg) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5">
                      <p className="text-slate-500">vs. Nacional</p>
                      <p
                        className={`font-semibold mt-0.5 ${
                          entry.kwh < BRAZIL_AVG ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {entry.kwh < BRAZIL_AVG ? "▼" : "▲"}{" "}
                        {Math.abs(((entry.kwh - BRAZIL_AVG) / BRAZIL_AVG) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {entry.note && (
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">📝 Observação</p>
                      <p className="text-xs text-slate-300">{entry.note}</p>
                    </div>
                  )}

                  {/* Delete */}
                  {confirmDelete === entry.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onDelete(entry.id);
                          setConfirmDelete(null);
                        }}
                        className="flex-1 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold py-2 rounded-xl"
                      >
                        Confirmar exclusão
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="flex-1 bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold py-2 rounded-xl"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(entry.id)}
                      className="w-full text-xs text-red-400/60 hover:text-red-400 transition-colors py-1"
                    >
                      🗑️ Excluir lançamento
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-600 pb-2">
        Dados armazenados localmente no seu dispositivo
      </p>
    </div>
  );
}

function HistoryBar({
  label, value, reference, color,
}: {
  label: string; value: number; reference: number; color: string;
}) {
  const pct = (value / reference) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value} kWh</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

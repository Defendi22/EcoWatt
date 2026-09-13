"use client";

import { useState, useEffect, useCallback } from "react";
import EnergyForm from "@/components/EnergyForm";
import CelebrationBanner from "@/components/CelebrationBanner";
import HistoryList from "@/components/HistoryList";
import StatsOverview from "@/components/StatsOverview";
import { EnergyRecord } from "@/db/schema";
import { compareEnergy, ComparisonResult } from "@/lib/energyData";

type Tab = "lancamento" | "historico" | "stats";

export default function Home() {
  const [records, setRecords] = useState<EnergyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [lastResult, setLastResult] = useState<ComparisonResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("lancamento");
  const [showSaved, setShowSaved] = useState(false);

  const fetchRecords = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/energy?userId=default");
      const data = await res.json();
      setRecords(data.records ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSave = async (data: {
    month: number;
    year: number;
    kwh: number;
    valueReais: number;
    region: string;
    notes: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "default", ...data }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");

      await fetchRecords();

      // Find previous month record for comparison
      const sortedRecords = [...records].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

      // Find the most recent record before the current entry
      const previousRecord = sortedRecords.find(
        (r) =>
          r.year < data.year ||
          (r.year === data.year && r.month < data.month)
      );

      const result = compareEnergy(
        data.kwh,
        previousRecord?.kwh ?? null,
        data.region,
        data.valueReais
      );

      setLastResult(result);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);

      // Switch to launch tab to show the result
      setActiveTab("lancamento");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar lançamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja excluir este lançamento?")) return;
    try {
      await fetch(`/api/energy?id=${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (lastResult) setLastResult(null);
    } catch (e) {
      console.error(e);
    }
  };

  const defaultRegion = records.length > 0 ? records[0].region : "Sudeste";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f4c35 0%, #166534 40%, #14532d 70%, #052e16 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url(/images/hero-bg.jpg)" }} />
        <div className="relative px-4 pt-10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-400/20 border border-green-300/30 text-green-300 text-[11px] font-bold px-3 py-1 rounded-full mb-3">
            ⚡ PROJETO UNIVERSITÁRIO
          </div>
          <h1 className="text-2xl font-black text-white leading-tight">
            EcoEnergia
          </h1>
          <p className="text-green-300 text-sm mt-1 font-medium">
            Monitor de consumo de energia elétrica
          </p>
          <p className="text-green-200/60 text-xs mt-1">
            Compare com a média nacional e regional brasileira
          </p>

          {/* Pill Stats */}
          {records.length > 0 && (
            <div className="mt-4 flex justify-center gap-2 flex-wrap">
              <span className="bg-white/10 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                📊 {records.length} {records.length === 1 ? "lançamento" : "lançamentos"}
              </span>
              <span className="bg-white/10 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                ⚡ Média: {(records.reduce((s, r) => s + r.kwh, 0) / records.length).toFixed(1)} kWh/mês
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="flex max-w-md mx-auto">
          {(
            [
              { key: "lancamento", label: "⚡ Lançar", },
              { key: "historico", label: "📋 Histórico" },
              { key: "stats", label: "📈 Resumo" },
            ] as { key: Tab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3.5 text-xs font-bold transition-all border-b-2 ${
                activeTab === tab.key
                  ? "border-green-400 text-green-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-5 space-y-4 pb-24">
        {/* Saved toast */}
        {showSaved && (
          <div className="bg-green-500 text-white text-sm font-bold px-4 py-3 rounded-xl shadow-lg text-center animate-bounce">
            ✅ Lançamento salvo com sucesso!
          </div>
        )}

        {/* Tab: Lançamento */}
        {activeTab === "lancamento" && (
          <>
            {/* Result Banner */}
            {lastResult && (
              <CelebrationBanner result={lastResult} />
            )}

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-5 py-4">
                <h2 className="text-white font-black text-base">Novo Lançamento</h2>
                <p className="text-green-100 text-xs mt-0.5">Informe os dados da sua conta de energia</p>
              </div>
              <div className="p-5">
                <EnergyForm
                  onSave={handleSave}
                  loading={loading}
                  defaultRegion={defaultRegion}
                />
              </div>
            </div>

            {/* National Averages Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                <span>🗺️</span> Médias por Região (EPE 2024)
              </h3>
              <div className="space-y-2">
                {[
                  { r: "Norte", kwh: 204.5, color: "bg-blue-400" },
                  { r: "Nordeste", kwh: 131.1, color: "bg-yellow-400" },
                  { r: "Sudeste", kwh: 174.7, color: "bg-purple-400" },
                  { r: "Sul", kwh: 198.9, color: "bg-teal-400" },
                  { r: "Centro-Oeste", kwh: 203.1, color: "bg-orange-400" },
                ].map(({ r, kwh, color }) => {
                  const pct = (kwh / 250) * 100;
                  return (
                    <div key={r}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-500">{r}</span>
                        <span className="font-bold text-slate-700">{kwh} kWh/mês</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-1 text-[10px] text-slate-400">
                  Média nacional: 166,5 kWh/mês · Fonte: Anuário EPE 2024 (base 2023)
                </div>
              </div>
            </div>

            {/* Tips card */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-1">
                <span>💡</span> Dicas para Economizar
              </h3>
              <ul className="space-y-1.5">
                {[
                  "Desligue aparelhos em standby — podem representar até 12% da conta",
                  "Prefira lâmpadas LED (consomem 80% menos que incandescentes)",
                  "Evite abrir a geladeira repetidamente",
                  "Use chuveiro elétrico no modo verão",
                  "Agende o uso de máquinas de lavar fora do horário de pico",
                ].map((tip, i) => (
                  <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">▸</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Tab: Histórico */}
        {activeTab === "historico" && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4">
              <h2 className="text-white font-black text-base">Histórico de Lançamentos</h2>
              <p className="text-slate-300 text-xs mt-0.5">Seus registros mensais de energia</p>
            </div>
            <div className="p-4">
              {fetching ? (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-3xl mb-2 animate-spin">⚡</div>
                  <p className="text-sm">Carregando...</p>
                </div>
              ) : (
                <HistoryList records={records} onDelete={handleDelete} />
              )}
            </div>
          </div>
        )}

        {/* Tab: Stats */}
        {activeTab === "stats" && (
          <>
            {fetching ? (
              <div className="text-center py-12 text-slate-400">
                <div className="text-3xl mb-2 animate-spin">⚡</div>
                <p className="text-sm">Carregando...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-10 text-center">
                <div className="text-5xl mb-3">📊</div>
                <h3 className="font-bold text-slate-700 mb-1">Sem dados ainda</h3>
                <p className="text-sm text-slate-400">
                  Adicione pelo menos um lançamento para ver seu resumo.
                </p>
              </div>
            ) : (
              <>
                <StatsOverview records={records} />

                {/* Monthly Chart */}
                <div className="bg-white rounded-2xl shadow-xl p-5">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                    <span>📉</span> Evolução do Consumo
                  </h3>
                  <MonthlyChart records={records} />
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-700 py-2 text-center">
        <p className="text-[10px] text-slate-500">
          EcoEnergia · Projeto de Faculdade · Dados: EPE/ANEEL 2024
        </p>
      </footer>
    </div>
  );
}

function MonthlyChart({ records }: { records: EnergyRecord[] }) {
  const sorted = [...records]
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    })
    .slice(-12); // last 12

  if (sorted.length === 0) return null;

  const maxKwh = Math.max(...sorted.map((r) => r.kwh));
  const nationalAvg = 166.5;

  const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div>
      <div className="flex items-end gap-1.5 h-32">
        {sorted.map((r) => {
          const heightPct = (r.kwh / (maxKwh * 1.15)) * 100;
          const isBetter = r.kwh < nationalAvg;
          return (
            <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-[9px] text-slate-500 font-bold">{r.kwh.toFixed(0)}</div>
              <div className="w-full relative" style={{ height: "80px" }}>
                <div
                  className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${
                    isBetter ? "bg-green-400" : "bg-red-400"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X labels */}
      <div className="flex gap-1.5 mt-1">
        {sorted.map((r) => (
          <div key={r.id} className="flex-1 text-center text-[9px] text-slate-400">
            {MONTHS_SHORT[r.month - 1]}
            <br />
            {String(r.year).slice(2)}
          </div>
        ))}
      </div>

      {/* National avg line label */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <span className="text-[10px] text-slate-500">Abaixo da média nacional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-400" />
          <span className="text-[10px] text-slate-500">Acima da média nacional (166,5 kWh)</span>
        </div>
      </div>
    </div>
  );
}

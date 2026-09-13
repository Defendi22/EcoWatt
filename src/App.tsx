import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import NewEntry from "./components/NewEntry";
import History from "./components/History";
import Celebration from "./components/Celebration";

export type Region = "Norte" | "Nordeste" | "Sudeste" | "Sul" | "Centro-Oeste";

export interface EnergyEntry {
  id: string;
  month: string; // "YYYY-MM"
  value: number; // R$
  kwh: number;
  region: Region;
  note?: string;
  createdAt: string;
}

const STORAGE_KEY = "energytrack_entries";

export function loadEntries(): EnergyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: EnergyEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export type Tab = "dashboard" | "new" | "history";

export default function App() {
  const [entries, setEntries] = useState<EnergyEntry[]>(loadEntries);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [celebration, setCelebration] = useState<{
    show: boolean;
    message: string;
    type: "great" | "good" | "warning";
  }>({ show: false, message: "", type: "great" });

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const addEntry = (entry: EnergyEntry) => {
    const updated = [...entries, entry].sort((a, b) =>
      a.month.localeCompare(b.month)
    );
    setEntries(updated);

    // Check for celebration
    const prev = entries
      .filter((e) => e.region === entry.region)
      .sort((a, b) => b.month.localeCompare(a.month))[0];

    const regionalAvg = REGIONAL_AVG[entry.region];
    const brazilAvg = BRAZIL_AVG;

    let msg = "";
    let type: "great" | "good" | "warning" = "good";

    if (prev && entry.kwh < prev.kwh) {
      const pct = (((prev.kwh - entry.kwh) / prev.kwh) * 100).toFixed(1);
      if (entry.kwh < brazilAvg && entry.kwh < regionalAvg) {
        msg = `🏆 Incrível! Você reduziu ${pct}% vs mês anterior e está abaixo da média brasileira e regional! Parabéns pela economia!`;
        type = "great";
      } else if (entry.kwh < regionalAvg) {
        msg = `🌟 Ótimo! Você reduziu ${pct}% e está abaixo da média regional da sua região! Continue assim!`;
        type = "great";
      } else if (entry.kwh < brazilAvg) {
        msg = `⚡ Bom trabalho! Reduziu ${pct}% e está abaixo da média nacional. Você está contribuindo para a economia de energia!`;
        type = "good";
      } else {
        msg = `👍 Você reduziu ${pct}% em relação ao mês anterior! Continue reduzindo para ficar abaixo das médias!`;
        type = "good";
      }
    } else if (entry.kwh < brazilAvg && entry.kwh < regionalAvg) {
      msg = `✅ Seu consumo está abaixo da média brasileira (${brazilAvg} kWh) e regional (${regionalAvg} kWh)! Você é um exemplo de economia!`;
      type = "great";
    } else if (entry.kwh < regionalAvg) {
      msg = `🌱 Seu consumo está abaixo da média regional (${regionalAvg} kWh)! Bom trabalho pela sustentabilidade!`;
      type = "good";
    } else if (entry.kwh < brazilAvg) {
      msg = `💡 Seu consumo está abaixo da média nacional (${brazilAvg} kWh)! Você contribui para a economia de energia!`;
      type = "good";
    } else {
      msg = `📊 Lançamento registrado! Seu consumo está acima das médias. Tente reduzir apagando luzes e desligando aparelhos em standby!`;
      type = "warning";
    }

    setCelebration({ show: true, message: msg, type });
    setActiveTab("dashboard");
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {celebration.show && (
        <Celebration
          message={celebration.message}
          type={celebration.type}
          onClose={() => setCelebration((c) => ({ ...c, show: false }))}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-white">EnergyTrack</h1>
            <p className="text-xs text-blue-300">Monitor de Conta de Luz</p>
          </div>
          <div className="ml-auto text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
            {entries.length} lançamento{entries.length !== 1 ? "s" : ""}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pb-28 pt-4">
        {activeTab === "dashboard" && (
          <Dashboard entries={entries} onNewEntry={() => setActiveTab("new")} />
        )}
        {activeTab === "new" && (
          <NewEntry entries={entries} onAdd={addEntry} onCancel={() => setActiveTab("dashboard")} />
        )}
        {activeTab === "history" && (
          <History entries={entries} onDelete={deleteEntry} />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-white/10">
        <div className="max-w-lg mx-auto px-4 flex">
          {(
            [
              { id: "dashboard", icon: "📊", label: "Painel" },
              { id: "new", icon: "➕", label: "Lançar" },
              { id: "history", icon: "📋", label: "Histórico" },
            ] as { id: Tab; icon: string; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
                activeTab === tab.id
                  ? "text-yellow-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 mx-auto w-12 h-0.5 bg-yellow-400 rounded-full" style={{position:'relative'}} />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Médias regionais kWh/mês - EPE Anuário Estatístico 2024 (base 2023)
export const REGIONAL_AVG: Record<Region, number> = {
  Norte: 204.5,
  Nordeste: 131.1,
  Sudeste: 174.7,
  Sul: 198.9,
  "Centro-Oeste": 203.1,
};

export const BRAZIL_AVG = 172.0;

export const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export const MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

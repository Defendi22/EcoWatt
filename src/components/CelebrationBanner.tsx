"use client";

import { useEffect, useState } from "react";
import { ComparisonResult } from "@/lib/energyData";

interface CelebrationBannerProps {
  result: ComparisonResult | null;
}

const levelConfig = {
  0: {
    bg: "from-slate-600 to-slate-700",
    border: "border-slate-400",
    icon: "💡",
    title: "Análise do seu consumo",
  },
  1: {
    bg: "from-green-500 to-teal-600",
    border: "border-green-300",
    icon: "🌱",
    title: "Parabéns! Você está no caminho certo!",
  },
  2: {
    bg: "from-blue-500 to-indigo-600",
    border: "border-blue-300",
    icon: "🥇",
    title: "Excelente! Você é um exemplo!",
  },
  3: {
    bg: "from-yellow-400 to-orange-500",
    border: "border-yellow-200",
    icon: "🏆",
    title: "INCRÍVEL! Você é um campeão de economia!",
  },
};

export default function CelebrationBanner({ result }: CelebrationBannerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (result) {
      setShow(false);
      const t = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(t);
    }
  }, [result]);

  if (!result) return null;

  const config = levelConfig[result.celebrationLevel];

  return (
    <div
      className={`transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Main Banner */}
      <div className={`bg-gradient-to-br ${config.bg} rounded-2xl p-5 text-white shadow-xl border ${config.border} mb-4`}>
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{config.icon}</div>
          <h2 className="text-lg font-black leading-tight">{config.title}</h2>
        </div>

        {result.celebrationMessages.length > 0 && (
          <ul className="space-y-2">
            {result.celebrationMessages.map((msg, i) => (
              <li
                key={i}
                className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 text-sm font-medium leading-snug"
              >
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard
          label="vs. Mês ant."
          value={result.diffFromPrevious}
          icon={result.diffFromPrevious === null ? "—" : result.isBetterThanPrevious ? "⬇️" : "⬆️"}
          good={result.isBetterThanPrevious}
          unit="kWh"
          showNA={result.diffFromPrevious === null}
        />
        <StatCard
          label="vs. Média BR"
          value={result.diffFromNational}
          icon={result.isBetterThanNational ? "⬇️" : "⬆️"}
          good={result.isBetterThanNational}
          unit="kWh"
        />
        <StatCard
          label={`vs. ${result.region}`}
          value={result.diffFromRegional}
          icon={result.isBetterThanRegional ? "⬇️" : "⬆️"}
          good={result.isBetterThanRegional}
          unit="kWh"
        />
      </div>

      {/* Savings Block */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-1">
          <span>💰</span> Economia estimada
        </h3>
        <div className="space-y-2">
          {result.savingsVsPrevious !== null && (
            <SavingRow
              label="Em relação ao mês anterior"
              value={result.savingsVsPrevious}
            />
          )}
          <SavingRow
            label="Em relação à média nacional"
            value={result.savingsVsNational}
          />
          <SavingRow
            label={`Em relação à média da região ${result.region}`}
            value={result.savingsVsRegional}
          />
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Tarifa usada</span>
            <span className="font-semibold text-slate-600">
              R$ {(result.currentKwh > 0 ? result.currentKwh : 1).toFixed(2)} kWh¹
            </span>
          </div>
          <p className="text-[10px] text-slate-300 mt-1">¹Baseada no seu lançamento atual</p>
        </div>
      </div>

      {/* Benchmarks */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mt-2">
        <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-1">
          <span>📊</span> Comparativo (kWh/mês)
        </h3>
        <div className="space-y-2">
          <BarRow label="Seu consumo" value={result.currentKwh} max={Math.max(result.currentKwh, result.nationalAvgKwh, result.regionalAvgKwh) * 1.2} color="bg-blue-500" />
          <BarRow label="Média nacional" value={result.nationalAvgKwh} max={Math.max(result.currentKwh, result.nationalAvgKwh, result.regionalAvgKwh) * 1.2} color="bg-slate-400" />
          <BarRow label={`Média ${result.region}`} value={result.regionalAvgKwh} max={Math.max(result.currentKwh, result.nationalAvgKwh, result.regionalAvgKwh) * 1.2} color="bg-amber-400" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  good,
  unit,
  showNA,
}: {
  label: string;
  value: number | null;
  icon: string;
  good: boolean | null;
  unit: string;
  showNA?: boolean;
}) {
  const goodColor = "bg-green-50 border-green-200 text-green-700";
  const badColor = "bg-red-50 border-red-200 text-red-600";
  const neutralColor = "bg-slate-50 border-slate-200 text-slate-500";

  const colorClass = showNA || good === null ? neutralColor : good ? goodColor : badColor;

  return (
    <div className={`rounded-xl border p-2.5 text-center ${colorClass}`}>
      <div className="text-lg">{icon}</div>
      <div className="text-xs font-bold leading-tight mt-0.5">
        {showNA || value === null ? "N/A" : `${value > 0 ? "+" : ""}${value.toFixed(1)} ${unit}`}
      </div>
      <div className="text-[10px] opacity-70 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

function SavingRow({ label, value }: { label: string; value: number }) {
  const isPositive = value > 0;
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-500 flex-1 leading-tight">{label}</span>
      <span
        className={`text-xs font-bold ml-2 whitespace-nowrap ${isPositive ? "text-green-600" : "text-red-500"}`}
      >
        {isPositive ? "economizou" : "gastou a mais"}{" "}
        <span className="font-black">
          R$ {Math.abs(value).toFixed(2)}
        </span>
      </span>
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="font-bold text-slate-700">{value.toFixed(1)} kWh</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

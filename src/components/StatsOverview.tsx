"use client";

import { EnergyRecord } from "@/db/schema";
import { NATIONAL_AVERAGE_KWH, REGIONAL_AVERAGES, MONTHS_PT } from "@/lib/energyData";

interface StatsOverviewProps {
  records: EnergyRecord[];
}

export default function StatsOverview({ records }: StatsOverviewProps) {
  if (records.length === 0) return null;

  const totalKwh = records.reduce((s, r) => s + r.kwh, 0);
  const avgKwh = totalKwh / records.length;
  const avgValue = records.reduce((s, r) => s + r.valueReais, 0) / records.length;
  const region = records[0].region;
  const regionalAvg = REGIONAL_AVERAGES[region] ?? NATIONAL_AVERAGE_KWH;

  const minRecord = records.reduce((a, b) => (a.kwh < b.kwh ? a : b));
  const maxRecord = records.reduce((a, b) => (a.kwh > b.kwh ? a : b));

  const totalSaved = records.reduce((s, r) => {
    const tariff = r.valueReais / r.kwh;
    const diff = NATIONAL_AVERAGE_KWH - r.kwh;
    return s + diff * tariff;
  }, 0);

  // Count months better than national avg
  const betterMonths = records.filter((r) => r.kwh < NATIONAL_AVERAGE_KWH).length;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-5 text-white shadow-xl mb-2">
      <h3 className="text-sm font-black text-blue-200 mb-4 flex items-center gap-2">
        <span>📈</span> Resumo Geral ({records.length} {records.length === 1 ? "mês" : "meses"})
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <MiniStat label="Média mensal" value={`${avgKwh.toFixed(1)} kWh`} sub={`R$ ${avgValue.toFixed(2)}/mês`} icon="⚡" />
        <MiniStat
          label="vs. Média BR"
          value={`${avgKwh < NATIONAL_AVERAGE_KWH ? "▼" : "▲"} ${Math.abs(avgKwh - NATIONAL_AVERAGE_KWH).toFixed(1)} kWh`}
          sub={avgKwh < NATIONAL_AVERAGE_KWH ? "abaixo da média!" : "acima da média"}
          icon={avgKwh < NATIONAL_AVERAGE_KWH ? "🌍" : "📊"}
          highlight={avgKwh < NATIONAL_AVERAGE_KWH}
        />
        <MiniStat
          label="Meses abaixo da média"
          value={`${betterMonths} de ${records.length}`}
          sub={`${((betterMonths / records.length) * 100).toFixed(0)}% dos meses`}
          icon="🏅"
          highlight={betterMonths > 0}
        />
        <MiniStat
          label={totalSaved >= 0 ? "Economia total acum." : "Gasto acima da média"}
          value={`R$ ${Math.abs(totalSaved).toFixed(2)}`}
          sub={totalSaved >= 0 ? "vs. média nacional" : "vs. média nacional"}
          icon={totalSaved >= 0 ? "💰" : "💸"}
          highlight={totalSaved >= 0}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
        <div className="text-xs">
          <div className="text-blue-300 mb-0.5">Menor consumo</div>
          <div className="font-bold">
            {minRecord.kwh.toFixed(1)} kWh —{" "}
            <span className="font-normal text-blue-200">
              {MONTHS_PT[minRecord.month - 1]}/{minRecord.year}
            </span>
          </div>
        </div>
        <div className="text-xs">
          <div className="text-blue-300 mb-0.5">Maior consumo</div>
          <div className="font-bold">
            {maxRecord.kwh.toFixed(1)} kWh —{" "}
            <span className="font-normal text-blue-200">
              {MONTHS_PT[maxRecord.month - 1]}/{maxRecord.year}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-blue-300">
        Média nacional (EPE 2024): {NATIONAL_AVERAGE_KWH} kWh/mês · Média regional ({region}): {regionalAvg} kWh/mês
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? "bg-green-500/20 border border-green-400/30" : "bg-white/10"}`}>
      <div className="text-base mb-1">{icon}</div>
      <div className="text-xs text-blue-200 leading-tight mb-0.5">{label}</div>
      <div className="text-sm font-black leading-tight">{value}</div>
      <div className="text-[10px] text-blue-300 mt-0.5">{sub}</div>
    </div>
  );
}

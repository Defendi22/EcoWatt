"use client";

import { EnergyRecord } from "@/db/schema";
import { MONTHS_PT } from "@/lib/energyData";

interface HistoryListProps {
  records: EnergyRecord[];
  onDelete: (id: number) => void;
}

export default function HistoryList({ records, onDelete }: HistoryListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-sm font-medium">Nenhum lançamento ainda.</p>
        <p className="text-xs mt-1">Adicione o primeiro registro acima!</p>
      </div>
    );
  }

  // Calculate trend
  const trend = records.map((r, i) => {
    const prev = records[i + 1];
    const change = prev ? ((r.kwh - prev.kwh) / prev.kwh) * 100 : null;
    return { ...r, change };
  });

  return (
    <div className="space-y-3">
      {trend.map((record) => {
        const isDown = record.change !== null && record.change < 0;
        const isUp = record.change !== null && record.change > 0;

        return (
          <div
            key={record.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3"
          >
            {/* Month badge */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-green-700 leading-none">
                {MONTHS_PT[record.month - 1].substring(0, 3).toUpperCase()}
              </span>
              <span className="text-xs font-black text-green-800 leading-none mt-0.5">{record.year}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-slate-800 text-sm">{record.kwh.toFixed(1)} kWh</span>
                {record.change !== null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isDown
                        ? "bg-green-100 text-green-700"
                        : isUp
                        ? "bg-red-100 text-red-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isDown ? "▼" : isUp ? "▲" : "="} {Math.abs(record.change).toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                R$ {record.valueReais.toFixed(2)} · {record.region}
              </div>
              {record.notes && (
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{record.notes}</div>
              )}
            </div>

            {/* Tariff */}
            <div className="text-right flex-shrink-0">
              <div className="text-[11px] text-slate-400">Tarifa</div>
              <div className="text-xs font-bold text-slate-600">
                R$ {(record.valueReais / record.kwh).toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-300">por kWh</div>
            </div>

            {/* Delete */}
            <button
              onClick={() => onDelete(record.id)}
              className="flex-shrink-0 text-slate-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50"
              title="Excluir"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

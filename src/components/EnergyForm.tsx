"use client";

import { useState } from "react";
import { MONTHS_PT, REGIONS } from "@/lib/energyData";

interface EnergyFormProps {
  onSave: (data: {
    month: number;
    year: number;
    kwh: number;
    valueReais: number;
    region: string;
    notes: string;
  }) => Promise<void>;
  loading: boolean;
  defaultRegion?: string;
}

export default function EnergyForm({ onSave, loading, defaultRegion }: EnergyFormProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [kwh, setKwh] = useState("");
  const [valueReais, setValueReais] = useState("");
  const [region, setRegion] = useState(defaultRegion || "Sudeste");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!kwh || isNaN(Number(kwh)) || Number(kwh) <= 0) errs.kwh = "Informe um valor válido de kWh";
    if (!valueReais || isNaN(Number(valueReais)) || Number(valueReais) <= 0) errs.valueReais = "Informe um valor válido em R$";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    await onSave({
      month,
      year,
      kwh: Number(kwh),
      valueReais: Number(valueReais),
      region,
      notes,
    });
    setKwh("");
    setValueReais("");
    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Mês</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {MONTHS_PT.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Ano</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Consumo (kWh)</label>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            min="0"
            value={kwh}
            onChange={(e) => setKwh(e.target.value)}
            placeholder="Ex: 180.5"
            className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 pr-14 ${errors.kwh ? "border-red-400" : "border-slate-200"}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">kWh</span>
        </div>
        {errors.kwh && <p className="text-red-500 text-xs mt-1">{errors.kwh}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Valor da Conta (R$)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={valueReais}
            onChange={(e) => setValueReais(e.target.value)}
            placeholder="Ex: 135.90"
            className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.valueReais ? "border-red-400" : "border-slate-200"}`}
          />
        </div>
        {errors.valueReais && <p className="text-red-500 text-xs mt-1">{errors.valueReais}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Região</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Observações (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Usamos ar condicionado com mais frequência..."
          rows={2}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl shadow-md hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all duration-150 disabled:opacity-60 text-sm"
      >
        {loading ? "Salvando..." : "💾 Salvar Lançamento"}
      </button>
    </form>
  );
}

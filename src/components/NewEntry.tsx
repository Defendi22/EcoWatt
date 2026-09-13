import { useState } from "react";
import { EnergyEntry, Region, REGIONAL_AVG, BRAZIL_AVG } from "../App";

interface Props {
  entries: EnergyEntry[];
  onAdd: (entry: EnergyEntry) => void;
  onCancel: () => void;
}

const REGIONS: Region[] = ["Norte", "Nordeste", "Sudeste", "Sul", "Centro-Oeste"];

const TARIFF_TIPS: Record<Region, string> = {
  Norte: "Tarifa média ~R$0,80/kWh (região com maior consumo médio)",
  Nordeste: "Tarifa média ~R$0,75/kWh (menor consumo médio do Brasil)",
  Sudeste: "Tarifa média ~R$0,85/kWh (maior concentração industrial)",
  Sul: "Tarifa média ~R$0,72/kWh (clima mais frio, alto consumo)",
  "Centro-Oeste": "Tarifa média ~R$0,78/kWh (consumo elevado por clima quente)",
};

export default function NewEntry({ entries, onAdd, onCancel }: Props) {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(defaultMonth);
  const [value, setValue] = useState("");
  const [kwh, setKwh] = useState("");
  const [region, setRegion] = useState<Region>("Sudeste");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const lastEntry = entries
    .filter((e) => e.region === region)
    .sort((a, b) => b.month.localeCompare(a.month))[0];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!month) errs.month = "Selecione o mês";
    if (!value || isNaN(Number(value)) || Number(value) <= 0)
      errs.value = "Informe um valor válido em R$";
    if (!kwh || isNaN(Number(kwh)) || Number(kwh) <= 0)
      errs.kwh = "Informe o consumo em kWh";
    if (entries.some((e) => e.month === month && e.region === region))
      errs.month = "Já existe um lançamento para este mês e região";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const entry: EnergyEntry = {
      id: crypto.randomUUID(),
      month,
      value: Number(value),
      kwh: Number(kwh),
      region,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    onAdd(entry);
  };

  const kwhNum = Number(kwh);
  const regionalAvg = REGIONAL_AVG[region];
  const vsRegion = kwhNum > 0 ? ((kwhNum - regionalAvg) / regionalAvg) * 100 : null;
  const vsBrazil = kwhNum > 0 ? ((kwhNum - BRAZIL_AVG) / BRAZIL_AVG) * 100 : null;
  const vsLast = lastEntry && kwhNum > 0 ? ((kwhNum - lastEntry.kwh) / lastEntry.kwh) * 100 : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors p-1">
          ←
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Novo Lançamento</h2>
          <p className="text-xs text-slate-400">Registre sua conta de energia</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Region */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Região
          </label>
          <div className="grid grid-cols-3 gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={`py-2 px-2 rounded-xl text-xs font-medium transition-all border ${
                  region === r
                    ? "bg-yellow-400 text-slate-900 border-yellow-400 shadow-lg shadow-yellow-400/20"
                    : "bg-white/5 text-slate-300 border-white/10 hover:border-white/30"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {region && (
            <p className="text-xs text-slate-500 mt-2 bg-white/5 rounded-lg px-3 py-2">
              💡 {TARIFF_TIPS[region]}
            </p>
          )}
        </div>

        {/* Month */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Mês de Referência
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            max={defaultMonth}
            className={`w-full bg-white/5 border ${
              errors.month ? "border-red-400" : "border-white/10"
            } rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors [color-scheme:dark]`}
          />
          {errors.month && <p className="text-red-400 text-xs mt-1">{errors.month}</p>}
        </div>

        {/* Value */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Valor da Conta (R$)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
              R$
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`w-full bg-white/5 border ${
                errors.value ? "border-red-400" : "border-white/10"
              } rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors`}
            />
          </div>
          {errors.value && <p className="text-red-400 text-xs mt-1">{errors.value}</p>}
        </div>

        {/* kWh */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Consumo (kWh)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              value={kwh}
              onChange={(e) => setKwh(e.target.value)}
              className={`w-full bg-white/5 border ${
                errors.kwh ? "border-red-400" : "border-white/10"
              } rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              kWh
            </span>
          </div>
          {errors.kwh && <p className="text-red-400 text-xs mt-1">{errors.kwh}</p>}
          <p className="text-xs text-slate-500 mt-1">
            Você encontra essa informação na própria conta de energia elétrica
          </p>
        </div>

        {/* Live Preview */}
        {kwhNum > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Pré-visualização da Comparação
            </p>

            <div className="space-y-2">
              {vsLast !== null && (
                <CompareBar
                  label={`vs. Mês Anterior (${lastEntry!.kwh} kWh)`}
                  pct={vsLast}
                  current={kwhNum}
                  reference={lastEntry!.kwh}
                />
              )}
              <CompareBar
                label={`vs. Média Regional – ${region} (${regionalAvg} kWh)`}
                pct={vsRegion!}
                current={kwhNum}
                reference={regionalAvg}
              />
              <CompareBar
                label={`vs. Média Nacional (${BRAZIL_AVG} kWh)`}
                pct={vsBrazil!}
                current={kwhNum}
                reference={BRAZIL_AVG}
              />
            </div>
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Observações (opcional)
          </label>
          <textarea
            placeholder="Ex: Usamos ar-condicionado mais este mês..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors resize-none placeholder:text-slate-600"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold py-4 rounded-2xl text-sm hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/30 active:scale-95"
        >
          ⚡ Registrar Lançamento
        </button>
      </form>
    </div>
  );
}

function CompareBar({
  label,
  pct,
  current,
  reference,
}: {
  label: string;
  pct: number;
  current: number;
  reference: number;
}) {
  const isGood = pct <= 0;
  const absPct = Math.abs(pct).toFixed(1);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">{label}</span>
        <span
          className={`text-xs font-bold ${isGood ? "text-emerald-400" : "text-red-400"}`}
        >
          {isGood ? "▼" : "▲"} {absPct}%
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isGood ? "bg-emerald-400" : "bg-red-400"
          }`}
          style={{
            width: `${Math.min(100, (Math.min(current, reference) / Math.max(current, reference)) * 100)}%`,
            marginLeft: isGood ? "0" : "auto",
          }}
        />
      </div>
    </div>
  );
}

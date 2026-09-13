import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { EnergyEntry, REGIONAL_AVG, BRAZIL_AVG, MONTH_NAMES } from "../App";

interface Props {
  entries: EnergyEntry[];
  onNewEntry: () => void;
}

function formatMonth(m: string) {
  const [year, mon] = m.split("-");
  return `${MONTH_NAMES[parseInt(mon) - 1]}/${year.slice(2)}`;
}

export default function Dashboard({ entries, onNewEntry }: Props) {
  if (entries.length === 0) {
    return <EmptyState onNewEntry={onNewEntry} />;
  }

  const sorted = [...entries].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1];
  const prev = sorted.length >= 2 ? sorted[sorted.length - 2] : null;

  const regionalAvg = REGIONAL_AVG[latest.region];
  const vsRegion = ((latest.kwh - regionalAvg) / regionalAvg) * 100;
  const vsBrazil = ((latest.kwh - BRAZIL_AVG) / BRAZIL_AVG) * 100;
  const vsPrev = prev ? ((latest.kwh - prev.kwh) / prev.kwh) * 100 : null;

  // Chart data
  const chartData = sorted.map((e) => ({
    month: formatMonth(e.month),
    kWh: e.kwh,
    "Média Regional": REGIONAL_AVG[e.region],
    "Média Brasil": BRAZIL_AVG,
  }));

  const totalKwh = entries.reduce((s, e) => s + e.kwh, 0);
  const totalValue = entries.reduce((s, e) => s + e.value, 0);
  const avgKwh = totalKwh / entries.length;

  // Count months below averages
  const belowNational = entries.filter((e) => e.kwh < BRAZIL_AVG).length;
  const belowRegional = entries.filter((e) => e.kwh < REGIONAL_AVG[e.region]).length;

  // Score: percentage of months below national avg
  const score = Math.round((belowNational / entries.length) * 100);

  const scoreLabel =
    score >= 80
      ? { label: "Excelente! 🏆", color: "text-yellow-400" }
      : score >= 60
      ? { label: "Bom! 🌟", color: "text-emerald-400" }
      : score >= 40
      ? { label: "Regular ⚡", color: "text-blue-400" }
      : { label: "Melhorar 📈", color: "text-orange-400" };

  return (
    <div className="space-y-5">
      {/* Score Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400/20 via-orange-400/10 to-transparent border border-yellow-400/20 rounded-3xl p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            Índice de Eficiência
          </p>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-5xl font-black text-white">{score}%</span>
            <span className={`text-lg font-bold pb-1 ${scoreLabel.color}`}>
              {scoreLabel.label}
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            {belowNational} de {entries.length} meses abaixo da média nacional
          </p>
        </div>
      </div>

      {/* Latest Month */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Último Lançamento – {formatMonth(latest.month)}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="⚡"
            label="Consumo"
            value={`${latest.kwh} kWh`}
            sub={vsPrev !== null ? `${vsPrev > 0 ? "▲" : "▼"} ${Math.abs(vsPrev).toFixed(1)}% vs anterior` : "Primeiro lançamento"}
            highlight={vsPrev !== null && vsPrev < 0}
          />
          <StatCard
            icon="💰"
            label="Valor Pago"
            value={`R$ ${latest.value.toFixed(2)}`}
            sub={`R$ ${(latest.value / latest.kwh).toFixed(3)}/kWh`}
            highlight={false}
          />
          <StatCard
            icon="🗺️"
            label={`Média ${latest.region}`}
            value={`${regionalAvg} kWh`}
            sub={`Você: ${vsRegion > 0 ? "▲" : "▼"} ${Math.abs(vsRegion).toFixed(1)}%`}
            highlight={vsRegion < 0}
          />
          <StatCard
            icon="🇧🇷"
            label="Média Brasil"
            value={`${BRAZIL_AVG} kWh`}
            sub={`Você: ${vsBrazil > 0 ? "▲" : "▼"} ${Math.abs(vsBrazil).toFixed(1)}%`}
            highlight={vsBrazil < 0}
          />
        </div>
      </div>

      {/* Achievements */}
      {(belowNational > 0 || belowRegional > 0) && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Conquistas
          </p>
          <div className="flex flex-wrap gap-2">
            {belowNational >= 1 && (
              <Badge icon="🏅" label={`${belowNational}x abaixo da média nacional`} color="blue" />
            )}
            {belowRegional >= 1 && (
              <Badge icon="🌍" label={`${belowRegional}x abaixo da média regional`} color="green" />
            )}
            {entries.length >= 3 && (
              <Badge icon="📊" label="3+ meses registrados" color="purple" />
            )}
            {entries.length >= 6 && (
              <Badge icon="🎯" label="6+ meses registrados" color="yellow" />
            )}
            {vsPrev !== null && vsPrev < -10 && (
              <Badge icon="🚀" label={`Reduziu ${Math.abs(vsPrev).toFixed(0)}% este mês`} color="emerald" />
            )}
            {score === 100 && (
              <Badge icon="🏆" label="Sempre abaixo da média!" color="gold" />
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      {sorted.length >= 2 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Histórico de Consumo (kWh)
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: 12,
                    color: "#fff",
                  }}
                  cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10, color: "#94a3b8", paddingTop: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="kWh"
                  stroke="#FBBF24"
                  strokeWidth={2.5}
                  dot={{ fill: "#FBBF24", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Média Regional"
                  stroke="#60A5FA"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Média Brasil"
                  stroke="#34D399"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comparison Bar */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Comparação — Último Mês
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
          <CompareRow
            label="Seu consumo"
            value={latest.kwh}
            max={Math.max(latest.kwh, regionalAvg, BRAZIL_AVG) * 1.1}
            color="#FBBF24"
          />
          <CompareRow
            label={`Média ${latest.region}`}
            value={regionalAvg}
            max={Math.max(latest.kwh, regionalAvg, BRAZIL_AVG) * 1.1}
            color="#60A5FA"
          />
          <CompareRow
            label="Média Brasil"
            value={BRAZIL_AVG}
            max={Math.max(latest.kwh, regionalAvg, BRAZIL_AVG) * 1.1}
            color="#34D399"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Resumo Geral
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Total gasto" value={`R$ ${totalValue.toFixed(0)}`} />
          <MiniStat label="Média mensal" value={`${avgKwh.toFixed(0)} kWh`} />
          <MiniStat label="Meses" value={`${entries.length}`} />
        </div>
      </div>

      {/* Eco Tips */}
      <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-4">
        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
          🌱 Dica de Economia
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          {getTip(latest.kwh, REGIONAL_AVG[latest.region])}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onNewEntry}
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold py-4 rounded-2xl text-sm hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/30 active:scale-95"
      >
        ⚡ Novo Lançamento
      </button>
    </div>
  );
}

function EmptyState({ onNewEntry }: { onNewEntry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 px-4">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/20 flex items-center justify-center text-5xl">
        ⚡
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao EnergyTrack!</h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
          Registre sua conta de energia e compare com as médias brasileiras e regionais. 
          Receba parabenizações toda vez que contribuir para a economia!
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[
          { icon: "📊", label: "Compare médias" },
          { icon: "🏆", label: "Ganhe medalhas" },
          { icon: "🌱", label: "Economize energia" },
        ].map((f) => (
          <div key={f.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-2xl mb-1">{f.icon}</div>
            <p className="text-xs text-slate-400">{f.label}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-xs space-y-2 text-left bg-white/5 border border-white/10 rounded-2xl p-4">
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          📋 Médias Nacionais (EPE 2024)
        </p>
        {Object.entries(REGIONAL_AVG).map(([r, v]) => (
          <div key={r} className="flex justify-between text-xs">
            <span className="text-slate-400">{r}</span>
            <span className="text-white font-semibold">{v} kWh/mês</span>
          </div>
        ))}
        <div className="flex justify-between text-xs border-t border-white/10 pt-2 mt-2">
          <span className="text-slate-300 font-semibold">Brasil (média)</span>
          <span className="text-yellow-400 font-bold">{BRAZIL_AVG} kWh/mês</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-1">Fonte: EPE – Anuário Estatístico 2024</p>
      </div>

      <button
        onClick={onNewEntry}
        className="w-full max-w-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold py-4 rounded-2xl text-sm hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/30 active:scale-95"
      >
        ⚡ Registrar Primeiro Lançamento
      </button>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, highlight,
}: {
  icon: string; label: string; value: string; sub: string; highlight: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-3 border transition-all ${
        highlight
          ? "bg-emerald-400/10 border-emerald-400/30"
          : "bg-white/5 border-white/10"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
      <p className={`font-bold text-sm mt-0.5 ${highlight ? "text-emerald-400" : "text-white"}`}>
        {value}
      </p>
      <p className={`text-xs mt-0.5 ${highlight ? "text-emerald-400/70" : "text-slate-500"}`}>
        {sub}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
      <p className="text-white font-bold text-sm">{value}</p>
      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
    </div>
  );
}

function Badge({ icon, label, color }: { icon: string; label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-400/10 border-blue-400/30 text-blue-300",
    green: "bg-green-400/10 border-green-400/30 text-green-300",
    purple: "bg-purple-400/10 border-purple-400/30 text-purple-300",
    yellow: "bg-yellow-400/10 border-yellow-400/30 text-yellow-300",
    emerald: "bg-emerald-400/10 border-emerald-400/30 text-emerald-300",
    gold: "bg-yellow-400/20 border-yellow-400/50 text-yellow-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium ${colors[color] || colors.blue}`}
    >
      {icon} {label}
    </span>
  );
}

function CompareRow({
  label, value, max, color,
}: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value} kWh</span>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function getTip(kwh: number, regionalAvg: number): string {
  if (kwh < regionalAvg * 0.7) {
    return "Parabéns! Você é um exemplo de eficiência energética. Continue compartilhando boas práticas com sua comunidade!";
  }
  if (kwh < regionalAvg) {
    return "Você está se saindo bem! Para economizar ainda mais: prefira lâmpadas LED, desligue aparelhos em standby e use a máquina de lavar com carga cheia.";
  }
  if (kwh < regionalAvg * 1.2) {
    return "Para reduzir: regule o ar-condicionado para 23°C, use a geladeira longe do fogão e aproveite a luz natural durante o dia.";
  }
  return "Alto consumo detectado! Verifique se há aparelhos ligados desnecessariamente, considere troca de eletrodomésticos antigos por modelos eficientes (selo Procel A).";
}

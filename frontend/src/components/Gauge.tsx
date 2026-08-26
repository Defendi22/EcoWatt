interface GaugeProps {
  kwh: number
  average: number
  label: string
}

export default function Gauge ({ kwh, average, label }: GaugeProps) {
  const ratio = Math.min(kwh / average, 2)
  const percentage = Math.min((ratio / 2) * 100, 100)
  const color = ratio <= 0.85 ? '#22c55e' : ratio <= 1.15 ? '#f97316' : '#ef4444'
  const isBelow = ratio <= 1

  const circle = 2 * Math.PI * 60

  return (
    <div className="card flex flex-col items-center">
      <p className="mb-2 text-sm font-medium text-stone-500">{label}</p>
      <svg viewBox="0 0 160 100" className="w-52" role="img" aria-label={`Consumo de ${kwh} kWh versus média de ${average} kWh`}>
        <path
          d="M 20 90 A 60 60 0 0 1 140 90"
          fill="none"
          stroke="#e7e5e4"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 20 90 A 60 60 0 0 1 140 90"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circle}
          strokeDashoffset={circle * (1 - percentage / 100)}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
        <text x="80" y="72" textAnchor="middle" className="fill-stone-900" fontSize="22" fontWeight="700">
          {kwh}
        </text>
        <text x="80" y="88" textAnchor="middle" className="fill-stone-400" fontSize="11">
          kWh
        </text>
      </svg>
      <p className={`mt-1 rounded-full px-3 py-1 text-sm font-semibold ${isBelow ? 'bg-brand-50 text-brand-700' : 'bg-energy-50 text-energy-600'}`}>
        {isBelow ? 'Abaixo da média' : 'Acima da média'}
      </p>
    </div>
  )
}

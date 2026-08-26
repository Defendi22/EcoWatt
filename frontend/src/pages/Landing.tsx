import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Leaf, TrendingDown, Lightbulb, LineChart, Trophy, ChevronRight, Sprout } from 'lucide-react'
import { api } from '../lib/api'
import type { Catalog } from '../lib/types'

export default function Landing () {
  const [catalog, setCatalog] = useState<Catalog | null>(null)

  useEffect(() => {
    api<Catalog>('/catalog').then(setCatalog).catch(() => {})
  }, [])

  return (
    <div className="animate-fade-up">
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-stone-50 to-stone-50">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-energy-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-800">
              <Sprout size={16} /> Inovação para a sustentabilidade
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Descubra quanto de energia sua casa consome —{' '}
              <span className="bg-gradient-to-r from-brand-600 to-energy-500 bg-clip-text text-transparent">
                e compare com o Brasil
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
              Anote sua conta de luz ou estime o consumo pelos seus eletrodomésticos.
              Veja se você está abaixo ou acima da média dos brasileiros e receba dicas
              para economizar e cuidar do planeta.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/registro" className="btn-primary w-full sm:w-auto">
                Começar agora <ChevronRight size={18} />
              </Link>
              <Link to="/login" className="btn-ghost w-full sm:w-auto">Já tenho conta</Link>
            </div>
            {catalog && (
              <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3">
                <Metric value={`${catalog.mediaNacionalKwh}`} unit="kWh/mês" label="Média do brasileiro" />
                <Metric value="~0,06" unit="kg CO₂/kWh" label="Emissão média" />
                <Metric value="80%" unit="menos" label="Com lâmpada LED" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-stone-900">Como funciona</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-stone-600">
          Em 3 passos simples você entende seu consumo e aprende a economizar.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Step
            icon={<LineChart size={22} />}
            step="1"
            title="Crie sua conta"
            text="Informe seu estado e quantas pessoas moram na casa. Isso permite comparar com a média certa."
          />
          <Step
            icon={<Zap size={22} />}
            step="2"
            title="Registre seu consumo"
            text="Digite os kWh da sua conta de luz ou estime pelos aparelhos que você usa no dia a dia."
          />
          <Step
            icon={<TrendingDown size={22} />}
            step="3"
            title="Compare e economize"
            text="Veja gráficos, metas, medalhas e dicas para reduzir sua conta e sua pegada de carbono."
          />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-energy-100 px-4 py-1.5 text-sm font-semibold text-energy-700">
              <Lightbulb size={16} /> Inovação e sustentabilidade
            </span>
            <h2 className="mt-5 text-3xl font-bold text-stone-900">
              Pequenas atitudes geram grandes impactos
            </h2>
            <p className="mt-4 leading-relaxed text-stone-600">
              O consumo de energia elétrica responde por uma parte significativa das emissões
              de gases de efeito estufa. Ao acompanhar seus números, você transforma um hábito
              invisível em decisão consciente — economiza no bolso e ajuda o planeta.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Compare seu consumo com a média nacional e do seu estado',
                'Acompanhe a evolução com gráficos mensais',
                'Receba dicas personalizadas para os aparelhos que mais consomem',
                'Ganhe medalhas e dispute o ranking dos que mais economizam'
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-stone-700">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Leaf size={14} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImpactCard title="Menos desperdício" value="Até 30%" text="de economia possível só com hábitos simples" />
            <ImpactCard title="Energia renovável" value="84%" text="da matriz elétrica brasileira é limpa" />
            <ImpactCard title="Chuveiro elétrico" value="~30%" text="do consumo de quem usa no inverno" />
            <ImpactCard title="Modo standby" value="12%" text="da conta vira despesa com aparelhos em espera" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card flex flex-col items-center gap-6 bg-gradient-to-br from-brand-700 to-brand-900 !border-0 p-10 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Pronto para economizar energia?</h2>
            <p className="mt-2 text-brand-100">Comece hoje e acompanhe sua evolução rumo à sustentabilidade.</p>
          </div>
          <Link to="/registro" className="btn-ghost-dark shrink-0">
            <Trophy size={18} /> Criar minha conta grátis
          </Link>
        </div>
      </section>
    </div>
  )
}

function Metric ({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="rounded-3xl border border-stone-100 bg-white p-4 shadow-soft">
      <p className="font-mono text-xl font-semibold text-brand-700">{value}</p>
      <p className="text-xs text-stone-500">{unit}</p>
      <p className="mt-1 text-xs font-medium text-stone-700">{label}</p>
    </div>
  )
}

function Step ({ icon, step, title, text }: { icon: React.ReactNode; step: string; title: string; text: string }) {
  return (
    <div className="card relative pt-10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
      <span className="absolute right-5 top-4 font-mono text-4xl font-bold text-brand-100">{step}</span>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{text}</p>
    </div>
  )
}

function ImpactCard ({ title, value, text }: { title: string; value: string; text: string }) {
  return (
    <div className="rounded-3xl border border-stone-100 bg-stone-50 p-5 transition-all duration-200 hover:shadow-soft">
      <p className="text-sm font-semibold text-stone-500">{title}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-brand-700">{value}</p>
      <p className="mt-1 text-sm text-stone-600">{text}</p>
    </div>
  )
}

export interface User {
  id: number
  nome: string
  email: string
  uf: string | null
  moradores: number
  metaKwh: number | null
  pontos: number
  criadoEm: string
}

export interface Appliance {
  id: string
  nome: string
  potenciaW: number
}

export interface StateInfo {
  uf: string
  nome: string
  mediaKwh: number
}

export interface Catalog {
  appliances: Appliance[]
  states: StateInfo[]
  mediaNacionalKwh: number
}

export interface ApplianceItem {
  id: string
  qtd: number
  horasDia: number
}

export interface Reading {
  id: number
  mes: string
  modo: 'conta' | 'estimativa'
  kwh: number
  aparelhos: ApplianceItem[]
  criadoEm: string
}

export interface Badge {
  id: string
  nome: string
  descricao: string
  icone: string
  pontos: number
  conquistado?: boolean
}

export interface Statistics {
  user: User
  averages: { nacional: number; estadual: number; usuario: number }
  current: {
    mes: string
    kwh: number
    modo: 'conta' | 'estimativa'
    differenceNational: number
    differenceState: number
  } | null
  evolution: { labels: string[]; values: number[] }
  co2Kg: number
  totalKwh: number
  badgeCount: number
  badges: Badge[]
  tips: string[]
  goal: {
    metaKwh: number
    atualKwh: number
    atingida: boolean
    progresso: number
  } | null
}

export interface RankingEntry {
  id: number
  nome: string
  uf: string | null
  pontos: number
  mediaKwh: number
  economiaPercent: number
  leituras: number
}

export interface Rewards {
  allEarned: Badge[]
  newBadges: Badge[]
  points: number
}

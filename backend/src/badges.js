export const badgeDefs = [
  {
    id: 'first_reading',
    nome: 'Primeiro registro',
    descricao: 'Registrou o consumo pela primeira vez',
    icone: '📗',
    pontos: 25
  },
  {
    id: 'streak_3',
    nome: '3 meses em sequência',
    descricao: 'Registrou o consumo por 3 meses consecutivos',
    icone: '📈',
    pontos: 25
  },
  {
    id: 'below_avg_1',
    nome: 'Abaixo da média',
    descricao: '1 mês com consumo abaixo da média nacional',
    icone: '🌱',
    pontos: 25
  },
  {
    id: 'below_avg_3',
    nome: 'Economia constante',
    descricao: '3 meses com consumo abaixo da média nacional',
    icone: '🌿',
    pontos: 50
  },
  {
    id: 'reduction_10',
    nome: 'Redução de 10%',
    descricao: 'Consumo 10% menor que o mês anterior',
    icone: '⚡',
    pontos: 25
  },
  {
    id: 'goal_achieved',
    nome: 'Meta atingida',
    descricao: 'Atingiu a meta de consumo do mês',
    icone: '🎯',
    pontos: 25
  },
  {
    id: 'profile_complete',
    nome: 'Perfil completo',
    descricao: 'Informou estado e quantidade de moradores',
    icone: '🧑',
    pontos: 10
  }
]

export function evaluateBadges ({ readings, user, monthsBelowAverage, goalHits }) {
  const earned = new Set()
  if (readings.length >= 1) earned.add('first_reading')
  if (readings.length >= 3) earned.add('streak_3')
  if (monthsBelowAverage >= 1) earned.add('below_avg_1')
  if (monthsBelowAverage >= 3) earned.add('below_avg_3')
  if (goalHits >= 1) earned.add('goal_achieved')

  for (let i = 1; i < readings.length; i++) {
    const prev = readings[i - 1]
    const cur = readings[i]
    if (cur.kwh <= prev.kwh * 0.9) {
      earned.add('reduction_10')
      break
    }
  }

  if (user.uf && user.moradores > 0) earned.add('profile_complete')

  return badgeDefs
    .filter((b) => earned.has(b.id))
    .map((b) => ({ ...b }))
}

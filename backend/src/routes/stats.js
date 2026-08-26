import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { MEDIA_NACIONAL_KWH, getStateAverage, states } from '../states.js'
import { appliances } from '../appliances.js'
import { badgeDefs } from '../badges.js'
import { evaluateAndAward } from '../rewards.js'
import { buildTips } from '../tips.js'

const CO2_FACTOR = 0.06

export function statsRoutes (db) {
  const router = Router()

  router.get('/catalog', (req, res) => {
    res.json({
      appliances,
      states,
      mediaNacionalKwh: MEDIA_NACIONAL_KWH
    })
  })

  router.get('/statistics', authMiddleware(db), (req, res) => {
    evaluateAndAward(db, req.user.id)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
    const readings = db.prepare(
      'SELECT * FROM readings WHERE user_id = ? ORDER BY mes ASC'
    ).all(user.id)

    const stateAverage = getStateAverage(user.uf)
    const current = readings[readings.length - 1] || null
    const totalKwh = readings.reduce((s, r) => s + r.kwh, 0)
    const averageKwh = readings.length ? totalKwh / readings.length : 0

    const allEarned = db.prepare(
      'SELECT badge_id, conquistado_em FROM user_badges WHERE user_id = ?'
    ).all(user.id)

    const badgesWithMeta = badgeDefs.map((def) => {
      const owned = allEarned.some((b) => b.badge_id === def.id)
      return { ...def, conquistado: owned }
    })

    const monthLabels = []
    const monthValues = []
    for (const r of readings) {
      monthLabels.push(formatMonth(r.mes))
      monthValues.push(r.kwh)
    }

    const differenceNational = current
      ? Math.round((current.kwh - MEDIA_NACIONAL_KWH) * 10) / 10
      : null
    const differenceState = current
      ? Math.round((current.kwh - stateAverage) * 10) / 10
      : null

    const latest = current
      ? buildTips(db.prepare('SELECT * FROM readings WHERE id = ?').get(current.id))
      : []

    const goal = user.meta_kwh
      ? {
          metaKwh: user.meta_kwh,
          atualKwh: current ? current.kwh : 0,
          atingida: current ? current.kwh <= user.meta_kwh : false,
          progresso: current ? Math.min(100, Math.round((current.kwh / user.meta_kwh) * 100)) : 0
        }
      : null

    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        uf: user.uf,
        moradores: user.moradores,
        metaKwh: user.meta_kwh,
        pontos: user.pontos
      },
      averages: {
        nacional: MEDIA_NACIONAL_KWH,
        estadual: stateAverage,
        usuario: averageKwh
      },
      current: current
        ? {
            mes: current.mes,
            kwh: current.kwh,
            modo: current.modo,
            differenceNational,
            differenceState
          }
        : null,
      evolution: { labels: monthLabels, values: monthValues },
      co2Kg: current ? Math.round(current.kwh * CO2_FACTOR * 100) / 100 : 0,
      totalKwh,
      badgeCount: allEarned.length,
      badges: badgesWithMeta,
      tips: latest,
      goal
    })
  })

  router.get('/ranking', (req, res) => {
    const users = db.prepare('SELECT id, nome, uf, pontos FROM users').all()
    const ranking = users
      .map((u) => {
        const readings = db.prepare(
          'SELECT kwh FROM readings WHERE user_id = ? ORDER BY mes ASC'
        ).all(u.id)
        if (readings.length === 0) {
          return { ...u, mediaKwh: null, economiaPercent: 0, leituras: 0 }
        }
        const media = readings.reduce((s, r) => s + r.kwh, 0) / readings.length
        const economia = Math.round(((MEDIA_NACIONAL_KWH - media) / MEDIA_NACIONAL_KWH) * 1000) / 10
        return {
          ...u,
          mediaKwh: Math.round(media * 10) / 10,
          economiaPercent: economia,
          leituras: readings.length
        }
      })
      .filter((u) => u.leituras > 0)
      .sort((a, b) => b.economiaPercent - a.economiaPercent)
      .slice(0, 20)

    res.json({ ranking })
  })

  return router
}

function formatMonth (mes) {
  const [y, m] = mes.split('-')
  const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${nomes[Number(m) - 1]}/${y.slice(2)}`
}

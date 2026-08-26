import { evaluateBadges } from './badges.js'
import { MEDIA_NACIONAL_KWH } from './states.js'

export function evaluateAndAward (db, userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  const readings = db.prepare(
    'SELECT * FROM readings WHERE user_id = ? ORDER BY mes ASC'
  ).all(userId)

  const monthsBelowAverage = readings.filter((r) => r.kwh < MEDIA_NACIONAL_KWH).length
  const goalHits = user.meta_kwh
    ? readings.filter((r) => r.kwh <= user.meta_kwh).length
    : 0

  const earned = evaluateBadges({ readings, user, monthsBelowAverage, goalHits })
  const stored = new Set(
    db.prepare('SELECT badge_id FROM user_badges WHERE user_id = ?').all(userId).map((b) => b.badge_id)
  )

  const insertBadge = db.prepare(
    'INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)'
  )
  const totalBadgePoints = earned.reduce((sum, b) => sum + b.pontos, 0)
  const totalPoints = readings.length * 10 + totalBadgePoints

  db.prepare('UPDATE users SET pontos = ? WHERE id = ?').run(totalPoints, userId)

  const newBadges = []
  for (const badge of earned) {
    if (!stored.has(badge.id)) {
      insertBadge.run(userId, badge.id)
      newBadges.push(badge)
    }
  }
  return { allEarned: earned, newBadges, points: totalPoints }
}

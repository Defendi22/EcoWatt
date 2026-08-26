import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { estimateFromAppliances, appliances } from '../appliances.js'
import { evaluateAndAward } from '../rewards.js'

export function readingRoutes (db) {
  const router = Router()
  router.use(authMiddleware(db))

  router.get('/', (req, res) => {
    const readings = db.prepare(
      'SELECT * FROM readings WHERE user_id = ? ORDER BY mes DESC'
    ).all(req.user.id)
    res.json({ readings: readings.map(decorate) })
  })

  router.post('/', (req, res) => {
    const { mes, modo, kwh, aparelhos } = req.body || {}
    if (!mes || !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
      return res.status(400).json({ error: 'Mês inválido. Use o formato YYYY-MM' })
    }
    if (modo !== 'conta' && modo !== 'estimativa') {
      return res.status(400).json({ error: 'Modo inválido' })
    }
    let finalKwh = Number(kwh)
    if (modo === 'estimativa') {
      finalKwh = estimateFromAppliances(aparelhos || [])
    }
    if (!finalKwh || finalKwh <= 0 || finalKwh > 100000) {
      return res.status(400).json({ error: 'Informe um consumo válido (kWh)' })
    }
    const exists = db.prepare(
      'SELECT id FROM readings WHERE user_id = ? AND mes = ?'
    ).get(req.user.id, mes)
    if (exists) {
      return res.status(409).json({ error: 'Já existe um registro para este mês. Edite o registro existente.' })
    }
    const info = db.prepare(
      'INSERT INTO readings (user_id, mes, modo, kwh, aparelhos) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, mes, modo, Math.round(finalKwh * 100) / 100, JSON.stringify(aparelhos || null))
    const reading = db.prepare('SELECT * FROM readings WHERE id = ?').get(info.lastInsertRowid)
    const rewards = evaluateAndAward(db, req.user.id)
    res.status(201).json({ reading: decorate(reading), rewards })
  })

  router.put('/:id', (req, res) => {
    const reading = db.prepare('SELECT * FROM readings WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
    if (!reading) {
      return res.status(404).json({ error: 'Registro não encontrado' })
    }
    const { kwh, aparelhos, modo } = req.body || {}
    let finalKwh = Number(kwh !== undefined ? kwh : reading.kwh)
    let finalModo = modo || reading.modo
    let finalAparelhos = aparelhos !== undefined ? aparelhos : (reading.aparelhos ? JSON.parse(reading.aparelhos) : null)
    if (finalModo === 'estimativa') {
      finalKwh = estimateFromAppliances(finalAparelhos || [])
    }
    if (!finalKwh || finalKwh <= 0 || finalKwh > 100000) {
      return res.status(400).json({ error: 'Informe um consumo válido (kWh)' })
    }
    db.prepare('UPDATE readings SET kwh = ?, modo = ?, aparelhos = ? WHERE id = ?')
      .run(Math.round(finalKwh * 100) / 100, finalModo, JSON.stringify(finalAparelhos), reading.id)
    const updated = db.prepare('SELECT * FROM readings WHERE id = ?').get(reading.id)
    const rewards = evaluateAndAward(db, req.user.id)
    res.json({ reading: decorate(updated), rewards })
  })

  router.delete('/:id', (req, res) => {
    const info = db.prepare('DELETE FROM readings WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' })
    }
    const rewards = evaluateAndAward(db, req.user.id)
    res.json({ ok: true, rewards })
  })

  return router
}

function decorate (r) {
  return {
    id: r.id,
    mes: r.mes,
    modo: r.modo,
    kwh: r.kwh,
    aparelhos: r.aparelhos ? JSON.parse(r.aparelhos) : [],
    criadoEm: r.criado_em
  }
}

export { appliances as applianceCatalog }

import express from 'express'
import cors from 'cors'
import { authRoutes } from './routes/auth.js'
import { readingRoutes } from './routes/readings.js'
import { statsRoutes } from './routes/stats.js'

export function createApp (db) {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (req, res) => res.json({ ok: true }))
  app.use('/api/auth', authRoutes(db))
  app.use('/api/readings', readingRoutes(db))
  app.use('/api', statsRoutes(db))

  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Erro interno no servidor' })
  })

  return app
}

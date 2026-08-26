import path from 'node:path'
import { openDatabase } from './db.js'
import { createApp } from './app.js'

const PORT = Number(process.env.PORT) || 3001
const DB_PATH = process.env.DB_PATH || path.join(import.meta.dirname, '..', 'data', 'app.db')

const db = openDatabase(DB_PATH)
const app = createApp(db)

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`)
})

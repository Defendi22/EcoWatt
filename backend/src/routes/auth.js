import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { signToken, authMiddleware } from '../middleware/auth.js'

export function authRoutes (db) {
  const router = Router()

  router.post('/register', (req, res) => {
    const { nome, email, senha, uf, moradores } = req.body || {}
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }
    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres' })
    }
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
    if (exists) {
      return res.status(409).json({ error: 'Este email já está cadastrado' })
    }
    const hash = bcrypt.hashSync(senha, 10)
    const info = db.prepare(
      'INSERT INTO users (nome, email, senha_hash, uf, moradores) VALUES (?, ?, ?, ?, ?)'
    ).run(nome, email.toLowerCase(), hash, uf || null, Number(moradores) || 1)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
    res.status(201).json({ token: signToken(user), user: publicUser(user) })
  })

  router.post('/login', (req, res) => {
    const { email, senha } = req.body || {}
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').toLowerCase())
    if (!user || !bcrypt.compareSync(senha || '', user.senha_hash)) {
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }
    res.json({ token: signToken(user), user: publicUser(user) })
  })

  router.get('/me', authMiddleware(db), (req, res) => {
    res.json({ user: publicUser(req.user) })
  })

  router.put('/me', authMiddleware(db), (req, res) => {
    const { nome, uf, moradores, metaKwh } = req.body || {}
    const current = req.user
    const updatedNome = nome || current.nome
    const updatedUf = uf !== undefined ? uf : current.uf
    const updatedMoradores = moradores !== undefined ? Number(moradores) || 0 : current.moradores
    const updatedMeta = metaKwh !== undefined ? (metaKwh === null ? null : Number(metaKwh)) : current.meta_kwh
    db.prepare(
      'UPDATE users SET nome = ?, uf = ?, moradores = ?, meta_kwh = ? WHERE id = ?'
    ).run(updatedNome, updatedUf, updatedMoradores, updatedMeta, current.id)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(current.id)
    res.json({ user: publicUser(user) })
  })

  return router
}

function publicUser (u) {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    uf: u.uf,
    moradores: u.moradores,
    metaKwh: u.meta_kwh,
    pontos: u.pontos,
    criadoEm: u.criado_em
  }
}

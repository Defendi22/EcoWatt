import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'desenvolvimento-chave-trocar-em-producao'

export function signToken (user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

export function authMiddleware (db) {
  return (req, res, next) => {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autenticado' })
    }
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET)
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id)
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' })
      }
      req.user = user
      next()
    } catch {
      return res.status(401).json({ error: 'Sessão inválida ou expirada' })
    }
  }
}

import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { openDatabase } from '../src/db.js'
import { createApp } from '../src/app.js'

let db
let server
let base

before(async () => {
  db = openDatabase(':memory:')
  const app = createApp(db)
  server = app.listen(0)
  base = `http://localhost:${server.address().port}`
})

after(async () => {
  server.close()
  db.close()
})

async function request (path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  let data = null
  try { data = await res.json() } catch { /* noop */ }
  return { status: res.status, data }
}

async function register (overrides = {}) {
  return request('/api/auth/register', {
    method: 'POST',
    body: {
      nome: 'Ana',
      email: `ana${Math.random().toString(36).slice(2, 8)}@teste.com`,
      senha: '123456',
      uf: 'SP',
      moradores: 3,
      ...overrides
    }
  })
}

test('registro retorna token e usuário', async () => {
  const { status, data } = await register()
  assert.equal(status, 201)
  assert.ok(data.token)
  assert.equal(data.user.uf, 'SP')
})

test('registro rejeita email duplicado', async () => {
  const { data } = await register()
  const res = await request('/api/auth/register', {
    method: 'POST',
    body: { nome: 'Outro', email: data.user.email, senha: '123456' }
  })
  assert.equal(res.status, 409)
})

test('login com senha errada falha', async () => {
  const { data } = await register()
  const res = await request('/api/auth/login', {
    method: 'POST',
    body: { email: data.user.email, senha: 'errada' }
  })
  assert.equal(res.status, 401)
})

test('leitura por conta de luz é criada e listada', async () => {
  const { data: reg } = await register()
  const token = reg.token
  const res = await request('/api/readings', {
    method: 'POST',
    token,
    body: { mes: '2026-01', modo: 'conta', kwh: 180 }
  })
  assert.equal(res.status, 201)
  assert.equal(res.data.reading.kwh, 180)

  const list = await request('/api/readings', { token })
  assert.equal(list.data.readings.length, 1)
})

test('mês duplicado é rejeitado', async () => {
  const { data: reg } = await register()
  const token = reg.token
  await request('/api/readings', { method: 'POST', token, body: { mes: '2026-02', modo: 'conta', kwh: 100 } })
  const res = await request('/api/readings', { method: 'POST', token, body: { mes: '2026-02', modo: 'conta', kwh: 200 } })
  assert.equal(res.status, 409)
})

test('estimativa por aparelhos calcula kWh corretamente', async () => {
  const { data: reg } = await register()
  const token = reg.token
  const res = await request('/api/readings', {
    method: 'POST',
    token,
    body: {
      mes: '2026-03',
      modo: 'estimativa',
      aparelhos: [{ id: 'chuveiro', qtd: 1, horasDia: 0.5 }]
    }
  })
  assert.equal(res.status, 201)
  // 5500 W * 1 * 0.5h * 30 dias / 1000 = 82.5 kWh
  assert.equal(res.data.reading.kwh, 82.5)
})

test('edição de leitura funciona', async () => {
  const { data: reg } = await register()
  const token = reg.token
  const created = await request('/api/readings', { method: 'POST', token, body: { mes: '2026-04', modo: 'conta', kwh: 150 } })
  const res = await request(`/api/readings/${created.data.reading.id}`, {
    method: 'PUT',
    token,
    body: { kwh: 120 }
  })
  assert.equal(res.status, 200)
  assert.equal(res.data.reading.kwh, 120)
})

test('exclusão de leitura funciona', async () => {
  const { data: reg } = await register()
  const token = reg.token
  const created = await request('/api/readings', { method: 'POST', token, body: { mes: '2026-05', modo: 'conta', kwh: 150 } })
  const res = await request(`/api/readings/${created.data.reading.id}`, { method: 'DELETE', token })
  assert.equal(res.status, 200)
  assert.equal(res.data.ok, true)
})

test('rota privada exige autenticação', async () => {
  const res = await request('/api/readings')
  assert.equal(res.status, 401)
})

test('estatísticas retornam comparativos', async () => {
  const { data: reg } = await register()
  const token = reg.token
  await request('/api/readings', { method: 'POST', token, body: { mes: '2026-06', modo: 'conta', kwh: 140 } })
  const res = await request('/api/statistics', { token })
  assert.equal(res.status, 200)
  assert.equal(res.data.averages.nacional, 152)
  assert.equal(res.data.averages.estadual, 185)
  assert.ok(res.data.badges.length > 0)
  assert.equal(res.data.badges.find((b) => b.id === 'first_reading').conquistado, true)
})

test('ranking público ordena por economia', async () => {
  const { data: regA } = await register()
  const { data: regB } = await register()
  await request('/api/readings', { method: 'POST', token: regA.token, body: { mes: '2026-07', modo: 'conta', kwh: 100 } })
  await request('/api/readings', { method: 'POST', token: regB.token, body: { mes: '2026-07', modo: 'conta', kwh: 200 } })
  const res = await request('/api/ranking')
  assert.equal(res.status, 200)
  const posA = res.data.ranking.findIndex((r) => r.id === regA.user.id)
  const posB = res.data.ranking.findIndex((r) => r.id === regB.user.id)
  assert.ok(posA !== -1 && posB !== -1, 'ambos usuários devem aparecer no ranking')
  assert.ok(posA < posB, 'usuário com menor consumo deve estar à frente')
  assert.equal(res.data.ranking[posA].economiaPercent > 0, true)
})

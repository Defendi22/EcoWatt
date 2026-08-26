# Design — Energia & Sustentabilidade BR

## Visão geral

Aplicativo web público para registrar e acompanhar o consumo de energia elétrica
residencial, comparando-o com a média nacional (~152 kWh/mês) e a média por
estado, promovendo inovação e sustentabilidade por meio de metas, dicas,
gamificação e ranking.

## Arquitetura

- `backend/` — Node.js + Express + SQLite (better-sqlite3), autenticação JWT,
  senhas com bcrypt. API sob o prefixo `/api`.
- `frontend/` — React + Vite + TypeScript + Tailwind CSS.
- Proxy reverso no Vite: `/api` → `http://localhost:3001`.
- `start.sh` sobe backend e frontend juntos.

## Modelo de dados (SQLite)

- `users` — id, nome, email (único), senha_hash, uf, moradores, pontos,
  meta_kwh (opcional), criado_em.
- `readings` — id, user_id, mes (YYYY-MM, único por usuário), modo
  (`conta` | `estimativa`), kwh, aparelhos_json, criado_em.
- `appliances` — catálogo fixo embutido no código (nome, potencia_w).
- `badges` — definições fixas de conquistas.
- `user_badges` — user_id, badge_id, conquistado_em.
- Tabela fixa `states` no código com a média residencial mensal de kWh por UF.

## Funcionalidades

### Landing page
Seção hero com mensagem sobre energia e sustentabilidade, estatísticas nacionais,
"como funciona" em 3 passos, seção de inovação e sustentabilidade e CTAs.

### Autenticação
Cadastro (nome, email, senha, UF, moradores) e login. Token JWT armazenado no
localStorage. Rotas privadas protegidas por middleware.

### Registro de consumo (2 modos)
- **Conta de luz**: usuário digita os kWh da fatura do mês.
- **Estimativa**: seleciona aparelhos (catálogo fixo), quantidade e horas/dia;
  kWh = soma(potencia_w × qtd × horas_dia × 30 / 1000).

Mês é único por usuário; leitura pode ser editada e excluída.

### Dashboard
- Medidor de consumo do mês atual vs média nacional e do estado.
- Gráfico de linha com a evolução mensal.
- Gráfico de barras comparando usuário vs média nacional vs média do estado.
- Histórico de leituras com edição e exclusão.
- Estimativa de CO2 (kg) do mês (fator ~0,06 kg CO2/kWh).
- Metas: kWh-alvo com barra de progresso.
- Dicas sustentáveis personalizadas (baseadas no maior consumo / aparelhos).
- Medalhas conquistadas e pontos acumulados.

### Gamificação e ranking
- Medalhas: primeiro registro, 3 meses de registros, 1 mês abaixo da média,
  3 meses abaixo da média, redução de 10% vs mês anterior, meta atingida,
  perfil completo.
- Pontos: +10 por leitura, +25 por medalha.
- Ranking público por economia média (% abaixo da média nacional).

## Erros e qualidade

- Validação no backend (kWh > 0, mês único, formato YYYY-MM, email válido).
- Mensagens de erro amigáveis em português.
- Middleware de autenticação nas rotas privadas.
- Testes da API com `node:test` e banco em memória.

## Médias regionais

Dados aproximados de consumo residencial médio mensal (kWh) por UF, baseados em
valores da EPE/PRODIST, ajustáveis em `backend/src/states.js`.

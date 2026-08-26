# Energia & Sustentabilidade BR

Aplicativo web para registrar e acompanhar o consumo de energia elétrica
residencial, comparando-o com a média nacional (~152 kWh/mês) e a média por
estado brasileiro — um projeto de inovação e sustentabilidade.

## Funcionalidades

- **Cadastro e login** de usuários
- **Registro de consumo em 2 modos**: anotar os kWh da conta de luz ou
  estimar pelos eletrodomésticos (quantidade e horas de uso)
- **Comparação** com a média nacional e a média do seu estado
- **Dashboard** com medidor visual, gráficos de evolução e comparativo,
  histórico (editar/excluir)
- **Metas mensais** de consumo com barra de progresso
- **Dicas sustentáveis** personalizadas
- **Gamificação**: medalhas, pontos e ranking público de economia
- **Pegada de carbono** estimada (kg CO₂)

## Tecnologias

- **Backend**: Node.js + Express + SQLite (better-sqlite3) + JWT + bcrypt
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Recharts
- Proxy reverso do Vite: `/api` → `http://localhost:3001`

## Como rodar

```bash
# Instalar dependências
(cd backend && npm install)
(cd frontend && npm install)

# Rodar tudo (backend :3001 + frontend :5173)
./start.sh
```

Acesse http://localhost:5173

## Testes

```bash
(cd backend && npm test)
```

## Estrutura

```
backend/   API REST (Express + SQLite)
frontend/  SPA (React + Vite)
docs/      Documentação de design
```

> Médias regionais são valores aproximados baseados em dados públicos da EPE,
> ajustáveis em `backend/src/states.js`.

# CRM Platform — Monorepo

## Overview
CRM moderno integrado ao SAP Business One. Arquitetura monorepo com pnpm workspaces:
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Strapi**: CRM/headless backend com content types e rotas customizadas
- **SAP Integration**: Serviço dedicado Node.js/Express para integração com SAP B1 Service Layer
- **Shared**: Pacotes de tipos e utilitários compartilhados

## Monorepo Structure
```
crm-platform/
  apps/
    frontend/         Next.js 14 + TypeScript (port 5000)
    strapi/           Strapi 5 CRM backend (port 1337)
    sap-integration/  Express API → SAP B1 Service Layer (port 3000)
  packages/
    shared-types/     Tipos TypeScript compartilhados
    shared-utils/     Funções utilitárias compartilhadas
  infra/
    docker-compose.yml  PostgreSQL + Redis + todos os serviços
  .env.example         Template de variáveis de ambiente
```

## Running Services

### Frontend (Next.js — port 5000)
- Workflow: "Start application"
- Command: `pnpm --filter crm-frontend dev`
- URL: http://localhost:5000

### SAP Integration (Express — port 3000)
- Workflow: "Start SAP Integration"
- Command: `pnpm --filter sap-integration dev`
- Endpoints: `GET /api/clientes`, `GET /api/clientes/codigo/:id`, etc.

### Strapi CRM (port 1337)
- Needs PostgreSQL (use Docker Compose for local dev)
- Command: `pnpm --filter strapi-crm dev`
- Admin: http://localhost:1337/admin

## Strapi Content Types (11 total)
- `crm-note`, `crm-task`, `crm-notification`, `crm-account-tag`
- `crm-contact-history`, `crm-pipeline-config`, `crm-dashboard-config`
- `crm-user-preference`, `crm-integration-log`
- `crm-sap-cache-account`, `crm-sap-cache-opportunity`

## Custom CRM Routes (Strapi)
- `GET /crm/clientes` — lista clientes (via SAP)
- `GET /crm/clientes/busca?nome=` — busca por nome
- `GET /crm/clientes/:cardCode` — busca por código
- `GET /crm/clientes/:cardCode/visao-completa` — dados SAP + CRM
- `POST /crm/clientes/:cardCode/notas` — cria nota
- `GET /crm/dashboard/resumo` — resumo do dashboard

## SAP Integration API Endpoints
- `GET /` — health check
- `GET /api/health` — health check com timestamp
- `GET /api/clientes` — listar clientes (BusinessPartners)
- `GET /api/clientes/nome/:nome` — busca por nome
- `GET /api/clientes/codigo/:codigo` — busca por código
- `GET /api/clientes/codigo/:codigo/completo` — dados completos + pedidos

## SAP Configuration
- `config.json` — SAP_URL, SAP_COMPANY (legado, substituído por env vars)
- `SAP_URL`, `SAP_COMPANY`, `SAP_USER`, `SAP_PASSWORD` via env vars
- `SAP_TIMEOUT_MS` — timeout em ms (padrão: 15000)

## Frontend Pages
- `/login` — Login com Strapi auth
- `/dashboard` — Dashboard com resumo
- `/clientes` — Listagem + busca por nome/código
- `/clientes/[cardCode]` — Detalhes do cliente + pedidos + notas + tarefas

## Development Setup (Replit)
1. `pnpm install` runs automatically on workflow start
2. SAP Integration runs via "Start SAP Integration" workflow (tsx watch, port 3000)
3. Frontend runs via "Start application" workflow (Next.js, port 5000)
4. Strapi requires PostgreSQL — not run by default in Replit dev environment
5. Native packages (better-sqlite3, sharp, esbuild, etc.) approved via `pnpm.onlyBuiltDependencies` in root package.json

## Replit Migration Notes
- Replaced `ts-node-dev` with `tsx` for SAP Integration (ts-node-dev not available on Replit)
- `pnpm install` runs at workflow startup to ensure node_modules are present
- Build script approvals for native packages configured in root `package.json`

## Deployment
- Build: `pnpm --filter crm-frontend build`
- Run: `pnpm --filter crm-frontend start`
- Target: autoscale

## Architecture Notes
- Strapi NÃO substitui a integração SAP crítica
- SAP Integration: login, sessão, retry, timeout, logs técnicos
- Strapi: auth, permissões, dados CRM, webhooks, rotas compostas
- Frontend: nunca acessa SAP diretamente (sempre via Strapi ou SAP Integration API)

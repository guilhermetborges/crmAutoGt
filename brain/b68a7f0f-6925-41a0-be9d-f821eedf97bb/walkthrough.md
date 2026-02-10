# WhatsCRM — Walkthrough da Implementação

## Resultado da Build

**✅ BUILD_EXIT=0** — Compilação bem-sucedida sem erros.

**Stack:** NestJS (TypeScript) + Prisma + PostgreSQL + Socket.IO + JWT + Helmet

**Localização:** `~/.gemini/antigravity/scratch/whatscrm`

---

## Estrutura do Projeto

```
whatscrm/
├── docker-compose.yml          # PostgreSQL 16 + Redis 7
├── .env / .env.example         # Variáveis de ambiente
├── prisma/
│   ├── schema.prisma           # 16 tabelas com índices e constraints
│   └── seed.ts                 # Seed com dados demo
└── src/
    ├── main.ts                 # Bootstrap (Helmet, CORS, ValidationPipe)
    ├── app.module.ts           # Módulo raiz (16 imports)
    ├── prisma/                 # PrismaService (global)
    ├── common/
    │   ├── decorators/         # @Roles(), @CurrentUser()
    │   ├── guards/             # RolesGuard (RBAC)
    │   └── interceptors/       # AuditInterceptor
    ├── auth/                   # JWT login, refresh, profile
    ├── users/                  # CRUD com bcrypt + tenant
    ├── sectors/                # CRUD + user assignment
    ├── channels/               # WhatsApp channels + AES-256 encryption
    ├── contacts/               # CRUD + LGPD anonymize
    ├── conversations/          # Inbox + assign + transfer + lock
    ├── messages/               # Send + 24h window + templates
    ├── tags/                   # CRUD + conversation tagging
    ├── quick-replies/          # Atalhos de resposta rápida
    ├── templates/              # Templates WhatsApp (sync Meta)
    ├── audit-logs/             # Audit + integration logs
    ├── reports/                # Dashboard + por setor/agente + SLA
    ├── webhook/                # WhatsApp webhook (idempotente)
    ├── gateway/                # WebSocket (Socket.IO + JWT)
    └── health/                 # GET /health
```

---

## Módulos Implementados

### 1. **Auth** (`src/auth/`)
- Login com email/senha → JWT access (15min) + refresh (7d)
- Senhas com bcrypt (cost 12)
- Refresh token rotation
- `GET /api/v1/auth/me` com setores do usuário

### 2. **Users** (`src/users/`)
- CRUD completo com soft delete
- Filtros: role, active, sectorId
- Apenas ADMIN cria/edita usuários
- Email único por tenant

### 3. **Sectors** (`src/sectors/`)
- CRUD de setores com nome único por empresa
- Vinculação N:N de usuários a setores
- ADMIN cria, SUPERVISOR gerencia membros

### 4. **Channels** (`src/channels/`)
- Cadastro de números WhatsApp Business
- Access token criptografado com AES-256-GCM em repouso
- Generate de verify_token aleatório para webhooks

### 5. **Contacts** (`src/contacts/`)
- findOrCreate automático via webhook
- Busca por nome + telefone (trigram index)
- **LGPD:** `POST /contacts/:id/anonymize` — hash SHA256 em PII, remove conteúdo de msgs

### 6. **Conversations** (`src/conversations/`)
- **Inbox:** cursor-based pagination, filtros (status, setor, assignee, tag, contact)
- **Isolamento por setor:** non-admin vê apenas setores vinculados
- **Lock:** 2 min timeout, auto-renovável
- **Transfer:** entre atendentes ou setores, com motivo obrigatório
- **Status:** open → in_progress → pending → resolved → archived

### 7. **Messages** (`src/messages/`)
- Timeline cursor-based (scroll infinito)
- **Janela 24h:** bloqueia envio após 24h sem msg inbound (orienta template)
- **Status idempotente:** queued → sent → delivered → read (nunca regride)
- Notas internas (`is_internal: true`) não saem via WhatsApp

### 8. **Tags** (`src/tags/`)
- CRUD de tags (nome + cor) por empresa
- Vincular/desvincular tag de conversa

### 9. **Quick Replies** (`src/quick-replies/`)
- Atalhos com shortcode (ex: `/ola` → mensagem completa)
- Busca por shortcode

### 10. **Templates** (`src/templates/`)
- Lista templates sincronizados da Meta
- Suporte a sync batch via `syncFromMeta()`

### 11. **Audit Logs** (`src/audit-logs/`)
- Filtros: user, action, entityType, período
- Integration logs separados (endpoint, statusCode, latency, error)
- AuditInterceptor global registra toda escrita

### 12. **Reports** (`src/reports/`)
- **Overview:** total conversas, média 1ª resposta, resolução, abertas
- **Por setor:** volume, abertas vs resolvidas
- **Por agente:** volume, resolvidas, avg resposta
- **SLA:** breaches, warnings, histórico

### 13. **Webhook** (`src/webhook/`)
- `GET` — challenge verification (Meta)
- `POST` — responde 200 imediatamente, processa async via `setImmediate`
- **Idempotência:** verifica `wa_message_id` antes de inserir
- Cria/atualiza contato, cria/reabre conversa, emite WebSocket
- Status updates (sent → delivered → read)
- Logging em `integration_logs`

### 14. **WebSocket Gateway** (`src/gateway/`)
- Autenticação JWT na conexão
- Rooms: `company:{id}`, `sector:{id}`
- Eventos: `new_message`, `conversation_created/updated`, `message_status_updated`, `sla_alert`

### 15. **Health** (`src/health/`)
- `GET /health` — verifica conectividade com DB

### 16. **Common** (`src/common/`)
- `@Roles('admin', 'supervisor')` — decorator RBAC
- `@CurrentUser()` — extrai JWT payload
- `RolesGuard` — guard global
- `AuditInterceptor` — log automático de mutations
- Rate limiting global (100 req/min)

---

## Banco de Dados (16 tabelas)

| Tabela | Descrição |
|---|---|
| `companies` | Tenants (multi-empresa) |
| `users` | Usuários com role (admin/supervisor/atendente) |
| `sectors` | Setores de atendimento |
| `user_sectors` | N:N usuário ↔ setor |
| `whatsapp_channels` | Números WhatsApp configurados |
| `contacts` | Contatos (clientes) |
| `conversations` | Conversas com status e assignment |
| `messages` | Mensagens (in/outbound, internas) |
| `media_attachments` | Anexos de mídia (S3) |
| `conversation_transfers` | Log de transferências |
| `tags` / `conversation_tags` | Tags e vínculos |
| `quick_replies` | Respostas rápidas |
| `whatsapp_templates` | Templates WhatsApp Meta |
| `audit_logs` | Trilha de auditoria |
| `integration_logs` | Logs técnicos WhatsApp API |
| `sla_events` | Alertas e breaches de SLA |

---

## Como Rodar

```bash
# 1. Subir PostgreSQL + Redis
docker-compose up -d

# 2. Gerar Prisma Client
npx prisma generate

# 3. Criar tabelas no banco
npx prisma db push

# 4. Popular dados de demonstração
npm run db:seed

# 5. Rodar em desenvolvimento
npm run start:dev
```

**Credenciais de teste (após seed):**
| Role | Email | Senha |
|---|---|---|
| Admin | admin@demo.com | admin123456 |
| Supervisor | supervisor@demo.com | super123456 |
| Atendente | joao@demo.com | agent123456 |

---

## Próximos Passos

### Prioridade Alta (Sprint 1-2)
- [ ] **Frontend Next.js** — Painel de atendimento com inbox, timeline, sidebar de contato
- [ ] **Worker BullMQ de envio** — Processar fila `whatsapp.send` com retries e backoff real
- [ ] **Download de mídias** — Baixar mídias do webhook e upload para S3/MinIO
- [ ] **SLA Checker cron** — Job BullMQ a cada 1 min verificando first_response e resolution
- [ ] **Testes unitários** — Services: auth, messages, conversations, webhook
- [ ] **Testes e2e** — Fluxo completo: login → inbox → envio de mensagem

### Prioridade Média (Sprint 3-4)
- [ ] **Typing indicator** — WebSocket evento bidirecional
- [ ] **Export CSV** — Job assíncrono BullMQ para relatórios
- [ ] **Sincronização real de templates** — Integrar `GET /message_templates` da Meta
- [ ] **Paginação de audit logs** — Implementar data partitioning
- [ ] **Swagger/OpenAPI** — Decorators completos em todos endpoints
- [ ] **Rate limit granular** — Por rota (login: 5/15min; webhook: ilimitado)

### Prioridade Baixa (Sprint 5+)
- [ ] **Chatbot / Automações** — Motor de regras para routing automático
- [ ] **Multi-canal** — Email, Instagram DM, Telegram
- [ ] **CSAT** — Pesquisa de satisfação pós-atendimento
- [ ] **SSO/SAML** — Login corporativo
- [ ] **Mobile app** — React Native / Flutter
- [ ] **Billing** — Stripe/Asaas para cobrança por canal/agente

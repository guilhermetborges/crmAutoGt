# CRM WhatsApp Business — MVP Completo

## 1. Visão Geral do Produto (MVP)

**Nome do produto:** WhatsCRM  
**Objetivo:** Sistema multi-tenant de atendimento via WhatsApp Business (API oficial) com suporte a múltiplos atendentes, setores, filas e gestão operacional.

**Stack recomendada** (inspirada no Chatwoot, adaptada para produtividade):

| Camada | Tecnologia |
|---|---|
| Backend API | **Node.js 20+ (NestJS)** — TypeScript, decoradores, DI nativo, guards RBAC |
| Banco de dados | **PostgreSQL 16** |
| ORM | **Prisma** |
| Fila / Workers | **BullMQ + Redis** |
| Realtime | **WebSocket (Socket.IO)** via NestJS Gateway |
| Storage | **AWS S3 / MinIO** (compatível S3) |
| Cache | **Redis** |
| Auth | **JWT (access + refresh)** |
| Frontend | **Next.js 14 + React** (fora do escopo MVP backend, mas deixamos a API pronta) |

### 1.1 Escopo — O que ENTRA no MVP

- Multi-tenant (empresas isoladas)
- Autenticação JWT com roles (ADMIN, SUPERVISOR, ATENDENTE)
- CRUD de setores com atribuição de atendentes
- Configuração de canais WhatsApp (Cloud API) por empresa
- Recepção de mensagens via webhook (texto, imagem, áudio, documento, vídeo)
- Envio de mensagens na janela 24h
- Envio de templates (pré-aprovados na Meta)
- Inbox de conversas com filtros, estados e paginação
- Atribuição, transferência e lock de conversas
- Tags, notas internas, respostas rápidas
- Status de entrega/leitura (sent/delivered/read)
- Idempotência em webhooks
- Fila de retries para chamadas à API do WhatsApp
- Auditoria completa (audit trail + log técnico)
- Dashboard de métricas básicas (1ª resposta, resolução, volume)
- SLA: alerta de sem resposta
- RBAC com isolamento por setor

### 1.2 Escopo — O que FICA FORA do MVP

- Chatbot / automações de fluxo
- Roteamento automático por regras (round-robin, capacity-based)
- Multi-canal (email, Instagram, Telegram) — somente WhatsApp
- CSAT / pesquisa de satisfação
- Base de conhecimento / help center
- App mobile nativo
- SSO / SAML / OAuth federado
- Integrações CRM externo (Hubspot, Salesforce)
- Marketplace de integrações
- Billing / planos / faturamento

---

## 2. Requisitos Funcionais (Detalhados)

### RF-A: Usuários e Permissões

| ID | Requisito | Detalhes |
|---|---|---|
| RF-A01 | Cadastro de empresa (tenant) | Nome, domínio, logo, timezone, configurações |
| RF-A02 | Cadastro de usuários | Nome, email, senha, avatar, perfil (role) |
| RF-A03 | Login com JWT | Access token (15min) + Refresh token (7d), httpOnly cookie |
| RF-A04 | Roles fixos | `ADMIN`, `SUPERVISOR`, `ATENDENTE` |
| RF-A05 | ADMIN pode tudo | Gerencia empresa, canais, setores, usuários, templates, relatórios, auditoria |
| RF-A06 | SUPERVISOR gerencia setores | Gerencia atendentes do setor, vê conversas do setor, monitora SLA, transfere |
| RF-A07 | ATENDENTE vê só seus setores | Vê e interage somente com conversas dos setores que pertence |
| RF-A08 | Desativação de usuário | Soft delete, transferência de conversas pendentes |

### RF-B: Setores e Filas

| ID | Requisito | Detalhes |
|---|---|---|
| RF-B01 | CRUD de setores | Nome, descrição, cor, ativo/inativo por company |
| RF-B02 | Atribuição de usuários | Tabela N:N `user_sectors` — atendente pode estar em 1+ setores |
| RF-B03 | Roteamento manual (MVP) | Conversa nova entra como "Aberta" no setor padrão, atendente assume |
| RF-B04 | Transferência entre setores | Motivo obrigatório, gera `conversation_transfer` + audit_log |

### RF-C: WhatsApp (API Oficial — Cloud API)

| ID | Requisito | Detalhes |
|---|---|---|
| RF-C01 | Cadastro de canal | `phone_number_id`, `waba_id`, `access_token`, `verify_token`, `business_name` |
| RF-C02 | Múltiplos canais/empresa | Uma empresa pode ter N números WhatsApp |
| RF-C03 | Webhook de mensagens | `POST /webhooks/whatsapp/:channelId` — recebe mensagens e status |
| RF-C04 | Verificação webhook | Responde ao challenge GET com `hub.verify_token` |
| RF-C05 | Janela 24h | Sistema calcula se janela está aberta; bloqueia envio de texto livre se fechada |
| RF-C06 | Envio de templates | Fora da janela 24h, somente templates aprovados pela Meta |
| RF-C07 | Sincronização templates | Endpoint para listar templates da WABA e cachear no banco |
| RF-C08 | Retries com backoff | BullMQ job: tentativas 1, 2, 4, 8 min; após 5 falhas → dead-letter |
| RF-C09 | Rate limiting | Respeitar limites da Cloud API (80 msgs/seg por número) |
| RF-C10 | Status callbacks | Atualiza `message.status`: `sent` → `delivered` → `read` |

### RF-D: Conversas e Mensagens

| ID | Requisito | Detalhes |
|---|---|---|
| RF-D01 | Criação de conversa | Automaticamente na 1ª mensagem de contato novo |
| RF-D02 | Estados | `open`, `in_progress`, `pending`, `resolved`, `archived` |
| RF-D03 | Inbox com filtros | Filtro por: setor, status, atendente, tag, período, contato |
| RF-D04 | Paginação cursor-based | `cursor + limit` para performance |
| RF-D05 | Timeline de mensagens | Mensagens em ordem cronológica com status, anexos, notas |
| RF-D06 | Notas internas | `message.is_internal = true`, não enviada ao WhatsApp |
| RF-D07 | Tags/labels | CRUD de tags por empresa; N:N com conversations |
| RF-D08 | Assumir conversa | Atendente clica "assumir"; seta `assignee_id` + lock |
| RF-D09 | Transferir atendente | Registra `conversation_transfer` com motivo |
| RF-D10 | Transferir setor | Muda `sector_id`, registra transfer, notifica novo setor |
| RF-D11 | Lock de conversa | `locked_by_user_id + locked_at`; expira em 2 min sem atividade |
| RF-D12 | Respostas rápidas | CRUD de templates internos (shortcode + conteúdo); busca por `/` |
| RF-D13 | Idempotência | Unique constraint em `(channel_id, wa_message_id)` |
| RF-D14 | Anexos/mídias | Download da mídia do WhatsApp → upload S3 → salva `media_attachments` |

### RF-E: Auditoria e Logs

| ID | Requisito | Detalhes |
|---|---|---|
| RF-E01 | Audit trail | Tabela `audit_logs`: user_id, action, entity_type, entity_id, changes (JSONB), ip, timestamp |
| RF-E02 | Ações auditadas | Login, transferência, mudança status, criação/edição de config, permissões |
| RF-E03 | Log técnico | Tabela `integration_logs`: channel_id, direction, status_code, payload_summary, latency_ms, error, retries |
| RF-E04 | Retenção | Audit logs: 2 anos; Integration logs: 90 dias (job de limpeza) |

### RF-F: Relatórios (MVP)

| ID | Requisito | Detalhes |
|---|---|---|
| RF-F01 | Dashboard | Período selecionável (hoje, 7d, 30d, custom) |
| RF-F02 | Métricas | Total conversas, tempo médio 1ª resposta, tempo médio resolução |
| RF-F03 | Por setor | Conversas abertas/resolvidas por setor |
| RF-F04 | Por atendente | Atendimentos ativos, resolvidos, tempo médio |
| RF-F05 | SLA | % de conversas com 1ª resposta dentro do threshold |
| RF-F06 | Export CSV | Endpoint que gera CSV assíncrono via BullMQ e disponibiliza link para download |

---

## 3. Requisitos Não Funcionais

| Categoria | Requisito | Detalhes |
|---|---|---|
| **Performance** | Inbox < 200ms | Índices compostos; paginação cursor-based; cache Redis para contadores |
| **Performance** | Timeline < 150ms | Índice `(conversation_id, created_at)` |
| **Escalabilidade** | Webhook desacoplado | Webhook enfileira no BullMQ → worker processa |
| **Escalabilidade** | Workers horizontais | BullMQ workers stateless, escaláveis |
| **Segurança** | RBAC | Guard NestJS verifica role + tenant em toda request |
| **Segurança** | Isolamento tenant | Toda query filtra por `company_id`; middleware global |
| **Segurança** | Criptografia | TLS 1.2+ em trânsito; tokens WhatsApp criptografados em repouso (AES-256) |
| **Segurança** | Rate limiting API | Express rate limiter: 100 req/min por IP |
| **Observabilidade** | Logs estruturados | JSON logs com correlation_id (Winston/Pino) |
| **Observabilidade** | Health check | `GET /health` com status do DB, Redis, Workers |
| **Confiabilidade** | Dead-letter queue | Mensagens que falharam 5x vão para DLQ para análise |
| **Confiabilidade** | Idempotência | Unique constraints + upsert em webhooks |
| **LGPD** | Consentimento | Campo `opt_in_at` no contato para mensagens ativas |
| **LGPD** | Anonimização | Endpoint para anonimizar dados do contato (nome, telefone → hash) |
| **LGPD** | Retenção | Política configurável por empresa; job de purge |
| **Disponibilidade** | Deploy | Docker + docker-compose; CI/CD com rollback automático |

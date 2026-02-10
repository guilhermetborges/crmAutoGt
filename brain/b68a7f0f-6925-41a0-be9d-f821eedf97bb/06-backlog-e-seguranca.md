# CRM WhatsApp Business — Backlog do MVP e Segurança

## 12. Backlog do MVP (Épicos → Histórias + Critérios de Aceite)

### Épico 1: Infraestrutura e Autenticação

#### US-1.1: Setup do projeto
**Como** desenvolvedor, **quero** configurar o projeto NestJS com Prisma, BullMQ e Docker, **para** ter base produtiva.
- **CA:** Projeto NestJS roda com `docker-compose up` (API + Postgres + Redis)
- **CA:** Prisma migrations criam schema completo
- **CA:** Health check `GET /health` retorna status do DB e Redis

#### US-1.2: Cadastro de empresa (tenant)
**Como** super admin, **quero** criar uma nova empresa, **para** onboardar clientes.
- **CA:** POST cria empresa com name, domain, timezone
- **CA:** Gera sequence de display_id para conversas

#### US-1.3: Login e JWT
**Como** usuário, **quero** fazer login com email/senha, **para** receber token de acesso.
- **CA:** POST `/auth/login` retorna access_token (15min) + refresh_token (7d)
- **CA:** Access token contém: user_id, company_id, role
- **CA:** Refresh token armazenado em httpOnly cookie
- **CA:** POST `/auth/refresh` renova access token
- **CA:** Senha armazenada com bcrypt (cost 12)

#### US-1.4: Middleware de tenant
**Como** sistema, **quero** isolar dados por empresa, **para** garantir multi-tenancy.
- **CA:** Toda request extrai company_id do JWT
- **CA:** Toda query inclui `WHERE company_id = :company_id`
- **CA:** Tentativa de acessar dado de outro tenant retorna 404

---

### Épico 2: Gestão de Usuários e Setores

#### US-2.1: CRUD de usuários
**Como** admin, **quero** gerenciar usuários da empresa.
- **CA:** CRUD completo com validações (email único por company, role válido)
- **CA:** Soft delete (active=false) transfere conversas pendentes
- **CA:** Apenas ADMIN pode criar/editar/desativar usuários

#### US-2.2: CRUD de setores
**Como** admin, **quero** criar setores (Comercial, Suporte, etc.).
- **CA:** Nome único por company
- **CA:** Pode desativar setor (impede novas conversas, mantém histórico)

#### US-2.3: Atribuição de usuários a setores
**Como** admin/supervisor, **quero** vincular atendentes a setores.
- **CA:** Um atendente pode pertencer a múltiplos setores
- **CA:** Supervisor só gerencia setores que pertence

---

### Épico 3: Integração WhatsApp

#### US-3.1: Cadastro de canal WhatsApp
**Como** admin, **quero** configurar número WhatsApp Business da empresa.
- **CA:** Cadastra phone_number_id, waba_id, access_token (criptografado)
- **CA:** Gera verify_token único para webhook

#### US-3.2: Webhook de verificação
**Como** sistema, **quero** responder ao challenge da Meta.
- **CA:** GET `/webhooks/whatsapp/:channelId` valida verify_token e retorna challenge
- **CA:** Loga tentativas inválidas

#### US-3.3: Recepção de mensagens
**Como** sistema, **quero** processar mensagens recebidas via webhook.
- **CA:** Valida assinatura HMAC
- **CA:** Responde 200 em <5s, processa async
- **CA:** Cria/busca contato, cria/reabre conversa
- **CA:** Idempotência: mesma wa_message_id não duplica
- **CA:** Suporta: text, image, audio, video, document, location, sticker

#### US-3.4: Envio de mensagens (janela 24h)
**Como** atendente, **quero** responder mensagens do contato.
- **CA:** Verifica janela 24h antes de enviar
- **CA:** Se fechada → rejeita com orientação para usar template
- **CA:** Enfileira no BullMQ, processa com retries
- **CA:** Atualiza status da mensagem (sent/delivered/read)

#### US-3.5: Envio de templates
**Como** atendente, **quero** enviar template pré-aprovado, **para** iniciar conversa.
- **CA:** Lista apenas templates com status=approved
- **CA:** Valida parâmetros do template
- **CA:** Verifica opt-in do contato (se configurado)

#### US-3.6: Sincronização de templates
**Como** admin, **quero** sincronizar templates da Meta.
- **CA:** Busca templates via API da Meta e salva/atualiza no banco
- **CA:** Registra status (approved/pending/rejected)

#### US-3.7: Download e armazenamento de mídias
**Como** sistema, **quero** baixar mídias recebidas e armazenar no S3.
- **CA:** Faz download da URL da mídia da Meta
- **CA:** Upload para S3 com key organizada: `{company_id}/{year}/{month}/{message_id}/{filename}`
- **CA:** Gera URL assinada para acesso

---

### Épico 4: Inbox e Gestão de Conversas

#### US-4.1: Inbox com filtros
**Como** atendente, **quero** ver minhas conversas filtradas.
- **CA:** Filtros: status, setor, atendente, tag, período, busca por contato
- **CA:** Paginação cursor-based, limit=25
- **CA:** Ordenação por last_activity_at DESC
- **CA:** Resposta < 200ms com índices

#### US-4.2: Timeline de mensagens
**Como** atendente, **quero** ver o histórico completo da conversa.
- **CA:** Mensagens em ordem cronológica
- **CA:** Exibe: conteúdo, status, hora, anexos, notas internas
- **CA:** Paginação cursor-based (scroll infinito)

#### US-4.3: Assumir e atribuir conversa
**Como** atendente, **quero** assumir uma conversa aberta.
- **CA:** Seta assignee_id, muda status para in_progress
- **CA:** Ativa lock automático
- **CA:** Emite WebSocket para atualizar inbox de todos

#### US-4.4: Lock de conversa
**Como** sistema, **quero** impedir respostas concorrentes.
- **CA:** Lock por user com expiração de 2 min sem atividade
- **CA:** Renova automaticamente ao digitar/enviar
- **CA:** Outro atendente vê "Conversa em edição por X"

#### US-4.5: Transferência de conversa
**Como** atendente, **quero** transferir conversa para outro atendente ou setor.
- **CA:** Motivo obrigatório (texto livre, min 10 chars)
- **CA:** Registra conversation_transfer
- **CA:** Ao transferir setor: remove assignee, status → open
- **CA:** Emite WebSocket para ambos os setores

#### US-4.6: Notas internas
**Como** atendente, **quero** adicionar notas visíveis só para a equipe.
- **CA:** Mensagem com is_internal=true
- **CA:** Não é enviada ao WhatsApp
- **CA:** Aparece destacada na timeline (cor diferente)

#### US-4.7: Tags e labels
**Como** atendente, **quero** marcar conversas com tags.
- **CA:** CRUD de tags (nome + cor) por empresa
- **CA:** Adicionar/remover tags de uma conversa
- **CA:** Filtrar inbox por tag

#### US-4.8: Respostas rápidas
**Como** atendente, **quero** usar atalhos para mensagens frequentes.
- **CA:** Digitar `/` no campo de texto mostra lista de respostas rápidas
- **CA:** Busca por shortcode
- **CA:** Selecionar insere conteúdo no campo

---

### Épico 5: Auditoria e Logs

#### US-5.1: Audit trail
**Como** admin, **quero** ver quem fez o quê e quando.
- **CA:** Lista filtrável por: usuário, ação, entidade, período
- **CA:** Paginação, máximo 100 itens por página
- **CA:** Registra: login, transferências, mudanças de status, config

#### US-5.2: Logs técnicos de integração
**Como** admin, **quero** ver logs de comunicação com WhatsApp API.
- **CA:** Lista: direction, status_code, latency, error
- **CA:** Payload resumido (truncado a 1KB)
- **CA:** Filtro por canal e período

---

### Épico 6: Relatórios e SLA

#### US-6.1: Dashboard de métricas
**Como** supervisor, **quero** ver métricas operacionais.
- **CA:** Total de conversas no período
- **CA:** Tempo médio de 1ª resposta
- **CA:** Tempo médio de resolução
- **CA:** Conversas por setor e por atendente
- **CA:** Taxa de pendentes vs resolvidas

#### US-6.2: Alertas de SLA
**Como** supervisor, **quero** ser alertado de conversas sem resposta.
- **CA:** Cron job verifica a cada 1 min
- **CA:** Warning em 5 min, breach em 15 min (configurável)
- **CA:** Alerta via WebSocket no painel do supervisor

#### US-6.3: Export CSV
**Como** admin, **quero** exportar dados de conversas em CSV.
- **CA:** Job assíncrono (BullMQ)
- **CA:** Retorna link para download quando pronto
- **CA:** CSV inclui: conversa_id, contato, setor, atendente, status, timestamps

---

### Épico 7: Realtime (WebSocket)

#### US-7.1: Conexão WebSocket
**Como** atendente, **quero** receber atualizações em tempo real.
- **CA:** Conecta com JWT
- **CA:** Entra em rooms do company e setores do usuário
- **CA:** Reconexão automática com backoff

#### US-7.2: Eventos em tempo real
**Como** atendente, **quero** ver novas mensagens sem refresh.
- **CA:** Eventos: new_message, conversation_updated, assignment_changed
- **CA:** Indicador de typing
- **CA:** Lock visual em tempo real

---

## 13. Checklist de Segurança e Compliance (LGPD)

### 13.1 Autenticação e Autorização

- [x] Senhas com bcrypt (cost factor ≥ 12)
- [x] JWT com expiração curta (15 min access, 7d refresh)
- [x] Refresh token rotation (invalida anterior ao usar)
- [x] Rate limiting no login (5 tentativas / 15 min por IP)
- [x] RBAC em toda rota com decorador `@Roles()`
- [x] Guard de setor para isolamento horizontal

### 13.2 Proteção de Dados

- [x] Access tokens do WhatsApp criptografados em repouso (AES-256-GCM)
- [x] TLS 1.2+ obrigatório (Nginx/ALB termina SSL)
- [x] Validação de assinatura HMAC em webhooks (X-Hub-Signature-256)
- [x] Sanitização de inputs (class-validator no NestJS)
- [x] Proteção contra SQL injection (Prisma parameterized queries)
- [x] Headers de segurança: HSTS, X-Content-Type-Options, X-Frame-Options
- [x] CORS configurado por domínio da empresa

### 13.3 Multi-tenancy

- [x] `company_id` em TODA tabela de negócio
- [x] Middleware global injeta company_id do JWT em toda query
- [x] Testes automatizados de isolamento (tentativa cross-tenant = 404)
- [x] Índices compostos começam com company_id para performance

### 13.4 LGPD — Lei Geral de Proteção de Dados

| Requisito | Implementação |
|---|---|
| **Base legal** | Legítimo interesse para atendimento; consentimento para templates proativos |
| **Opt-in** | Campo `contact.opt_in` + `opt_in_at` obrigatório para envio de templates |
| **Direito de acesso** | Endpoint `GET /contacts/:id` retorna todos os dados do contato |
| **Direito de retificação** | Endpoint `PATCH /contacts/:id` permite correção |
| **Direito de exclusão** | Endpoint `POST /contacts/:id/anonymize` troca PII por hashes |
| **Portabilidade** | Export CSV com dados do contato e mensagens |
| **Retenção** | Política configurável por empresa (padrão: 2 anos msgs, 90 dias logs técnicos) |
| **Anonimização** | Job cron de anonimização para dados além do período de retenção |
| **Registro de atividades** | Tabela `audit_logs` com todas operações sobre dados pessoais |
| **Minimização** | Payload de webhook truncado em logs (sem dados sensíveis completos) |
| **Encarregado (DPO)** | Campo configurável na empresa para dados do DPO |

### 13.5 Tratamento de anonimização

```sql
-- Exemplo de anonimização de contato
UPDATE contacts SET
  name = 'ANONIMIZADO',
  phone_number = encode(digest(phone_number, 'sha256'), 'hex'),
  wa_id = encode(digest(wa_id, 'sha256'), 'hex'),
  profile_picture_url = NULL,
  custom_attributes = '{}',
  updated_at = NOW()
WHERE id = :contact_id;

-- Mensagens do contato: remove conteúdo
UPDATE messages SET
  content = '[CONTEÚDO REMOVIDO POR SOLICITAÇÃO LGPD]',
  content_attributes = '{}',
  updated_at = NOW()
WHERE conversation_id IN (
  SELECT id FROM conversations WHERE contact_id = :contact_id
);
```

### 13.6 Infraestrutura e Operações

- [x] Logs estruturados (JSON) com correlation_id
- [x] Sem dados sensíveis (PII) em logs de aplicação
- [x] Health check endpoint para monitoramento
- [x] Docker containers sem root
- [x] Variáveis sensíveis via secrets (não em env files commitados)
- [x] Deploy via CI/CD com rollback automático
- [x] Backup automático do banco (diário, retenção 30 dias)
- [x] Dead-letter queue para mensagens que falharam processamento
- [x] Alertas de erro via integrações (Slack, email) — configurável

### 13.7 Estratégia de Deploy (Alto Nível)

```
┌─────────────┐     ┌─────────┐     ┌──────────────┐
│  Nginx/ALB  │────>│ NestJS  │────>│  PostgreSQL   │
│  (TLS term) │     │ API x N │     │  (Primary +   │
└─────────────┘     │ Workers │     │   Read Replica)│
                    └────┬────┘     └──────────────┘
                         │
                    ┌────┴────┐     ┌──────────────┐
                    │  Redis  │     │  AWS S3 /     │
                    │ (BullMQ │     │  MinIO        │
                    │  + Cache)│    └──────────────┘
                    └─────────┘
```

- **API:** 2+ réplicas (horizontalmente escalável), stateless
- **Workers BullMQ:** 2+ réplicas, processos separados
- **DB:** Primary + Read Replica para relatórios
- **Redis:** Cluster mode para HA
- **Deploy:** Docker + Kubernetes (ou ECS) com rolling update
- **CI/CD:** GitHub Actions → build → test → deploy → smoke test → rollback on fail

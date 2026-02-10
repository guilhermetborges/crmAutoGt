# CRM WhatsApp Business — API, Webhooks e Eventos Realtime

## 7. Endpoints REST

> Todas as rotas (exceto auth e webhook) exigem header `Authorization: Bearer <token>`.  
> O `company_id` é extraído do JWT — isolamento total por tenant.

### 7.1 Autenticação

| Método | Path | Descrição |
|---|---|---|
| POST | `/api/v1/auth/login` | Login → retorna access_token + refresh_token |
| POST | `/api/v1/auth/refresh` | Renova access_token via refresh_token |
| POST | `/api/v1/auth/logout` | Invalida refresh_token |
| GET | `/api/v1/auth/me` | Perfil do usuário logado |

### 7.2 Usuários

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/users` | Lista usuários (filtros: role, active, sector) | ADMIN, SUPERVISOR |
| POST | `/api/v1/users` | Cria usuário | ADMIN |
| GET | `/api/v1/users/:id` | Detalhe do usuário | ADMIN, SUPERVISOR |
| PATCH | `/api/v1/users/:id` | Atualiza usuário | ADMIN |
| DELETE | `/api/v1/users/:id` | Desativa usuário (soft) | ADMIN |
| PATCH | `/api/v1/users/:id/role` | Altera role | ADMIN |

### 7.3 Setores

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/sectors` | Lista setores | ALL |
| POST | `/api/v1/sectors` | Cria setor | ADMIN |
| PATCH | `/api/v1/sectors/:id` | Atualiza setor | ADMIN |
| DELETE | `/api/v1/sectors/:id` | Desativa setor | ADMIN |
| POST | `/api/v1/sectors/:id/users` | Adiciona usuário ao setor | ADMIN, SUPERVISOR |
| DELETE | `/api/v1/sectors/:id/users/:userId` | Remove usuário do setor | ADMIN, SUPERVISOR |
| GET | `/api/v1/sectors/:id/users` | Lista usuários do setor | ADMIN, SUPERVISOR |

### 7.4 Canais WhatsApp

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/channels` | Lista canais da empresa | ADMIN |
| POST | `/api/v1/channels` | Cadastra canal WhatsApp | ADMIN |
| PATCH | `/api/v1/channels/:id` | Atualiza configurações | ADMIN |
| DELETE | `/api/v1/channels/:id` | Desativa canal | ADMIN |
| POST | `/api/v1/channels/:id/sync-templates` | Sincroniza templates da Meta | ADMIN |

### 7.5 Conversas

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/conversations` | Inbox — lista paginada + filtros | ALL |
| GET | `/api/v1/conversations/:id` | Detalhe da conversa | ALL (setor) |
| PATCH | `/api/v1/conversations/:id/status` | Altera status | ALL |
| POST | `/api/v1/conversations/:id/assign` | Atribui conversa a atendente | ALL |
| POST | `/api/v1/conversations/:id/transfer` | Transfere (atendente ou setor) | ALL |
| POST | `/api/v1/conversations/:id/lock` | Bloqueia conversa para edição | ALL |
| DELETE | `/api/v1/conversations/:id/lock` | Libera lock | ALL |
| GET | `/api/v1/conversations/:id/transfers` | Histórico de transferências | SUPERVISOR, ADMIN |

**Query params do GET `/conversations`:**

```
?status=open,in_progress
&sector_id=uuid
&assignee_id=uuid
&tag_id=uuid
&contact_query=João
&date_from=2025-01-01
&date_to=2025-01-31
&sort=last_activity_at:desc
&cursor=uuid
&limit=25
```

### 7.6 Mensagens

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/conversations/:id/messages` | Timeline (cursor-based) | ALL (setor) |
| POST | `/api/v1/conversations/:id/messages` | Envia mensagem | ALL (setor) |
| POST | `/api/v1/conversations/:id/messages/internal` | Envia nota interna | ALL (setor) |
| POST | `/api/v1/conversations/:id/messages/template` | Envia template WA | ALL (setor) |

**Body de envio de mensagem:**
```json
{
  "content_type": "text",
  "content": "Olá, como posso ajudar?",
  "attachments": [
    { "file": "<multipart>", "type": "image" }
  ]
}
```

**Body de envio de template:**
```json
{
  "template_id": "uuid-do-template",
  "language": "pt_BR",
  "components": [
    {
      "type": "body",
      "parameters": [
        { "type": "text", "text": "João" }
      ]
    }
  ]
}
```

### 7.7 Tags

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/tags` | Lista tags da empresa | ALL |
| POST | `/api/v1/tags` | Cria tag | ADMIN, SUPERVISOR |
| PATCH | `/api/v1/tags/:id` | Atualiza | ADMIN, SUPERVISOR |
| DELETE | `/api/v1/tags/:id` | Remove | ADMIN |
| POST | `/api/v1/conversations/:id/tags` | Adiciona tag à conversa | ALL |
| DELETE | `/api/v1/conversations/:id/tags/:tagId` | Remove tag | ALL |

### 7.8 Respostas Rápidas

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/quick-replies` | Lista (busca por `?q=shortcode`) | ALL |
| POST | `/api/v1/quick-replies` | Cria | ADMIN, SUPERVISOR |
| PATCH | `/api/v1/quick-replies/:id` | Atualiza | ADMIN, SUPERVISOR |
| DELETE | `/api/v1/quick-replies/:id` | Remove | ADMIN, SUPERVISOR |

### 7.9 Templates WhatsApp

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/templates` | Lista templates sincronizados | ALL |
| GET | `/api/v1/templates/:id` | Detalhe | ALL |

### 7.10 Relatórios

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/reports/overview` | Dashboard geral (período) | ADMIN, SUPERVISOR |
| GET | `/api/v1/reports/by-sector` | Métricas por setor | ADMIN, SUPERVISOR |
| GET | `/api/v1/reports/by-agent` | Métricas por atendente | ADMIN, SUPERVISOR |
| GET | `/api/v1/reports/sla` | Métricas de SLA | ADMIN, SUPERVISOR |
| POST | `/api/v1/reports/export` | Gera CSV (async, retorna job_id) | ADMIN, SUPERVISOR |
| GET | `/api/v1/reports/export/:jobId` | Status/download CSV | ADMIN, SUPERVISOR |

### 7.11 Auditoria

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/audit-logs` | Lista (filtros: user, action, entity, período) | ADMIN |
| GET | `/api/v1/integration-logs` | Logs técnicos | ADMIN |

### 7.12 Contatos

| Método | Path | Descrição | Roles |
|---|---|---|---|
| GET | `/api/v1/contacts` | Lista contatos | ALL |
| GET | `/api/v1/contacts/:id` | Detalhe + conversas | ALL |
| PATCH | `/api/v1/contacts/:id` | Atualiza (nome, custom_attributes) | ALL |
| POST | `/api/v1/contacts/:id/anonymize` | Anonimiza (LGPD) | ADMIN |

---

## 8. Webhooks WhatsApp (Recebimento)

### 8.1 Verificação (GET)

```
GET /webhooks/whatsapp/:channelId
  ?hub.mode=subscribe
  &hub.verify_token=<verify_token_do_canal>
  &hub.challenge=<challenge_string>
```
Resposta: retorna `hub.challenge` se `verify_token` bater.

### 8.2 Recepção de eventos (POST)

```
POST /webhooks/whatsapp/:channelId
Content-Type: application/json
X-Hub-Signature-256: sha256=<hmac>
```

**Payload de mensagem recebida (resumido):**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": { "phone_number_id": "...", "display_phone_number": "..." },
        "contacts": [{ "profile": { "name": "João" }, "wa_id": "5511999999999" }],
        "messages": [{
          "from": "5511999999999",
          "id": "wamid.xxx",
          "timestamp": "1700000000",
          "type": "text",
          "text": { "body": "Olá, preciso de ajuda" }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

**Payload de status (resumido):**
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "statuses": [{
          "id": "wamid.xxx",
          "status": "delivered",
          "timestamp": "1700000001",
          "recipient_id": "5511999999999"
        }]
      }
    }]
  }]
}
```

---

## 9. Eventos Realtime (WebSocket / Socket.IO)

Conexão: `wss://api.domain.com/ws?token=<jwt>`

Após conexão, o servidor verifica JWT, associa ao tenant e rooms dos setores do usuário.

### 9.1 Eventos emitidos pelo servidor

| Evento | Payload | Descrição |
|---|---|---|
| `new_message` | `{ conversation_id, message }` | Nova mensagem recebida/enviada |
| `message_status_updated` | `{ message_id, status }` | Status de entrega (sent/delivered/read) |
| `conversation_created` | `{ conversation }` | Nova conversa criada |
| `conversation_updated` | `{ conversation_id, changes }` | Status, setor, ou dados alterados |
| `assignment_changed` | `{ conversation_id, old_assignee, new_assignee }` | Conversa atribuída/transferida |
| `conversation_locked` | `{ conversation_id, locked_by }` | Lock ativado |
| `conversation_unlocked` | `{ conversation_id }` | Lock removido |
| `sla_alert` | `{ conversation_id, event_type, threshold }` | Alerta de SLA |
| `typing_indicator` | `{ conversation_id, user_id, typing }` | Indicador de digitação |

### 9.2 Regras de rooms

- Cada usuário entra nas rooms: `company:{company_id}`, `sector:{sector_id}` (para cada setor)
- Eventos são emitidos para as rooms relevantes, garantindo isolamento
- ADMIN e SUPERVISOR recebem eventos de todos os setores que monitoram

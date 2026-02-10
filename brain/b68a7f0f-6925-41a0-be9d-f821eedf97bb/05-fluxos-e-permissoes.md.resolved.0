# CRM WhatsApp Business — Fluxos Críticos e Permissões

## 10. Fluxos Críticos (Sequência Textual)

### 10.1 Recepção de Mensagem (Webhook)

```
1. WhatsApp Cloud API → POST /webhooks/whatsapp/:channelId
2. Controller valida X-Hub-Signature-256 (HMAC SHA256 com app_secret)
3. Se inválido → 401, loga em integration_logs
4. Se válido → responde 200 imediatamente (Meta exige <15s)
5. Enfilera payload no BullMQ (queue: "webhook.inbound")
6. Worker "InboundMessageProcessor" processa:
   a. Extrai phone_number_id → busca whatsapp_channels
   b. Se canal não encontrado → loga erro, descarta
   c. Verifica tipo do evento (message ou status)
   
   [Se MESSAGE]:
   d. Verifica idempotência: SELECT por wa_message_id
      - Se já existe → descarta (duplicata)
   e. Busca ou cria Contact por wa_id + company_id
      - Se novo: cria com nome do profile, phone_number
   f. Busca conversa ativa (status != resolved/archived) para esse contato+canal
      - Se não existe: cria conversa com status=open, sector_id=default do canal
      - Se existe com status=resolved: reabre (status → open)
   g. Atualiza contact.last_activity_at
   h. Cria registro em messages (direction=inbound, wa_message_id, content, content_type)
   i. Se mensagem tem mídia:
      - Faz GET na URL da mídia (com access_token do canal)
      - Upload para S3
      - Cria media_attachment com s3_key e file_url
   j. Atualiza conversation.last_message_at = NOW()
   k. Se é a primeira mensagem do contato na conversa:
      - Atualiza conversation.customer_last_seen_at
   l. Emite WebSocket: "new_message" para rooms do setor da conversa
   m. Se conversa não tem assignee e SLA configurado:
      - Cria job agendado para verificar SLA (first_response_warning)
   n. Registra integration_log (direction=inbound, status=200, latency)

   [Se STATUS]:
   o. Busca messages por wa_message_id
   p. Atualiza message.status (sent → delivered → read, nunca regride)
   q. Emite WebSocket: "message_status_updated"
```

### 10.2 Envio de Mensagem

```
1. Atendente → POST /api/v1/conversations/:id/messages
2. Guard RBAC: verifica se user pertence ao setor da conversa
3. Verifica lock: se locked_by_user_id != null e != current_user → 409
4. Verifica janela 24h:
   a. Busca última mensagem inbound do contato
   b. Se timestamp > 24h atrás → bloqueia, retorna 422 "Janela 24h fechada. Use template."
5. Cria message no banco (status=queued, direction=outbound)
6. Se contém anexo:
   a. Faz upload do arquivo para S3
   b. Cria media_attachment
7. Enfileira no BullMQ (queue: "whatsapp.send")
8. Worker "OutboundMessageProcessor":
   a. Monta payload da Cloud API (POST /v1/messages)
   b. Envia para https://graph.facebook.com/v18.0/{phone_number_id}/messages
   c. Se sucesso (200/201):
      - Atualiza message.wa_message_id com ID retornado
      - Atualiza message.status = "sent"
      - Emite WebSocket "new_message" + "message_status_updated"
   d. Se erro:
      - Se rate limit (429): re-enfileira com backoff exponencial
      - Se 4xx (exceto 429): marca message.status = "failed", salva error_data
      - Se 5xx: retry com backoff (máx 5 tentativas)
      - Após 5 falhas: move para dead-letter queue
      - Registra integration_log com erro
9. Se é primeira resposta do atendente:
   a. Atualiza conversation.first_reply_at = NOW()
   b. Cancela job de SLA warning (se existir)
10. Atualiza conversation.last_message_at e last_activity_at
11. Registra audit_log (action=message_sent)
```

### 10.3 Envio de Template (fora da janela 24h)

```
1. Atendente → POST /api/v1/conversations/:id/messages/template
2. Guard RBAC
3. Busca whatsapp_templates pelo template_id
4. Verifica se status = "approved"
5. Verifica opt_in do contato (se policy ativa):
   - Se !contact.opt_in → 422 "Contato sem opt-in"
6. Cria message (content_type=template, content_attributes com template_data)
7. Enfileira no BullMQ com payload do template
8. Worker monta payload de template e envia via Cloud API
9. Segue mesmo fluxo de retries/status do envio comum
```

### 10.4 Atribuição e Transferência de Conversa

```
[ASSUMIR via POST /conversations/:id/assign { assignee_id }]
1. Guard: verifica se user está no setor da conversa
2. Verifica lock: se travada por outro → 409
3. Atualiza conversation.assignee_id
4. Atualiza conversation.status = "in_progress" (se era "open")
5. Seta lock: locked_by_user_id = assignee, locked_at = NOW()
6. Emite WS: "assignment_changed" + "conversation_updated"
7. Registra audit_log (action=conversation_assigned)

[TRANSFERIR ATENDENTE via POST /conversations/:id/transfer]
Body: { to_user_id, reason }
1. Guard: verifica RBAC (self transfer ou SUPERVISOR)
2. Verifica se to_user_id pertence ao mesmo setor
3. Libera lock atual
4. Cria conversation_transfer (from_user → to_user, reason)
5. Atualiza conversation.assignee_id = to_user_id
6. Seta novo lock para to_user
7. Emite WS: "assignment_changed"
8. Registra audit_log (action=conversation_transferred)

[TRANSFERIR SETOR via POST /conversations/:id/transfer]
Body: { to_sector_id, reason }
1. Guard: ATENDENTE ou SUPERVISOR do setor atual
2. Libera lock e assignee (remove atribuição)
3. Cria conversation_transfer (from_sector → to_sector, reason)
4. Atualiza conversation.sector_id = to_sector_id
5. Atualiza conversation.assignee_id = NULL
6. Atualiza conversation.status = "open"
7. Emite WS: "conversation_updated" para ambos os setores
8. Registra audit_log (action=conversation_sector_transferred)
```

### 10.5 Escalonamento para Supervisor

```
1. SLA Checker (BullMQ cron job, a cada 1 min):
   a. Busca conversas com status=open|in_progress SEM first_reply_at
   b. Calcula tempo desde última mensagem inbound
   c. Se > threshold de warning (ex: 5 min):
      - Cria sla_event (event_type=first_response_warning)
      - Emite WS "sla_alert" para room dos supervisores do setor
   d. Se > threshold de breach (ex: 15 min):
      - Cria sla_event (event_type=first_response_breach)
      - Emite WS "sla_alert" com urgência alta

2. Supervisor vê alerta no painel → pode:
   a. Assumir a conversa (mesmo fluxo de atribuição)
   b. Atribuir a outro atendente
   c. Transferir de setor

3. Registra audit_log para cada ação do supervisor
```

### 10.6 Auditoria / Trilha de Ações

```
1. Interceptor NestJS (AuditInterceptor) em rotas sensíveis
2. Após execução do controller:
   a. Captura: user_id, action, entity_type, entity_id, changes (diff)
   b. Extrai IP do request
   c. Insere em audit_logs (async, via evento interno)
3. Ações auditadas automaticamente:
   - user.login / user.logout
   - user.created / user.updated / user.deactivated
   - sector.created / sector.updated
   - channel.created / channel.updated
   - conversation.status_changed
   - conversation.assigned
   - conversation.transferred
   - conversation.locked / conversation.unlocked
   - message.sent (template ou normal)
   - tag.created / tag.added_to_conversation
   - quick_reply.created
   - settings.updated
4. Logs técnicos (integration_logs):
   - Cada chamada de/para WhatsApp API registra:
     direction, endpoint, status_code, payload_summary (truncado a 1KB),
     latency_ms, error, retry_count
```

---

## 11. Regras de Permissão por Tipo de Usuário e por Setor

### 11.1 Matriz RBAC

| Recurso / Ação | ATENDENTE | SUPERVISOR | ADMIN |
|---|:---:|:---:|:---:|
| **Empresa** | | | |
| Visualizar config empresa | ❌ | ❌ | ✅ |
| Editar config empresa | ❌ | ❌ | ✅ |
| **Canais WhatsApp** | | | |
| Visualizar canais | ❌ | ❌ | ✅ |
| CRUD canais | ❌ | ❌ | ✅ |
| Sincronizar templates | ❌ | ❌ | ✅ |
| **Usuários** | | | |
| Listar usuários | ❌ | ✅ (setor) | ✅ |
| CRUD usuários | ❌ | ❌ | ✅ |
| Atribuir usuário a setor | ❌ | ✅ (setor) | ✅ |
| **Setores** | | | |
| Listar setores | ✅ (seus) | ✅ (seus) | ✅ |
| CRUD setores | ❌ | ❌ | ✅ |
| **Conversas** | | | |
| Ver inbox | ✅ (setor) | ✅ (setor) | ✅ |
| Assumir conversa | ✅ (setor) | ✅ (setor) | ✅ |
| Responder | ✅ (setor) | ✅ (setor) | ✅ |
| Transferir atendente | ✅ (setor) | ✅ (setor) | ✅ |
| Transferir setor | ✅ (setor) | ✅ | ✅ |
| Mudar status | ✅ (setor) | ✅ (setor) | ✅ |
| Ver histórico transferências | ❌ | ✅ | ✅ |
| **Mensagens** | | | |
| Enviar mensagem | ✅ (setor) | ✅ (setor) | ✅ |
| Enviar template | ✅ (setor) | ✅ (setor) | ✅ |
| Notas internas | ✅ (setor) | ✅ (setor) | ✅ |
| **Tags** | | | |
| Gerenciar tags | ❌ | ✅ | ✅ |
| Aplicar tag a conversa | ✅ (setor) | ✅ | ✅ |
| **Respostas rápidas** | | | |
| Usar | ✅ | ✅ | ✅ |
| CRUD | ❌ | ✅ | ✅ |
| **Relatórios** | | | |
| Dashboard geral | ❌ | ✅ (setor) | ✅ |
| Export CSV | ❌ | ✅ (setor) | ✅ |
| **Auditoria** | | | |
| Ver audit logs | ❌ | ❌ | ✅ |
| Ver integration logs | ❌ | ❌ | ✅ |

### 11.2 Regra de Isolamento por Setor

```
Para ATENDENTE e SUPERVISOR, toda query de conversas adiciona:
WHERE conversation.sector_id IN (
  SELECT sector_id FROM user_sectors WHERE user_id = :current_user_id
)

Para ADMIN: sem filtro por setor (vê tudo da empresa).
```

### 11.3 Implementação (NestJS Guard)

```typescript
@Injectable()
export class RbacGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = Reflect.getMetadata('roles', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    
    // 1. Verifica se role do user está em requiredRoles
    if (!requiredRoles.includes(user.role)) return false;
    
    // 2. Se rota envolve conversa, verifica setor
    const conversationId = context.switchToHttp().getRequest().params.id;
    if (conversationId && user.role !== 'admin') {
      // Verifica se conversa pertence a setor do user
      return this.sectorService.userBelongsToConversationSector(user.id, conversationId);
    }
    
    return true;
  }
}
```

# CRM WhatsApp Business — Modelagem de Dados (PostgreSQL)

## 6. Esquema Relacional Completo

### Extensões necessárias

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

---

### 6.1 `companies` (Tenant)

```sql
CREATE TABLE companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  domain        VARCHAR(100),
  timezone      VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  logo_url      TEXT,
  settings      JSONB DEFAULT '{}',
  status        VARCHAR(20) DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_companies_domain ON companies(domain) WHERE domain IS NOT NULL;
```

### 6.2 `users`

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  password_hash   TEXT NOT NULL,
  role            VARCHAR(20) NOT NULL CHECK (role IN ('admin','supervisor','atendente')),
  avatar_url      TEXT,
  active          BOOLEAN DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_users_email_company ON users(company_id, lower(email));
CREATE INDEX idx_users_company_role ON users(company_id, role);
```

### 6.3 `sectors`

```sql
CREATE TABLE sectors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  description  TEXT,
  color        VARCHAR(7) DEFAULT '#1f93ff',
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_sectors_name_company ON sectors(company_id, lower(name));
```

### 6.4 `user_sectors` (N:N)

```sql
CREATE TABLE user_sectors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sector_id   UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_user_sectors_uniq ON user_sectors(user_id, sector_id);
CREATE INDEX idx_user_sectors_sector ON user_sectors(sector_id);
```

### 6.5 `whatsapp_channels`

```sql
CREATE TABLE whatsapp_channels (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id             UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  phone_number           VARCHAR(20) NOT NULL,
  phone_number_id        VARCHAR(50) NOT NULL,
  waba_id                VARCHAR(50) NOT NULL,
  business_name          VARCHAR(255),
  encrypted_access_token TEXT NOT NULL,
  verify_token           VARCHAR(100) NOT NULL,
  webhook_secret         VARCHAR(255),
  active                 BOOLEAN DEFAULT true,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_wa_channels_phone ON whatsapp_channels(phone_number);
CREATE INDEX idx_wa_channels_company ON whatsapp_channels(company_id);
CREATE UNIQUE INDEX idx_wa_channels_phone_number_id ON whatsapp_channels(phone_number_id);
```

### 6.6 `contacts`

```sql
CREATE TABLE contacts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  wa_id               VARCHAR(50) NOT NULL,
  phone_number        VARCHAR(20) NOT NULL,
  name                VARCHAR(255) DEFAULT '',
  profile_picture_url TEXT,
  opt_in              BOOLEAN DEFAULT false,
  opt_in_at           TIMESTAMPTZ,
  custom_attributes   JSONB DEFAULT '{}',
  last_activity_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_contacts_wa_id_company ON contacts(company_id, wa_id);
CREATE INDEX idx_contacts_phone ON contacts(company_id, phone_number);
CREATE INDEX idx_contacts_name_trgm ON contacts USING gin(name gin_trgm_ops);
```

### 6.7 `conversations`

```sql
CREATE TABLE conversations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  channel_id            UUID NOT NULL REFERENCES whatsapp_channels(id),
  contact_id            UUID NOT NULL REFERENCES contacts(id),
  sector_id             UUID REFERENCES sectors(id),
  assignee_id           UUID REFERENCES users(id),
  display_id            INTEGER NOT NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open','in_progress','pending','resolved','archived')),
  locked_by_user_id     UUID REFERENCES users(id),
  locked_at             TIMESTAMPTZ,
  last_message_at       TIMESTAMPTZ,
  first_reply_at        TIMESTAMPTZ,
  resolved_at           TIMESTAMPTZ,
  last_activity_at      TIMESTAMPTZ DEFAULT NOW(),
  customer_last_seen_at TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_conv_display_company ON conversations(company_id, display_id);
CREATE INDEX idx_conv_company_status ON conversations(company_id, status);
CREATE INDEX idx_conv_sector_status ON conversations(company_id, sector_id, status);
CREATE INDEX idx_conv_assignee ON conversations(assignee_id, status);
CREATE INDEX idx_conv_contact ON conversations(contact_id);
CREATE INDEX idx_conv_last_activity ON conversations(company_id, last_activity_at DESC);
CREATE INDEX idx_conv_channel ON conversations(channel_id);
-- Sequence por company para display_id (similar ao Chatwoot)
```

### 6.8 `messages`

```sql
CREATE TABLE messages (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id    UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  company_id         UUID NOT NULL REFERENCES companies(id),
  sender_id          UUID,
  sender_type        VARCHAR(20) NOT NULL CHECK (sender_type IN ('contact','user','system')),
  direction          VARCHAR(10) NOT NULL CHECK (direction IN ('inbound','outbound')),
  content_type       VARCHAR(20) NOT NULL DEFAULT 'text'
                     CHECK (content_type IN ('text','image','audio','video','document',
                            'template','location','sticker','contacts','interactive')),
  content            TEXT,
  content_attributes JSONB DEFAULT '{}',
  wa_message_id      VARCHAR(100),
  status             VARCHAR(20) DEFAULT 'queued'
                     CHECK (status IN ('queued','sent','delivered','read','failed')),
  is_internal        BOOLEAN DEFAULT false,
  error_data         JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- IDEMPOTÊNCIA: Garante que não duplique mensagem do WhatsApp
CREATE UNIQUE INDEX idx_msg_wa_id_channel ON messages(wa_message_id, company_id)
  WHERE wa_message_id IS NOT NULL;
CREATE INDEX idx_msg_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_msg_company_created ON messages(company_id, created_at);
CREATE INDEX idx_msg_content_trgm ON messages USING gin(content gin_trgm_ops);
```

### 6.9 `media_attachments`

```sql
CREATE TABLE media_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id),
  file_type       VARCHAR(20) NOT NULL,
  file_url        TEXT NOT NULL,
  file_name       VARCHAR(255),
  file_size_bytes INTEGER,
  mime_type       VARCHAR(100),
  s3_key          TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_attach_message ON media_attachments(message_id);
```

### 6.10 `conversation_transfers`

```sql
CREATE TABLE conversation_transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  company_id      UUID NOT NULL REFERENCES companies(id),
  from_user_id    UUID REFERENCES users(id),
  to_user_id      UUID REFERENCES users(id),
  from_sector_id  UUID REFERENCES sectors(id),
  to_sector_id    UUID REFERENCES sectors(id),
  reason          TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transfer_conv ON conversation_transfers(conversation_id);
CREATE INDEX idx_transfer_company ON conversation_transfers(company_id, created_at);
```

### 6.11 `tags` e `conversation_tags`

```sql
CREATE TABLE tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(7) DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_tags_name_company ON tags(company_id, lower(name));

CREATE TABLE conversation_tags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_conv_tags_uniq ON conversation_tags(conversation_id, tag_id);
```

### 6.12 `quick_replies`

```sql
CREATE TABLE quick_replies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  shortcode     VARCHAR(50) NOT NULL,
  content       TEXT NOT NULL,
  created_by_id UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_qr_shortcode_company ON quick_replies(company_id, lower(shortcode));
```

### 6.13 `whatsapp_templates`

```sql
CREATE TABLE whatsapp_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  channel_id      UUID NOT NULL REFERENCES whatsapp_channels(id) ON DELETE CASCADE,
  wa_template_id  VARCHAR(100),
  name            VARCHAR(255) NOT NULL,
  language        VARCHAR(10) NOT NULL DEFAULT 'pt_BR',
  category        VARCHAR(50),
  status          VARCHAR(20) DEFAULT 'approved'
                  CHECK (status IN ('approved','pending','rejected')),
  components      JSONB DEFAULT '[]',
  synced_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_templates_channel ON whatsapp_templates(channel_id);
CREATE INDEX idx_templates_company_status ON whatsapp_templates(company_id, status);
```

### 6.14 `audit_logs`

```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   UUID,
  changes     JSONB DEFAULT '{}',
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_company_created ON audit_logs(company_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
```

### 6.15 `integration_logs`

```sql
CREATE TABLE integration_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  channel_id      UUID REFERENCES whatsapp_channels(id),
  direction       VARCHAR(10) NOT NULL CHECK (direction IN ('inbound','outbound')),
  endpoint        TEXT,
  status_code     INTEGER,
  payload_summary JSONB DEFAULT '{}',
  response_summary JSONB DEFAULT '{}',
  latency_ms      INTEGER,
  error           TEXT,
  retry_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_intlog_company_created ON integration_logs(company_id, created_at DESC);
CREATE INDEX idx_intlog_channel ON integration_logs(channel_id, created_at DESC);
-- Particionamento por data recomendado para produção
```

### 6.16 `sla_events`

```sql
CREATE TABLE sla_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  event_type      VARCHAR(30) NOT NULL
                  CHECK (event_type IN ('first_response_warning','first_response_breach',
                         'resolution_warning','resolution_breach')),
  threshold_seconds INTEGER,
  actual_seconds    INTEGER,
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sla_company_created ON sla_events(company_id, created_at DESC);
CREATE INDEX idx_sla_conversation ON sla_events(conversation_id);
```

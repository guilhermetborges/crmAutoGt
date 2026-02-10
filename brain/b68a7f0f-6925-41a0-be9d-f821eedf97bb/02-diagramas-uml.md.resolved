# CRM WhatsApp Business — Diagramas UML

## 4. Diagrama de Caso de Uso (Mermaid)

```mermaid
graph TB
    subgraph Atores
        ADMIN["🔑 Admin"]
        SUPERVISOR["👨‍💼 Supervisor"]
        ATENDENTE["💬 Atendente"]
        WHATSAPP["📱 WhatsApp Cloud API"]
    end

    subgraph "Gestão Administrativa"
        UC01["Gerenciar Empresa/Tenant"]
        UC02["Gerenciar Canais WhatsApp"]
        UC03["Gerenciar Setores"]
        UC04["Gerenciar Usuários"]
        UC05["Gerenciar Permissões"]
        UC06["Gerenciar Templates WhatsApp"]
        UC07["Visualizar Auditoria"]
        UC08["Visualizar Relatórios Gerais"]
    end

    subgraph "Gestão Operacional"
        UC09["Gerenciar Filas do Setor"]
        UC10["Monitorar SLA"]
        UC11["Transferir Conversas entre Setores"]
        UC12["Relatórios do Setor"]
        UC13["Escalonar Conversa"]
    end

    subgraph "Atendimento"
        UC14["Visualizar Inbox"]
        UC15["Assumir Conversa"]
        UC16["Responder Mensagens"]
        UC17["Usar Respostas Rápidas"]
        UC18["Transferir para Atendente"]
        UC19["Marcar Status da Conversa"]
        UC20["Adicionar Notas Internas"]
        UC21["Gerenciar Tags"]
        UC22["Enviar Template WhatsApp"]
        UC23["Enviar Mídia/Anexo"]
    end

    subgraph "Integração WhatsApp"
        UC24["Entregar Mensagem via Webhook"]
        UC25["Entregar Status via Webhook"]
        UC26["Receber Envio de Mensagem"]
    end

    ADMIN --> UC01
    ADMIN --> UC02
    ADMIN --> UC03
    ADMIN --> UC04
    ADMIN --> UC05
    ADMIN --> UC06
    ADMIN --> UC07
    ADMIN --> UC08

    SUPERVISOR --> UC09
    SUPERVISOR --> UC10
    SUPERVISOR --> UC11
    SUPERVISOR --> UC12
    SUPERVISOR --> UC13
    SUPERVISOR --> UC14
    SUPERVISOR --> UC15
    SUPERVISOR --> UC16

    ATENDENTE --> UC14
    ATENDENTE --> UC15
    ATENDENTE --> UC16
    ATENDENTE --> UC17
    ATENDENTE --> UC18
    ATENDENTE --> UC19
    ATENDENTE --> UC20
    ATENDENTE --> UC21
    ATENDENTE --> UC22
    ATENDENTE --> UC23

    WHATSAPP --> UC24
    WHATSAPP --> UC25
    UC26 --> WHATSAPP
```

---

## 5. Diagrama de Classes (Mermaid)

```mermaid
classDiagram
    class Company {
        +UUID id
        +String name
        +String domain
        +String timezone
        +JSONB settings
        +Timestamp created_at
    }

    class User {
        +UUID id
        +UUID company_id
        +String name
        +String email
        +String password_hash
        +Enum role: ADMIN|SUPERVISOR|ATENDENTE
        +Boolean active
        +Timestamp last_login_at
    }

    class Sector {
        +UUID id
        +UUID company_id
        +String name
        +String description
        +String color
        +Boolean active
    }

    class UserSector {
        +UUID id
        +UUID user_id
        +UUID sector_id
    }

    class WhatsAppChannel {
        +UUID id
        +UUID company_id
        +String phone_number
        +String phone_number_id
        +String waba_id
        +String business_name
        +String encrypted_access_token
        +String verify_token
        +Boolean active
    }

    class Contact {
        +UUID id
        +UUID company_id
        +String wa_id
        +String phone_number
        +String name
        +String profile_picture_url
        +Boolean opt_in
        +Timestamp opt_in_at
        +JSONB custom_attributes
    }

    class Conversation {
        +UUID id
        +UUID company_id
        +UUID channel_id
        +UUID contact_id
        +UUID sector_id
        +UUID assignee_id
        +UUID locked_by_user_id
        +Enum status: open|in_progress|pending|resolved|archived
        +Integer display_id
        +Timestamp last_message_at
        +Timestamp first_reply_at
        +Timestamp resolved_at
        +Timestamp locked_at
        +Timestamp last_activity_at
        +Timestamp customer_last_seen_at
    }

    class Message {
        +UUID id
        +UUID conversation_id
        +UUID company_id
        +UUID sender_id
        +Enum sender_type: contact|user|system
        +Enum direction: inbound|outbound
        +Enum content_type: text|image|audio|video|document|template|location|sticker
        +Text content
        +JSONB content_attributes
        +String wa_message_id
        +Enum status: queued|sent|delivered|read|failed
        +Boolean is_internal
        +Timestamp created_at
    }

    class MediaAttachment {
        +UUID id
        +UUID message_id
        +String file_type
        +String file_url
        +String file_name
        +Integer file_size_bytes
        +String mime_type
        +String s3_key
    }

    class ConversationTransfer {
        +UUID id
        +UUID conversation_id
        +UUID from_user_id
        +UUID to_user_id
        +UUID from_sector_id
        +UUID to_sector_id
        +Text reason
        +Timestamp created_at
    }

    class Tag {
        +UUID id
        +UUID company_id
        +String name
        +String color
    }

    class ConversationTag {
        +UUID id
        +UUID conversation_id
        +UUID tag_id
    }

    class QuickReply {
        +UUID id
        +UUID company_id
        +String shortcode
        +Text content
        +UUID created_by_id
    }

    class WhatsAppTemplate {
        +UUID id
        +UUID company_id
        +UUID channel_id
        +String wa_template_id
        +String name
        +String language
        +Enum status: approved|pending|rejected
        +JSONB components
        +Timestamp synced_at
    }

    class AuditLog {
        +UUID id
        +UUID company_id
        +UUID user_id
        +String action
        +String entity_type
        +UUID entity_id
        +JSONB changes
        +String ip_address
        +Timestamp created_at
    }

    class IntegrationLog {
        +UUID id
        +UUID company_id
        +UUID channel_id
        +Enum direction: inbound|outbound
        +Integer status_code
        +JSONB payload_summary
        +Integer latency_ms
        +Text error
        +Integer retry_count
        +Timestamp created_at
    }

    class SLAEvent {
        +UUID id
        +UUID company_id
        +UUID conversation_id
        +Enum event_type: first_response_breach|resolution_breach|warning
        +JSONB meta
        +Timestamp created_at
    }

    Company "1" --> "*" User
    Company "1" --> "*" Sector
    Company "1" --> "*" WhatsAppChannel
    Company "1" --> "*" Contact
    Company "1" --> "*" Conversation
    Company "1" --> "*" Tag
    Company "1" --> "*" QuickReply

    User "*" --> "*" Sector : UserSector
    Conversation "*" --> "1" Contact
    Conversation "*" --> "1" Sector
    Conversation "*" --> "0..1" User : assignee
    Conversation "1" --> "*" Message
    Conversation "1" --> "*" ConversationTransfer
    Conversation "*" --> "*" Tag : ConversationTag

    Message "1" --> "*" MediaAttachment
    WhatsAppChannel "1" --> "*" WhatsAppTemplate
    Conversation "1" --> "*" SLAEvent
```

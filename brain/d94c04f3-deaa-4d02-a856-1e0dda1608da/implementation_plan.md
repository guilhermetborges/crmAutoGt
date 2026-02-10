# WhatsCRM Frontend — Plano de Implementação

Frontend completo para o WhatsCRM backend (NestJS) já rodando em `localhost:3000`. Painel de atendimento estilo Chatwoot/Intercom com inbox, timeline de mensagens, admin e relatórios.

## Proposed Changes

### Setup & Design System

#### [NEW] whatscrm-web/ (Next.js 14 project)

Criar projeto em `~/.gemini/antigravity/scratch/whatscrm-web/` com:

- **Next.js 14** (App Router, TypeScript)
- **Vanilla CSS** com design system premium (variáveis CSS, dark mode, glassmorphism)
- **Axios** para chamadas HTTP ao backend
- **Socket.IO Client** para WebSocket
- **Google Fonts** (Inter)

Estrutura:
```
whatscrm-web/
├── src/
│   ├── app/
│   │   ├── layout.js           # Root layout (Inter font, global CSS)
│   │   ├── page.js             # Redirect to /login or /inbox
│   │   ├── login/page.js       # Tela de login
│   │   ├── (dashboard)/        # Layout group (sidebar + header)
│   │   │   ├── layout.js       # Dashboard layout com sidebar
│   │   │   ├── inbox/page.js   # Inbox principal (conversas + chat)
│   │   │   ├── contacts/page.js
│   │   │   ├── admin/
│   │   │   │   ├── users/page.js
│   │   │   │   ├── sectors/page.js
│   │   │   │   ├── channels/page.js
│   │   │   │   └── tags/page.js
│   │   │   └── reports/page.js
│   │   └── globals.css         # Design system + all styles
│   ├── lib/
│   │   ├── api.js              # Axios instance + interceptors
│   │   ├── auth.js             # Auth context + token management
│   │   └── socket.js           # Socket.IO client
│   └── components/
│       ├── Sidebar.js
│       ├── ConversationList.js
│       ├── ChatPanel.js
│       ├── MessageBubble.js
│       ├── ContactInfo.js
│       └── ...
└── package.json
```

---

### Páginas

#### Login (`/login`)
- Formulário email + senha com design premium
- Chama `POST /api/v1/auth/login`, armazena tokens
- Redireciona para `/inbox`

#### Inbox (`/inbox`) — Página principal
- **Coluna esquerda**: Lista de conversas com filtros (status, setor, busca)
- **Coluna central**: Timeline do chat (mensagens + composição)
- **Coluna direita**: Detalhes do contato + tags + ações (transferir, status)
- WebSocket para atualizações em tempo real

#### Contatos (`/contacts`)
- Listagem de contatos com busca
- Detalhe com histórico de conversas

#### Admin — Usuários (`/admin/users`)
- Tabela com CRUD, filtros por role
- Modal de criação/edição

#### Admin — Setores (`/admin/sectors`)
- Tabela com CRUD
- Gerenciamento de membros

#### Admin — Canais (`/admin/channels`)
- Tabela de canais WhatsApp
- Modal de criação

#### Admin — Tags (`/admin/tags`)
- Tabela com CRUD + color picker

#### Reports (`/reports`)
- Cards de métricas (total conversas, tempo médio resposta, SLA)
- Período selecionável (hoje, 7d, 30d)

---

## Verification Plan

### Build & Smoke Test
```bash
cd ~/.gemini/antigravity/scratch/whatscrm-web
npm run build     # Deve compilar sem erros
npm run dev       # Deve iniciar na porta 3001
```

### Browser Testing
1. Abrir `http://localhost:3001` → deve redirecionar para `/login`
2. Login com `admin@demo.com` / `admin123456` → deve ir para `/inbox`
3. Navegar pela sidebar para todas as páginas (contacts, admin, reports)
4. Verificar que a lista de conversas carrega do backend
5. Verificar responsividade em telas menores

> [!IMPORTANT]
> O backend precisa estar rodando em `localhost:3000` para os testes funcionarem.

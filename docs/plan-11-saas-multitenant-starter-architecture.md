# Plano 11 — Arquitetura SaaS Multi-tenant Starter (Payload 3.88 + TanStack)

> **Status:** Proposta & Planejamento Estratégico  
> **Objetivo:** Transformar o starter em um template modular de SaaS multi-tenant reutilizável para criação ágil de novos projetos, integrando os conceitos de tenants, staffs (times), dynamic RBAC, convites, assinaturas e notificações sobre a base do Payload CMS 3.88 API-only.

---

## 1. Contexto & Inspiração

A partir da análise do schema prisma de referência (`.tmp/tmp-auth.prisma`), identificamos um modelo completo de autenticação e governança corporativa multi-tenant:
- **Tenants** (Organizações / Workspaces)
- **Tenant Roles & Dynamic Permissions** (RBAC estático e dinâmico por workspace)
- **Staffs & Staff Members** (Times/Equipes e alocação de usuários dentro do tenant)
- **Members & Invitations** (Membros, papéis e ciclo de vida de convites)
- **Subscriptions** (Planos, limites, assentos e billing)
- **Notifications** (Notificações contextuais por usuário e workspace)

Como o **Payload CMS 3.88** já provê nativamente um motor robusto de Autenticação, Sessões, Password Hashing, JWT, Rate Limiting, API Keys e REST API tipada, **não precisamos reinventar o motor de autenticação**, mas sim modelar as entidades relacionais e o controle de acesso de forma canônica no padrão Payload.

---

## 2. Separação de Responsabilidades (Payload Nativo vs. Collections do Domínio SaaS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PAYLOAD CMS NATIVO (server/collections/users.ts)          │
│  - Email / Senha / Username / Lockout                                       │
│  - JWT & Sessions server-side                                               │
│  - System Roles (admin, support, user)                                      │
│  - Two-Factor / Verification / API Keys                                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ 1:N
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ECOSSISTEMA MULTI-TENANT (server/collections/)             │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  `tenants`                           │ Workspaces / Contas corporativas     │
│  `tenant-members`                    │ Vínculo User ↔ Tenant + Role base    │
│  `tenant-roles`                      │ Permissões dinâmicas por Workspace   │
│  `staffs`                            │ Times / Departamentos dentro do SaaS │
│  `staff-members`                     │ Alocação de membros nos times        │
│  `invitations`                       │ Convites com expiração e token       │
│  `subscriptions`                     │ Planos, Stripe, limites e status     │
│  `notifications`                     │ Notificações in-app (usuário/tenant) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Catálogo de Collections Propostas

### 3.1. `tenants` (Workspaces / Organizações)
- **Campos**:
  - `name`: string (obrigatório)
  - `slug`: string (único, via `slugField`)
  - `logo`: relationship com `media`
  - `owner`: relationship com `users` (obrigatório)
  - `status`: select (`active`, `suspended`, `archived`)
  - `metadata`: json (configurações customizadas do tenant)

### 3.2. `tenant-members` (Membros do Tenant)
- **Campos**:
  - `tenant`: relationship com `tenants` (indexado, obrigatório)
  - `user`: relationship com `users` (indexado, obrigatório)
  - `role`: select (`owner`, `admin`, `member`, `billing`, `guest`, `custom`)
  - `customRole`: relationship opcional com `tenant-roles`
  - `status`: select (`active`, `invited`, `suspended`)

### 3.3. `tenant-roles` (Dynamic Access Control / Permissões Granulares)
- **Campos**:
  - `tenant`: relationship com `tenants` (obrigatório)
  - `name`: string (ex: "Suporte N1", "Financeiro", "Auditor")
  - `slug`: string
  - `permissions`: select hasMany / array (ex: `projects:create`, `projects:delete`, `billing:manage`, `members:invite`)
  - `description`: string

### 3.4. `staffs` (Times / Equipes / Departamentos)
- **Campos**:
  - `tenant`: relationship com `tenants` (obrigatório)
  - `name`: string (ex: "Time de Suporte", "Engenharia", "Marketing")
  - `slug`: string
  - `leader`: relationship com `users`
  - `description`: text

### 3.5. `staff-members` (Alocação em Times)
- **Campos**:
  - `staff`: relationship com `staffs` (obrigatório)
  - `user`: relationship com `users` (obrigatório)
  - `role`: select (`leader`, `member`, `guest`)

### 3.6. `invitations` (Gestão de Convites)
- **Campos**:
  - `tenant`: relationship com `tenants` (obrigatório)
  - `email`: email (obrigatório)
  - `role`: select (`admin`, `member`, `billing`, etc.)
  - `staff`: relationship opcional com `staffs`
  - `token`: string (gerado automaticamente no hook `beforeChange`)
  - `status`: select (`pending`, `accepted`, `declined`, `expired`)
  - `inviter`: relationship com `users`
  - `expiresAt`: date

### 3.7. `subscriptions` (Billing & Planos)
- **Campos**:
  - `tenant`: relationship com `tenants` (único, obrigatório)
  - `plan`: select (`free`, `starter`, `pro`, `enterprise`)
  - `status`: select (`trialing`, `active`, `past_due`, `canceled`, `unpaid`)
  - `stripeCustomerId`: string
  - `stripeSubscriptionId`: string
  - `seats`: number (limite de usuários)
  - `periodStart`: date
  - `periodEnd`: date
  - `cancelAtPeriodEnd`: checkbox

### 3.8. `notifications` (Notificações In-App)
- **Campos**:
  - `user`: relationship com `users` (obrigatório)
  - `tenant`: relationship opcional com `tenants`
  - `type`: select (`info`, `success`, `warning`, `invite`, `billing`, `system`)
  - `title`: string
  - `body`: text
  - `href`: string
  - `read`: checkbox (default: false)
  - `data`: json

---

## 4. Estratégia de Access Control Multi-Tenant (`server/access/`)

O Payload suporta restrições row-level via retorno de queries `Where`.

### 4.1. Funções de Access Reutilizáveis

1. **`tenantAdminOrOwner`**: Garante que apenas donos ou administradores do tenant possam editar configurações da organização, criar times ou convidar membros.
2. **`tenantScopedAccess`**: Injeta automaticamente o filtro `{ tenant: { equals: activeTenantId } }` em coleções de domínio (ex.: posts, projetos, produtos, faturas).
3. **`tenantMemberOnly`**: Garante que o usuário autenticado pertença ao tenant para ler ou criar registros vinculados.

---

## 5. Integração com Frontend (TanStack + Shared Layer)

Para que qualquer app construída com esse template possa operar em modo multi-tenant instantaneamente:

1. **`shared/stores/tenant.ts` (ou `useTenantStore`)**:
   - Guarda o `currentTenant` ativo selecionado pelo usuário.
   - Lista os tenants aos quais o usuário pertence (`userTenants`).
   - Sincroniza o tenant ativo nos headers das requisições do SDK (`x-tenant-id`).

2. **Componente de UI Compartilhado (`shared/components/tenant-switcher.tsx`)**:
   - Switcher de workspaces pronto para a barra de navegação/dock.
   - Botão para criar novo workspace ou aceitar convites pendentes.

3. **Guards de Rota no TanStack Router**:
   - Redirecionamento automático caso o usuário não tenha workspace ativo ou precise criar um no onboarding.

---

## 6. Próximos Passos Sugeridos

1. Criar as collections em `server/collections/` (`tenants.ts`, `tenant-members.ts`, `tenant-roles.ts`, `staffs.ts`, `invitations.ts`, `subscriptions.ts`, `notifications.ts`).
2. Registrar no `server/config.ts` e implementar as funções de access control correspondentes em `server/access/`.
3. Criar os stores reativos em `shared/stores/` e os helpers de permissão.
4. Documentar o fluxo de uso no `README.md` e gerar o report de entrega.

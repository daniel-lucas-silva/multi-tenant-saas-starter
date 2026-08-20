# Plano 17 — Plano Completo de Implementação: Starter SaaS Multi-Tenant (LaunchPulse)

> **Status:** Aguardando Aprovação / Ajustes  
> **Objetivo:** Estabelecer o cronograma passo a passo e a especificação detalhada de implementação de ponta a ponta para transformar este projeto em um Starter SaaS Multi-Tenant completo, modular e reutilizável com Payload CMS 3.88 API-only, TanStack Router/Store, layout Mobile-First em `app/` e camadas isoladas em `layers/auth/` e `layers/admin/`.

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FLUXO DE DADOS GERAL                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. BACKEND (server/)                                                       │
│     - Collections: users, tenants, tenant-members, tenant-roles, staffs,    │
│       staff-members, invitations, subscriptions, notifications, projects,   │
│       tasks, api-keys, media                                                │
│     - Access Control: Factories com Row-Level Security por Tenant, Tiers,   │
│       Dynamic RBAC e Cache no req.context (Anti N+1)                        │
│     - Jobs & Endpoints: Filas em background, crons, /api/stats, /api/health │
│     - Config Central de Planos: server/config/plans.ts                      │
│                                                                             │
│  2. SHARED LAYER (shared/)                                                  │
│     - Stores: useTenant, useAuth, useCollection, useGlobal                  │
│     - SDK: Instância do PayloadSDK com header x-tenant-id automático        │
│     - UI Compartilhada: UpgradeGate, QuotaProgress, PricingTable, Shadcn UI │
│     - PWA & Sync: Workbox e Offline-First Sync Engine                       │
│                                                                             │
│  3. TELAS & NAVEGAÇÃO                                                       │
│     - layers/auth/ ➔ Login, Register (?ref=...), Onboarding, Convites       │
│     - app/         ➔ Mobile-First Dashboard, Projetos, Times, Automações,   │
│                      Billing, API Keys, Referrals (AppShell + BottomTabs)   │
│     - layers/admin/➔ Super Admin Dashboard, Tenants, Usuários, Jobs, Globals│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fases de Execução

---

###  Fase 1: Backend — Definição de Planos, Entitlements & Access Control Avançado
**Objetivo:** Estabelecer a infraestrutura de segurança, quotas e isolamento multi-tenant no Payload.

- [ ] **1.1. Configuração Central de Planos (`server/config/plans.ts`)**:
  - Matriz declarativa de Tiers (`free`, `plus`, `pro`, `enterprise`).
  - Definição de Quotas (`maxMembers`, `maxProjects`, `monthlyJobCredits`, `maxApiKeys`).
  - Feature Flags (`customDomain`, `dynamicRoles`, `csvExport`, `prioritySupport`).
- [ ] **1.2. Access Control Factories (`server/access/`)**:
  - `server/access/guards.ts`: Type guards (`isUser`, `isApiKey`).
  - `server/access/helpers.ts`: Funções de consulta com cache no `req.context` (`getTenantMember`, `getTenantSubscription`).
  - `server/access/factories.ts`:
    - `tenantScopedAccess`: RLS automático por tenant via `{ tenant: { equals: activeTenantId } }`.
    - `tierAccess`: Validação hierárquica de plano do tenant.
    - `dynamicPermissionAccess`: Validação de statements do cargo do membro (`resource:action`).
    - `tenantAdminOrOwner`: Acesso exclusivo para gestores do workspace.

---

###  Fase 2: Backend — Collections do Domínio SaaS e Registro no `server/config.ts`
**Objetivo:** Criar e registrar as coleções do ecossistema SaaS.

- [ ] **2.1. Coleções de Governança Multi-Tenant**:
  - `server/collections/tenants.ts`: Workspaces com `slugField`, logo, owner, status e metadata.
  - `server/collections/tenant-members.ts`: Vínculo User ↔ Tenant com roles (`owner`, `admin`, `member`, `billing`).
  - `server/collections/tenant-roles.ts`: Matriz de permissões dinâmicas criadas pelos clientes.
  - `server/collections/staffs.ts` & `staff-members.ts`: Times/Departamentos internos e seus membros.
  - `server/collections/invitations.ts`: Convites por email com tokens gerados no hook `beforeChange` e expiração.
- [ ] **2.2. Coleções de Faturamento & Operação**:
  - `server/collections/subscriptions.ts`: Planos, Stripe IDs, seats, status e ciclo.
  - `server/collections/notifications.ts`: Notificações in-app por usuário e tenant com estado de leitura.
- [ ] **2.3. Coleções do Domínio de Negócio (LaunchPulse)**:
  - `server/collections/projects.ts`: Projetos com RichText, mídias anexadas, status, prioridade e vinculação ao tenant.
  - `server/collections/tasks.ts`: Tarefas atribuídas a membros e times.
- [ ] **2.4. Atualização de `server/collections/users.ts` & `api-keys.ts`**:
  - Adição de `referralCode` e `referredBy` em `users.ts`.
  - Vinculação de `api-keys.ts` ao tenant com controle de rate limiting e quotas.
- [ ] **2.5. Registro e Montagem em `server/config.ts`**:
  - Integração de todas as coleções, endpoints e jobs no `buildConfig`.

---

###  Fase 3: Shared Layer — Stores Reativos, SDK & Componentes SaaS
**Objetivo:** Fornecer ao frontend os hooks e componentes prontos para consumo multi-tenant.

- [ ] **3.1. Store Reativo de Workspace (`shared/stores/tenant.ts`)**:
  - Gestão do tenant ativo (`currentTenant`), lista de tenants do usuário (`userTenants`) e alternância de contexto.
  - Injeção automática do header `x-tenant-id` nas chamadas do `@payloadcms/sdk` (`shared/lib/sdk.ts`).
- [ ] **3.2. Helpers de Entitlements no Frontend (`shared/hooks/use-entitlements.ts`)**:
  - Hook para verificar se o plano atual permite acesso a uma feature ou se atingiu o limite de quota.
- [ ] **3.3. Componentes Visuais Reutilizáveis (`shared/components/`)**:
  - `<UpgradeGate feature="..." />`: Bloqueador com modal de upgrade.
  - `<QuotaProgressBar usage={3} limit={5} label="..." />`: Barra de progresso de limites.
  - `<PricingTable />`: Tabela comparativa de planos com alternância Mensal/Anual.
  - `<TenantSwitcher />`: Dropdown para alternar ou criar novos workspaces.

---

###  Fase 4: Camada de Autenticação (`layers/auth/`)
**Objetivo:** Construir o fluxo completo de entrada, convites e onboarding.

- [ ] **4.1. Rotas de Entrada**:
  - `/login`: Autenticação segura por email/username + senha e suporte a 2FA.
  - `/register`: Cadastro com captura automática de código de indicação (`?ref=...`).
  - `/forgot-password` & `/reset-password`: Fluxo completo de redefinição de senha.
- [ ] **4.2. Fluxo de Convites & Onboarding**:
  - `/invitations/$token`: Tela de aceite de convite para ingressar no Workspace e Time.
  - `/onboarding`: Wizard para criação do primeiro Workspace (Nome, Slug e Avatar) pós-cadastro.

---

###  Fase 5: Aplicação Principal Mobile-First (`app/`)
**Objetivo:** Implementar a experiência do cliente com ergonomia móvel e navegação fluida.

- [ ] **5.1. Shell e Navegação (`app/components/` & `app/routes/__root.tsx`)**:
  - Integração de `AppShell`, `TopNav` (com alternador de tenant e botão voltar) e `BottomTabs` (5 abas ergonômicas).
- [ ] **5.2. Telas da Aplicação**:
  - **`app/routes/index.tsx` (Home / Dashboard)**:
    - Boas-vindas, resumo do plano/quotas, métricas do workspace e notificações recentes.
  - **`app/routes/projects/index.tsx` & `$id.tsx` (Projetos & Tarefas)**:
    - Lista de projetos, criação com validação de limite de plano (`<UpgradeGate>`), detalhes e tarefas.
  - **`app/routes/team.tsx` (Times & Membros)**:
    - Gestão de membros, times/staffs (Vendas, Suporte, Dev) e envio de convites por email.
  - **`app/routes/automations.tsx` (Jobs do Payload)**:
    - Disparo de workflows assíncronos do `server/jobs/` e visualizador de fila em tempo real.
  - **`app/routes/billing.tsx` (Planos & Assinatura)**:
    - Tabela de preços, status da assinatura Stripe e histórico de faturamento.
  - **`app/routes/developers.tsx` (API Keys)**:
    - Criação de tokens de API, escopos de permissão e monitor de rate limits.
  - **`app/routes/referrals.tsx` (Programa de Indicação)**:
    - Link de indicação exclusivo, amigos cadastrados e créditos acumulados.
  - **`app/routes/settings.tsx` (Ajustes)**:
    - Perfil pessoal, configurações do workspace e zona de perigo.

---

###  Fase 6: Camada Super Admin (`layers/admin/`)
**Objetivo:** Painel de governança global da plataforma restrito a `roles: ['admin']`.

- [ ] **6.1. Telas de Governança**:
  - **`/admin/` (Visão Geral)**: Métricas globais (Total de Workspaces, Usuários, MRR, Assinaturas por Tier).
  - **`/admin/tenants`**: Listagem global de workspaces com ações de troca de plano manual e suspensão.
  - **`/admin/users`**: Gestão global de contas e atribuição de cargos de sistema.
  - **`/admin/jobs`**: Observabilidade das filas de tarefas do Payload com retry de jobs com erro.
  - **`/admin/settings`**: Edição dos Globals do Payload (`site-settings`, `navigation`).

---

###  Fase 7: Verificação, Testes & Documentação
**Objetivo:** Garantir zero erros de compilação/lint e documentar o uso para novos projetos.

- [ ] **7.1. Geração de Rotas e Tipos**:
  - `bun run routes:gen` para `app/`, `layers/auth/` e `layers/admin/`.
  - Regeneração de `server/types.ts`.
- [ ] **7.2. Verificação de Integridade**:
  - `bunx oxlint --quiet` nas pastas modificadas (0 erros).
  - `bun run build` passando 100% verde.
- [ ] **7.3. Documentação e Report**:
  - Atualização do `README.md` com instruções de como usar e adaptar o starter para novos projetos.
  - Emissão do `docs/report-11-saas-starter-implementation.md`.

---

## 3. Próximo Passo

Por favor, revise os passos acima. Caso deseje incluir, remover ou ajustar qualquer detalhe, me avise; caso aprove o plano, iniciaremos a execução pela **Fase 1 (Configuração de Planos, Entitlements e Access Control)**.

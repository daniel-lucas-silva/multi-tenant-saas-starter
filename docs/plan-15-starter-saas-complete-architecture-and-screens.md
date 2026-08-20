# Plano 15 — Especificação Completa do Starter SaaS: Ideia Unificadora, Capacidades do Payload e Mapa de Telas

> **Status:** Especificação Arquitetural & Mapa de Telas  
> **Objetivo:** Definir a ideia central do Starter que conecta **100% dos recursos avançados do `server/` (Payload 3.88)** e detalhar a lista exata de telas divididas entre a aplicação principal (`app/`) e as camadas isoladas (`layers/auth/` e `layers/admin/`).

---

## 1. A Ideia Unificadora do Starter: **"LaunchPulse — Workspace & Automation Hub"**

Para que o starter seja imediatamente utilizável e demonstre **todas** as capacidades do Payload (Collections, Globals, Jobs/Queues, Endpoints, Dynamic RBAC, KV Store, Media, PWA, API Keys), escolhemos uma ideia que é o **padrão ouro de SaaS contemporâneo**:

> **"LaunchPulse"**: Uma plataforma B2B/B2C onde empresas criam **Workspaces**, organizam seus **Times (Staffs)**, gerenciam seus **Projetos e Conteúdos**, executam **Automações e Jobs em segundo plano**, emitem **API Keys para integrações**, e gerenciam **Planos de Assinatura (Free / Plus / Pro / Enterprise)** com limites de consumo e links de indicação.

### Por que essa ideia encaixa 100% com o `server/`?

| Recurso do `server/` | Como é usado no SaaS LaunchPulse |
| :--- | :--- |
| **Collections (`users`, `media`, etc.)** | Gestão de usuários com avatar, autenticação segura e upload de arquivos/logos de tenant. |
| **Tenants & Members (`tenants`, `tenant-members`)** | Isolamento multi-tenant completo no banco com troca de workspace no topo do app. |
| **Dynamic Roles (`tenant-roles`)** | Cada workspace pode criar cargos customizados (ex: "Analista N1", "Financeiro") com permissões dinâmicas. |
| **Staffs / Times (`staffs`, `staff-members`)** | Departamentos dentro do workspace (Engenharia, Marketing, Suporte) com líderes de equipe. |
| **Projetos & Tarefas (`projects`, `tasks`)** | O domínio de negócio principal usando RichText (Lexical), Arrays, Blocks e Relacionamentos. |
| **Jobs & Workflows (`server/jobs/`)** | Disparo de tarefas assíncronas no painel: exportação de relatórios, workflows de publicação em etapas e crons de manutenção. |
| **Endpoints Raiz (`server/endpoints/`)** | Endpoint de estatísticas `/api/stats`, `/api/health` e webhooks de billing. |
| **API Keys & KV Store (`api-keys`, `kv`)** | Geração de chaves para desenvolvedores com rate limits e armazenamento rápido de cache. |
| **Globals (`site-settings`, `navigation`)** | Configurações globais da plataforma gerenciadas na camada de Super Admin. |
| **PWA & Offline Sync (`shared/pwa`, `shared/sync`)** | Acesso ao app offline com cache Workbox e sincronização em segundo plano. |

---

## 2. Mapa Completo de Telas

A arquitetura do starter é distribuída seguindo o padrão **Nuxt-like Monolith** com três superfícies visuais claras:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ESTRUTURA DE TELAS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. `layers/auth/`  ➔ Portal de Autenticação, Onboarding & Convites          │
│ 2. `app/`          ➔ Aplicação do Cliente / Painel do Workspace (Tenant)    │
│ 3. `layers/admin/` ➔ Painel do Super Admin (Governança da Plataforma)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.1. Telas da Camada de Autenticação (`layers/auth/`)

Esta camada cuida de todo o ciclo de entrada, segurança e onboarding do usuário.

1. **`/login` (Entrar)**:
   - Formulário de login com email/username e senha.
   - Suporte a Two-Factor Authentication (2FA) se ativado.
   - Link para recuperação de senha e criação de conta.
2. **`/register` (Criar Conta)**:
   - Cadastro com nome, email, senha.
   - Captura automática de código de indicação via URL (`?ref=codigo-amigo`).
3. **`/forgot-password` & `/reset-password`**:
   - Solicitação de link de redefinição e formulário com validação de nova senha.
4. **`/invitations/$token` (Aceitar Convite)**:
   - Tela de boas-vindas ao workspace quando o usuário clica no link recebido por email.
   - Mostra o nome do workspace, quem convidou e o cargo atribuído.
5. **`/onboarding` (Primeiros Passos)**:
   - Criar o primeiro Workspace (Nome + Slug) ou selecionar um convite pendente.

---

### 2.2. Telas da Aplicação Principal (`app/` — Painel do Tenant)

Esta é a área logada onde os clientes utilizam o SaaS no dia a dia.

1. **`/` (Dashboard do Workspace)**:
   - **Workspace Switcher** no topo para alternar entre organizações.
   - **Barra de Quotas/Limites do Plano**: Indicador visual (ex: "2/5 Projetos usados no plano Free").
   - **Métricas Rápidas**: Total de tarefas, membros ativos, jobs executados.
   - **Atividades Recentes & Notificações**.
2. **`/projects` & `/projects/$id` (Gestão de Projetos & Domínio)**:
   - Listagem de projetos com filtros por status e times.
   - Visualização de detalhes com RichText, anexo de mídias e atribuição de tarefas a membros.
   - Demonstração de bloqueio: Se atingir o limite do plano, exibe o componente `<UpgradeGate>`.
3. **`/team` (Times, Membros e Permissões)**:
   - **Aba Membros**: Lista de membros do workspace, papéis (`owner`, `admin`, `member`) e botão "Convidar Membro".
   - **Aba Times (Staffs)**: Organização em departamentos (ex: Vendas, Suporte, Dev).
   - **Aba Cargos Customizados (`TenantRoles`)**: Matriz visual de permissões dinâmicas (exclusivo para planos Pro/Enterprise).
4. **`/automations` (Central de Jobs & Workflows)**:
   - Demonstração visual do motor de `server/jobs/`.
   - Botão para disparar um Workflow em segundo plano (ex: "Gerar Relatório Consolidado").
   - Histórico em tempo real de execuções com status (`queued`, `processing`, `completed`, `failed`).
5. **`/billing` (Planos, Assinatura e Faturamento)**:
   - **Tabela de Preços Comparativa**: Free vs Plus vs Pro vs Enterprise com toggle Mensal/Anual.
   - Status da assinatura atual (via Stripe).
   - Histórico de faturas e botão para abrir o Portal do Cliente.
6. **`/developers` (API Keys & Integrações)**:
   - Criar e revogar API Keys com nome, prefixo e escopos de permissão.
   - Visualizador do limite de requisições (Rate Limits) e logs de última utilização.
   - Documentação interativa rápida dos endpoints disponíveis.
7. **`/referrals` (Programa de Indicação / Growth)**:
   - Cartão com o link exclusivo de indicação do usuário (`https://app.com/register?ref=meu-codigo`).
   - Tabela de amigos convidados e saldo de créditos/descontos acumulados.
8. **`/settings` (Configurações do Workspace & Perfil)**:
   - Alterar nome e logo do Workspace.
   - Configurações do perfil pessoal (Avatar, 2FA, Email).
   - Zona de perigo (Transferir titularidade / Excluir workspace).

---

### 2.3. Telas do Painel Super Admin (`layers/admin/` — Gestão da Plataforma)

Esta área é restrita a usuários com **System Role = `admin`** para gerenciar o SaaS como um todo.

1. **`/` (Visão Geral da Plataforma)**:
   - Métricas globais: Total de Workspaces, Total de Usuários, MRR (Receita Recorrente), Assinaturas Ativas por Plano.
2. **`/tenants` (Gestão de Workspaces)**:
   - Tabela com todas as organizações cadastradas.
   - Ações: Inspecionar membros, alterar plano manualmente, suspender ou reativar workspace.
3. **`/users` (Gestão de Usuários)**:
   - Lista global de usuários da plataforma.
   - Ações: Atribuir cargos de sistema (`admin`, `support`), banir/desbanir com motivo e expiração, ver histórico de logins.
4. **`/subscriptions` (Gestão de Faturamento Global)**:
   - Monitoramento de todas as assinaturas Stripe, cancelamentos recentes e taxas de churn.
5. **`/jobs` (Monitor de Tarefas do Payload)**:
   - Painel de observabilidade das filas de jobs do servidor (`echoTask`, `maintenanceTask`, `publishWorkflow`).
   - Ações: Re-tentar jobs que falharam, disparar rotinas de manutenção manual.
6. **`/settings` (Configurações Globais do Sistema)**:
   - Edição dos Globals do Payload (`site-settings`, `navigation`, Feature Flags globais da plataforma).

---

## 3. Resumo da Estrutura de Pastas de Rotas

```
layers/auth/routes/
  ├── __root.tsx
  ├── index.tsx (redirect -> login)
  ├── login.tsx
  ├── register.tsx
  ├── forgot-password.tsx
  ├── reset-password.tsx
  ├── invitations.$token.tsx
  └── onboarding.tsx

app/routes/
  ├── __root.tsx (Shell com Sidebar + Dock + Workspace Switcher)
  ├── index.tsx (Dashboard do Workspace)
  ├── projects/
  │   ├── index.tsx
  │   └── $id.tsx
  ├── team.tsx (Staffs, Membros & Dynamic Roles)
  ├── automations.tsx (Jobs & Workflows)
  ├── billing.tsx (Planos & Stripe)
  ├── developers.tsx (API Keys & Rate Limits)
  ├── referrals.tsx (Links de Indicação & Recompensas)
  └── settings.tsx (Workspace & Perfil)

layers/admin/routes/
  ├── __root.tsx (Admin Shell)
  ├── index.tsx (Platform Metrics)
  ├── tenants.tsx (Gestão de Workspaces)
  ├── users.tsx (Gestão de Usuários & Roles)
  ├── subscriptions.tsx (Gestão de Planos & Stripe)
  ├── jobs.tsx (Monitor de Filas & Tasks)
  └── settings.tsx (Globals & Site Settings)
```

# Plano 13 — Engenharia de Access Control SaaS: Mapeamento de Domínio e Padrões Avançados no Payload 3.88

> **Status:** Análise Arquitetural & Especificação Técnica  
> **Fontes:** `.tmp/example.prisma.txt`, `.agents/skills/payload/reference/ACCESS-CONTROL-ADVANCED.md`, `ACCESS-CONTROL.md`  
> **Objetivo:** Estabelecer a arquitetura definitiva de controle de acesso (RBAC de Sistema vs. RBAC de Tenant, Permissões Dinâmicas, Tiers/Assinaturas, Scoping Multi-tenant e Otimização via Context Cache) no Payload CMS 3.88 API-only.

---

## 1. Distinção Fundamental: System Roles vs. Tenant Roles vs. Dynamic Permissions

Uma das notas mais importantes presentes no schema de referência (`example.prisma.txt`) e na documentação avançada é a separação clara entre **três níveis de permissão**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. SYSTEM ROLES (Nível da Plataforma / Global)                              │
│    - Onde vive: `User.roles` (`admin`, `support`, `user`)                  │
│    - Propósito: Acesso a ferramentas internas da plataforma, suporte,       │
│      manutenção, override global de segurança.                              │
│    - Escopo: Fixo, imutável pelo usuário comum, gravado no JWT.             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 2. TENANT ROLES (Nível do Workspace / Organização)                          │
│    - Onde vive: `Member.role` (`owner`, `admin`, `member`, `billing`, etc.)  │
│    - Propósito: Hierarquia operacional padrão dentro do workspace.          │
│    - Escopo: Contextual — o mesmo usuário pode ser `owner` no Tenant A e     │
│      apenas `member` no Tenant B.                                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 3. DYNAMIC PERMISSIONS (RBAC Customizável por Tenant via `TenantRole`)      │
│    - Onde vive: Collection `tenant-roles` (ex: statement de permissões)     │
│    - Propósito: O tenant define cargos customizados (ex: "Suporte N1",      │
│      "Editor de Blog", "Gerente Financeiro") com matriz de statements:      │
│      `{ project: ["create", "update"], billing: ["view"] }`                 │
│    - Escopo: Totalmente dinâmico, configurado pelo Admin do Tenant na UI.   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Padrões Avançados do Payload Aplicados ao Domínio SaaS

Conforme documentado em `ACCESS-CONTROL-ADVANCED.md`, o Payload 3.88 permite implementar toda essa mecânica com **zero overhead** usando 4 pilares:

### 2.1. Factory Functions para Scoping Automático (`server/access/factories.ts`)

Em vez de escrever lógica repetitiva em cada coleção, criamos *factories* que geram regras de acesso parametrizadas:

```ts
import type { Access, Where } from 'payload';
import { isUser } from './guards';

/**
 * Factory que isola documentos por tenant ativo.
 * - System Admins têm bypass opcional.
 * - Usuários comuns recebem query Where: `{ tenant: { in: userTenants } }`
 *   ou filtrado pelo header `x-tenant-id`.
 */
export function createTenantScopedAccess(options: { allowSystemAdmin?: boolean } = {}): Access {
  const { allowSystemAdmin = true } = options;

  return async ({ req }) => {
    const { user, headers, context } = req;
    if (!isUser(user)) return false;

    // Bypass de Admin do Sistema
    if (allowSystemAdmin && user.roles?.includes('admin')) {
      return true;
    }

    // Tenant ativo enviado via Header ou context
    const activeTenantId = headers.get('x-tenant-id');
    if (activeTenantId) {
      // Valida se o usuário realmente é membro do tenant (com cache no context)
      const isMember = await checkUserTenantMembership(req, user.id, activeTenantId);
      if (!isMember) return false;

      return {
        tenant: { equals: activeTenantId },
      };
    }

    // Caso não passe header de tenant específico, lista dados de todos os tenants que ele participa
    const userTenantIds = await getUserTenantIds(req, user.id);
    return {
      tenant: { in: userTenantIds },
    };
  };
}
```

---

### 2.2. Subscription & Tier-Based Access Control (`createTierAccess`)

Conforme a seção *Subscription-Based Access* de `ACCESS-CONTROL-ADVANCED.md`, controlamos acesso a features ou coleções baseado no plano da assinatura do Tenant:

```ts
const TIER_HIERARCHY = ['free', 'plus', 'pro', 'enterprise'] as const;
type Tier = (typeof TIER_HIERARCHY)[number];

export function createTierAccess(requiredTier: Tier): Access {
  return async ({ req }) => {
    const { user, headers } = req;
    if (!isUser(user)) return false;
    if (user.roles?.includes('admin')) return true;

    const activeTenantId = headers.get('x-tenant-id');
    if (!activeTenantId) return false;

    // Busca assinatura do tenant (com cache no req.context)
    const subscription = await getTenantSubscription(req, activeTenantId);
    if (!subscription || subscription.status !== 'active') {
      return requiredTier === 'free';
    }

    const currentTierIndex = TIER_HIERARCHY.indexOf(subscription.plan as Tier);
    const requiredTierIndex = TIER_HIERARCHY.indexOf(requiredTier);

    return currentTierIndex >= requiredTierIndex;
  };
}
```

---

### 2.3. Dynamic Permission Check (`canTenantUser`)

Para coleções onde o tenant pode configurar quem cria/edita recursos (ex: `projects:delete`):

```ts
export function createDynamicPermissionAccess(resource: string, action: 'create' | 'read' | 'update' | 'delete'): Access {
  return async ({ req }) => {
    const { user, headers } = req;
    if (!isUser(user)) return false;
    if (user.roles?.includes('admin')) return true;

    const activeTenantId = headers.get('x-tenant-id');
    if (!activeTenantId) return false;

    const member = await getTenantMember(req, user.id, activeTenantId);
    if (!member) return false;

    // Owner e Admin do Tenant têm acesso total dentro do workspace
    if (member.role === 'owner' || member.role === 'admin') {
      return { tenant: { equals: activeTenantId } };
    }

    // Se o cargo possui permissões dinâmicas via `TenantRole`
    const hasPermission = await checkDynamicPermission(req, activeTenantId, member.role, resource, action);
    if (!hasPermission) return false;

    return { tenant: { equals: activeTenantId } };
  };
}
```

---

### 2.4. Performance & Otimização: Cache no `req.context` (Anti N+1)

Conforme a seção *Performance Considerations* de `ACCESS-CONTROL-ADVANCED.md`, chamadas assíncronas no access control podem causar o problema N+1 se não forem cacheadas no escopo da requisição.

O `req.context` é o local oficial do Payload para armazenar dados da requisição corrente:

```ts
export async function getTenantMember(req: PayloadRequest, userId: string, tenantId: string) {
  // Inicializa mapa de cache da requisição se não existir
  req.context.tenantMemberships ??= {};
  const cacheKey = `${userId}:${tenantId}`;

  if (req.context.tenantMemberships[cacheKey] !== undefined) {
    return req.context.tenantMemberships[cacheKey];
  }

  const { docs } = await req.payload.find({
    collection: 'tenant-members',
    where: {
      and: [
        { user: { equals: userId } },
        { tenant: { equals: tenantId } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const member = docs[0] ?? null;
  req.context.tenantMemberships[cacheKey] = member;
  return member;
}
```

---

## 3. Mapeamento Completo: Prisma Schema (`example.prisma.txt`) ➔ Payload Collections

| Modelo Prisma | Collection Payload | Papel no SaaS Starter |
| :--- | :--- | :--- |
| `User` | `users.ts` | Auth nativo, system roles (`admin`, `user`), 2FA, avatar, username, lockout. |
| `Session` | Nativo Payload | Gerenciado via JWT / `auth.useSessions: true` com cookies HTTP-only seguros. |
| `Tenant` | `tenants.ts` | Workspaces corporativos com `slugField`, logo, owner e metadata JSON. |
| `Member` | `tenant-members.ts` | Vínculo User ↔ Tenant com roles (`owner`, `admin`, `member`, `billing`). |
| `TenantRole` | `tenant-roles.ts` | Permissões dinâmicas por tenant (`resource`, `action` / statements). |
| `Staff` | `staffs.ts` | Equipes/times dentro do tenant (Engenharia, Suporte, Vendas). |
| `StaffMember` | `staff-members.ts` | Associação de membros aos times/departamentos. |
| `Invitation` | `invitations.ts` | Convites por email com tokens gerados em `beforeChange` e expiração. |
| `Subscription` | `subscriptions.ts` | Planos (`free`, `plus`, `pro`, `enterprise`), Stripe IDs, seats, status. |
| `Apikey` | `api-keys.ts` (ou `apikeys.ts`) | Consumo programático com rate limits, refill time windows e scopes. |
| `Notification` | `notifications.ts` | Notificações in-app por usuário e tenant com flags de leitura e payload JSON. |

---

## 4. Próximos Passos Recomendados

1. **Estruturar `server/access/`**:
   - `guards.ts`: Type guards (`isUser`, `isApiKey`).
   - `factories.ts`: `createTenantScopedAccess`, `createTierAccess`, `createDynamicPermissionAccess`.
   - `helpers.ts`: Funções cacheadas em `req.context` (`getTenantMember`, `getTenantSubscription`).
2. **Criar as Collections SaaS em `server/collections/`**:
   - Desenvolver cada collection de forma modular e tipada.
3. **Registrar em `server/config.ts`**:
   - Montar o ecossistema SaaS completo e pronto para consumo pelo SDK no frontend.

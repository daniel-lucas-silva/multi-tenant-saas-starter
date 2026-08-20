import type { Access, Where } from 'payload';
import { SAAS_TIERS, type SaasTier } from '../config/plans';
import { isUser, isApiKey } from './guards';
import {
  checkDynamicPermission,
  getTenantMember,
  getTenantSubscription,
  getUserTenantIds,
} from './helpers';

export interface TenantScopedOptions {
  allowSystemAdmin?: boolean;
  tenantField?: string;
}

/**
 * Access factory que isola registros no escopo do Tenant ativo do usuário.
 * Retorna uma query `Where` combinando os tenants aos quais o usuário tem acesso.
 */
export function createTenantScopedAccess(options: TenantScopedOptions = {}): Access {
  const { allowSystemAdmin = true, tenantField = 'tenant' } = options;

  return async ({ req }) => {
    const { user, headers } = req;
    if (!user) return false;

    // Se autenticado via API Key associada ao tenant
    if (isApiKey(user)) {
      const apiKeyDoc: any = user;
      if (apiKeyDoc.tenant) {
        const tenantId = typeof apiKeyDoc.tenant === 'object' ? apiKeyDoc.tenant.id : apiKeyDoc.tenant;
        return { [tenantField]: { equals: tenantId } };
      }
    }

    if (!isUser(user)) return false;

    // Super Admins da plataforma têm visão global
    if (allowSystemAdmin && user.roles?.includes('admin')) {
      return true;
    }

    // Se o frontend passou o header `x-tenant-id`
    const activeTenantId = headers.get('x-tenant-id');
    if (activeTenantId) {
      const member = await getTenantMember(req, user.id, activeTenantId);
      if (!member || member.status === 'suspended') return false;

      return {
        [tenantField]: { equals: activeTenantId },
      };
    }

    // Caso contrário, lista dados de todos os workspaces aos quais ele pertence
    const tenantIds = await getUserTenantIds(req, user.id);
    if (tenantIds.length === 0) return false;

    return {
      [tenantField]: { in: tenantIds },
    };
  };
}

/**
 * Access factory que bloqueia recursos caso o plano do tenant não atinja o Tier mínimo.
 */
export function createTierAccess(requiredTier: SaasTier): Access {
  return async ({ req }) => {
    const { user, headers } = req;
    if (!user) return false;

    if (isUser(user) && user.roles?.includes('admin')) {
      return true;
    }

    const activeTenantId = headers.get('x-tenant-id');
    if (!activeTenantId) return false;

    const sub = await getTenantSubscription(req, activeTenantId);
    const currentPlan: SaasTier = sub?.status === 'active' || sub?.status === 'trialing' ? (sub?.plan || 'free') : 'free';

    const currentIndex = SAAS_TIERS.indexOf(currentPlan);
    const requiredIndex = SAAS_TIERS.indexOf(requiredTier);

    return currentIndex >= requiredIndex;
  };
}

/**
 * Access factory para verificar permissões dinâmicas (RBAC) ou roles do tenant.
 */
export function createDynamicPermissionAccess(
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete' | string,
): Access {
  return async ({ req }) => {
    const { user, headers } = req;
    if (!user) return false;

    if (isUser(user) && user.roles?.includes('admin')) {
      return true;
    }

    const activeTenantId = headers.get('x-tenant-id');
    if (!activeTenantId) return false;

    if (!isUser(user)) return false;

    const member = await getTenantMember(req, user.id, activeTenantId);
    if (!member || member.status === 'suspended') return false;

    // Donos e Admins do workspace têm acesso total irrestrito dentro do tenant
    if (member.role === 'owner' || member.role === 'admin') {
      return { tenant: { equals: activeTenantId } };
    }

    // Valida permissão estática ou dinâmica via `tenant-roles`
    const hasPermission = await checkDynamicPermission(req, activeTenantId, member.role, resource, action);
    if (!hasPermission) return false;

    return { tenant: { equals: activeTenantId } };
  };
}

/**
 * Permite apenas ao Dono ou Administrador do tenant gerenciar o recurso.
 */
export const tenantAdminOrOwner: Access = async ({ req }) => {
  const { user, headers } = req;
  if (!user) return false;

  if (isUser(user) && user.roles?.includes('admin')) return true;
  if (!isUser(user)) return false;

  const activeTenantId = headers.get('x-tenant-id');
  if (!activeTenantId) return false;

  const member = await getTenantMember(req, user.id, activeTenantId);
  if (!member) return false;

  return member.role === 'owner' || member.role === 'admin';
};

/**
 * Permite qualquer membro ativo do workspace.
 */
export const tenantMemberOnly: Access = async ({ req }) => {
  const { user, headers } = req;
  if (!user) return false;

  if (isUser(user) && user.roles?.includes('admin')) return true;
  if (!isUser(user)) return false;

  const activeTenantId = headers.get('x-tenant-id');
  if (!activeTenantId) return false;

  const member = await getTenantMember(req, user.id, activeTenantId);
  return Boolean(member && member.status !== 'suspended');
};

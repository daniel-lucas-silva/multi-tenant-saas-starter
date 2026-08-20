import type { PayloadRequest } from 'payload';
import { SAAS_TIERS, type SaasTier } from '../config/plans';

/**
 * Interface do cache de contexto por requisição
 */
interface RequestTenantContext {
  tenantMemberships?: Record<string, any>;
  userTenantIds?: Record<string, string[]>;
  tenantSubscriptions?: Record<string, any>;
  dynamicPermissions?: Record<string, boolean>;
}

declare module 'payload' {
  interface RequestContext extends RequestTenantContext {}
}

/**
 * Busca a filiação de um usuário dentro de um tenant com cache no req.context.
 */
export async function getTenantMember(req: PayloadRequest, userId: string, tenantId: string) {
  req.context.tenantMemberships ??= {};
  const cacheKey = `${userId}:${tenantId}`;

  if (req.context.tenantMemberships[cacheKey] !== undefined) {
    return req.context.tenantMemberships[cacheKey];
  }

  try {
    const { docs } = await req.payload.find({
      collection: 'tenant-members' as any,
      where: {
        and: [
          { user: { equals: userId } },
          { tenant: { equals: tenantId } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });

    const member = docs[0] ?? null;
    req.context.tenantMemberships[cacheKey] = member;
    return member;
  } catch {
    return null;
  }
}

/**
 * Retorna todos os IDs de tenants aos quais o usuário pertence.
 */
export async function getUserTenantIds(req: PayloadRequest, userId: string): Promise<string[]> {
  req.context.userTenantIds ??= {};

  if (req.context.userTenantIds[userId] !== undefined) {
    return req.context.userTenantIds[userId];
  }

  try {
    const { docs } = await req.payload.find({
      collection: 'tenant-members' as any,
      where: {
        user: { equals: userId },
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
      req,
    });

    const tenantIds = docs.map((doc: any) => typeof doc.tenant === 'object' ? doc.tenant?.id : doc.tenant).filter(Boolean);
    req.context.userTenantIds[userId] = tenantIds;
    return tenantIds;
  } catch {
    return [];
  }
}

/**
 * Retorna a assinatura ativa do tenant com cache de requisição.
 */
export async function getTenantSubscription(req: PayloadRequest, tenantId: string) {
  req.context.tenantSubscriptions ??= {};

  if (req.context.tenantSubscriptions[tenantId] !== undefined) {
    return req.context.tenantSubscriptions[tenantId];
  }

  try {
    const { docs } = await req.payload.find({
      collection: 'subscriptions' as any,
      where: {
        tenant: { equals: tenantId },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });

    const sub = docs[0] ?? null;
    req.context.tenantSubscriptions[tenantId] = sub;
    return sub;
  } catch {
    return null;
  }
}

/**
 * Valida se um cargo possui uma permissão dinâmica específica no tenant.
 */
export async function checkDynamicPermission(
  req: PayloadRequest,
  tenantId: string,
  roleSlug: string,
  resource: string,
  action: string,
): Promise<boolean> {
  req.context.dynamicPermissions ??= {};
  const cacheKey = `${tenantId}:${roleSlug}:${resource}:${action}`;

  if (req.context.dynamicPermissions[cacheKey] !== undefined) {
    return req.context.dynamicPermissions[cacheKey];
  }

  try {
    const { docs } = await req.payload.find({
      collection: 'tenant-roles' as any,
      where: {
        and: [
          { tenant: { equals: tenantId } },
          { role: { equals: roleSlug } },
        ],
      },
      limit: 10,
      depth: 0,
      overrideAccess: true,
      req,
    });

    // Procura se alguma role concedeu `resource:action` ou `resource:*` ou `*`
    const hasPermission = docs.some((doc: any) => {
      const perm = doc.permission;
      return (
        perm === `${resource}:${action}` ||
        perm === `${resource}:*` ||
        perm === '*'
      );
    });

    req.context.dynamicPermissions[cacheKey] = hasPermission;
    return hasPermission;
  } catch {
    return false;
  }
}

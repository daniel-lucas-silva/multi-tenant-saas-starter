import { useStore } from '@tanstack/react-store';
import { Store } from '@tanstack/store';
import { useEffect } from 'react';
import type { Tenant, TenantMember, Subscription } from '@/server/types';
import { sdk, setActiveTenantHeader } from '../lib/sdk';
import { SAAS_PLANS, type SaasTier, type SaasPlanDefinition } from '@/server/config/plans';

export interface TenantState {
  currentTenant: Tenant | null;
  currentMembership: TenantMember | null;
  currentSubscription: Subscription | null;
  userTenants: Tenant[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}

const STORAGE_KEY = 'launchpulse_active_tenant_id';

const initial: TenantState = {
  currentTenant: null,
  currentMembership: null,
  currentSubscription: null,
  userTenants: [],
  status: 'idle',
  error: null,
};

export const tenantStore = new Store<TenantState>(initial);

const setTenantState = (updater: Partial<TenantState> | ((s: TenantState) => Partial<TenantState>)) => {
  tenantStore.setState((s) => ({ ...s, ...(typeof updater === 'function' ? updater(s) : updater) }));
};

/**
 * Carrega a lista de workspaces aos quais o usuário logado tem acesso.
 */
export async function loadUserTenants(userId?: string) {
  setTenantState({ status: 'loading', error: null });
  try {
    const { docs: memberships } = await sdk.find({
      collection: 'tenant-members' as any,
      where: userId ? { user: { equals: userId } } : undefined,
      depth: 2,
    });

    const tenants: Tenant[] = [];
    memberships.forEach((m: any) => {
      if (m.tenant && typeof m.tenant === 'object' && !tenants.some((t) => t.id === m.tenant.id)) {
        tenants.push(m.tenant);
      }
    });

    // Se o usuário é dono de workspaces diretamente
    if (userId) {
      const { docs: ownedTenants } = await sdk.find({
        collection: 'tenants' as any,
        where: { owner: { equals: userId } },
        depth: 1,
      });
      ownedTenants.forEach((t: any) => {
        if (!tenants.some((item) => item.id === t.id)) {
          tenants.push(t);
        }
      });
    }

    let activeTenant: Tenant | null = null;
    const savedTenantId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

    if (savedTenantId && tenants.some((t) => t.id === savedTenantId)) {
      activeTenant = tenants.find((t) => t.id === savedTenantId) || null;
    } else if (tenants.length > 0) {
      activeTenant = tenants[0];
    }

    if (activeTenant) {
      setActiveTenantHeader(activeTenant.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, activeTenant.id);
      }
    }

    // Busca assinatura do tenant ativo
    let currentSubscription: Subscription | null = null;
    let currentMembership: TenantMember | null = null;

    if (activeTenant) {
      try {
        const { docs: subs } = await sdk.find({
          collection: 'subscriptions' as any,
          where: { tenant: { equals: activeTenant.id } },
          limit: 1,
        });
        currentSubscription = (subs[0] as Subscription) || null;
      } catch {
        // subscription fallback
      }

      currentMembership = (memberships.find((m: any) => (typeof m.tenant === 'object' ? m.tenant.id : m.tenant) === activeTenant?.id) as TenantMember) || null;
    }

    setTenantState({
      userTenants: tenants,
      currentTenant: activeTenant,
      currentMembership,
      currentSubscription,
      status: 'ready',
      error: null,
    });

    return tenants;
  } catch (error: any) {
    setTenantState({
      status: 'error',
      error: error?.message || 'Erro ao carregar workspaces',
    });
    return [];
  }
}

/**
 * Alterna o Workspace ativo e atualiza os headers do SDK.
 */
export async function switchTenant(tenant: Tenant) {
  setActiveTenantHeader(tenant.id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, tenant.id);
  }

  setTenantState({ currentTenant: tenant, status: 'loading' });

  try {
    const [{ docs: subs }, { docs: mems }] = await Promise.all([
      sdk.find({
        collection: 'subscriptions' as any,
        where: { tenant: { equals: tenant.id } },
        limit: 1,
      }),
      sdk.find({
        collection: 'tenant-members' as any,
        where: { tenant: { equals: tenant.id } },
        limit: 1,
      }),
    ]);

    setTenantState({
      currentSubscription: (subs[0] as Subscription) || null,
      currentMembership: (mems[0] as TenantMember) || null,
      status: 'ready',
    });
  } catch {
    setTenantState({ status: 'ready' });
  }
}

/**
 * Cria um novo workspace e torna o usuário logado proprietário.
 */
export async function createTenant(data: { name: string; slug?: string }) {
  setTenantState({ status: 'loading', error: null });
  try {
    const newTenant = (await sdk.create({
      collection: 'tenants' as any,
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      },
    })) as Tenant;

    await loadUserTenants();
    await switchTenant(newTenant);
    return newTenant;
  } catch (error: any) {
    setTenantState({
      status: 'error',
      error: error?.message || 'Erro ao criar workspace',
    });
    throw error;
  }
}

/**
 * Hook React para acessar o Workspace e Assinatura ativa.
 */
export function useTenant() {
  const state = useStore(tenantStore, (s) => s);

  const planId: SaasTier = (state.currentSubscription?.plan as SaasTier) || 'free';
  const planDefinition: SaasPlanDefinition = SAAS_PLANS[planId] || SAAS_PLANS.free;

  return {
    ...state,
    planId,
    planDefinition,
    switchTenant,
    createTenant,
    reloadTenants: loadUserTenants,
  };
}

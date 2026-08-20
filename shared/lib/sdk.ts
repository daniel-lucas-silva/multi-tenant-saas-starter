import type { Config } from '@/server/types';
import { PayloadSDK } from '@payloadcms/sdk';

let activeTenantId: string | null = null;

export function setActiveTenantHeader(tenantId: string | null) {
  activeTenantId = tenantId;
}

export function getActiveTenantHeader(): string | null {
  return activeTenantId;
}

export const sdk = new PayloadSDK<Config>({
  baseURL: (import.meta?.env?.BUN_PUBLIC_SERVER_URL ?? '') + '/api',
  baseInit: {
    credentials: 'include',
    headers: {
      get 'x-tenant-id'() {
        return activeTenantId || '';
      },
    } as any,
  },
});

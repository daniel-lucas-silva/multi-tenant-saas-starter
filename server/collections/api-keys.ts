import type { CollectionConfig } from 'payload';
import crypto from 'crypto';
import { admins, authenticated } from '../access';
import { createTenantScopedAccess } from '../access/factories';

/**
 * Collection "machine-to-machine" e Developer API Keys:
 * Chaves com prefixo pk_live_..., vinculação ao Tenant, rate limits e escopos granulares.
 */
export const ApiKeys: CollectionConfig = {
  slug: 'api-keys',
  auth: { disableLocalStrategy: true, useAPIKey: true },
  access: {
    read: createTenantScopedAccess(),
    create: authenticated,
    update: createTenantScopedAccess(),
    delete: admins,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create') {
          if (!data?.prefix) {
            data.prefix = `pk_live_${crypto.randomBytes(3).toString('hex')}`;
          }
        }
        return data;
      },
    ],
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
    {
      name: 'prefix',
      type: 'text',
    },
    {
      name: 'scopes',
      type: 'select',
      hasMany: true,
      options: [
        'projects:read',
        'projects:write',
        'tasks:read',
        'tasks:write',
        'jobs:run',
        'stats:read',
      ],
      defaultValue: ['projects:read', 'tasks:read'],
    },
    {
      name: 'rateLimitMax',
      type: 'number',
      defaultValue: 60,
      admin: { description: 'Máximo de requisições por janela de tempo' },
    },
    {
      name: 'rateLimitTimeWindow',
      type: 'number',
      defaultValue: 60000, // 1 minuto em ms
      admin: { description: 'Janela de rate limit em milissegundos' },
    },
    {
      name: 'lastUsedAt',
      type: 'date',
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
};

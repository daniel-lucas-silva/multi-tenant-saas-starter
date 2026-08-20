import type { CollectionConfig } from 'payload';
import { admins, authenticated } from '../access';

export const TenantRoles: CollectionConfig = {
  slug: 'tenant-roles',
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: admins,
  },
  fields: [
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'permissions', type: 'json' },
  ],
};

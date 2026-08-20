import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';

export const Staffs: CollectionConfig = {
  slug: 'staffs',
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'color', type: 'text', defaultValue: '#4f46e5' },
  ],
};

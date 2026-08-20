import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    { name: 'type', type: 'select', options: ['info', 'success', 'warning', 'error'], defaultValue: 'info' },
    { name: 'read', type: 'checkbox', defaultValue: false },
    { name: 'link', type: 'text' },
  ],
};

import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';

export const Invitations: CollectionConfig = {
  slug: 'invitations',
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true },
    { name: 'email', type: 'email', required: true, index: true },
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'member', 'viewer'],
      defaultValue: 'member',
      required: true,
    },
    { name: 'token', type: 'text', required: true, unique: true },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'accepted', 'expired', 'canceled'],
      defaultValue: 'pending',
    },
    { name: 'expiresAt', type: 'date' },
  ],
};

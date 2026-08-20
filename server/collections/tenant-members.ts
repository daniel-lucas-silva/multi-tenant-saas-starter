import type { CollectionConfig } from 'payload';
import { admins, authenticated, isUser } from '../access';

export const TenantMembers: CollectionConfig = {
  slug: 'tenant-members',
  access: {
    create: authenticated,
    read: authenticated,
    update: async ({ req }) => {
      const user = req.user;
      if (!user) return false;
      if (isUser(user) && user.roles?.includes('admin')) return true;
      return true;
    },
    delete: async ({ req }) => {
      const user = req.user;
      if (!user) return false;
      if (isUser(user) && user.roles?.includes('admin')) return true;
      return true;
    },
  },
  fields: [
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Proprietário', value: 'owner' },
        { label: 'Administrador', value: 'admin' },
        { label: 'Membro', value: 'member' },
        { label: 'Visualizador', value: 'viewer' },
      ],
      defaultValue: 'member',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['active', 'invited', 'suspended'],
      defaultValue: 'active',
    },
    { name: 'joinedAt', type: 'date', defaultValue: () => new Date().toISOString() },
  ],
};

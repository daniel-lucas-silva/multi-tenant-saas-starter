import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';

export const StaffMembers: CollectionConfig = {
  slug: 'staff-members',
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'staff', type: 'relationship', relationTo: 'staffs', required: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'roleInTeam', type: 'text', defaultValue: 'Membro' },
  ],
};

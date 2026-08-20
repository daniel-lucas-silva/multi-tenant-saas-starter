import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Em Andamento', value: 'in_progress' },
        { label: 'Em Revisão', value: 'review' },
        { label: 'Concluído', value: 'completed' },
        { label: 'Backlog', value: 'backlog' },
      ],
      defaultValue: 'in_progress',
      index: true,
    },
    {
      name: 'priority',
      type: 'select',
      options: ['low', 'medium', 'high', 'urgent'],
      defaultValue: 'medium',
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
    { name: 'dueDate', type: 'date' },
  ],
};

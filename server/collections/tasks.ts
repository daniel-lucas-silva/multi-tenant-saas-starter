import type { CollectionConfig } from 'payload';
import { authenticated } from '../access';

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'project', type: 'relationship', relationTo: 'projects', required: true, index: true },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'A Fazer', value: 'todo' },
        { label: 'Fazendo', value: 'in_progress' },
        { label: 'Concluído', value: 'done' },
      ],
      defaultValue: 'todo',
      index: true,
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
    { name: 'dueDate', type: 'date' },
  ],
};

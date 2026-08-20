import type { CollectionConfig } from 'payload';
import { admins, authenticated } from '../access';

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  access: {
    create: admins,
    read: authenticated,
    update: admins,
    delete: admins,
  },
  fields: [
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, unique: true, index: true },
    {
      name: 'plan',
      type: 'select',
      options: [
        { label: 'Gratuito', value: 'free' },
        { label: 'Plus', value: 'plus' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      defaultValue: 'free',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['active', 'trialing', 'past_due', 'canceled', 'unpaid'],
      defaultValue: 'active',
      required: true,
    },
    {
      name: 'billingInterval',
      type: 'select',
      options: ['monthly', 'yearly'],
      defaultValue: 'monthly',
    },
    { name: 'seats', type: 'number', defaultValue: 1 },
    { name: 'stripeCustomerId', type: 'text' },
    { name: 'stripeSubscriptionId', type: 'text' },
    { name: 'currentPeriodEnd', type: 'date' },
  ],
};

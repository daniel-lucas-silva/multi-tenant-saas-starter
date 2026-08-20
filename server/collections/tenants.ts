import type { CollectionConfig } from 'payload';
import { slugField } from 'payload';
import { admins, authenticated, isUser } from '../access';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: authenticated,
    read: async ({ req }) => {
      const user = req.user;
      if (!user) return false;
      if (isUser(user) && user.roles?.includes('admin')) return true;

      return {
        or: [
          { owner: { equals: user.id } },
        ],
      };
    },
    update: async ({ req }) => {
      const user = req.user;
      if (!user) return false;
      if (isUser(user) && user.roles?.includes('admin')) return true;
      return { owner: { equals: user.id } };
    },
    delete: admins,
  },
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) => {
        if (operation === 'create' && req.user && isUser(req.user) && !data?.owner) {
          data.owner = req.user.id;
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' && doc.owner) {
          const ownerId = typeof doc.owner === 'object' ? doc.owner.id : doc.owner;

          try {
            await req.payload.create({
              collection: 'tenant-members',
              data: {
                tenant: doc.id,
                user: ownerId,
                role: 'owner',
                status: 'active',
              },
              overrideAccess: true,
              req,
            });
          } catch (err) {
            req.payload.logger.warn(`[Tenants.afterChange] Failed to create owner membership: ${err}`);
          }

          try {
            await req.payload.create({
              collection: 'subscriptions',
              data: {
                tenant: doc.id,
                plan: 'free',
                status: 'active',
                billingInterval: 'monthly',
                seats: 1,
              },
              overrideAccess: true,
              req,
            });
          } catch (err) {
            req.payload.logger.warn(`[Tenants.afterChange] Failed to create default subscription: ${err}`);
          }
        }
        return doc;
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ useAsSlug: 'name' }),
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'owner', type: 'relationship', relationTo: 'users', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      options: ['active', 'suspended', 'archived'],
      defaultValue: 'active',
      index: true,
    },
    { name: 'customDomain', type: 'text' },
    { name: 'metadata', type: 'json' },
  ],
};

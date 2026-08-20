import type { CollectionConfig } from 'payload';
import crypto from 'crypto';
import { adminOnlyField, admins, authenticated, isUser, legacyKeyStrategy, selfOrAdmin } from '../access';

/**
 * Collection de autenticação estendida com suporte SaaS:
 * Referral code, 2FA status, avatar, lockout, sessões e roles do sistema.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    loginWithUsername: { requireEmail: true, allowEmailLogin: true },
    maxLoginAttempts: 5,
    lockTime: 5 * 60 * 1000,
    tokenExpiration: 7200,
    useAPIKey: true,
    useSessions: true,
    removeTokenFromResponses: true,
    strategies: [{ name: 'legacy-key', authenticate: legacyKeyStrategy }],
  },
  access: {
    admin: ({ req }) => {
      const user = req.user;
      return isUser(user) && (user.roles?.includes('admin') ?? false);
    },
    create: () => true, // registro aberto
    read: authenticated,
    update: selfOrAdmin,
    delete: admins,
    unlock: ({ req }) => {
      const user = req.user;
      if (!user) return false;
      return { id: { equals: user.id } };
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && !data?.referralCode) {
          data.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        }
        return data;
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor', 'viewer'],
      defaultValue: ['viewer'],
      saveToJWT: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'referralCode',
      type: 'text',
      index: true,
    },
    {
      name: 'referredBy',
      type: 'text',
    },
    {
      name: 'twoFactorEnabled',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'status',
      type: 'select',
      options: ['active', 'suspended', 'banned'],
      defaultValue: 'active',
      access: {
        update: admins,
      },
    },
    { name: 'salary', type: 'number', access: { read: adminOnlyField, update: adminOnlyField } },
    { name: 'legacyKey', type: 'text' },
  ],
};

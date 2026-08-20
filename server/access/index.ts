import type { Access, AuthStrategyFunction, FieldAccess, PayloadRequest, Where } from 'payload';

import type { User } from '../types';
import { isUser, isApiKey } from './guards';

export * from './guards';
export * from './helpers';
export * from './factories';

/** Acesso público (qualquer um, inclusive anônimo). */
export const anyone: Access = () => true;

/** Só usuário autenticado (qualquer collection auth). */
export const authenticated: Access = ({ req }) => Boolean(req.user);

/** Só admin da collection `users`. */
export const admins: Access = ({ req }) => {
  const user = req.user;
  if (!isUser(user)) return false;
  return user.roles?.includes('admin') ?? false;
};

/** Row-level: admin vê TUDO; senão, só os próprios documentos. */
export const selfOrAdmin: Access = ({ req }) => {
  const user = req.user;
  if (!isUser(user)) return false;
  if (user.roles?.includes('admin')) return true;
  return { id: { equals: user.id } };
};

/** Combinador `and`: restrição composta (draft + autoria), ou admin libera tudo. */
export const authorCanEditDrafts: Access = ({ req }) => {
  const user = req.user;
  if (!isUser(user)) return false;
  if (user.roles?.includes('admin')) return true;
  const where: Where = { and: [{ status: { equals: 'draft' } }, { author: { equals: user.id } }] };
  return where;
};

/** Leitura pública vs. autenticada: anônimo só vê publicado, logado vê tudo. */
export const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true;
  return { status: { equals: 'published' } };
};

/** Field-level access: SÓ retorna boolean (nunca Where). */
export const adminOnlyField: FieldAccess = ({ req }) => {
  const user = req.user;
  return isUser(user) && (user.roles?.includes('admin') ?? false);
};

/**
 * Estratégia de autenticação customizada: loga com um header `x-legacy-key`
 * em vez de senha. Útil para SSO, tokens de terceiros, magic links etc.
 */
export const legacyKeyStrategy: AuthStrategyFunction = async ({ headers, payload }) => {
  const key = headers.get('x-legacy-key');
  if (!key) return { user: null };
  const { docs } = await payload.find({ collection: 'users', where: { legacyKey: { equals: key } }, limit: 1 });
  const user = docs[0] ?? null;
  if (!user) return { user: null };
  return {
    user: { ...user, _strategy: 'users-legacy-key' },
    responseHeaders: new Headers({ 'X-Auth-Strategy': 'legacy-key' }),
  };
};

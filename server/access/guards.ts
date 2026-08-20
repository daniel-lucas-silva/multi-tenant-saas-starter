import type { PayloadRequest } from 'payload';
import type { User } from '../types';

/**
 * Type guard oficial do Payload: faz narrow de req.user quando há múltiplas collections de auth.
 */
export function isUser(user: PayloadRequest['user']): user is User {
  return user?.collection === 'users';
}

export function isApiKey(user: PayloadRequest['user']): boolean {
  return user?.collection === 'api-keys';
}

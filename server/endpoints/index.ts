import type { Endpoint } from 'payload';
import { pwaEndpoints } from './pwa';

/**
 * Endpoints de RAIZ: montam em /api/<path>.
 * Dentro do handler, `req.payload` é a instância do Payload (Local API),
 * `req.routeParams` são os parâmetros da URL, e `await req.json()` lê o body.
 */
export const rootEndpoints: Endpoint[] = [
  ...pwaEndpoints,
  // Healthcheck simples.
  { path: '/health', method: 'get', handler: () => Response.json({ status: 'ok' }) },
  // Stats do workspace ou da plataforma
  {
    path: '/stats',
    method: 'get',
    handler: async (req) => {
      const tenantId = req.headers.get('x-tenant-id');
      if (tenantId) {
        const [projects, tasks, members, subscriptions] = await Promise.all([
          req.payload.count({ collection: 'projects', where: { tenant: { equals: tenantId } }, req }),
          req.payload.count({ collection: 'tasks', where: { tenant: { equals: tenantId } }, req }),
          req.payload.count({ collection: 'tenant-members', where: { tenant: { equals: tenantId } }, req }),
          req.payload.find({ collection: 'subscriptions', where: { tenant: { equals: tenantId } }, limit: 1, req }),
        ]);

        return Response.json({
          projects: projects.totalDocs,
          tasks: tasks.totalDocs,
          members: members.totalDocs,
          subscription: subscriptions.docs[0] ?? null,
        });
      }

      const [users, tenants, projects, posts] = await Promise.all([
        req.payload.count({ collection: 'users' }),
        req.payload.count({ collection: 'tenants' }),
        req.payload.count({ collection: 'projects' }),
        req.payload.count({ collection: 'posts' }),
      ]);
      return Response.json({
        users: users.totalDocs,
        tenants: tenants.totalDocs,
        projects: projects.totalDocs,
        posts: posts.totalDocs,
      });
    },
  },
  // Lê o body JSON do request.
  { path: '/echo', method: 'post', handler: async (req) => Response.json(await req.json?.()) },
  // KV: armazenamento chave/valor (adapter padrão = banco).
  {
    path: '/kv-demo',
    method: 'get',
    handler: async (req) => {
      await req.payload.kv.set('demo-key', { at: new Date().toISOString() });
      const value = await req.payload.kv.get('demo-key');
      return Response.json({ value });
    },
  },
];

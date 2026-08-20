# Arquitetura e padrões

> O princípio do starter: **a IA imita o padrão**. Cada peça abaixo é o padrão a ser
> seguido — não um exemplo pontual, mas a forma canônica de fazer.

## 1. Fluxo de dados

```
server/config.ts ──(monta)──▶ collections/ globals/ access/ jobs/ endpoints/
      │
      └──(generateTypes no boot)──▶ server/types.ts
                                                     │ (Config)
                                                     ▼
                                         shared/lib/sdk.ts  (PayloadSDK<Config>)
                                                     │
                                                     ▼
                                        shared/stores/  (useCollection / useGlobal / useAuth)
                                                     │
                                                     ▼
                                        app/routes/  (páginas React)
```

Uma única fonte de verdade: o `server/`. Dele nascem os tipos (`server/types.ts`), e
toda a camada de dados (`sdk` + `stores`) herda a tipagem **fim-a-fim** — sem declarar
tipo manualmente.

## 2. As peças

### `server/` — o catálogo de capacidades, por pastas

O `server/config.ts` é o ponto de **montagem** — importa as peças e chama `buildConfig`.
Cada peça vive na sua pasta e serve como **catálogo vivo de capacidades técnicas**, demonstrando como o Payload 3.88 funciona (sem admin UI):

- **Access control** — helpers reutilizáveis (`anyone`, `authenticated`, `admins`,
  `selfOrAdmin`, `publishedOrAuthenticated`), row-level com `Where`, field access,
  `admin`/`unlock`/`readVersions`.
- **Hooks** — todos os tipos em `posts` + `req` threadado + `afterError` global.
- **Jobs** — 2 tasks (retries, cron) + 2 workflows (`tasks` object, `inlineTask`).
- **Endpoints** — root (`/health`, `/stats`, `/echo`, `/kv`), collection e global.
- **Auth** — `users` (lockout, verify, loginWithUsername, API key, estratégia custom)
  - `api-keys` (machine-to-machine).
- **Fields** — join, relationship polimórfica, slug, virtual, blocks/array/group/tabs,
  drafts, trash, orderable, localization + i18n.

> **IMPORTANTE — Catálogo vs. Domínio:**
> O `server/` **não é um schema obrigatório ou rígido**. Ao construir um projeto real (e-commerce, clínica, CRM, agendamentos, etc.), crie as collections e globals adequadas para aquele domínio específico, seguindo a mesma estrutura modular (1 arquivo por collection/global/job/endpoint). Não tente reaproveitar schemas de demonstração (`field-showcase`, `posts`) quando o domínio for outro.


### `shared/lib/sdk.ts`

A instância única do SDK (`PayloadSDK<Config>`). **Toda** chamada à API passa por ela.

### `shared/stores/` — estado reativo reutilizável

Stores genéricos por entidade, com estado reativo (TanStack Store) e tipagem do `Config`:

| Hook                  | Para                   | Estado             |
| --------------------- | ---------------------- | ------------------ |
| `useCollection(slug)` | qualquer collection    | `docs` + paginação |
| `useGlobal(slug)`     | qualquer global        | `data`             |
| `useAuth(slug?)`      | auth (default `users`) | `user` + `token`   |

São **singletons por slug**: dois componentes com `useCollection('posts')` compartilham
o mesmo estado.

## 3. Como adicionar uma collection (o padrão)

1. Crie `server/collections/<slug>.ts` (siga o estilo de uma existente) e registre no
   `server/config.ts`.
2. Reinicie o `bun dev` — o `generateTypes` atualiza `server/types.ts`.
3. Use no frontend:

```tsx
const { docs, status, find, create } = useCollection('meu-slug');

// tipado: docs é MeuSlug[], create exige os campos required
await find({ where: { ativo: { equals: true } } });
```

Nada mais. A tipagem e o estado reativo vêm de graça.

## 4. API dos stores

### `useCollection(slug)`

Estado: `docs`, `status` (`idle|loading|ready|error`), `error`, `page`, `hasNextPage`,
`totalDocs`, `totalPages`.

Métodos:

| Método                                                                | O que faz                                             |
| --------------------------------------------------------------------- | ----------------------------------------------------- |
| `find(query)`                                                         | busca lista (substitui docs); guarda query p/ refresh |
| `loadMore()`                                                          | anexa a próxima página                                |
| `refresh()`                                                           | re-executa a última query                             |
| `findByID(id)`                                                        | um doc por ID                                         |
| `create(data)`                                                        | cria + pré-adiciona na lista                          |
| `update(id, data)`                                                    | atualiza + reflete na lista                           |
| `remove(id)`                                                          | deleta + reflete na lista                             |
| `count(where?)`                                                       | conta                                                 |
| `findVersions(where?)` / `findVersionByID(id)` / `restoreVersion(id)` | versões                                               |

`query` aceita: `where`, `sort`, `limit`, `page`, `locale`, `draft`, `trash`, `depth`,
`fallbackLocale`, `pagination`.

### `useGlobal(slug)`

`{ data, status, error }` + `findGlobal(opts?)`, `updateGlobal(data)`,
`findGlobalVersions()`, `findGlobalVersionByID(id)`, `restoreGlobalVersion(id)`.

### `useAuth(slug?)`

`{ user, token, status, error }` + `login({ email, password })`, `logout()`, `me()`,
`refreshToken()`, `forgotPassword(email)`, `resetPassword({ password, token })`,
`verifyEmail(token)`.

## 5. O golden path

`app/routes/posts/index.tsx` mostra as três peças juntas:

- `useGlobal('site-settings')` → dado global (siteName/tagline)
- `useCollection('posts')` → lista + paginação + create/remove reativos
- `useAuth()` → login (o `create` exige `authenticated`)

Use esse arquivo como referência de "como tudo se encaixa".

## 6. Layers e Shared (Arquitetura Modular Monolítica Inspirada no Nuxt)

O projeto adota uma arquitetura em camadas modular e simétrica:

- **Nenhuma pasta solta de código na raiz**: Pastas como `components/`, `lib/`, `hooks/` ou `utils/` NUNCA residem na raiz do projeto.
- **`shared/` (Recursos Compartilhados)**: Contém todo código consumido tanto por `app/` quanto por qualquer sub-aplicação em `layers/`:
  - `shared/components/` → Design System UI (ex.: `shared/components/ui/`) e componentes reaproveitáveis.
  - `shared/lib/` → SDK tipado (`sdk.ts`) e utilitários compartilhados (`utils.ts` com `cn`).
  - `shared/hooks/` → Hooks compartilhados entre frontends (ex.: `use-mobile.ts`).
  - `shared/utils/` → Utilitários de formatação e lógica pura.
  - `shared/stores/` → Stores reativos do Payload (`useCollection`, `useGlobal`, `useAuth`).
  - `shared/pwa/` e `shared/sync/` → Workbox PWA e sincronização offline-first.
- **`app/` (Aplicação Principal / Default Layer)**:
  - `app/components/` → Componentes exclusivos da aplicação principal (ex.: `app-shell`, `bottom-tabs`).
  - `app/lib/` → Libs exclusivas (ex.: `query-client.ts`).
  - `app/hooks/` → Hooks específicos do app.
  - `app/utils/` → Utilitários específicos do app.
  - `app/routes/` → Rotas TanStack Router do app principal.
  - `main.tsx`, `index.html`, `sw.ts`.
- **`layers/<nome>/` (Sub-aplicações isoladas)**:
  - Cada layer (ex.: `layers/admin/`, `layers/auth/`, `layers/kiosk/`) possui estrutura idêntica:
    - `layers/<nome>/components/`
    - `layers/<nome>/lib/`
    - `layers/<nome>/hooks/`
    - `layers/<nome>/utils/`
    - `layers/<nome>/routes/`
    - `layers/<nome>/main.tsx` (com `basepath: '/<nome>'`) e `index.html`.

```ts
// Exemplo de roteamento multi-layer no index.ts:
routes: {
  '/api/*': handleEndpoints,  // API Payload REST
  '/admin/*': adminAppHtml,   // Layer secundária isolada
  '/*': mainAppHtml,          // Frontend principal (app/)
}
```



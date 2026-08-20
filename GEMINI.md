# Instruções do projeto — Fullstack Payload Template

- Template: https://github.com/daniel-lucas-silva/tanstack-payload-template

## Stack (não troque)

- **Bun** (servidor + build) — **sem Vite, sem express, sem Node scripts**.
- **Payload 3.88 API-only** (sem admin UI) + MongoDB.
- **TanStack** Router (file-based) + Query + Store.
- Acesso à API **só** via `@payloadcms/sdk` + stores. **Nunca `fetch` direto.**

## Estrutura (siga este padrão)

```
server/
  config.ts            → ponto de MONTAGEM (importa as peças, chama buildConfig)
  collections/         → 1 arquivo por collection (crie as collections do domínio específico)
  globals/             → 1 arquivo por global
  access/index.ts      → access control reutilizável
  jobs/index.ts        → tasks + workflows
  endpoints/index.ts   → endpoints raiz
  types.ts             → GERADO — nunca edite
shared/                → Recursos compartilhados entre app e layers (NUNCA soltos na raiz)
  components/          → Design System e UI compartilhada (ex.: shared/components/ui/)
  lib/                 → SDK Payload e utils compartilhados (ex.: sdk.ts, utils.ts)
  hooks/               → Hooks compartilhados (ex.: use-mobile.ts)
  utils/               → Funções utilitárias puras compartilhadas
  stores/              → useCollection / useGlobal / useAuth (reativos, auto-fetch)
  pwa/                 → usePWA, registro Workbox e componentes PWA
  sync/                → Engine de sincronização offline-first
app/                   → Aplicação principal (Default Layer)
  components/          → Componentes exclusivos do app principal
  lib/                 → Libs exclusivas do app principal (ex.: query-client.ts)
  hooks/               → Hooks exclusivos do app principal
  utils/               → Utilitários exclusivos do app principal
  routes/              → TanStack Router file-based (1 arquivo por rota)
  routeTree.gen.ts     → GERADO — rode `bun run routes:gen`
  sw.ts                → Service Worker com Workbox (precache, sync, push, cache)
  main.tsx, index.html
layers/<nome>/         → Camadas / sub-aplicações isoladas (ex.: admin, auth, kiosk)
  components/          → Componentes exclusivos da camada
  lib/                 → Libs exclusivas da camada
  hooks/               → Hooks exclusivos da camada
  utils/               → Utilitários exclusivos da camada
  routes/              → Rotas TanStack Router da camada
  main.tsx, index.html
```

> **Catálogo vs. Domínio:** A pasta `server/` demonstra as capacidades do Payload 3.88. Ao desenvolver novos projetos, crie as collections e regras específicas para o domínio do usuário (ex: produtos, pacientes, agendamentos), sem forçar o reuso de schemas de demonstração.
> **Regra Nuxt Monolith:** Pastas de código como `components/`, `lib/`, `hooks/`, `utils/` NUNCA ficam na raiz. Tudo compartilhado vai para `shared/`, o específico do app vai para `app/`, e o específico de uma layer vai para `layers/<nome>/`.



## Fluxo de dados

```
server/ (schema) → generateTypes (boot) → server/types.ts (Config)
     → sdk (shared/lib/sdk.ts) → stores (shared/stores/) → routes (app/routes/)
```

## Regras não negociáveis

- **Nunca edite** `server/types.ts` nem `app/routeTree.gen.ts` (gerados).
- **Nunca `fetch` direto** no frontend — use `useCollection`/`useGlobal`/`useAuth`.
- **Slug**: use `slugField({ useAsSlug: 'campo' })` — `type: 'slug'` **não existe**.
- **2+ collections auth** → `req.user` vira união; faça **narrow por `collection`** com
  type guard (ex.: `isUser`), **nunca typecast**.
- **Tailwind no dev** exige `bunfig.toml` com `[serve.static] plugins = ["bun-plugin-tailwind"]`.
- **Documente** planos, relatórios e decisões em `docs/`, **numerados em ordem**
  (`docs/plan-01-<slug>.md`, `docs/report-01-<slug>.md`) — não mostre só no chat.

## Comandos

```sh
bun dev                 # servidor + HMR (regenera types no boot)
bun run routes:gen      # após criar app/routes/...
bun run build           # build de produção
bunx oxlint --quiet <path>   # lint pontual (arquivo/pasta que mexeu)
```

## Depois de codar (obrigatório)

- `bunx oxlint --quiet <path>` no que mexeu = **0 erros** (verificação pontual, nunca global)
- `bun run build` passa

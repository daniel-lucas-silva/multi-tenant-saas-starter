# Plano 10: Reestruturação da Arquitetura em Camadas Inspirada no Nuxt (Monólito)

## 1. Diagnóstico do Problema
Anteriormente, diretórios como `components/`, `lib/` e `hooks/` estavam na raiz do projeto. Isso violava o princípio arquitetural do monólito modular inspirado no Nuxt, onde:
- A raiz não deve conter pastas de código de UI/utilitários soltas.
- Recursos globais compartilhados entre `app/`, `layers/` e `server/` devem viver dentro de `shared/`.
- Recursos exclusivos do app principal devem viver dentro de `app/`.
- Recursos exclusivos de uma camada (`layer`) devem viver dentro de `layers/<nome>/`.
- A organização interna de pastas é simétrica e previsível em todos os níveis: `(components, lib, hooks, utils, routes)`.

---

## 2. Padrão Arquitetural Alvo (Nuxt-Inspired Monolith)

```
server/                 → Payload CMS 3.88 (API pura)
shared/                 → Código compartilhado entre app e todas as layers
  components/           → UI design system global (ex: ui/, layout/)
  lib/                  → SDK, utils globais (ex: cn, sdk.ts)
  hooks/                → Hooks compartilhados (ex: use-mobile, use-breakpoint)
  utils/                → Helpers puros compartilhados
  stores/               → Stores reativos do Payload (useCollection, useAuth, useGlobal)
  pwa/                  → Service Worker helpers e hooks PWA
  sync/                 → Engine de sincronização offline-first
app/                    → Aplicação Principal (Default Layer)
  components/           → Componentes exclusivos do app (ex: app-shell, bottom-tabs, widgets)
  lib/                  → Libs exclusivas do app (ex: query-client.ts)
  hooks/                → Hooks exclusivos do app
  utils/                → Utilitários exclusivos do app
  routes/               → Rotas TanStack Router da aplicação principal
  main.tsx, index.html, sw.ts
layers/<nome>/          → Camadas / Sub-aplicações isoladas (ex: admin, auth, kiosk)
  components/           → Componentes exclusivos da camada
  lib/                  → Libs exclusivas da camada
  hooks/                → Hooks exclusivos da camada
  utils/                → Utilitários exclusivos da camada
  routes/               → Rotas TanStack Router da camada
  main.tsx, index.html
```

---

## 3. Plano de Execução

1. **Migração de Arquivos Compartilhados para `shared/`**:
   - Mover `components/ui/` → `shared/components/ui/`
   - Mover `lib/utils.ts` → `shared/lib/utils.ts`
   - Mover `hooks/use-mobile.ts` → `shared/hooks/use-mobile.ts`
   - Atualizar imports internos de `@/shared/lib/utils` e `@/shared/hooks/use-mobile` para `@/shared/lib/utils` e `@/shared/hooks/use-mobile`.

2. **Migração de Componentes Exclusivos do App para `app/`**:
   - Mover `components/app/` → `app/components/`
   - Atualizar imports nas rotas de `app/` para `@/app/components/...`.

3. **Remoção de Pastas Obsoletas na Raiz**:
   - Remover `/components`, `/lib`, `/hooks` da raiz.

4. **Atualização da Documentação e Regras de Governança**:
   - Atualizar `README.md`
   - Atualizar `AGENTS.md`
   - Atualizar `GEMINI.md`
   - Atualizar `docs/arquitetura.md`

5. **Validação & Testes**:
   - Executar `bun run routes:gen`
   - Executar `bun run build`
   - Testar typecheck e compilação do applet.

# Plano 10 — Arquitetura de Camadas: `layers/admin/` (Layout Adaptativo) & `layers/auth/`

## 1. Visão Geral e Alinhamento do Starter

O objetivo do template é servir como base sólida e desacoplada para novos projetos e futuros remixes no **Google AI Studio** (ex.: SaaS Multi-tenant, marketplaces, ERPs, etc.):

- **`app/`**: Frontend principal do projeto (otimizado para Mobile-First / PWA / Usuário final).
- **`layers/admin/`**: Painel administrativo com **Layout Adaptativo (Dock, Board, Stage, Spot)** que se adapta de forma fluida entre Mobile (Bottom Dock / Single Zone), Tablet (Rail / Master-Detail) e Desktop (Sidebar / Multi-zone).
- **`layers/auth/`**: Fluxos de autenticação, onboarding, troca de senha e seleção de tenant/organização.
- **`server/`**: Payload 3.88 API pura (sem admin UI acoplada), fornecendo coleções, controle de acesso (RBAC / multi-tenant), jobs e endpoints REST.
- **`shared/`**: SDK tipado (`shared/lib/sdk.ts`), stores reativas (`useAuth`, `useCollection`, `useGlobal`), tokens de design e PWA utilities compartilhadas entre `app/` e `layers/`.

---

## 2. Padrão Arquitetural das 4 Zonas (Adaptive Layout)

Inspirado no pattern de `/.tmp/adaptive-layout/`:

1. **Dock** (Navegação estrutural):
   - *Desktop*: Sidebar expansível/colapsável.
   - *Tablet*: Rail compacto de ícones.
   - *Mobile*: Bottom Tabs / Dock fixo inferior.
2. **Board** (Master / Lista / Filtros contextuais):
   - *Desktop/Tablet*: Painel lateral com busca, filtros e lista de itens com seleção ativa.
   - *Mobile*: Visualização de tela única antes do detalhe.
3. **Stage** (Detail / Espaço de trabalho principal):
   - Espaço central onde formulários, tabelas, métricas e editores são renderizados.
4. **Spot** (Overlays contextuais e efêmeros):
   - Modais, bottom sheets, drawers rápidos e confirmações que preservam o contexto de rota (via search params ou estado local).

---

## 3. Próximos Passos Sugeridos para Preparação do Starter

1. **Camada `layers/admin/`**:
   - Estruturar o layout base com `Dock`, `Board`, `Stage`, `Spot` e hooks de breakpoint (`useBreakpoint`, `useIsMobile`).
   - Criar rotas do TanStack Router para o admin com visualização de dashboard, listagem e detalhe master-detail.
2. **Camada `layers/auth/`**:
   - Telas de Login, Registro, Recuperação e seleção de Tenant/Perfil integradas ao `useAuth` (`@payloadcms/sdk`).
3. **Isolamento e Build**:
   - Garantir scripts limpos no Bun e geração de rotas tipadas para cada camada.

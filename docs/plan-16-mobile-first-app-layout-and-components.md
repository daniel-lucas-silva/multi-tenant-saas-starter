# Plano 16 — Arquitetura Mobile-First do `app/` e Reuso de Componentes

> **Status:** Especificação de Design System & Layout Mobile-First  
> **Objetivo:** Documentar a estrutura de navegação, ergonomia móvel e reuso dos componentes existentes em `app/components/` (`AppShell`, `BottomTabs`, `TopNav`, `Primitives`, `UI-Kit`) combinados com os componentes compartilhados em `shared/components/ui/`.

---

## 1. Filosofia Mobile-First no `app/`

O `app/` é a aplicação principal do usuário final/cliente do SaaS, desenhado com foco prioritário na experiência móvel:
- **Áreas de toque mínimas de 44px**: Botões e abas com feedback tátil e active scale (`active:scale-95`).
- **Navegação Ergonômica**:
  - **TopNav (`app/components/top-nav.tsx`)**: Header fixo com suporte a voltar (`onBack`), título, subtítulo e ações rápidas.
  - **BottomTabs (`app/components/bottom-tabs.tsx`)**: Barra de navegação inferior fixa com ícones, badges e Safe Area padding (`safe-area-pb`), escondida em desktop (`md:hidden`).
  - **AppShell (`app/components/app-shell.tsx`)**: Casca que gerencia layout responsivo, sidebar para desktop (`hidden md:flex`), bottomNav para mobile (`md:hidden`) e padding dinâmico.
- **PWA & Offline Ready**: Integrado com `shared/pwa` e `shared/sync` para instalação no celular e funcionamento offline.

---

## 2. Estrutura de Navegação Mobile (BottomTabs)

As 5 abas principais na barra inferior do `app/` foram mapeadas para cobrir a experiência SaaS com máxima ergonomia:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MOBILE NAVIGATION (BottomTabs)                        │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────┤
│ 🏠 Home     │ 📁 Projetos │ 👥 Times    │ ⚡ Automação│ ⚙️ Ajustes / Plano  │
│ `/`         │ `/projects` │ `/team`     │`/automations│ `/settings` & Mais  │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────────┘
```

---

## 3. Catálogo de Componentes Reutilizáveis em `app/components/`

| Componente | Arquivo | Finalidade no SaaS |
| :--- | :--- | :--- |
| **`AppShell`** | `app/components/app-shell.tsx` | Container mestre com slots para `header` (TopNav), `bottomNav` (BottomTabs), `sidebar` (desktop) e `maxWidth`. |
| **`TopNav`** | `app/components/top-nav.tsx` | Header móvel com botão voltar, títulos, alternador de tenant e ações de filtro. |
| **`BottomTabs`** | `app/components/bottom-tabs.tsx` | Barra de abas inferior com indicador ativo e badges de notificação. |
| **`AvatarBadge` / `Avatarish`** | `app/components/primitives.tsx` | Avatar com iniciais, cores customizadas e status online/offline. |
| **`StatusBadge`** | `app/components/primitives.tsx` | Pílulas de status (`sucesso`, `alerta`, `perigo`, `accent`) para planos, jobs e tarefas. |
| **`StarRating`** | `app/components/primitives.tsx` | Avaliação de feedbacks e templates. |
| **`FavoriteButton`** | `app/components/primitives.tsx` | Favoritar projetos ou automações. |
| **`SectionTitle`** | `app/components/primitives.tsx` | Títulos padronizados para seções de listas. |
| **`UpgradeGate` & Quota Progress** | `shared/components/` | Bloqueio de features e barras de progresso de limites de plano. |

---

## 4. Adaptação Responsiva (Mobile ➔ Tablet ➔ Desktop)

- **Mobile (`< 768px`)**:
  - `BottomTabs` visível e fixo na base.
  - `TopNav` fixo no topo com `safe-area-pt`.
  - Telas em formato de cartões verticais fluidos.
- **Desktop (`>= 768px`)**:
  - `BottomTabs` oculto.
  - Sidebar lateral expansível com Workspace Switcher e menu completo.
  - Conteúdo centralizado com restrição de largura (`max-w-6xl` ou `max-w-7xl`).

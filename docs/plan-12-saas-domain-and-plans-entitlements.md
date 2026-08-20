# Plano 12 — Mapeamento de Domínio SaaS Real: Planos, Tiers, Feature Flags, Quotas e Growth Engine

> **Status:** Proposta & Reflexão Conceitual  
> **Objetivo:** Estabelecer a anatomia completa do que torna um software um verdadeiro SaaS contemporâneo — desmembrando a mecânica de planos (Free, Plus, Pro, Enterprise), controle de features (Feature Flags), limites de consumo (Quotas/Rate Limits), motores de crescimento (Links de Referência, Afiliados, Onboarding) e consumo programático (API Keys & Webhooks).

---

## 1. O que define a mecânica central de um SaaS moderno?

Um SaaS (Software as a Service) não é apenas um app com login e banco de dados; ele é um **motor econômico de software** onde o valor entregue é medido, faturado, protegido e alavancado continuamente.

Em quase todos os SaaS atuais (B2B ou B2C), o sistema opera sobre **5 pilares fundamentais**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            OS 5 PILARES DO SAAS                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. MODELO DE TIERS & BILLING      │ Free, Plus, Pro, Business, Enterprise   │
│ 2. ENTITLEMENTS (FEATURES & LIMITS)│ O que o plano pode ver e quanto pode usar│
│ 3. USAGE & METERED METRICS        │ Contagem em tempo real de consumo/quotas│
│ 4. CONSUMO PROGRAMÁTICO (API)     │ API Keys públicas/privadas, Webhooks    │
│ 5. GROWTH & REFERRAL ENGINE       │ Links de convite, afiliados, créditos   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Padrões Reais de SaaS no Mercado

Ao analisar SaaS de sucesso (ex: Vercel, Supabase, Linear, Resend, Loom, Notion, Shopify), identificamos os principais casos de uso:

### Caso A: SaaS B2B Multi-Seat / Workspace-First (Linear, Notion, Slack)
- **Cobrança**: Por usuário/assento (`seat-based pricing` ex: $12/membro/mês) + plano base.
- **Mecânica de Limites**: Limite de membros na equipe gratuita, histórico de mensagens limitado, limite de projetos ativos.
- **Transição de Plano**: Free (até 5 membros) ➔ Pro (membros ilimitados + roles avançadas) ➔ Enterprise (SSO/SAML, logs de auditoria).

### Caso B: SaaS de Infraestrutura / Uso Consumível (Vercel, Supabase, Resend, OpenAI)
- **Cobrança**: Plano base + `Metered Usage` (pagamento por uso excedente).
- **Mecânica de Limites**:
  - *Free*: 10.000 requisições/mês, 500MB storage, 1.000 emails.
  - *Pro*: 1.000.000 requisições/mês, 100GB storage, 100.000 emails + $0.50 a cada 1.000 excedentes.
- **Consumo**: Fortemente dependente de **API Keys com Rate Limits** e rotação.

### Caso C: SaaS B2C / Single User Freemium (Loom, Canva, Spotify, Duolingo)
- **Cobrança**: Assinatura mensal/anual individual.
- **Mecânica de Limites**: Acesso a ferramentas avançadas (ex: exportar em 4K, remover marca d'água, downloads ilimitados).
- **Growth Engine**: Links de indicação onde quem indica ganha 1 mês grátis ou créditos na plataforma.

---

## 3. A Mecânica de Planos, Features e Limites (Entitlements)

Para que um starter seja genuinamente reutilizável em qualquer novo SaaS, ele precisa resolver o problema de **Entitlements (Direitos de Uso)** sem que o desenvolvedor tenha que reescrever `if/else` espalhado pelo código todo.

### 3.1. Tipos de Restrições em um SaaS

1. **Boolean Feature Flags (Disponibilidade)**:
   - Exemplo: "Exportar para CSV", "Suporte 24/7", "Domínio Customizado", "Auditoria de Logs", "Webhooks".
   - O plano tem (`true`) ou não tem (`false`).

2. **Hard Limits / Quotas Estáticas (Volume Máximo)**:
   - Exemplo: "Máximo de 3 Projetos", "Máximo de 5 Membros na Equipe", "Até 10 Categorias".
   - Ao atingir o número, a ação é bloqueada com um aviso de *Upgrade*.

3. **Metered / Time-Window Usage (Consumo Recorrente)**:
   - Exemplo: "1.000 chamadas de IA por mês", "500 emails enviados por dia", "10GB de tráfego por ciclo de faturamento".
   - Reseta no primeiro dia de cada ciclo de assinatura.

4. **Rate Limits por Segundo/Minuto (Proteção de Infra)**:
   - Exemplo: Free = 10 req/min; Pro = 300 req/min.

---

## 4. O Motor de Crescimento (Growth, Referrals & Afiliados)

SaaS modernos crescem via mecanismos embutidos no produto:

- **Referral Code / Link Único**: Todo usuário ou tenant recebe um `referralCode` (ex: `https://meusaas.com/r/daniel-lucas`).
- **Atribuição & Recompensas**:
  - Quando um novo usuário se cadastra com o link, registra-se a conversão.
  - Recompensa flexível: Crédito na fatura (ex: $10 de desconto), aumento de quota (ex: +500 créditos grátis), ou comissão de afiliado.
- **Ciclo de Onboarding / Checklist**:
  - Guiar o usuário nos primeiros passos (criar primeiro projeto, convidar um colega) para aumentar ativação e conversão para planos pagos.

---

## 5. API Keys & Acesso de Desenvolvedores

Todo SaaS moderno que se integra a outros sistemas precisa de:
- Criação de API Keys nomeadas (`pk_live_...`, `pk_test_...`).
- Scopes/Permissões por chave (ex: apenas leitura em pedidos, gravação em produtos).
- Rate limits por tier atribuídos automaticamente à chave.
- Rastreamento da última data de uso (`lastUsedAt`).

---

## 6. Como isso se traduz no nosso Starter (Payload + TanStack)?

Em vez de criar schemas engessados para uma única regra de negócio, o starter precisa fornecer uma **Infraestrutura Genérica de SaaS**:

1. **Definição Central de Planos (`server/config/plans.ts` ou Global `saas-plans`)**:
   - Uma fonte única da verdade definindo:
     - Slugs: `free`, `starter`, `pro`, `enterprise`
     - Preços (mensal/anual) e IDs do Stripe/MercadoPago
     - Tabela de Features (`features: { customDomain: true, analytics: true }`)
     - Tabela de Limites (`limits: { maxMembers: 10, monthlyCredits: 5000, maxProjects: 50 }`)

2. **Helpers de Verificação no Backend (`server/access/entitlements.ts`)**:
   - `canUseFeature(tenantId, 'customDomain')`
   - `assertWithinLimit(tenantId, 'maxProjects', currentCount)`
   - `consumeCredit(tenantId, 'monthlyCredits', amount)`

3. **Componentes e Hooks de Frontend (`shared/` e `app/`)**:
   - `<UpgradeGate feature="customDomain"> ... </UpgradeGate>` (mostra banner/modal de upgrade se o plano não cobrir)
   - `<LimitProgressBar usage={4} limit={5} label="Projetos criados" />`
   - `useEntitlements()` (hook para saber o que a UI deve exibir ou bloquear)
   - Página de Pricing pronta com toggle Mensal/Anual e botões de checkout.

4. **Growth & Referral Module**:
   - Rastreamento de referrer via query param `?ref=...` guardado em cookie/storage.
   - Atribuição automática na criação do usuário/tenant.

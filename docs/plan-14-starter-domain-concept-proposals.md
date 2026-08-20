# Plano 14 — Propostas de Ideia/Domínio para o Starter SaaS Multi-Tenant

> **Status:** Proposta de Escolha de Domínio  
> **Objetivo:** Definir qual domínio de aplicação servirá como exemplo "quase pronto" dentro do starter, garantindo que ele demonstre todas as engrenagens de um SaaS real (workspaces, times, planos/tiers, limites de quota, API keys, convites e referências) de forma intuitiva e extremamente fácil de adaptar para novos projetos.

---

## Critérios para a Escolha da Ideia

Para que o starter seja o mais útil e reutilizável possível:
1. **Domínio Universal**: Qualquer desenvolvedor precisa bater o olho e entender a regra de negócio em 10 segundos.
2. **Demonstração Completa dos 5 Pilares SaaS**:
   - Workspaces / Tenants com troca de contexto rápida.
   - Times/Staffs internos (ex: Suporte, Vendas, Engenharia).
   - Matriz de Planos (Free vs Plus vs Pro vs Enterprise) com bloqueio visual de features (`<UpgradeGate>`) e barra de limites/quotas.
   - API Keys com rate limit e janela de recarga.
   - Convites por email e link de indicação (`?ref=...`).
3. **Facilidade Extrema de Substituição**: O desenvolvedor pode renomear a entidade principal (ex: trocar "Projetos" por "Pacientes", "Produtos", "Imóveis" ou "Campanhas") e ter seu novo negócio pronto.

---

## As 3 Melhores Propostas de Starter

---

###  Opção 1: **"Workspaces & Project Hub" (Estilo Linear / Notion / Asana Minimal)**
*O clássico mais versátil e universal do mercado de SaaS B2B.*

- **O que é**: Uma central de gestão de projetos, tarefas e recursos compartilhados por times.
- **Entidades do Domínio**: `projects` (projetos), `tasks` (tarefas) e `tags`.
- **Como demonstra as engrenagens SaaS**:
  - **Workspaces & Times**: Workspace da Empresa ➔ Times (Engenharia, Design, Marketing) ➔ Projetos com responsáveis.
  - **Limites de Planos (Quotas)**:
    - *Free*: Até 3 projetos ativos, 5 membros, sem exportação.
    - *Plus*: Até 25 projetos, 15 membros, gráficos de progresso.
    - *Pro*: Projetos ilimitados, membros ilimitados, API Keys, Webhooks, exportação CSV.
    - *Enterprise*: Permissões dinâmicas via `TenantRole` (ex: "Apenas líderes de time podem deletar projetos").
  - **API Keys**: Permite criar automações externas para criar tarefas via API.
- **Por que é ótimo**: É a base perfeita para quem vai construir CRM, ERP leve, gestão de consultorias, agências ou ferramentas de produtividade.

---

###  Opção 2: **"AI Studio & Content Hub" (Estilo Jasper / Copy.ai / Claude Workspace)**
*O modelo mais moderno focado em créditos de consumo (Metered Usage).*

- **O que é**: Plataforma onde equipes geram, organizam e compartilham conteúdos de IA (textos, imagens, análises, resumos) com modelos prontos.
- **Entidades do Domínio**: `prompts` (modelos reutilizáveis), `generations` (histórico de execuções) e `folders`.
- **Como demonstra as engrenagens SaaS**:
  - **Consumo por Créditos (Metered)**:
    - *Free*: 100 créditos/mês (barra de progresso no topo).
    - *Plus*: 2.000 créditos/mês + acesso a modelos mais avançados.
    - *Pro*: 20.000 créditos/mês + chamadas via API Key.
  - **Links de Indicação / Afiliados**: "Convide um amigo e ambos ganham +500 créditos de IA".
  - **API Keys**: Endpoint `/api/v1/generate` protegido por API Key com rate limiting para desenvolvedores integrarem nos seus apps.
- **Por que é ótimo**: É o modelo mais em alta atualmente no mercado de startups e já vem pronto com suporte a consumo de tokens/créditos.

---

###  Opção 3: **"Customer Desk & Feedback Hub" (Estilo Intercom / Plain / Canny)**
*Focado em atendimento, chamados e colaboração por departamentos.*

- **O que é**: Painel de chamados, tickets de clientes e quadro público/privado de sugestões de produtos.
- **Entidades do Domínio**: `tickets` (chamados), `feedbacks` (sugestões com votação) e `canned-responses`.
- **Como demonstra as engrenagens SaaS**:
  - **Staffs & Departamentos**: Roteamento automático de chamados para o time certo (Suporte N1, Financeiro, Bug/Dev).
  - **Limites de Planos**:
    - *Free*: 1 time de atendimento, até 50 tickets/mês.
    - *Pro*: Times ilimitados, SLA tracking, API pública para criar chamados.
  - **Permissões Granulares**: Atendentes só veem tickets do seu time; Supervisores veem tudo.

---

## Comparativo Direto

| Recurso / Engrenagem | Opção 1: Project Hub | Opção 2: AI Content Hub | Opção 3: Customer Desk |
| :--- | :---: | :---: | :---: |
| **Facilidade de Adaptação** | ⭐⭐⭐⭐⭐ (Máxima) | ⭐⭐⭐⭐ (Alta) | ⭐⭐⭐⭐ (Alta) |
| **Exemplo de Quotas Fixas** (ex: máx projetos/membros) | ⭐⭐⭐⭐⭐ Perfeito | ⭐⭐⭐ Bom | ⭐⭐⭐⭐ Muito bom |
| **Exemplo de Quotas de Consumo** (ex: créditos/mês) | ⭐⭐⭐ Adaptável | ⭐⭐⭐⭐⭐ Perfeito | ⭐⭐⭐ Adaptável |
| **Exemplo de Times/Staffs** | ⭐⭐⭐⭐⭐ Natural | ⭐⭐⭐ Básico | ⭐⭐⭐⭐⭐ Perfeito |
| **Exemplo de API Keys** | ⭐⭐⭐⭐ Muito bom | ⭐⭐⭐⭐⭐ Perfeito | ⭐⭐⭐⭐ Muito bom |
| **Exemplo de Referral/Growth** | ⭐⭐⭐⭐ Bom | ⭐⭐⭐⭐⭐ Altamente natural | ⭐⭐⭐ Bom |

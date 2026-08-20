export type SaasTier = 'free' | 'plus' | 'pro' | 'enterprise';

export const SAAS_TIERS: SaasTier[] = ['free', 'plus', 'pro', 'enterprise'];

export interface SaasPlanFeatures {
  customDomain?: boolean;
  advancedAnalytics?: boolean;
  apiAccess?: boolean;
  webhooks?: boolean;
  prioritySupport?: boolean;
  auditLogs?: boolean;
  sso?: boolean;
  unlimitedMembers?: boolean;
}

export interface SaasPlanLimits {
  maxProjects: number;
  maxMembers: number;
  monthlyJobCredits: number;
  maxApiKeys: number;
}

export interface SaasPlanDefinition {
  id: SaasTier;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  badge?: string;
  highlights: string[];
  limits: SaasPlanLimits;
  features: SaasPlanFeatures;
}

export const SAAS_PLANS: Record<SaasTier, SaasPlanDefinition> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    description: 'Perfeito para projetos pessoais, freelancers e validação de MVPs.',
    priceMonthly: 0,
    priceYearly: 0,
    highlights: [
      'Até 3 projetos ativos',
      'Até 2 membros na equipe',
      '50 créditos de automações/mês',
      '1 chave de API',
      'Suporte comunitário',
    ],
    limits: {
      maxProjects: 3,
      maxMembers: 2,
      monthlyJobCredits: 50,
      maxApiKeys: 1,
    },
    features: {
      customDomain: false,
      advancedAnalytics: false,
      apiAccess: true,
      webhooks: false,
      prioritySupport: false,
      auditLogs: false,
      sso: false,
    },
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    description: 'Para startups e pequenas equipes acelerando entregas e automações.',
    priceMonthly: 49,
    priceYearly: 470,
    badge: 'Popular',
    highlights: [
      'Até 15 projetos ativos',
      'Até 8 membros na equipe',
      '500 créditos de automações/mês',
      '5 chaves de API',
      'Domínio customizado',
      'Suporte via chat prioritário',
    ],
    limits: {
      maxProjects: 15,
      maxMembers: 8,
      monthlyJobCredits: 500,
      maxApiKeys: 5,
    },
    features: {
      customDomain: true,
      advancedAnalytics: true,
      apiAccess: true,
      webhooks: true,
      prioritySupport: true,
      auditLogs: false,
      sso: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para empresas em escala com fluxos avançados de trabalho e múltiplos times.',
    priceMonthly: 149,
    priceYearly: 1430,
    badge: 'Recomendado',
    highlights: [
      'Até 50 projetos ativos',
      'Até 25 membros na equipe',
      '3.000 créditos de automações/mês',
      '20 chaves de API',
      'Logs de auditoria completos',
      'Webhooks em tempo real',
    ],
    limits: {
      maxProjects: 50,
      maxMembers: 25,
      monthlyJobCredits: 3000,
      maxApiKeys: 20,
    },
    features: {
      customDomain: true,
      advancedAnalytics: true,
      apiAccess: true,
      webhooks: true,
      prioritySupport: true,
      auditLogs: true,
      sso: false,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Operações de grande porte com requisitos rigorosos de segurança e SLA dedicado.',
    priceMonthly: 499,
    priceYearly: 4790,
    badge: 'Sob Demanda',
    highlights: [
      'Projetos ilimitados',
      'Membros de equipe ilimitados',
      '25.000 créditos de automações/mês',
      'Chaves de API ilimitadas',
      'Autenticação SSO / SAML',
      'Gerente de conta e SLA 99.9%',
    ],
    limits: {
      maxProjects: 999999,
      maxMembers: 999999,
      monthlyJobCredits: 25000,
      maxApiKeys: 999999,
    },
    features: {
      customDomain: true,
      advancedAnalytics: true,
      apiAccess: true,
      webhooks: true,
      prioritySupport: true,
      auditLogs: true,
      sso: true,
      unlimitedMembers: true,
    },
  },
};

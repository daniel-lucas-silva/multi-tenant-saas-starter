import React from 'react';
import { useTenant } from '../stores';
import { SAAS_PLANS, type SaasTier, type SaasPlanFeatures } from '@/server/config/plans';

interface UpgradeGateProps {
  feature?: keyof SaasPlanFeatures;
  minTier?: SaasTier;
  fallbackTitle?: string;
  fallbackDescription?: string;
  children: React.ReactNode;
  inline?: boolean;
}

export function UpgradeGate({
  feature,
  minTier,
  fallbackTitle = 'Recurso Exclusivo',
  fallbackDescription = 'Faça upgrade do seu plano para desbloquear esta funcionalidade no seu workspace.',
  children,
  inline = false,
}: UpgradeGateProps) {
  const { planDefinition, planId } = useTenant();

  let hasAccess = true;

  if (feature) {
    hasAccess = Boolean(planDefinition.features[feature]);
  } else if (minTier) {
    const tiers: SaasTier[] = ['free', 'plus', 'pro', 'enterprise'];
    const currentIdx = tiers.indexOf(planId);
    const requiredIdx = tiers.indexOf(minTier);
    hasAccess = currentIdx >= requiredIdx;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (inline) {
    return (
      <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{fallbackTitle}</h4>
            <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">{fallbackDescription}</p>
            <a
              href="/billing"
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs transition-transform hover:bg-amber-700 active:scale-95"
            >
              Fazer Upgrade do Plano
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 p-8 text-center backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">{fallbackTitle}</h3>
      <p className="mx-auto mt-1 max-w-md text-xs text-neutral-600 dark:text-neutral-400">{fallbackDescription}</p>
      <div className="mt-5 flex justify-center">
        <a
          href="/billing"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-transform hover:bg-indigo-700 active:scale-95"
        >
          Ver Planos & Upgrade
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  );
}

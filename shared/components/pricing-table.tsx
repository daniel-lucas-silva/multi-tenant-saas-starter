import React, { useState } from 'react';
import { SAAS_PLANS, SAAS_TIERS, type SaasTier } from '@/server/config/plans';
import { useTenant } from '../stores';

interface PricingTableProps {
  onSelectPlan?: (tier: SaasTier, interval: 'monthly' | 'yearly') => void;
}

export function PricingTable({ onSelectPlan }: PricingTableProps) {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');
  const { planId } = useTenant();

  return (
    <div className="space-y-8">
      {/* Interval Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
          <button
            type="button"
            onClick={() => setInterval('monthly')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              interval === 'monthly'
                ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Faturamento Mensal
          </button>
          <button
            type="button"
            onClick={() => setInterval('yearly')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              interval === 'yearly'
                ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Faturamento Anual
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {SAAS_TIERS.map((tierKey) => {
          const plan = SAAS_PLANS[tierKey];
          const isCurrent = planId === tierKey;
          const isPopular = plan.badge === 'Popular' || plan.badge === 'Recomendado';
          const price = interval === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12);

          return (
            <div
              key={tierKey}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                isCurrent
                  ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-600/30 dark:border-indigo-500 dark:bg-indigo-950/20'
                  : isPopular
                    ? 'border-neutral-300 bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-900'
                    : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/60'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{plan.name}</h3>
                  {isCurrent && (
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      Plano Atual
                    </span>
                  )}
                </div>

                <p className="mt-1 min-h-[36px] text-xs text-neutral-500 dark:text-neutral-400">
                  {plan.description}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
                    R$ {price}
                  </span>
                  <span className="text-xs text-neutral-500">/mês</span>
                </div>
                {interval === 'yearly' && plan.priceYearly > 0 && (
                  <p className="text-[11px] text-neutral-400">Cobrado R$ {plan.priceYearly} anualmente</p>
                )}

                <div className="my-5 h-px bg-neutral-100 dark:bg-neutral-800" />

                <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                  {plan.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-2">
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => onSelectPlan?.(tierKey, interval)}
                  className={`w-full rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                    isCurrent
                      ? 'cursor-default bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                      : isPopular
                        ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                        : 'border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700'
                  }`}
                >
                  {isCurrent ? 'Plano Atual' : tierKey === 'free' ? 'Começar Grátis' : 'Fazer Upgrade'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

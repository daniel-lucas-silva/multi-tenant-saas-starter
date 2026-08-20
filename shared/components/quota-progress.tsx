import React from 'react';

interface QuotaProgressBarProps {
  label: string;
  usage: number;
  limit: number;
  unit?: string;
  showPercentage?: boolean;
}

export function QuotaProgressBar({
  label,
  usage,
  limit,
  unit = '',
  showPercentage = true,
}: QuotaProgressBarProps) {
  const isUnlimited = limit >= 999999;
  const percentage = isUnlimited ? 0 : Math.min(Math.round((usage / limit) * 100), 100);

  const isWarning = percentage >= 80 && percentage < 100;
  const isDanger = percentage >= 100;

  const barColor = isDanger
    ? 'bg-rose-500'
    : isWarning
      ? 'bg-amber-500'
      : 'bg-indigo-600 dark:bg-indigo-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
        <span className="text-neutral-500 dark:text-neutral-400">
          {isUnlimited ? (
            `${usage}${unit} / Ilimitado`
          ) : (
            <>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{usage}</span>
              {` / ${limit}${unit}`}
              {showPercentage && <span className="ml-1 text-[11px] text-neutral-400">({percentage}%)</span>}
            </>
          )}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: isUnlimited ? '5%' : `${percentage}%` }}
        />
      </div>

      {isDanger && !isUnlimited && (
        <p className="text-[11px] text-rose-500">
          Limite atingido. Faça upgrade para adicionar mais.
        </p>
      )}
    </div>
  );
}

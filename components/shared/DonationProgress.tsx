'use client';

import React from 'react';
import { formatCurrency, toBengaliNumerals } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface DonationProgressProps {
  raised: number;
  goal: number;
  showLabels?: boolean;
}

export function DonationProgress({
  raised,
  goal,
  showLabels = true,
}: DonationProgressProps) {
  const locale = useLocale();
  const percentage = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
  const rawPercentage = goal > 0 ? Math.round((raised / goal) * 100) : 0;

  const displayPercentage = locale === 'bn' ? `${toBengaliNumerals(rawPercentage)}%` : `${rawPercentage}%`;

  return (
    <div className="w-full space-y-2">
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-primary transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
          <div>
            <span className="text-muted-foreground">{locale === 'bn' ? 'সংগৃহীত: ' : 'Raised: '}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(raised, locale)}
            </span>
          </div>

          <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
            {displayPercentage}
          </div>

          <div>
            <span className="text-muted-foreground">{locale === 'bn' ? 'লক্ষ্য: ' : 'Goal: '}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(goal, locale)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

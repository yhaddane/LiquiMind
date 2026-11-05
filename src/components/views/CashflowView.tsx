import React from 'react';
import { TrendingUp, ArrowDownLeft, ArrowUpRight, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { calculateMonthlyCashflow, calculatePeriodCashflow, formatCurrency } from '../../utils/finance';

export const CashflowView: React.FC = () => {
  const { transactions, activeSpaceId, userSettings, periodRange } = useApp();
  const { t } = useI18n();

  // Active period calculation
  const activePeriodCf = calculatePeriodCashflow(
    transactions,
    periodRange.startDate,
    periodRange.endDate,
    activeSpaceId === 'all' ? null : activeSpaceId
  );

  const months = ['2026-11', '2026-10', '2026-09', '2026-08'];

  const monthData = months.map((m) => {
    const cf = calculateMonthlyCashflow(
      transactions,
      m,
      activeSpaceId === 'all' ? null : activeSpaceId
    );
    return {
      month: m,
      ...cf,
    };
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-neutral-900 dark:text-white">
          Flux de trésorerie (Cashflow)
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Évolution de vos entrées, sorties et capacité d’épargne nette au fil des périodes
        </p>
      </div>

      {/* Active Period Hero Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Période active sélectionnée</span>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white mt-0.5">
              {periodRange.label}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Taux d'épargne :</span>
            <span className="px-2.5 py-1 rounded-xl bg-brand/20 text-brand font-black text-xs">
              {activePeriodCf.savingsRate}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-xs text-neutral-500 block">Revenus encaissés</span>
            <strong className="text-xl font-mono text-emerald-500 block mt-1">
              +{formatCurrency(activePeriodCf.income, userSettings.primaryCurrency)}
            </strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
            <span className="text-xs text-neutral-500 block">Dépenses engagées</span>
            <strong className="text-xl font-mono text-rose-500 block mt-1">
              -{formatCurrency(activePeriodCf.expenses, userSettings.primaryCurrency)}
            </strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
            <span className="text-xs text-neutral-500 block">Épargne nette</span>
            <strong className={`text-xl font-mono block mt-1 ${activePeriodCf.net >= 0 ? 'text-brand' : 'text-rose-500'}`}>
              {activePeriodCf.net >= 0 ? '+' : ''}{formatCurrency(activePeriodCf.net, userSettings.primaryCurrency)}
            </strong>
          </div>
        </div>
      </div>

      {/* Cashflow Comparison Table */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] overflow-hidden">
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Historique mensuel comparatif
          </h3>
          <span className="text-xs text-neutral-400">Derniers mois</span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {monthData.map((d) => {
            const isPositiveNet = d.net >= 0;
            return (
              <div
                key={d.month}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white font-mono">
                    {d.month}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Taux d’épargne :{' '}
                    <strong className="text-lime-600 dark:text-[#c4f24e]">
                      {d.savingsRate}%
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Revenus</span>
                    <span className="text-emerald-500 font-bold">
                      +{formatCurrency(d.income, userSettings.primaryCurrency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px]">Dépenses</span>
                    <span className="text-rose-500 font-bold">
                      -{formatCurrency(d.expenses, userSettings.primaryCurrency)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-neutral-400 block text-[10px]">Épargne nette</span>
                    <span
                      className={`text-sm font-black ${
                        isPositiveNet ? 'text-lime-600 dark:text-[#c4f24e]' : 'text-rose-500'
                      }`}
                    >
                      {isPositiveNet ? '+' : ''}
                      {formatCurrency(d.net, userSettings.primaryCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

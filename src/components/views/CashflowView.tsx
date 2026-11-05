import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { calculateMonthlyCashflow, calculatePeriodCashflow, formatCurrency } from '../../utils/finance';
import { PeriodVision } from '../../types';

export const CashflowView: React.FC = () => {
  const {
    transactions,
    categories,
    activeSpaceId,
    userSettings,
    periodRange,
    setPeriodVision,
    navigatePeriodRange,
    setCustomPeriod,
  } = useApp();
  const { t } = useI18n();

  const [customFrom, setCustomFrom] = useState(periodRange.startDate);
  const [customTo, setCustomTo] = useState(periodRange.endDate);

  // Active period calculation
  const activePeriodCf = calculatePeriodCashflow(
    transactions,
    periodRange.startDate,
    periodRange.endDate,
    activeSpaceId === 'all' ? null : activeSpaceId
  );

  // Filter transactions in active period
  const periodTxs = transactions.filter((t) => {
    if (activeSpaceId !== 'all' && t.spaceId !== activeSpaceId) return false;
    return t.date >= periodRange.startDate && t.date <= periodRange.endDate;
  });

  // Breakdown of income sources (D'où vient l'argent)
  const incomeTxs = periodTxs.filter((t) => t.amount > 0);
  const incomeByCat: Record<string, number> = {};
  incomeTxs.forEach((t) => {
    const cat = categories.find((c) => c.id === t.categoryId);
    const key = cat?.name || t.description || 'Autres revenus';
    incomeByCat[key] = (incomeByCat[key] || 0) + t.amount;
  });

  // Breakdown of expenses (Où il va)
  const expenseTxs = periodTxs.filter((t) => t.amount < 0);
  const fixedExpenses: Record<string, number> = {};
  const variableExpenses: Record<string, number> = {};

  expenseTxs.forEach((t) => {
    const cat = categories.find((c) => c.id === t.categoryId);
    const amt = Math.abs(t.amount);
    const key = cat?.name || t.description || 'Dépenses diverses';
    if (cat?.kind === 'FIXED_EXPENSE' || cat?.parentId === 'group_fixed' || cat?.parentId === 'group_pro_fixed') {
      fixedExpenses[key] = (fixedExpenses[key] || 0) + amt;
    } else {
      variableExpenses[key] = (variableExpenses[key] || 0) + amt;
    }
  });

  const totalFixed = Object.values(fixedExpenses).reduce((s, v) => s + v, 0);
  const totalVariable = Object.values(variableExpenses).reduce((s, v) => s + v, 0);

  const months = ['2026-11', '2026-10', '2026-09', '2026-08'];
  const monthData = months.map((m) => {
    const cf = calculateMonthlyCashflow(transactions, m, activeSpaceId === 'all' ? null : activeSpaceId);
    return {
      month: m,
      ...cf,
    };
  });

  const visionOptions: { id: PeriodVision; label: string }[] = [
    { id: 'DAILY', label: 'Quotidien' },
    { id: 'WEEKLY', label: 'Hebdo' },
    { id: 'MONTHLY', label: 'Mensuel' },
    { id: 'YEARLY', label: 'Annuel' },
    { id: 'CUSTOM', label: 'Sur mesure' },
  ];

  const livesBelowMeans = activePeriodCf.net > 0 && activePeriodCf.savingsRate >= 15;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Integrated Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Flux de trésorerie (Cashflow)
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Diagramme de circulation des flux : d'où vient l'argent et où il va
          </p>
        </div>

        {/* Integrated Period Stepper & Vision Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-1 shadow-sm">
            <button
              onClick={() => navigatePeriodRange(-1)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
              title="Période précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {periodRange.label}
            </span>
            <button
              onClick={() => navigatePeriodRange(1)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
              title="Période suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] gap-1 text-xs font-bold">
            {visionOptions.map((v) => (
              <button
                key={v.id}
                onClick={() => setPeriodVision(v.id)}
                className={`px-2.5 py-1.5 rounded-xl transition ${
                  periodRange.vision === v.id
                    ? 'bg-[#c4f24e] text-neutral-950 font-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Living Below Means Diagnostic Banner */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          livesBelowMeans
            ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
            : activePeriodCf.net >= 0
            ? 'border-amber-500/30 bg-amber-950/20 text-amber-300'
            : 'border-red-500/30 bg-red-950/20 text-red-300'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/30">
            {livesBelowMeans ? (
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {livesBelowMeans
                ? 'Excellent : Vous vivez en dessous de vos moyens !'
                : activePeriodCf.net >= 0
                ? 'Équilibre de trésorerie fragile'
                : 'Dépenses supérieures aux revenus sur la période'}
            </h4>
            <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
              {livesBelowMeans
                ? `Vous conservez ${activePeriodCf.savingsRate}% de vos revenus après charges fixes et dépenses (${formatCurrency(activePeriodCf.net, userSettings.primaryCurrency)} épargnés).`
                : `Vos dépenses absorbent la quasi-totalité de vos encaissements. Visez un taux d'épargne d'au moins 20% pour consolider votre matelas de sécurité.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Taux d'épargne</span>
            <span className="text-xl font-black font-mono text-white">{activePeriodCf.savingsRate}%</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Capacité nette</span>
            <span
              className={`text-xl font-black font-mono ${
                activePeriodCf.net >= 0 ? 'text-[#c4f24e]' : 'text-red-400'
              }`}
            >
              {activePeriodCf.net >= 0 ? '+' : ''}
              {formatCurrency(activePeriodCf.net, userSettings.primaryCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* Cashflow Diagram ("D'où vient l'argent, où il va") */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#c4f24e]" />
            <span>Diagramme de flux : D'où vient l'argent, où il va</span>
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            Encaissements : +{formatCurrency(activePeriodCf.income, userSettings.primaryCurrency)}
          </span>
        </div>

        {/* 3-Column Diagram Representation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {/* Column 1: Sources (D'où vient l'argent) */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownLeft className="h-4 w-4" /> Entrées d'argent
              </span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                +{formatCurrency(activePeriodCf.income, userSettings.primaryCurrency)}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {Object.keys(incomeByCat).length === 0 ? (
                <p className="text-xs text-neutral-500 italic">Aucune entrée sur cette période</p>
              ) : (
                Object.entries(incomeByCat).map(([name, amt]) => {
                  const pct = Math.round((amt / (activePeriodCf.income || 1)) * 100);
                  return (
                    <div key={name} className="p-2.5 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60">
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-neutral-800 dark:text-neutral-200">{name}</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          +{formatCurrency(amt, userSettings.primaryCurrency)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Central Hub / Net Treasury Pool */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60 p-4 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Hub LiquiMind & Arbitrage
              </span>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-2">
                <span className="text-[11px] text-neutral-400 block">Total Disponible Encaissé</span>
                <span className="text-2xl font-black text-white font-mono">
                  {formatCurrency(activePeriodCf.income, userSettings.primaryCurrency)}
                </span>
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden flex">
                  <div
                    title="Charges Fixes"
                    className="bg-rose-400 h-full"
                    style={{ width: `${Math.round((totalFixed / (activePeriodCf.income || 1)) * 100)}%` }}
                  />
                  <div
                    title="Dépenses Variables"
                    className="bg-amber-400 h-full"
                    style={{ width: `${Math.round((totalVariable / (activePeriodCf.income || 1)) * 100)}%` }}
                  />
                  <div
                    title="Épargne Conservée"
                    className="bg-[#c4f24e] h-full"
                    style={{ width: `${Math.max(0, activePeriodCf.savingsRate)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-neutral-800/50">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" /> Charges fixes :
                </span>
                <span className="font-bold text-rose-400 font-mono">
                  {Math.round((totalFixed / (activePeriodCf.income || 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-800/50">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Dépenses variables :
                </span>
                <span className="font-bold text-amber-400 font-mono">
                  {Math.round((totalVariable / (activePeriodCf.income || 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-800/50">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#c4f24e]" /> Épargne conservée :
                </span>
                <span className="font-bold text-[#c4f24e] font-mono">
                  {activePeriodCf.savingsRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Where Money Goes (Où il va) */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4" /> Affectation des dépenses
              </span>
              <span className="text-xs font-black text-rose-400 font-mono">
                -{formatCurrency(activePeriodCf.expenses, userSettings.primaryCurrency)}
              </span>
            </div>

            <div className="space-y-2 pt-1 max-h-[300px] overflow-y-auto">
              {/* Fixed Expenses Group */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-neutral-800 dark:text-neutral-200">📌 Charges fixes & Crédits</span>
                  <span className="font-bold text-rose-400 font-mono">
                    -{formatCurrency(totalFixed, userSettings.primaryCurrency)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full"
                    style={{ width: `${Math.round((totalFixed / (activePeriodCf.expenses || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Variable Expenses Group */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-neutral-800 dark:text-neutral-200">🧺 Dépenses variables</span>
                  <span className="font-bold text-amber-400 font-mono">
                    -{formatCurrency(totalVariable, userSettings.primaryCurrency)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${Math.round((totalVariable / (activePeriodCf.expenses || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Net Savings Preserved */}
              {activePeriodCf.net > 0 && (
                <div className="p-2.5 rounded-xl bg-[#c4f24e]/10 border border-[#c4f24e]/30">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white">💰 Épargne nette préservée</span>
                    <span className="text-[#c4f24e] font-mono">
                      +{formatCurrency(activePeriodCf.net, userSettings.primaryCurrency)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c4f24e] rounded-full"
                      style={{ width: `${Math.min(100, activePeriodCf.savingsRate)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Month-by-Month History Comparative */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] overflow-hidden shadow-lg">
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Historique mensuel comparatif
          </h3>
          <span className="text-xs text-neutral-400">Évolution de la capacité d'épargne</span>
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
                    <strong className="text-lime-600 dark:text-[#c4f24e]">{d.savingsRate}%</strong>
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

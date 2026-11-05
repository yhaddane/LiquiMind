import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  ChevronRight,
  Plus,
  ShieldCheck,
  Building,
  Coins,
  LineChart,
  Wallet,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import {
  calculateTotalBalance,
  calculateMonthlyCashflow,
  calculatePeriodCashflow,
  calculateRunwayMonths,
  calculateBudgetProgress,
  calculateNetWorth,
  formatCurrency,
} from '../../utils/finance';

export const DashboardView: React.FC = () => {
  const {
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    assets,
    counterparties,
    debtLedger,
    activeSpaceId,
    selectedMonth,
    periodRange,
    isDateInActivePeriod,
    userSettings,
    setActiveTab,
    setIsAddTxModalOpen,
    setTxTypeFilter,
  } = useApp();

  const { t } = useI18n();

  // Balance calculation
  const totalBalance = calculateTotalBalance(accounts, activeSpaceId === 'all' ? null : activeSpaceId);
  const { income, expenses, net, savingsRate } = calculatePeriodCashflow(
    transactions,
    periodRange.startDate,
    periodRange.endDate,
    activeSpaceId === 'all' ? null : activeSpaceId
  );
  const runway = calculateRunwayMonths(totalBalance, expenses || 7000);
  const netWorth = calculateNetWorth(accounts, assets);

  // Recent transactions in this period (or fallback to recent)
  const periodTransactions = transactions.filter((tx) => {
    if (activeSpaceId !== 'all' && tx.spaceId !== activeSpaceId) return false;
    return isDateInActivePeriod(tx.date);
  });
  const recentTransactions = (periodTransactions.length > 0 ? periodTransactions : transactions.filter((tx) => activeSpaceId === 'all' || tx.spaceId === activeSpaceId)).slice(0, 6);

  // Budget progress summary
  const currentBudgets = budgets.filter((b) => b.month === selectedMonth);
  const budgetSummaries = currentBudgets.map((b) => {
    const cat = categories.find((c) => c.id === b.categoryId);
    const spent = transactions
      .filter((tx) => tx.categoryId === b.categoryId && isDateInActivePeriod(tx.date))
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const progress = calculateBudgetProgress(b.amount, spent);
    return {
      id: b.id,
      category: cat?.name || 'Catégorie',
      icon: cat?.icon || '📁',
      budgeted: b.amount,
      spent,
      progress,
    };
  });

  // Calculate debts balance
  const debtsOwingToMe = counterparties
    .map((cp) => {
      const items = debtLedger.filter((d) => d.counterpartyId === cp.id);
      let balance = 0;
      for (const it of items) {
        if (it.type === 'CREDIT_GIVEN') balance += it.amount;
        if (it.type === 'CREDIT_REPAID') balance -= it.amount;
      }
      return { cp, balance };
    })
    .filter((d) => d.balance > 0);

  const debtsIOwe = counterparties
    .map((cp) => {
      const items = debtLedger.filter((d) => d.counterpartyId === cp.id);
      let balance = 0;
      for (const it of items) {
        if (it.type === 'LOAN_RECEIVED') balance += it.amount;
        if (it.type === 'LOAN_REPAID') balance -= it.amount;
      }
      return { cp, balance };
    })
    .filter((d) => d.balance > 0);

  const totalOwedToMe = debtsOwingToMe.reduce((s, d) => s + d.balance, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Hero Solde Total Card */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/60 dark:from-[#18181c] dark:via-[#141416] dark:to-[#101011] p-6 sm:p-8 shadow-sm">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#c4f24e]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <span>{t('dashboard.totalBalance') || 'Solde total'}</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime-500" />
              <span className="text-neutral-400 font-normal">
                {activeSpaceId === 'all'
                  ? 'Tous les comptes'
                  : activeSpaceId === 'personal'
                  ? 'Personnel'
                  : 'Studio Nour'}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-white font-mono">
                {userSettings.hideAmounts
                  ? '••••••••'
                  : formatCurrency(totalBalance, userSettings.primaryCurrency)}
              </span>
            </div>

            {/* Runway Badge */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl bg-lime-500/10 border border-lime-500/20 px-3 py-1 text-xs font-bold text-lime-700 dark:text-[#c4f24e]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  {t('dashboard.runwayAtPace', { months: runway }) || `${runway} mois d'autonomie financière`}
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                Patrimoine net estimé :{' '}
                <strong className="text-neutral-700 dark:text-neutral-300">
                  {userSettings.hideAmounts
                    ? '••••••'
                    : formatCurrency(netWorth, userSettings.primaryCurrency)}
                </strong>
              </div>
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] px-4 py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-95 transition"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>{t('dashboard.newTransaction') || 'Nouvelle transaction'}</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className="flex items-center gap-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 px-3.5 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <span>Historique du mois</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Cashflow Metrics: Income, Expense, Net Savings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income Card - Clickable */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setTxTypeFilter('INCOME');
            setActiveTab('transactions');
          }}
          className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold group-hover:text-emerald-500 transition">{t('common.income')}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {userSettings.hideAmounts ? '••••' : `+${formatCurrency(income, userSettings.primaryCurrency)}`}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="truncate max-w-[150px]">{periodRange.label}</span>
            <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition font-semibold">
              Voir le détail →
            </span>
          </div>
        </div>

        {/* Expenses Card - Clickable */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setTxTypeFilter('EXPENSE');
            setActiveTab('transactions');
          }}
          className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 cursor-pointer hover:border-rose-500/50 hover:shadow-md transition active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold group-hover:text-rose-500 transition">{t('common.expenses')}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {userSettings.hideAmounts ? '••••' : `-${formatCurrency(expenses, userSettings.primaryCurrency)}`}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="truncate max-w-[150px]">{periodRange.label}</span>
            <span className="text-rose-500 opacity-0 group-hover:opacity-100 transition font-semibold">
              Voir le détail →
            </span>
          </div>
        </div>

        {/* Savings Card - Clickable */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setActiveTab('goals');
          }}
          className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 cursor-pointer hover:border-lime-500/50 hover:shadow-md transition active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold group-hover:text-lime-500 transition">{t('common.savings')}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-lime-500/10 text-lime-600 dark:text-[#c4f24e] group-hover:scale-110 transition">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {userSettings.hideAmounts ? '••••' : formatCurrency(net, userSettings.primaryCurrency)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
            <span>
              Taux d'épargne :{' '}
              <strong className="text-lime-600 dark:text-[#c4f24e]">{savingsRate}%</strong>
            </span>
            <span className="text-lime-500 opacity-0 group-hover:opacity-100 transition font-semibold">
              Objectifs →
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Budgets & Recurring / Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Budgets Envelopes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget Envelopes Progress */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {t('dashboard.overview') || 'Budgets du mois'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Suivi par enveloppe pour {selectedMonth}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('plan')}
                className="text-xs font-bold text-lime-600 dark:text-[#c4f24e] hover:underline"
              >
                Gérer le plan →
              </button>
            </div>

            <div className="space-y-4">
              {budgetSummaries.slice(0, 5).map((item) => {
                const { progress } = item;
                const barColor =
                  progress.statusColor === 'red'
                    ? 'bg-rose-500'
                    : progress.statusColor === 'amber'
                    ? 'bg-amber-400'
                    : 'bg-[#c4f24e]';

                return (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-neutral-400">
                          {userSettings.hideAmounts
                            ? '•••'
                            : formatCurrency(item.spent, userSettings.primaryCurrency)}
                        </span>
                        <span className="text-neutral-500">/</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {userSettings.hideAmounts
                            ? '•••'
                            : formatCurrency(item.budgeted, userSettings.primaryCurrency)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(100, progress.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Dernières opérations
              </h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-bold text-lime-600 dark:text-[#c4f24e] hover:underline"
              >
                Voir tout →
              </button>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {recentTransactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                const isPositive = tx.amount > 0;
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-base">
                        {cat?.icon || (isPositive ? '📥' : '📤')}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-white">
                          {tx.description}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {tx.date} · {cat?.name || 'Virement'}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-xs font-black font-mono ${
                        isPositive ? 'text-emerald-500' : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {userSettings.hideAmounts
                        ? '••••'
                        : `${isPositive ? '+' : ''}${formatCurrency(
                            tx.amount,
                            userSettings.primaryCurrency
                          )}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Debts, Goals & Net Worth */}
        <div className="space-y-6">
          {/* Debts & Loans Summary */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-lime-600 dark:text-[#c4f24e]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {t('dashboard.debtsTitle') || 'Dettes & créances'}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('debts')}
                className="text-xs text-lime-600 dark:text-[#c4f24e] font-semibold hover:underline"
              >
                Gérer
              </button>
            </div>

            {totalOwedToMe > 0 ? (
              <div className="rounded-2xl bg-lime-500/10 border border-lime-500/20 p-3 mb-3">
                <span className="text-[11px] text-lime-700 dark:text-lime-300 font-medium">
                  {t('dashboard.owesYou') || 'On vous doit au total'} :
                </span>
                <div className="text-lg font-black text-lime-800 dark:text-[#c4f24e] font-mono mt-0.5">
                  {userSettings.hideAmounts
                    ? '••••'
                    : formatCurrency(totalOwedToMe, userSettings.primaryCurrency)}
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 mb-3">Aucune créance en attente.</p>
            )}

            <div className="space-y-2">
              {debtsOwingToMe.map(({ cp, balance }) => (
                <div
                  key={cp.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-neutral-100 dark:border-neutral-800/50 last:border-0"
                >
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {cp.name}
                  </span>
                  <span className="font-mono font-bold text-emerald-500">
                    {userSettings.hideAmounts
                      ? '••••'
                      : formatCurrency(balance, userSettings.primaryCurrency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {t('dashboard.goals') || 'Objectifs d’épargne'}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs text-lime-600 dark:text-[#c4f24e] font-semibold hover:underline"
              >
                Voir tout
              </button>
            </div>

            <div className="space-y-3.5">
              {goals.map((g) => {
                const pct = Math.round((g.allocated / g.targetAmount) * 100);
                return (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>{g.icon}</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          {g.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-lime-600 dark:text-[#c4f24e]">
                        {pct}%
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-lime-500 to-[#c4f24e]"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assets Breakdown (Patrimoine) */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {t('assets.navLabel') || 'Patrimoine'}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('assets')}
                className="text-xs text-lime-600 dark:text-[#c4f24e] font-semibold hover:underline"
              >
                Détails
              </button>
            </div>

            <div className="space-y-2.5">
              {assets.map((ast) => (
                <div key={ast.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: ast.color }}
                    />
                    <span className="truncate text-neutral-700 dark:text-neutral-300">
                      {ast.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white shrink-0">
                    {userSettings.hideAmounts
                      ? '••••••'
                      : formatCurrency(ast.value, userSettings.primaryCurrency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

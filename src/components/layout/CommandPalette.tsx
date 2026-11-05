import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  LayoutDashboard,
  CalendarRange,
  ArrowLeftRight,
  TrendingUp,
  Target,
  HandCoins,
  Wallet,
  Building2,
  Repeat,
  Settings,
  Plus,
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/finance';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveTab,
    setIsAddTxModalOpen,
    transactions,
    accounts,
    categories,
    userSettings,
  } = useApp();

  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const pages: { id: NavTab; title: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', title: t('nav.dashboard'), icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'plan', title: t('nav.plan'), icon: <CalendarRange className="h-4 w-4" /> },
    { id: 'transactions', title: t('nav.transactions'), icon: <ArrowLeftRight className="h-4 w-4" /> },
    { id: 'cashflow', title: t('nav.cashflowLong'), icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'goals', title: t('nav.goals'), icon: <Target className="h-4 w-4" /> },
    { id: 'debts', title: t('nav.debts'), icon: <HandCoins className="h-4 w-4" /> },
    { id: 'accounts', title: t('nav.accounts'), icon: <Wallet className="h-4 w-4" /> },
    { id: 'assets', title: t('assets.navLabel'), icon: <Building2 className="h-4 w-4" /> },
    { id: 'recurring', title: t('nav.recurring'), icon: <Repeat className="h-4 w-4" /> },
    { id: 'settings', title: t('nav.settings'), icon: <Settings className="h-4 w-4" /> },
  ];

  const filteredPages = useMemo(() => {
    if (!query) return pages;
    const q = query.toLowerCase();
    return pages.filter((p) => p.title.toLowerCase().includes(q));
  }, [pages, query]);

  const filteredTransactions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return transactions
      .filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          categories.find((c) => c.id === tx.categoryId)?.name.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [transactions, categories, query]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-neutral-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une page, une transaction ou une commande…"
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Quick Action */}
          <button
            onClick={() => {
              setIsCommandPaletteOpen(false);
              setIsAddTxModalOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-lime-700 dark:text-[#c4f24e] bg-lime-500/10 hover:bg-lime-500/20 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une nouvelle dépense ou revenu</span>
          </button>

          {/* Navigation Pages */}
          <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Pages
          </div>
          {filteredPages.map((page) => (
            <button
              key={page.id}
              onClick={() => {
                setActiveTab(page.id);
                setIsCommandPaletteOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition"
            >
              <span className="text-neutral-400">{page.icon}</span>
              <span>{page.title}</span>
            </button>
          ))}

          {/* Transactions Match */}
          {filteredTransactions.length > 0 && (
            <>
              <div className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Transactions trouvées
              </div>
              {filteredTransactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                return (
                  <button
                    key={tx.id}
                    onClick={() => {
                      setActiveTab('transactions');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span>{cat?.icon || '💳'}</span>
                      <span className="truncate">{tx.description}</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        tx.amount > 0 ? 'text-emerald-500' : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {formatCurrency(tx.amount, userSettings.primaryCurrency)}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-4 py-2 text-[11px] text-neutral-400 flex items-center justify-between">
          <span>Naviguer avec ↑ ↓ et Entrée</span>
          <span>Échap pour fermer</span>
        </div>
      </div>
    </div>
  );
};

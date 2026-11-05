import React from 'react';
import {
  LayoutDashboard,
  CalendarRange,
  Plus,
  ArrowLeftRight,
  Menu,
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';

export const MobileNav: React.FC<{ onOpenMore: () => void }> = ({ onOpenMore }) => {
  const { activeTab, setActiveTab, setIsAddTxModalOpen } = useApp();
  const { t } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex h-16 items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#121214]/95 px-2 backdrop-blur-lg safe-bottom">
      {/* Dashboard */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer ${
          activeTab === 'dashboard'
            ? 'text-blue-700 dark:text-blue-400 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-[10px] font-semibold">{t('nav.home') || 'Accueil'}</span>
      </button>

      {/* Plan / Budgets */}
      <button
        onClick={() => setActiveTab('plan')}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer ${
          activeTab === 'plan'
            ? 'text-blue-700 dark:text-blue-400 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <CalendarRange className="h-5 w-5" />
        <span className="text-[10px] font-semibold">{t('nav.plan') || 'Plan'}</span>
      </button>

      {/* Center Floating Plus Button */}
      <div className="-mt-5 flex items-center justify-center">
        <button
          onClick={() => setIsAddTxModalOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/30 active:scale-95 transition cursor-pointer"
          aria-label={t('nav.addTransaction')}
        >
          <Plus className="h-6 w-6 stroke-[3]" />
        </button>
      </div>

      {/* Transactions */}
      <button
        onClick={() => setActiveTab('transactions')}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer ${
          activeTab === 'transactions'
            ? 'text-blue-700 dark:text-blue-400 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <ArrowLeftRight className="h-5 w-5" />
        <span className="text-[10px] font-semibold">{t('nav.transactions') || 'Historique'}</span>
      </button>

      {/* More / Menu */}
      <button
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center gap-1 w-16 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
      >
        <Menu className="h-5 w-5" />
        <span className="text-[10px] font-semibold">{t('nav.menu') || 'Menu'}</span>
      </button>
    </nav>
  );
};

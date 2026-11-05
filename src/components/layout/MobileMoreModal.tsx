import React from 'react';
import {
  X,
  TrendingUp,
  Target,
  HandCoins,
  Wallet,
  Building2,
  Repeat,
  Settings,
  LineChart,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';

export const MobileMoreModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { setActiveTab, setIsAIOnboardingOpen, setIsAndroidModalOpen } = useApp();
  const { t } = useI18n();

  if (!isOpen) return null;

  const moreItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'forecast', label: 'Prévisions trésorerie', icon: <LineChart className="h-5 w-5" /> },
    { id: 'assistant', label: 'Assistant IA & Rapports', icon: <Sparkles className="h-5 w-5 text-[#c4f24e]" /> },
    { id: 'cashflow', label: t('nav.cashflowLong') || 'Flux de trésorerie', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'goals', label: t('nav.goals') || 'Objectifs d’épargne', icon: <Target className="h-5 w-5" /> },
    { id: 'debts', label: t('nav.debts') || 'Dettes & créances', icon: <HandCoins className="h-5 w-5" /> },
    { id: 'accounts', label: t('nav.accounts') || 'Comptes bancaires', icon: <Wallet className="h-5 w-5" /> },
    { id: 'assets', label: t('assets.navLabel') || 'Patrimoine & Actifs', icon: <Building2 className="h-5 w-5" /> },
    { id: 'recurring', label: t('nav.recurring') || 'Charges récurrentes', icon: <Repeat className="h-5 w-5" /> },
    { id: 'settings', label: t('nav.settings') || 'Paramètres & Devises', icon: <Settings className="h-5 w-5" /> },
  ];

  const handleSelect = (id: NavTab) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm lg:hidden">
      <div className="w-full max-w-lg rounded-t-3xl border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            {t('nav.menu') || 'Toutes les rubriques'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Launch Banners */}
        <div className="grid grid-cols-2 gap-2 pt-3">
          <button
            onClick={() => {
              onClose();
              setIsAIOnboardingOpen(true);
            }}
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-lime-700 dark:text-[#c4f24e] text-xs font-bold"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="truncate">Onboarding IA</span>
          </button>
          <button
            onClick={() => {
              onClose();
              setIsAndroidModalOpen(true);
            }}
            className="flex items-center gap-2 p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold"
          >
            <Smartphone className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="truncate">App Android</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3 max-h-[60vh] overflow-y-auto">
          {moreItems.map((it) => (
            <button
              key={it.id}
              onClick={() => handleSelect(it.id)}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/40 p-3.5 text-left text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-500/10 text-lime-700 dark:text-[#c4f24e]">
                {it.icon}
              </div>
              <span className="truncate">{it.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

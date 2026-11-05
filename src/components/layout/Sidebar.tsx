import React from 'react';
import {
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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Sparkles,
  LineChart,
  Smartphone,
  Cloud,
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { Logo } from '../common/Logo';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAddTxModalOpen,
    setIsAIOnboardingOpen,
    setIsAndroidModalOpen,
    authUser,
    userSettings,
    resetToDemo,
    resetToZero,
  } = useApp();

  const { t } = useI18n();
  const [collapsed, setCollapsed] = React.useState(false);
  const [showResetMenu, setShowResetMenu] = React.useState(false);

  const navItems: { id: NavTab; labelKey: string; icon: React.ReactNode; fallback: string }[] = [
    { id: 'dashboard', labelKey: 'nav.dashboard', icon: <LayoutDashboard className="h-4 w-4" />, fallback: 'Tableau de bord' },
    { id: 'plan', labelKey: 'nav.plan', icon: <CalendarRange className="h-4 w-4" />, fallback: 'Plan' },
    { id: 'transactions', labelKey: 'nav.transactions', icon: <ArrowLeftRight className="h-4 w-4" />, fallback: 'Transactions' },
    { id: 'cashflow', labelKey: 'nav.cashflowLong', icon: <TrendingUp className="h-4 w-4" />, fallback: 'Flux' },
    { id: 'forecast', labelKey: 'nav.forecast', icon: <LineChart className="h-4 w-4" />, fallback: 'Prévisions' },
    { id: 'assistant', labelKey: 'nav.assistant', icon: <Sparkles className="h-4 w-4 text-[#c4f24e]" />, fallback: 'Assistant IA' },
    { id: 'goals', labelKey: 'nav.goals', icon: <Target className="h-4 w-4" />, fallback: 'Objectifs' },
    { id: 'debts', labelKey: 'nav.debts', icon: <HandCoins className="h-4 w-4" />, fallback: 'Dettes & crédits' },
    { id: 'accounts', labelKey: 'nav.accounts', icon: <Wallet className="h-4 w-4" />, fallback: 'Comptes' },
    { id: 'assets', labelKey: 'assets.navLabel', icon: <Building2 className="h-4 w-4" />, fallback: 'Patrimoine & Bourse' },
    { id: 'recurring', labelKey: 'nav.recurring', icon: <Repeat className="h-4 w-4" />, fallback: 'Récurrents' },
    { id: 'settings', labelKey: 'nav.settings', icon: <Settings className="h-4 w-4" />, fallback: 'Paramètres' },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-neutral-200 dark:border-neutral-800/80 bg-white/70 dark:bg-[#121214] transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800/80">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 overflow-hidden text-left focus:outline-none"
        >
          <Logo size={32} className="shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
                LiquiMind
              </span>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wide">
                Intelligence & clarté financière
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Quick Add Button */}
      <div className="p-3">
        <button
          onClick={() => setIsAddTxModalOpen(true)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl btn-brand font-black text-xs py-2.5 transition active:scale-98 shadow-sm cursor-pointer ${
            collapsed ? 'px-0' : 'px-3'
          }`}
          title="Ajouter une transaction"
        >
          <PlusCircle className="h-4 w-4 stroke-[2.5]" />
          {!collapsed && <span>{t('nav.newTransaction')}</span>}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 py-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const label = t(item.labelKey) || item.fallback;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? 'bg-neutral-900 text-brand dark:bg-neutral-800/90 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? label : undefined}
            >
              <span className={`shrink-0 ${isActive ? 'text-brand' : 'text-neutral-500'}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Quick Utility Banners */}
      <div className="px-2 py-2 space-y-1.5 border-t border-neutral-200 dark:border-neutral-800/80">
        <button
          onClick={() => setIsAIOnboardingOpen(true)}
          className={`flex w-full items-center gap-2 rounded-xl p-2 text-xs font-bold bg-lime-500/10 text-lime-700 dark:text-[#c4f24e] hover:bg-lime-500/20 transition cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Lancer l'Onboarding IA (8 piliers)"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Onboarding IA (8 piliers)</span>}
        </button>

        <button
          onClick={() => setIsAndroidModalOpen(true)}
          className={`flex w-full items-center gap-2 rounded-xl p-2 text-xs font-bold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="App Android APK & PWA"
        >
          <Smartphone className="h-4 w-4 shrink-0 text-emerald-500" />
          {!collapsed && <span className="truncate">App Android (APK)</span>}
        </button>
      </div>

      {/* Bottom Profile / Reset Controls */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800/80 space-y-2 relative">
        <div
          className={`flex items-center gap-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60 p-2.5 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {authUser?.photoURL ? (
            <img src={authUser.photoURL} alt="" className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/20 text-brand font-black text-xs">
              {authUser ? authUser.displayName?.slice(0, 2).toUpperCase() : 'YH'}
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden text-left">
              <span className="truncate text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                {authUser?.displayName || userSettings.userName}
                {authUser && <Cloud className="h-3 w-3 text-emerald-500 inline shrink-0" />}
              </span>
              <span className="truncate text-[10px] text-neutral-400">
                {authUser?.email || userSettings.email}
              </span>
            </div>
          )}
        </div>

        {/* Demo Mode & Reset popover */}
        {!collapsed ? (
          <div className="relative">
            <div className="flex items-center justify-between rounded-xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                <span>Données locales</span>
              </div>
              <button
                onClick={() => setShowResetMenu(!showResetMenu)}
                className="text-[10px] font-bold text-brand hover:underline cursor-pointer"
              >
                Réinitialiser...
              </button>
            </div>

            {showResetMenu && (
              <div className="absolute bottom-full mb-2 left-0 right-0 z-30 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl text-left space-y-1">
                <div className="text-[10px] font-semibold text-neutral-400 px-2 py-1 uppercase tracking-wider">
                  Options de réinitialisation
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetToZero();
                    setShowResetMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition flex items-center justify-between cursor-pointer"
                >
                  <span>Mettre compteurs à 0 DH</span>
                  <span className="text-[10px] text-neutral-400 font-mono">0 DH</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetToDemo();
                    setShowResetMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center justify-between cursor-pointer"
                >
                  <span>Recharger données démo</span>
                  <span className="text-[10px] text-brand">Exemple</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetMenu(false)}
                  className="w-full text-center py-1 text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              resetToZero();
            }}
            className="flex w-full items-center justify-center text-rose-500 text-[10px] font-bold py-1 hover:underline cursor-pointer"
            title="Réinitialiser (0 DH)"
          >
            0 DH
          </button>
        )}
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Flame,
  Globe,
  ChevronDown,
  Layers,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { Logo } from '../common/Logo';
import { PeriodVision } from '../../types';

export const Navbar: React.FC = () => {
  const {
    spaces,
    activeSpaceId,
    setActiveSpaceId,
    userSettings,
    toggleHideAmounts,
    toggleTheme,
    periodRange,
    setPeriodVision,
    setPeriodReferenceDate,
    setCustomPeriod,
    navigatePeriodRange,
    setIsAddTxModalOpen,
    setIsCommandPaletteOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    setIsExportModalOpen,
  } = useApp();

  const { t, locale, setLocale } = useI18n();

  const [isSpaceDropdownOpen, setIsSpaceDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false);

  // Custom date inputs
  const [customFrom, setCustomFrom] = useState(periodRange.startDate);
  const [customTo, setCustomTo] = useState(periodRange.endDate);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentSpaceName =
    activeSpaceId === 'all'
      ? 'Tous les espaces'
      : spaces.find((s) => s.id === activeSpaceId)?.name || 'Espace';

  const visionOptions: { id: PeriodVision; label: string }[] = [
    { id: 'DAILY', label: 'Journalier' },
    { id: 'WEEKLY', label: 'Hebdo' },
    { id: 'MONTHLY', label: 'Mensuel' },
    { id: 'YEARLY', label: 'Annuel' },
    { id: 'CUSTOM', label: 'Sur mesure' },
  ];

  const handleSetToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setPeriodReferenceDate(today);
    setIsPeriodPickerOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 dark:border-neutral-800/80 bg-white/85 dark:bg-[#101011]/90 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Mobile Brand & Space & Period Vision Selector */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Logo with LiquiMind Brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <Logo size={28} />
          <span className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
            LiquiMind
          </span>
        </div>

        {/* Space Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsSpaceDropdownOpen(!isSpaceDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/80 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
            aria-label="Sélectionner un espace"
          >
            <Layers className="h-3.5 w-3.5 text-brand" />
            <span className="max-w-[85px] sm:max-w-[130px] truncate">{currentSpaceName}</span>
            <ChevronDown className="h-3 w-3 text-neutral-500" />
          </button>

          {isSpaceDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-1.5 shadow-xl z-50">
              <button
                onClick={() => {
                  setActiveSpaceId('all');
                  setIsSpaceDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-left ${
                  activeSpaceId === 'all'
                    ? 'bg-brand/20 text-brand font-bold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                <span>🌐</span>
                <span className="flex-1">Tous les espaces</span>
              </button>
              {spaces.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSpaceId(s.id);
                    setIsSpaceDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-left ${
                    activeSpaceId === s.id
                      ? 'bg-brand/20 text-brand font-bold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="flex-1">{s.name}</span>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    {s.tag}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Period Vision Selector & Stepper */}
        <div className="relative flex items-center">
          <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/80 p-0.5 shadow-xs">
            {/* Step Backward */}
            <button
              onClick={() => navigatePeriodRange(-1)}
              className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
              title="Période précédente"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {/* Current Period Label */}
            <button
              onClick={() => setIsPeriodPickerOpen(!isPeriodPickerOpen)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-brand transition"
              title="Changer la vision temporelle"
            >
              <Calendar className="h-3.5 w-3.5 text-brand" />
              <span className="max-w-[130px] sm:max-w-[200px] truncate">{periodRange.label}</span>
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>

            {/* Step Forward */}
            <button
              onClick={() => navigatePeriodRange(1)}
              className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
              title="Période suivante"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Period Picker Popover */}
          {isPeriodPickerOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-bold text-neutral-400 px-1 mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>Vision temporelle</span>
                <button
                  onClick={handleSetToday}
                  className="text-brand text-[10px] hover:underline"
                >
                  Aujourd'hui
                </button>
              </div>

              {/* Vision Pills */}
              <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900/80 mb-3 text-[11px] font-bold text-center">
                {visionOptions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setPeriodVision(v.id);
                      if (v.id !== 'CUSTOM') setIsPeriodPickerOpen(false);
                    }}
                    className={`py-1.5 rounded-lg transition font-bold ${
                      periodRange.vision === v.id
                        ? 'btn-brand shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Range Inputs */}
              {periodRange.vision === 'CUSTOM' ? (
                <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Date début</label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-1">Date fin</label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCustomPeriod(customFrom, customTo);
                      setIsPeriodPickerOpen(false);
                    }}
                    className="w-full py-1.5 rounded-xl btn-brand text-xs font-bold transition mt-2 cursor-pointer"
                  >
                    Appliquer cette période
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-500 py-1 px-1">
                    <span>Plage active :</span>
                    <strong className="text-neutral-900 dark:text-white font-mono">
                      {periodRange.startDate} → {periodRange.endDate}
                    </strong>
                  </div>
                  <button
                    onClick={() => setIsPeriodPickerOpen(false)}
                    className="w-full py-1 text-center text-xs text-neutral-400 hover:text-neutral-200"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="hidden md:flex items-center">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-3 w-60 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 px-3 py-1.5 text-xs text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 transition"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">{t('common.search') || 'Rechercher…'}</span>
          <kbd className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Export & Tools */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Export Trigger */}
        <button
          onClick={() => setIsExportModalOpen(true)}
          title="Exporter (JSON, Excel, PDF, Word)"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition"
          aria-label="Exporter"
        >
          <Download className="h-4 w-4" />
        </button>

        {/* Streak Counter */}
        <div
          title={`Série de ${userSettings.streakDays} jours de saisie`}
          className="hidden sm:flex items-center gap-1 rounded-xl bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-xs font-bold text-amber-500"
        >
          <Flame className="h-3.5 w-3.5 fill-amber-500" />
          <span>{userSettings.streakDays}j</span>
        </div>

        {/* Hide Amounts Toggle */}
        <button
          onClick={toggleHideAmounts}
          title={userSettings.hideAmounts ? t('dashboard.showAmounts') : t('dashboard.hideAmounts')}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition"
          aria-label="Masquer ou afficher les montants"
        >
          {userSettings.hideAmounts ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>

        {/* Notifications Bell */}
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full btn-brand text-[10px] font-black">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs font-bold uppercase text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition"
            aria-label="Changer de langue"
          >
            <Globe className="h-3.5 w-3.5 text-neutral-500" />
            <span>{locale}</span>
          </button>

          {isLangDropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-1.5 shadow-xl z-50">
              <button
                onClick={() => {
                  setLocale('fr');
                  setIsLangDropdownOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              >
                <span>Français</span>
                <span className="text-[10px] text-neutral-400">FR</span>
              </button>
              <button
                onClick={() => {
                  setLocale('en');
                  setIsLangDropdownOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              >
                <span>English</span>
                <span className="text-[10px] text-neutral-400">EN</span>
              </button>
              <button
                onClick={() => {
                  setLocale('ar');
                  setIsLangDropdownOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              >
                <span>العربية</span>
                <span className="text-[10px] text-neutral-400">AR</span>
              </button>
              <button
                onClick={() => {
                  setLocale('ary');
                  setIsLangDropdownOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              >
                <span>Darija</span>
                <span className="text-[10px] text-neutral-400">ARY</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={userSettings.theme === 'dark' ? t('nav.enableLightMode') : t('nav.enableDarkMode')}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition"
          aria-label="Basculer le thème"
        >
          {userSettings.theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-neutral-700" />
          )}
        </button>

        {/* Quick Add Button (Desktop) */}
        <button
          onClick={() => setIsAddTxModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 rounded-xl btn-brand px-3.5 py-1.5 text-xs font-black shadow-md shadow-black/10 transition active:scale-95 cursor-pointer"
          aria-label={t('nav.addTransaction')}
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>{t('dashboard.newTransaction') || 'Nouvelle transaction'}</span>
        </button>
      </div>
    </header>
  );
};

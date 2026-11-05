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
  Sparkles,
  Smartphone,
  Cloud,
  Edit2,
  Check,
  X,
  LogIn,
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
    updateSpace,
    addSpace,
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
    setActiveTab,
    setIsAIOnboardingOpen,
    setIsAndroidModalOpen,
    authUser,
    loginWithGoogle,
    logoutGoogle,
    isSyncingCloud,
  } = useApp();

  const { t, locale, setLocale } = useI18n();

  const [isSpaceDropdownOpen, setIsSpaceDropdownOpen] = useState(false);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [editingSpaceName, setEditingSpaceName] = useState('');
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceTag, setNewSpaceTag] = useState('PRO');

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

  const handleStartRename = (e: React.MouseEvent, spaceId: string, currentName: string) => {
    e.stopPropagation();
    setEditingSpaceId(spaceId);
    setEditingSpaceName(currentName);
  };

  const handleSaveRename = (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    if (editingSpaceName.trim()) {
      updateSpace(spaceId, { name: editingSpaceName.trim() });
    }
    setEditingSpaceId(null);
  };

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSpaceName.trim()) {
      addSpace(newSpaceName.trim(), newSpaceTag, '💼');
      setNewSpaceName('');
      setIsCreatingSpace(false);
    }
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
            <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1 flex items-center justify-between">
                <span>Espaces financiers</span>
                <button
                  onClick={() => setIsCreatingSpace(!isCreatingSpace)}
                  className="text-brand hover:underline cursor-pointer"
                >
                  {isCreatingSpace ? 'Annuler' : '+ Nouveau'}
                </button>
              </div>

              {isCreatingSpace && (
                <form onSubmit={handleCreateSpace} className="p-2 mb-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <input
                    type="text"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    placeholder="Nom (ex: Studio Nour)"
                    className="w-full px-2 py-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-between gap-1">
                    <select
                      value={newSpaceTag}
                      onChange={(e) => setNewSpaceTag(e.target.value)}
                      className="text-[10px] px-1.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      <option value="PRO">PRO</option>
                      <option value="PERSO">PERSO</option>
                      <option value="INVEST">INVEST</option>
                    </select>
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-[11px] font-black rounded-lg btn-brand cursor-pointer"
                    >
                      Créer
                    </button>
                  </div>
                </form>
              )}

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

              <div className="space-y-0.5 mt-1">
                {spaces.map((s) => {
                  const isEditingThis = editingSpaceId === s.id;

                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        if (!isEditingThis) {
                          setActiveSpaceId(s.id);
                          setIsSpaceDropdownOpen(false);
                        }
                      }}
                      className={`group flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                        activeSpaceId === s.id
                          ? 'bg-brand/20 text-brand font-bold'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span>{s.icon}</span>
                        {isEditingThis ? (
                          <input
                            type="text"
                            value={editingSpaceName}
                            onChange={(e) => setEditingSpaceName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-1.5 py-0.5 text-xs rounded border border-brand bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate">{s.name}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isEditingThis ? (
                          <>
                            <button
                              onClick={(e) => handleSaveRename(e, s.id)}
                              className="p-1 rounded bg-lime-500/20 text-lime-600 dark:text-[#c4f24e]"
                              title="Enregistrer"
                            >
                              <Check className="h-3 w-3 stroke-[3]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSpaceId(null);
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-white"
                              title="Annuler"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] uppercase font-bold text-neutral-400">
                              {s.tag}
                            </span>
                            <button
                              onClick={(e) => handleStartRename(e, s.id, s.name)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                              title="Renommer cet espace"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
        {/* Assistant IA Trigger */}
        <button
          onClick={() => setActiveTab('assistant')}
          title="Assistant Financier IA & Rapports"
          className="flex items-center gap-1.5 rounded-xl border border-lime-500/30 bg-lime-500/10 hover:bg-lime-500/20 px-2.5 py-1 text-xs font-bold text-lime-700 dark:text-[#c4f24e] transition cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Assistant IA</span>
        </button>

        {/* Google Cloud Sync Button / Status */}
        {authUser ? (
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs">
            <Cloud className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden xl:inline text-[11px] font-semibold text-emerald-500">Cloud Synchro</span>
            <button
              onClick={logoutGoogle}
              className="text-[10px] text-neutral-400 hover:text-rose-400 ml-1 font-medium cursor-pointer"
              title="Se déconnecter"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <button
            onClick={() => loginWithGoogle()}
            title="Synchroniser avec Google Cloud Firestore"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition cursor-pointer"
          >
            <Cloud className="h-3.5 w-3.5 text-blue-500" />
            <span className="hidden lg:inline text-[11px]">Sync Cloud</span>
          </button>
        )}

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

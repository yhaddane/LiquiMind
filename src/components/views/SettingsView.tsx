import React, { useState } from 'react';
import {
  Globe,
  Coins,
  Sun,
  Moon,
  Download,
  Upload,
  RefreshCw,
  Shield,
  User,
  Check,
  AlertTriangle,
  Palette,
  FileText,
  X,
  RotateCcw,
  FileSpreadsheet,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n, LocaleCode } from '../../context/I18nContext';
import { parseExcelOrCsvFile, parseStatementText } from '../../utils/statementParser';

export const SettingsView: React.FC = () => {
  const {
    userSettings,
    accounts,
    categories,
    setCurrency,
    setAccentColor,
    toggleTheme,
    resetToDemo,
    resetToZero,
    exportDataJson,
    importDataJson,
    setIsStatementReviewOpen,
    setStagedTransactions,
    setIsExportModalOpen,
    openAddCategoryModal,
  } = useApp();

  const { locale, setLocale, t } = useI18n();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetZeroConfirm, setShowResetZeroConfirm] = useState(false);
  const [showResetDemoConfirm, setShowResetDemoConfirm] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const currencies = [
    { code: 'MAD', label: 'Dirham marocain (DH)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'USD', label: 'Dollar américain ($)' },
    { code: 'GBP', label: 'Livre sterling (£)' },
    { code: 'CAD', label: 'Dollar canadien ($)' },
  ];

  const activeAccent = userSettings.accentColor || '#c4f24e';

  const colorPresets = [
    { name: 'Lime LiquiMind', hex: '#c4f24e' },
    { name: 'Émeraude Menthe', hex: '#10b981' },
    { name: 'Bleu Cobalt', hex: '#3b82f6' },
    { name: 'Violet Améthyste', hex: '#8b5cf6' },
    { name: 'Or Solaire', hex: '#f59e0b' },
    { name: 'Rose Rubis', hex: '#f43f5e' },
    { name: 'Turquoise Cyan', hex: '#06b6d4' },
    { name: 'Ardoise Platine', hex: '#64748b' },
  ];

  const processJsonString = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      // Check if it's a full LiquiMind backup
      if (parsed.accounts && Array.isArray(parsed.accounts)) {
        const ok = importDataJson(jsonText);
        if (ok) {
          setImportStatus('Données complètes restaurées avec succès depuis la sauvegarde !');
        } else {
          setImportStatus('Erreur : le format de la sauvegarde n’est pas valide.');
        }
      } else if (Array.isArray(parsed)) {
        // It's an array of transactions -> open review
        const staged = parsed.map((item, idx) => ({
          id: `staged_json_${Date.now()}_${idx}`,
          date: item.date || new Date().toISOString().slice(0, 10),
          description: item.description || item.libelle || `Opération ${idx + 1}`,
          amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || -50,
          categoryId: item.categoryId,
          accountId: item.accountId || accounts[0]?.id || 'acc_checking',
          sourceType: 'json' as const,
        }));
        setStagedTransactions(staged);
        setIsStatementReviewOpen(true);
      } else {
        importDataJson(jsonText);
        setImportStatus('Données importées avec succès !');
      }
    } catch (err) {
      setImportStatus('Erreur lors du traitement du fichier JSON.');
    }
    setTimeout(() => setImportStatus(null), 5000);
  };

  const handleProcessFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    try {
      if (ext === 'json') {
        const text = await file.text();
        processJsonString(text);
      } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        const defaultAcc = accounts[0]?.id || 'acc_checking';
        const staged = await parseExcelOrCsvFile(file, categories, defaultAcc);
        if (staged.length > 0) {
          setStagedTransactions(staged);
          setIsStatementReviewOpen(true);
          setImportStatus(`${staged.length} opération(s) extraite(s) du relevé Excel/CSV.`);
        } else {
          setImportStatus('Aucune opération n’a pu être extraite de ce fichier.');
        }
      } else if (ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'txt') {
        // Read text from document
        const text = await file.text();
        const defaultAcc = accounts[0]?.id || 'acc_checking';
        const staged = await parseStatementText(
          text,
          categories,
          defaultAcc,
          ext === 'pdf' ? 'pdf' : 'word'
        );
        if (staged.length > 0) {
          setStagedTransactions(staged);
          setIsStatementReviewOpen(true);
          setImportStatus(`${staged.length} opération(s) extraite(s) du relevé bancaire.`);
        } else {
          // If pure text didn't match lines, give feedback
          setImportStatus('Lecture du relevé : le fichier a été analysé mais les opérations nécessitent une vérification.');
          setStagedTransactions([
            {
              id: `staged_doc_${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              description: `Relevé importé (${file.name})`,
              amount: -100,
              accountId: defaultAcc,
              sourceType: ext === 'pdf' ? 'pdf' : 'word',
            },
          ]);
          setIsStatementReviewOpen(true);
        }
      } else {
        setImportStatus('Format non supporté. Veuillez utiliser un fichier JSON, Excel (.xlsx/.xls), CSV, PDF ou Word (.doc).');
      }
    } catch (err) {
      console.error('File parsing error:', err);
      setImportStatus('Erreur lors de la lecture du fichier bancaire.');
    }
    setTimeout(() => setImportStatus(null), 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleProcessFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleProcessFile(file);
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedJson.trim()) return;
    processJsonString(pastedJson);
    setIsPasteModalOpen(false);
    setPastedJson('');
  };

  const handleConfirmResetZero = () => {
    resetToZero();
    setShowResetZeroConfirm(false);
    setImportStatus('Tous les compteurs ont été remis à zéro avec succès (Soldes à 0 DH) !');
    setTimeout(() => setImportStatus(null), 5000);
  };

  const handleConfirmResetDemo = () => {
    resetToDemo();
    setShowResetDemoConfirm(false);
    setImportStatus('Jeu de données de démonstration rechargé avec succès !');
    setTimeout(() => setImportStatus(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-neutral-900 dark:text-white">
          Paramètres
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Personnalisez la langue, la devise, les couleurs du thème, les relevés bancaires et vos sauvegardes
        </p>
      </div>

      {/* User Profile Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Profil utilisateur
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/20 text-brand font-black text-base">
            YH
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              {userSettings.userName}
            </h4>
            <p className="text-xs text-neutral-400 font-mono">
              {userSettings.email}
            </p>
          </div>
        </div>
      </div>

      {/* Theme Accent Colors Picker */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-brand" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Couleurs du thème & Accentuation
            </h3>
          </div>
          <span
            className="h-4 w-4 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-xs"
            style={{ backgroundColor: activeAccent }}
          />
        </div>

        <p className="text-xs text-neutral-400">
          Choisissez la couleur principale de l'interface qui mettra en valeur le logo LiquiMind, les boutons, badges et indicateurs.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {colorPresets.map((preset) => {
            const isSelected = activeAccent.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setAccentColor(preset.hex)}
                className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition ${
                  isSelected
                    ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800/80 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <div
                  className="h-5 w-5 rounded-full shrink-0 shadow-xs flex items-center justify-center"
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && <Check className="h-3 w-3 text-black stroke-[3]" />}
                </div>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Color Input */}
        <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Couleur sur mesure :
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={activeAccent}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-8 w-10 rounded-lg cursor-pointer border border-neutral-200 dark:border-neutral-700 bg-transparent"
            />
            <span className="text-xs font-mono text-neutral-500">{activeAccent}</span>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-5">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Préférences régionales & affichage
        </h3>

        {/* Currency */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-4">
          <div>
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <Coins className="h-4 w-4 text-neutral-400" />
              <span>Devise principale</span>
            </label>
            <p className="text-[11px] text-neutral-400">
              Devise utilisée pour les totaux et le calcul du patrimoine
            </p>
          </div>
          <select
            value={userSettings.primaryCurrency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-4">
          <div>
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <Globe className="h-4 w-4 text-neutral-400" />
              <span>Langue de l'interface</span>
            </label>
            <p className="text-[11px] text-neutral-400">
              Prend en charge le Français, l'Anglais, l'Arabe et la Darija
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { code: 'fr', label: 'Français' },
              { code: 'en', label: 'English' },
              { code: 'ar', label: 'العربية' },
              { code: 'ary', label: 'Darija' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLocale(l.code as LocaleCode)}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                  locale === l.code
                    ? 'bg-brand text-brand'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dark/Light Theme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              {userSettings.theme === 'dark' ? (
                <Moon className="h-4 w-4 text-neutral-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
              <span>Mode Sombre / Clair</span>
            </label>
            <p className="text-[11px] text-neutral-400">
              Mode sombre OLED pour économiser la batterie ou mode clair
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {userSettings.theme === 'dark' ? 'Passer en Mode Clair' : 'Passer en Mode Sombre'}
          </button>
        </div>
      </div>

      {/* Backup and Bank Statement Import Management */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Données, Sauvegardes & Relevés Bancaires
          </h3>
          <span className="text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-lg">
            Multi-formats (JSON, Excel, PDF, Word)
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          LiquiMind fonctionne en mode local et sécurisé. Vous pouvez importer et lire directement vos relevés bancaires (Excel, PDF, Word, CSV) avec vérification avant enregistrement, exporter vos données avec sélection de période, ou remettre les compteurs à zéro.
        </p>

        {importStatus && (
          <div className="rounded-xl bg-brand/10 border border-brand/20 p-3 text-xs text-brand font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="h-4 w-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Drag and Drop Zone & Action Buttons */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed p-5 text-center transition ${
            isDragging
              ? 'border-brand bg-brand/10'
              : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2 text-neutral-500">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            <FileText className="h-5 w-5 text-blue-500" />
            <Upload className="h-5 w-5 text-brand" />
          </div>
          <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
            Glissez-déposez un relevé bancaire ou une sauvegarde ici
          </div>
          <div className="text-[11px] text-neutral-400">
            Formats acceptés : <strong>Excel (.xlsx, .xls)</strong>, <strong>PDF</strong>, <strong>Word (.doc)</strong>, <strong>CSV</strong> ou <strong>JSON</strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export Button (Opens scope & format selection modal) */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-98"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            <span>Exporter mes données (Excel, PDF, Word, JSON)</span>
          </button>

          {/* Native File Input Label for statements & JSON */}
          <label className="relative flex items-center gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-98 cursor-pointer">
            <Upload className="h-4 w-4 text-sky-500" />
            <span>Lire un relevé (Excel, PDF, Word, JSON)</span>
            <input
              type="file"
              accept=".json,.xlsx,.xls,.csv,.pdf,.doc,.docx,.txt,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>

          {/* Paste JSON Modal Button */}
          <button
            type="button"
            onClick={() => setIsPasteModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-98"
          >
            <FileText className="h-4 w-4 text-purple-400" />
            <span>Coller le texte JSON</span>
          </button>
        </div>

        {/* Reset Buttons Section */}
        <div className="border-t border-neutral-100 dark:border-neutral-800/60 pt-4 flex flex-wrap items-center gap-3">
          {/* Add Category Button */}
          <button
            type="button"
            onClick={() => openAddCategoryModal()}
            className="flex items-center gap-2 rounded-2xl btn-brand px-4 py-2.5 text-xs font-black shadow-sm transition active:scale-98 cursor-pointer"
          >
            <span>+ Ajouter / Gérer les catégories</span>
          </button>

          {/* Reset All to ZERO */}
          <button
            type="button"
            onClick={() => setShowResetZeroConfirm(true)}
            className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-98 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Remise à zéro des compteurs (0 DH)</span>
          </button>

          {/* Reset to Demo Data */}
          <button
            type="button"
            onClick={() => setShowResetDemoConfirm(true)}
            className="flex items-center gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-98 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recharger données de démo</span>
          </button>
        </div>

        {/* Confirmation prompt for Reset to Zero */}
        {showResetZeroConfirm && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 mt-3 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
              <AlertTriangle className="h-4 w-4" />
              <span>Réinitialisation financière totale</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Voulez-vous réinitialiser l'ensemble de votre contenu financier ? Tous les soldes de comptes passeront à <strong>0 DH</strong>, toutes les transactions, dettes/crédits bancaires, coordonnées des personnes, objectifs d'épargne, budgets d'enveloppes et catégories des sous-enveloppes de dépenses seront effacés.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmResetZero}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3.5 py-1.5 text-xs shadow-sm transition cursor-pointer"
              >
                Confirmer la réinitialisation totale (0 DH)
              </button>
              <button
                type="button"
                onClick={() => setShowResetZeroConfirm(false)}
                className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Confirmation prompt for Reset to Demo */}
        {showResetDemoConfirm && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-4 mt-3 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white text-xs font-bold">
              <RefreshCw className="h-4 w-4 text-brand" />
              <span>Recharger les données de démonstration</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Cette action rechargera les comptes et transactions types (Attijariwafa, CIH, loyer, école, épargne).
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmResetDemo}
                className="rounded-xl btn-brand px-3.5 py-1.5 text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Recharger la démo
              </button>
              <button
                type="button"
                onClick={() => setShowResetDemoConfirm(false)}
                className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Paste JSON Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                <span>Coller le contenu de sauvegarde JSON</span>
              </h3>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePasteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Collez le texte JSON de votre sauvegarde ci-dessous :
                </label>
                <textarea
                  required
                  rows={8}
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  placeholder='{"version": "2.4.0", "accounts": [...], "transactions": [...]}'
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(false)}
                  className="flex-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 py-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-brand text-brand py-2.5 text-xs font-black shadow-md shadow-black/10 active:scale-98 transition"
                >
                  Restaurer les données
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal & Version info */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-3 text-xs text-neutral-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300">
            <Shield className="h-4 w-4 text-brand" />
            <span>LiquiMind Web App</span>
          </div>
          <span className="font-mono text-[11px]">v3.0.0-liquimind</span>
        </div>
        <p>
          <strong>LiquiMind</strong> — Intelligence & Clarté Financière. Pilotage de liquidités, enveloppes budgétaires et vision temporelle dynamique.
        </p>
      </div>
    </div>
  );
};

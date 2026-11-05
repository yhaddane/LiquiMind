import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRightLeft, Sparkles, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { SpaceId } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';

export const AddTransactionModal: React.FC = () => {
  const {
    isAddTxModalOpen,
    setIsAddTxModalOpen,
    accounts,
    categories,
    activeSpaceId,
    addTransaction,
    transferBetweenAccounts,
    userSettings,
    addAccount,
    openAddCategoryModal,
  } = useApp();

  const { t } = useI18n();

  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(() => new Date().getDate());

  // Guarantee an active account exists
  useEffect(() => {
    if (isAddTxModalOpen) {
      if (accounts.length === 0) {
        addAccount({
          name: 'Compte principal',
          type: 'CHECKING',
          spaceId: 'personal',
          balance: 0,
          currency: userSettings.primaryCurrency || 'MAD',
          bankName: 'Banque',
        });
      } else {
        if (!selectedAccountId || !accounts.some((a) => a.id === selectedAccountId)) {
          setSelectedAccountId(accounts[0].id);
        }
        if (!targetAccountId || targetAccountId === selectedAccountId) {
          const other = accounts.find((a) => a.id !== accounts[0].id);
          setTargetAccountId(other?.id || accounts[0].id);
        }
      }
    }
  }, [isAddTxModalOpen, accounts, selectedAccountId, targetAccountId, addAccount, userSettings.primaryCurrency]);

  // Compute categories - always ensure non-empty
  const currentSpace: SpaceId =
    activeSpaceId === 'all'
      ? (accounts.find((a) => a.id === selectedAccountId)?.spaceId || 'personal')
      : activeSpaceId;

  let relevantCategories = categories.filter((c) => {
    if (c.isGroup) return false;
    if (c.spaceId !== currentSpace) return false;
    if (type === 'INCOME') return c.direction === 'IN';
    if (type === 'EXPENSE') return c.direction === 'OUT';
    return false;
  });

  // Fallback if currentSpace has no categories for this type
  if (relevantCategories.length === 0) {
    relevantCategories = categories.filter((c) => {
      if (c.isGroup) return false;
      if (type === 'INCOME') return c.direction === 'IN';
      if (type === 'EXPENSE') return c.direction === 'OUT';
      return false;
    });
  }

  // Pre-select category if current is not in relevant
  useEffect(() => {
    if (type !== 'TRANSFER' && relevantCategories.length > 0) {
      if (!selectedCategoryId || !relevantCategories.some((c) => c.id === selectedCategoryId)) {
        setSelectedCategoryId(relevantCategories[0].id);
      }
    }
  }, [type, relevantCategories, selectedCategoryId]);

  if (!isAddTxModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    const accId = selectedAccountId || accounts[0]?.id || 'acc_checking';

    if (type === 'TRANSFER') {
      const tgtId = targetAccountId || accounts.find((a) => a.id !== accId)?.id || accId;
      transferBetweenAccounts(
        accId,
        tgtId,
        val,
        description || 'Virement interne'
      );
    } else {
      const signedAmount = type === 'EXPENSE' ? -val : val;
      const cat = categories.find((c) => c.id === selectedCategoryId);
      const finalDesc = description.trim() || (cat ? cat.name : (type === 'EXPENSE' ? 'Dépense' : 'Revenu'));

      addTransaction({
        accountId: accId,
        categoryId: selectedCategoryId || null,
        spaceId: currentSpace,
        date,
        amount: signedAmount,
        currency: userSettings.primaryCurrency,
        description: finalDesc,
        isRecurring,
        recurringDay: isRecurring ? recurringDay : undefined,
      });
    }

    // Reset and close
    setAmountStr('');
    setDescription('');
    setIsRecurring(false);
    setIsAddTxModalOpen(false);
  };

  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  // Quick preset templates for one-tap operation filling
  const expensePresets = [
    { label: '🛒 Courses', amount: '350', desc: 'Courses supermarché', catHint: 'Courses' },
    { label: '☕ Café', amount: '25', desc: 'Café & pause', catHint: 'Café' },
    { label: '🍽️ Resto', amount: '140', desc: 'Restaurant', catHint: 'Restaurants' },
    { label: '⛽ Carburant', amount: '200', desc: 'Carburant station', catHint: 'Carburant' },
    { label: '🥖 Pain', amount: '20', desc: 'Boulangerie', catHint: 'Boulangerie' },
    { label: '🛵 Glovo', amount: '90', desc: 'Livraison repas', catHint: 'Livraison' },
  ];

  const incomePresets = [
    { label: '💼 Salaire', amount: '21000', desc: 'Virement de salaire', catHint: 'Salaire' },
    { label: '👨‍👩‍👧 Allocations', amount: '300', desc: 'Allocations familiales CNSS', catHint: 'Allocations' },
    { label: '🎁 Cadeau', amount: '500', desc: 'Cadeau reçu', catHint: 'Cadeaux' },
    { label: '💻 Facture Pro', amount: '4500', desc: 'Facture client', catHint: 'Factures' },
  ];

  const handleApplyPreset = (preset: { label: string; amount: string; desc: string; catHint: string }) => {
    setAmountStr(preset.amount);
    setDescription(preset.desc);
    const matched = categories.find((c) => c.name.toLowerCase().includes(preset.catHint.toLowerCase()));
    if (matched) setSelectedCategoryId(matched.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header with Type selector */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`px-3.5 py-1.5 rounded-lg transition font-extrabold ${
                type === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t('common.expenses') || 'Dépense'}
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`px-3.5 py-1.5 rounded-lg transition font-extrabold ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t('common.income') || 'Revenu'}
            </button>
            <button
              type="button"
              onClick={() => setType('TRANSFER')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 font-extrabold ${
                type === 'TRANSFER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ArrowRightLeft className="h-3 w-3 stroke-[2.5]" />
              <span>Virement</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddTxModalOpen(false)}
            className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Suggestions Row */}
        {type !== 'TRANSFER' && (
          <div className="pt-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 mb-1.5">
              <Sparkles className="h-3 w-3 text-brand" />
              <span>Saisie rapide en 1 clic :</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(type === 'EXPENSE' ? expensePresets : incomePresets).map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => handleApplyPreset(p)}
                  className="shrink-0 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 transition"
                >
                  {p.label} <span className="text-neutral-400">({p.amount} DH)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          {/* Big Amount Input */}
          <div className="flex flex-col items-center justify-center py-1">
            <div className="flex items-baseline gap-1">
              <span
                className={`text-3xl font-black ${
                  type === 'EXPENSE'
                    ? 'text-rose-500'
                    : type === 'INCOME'
                    ? 'text-emerald-500'
                    : 'text-blue-500'
                }`}
              >
                {type === 'EXPENSE' ? '-' : '+'}
              </span>
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0"
                required
                className="w-48 text-center text-4xl sm:text-5xl font-black bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-700 focus:outline-none"
              />
              <span className="text-lg font-bold text-neutral-400">
                {userSettings.primaryCurrency || 'DH'}
              </span>
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmountStr(String(q))}
                  className="rounded-lg bg-neutral-100 dark:bg-neutral-800/60 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  +{q}
                </button>
              ))}
            </div>
          </div>

          {/* Account Selector */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                {type === 'TRANSFER' ? 'Depuis le compte' : t('common.account') || 'Compte'}
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.balance.toLocaleString()} {a.currency})
                  </option>
                ))}
              </select>
            </div>

            {type === 'TRANSFER' ? (
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Vers le compte
                </label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  {accounts
                    .filter((a) => a.id !== selectedAccountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.balance.toLocaleString()} {a.currency})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  {t('common.date') || 'Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            )}
          </div>

          {/* Categories Grid (for Expense / Income) */}
          {type !== 'TRANSFER' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-neutral-500">
                  {t('common.category') || 'Catégorie'} ({relevantCategories.length})
                </label>
                <button
                  type="button"
                  onClick={() => openAddCategoryModal(type === 'EXPENSE' ? 'VARIABLE_EXPENSE' : undefined)}
                  className="flex items-center gap-1 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition px-2 py-0.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Plus className="h-3 w-3" />
                  <span>+ Créer une catégorie</span>
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 border border-neutral-200/70 dark:border-neutral-800/70 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30">
                {relevantCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition cursor-pointer ${
                        isSelected
                          ? 'btn-brand font-black shadow-xs ring-2 ring-neutral-400 dark:ring-neutral-500'
                          : 'bg-white dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/60'
                      }`}
                    >
                      <CategoryIcon icon={cat.icon} customLogoUrl={cat.customLogoUrl} size="sm" />
                      <span className="text-[10px] font-bold truncate max-w-full mt-0.5">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description / Merchant Name */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
              {t('common.note') || 'Libellé'} (ou nom du commerce / tiers)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : Marjane, Café, Salaire, Virement..."
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Recurring Toggle & Day of Month Selector */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="recurring-tx-toggle"
                className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer flex items-center gap-2"
              >
                <span>🔁</span>
                <span>Transaction récurrente chaque mois</span>
              </label>
              <input
                id="recurring-tx-toggle"
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded accent-lime-500 cursor-pointer"
              />
            </div>

            {isRecurring && (
              <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 animate-in fade-in duration-150">
                <span className="text-[11px] font-medium text-neutral-500">
                  Jour d'exécution du prélèvement :
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-400">Le</span>
                  <select
                    value={recurringDay}
                    onChange={(e) => setRecurringDay(parseInt(e.target.value, 10))}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day} {day === 1 ? 'er' : ''} du mois
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl btn-brand py-3 text-sm font-black shadow-lg shadow-black/10 active:scale-98 transition cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>{t('common.save') || 'Enregistrer la transaction'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Calendar,
  Pencil,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/finance';
import { Transaction } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    categories,
    accounts,
    deleteTransaction,
    updateTransaction,
    setIsAddTxModalOpen,
    userSettings,
    txTypeFilter,
    setTxTypeFilter,
    periodRange,
    isDateInActivePeriod,
    setIsExportModalOpen,
  } = useApp();

  const { t } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [filterByPeriod, setFilterByPeriod] = useState(true);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Edit form state
  const [editDesc, setEditDesc] = useState('');
  const [editAmountStr, setEditAmountStr] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAccountId, setEditAccountId] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter by period
      if (filterByPeriod && !isDateInActivePeriod(tx.date)) return false;

      // Filter by type
      if (txTypeFilter === 'EXPENSE' && (tx.amount >= 0 || tx.transferId)) return false;
      if (txTypeFilter === 'INCOME' && (tx.amount <= 0 || tx.transferId)) return false;
      if (txTypeFilter === 'TRANSFER' && !tx.transferId) return false;

      // Filter by account
      if (selectedAccountId !== 'ALL' && tx.accountId !== selectedAccountId) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = categories.find((c) => c.id === tx.categoryId);
        const matchesDesc = tx.description.toLowerCase().includes(q);
        const matchesCat = cat?.name.toLowerCase().includes(q);
        if (!matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [transactions, categories, txTypeFilter, selectedAccountId, searchQuery, filterByPeriod, isDateInActivePeriod]);

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditDesc(tx.description);
    setEditAmountStr(Math.abs(tx.amount).toString());
    setEditDate(tx.date);
    setEditCategoryId(tx.categoryId || '');
    setEditAccountId(tx.accountId);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editDesc.trim()) return;
    const absVal = parseFloat(editAmountStr);
    if (isNaN(absVal) || absVal <= 0) return;

    const isExpense = editingTx.amount < 0;
    const newAmount = isExpense ? -absVal : absVal;

    updateTransaction({
      ...editingTx,
      description: editDesc.trim(),
      amount: newAmount,
      date: editDate,
      categoryId: editCategoryId || undefined,
      accountId: editAccountId,
    });

    setEditingTx(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Transactions & Historique
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-neutral-400">
              {filteredTransactions.length} opération(s) affichée(s)
            </span>
            <span className="text-neutral-500">·</span>
            <button
              onClick={() => setFilterByPeriod(!filterByPeriod)}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${
                filterByPeriod
                  ? 'border-brand/40 bg-brand/10 text-brand'
                  : 'border-neutral-300 dark:border-neutral-700 text-neutral-400 hover:text-neutral-200'
              }`}
              title="Cliquer pour basculer entre la période active et tout l'historique"
            >
              {filterByPeriod ? `Période : ${periodRange.label}` : 'Tout l’historique'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 px-3.5 py-2 transition"
          >
            <span>Exporter</span>
          </button>
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl btn-brand px-4 py-2 text-xs font-black shadow-md shadow-black/10 active:scale-95 transition cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{t('dashboard.newTransaction') || 'Nouvelle transaction'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par libellé ou catégorie…"
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] pl-10 pr-4 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-lime-500"
          />
        </div>

        {/* Type Filter Buttons with High Contrast */}
        <div className="flex items-center gap-1 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 text-xs font-semibold self-stretch md:self-auto overflow-x-auto">
          <button
            onClick={() => setTxTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap font-extrabold ${
              txTypeFilter === 'ALL'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setTxTypeFilter('EXPENSE')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap font-extrabold ${
              txTypeFilter === 'EXPENSE'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Dépenses
          </button>
          <button
            onClick={() => setTxTypeFilter('INCOME')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap font-extrabold ${
              txTypeFilter === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Revenus
          </button>
          <button
            onClick={() => setTxTypeFilter('TRANSFER')}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap font-extrabold ${
              txTypeFilter === 'TRANSFER'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Virements
          </button>
        </div>

        {/* Account Filter */}
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none self-stretch md:self-auto"
        >
          <option value="ALL">Tous les comptes</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions List */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            Aucune transaction trouvée correspondant aux critères.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {filteredTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const acc = accounts.find((a) => a.id === tx.accountId);
              const isPositive = tx.amount > 0;
              const isTransfer = !!tx.transferId;

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-lg overflow-hidden">
                      {cat ? (
                        <CategoryIcon icon={cat.icon} customLogoUrl={cat.customLogoUrl} size="md" />
                      ) : (
                        <span>{isTransfer ? '🔄' : isPositive ? '📥' : '📤'}</span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <span>{tx.description}</span>
                        {tx.isRecurring && (
                          <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded-md px-1.5 py-0.2">
                            Récurrent
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span>{tx.date}</span>
                        <span>·</span>
                        <span>{acc?.name || 'Compte'}</span>
                        {cat && (
                          <>
                            <span>·</span>
                            <span>{cat.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`text-sm font-black font-mono ${
                        isTransfer
                          ? 'text-neutral-500'
                          : isPositive
                          ? 'text-emerald-500'
                          : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {userSettings.hideAmounts
                        ? '••••'
                        : `${isPositive ? '+' : ''}${formatCurrency(
                            tx.amount,
                            userSettings.primaryCurrency
                          )}`}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditModal(tx)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        title="Modifier cette transaction"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Supprimer la transaction"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Modifier la transaction
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Description / Libellé
                </label>
                <input
                  required
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Montant ({userSettings.primaryCurrency})
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={editAmountStr}
                    onChange={(e) => setEditAmountStr(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Date
                  </label>
                  <input
                    required
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Aucune</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Compte bancaire
                  </label>
                  <select
                    value={editAccountId}
                    onChange={(e) => setEditAccountId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 py-2.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

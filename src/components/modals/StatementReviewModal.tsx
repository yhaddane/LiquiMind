import React, { useState } from 'react';
import { X, Check, Trash2, Plus, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StagedTransaction } from '../../types';
import { formatCurrency } from '../../utils/finance';

export const StatementReviewModal: React.FC = () => {
  const {
    isStatementReviewOpen,
    setIsStatementReviewOpen,
    stagedTransactions,
    setStagedTransactions,
    confirmStagedImport,
    accounts,
    categories,
    userSettings,
  } = useApp();

  const [globalAccountId, setGlobalAccountId] = useState(accounts[0]?.id || 'acc_checking');

  if (!isStatementReviewOpen) return null;

  const handleUpdateRow = (id: string, updates: Partial<StagedTransaction>) => {
    setStagedTransactions((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
    );
  };

  const handleDeleteRow = (id: string) => {
    setStagedTransactions((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAddRow = () => {
    const newRow: StagedTransaction = {
      id: `staged_manual_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      description: 'Nouvelle opération relevé',
      amount: -100,
      categoryId: undefined,
      accountId: globalAccountId,
      sourceType: 'excel',
    };
    setStagedTransactions((prev) => [newRow, ...prev]);
  };

  const handleApplyAccountToAll = (accId: string) => {
    setGlobalAccountId(accId);
    setStagedTransactions((prev) => prev.map((r) => ({ ...r, accountId: accId })));
  };

  // Calculations
  const totalDebits = stagedTransactions
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const totalCredits = stagedTransactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);

  const netBalance = totalCredits - totalDebits;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/20 text-brand">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                Vérification & Correction du Relevé Bancaire
              </h3>
              <p className="text-xs text-neutral-400">
                Vérifiez, modifiez ou supprimez les opérations extraites avant validation définitive
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsStatementReviewOpen(false)}
            className="rounded-full p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Controls & Summary Banner */}
        <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-900/40 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">Compte de dépôt :</span>
              <select
                value={globalAccountId}
                onChange={(e) => handleApplyAccountToAll(e.target.value)}
                className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.balance.toLocaleString()} {a.currency})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddRow}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Ajouter une ligne</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-neutral-400">Total Débits : </span>
              <strong className="text-rose-500">
                -{formatCurrency(totalDebits, userSettings.primaryCurrency)}
              </strong>
            </div>
            <div>
              <span className="text-neutral-400">Total Crédits : </span>
              <strong className="text-emerald-500">
                +{formatCurrency(totalCredits, userSettings.primaryCurrency)}
              </strong>
            </div>
            <div>
              <span className="text-neutral-400">Net : </span>
              <strong className={netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance, userSettings.primaryCurrency)}
              </strong>
            </div>
          </div>
        </div>

        {/* Scrollable Operations Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {stagedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
              <AlertCircle className="h-10 w-10 text-neutral-500 mb-2" />
              <p className="text-sm font-bold">Aucune opération détectée dans ce fichier</p>
              <p className="text-xs mt-1">Vous pouvez ajouter des lignes manuellement ou essayer un autre fichier.</p>
              <button
                onClick={handleAddRow}
                className="mt-4 px-4 py-2 rounded-xl bg-brand text-brand text-xs font-bold"
              >
                + Ajouter une opération manuellement
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <span className="col-span-2">Date</span>
                <span className="col-span-2">Type & Montant</span>
                <span className="col-span-4">Libellé de l'opération</span>
                <span className="col-span-3">Catégorie suggérée</span>
                <span className="col-span-1 text-right">Action</span>
              </div>

              {stagedTransactions.map((tx) => {
                const isExpense = tx.amount < 0;
                const absAmount = Math.abs(tx.amount);

                return (
                  <div
                    key={tx.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2.5 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 items-center hover:border-neutral-300 dark:hover:border-neutral-700 transition"
                  >
                    {/* Date */}
                    <div className="col-span-2">
                      <input
                        type="date"
                        value={tx.date}
                        onChange={(e) => handleUpdateRow(tx.id, { date: e.target.value })}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 text-xs font-mono font-medium text-neutral-900 dark:text-white"
                      />
                    </div>

                    {/* Type & Amount */}
                    <div className="col-span-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateRow(tx.id, { amount: isExpense ? absAmount : -absAmount })}
                        className={`px-2 py-1.5 rounded-lg text-xs font-black transition ${
                          isExpense
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                        title="Basculer entre Dépense (-) et Revenu (+)"
                      >
                        {isExpense ? '-' : '+'}
                      </button>
                      <input
                        type="number"
                        step="any"
                        value={absAmount || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdateRow(tx.id, { amount: isExpense ? -val : val });
                        }}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 text-xs font-mono font-bold text-neutral-900 dark:text-white"
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={tx.description}
                        onChange={(e) => handleUpdateRow(tx.id, { description: e.target.value })}
                        placeholder="Libellé de l'opération"
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs text-neutral-900 dark:text-white"
                      />
                    </div>

                    {/* Category */}
                    <div className="col-span-3">
                      <select
                        value={tx.categoryId || ''}
                        onChange={(e) => handleUpdateRow(tx.id, { categoryId: e.target.value || undefined })}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-900 dark:text-white"
                      >
                        <option value="">Sélectionner catégorie</option>
                        {categories
                          .filter((c) => !c.isGroup)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.icon} {c.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Delete */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => handleDeleteRow(tx.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                        title="Supprimer cette ligne"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            <strong>{stagedTransactions.length}</strong> opération(s) prêtes à être importées dans{' '}
            <strong className="text-neutral-900 dark:text-white">
              {accounts.find((a) => a.id === globalAccountId)?.name || 'Compte courant'}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStatementReviewOpen(false)}
              className="px-4 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Annuler
            </button>
            <button
              disabled={stagedTransactions.length === 0}
              onClick={() => confirmStagedImport(stagedTransactions, globalAccountId)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand text-brand font-black text-xs shadow-md shadow-black/10 active:scale-95 transition disabled:opacity-50"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Confirmer et enregistrer ({stagedTransactions.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

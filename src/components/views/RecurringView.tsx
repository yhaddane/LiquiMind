import React, { useState } from 'react';
import {
  Repeat,
  Calendar,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  X,
  Power,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/finance';
import { RecurringItem } from '../../types';

export const RecurringView: React.FC = () => {
  const {
    recurring,
    categories,
    accounts,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleRecurringActive,
    userSettings,
  } = useApp();
  const { t } = useI18n();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);

  // New recurring item form
  const [label, setLabel] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [categoryId, setCategoryId] = useState(
    categories.find((c) => c.kind === 'FIXED_EXPENSE' || c.kind === 'VARIABLE_EXPENSE')?.id ||
      categories[0]?.id ||
      ''
  );
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  // Edit recurring item form
  const [editLabel, setEditLabel] = useState('');
  const [editAmountStr, setEditAmountStr] = useState('');
  const [editDayOfMonth, setEditDayOfMonth] = useState<number>(1);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAccountId, setEditAccountId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const activeRecurring = recurring.filter((r) => r.isActive !== false);
  const totalMonthlyLoad = activeRecurring.reduce((s, r) => s + r.amountHint, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountStr);
    if (!label.trim() || isNaN(val) || val <= 0) return;

    addRecurring({
      label: label.trim(),
      cadence: 'MONTHLY',
      dayOfMonth: Math.min(31, Math.max(1, dayOfMonth)),
      amountHint: val,
      categoryId: categoryId || categories[0]?.id || '',
      accountId: accountId || accounts[0]?.id || '',
      spaceId: 'personal',
      isActive: true,
    });

    setIsAddModalOpen(false);
    setLabel('');
    setAmountStr('');
    setDayOfMonth(1);
  };

  const openEditModal = (rec: RecurringItem) => {
    setEditingItem(rec);
    setEditLabel(rec.label);
    setEditAmountStr(rec.amountHint.toString());
    setEditDayOfMonth(rec.dayOfMonth);
    setEditCategoryId(rec.categoryId);
    setEditAccountId(rec.accountId);
    setEditIsActive(rec.isActive);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editLabel.trim()) return;
    const val = parseFloat(editAmountStr);
    if (isNaN(val) || val <= 0) return;

    updateRecurring({
      ...editingItem,
      label: editLabel.trim(),
      amountHint: val,
      dayOfMonth: Math.min(31, Math.max(1, editDayOfMonth)),
      categoryId: editCategoryId,
      accountId: editAccountId,
      isActive: editIsActive,
    });

    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Voulez-vous supprimer cette charge récurrente ?')) {
      deleteRecurring(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Charges récurrentes & Abonnements
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Vos engagements fixes prélevés automatiquement chaque mois ({activeRecurring.length} actifs)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 px-4 py-2 border border-neutral-200 dark:border-neutral-700">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              Charge mensuelle active
            </span>
            <span className="text-base font-black font-mono text-neutral-900 dark:text-white">
              {formatCurrency(totalMonthlyLoad, userSettings.primaryCurrency)} / mois
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] px-4 py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-95 transition"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Nouvelle charge</span>
          </button>
        </div>
      </div>

      {/* Recurring List */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] overflow-hidden">
        {recurring.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            Aucune charge récurrente configurée. Cliquez sur « Nouvelle charge » pour en ajouter.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {recurring.map((rec) => {
              const cat = categories.find((c) => c.id === rec.categoryId);
              const acc = accounts.find((a) => a.id === rec.accountId);
              const isItemActive = rec.isActive !== false;

              return (
                <div
                  key={rec.id}
                  className={`flex items-center justify-between p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition group ${
                    !isItemActive ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xl">
                      {cat?.icon || '🔁'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                          {rec.label}
                        </h3>
                        {!isItemActive && (
                          <span className="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 text-[9px] uppercase font-bold text-neutral-500">
                            En pause
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Prélèvement le {rec.dayOfMonth} du mois
                        </span>
                        <span>·</span>
                        <span>{acc?.name || 'Compte principal'}</span>
                        {cat && (
                          <>
                            <span>·</span>
                            <span>{cat.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-neutral-900 dark:text-white">
                        {formatCurrency(rec.amountHint, userSettings.primaryCurrency)}
                      </div>
                      <button
                        onClick={() => toggleRecurringActive(rec.id)}
                        className={`text-[10px] font-semibold flex items-center justify-end gap-1 hover:underline ${
                          isItemActive ? 'text-emerald-500' : 'text-neutral-400'
                        }`}
                        title={isItemActive ? 'Mettre en pause' : 'Réactiver'}
                      >
                        <Power className="h-3 w-3" />
                        {isItemActive ? 'Actif' : 'Désactivé'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditModal(rec)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        title="Modifier cette charge"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Supprimer cette charge"
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

      {/* Edit Recurring Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Modifier la charge récurrente
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Intitulé
                </label>
                <input
                  required
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
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
                    Jour de prélèvement
                  </label>
                  <select
                    value={editDayOfMonth}
                    onChange={(e) => setEditDayOfMonth(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Le {d} du mois
                      </option>
                    ))}
                  </select>
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded border-neutral-300 dark:border-neutral-700 text-lime-500 focus:ring-lime-500"
                />
                <label htmlFor="editIsActive" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  Prélèvement actif ce mois-ci
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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

      {/* Add Recurring Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Ajouter une charge récurrente
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Intitulé (Loyer, Netflix, Spotify, Facture REDAL...)
                </label>
                <input
                  required
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex : Loyer appartement Agdal"
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
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="Ex : 4500"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Jour de prélèvement
                  </label>
                  <select
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Le {d} du mois
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
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
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
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

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
              >
                Créer l'abonnement / charge
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

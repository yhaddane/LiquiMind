import React, { useState } from 'react';
import { Plus, Edit2, Check, AlertCircle, Trash2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { calculateBudgetProgress, formatCurrency } from '../../utils/finance';
import { CategoryIcon } from '../common/CategoryIcon';

export const PlanView: React.FC = () => {
  const {
    categories,
    budgets,
    transactions,
    selectedMonth,
    periodRange,
    activeSpaceId,
    userSettings,
    addBudget,
    openAddCategoryModal,
    deleteCategory,
    resetFixedBudgets,
    resetVariableBudgets,
    resetGroupBudgets,
    resetAllBudgets,
  } = useApp();

  const { t } = useI18n();

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editAmountStr, setEditAmountStr] = useState('');

  // Group categories by parent groups (Dépenses fixes, Dépenses variables)
  const currentSpace = activeSpaceId === 'all' ? 'personal' : activeSpaceId;
  const groups = categories.filter((c) => c.isGroup && c.spaceId === currentSpace);

  const getCategorySpent = (categoryId: string) => {
    return transactions
      .filter((tx) => tx.categoryId === categoryId && tx.date.startsWith(selectedMonth))
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  };

  const getCategoryBudget = (categoryId: string) => {
    const b = budgets.find((b) => b.categoryId === categoryId && b.month === selectedMonth);
    return b ? b.amount : 0;
  };

  const handleSaveBudget = (catId: string) => {
    const val = parseFloat(editAmountStr);
    if (!isNaN(val) && val >= 0) {
      addBudget(catId, val);
    }
    setEditingCatId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header with Title & Reset Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Plan budgétaire & Enveloppes
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Plafonds par catégorie pour <strong className="text-neutral-700 dark:text-neutral-200 font-semibold">{periodRange.label || selectedMonth}</strong>
          </p>
        </div>

        {/* Global Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openAddCategoryModal()}
            className="px-3.5 py-1.5 rounded-xl btn-brand text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>+ Ajouter une catégorie</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Remettre à 0 DH tous les budgets des dépenses fixes pour ce mois ?')) {
                resetFixedBudgets();
              }
            }}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 transition"
          >
            Mettre à 0 dépenses fixes
          </button>
          <button
            onClick={() => {
              if (window.confirm('Remettre à 0 DH tous les budgets des dépenses variables pour ce mois ?')) {
                resetVariableBudgets();
              }
            }}
            className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 transition"
          >
            Mettre à 0 dépenses variables
          </button>
          <button
            onClick={() => {
              if (window.confirm('Remettre tous les plafonds de ce plan à 0 DH ?')) {
                resetAllBudgets();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition"
          >
            Tout remettre à 0 DH
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-6">
        {groups.map((grp) => {
          const children = categories.filter((c) => c.parentId === grp.id);
          const totalGroupBudget = children.reduce((s, c) => s + getCategoryBudget(c.id), 0);
          const totalGroupSpent = children.reduce((s, c) => s + getCategorySpent(c.id), 0);
          const groupProgress = calculateBudgetProgress(totalGroupBudget, totalGroupSpent);

          return (
            <div
              key={grp.id}
              className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 sm:p-6 space-y-4 shadow-xs"
            >
              {/* Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{grp.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {grp.name}
                      </h3>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remettre à zéro l'enveloppe "${grp.name}" (0 DH) ?`)) {
                            resetGroupBudgets(grp.id);
                          }
                        }}
                        className="text-[10px] text-neutral-400 hover:text-rose-400 underline font-medium"
                        title="Remettre cette enveloppe à 0"
                      >
                        Mettre à 0 DH
                      </button>
                      <button
                        onClick={() => openAddCategoryModal(grp.kind === 'FIXED_EXPENSE' ? 'FIXED_EXPENSE' : 'VARIABLE_EXPENSE')}
                        className="flex items-center gap-1 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2 py-0.5 rounded-lg transition"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        <span>Ajouter</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {children.length} catégories sous cette enveloppe
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono text-xs">
                    <span className="text-neutral-400">Dépensé : </span>
                    <strong className="text-neutral-900 dark:text-white">
                      {formatCurrency(totalGroupSpent, userSettings.primaryCurrency)}
                    </strong>
                    <span className="text-neutral-400"> / </span>
                    <span className="text-neutral-500">
                      {formatCurrency(totalGroupBudget, userSettings.primaryCurrency)}
                    </span>
                  </div>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                      groupProgress.isOver
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-brand/20 text-brand'
                    }`}
                  >
                    {groupProgress.percentage}%
                  </span>
                </div>
              </div>

              {/* Children Envelopes Grid */}
              {/* Children Envelopes Grid */}
              {children.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center bg-neutral-50/40 dark:bg-neutral-900/20">
                  <Sparkles className="h-6 w-6 text-neutral-400 mb-2" />
                  <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Aucune catégorie sous cette enveloppe
                  </div>
                  <p className="text-[11px] text-neutral-500 max-w-sm mt-0.5 mb-3">
                    Choisissez parmi le catalogue de dépenses ou créez une catégorie sur mesure avec votre propre logo.
                  </p>
                  <button
                    onClick={() => openAddCategoryModal(grp.kind === 'FIXED_EXPENSE' ? 'FIXED_EXPENSE' : 'VARIABLE_EXPENSE')}
                    className="px-3.5 py-1.5 rounded-xl btn-brand text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Ajouter une catégorie</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {children.map((cat) => {
                    const budget = getCategoryBudget(cat.id);
                    const spent = getCategorySpent(cat.id);
                    const { percentage, remaining, isOver, statusColor } = calculateBudgetProgress(
                      budget,
                      spent
                    );

                    const isEditing = editingCatId === cat.id;

                    const barBg =
                      statusColor === 'red'
                        ? 'bg-rose-500'
                        : statusColor === 'amber'
                        ? 'bg-amber-400'
                        : 'bg-[#c4f24e]';

                    return (
                      <div
                        key={cat.id}
                        className="rounded-2xl border border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/60 dark:bg-neutral-900/40 p-3.5 space-y-2 hover:border-neutral-300 dark:hover:border-neutral-700 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <CategoryIcon icon={cat.icon} customLogoUrl={cat.customLogoUrl} size="sm" />
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                              {cat.name}
                            </span>
                          </div>

                          {/* Budget control & Delete */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editAmountStr}
                                  onChange={(e) => setEditAmountStr(e.target.value)}
                                  placeholder="0"
                                  className="w-20 rounded-lg border border-[#c4f24e] bg-white dark:bg-neutral-800 px-2 py-0.5 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditAmountStr((prev) => String((parseFloat(prev) || 0) + 500))}
                                  className="text-[10px] px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                                  title="+500 DH"
                                >
                                  +500
                                </button>
                                <button
                                  onClick={() => handleSaveBudget(cat.id)}
                                  className="rounded-lg btn-brand p-1 cursor-pointer"
                                  title="Valider"
                                >
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditAmountStr(String(budget));
                                }}
                                className="flex items-center gap-1 text-[11px] font-mono font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white group"
                                title="Modifier le plafond budgétaire"
                              >
                                <span>Plafond : {formatCurrency(budget, userSettings.primaryCurrency)}</span>
                                <Edit2 className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (window.confirm(`Supprimer la catégorie "${cat.name}" et son enveloppe ?`)) {
                                  deleteCategory(cat.id);
                                }
                              }}
                              className="text-neutral-400 hover:text-rose-500 p-1 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
                              title="Supprimer la catégorie"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Progress bar with dynamic color */}
                        <div className="space-y-1">
                          <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${barBg}`}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>
                        </div>

                        {/* Spent & Remaining text & status badge */}
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-400">
                              Dépensé :{' '}
                              <strong className="text-neutral-700 dark:text-neutral-300 font-mono">
                                {formatCurrency(spent, userSettings.primaryCurrency)}
                              </strong>
                            </span>
                            <span
                              className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                                isOver
                                  ? 'bg-rose-500/20 text-rose-500'
                                  : percentage >= 80
                                  ? 'bg-amber-500/20 text-amber-500'
                                  : 'bg-lime-500/20 text-lime-700 dark:text-[#c4f24e]'
                              }`}
                            >
                              {percentage}%
                            </span>
                          </div>

                          <span className={isOver ? 'text-rose-500 font-bold' : percentage >= 80 ? 'text-amber-500 font-semibold' : 'text-neutral-400'}>
                            {isOver
                              ? `+${formatCurrency(Math.abs(remaining), userSettings.primaryCurrency)} (Dépassement)`
                              : `Reste ${formatCurrency(remaining, userSettings.primaryCurrency)}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

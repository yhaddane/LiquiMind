import React, { useState } from 'react';
import { Target, Plus, Sparkles, Check, X, Calendar, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/finance';
import { Goal } from '../../types';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, updateGoalAllocation, userSettings } = useApp();
  const { t } = useI18n();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // New goal form state
  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [initialAllocStr, setInitialAllocStr] = useState('0');
  const [icon, setIcon] = useState('🎯');
  const [deadline, setDeadline] = useState('');

  // Edit goal form state
  const [editName, setEditName] = useState('');
  const [editTargetStr, setEditTargetStr] = useState('');
  const [editAllocStr, setEditAllocStr] = useState('');
  const [editIcon, setEditIcon] = useState('🎯');
  const [editDeadline, setEditDeadline] = useState('');

  const icons = ['🚨', '🏖️', '🐑', '🏡', '🚗', '💻', '💍', '🎓', '👶', '🕋', '🎯', '📱', '✈️'];

  const calculateMonthlySavingsRequired = (target: number, current: number, deadlineStr?: string) => {
    if (!deadlineStr) return null;
    const remaining = Math.max(0, target - current);
    if (remaining === 0) return { monthly: 0, months: 0 };
    const now = new Date();
    const d = new Date(deadlineStr);
    const diffMonths = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
    const months = Math.max(1, diffMonths);
    const monthly = Math.ceil(remaining / months);
    return { monthly, months };
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetAmountStr);
    const initialAlloc = parseFloat(initialAllocStr) || 0;
    if (!name.trim() || isNaN(val) || val <= 0) return;

    addGoal({
      spaceId: 'personal',
      name: name.trim(),
      icon,
      targetAmount: val,
      initialAllocation: initialAlloc,
      deadline: deadline || undefined,
      priority: 1,
    });

    setIsAddModalOpen(false);
    setName('');
    setTargetAmountStr('');
    setInitialAllocStr('0');
    setDeadline('');
  };

  const openEditModal = (g: Goal) => {
    setEditingGoal(g);
    setEditName(g.name);
    setEditTargetStr(String(g.targetAmount));
    setEditAllocStr(String(g.allocated));
    setEditIcon(g.icon);
    setEditDeadline(g.deadline || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    const target = parseFloat(editTargetStr);
    const alloc = parseFloat(editAllocStr);
    if (!editName.trim() || isNaN(target) || target <= 0 || isNaN(alloc) || alloc < 0) return;

    updateGoal({
      ...editingGoal,
      name: editName.trim(),
      icon: editIcon,
      targetAmount: target,
      allocated: alloc,
      deadline: editDeadline || undefined,
    });

    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
    setEditingGoal(null);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (!selectedGoalId || isNaN(val) || val <= 0) return;

    updateGoalAllocation(selectedGoalId, val);
    setSelectedGoalId(null);
    setDepositAmount('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Objectifs d'épargne
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Épargnez pas à pas pour vos projets, vacances et imprévus
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] px-4 py-2 text-xs font-black shadow-md shadow-lime-500/10 active:scale-95 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Nouvel objectif</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.allocated / g.targetAmount) * 100));
          const remaining = Math.max(0, g.targetAmount - g.allocated);
          const isComplete = pct >= 100;

          return (
            <div
              key={g.id}
              className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-4 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition relative group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-2xl">
                    {g.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {g.name}
                    </h3>
                    {g.deadline && (
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>Échéance : {g.deadline}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-xl px-2 py-1 text-xs font-mono font-bold ${
                      isComplete
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-lime-500/10 text-lime-700 dark:text-[#c4f24e]'
                    }`}
                  >
                    {pct}%
                  </span>
                  <button
                    onClick={() => openEditModal(g)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    title="Modifier l'objectif"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-lime-500 to-[#c4f24e] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {formatCurrency(g.allocated, userSettings.primaryCurrency)}
                  </span>
                  <span className="text-neutral-400">
                    sur {formatCurrency(g.targetAmount, userSettings.primaryCurrency)}
                  </span>
                </div>
              </div>

              {/* Monthly Savings Required Calculator Display */}
              {g.deadline && (() => {
                const req = calculateMonthlySavingsRequired(g.targetAmount, g.allocated, g.deadline);
                if (!req || req.monthly === 0) return null;
                return (
                  <div className="flex items-center gap-1.5 rounded-xl bg-[#c4f24e]/10 border border-[#c4f24e]/20 p-2 text-[11px] text-[#c4f24e] font-semibold">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Épargne requise : <strong>+{formatCurrency(req.monthly, userSettings.primaryCurrency)}/mois</strong> ({req.months} mois)
                    </span>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/60 pt-3">
                <span className="text-[11px] text-neutral-400">
                  {isComplete
                    ? '🎉 Objectif atteint !'
                    : `Reste ${formatCurrency(remaining, userSettings.primaryCurrency)}`}
                </span>

                <button
                  onClick={() => setSelectedGoalId(g.id)}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  + Épargner
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Nouvel objectif d'épargne
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
                  Icône
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {icons.map((ic) => (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center transition ${
                        icon === ic
                          ? 'bg-[#c4f24e] text-black shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Nom de l'objectif
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Voyage, Voiture, Apport..."
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Montant cible ({userSettings.primaryCurrency})
                  </label>
                  <input
                    required
                    type="number"
                    value={targetAmountStr}
                    onChange={(e) => setTargetAmountStr(e.target.value)}
                    placeholder="Ex : 20000"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Déjà alloué ({userSettings.primaryCurrency})
                  </label>
                  <input
                    type="number"
                    value={initialAllocStr}
                    onChange={(e) => setInitialAllocStr(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Date cible (optionnelle)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              {deadline && targetAmountStr && (() => {
                const target = parseFloat(targetAmountStr) || 0;
                const initial = parseFloat(initialAllocStr) || 0;
                const req = calculateMonthlySavingsRequired(target, initial, deadline);
                if (!req || req.monthly === 0) return null;
                return (
                  <div className="rounded-xl bg-[#c4f24e]/10 border border-[#c4f24e]/20 p-2.5 text-xs text-neutral-200">
                    <span className="font-bold text-[#c4f24e] block">Calculateur automatique d’épargne :</span>
                    Pour atteindre cet objectif d'ici {deadline} ({req.months} mois), vous devez épargner <strong className="text-white">+{formatCurrency(req.monthly, userSettings.primaryCurrency)} / mois</strong>.
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
              >
                Créer l'objectif
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Modifier l'objectif d'épargne
              </h3>
              <button
                onClick={() => setEditingGoal(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Icône
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {icons.map((ic) => (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setEditIcon(ic)}
                      className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center transition ${
                        editIcon === ic
                          ? 'bg-[#c4f24e] text-black shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Nom de l'objectif
                </label>
                <input
                  required
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Montant cible ({userSettings.primaryCurrency})
                  </label>
                  <input
                    required
                    type="number"
                    value={editTargetStr}
                    onChange={(e) => setEditTargetStr(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Montant actuel alloué ({userSettings.primaryCurrency})
                  </label>
                  <input
                    required
                    type="number"
                    value={editAllocStr}
                    onChange={(e) => setEditAllocStr(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Date cible (optionnelle)
                </label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
                >
                  Enregistrer les modifications
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteGoal(editingGoal.id)}
                  className="rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 p-2.5 transition"
                  title="Supprimer cet objectif"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {selectedGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Ajouter des fonds à l'objectif
              </h3>
              <button
                onClick={() => setSelectedGoalId(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Montant à ajouter ({userSettings.primaryCurrency})
                </label>
                <input
                  autoFocus
                  required
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Ex : 500"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
              >
                Valider l'épargne
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

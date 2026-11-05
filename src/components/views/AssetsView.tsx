import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Coins,
  TrendingUp,
  Home,
  X,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/finance';
import { Asset } from '../../types';

export const AssetsView: React.FC = () => {
  const { assets, accounts, addAsset, updateAsset, deleteAsset, userSettings } = useApp();
  const { t } = useI18n();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // New asset form
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'REAL_ESTATE' | 'GOLD' | 'STOCKS' | 'CRYPTO'>('REAL_ESTATE');
  const [valueStr, setValueStr] = useState('');
  const [notes, setNotes] = useState('');

  // Edit asset form
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<'REAL_ESTATE' | 'GOLD' | 'STOCKS' | 'CRYPTO'>('REAL_ESTATE');
  const [editValueStr, setEditValueStr] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const totalLiquid = accounts.reduce((s, a) => s + a.balance, 0);
  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const netWorth = totalLiquid + totalAssets;

  const getCategoryColor = (cat: 'REAL_ESTATE' | 'GOLD' | 'STOCKS' | 'CRYPTO') => {
    switch (cat) {
      case 'REAL_ESTATE':
        return '#b3dd62';
      case 'GOLD':
        return '#ddad71';
      case 'STOCKS':
        return '#6fa89a';
      case 'CRYPTO':
        return '#a78bfa';
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valueStr);
    if (!name.trim() || isNaN(val) || val <= 0) return;

    addAsset({
      name: name.trim(),
      category,
      value: val,
      currency: userSettings.primaryCurrency,
      color: getCategoryColor(category),
      notes: notes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setName('');
    setValueStr('');
    setNotes('');
  };

  const openEditModal = (ast: Asset) => {
    setEditingAsset(ast);
    setEditName(ast.name);
    setEditCategory((ast.category as any) || 'REAL_ESTATE');
    setEditValueStr(ast.value.toString());
    setEditNotes(ast.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !editName.trim()) return;
    const val = parseFloat(editValueStr);
    if (isNaN(val) || val <= 0) return;

    updateAsset({
      ...editingAsset,
      name: editName.trim(),
      category: editCategory,
      value: val,
      color: getCategoryColor(editCategory),
      notes: editNotes.trim() || undefined,
    });

    setEditingAsset(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Patrimoine & Actifs
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Vision globale de votre valeur nette : immobilier, or, bourse et liquidités
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] px-4 py-2 text-xs font-black shadow-md shadow-lime-500/10 active:scale-95 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Ajouter un actif</span>
        </button>
      </div>

      {/* Net Worth Hero Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900 to-black text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Patrimoine Net Total
            </div>
            <div className="mt-2 text-4xl sm:text-5xl font-black font-mono tracking-tight text-[#c4f24e]">
              {userSettings.hideAmounts
                ? '••••••••••'
                : formatCurrency(netWorth, userSettings.primaryCurrency)}
            </div>
            <div className="mt-2 text-xs text-neutral-400">
              Liquidités ({formatCurrency(totalLiquid, userSettings.primaryCurrency)}) + Actifs (
              {formatCurrency(totalAssets, userSettings.primaryCurrency)})
            </div>
          </div>

          {/* Asset Allocation Bar */}
          <div className="w-full md:w-72 space-y-2">
            <div className="text-[11px] font-semibold text-neutral-400">Répartition estimée</div>
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-neutral-800">
              <div
                title="Liquidités"
                className="bg-[#cfe8a0] h-full"
                style={{ width: `${Math.round((totalLiquid / (netWorth || 1)) * 100)}%` }}
              />
              {assets.map((ast) => (
                <div
                  key={ast.id}
                  title={ast.name}
                  className="h-full"
                  style={{
                    backgroundColor: ast.color,
                    width: `${Math.round((ast.value / (netWorth || 1)) * 100)}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Liquid Cash Box */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-600 dark:text-[#c4f24e]">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Liquidités & Épargne bancaire
                </h3>
                <span className="text-[11px] text-neutral-400">
                  {accounts.length} comptes synchronisés
                </span>
              </div>
            </div>
            <span className="rounded-lg bg-[#cfe8a0]/20 text-[#27401a] dark:text-[#c4f24e] font-bold text-[10px] px-2 py-0.5">
              Cash
            </span>
          </div>

          <div className="pt-2 text-2xl font-black font-mono text-neutral-900 dark:text-white">
            {userSettings.hideAmounts
              ? '••••••••'
              : formatCurrency(totalLiquid, userSettings.primaryCurrency)}
          </div>
        </div>

        {/* User Added Assets */}
        {assets.map((ast) => (
          <div
            key={ast.id}
            className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-3 relative group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-black font-black"
                  style={{ backgroundColor: ast.color }}
                >
                  {ast.category === 'REAL_ESTATE' ? (
                    <Home className="h-5 w-5" />
                  ) : ast.category === 'GOLD' ? (
                    <Coins className="h-5 w-5" />
                  ) : (
                    <TrendingUp className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {ast.name}
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    {ast.category === 'REAL_ESTATE'
                      ? 'Immobilier'
                      : ast.category === 'GOLD'
                      ? 'Or & Métaux'
                      : ast.category === 'CRYPTO'
                      ? 'Crypto-actifs'
                      : 'Bourse & Titres'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(ast)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title="Modifier cet actif"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteAsset(ast.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition opacity-0 group-hover:opacity-100"
                  title="Supprimer cet actif"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-2 text-2xl font-black font-mono text-neutral-900 dark:text-white">
              {userSettings.hideAmounts
                ? '••••••••'
                : formatCurrency(ast.value, ast.currency)}
            </div>

            {ast.notes && (
              <p className="text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/60 pt-2">
                {ast.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Modifier l'actif
              </h3>
              <button
                onClick={() => setEditingAsset(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Catégorie d'actif
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="REAL_ESTATE">Immobilier (Appartement, Villa, Terrain)</option>
                  <option value="GOLD">Or d’investissement & Métaux précieux</option>
                  <option value="STOCKS">Bourse, Actions & Titres</option>
                  <option value="CRYPTO">Crypto-actifs</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Désignation / Nom
                </label>
                <input
                  required
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Valeur estimée ({editingAsset.currency})
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={editValueStr}
                  onChange={(e) => setEditValueStr(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Notes / Détails (optionnel)
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ex : Surface, estimation bancaire..."
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
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

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Ajouter un élément au patrimoine
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Catégorie d'actif
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="REAL_ESTATE">Immobilier (Appartement, Villa, Terrain)</option>
                  <option value="GOLD">Or d’investissement & Métaux précieux</option>
                  <option value="STOCKS">Bourse, Actions & Titres</option>
                  <option value="CRYPTO">Crypto-actifs</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Désignation / Nom
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Appartement Agdal, 100g Or..."
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Valeur estimée ({userSettings.primaryCurrency})
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={valueStr}
                  onChange={(e) => setValueStr(e.target.value)}
                  placeholder="Ex : 850000"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Notes / Détails (optionnel)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex : Surface, estimation bancaire..."
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
              >
                Ajouter au patrimoine
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

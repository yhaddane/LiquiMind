import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  ArrowRightLeft,
  CreditCard,
  Landmark,
  X,
  Pencil,
  Trash2,
  TrendingUp,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/finance';
import { Account, AccountType, Transaction } from '../../types';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    transactions,
    categories,
    addAccount,
    updateAccount,
    deleteAccount,
    transferBetweenAccounts,
    updateTransaction,
    deleteTransaction,
    addTransaction,
    userSettings,
  } = useApp();
  const { t } = useI18n();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedAccountDetail, setSelectedAccountDetail] = useState<Account | null>(null);

  // New account form
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('CHECKING');
  const [balanceStr, setBalanceStr] = useState('');
  const [bankName, setBankName] = useState('');
  const [alertThresholdStr, setAlertThresholdStr] = useState('');

  // Transfer form
  const [fromId, setFromId] = useState(accounts[0]?.id || '');
  const [toId, setToId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [transferAmountStr, setTransferAmountStr] = useState('');
  const [transferNote, setTransferNote] = useState('');

  // Edit account form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<AccountType>('CHECKING');
  const [editBalanceStr, setEditBalanceStr] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editAlertThresholdStr, setEditAlertThresholdStr] = useState('');

  // Account Detail: Search and Transaction Editing
  const [detailSearchQuery, setDetailSearchQuery] = useState('');
  const [editingDetailTx, setEditingDetailTx] = useState<Transaction | null>(null);
  const [editTxDesc, setEditTxDesc] = useState('');
  const [editTxAmountStr, setEditTxAmountStr] = useState('');
  const [editTxDate, setEditTxDate] = useState('');
  const [editTxCategoryId, setEditTxCategoryId] = useState('');

  // Quick add transaction in account detail
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDesc, setQuickAddDesc] = useState('');
  const [quickAddAmountStr, setQuickAddAmountStr] = useState('');
  const [quickAddType, setQuickAddType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [quickAddCategoryId, setQuickAddCategoryId] = useState(categories[0]?.id || '');

  const openEditModal = (acc: Account, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditType(acc.type);
    setEditBalanceStr(acc.balance.toString());
    setEditBankName(acc.bankName || '');
    setEditAlertThresholdStr(acc.alertThreshold ? acc.alertThreshold.toString() : '');
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(balanceStr) || 0;
    const alertVal = alertThresholdStr ? parseFloat(alertThresholdStr) : undefined;
    if (!name.trim()) return;

    addAccount({
      name: name.trim(),
      type,
      spaceId: 'personal',
      balance: bal,
      currency: userSettings.primaryCurrency,
      bankName: bankName.trim() || undefined,
      alertThreshold: alertVal && !isNaN(alertVal) ? alertVal : undefined,
      color:
        type === 'SAVINGS'
          ? '#38bdf8'
          : type === 'CASH'
          ? '#fbbf24'
          : type === 'INVESTMENT'
          ? '#a78bfa'
          : '#c4f24e',
    });

    setIsAddModalOpen(false);
    setName('');
    setBalanceStr('');
    setBankName('');
    setAlertThresholdStr('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !editName.trim()) return;
    const bal = parseFloat(editBalanceStr);
    const alertVal = editAlertThresholdStr ? parseFloat(editAlertThresholdStr) : undefined;

    const updated = {
      ...editingAccount,
      name: editName.trim(),
      type: editType,
      balance: isNaN(bal) ? editingAccount.balance : bal,
      bankName: editBankName.trim() || undefined,
      alertThreshold: alertVal && !isNaN(alertVal) ? alertVal : undefined,
      color:
        editType === 'SAVINGS'
          ? '#38bdf8'
          : editType === 'CASH'
          ? '#fbbf24'
          : editType === 'INVESTMENT'
          ? '#a78bfa'
          : '#c4f24e',
    };

    updateAccount(updated);
    if (selectedAccountDetail?.id === updated.id) {
      setSelectedAccountDetail(updated);
    }
    setEditingAccount(null);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (accounts.length <= 1) {
      alert('Vous devez conserver au moins un compte bancaire actif.');
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      deleteAccount(id);
      if (selectedAccountDetail?.id === id) {
        setSelectedAccountDetail(null);
      }
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(transferAmountStr);
    if (!fromId || !toId || fromId === toId || isNaN(val) || val <= 0) return;

    transferBetweenAccounts(fromId, toId, val, transferNote);
    setIsTransferModalOpen(false);
    setTransferAmountStr('');
    setTransferNote('');
  };

  // Keep selectedAccountDetail updated with latest account balance
  const activeDetailAccount = useMemo(() => {
    if (!selectedAccountDetail) return null;
    return accounts.find((a) => a.id === selectedAccountDetail.id) || selectedAccountDetail;
  }, [accounts, selectedAccountDetail]);

  // Account-specific transactions
  const accountTransactions = useMemo(() => {
    if (!activeDetailAccount) return [];
    return transactions
      .filter((t) => t.accountId === activeDetailAccount.id)
      .filter((t) => {
        if (!detailSearchQuery.trim()) return true;
        const q = detailSearchQuery.toLowerCase();
        const cat = categories.find((c) => c.id === t.categoryId);
        return (
          t.description.toLowerCase().includes(q) ||
          (cat && cat.name.toLowerCase().includes(q))
        );
      });
  }, [transactions, activeDetailAccount, detailSearchQuery, categories]);

  // Total inflows and outflows for active account
  const accountStats = useMemo(() => {
    if (!activeDetailAccount) return { totalIn: 0, totalOut: 0 };
    const allForAcc = transactions.filter((t) => t.accountId === activeDetailAccount.id);
    let totalIn = 0;
    let totalOut = 0;
    for (const t of allForAcc) {
      if (t.amount > 0) totalIn += t.amount;
      else totalOut += Math.abs(t.amount);
    }
    return { totalIn, totalOut };
  }, [transactions, activeDetailAccount]);

  const openDetailTxEdit = (tx: Transaction) => {
    setEditingDetailTx(tx);
    setEditTxDesc(tx.description);
    setEditTxAmountStr(Math.abs(tx.amount).toString());
    setEditTxDate(tx.date);
    setEditTxCategoryId(tx.categoryId || '');
  };

  const handleSaveDetailTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDetailTx || !editTxDesc.trim()) return;
    const absVal = parseFloat(editTxAmountStr);
    if (isNaN(absVal) || absVal <= 0) return;

    const isExpense = editingDetailTx.amount < 0;
    const newAmount = isExpense ? -absVal : absVal;

    updateTransaction({
      ...editingDetailTx,
      description: editTxDesc.trim(),
      amount: newAmount,
      date: editTxDate,
      categoryId: editTxCategoryId || undefined,
    });

    setEditingDetailTx(null);
  };

  const handleQuickAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDetailAccount || !quickAddDesc.trim()) return;
    const absVal = parseFloat(quickAddAmountStr);
    if (isNaN(absVal) || absVal <= 0) return;

    const amount = quickAddType === 'EXPENSE' ? -absVal : absVal;
    addTransaction({
      accountId: activeDetailAccount.id,
      spaceId: activeDetailAccount.spaceId,
      date: new Date().toISOString().slice(0, 10),
      amount,
      currency: activeDetailAccount.currency,
      description: quickAddDesc.trim(),
      categoryId: quickAddCategoryId || undefined,
    });

    setIsQuickAddOpen(false);
    setQuickAddDesc('');
    setQuickAddAmountStr('');
  };

  const totalLiquid = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Comptes & Soldes
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Total des liquidités :{' '}
            <strong className="text-neutral-900 dark:text-white font-mono">
              {formatCurrency(totalLiquid, userSettings.primaryCurrency)}
            </strong>{' '}
            · Cliquez sur un compte pour afficher son détail et modifier ses opérations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] px-3.5 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Virement interne</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] px-4 py-2 text-xs font-black shadow-md shadow-lime-500/10 active:scale-95 transition"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Nouveau compte</span>
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccountDetail(acc)}
              role="button"
              tabIndex={0}
              className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-4 hover:border-lime-500/50 hover:shadow-lg transition cursor-pointer relative group text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-white group-hover:scale-105 transition">
                    {acc.type === 'CASH' ? (
                      <Wallet className="h-5 w-5 text-amber-500" />
                    ) : acc.type === 'SAVINGS' ? (
                      <Landmark className="h-5 w-5 text-sky-400" />
                    ) : acc.type === 'INVESTMENT' ? (
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-lime-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition">
                      {acc.name}
                    </h3>
                    <div className="text-[11px] text-neutral-400">
                      {acc.bankName || (acc.type === 'CASH' ? 'Espèces' : 'Compte bancaire')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => openEditModal(acc, e)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    title="Modifier ce compte"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {accounts.length > 1 && (
                    <button
                      onClick={(e) => handleDelete(acc.id, e)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition opacity-0 group-hover:opacity-100"
                      title="Supprimer ce compte"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <span className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] uppercase font-bold text-neutral-400 ml-1">
                    {acc.type}
                  </span>
                </div>
              </div>

              {/* Balance */}
              <div className="pt-2">
                <div className="text-[11px] text-neutral-400">Solde disponible</div>
                <div className="text-2xl font-black font-mono text-neutral-900 dark:text-white mt-0.5">
                  {userSettings.hideAmounts
                    ? '••••••••'
                    : formatCurrency(acc.balance, acc.currency)}
                </div>
              </div>

              {acc.alertThreshold && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-xl px-2.5 py-1">
                  Seuil d'alerte : {formatCurrency(acc.alertThreshold, acc.currency)}
                </div>
              )}

              {/* View detail trigger bar */}
              <div className="pt-1 flex items-center justify-between text-xs text-neutral-400 group-hover:text-lime-600 dark:group-hover:text-lime-400 font-semibold border-t border-neutral-100 dark:border-neutral-800/60 mt-2">
                <span>Afficher le relevé & opérations</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Detail Modal / Drawer */}
      {activeDetailAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-white">
                    {activeDetailAccount.type === 'CASH' ? (
                      <Wallet className="h-6 w-6 text-amber-500" />
                    ) : activeDetailAccount.type === 'SAVINGS' ? (
                      <Landmark className="h-6 w-6 text-sky-400" />
                    ) : activeDetailAccount.type === 'INVESTMENT' ? (
                      <TrendingUp className="h-6 w-6 text-purple-400" />
                    ) : (
                      <CreditCard className="h-6 w-6 text-lime-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-neutral-900 dark:text-white">
                        {activeDetailAccount.name}
                      </h3>
                      <span className="rounded-md bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 text-[10px] uppercase font-bold text-neutral-500">
                        {activeDetailAccount.type}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {activeDetailAccount.bankName || 'Établissement bancaire'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(activeDetailAccount)}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => setSelectedAccountDetail(null)}
                    className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
                <div className="rounded-2xl bg-white dark:bg-[#1c1c1f] p-3 border border-neutral-200/80 dark:border-neutral-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Solde disponible
                  </span>
                  <span className="text-xl font-black font-mono text-neutral-900 dark:text-white mt-0.5 block">
                    {userSettings.hideAmounts
                      ? '••••••••'
                      : formatCurrency(activeDetailAccount.balance, activeDetailAccount.currency)}
                  </span>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#1c1c1f] p-3 border border-neutral-200/80 dark:border-neutral-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                    <span>Total entrées</span>
                    <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                  </span>
                  <span className="text-base font-black font-mono text-emerald-500 mt-0.5 block">
                    +{formatCurrency(accountStats.totalIn, activeDetailAccount.currency)}
                  </span>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#1c1c1f] p-3 border border-neutral-200/80 dark:border-neutral-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                    <span>Total sorties</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-rose-500" />
                  </span>
                  <span className="text-base font-black font-mono text-rose-500 mt-0.5 block">
                    -{formatCurrency(accountStats.totalOut, activeDetailAccount.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Search Bar */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={detailSearchQuery}
                  onChange={(e) => setDetailSearchQuery(e.target.value)}
                  placeholder="Rechercher une opération…"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 pl-9 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                className="flex items-center gap-1.5 rounded-xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] px-3.5 py-1.5 text-xs font-black self-stretch sm:self-auto justify-center transition"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Nouvelle opération sur ce compte</span>
              </button>
            </div>

            {/* Quick Add Form if opened */}
            {isQuickAddOpen && (
              <form onSubmit={handleQuickAddTx} className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800/80 space-y-3 animate-in fade-in">
                <div className="text-xs font-bold text-neutral-900 dark:text-white">
                  Ajouter une opération directe sur {activeDetailAccount.name}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="flex rounded-xl bg-neutral-200 dark:bg-neutral-800 p-0.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setQuickAddType('EXPENSE')}
                      className={`flex-1 py-1 rounded-lg transition ${
                        quickAddType === 'EXPENSE' ? 'bg-rose-500 text-white' : 'text-neutral-500'
                      }`}
                    >
                      Dépense
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickAddType('INCOME')}
                      className={`flex-1 py-1 rounded-lg transition ${
                        quickAddType === 'INCOME' ? 'bg-emerald-500 text-white' : 'text-neutral-500'
                      }`}
                    >
                      Revenu
                    </button>
                  </div>

                  <input
                    required
                    type="text"
                    value={quickAddDesc}
                    onChange={(e) => setQuickAddDesc(e.target.value)}
                    placeholder="Libellé / Motif"
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />

                  <input
                    required
                    type="number"
                    step="any"
                    value={quickAddAmountStr}
                    onChange={(e) => setQuickAddAmountStr(e.target.value)}
                    placeholder={`Montant (${activeDetailAccount.currency})`}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] px-3 py-1.5 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none"
                  />

                  <select
                    value={quickAddCategoryId}
                    onChange={(e) => setQuickAddCategoryId(e.target.value)}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#c4f24e] text-[#101011] text-xs font-black shadow-xs"
                  >
                    Valider l'opération
                  </button>
                </div>
              </form>
            )}

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Historique des opérations ({accountTransactions.length})
              </div>

              {accountTransactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400">
                  Aucune opération enregistrée pour ce compte.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/30 dark:bg-neutral-900/30 overflow-hidden">
                  {accountTransactions.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    const isPositive = tx.amount > 0;
                    const isTransfer = !!tx.transferId;

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/50 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-neutral-800 shadow-xs text-base">
                            {cat?.icon || (isTransfer ? '🔄' : isPositive ? '📥' : '📤')}
                          </div>

                          <div>
                            <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                              <span>{tx.description}</span>
                              {tx.isRecurring && (
                                <span className="text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-500 rounded px-1">
                                  Récurrent
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                              <span>{tx.date}</span>
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
                          <span
                            className={`text-xs font-black font-mono ${
                              isTransfer
                                ? 'text-neutral-500'
                                : isPositive
                                ? 'text-emerald-500'
                                : 'text-neutral-900 dark:text-white'
                            }`}
                          >
                            {isPositive && '+'}
                            {formatCurrency(tx.amount, activeDetailAccount.currency)}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openDetailTxEdit(tx)}
                              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                              title="Modifier cette opération"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition opacity-0 group-hover:opacity-100"
                              title="Supprimer cette opération"
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
          </div>
        </div>
      )}

      {/* Edit Detail Transaction Modal */}
      {editingDetailTx && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Modifier l'opération
              </h3>
              <button
                onClick={() => setEditingDetailTx(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDetailTx} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Description / Libellé
                </label>
                <input
                  required
                  type="text"
                  value={editTxDesc}
                  onChange={(e) => setEditTxDesc(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Montant ({activeDetailAccount?.currency || userSettings.primaryCurrency})
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={editTxAmountStr}
                    onChange={(e) => setEditTxAmountStr(e.target.value)}
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
                    value={editTxDate}
                    onChange={(e) => setEditTxDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Catégorie
                </label>
                <select
                  value={editTxCategoryId}
                  onChange={(e) => setEditTxCategoryId(e.target.value)}
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

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDetailTx(null)}
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

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Virement entre mes comptes
              </h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Compte source
                  </label>
                  <select
                    value={fromId}
                    onChange={(e) => setFromId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.balance.toLocaleString()} {a.currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Compte destination
                  </label>
                  <select
                    value={toId}
                    onChange={(e) => setToId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
                    {accounts
                      .filter((a) => a.id !== fromId)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.balance.toLocaleString()} {a.currency})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Montant ({userSettings.primaryCurrency})
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={transferAmountStr}
                  onChange={(e) => setTransferAmountStr(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Note (optionnelle)
                </label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Ex : Virement épargne mensuel"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
              >
                Effectuer le virement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Modifier le compte
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Nom du compte
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
                    Type de compte
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as AccountType)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="CHECKING">Courant</option>
                    <option value="SAVINGS">Épargne</option>
                    <option value="CASH">Espèces</option>
                    <option value="INVESTMENT">Investissement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Établissement bancaire
                  </label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    placeholder="Ex : Attijariwafa, CIH..."
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Solde actuel ({editingAccount.currency})
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={editBalanceStr}
                  onChange={(e) => setEditBalanceStr(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Permet d'ajuster directement le solde sans créer de transaction
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Seuil d'alerte ({editingAccount.currency}, optionnel)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editAlertThresholdStr}
                  onChange={(e) => setEditAlertThresholdStr(e.target.value)}
                  placeholder="Ex : 1000"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
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

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Ajouter un compte
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Nom du compte
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Compte joint, Livret A..."
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Type de compte
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="CHECKING">Courant</option>
                    <option value="SAVINGS">Épargne</option>
                    <option value="CASH">Espèces</option>
                    <option value="INVESTMENT">Investissement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Banque (optionnel)
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ex : Attijari, CIH..."
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Solde initial ({userSettings.primaryCurrency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={balanceStr}
                  onChange={(e) => setBalanceStr(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Seuil d'alerte ({userSettings.primaryCurrency}, optionnel)
                </label>
                <input
                  type="number"
                  step="any"
                  value={alertThresholdStr}
                  onChange={(e) => setAlertThresholdStr(e.target.value)}
                  placeholder="Ex : 500"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
              >
                Créer le compte
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo, useRef } from 'react';
import {
  HandCoins,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Landmark,
  Calendar,
  Percent,
  FileSpreadsheet,
  UploadCloud,
  ListOrdered,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/finance';
import { DebtLedgerItem, Counterparty, AmortizationRow } from '../../types';
import { parseAmortizationFile } from '../../utils/statementParser';

export const DebtsView: React.FC = () => {
  const {
    counterparties,
    debtLedger,
    accounts,
    addDebt,
    updateDebt,
    deleteDebt,
    repayDebt,
    userSettings,
  } = useApp();

  const { t } = useI18n();

  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'RECEIVABLE' | 'PAYABLE' | 'BANK'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    item: DebtLedgerItem;
    cp?: Counterparty;
  } | null>(null);

  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [selectedCpId, setSelectedCpId] = useState<string>('');
  const [repayAmountStr, setRepayAmountStr] = useState('');
  const [repayAccountId, setRepayAccountId] = useState(accounts[0]?.id || '');

  // Add Debt state
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newType, setNewType] = useState<'CREDIT_GIVEN' | 'LOAN_RECEIVED' | 'BANK_LOAN'>('CREDIT_GIVEN');
  const [newAmountStr, setNewAmountStr] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBankName, setNewBankName] = useState('Attijariwafa Bank');
  const [newMonthlyPayment, setNewMonthlyPayment] = useState('');
  const [newInterestRate, setNewInterestRate] = useState('');
  const [newRemainingCapital, setNewRemainingCapital] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  // Edit Debt state
  const [editDesc, setEditDesc] = useState('');
  const [editAmountStr, setEditAmountStr] = useState('');
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState<'CREDIT_GIVEN' | 'LOAN_RECEIVED' | 'BANK_LOAN' | 'CREDIT_REPAID' | 'LOAN_REPAID'>('CREDIT_GIVEN');
  const [editBankName, setEditBankName] = useState('');
  const [editMonthlyPayment, setEditMonthlyPayment] = useState('');
  const [editInterestRate, setEditInterestRate] = useState('');
  const [editRemainingCapital, setEditRemainingCapital] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  // Amortization Schedule viewer & uploader
  const [viewScheduleLoan, setViewScheduleLoan] = useState<DebtLedgerItem | null>(null);
  const [importedSchedule, setImportedSchedule] = useState<AmortizationRow[] | undefined>(undefined);
  const [importedFileName, setImportedFileName] = useState('');
  const [isUploadingSchedule, setIsUploadingSchedule] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetLoanId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSchedule(true);
    try {
      const parsed = await parseAmortizationFile(file);
      if (targetLoanId) {
        updateDebt(targetLoanId, {
          amortizationSchedule: parsed.rows,
          scheduleFileName: file.name,
          monthlyPayment: parsed.summary.monthlyPayment,
          remainingCapital: parsed.summary.remainingCapital,
          endDate: parsed.summary.endDate,
        });
      } else {
        setNewMonthlyPayment(String(parsed.summary.monthlyPayment));
        setNewRemainingCapital(String(parsed.summary.remainingCapital));
        setNewAmountStr(String(parsed.summary.initialCapital));
        setNewEndDate(parsed.summary.endDate);
        setImportedSchedule(parsed.rows);
        setImportedFileName(file.name);
      }
    } catch (err) {
      console.error('Error parsing amortization schedule:', err);
    } finally {
      setIsUploadingSchedule(false);
      if (e.target) e.target.value = '';
    }
  };

  // Summaries per contact for peer-to-peer debts
  const cpSummaries = useMemo(() => {
    return counterparties
      .filter((cp) => cp.kind !== 'BANK')
      .map((cp) => {
        const items = debtLedger.filter((d) => d.counterpartyId === cp.id);
        let net = 0; // positive = they owe me, negative = I owe them
        for (const it of items) {
          if (it.type === 'CREDIT_GIVEN') net += it.amount;
          if (it.type === 'CREDIT_REPAID') net -= it.amount;
          if (it.type === 'LOAN_RECEIVED') net -= it.amount;
          if (it.type === 'LOAN_REPAID') net += it.amount;
        }
        return {
          cp,
          net,
          history: items.sort((a, b) => b.date.localeCompare(a.date)),
        };
      });
  }, [counterparties, debtLedger]);

  // Bank loans list
  const bankLoans = useMemo(() => {
    return debtLedger.filter((d) => d.type === 'BANK_LOAN');
  }, [debtLedger]);

  const theyOweMe = cpSummaries.filter((s) => s.net > 0);
  const iOweThem = cpSummaries.filter((s) => s.net < 0);

  const totalReceivable = theyOweMe.reduce((s, it) => s + it.net, 0);
  const totalPayablePersonal = iOweThem.reduce((s, it) => s + Math.abs(it.net), 0);
  const totalBankDebt = bankLoans.reduce((s, it) => s + (it.remainingCapital ?? it.amount), 0);
  const totalMonthlyBankPayments = bankLoans.reduce((s, it) => s + (it.monthlyPayment ?? 0), 0);

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newAmountStr);
    const counterpartyTitle = newType === 'BANK_LOAN' ? (newBankName || 'Banque') : newName.trim();
    if (!counterpartyTitle || isNaN(amount) || amount <= 0) return;

    addDebt({
      counterpartyName: counterpartyTitle,
      type: newType,
      amount,
      description: newDesc || (newType === 'BANK_LOAN' ? 'Crédit bancaire' : 'Prêt / Dette'),
      contact: newContact.trim() || undefined,
      bankName: newType === 'BANK_LOAN' ? newBankName : undefined,
      monthlyPayment: newMonthlyPayment ? parseFloat(newMonthlyPayment) : undefined,
      interestRate: newInterestRate ? parseFloat(newInterestRate) : undefined,
      remainingCapital: newRemainingCapital ? parseFloat(newRemainingCapital) : amount,
      endDate: newEndDate || undefined,
      amortizationSchedule: importedSchedule,
      scheduleFileName: importedFileName || undefined,
    });

    setIsAddModalOpen(false);
    setImportedSchedule(undefined);
    setImportedFileName('');
    setNewName('');
    setNewContact('');
    setNewAmountStr('');
    setNewDesc('');
    setNewMonthlyPayment('');
    setNewInterestRate('');
    setNewRemainingCapital('');
    setNewEndDate('');
  };

  const openEditModal = (item: DebtLedgerItem) => {
    const cp = counterparties.find((c) => c.id === item.counterpartyId);
    setEditingItem({ item, cp });
    setEditDesc(item.description);
    setEditAmountStr(String(item.amount));
    setEditName(cp?.name || '');
    setEditContact(cp?.contact || '');
    setEditDate(item.date);
    setEditType(item.type);
    setEditBankName(item.bankName || cp?.name || '');
    setEditMonthlyPayment(item.monthlyPayment ? String(item.monthlyPayment) : '');
    setEditInterestRate(item.interestRate ? String(item.interestRate) : '');
    setEditRemainingCapital(item.remainingCapital ? String(item.remainingCapital) : String(item.amount));
    setEditEndDate(item.endDate || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const amount = parseFloat(editAmountStr);
    if (isNaN(amount) || amount <= 0) return;

    const isBank = editingItem.item.type === 'BANK_LOAN';

    updateDebt(
      editingItem.item.id,
      {
        description: editDesc,
        amount,
        date: editDate,
        type: editType,
        bankName: isBank ? editBankName : undefined,
        monthlyPayment: editMonthlyPayment ? parseFloat(editMonthlyPayment) : undefined,
        interestRate: editInterestRate ? parseFloat(editInterestRate) : undefined,
        remainingCapital: editRemainingCapital ? parseFloat(editRemainingCapital) : amount,
        endDate: editEndDate || undefined,
      },
      isBank ? editBankName : editName,
      editContact
    );

    setEditingItem(null);
  };

  const handleDeleteDebt = (id: string) => {
    deleteDebt(id);
    setEditingItem(null);
  };

  const handleRepay = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(repayAmountStr);
    if (!selectedCpId || isNaN(amount) || amount <= 0) return;

    repayDebt(selectedCpId, amount, repayAccountId, 'Remboursement');
    setIsRepayModalOpen(false);
    setRepayAmountStr('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Dettes, Créances & Crédits bancaires
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Suivi des prêts entre proches et des emprunts bancaires amortissables
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] px-4 py-2 text-xs font-black shadow-md shadow-lime-500/10 active:scale-95 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Ajouter prêt ou crédit</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* On vous doit */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold">Ils vous doivent (Créances)</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(totalReceivable, userSettings.primaryCurrency)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            {theyOweMe.length} proche(s) à rembourser
          </div>
        </div>

        {/* Dettes proches */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold">Dettes proches</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-500 font-mono">
            {formatCurrency(totalPayablePersonal, userSettings.primaryCurrency)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            {iOweThem.length} dette(s) personnelle(s)
          </div>
        </div>

        {/* Crédits Bancaires */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold">Crédits bancaires (Restant)</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-500 font-mono">
            {formatCurrency(totalBankDebt, userSettings.primaryCurrency)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400">
            Mensualités cumulées : <strong>{formatCurrency(totalMonthlyBankPayments, userSettings.primaryCurrency)}/mois</strong>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('ALL')}
          className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
            activeSubTab === 'ALL'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Tous ({cpSummaries.length + bankLoans.length})
        </button>
        <button
          onClick={() => setActiveSubTab('RECEIVABLE')}
          className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
            activeSubTab === 'RECEIVABLE'
              ? 'bg-white dark:bg-neutral-800 text-emerald-500 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Créances ({theyOweMe.length})
        </button>
        <button
          onClick={() => setActiveSubTab('PAYABLE')}
          className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
            activeSubTab === 'PAYABLE'
              ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Dettes proches ({iOweThem.length})
        </button>
        <button
          onClick={() => setActiveSubTab('BANK')}
          className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'BANK'
              ? 'bg-white dark:bg-neutral-800 text-rose-500 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Landmark className="h-3.5 w-3.5" />
          <span>Crédits bancaires ({bankLoans.length})</span>
        </button>
      </div>

      {/* Bank Loans Section */}
      {(activeSubTab === 'ALL' || activeSubTab === 'BANK') && bankLoans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Crédits & Emprunts bancaires
              </h3>
            </div>
            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-semibold transition">
              <UploadCloud className="h-3.5 w-3.5 text-[#c4f24e]" />
              <span>{isUploadingSchedule ? 'Extraction en cours...' : 'Importer tableau d’amortissement'}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.pdf,.txt"
                className="hidden"
                onChange={(e) => handleFileUpload(e)}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankLoans.map((loan) => {
              const initial = loan.amount || 1;
              const remaining = loan.remainingCapital ?? loan.amount;
              const repaid = Math.max(0, initial - remaining);
              const repaidPct = Math.min(100, Math.max(0, Math.round((repaid / initial) * 100)));
              const hasSchedule = loan.amortizationSchedule && loan.amortizationSchedule.length > 0;

              return (
                <div
                  key={loan.id}
                  className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition relative group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 font-bold">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                          {loan.description}
                        </h4>
                        <div className="text-[11px] text-neutral-400">
                          {loan.bankName || 'Banque partenaire'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-rose-500/10 text-rose-500 font-bold text-[10px] px-2 py-0.5 uppercase">
                        Prêt Bancaire
                      </span>
                      <button
                        onClick={() => openEditModal(loan)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        title="Modifier le crédit bancaire"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amortization Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-neutral-400 font-medium">
                      <span>Progression du remboursement</span>
                      <span className="font-bold text-emerald-400">{repaidPct}% remboursé</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#c4f24e] transition-all duration-500"
                        style={{ width: `${repaidPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-500">
                      <span>Amorti : {formatCurrency(repaid, userSettings.primaryCurrency)}</span>
                      <span>Initial : {formatCurrency(initial, userSettings.primaryCurrency)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Capital restant dû</span>
                      <span className="font-mono text-base font-black text-rose-500">
                        {formatCurrency(remaining, userSettings.primaryCurrency)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 block">Mensualité</span>
                      <span className="font-mono text-base font-bold text-neutral-800 dark:text-neutral-200">
                        {loan.monthlyPayment ? formatCurrency(loan.monthlyPayment, userSettings.primaryCurrency) : '—'} /mois
                      </span>
                    </div>

                    {loan.interestRate && (
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Percent className="h-3 w-3" />
                        <span>Taux fixe : {loan.interestRate}%</span>
                      </div>
                    )}

                    {loan.endDate && (
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Calendar className="h-3 w-3" />
                        <span>Fin : {loan.endDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Schedule Actions */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewScheduleLoan(loan)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <ListOrdered className="h-3.5 w-3.5 text-[#c4f24e]" />
                      <span>
                        {hasSchedule
                          ? `Consulter l'échéancier (${loan.amortizationSchedule!.length} mensualités)`
                          : `Générer / Voir l'échéancier`}
                      </span>
                    </button>

                    <label className="cursor-pointer p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition" title="Mettre à jour via un fichier Excel ou CSV">
                      <FileSpreadsheet className="h-4 w-4" />
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, loan.id)}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Peer-to-peer Debts List */}
      {(activeSubTab === 'ALL' || activeSubTab === 'RECEIVABLE' || activeSubTab === 'PAYABLE') && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Prêts personnels (Amis & Proches)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cpSummaries
              .filter(({ net }) => {
                if (activeSubTab === 'RECEIVABLE') return net > 0;
                if (activeSubTab === 'PAYABLE') return net < 0;
                return true;
              })
              .map(({ cp, net, history }) => {
                const isReceivable = net > 0;
                const isPayable = net < 0;
                const isZero = net === 0;

                return (
                  <div
                    key={cp.id}
                    className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold">
                          {cp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                            {cp.name}
                          </h4>
                          {cp.contact && (
                            <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5">
                              <Phone className="h-3 w-3" />
                              <span>{cp.contact}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div
                            className={`text-base font-black font-mono ${
                              isReceivable
                                ? 'text-emerald-500'
                                : isPayable
                                ? 'text-rose-500'
                                : 'text-neutral-400'
                            }`}
                          >
                            {isReceivable && '+'}
                            {formatCurrency(net, userSettings.primaryCurrency)}
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            {isReceivable
                              ? 'Doit vous rembourser'
                              : isPayable
                              ? 'À lui rembourser'
                              : 'Soldé ✓'}
                          </span>
                        </div>
                        {history[0] && (
                          <button
                            onClick={() => openEditModal(history[0])}
                            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                            title="Modifier cette dette / contact"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isZero && (
                      <button
                        onClick={() => {
                          setSelectedCpId(cp.id);
                          setRepayAmountStr(String(Math.abs(net)));
                          setIsRepayModalOpen(true);
                        }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 py-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-lime-500" />
                        <span>Enregistrer un remboursement</span>
                      </button>
                    )}

                    {/* History */}
                    <div className="border-t border-neutral-100 dark:border-neutral-800/60 pt-3 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Opérations enregistrées ({history.length})
                      </div>
                      {history.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between text-[11px] text-neutral-500 group/row"
                        >
                          <span>
                            {it.date} · {it.description}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
                              {formatCurrency(it.amount, userSettings.primaryCurrency)}
                            </span>
                            <button
                              onClick={() => openEditModal(it)}
                              className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                              title="Modifier cette opération"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add Debt / Bank Loan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Ajouter un prêt, dette ou crédit bancaire
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="mt-4 space-y-4">
              {/* Type Switcher */}
              <div className="flex p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setNewType('CREDIT_GIVEN')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    newType === 'CREDIT_GIVEN'
                      ? 'bg-emerald-500 text-white'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  J'ai prêté
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('LOAN_RECEIVED')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    newType === 'LOAN_RECEIVED'
                      ? 'bg-amber-500 text-white'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Je dois
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('BANK_LOAN')}
                  className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                    newType === 'BANK_LOAN'
                      ? 'bg-rose-500 text-white'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Landmark className="h-3 w-3" />
                  <span>Crédit Banque</span>
                </button>
              </div>

              {newType === 'BANK_LOAN' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Banque prêteuse
                    </label>
                    <input
                      required
                      type="text"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      placeholder="Ex : Attijariwafa Bank, CIH, BMCE..."
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Intitulé du crédit
                    </label>
                    <input
                      required
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Ex : Crédit immobilier appartement, Prêt auto..."
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Capital initial ({userSettings.primaryCurrency})
                      </label>
                      <input
                        required
                        type="number"
                        value={newAmountStr}
                        onChange={(e) => setNewAmountStr(e.target.value)}
                        placeholder="Ex : 500000"
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Capital restant dû
                      </label>
                      <input
                        type="number"
                        value={newRemainingCapital}
                        onChange={(e) => setNewRemainingCapital(e.target.value)}
                        placeholder="Ex : 420000"
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Mensualité ({userSettings.primaryCurrency}/mois)
                      </label>
                      <input
                        type="number"
                        value={newMonthlyPayment}
                        onChange={(e) => setNewMonthlyPayment(e.target.value)}
                        placeholder="Ex : 3850"
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Taux d'intérêt (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newInterestRate}
                        onChange={(e) => setNewInterestRate(e.target.value)}
                        placeholder="Ex : 4.25"
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Date de fin d'échéance
                    </label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Nom du contact / Proche
                    </label>
                    <input
                      required
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex : Youssef, Salma, Karim..."
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Numéro de téléphone (optionnel)
                    </label>
                    <input
                      type="text"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      placeholder="+212 6 XX XX XX XX"
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Montant ({userSettings.primaryCurrency})
                    </label>
                    <input
                      required
                      type="number"
                      value={newAmountStr}
                      onChange={(e) => setNewAmountStr(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Description / Motif
                    </label>
                    <input
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Ex : Dépannage achat, avance travaux..."
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
              >
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Debt Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Modifier l'élément
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              {editingItem.item.type === 'BANK_LOAN' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Banque prêteuse
                    </label>
                    <input
                      required
                      type="text"
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Libellé du crédit
                    </label>
                    <input
                      required
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Capital initial
                      </label>
                      <input
                        required
                        type="number"
                        value={editAmountStr}
                        onChange={(e) => setEditAmountStr(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Capital restant dû
                      </label>
                      <input
                        type="number"
                        value={editRemainingCapital}
                        onChange={(e) => setEditRemainingCapital(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Mensualité
                      </label>
                      <input
                        type="number"
                        value={editMonthlyPayment}
                        onChange={(e) => setEditMonthlyPayment(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Taux d'intérêt (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editInterestRate}
                        onChange={(e) => setEditInterestRate(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Date de fin de prêt
                    </label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Type Switcher */}
                  <div className="flex p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setEditType('CREDIT_GIVEN')}
                      className={`flex-1 py-1.5 rounded-lg transition ${
                        editType === 'CREDIT_GIVEN'
                          ? 'bg-emerald-500 text-white'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      J'ai prêté (Créance)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditType('LOAN_RECEIVED')}
                      className={`flex-1 py-1.5 rounded-lg transition ${
                        editType === 'LOAN_RECEIVED'
                          ? 'bg-amber-500 text-white'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      Je dois (Dette)
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Nom du contact
                      </label>
                      <input
                        required
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        value={editContact}
                        onChange={(e) => setEditContact(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
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
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                        Date de l'opération
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

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Description / Motif
                    </label>
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
                >
                  Enregistrer les modifications
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDebt(editingItem.item.id)}
                  className="rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 p-2.5 transition"
                  title="Supprimer cet élément"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repay Modal */}
      {isRepayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Remboursement
              </h3>
              <button
                onClick={() => setIsRepayModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRepay} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Montant remboursé ({userSettings.primaryCurrency})
                </label>
                <input
                  required
                  type="number"
                  value={repayAmountStr}
                  onChange={(e) => setRepayAmountStr(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Compte concerné pour l'opération
                </label>
                <select
                  value={repayAccountId}
                  onChange={(e) => setRepayAccountId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.balance.toLocaleString()} {a.currency})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] py-2.5 text-xs font-black shadow-md shadow-lime-500/10 active:scale-98 transition"
              >
                Valider le remboursement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Amortization Schedule Detail Modal */}
      {viewScheduleLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#121214]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 font-bold">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Tableau d'amortissement — {viewScheduleLoan.description}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {viewScheduleLoan.bankName || 'Banque'} &bull; Capital restant : {formatCurrency(viewScheduleLoan.remainingCapital ?? viewScheduleLoan.amount, userSettings.primaryCurrency)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 font-semibold transition">
                  <UploadCloud className="h-3.5 w-3.5 text-[#c4f24e]" />
                  <span>Réimporter (.xlsx, .csv)</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, viewScheduleLoan.id)}
                  />
                </label>
                <button
                  onClick={() => setViewScheduleLoan(null)}
                  className="rounded-full p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {(!viewScheduleLoan.amortizationSchedule || viewScheduleLoan.amortizationSchedule.length === 0) ? (
                <div className="text-center py-12">
                  <FileSpreadsheet className="h-12 w-12 text-neutral-500 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-white mb-1">Aucun tableau d'amortissement importé</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
                    Importez le relevé ou tableau d'amortissement fourni par votre banque pour suivre l'échéancier exact mensualité par mensualité.
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c4f24e] text-neutral-950 text-xs font-bold hover:bg-[#b0dc41] transition">
                    <UploadCloud className="h-4 w-4" />
                    <span>Sélectionner le fichier Excel / CSV</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, viewScheduleLoan.id)}
                    />
                  </label>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 dark:bg-[#18181c] text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">N°</th>
                        <th className="py-2.5 px-3 font-semibold">Date d'échéance</th>
                        <th className="py-2.5 px-3 font-semibold">Mensualité</th>
                        <th className="py-2.5 px-3 font-semibold text-emerald-400">Capital amorti</th>
                        <th className="py-2.5 px-3 font-semibold text-rose-400">Intérêts</th>
                        <th className="py-2.5 px-3 font-semibold">Assurance</th>
                        <th className="py-2.5 px-3 font-semibold">Capital restant</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-mono">
                      {viewScheduleLoan.amortizationSchedule.map((row) => (
                        <tr
                          key={row.installmentNumber}
                          className={`hover:bg-neutral-800/30 transition ${
                            row.isPaid ? 'opacity-60 bg-neutral-900/40' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-neutral-400">{row.installmentNumber}</td>
                          <td className="py-2.5 px-3 font-sans font-medium text-neutral-800 dark:text-neutral-200">
                            {row.dueDate}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-white">
                            {formatCurrency(row.payment, userSettings.primaryCurrency)}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                            {formatCurrency(row.principal, userSettings.primaryCurrency)}
                          </td>
                          <td className="py-2.5 px-3 text-rose-400">
                            {formatCurrency(row.interest, userSettings.primaryCurrency)}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-400">
                            {formatCurrency(row.insurance, userSettings.primaryCurrency)}
                          </td>
                          <td className="py-2.5 px-3 font-black text-neutral-800 dark:text-neutral-100">
                            {formatCurrency(row.remainingBalance, userSettings.primaryCurrency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-sans">
                            {row.isPaid ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                                <Check className="h-3 w-3" />
                                Payée
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-neutral-800 text-neutral-300 px-2 py-0.5 text-[10px] font-bold">
                                À échoir
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

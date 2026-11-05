import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Space,
  SpaceId,
  Account,
  Category,
  Transaction,
  BudgetEnvelope,
  Counterparty,
  DebtLedgerItem,
  Goal,
  Asset,
  RecurringItem,
  UserSettings,
  NotificationItem,
  PeriodVision,
  PeriodRange,
  StagedTransaction,
} from '../types';
import {
  INITIAL_SPACES,
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_COUNTERPARTIES,
  INITIAL_DEBT_LEDGER,
  INITIAL_GOALS,
  INITIAL_ASSETS,
  INITIAL_RECURRING,
  INITIAL_NOTIFICATIONS,
  INITIAL_USER_SETTINGS,
} from '../data/initialData';
import { getPeriodRange, navigatePeriod, isDateInPeriod } from '../utils/finance';

export type NavTab =
  | 'dashboard'
  | 'plan'
  | 'transactions'
  | 'cashflow'
  | 'goals'
  | 'debts'
  | 'accounts'
  | 'assets'
  | 'recurring'
  | 'settings';

export interface NewDebtData {
  counterpartyName: string;
  type: 'CREDIT_GIVEN' | 'LOAN_RECEIVED' | 'BANK_LOAN';
  amount: number;
  description: string;
  contact?: string;
  bankName?: string;
  monthlyPayment?: number;
  interestRate?: number;
  remainingCapital?: number;
  endDate?: string;
}

interface AppContextType {
  spaces: Space[];
  activeSpaceId: SpaceId | 'all';
  setActiveSpaceId: (s: SpaceId | 'all') => void;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: BudgetEnvelope[];
  counterparties: Counterparty[];
  debtLedger: DebtLedgerItem[];
  goals: Goal[];
  assets: Asset[];
  recurring: RecurringItem[];
  notifications: NotificationItem[];
  userSettings: UserSettings;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  activeTab: NavTab;
  setActiveTab: (t: NavTab) => void;
  isAddTxModalOpen: boolean;
  setIsAddTxModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Period Vision (Daily, Weekly, Monthly, Yearly, Custom)
  periodRange: PeriodRange;
  setPeriodVision: (vision: PeriodVision) => void;
  setPeriodReferenceDate: (date: string) => void;
  setCustomPeriod: (from: string, to: string) => void;
  navigatePeriodRange: (direction: -1 | 1) => void;
  isDateInActivePeriod: (dateStr: string) => boolean;

  // Actions Transactions & Budgets
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (tx: Transaction) => void;
  addBudget: (categoryId: string, amount: number) => void;

  // Category CRUD & Modal
  isAddCategoryModalOpen: boolean;
  setIsAddCategoryModalOpen: (open: boolean) => void;
  addCategoryDefaultKind: 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE';
  openAddCategoryModal: (kind?: 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE') => void;
  addCategory: (cat: Omit<Category, 'id'>) => string;
  deleteCategory: (id: string) => void;

  // Budget Resets
  resetFixedBudgets: (month?: string) => void;
  resetVariableBudgets: (month?: string) => void;
  resetGroupBudgets: (groupId: string, month?: string) => void;
  resetAllBudgets: (month?: string) => void;

  // Staged Statement Import
  isStatementReviewOpen: boolean;
  setIsStatementReviewOpen: (open: boolean) => void;
  stagedTransactions: StagedTransaction[];
  setStagedTransactions: React.Dispatch<React.SetStateAction<StagedTransaction[]>>;
  confirmStagedImport: (txs: StagedTransaction[], targetAccountId?: string) => void;

  // Export Modal
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;

  // Goals CRUD
  addGoal: (goal: Omit<Goal, 'id' | 'allocated'> & { initialAllocation?: number }) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  updateGoalAllocation: (id: string, delta: number) => void;

  // Debts & Bank Loans CRUD
  addDebt: (data: NewDebtData) => void;
  updateDebt: (id: string, updates: Partial<DebtLedgerItem>, counterpartyName?: string, contact?: string) => void;
  deleteDebt: (id: string) => void;
  repayDebt: (
    counterpartyId: string,
    amount: number,
    accountId: string,
    description: string
  ) => void;

  // Accounts CRUD
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
  transferBetweenAccounts: (fromId: string, toId: string, amount: number, note?: string) => void;

  // Assets CRUD
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;

  // Recurring CRUD
  addRecurring: (rec: Omit<RecurringItem, 'id'>) => void;
  updateRecurring: (rec: RecurringItem) => void;
  deleteRecurring: (id: string) => void;
  toggleRecurringActive: (id: string) => void;

  // Global & Settings
  toggleHideAmounts: () => void;
  toggleTheme: () => void;
  setCurrency: (currency: string) => void;
  setAccentColor: (color: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToDemo: () => void;
  resetToZero: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;

  // Filter state for transactions
  txTypeFilter: 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER';
  setTxTypeFilter: (f: 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER') => void;
}

const AppContext = createContext<AppContextType | null>(null);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`tresoria_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(`tresoria_${key}`, JSON.stringify(data));
  } catch (e) {}
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spaces] = useState<Space[]>(INITIAL_SPACES);
  const [activeSpaceId, setActiveSpaceId] = useState<SpaceId | 'all'>('all');

  const [accounts, setAccounts] = useState<Account[]>(() =>
    loadStorage('accounts', INITIAL_ACCOUNTS)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadStorage('categories', INITIAL_CATEGORIES)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadStorage('transactions', INITIAL_TRANSACTIONS)
  );
  const [budgets, setBudgets] = useState<BudgetEnvelope[]>(() =>
    loadStorage('budgets', INITIAL_BUDGETS)
  );
  const [counterparties, setCounterparties] = useState<Counterparty[]>(() =>
    loadStorage('counterparties', INITIAL_COUNTERPARTIES)
  );
  const [debtLedger, setDebtLedger] = useState<DebtLedgerItem[]>(() =>
    loadStorage('debtLedger', INITIAL_DEBT_LEDGER)
  );
  const [goals, setGoals] = useState<Goal[]>(() =>
    loadStorage('goals', INITIAL_GOALS)
  );
  const [assets, setAssets] = useState<Asset[]>(() =>
    loadStorage('assets', INITIAL_ASSETS)
  );
  const [recurring, setRecurring] = useState<RecurringItem[]>(() =>
    loadStorage('recurring', INITIAL_RECURRING)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [userSettings, setUserSettings] = useState<UserSettings>(() =>
    loadStorage('userSettings', INITIAL_USER_SETTINGS)
  );

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [periodRange, setPeriodRange] = useState<PeriodRange>(() =>
    getPeriodRange('MONTHLY', '2026-11-05')
  );
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [txTypeFilter, setTxTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'>('ALL');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Staged import & Export Modals
  const [isStatementReviewOpen, setIsStatementReviewOpen] = useState(false);
  const [stagedTransactions, setStagedTransactions] = useState<StagedTransaction[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Category Modal & Management
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [addCategoryDefaultKind, setAddCategoryDefaultKind] = useState<'FIXED_EXPENSE' | 'VARIABLE_EXPENSE'>('VARIABLE_EXPENSE');

  const openAddCategoryModal = (kind: 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE' = 'VARIABLE_EXPENSE') => {
    setAddCategoryDefaultKind(kind);
    setIsAddCategoryModalOpen(true);
  };

  const addCategory = (catData: Omit<Category, 'id'>): string => {
    const id = `cat_${Date.now()}`;
    const newCategory: Category = {
      ...catData,
      id,
    };
    setCategories((prev) => [...prev, newCategory]);
    return id;
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setBudgets((prev) => prev.filter((b) => b.categoryId !== id));
  };

  // Sync to storage
  useEffect(() => saveStorage('accounts', accounts), [accounts]);
  useEffect(() => saveStorage('categories', categories), [categories]);
  useEffect(() => saveStorage('transactions', transactions), [transactions]);
  useEffect(() => saveStorage('budgets', budgets), [budgets]);
  useEffect(() => saveStorage('counterparties', counterparties), [counterparties]);
  useEffect(() => saveStorage('debtLedger', debtLedger), [debtLedger]);
  useEffect(() => saveStorage('goals', goals), [goals]);
  useEffect(() => saveStorage('assets', assets), [assets]);
  useEffect(() => saveStorage('recurring', recurring), [recurring]);
  useEffect(() => saveStorage('notifications', notifications), [notifications]);
  useEffect(() => {
    saveStorage('userSettings', userSettings);
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply custom brand accent color
    const accent = userSettings.accentColor || '#c4f24e';
    document.documentElement.style.setProperty('--brand-primary', accent);
    // Calculate contrast text
    const cleanHex = accent.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 196;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 242;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 78;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = yiq >= 150 ? '#101011' : '#ffffff';
    document.documentElement.style.setProperty('--brand-primary-text', textColor);
  }, [userSettings]);

  // Global keyboard shortcuts (Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Transactions
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const id = `tx_${Date.now()}`;
    const newTx: Transaction = { ...txData, id };

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === newTx.accountId) {
          return { ...acc, balance: Math.round((acc.balance + newTx.amount) * 100) / 100 };
        }
        return acc;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);

    // If transaction is marked recurring, add or update recurring item if requested
    if (newTx.isRecurring && newTx.categoryId) {
      const existingRec = recurring.find((r) => r.categoryId === newTx.categoryId);
      if (!existingRec) {
        const cat = categories.find((c) => c.id === newTx.categoryId);
        const day = newTx.recurringDay || parseInt(newTx.date.split('-')[2], 10) || 1;
        setRecurring((prev) => [
          ...prev,
          {
            id: `rec_${Date.now()}`,
            label: newTx.description || cat?.name || 'Abonnement',
            cadence: 'MONTHLY',
            dayOfMonth: day,
            amountHint: Math.abs(newTx.amount),
            categoryId: newTx.categoryId!,
            accountId: newTx.accountId,
            spaceId: newTx.spaceId,
            isActive: true,
          },
        ]);
      }
    }

    // Update streak
    setUserSettings((s) => ({
      ...s,
      streakDays: s.streakDays + 1,
      lastActivityDate: new Date().toISOString().slice(0, 10),
    }));
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    // Reverse balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === target.accountId) {
          return { ...acc, balance: Math.round((acc.balance - target.amount) * 100) / 100 };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find((t) => t.id === updatedTx.id);
    if (!oldTx) return;

    // Adjust balances
    setAccounts((prev) =>
      prev.map((acc) => {
        let bal = acc.balance;
        if (acc.id === oldTx.accountId) {
          bal -= oldTx.amount;
        }
        if (acc.id === updatedTx.accountId) {
          bal += updatedTx.amount;
        }
        return { ...acc, balance: Math.round(bal * 100) / 100 };
      })
    );

    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
  };

  const addBudget = (categoryId: string, amount: number) => {
    setBudgets((prev) => {
      const existing = prev.findIndex(
        (b) => b.categoryId === categoryId && b.month === selectedMonth
      );
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = { ...copy[existing], amount };
        return copy;
      }
      return [
        ...prev,
        {
          id: `b_${Date.now()}`,
          categoryId,
          month: selectedMonth,
          amount,
          currency: userSettings.primaryCurrency,
        },
      ];
    });
  };

  // Period Vision Methods
  const setPeriodVision = (vision: PeriodVision) => {
    setPeriodRange((prev) => getPeriodRange(vision, prev.referenceDate));
  };

  const setPeriodReferenceDate = (date: string) => {
    setPeriodRange((prev) => getPeriodRange(prev.vision, date));
    setSelectedMonth(date.slice(0, 7));
  };

  const setCustomPeriod = (from: string, to: string) => {
    setPeriodRange(getPeriodRange('CUSTOM', from, { from, to }));
  };

  const navigatePeriodRange = (direction: -1 | 1) => {
    setPeriodRange((prev) => {
      const next = navigatePeriod(prev, direction);
      setSelectedMonth(next.referenceDate.slice(0, 7));
      return next;
    });
  };

  const isDateInActivePeriod = (dateStr: string): boolean => {
    return isDateInPeriod(dateStr, periodRange);
  };

  // Budget Reset Functions (Fixed, Variable, Group, All)
  const resetGroupBudgets = (groupId: string, targetMonth?: string) => {
    const month = targetMonth || selectedMonth;
    const childCatIds = new Set(
      categories.filter((c) => c.parentId === groupId || c.id === groupId).map((c) => c.id)
    );
    setBudgets((prev) =>
      prev.map((b) => (childCatIds.has(b.categoryId) && b.month === month ? { ...b, amount: 0 } : b))
    );
  };

  const resetFixedBudgets = (targetMonth?: string) => {
    const month = targetMonth || selectedMonth;
    const fixedCatIds = new Set(
      categories
        .filter((c) => c.kind === 'FIXED_EXPENSE' || c.parentId === 'group_fixed' || c.parentId === 'group_pro_fixed')
        .map((c) => c.id)
    );
    setBudgets((prev) =>
      prev.map((b) => (fixedCatIds.has(b.categoryId) && b.month === month ? { ...b, amount: 0 } : b))
    );
  };

  const resetVariableBudgets = (targetMonth?: string) => {
    const month = targetMonth || selectedMonth;
    const varCatIds = new Set(
      categories
        .filter((c) => c.kind === 'VARIABLE_EXPENSE' || c.parentId === 'group_variable')
        .map((c) => c.id)
    );
    setBudgets((prev) =>
      prev.map((b) => (varCatIds.has(b.categoryId) && b.month === month ? { ...b, amount: 0 } : b))
    );
  };

  const resetAllBudgets = (targetMonth?: string) => {
    const month = targetMonth || selectedMonth;
    setBudgets((prev) => prev.map((b) => (b.month === month ? { ...b, amount: 0 } : b)));
  };

  // Confirm Staged Statement Import
  const confirmStagedImport = (txs: StagedTransaction[], targetAccountId?: string) => {
    if (txs.length === 0) return;
    const defaultAccId = targetAccountId || accounts[0]?.id || 'acc_checking';

    const newTransactions: Transaction[] = txs.map((st, idx) => {
      const accId = st.accountId || defaultAccId;
      const acc = accounts.find((a) => a.id === accId);
      return {
        id: `tx_imp_${Date.now()}_${idx}`,
        accountId: accId,
        categoryId: st.categoryId || null,
        spaceId: acc?.spaceId || 'personal',
        date: st.date,
        amount: st.amount,
        currency: userSettings.primaryCurrency,
        description: st.description,
      };
    });

    // Update account balances
    setAccounts((prevAccs) =>
      prevAccs.map((acc) => {
        const addedToThis = newTransactions.filter((t) => t.accountId === acc.id);
        const delta = addedToThis.reduce((sum, t) => sum + t.amount, 0);
        return { ...acc, balance: Math.round((acc.balance + delta) * 100) / 100 };
      })
    );

    setTransactions((prev) => [...newTransactions, ...prev]);
    setStagedTransactions([]);
    setIsStatementReviewOpen(false);
  };


  // Goals
  const addGoal = (goalData: Omit<Goal, 'id' | 'allocated'> & { initialAllocation?: number }) => {
    const id = `goal_${Date.now()}`;
    const newGoal: Goal = {
      id,
      spaceId: goalData.spaceId,
      name: goalData.name,
      icon: goalData.icon || '🎯',
      targetAmount: goalData.targetAmount,
      allocated: goalData.initialAllocation || 0,
      deadline: goalData.deadline,
      priority: goalData.priority || 1,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGoalAllocation = (id: string, delta: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = Math.max(0, g.allocated + delta);
          return { ...g, allocated: updated };
        }
        return g;
      })
    );
  };

  // Debts & Bank Loans
  const addDebt = (data: NewDebtData) => {
    const isBank = data.type === 'BANK_LOAN';
    let cp = counterparties.find(
      (c) => c.name.toLowerCase() === data.counterpartyName.toLowerCase()
    );
    let cpId = cp?.id;
    if (!cp) {
      cpId = `cp_${Date.now()}`;
      const newCp: Counterparty = {
        id: cpId,
        name: data.counterpartyName,
        kind: isBank ? 'BANK' : 'PERSON',
        contact: data.contact,
      };
      setCounterparties((prev) => [...prev, newCp]);
    }

    const newLedgerItem: DebtLedgerItem = {
      id: `dl_${Date.now()}`,
      counterpartyId: cpId!,
      spaceId: 'personal',
      date: new Date().toISOString().slice(0, 10),
      type: data.type,
      amount: data.amount,
      currency: userSettings.primaryCurrency,
      description: data.description,
      bankName: data.bankName || (isBank ? data.counterpartyName : undefined),
      monthlyPayment: data.monthlyPayment,
      interestRate: data.interestRate,
      remainingCapital: data.remainingCapital ?? data.amount,
      endDate: data.endDate,
    };

    setDebtLedger((prev) => [newLedgerItem, ...prev]);
  };

  const updateDebt = (
    id: string,
    updates: Partial<DebtLedgerItem>,
    counterpartyName?: string,
    contact?: string
  ) => {
    setDebtLedger((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (counterpartyName && item.counterpartyId) {
            setCounterparties((cps) =>
              cps.map((c) =>
                c.id === item.counterpartyId
                  ? { ...c, name: counterpartyName, contact: contact ?? c.contact }
                  : c
              )
            );
          }
          return { ...item, ...updates };
        }
        return item;
      })
    );
  };

  const deleteDebt = (id: string) => {
    setDebtLedger((prev) => prev.filter((d) => d.id !== id));
  };

  const repayDebt = (
    counterpartyId: string,
    amount: number,
    accountId: string,
    description: string
  ) => {
    const cp = counterparties.find((c) => c.id === counterpartyId);
    const cpName = cp ? cp.name : 'Contact';

    const items = debtLedger.filter((d) => d.counterpartyId === counterpartyId);
    let netBalance = 0;
    for (const item of items) {
      if (item.type === 'CREDIT_GIVEN') netBalance += item.amount;
      if (item.type === 'CREDIT_REPAID') netBalance -= item.amount;
      if (item.type === 'LOAN_RECEIVED' || item.type === 'BANK_LOAN') netBalance -= (item.remainingCapital ?? item.amount);
      if (item.type === 'LOAN_REPAID') netBalance += item.amount;
    }

    const type = netBalance > 0 ? 'CREDIT_REPAID' : 'LOAN_REPAID';

    const newLedgerItem: DebtLedgerItem = {
      id: `dl_${Date.now()}`,
      counterpartyId,
      spaceId: 'personal',
      date: new Date().toISOString().slice(0, 10),
      type,
      amount,
      currency: userSettings.primaryCurrency,
      description,
    };
    setDebtLedger((prev) => [newLedgerItem, ...prev]);

    const txAmount = type === 'CREDIT_REPAID' ? amount : -amount;
    addTransaction({
      accountId,
      spaceId: 'personal',
      date: new Date().toISOString().slice(0, 10),
      amount: txAmount,
      currency: userSettings.primaryCurrency,
      description: `${description} (${cpName})`,
      counterpartyId,
    });
  };

  // Accounts
  const addAccount = (accData: Omit<Account, 'id'>) => {
    const id = `acc_${Date.now()}`;
    setAccounts((prev) => [...prev, { ...accData, id }]);
  };

  const updateAccount = (updatedAcc: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) return;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const transferBetweenAccounts = (
    fromId: string,
    toId: string,
    amount: number,
    note?: string
  ) => {
    const fromAcc = accounts.find((a) => a.id === fromId);
    const toAcc = accounts.find((a) => a.id === toId);
    if (!fromAcc || !toAcc || amount <= 0) return;

    const transferId = `tr_${Date.now()}`;
    const date = new Date().toISOString().slice(0, 10);
    const desc = note || `Virement : ${fromAcc.name} → ${toAcc.name}`;

    const txOut: Transaction = {
      id: `tx_${Date.now()}_out`,
      accountId: fromId,
      spaceId: fromAcc.spaceId,
      date,
      amount: -amount,
      currency: fromAcc.currency,
      description: desc,
      transferId,
    };

    const txIn: Transaction = {
      id: `tx_${Date.now()}_in`,
      accountId: toId,
      spaceId: toAcc.spaceId,
      date,
      amount,
      currency: toAcc.currency,
      description: desc,
      transferId,
    };

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromId) return { ...acc, balance: Math.round((acc.balance - amount) * 100) / 100 };
        if (acc.id === toId) return { ...acc, balance: Math.round((acc.balance + amount) * 100) / 100 };
        return acc;
      })
    );

    setTransactions((prev) => [txOut, txIn, ...prev]);
  };

  // Assets
  const addAsset = (assetData: Omit<Asset, 'id'>) => {
    const id = `ast_${Date.now()}`;
    setAssets((prev) => [...prev, { ...assetData, id }]);
  };

  const updateAsset = (updatedAsset: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Recurring Items
  const addRecurring = (recData: Omit<RecurringItem, 'id'>) => {
    const id = `rec_${Date.now()}`;
    setRecurring((prev) => [...prev, { ...recData, id }]);
  };

  const updateRecurring = (updatedRec: RecurringItem) => {
    setRecurring((prev) => prev.map((r) => (r.id === updatedRec.id ? updatedRec : r)));
  };

  const deleteRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRecurringActive = (id: string) => {
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const toggleHideAmounts = () => {
    setUserSettings((prev) => ({ ...prev, hideAmounts: !prev.hideAmounts }));
  };

  const toggleTheme = () => {
    setUserSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const setCurrency = (currency: string) => {
    setUserSettings((prev) => ({ ...prev, primaryCurrency: currency }));
  };

  const setAccentColor = (color: string) => {
    setUserSettings((prev) => ({ ...prev, accentColor: color }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Total Financial Reset (blank slate for all financial records, envelopes, budgets, savings goals, debts, accounts, persons and sub-envelope categories)
  const resetToZero = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('tresoria_') || key.startsWith('liquimind_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    // Reset account balances to 0 DH
    setAccounts((prev) => prev.map((a) => ({ ...a, balance: 0, alertThreshold: 0 })));
    // Erase all transaction history
    setTransactions([]);
    // Erase all personal bank loans, credits and debts
    setDebtLedger([]);
    // Erase all counterparties, names, and contact details
    setCounterparties([]);
    // Erase all physical/financial assets
    setAssets([]);
    // Erase all recurring items and subscriptions
    setRecurring([]);
    // Erase all savings goals (both target amounts and allocated savings)
    setGoals([]);
    // Erase all envelope budgets of all types of expenses
    setBudgets([]);
    // Erase all sub-envelope expense categories (keeps parent groups and income categories for custom categories)
    setCategories((prev) => prev.filter((c) => c.direction === 'IN' || c.isGroup));
    // Clear notifications
    setNotifications([]);
  };

  // Full reset ensuring localStorage is completely wiped of previous state and reloaded to demo
  const resetToDemo = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('tresoria_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}

    setAccounts(INITIAL_ACCOUNTS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setCounterparties(INITIAL_COUNTERPARTIES);
    setDebtLedger(INITIAL_DEBT_LEDGER);
    setGoals(INITIAL_GOALS);
    setAssets(INITIAL_ASSETS);
    setRecurring(INITIAL_RECURRING);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUserSettings(INITIAL_USER_SETTINGS);
  };

  const exportDataJson = (): string => {
    return JSON.stringify(
      {
        version: '2.4.0',
        exportedAt: new Date().toISOString(),
        accounts,
        categories,
        transactions,
        budgets,
        counterparties,
        debtLedger,
        goals,
        assets,
        recurring,
        userSettings,
      },
      null,
      2
    );
  };

  const importDataJson = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data.accounts)) {
        setAccounts(data.accounts);
        saveStorage('accounts', data.accounts);
      }
      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
        saveStorage('categories', data.categories);
      }
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        saveStorage('transactions', data.transactions);
      }
      if (Array.isArray(data.budgets)) {
        setBudgets(data.budgets);
        saveStorage('budgets', data.budgets);
      }
      if (Array.isArray(data.counterparties)) {
        setCounterparties(data.counterparties);
        saveStorage('counterparties', data.counterparties);
      }
      if (Array.isArray(data.debtLedger)) {
        setDebtLedger(data.debtLedger);
        saveStorage('debtLedger', data.debtLedger);
      }
      if (Array.isArray(data.goals)) {
        setGoals(data.goals);
        saveStorage('goals', data.goals);
      }
      if (Array.isArray(data.assets)) {
        setAssets(data.assets);
        saveStorage('assets', data.assets);
      }
      if (Array.isArray(data.recurring)) {
        setRecurring(data.recurring);
        saveStorage('recurring', data.recurring);
      }
      if (data.userSettings) {
        setUserSettings(data.userSettings);
        saveStorage('userSettings', data.userSettings);
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        spaces,
        activeSpaceId,
        setActiveSpaceId,
        accounts,
        categories,
        transactions,
        budgets,
        counterparties,
        debtLedger,
        goals,
        assets,
        recurring,
        notifications,
        userSettings,
        selectedMonth,
        setSelectedMonth,
        activeTab,
        setActiveTab,
        txTypeFilter,
        setTxTypeFilter,
        isAddTxModalOpen,
        setIsAddTxModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,

        // Period Vision
        periodRange,
        setPeriodVision,
        setPeriodReferenceDate,
        setCustomPeriod,
        navigatePeriodRange,
        isDateInActivePeriod,

        // Actions Transactions & Budgets
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addBudget,

        // Category Modal & Management
        isAddCategoryModalOpen,
        setIsAddCategoryModalOpen,
        addCategoryDefaultKind,
        openAddCategoryModal,
        addCategory,
        deleteCategory,

        // Budget Resets
        resetFixedBudgets,
        resetVariableBudgets,
        resetGroupBudgets,
        resetAllBudgets,

        // Staged Statement Import
        isStatementReviewOpen,
        setIsStatementReviewOpen,
        stagedTransactions,
        setStagedTransactions,
        confirmStagedImport,

        // Export Modal
        isExportModalOpen,
        setIsExportModalOpen,

        addGoal,
        updateGoal,
        deleteGoal,
        updateGoalAllocation,

        addDebt,
        updateDebt,
        deleteDebt,
        repayDebt,

        addAccount,
        updateAccount,
        deleteAccount,
        transferBetweenAccounts,

        addAsset,
        updateAsset,
        deleteAsset,

        addRecurring,
        updateRecurring,
        deleteRecurring,
        toggleRecurringActive,

        toggleHideAmounts,
        toggleTheme,
        setCurrency,
        setAccentColor,
        markNotificationRead,
        clearAllNotifications,
        resetToDemo,
        resetToZero,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}

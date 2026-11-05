import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Space,
  SpaceId,
  SpaceCollaborator,
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
  AuthUser,
  ChatMessage,
  AmortizationRow,
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
  DEMO_ACCOUNTS,
  DEMO_TRANSACTIONS,
  DEMO_BUDGETS,
  DEMO_COUNTERPARTIES,
  DEMO_DEBT_LEDGER,
  DEMO_GOALS,
  DEMO_ASSETS,
  DEMO_RECURRING,
} from '../data/initialData';
import { getPeriodRange, navigatePeriod, isDateInPeriod } from '../utils/finance';
import {
  signInWithGoogleFirebase,
  signOutFirebase,
  syncDataToFirestore,
  loadDataFromFirestore,
} from '../services/firebase';

export const ACCENT_PALETTES: Record<
  string,
  { name: string; primary: string; hover: string; text: string; tint: string; ring: string }
> = {
  cobalt: {
    name: 'Bleu Cobalt (Par défaut)',
    primary: '#1d4ed8',
    hover: '#1e40af',
    text: '#ffffff',
    tint: '#eff6ff',
    ring: '#3b82f6',
  },
  emerald: {
    name: 'Émeraude',
    primary: '#059669',
    hover: '#047857',
    text: '#ffffff',
    tint: '#ecfdf5',
    ring: '#10b981',
  },
  violet: {
    name: 'Violet Royal',
    primary: '#7c3aed',
    hover: '#6d28d9',
    text: '#ffffff',
    tint: '#f5f3ff',
    ring: '#8b5cf6',
  },
  amber: {
    name: 'Ambre Doré',
    primary: '#d97706',
    hover: '#b45309',
    text: '#ffffff',
    tint: '#fffbeb',
    ring: '#f59e0b',
  },
  rose: {
    name: 'Rose Carmin',
    primary: '#e11d48',
    hover: '#be123c',
    text: '#ffffff',
    tint: '#fff1f2',
    ring: '#f43f5e',
  },
  cyan: {
    name: 'Cyan Océan',
    primary: '#0284c7',
    hover: '#0369a1',
    text: '#ffffff',
    tint: '#f0f9ff',
    ring: '#0ea5e9',
  },
  lime: {
    name: 'Vert Lime',
    primary: '#65a30d',
    hover: '#4d7c0f',
    text: '#ffffff',
    tint: '#f7fee7',
    ring: '#84cc16',
  },
};

export type NavTab =
  | 'dashboard'
  | 'plan'
  | 'transactions'
  | 'cashflow'
  | 'forecast'
  | 'assistant'
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
  amortizationSchedule?: AmortizationRow[];
  scheduleFileName?: string;
}

interface AppContextType {
  spaces: Space[];
  activeSpaceId: SpaceId | 'all';
  setActiveSpaceId: (s: SpaceId | 'all') => void;
  updateSpace: (id: SpaceId, updates: Partial<Space>) => void;
  addSpace: (name: string, tag: string, icon: string) => void;

  // Collaborators & Spaces Administration
  isCollaboratorsModalOpen: boolean;
  setIsCollaboratorsModalOpen: (open: boolean) => void;
  collaboratorSpaceTarget: SpaceId | null;
  openCollaboratorsModal: (spaceId?: SpaceId) => void;
  inviteCollaborator: (
    spaceId: string,
    email: string,
    role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER',
    permissions?: Partial<SpaceCollaborator['permissions']>
  ) => void;
  removeCollaborator: (spaceId: string, collaboratorId: string) => void;
  updateCollaboratorRole: (
    spaceId: string,
    collaboratorId: string,
    role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
  ) => void;
  updateCollaboratorPermissions: (
    spaceId: string,
    collaboratorId: string,
    perms: Partial<SpaceCollaborator['permissions']>
  ) => void;

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

  // Auth & Cloud Sync (Google / Firebase / Email)
  authUser: AuthUser | null;
  isSyncingCloud: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password?: string, displayName?: string) => Promise<void>;
  registerWithEmail: (email: string, password?: string, displayName?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  logoutGoogle: () => Promise<void>;
  syncNowWithCloud: () => Promise<void>;

  // AI Conversational Onboarding & Assistant
  isAIOnboardingOpen: boolean;
  setIsAIOnboardingOpen: (open: boolean) => void;
  isAndroidModalOpen: boolean;
  setIsAndroidModalOpen: (open: boolean) => void;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  clearChatHistory: () => void;

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

  // Period Vision
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
  addBudget: (categoryId: string, amount: number, monthOverride?: string) => void;

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
  repayDebt: (counterpartyId: string, amount: number, accountId: string, description: string) => void;

  // Accounts CRUD
  addAccount: (acc: Omit<Account, 'id'>) => string;
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
  markAIOnboardingSeen: () => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToDemo: () => void;
  resetToZero: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;

  txTypeFilter: 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER';
  setTxTypeFilter: (f: 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER') => void;
}

const AppContext = createContext<AppContextType | null>(null);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`tresoria_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(`tresoria_${key}`, JSON.stringify(data));
  } catch {}
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>(() => loadStorage('spaces', INITIAL_SPACES));
  const [activeSpaceId, setActiveSpaceId] = useState<SpaceId | 'all'>('all');

  const [accounts, setAccounts] = useState<Account[]>(() => loadStorage('accounts', INITIAL_ACCOUNTS));
  const [categories, setCategories] = useState<Category[]>(() => {
    const loaded = loadStorage('categories', INITIAL_CATEGORIES);
    return Array.isArray(loaded)
      ? loaded.map((c) => (c.expectedAmount === 21300 ? { ...c, expectedAmount: 0 } : c))
      : INITIAL_CATEGORIES;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStorage('transactions', INITIAL_TRANSACTIONS));
  const [budgets, setBudgets] = useState<BudgetEnvelope[]>(() => loadStorage('budgets', INITIAL_BUDGETS));
  const [counterparties, setCounterparties] = useState<Counterparty[]>(() => loadStorage('counterparties', INITIAL_COUNTERPARTIES));
  const [debtLedger, setDebtLedger] = useState<DebtLedgerItem[]>(() => loadStorage('debtLedger', INITIAL_DEBT_LEDGER));
  const [goals, setGoals] = useState<Goal[]>(() => loadStorage('goals', INITIAL_GOALS));
  const [assets, setAssets] = useState<Asset[]>(() => loadStorage('assets', INITIAL_ASSETS));
  const [recurring, setRecurring] = useState<RecurringItem[]>(() => loadStorage('recurring', INITIAL_RECURRING));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStorage('notifications', INITIAL_NOTIFICATIONS));
  const [userSettings, setUserSettings] = useState<UserSettings>(() => loadStorage('userSettings', INITIAL_USER_SETTINGS));

  const [authUser, setAuthUser] = useState<AuthUser | null>(() => loadStorage('authUser', null));
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Open AI Onboarding at launch if not seen yet
  const [isAIOnboardingOpen, setIsAIOnboardingOpen] = useState<boolean>(() => {
    const saved = loadStorage('userSettings', INITIAL_USER_SETTINGS);
    return !saved.aiOnboardingPromptSeen;
  });

  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() =>
    loadStorage('chatHistory', [
      {
        id: 'welcome_msg',
        role: 'assistant',
        content:
          "Bonjour ! Je suis votre Assistant Financier LiquiMind. Je connais vos comptes, budgets, dettes, prévisions et investissements en temps réel. Posez-moi n'importe quelle question ou demandez-moi un graphique ou un rapport d'analyse !",
        timestamp: new Date().toISOString(),
      },
    ])
  );

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [periodRange, setPeriodRange] = useState<PeriodRange>(() => getPeriodRange('MONTHLY', '2026-11-05'));
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [txTypeFilter, setTxTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'>('ALL');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isStatementReviewOpen, setIsStatementReviewOpen] = useState(false);
  const [stagedTransactions, setStagedTransactions] = useState<StagedTransaction[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [addCategoryDefaultKind, setAddCategoryDefaultKind] = useState<'FIXED_EXPENSE' | 'VARIABLE_EXPENSE'>('VARIABLE_EXPENSE');

  const openAddCategoryModal = (kind: 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE' = 'VARIABLE_EXPENSE') => {
    setAddCategoryDefaultKind(kind);
    setIsAddCategoryModalOpen(true);
  };

  // Spaces CRUD
  const updateSpace = (id: SpaceId, updates: Partial<Space>) => {
    setSpaces((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addSpace = (name: string, tag: string, icon: string) => {
    const id = `space_${Date.now()}`;
    setSpaces((prev) => [...prev, { id, name: name.trim(), tag: tag.trim() || 'Perso', icon: icon || '✨' }]);
  };

  const addCategory = (catData: Omit<Category, 'id'>): string => {
    const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newCategory: Category = { ...catData, id };
    setCategories((prev) => [...prev, newCategory]);
    return id;
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setBudgets((prev) => prev.filter((b) => b.categoryId !== id));
  };

  // Sync to localStorage
  useEffect(() => saveStorage('spaces', spaces), [spaces]);
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
  useEffect(() => saveStorage('authUser', authUser), [authUser]);
  useEffect(() => saveStorage('chatHistory', chatHistory), [chatHistory]);

  // Collaborators & Spaces Administration
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] = useState(false);
  const [collaboratorSpaceTarget, setCollaboratorSpaceTarget] = useState<SpaceId | null>(null);

  const openCollaboratorsModal = (spaceId?: SpaceId) => {
    setCollaboratorSpaceTarget(spaceId || (activeSpaceId === 'all' ? 'personal' : activeSpaceId));
    setIsCollaboratorsModalOpen(true);
  };

  const inviteCollaborator = (
    spaceId: string,
    email: string,
    role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER',
    permissions?: Partial<SpaceCollaborator['permissions']>
  ) => {
    const targetId = spaceId && spaceId !== 'all' ? spaceId : (spaces[0]?.id || 'personal');
    const newCollab: SpaceCollaborator = {
      id: `collab_${Date.now()}`,
      email: email.trim(),
      name: email.split('@')[0],
      role,
      status: 'INVITED',
      invitedAt: new Date().toISOString().slice(0, 10),
      permissions: {
        canAddTransactions: role !== 'VIEWER',
        canEditBudgets: role === 'OWNER' || role === 'ADMIN',
        canManageAccounts: role === 'OWNER' || role === 'ADMIN',
        canInviteOthers: role === 'OWNER' || role === 'ADMIN',
        canViewReports: true,
        ...permissions,
      },
    };

    setSpaces((prev) =>
      prev.map((s) => {
        if (s.id === targetId) {
          const current = s.collaborators || [];
          return {
            ...s,
            collaborators: [...current.filter((c) => c.email.toLowerCase() !== email.trim().toLowerCase()), newCollab],
          };
        }
        return s;
      })
    );

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: 'Invitation collaborateur',
        message: `Invitation envoyée à ${email.trim()} avec le rôle ${role}.`,
        date: new Date().toISOString().slice(0, 10),
        read: false,
        type: 'success',
      },
      ...prev,
    ]);
  };

  const removeCollaborator = (spaceId: string, collaboratorId: string) => {
    setSpaces((prev) =>
      prev.map((s) => {
        if (s.id === spaceId && s.collaborators) {
          return { ...s, collaborators: s.collaborators.filter((c) => c.id !== collaboratorId) };
        }
        return s;
      })
    );
  };

  const updateCollaboratorRole = (
    spaceId: string,
    collaboratorId: string,
    role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
  ) => {
    setSpaces((prev) =>
      prev.map((s) => {
        if (s.id === spaceId && s.collaborators) {
          return {
            ...s,
            collaborators: s.collaborators.map((c) => (c.id === collaboratorId ? { ...c, role } : c)),
          };
        }
        return s;
      })
    );
  };

  const updateCollaboratorPermissions = (
    spaceId: string,
    collaboratorId: string,
    perms: Partial<SpaceCollaborator['permissions']>
  ) => {
    setSpaces((prev) =>
      prev.map((s) => {
        if (s.id === spaceId && s.collaborators) {
          return {
            ...s,
            collaborators: s.collaborators.map((c) =>
              c.id === collaboratorId ? { ...c, permissions: { ...c.permissions, ...perms } } : c
            ),
          };
        }
        return s;
      })
    );
  };

  useEffect(() => {
    saveStorage('userSettings', userSettings);
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    const key = userSettings.accentColor || 'cobalt';
    const palette = ACCENT_PALETTES[key] || {
      name: 'Personnalisé',
      primary: key.startsWith('#') ? key : '#1d4ed8',
      hover: '#1e40af',
      text: '#ffffff',
      tint: '#eff6ff',
      ring: '#3b82f6',
    };

    document.documentElement.style.setProperty('--brand-primary', palette.primary);
    document.documentElement.style.setProperty('--brand-primary-hover', palette.hover);
    document.documentElement.style.setProperty('--brand-primary-text', palette.text);
    document.documentElement.style.setProperty('--brand-primary-tint', palette.tint);
    document.documentElement.style.setProperty('--brand-ring', palette.ring);
  }, [userSettings]);

  // Automatic Cloud Sync when logged in with Google or Email
  useEffect(() => {
    if (!authUser) return;
    const timer = setTimeout(() => {
      syncDataToFirestore(authUser.uid, {
        spaces,
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
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [authUser, spaces, accounts, categories, transactions, budgets, counterparties, debtLedger, goals, assets, recurring, userSettings]);

  const loginWithGoogle = async () => {
    setIsSyncingCloud(true);
    try {
      const user = await signInWithGoogleFirebase();
      setAuthUser(user);
      if (user) {
        setUserSettings((prev) => ({
          ...prev,
          userName: user.displayName,
          email: user.email,
        }));

        // Check if user has cloud data stored in Firestore
        const cloudData = await loadDataFromFirestore(user.uid);
        if (cloudData && Array.isArray(cloudData.accounts) && cloudData.accounts.length > 0) {
          if (cloudData.spaces) setSpaces(cloudData.spaces);
          if (cloudData.accounts) setAccounts(cloudData.accounts);
          if (cloudData.categories) setCategories(cloudData.categories);
          if (cloudData.transactions) setTransactions(cloudData.transactions);
          if (cloudData.budgets) setBudgets(cloudData.budgets);
          if (cloudData.counterparties) setCounterparties(cloudData.counterparties);
          if (cloudData.debtLedger) setDebtLedger(cloudData.debtLedger);
          if (cloudData.goals) setGoals(cloudData.goals);
          if (cloudData.assets) setAssets(cloudData.assets);
          if (cloudData.recurring) setRecurring(cloudData.recurring);
        } else {
          await syncDataToFirestore(user.uid, {
            spaces,
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
          });
        }
      }
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const loginWithEmail = async (email: string, password?: string, displayName?: string) => {
    setIsSyncingCloud(true);
    try {
      const user: AuthUser = {
        uid: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        email: email.trim(),
        displayName: displayName?.trim() || email.split('@')[0] || 'Utilisateur',
        provider: 'email',
        lastSyncedAt: new Date().toISOString(),
      };
      setAuthUser(user);
      setUserSettings((prev) => ({
        ...prev,
        userName: user.displayName,
        email: user.email,
      }));
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const registerWithEmail = async (email: string, password?: string, displayName?: string) => {
    await loginWithEmail(email, password, displayName);
  };

  const loginAsGuest = () => {
    const user: AuthUser = {
      uid: 'guest_user',
      email: 'invite@liquimind.local',
      displayName: 'Utilisateur Invité',
      provider: 'guest',
      lastSyncedAt: new Date().toISOString(),
    };
    setAuthUser(user);
  };

  const logout = async () => {
    try {
      await signOutFirebase();
    } catch {}
    setAuthUser(null);
    try {
      localStorage.removeItem('tresoria_authUser');
    } catch {}
  };

  const logoutGoogle = logout;

  const syncNowWithCloud = async () => {
    if (!authUser) return;
    setIsSyncingCloud(true);
    try {
      await syncDataToFirestore(authUser.uid, {
        spaces,
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
      });
      setAuthUser((prev) => (prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null));
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const markAIOnboardingSeen = () => {
    setUserSettings((prev) => ({ ...prev, aiOnboardingPromptSeen: true, onboardingCompleted: true }));
    setIsAIOnboardingOpen(false);
  };

  const clearChatHistory = () => {
    setChatHistory([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: 'Conversation réinitialisée. Comment puis-je vous aider avec vos finances aujourd’hui ?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Global keyboard shortcuts
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
    const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const newTx: Transaction = { ...txData, id };

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === newTx.accountId) {
          return { ...acc, balance: Math.round((acc.balance + newTx.amount) * 100) / 100 };
        }
        return acc;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);

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

    setUserSettings((s) => ({
      ...s,
      streakDays: s.streakDays + 1,
      lastActivityDate: new Date().toISOString().slice(0, 10),
    }));
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

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

    setAccounts((prev) =>
      prev.map((acc) => {
        let bal = acc.balance;
        if (acc.id === oldTx.accountId) bal -= oldTx.amount;
        if (acc.id === updatedTx.accountId) bal += updatedTx.amount;
        return { ...acc, balance: Math.round(bal * 100) / 100 };
      })
    );

    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
  };

  const addBudget = (categoryId: string, amount: number, monthOverride?: string) => {
    const targetMonth = monthOverride || selectedMonth;
    setBudgets((prev) => {
      const existing = prev.findIndex((b) => b.categoryId === categoryId && b.month === targetMonth);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = { ...copy[existing], amount };
        return copy;
      }
      return [
        ...prev,
        {
          id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          categoryId,
          month: targetMonth,
          amount,
          currency: userSettings.primaryCurrency,
        },
      ];
    });
  };

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

  const resetGroupBudgets = (groupId: string, targetMonth?: string) => {
    const month = targetMonth || selectedMonth;
    const childCatIds = new Set(categories.filter((c) => c.parentId === groupId || c.id === groupId).map((c) => c.id));
    setBudgets((prev) => prev.map((b) => (childCatIds.has(b.categoryId) && b.month === month ? { ...b, amount: 0 } : b)));
  };

  const resetFixedBudgets = (targetMonth?: string) => {
    const month = targetMonth || selectedMonth;
    const fixedCatIds = new Set(
      categories
        .filter((c) => c.kind === 'FIXED_EXPENSE' || c.parentId === 'group_fixed' || c.parentId === 'group_pro_fixed')
        .map((c) => c.id)
    );
    setBudgets((prev) => prev.map((b) => (fixedCatIds.has(b.categoryId) && b.month === month ? { ...b, amount: 0 } : b)));
  };

  const resetVariableBudgets = (targetMonth?: string) => {
    const month = targetMonth || selectedMonth;
    const varCatIds = new Set(
      categories.filter((c) => c.kind === 'VARIABLE_EXPENSE' || c.parentId === 'group_variable').map((c) => c.id)
    );
    setBudgets((prev) => prev.map((b) => (varCatIds.has(b.categoryId) && b.month === month ? { ...b, amount: 0 } : b)));
  };

  const resetAllBudgets = (targetMonth?: string) => {
    const month = targetMonth || selectedMonth;
    setBudgets((prev) => prev.map((b) => (b.month === month ? { ...b, amount: 0 } : b)));
  };

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

  const addGoal = (goalData: Omit<Goal, 'id' | 'allocated'> & { initialAllocation?: number }) => {
    const id = `goal_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
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

  const addDebt = (data: NewDebtData) => {
    const isBank = data.type === 'BANK_LOAN';
    let cp = counterparties.find((c) => c.name.toLowerCase() === data.counterpartyName.toLowerCase());
    let cpId = cp?.id;
    if (!cp) {
      cpId = `cp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      const newCp: Counterparty = {
        id: cpId,
        name: data.counterpartyName,
        kind: isBank ? 'BANK' : 'PERSON',
        contact: data.contact,
      };
      setCounterparties((prev) => [...prev, newCp]);
    }

    const newLedgerItem: DebtLedgerItem = {
      id: `dl_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
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
      amortizationSchedule: data.amortizationSchedule,
      scheduleFileName: data.scheduleFileName,
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
                c.id === item.counterpartyId ? { ...c, name: counterpartyName, contact: contact ?? c.contact } : c
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

  const repayDebt = (counterpartyId: string, amount: number, accountId: string, description: string) => {
    const cp = counterparties.find((c) => c.id === counterpartyId);
    const cpName = cp ? cp.name : 'Contact';

    const items = debtLedger.filter((d) => d.counterpartyId === counterpartyId);
    let netBalance = 0;
    for (const item of items) {
      if (item.type === 'CREDIT_GIVEN') netBalance += item.amount;
      if (item.type === 'CREDIT_REPAID') netBalance -= item.amount;
      if (item.type === 'LOAN_RECEIVED' || item.type === 'BANK_LOAN') netBalance -= item.remainingCapital ?? item.amount;
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

  const addAccount = (accData: Omit<Account, 'id'>): string => {
    const id = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setAccounts((prev) => [...prev, { ...accData, id }]);
    return id;
  };

  const updateAccount = (updatedAcc: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) return;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const transferBetweenAccounts = (fromId: string, toId: string, amount: number, note?: string) => {
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
      amount: amount,
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

  const addAsset = (assetData: Omit<Asset, 'id'>) => {
    const id = `ast_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setAssets((prev) => [...prev, { ...assetData, id }]);
  };

  const updateAsset = (updatedAsset: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const addRecurring = (recData: Omit<RecurringItem, 'id'>) => {
    const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setRecurring((prev) => [...prev, { ...recData, id }]);
  };

  const updateRecurring = (updatedRec: RecurringItem) => {
    setRecurring((prev) => prev.map((r) => (r.id === updatedRec.id ? updatedRec : r)));
  };

  const deleteRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRecurringActive = (id: string) => {
    setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
  };

  const toggleHideAmounts = () => {
    setUserSettings((prev) => ({ ...prev, hideAmounts: !prev.hideAmounts }));
  };

  const toggleTheme = () => {
    setUserSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const setCurrency = (currency: string) => {
    setUserSettings((prev) => ({ ...prev, primaryCurrency: currency }));
  };

  const setAccentColor = (color: string) => {
    setUserSettings((prev) => ({ ...prev, accentColor: color }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToZero = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('tresoria_') || key.startsWith('liquimind_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}

    const zeroAccount: Account = {
      id: 'acc_main',
      name: 'Compte Principal',
      type: 'CHECKING',
      spaceId: 'personal',
      balance: 0,
      currency: userSettings.primaryCurrency || 'MAD',
      bankName: 'Compte bancaire',
      color: '#1d4ed8',
    };

    setAccounts([zeroAccount]);
    setCategories((prev) => prev.map((c) => ({ ...c, expectedAmount: 0 })));
    setTransactions([]);
    setDebtLedger([]);
    setCounterparties([]);
    setAssets([]);
    setRecurring([]);
    setGoals([]);
    setBudgets([]);
    setStagedTransactions([]);
    setNotifications([
      {
        id: `notif_${Date.now()}`,
        title: 'Remise à zéro effectuée',
        message: 'Tous les comptes, transactions, dettes, budgets et prévisions ont été remis à 0 DH.',
        date: new Date().toISOString().slice(0, 10),
        read: false,
        type: 'info',
      },
    ]);
    setChatHistory([
      {
        id: 'msg_welcome_reset',
        role: 'assistant',
        content: 'Bonjour ! Votre espace LiquiMind est entièrement remis à 0 DH. Que souhaitez-vous configurer en premier ?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const resetToDemo = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('tresoria_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}

    setSpaces(INITIAL_SPACES);
    setAccounts(DEMO_ACCOUNTS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(DEMO_TRANSACTIONS);
    setBudgets(DEMO_BUDGETS);
    setCounterparties(DEMO_COUNTERPARTIES);
    setDebtLedger(DEMO_DEBT_LEDGER);
    setGoals(DEMO_GOALS);
    setAssets(DEMO_ASSETS);
    setRecurring(DEMO_RECURRING);
    setNotifications([
      {
        id: `notif_${Date.now()}`,
        title: 'Données démo rechargées',
        message: 'Le jeu complet de données de démonstration (salaires, charges, BVC, crédits) a été rechargé.',
        date: new Date().toISOString().slice(0, 10),
        read: false,
        type: 'success',
      },
    ]);
  };

  const exportDataJson = (): string => {
    return JSON.stringify(
      {
        version: '3.5.0',
        exportedAt: new Date().toISOString(),
        spaces,
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
      if (Array.isArray(data.spaces)) setSpaces(data.spaces);
      if (Array.isArray(data.accounts)) setAccounts(data.accounts);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.budgets)) setBudgets(data.budgets);
      if (Array.isArray(data.counterparties)) setCounterparties(data.counterparties);
      if (Array.isArray(data.debtLedger)) setDebtLedger(data.debtLedger);
      if (Array.isArray(data.goals)) setGoals(data.goals);
      if (Array.isArray(data.assets)) setAssets(data.assets);
      if (Array.isArray(data.recurring)) setRecurring(data.recurring);
      if (data.userSettings) setUserSettings(data.userSettings);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        spaces,
        activeSpaceId,
        setActiveSpaceId,
        updateSpace,
        addSpace,
        isCollaboratorsModalOpen,
        setIsCollaboratorsModalOpen,
        collaboratorSpaceTarget,
        openCollaboratorsModal,
        inviteCollaborator,
        removeCollaborator,
        updateCollaboratorRole,
        updateCollaboratorPermissions,
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
        authUser,
        isSyncingCloud,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsGuest,
        logout,
        logoutGoogle,
        syncNowWithCloud,
        isAIOnboardingOpen,
        setIsAIOnboardingOpen,
        isAndroidModalOpen,
        setIsAndroidModalOpen,
        chatHistory,
        setChatHistory,
        clearChatHistory,
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
        periodRange,
        setPeriodVision,
        setPeriodReferenceDate,
        setCustomPeriod,
        navigatePeriodRange,
        isDateInActivePeriod,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addBudget,
        isAddCategoryModalOpen,
        setIsAddCategoryModalOpen,
        addCategoryDefaultKind,
        openAddCategoryModal,
        addCategory,
        deleteCategory,
        resetFixedBudgets,
        resetVariableBudgets,
        resetGroupBudgets,
        resetAllBudgets,
        isStatementReviewOpen,
        setIsStatementReviewOpen,
        stagedTransactions,
        setStagedTransactions,
        confirmStagedImport,
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
        markAIOnboardingSeen,
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

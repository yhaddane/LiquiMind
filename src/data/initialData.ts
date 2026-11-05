import {
  Space,
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
  AmortizationRow,
} from '../types';

// ============================================================================
// 1. INITIAL ZERO STATE (Démarrage par défaut à 0 DH selon la demande)
// ============================================================================

export const INITIAL_SPACES: Space[] = [
  {
    id: 'personal',
    name: 'Personnel',
    tag: 'Perso',
    icon: '👤',
    ownerEmail: 'yhaddane@gmail.com',
    collaborators: [
      {
        id: 'collab_owner',
        email: 'yhaddane@gmail.com',
        name: 'Yassine (Propriétaire)',
        role: 'OWNER',
        status: 'ACTIVE',
        invitedAt: '2026-11-01',
        permissions: {
          canAddTransactions: true,
          canEditBudgets: true,
          canManageAccounts: true,
          canInviteOthers: true,
          canViewReports: true,
        },
      },
    ],
  },
  {
    id: 'pro',
    name: 'Studio Nour',
    tag: 'Pro',
    icon: '💼',
    ownerEmail: 'yhaddane@gmail.com',
    collaborators: [
      {
        id: 'collab_pro_owner',
        email: 'yhaddane@gmail.com',
        name: 'Yassine (Admin Pro)',
        role: 'OWNER',
        status: 'ACTIVE',
        invitedAt: '2026-11-01',
        permissions: {
          canAddTransactions: true,
          canEditBudgets: true,
          canManageAccounts: true,
          canInviteOthers: true,
          canViewReports: true,
        },
      },
    ],
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_main',
    name: 'Compte Principal',
    type: 'CHECKING',
    spaceId: 'personal',
    balance: 0,
    currency: 'MAD',
    bankName: 'Compte bancaire',
    color: '#1d4ed8',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Personal Income
  { id: 'cat_salary', spaceId: 'personal', name: 'Salaire & Revenus', kind: 'FIXED_INCOME', direction: 'IN', icon: '💼', expectedAmount: 0, order: 1 },
  { id: 'cat_family', spaceId: 'personal', name: 'Allocations & Aides', kind: 'FIXED_INCOME', direction: 'IN', icon: '👨👩👧', expectedAmount: 0, order: 2 },
  { id: 'cat_gifts_in', spaceId: 'personal', name: 'Revenus divers', kind: 'INCOME', direction: 'IN', icon: '🎁', order: 3 },

  // Personal Fixed Expenses Group
  { id: 'group_fixed', spaceId: 'personal', name: 'Dépenses fixes', isGroup: true, kind: 'FIXED_EXPENSE', icon: '📌', order: 10 },
  { id: 'cat_rent', parentId: 'group_fixed', spaceId: 'personal', name: 'Loyer / Logement', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🏠', expectedAmount: 0, order: 11 },
  { id: 'cat_utilities', parentId: 'group_fixed', spaceId: 'personal', name: 'Eau & Électricité', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🔌', expectedAmount: 0, order: 12 },
  { id: 'cat_internet', parentId: 'group_fixed', spaceId: 'personal', name: 'Internet & Forfaits', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🛜', expectedAmount: 0, order: 13 },
  { id: 'cat_school', parentId: 'group_fixed', spaceId: 'personal', name: 'Scolarité / Formations', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🎒', expectedAmount: 0, order: 14 },
  { id: 'cat_health', parentId: 'group_fixed', spaceId: 'personal', name: 'Santé & Assurances', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🏥', expectedAmount: 0, order: 15 },
  { id: 'cat_subscriptions', parentId: 'group_fixed', spaceId: 'personal', name: 'Abonnements & Loisirs', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🎬', expectedAmount: 0, order: 16 },

  // Personal Variable Expenses Group
  { id: 'group_variable', spaceId: 'personal', name: 'Dépenses variables', isGroup: true, kind: 'VARIABLE_EXPENSE', icon: '🧺', order: 30 },
  { id: 'cat_groceries', parentId: 'group_variable', spaceId: 'personal', name: 'Alimentation & Courses', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '🛒', expectedAmount: 0, order: 31 },
  { id: 'cat_restaurants', parentId: 'group_variable', spaceId: 'personal', name: 'Restaurants & Cafés', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '🍽️', expectedAmount: 0, order: 32 },
  { id: 'cat_fuel', parentId: 'group_variable', spaceId: 'personal', name: 'Transport & Carburant', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '⛽', expectedAmount: 0, order: 33 },
  { id: 'cat_shopping', parentId: 'group_variable', spaceId: 'personal', name: 'Shopping & Habillement', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '👕', expectedAmount: 0, order: 34 },
  { id: 'cat_misc', parentId: 'group_variable', spaceId: 'personal', name: 'Dépenses imprévues', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '📦', expectedAmount: 0, order: 35 },

  // Pro Income & Expenses
  { id: 'cat_pro_retainer', spaceId: 'pro', name: 'Facturation clients / Prestations', kind: 'FIXED_INCOME', direction: 'IN', icon: '🤝', expectedAmount: 0, order: 50 },
  { id: 'group_pro_fixed', spaceId: 'pro', name: 'Charges professionnelles', isGroup: true, kind: 'FIXED_EXPENSE', icon: '📌', order: 60 },
  { id: 'cat_pro_coworking', parentId: 'group_pro_fixed', spaceId: 'pro', name: 'Bureaux & Équipements', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🏢', expectedAmount: 0, order: 61 },
  { id: 'cat_pro_software', parentId: 'group_pro_fixed', spaceId: 'pro', name: 'Logiciels & Outils pro', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🧩', expectedAmount: 0, order: 62 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BUDGETS: BudgetEnvelope[] = [];
export const INITIAL_COUNTERPARTIES: Counterparty[] = [];
export const INITIAL_DEBT_LEDGER: DebtLedgerItem[] = [];
export const INITIAL_GOALS: Goal[] = [];
export const INITIAL_ASSETS: Asset[] = [];
export const INITIAL_RECURRING: RecurringItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_welcome',
    title: 'Bienvenue sur LiquiMind',
    message: 'Tous les compteurs et prévisions démarrent à 0 DH. Utilisez l\'Onboarding IA ou saisissez vos comptes.',
    date: '2026-11-05',
    read: false,
    type: 'success',
  },
];

export const INITIAL_USER_SETTINGS: UserSettings = {
  userName: 'Yassine Haddane',
  email: 'yhaddane@gmail.com',
  primaryCurrency: 'MAD',
  locale: 'fr',
  theme: 'light', // Mode clair au démarrage par défaut
  accentColor: 'cobalt', // Bleu cobalt par défaut
  hideAmounts: false,
  onboardingCompleted: true,
  aiOnboardingPromptSeen: false,
  activeSpaceId: 'all',
  streakDays: 1,
  lastActivityDate: '2026-11-05',
};

// ============================================================================
// 2. DEMO DATASET (Disponible à tout moment via "Recharger données démo")
// ============================================================================

export const DEMO_ACCOUNTS: Account[] = [
  {
    id: 'acc_checking',
    name: 'Compte courant',
    type: 'CHECKING',
    spaceId: 'personal',
    balance: 14500,
    currency: 'MAD',
    bankName: 'Attijariwafa Bank',
    color: '#1d4ed8',
  },
  {
    id: 'acc_savings',
    name: 'Compte épargne',
    type: 'SAVINGS',
    spaceId: 'personal',
    balance: 32000,
    currency: 'MAD',
    bankName: 'CIH Bank',
    color: '#38bdf8',
  },
  {
    id: 'acc_cash',
    name: 'Espèces (Cash)',
    type: 'CASH',
    spaceId: 'personal',
    balance: 700,
    currency: 'MAD',
    color: '#fbbf24',
  },
  {
    id: 'acc_pro',
    name: 'Compte pro',
    type: 'PRO',
    spaceId: 'pro',
    balance: 8000,
    currency: 'MAD',
    bankName: 'Bank of Africa',
    alertThreshold: 5000,
    color: '#a78bfa',
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', accountId: 'acc_checking', categoryId: 'cat_salary', spaceId: 'personal', date: '2026-11-01', amount: 21000, currency: 'MAD', description: 'Virement salaire — Atlas Digital', isRecurring: true },
  { id: 'tx_2', accountId: 'acc_checking', categoryId: 'cat_rent', spaceId: 'personal', date: '2026-11-02', amount: -4200, currency: 'MAD', description: 'Loyer appartement Maârif', isRecurring: true },
  { id: 'tx_3', accountId: 'acc_checking', categoryId: 'cat_school', spaceId: 'personal', date: '2026-11-02', amount: -2200, currency: 'MAD', description: 'École Al Jabr — mensualité', isRecurring: true },
  { id: 'tx_4', accountId: 'acc_checking', categoryId: 'cat_subscriptions', spaceId: 'personal', date: '2026-11-04', amount: -299, currency: 'MAD', description: 'City Club Casablanca', isRecurring: true },
  { id: 'tx_5', accountId: 'acc_checking', categoryId: 'cat_family', spaceId: 'personal', date: '2026-11-05', amount: 300, currency: 'MAD', description: 'CNSS — allocations familiales', isRecurring: true },
  { id: 'tx_6', accountId: 'acc_checking', categoryId: 'cat_groceries', spaceId: 'personal', date: '2026-11-03', amount: -650, currency: 'MAD', description: 'Marjane Market Gauthier' },
  { id: 'tx_7', accountId: 'acc_cash', categoryId: 'cat_groceries', spaceId: 'personal', date: '2026-11-04', amount: -35, currency: 'MAD', description: 'Boulangerie Amoud' },
  { id: 'tx_8', accountId: 'acc_checking', categoryId: 'cat_fuel', spaceId: 'personal', date: '2026-11-04', amount: -350, currency: 'MAD', description: 'Station Afriquia Zerktouni' },
  { id: 'tx_9', accountId: 'acc_cash', categoryId: 'cat_restaurants', spaceId: 'personal', date: '2026-11-05', amount: -28, currency: 'MAD', description: 'Café Bianca' },
  { id: 'tx_10', accountId: 'acc_checking', categoryId: 'cat_restaurants', spaceId: 'personal', date: '2026-11-04', amount: -120, currency: 'MAD', description: 'Glovo Burger & Co' },
  { id: 'tx_p1', accountId: 'acc_pro', categoryId: 'cat_pro_retainer', spaceId: 'pro', date: '2026-11-05', amount: 6000, currency: 'MAD', description: 'Riad Zitoun — abonnement mensuel', isRecurring: true },
  { id: 'tx_p2', accountId: 'acc_pro', categoryId: 'cat_pro_coworking', spaceId: 'pro', date: '2026-11-02', amount: -1500, currency: 'MAD', description: 'Technopark — poste coworking', isRecurring: true },
  { id: 'tx_p3', accountId: 'acc_pro', categoryId: 'cat_pro_software', spaceId: 'pro', date: '2026-11-03', amount: -450, currency: 'MAD', description: 'Adobe Creative Cloud + Figma', isRecurring: true },
];

export const DEMO_BUDGETS: BudgetEnvelope[] = [
  { id: 'b_1', categoryId: 'cat_rent', month: '2026-11', amount: 4200, currency: 'MAD' },
  { id: 'b_2', categoryId: 'cat_school', month: '2026-11', amount: 2200, currency: 'MAD' },
  { id: 'b_3', categoryId: 'cat_utilities', month: '2026-11', amount: 550, currency: 'MAD' },
  { id: 'b_4', categoryId: 'cat_internet', month: '2026-11', amount: 399, currency: 'MAD' },
  { id: 'b_5', categoryId: 'cat_groceries', month: '2026-11', amount: 2500, currency: 'MAD' },
  { id: 'b_6', categoryId: 'cat_fuel', month: '2026-11', amount: 1000, currency: 'MAD' },
  { id: 'b_7', categoryId: 'cat_restaurants', month: '2026-11', amount: 800, currency: 'MAD' },
];

export const DEMO_COUNTERPARTIES: Counterparty[] = [
  { id: 'cp_1', name: 'Youssef El Amrani', kind: 'PERSON', contact: '+212 6 61 23 45 67' },
  { id: 'cp_2', name: 'Karim Berrada', kind: 'PERSON', contact: '+212 6 70 98 76 54' },
  { id: 'cp_bank_1', name: 'Attijariwafa Bank', kind: 'BANK', contact: '05 22 29 88 88' },
];

const SAMPLE_AMORTIZATION: AmortizationRow[] = [
  { installmentNumber: 41, dueDate: '2026-09-15', payment: 3850, principal: 2320, interest: 1380, insurance: 150, remainingBalance: 389660, isPaid: true },
  { installmentNumber: 42, dueDate: '2026-10-15', payment: 3850, principal: 2330, interest: 1370, insurance: 150, remainingBalance: 387330, isPaid: true },
  { installmentNumber: 43, dueDate: '2026-11-15', payment: 3850, principal: 2330, interest: 1370, insurance: 150, remainingBalance: 385000, isPaid: false },
  { installmentNumber: 44, dueDate: '2026-12-15', payment: 3850, principal: 2342, interest: 1358, insurance: 150, remainingBalance: 382658, isPaid: false },
  { installmentNumber: 45, dueDate: '2027-01-15', payment: 3850, principal: 2350, interest: 1350, insurance: 150, remainingBalance: 380308, isPaid: false },
  { installmentNumber: 46, dueDate: '2027-02-15', payment: 3850, principal: 2360, interest: 1340, insurance: 150, remainingBalance: 377948, isPaid: false },
];

export const DEMO_DEBT_LEDGER: DebtLedgerItem[] = [
  { id: 'dl_1', counterpartyId: 'cp_1', spaceId: 'personal', date: '2026-09-15', type: 'CREDIT_GIVEN', amount: 2000, currency: 'MAD', description: 'Prêt amical pour avance travaux' },
  { id: 'dl_2', counterpartyId: 'cp_1', spaceId: 'personal', date: '2026-10-20', type: 'CREDIT_REPAID', amount: 1000, currency: 'MAD', description: 'Premier remboursement virement' },
  {
    id: 'dl_bank_1',
    counterpartyId: 'cp_bank_1',
    spaceId: 'personal',
    date: '2023-04-15',
    type: 'BANK_LOAN',
    amount: 420000,
    currency: 'MAD',
    description: 'Crédit Immobilier Résidence Maârif',
    bankName: 'Attijariwafa Bank',
    monthlyPayment: 3850,
    interestRate: 4.25,
    remainingCapital: 385000,
    endDate: '2038-04-30',
    amortizationSchedule: SAMPLE_AMORTIZATION,
    scheduleFileName: 'Echeancier_Attijari_Maarif.xlsx',
  },
];

export const DEMO_GOALS: Goal[] = [
  {
    id: 'goal_1',
    spaceId: 'personal',
    name: "Fonds d'urgence (6 mois)",
    icon: '🚨',
    targetAmount: 40000,
    allocated: 20000,
    deadline: '2027-09-01',
    priority: 1,
  },
  {
    id: 'goal_2',
    spaceId: 'personal',
    name: 'Omra Ramadan 2027',
    icon: '🕋',
    targetAmount: 25000,
    allocated: 7500,
    deadline: '2027-02-01',
    priority: 2,
  },
];

export const DEMO_ASSETS: Asset[] = [
  {
    id: 'ast_1',
    name: 'Appartement Maârif (Résidence principale)',
    category: 'REAL_ESTATE',
    value: 1200000,
    purchaseValue: 980000,
    currency: 'MAD',
    color: '#1d4ed8',
    location: 'Casablanca, Maârif',
    notes: 'Acheté en 2021, estimé à 1.2M DH',
  },
  {
    id: 'ast_2',
    name: 'Lingot Or & Pièces 24K',
    category: 'GOLD',
    value: 35000,
    purchaseValue: 28000,
    currency: 'MAD',
    color: '#ddad71',
    notes: 'Épargne de précaution en or physique',
  },
  {
    id: 'ast_stocks',
    name: 'Portefeuille Bourse Casablanca & OPCVM',
    category: 'STOCKS',
    value: 48950,
    purchaseValue: 42000,
    currency: 'MAD',
    color: '#6fa89a',
    notes: 'Compte titres Attijari Global Research & Crypto',
    holdings: [
      {
        id: 'h_1',
        symbol: 'ATW',
        name: 'Attijariwafa Bank',
        instrumentType: 'STOCK',
        quantity: 30,
        buyPrice: 510,
        currentPrice: 554,
        lastUpdated: '2026-11-05',
      },
      {
        id: 'h_2',
        symbol: 'IAM',
        name: 'Maroc Telecom',
        instrumentType: 'STOCK',
        quantity: 150,
        buyPrice: 95,
        currentPrice: 99.8,
        lastUpdated: '2026-11-05',
      },
      {
        id: 'h_3',
        symbol: 'WAFA-ACT',
        name: 'FCP Wafa Actions Croissance',
        instrumentType: 'OPCVM',
        quantity: 5,
        buyPrice: 1720,
        currentPrice: 1845.2,
        lastUpdated: '2026-11-05',
      },
      {
        id: 'h_4',
        symbol: 'BTC',
        name: 'Bitcoin (BTC)',
        instrumentType: 'CRYPTO',
        quantity: 0.015,
        buyPrice: 650000,
        currentPrice: 978500,
        lastUpdated: '2026-11-05',
      },
    ],
  },
];

export const DEMO_RECURRING: RecurringItem[] = [
  { id: 'rec_1', label: 'Salaire mensuel', cadence: 'MONTHLY', dayOfMonth: 1, amountHint: 21000, categoryId: 'cat_salary', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_2', label: 'Loyer appartement', cadence: 'MONTHLY', dayOfMonth: 2, amountHint: -4200, categoryId: 'cat_rent', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_3', label: 'Mensualité Crédit Immo Attijari', cadence: 'MONTHLY', dayOfMonth: 15, amountHint: -3850, categoryId: 'cat_rent', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_4', label: 'Facture Lydec (Eau & Élec)', cadence: 'MONTHLY', dayOfMonth: 14, amountHint: -550, categoryId: 'cat_utilities', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_5', label: 'Orange Fibre', cadence: 'MONTHLY', dayOfMonth: 8, amountHint: -399, categoryId: 'cat_internet', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
];

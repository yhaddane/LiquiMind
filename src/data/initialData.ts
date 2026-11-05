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

export const INITIAL_SPACES: Space[] = [
  { id: 'personal', name: 'Personnel', tag: 'Perso', icon: '👤' },
  { id: 'pro', name: 'Studio Nour', tag: 'Pro', icon: '💼' },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_checking',
    name: 'Compte courant',
    type: 'CHECKING',
    spaceId: 'personal',
    balance: 14500,
    currency: 'MAD',
    bankName: 'Attijariwafa Bank',
    color: '#c4f24e',
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

export const INITIAL_CATEGORIES: Category[] = [
  // Personal Income
  { id: 'cat_salary', spaceId: 'personal', name: 'Salaire', kind: 'FIXED_INCOME', direction: 'IN', icon: '💼', expectedAmount: 21000, order: 1 },
  { id: 'cat_family', spaceId: 'personal', name: 'Allocations familiales', kind: 'FIXED_INCOME', direction: 'IN', icon: '👨👩👧', expectedAmount: 300, order: 2 },
  { id: 'cat_gifts_in', spaceId: 'personal', name: 'Cadeaux reçus', kind: 'INCOME', direction: 'IN', icon: '🎁', order: 3 },

  // Personal Fixed Expenses Group
  { id: 'group_fixed', spaceId: 'personal', name: 'Dépenses fixes', isGroup: true, kind: 'FIXED_EXPENSE', icon: '📌', order: 10 },
  { id: 'cat_rent', parentId: 'group_fixed', spaceId: 'personal', name: 'Loyer', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🏠', expectedAmount: 4200, order: 11 },
  { id: 'cat_utilities', parentId: 'group_fixed', spaceId: 'personal', name: 'Eau & électricité', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🔌', expectedAmount: 550, order: 12 },
  { id: 'cat_internet', parentId: 'group_fixed', spaceId: 'personal', name: 'Internet fibre', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🛜', expectedAmount: 399, order: 13 },
  { id: 'cat_phone', parentId: 'group_fixed', spaceId: 'personal', name: 'Téléphone', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '📱', expectedAmount: 149, order: 14 },
  { id: 'cat_school', parentId: 'group_fixed', spaceId: 'personal', name: 'École', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🎒', expectedAmount: 2200, order: 15 },
  { id: 'cat_health', parentId: 'group_fixed', spaceId: 'personal', name: 'Assurance santé', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🏥', expectedAmount: 450, order: 16 },
  { id: 'cat_streaming', parentId: 'group_fixed', spaceId: 'personal', name: 'Netflix', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🎬', expectedAmount: 65, order: 17 },
  { id: 'cat_gym', parentId: 'group_fixed', spaceId: 'personal', name: 'Salle de sport', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🏋️', expectedAmount: 299, order: 18 },
  { id: 'cat_parents', parentId: 'group_fixed', spaceId: 'personal', name: 'Aide aux parents', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🤲', expectedAmount: 800, order: 19 },

  // Personal Variable Expenses Group
  { id: 'group_variable', spaceId: 'personal', name: 'Dépenses variables', isGroup: true, kind: 'VARIABLE_EXPENSE', icon: '🧺', order: 30 },
  { id: 'cat_groceries', parentId: 'group_variable', spaceId: 'personal', name: 'Courses', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '🛒', expectedAmount: 2500, order: 31 },
  { id: 'cat_bakery', parentId: 'group_variable', spaceId: 'personal', name: 'Boulangerie', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '🥖', expectedAmount: 200, order: 32 },
  { id: 'cat_cafe', parentId: 'group_variable', spaceId: 'personal', name: 'Café', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '☕', expectedAmount: 350, order: 33 },
  { id: 'cat_restaurants', parentId: 'group_variable', spaceId: 'personal', name: 'Restaurants', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '🍽️', expectedAmount: 800, order: 34 },
  { id: 'cat_delivery', parentId: 'group_variable', spaceId: 'personal', name: 'Livraison (Glovo)', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '🛵', expectedAmount: 400, order: 35 },
  { id: 'cat_fuel', parentId: 'group_variable', spaceId: 'personal', name: 'Carburant', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '⛽', expectedAmount: 1000, order: 36 },
  { id: 'cat_taxi', parentId: 'group_variable', spaceId: 'personal', name: 'Taxi / VTC', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '🚕', expectedAmount: 200, order: 37 },
  { id: 'cat_shopping', parentId: 'group_variable', spaceId: 'personal', name: 'Shopping', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '👕', expectedAmount: 600, order: 38 },
  { id: 'cat_pharmacy', parentId: 'group_variable', spaceId: 'personal', name: 'Pharmacie', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '💊', expectedAmount: 300, order: 39 },
  { id: 'cat_outings', parentId: 'group_variable', spaceId: 'personal', name: 'Sorties & Loisirs', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '🎡', expectedAmount: 400, order: 40 },
  { id: 'cat_hammam', parentId: 'group_variable', spaceId: 'personal', name: 'Hammam & Soins', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '🧖', expectedAmount: 250, order: 41 },
  { id: 'cat_gifts', parentId: 'group_variable', spaceId: 'personal', name: 'Cadeaux', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '🎁', expectedAmount: 300, order: 42 },
  { id: 'cat_misc', parentId: 'group_variable', spaceId: 'personal', name: 'Divers', kind: 'VARIABLE_EXPENSE', direction: 'OUT', icon: '📦', expectedAmount: 300, order: 43 },

  // Pro Income & Expenses
  { id: 'cat_pro_retainer', spaceId: 'pro', name: 'Abonnements mensuels', kind: 'FIXED_INCOME', direction: 'IN', icon: '🤝', expectedAmount: 6000, order: 50 },
  { id: 'cat_pro_clients', spaceId: 'pro', name: 'Factures clients', kind: 'INCOME', direction: 'IN', icon: '💻', order: 51 },
  { id: 'group_pro_fixed', spaceId: 'pro', name: 'Charges fixes pro', isGroup: true, kind: 'FIXED_EXPENSE', icon: '📌', order: 60 },
  { id: 'cat_pro_coworking', parentId: 'group_pro_fixed', spaceId: 'pro', name: 'Coworking Technopark', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🏢', expectedAmount: 1500, order: 61 },
  { id: 'cat_pro_software', parentId: 'group_pro_fixed', spaceId: 'pro', name: 'Logiciels (Adobe, Figma)', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🧩', expectedAmount: 450, order: 62 },
  { id: 'cat_pro_accountant', parentId: 'group_pro_fixed', spaceId: 'pro', name: 'Cabinet comptable', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🧾', expectedAmount: 800, order: 63 },
  { id: 'cat_pro_cnss', parentId: 'group_pro_fixed', spaceId: 'pro', name: 'Cotisation CNSS Pro', kind: 'FIXED_EXPENSE', direction: 'OUT', icon: '🏛️', expectedAmount: 1100, order: 64 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Current month (November 2026)
  { id: 'tx_1', accountId: 'acc_checking', categoryId: 'cat_salary', spaceId: 'personal', date: '2026-11-01', amount: 21000, currency: 'MAD', description: 'Virement salaire — Atlas Digital', isRecurring: true },
  { id: 'tx_2', accountId: 'acc_checking', categoryId: 'cat_rent', spaceId: 'personal', date: '2026-11-02', amount: -4200, currency: 'MAD', description: 'Loyer appartement Maârif', isRecurring: true },
  { id: 'tx_3', accountId: 'acc_checking', categoryId: 'cat_school', spaceId: 'personal', date: '2026-11-02', amount: -2200, currency: 'MAD', description: 'École Al Jabr — mensualité', isRecurring: true },
  { id: 'tx_4', accountId: 'acc_checking', categoryId: 'cat_gym', spaceId: 'personal', date: '2026-11-04', amount: -299, currency: 'MAD', description: 'City Club Casablanca', isRecurring: true },
  { id: 'tx_5', accountId: 'acc_checking', categoryId: 'cat_family', spaceId: 'personal', date: '2026-11-05', amount: 300, currency: 'MAD', description: 'CNSS — allocations familiales', isRecurring: true },
  { id: 'tx_6', accountId: 'acc_checking', categoryId: 'cat_groceries', spaceId: 'personal', date: '2026-11-03', amount: -650, currency: 'MAD', description: 'Marjane Market Gauthier' },
  { id: 'tx_7', accountId: 'acc_cash', categoryId: 'cat_bakery', spaceId: 'personal', date: '2026-11-04', amount: -35, currency: 'MAD', description: 'Boulangerie Amoud' },
  { id: 'tx_8', accountId: 'acc_checking', categoryId: 'cat_fuel', spaceId: 'personal', date: '2026-11-04', amount: -350, currency: 'MAD', description: 'Station Afriquia Zerktouni' },
  { id: 'tx_9', accountId: 'acc_cash', categoryId: 'cat_cafe', spaceId: 'personal', date: '2026-11-05', amount: -28, currency: 'MAD', description: 'Café Bianca' },
  { id: 'tx_10', accountId: 'acc_checking', categoryId: 'cat_delivery', spaceId: 'personal', date: '2026-11-04', amount: -120, currency: 'MAD', description: 'Glovo Burger & Co' },

  // Pro transactions
  { id: 'tx_p1', accountId: 'acc_pro', categoryId: 'cat_pro_retainer', spaceId: 'pro', date: '2026-11-05', amount: 6000, currency: 'MAD', description: 'Riad Zitoun — abonnement mensuel', isRecurring: true },
  { id: 'tx_p2', accountId: 'acc_pro', categoryId: 'cat_pro_coworking', spaceId: 'pro', date: '2026-11-02', amount: -1500, currency: 'MAD', description: 'Technopark — poste coworking', isRecurring: true },
  { id: 'tx_p3', accountId: 'acc_pro', categoryId: 'cat_pro_software', spaceId: 'pro', date: '2026-11-03', amount: -450, currency: 'MAD', description: 'Adobe Creative Cloud + Figma', isRecurring: true },

  // Previous month (October 2026)
  { id: 'tx_11', accountId: 'acc_checking', categoryId: 'cat_salary', spaceId: 'personal', date: '2026-10-01', amount: 21000, currency: 'MAD', description: 'Virement salaire — Atlas Digital' },
  { id: 'tx_12', accountId: 'acc_checking', categoryId: 'cat_rent', spaceId: 'personal', date: '2026-10-02', amount: -4200, currency: 'MAD', description: 'Loyer appartement Maârif' },
  { id: 'tx_13', accountId: 'acc_checking', categoryId: 'cat_utilities', spaceId: 'personal', date: '2026-10-14', amount: -520, currency: 'MAD', description: 'Lydec — eau & électricité' },
  { id: 'tx_14', accountId: 'acc_checking', categoryId: 'cat_internet', spaceId: 'personal', date: '2026-10-08', amount: -399, currency: 'MAD', description: 'Orange Fibre 100 Mo' },
  { id: 'tx_15', accountId: 'acc_checking', categoryId: 'cat_groceries', spaceId: 'personal', date: '2026-10-12', amount: -1850, currency: 'MAD', description: 'Carrefour Market Anfa' },
  { id: 'tx_16', accountId: 'acc_checking', categoryId: 'cat_restaurants', spaceId: 'personal', date: '2026-10-18', amount: -480, currency: 'MAD', description: 'La Sqala Casablanca' },
];

export const INITIAL_BUDGETS: BudgetEnvelope[] = [
  { id: 'b_1', categoryId: 'cat_rent', month: '2026-11', amount: 4200, currency: 'MAD' },
  { id: 'b_2', categoryId: 'cat_school', month: '2026-11', amount: 2200, currency: 'MAD' },
  { id: 'b_3', categoryId: 'cat_utilities', month: '2026-11', amount: 550, currency: 'MAD' },
  { id: 'b_4', categoryId: 'cat_internet', month: '2026-11', amount: 399, currency: 'MAD' },
  { id: 'b_5', categoryId: 'cat_groceries', month: '2026-11', amount: 2500, currency: 'MAD' },
  { id: 'b_6', categoryId: 'cat_fuel', month: '2026-11', amount: 1000, currency: 'MAD' },
  { id: 'b_7', categoryId: 'cat_restaurants', month: '2026-11', amount: 800, currency: 'MAD' },
  { id: 'b_8', categoryId: 'cat_delivery', month: '2026-11', amount: 400, currency: 'MAD' },
  { id: 'b_9', categoryId: 'cat_gym', month: '2026-11', amount: 299, currency: 'MAD' },
  { id: 'b_10', categoryId: 'cat_phone', month: '2026-11', amount: 149, currency: 'MAD' },
];

export const INITIAL_COUNTERPARTIES: Counterparty[] = [
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

export const INITIAL_DEBT_LEDGER: DebtLedgerItem[] = [
  { id: 'dl_1', counterpartyId: 'cp_1', spaceId: 'personal', date: '2026-09-15', type: 'CREDIT_GIVEN', amount: 2000, currency: 'MAD', description: 'Prêt amical pour avance travaux' },
  { id: 'dl_2', counterpartyId: 'cp_1', spaceId: 'personal', date: '2026-10-20', type: 'CREDIT_REPAID', amount: 1000, currency: 'MAD', description: 'Premier remboursement virement' },
  { id: 'dl_3', counterpartyId: 'cp_2', spaceId: 'personal', date: '2026-08-10', type: 'CREDIT_GIVEN', amount: 1500, currency: 'MAD', description: 'Dépannage achat billet' },
  { id: 'dl_4', counterpartyId: 'cp_2', spaceId: 'personal', date: '2026-09-05', type: 'CREDIT_REPAID', amount: 1500, currency: 'MAD', description: 'Remboursé en totalité' },
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

export const INITIAL_GOALS: Goal[] = [
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
    name: 'Voyage d’été en famille',
    icon: '🏖️',
    targetAmount: 15000,
    allocated: 6000,
    deadline: '2027-07-01',
    priority: 2,
  },
  {
    id: 'goal_3',
    spaceId: 'personal',
    name: 'Aïd Al-Adha',
    icon: '🐑',
    targetAmount: 5000,
    allocated: 3500,
    deadline: '2027-05-25',
    priority: 3,
  },
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'ast_1',
    name: 'Appartement Maârif (Casablanca)',
    category: 'REAL_ESTATE',
    value: 1200000,
    purchaseValue: 1050000,
    currency: 'MAD',
    color: '#b3dd62',
    location: 'Quartier Maârif, Casablanca',
    notes: 'Estimé à 14 000 DH/m² - surface 85 m²',
  },
  {
    id: 'ast_2',
    name: 'Portefeuille BVC & OPCVM Actions',
    category: 'STOCKS',
    value: 92450,
    purchaseValue: 78500,
    currency: 'MAD',
    color: '#6fa89a',
    notes: 'Bourse de Casablanca & OPCVM CDG / Wafa Gestion',
    holdings: [
      {
        id: 'h_atw',
        symbol: 'ATW',
        name: 'Attijariwafa Bank',
        instrumentType: 'STOCK',
        quantity: 60,
        buyPrice: 465,
        currentPrice: 548,
        lastUpdated: '2026-11-05',
      },
      {
        id: 'h_iam',
        symbol: 'IAM',
        name: 'Itissalat Al-Maghrib (Maroc Telecom)',
        instrumentType: 'STOCK',
        quantity: 150,
        buyPrice: 92,
        currentPrice: 99.5,
        lastUpdated: '2026-11-05',
      },
      {
        id: 'h_opcvm_1',
        symbol: 'WAFA-ACT',
        name: 'FCP Wafa Actions Croissance (OPCVM)',
        instrumentType: 'OPCVM',
        quantity: 25,
        buyPrice: 1472,
        currentPrice: 1785.8,
        lastUpdated: '2026-11-05',
      },
    ],
  },
  {
    id: 'ast_3',
    name: 'Or d’investissement & Bijoux 18K/24K',
    category: 'GOLD',
    value: 45000,
    purchaseValue: 36000,
    currency: 'MAD',
    color: '#ddad71',
    notes: 'Lingotins 50g + pièces Napoléon',
  },
];

export const INITIAL_RECURRING: RecurringItem[] = [
  { id: 'rec_1', label: 'Loyer Maârif', cadence: 'MONTHLY', dayOfMonth: 2, amountHint: 4200, categoryId: 'cat_rent', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_2', label: 'École Al Jabr', cadence: 'MONTHLY', dayOfMonth: 2, amountHint: 2200, categoryId: 'cat_school', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_3', label: 'Orange Fibre 100 Mo', cadence: 'MONTHLY', dayOfMonth: 8, amountHint: 399, categoryId: 'cat_internet', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_4', label: 'Lydec Eau & Électricité', cadence: 'MONTHLY', dayOfMonth: 14, amountHint: 550, categoryId: 'cat_utilities', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_5', label: 'Inwi Forfait Mobile', cadence: 'MONTHLY', dayOfMonth: 8, amountHint: 149, categoryId: 'cat_phone', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_6', label: 'Netflix Standard', cadence: 'MONTHLY', dayOfMonth: 18, amountHint: 65, categoryId: 'cat_streaming', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_7', label: 'City Club Casablanca', cadence: 'MONTHLY', dayOfMonth: 4, amountHint: 299, categoryId: 'cat_gym', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_8', label: 'Aide aux parents', cadence: 'MONTHLY', dayOfMonth: 27, amountHint: 800, categoryId: 'cat_parents', accountId: 'acc_checking', spaceId: 'personal', isActive: true },
  { id: 'rec_9', label: 'Coworking Technopark', cadence: 'MONTHLY', dayOfMonth: 2, amountHint: 1500, categoryId: 'cat_pro_coworking', accountId: 'acc_pro', spaceId: 'pro', isActive: true },
  { id: 'rec_10', label: 'Adobe CC + Figma', cadence: 'MONTHLY', dayOfMonth: 3, amountHint: 450, categoryId: 'cat_pro_software', accountId: 'acc_pro', spaceId: 'pro', isActive: true },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Bienvenue sur LiquiMind',
    message: 'Vos comptes, l’assistant IA, vos prévisions et votre bourse en temps réel sont prêts !',
    date: '2026-11-01',
    read: false,
    type: 'success',
  },
  {
    id: 'notif_2',
    title: 'Rappel récurrent : Facture Lydec',
    message: 'Échéance prévue le 14 Novembre (~550 DH). Compte vérifié : Compte courant.',
    date: '2026-11-04',
    read: false,
    type: 'info',
  },
];

export const INITIAL_USER_SETTINGS: UserSettings = {
  userName: 'Yassine Haddane',
  email: 'yassine.haddane@gmail.com',
  primaryCurrency: 'MAD',
  locale: 'fr',
  theme: 'dark',
  accentColor: '#c4f24e',
  hideAmounts: false,
  onboardingCompleted: true,
  aiOnboardingPromptSeen: false,
  activeSpaceId: 'all',
  streakDays: 14,
  lastActivityDate: '2026-11-05',
};

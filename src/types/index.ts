export type SpaceId = string;

export interface Space {
  id: SpaceId;
  name: string;
  tag: string;
  icon: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH' | 'PRO' | 'INVESTMENT';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  spaceId: SpaceId;
  balance: number;
  currency: string;
  bankName?: string;
  bankLogo?: string;
  color?: string;
  alertThreshold?: number;
}

export interface Category {
  id: string;
  parentId?: string | null;
  spaceId: SpaceId;
  name: string;
  kind?: 'FIXED_INCOME' | 'INCOME' | 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE' | null;
  direction?: 'IN' | 'OUT';
  icon: string;
  customLogoUrl?: string;
  isGroup?: boolean;
  expectedAmount?: number;
  order: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId?: string | null;
  spaceId: SpaceId;
  date: string; // YYYY-MM-DD
  amount: number; // positive = income, negative = expense
  currency: string;
  description: string;
  isRecurring?: boolean;
  recurringDay?: number;
  recurrenceId?: string | null;
  counterpartyId?: string | null;
  transferId?: string | null;
  note?: string;
}

export interface BudgetEnvelope {
  id: string;
  categoryId: string;
  month: string; // YYYY-MM
  amount: number;
  currency: string;
}

export interface Counterparty {
  id: string;
  name: string;
  kind: 'PERSON' | 'BUSINESS' | 'BANK';
  contact?: string;
  isArchived?: boolean;
}

export interface AmortizationRow {
  installmentNumber: number;
  dueDate: string;
  payment: number;
  principal: number;
  interest: number;
  insurance: number;
  remainingBalance: number;
  isPaid: boolean;
}

export interface DebtLedgerItem {
  id: string;
  counterpartyId: string;
  spaceId: SpaceId;
  txId?: string | null;
  date: string;
  type: 'CREDIT_GIVEN' | 'CREDIT_REPAID' | 'LOAN_RECEIVED' | 'LOAN_REPAID' | 'BANK_LOAN';
  amount: number;
  currency: string;
  description: string;
  bankName?: string;
  monthlyPayment?: number;
  interestRate?: number;
  remainingCapital?: number;
  endDate?: string;
  amortizationSchedule?: AmortizationRow[];
  scheduleFileName?: string;
}

export interface Goal {
  id: string;
  spaceId: SpaceId;
  name: string;
  icon: string;
  targetAmount: number;
  allocated: number;
  deadline?: string;
  priority: number;
  isArchived?: boolean;
}

export interface FinancialHolding {
  id: string;
  symbol: string;
  name: string;
  instrumentType: 'STOCK' | 'OPCVM' | 'ETF' | 'CRYPTO' | 'BOND';
  quantity: number;
  buyPrice: number; // PRU (Prix de Revient Unitaire)
  currentPrice: number; // Valeur liquidative / Cours réel
  lastUpdated: string;
}

export interface Asset {
  id: string;
  name: string;
  category: 'REAL_ESTATE' | 'GOLD' | 'STOCKS' | 'CASH' | 'CRYPTO';
  value: number;
  purchaseValue?: number;
  currency: string;
  color: string;
  location?: string;
  notes?: string;
  holdings?: FinancialHolding[];
}

export interface RecurringItem {
  id: string;
  label: string;
  cadence: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  dayOfMonth: number;
  amountHint: number;
  categoryId: string;
  accountId: string;
  spaceId: SpaceId;
  isActive: boolean;
}

export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: 'google' | 'firebase';
  lastSyncedAt?: string;
}

export interface UserSettings {
  userName: string;
  email: string;
  primaryCurrency: string;
  locale: 'fr' | 'en' | 'ar' | 'ary';
  theme: 'dark' | 'light';
  accentColor?: string;
  hideAmounts: boolean;
  onboardingCompleted: boolean;
  aiOnboardingPromptSeen?: boolean;
  activeSpaceId: SpaceId | 'all';
  streakDays: number;
  lastActivityDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export type PeriodVision = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export interface PeriodRange {
  vision: PeriodVision;
  startDate: string;
  endDate: string;
  label: string;
  referenceDate: string;
}

export interface StagedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  categoryId?: string;
  accountId: string;
  sourceType?: 'excel' | 'pdf' | 'word' | 'csv' | 'json';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  chartData?: {
    type: 'cashflow' | 'categories' | 'networth';
    title: string;
    items: Array<{ label: string; value: number; secondaryValue?: number; color?: string }>;
  };
  reportDownloadable?: boolean;
}

export interface AIWeeklyTip {
  id: string;
  title: string;
  category: string;
  potentialSaving: number;
  advice: string;
  actionLabel: string;
  severity: 'high' | 'medium' | 'low';
}

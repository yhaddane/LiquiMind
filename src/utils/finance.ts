import type { Account, Transaction, Asset, PeriodVision, PeriodRange } from '../types/index';

export type { Account, Transaction, Asset, PeriodVision, PeriodRange };

/**
 * Format date object to YYYY-MM-DD
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD safely into Date at local midnight
 */
export function parseDateISO(str: string): Date {
  const parts = str.split('-');
  const y = parseInt(parts[0], 10) || 2026;
  const m = (parseInt(parts[1], 10) || 1) - 1;
  const d = parseInt(parts[2], 10) || 1;
  return new Date(y, m, d);
}

/**
 * Calculate ISO Week number
 */
function getWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

/**
 * Month names in French
 */
const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Get period start, end dates, and human label based on vision
 */
export function getPeriodRange(
  vision: PeriodVision,
  refDateStr: string = '2026-11-05',
  customRange?: { from: string; to: string }
): PeriodRange {
  const ref = parseDateISO(refDateStr);

  if (vision === 'DAILY') {
    const iso = formatDateISO(ref);
    const day = ref.getDate();
    const month = MONTH_NAMES_FR[ref.getMonth()];
    const year = ref.getFullYear();
    return {
      vision: 'DAILY',
      startDate: iso,
      endDate: iso,
      label: `${day} ${month} ${year}`,
      referenceDate: iso,
    };
  }

  if (vision === 'WEEKLY') {
    // Start on Monday, end on Sunday
    const dayOfWeek = (ref.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const start = new Date(ref);
    start.setDate(ref.getDate() - dayOfWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const weekNum = getWeekNumber(ref);
    const startStr = formatDateISO(start);
    const endStr = formatDateISO(end);
    const label = `Semaine ${weekNum} (${start.getDate()} ${MONTH_NAMES_FR[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTH_NAMES_FR[end.getMonth()].slice(0, 3)} ${end.getFullYear()})`;

    return {
      vision: 'WEEKLY',
      startDate: startStr,
      endDate: endStr,
      label,
      referenceDate: formatDateISO(ref),
    };
  }

  if (vision === 'MONTHLY') {
    const y = ref.getFullYear();
    const m = ref.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0); // Last day of month
    const startStr = formatDateISO(start);
    const endStr = formatDateISO(end);
    const label = `${MONTH_NAMES_FR[m]} ${y}`;

    return {
      vision: 'MONTHLY',
      startDate: startStr,
      endDate: endStr,
      label,
      referenceDate: formatDateISO(ref),
    };
  }

  if (vision === 'YEARLY') {
    const y = ref.getFullYear();
    const startStr = `${y}-01-01`;
    const endStr = `${y}-12-31`;
    return {
      vision: 'YEARLY',
      startDate: startStr,
      endDate: endStr,
      label: `Année ${y}`,
      referenceDate: formatDateISO(ref),
    };
  }

  // CUSTOM
  const from = customRange?.from || refDateStr;
  const to = customRange?.to || refDateStr;
  return {
    vision: 'CUSTOM',
    startDate: from <= to ? from : to,
    endDate: from <= to ? to : from,
    label: `Du ${from} au ${to}`,
    referenceDate: refDateStr,
  };
}

/**
 * Navigate period range by +1 or -1 steps
 */
export function navigatePeriod(range: PeriodRange, direction: -1 | 1): PeriodRange {
  const ref = parseDateISO(range.referenceDate);

  if (range.vision === 'DAILY') {
    ref.setDate(ref.getDate() + direction);
    return getPeriodRange('DAILY', formatDateISO(ref));
  }

  if (range.vision === 'WEEKLY') {
    ref.setDate(ref.getDate() + direction * 7);
    return getPeriodRange('WEEKLY', formatDateISO(ref));
  }

  if (range.vision === 'MONTHLY') {
    ref.setMonth(ref.getMonth() + direction);
    return getPeriodRange('MONTHLY', formatDateISO(ref));
  }

  if (range.vision === 'YEARLY') {
    ref.setFullYear(ref.getFullYear() + direction);
    return getPeriodRange('YEARLY', formatDateISO(ref));
  }

  return range;
}

/**
 * Check if a date string falls inside the period range
 */
export function isDateInPeriod(dateStr: string, range: PeriodRange): boolean {
  return dateStr >= range.startDate && dateStr <= range.endDate;
}

/**
 * Sum account balances, optionally filtered by spaceId
 */
export function calculateTotalBalance(accounts: Account[], activeSpaceId?: string | null): number {
  return accounts
    .filter((acc) => !activeSpaceId || acc.spaceId === activeSpaceId)
    .reduce((sum, acc) => sum + acc.balance, 0);
}

/**
 * Calculate period income, expenses, and net savings across a date range
 */
export function calculatePeriodCashflow(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
  activeSpaceId?: string | null
): { income: number; expenses: number; net: number; savingsRate: number; count: number } {
  const periodTxs = transactions.filter((tx) => {
    if (tx.date < startDate || tx.date > endDate) return false;
    if (activeSpaceId && tx.spaceId && tx.spaceId !== activeSpaceId) return false;
    // Don't count internal transfers twice in net cashflow
    if (tx.transferId) return false;
    return true;
  });

  let income = 0;
  let expenses = 0;

  for (const tx of periodTxs) {
    if (tx.amount > 0) {
      income += tx.amount;
    } else {
      expenses += Math.abs(tx.amount);
    }
  }

  const net = income - expenses;
  const savingsRate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;

  return { income, expenses, net, savingsRate, count: periodTxs.length };
}

/**
 * Backward-compatible calculateMonthlyCashflow (calls calculatePeriodCashflow)
 */
export function calculateMonthlyCashflow(
  transactions: Transaction[],
  yearMonth: string,
  activeSpaceId?: string | null
): { income: number; expenses: number; net: number; savingsRate: number } {
  const startDate = `${yearMonth}-01`;
  const [yStr, mStr] = yearMonth.split('-');
  const y = parseInt(yStr, 10) || 2026;
  const m = parseInt(mStr, 10) || 1;
  const lastDay = new Date(y, m, 0).getDate();
  const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;

  const res = calculatePeriodCashflow(transactions, startDate, endDate, activeSpaceId);
  return { income: res.income, expenses: res.expenses, net: res.net, savingsRate: res.savingsRate };
}

/**
 * Calculate financial runway in months
 */
export function calculateRunwayMonths(totalLiquidBalance: number, avgMonthlyExpenses: number): number {
  if (avgMonthlyExpenses <= 0) return 99;
  const runway = totalLiquidBalance / avgMonthlyExpenses;
  return Math.round(runway * 10) / 10;
}

/**
 * Calculate category budget usage status
 */
export function calculateBudgetProgress(budgeted: number, spent: number): {
  percentage: number;
  remaining: number;
  isOver: boolean;
  statusColor: 'green' | 'amber' | 'red';
} {
  const remaining = budgeted - spent;
  const percentage = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
  const isOver = remaining < 0;

  let statusColor: 'green' | 'amber' | 'red' = 'green';
  if (isOver) {
    statusColor = 'red';
  } else if (percentage >= 80) {
    statusColor = 'amber';
  }

  return { percentage, remaining, isOver, statusColor };
}

/**
 * Calculate total net worth including accounts and physical/financial assets
 */
export function calculateNetWorth(accounts: Account[], assets: Asset[]): number {
  const accountSum = accounts.reduce((acc, a) => acc + a.balance, 0);
  const assetSum = assets.reduce((acc, a) => acc + a.value, 0);
  return accountSum + assetSum;
}

/**
 * Currency formatter with Moroccan Dirham (MAD / DH) or international currencies
 */
export function formatCurrency(
  amount: number,
  currency: string = 'MAD',
  locale: string = 'fr-FR'
): string {
  const rounded = Math.round(amount * 100) / 100;
  const isNegative = rounded < 0;
  const abs = Math.abs(rounded);
  
  const formattedNumber = abs.toLocaleString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const sign = isNegative ? '-' : '';

  if (currency === 'MAD') {
    return `${sign}${formattedNumber} DH`;
  }
  if (currency === 'EUR') {
    return `${sign}${formattedNumber} €`;
  }
  if (currency === 'USD') {
    return `${sign}$${formattedNumber}`;
  }
  return `${sign}${formattedNumber} ${currency}`;
}


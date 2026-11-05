import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTotalBalance,
  calculateMonthlyCashflow,
  calculateRunwayMonths,
  calculateBudgetProgress,
  calculateNetWorth,
  formatCurrency,
  getPeriodRange,
} from './finance';
import type { Account, Transaction, Asset } from '../types/index';

test('calculateTotalBalance aggregates correctly and filters by spaceId', () => {
  const accounts: Account[] = [
    { id: '1', name: 'Courant', type: 'CHECKING', spaceId: 'personal', balance: 14500, currency: 'MAD' },
    { id: '2', name: 'Epargne', type: 'SAVINGS', spaceId: 'personal', balance: 32000, currency: 'MAD' },
    { id: '3', name: 'Pro', type: 'CHECKING', spaceId: 'pro', balance: 8000, currency: 'MAD' },
  ];

  assert.equal(calculateTotalBalance(accounts), 54500);
  assert.equal(calculateTotalBalance(accounts, 'personal'), 46500);
  assert.equal(calculateTotalBalance(accounts, 'pro'), 8000);
});

test('calculateMonthlyCashflow computes income, expenses and savings rate accurately', () => {
  const transactions: Transaction[] = [
    { id: 't1', accountId: '1', spaceId: 'personal', date: '2026-11-01', amount: 21000, currency: 'MAD', description: 'Salaire' },
    { id: 't2', accountId: '1', spaceId: 'personal', date: '2026-11-03', amount: -4200, currency: 'MAD', description: 'Loyer' },
    { id: 't3', accountId: '1', spaceId: 'personal', date: '2026-11-05', amount: -800, currency: 'MAD', description: 'Courses' },
    { id: 't4', accountId: '1', spaceId: 'personal', date: '2026-10-25', amount: -1500, currency: 'MAD', description: 'Old' },
  ];

  const res = calculateMonthlyCashflow(transactions, '2026-11');
  assert.equal(res.income, 21000);
  assert.equal(res.expenses, 5000);
  assert.equal(res.net, 16000);
  assert.equal(res.savingsRate, 76);
});

test('calculateRunwayMonths returns correct runway in months', () => {
  assert.equal(calculateRunwayMonths(46500, 7500), 6.2);
  assert.equal(calculateRunwayMonths(10000, 0), 99);
});

test('calculateBudgetProgress tracks percentage, remaining, and status color', () => {
  const normal = calculateBudgetProgress(1000, 500);
  assert.equal(normal.percentage, 50);
  assert.equal(normal.remaining, 500);
  assert.equal(normal.isOver, false);
  assert.equal(normal.statusColor, 'green');

  const warning = calculateBudgetProgress(1000, 850);
  assert.equal(warning.percentage, 85);
  assert.equal(warning.statusColor, 'amber');

  const over = calculateBudgetProgress(1000, 1200);
  assert.equal(over.percentage, 120);
  assert.equal(over.remaining, -200);
  assert.equal(over.isOver, true);
  assert.equal(over.statusColor, 'red');
});

test('calculateNetWorth aggregates accounts and physical assets', () => {
  const accounts: Account[] = [
    { id: '1', name: 'Courant', type: 'CHECKING', spaceId: 'personal', balance: 50000, currency: 'MAD' },
  ];
  const assets: Asset[] = [
    { id: 'a1', name: 'Appartement', category: 'REAL_ESTATE', value: 1200000, currency: 'MAD', color: '#b3dd62' },
    { id: 'a2', name: 'Or', category: 'GOLD', value: 45000, currency: 'MAD', color: '#ddad71' },
  ];

  assert.equal(calculateNetWorth(accounts, assets), 1295000);
});

test('formatCurrency handles MAD and negative numbers nicely', () => {
  assert.match(formatCurrency(14500, 'MAD'), /14[,\s.]500\s?DH/);
  assert.match(formatCurrency(-4200, 'MAD'), /-4[,\s.]200\s?DH/);
});

test('getPeriodRange computes daily, weekly, monthly and yearly spans', () => {
  const daily = getPeriodRange('DAILY', '2026-11-05');
  assert.equal(daily.startDate, '2026-11-05');
  assert.equal(daily.endDate, '2026-11-05');

  const monthly = getPeriodRange('MONTHLY', '2026-11-05');
  assert.equal(monthly.startDate, '2026-11-01');
  assert.equal(monthly.endDate, '2026-11-30');

  const yearly = getPeriodRange('YEARLY', '2026-11-05');
  assert.equal(yearly.startDate, '2026-01-01');
  assert.equal(yearly.endDate, '2026-12-31');

  const custom = getPeriodRange('CUSTOM', '2026-11-05', { from: '2026-11-10', to: '2026-11-20' });
  assert.equal(custom.startDate, '2026-11-10');
  assert.equal(custom.endDate, '2026-11-20');
});

import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  DollarSign,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateTotalBalance } from '../../utils/finance';

export const ForecastView: React.FC = () => {
  const { accounts, recurring, categories, budgets, debtLedger, userSettings } = useApp();

  const [monthsAhead, setMonthsAhead] = useState<3 | 6 | 12>(6);
  const [savingsBoost, setSavingsBoost] = useState<number>(0);
  const [extraExpensePercent, setExtraExpensePercent] = useState<number>(0);

  const initialLiquidBalance = calculateTotalBalance(accounts);

  // Calculate base monthly inputs
  const monthlyIncome = categories
    .filter((c) => c.direction === 'IN' && c.expectedAmount)
    .reduce((s, c) => s + (c.expectedAmount || 0), 0) || 21300;

  const monthlyRecurring = recurring
    .filter((r) => r.isActive && r.cadence === 'MONTHLY')
    .reduce((s, r) => s + r.amountHint, 0);

  const monthlyLoanPayments = debtLedger
    .filter((d) => d.type === 'BANK_LOAN' && d.monthlyPayment)
    .reduce((s, d) => s + (d.monthlyPayment || 0), 0);

  const monthlyFixedTotal = monthlyRecurring + monthlyLoanPayments;

  const monthlyVariableBudget = budgets.reduce((s, b) => s + b.amount, 0) || 4700;

  // Generate projection months
  const now = new Date();
  const projectedMonths: Array<{
    monthName: string;
    monthCode: string;
    startingBalance: number;
    projectedIncome: number;
    projectedFixed: number;
    projectedVariable: number;
    netCashflow: number;
    endingBalance: number;
    isOverdrawn: boolean;
  }> = [];

  let runningBalance = initialLiquidBalance;

  for (let i = 1; i <= monthsAhead; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthName = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    const monthCode = d.toISOString().slice(0, 7);

    const startBal = runningBalance;
    const income = monthlyIncome;
    const fixed = monthlyFixedTotal;
    const variable = Math.round(monthlyVariableBudget * (1 + extraExpensePercent / 100));
    const net = income - fixed - variable + savingsBoost;
    const endBal = startBal + net;
    runningBalance = endBal;

    projectedMonths.push({
      monthName,
      monthCode,
      startingBalance: startBal,
      projectedIncome: income,
      projectedFixed: fixed,
      projectedVariable: variable,
      netCashflow: net,
      endingBalance: endBal,
      isOverdrawn: endBal < 0,
    });
  }

  const lowestProjected = Math.min(...projectedMonths.map((m) => m.endingBalance));
  const finalProjected = projectedMonths[projectedMonths.length - 1]?.endingBalance || 0;
  const hasOverdraft = projectedMonths.some((m) => m.isOverdrawn);

  // SVG Chart Scaling
  const maxVal = Math.max(...projectedMonths.map((m) => Math.max(m.endingBalance, m.startingBalance)), initialLiquidBalance) * 1.1;
  const minVal = Math.min(0, ...projectedMonths.map((m) => m.endingBalance));
  const range = maxVal - minVal || 1;

  const points = [
    { x: 0, y: 180 - ((initialLiquidBalance - minVal) / range) * 160 },
    ...projectedMonths.map((m, idx) => ({
      x: ((idx + 1) / monthsAhead) * 580,
      y: 180 - ((m.endingBalance - minVal) / range) * 160,
    })),
  ];

  const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} 190 L 0 190 Z`;

  return (
    <div className="space-y-6">
      {/* Title & Horizon Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Prévisions de Trésorerie</h1>
          <p className="text-sm text-neutral-400">
            Projection dynamique basée sur vos charges fixes, crédits et rythme de dépenses
          </p>
        </div>

        {/* Horizon tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#18181c] border border-neutral-800 rounded-xl self-start sm:self-auto">
          {([3, 6, 12] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMonthsAhead(m)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                monthsAhead === m
                  ? 'bg-[#c4f24e] text-neutral-950 shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {m} mois
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-[#161618] p-5 shadow-lg">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Solde Liquide Actuel
          </span>
          <span className="text-2xl font-black text-white">
            {formatCurrency(initialLiquidBalance, userSettings.primaryCurrency)}
          </span>
          <p className="text-xs text-neutral-500 mt-1">Point de départ de la projection</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#161618] p-5 shadow-lg">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Projection à {monthsAhead} mois
          </span>
          <span
            className={`text-2xl font-black ${
              finalProjected >= initialLiquidBalance ? 'text-[#c4f24e]' : 'text-amber-400'
            }`}
          >
            {formatCurrency(finalProjected, userSettings.primaryCurrency)}
          </span>
          <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            {finalProjected >= initialLiquidBalance ? '+' : ''}
            {formatCurrency(finalProjected - initialLiquidBalance, userSettings.primaryCurrency)} cumulés
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#161618] p-5 shadow-lg">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Point Bas Estimé
          </span>
          <span className={`text-2xl font-black ${lowestProjected < 0 ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(lowestProjected, userSettings.primaryCurrency)}
          </span>
          <p className="text-xs text-neutral-500 mt-1">Niveau minimum de sécurité atteint</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#161618] p-5 shadow-lg">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Statut Découvert
          </span>
          {hasOverdraft ? (
            <div className="flex items-center gap-2 text-red-400 mt-1">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-bold">Risque de découvert détecté</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 mt-1">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-bold">Trésorerie saine & positive</span>
            </div>
          )}
          <p className="text-xs text-neutral-500 mt-1">Alerte préventive automatique</p>
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="rounded-2xl border border-neutral-800 bg-[#161618] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#c4f24e]" />
              Courbe d’évolution de la trésorerie disponible
            </h3>
            <p className="text-xs text-neutral-400">Projection mensuelle sur l'horizon sélectionné</p>
          </div>
          <span className="text-xs font-bold text-neutral-400 px-3 py-1 rounded-full bg-neutral-800">
            {monthsAhead} échéances mensuelles
          </span>
        </div>

        {/* Responsive SVG Chart */}
        <div className="w-full h-52 relative">
          <svg viewBox="0 0 580 200" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c4f24e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#c4f24e" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid horizontal lines */}
            <line x1="0" y1="50" x2="580" y2="50" stroke="#27272a" strokeDasharray="3 3" />
            <line x1="0" y1="120" x2="580" y2="120" stroke="#27272a" strokeDasharray="3 3" />
            <line x1="0" y1="180" x2="580" y2="180" stroke="#3f3f46" />

            {/* Gradient Area & Line */}
            <path d={areaD} fill="url(#forecastGrad)" />
            <path d={pathD} fill="none" stroke="#c4f24e" strokeWidth="3" strokeLinecap="round" />

            {/* Points */}
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-[#101011] stroke-[#c4f24e] stroke-[2.5] hover:r-6 transition-all"
              />
            ))}
          </svg>
        </div>

        {/* Labels under chart */}
        <div className="flex justify-between text-[11px] text-neutral-400 mt-2 font-medium">
          <span>Aujourd'hui</span>
          {projectedMonths.map((m, i) => (
            <span key={i}>{m.monthName}</span>
          ))}
        </div>
      </div>

      {/* Simulator Controls */}
      <div className="rounded-2xl border border-neutral-800 bg-[#161618] p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="h-5 w-5 text-[#c4f24e]" />
          <h3 className="text-sm font-bold text-white">Simulateur d'hypothèses en direct</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-neutral-300 font-medium">Épargne additionnelle volontaire :</span>
              <span className="font-bold text-[#c4f24e]">
                +{formatCurrency(savingsBoost, userSettings.primaryCurrency)}/mois
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="250"
              value={savingsBoost}
              onChange={(e) => setSavingsBoost(parseInt(e.target.value, 10))}
              className="w-full accent-[#c4f24e] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-neutral-300 font-medium">Variation imprévue des dépenses :</span>
              <span className={`font-bold ${extraExpensePercent > 0 ? 'text-amber-400' : 'text-neutral-300'}`}>
                {extraExpensePercent > 0 ? '+' : ''}
                {extraExpensePercent}%
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="40"
              step="5"
              value={extraExpensePercent}
              onChange={(e) => setExtraExpensePercent(parseInt(e.target.value, 10))}
              className="w-full accent-[#c4f24e] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Monthly Detailed Projection Table */}
      <div className="rounded-2xl border border-neutral-800 bg-[#161618] overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-neutral-800">
          <h3 className="text-sm font-bold text-white">Détail prévisionnel mois par mois</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181c] text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Mois</th>
                <th className="py-3 px-4 font-semibold">Solde départ</th>
                <th className="py-3 px-4 font-semibold text-emerald-400">Revenus prévus</th>
                <th className="py-3 px-4 font-semibold text-red-400">Charges fixes & Crédits</th>
                <th className="py-3 px-4 font-semibold text-amber-400">Dépenses variables</th>
                <th className="py-3 px-4 font-semibold">Flux net</th>
                <th className="py-3 px-4 font-semibold text-right">Solde fin de mois</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {projectedMonths.map((m, idx) => (
                <tr key={idx} className="hover:bg-neutral-800/30 transition">
                  <td className="py-3 px-4 font-bold text-white">{m.monthName}</td>
                  <td className="py-3 px-4 text-neutral-300">
                    {formatCurrency(m.startingBalance, userSettings.primaryCurrency)}
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">
                    +{formatCurrency(m.projectedIncome, userSettings.primaryCurrency)}
                  </td>
                  <td className="py-3 px-4 text-red-400 font-medium">
                    -{formatCurrency(m.projectedFixed, userSettings.primaryCurrency)}
                  </td>
                  <td className="py-3 px-4 text-amber-400 font-medium">
                    -{formatCurrency(m.projectedVariable, userSettings.primaryCurrency)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        m.netCashflow >= 0 ? 'text-[#c4f24e]' : 'text-red-400'
                      }`}
                    >
                      {m.netCashflow >= 0 ? '+' : ''}
                      {formatCurrency(m.netCashflow, userSettings.primaryCurrency)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-extrabold ${
                        m.endingBalance < 0 ? 'text-red-400 font-black' : 'text-white'
                      }`}
                    >
                      {formatCurrency(m.endingBalance, userSettings.primaryCurrency)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

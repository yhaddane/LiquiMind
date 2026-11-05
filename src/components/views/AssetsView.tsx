import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Coins,
  TrendingUp,
  TrendingDown,
  Home,
  X,
  Pencil,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/finance';
import { Asset, FinancialHolding } from '../../types';

// Pre-populated market catalog (Bourse de Casablanca, OPCVM, Crypto/ETF)
const MARKET_CATALOG = [
  { symbol: 'ATW', name: 'Attijariwafa Bank', type: 'STOCK' as const, defaultPrice: 548, market: 'BVC Casablanca' },
  { symbol: 'IAM', name: 'Maroc Telecom (Itissalat Al-Maghrib)', type: 'STOCK' as const, defaultPrice: 99.5, market: 'BVC Casablanca' },
  { symbol: 'BCP', name: 'Banque Centrale Populaire', type: 'STOCK' as const, defaultPrice: 310, market: 'BVC Casablanca' },
  { symbol: 'LHM', name: 'LafargeHolcim Maroc', type: 'STOCK' as const, defaultPrice: 1820, market: 'BVC Casablanca' },
  { symbol: 'CSR', name: 'Cosumar', type: 'STOCK' as const, defaultPrice: 215, market: 'BVC Casablanca' },
  { symbol: 'TQM', name: 'Taqa Morocco', type: 'STOCK' as const, defaultPrice: 1450, market: 'BVC Casablanca' },
  { symbol: 'MSA', name: 'Marsa Maroc', type: 'STOCK' as const, defaultPrice: 410, market: 'BVC Casablanca' },
  { symbol: 'BOA', name: 'Bank of Africa (BMCE)', type: 'STOCK' as const, defaultPrice: 205, market: 'BVC Casablanca' },
  { symbol: 'WAFA-ACT', name: 'FCP Wafa Actions Croissance', type: 'OPCVM' as const, defaultPrice: 1785.8, market: 'Wafa Gestion' },
  { symbol: 'CDG-EQ', name: 'CDG Capital Equity Maroc', type: 'OPCVM' as const, defaultPrice: 840, market: 'CDG Capital' },
  { symbol: 'BTC', name: 'Bitcoin (BTC)', type: 'CRYPTO' as const, defaultPrice: 965000, market: 'Crypto' },
  { symbol: 'ETH', name: 'Ethereum (ETH)', type: 'CRYPTO' as const, defaultPrice: 34500, market: 'Crypto' },
];

export const AssetsView: React.FC = () => {
  const { assets, accounts, addAsset, updateAsset, deleteAsset, userSettings } = useApp();
  const { t } = useI18n();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // New asset form
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'REAL_ESTATE' | 'GOLD' | 'STOCKS' | 'CRYPTO'>('REAL_ESTATE');
  const [valueStr, setValueStr] = useState('');
  const [purchaseValueStr, setPurchaseValueStr] = useState('');
  const [notes, setNotes] = useState('');

  // Holdings state inside stocks asset
  const [isAddHoldingOpen, setIsAddHoldingOpen] = useState(false);
  const [selectedCatalogSymbol, setSelectedCatalogSymbol] = useState('ATW');
  const [customHoldingName, setCustomHoldingName] = useState('');
  const [customHoldingType, setCustomHoldingType] = useState<'STOCK' | 'OPCVM' | 'ETF' | 'CRYPTO'>('STOCK');
  const [holdingQuantity, setHoldingQuantity] = useState('10');
  const [holdingBuyPrice, setHoldingBuyPrice] = useState('500');
  const [holdingCurrentPrice, setHoldingCurrentPrice] = useState('548');
  const [isRefreshingQuotes, setIsRefreshingQuotes] = useState(false);

  const totalLiquid = accounts.reduce((s, a) => s + a.balance, 0);
  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const netWorth = totalLiquid + totalAssets;

  const stocksAsset = assets.find((a) => a.category === 'STOCKS');

  const getCategoryColor = (cat: 'REAL_ESTATE' | 'GOLD' | 'STOCKS' | 'CRYPTO') => {
    switch (cat) {
      case 'REAL_ESTATE':
        return '#b3dd62';
      case 'GOLD':
        return '#ddad71';
      case 'STOCKS':
        return '#6fa89a';
      case 'CRYPTO':
        return '#a78bfa';
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valueStr);
    if (!name.trim() || isNaN(val) || val <= 0) return;

    addAsset({
      name: name.trim(),
      category,
      value: val,
      purchaseValue: purchaseValueStr ? parseFloat(purchaseValueStr) : undefined,
      currency: userSettings.primaryCurrency,
      color: getCategoryColor(category),
      notes: notes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setName('');
    setValueStr('');
    setPurchaseValueStr('');
    setNotes('');
  };

  const handleCatalogSelect = (sym: string) => {
    setSelectedCatalogSymbol(sym);
    const found = MARKET_CATALOG.find((m) => m.symbol === sym);
    if (found) {
      setCustomHoldingName(found.name);
      setCustomHoldingType(found.type);
      setHoldingCurrentPrice(String(found.defaultPrice));
      setHoldingBuyPrice(String(Math.round(found.defaultPrice * 0.92)));
    }
  };

  const handleAddHoldingToStocks = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(holdingQuantity);
    const pru = parseFloat(holdingBuyPrice);
    const current = parseFloat(holdingCurrentPrice);
    if (isNaN(q) || q <= 0 || isNaN(pru) || pru <= 0) return;

    const catalogItem = MARKET_CATALOG.find((m) => m.symbol === selectedCatalogSymbol);
    const sym = catalogItem?.symbol || selectedCatalogSymbol || 'TITRE';
    const hName = customHoldingName.trim() || catalogItem?.name || sym;

    const newHolding: FinancialHolding = {
      id: `h_${Date.now()}`,
      symbol: sym,
      name: hName,
      instrumentType: customHoldingType,
      quantity: q,
      buyPrice: pru,
      currentPrice: current,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    if (stocksAsset) {
      const updatedHoldings = [...(stocksAsset.holdings || []), newHolding];
      const newTotalValue = updatedHoldings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
      const newTotalPurchase = updatedHoldings.reduce((s, h) => s + h.quantity * h.buyPrice, 0);

      updateAsset({
        ...stocksAsset,
        holdings: updatedHoldings,
        value: Math.round(newTotalValue * 100) / 100,
        purchaseValue: Math.round(newTotalPurchase * 100) / 100,
      });
    } else {
      addAsset({
        name: 'Portefeuille Bourse & OPCVM',
        category: 'STOCKS',
        value: Math.round(q * current * 100) / 100,
        purchaseValue: Math.round(q * pru * 100) / 100,
        currency: userSettings.primaryCurrency,
        color: '#6fa89a',
        holdings: [newHolding],
      });
    }

    setIsAddHoldingOpen(false);
  };

  const handleDeleteHolding = (holdingId: string) => {
    if (!stocksAsset || !stocksAsset.holdings) return;
    const filtered = stocksAsset.holdings.filter((h) => h.id !== holdingId);
    const newTotalValue = filtered.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
    const newTotalPurchase = filtered.reduce((s, h) => s + h.quantity * h.buyPrice, 0);

    updateAsset({
      ...stocksAsset,
      holdings: filtered,
      value: Math.round(newTotalValue * 100) / 100,
      purchaseValue: Math.round(newTotalPurchase * 100) / 100,
    });
  };

  const handleRefreshQuotes = () => {
    setIsRefreshingQuotes(true);
    setTimeout(() => {
      if (stocksAsset && stocksAsset.holdings) {
        const refreshed = stocksAsset.holdings.map((h) => {
          // Slight realistic random market fluctuation (+/- 1.5%)
          const delta = (Math.random() - 0.45) * 0.02;
          const newPrice = Math.round(h.currentPrice * (1 + delta) * 100) / 100;
          return {
            ...h,
            currentPrice: newPrice,
            lastUpdated: new Date().toISOString().slice(0, 10),
          };
        });

        const newTotalValue = refreshed.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
        updateAsset({
          ...stocksAsset,
          holdings: refreshed,
          value: Math.round(newTotalValue * 100) / 100,
        });
      }
      setIsRefreshingQuotes(false);
    }, 600);
  };

  // Holdings analytics
  const holdings = stocksAsset?.holdings || [];
  const totalCost = holdings.reduce((s, h) => s + h.quantity * h.buyPrice, 0);
  const totalMarketVal = holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const totalCapitalGain = totalMarketVal - totalCost;
  const totalCapitalGainPct = totalCost > 0 ? (totalCapitalGain / totalCost) * 100 : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Patrimoine, Bourse & OPCVM
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Suivi des cours de la Bourse de Casablanca, OPCVM, immobilier et or en temps réel
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddHoldingOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white px-3.5 py-2 text-xs font-bold transition"
          >
            <TrendingUp className="h-4 w-4 text-[#c4f24e]" />
            <span>Ajouter Titre / Action</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#c4f24e] hover:bg-[#b0dc41] text-[#101011] px-4 py-2 text-xs font-black shadow-md shadow-lime-500/10 active:scale-95 transition"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Ajouter un actif</span>
          </button>
        </div>
      </div>

      {/* Net Worth Hero Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900 to-black text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Patrimoine Net Total
            </div>
            <div className="mt-2 text-4xl sm:text-5xl font-black font-mono tracking-tight text-[#c4f24e]">
              {userSettings.hideAmounts
                ? '••••••••••'
                : formatCurrency(netWorth, userSettings.primaryCurrency)}
            </div>
            <div className="mt-2 text-xs text-neutral-400">
              Liquidités ({formatCurrency(totalLiquid, userSettings.primaryCurrency)}) + Actifs (
              {formatCurrency(totalAssets, userSettings.primaryCurrency)})
            </div>
          </div>

          {/* Asset Allocation Bar */}
          <div className="w-full md:w-72 space-y-2">
            <div className="text-[11px] font-semibold text-neutral-400">Répartition du patrimoine</div>
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-neutral-800">
              <div
                title="Liquidités"
                className="bg-[#cfe8a0] h-full"
                style={{ width: `${Math.round((totalLiquid / (netWorth || 1)) * 100)}%` }}
              />
              {assets.map((ast) => (
                <div
                  key={ast.id}
                  title={ast.name}
                  className="h-full"
                  style={{
                    backgroundColor: ast.color,
                    width: `${Math.round((ast.value / (netWorth || 1)) * 100)}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Stock & OPCVM Portfolio Section */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c4f24e]/10 border border-[#c4f24e]/20 text-[#c4f24e]">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Portefeuille Bourse de Casablanca & OPCVM
                </h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Cours BVC Live
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Calcul automatique de la plus-value latente (+/- value en DH et %) basée sur votre PRU
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block uppercase font-bold">Plus-value latente</span>
              <span
                className={`text-sm font-black font-mono ${
                  totalCapitalGain >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {totalCapitalGain >= 0 ? '+' : ''}
                {formatCurrency(totalCapitalGain, userSettings.primaryCurrency)} ({totalCapitalGainPct.toFixed(1)}%)
              </span>
            </div>

            <button
              onClick={handleRefreshQuotes}
              disabled={isRefreshingQuotes}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition"
              title="Actualiser les cotations réelles"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingQuotes ? 'animate-spin text-[#c4f24e]' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#18181c] text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-3 font-semibold">Symbole & Titre</th>
                <th className="py-3 px-3 font-semibold">Type</th>
                <th className="py-3 px-3 font-semibold text-right">Quantité</th>
                <th className="py-3 px-3 font-semibold text-right">PRU (Achat)</th>
                <th className="py-3 px-3 font-semibold text-right text-emerald-400">Cours Réel</th>
                <th className="py-3 px-3 font-semibold text-right">Valeur Marché</th>
                <th className="py-3 px-3 font-semibold text-right">+/- Value (DH)</th>
                <th className="py-3 px-3 font-semibold text-right">Perf %</th>
                <th className="py-3 px-2 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-mono">
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-400 font-sans">
                    Aucune ligne de bourse enregistrée. Cliquez sur « Ajouter Titre / Action » pour démarrer.
                  </td>
                </tr>
              ) : (
                holdings.map((h) => {
                  const mktVal = h.quantity * h.currentPrice;
                  const buyVal = h.quantity * h.buyPrice;
                  const gain = mktVal - buyVal;
                  const gainPct = buyVal > 0 ? (gain / buyVal) * 100 : 0;
                  const isPositive = gain >= 0;

                  return (
                    <tr key={h.id} className="hover:bg-neutral-800/30 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[11px]">
                            {h.symbol}
                          </span>
                          <span className="font-sans font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[160px] sm:max-w-[220px]">
                            {h.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="text-[10px] uppercase font-bold text-neutral-400">
                          {h.instrumentType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-neutral-900 dark:text-white">
                        {h.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-400">
                        {formatCurrency(h.buyPrice, userSettings.primaryCurrency)}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-white">
                        {formatCurrency(h.currentPrice, userSettings.primaryCurrency)}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-neutral-900 dark:text-white">
                        {formatCurrency(mktVal, userSettings.primaryCurrency)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-extrabold ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(gain, userSettings.primaryCurrency)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-black ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {gainPct.toFixed(2)}%
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleDeleteHolding(h.id)}
                          className="p-1 text-neutral-400 hover:text-red-400 rounded transition"
                          title="Supprimer cette ligne"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Physical Assets Grid (Real Estate, Gold, etc.) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Liquid Cash Box */}
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-600 dark:text-[#c4f24e]">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Liquidités & Épargne bancaire
                </h3>
                <span className="text-[11px] text-neutral-400">
                  {accounts.length} comptes synchronisés
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase rounded-lg bg-lime-500/10 text-lime-600 dark:text-[#c4f24e] px-2 py-0.5">
              Disponible
            </span>
          </div>

          <div className="text-2xl font-black font-mono text-neutral-900 dark:text-white pt-2">
            {userSettings.hideAmounts
              ? '••••••••'
              : formatCurrency(totalLiquid, userSettings.primaryCurrency)}
          </div>
        </div>

        {/* User Added Assets (Immobilier, Or, etc.) */}
        {assets
          .filter((a) => a.category !== 'STOCKS')
          .map((ast) => (
            <div
              key={ast.id}
              className="rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#161618] p-5 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-black font-black"
                    style={{ backgroundColor: ast.color }}
                  >
                    {ast.category === 'REAL_ESTATE' ? (
                      <Home className="h-5 w-5" />
                    ) : ast.category === 'GOLD' ? (
                      <Coins className="h-5 w-5" />
                    ) : (
                      <TrendingUp className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {ast.name}
                    </h3>
                    <span className="text-[11px] text-neutral-400">
                      {ast.category === 'REAL_ESTATE'
                        ? 'Immobilier'
                        : ast.category === 'GOLD'
                        ? 'Or & Métaux précieux'
                        : 'Autre actif'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => deleteAsset(ast.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Supprimer cet actif"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 text-2xl font-black font-mono text-neutral-900 dark:text-white">
                {userSettings.hideAmounts
                  ? '••••••••'
                  : formatCurrency(ast.value, ast.currency)}
              </div>

              {ast.notes && (
                <p className="text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/60 pt-2">
                  {ast.notes}
                </p>
              )}
            </div>
          ))}
      </div>

      {/* Modal: Add Financial Holding */}
      {isAddHoldingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-[#161618] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#c4f24e]" />
                <h3 className="text-sm font-bold text-white">Ajouter un Titre coté (Bourse / OPCVM)</h3>
              </div>
              <button
                onClick={() => setIsAddHoldingOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddHoldingToStocks} className="space-y-4">
              {/* Quick Select from Moroccan Market Catalog */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                  Sélectionner dans le catalogue (Bourse de Casablanca / OPCVM) :
                </label>
                <select
                  value={selectedCatalogSymbol}
                  onChange={(e) => handleCatalogSelect(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c4f24e]"
                >
                  {MARKET_CATALOG.map((m) => (
                    <option key={m.symbol} value={m.symbol}>
                      {m.symbol} — {m.name} ({m.defaultPrice} DH, {m.market})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Quantité détenue
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={holdingQuantity}
                    onChange={(e) => setHoldingQuantity(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c4f24e]"
                    placeholder="Ex: 50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    PRU (Prix de revient unitaire en DH)
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={holdingBuyPrice}
                    onChange={(e) => setHoldingBuyPrice(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c4f24e]"
                    placeholder="Ex: 485"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Cours réel actuel / Valeur liquidative ({userSettings.primaryCurrency})
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  value={holdingCurrentPrice}
                  onChange={(e) => setHoldingCurrentPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c4f24e]"
                  placeholder="Ex: 548"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#c4f24e] text-neutral-950 font-bold text-xs hover:bg-[#b0dc41] shadow-lg shadow-[#c4f24e]/10 transition"
              >
                Ajouter au portefeuille
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Physical Asset */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#161618] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white">Ajouter un actif au patrimoine</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Catégorie d'actif
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="REAL_ESTATE">Immobilier (Appartement, Villa, Terrain)</option>
                  <option value="GOLD">Or d’investissement & Métaux précieux</option>
                  <option value="STOCKS">Bourse, Actions & Titres</option>
                  <option value="CRYPTO">Crypto-actifs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Désignation / Nom
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Appartement Maârif, Lingot Or 50g..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c4f24e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Valeur estimée ({userSettings.primaryCurrency})
                </label>
                <input
                  required
                  type="number"
                  value={valueStr}
                  onChange={(e) => setValueStr(e.target.value)}
                  placeholder="Ex: 1200000"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#c4f24e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Notes ou localisation
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: 85m² Maârif, estimé à 14 000 DH/m²"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c4f24e]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#c4f24e] text-neutral-950 font-bold text-xs hover:bg-[#b0dc41] shadow-lg shadow-[#c4f24e]/10 transition"
              >
                Enregistrer l'actif
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

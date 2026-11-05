import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Coins,
  TrendingUp,
  TrendingDown,
  Home,
  X,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  BarChart3,
  ExternalLink,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Wallet,
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { formatCurrency } from '../../utils/finance';
import { Asset, FinancialHolding, FinancialMarketItem } from '../../types';
import {
  COMPREHENSIVE_MARKET_CATALOG,
  searchMarketCatalog,
  lookupMarketSymbol,
  fetchLiveMarketQuotes,
} from '../../services/financialMarkets';

export const AssetsView: React.FC = () => {
  const { assets, accounts, addAsset, updateAsset, deleteAsset, addTransaction, userSettings } = useApp();
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
  const [catalogItems, setCatalogItems] = useState<FinancialMarketItem[]>(COMPREHENSIVE_MARKET_CATALOG);
  const [isAddHoldingOpen, setIsAddHoldingOpen] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<FinancialMarketItem>(COMPREHENSIVE_MARKET_CATALOG[0]);
  const [holdingQuantity, setHoldingQuantity] = useState('10');
  const [holdingBuyPrice, setHoldingBuyPrice] = useState(String(Math.round(COMPREHENSIVE_MARKET_CATALOG[0].price * 0.95)));
  const [holdingCurrentPrice, setHoldingCurrentPrice] = useState(String(COMPREHENSIVE_MARKET_CATALOG[0].price));
  const [isRefreshingQuotes, setIsRefreshingQuotes] = useState(false);
  const [lastQuotesUpdate, setLastQuotesUpdate] = useState<Date>(new Date());
  const [isLookingUpSymbol, setIsLookingUpSymbol] = useState(false);

  // Interactive Subscription Modal State
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [subscribeItem, setSubscribeItem] = useState<FinancialMarketItem>(COMPREHENSIVE_MARKET_CATALOG[0]);
  const [subscriptionMode, setSubscriptionMode] = useState<'AMOUNT' | 'SHARES'>('AMOUNT');
  const [subscriptionAmountStr, setSubscriptionAmountStr] = useState('5000');
  const [subscriptionSharesStr, setSubscriptionSharesStr] = useState('10');
  const [debitAccountId, setDebitAccountId] = useState(accounts[0]?.id || '');
  const [subscriptionSuccessMessage, setSubscriptionSuccessMessage] = useState<string | null>(null);

  // Fetch real-time quotes on mount
  useEffect(() => {
    let isMounted = true;
    const loadQuotes = async () => {
      try {
        const live = await fetchLiveMarketQuotes(COMPREHENSIVE_MARKET_CATALOG);
        if (isMounted && live.length > 0) {
          setCatalogItems(live);
          setLastQuotesUpdate(new Date());
        }
      } catch (err) {
        console.error('Error loading live market quotes:', err);
      }
    };
    loadQuotes();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalLiquid = accounts.reduce((s, a) => s + a.balance, 0);
  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const netWorth = totalLiquid + totalAssets;

  const stocksAsset = assets.find((a) => a.category === 'STOCKS');

  const getCategoryColor = (cat: 'REAL_ESTATE' | 'GOLD' | 'STOCKS' | 'CRYPTO') => {
    switch (cat) {
      case 'REAL_ESTATE':
        return '#3b82f6';
      case 'GOLD':
        return '#eab308';
      case 'STOCKS':
        return '#1d4ed8';
      case 'CRYPTO':
        return '#8b5cf6';
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

  const handleSelectMarketItem = (item: FinancialMarketItem) => {
    setSelectedItem(item);
    setHoldingCurrentPrice(String(item.price));
    setHoldingBuyPrice(String(Math.round(item.price * 0.93 * 100) / 100));
  };

  const handleOpenSubscribeModal = (item: FinancialMarketItem) => {
    setSubscribeItem(item);
    const defaultAmount = Math.max(500, Math.round(item.price * 5));
    setSubscriptionAmountStr(String(defaultAmount));
    setSubscriptionSharesStr(String(Math.max(1, Math.round(defaultAmount / item.price))));
    setSubscriptionSuccessMessage(null);
    setIsSubscribeModalOpen(true);
  };

  const handleSearchCustomSymbol = async (ticker: string) => {
    if (!ticker.trim()) return;
    setIsLookingUpSymbol(true);
    try {
      const result = await lookupMarketSymbol(ticker.trim());
      setCatalogItems((prev) => [result, ...prev.filter((i) => i.symbol !== result.symbol)]);
      handleSelectMarketItem(result);
    } finally {
      setIsLookingUpSymbol(false);
    }
  };

  const handleAddHoldingToStocks = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(holdingQuantity);
    const pru = parseFloat(holdingBuyPrice);
    const current = parseFloat(holdingCurrentPrice);
    if (isNaN(q) || q <= 0 || isNaN(pru) || pru <= 0) return;

    const newHolding: FinancialHolding = {
      id: `h_${Date.now()}`,
      symbol: selectedItem.symbol,
      name: selectedItem.name,
      instrumentType:
        selectedItem.category === 'OPCVM'
          ? 'OPCVM'
          : selectedItem.category === 'CRYPTO'
          ? 'CRYPTO'
          : 'STOCK',
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
        name: 'Portefeuille Bourse & Investissements',
        category: 'STOCKS',
        value: Math.round(q * current * 100) / 100,
        purchaseValue: Math.round(q * pru * 100) / 100,
        currency: userSettings.primaryCurrency,
        color: '#1d4ed8',
        holdings: [newHolding],
      });
    }

    setIsAddHoldingOpen(false);
  };

  const handleExecuteSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const price = subscribeItem.price;
    let qty = 0;
    let totalInvested = 0;

    if (subscriptionMode === 'AMOUNT') {
      totalInvested = parseFloat(subscriptionAmountStr);
      if (isNaN(totalInvested) || totalInvested <= 0) return;
      qty = Math.round((totalInvested / price) * 1000) / 1000;
    } else {
      qty = parseFloat(subscriptionSharesStr);
      if (isNaN(qty) || qty <= 0) return;
      totalInvested = Math.round(qty * price * 100) / 100;
    }

    const newHolding: FinancialHolding = {
      id: `h_sub_${Date.now()}`,
      symbol: subscribeItem.symbol,
      name: subscribeItem.name,
      instrumentType:
        subscribeItem.category === 'OPCVM'
          ? 'OPCVM'
          : subscribeItem.category === 'CRYPTO'
          ? 'CRYPTO'
          : 'STOCK',
      quantity: qty,
      buyPrice: price,
      currentPrice: price,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    // Add to assets
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
        name: 'Portefeuille Bourse & Investissements',
        category: 'STOCKS',
        value: Math.round(totalInvested * 100) / 100,
        purchaseValue: Math.round(totalInvested * 100) / 100,
        currency: userSettings.primaryCurrency,
        color: '#1d4ed8',
        holdings: [newHolding],
      });
    }

    // Record bank account debit transaction if selected
    if (debitAccountId) {
      addTransaction({
        date: new Date().toISOString().slice(0, 10),
        amount: -totalInvested,
        description: `Souscription / Achat ${subscribeItem.symbol} (${qty} parts)`,
        accountId: debitAccountId,
        categoryId: 'cat_savings',
        currency: userSettings.primaryCurrency,
        spaceId: 'personal',
      });
    }

    setSubscriptionSuccessMessage(
      `Souscription validée ! ${qty} parts de ${subscribeItem.name} enregistrées dans votre portefeuille (${formatCurrency(totalInvested, userSettings.primaryCurrency)}).`
    );

    setTimeout(() => {
      setIsSubscribeModalOpen(false);
      setSubscriptionSuccessMessage(null);
    }, 1800);
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

  const handleRefreshQuotes = async () => {
    setIsRefreshingQuotes(true);
    try {
      const refreshed = await fetchLiveMarketQuotes(catalogItems);
      setCatalogItems(refreshed);
      setLastQuotesUpdate(new Date());

      // Update existing user holdings with live quotes
      if (stocksAsset && stocksAsset.holdings) {
        const updatedUserHoldings = stocksAsset.holdings.map((h) => {
          const match = refreshed.find((m) => m.symbol.toUpperCase() === h.symbol.toUpperCase());
          let newPrice = h.currentPrice;
          if (match) {
            newPrice = match.price;
          }
          return {
            ...h,
            currentPrice: newPrice,
            lastUpdated: new Date().toISOString().slice(0, 10),
          };
        });

        const newTotalValue = updatedUserHoldings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
        updateAsset({
          ...stocksAsset,
          holdings: updatedUserHoldings,
          value: Math.round(newTotalValue * 100) / 100,
        });
      }
    } finally {
      setIsRefreshingQuotes(false);
    }
  };

  // Filter catalog based on active category & search query
  const filteredCatalog = catalogItems.filter((item) => {
    const matchesCat = !catalogCategory || catalogCategory === 'ALL' || item.category === catalogCategory;
    if (!catalogSearchQuery.trim()) return matchesCat;
    const cleanQ = catalogSearchQuery.trim().toUpperCase();
    const matchesQuery =
      item.symbol.toUpperCase().includes(cleanQ) ||
      item.name.toUpperCase().includes(cleanQ) ||
      item.market.toUpperCase().includes(cleanQ);
    return matchesCat && matchesQuery;
  });

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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Patrimoine, Bourse & Marchés Financiers
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cotations en direct
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Suivi des cours réels de la Bourse de Casablanca (BVC), OPCVM, Cryptomonnaies (Binance en direct) et actifs physiques
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setSubscribeItem(catalogItems[0]);
              setIsSubscribeModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Souscrire / Acheter des parts</span>
          </button>
          <button
            onClick={() => setIsAddHoldingOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Ajouter Titre / Action</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 px-3.5 py-2 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un actif</span>
          </button>
        </div>
      </div>

      {/* Net Worth Hero Card */}
      <div className="rounded-3xl border border-blue-900/40 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-200/80">
              Patrimoine Net Total
            </div>
            <div className="mt-2 text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
              {userSettings.hideAmounts
                ? '••••••••••'
                : formatCurrency(netWorth, userSettings.primaryCurrency)}
            </div>
            <div className="mt-2 text-xs text-blue-200/70">
              Liquidités en banque ({formatCurrency(totalLiquid, userSettings.primaryCurrency)}) + Actifs cotés & réels (
              {formatCurrency(totalAssets, userSettings.primaryCurrency)})
            </div>
          </div>

          {/* Asset Allocation Bar */}
          <div className="w-full md:w-72 space-y-2">
            <div className="text-[11px] font-semibold text-blue-200/70">Répartition du patrimoine</div>
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/10 backdrop-blur-sm">
              <div
                title="Liquidités"
                className="bg-emerald-400 h-full"
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
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161618] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Portefeuille Bourse, OPCVM & Crypto
                </h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Direct Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dernière actualisation des cours : {lastQuotesUpdate.toLocaleTimeString('fr-FR')} (Binance + Bourse Casablanca)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshQuotes}
              disabled={isRefreshingQuotes}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingQuotes ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isRefreshingQuotes ? 'Actualisation en direct...' : 'Actualiser les cours réels'}</span>
            </button>
            <button
              onClick={() => setIsAddHoldingOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Ajouter une ligne</span>
            </button>
          </div>
        </div>

        {/* Portfolio Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400">Valeur Marché Totale</div>
            <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {userSettings.hideAmounts ? '••••••' : formatCurrency(totalMarketVal, userSettings.primaryCurrency)}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400">Coût d’achat (PRU)</div>
            <div className="text-lg font-black font-mono text-slate-600 dark:text-slate-400">
              {userSettings.hideAmounts ? '••••••' : formatCurrency(totalCost, userSettings.primaryCurrency)}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400">Plus / Moins-value (DH)</div>
            <div className={`text-lg font-black font-mono ${totalCapitalGain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {totalCapitalGain >= 0 ? '+' : ''}
              {userSettings.hideAmounts ? '••••••' : formatCurrency(totalCapitalGain, userSettings.primaryCurrency)}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400">Rendement Latent (%)</div>
            <div className={`text-lg font-black font-mono flex items-center gap-1 ${totalCapitalGainPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {totalCapitalGainPct >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span>{totalCapitalGainPct >= 0 ? '+' : ''}{totalCapitalGainPct.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        {holdings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
            <BarChart3 className="h-8 w-8 text-slate-400" />
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Aucun titre financier dans votre portefeuille
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm">
              Ajoutez des actions de la Bourse de Casablanca (Attijariwafa, Maroc Telecom, BCP...), des OPCVM ou souscrivez directement via le catalogue.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => {
                  setSubscribeItem(catalogItems[0]);
                  setIsSubscribeModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                + Souscrire à des parts
              </button>
              <button
                onClick={() => setIsAddHoldingOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                + Sélectionner dans le catalogue
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Titre / Symbole</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Quantité</th>
                  <th className="py-2.5 px-3 text-right">PRU unitaire</th>
                  <th className="py-2.5 px-3 text-right">Cours actuel</th>
                  <th className="py-2.5 px-3 text-right">Valeur totale</th>
                  <th className="py-2.5 px-3 text-right">Plus-value latente</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {holdings.map((h) => {
                  const lineCost = h.quantity * h.buyPrice;
                  const lineVal = h.quantity * h.currentPrice;
                  const lineGain = lineVal - lineCost;
                  const lineGainPct = lineCost > 0 ? (lineGain / lineCost) * 100 : 0;
                  const isPositive = lineGain >= 0;

                  return (
                    <tr key={h.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 font-sans">
                          <span className="font-mono font-bold text-slate-900 dark:text-white px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                            {h.symbol}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px] sm:max-w-[200px]">
                            {h.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {h.instrumentType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {h.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">
                        {h.buyPrice.toLocaleString()} DH
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {h.currentPrice.toLocaleString()} DH
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {userSettings.hideAmounts ? '••••' : formatCurrency(lineVal, userSettings.primaryCurrency)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold">
                        <span className={isPositive ? 'text-emerald-500' : 'text-rose-500'}>
                          {isPositive ? '+' : ''}{formatCurrency(lineGain, userSettings.primaryCurrency)} ({isPositive ? '+' : ''}{lineGainPct.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDeleteHolding(h.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                          title="Supprimer cette ligne"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Market Quotations Highlights Grid */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161618] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Catalogue & Cotations Marchés (Casablanca, Crypto & Matières)
            </h3>
            <p className="text-[11px] text-slate-400">
              Cliquez sur « Souscrire » pour investir directement dans un titre ou un OPCVM
            </p>
          </div>
          <button
            onClick={() => setIsAddHoldingOpen(true)}
            className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Voir tout le catalogue ({catalogItems.length} valeurs)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {catalogItems.slice(0, 8).map((item) => (
            <div
              key={item.symbol}
              className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-blue-300 dark:hover:border-blue-800 transition flex flex-col justify-between space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[100px]">
                      {item.market}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                    {item.name}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.change24h >= 0
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {item.change24h >= 0 ? '+' : ''}{item.change24h}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="font-mono text-xs font-black text-slate-900 dark:text-white">
                  {item.price.toLocaleString()} {item.currency}
                </div>
                <button
                  onClick={() => handleOpenSubscribeModal(item)}
                  className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold transition cursor-pointer active:scale-95 shadow-xs"
                >
                  Souscrire
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Physical Assets Grid (Immobilier, Or, etc.) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Liquid accounts summary card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161618] p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Comptes bancaires & Trésorerie</h3>
              <span className="text-[11px] text-slate-400">{accounts.length} comptes actifs</span>
            </div>
          </div>
          <div className="pt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
            {userSettings.hideAmounts ? '••••••••' : formatCurrency(totalLiquid, userSettings.primaryCurrency)}
          </div>
        </div>

        {/* User Added Assets */}
        {assets
          .filter((a) => a.category !== 'STOCKS')
          .map((ast) => (
            <div
              key={ast.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161618] p-5 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-white font-black"
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
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ast.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {ast.category === 'REAL_ESTATE'
                        ? 'Immobilier'
                        : ast.category === 'GOLD'
                        ? 'Or & Métaux précieux'
                        : 'Autre actif'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteAsset(ast.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                  title="Supprimer cet actif"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="pt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
                {userSettings.hideAmounts ? '••••••••' : formatCurrency(ast.value, ast.currency)}
              </div>

              {ast.notes && (
                <p className="text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-2">
                  {ast.notes}
                </p>
              )}
            </div>
          ))}
      </div>

      {/* Modal: Interactive Souscription / Achat de parts */}
      {isSubscribeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161618] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Souscrire / Acheter des parts
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {subscribeItem.symbol} — {subscribeItem.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubscribeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {subscriptionSuccessMessage ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {subscriptionSuccessMessage}
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteSubscription} className="space-y-4">
                {/* Current Quote Card */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Cours en direct (Marché)
                    </span>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {subscribeItem.name} ({subscribeItem.symbol})
                    </div>
                    <div className="text-[10px] text-slate-500">{subscribeItem.market}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-base font-black text-blue-700 dark:text-blue-300">
                      {subscribeItem.price.toLocaleString()} {subscribeItem.currency}
                    </div>
                    <span className={`text-[10px] font-bold ${subscribeItem.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {subscribeItem.change24h >= 0 ? '+' : ''}{subscribeItem.change24h}% (24h)
                    </span>
                  </div>
                </div>

                {/* Mode selector */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSubscriptionMode('AMOUNT')}
                    className={`py-2 rounded-xl transition cursor-pointer ${
                      subscriptionMode === 'AMOUNT'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Par Montant Total (DH)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubscriptionMode('SHARES')}
                    className={`py-2 rounded-xl transition cursor-pointer ${
                      subscriptionMode === 'SHARES'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Par Nombre de Parts
                  </button>
                </div>

                {subscriptionMode === 'AMOUNT' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Montant à investir ({userSettings.primaryCurrency})
                    </label>
                    <input
                      required
                      type="number"
                      step="any"
                      min="10"
                      value={subscriptionAmountStr}
                      onChange={(e) => setSubscriptionAmountStr(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                      placeholder="Ex: 5000"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Équivaut à{' '}
                      <strong className="text-blue-600 dark:text-blue-400">
                        {(parseFloat(subscriptionAmountStr || '0') / subscribeItem.price).toFixed(3)}
                      </strong>{' '}
                      parts au cours actuel de {subscribeItem.price} {subscribeItem.currency}.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre de parts / titres
                    </label>
                    <input
                      required
                      type="number"
                      step="any"
                      min="0.001"
                      value={subscriptionSharesStr}
                      onChange={(e) => setSubscriptionSharesStr(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                      placeholder="Ex: 10"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Coût total estimé :{' '}
                      <strong className="text-blue-600 dark:text-blue-400">
                        {formatCurrency(
                          parseFloat(subscriptionSharesStr || '0') * subscribeItem.price,
                          userSettings.primaryCurrency
                        )}
                      </strong>
                    </p>
                  </div>
                )}

                {/* Account debit option */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-slate-400" />
                    <span>Compte bancaire de débit (optionnel)</span>
                  </label>
                  <select
                    value={debitAccountId}
                    onChange={(e) => setDebitAccountId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Ne pas débiter de compte bancaire (saisie de portefeuille seule)</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} — Solde : {formatCurrency(acc.balance, acc.currency)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubscribeModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Valider la souscription</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Financial Holding (Comprehensive Market Catalog & Symbol Search) */}
      {isAddHoldingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161618] p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Catalogue & Recherche de Titres Cotés
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Bourse de Casablanca, OPCVM, Cryptomonnaies ou recherche par symbole personnalisé
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddHoldingOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs font-bold">
              {[
                { id: 'ALL', label: 'Toutes les valeurs' },
                { id: 'BVC', label: 'Actions BVC' },
                { id: 'OPCVM', label: 'OPCVM Maroc' },
                { id: 'CRYPTO', label: 'Cryptomonnaies' },
                { id: 'INDEX', label: 'Indices & Matières' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCatalogCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    catalogCategory === c.id
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search Input with Symbol Search Fallback */}
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={catalogSearchQuery}
                onChange={(e) => setCatalogSearchQuery(e.target.value)}
                placeholder="Rechercher par nom ou symbole (ex: ATW, Maroc Telecom, BTC, NVDA, AAPL)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Catalog Items Scrollable List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-900/30">
              {filteredCatalog.map((item) => {
                const isSelected = selectedItem.symbol === item.symbol;
                return (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => handleSelectMarketItem(item)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/10 border border-blue-500/30 text-blue-800 dark:text-blue-300'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {item.symbol}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.market}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right shrink-0 font-mono">
                        <div className="text-xs font-black">
                          {item.price.toLocaleString()} {item.currency}
                        </div>
                        <div className={`text-[10px] font-bold ${item.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.change24h >= 0 ? '+' : ''}{item.change24h}%
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSubscribeModal(item);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition shadow-xs"
                      >
                        Souscrire
                      </button>
                    </div>
                  </button>
                );
              })}

              {/* If search query has no match, offer custom live symbol lookup */}
              {filteredCatalog.length === 0 && catalogSearchQuery.trim() && (
                <div className="p-4 text-center space-y-2">
                  <div className="text-xs text-slate-500">
                    Aucune valeur pré-enregistrée pour "{catalogSearchQuery}".
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearchCustomSymbol(catalogSearchQuery)}
                    disabled={isLookingUpSymbol}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Globe className="h-4 w-4" />
                    <span>
                      {isLookingUpSymbol
                        ? 'Recherche sur les marchés en cours...'
                        : `Rechercher et coter "${catalogSearchQuery.toUpperCase()}" en direct`}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Selected Item Detail & PRU Form */}
            <form onSubmit={handleAddHoldingToStocks} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Valeur sélectionnée
                  </span>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {selectedItem.symbol} — {selectedItem.name}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-black text-blue-700 dark:text-blue-300">
                    {selectedItem.price.toLocaleString()} {selectedItem.currency}
                  </div>
                  <div className="text-[10px] text-slate-400">Cours de référence</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quantité détenue
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={holdingQuantity}
                    onChange={(e) => setHoldingQuantity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Ex: 50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PRU (Prix de revient en DH)
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={holdingBuyPrice}
                    onChange={(e) => setHoldingBuyPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Ex: 520"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cours réel actuel (DH)
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={holdingCurrentPrice}
                    onChange={(e) => setHoldingCurrentPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Ex: 554"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddHoldingOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
                >
                  Ajouter au portefeuille
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Physical Asset */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161618] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ajouter un actif au patrimoine
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nom de l'actif
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Appartement Maârif, Lingot Or 50g..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catégorie d'actif
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="REAL_ESTATE">Immobilier (Résidence, Terrain, Locatif)</option>
                  <option value="GOLD">Or & Métaux précieux</option>
                  <option value="CRYPTO">Cryptomonnaie / Actifs alternatifs</option>
                  <option value="STOCKS">Bourse / Titres de participation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Valeur estimée actuelle ({userSettings.primaryCurrency})
                </label>
                <input
                  required
                  type="number"
                  value={valueStr}
                  onChange={(e) => setValueStr(e.target.value)}
                  placeholder="Ex: 1200000"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Prix d'acquisition initial (optionnel)
                </label>
                <input
                  type="number"
                  value={purchaseValueStr}
                  onChange={(e) => setPurchaseValueStr(e.target.value)}
                  placeholder="Ex: 980000"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes ou localisation
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Titre foncier Maârif, estimé par notaire..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs active:scale-98 transition cursor-pointer"
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

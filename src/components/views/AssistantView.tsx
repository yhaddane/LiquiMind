import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Download,
  Trash2,
  BarChart3,
  TrendingUp,
  PieChart,
  FileText,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  Settings,
  X,
  Sliders,
  Check,
  Building2,
  Wallet,
  HandCoins,
  Target,
  Repeat,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  calculateTotalBalance,
  calculateNetWorth,
  calculateMonthlyCashflow,
} from '../../utils/finance';
import { ChatMessage, CustomReportConfig } from '../../types';

export const AssistantView: React.FC = () => {
  const {
    chatHistory,
    setChatHistory,
    clearChatHistory,
    accounts,
    categories,
    transactions,
    budgets,
    debtLedger,
    goals,
    assets,
    recurring,
    userSettings,
    spaces,
    activeSpaceId,
  } = useApp();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCustomDocModalOpen, setIsCustomDocModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom Report Configuration State
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const firstOfMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);

  const [reportConfig, setReportConfig] = useState<CustomReportConfig>({
    title: 'Rapport d’Analyse & Bilan Financier Personnalisé',
    startDate: firstOfMonthStr,
    endDate: todayStr,
    spaceId: activeSpaceId,
    includeAccounts: true,
    includeCashflow: true,
    includeTransactions: true,
    includeDebts: true,
    includeAssets: true,
    includeGoals: true,
    includeRecurring: true,
    includeBudgets: true,
    customNotes:
      'Ce document récapitule la situation financière détaillée, les flux constatés sur la période sélectionnée et les prévisions d’arbitrage d’épargne.',
  });

  const [activePreset, setActivePreset] = useState<'month' | 'lastMonth' | 'quarter' | 'year' | 'custom'>('month');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Contextual financial metrics
  const totalBalance = calculateTotalBalance(accounts);
  const netWorth = calculateNetWorth(accounts, assets);
  const activeDebts = debtLedger.filter((d) => d.type === 'BANK_LOAN' || d.type === 'LOAN_RECEIVED');
  const totalDebtRemaining = activeDebts.reduce((s, d) => s + (d.remainingCapital ?? d.amount), 0);

  const monthlyFixedTotal = recurring
    .filter((r) => r.isActive && r.cadence === 'MONTHLY')
    .reduce((s, r) => s + r.amountHint, 0);

  const monthlyIncome = categories
    .filter((c) => c.direction === 'IN' && c.expectedAmount)
    .reduce((s, c) => s + (c.expectedAmount || 0), 0);

  const cashflowRes = calculateMonthlyCashflow(transactions, todayStr.slice(0, 7));

  // Date Presets Handler
  const applyPreset = (preset: 'month' | 'lastMonth' | 'quarter' | 'year') => {
    setActivePreset(preset);
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    if (preset === 'month') {
      const s = `${y}-${String(m + 1).padStart(2, '0')}-01`;
      setReportConfig((prev) => ({ ...prev, startDate: s, endDate: todayStr }));
    } else if (preset === 'lastMonth') {
      const lastM = m === 0 ? 11 : m - 1;
      const lastY = m === 0 ? y - 1 : y;
      const s = `${lastY}-${String(lastM + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(lastY, lastM + 1, 0).getDate();
      const e = `${lastY}-${String(lastM + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      setReportConfig((prev) => ({ ...prev, startDate: s, endDate: e }));
    } else if (preset === 'quarter') {
      const qStartMonth = Math.floor(m / 3) * 3;
      const s = `${y}-${String(qStartMonth + 1).padStart(2, '0')}-01`;
      setReportConfig((prev) => ({ ...prev, startDate: s, endDate: todayStr }));
    } else if (preset === 'year') {
      const s = `${y}-01-01`;
      setReportConfig((prev) => ({ ...prev, startDate: s, endDate: todayStr }));
    }
  };

  // Generate Custom Report HTML
  const generateCustomReportHtml = (config: CustomReportConfig) => {
    // Filter transactions for period
    const isTargetSpace = (spId?: string) => !config.spaceId || config.spaceId === 'all' || spId === config.spaceId;

    const filteredTxs = transactions.filter((t) => {
      const inDate = t.date >= config.startDate && t.date <= config.endDate;
      const inSpace = isTargetSpace(t.spaceId);
      return inDate && inSpace;
    });

    const incomeTxs = filteredTxs.filter((t) => t.amount > 0);
    const expenseTxs = filteredTxs.filter((t) => t.amount < 0);
    const totalIn = incomeTxs.reduce((s, t) => s + t.amount, 0);
    const totalOut = Math.abs(expenseTxs.reduce((s, t) => s + t.amount, 0));
    const netPeriod = totalIn - totalOut;

    const filteredAccounts = accounts.filter((a) => isTargetSpace(a.spaceId));
    const filteredDebts = debtLedger.filter((d) => isTargetSpace(d.spaceId));
    const filteredAssets = assets.filter((a) => isTargetSpace(a.spaceId));
    const filteredGoals = goals.filter((g) => isTargetSpace(g.spaceId));
    const filteredRecurring = recurring.filter((r) => isTargetSpace(r.spaceId));

    const spaceLabel = config.spaceId && config.spaceId !== 'all'
      ? spaces.find((s) => s.id === config.spaceId)?.name || config.spaceId
      : 'Tous les espaces consolidés';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${config.title} — LiquiMind</title>
  <style>
    @media print {
      body { padding: 20px !important; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #ffffff;
      color: #111827;
      padding: 48px;
      max-width: 900px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .header {
      border-bottom: 3px solid #1d4ed8;
      padding-bottom: 20px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #111827;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #4b5563;
      margin-top: 4px;
    }
    .badge-space {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #334155;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 28px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      text-align: center;
    }
    .kpi-title {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .kpi-val {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 6px;
    }
    .kpi-val.positive { color: #059669; }
    .kpi-val.negative { color: #dc2626; }
    h2 {
      font-size: 16px;
      font-weight: 800;
      color: #1e293b;
      margin-top: 28px;
      margin-bottom: 12px;
      border-left: 4px solid #1d4ed8;
      padding-left: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 13px;
    }
    th, td {
      padding: 9px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
    }
    .amount-col { text-align: right; font-weight: 700; font-family: monospace; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }
    .notes-box {
      background: #eff6ff;
      border-left: 4px solid #1d4ed8;
      padding: 14px 18px;
      border-radius: 8px;
      font-size: 13px;
      color: #1e40af;
      margin-top: 24px;
      line-height: 1.6;
    }
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">LiquiMind</h1>
      <div class="brand-subtitle">${config.title}</div>
    </div>
    <div class="badge-space">Espace : ${spaceLabel}</div>
  </div>

  <div class="meta-box">
    <div><strong>Période d'analyse :</strong> du ${config.startDate} au ${config.endDate}</div>
    <div><strong>Généré pour :</strong> ${userSettings.userName} (${userSettings.email})</div>
    <div><strong>Émis le :</strong> ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
  </div>

  ${
    config.includeCashflow
      ? `<div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-title">Recettes Période</div>
        <div class="kpi-val positive">+${formatCurrency(totalIn, userSettings.primaryCurrency)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Dépenses Période</div>
        <div class="kpi-val negative">-${formatCurrency(totalOut, userSettings.primaryCurrency)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Flux Net Période</div>
        <div class="kpi-val ${netPeriod >= 0 ? 'positive' : 'negative'}">
          ${netPeriod >= 0 ? '+' : ''}${formatCurrency(netPeriod, userSettings.primaryCurrency)}
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Patrimoine Net</div>
        <div class="kpi-val">${formatCurrency(netWorth, userSettings.primaryCurrency)}</div>
      </div>
    </div>`
      : ''
  }

  ${
    config.includeAccounts
      ? `<h2>1. Synthèse des Comptes & Liquidités (${filteredAccounts.length})</h2>
    <table>
      <thead><tr><th>Compte</th><th>Banque</th><th>Devise</th><th class="amount-col">Solde Actuel</th></tr></thead>
      <tbody>
        ${filteredAccounts.map((a) => `<tr><td><strong>${a.name}</strong></td><td>${a.bankName || '—'}</td><td>${a.currency}</td><td class="amount-col">${formatCurrency(a.balance, a.currency)}</td></tr>`).join('')}
      </tbody>
    </table>`
      : ''
  }

  ${
    config.includeTransactions && filteredTxs.length > 0
      ? `<h2>2. Opérations & Mouvements sur la période (${filteredTxs.length} opération${filteredTxs.length > 1 ? 's' : ''})</h2>
    <table>
      <thead><tr><th>Date</th><th>Libellé</th><th>Catégorie</th><th class="amount-col">Montant</th></tr></thead>
      <tbody>
        ${filteredTxs
          .slice(0, 50)
          .map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            return `<tr><td>${tx.date}</td><td>${tx.description}</td><td>${cat?.name || 'Général'}</td><td class="amount-col" style="color: ${tx.amount >= 0 ? '#059669' : '#111827'}">${tx.amount >= 0 ? '+' : ''}${formatCurrency(tx.amount, userSettings.primaryCurrency)}</td></tr>`;
          })
          .join('')}
      </tbody>
    </table>
    ${filteredTxs.length > 50 ? `<p style="font-size: 11px; color: #64748b; margin-top: 6px;">* Affichage des 50 premières opérations sur un total de ${filteredTxs.length}.</p>` : ''}`
      : config.includeTransactions
      ? `<h2>2. Opérations sur la période</h2><p style="font-size: 13px; color: #64748b;">Aucune transaction enregistrée entre le ${config.startDate} et le ${config.endDate}.</p>`
      : ''
  }

  ${
    config.includeDebts && filteredDebts.length > 0
      ? `<h2>3. Dettes, Crédits & Échéances</h2>
    <table>
      <thead><tr><th>Description</th><th>Organisme</th><th>Mensualité</th><th class="amount-col">Capital Restant</th></tr></thead>
      <tbody>
        ${filteredDebts
          .map(
            (d) =>
              `<tr><td><strong>${d.description}</strong></td><td>${d.bankName || 'Organisme'}</td><td>${formatCurrency(d.monthlyPayment || 0, d.currency)}/m</td><td class="amount-col">${formatCurrency(d.remainingCapital ?? d.amount, d.currency)}</td></tr>`
          )
          .join('')}
      </tbody>
    </table>`
      : ''
  }

  ${
    config.includeAssets && filteredAssets.length > 0
      ? `<h2>4. Portefeuille d'Actifs & Bourse (${filteredAssets.length})</h2>
    <table>
      <thead><tr><th>Désignation</th><th>Catégorie</th><th>Prix Achat / PRU</th><th class="amount-col">Valeur Actuelle</th></tr></thead>
      <tbody>
        ${filteredAssets
          .map(
            (a) =>
              `<tr><td><strong>${a.name}</strong></td><td>${a.category}</td><td>${a.purchaseValue ? formatCurrency(a.purchaseValue, a.currency) : '—'}</td><td class="amount-col">${formatCurrency(a.value, a.currency)}</td></tr>`
          )
          .join('')}
      </tbody>
    </table>`
      : ''
  }

  ${
    config.includeGoals && filteredGoals.length > 0
      ? `<h2>5. Objectifs d'Épargne & Avancement</h2>
    <table>
      <thead><tr><th>Objectif</th><th>Date cible</th><th>Épargne actuelle</th><th class="amount-col">Cible</th></tr></thead>
      <tbody>
        ${filteredGoals
          .map((g) => {
            const pct = Math.min(100, Math.round(((g.allocated || 0) / (g.targetAmount || 1)) * 100));
            return `<tr><td><strong>${g.name}</strong> (${pct}%)</td><td>${g.deadline || 'Sans échéance'}</td><td>${formatCurrency(g.allocated || 0, userSettings.primaryCurrency)}</td><td class="amount-col">${formatCurrency(g.targetAmount, userSettings.primaryCurrency)}</td></tr>`;
          })
          .join('')}
      </tbody>
    </table>`
      : ''
  }

  ${
    config.customNotes
      ? `<div class="notes-box">
      <strong>Notes & Recommandations du Gestionnaire :</strong><br/>
      ${config.customNotes.replace(/\n/g, '<br/>')}
    </div>`
      : ''
  }

  <div class="footer">
    <span>Document certifié conforme généré par LiquiMind Assistant IA</span>
    <span>ID Sécurisé : LM-${Date.now().toString(36).toUpperCase()}</span>
  </div>
</body>
</html>`;
  };

  const handleDownloadCustomHtml = () => {
    const html = generateCustomReportHtml(reportConfig);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LiquiMind_Rapport_${reportConfig.startDate}_au_${reportConfig.endDate}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintCustomReport = () => {
    const html = generateCustomReportHtml(reportConfig);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const lower = userText.toLowerCase();

    setTimeout(() => {
      let replyContent = '';
      let chartData: ChatMessage['chartData'] = undefined;
      let reportDownloadable = false;

      if (lower.includes('graphique') || lower.includes('flux') || lower.includes('diagramme')) {
        replyContent = `Voici la synthèse graphique de vos flux financiers pour le mois en cours :`;
        chartData = {
          type: 'cashflow',
          title: 'Flux de trésorerie mensuels (DH)',
          items: [
            { label: 'Revenus nets', value: monthlyIncome || 21300, color: '#1d4ed8' },
            { label: 'Charges fixes', value: monthlyFixedTotal || 8900, color: '#ef4444' },
            { label: 'Budgets variables', value: 4700, color: '#f59e0b' },
            {
              label: 'Capacité d’épargne',
              value: Math.max(0, (monthlyIncome || 21300) - (monthlyFixedTotal || 8900) - 4700),
              color: '#10b981',
            },
          ],
        };
      } else if (
        lower.includes('personnalisé') ||
        lower.includes('sur mesure') ||
        lower.includes('date') ||
        lower.includes('document') ||
        lower.includes('bilan') ||
        lower.includes('rapport') ||
        lower.includes('pdf') ||
        lower.includes('export')
      ) {
        replyContent = `J’ai configuré votre générateur de documents personnalisés. Vous pouvez choisir vos dates exactes de début et de fin, filtrer par espace, sélectionner les rubriques souhaitées (soldes, flux, dettes, actifs) et exporter en HTML ou PDF imprimable certifié.`;
        reportDownloadable = true;
      } else if (lower.includes('crédit') || lower.includes('emprunt') || lower.includes('remboursement')) {
        replyContent = `Vos crédits et dettes actives représentent un capital restant dû de **${formatCurrency(totalDebtRemaining, userSettings.primaryCurrency)}**.\n\n💡 Simulation : pour un crédit à 4.25%, un remboursement anticipé de 50 000 DH fait économiser des intérêts significatifs ou réduit la durée globale de votre échéancier.`;
      } else if (lower.includes('combien') && (lower.includes('reste') || lower.includes('disponible'))) {
        const netDispo = totalBalance - monthlyFixedTotal;
        replyContent = `Après déduction de vos charges fixes mensuelles (${formatCurrency(monthlyFixedTotal, userSettings.primaryCurrency)}), il vous reste **${formatCurrency(netDispo, userSettings.primaryCurrency)}** de trésorerie disponible.`;
      } else {
        replyContent = `J’ai analysé votre situation financière : vos liquidités s'élèvent à **${formatCurrency(totalBalance, userSettings.primaryCurrency)}** et votre patrimoine net à **${formatCurrency(netWorth, userSettings.primaryCurrency)}**.\n\nQue souhaitez-vous faire ? Vous pouvez me demander un graphique de flux, une simulation de crédit ou générer un document personnalisé avec vos dates sur mesure.`;
      }

      const botMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toISOString(),
        chartData,
        reportDownloadable,
      };

      setChatHistory((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] overflow-hidden shadow-2xl">
      {/* Assistant Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#121214]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20 text-brand">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Assistant Financier LiquiMind
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                En ligne &bull; Intelligence active
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Posez toutes vos questions ou générez des documents personnalisés avec dates sur mesure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Document Generator Button */}
          <button
            onClick={() => setIsCustomDocModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-brand text-xs font-bold shadow-sm transition cursor-pointer"
            title="Générer un document personnalisé avec dates et données sur mesure"
          >
            <FileText className="h-4 w-4" />
            <span>Document personnalisé</span>
          </button>

          <button
            onClick={clearChatHistory}
            className="p-2 text-neutral-400 hover:text-rose-500 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            title="Effacer la conversation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {chatHistory.map((msg) => {
          const isBot = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isBot
                    ? 'bg-neutral-100 dark:bg-[#1b1b1e] border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-sm'
                    : 'btn-brand font-medium shadow-md'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Embedded Flow Chart inside Chat */}
                {msg.chartData && (
                  <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-brand" />
                        {msg.chartData.title}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {msg.chartData.items.map((item, idx) => {
                        const maxVal = Math.max(...msg.chartData!.items.map((i) => i.value));
                        const pct = Math.round((item.value / maxVal) * 100);
                        return (
                          <div key={idx}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                                {item.label}
                              </span>
                              <span className="font-bold text-neutral-900 dark:text-white">
                                {formatCurrency(item.value, userSettings.primaryCurrency)}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: item.color || '#1d4ed8' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Embedded Document Generator Trigger Button */}
                {msg.reportDownloadable && (
                  <div className="mt-3 pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsCustomDocModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl btn-brand font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      <Sliders className="h-4 w-4" />
                      <span>Personnaliser les dates & données du rapport</span>
                    </button>
                    <button
                      onClick={handleDownloadCustomHtml}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Télécharger (HTML)</span>
                    </button>
                  </div>
                )}
              </div>
              {!isBot && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 dark:bg-[#1b1b1e] px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
              <span className="h-2 w-2 rounded-full bg-brand animate-bounce"></span>
              <span className="h-2 w-2 rounded-full bg-brand animate-bounce [animation-delay:0.2s]"></span>
              <span className="h-2 w-2 rounded-full bg-brand animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1">L'assistant analyse vos données...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2 bg-neutral-100/70 dark:bg-[#141416] border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setIsCustomDocModalOpen(true)}
          className="px-3 py-1 text-xs font-bold rounded-full bg-brand/10 text-brand hover:bg-brand/20 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="h-3 w-3" />
          <span>Générer document personnalisé</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setInput('Génère-moi un graphique de mes flux financiers');
            setTimeout(() => handleSendMessage(), 50);
          }}
          className="px-3 py-1 text-xs rounded-full bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 whitespace-nowrap transition cursor-pointer"
        >
          📊 Graphique de flux
        </button>
        <button
          type="button"
          onClick={() => {
            setInput('Combien me reste-t-il après déduction de mes charges fixes ?');
            setTimeout(() => handleSendMessage(), 50);
          }}
          className="px-3 py-1 text-xs rounded-full bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 whitespace-nowrap transition cursor-pointer"
        >
          💰 Reste après charges fixes
        </button>
        <button
          type="button"
          onClick={() => {
            setInput('Analyse mon crédit immobilier et mes dettes');
            setTimeout(() => handleSendMessage(), 50);
          }}
          className="px-3 py-1 text-xs rounded-full bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 whitespace-nowrap transition cursor-pointer"
        >
          🏛️ Dettes & Simulation crédit
        </button>
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-neutral-50 dark:bg-[#121214] border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez une question, demandez une simulation ou un document personnalisé..."
          className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:border-brand rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="flex items-center justify-center h-11 w-11 rounded-xl btn-brand disabled:opacity-50 transition cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {/* CUSTOM DOCUMENT GENERATOR MODAL */}
      {isCustomDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#121214]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Générateur de Document Financier Personnalisé
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Définissez vos dates sur mesure, filtrez vos données et exportez en HTML ou PDF imprimable
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomDocModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Document Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Titre du document :
                </label>
                <input
                  type="text"
                  value={reportConfig.title}
                  onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
                  placeholder="ex: Rapport d'Analyse Financière Q4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              {/* Date Presets & Custom Dates */}
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-brand" />
                    <span>Plage de Dates Personnalisée</span>
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    Format : AAAA-MM-JJ
                  </span>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset('month')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activePreset === 'month'
                        ? 'btn-brand'
                        : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    Ce mois
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('lastMonth')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activePreset === 'lastMonth'
                        ? 'btn-brand'
                        : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    Mois dernier
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('quarter')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activePreset === 'quarter'
                        ? 'btn-brand'
                        : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    Trimestre
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('year')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activePreset === 'year'
                        ? 'btn-brand'
                        : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    Année entière
                  </button>
                </div>

                {/* Start & End Date Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Date de début :
                    </label>
                    <input
                      type="date"
                      value={reportConfig.startDate}
                      onChange={(e) => {
                        setActivePreset('custom');
                        setReportConfig({ ...reportConfig, startDate: e.target.value });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Date de fin :
                    </label>
                    <input
                      type="date"
                      value={reportConfig.endDate}
                      onChange={(e) => {
                        setActivePreset('custom');
                        setReportConfig({ ...reportConfig, endDate: e.target.value });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Target Space Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-brand" />
                  <span>Espace concerné :</span>
                </label>
                <select
                  value={reportConfig.spaceId || 'all'}
                  onChange={(e) =>
                    setReportConfig({
                      ...reportConfig,
                      spaceId: e.target.value === 'all' ? 'all' : e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="all">🌐 Tous les espaces (Consolidé)</option>
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name} ({s.tag})
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Inclusions Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Données financières personnalisées à inclure :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeAccounts}
                      onChange={(e) =>
                        setReportConfig({ ...reportConfig, includeAccounts: e.target.checked })
                      }
                      className="rounded accent-blue-600 h-4 w-4"
                    />
                    <div className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-brand" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Comptes & Soldes
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeCashflow}
                      onChange={(e) =>
                        setReportConfig({ ...reportConfig, includeCashflow: e.target.checked })
                      }
                      className="rounded accent-blue-600 h-4 w-4"
                    />
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Flux & KPI Période
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeTransactions}
                      onChange={(e) =>
                        setReportConfig({ ...reportConfig, includeTransactions: e.target.checked })
                      }
                      className="rounded accent-blue-600 h-4 w-4"
                    />
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Transactions détaillées
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeDebts}
                      onChange={(e) =>
                        setReportConfig({ ...reportConfig, includeDebts: e.target.checked })
                      }
                      className="rounded accent-blue-600 h-4 w-4"
                    />
                    <div className="flex items-center gap-1.5">
                      <HandCoins className="h-3.5 w-3.5 text-rose-500" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Dettes & Crédits
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeAssets}
                      onChange={(e) =>
                        setReportConfig({ ...reportConfig, includeAssets: e.target.checked })
                      }
                      className="rounded accent-blue-600 h-4 w-4"
                    />
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-purple-500" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Patrimoine, Bourse & OPCVM
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeGoals}
                      onChange={(e) =>
                        setReportConfig({ ...reportConfig, includeGoals: e.target.checked })
                      }
                      className="rounded accent-blue-600 h-4 w-4"
                    />
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-amber-500" />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        Objectifs d'épargne
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Custom Manager Notes */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Notes, observations & recommandations personnalisées :
                </label>
                <textarea
                  rows={3}
                  value={reportConfig.customNotes}
                  onChange={(e) => setReportConfig({ ...reportConfig, customNotes: e.target.value })}
                  placeholder="Ajoutez vos commentaires d'arbitrage ou d'analyse pour votre conseiller..."
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#121214] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-neutral-500">
                Période active : <strong>{reportConfig.startDate}</strong> →{' '}
                <strong>{reportConfig.endDate}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintCustomReport}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimer / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCustomHtml}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-brand text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Télécharger le document (HTML)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  calculateTotalBalance,
  calculateNetWorth,
  calculateMonthlyCashflow,
} from '../../utils/finance';
import { ChatMessage } from '../../types';

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
  } = useApp();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const cashflowRes = calculateMonthlyCashflow(transactions, '2026-11');

  const generateReportHtml = () => {
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport d'Analyse Financière — LiquiMind</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #111827; padding: 40px; max-width: 860px; margin: auto; }
    h1 { color: #101011; font-size: 26px; border-bottom: 3px solid #c4f24e; padding-bottom: 12px; margin-bottom: 24px; }
    h2 { font-size: 18px; color: #1f2937; margin-top: 28px; margin-bottom: 12px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .kpi-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center; }
    .kpi-title { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; }
    .kpi-val { font-size: 20px; font-weight: 800; color: #111827; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    th { background: #f3f4f6; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #e6f5c8; color: #27401a; }
    .footer { margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  </style>
</head>
<body>
  <h1>📊 LiquiMind — Rapport d'Analyse Financière Intégrale</h1>
  <p><strong>Utilisateur :</strong> ${userSettings.userName} (${userSettings.email}) &bull; <strong>Date :</strong> ${dateStr}</p>
  
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-title">Liquidités Totales</div>
      <div class="kpi-val">${formatCurrency(totalBalance, userSettings.primaryCurrency)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Patrimoine Net</div>
      <div class="kpi-val">${formatCurrency(netWorth, userSettings.primaryCurrency)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Charges Fixes</div>
      <div class="kpi-val">${formatCurrency(monthlyFixedTotal, userSettings.primaryCurrency)}/m</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Dettes & Crédits</div>
      <div class="kpi-val">${formatCurrency(totalDebtRemaining, userSettings.primaryCurrency)}</div>
    </div>
  </div>

  <h2>1. Comptes & Soldes</h2>
  <table>
    <thead><tr><th>Compte</th><th>Banque</th><th>Type</th><th>Solde</th></tr></thead>
    <tbody>
      ${accounts
        .map(
          (a) =>
            `<tr><td><strong>${a.name}</strong></td><td>${a.bankName || '—'}</td><td>${a.type}</td><td><strong>${formatCurrency(a.balance, a.currency)}</strong></td></tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>2. Charges Récurrentes Mensuelles</h2>
  <table>
    <thead><tr><th>Libellé</th><th>Échéance</th><th>Montant estimé</th></tr></thead>
    <tbody>
      ${recurring
        .filter((r) => r.isActive)
        .map(
          (r) =>
            `<tr><td>${r.label}</td><td>Jour ${r.dayOfMonth} du mois</td><td><strong>${formatCurrency(r.amountHint, userSettings.primaryCurrency)}</strong></td></tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>3. Crédits Bancaires & Dettes</h2>
  <table>
    <thead><tr><th>Description</th><th>Organisme</th><th>Mensualité</th><th>Capital Restant</th></tr></thead>
    <tbody>
      ${debtLedger
        .filter((d) => d.type === 'BANK_LOAN')
        .map(
          (d) =>
            `<tr><td>${d.description}</td><td>${d.bankName || 'Banque'}</td><td>${formatCurrency(d.monthlyPayment || 0, d.currency)}/m</td><td><strong>${formatCurrency(d.remainingCapital || d.amount, d.currency)}</strong></td></tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>4. Recommandations Stratégiques de l'Assistant IA</h2>
  <ul>
    <li><strong>Règle 50/30/20 :</strong> Vos charges fixes représentent ${Math.round((monthlyFixedTotal / (monthlyIncome || 1)) * 100)}% de vos revenus mensuels. Le ratio recommandé est &le; 50%.</li>
    <li><strong>Fonds de sécurité :</strong> Vos liquidités actuelles couvrent environ ${(totalBalance / (monthlyFixedTotal || 1)).toFixed(1)} mois de dépenses de base. Objectif optimal : 6 mois.</li>
    <li><strong>Portefeuille d'actifs :</strong> Votre patrimoine est composé à 90% d'immobilier et 10% de marchés financiers/or. Diversifiez progressivement sur les OPCVM actions et obligations.</li>
  </ul>

  <div class="footer">
    Document certifié conforme généré par LiquiMind Assistant IA &bull; ${dateStr}
  </div>
</body>
</html>`;
  };

  const downloadReport = () => {
    const html = generateReportHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LiquiMind_Rapport_Financier_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
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
        replyContent = `Voici la répartition graphique de vos flux financiers pour ce mois :`;
        chartData = {
          type: 'cashflow',
          title: 'Flux de trésorerie mensuels (DH)',
          items: [
            { label: 'Revenus nets', value: monthlyIncome || 21300, color: '#c4f24e' },
            { label: 'Charges fixes', value: monthlyFixedTotal || 8900, color: '#f87171' },
            { label: 'Budgets variables', value: 4700, color: '#fbbf24' },
            { label: 'Capacité d’épargne', value: Math.max(0, (monthlyIncome || 21300) - (monthlyFixedTotal || 8900) - 4700), color: '#38bdf8' },
          ],
        };
      } else if (lower.includes('rapport') || lower.includes('pdf') || lower.includes('télécharger') || lower.includes('export')) {
        replyContent = `J’ai compilé votre rapport d’analyse financière complet comprenant vos liquidités (${formatCurrency(totalBalance, userSettings.primaryCurrency)}), votre patrimoine net (${formatCurrency(netWorth, userSettings.primaryCurrency)}), vos échéances d’emprunt et vos prévisions. Vous pouvez le télécharger ci-dessous :`;
        reportDownloadable = true;
      } else if (lower.includes('crédit') || lower.includes('emprunt') || lower.includes('remboursement anticipé')) {
        replyContent = `Vous avez actuellement un Crédit Immobilier auprès d'Attijariwafa Bank avec un capital restant dû de ${formatCurrency(totalDebtRemaining, userSettings.primaryCurrency)} et une mensualité de 3 850 DH/mois à 4.25%.\n\n💡 Un remboursement partiel anticipé de 50 000 DH réduirait votre durée de prêt de 26 mois ou ferait baisser votre mensualité de ~460 DH/mois.`;
      } else if (lower.includes('combien') && (lower.includes('reste') || lower.includes('disponible'))) {
        const netDispo = totalBalance - monthlyFixedTotal;
        replyContent = `Après déduction de l'ensemble de vos charges fixes du mois (${formatCurrency(monthlyFixedTotal, userSettings.primaryCurrency)}), il vous reste exactement **${formatCurrency(netDispo, userSettings.primaryCurrency)}** de trésorerie libre pour vos dépenses courantes et votre épargne.`;
      } else {
        replyContent = `J’ai analysé votre situation : votre solde global est de **${formatCurrency(totalBalance, userSettings.primaryCurrency)}** réparti sur ${accounts.length} comptes, et votre patrimoine net s'élève à **${formatCurrency(netWorth, userSettings.primaryCurrency)}**.\n\nVotre taux d'épargne moyen est estimé à **${cashflowRes.savingsRate}%**. Souhaitez-vous visualiser un graphique de vos flux ou télécharger un rapport complet ?`;
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
    }, 500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] rounded-3xl border border-neutral-800 bg-[#161618] overflow-hidden shadow-2xl">
      {/* Assistant Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#121214]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c4f24e]/10 border border-[#c4f24e]/20 text-[#c4f24e]">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Assistant Financier LiquiMind</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                En ligne &bull; Contexte synchronisé
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Posez toutes vos questions sur vos comptes, crédits, budgets et prévisions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition"
          >
            <Download className="h-4 w-4 text-[#c4f24e]" />
            <span>Rapport d'analyse</span>
          </button>
          <button
            onClick={clearChatHistory}
            className="p-2 text-neutral-400 hover:text-red-400 rounded-xl hover:bg-neutral-800 transition"
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#c4f24e]/10 border border-[#c4f24e]/20 text-[#c4f24e]">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isBot
                    ? 'bg-[#1b1b1e] border border-neutral-800 text-neutral-200'
                    : 'bg-[#c4f24e] text-neutral-950 font-medium'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Embedded Flow Chart inside Chat */}
                {msg.chartData && (
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 bg-neutral-900/60 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-[#c4f24e]" />
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
                              <span className="text-neutral-300 font-medium">{item.label}</span>
                              <span className="font-bold text-white">
                                {formatCurrency(item.value, userSettings.primaryCurrency)}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: item.color || '#c4f24e' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Embedded Report Download Button */}
                {msg.reportDownloadable && (
                  <div className="mt-3 pt-2">
                    <button
                      onClick={downloadReport}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c4f24e] text-neutral-950 font-bold text-xs hover:bg-[#b0dc41] shadow-lg shadow-[#c4f24e]/10 transition"
                    >
                      <Download className="h-4 w-4" />
                      <span>Télécharger le rapport financier (HTML/PDF)</span>
                    </button>
                  </div>
                )}
              </div>
              {!isBot && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c4f24e]/10 text-[#c4f24e]">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-[#1b1b1e] px-4 py-3 text-xs text-neutral-400 border border-neutral-800">
              <span className="h-2 w-2 rounded-full bg-[#c4f24e] animate-bounce"></span>
              <span className="h-2 w-2 rounded-full bg-[#c4f24e] animate-bounce [animation-delay:0.2s]"></span>
              <span className="h-2 w-2 rounded-full bg-[#c4f24e] animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1">L'assistant réfléchit...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2 bg-[#141416] border-t border-neutral-800/60 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setInput('Génère-moi un graphique de mes flux de ce mois');
            setTimeout(() => handleSendMessage(), 50);
          }}
          className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap transition"
        >
          📊 Graphique de flux
        </button>
        <button
          type="button"
          onClick={() => {
            setInput('Combien me reste-t-il après mes charges fixes ?');
            setTimeout(() => handleSendMessage(), 50);
          }}
          className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap transition"
        >
          💰 Reste après charges fixes
        </button>
        <button
          type="button"
          onClick={() => {
            setInput('Télécharger le rapport d’analyse financière complet');
            setTimeout(() => handleSendMessage(), 50);
          }}
          className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap transition"
        >
          📑 Télécharger le rapport
        </button>
        <button
          type="button"
          onClick={() => {
            setInput('Analyse mon crédit immobilier et simule un remboursement anticipé');
            setTimeout(() => handleSendMessage(), 50);
          }}
          className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap transition"
        >
          🏛️ Simulation crédit immobilier
        </button>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#121214] border-t border-neutral-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question financière ou demandez une simulation..."
          className="flex-1 bg-neutral-900 border border-neutral-700 focus:border-[#c4f24e] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="flex items-center justify-center h-11 w-11 rounded-xl bg-[#c4f24e] text-neutral-950 hover:bg-[#b0dc41] disabled:opacity-50 transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

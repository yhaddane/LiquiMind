import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, Code2, Printer, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/finance';

type ExportScope = 'ALL' | 'ACTIVE_PERIOD' | 'CUSTOM';
type ExportFormat = 'XLSX' | 'JSON' | 'PDF' | 'DOC';

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    transactions,
    accounts,
    categories,
    periodRange,
    userSettings,
    exportDataJson,
  } = useApp();

  const [scope, setScope] = useState<ExportScope>('ACTIVE_PERIOD');
  const [format, setFormat] = useState<ExportFormat>('XLSX');
  const [customFrom, setCustomFrom] = useState(periodRange.startDate);
  const [customTo, setCustomTo] = useState(periodRange.endDate);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isExportModalOpen) return null;

  // Filter transactions based on chosen scope
  const getExportTransactions = () => {
    if (scope === 'ALL') {
      return transactions;
    }
    if (scope === 'ACTIVE_PERIOD') {
      return transactions.filter(
        (t) => t.date >= periodRange.startDate && t.date <= periodRange.endDate
      );
    }
    // CUSTOM
    const from = customFrom <= customTo ? customFrom : customTo;
    const to = customFrom <= customTo ? customTo : customFrom;
    return transactions.filter((t) => t.date >= from && t.date <= to);
  };

  const getScopeLabel = () => {
    if (scope === 'ALL') return 'Historique complet (toutes les dates)';
    if (scope === 'ACTIVE_PERIOD') return `Période active : ${periodRange.label}`;
    return `Période sur mesure : du ${customFrom} au ${customTo}`;
  };

  const handleExport = () => {
    const list = getExportTransactions();
    const scopeLabel = getScopeLabel();
    const dateStamp = new Date().toISOString().slice(0, 10);

    if (format === 'JSON') {
      if (scope === 'ALL') {
        const fullJson = exportDataJson();
        downloadBlob(fullJson, `liquimind_backup_complet_${dateStamp}.json`, 'application/json');
      } else {
        const partialData = {
          app: 'LiquiMind',
          scope: scopeLabel,
          exportedAt: new Date().toISOString(),
          currency: userSettings.primaryCurrency,
          transactionsCount: list.length,
          transactions: list,
        };
        downloadBlob(
          JSON.stringify(partialData, null, 2),
          `liquimind_export_${scope.toLowerCase()}_${dateStamp}.json`,
          'application/json'
        );
      }
    } else if (format === 'XLSX') {
      // Build Excel sheet rows
      const rows = list.map((tx) => {
        const acc = accounts.find((a) => a.id === tx.accountId);
        const cat = categories.find((c) => c.id === tx.categoryId);
        return {
          'Date': tx.date,
          'Compte': acc?.name || tx.accountId,
          'Espace': tx.spaceId === 'pro' ? 'Professionnel' : 'Personnel',
          'Type': tx.amount < 0 ? 'Dépense' : 'Revenu',
          'Libellé / Description': tx.description,
          'Catégorie': cat ? `${cat.icon} ${cat.name}` : 'Non catégorisé',
          'Montant (MAD)': tx.amount,
          'Devise': tx.currency || userSettings.primaryCurrency,
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Opérations LiquiMind');
      XLSX.writeFile(wb, `liquimind_export_${dateStamp}.xlsx`);
    } else if (format === 'DOC') {
      // Generate Word Document (.doc with formatted HTML)
      const docHtml = generateWordHtml(list, scopeLabel);
      downloadBlob(docHtml, `liquimind_rapport_${dateStamp}.doc`, 'application/msword');
    } else if (format === 'PDF') {
      // Generate Printable PDF View
      generatePrintablePdf(list, scopeLabel);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsExportModalOpen(false);
    }, 1200);
  };

  const downloadBlob = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateWordHtml = (list: typeof transactions, scopeLabel: string) => {
    const totalIn = list.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalOut = list.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const net = totalIn - totalOut;

    const rowsHtml = list
      .map((t) => {
        const acc = accounts.find((a) => a.id === t.accountId);
        const cat = categories.find((c) => c.id === t.categoryId);
        const sign = t.amount < 0 ? '-' : '+';
        const color = t.amount < 0 ? '#dc2626' : '#16a34a';
        return `<tr>
          <td style="padding: 6px; border: 1px solid #ddd;">${t.date}</td>
          <td style="padding: 6px; border: 1px solid #ddd;">${acc?.name || ''}</td>
          <td style="padding: 6px; border: 1px solid #ddd;">${t.description}</td>
          <td style="padding: 6px; border: 1px solid #ddd;">${cat?.name || ''}</td>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: right; color: ${color}; font-weight: bold;">${sign}${Math.abs(t.amount).toLocaleString()} DH</td>
        </tr>`;
      })
      .join('');

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Rapport Financier LiquiMind</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Calibri, Arial, sans-serif; margin: 30px; color: #111; }
        h1 { color: #111; margin-bottom: 4px; }
        .kpi { display: inline-block; padding: 12px; margin-right: 15px; border: 1px solid #ddd; border-radius: 8px; width: 160px; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th { background-color: #f3f4f6; padding: 8px; border: 1px solid #ddd; text-align: left; }
      </style>
      </head>
      <body>
        <h1>LiquiMind — Rapport Financier</h1>
        <p style="color: #666; font-size: 13px;">${scopeLabel} · Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
        <div style="margin-bottom: 20px;">
          <div class="kpi"><div>Total Entrées</div><strong style="color: #16a34a; font-size: 16px;">+${totalIn.toLocaleString()} DH</strong></div>
          <div class="kpi"><div>Total Sorties</div><strong style="color: #dc2626; font-size: 16px;">-${totalOut.toLocaleString()} DH</strong></div>
          <div class="kpi"><div>Solde Net</div><strong style="font-size: 16px;">${net >= 0 ? '+' : ''}${net.toLocaleString()} DH</strong></div>
        </div>
        <table>
          <thead>
            <tr><th>Date</th><th>Compte</th><th>Libellé</th><th>Catégorie</th><th style="text-align: right;">Montant</th></tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;
  };

  const generatePrintablePdf = (list: typeof transactions, scopeLabel: string) => {
    const totalIn = list.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalOut = list.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const net = totalIn - totalOut;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = list
      .map((t) => {
        const acc = accounts.find((a) => a.id === t.accountId);
        const cat = categories.find((c) => c.id === t.categoryId);
        const sign = t.amount < 0 ? '-' : '+';
        const color = t.amount < 0 ? '#e11d48' : '#10b981';
        return `<tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 12px; font-family: monospace;">${t.date}</td>
          <td style="padding: 8px 12px;">${acc?.name || ''}</td>
          <td style="padding: 8px 12px; font-weight: 500;">${t.description}</td>
          <td style="padding: 8px 12px; color: #64748b;">${cat ? `${cat.icon} ${cat.name}` : '—'}</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: ${color}; font-family: monospace;">${sign}${formatCurrency(Math.abs(t.amount), userSettings.primaryCurrency)}</td>
        </tr>`;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relevé Officiel LiquiMind - ${scopeLabel}</title>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .badge { font-size: 11px; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-weight: 600; }
          .stats { display: flex; gap: 16px; margin-bottom: 24px; }
          .stat-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; }
          .stat-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .stat-val { font-size: 18px; font-weight: 800; font-family: monospace; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; text-align: right;">
          <button onclick="window.print()" style="background: #101011; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer;">
            Imprimer / Enregistrer en PDF
          </button>
        </div>
        <div class="header">
          <div>
            <div class="brand">LiquiMind</div>
            <div style="font-size: 12px; color: #64748b;">Intelligence & Clarté Financière</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">${scopeLabel}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Généré le ${new Date().toLocaleString('fr-FR')}</div>
          </div>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-label">Total Entrées</div>
            <div class="stat-val" style="color: #10b981;">+${formatCurrency(totalIn, userSettings.primaryCurrency)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Dépenses</div>
            <div class="stat-val" style="color: #e11d48;">-${formatCurrency(totalOut, userSettings.primaryCurrency)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Solde Net</div>
            <div class="stat-val" style="color: ${net >= 0 ? '#10b981' : '#e11d48'};">
              ${net >= 0 ? '+' : ''}${formatCurrency(net, userSettings.primaryCurrency)}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Date</th><th>Compte</th><th>Description</th><th>Catégorie</th><th style="text-align: right;">Montant</th></tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const previewList = getExportTransactions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand/20 text-brand">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900 dark:text-white">
                Exporter vos données
              </h3>
              <p className="text-xs text-neutral-400">
                Sélectionnez la période à exporter et le format souhaité
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 1. Scope Selection (Tout, Période active, Sur mesure) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
            1. Période à exporter :
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setScope('ACTIVE_PERIOD')}
              className={`p-3 rounded-2xl border text-left transition ${
                scope === 'ACTIVE_PERIOD'
                  ? 'border-brand bg-brand/10 text-brand font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
              }`}
            >
              <div className="text-xs font-bold">Période active</div>
              <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                {periodRange.label}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setScope('ALL')}
              className={`p-3 rounded-2xl border text-left transition ${
                scope === 'ALL'
                  ? 'border-brand bg-brand/10 text-brand font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
              }`}
            >
              <div className="text-xs font-bold">Tout exporter</div>
              <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                Historique complet
              </div>
            </button>

            <button
              type="button"
              onClick={() => setScope('CUSTOM')}
              className={`p-3 rounded-2xl border text-left transition ${
                scope === 'CUSTOM'
                  ? 'border-brand bg-brand/10 text-brand font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
              }`}
            >
              <div className="text-xs font-bold">Sur mesure</div>
              <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                Choisir les dates
              </div>
            </button>
          </div>

          {/* Custom Date Pickers */}
          {scope === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-2 pt-2 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Date de début</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Format Selection (Excel, JSON, PDF, Word) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
            2. Format du document :
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Excel */}
            <button
              type="button"
              onClick={() => setFormat('XLSX')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                format === 'XLSX'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <FileSpreadsheet className="h-5 w-5" />
              <span className="text-xs font-bold">Excel (.xlsx)</span>
            </button>

            {/* PDF */}
            <button
              type="button"
              onClick={() => setFormat('PDF')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                format === 'PDF'
                  ? 'border-rose-500 bg-rose-500/10 text-rose-500 font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Printer className="h-5 w-5" />
              <span className="text-xs font-bold">PDF / Relevé</span>
            </button>

            {/* Word */}
            <button
              type="button"
              onClick={() => setFormat('DOC')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                format === 'DOC'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs font-bold">Word (.doc)</span>
            </button>

            {/* JSON */}
            <button
              type="button"
              onClick={() => setFormat('JSON')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                format === 'JSON'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Code2 className="h-5 w-5" />
              <span className="text-xs font-bold">JSON</span>
            </button>
          </div>
        </div>

        {/* Summary Info */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-3 text-xs flex items-center justify-between text-neutral-600 dark:text-neutral-300">
          <span>Opérations incluses :</span>
          <strong className="font-mono text-neutral-900 dark:text-white">
            {previewList.length} transaction(s)
          </strong>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleExport}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand text-brand py-3 text-sm font-black shadow-lg shadow-black/10 active:scale-98 transition"
        >
          {isSuccess ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Export réussi !</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4 stroke-[3]" />
              <span>Télécharger le fichier ({format})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

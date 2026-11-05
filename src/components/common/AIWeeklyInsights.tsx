import React, { useState } from 'react';
import { Sparkles, RefreshCw, TrendingDown, Lightbulb, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/finance';
import { AIWeeklyTip } from '../../types';

export const AIWeeklyInsights: React.FC = () => {
  const { transactions, categories, budgets, recurring, userSettings } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appliedTips, setAppliedTips] = useState<string[]>([]);

  // Calculate dynamic weekly insights based on transactions
  const generateTips = (): AIWeeklyTip[] => {
    const tips: AIWeeklyTip[] = [];

    // Analyze delivery & restaurant expenses
    const foodAndDelivery = transactions.filter(
      (t) =>
        t.amount < 0 &&
        (t.description.toLowerCase().includes('glovo') ||
          t.description.toLowerCase().includes('restaurant') ||
          t.description.toLowerCase().includes('burger') ||
          t.description.toLowerCase().includes('café') ||
          t.description.toLowerCase().includes('cafe'))
    );
    const deliveryTotal = Math.abs(foodAndDelivery.reduce((s, t) => s + t.amount, 0));

    if (deliveryTotal > 300) {
      const saving = Math.round(deliveryTotal * 0.45);
      tips.push({
        id: 'tip_delivery',
        title: 'Optimisation Repas & Livraisons Glovo',
        category: 'Alimentation & Sorties',
        potentialSaving: saving,
        advice: `Vous avez dépensé ${formatCurrency(deliveryTotal, userSettings.primaryCurrency)} en livraisons et restaurants ce mois. En préparant 2 repas à domicile par semaine, vous dégagez une épargne directe.`,
        actionLabel: 'Plafonner le budget Glovo',
        severity: 'high',
      });
    }

    // Analyze recurrent subscriptions
    const subCount = recurring.filter((r) => r.isActive && r.cadence === 'MONTHLY').length;
    const subTotal = recurring
      .filter((r) => r.isActive && r.cadence === 'MONTHLY')
      .reduce((s, r) => s + r.amountHint, 0);

    if (subCount >= 3) {
      tips.push({
        id: 'tip_subs',
        title: 'Audit des abonnements récurrents',
        category: 'Charges fixes',
        potentialSaving: 180,
        advice: `Vous avez ${subCount} abonnements actifs totalisant ${formatCurrency(subTotal, userSettings.primaryCurrency)}/mois. Une renégociation ou pause d'un abonnement streaming/salle libère 180 DH chaque mois.`,
        actionLabel: 'Auditer mes récurrents',
        severity: 'medium',
      });
    }

    // Analyze grocery vs budget envelope
    const groceryCat = categories.find((c) => c.name.toLowerCase().includes('courses'));
    if (groceryCat) {
      const groceryBudget = budgets.find((b) => b.categoryId === groceryCat.id)?.amount || 2500;
      const grocerySpent = Math.abs(
        transactions
          .filter((t) => t.categoryId === groceryCat.id && t.amount < 0)
          .reduce((s, t) => s + t.amount, 0)
      );
      if (grocerySpent > groceryBudget * 0.5) {
        tips.push({
          id: 'tip_groceries',
          title: 'Courses malines & marché local',
          category: 'Courses',
          potentialSaving: 350,
          advice: `En privilégiant les marchés de quartier pour les fruits, légumes et viandes plutôt que la grande distribution, l'économie moyenne constatée est de 15% à 20% par mois.`,
          actionLabel: 'Ajuster mon enveloppe Courses',
          severity: 'medium',
        });
      }
    }

    // Default 3rd/4th tip if needed
    if (tips.length < 3) {
      tips.push({
        id: 'tip_auto_save',
        title: 'Virement automatique 10% le jour de paie',
        category: 'Épargne automatique',
        potentialSaving: 1500,
        advice: `Programmez un virement automatique de 10% vers votre compte épargne dès le 1er du mois (avant toute dépense variable) pour sécuriser votre matelas de précaution.`,
        actionLabel: 'Automatiser mon épargne',
        severity: 'low',
      });
    }

    return tips;
  };

  const [currentTips, setCurrentTips] = useState<AIWeeklyTip[]>(() => generateTips());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    setCurrentTips(generateTips());
    setIsRefreshing(false);
  };

  const handleApply = (tipId: string) => {
    setAppliedTips((prev) => [...prev, tipId]);
  };

  const totalWeeklySavings = currentTips.reduce((s, t) => s + t.potentialSaving, 0);

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161618] p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Analyses & Conseils IA Hebdomadaires
              </h3>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Semaine active
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Recommandations personnalisées basées sur vos flux réels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-neutral-400 block">Potentiel d'épargne détecté</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalWeeklySavings, userSettings.primaryCurrency)} / mois
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition disabled:opacity-50 cursor-pointer"
            title="Actualiser l'analyse IA"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-brand' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3 Quantified Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {currentTips.map((tip) => {
          const isDone = appliedTips.includes(tip.id);
          return (
            <div
              key={tip.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-brand/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {tip.category}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <TrendingDown className="h-3 w-3" />
                    +{formatCurrency(tip.potentialSaving, userSettings.primaryCurrency)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1.5">{tip.title}</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">
                  {tip.advice}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                {isDone ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Conseil appliqué !</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(tip.id)}
                    className="w-full py-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>{tip.actionLabel}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-brand" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

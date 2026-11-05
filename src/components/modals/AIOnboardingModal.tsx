import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Circle,
  X,
  ArrowRight,
  Trash2,
  Bot,
  User,
  Check,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/finance';

type PillarKey =
  | 'accounts'
  | 'income'
  | 'fixedExpenses'
  | 'budgets'
  | 'loans'
  | 'debts'
  | 'assets'
  | 'goals';

interface OnboardingDraft {
  accounts: Array<{ name: string; bankName: string; balance: number; type: 'CHECKING' | 'SAVINGS' | 'CASH' }>;
  income: Array<{ label: string; amount: number; dayOfMonth: number; accountName: string }>;
  fixedExpenses: Array<{ label: string; amount: number; dayOfMonth: number }>;
  budgets: Array<{ categoryName: string; amount: number; icon: string }>;
  loans: Array<{ label: string; bankName: string; monthlyPayment: number; remainingCapital: number }>;
  debts: Array<{ personName: string; amount: number; type: 'CREDIT_GIVEN' | 'LOAN_RECEIVED' }>;
  assets: Array<{ name: string; category: 'REAL_ESTATE' | 'GOLD' | 'STOCKS'; value: number }>;
  goals: Array<{ name: string; targetAmount: number; deadline: string; icon: string }>;
}

interface OnboardingTurn {
  id: string;
  role: 'assistant' | 'user';
  text: string;
}

const PILLARS: Array<{ key: PillarKey; label: string; icon: string }> = [
  { key: 'accounts', label: 'Comptes', icon: '🏦' },
  { key: 'income', label: 'Revenus', icon: '💼' },
  { key: 'fixedExpenses', label: 'Charges fixes', icon: '📌' },
  { key: 'budgets', label: 'Budgets', icon: '🧺' },
  { key: 'loans', label: 'Crédits', icon: '🏛️' },
  { key: 'debts', label: 'Dettes', icon: '🤝' },
  { key: 'assets', label: 'Patrimoine', icon: '🏠' },
  { key: 'goals', label: 'Objectifs', icon: '🎯' },
];

export const AIOnboardingModal: React.FC = () => {
  const {
    isAIOnboardingOpen,
    markAIOnboardingSeen,
    addAccount,
    addRecurring,
    addCategory,
    addBudget,
    addDebt,
    addAsset,
    addGoal,
    userSettings,
  } = useApp();

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [completedPillars, setCompletedPillars] = useState<Record<PillarKey, boolean>>({
    accounts: false,
    income: false,
    fixedExpenses: false,
    budgets: false,
    loans: false,
    debts: false,
    assets: false,
    goals: false,
  });

  const [draft, setDraft] = useState<OnboardingDraft>({
    accounts: [],
    income: [],
    fixedExpenses: [],
    budgets: [],
    loans: [],
    debts: [],
    assets: [],
    goals: [],
  });

  const [messages, setMessages] = useState<OnboardingTurn[]>([
    {
      id: 'init_1',
      role: 'assistant',
      text: 'Bonjour ! Décrivez-moi votre situation avec vos mots : salaire, comptes, loyer, crédits… Je range tout et je vous pose les questions qui manquent.',
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isAIOnboardingOpen) return null;

  // Smart natural language parser for Moroccan/French financial expressions
  const extractEntitiesFromText = (text: string, currentStep: number) => {
    const lower = text.toLowerCase();
    const numbers = (text.match(/\d+(?:[\s.,]\d+)*/g) || []).map((n) =>
      parseFloat(n.replace(/\s/g, '').replace(',', '.'))
    );

    const nextDraft: OnboardingDraft = JSON.parse(JSON.stringify(draft));
    const nextCompleted = { ...completedPillars };

    // Detect banks
    const bankKeywords = [
      { key: 'attijari', name: 'Attijariwafa Bank' },
      { key: 'cih', name: 'CIH Bank' },
      { key: 'bmce', name: 'Bank of Africa' },
      { key: 'boa', name: 'Bank of Africa' },
      { key: 'bcp', name: 'Banque Populaire' },
      { key: 'populaire', name: 'Banque Populaire' },
      { key: 'cfg', name: 'CFG Bank' },
      { key: 'societe generale', name: 'Saham Bank (SGMB)' },
      { key: 'credit du maroc', name: 'Crédit du Maroc' },
      { key: 'barid', name: 'Al Barid Bank' },
    ];
    const detectedBank = bankKeywords.find((b) => lower.includes(b.key))?.name || 'Banque Principale';

    // 1. Salary / Income detection
    if (lower.includes('salaire') || lower.includes('gagne') || lower.includes('touche') || currentStep === 0 || currentStep === 1) {
      const salMatch = text.match(/(?:salaire|gagne|touche)[^\d]*(\d[\d\s]*)/i);
      const salVal = salMatch
        ? parseFloat(salMatch[1].replace(/\s/g, ''))
        : numbers.find((n) => n >= 2500 && n <= 150000);

      const dayMatch = text.match(/(?:le\s+|jour\s+)(\d{1,2})\b/i);
      const dayVal = dayMatch ? Math.min(31, Math.max(1, parseInt(dayMatch[1], 10))) : 1;

      if (salVal && nextDraft.income.length === 0) {
        nextDraft.income.push({
          label: 'Salaire mensuel',
          amount: salVal,
          dayOfMonth: dayVal,
          accountName: `Compte ${detectedBank}`,
        });
        nextCompleted.income = true;
      } else if (dayMatch && nextDraft.income.length > 0) {
        nextDraft.income[0].dayOfMonth = dayVal;
        nextDraft.income[0].accountName = `Compte ${detectedBank}`;
        nextCompleted.income = true;
      }
    }

    // Extra regular income
    if ((lower.includes('freelance') || lower.includes('loyer reçu') || lower.includes('prime') || lower.includes('alloc')) && numbers.length > 0) {
      const val = numbers.find((n) => n >= 200) || 1500;
      if (!nextDraft.income.some((i) => i.label.toLowerCase().includes('complément'))) {
        nextDraft.income.push({
          label: lower.includes('freelance') ? 'Revenu Freelance' : 'Revenu complémentaire',
          amount: val,
          dayOfMonth: 5,
          accountName: `Compte ${detectedBank}`,
        });
        nextCompleted.income = true;
      }
    }

    // 2. Accounts (Checking, Savings, Cash)
    if (lower.includes('solde') || lower.includes('compte') || lower.includes('cih') || lower.includes('attijari') || currentStep === 1 || currentStep === 2) {
      const soldeMatch = text.match(/(?:solde|compte)[^\d]*(\d[\d\s]*)/i);
      const balVal = soldeMatch
        ? parseFloat(soldeMatch[1].replace(/\s/g, ''))
        : numbers.find((n) => n >= 500);

      if (balVal !== undefined && nextDraft.accounts.filter((a) => a.type === 'CHECKING').length === 0) {
        nextDraft.accounts.push({
          name: `Compte courant ${detectedBank}`,
          bankName: detectedBank,
          balance: balVal,
          type: 'CHECKING',
        });
        nextCompleted.accounts = true;
      }
    }

    if (lower.includes('épargne') || lower.includes('epargne') || lower.includes('carnet') || currentStep === 3 || currentStep === 4) {
      const epMatch = text.match(/(?:épargne|epargne|carnet)[^\d]*(\d[\d\s]*)/i);
      const epVal = epMatch ? parseFloat(epMatch[1].replace(/\s/g, '')) : numbers.find((n) => n >= 1000);
      if (epVal && !nextDraft.accounts.some((a) => a.type === 'SAVINGS')) {
        nextDraft.accounts.push({
          name: 'Compte Épargne',
          bankName: detectedBank,
          balance: epVal,
          type: 'SAVINGS',
        });
        nextCompleted.accounts = true;
      }
    }

    if (lower.includes('liquide') || lower.includes('cash') || lower.includes('espèce') || lower.includes('espece')) {
      const cashMatch = text.match(/(?:liquide|cash|espèce|espece)[^\d]*(\d[\d\s]*)/i);
      const cashVal = cashMatch ? parseFloat(cashMatch[1].replace(/\s/g, '')) : numbers[numbers.length - 1] || 500;
      if (cashVal && !nextDraft.accounts.some((a) => a.type === 'CASH')) {
        nextDraft.accounts.push({
          name: 'Espèces (Cash)',
          bankName: 'Portefeuille',
          balance: cashVal,
          type: 'CASH',
        });
        nextCompleted.accounts = true;
      }
    }

    // 3. Fixed Expenses (Loyer, Ecole, Fibre, Eau/Elec)
    const loyerMatch = text.match(/loyer[^\d]*(\d[\d\s]*)/i);
    if (loyerMatch || (currentStep === 5 && numbers.length > 0)) {
      const val = loyerMatch ? parseFloat(loyerMatch[1].replace(/\s/g, '')) : numbers[0];
      if (val && !nextDraft.fixedExpenses.some((f) => f.label === 'Loyer')) {
        nextDraft.fixedExpenses.push({ label: 'Loyer', amount: val, dayOfMonth: 2 });
        nextCompleted.fixedExpenses = true;
      }
    }
    const ecoleMatch = text.match(/(?:école|ecole|scolarité)[^\d]*(\d[\d\s]*)/i);
    if (ecoleMatch) {
      const val = parseFloat(ecoleMatch[1].replace(/\s/g, ''));
      if (val && !nextDraft.fixedExpenses.some((f) => f.label === 'École')) {
        nextDraft.fixedExpenses.push({ label: 'École', amount: val, dayOfMonth: 5 });
        nextCompleted.fixedExpenses = true;
      }
    }
    if (lower.includes('fibre') || lower.includes('internet') || lower.includes('lydec') || lower.includes('redal')) {
      if (!nextDraft.fixedExpenses.some((f) => f.label === 'Eau, Électricité & Fibre')) {
        nextDraft.fixedExpenses.push({ label: 'Eau, Électricité & Fibre', amount: 850, dayOfMonth: 12 });
        nextCompleted.fixedExpenses = true;
      }
    }

    // 4. Budgets (Courses, Carburant, Resto)
    if (currentStep === 6 || lower.includes('courses') || lower.includes('carburant') || lower.includes('budget')) {
      const coursesMatch = text.match(/courses[^\d]*(\d[\d\s]*)/i);
      const carbMatch = text.match(/(?:carburant|essence|diesel)[^\d]*(\d[\d\s]*)/i);
      if (coursesMatch) {
        nextDraft.budgets.push({ categoryName: 'Courses', amount: parseFloat(coursesMatch[1].replace(/\s/g, '')), icon: '🛒' });
      } else if (currentStep === 6 && numbers[0]) {
        nextDraft.budgets.push({ categoryName: 'Courses & Alimentation', amount: numbers[0], icon: '🛒' });
      }
      if (carbMatch) {
        nextDraft.budgets.push({ categoryName: 'Carburant', amount: parseFloat(carbMatch[1].replace(/\s/g, '')), icon: '⛽' });
      } else if (currentStep === 6 && numbers[1]) {
        nextDraft.budgets.push({ categoryName: 'Carburant & Transport', amount: numbers[1], icon: '⛽' });
      }
      if (nextDraft.budgets.length > 0 || currentStep === 6) {
        nextCompleted.budgets = true;
      }
    }

    // 5. Loans & Debts
    if (currentStep === 7 || lower.includes('crédit') || lower.includes('credit') || lower.includes('prêt') || lower.includes('dette')) {
      if (numbers.length > 0 && (lower.includes('crédit') || lower.includes('credit') || currentStep === 7)) {
        const monthly = numbers.find((n) => n >= 500 && n <= 25000) || numbers[0];
        const cap = numbers.find((n) => n > 30000) || (monthly ? monthly * 84 : 150000);
        if (monthly && nextDraft.loans.length === 0 && !lower.includes('aucun') && !lower.includes('non')) {
          nextDraft.loans.push({
            label: lower.includes('auto') || lower.includes('voiture') ? 'Crédit Auto' : 'Crédit Immobilier',
            bankName: detectedBank,
            monthlyPayment: monthly,
            remainingCapital: cap,
          });
        }
      }
      if (lower.includes('doit') || lower.includes('prêté')) {
        const amt = numbers[0] || 1500;
        nextDraft.debts.push({
          personName: 'Proche / Contact',
          amount: amt,
          type: lower.includes('me doit') || lower.includes('prêté') ? 'CREDIT_GIVEN' : 'LOAN_RECEIVED',
        });
      }
      if (currentStep === 7) {
        nextCompleted.loans = true;
        nextCompleted.debts = true;
      }
    }

    // 6. Assets & Goals
    if (currentStep >= 8 || lower.includes('appartement') || lower.includes('maison') || lower.includes('or') || lower.includes('bourse') || lower.includes('objectif') || lower.includes('voyage')) {
      if (lower.includes('appartement') || lower.includes('maison') || lower.includes('immo')) {
        const val = numbers.find((n) => n >= 150000) || 950000;
        nextDraft.assets.push({ name: 'Bien Immobilier', category: 'REAL_ESTATE', value: val });
      }
      if (lower.includes('or') || lower.includes('bijoux')) {
        const val = numbers.find((n) => n >= 2000 && n < 200000) || 25000;
        nextDraft.assets.push({ name: 'Or & Métaux précieux', category: 'GOLD', value: val });
      }
      if (lower.includes('bourse') || lower.includes('actions') || lower.includes('opcvm')) {
        const val = numbers.find((n) => n >= 1000 && n < 500000) || 40000;
        nextDraft.assets.push({ name: 'Portefeuille Bourse & OPCVM', category: 'STOCKS', value: val });
      }
      if (lower.includes('objectif') || lower.includes('voyage') || lower.includes('urgence') || lower.includes('voiture') || currentStep >= 8) {
        const target = numbers[numbers.length - 1] || 20000;
        if (!lower.includes('non') && !lower.includes('aucun')) {
          nextDraft.goals.push({
            name: lower.includes('voyage') ? 'Voyage & Vacances' : "Fonds d'urgence & Projet",
            targetAmount: target,
            deadline: '2027-06-01',
            icon: lower.includes('voyage') ? '🏖️' : '🚨',
          });
        }
      }
      if (currentStep >= 8) {
        nextCompleted.assets = true;
        nextCompleted.goals = true;
      }
    }

    setDraft(nextDraft);
    setCompletedPillars(nextCompleted);
  };

  const getNextAssistantQuestion = (step: number, userMessage: string): { nextStep: number; reply: string } => {
    const lower = userMessage.toLowerCase();

    if (step === 0) {
      return {
        nextStep: 1,
        reply:
          'Merci, j’ai commencé à structurer vos informations ! Vers quel jour du mois votre salaire arrive-t-il ? Et sur quel compte bancaire le recevez-vous, avec son solde actuel ?',
      };
    }

    if (step === 1) {
      return {
        nextStep: 2,
        reply:
          "Sur quel compte bancaire recevez-vous votre salaire, et quel est son solde actuel ? Avez-vous d'autres revenus réguliers ?",
      };
    }

    if (step === 2) {
      return {
        nextStep: 3,
        reply:
          "Quel est son solde actuel, à peu près ? Avez-vous d'autres comptes, de l'épargne ou de l'argent liquide ?",
      };
    }

    if (step === 3) {
      return {
        nextStep: 4,
        reply:
          "Avez-vous d'autres comptes, un compte épargne ou de l'argent liquide ? Et avez-vous d'autres revenus réguliers en plus de votre salaire ?",
      };
    }

    if (step === 4) {
      if (lower.includes('oui') && (lower.includes('revenu') || lower.includes('freelance') || lower.includes('autre'))) {
        return {
          nextStep: 3,
          reply:
            'Très bien ! Quel est le montant de cet autre revenu régulier et sur quel compte arrive-t-il ? Avez-vous aussi un compte épargne ou de l’argent liquide ?',
        };
      }
      return {
        nextStep: 5,
        reply:
          'Parfait pour vos comptes et revenus ! Passons aux Charges fixes : quels sont vos prélèvements fixes chaque mois (loyer, école, eau & électricité, internet fibre, salle de sport) ?',
      };
    }

    if (step === 5) {
      return {
        nextStep: 6,
        reply:
          'C’est noté dans vos charges fixes. Côté Budgets variables : combien souhaitez-vous plafonner par mois pour les courses, le carburant et les restaurants/sorties ?',
      };
    }

    if (step === 6) {
      return {
        nextStep: 7,
        reply:
          'Vos enveloppes budgétaires sont prêtes ! Avez-vous des Crédits bancaires en cours (immobilier, auto avec mensualité) ou des Dettes / Créances envers des proches ?',
      };
    }

    if (step === 7) {
      return {
        nextStep: 8,
        reply:
          'Dernière étape — Patrimoine & Objectifs : possédez-vous des biens (appartement, or, actions/OPCVM en bourse) et quel est votre prochain objectif d’épargne (montant cible et date) ?',
      };
    }

    return {
      nextStep: 9,
      reply:
        'Bravo 🎉 ! Les 8 piliers (Comptes, Revenus, Charges fixes, Budgets, Crédits, Dettes, Patrimoine et Objectifs) sont complets. Vérifiez votre brouillon à droite puis cliquez sur « Créer mon espace LiquiMind » !',
    };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    extractEntitiesFromText(userMsg, stepIndex);

    setTimeout(() => {
      const { nextStep, reply } = getNextAssistantQuestion(stepIndex, userMsg);
      setStepIndex(nextStep);
      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 450);
  };

  const handleApplyDraftToApp = () => {
    let primaryAccId = 'acc_checking';

    // 1. Create Accounts
    if (draft.accounts.length > 0) {
      draft.accounts.forEach((acc, idx) => {
        const newId = addAccount({
          name: acc.name,
          bankName: acc.bankName,
          balance: acc.balance,
          type: acc.type,
          spaceId: 'personal',
          currency: userSettings.primaryCurrency,
        });
        if (idx === 0) primaryAccId = newId;
      });
    }

    // 2. Create Incomes
    draft.income.forEach((inc) => {
      const catId = addCategory({
        spaceId: 'personal',
        name: inc.label,
        kind: 'FIXED_INCOME',
        direction: 'IN',
        icon: '💼',
        expectedAmount: inc.amount,
        order: 1,
      });

      addRecurring({
        label: inc.label,
        cadence: 'MONTHLY',
        dayOfMonth: inc.dayOfMonth,
        amountHint: inc.amount,
        categoryId: catId,
        accountId: primaryAccId,
        spaceId: 'personal',
        isActive: true,
      });
    });

    // 3. Create Fixed Expenses
    draft.fixedExpenses.forEach((fix) => {
      const catId = addCategory({
        spaceId: 'personal',
        name: fix.label,
        kind: 'FIXED_EXPENSE',
        direction: 'OUT',
        icon: '📌',
        expectedAmount: fix.amount,
        order: 12,
      });

      addBudget(catId, fix.amount);

      addRecurring({
        label: fix.label,
        cadence: 'MONTHLY',
        dayOfMonth: fix.dayOfMonth,
        amountHint: fix.amount,
        categoryId: catId,
        accountId: primaryAccId,
        spaceId: 'personal',
        isActive: true,
      });
    });

    // 4. Create Variable Budgets
    draft.budgets.forEach((b) => {
      const catId = addCategory({
        spaceId: 'personal',
        name: b.categoryName,
        kind: 'VARIABLE_EXPENSE',
        direction: 'OUT',
        icon: b.icon || '🧺',
        expectedAmount: b.amount,
        order: 35,
      });
      addBudget(catId, b.amount);
    });

    // 5. Create Loans
    draft.loans.forEach((loan) => {
      addDebt({
        counterpartyName: loan.bankName || 'Banque',
        type: 'BANK_LOAN',
        amount: loan.remainingCapital,
        remainingCapital: loan.remainingCapital,
        monthlyPayment: loan.monthlyPayment,
        description: loan.label,
      });
    });

    // 6. Create Debts
    draft.debts.forEach((debt) => {
      addDebt({
        counterpartyName: debt.personName,
        type: debt.type,
        amount: debt.amount,
        description: debt.type === 'CREDIT_GIVEN' ? 'Prêt accordé' : 'Emprunt à rembourser',
      });
    });

    // 7. Create Assets
    draft.assets.forEach((ast) => {
      addAsset({
        name: ast.name,
        category: ast.category,
        value: ast.value,
        currency: userSettings.primaryCurrency,
        color: ast.category === 'REAL_ESTATE' ? '#b3dd62' : ast.category === 'GOLD' ? '#ddad71' : '#6fa89a',
      });
    });

    // 8. Create Goals
    draft.goals.forEach((goal) => {
      addGoal({
        name: goal.name,
        targetAmount: goal.targetAmount,
        deadline: goal.deadline,
        icon: goal.icon,
        spaceId: 'personal',
        priority: 1,
      });
    });

    markAIOnboardingSeen();
  };

  const totalDraftPillarsCompleted = Object.values(completedPillars).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col lg:flex-row w-full max-w-6xl h-[92vh] max-h-[820px] bg-[#161618] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side: Conversational Chat */}
        <div className="flex flex-1 flex-col h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-neutral-800">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#121214]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c4f24e]/10 border border-[#c4f24e]/20 text-[#c4f24e]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Assistant Onboarding LiquiMind</h2>
                  <span className="rounded-full bg-[#c4f24e]/20 px-2 py-0.5 text-[11px] font-bold text-[#c4f24e]">
                    IA Étape par étape
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Décrivez votre budget en langage naturel — 8 piliers financiers
                </p>
              </div>
            </div>
            <button
              onClick={markAIOnboardingSeen}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
              title="Passer l'onboarding"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Pillar Status Indicator Bar */}
          <div className="flex items-center gap-1.5 px-6 py-2.5 overflow-x-auto bg-[#18181c] border-b border-neutral-800/80">
            {PILLARS.map((p) => {
              const done = completedPillars[p.key];
              return (
                <div
                  key={p.key}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    done
                      ? 'bg-[#c4f24e]/15 text-[#c4f24e] border border-[#c4f24e]/30'
                      : 'bg-neutral-800/50 text-neutral-400'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                  {done ? <Check className="h-3 w-3 stroke-[3]" /> : <Circle className="h-2.5 w-2.5" />}
                </div>
              );
            })}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m) => {
              const isAss = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isAss ? 'justify-start' : 'justify-end'}`}
                >
                  {isAss && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#c4f24e]/10 border border-[#c4f24e]/20 text-[#c4f24e]">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isAss
                        ? 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                        : 'bg-[#c4f24e] text-neutral-950 font-medium'
                    }`}
                  >
                    {m.text}
                  </div>
                  {!isAss && (
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
                <div className="flex items-center gap-1.5 rounded-2xl bg-neutral-900 px-4 py-3 text-xs text-neutral-400 border border-neutral-800">
                  <span className="h-2 w-2 rounded-full bg-[#c4f24e] animate-bounce"></span>
                  <span className="h-2 w-2 rounded-full bg-[#c4f24e] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 rounded-full bg-[#c4f24e] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1">L'IA analyse votre réponse...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-6 py-2 flex flex-wrap gap-1.5 bg-[#141416] border-t border-neutral-800/60">
            {stepIndex === 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setInputText('Je gagne 21 000 DH le 1er du mois chez Atlas Digital, sur mon compte Attijari.')}
                  className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                >
                  💡 Exemple : Salaire 21 000 DH Attijari
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('Salaire 14 000 DH le 28, compte courant CIH Bank avec 8 500 DH.')}
                  className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                >
                  💡 Salaire 14 000 DH CIH Bank
                </button>
              </>
            )}
            {stepIndex >= 1 && stepIndex <= 4 && (
              <>
                <button
                  type="button"
                  onClick={() => setInputText('Mon solde courant est de 14 500 DH. J’ai aussi un compte épargne de 32 000 DH et 700 DH en liquide.')}
                  className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                >
                  💡 Solde 14 500 DH + Épargne 32 000 DH
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('Pas d’autre revenu régulier')}
                  className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                >
                  Non, pas d’autre revenu
                </button>
              </>
            )}
            {stepIndex === 5 && (
              <button
                type="button"
                onClick={() => setInputText('Loyer 4 200 DH, école 2 200 DH, fibre 399 DH et Lydec 550 DH.')}
                className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
              >
                💡 Loyer 4200 DH, École 2200 DH, Fibre 399 DH
              </button>
            )}
            {stepIndex === 6 && (
              <button
                type="button"
                onClick={() => setInputText('Courses 2 500 DH, Carburant 1 000 DH, Restaurants 800 DH.')}
                className="px-3 py-1 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
              >
                💡 Courses 2500 DH, Carburant 1000 DH, Resto 800 DH
              </button>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 bg-[#121214] border-t border-neutral-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Décrivez votre situation (ex: Loyer 4200 DH, salaire 21000 DH le 1er...)"
              className="flex-1 bg-neutral-900 border border-neutral-700 focus:border-[#c4f24e] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 outline-none transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="flex items-center justify-center h-11 w-11 rounded-xl bg-[#c4f24e] text-neutral-950 hover:bg-[#b0dc41] disabled:opacity-50 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Side: Live Draft Preview */}
        <div className="w-full lg:w-96 flex flex-col bg-[#141416] p-5 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#c4f24e]" />
                Brouillon généré en direct
              </h3>
              <p className="text-xs text-neutral-400">
                {totalDraftPillarsCompleted} / 8 piliers reconnus
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-semibold">
              Live Draft
            </span>
          </div>

          <div className="flex-1 py-4 space-y-4 overflow-y-auto">
            {/* Accounts */}
            <div className="rounded-xl border border-neutral-800 bg-[#18181c] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>🏦</span> Comptes ({draft.accounts.length})
                </span>
                {completedPillars.accounts && <Check className="h-3.5 w-3.5 text-[#c4f24e]" />}
              </div>
              {draft.accounts.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">En attente de vos comptes bancaires...</p>
              ) : (
                <div className="space-y-1.5">
                  {draft.accounts.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-neutral-300 bg-neutral-900/60 px-2 py-1.5 rounded-lg">
                      <span>{a.name}</span>
                      <span className="font-semibold text-white">{formatCurrency(a.balance, userSettings.primaryCurrency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Income */}
            <div className="rounded-xl border border-neutral-800 bg-[#18181c] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>💼</span> Revenus réguliers ({draft.income.length})
                </span>
                {completedPillars.income && <Check className="h-3.5 w-3.5 text-[#c4f24e]" />}
              </div>
              {draft.income.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">En attente de votre salaire...</p>
              ) : (
                <div className="space-y-1.5">
                  {draft.income.map((inc, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-neutral-300 bg-neutral-900/60 px-2 py-1.5 rounded-lg">
                      <div>
                        <span className="font-medium">{inc.label}</span>
                        <span className="text-[10px] text-neutral-400 block">Jour {inc.dayOfMonth} du mois</span>
                      </div>
                      <span className="font-semibold text-[#c4f24e]">+{formatCurrency(inc.amount, userSettings.primaryCurrency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fixed Expenses */}
            <div className="rounded-xl border border-neutral-800 bg-[#18181c] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📌</span> Charges fixes ({draft.fixedExpenses.length})
                </span>
                {completedPillars.fixedExpenses && <Check className="h-3.5 w-3.5 text-[#c4f24e]" />}
              </div>
              {draft.fixedExpenses.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">Loyer, école, fibre, etc.</p>
              ) : (
                <div className="space-y-1.5">
                  {draft.fixedExpenses.map((fe, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-neutral-300 bg-neutral-900/60 px-2 py-1.5 rounded-lg">
                      <span>{fe.label}</span>
                      <span className="font-semibold text-red-400">-{formatCurrency(fe.amount, userSettings.primaryCurrency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Budgets */}
            <div className="rounded-xl border border-neutral-800 bg-[#18181c] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>🧺</span> Budgets variables ({draft.budgets.length})
                </span>
                {completedPillars.budgets && <Check className="h-3.5 w-3.5 text-[#c4f24e]" />}
              </div>
              {draft.budgets.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">Courses, carburant, loisirs...</p>
              ) : (
                <div className="space-y-1.5">
                  {draft.budgets.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-neutral-300 bg-neutral-900/60 px-2 py-1.5 rounded-lg">
                      <span>{b.icon} {b.categoryName}</span>
                      <span className="font-semibold text-white">{formatCurrency(b.amount, userSettings.primaryCurrency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Loans & Debts */}
            {(draft.loans.length > 0 || draft.debts.length > 0) && (
              <div className="rounded-xl border border-neutral-800 bg-[#18181c] p-3">
                <span className="text-xs font-bold text-white block mb-2">🏛️ Crédits & Dettes</span>
                <div className="space-y-1.5">
                  {draft.loans.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-neutral-300 bg-neutral-900/60 px-2 py-1.5 rounded-lg">
                      <span>{l.label}</span>
                      <span className="font-semibold text-amber-400">{formatCurrency(l.monthlyPayment, userSettings.primaryCurrency)}/m</span>
                    </div>
                  ))}
                  {draft.debts.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-neutral-300 bg-neutral-900/60 px-2 py-1.5 rounded-lg">
                      <span>{d.personName}</span>
                      <span className="font-semibold text-neutral-300">{formatCurrency(d.amount, userSettings.primaryCurrency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <button
              onClick={handleApplyDraftToApp}
              className="w-full py-3 rounded-xl bg-[#c4f24e] text-neutral-950 font-bold text-sm hover:bg-[#b0dc41] shadow-lg shadow-[#c4f24e]/10 flex items-center justify-center gap-2 transition"
            >
              <span>Créer mon espace LiquiMind</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={markAIOnboardingSeen}
              className="w-full py-2 rounded-xl text-neutral-400 hover:text-white text-xs text-center transition"
            >
              Explorer avec les données de démonstration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

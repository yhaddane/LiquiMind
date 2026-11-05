import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PieChart,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, isSyncingCloud } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('yhaddane@gmail.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('Yassine Haddane');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Veuillez saisir une adresse email valide.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Le mot de passe doit contenir au moins 4 caractères.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'LOGIN') {
        await loginWithEmail(cleanEmail, password, name);
      } else {
        await registerWithEmail(cleanEmail, password, name);
      }
    } catch {
      setErrorMsg('Erreur lors de la validation. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch {
      setErrorMsg('Connexion Google interrompue. Vous pouvez continuer par email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors duration-200">
      {/* Left Hero / Brand Showcase Banner */}
      <div className="lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <Logo size={42} className="bg-white/10 p-1.5 rounded-2xl backdrop-blur-md shadow-lg" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              LiquiMind
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-200">
                v3.5 Cobalt
              </span>
            </h1>
            <p className="text-xs text-blue-200/80 font-medium">
              Intelligence & clarté financière
            </p>
          </div>
        </div>

        {/* Center Marketing Highlights */}
        <div className="my-10 lg:my-0 space-y-6 relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-100">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            <span>Pilotage budgétaire, bourse BVC & prévisions IA</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-white">
            Prenez le contrôle total de vos finances en toute sérénité.
          </h2>

          <p className="text-sm text-blue-100/90 leading-relaxed">
            Plateforme complète tout-en-un : budgets enveloppes mensuels, gestion collaborative des espaces, prévisions de trésorerie sur 12 mois, tableaux d’amortissement bancaires et portefeuille boursier en direct.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              <span className="text-xs font-semibold text-white">Bourse BVC & Cryptos</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <PieChart className="h-4 w-4 text-cyan-300" />
              <span className="text-xs font-semibold text-white">Budgets & Enveloppes</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <Layers className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-semibold text-white">Multi-espaces collaboratifs</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="h-4 w-4 text-blue-300" />
              <span className="text-xs font-semibold text-white">Données chiffrées & Cloud</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="flex items-center gap-2 text-xs text-blue-200/70 relative z-10 pt-4 border-t border-white/10">
          <CheckCircle2 className="h-4 w-4 text-blue-300" />
          <span>Architecture sécurisée Google Cloud & synchronisation temps réel</span>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-left space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {mode === 'LOGIN' ? 'Bon retour sur LiquiMind' : 'Créer votre compte financier'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'LOGIN'
                ? 'Connectez-vous pour accéder à vos comptes, prévisions et investissements.'
                : 'Commencez avec tous vos indicateurs prêts pour un pilotage clair.'}
            </p>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'LOGIN'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setErrorMsg('');
                setPassword('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'REGISTER'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Souscrire / S'inscrire
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Primary Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || isSyncingCloud}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-xs transition active:scale-98 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuer avec Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-[#f8fafc] dark:bg-[#0f172a] px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              ou avec votre adresse email
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nom complet ou entreprise
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Yassine Haddane"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mot de passe
                </label>
                {mode === 'LOGIN' && (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
                    Mot de passe oublié ?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs shadow-md shadow-blue-700/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{mode === 'LOGIN' ? 'Se connecter à LiquiMind' : 'Souscrire & Créer mon compte'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Guest / Offline Discovery Mode */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={loginAsGuest}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Continuer en mode Invité (données locales 0 DH) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Code2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const AndroidAppModal: React.FC = () => {
  const { isAndroidModalOpen, setIsAndroidModalOpen } = useApp();
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'apk' | 'pwa' | 'preview' | 'capacitor'>('apk');

  if (!isAndroidModalOpen) return null;

  const capacitorConfig = `{
  "appId": "com.liquimind.app",
  "appName": "LiquiMind",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 1500,
      "backgroundColor": "#1d4ed8",
      "showSpinner": false
    },
    "StatusBar": {
      "style": "LIGHT",
      "backgroundColor": "#1d4ed8"
    }
  }
}`;

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(capacitorConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCapacitorZipInstructions = () => {
    const text = `# Guide de Compilation Android Studio - LiquiMind v3.5.0

## 1. Pré-requis
- Node.js 18+ & npm
- Android Studio Ladybug ou plus récent avec SDK Android 34 / 35
- Java JDK 17 ou 21

## 2. Initialisation du projet Android Natif
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init LiquiMind com.liquimind.app --web-dir dist

## 3. Génération du package Web
npm run build

## 4. Ajout de la plateforme Android
npx cap add android
npx cap sync

## 5. Ouverture dans Android Studio & Génération de l'APK
npx cap open android
# Dans Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
# L'APK final se trouve dans: android/app/build/outputs/apk/debug/app-debug.apk
`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GUIDE_COMPILATION_ANDROID_STUDIO.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#161618] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#121214]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-700 dark:text-blue-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Application Mobile Android
                </h2>
                <span className="rounded-full bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400">
                  APK Direct + PWA Standalone
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Téléchargez le fichier APK directement ou installez l'application en mode autonome
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAndroidModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-100/70 dark:bg-[#18181c] border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('apk')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'apk'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Télécharger APK (.apk)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('pwa')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'pwa'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Installation PWA / WebAPK</span>
          </button>
          <button
            onClick={() => setActiveSubTab('preview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'preview'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Aperçu Mobile</span>
          </button>
          <button
            onClick={() => setActiveSubTab('capacitor')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'capacitor'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Android Studio & Code Source</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: DIRECT DOWNLOAD APK */}
          {activeSubTab === 'apk' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Highlight Card */}
              <div className="rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50 via-indigo-50/40 to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-md">
                      <Download className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        LiquiMind Mobile v3.5.0 pour Android
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          Package APK Android prêt
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Architecture ARM64 / x86_64 · Android 8.0+
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Téléchargez directement le fichier d'installation Android (.apk) sur votre smartphone sans passer par le Play Store. Il intègre toutes les fonctionnalités : tableau de bord, bourses en direct, assistant financier IA et synchronisation de compte.
                </p>

                {/* Big Download Button */}
                <div className="pt-2">
                  <a
                    href="/LiquiMind-v3.5.0-release.apk"
                    download="LiquiMind-v3.5.0-release.apk"
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-700/20 active:scale-98 transition cursor-pointer"
                  >
                    <Download className="h-5 w-5" />
                    <span>Télécharger l'Application LiquiMind (.APK)</span>
                  </a>
                </div>
              </div>

              {/* Install steps guide */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-blue-600" />
                  Instructions d'installation sur votre téléphone Android
                </h4>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                  <li>
                    Cliquez sur le bouton ci-dessus pour télécharger le fichier <strong>LiquiMind-v3.5.0-release.apk</strong>.
                  </li>
                  <li>
                    Une fois le téléchargement terminé, ouvrez le fichier depuis le volet de notification ou l'application <strong>Mes Fichiers / Téléchargements</strong>.
                  </li>
                  <li>
                    Si votre téléphone affiche un avertissement de sécurité : allez dans <strong>Paramètres</strong> et cochez <strong>« Autoriser cette source »</strong> (installation d'applications inconnues autorisée pour votre navigateur ou gestionnaire de fichiers).
                  </li>
                  <li>
                    Appuyez sur <strong>« Installer »</strong> puis sur <strong>« Ouvrir »</strong> pour lancer LiquiMind !
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: PWA INSTALLATION */}
          {activeSubTab === 'pwa' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Installation Instantanée PWA (WebAPK)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Ajoute LiquiMind comme une application autonome sur votre écran d'accueil
                      </p>
                    </div>
                  </div>

                  {isInstalled ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                      Déjà installée
                    </span>
                  ) : (
                    <button
                      onClick={triggerInstall}
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      Installer maintenant
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181c] p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Installation manuelle via Google Chrome :
                </h3>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
                  <li>Ouvrez LiquiMind dans le navigateur <strong>Google Chrome</strong> sur votre smartphone Android.</li>
                  <li>Appuyez sur le menu des <strong>trois points verticaux ⋮</strong> en haut à droite.</li>
                  <li>Sélectionnez <strong>« Ajouter à l'écran d'accueil »</strong> ou <strong>« Installer l'application »</strong>.</li>
                  <li>L'application s'installe avec son icône dédiée, mode plein écran sans barre d'adresse et cache hors-ligne.</li>
                </ol>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    PWA Manifest & Service Worker Actifs
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Thème Cobalt Blue (#1d4ed8), icônes maskables, cache réseau v3.5.0
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  Prêt
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: SMARTPHONE PREVIEW */}
          {activeSubTab === 'preview' && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-2">
              {/* Phone Frame */}
              <div className="relative w-72 h-[520px] rounded-[42px] border-[8px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-700">
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-black border border-slate-800" />
                </div>

                {/* Phone Top Status */}
                <div className="pt-3 px-6 pb-2 flex justify-between items-center text-[10px] text-slate-400 font-bold z-10">
                  <span>12:45</span>
                  <div className="flex items-center gap-1">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Mini App Screen */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-white bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-400">LiquiMind</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      Personnel
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-2.5">
                    <span className="text-[9px] text-slate-400 uppercase block">Trésorerie nette</span>
                    <span className="text-base font-extrabold text-white">0,00 DH</span>
                  </div>

                  <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-2.5 space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase block">Cotations en direct</span>
                    <div className="flex justify-between text-[11px]">
                      <span>Attijariwafa Bank</span>
                      <span className="text-emerald-400 font-bold">554.00 DH</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Bitcoin (BTC)</span>
                      <span className="text-emerald-400 font-bold">~786 000 DH</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-blue-900/30 border border-blue-500/30 p-2 text-slate-200 text-[10px]">
                    <span className="font-bold text-blue-400 block">Assistant IA :</span>
                    Prêt pour le pilotage de votre budget et de vos investissements.
                  </div>
                </div>

                {/* Bottom Android Home indicator */}
                <div className="py-2 flex justify-center bg-slate-950">
                  <div className="w-24 h-1 bg-slate-700 rounded-full" />
                </div>
              </div>

              {/* Explanations */}
              <div className="max-w-md space-y-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181c] p-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Expérience 100% native plein écran
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    L'application s'adapte à tous les écrans Android (Samsung Galaxy, Google Pixel, Xiaomi, etc.) avec support tactile, gestes de navigation et stockage hors-ligne.
                  </p>
                </div>

                <div className="space-y-2">
                  <a
                    href="/LiquiMind-v3.5.0-release.apk"
                    download="LiquiMind-v3.5.0-release.apk"
                    className="w-full py-3 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <Download className="h-4 w-4" />
                    <span>Télécharger l'APK directement</span>
                  </a>
                  <button
                    onClick={() => setActiveSubTab('pwa')}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Installer en PWA / WebAPK</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CAPACITOR & ANDROID STUDIO */}
          {activeSubTab === 'capacitor' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">capacitor.config.json</span>
                <button
                  onClick={handleCopyConfig}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <pre className="rounded-xl bg-slate-950 p-4 text-xs font-mono text-blue-400 overflow-x-auto border border-slate-800">
                {capacitorConfig}
              </pre>

              <button
                onClick={downloadCapacitorZipInstructions}
                className="w-full py-3 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger le guide de compilation Android Studio (.md)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

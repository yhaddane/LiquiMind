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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AndroidAppModal: React.FC = () => {
  const { isAndroidModalOpen, setIsAndroidModalOpen, userSettings } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'capacitor' | 'pwa'>('preview');

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
      "backgroundColor": "#101011",
      "showSpinner": false
    },
    "StatusBar": {
      "style": "DARK",
      "backgroundColor": "#101011"
    }
  }
}`;

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(capacitorConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCapacitorZipInstructions = () => {
    const text = `# Commandes de génération du projet Android Natif (APK / AAB)

1. Installer Capacitor CLI :
   npm install @capacitor/core @capacitor/cli @capacitor/android

2. Initialiser le projet Android :
   npx cap init LiquiMind com.liquimind.app --web-dir dist

3. Créer le build web :
   npm run build

4. Ajouter et synchroniser la plateforme Android :
   npx cap add android
   npx cap sync

5. Ouvrir dans Android Studio pour compiler l'APK / Bundle :
   npx cap open android
`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'INSTRUCTIONS_ANDROID_STUDIO_LIQUIMIND.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-[#161618] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#121214]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c4f24e]/10 border border-[#c4f24e]/20 text-[#c4f24e]">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Version Application Android Native</h2>
                <span className="rounded-full bg-[#c4f24e]/20 px-2 py-0.5 text-[11px] font-bold text-[#c4f24e]">
                  PWA + Capacitor
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Installez instantanément en PWA ou compilez en APK / AAB avec Android Studio
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAndroidModalOpen(false)}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-[#18181c] border-b border-neutral-800">
          <button
            onClick={() => setActiveSubTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'preview'
                ? 'bg-[#c4f24e] text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Aperçu Smartphone
          </button>
          <button
            onClick={() => setActiveSubTab('pwa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'pwa'
                ? 'bg-[#c4f24e] text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Installation PWA (WebAPK)
          </button>
          <button
            onClick={() => setActiveSubTab('capacitor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'capacitor'
                ? 'bg-[#c4f24e] text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Capacitor & Android Studio
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSubTab === 'preview' && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-2">
              {/* Phone Frame */}
              <div className="relative w-72 h-[520px] rounded-[42px] border-[8px] border-neutral-800 bg-[#101011] shadow-2xl overflow-hidden flex flex-col ring-1 ring-neutral-700">
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-neutral-900 rounded-full z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-neutral-800" />
                </div>

                {/* Phone Top Status */}
                <div className="pt-3 px-6 pb-2 flex justify-between items-center text-[10px] text-neutral-400 font-bold z-10">
                  <span>12:45</span>
                  <div className="flex items-center gap-1">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Mini App Screen */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#c4f24e]">LiquiMind</span>
                    <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                      Personnel
                    </span>
                  </div>

                  <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-2.5">
                    <span className="text-[9px] text-neutral-400 uppercase block">Trésorerie nette</span>
                    <span className="text-base font-extrabold text-white">55 200 DH</span>
                  </div>

                  <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-2.5 space-y-1">
                    <span className="text-[9px] text-neutral-400 uppercase block">Échéances de la semaine</span>
                    <div className="flex justify-between text-[11px]">
                      <span>Facture Lydec</span>
                      <span className="text-red-400 font-bold">-550 DH</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Crédit Immo</span>
                      <span className="text-red-400 font-bold">-3 850 DH</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#c4f24e]/10 border border-[#c4f24e]/20 p-2 text-neutral-200 text-[10px]">
                    <span className="font-bold text-[#c4f24e] block">Conseil IA :</span>
                    Épargne estimée à +1 450 DH ce mois en suivant vos plafonds.
                  </div>
                </div>

                {/* Bottom Android Home indicator */}
                <div className="py-2 flex justify-center bg-[#101011]">
                  <div className="w-24 h-1 bg-neutral-700 rounded-full" />
                </div>
              </div>

              {/* Explanations */}
              <div className="max-w-md space-y-4">
                <div className="rounded-2xl border border-neutral-800 bg-[#18181c] p-4">
                  <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#c4f24e]" />
                    Expérience 100% native plein écran
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    L'application s'adapte à tous les écrans Android (Samsung Galaxy, Google Pixel, Xiaomi, etc.) avec support tactile, gestes de navigation et stockage hors-ligne.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setActiveSubTab('pwa')}
                    className="w-full py-3 rounded-xl bg-[#c4f24e] text-neutral-950 font-bold text-xs hover:bg-[#b0dc41] flex items-center justify-center gap-2 transition"
                  >
                    <span>Installer immédiatement sur Android</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveSubTab('capacitor')}
                    className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Code2 className="h-4 w-4 text-[#c4f24e]" />
                    <span>Exporter pour Android Studio</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'pwa' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="rounded-2xl border border-neutral-800 bg-[#18181c] p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">Comment installer l'application sur Android :</h3>
                <ol className="list-decimal list-inside text-xs text-neutral-300 space-y-2.5">
                  <li>Ouvrez ce lien dans le navigateur <strong>Google Chrome</strong> sur votre smartphone Android.</li>
                  <li>Appuyez sur le menu des <strong>trois points verticaux ⋮</strong> en haut à droite.</li>
                  <li>Sélectionnez <strong>« Ajouter à l'écran d'accueil »</strong> ou <strong>« Installer l'application »</strong>.</li>
                  <li>L'icône LiquiMind s'installe sur votre écran d'accueil avec affichage plein écran autonome (Standalone WebAPK).</li>
                </ol>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Manifest PWA actif</span>
                  <span className="text-[11px] text-neutral-400">/public/manifest.json configuré avec icônes maskables</span>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  Prêt
                </span>
              </div>
            </div>
          )}

          {activeSubTab === 'capacitor' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">capacitor.config.json</span>
                <button
                  onClick={handleCopyConfig}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <pre className="rounded-xl bg-neutral-950 p-4 text-xs font-mono text-[#c4f24e] overflow-x-auto border border-neutral-800">
                {capacitorConfig}
              </pre>

              <button
                onClick={downloadCapacitorZipInstructions}
                className="w-full py-3 rounded-xl bg-[#c4f24e] text-neutral-950 font-bold text-xs hover:bg-[#b0dc41] flex items-center justify-center gap-2 transition"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger le guide de compilation Android Studio</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

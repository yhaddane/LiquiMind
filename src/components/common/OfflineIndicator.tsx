import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Database, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOnlineStatus();
  const [showRestoredToast, setShowRestoredToast] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowRestoredToast(true);
      const timer = setTimeout(() => {
        setShowRestoredToast(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showRestoredToast) {
    return null;
  }

  if (showRestoredToast) {
    return (
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-xl text-xs font-bold border border-emerald-500/30">
          <Wifi className="h-4 w-4" />
          <span>Connexion rétablie — Synchronisation en cours</span>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom duration-300 max-w-sm">
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/95 dark:bg-[#161618]/95 text-white border border-amber-500/40 shadow-2xl backdrop-blur-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <WifiOff className="h-4 w-4 animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-400">Mode Hors-Ligne Actif</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              Workbox Cache
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Vos transactions, comptes et tableau de bord restent disponibles et consultables sans internet.
          </p>
        </div>
      </div>
    </div>
  );
};

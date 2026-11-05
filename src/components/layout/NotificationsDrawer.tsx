import React from 'react';
import { X, CheckCheck, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';

export const NotificationsDrawer: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    markNotificationRead,
    clearAllNotifications,
  } = useApp();

  const { t } = useI18n();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-sm h-full bg-white dark:bg-[#161618] border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-lime-600 dark:text-[#c4f24e]" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {t('alerts.notificationsTitle') || 'Notifications'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAllNotifications}
              className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1"
              title="Tout marquer comme lu"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="rounded-lg p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-neutral-400">
              <Bell className="h-8 w-8 stroke-1 text-neutral-300 dark:text-neutral-700 mb-2" />
              <span>{t('alerts.empty') || 'Aucune notification pour le moment.'}</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`rounded-xl border p-3 cursor-pointer transition ${
                  n.read
                    ? 'border-neutral-200 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30 opacity-75'
                    : 'border-lime-500/30 bg-lime-50/50 dark:bg-lime-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                    {n.date}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

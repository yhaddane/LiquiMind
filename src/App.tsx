/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { I18nProvider } from './context/I18nContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { MobileMoreModal } from './components/layout/MobileMoreModal';
import { CommandPalette } from './components/layout/CommandPalette';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { AddCategoryModal } from './components/modals/AddCategoryModal';
import { StatementReviewModal } from './components/modals/StatementReviewModal';
import { ExportModal } from './components/modals/ExportModal';

import { DashboardView } from './components/views/DashboardView';
import { PlanView } from './components/views/PlanView';
import { TransactionsView } from './components/views/TransactionsView';
import { CashflowView } from './components/views/CashflowView';
import { GoalsView } from './components/views/GoalsView';
import { DebtsView } from './components/views/DebtsView';
import { AccountsView } from './components/views/AccountsView';
import { AssetsView } from './components/views/AssetsView';
import { RecurringView } from './components/views/RecurringView';
import { SettingsView } from './components/views/SettingsView';
import { ForecastView } from './components/views/ForecastView';
import { AssistantView } from './components/views/AssistantView';
import { AIOnboardingModal } from './components/modals/AIOnboardingModal';
import { AndroidAppModal } from './components/modals/AndroidAppModal';
import { CollaboratorsModal } from './components/modals/CollaboratorsModal';
import { LoginPage } from './components/auth/LoginPage';
import { OfflineIndicator } from './components/common/OfflineIndicator';

const MainLayout: React.FC = () => {
  const { activeTab, isAddCategoryModalOpen, setIsAddCategoryModalOpen, addCategoryDefaultKind } = useApp();
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'plan':
        return <PlanView />;
      case 'transactions':
        return <TransactionsView />;
      case 'cashflow':
        return <CashflowView />;
      case 'forecast':
        return <ForecastView />;
      case 'assistant':
        return <AssistantView />;
      case 'goals':
        return <GoalsView />;
      case 'debts':
        return <DebtsView />;
      case 'accounts':
        return <AccountsView />;
      case 'assets':
        return <AssetsView />;
      case 'recurring':
        return <RecurringView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] dark:bg-[#101011] text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Body */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 safe-bottom">
          <div className="mx-auto max-w-6xl pb-20 lg:pb-8">
            {renderActiveView()}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav onOpenMore={() => setIsMobileMoreOpen(true)} />
      </div>

      {/* Global Modals & Drawers */}
      <AddTransactionModal />
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        defaultKind={addCategoryDefaultKind}
      />
      <StatementReviewModal />
      <ExportModal />
      <CommandPalette />
      <NotificationsDrawer />
      <AIOnboardingModal />
      <AndroidAppModal />
      <CollaboratorsModal />
      <MobileMoreModal
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
      />
      <OfflineIndicator />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { authUser } = useApp();

  // If user is not authenticated, render the dedicated LoginPage
  if (!authUser) {
    return <LoginPage />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <I18nProvider initialLocale="fr">
      <AppProvider>
        <AppContent />
      </AppProvider>
    </I18nProvider>
  );
}

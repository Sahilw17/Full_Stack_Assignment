import React from 'react';
import { DealProvider, useDeals } from './context/DealContext';
import { Navbar } from './components/layout/Navbar';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { WorkflowRulesView } from './components/workflows/WorkflowRulesView';
import { AuditTimelineView } from './components/audit/AuditTimelineView';
import { DealDetailModal } from './components/deals/DealDetailModal';
import { DealFormModal } from './components/deals/DealFormModal';
import { AiCopilotModal } from './components/copilot/AiCopilotModal';
import { ToastContainer } from './components/common/ToastContainer';

const MainContent: React.FC = () => {
  const { activeTab } = useDeals();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {activeTab === 'pipeline' && <KanbanBoard />}
      {activeTab === 'analytics' && <AnalyticsView />}
      {activeTab === 'workflows' && <WorkflowRulesView />}
      {activeTab === 'audit' && <AuditTimelineView />}
    </main>
  );
};

export function App() {
  return (
    <DealProvider>
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
        <Navbar />
        <MainContent />
        <DealDetailModal />
        <DealFormModal />
        <AiCopilotModal />
        <ToastContainer />
      </div>
    </DealProvider>
  );
}

export default App;

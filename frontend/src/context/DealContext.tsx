import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Deal, DealStage, DealPriority, PipelineAnalytics, WorkflowRule } from '../types';
import { api } from '../services/api';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface DealContextType {
  deals: Deal[];
  loading: boolean;
  error: string | null;
  selectedDeal: Deal | null;
  activeTab: 'pipeline' | 'analytics' | 'workflows' | 'audit';
  searchQuery: string;
  stageFilter: string;
  priorityFilter: string;
  analytics: PipelineAnalytics | null;
  workflowRules: WorkflowRule[];
  isCreateModalOpen: boolean;
  isCopilotOpen: boolean;
  toasts: ToastNotification[];
  setActiveTab: (tab: 'pipeline' | 'analytics' | 'workflows' | 'audit') => void;
  setSearchQuery: (q: string) => void;
  setStageFilter: (s: string) => void;
  setPriorityFilter: (p: string) => void;
  setSelectedDeal: (deal: Deal | null) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsCopilotOpen: (open: boolean) => void;
  refreshDeals: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  refreshWorkflowRules: () => Promise<void>;
  moveDealStage: (id: string, newStage: DealStage) => Promise<void>;
  createDeal: (data: any) => Promise<void>;
  updateDeal: (id: string, data: any) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  refreshDealAi: (id: string) => Promise<void>;
  toggleRule: (id: string, active: boolean) => Promise<void>;
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const DealContext = createContext<DealContextType | undefined>(undefined);

export const DealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'analytics' | 'workflows' | 'audit'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [analytics, setAnalytics] = useState<PipelineAnalytics | null>(null);
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshDeals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDeals({
        stage: stageFilter,
        priority: priorityFilter,
        search: searchQuery,
      });
      setDeals(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  }, [stageFilter, priorityFilter, searchQuery]);

  const refreshAnalytics = useCallback(async () => {
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }, []);

  const refreshWorkflowRules = useCallback(async () => {
    try {
      const data = await api.getWorkflowRules();
      setWorkflowRules(data);
    } catch (err) {
      console.error('Failed to load workflow rules:', err);
    }
  }, []);

  useEffect(() => {
    refreshDeals();
    refreshAnalytics();
    refreshWorkflowRules();
  }, [refreshDeals, refreshAnalytics, refreshWorkflowRules]);

  const moveDealStage = async (id: string, newStage: DealStage) => {
    try {
      // Optimistic update
      setDeals(prev =>
        prev.map(d => (d.id === id ? { ...d, stage: newStage } : d))
      );

      const result = await api.updateStage(id, newStage);
      setDeals(prev => prev.map(d => (d.id === id ? result.deal : d)));

      if (selectedDeal?.id === id) {
        setSelectedDeal(result.deal);
      }

      // Confetti celebration on winning deal
      if (newStage === 'CLOSED_WON') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#10b981', '#3b82f6', '#f59e0b'],
        });
        addToast('Deal Won! 🎉', `${result.deal.title} moved to Closed Won!`, 'success');
      } else {
        addToast('Stage Updated', `Moved to ${newStage}`, 'info');
      }

      // Display triggered automated actions if any
      if (result.triggeredActions && result.triggeredActions.length > 0) {
        result.triggeredActions.forEach(actionMsg => {
          addToast('⚡ Automation Triggered', actionMsg, 'success');
        });
        refreshWorkflowRules();
      }

      refreshAnalytics();
    } catch (err: any) {
      addToast('Error Moving Stage', err.message, 'error');
      refreshDeals();
    }
  };

  const createDeal = async (data: any) => {
    try {
      const result = await api.createDeal(data);
      setDeals(prev => [result.deal, ...prev]);
      addToast('Deal Created', `${result.deal.title} successfully added`, 'success');

      if (result.triggeredActions && result.triggeredActions.length > 0) {
        result.triggeredActions.forEach(actionMsg => {
          addToast('⚡ Automation Triggered', actionMsg, 'success');
        });
        refreshWorkflowRules();
      }

      refreshAnalytics();
    } catch (err: any) {
      addToast('Creation Error', err.message, 'error');
      throw err;
    }
  };

  const updateDeal = async (id: string, data: any) => {
    try {
      const updated = await api.updateDeal(id, data);
      setDeals(prev => prev.map(d => (d.id === id ? updated : d)));
      if (selectedDeal?.id === id) {
        setSelectedDeal(updated);
      }
      addToast('Saved', 'Deal updated successfully', 'success');
      refreshAnalytics();
    } catch (err: any) {
      addToast('Update Error', err.message, 'error');
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      await api.deleteDeal(id);
      setDeals(prev => prev.filter(d => d.id !== id));
      if (selectedDeal?.id === id) setSelectedDeal(null);
      addToast('Deal Deleted', 'Removed opportunity from pipeline', 'info');
      refreshAnalytics();
    } catch (err: any) {
      addToast('Delete Error', err.message, 'error');
    }
  };

  const refreshDealAi = async (id: string) => {
    try {
      addToast('AI Intelligence', 'Evaluating deal signals and generating playbook...', 'info');
      const updated = await api.refreshDealAi(id);
      setDeals(prev => prev.map(d => (d.id === id ? updated : d)));
      if (selectedDeal?.id === id) setSelectedDeal(updated);
      addToast('AI Updated', `Health score updated to ${updated.ai_score}%`, 'success');
      refreshAnalytics();
    } catch (err: any) {
      addToast('AI Refresh Failed', err.message, 'error');
    }
  };

  const toggleRule = async (id: string, active: boolean) => {
    try {
      await api.toggleWorkflowRule(id, active);
      setWorkflowRules(prev =>
        prev.map(r => (r.id === id ? { ...r, is_active: active ? 1 : 0 } : r))
      );
      addToast('Workflow Rule Updated', active ? 'Rule enabled' : 'Rule paused', 'info');
    } catch (err: any) {
      addToast('Rule Update Failed', err.message, 'error');
    }
  };

  return (
    <DealContext.Provider
      value={{
        deals,
        loading,
        error,
        selectedDeal,
        activeTab,
        searchQuery,
        stageFilter,
        priorityFilter,
        analytics,
        workflowRules,
        isCreateModalOpen,
        isCopilotOpen,
        toasts,
        setActiveTab,
        setSearchQuery,
        setStageFilter,
        setPriorityFilter,
        setSelectedDeal,
        setIsCreateModalOpen,
        setIsCopilotOpen,
        refreshDeals,
        refreshAnalytics,
        refreshWorkflowRules,
        moveDealStage,
        createDeal,
        updateDeal,
        deleteDeal,
        refreshDealAi,
        toggleRule,
        addToast,
        removeToast,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};

export const useDeals = () => {
  const context = useContext(DealContext);
  if (!context) throw new Error('useDeals must be used within DealProvider');
  return context;
};

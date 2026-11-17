import React, { useState } from 'react';
import { 
  Workflow, 
  Zap, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Play, 
  Layers, 
  Bell, 
  FileText, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useDeals } from '../../context/DealContext';
import { api } from '../../services/api';

export const WorkflowRulesView: React.FC = () => {
  const { workflowRules, toggleRule, refreshWorkflowRules, addToast } = useDeals();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('STAGE_CHANGED');
  const [stageCondition, setStageCondition] = useState('NEGOTIATION');
  const [actionType, setActionType] = useState('SET_PRIORITY');
  const [actionValue, setActionValue] = useState('URGENT');

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const condition_json = JSON.stringify({ stage: stageCondition });
      let action_payload = '{}';

      if (actionType === 'SET_PRIORITY') {
        action_payload = JSON.stringify({ priority: actionValue });
      } else if (actionType === 'SEND_NOTIFICATION') {
        action_payload = JSON.stringify({ channel: '#deal-alerts' });
      } else if (actionType === 'AUTO_AI_BRIEF') {
        action_payload = JSON.stringify({ format: 'EXECUTIVE_BRIEF' });
      }

      await api.createWorkflowRule({
        name,
        trigger_event: triggerEvent,
        condition_json,
        action_type: actionType,
        action_payload,
      });

      addToast('Workflow Created', `Rule "${name}" is now active`, 'success');
      setIsCreating(false);
      setName('');
      refreshWorkflowRules();
    } catch (err: any) {
      addToast('Rule Creation Failed', err.message, 'error');
    }
  };

  const handleDeleteRule = async (id: string, ruleName: string) => {
    if (window.confirm(`Delete automation rule "${ruleName}"?`)) {
      try {
        await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
        addToast('Rule Deleted', 'Automation removed', 'info');
        refreshWorkflowRules();
      } catch (err: any) {
        addToast('Delete Failed', err.message, 'error');
      }
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'SET_PRIORITY':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'AUTO_AI_BRIEF':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'SEND_NOTIFICATION':
        return <Bell className="w-4 h-4 text-cyan-400" />;
      case 'LOG_AUDIT':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <Workflow className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 pt-2">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Automated Workflow Rules Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Configure automated event-driven triggers. When pipeline deals shift stages or meet score criteria, DealPulse autonomously updates priorities, generates strategic briefs, and logs audit checkpoints.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow Rule</span>
        </button>
      </div>

      {/* Create Rule Form (Collapsible) */}
      {isCreating && (
        <form onSubmit={handleCreateRule} className="bg-[#0f172a] border border-emerald-500/30 p-6 rounded-2xl space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-white mb-2">Create New Automation Rule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Name</label>
              <input
                type="text"
                placeholder="e.g. Escalate Negotiation Deals to Urgent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Trigger Event</label>
              <select
                value={triggerEvent}
                onChange={(e) => setTriggerEvent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="STAGE_CHANGED">When Deal Stage Changes</option>
                <option value="SCORE_THRESHOLD">When AI Health Score Exceeds Threshold</option>
                <option value="DEAL_CREATED">When New Deal is Created</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Condition (Target Stage)</label>
              <select
                value={stageCondition}
                onChange={(e) => setStageCondition(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="LEAD">Lead Inbound</option>
                <option value="DISCOVERY">Discovery & Fit</option>
                <option value="PROPOSAL">Proposal Sent</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="CLOSED_WON">Closed Won</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Automated Action</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="SET_PRIORITY">Update Deal Priority to Urgent</option>
                <option value="AUTO_AI_BRIEF">Auto-attach Executive AI Brief</option>
                <option value="SEND_NOTIFICATION">Simulate Notification Alert</option>
                <option value="LOG_AUDIT">Record Audit Checkpoint</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-md"
            >
              Save & Activate Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {workflowRules.map((rule) => {
          const isActive = rule.is_active === 1;
          return (
            <div
              key={rule.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3.5 mb-3 sm:mb-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  {getActionIcon(rule.action_type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">{rule.name}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {rule.trigger_event}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Action: <span className="text-emerald-400 font-medium">{rule.action_type.replace('_', ' ')}</span> | Condition: <code className="text-slate-300 font-mono text-[11px] bg-slate-950 px-1 py-0.5 rounded">{rule.condition_json}</code>
                  </p>
                </div>
              </div>

              {/* Execution Counter & Controls */}
              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400">
                    {rule.execution_count}
                  </span>
                  <span className="text-[11px] text-slate-500 block">executions</span>
                </div>

                {/* Toggle Active Button */}
                <button
                  onClick={() => toggleRule(rule.id, !isActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isActive ? 'Active' : 'Paused'}
                </button>

                <button
                  onClick={() => handleDeleteRule(rule.id, rule.name)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

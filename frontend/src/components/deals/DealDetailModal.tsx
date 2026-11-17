import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Mail, 
  ShieldAlert, 
  History, 
  Send, 
  Copy, 
  Check, 
  Trash2, 
  Save, 
  RefreshCw,
  ExternalLink,
  DollarSign,
  User,
  Calendar,
  Layers
} from 'lucide-react';
import { Deal, DealStage, DealPriority, GeneratedEmail } from '../../types';
import { useDeals } from '../../context/DealContext';
import { api } from '../../services/api';
import { PriorityBadge, StageBadge } from '../common/Badge';

const ALL_STAGES: { stage: DealStage; label: string }[] = [
  { stage: 'LEAD', label: '1. Lead' },
  { stage: 'DISCOVERY', label: '2. Discovery' },
  { stage: 'PROPOSAL', label: '3. Proposal' },
  { stage: 'NEGOTIATION', label: '4. Negotiation' },
  { stage: 'CLOSED_WON', label: '5. Won' },
  { stage: 'CLOSED_LOST', label: 'Lost' },
];

export const DealDetailModal: React.FC = () => {
  const { 
    selectedDeal, 
    setSelectedDeal, 
    moveDealStage, 
    updateDeal, 
    deleteDeal, 
    refreshDealAi,
    addToast 
  } = useDeals();

  const [activeTab, setActiveTab] = useState<'ai' | 'email' | 'details' | 'activities'>('ai');
  const [dealData, setDealData] = useState<Deal | null>(selectedDeal);
  const [emailType, setEmailType] = useState<'PITCH' | 'FOLLOW_UP' | 'OBJECTION' | 'CLOSING'>('FOLLOW_UP');
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [aiRefreshing, setAiRefreshing] = useState(false);
  const [dealActivities, setDealActivities] = useState<any[]>([]);

  useEffect(() => {
    setDealData(selectedDeal);
    if (selectedDeal?.id) {
      api.getDealById(selectedDeal.id)
        .then(d => {
          if (d.activities) setDealActivities(d.activities);
        })
        .catch(console.error);
    }
  }, [selectedDeal]);

  if (!selectedDeal || !dealData) return null;

  const riskFactors: string[] = dealData.ai_risk_factors
    ? JSON.parse(dealData.ai_risk_factors)
    : [];

  const handleStageSelect = (stage: DealStage) => {
    moveDealStage(dealData.id, stage);
  };

  const handleAiRefresh = async () => {
    setAiRefreshing(true);
    await refreshDealAi(dealData.id);
    const updated = await api.getDealById(dealData.id);
    setDealData(updated);
    if (updated.activities) setDealActivities(updated.activities);
    setAiRefreshing(false);
  };

  const handleGenerateEmail = async (type: 'PITCH' | 'FOLLOW_UP' | 'OBJECTION' | 'CLOSING') => {
    setEmailType(type);
    setGeneratingEmail(true);
    try {
      const email = await api.generateEmail(dealData.id, type);
      setGeneratedEmail(email);
      addToast('AI Email Ready', `Generated ${type} draft`, 'success');
      // Refresh activities
      const updated = await api.getDealById(dealData.id);
      if (updated.activities) setDealActivities(updated.activities);
    } catch (err: any) {
      addToast('Email Generation Failed', err.message, 'error');
    } finally {
      setGeneratingEmail(false);
    }
  };

  const copyEmailToClipboard = () => {
    if (!generatedEmail) return;
    const text = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
    addToast('Copied', 'Email copied to clipboard', 'info');
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDeal(dealData.id, {
      title: dealData.title,
      company: dealData.company,
      contact_name: dealData.contact_name,
      contact_email: dealData.contact_email,
      value: Number(dealData.value),
      priority: dealData.priority,
      notes: dealData.notes,
    });
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${dealData.title}"?`)) {
      await deleteDeal(dealData.id);
      setSelectedDeal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/40">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {dealData.company}
              </span>
              <PriorityBadge priority={dealData.priority} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {dealData.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete deal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDeal(null)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stage Progression Stepper Bar */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 uppercase mr-2 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Stage:
          </span>
          {ALL_STAGES.map((s) => {
            const isActive = dealData.stage === s.stage;
            return (
              <button
                key={s.stage}
                onClick={() => handleStageSelect(s.stage)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/20">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'ai'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Strategy & Health</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'email'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Email Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Opportunity Details</span>
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'activities'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History ({dealActivities.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* TAB 1: AI STRATEGY */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              
              {/* Score & Verdict Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <span className="text-xs font-medium text-slate-400">AI Win Probability</span>
                  <div className="flex items-baseline gap-2 my-2">
                    <span className="text-4xl font-extrabold text-emerald-400">
                      {dealData.ai_score}%
                    </span>
                    <span className="text-xs text-slate-400">confidence score</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        dealData.ai_score >= 75 ? 'bg-emerald-500' : dealData.ai_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${dealData.ai_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Executive Opportunity Verdict
                    </span>
                    <button
                      onClick={handleAiRefresh}
                      disabled={aiRefreshing}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${aiRefreshing ? 'animate-spin' : ''}`} />
                      <span>{aiRefreshing ? 'Evaluating...' : 'Re-run AI Analysis'}</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {dealData.ai_summary || 'No AI summary generated yet. Click Re-run to generate.'}
                  </p>
                </div>
              </div>

              {/* Recommended Next Step / Playbook */}
              <div className="bg-gradient-to-r from-emerald-950/30 to-slate-900/80 border border-emerald-500/30 rounded-xl p-5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Strategic Next Best Action
                </h4>
                <p className="text-sm font-medium text-slate-100">
                  {dealData.ai_next_step || 'Analyze the deal to extract actionable next steps.'}
                </p>
              </div>

              {/* Identified Risk Factors */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Key Risk Factors & Friction Points
                </h4>
                {riskFactors.length === 0 ? (
                  <p className="text-xs text-slate-400">No critical risk flags detected for this deal.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {riskFactors.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-slate-950/80 border border-slate-800/80 p-3 rounded-lg text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: AI EMAIL COPILOT */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 font-medium">Select Email Template:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['FOLLOW_UP', 'PITCH', 'OBJECTION', 'CLOSING'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleGenerateEmail(type)}
                      disabled={generatingEmail}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        emailType === type && generatedEmail
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {type === 'FOLLOW_UP' && '🤝 Meeting Recap'}
                      {type === 'PITCH' && '🚀 Value Pitch'}
                      {type === 'OBJECTION' && '🛡️ Handle Objections'}
                      {type === 'CLOSING' && '📝 Contract Sign-off'}
                    </button>
                  ))}
                </div>
              </div>

              {generatingEmail ? (
                <div className="border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  <p className="text-xs text-slate-400">Synthesizing personalized B2B outreach email...</p>
                </div>
              ) : generatedEmail ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex-1 mr-4">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold">Subject:</span>
                      <h4 className="text-sm font-bold text-slate-100">{generatedEmail.subject}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {generatedEmail.tone}
                      </span>
                      <button
                        onClick={copyEmailToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
                    <pre className="font-sans text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {generatedEmail.body}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
                  Click one of the template buttons above to generate a custom context-aware sales email for {dealData.contact_name}.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OPPORTUNITY DETAILS FORM */}
          {activeTab === 'details' && (
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Deal Title</label>
                  <input
                    type="text"
                    value={dealData.title}
                    onChange={(e) => setDealData({ ...dealData, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={dealData.company}
                    onChange={(e) => setDealData({ ...dealData, company: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={dealData.contact_name}
                    onChange={(e) => setDealData({ ...dealData, contact_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={dealData.contact_email}
                    onChange={(e) => setDealData({ ...dealData, contact_email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Deal Value ($ USD)</label>
                  <input
                    type="number"
                    value={dealData.value}
                    onChange={(e) => setDealData({ ...dealData, value: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                  <select
                    value={dealData.priority}
                    onChange={(e) => setDealData({ ...dealData, priority: e.target.value as DealPriority })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Internal Notes & Context</label>
                <textarea
                  rows={4}
                  value={dealData.notes || ''}
                  onChange={(e) => setDealData({ ...dealData, notes: e.target.value })}
                  placeholder="Add meeting notes, customer pain points, or procurement terms..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: AUDIT TIMELINE */}
          {activeTab === 'activities' && (
            <div className="space-y-3">
              {dealActivities.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No activity records logged yet.
                </div>
              ) : (
                dealActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-300 uppercase tracking-wider">{act.type}</span>
                        <span className="text-slate-500">{new Date(act.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-200">{act.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

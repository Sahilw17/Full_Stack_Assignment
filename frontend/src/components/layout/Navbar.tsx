import React from 'react';
import { 
  Kanban, 
  BarChart3, 
  Workflow, 
  History, 
  Plus, 
  Sparkles, 
  Search, 
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { useDeals } from '../../context/DealContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    stageFilter,
    setStageFilter,
    priorityFilter,
    setPriorityFilter,
    analytics,
    setIsCreateModalOpen,
    setIsCopilotOpen,
  } = useDeals();

  return (
    <header className="border-b border-slate-800 bg-[#0B0F17]/90 backdrop-blur sticky top-0 z-30">
      {/* Top Banner & Quick Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  DealPulse
                </span>
                <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI WORKFLOW
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Intelligent Sales Pipeline & Revenue Acceleration
              </p>
            </div>
          </div>

          {/* Quick Metrics Ticker */}
          {analytics && (
            <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400">Pipeline: </span>
                <span className="font-semibold text-emerald-400">${analytics.totalPipelineValue.toLocaleString()}</span>
              </div>
              <div className="w-px h-3 bg-slate-800"></div>
              <div>
                <span className="text-slate-400">Weighted AI Forecast: </span>
                <span className="font-semibold text-cyan-400">${analytics.weightedPipelineValue.toLocaleString()}</span>
              </div>
              <div className="w-px h-3 bg-slate-800"></div>
              <div>
                <span className="text-slate-400">Win Rate: </span>
                <span className="font-semibold text-amber-400">{analytics.winRatePercentage}%</span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold shadow-sm transition-all group"
            >
              <Bot className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Ask AI Copilot</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Deal</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation & Search/Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 pt-1 gap-3">
          
          {/* Main Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/70 w-fit">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline Kanban</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Executive Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('workflows')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'workflows'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Automations Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Timeline</span>
            </button>
          </nav>

          {/* Search & Filter Controls (active in Pipeline tab) */}
          {activeTab === 'pipeline' && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search deals, company, contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-48 sm:w-64"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Stages</option>
                  <option value="LEAD">Lead Inbound</option>
                  <option value="DISCOVERY">Discovery</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="CLOSED_WON">Closed Won</option>
                  <option value="CLOSED_LOST">Closed Lost</option>
                </select>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

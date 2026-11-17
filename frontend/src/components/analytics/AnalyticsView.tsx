import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Layers, 
  Sparkles,
  Award
} from 'lucide-react';
import { useDeals } from '../../context/DealContext';

const STAGE_COLORS: Record<string, string> = {
  LEAD: '#60a5fa',
  DISCOVERY: '#c084fc',
  PROPOSAL: '#fbbf24',
  NEGOTIATION: '#818cf8',
  CLOSED_WON: '#34d399',
  CLOSED_LOST: '#f87171',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#64748b',
  MEDIUM: '#38bdf8',
  HIGH: '#fbbf24',
  URGENT: '#f43f5e',
};

export const AnalyticsView: React.FC = () => {
  const { analytics, loading, deals } = useDeals();

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-xs text-slate-400">Loading revenue analytics...</span>
      </div>
    );
  }

  if (!analytics) return null;

  const stageChartData = analytics.dealsByStage.map((s) => ({
    name: s.stage.replace('_', ' '),
    value: s.value,
    count: s.count,
    color: STAGE_COLORS[s.stage] || '#94a3b8',
  }));

  const priorityChartData = analytics.dealsByPriority.map((p) => ({
    name: p.priority,
    count: p.count,
    color: PRIORITY_COLORS[p.priority] || '#94a3b8',
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 pt-2">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Pipeline */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pipeline Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${analytics.totalPipelineValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {analytics.activeDealsCount} active opportunities
          </p>
        </div>

        {/* AI-Weighted Forecast */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> AI-Weighted Forecast
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-300">
            ${analytics.weightedPipelineValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculated via AI Win Probability scores
          </p>
        </div>

        {/* Average Deal Size */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Deal ACV</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${analytics.averageDealSize.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Normalized across active contracts
          </p>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Closing Win Rate</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300">
            {analytics.winRatePercentage}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Historical closed-won vs lost ratio
          </p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pipeline Value by Stage Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Pipeline Value by Funnel Stage</h3>
              <p className="text-xs text-slate-400">Total dollar volume committed across stages</p>
            </div>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(val) => `$${(val / 1000)}k`} 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-xl text-xs">
                          <p className="font-bold text-white">{data.name}</p>
                          <p className="text-emerald-400 font-semibold">${data.value.toLocaleString()}</p>
                          <p className="text-slate-400">{data.count} deals</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Deal Volume by Priority</h3>
              <p className="text-xs text-slate-400">Distribution of active workload urgency</p>
            </div>
            <Target className="w-4 h-4 text-slate-500" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-xl text-xs">
                          <p className="font-bold text-white">{data.name}</p>
                          <p className="text-cyan-400 font-semibold">{data.count} Opportunities</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Revenue Strategy Recap Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              DealPulse Autonomous Revenue Optimization
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Based on active pipeline telemetry, your highest conversion velocity is in the <strong>Proposal</strong> to <strong>Negotiation</strong> transition. Ensure automated contract reminders and executive briefs remain enabled to compress the current average 24-day closing cycle.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

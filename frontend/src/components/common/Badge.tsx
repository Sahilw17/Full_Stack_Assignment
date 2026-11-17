import React from 'react';
import { DealStage, DealPriority } from '../../types';

export const StageBadge: React.FC<{ stage: DealStage }> = ({ stage }) => {
  const styles: Record<DealStage, string> = {
    LEAD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    DISCOVERY: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    PROPOSAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    NEGOTIATION: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    CLOSED_WON: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CLOSED_LOST: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const labels: Record<DealStage, string> = {
    LEAD: 'Lead Inbound',
    DISCOVERY: 'Discovery & Fit',
    PROPOSAL: 'Proposal Sent',
    NEGOTIATION: 'In Negotiation',
    CLOSED_WON: 'Closed Won',
    CLOSED_LOST: 'Closed Lost',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[stage] || 'bg-slate-800 text-slate-300'}`}>
      {labels[stage] || stage}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: DealPriority }> = ({ priority }) => {
  const styles: Record<DealPriority, string> = {
    LOW: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
    MEDIUM: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    HIGH: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    URGENT: 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse-slow',
  };

  return (
    <span className={`px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-md border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const AiScorePill: React.FC<{ score: number }> = ({ score }) => {
  let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (score < 50) {
    color = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (score < 75) {
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{score}% Win AI</span>
    </div>
  );
};

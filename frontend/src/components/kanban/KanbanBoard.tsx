import React from 'react';
import { useDeals } from '../../context/DealContext';
import { KanbanColumn } from './KanbanColumn';
import { DealStage } from '../../types';

interface ColumnConfig {
  stage: DealStage;
  title: string;
  colorClass: string;
}

const COLUMNS: ColumnConfig[] = [
  { stage: 'LEAD', title: 'Lead Inbound', colorClass: 'bg-blue-400' },
  { stage: 'DISCOVERY', title: 'Discovery & Fit', colorClass: 'bg-purple-400' },
  { stage: 'PROPOSAL', title: 'Proposal Sent', colorClass: 'bg-amber-400' },
  { stage: 'NEGOTIATION', title: 'Negotiation', colorClass: 'bg-indigo-400' },
  { stage: 'CLOSED_WON', title: 'Closed Won', colorClass: 'bg-emerald-400' },
  { stage: 'CLOSED_LOST', title: 'Closed Lost', colorClass: 'bg-rose-400' },
];

export const KanbanBoard: React.FC = () => {
  const { deals, loading, error, refreshDeals } = useDeals();

  if (loading && deals.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400">Loading pipeline deals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-rose-400 text-sm">{error}</p>
        <button
          onClick={() => refreshDeals()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar">
      {COLUMNS.map((col) => {
        const columnDeals = deals.filter((d) => d.stage === col.stage);
        return (
          <KanbanColumn
            key={col.stage}
            stage={col.stage}
            title={col.title}
            deals={columnDeals}
            colorClass={col.colorClass}
          />
        );
      })}
    </div>
  );
};

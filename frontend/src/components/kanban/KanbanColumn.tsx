import React from 'react';
import { Deal, DealStage } from '../../types';
import { DealCard } from './DealCard';

interface KanbanColumnProps {
  stage: DealStage;
  title: string;
  deals: Deal[];
  colorClass: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  title,
  deals,
  colorClass,
}) => {
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col w-80 sm:w-84 flex-shrink-0 bg-slate-950/40 rounded-2xl border border-slate-800/80 p-3 max-h-[calc(100vh-160px)]">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 mb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></div>
          <h3 className="font-semibold text-xs text-slate-200 tracking-wide uppercase">
            {title}
          </h3>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
            {deals.length}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-400">
          ${totalValue.toLocaleString()}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {deals.length === 0 ? (
          <div className="border border-dashed border-slate-800/60 rounded-xl p-8 text-center text-slate-600 text-xs">
            No deals in this stage
          </div>
        ) : (
          deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
        )}
      </div>
    </div>
  );
};

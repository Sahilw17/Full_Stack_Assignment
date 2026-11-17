import React from 'react';
import { 
  Building2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Calendar, 
  ArrowUpRight 
} from 'lucide-react';
import { Deal, DealStage } from '../../types';
import { PriorityBadge, AiScorePill } from '../common/Badge';
import { useDeals } from '../../context/DealContext';

const STAGE_ORDER: DealStage[] = [
  'LEAD',
  'DISCOVERY',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
];

export const DealCard: React.FC<{ deal: Deal }> = ({ deal }) => {
  const { setSelectedDeal, moveDealStage } = useDeals();

  const currentIndex = STAGE_ORDER.indexOf(deal.stage);
  const canMoveBack = currentIndex > 0 && deal.stage !== 'CLOSED_WON' && deal.stage !== 'CLOSED_LOST';
  const canMoveForward = currentIndex < STAGE_ORDER.length - 2; // don't auto forward into closed lost

  const handlePrevStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveBack) {
      moveDealStage(deal.id, STAGE_ORDER[currentIndex - 1]);
    }
  };

  const handleNextStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveForward) {
      moveDealStage(deal.id, STAGE_ORDER[currentIndex + 1]);
    }
  };

  return (
    <div
      onClick={() => setSelectedDeal(deal)}
      className="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-4 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer"
    >
      {/* Top Header: Company & Priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium truncate">
          <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="truncate">{deal.company}</span>
        </div>
        <PriorityBadge priority={deal.priority} />
      </div>

      {/* Deal Title */}
      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1 mb-2">
        {deal.title}
      </h4>

      {/* Deal Value & AI Health Score */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-base font-bold text-emerald-400">
          ${deal.value.toLocaleString()}
        </span>
        <AiScorePill score={deal.ai_score} />
      </div>

      {/* AI Next Best Action Snippet */}
      {deal.ai_next_step && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 mb-3 text-[11px] text-slate-300 flex items-start gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2 leading-tight">
            <span className="text-slate-500 font-medium">AI Play: </span>
            {deal.ai_next_step}
          </p>
        </div>
      )}

      {/* Footer: Date & Quick Stage Steppers */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span>{deal.contact_name.split(' ')[0]}</span>
        </div>

        <div className="flex items-center gap-1">
          {canMoveBack && (
            <button
              onClick={handlePrevStage}
              title="Move to previous stage"
              className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {canMoveForward && (
            <button
              onClick={handleNextStage}
              title="Advance to next stage"
              className="p-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="p-1 text-slate-400 group-hover:text-emerald-400 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  History, 
  Sparkles, 
  Zap, 
  ArrowRightLeft, 
  Mail, 
  PlusCircle, 
  FileText 
} from 'lucide-react';
import { useDeals } from '../../context/DealContext';

export const AuditTimelineView: React.FC = () => {
  const { analytics, loading } = useDeals();

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-xs text-slate-400">Loading audit history...</span>
      </div>
    );
  }

  const activities = analytics?.recentActivities || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'STAGE_CHANGE':
        return <ArrowRightLeft className="w-4 h-4 text-blue-400" />;
      case 'AI_ANALYSIS':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'AUTOMATION_TRIGGERED':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'EMAIL_GENERATED':
        return <Mail className="w-4 h-4 text-cyan-400" />;
      case 'DEAL_CREATED':
        return <PlusCircle className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 pt-2">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <History className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Pipeline Activity & System Audit Log
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Immutable event log tracking all pipeline stage transitions, AI intelligence assessments, email drafts, and automated workflow triggers.
        </p>
      </div>

      {/* Activity Timeline Feed */}
      <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
        {activities.length === 0 ? (
          <div className="text-xs text-slate-500 py-6">No recent activities found.</div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="relative group">
              {/* Event node */}
              <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                <div className="w-2 h-2 rounded-full bg-current"></div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition-all">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-slate-800">
                      {getActivityIcon(act.type)}
                    </span>
                    <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                      {act.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {act.description}
                </p>

                {act.metadata && (
                  <div className="mt-2 text-[10px] text-slate-500 font-mono bg-slate-950/60 p-2 rounded-md border border-slate-800/60 overflow-x-auto">
                    {act.metadata}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

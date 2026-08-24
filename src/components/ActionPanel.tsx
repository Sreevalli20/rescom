import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Send,
  PhoneForwarded,
  Tag,
  Calendar,
  FileText,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { ActionType, CallAction } from '../types';

interface ActionPanelProps {
  actions: CallAction[];
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ actions }) => {
  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'outbound_initiated':
        return <PhoneForwarded className="w-4 h-4 text-blue-400" />;
      case 'language_detected':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'lead_classified':
        return <Tag className="w-4 h-4 text-amber-400" />;
      case 'whatsapp_sent':
        return <Send className="w-4 h-4 text-emerald-400" />;
      case 'callback_requested':
      case 'callback_scheduled':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'followup_prepared':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusIcon = (status: CallAction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
      case 'in_progress':
        return <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin flex-shrink-0" />;
      case 'failed':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-white flex flex-col overflow-hidden" id="action-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200" id="action-panel-heading">
            Backend Orchestration Log
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
          {actions.length} events
        </span>
      </div>

      {/* Action List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1" id="actions-timeline">
        {actions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No backend actions recorded yet. Trigger a call to monitor execution events.
          </div>
        ) : (
          actions.map((act, index) => (
            <div
              key={act.id || index}
              className="p-3 bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-lg transition-colors"
              id={`action-item-${index}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-slate-900/90 rounded border border-slate-700/70">
                    {getActionIcon(act.type)}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{act.title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  {getStatusIcon(act.status)}
                  <span>{act.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 pl-7 leading-relaxed font-normal">
                {act.description}
              </p>

              {act.payloadSnippet && (
                <div className="mt-2 ml-7 p-1.5 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-emerald-400 truncate">
                  {act.payloadSnippet}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

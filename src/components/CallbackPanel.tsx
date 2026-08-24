import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, Edit3 } from 'lucide-react';
import { CallbackData } from '../types';

interface CallbackPanelProps {
  callback: CallbackData;
  onScheduleManual?: (time: string, note?: string) => void;
  callId?: string;
}

export const CallbackPanel: React.FC<CallbackPanelProps> = ({
  callback,
  onScheduleManual,
  callId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [manualTime, setManualTime] = useState(callback.parsedDateTime || 'Tomorrow, 10:00 AM IST');
  const [note, setNote] = useState(callback.notes || '');

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (onScheduleManual) {
      onScheduleManual(manualTime, note);
    }
    setIsEditing(false);
  };

  const getStatusBadge = () => {
    switch (callback.status) {
      case 'scheduled':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold rounded-lg" id="callback-status-scheduled">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            Scheduled in CRM
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg" id="callback-status-pending">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Dispatch
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg" id="callback-status-done">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Callback Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs rounded-lg font-medium" id="callback-status-none">
            No Callback Requested
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs" id="callback-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide" id="callback-heading">
            AI Callback Intelligence
          </h3>
        </div>
        {getStatusBadge()}
      </div>

      {callback.requested ? (
        <div className="space-y-3.5" id="callback-content-active">
          {/* Natural Language Customer Utterance */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
              Customer Exact Utterance
            </span>
            <p className="text-xs text-slate-800 italic font-mono bg-white p-2.5 rounded border border-slate-200">
              "{callback.originalText || callback.requestedTime || 'Call me tomorrow morning.'}"
            </p>
          </div>

          {/* AI Interpreted & Parsed Target */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-purple-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Backend Temporal Parser</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] text-purple-700 hover:text-purple-950 font-medium flex items-center gap-1"
                id="btn-edit-callback"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>
            <div className="text-sm font-bold text-purple-950 font-mono" id="callback-parsed-time">
              Callback requested for: {callback.parsedDateTime || callback.requestedTime || 'Tomorrow morning'}
            </div>
            {callback.notes && (
              <p className="text-xs text-slate-600 mt-1">{callback.notes}</p>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSaveManual} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2" id="callback-edit-form">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Adjust Parsed Date & Time
                </label>
                <input
                  type="text"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="e.g. Tomorrow, 10:00 AM IST"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Follow-up Notes / Agent Instructions
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="e.g. Partner will join on speaker"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded shadow-xs transition-colors"
                >
                  Save & Reschedule
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg text-center text-slate-500 text-xs" id="callback-empty-state">
          No callback has been requested by the prospect during this call.
        </div>
      )}
    </div>
  );
};

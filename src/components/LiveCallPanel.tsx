import React, { useEffect, useState } from 'react';
import {
  PhoneCall,
  PhoneForwarded,
  Radio,
  Mic,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  Sparkles,
  Flame,
  Sun,
  Snowflake,
} from 'lucide-react';
import { CallRecord, CallStatus } from '../types';
import { AudioWaveform } from './AudioWaveform';

interface LiveCallPanelProps {
  call: CallRecord | null;
  onOpenSummary?: () => void;
}

export const LiveCallPanel: React.FC<LiveCallPanelProps> = ({ call, onOpenSummary }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!call) {
      setElapsedSeconds(0);
      return;
    }

    setElapsedSeconds(call.durationSeconds || 0);

    const isLive =
      call.status === 'calling' ||
      call.status === 'ringing' ||
      call.status === 'connected' ||
      call.status === 'listening' ||
      call.status === 'speaking';

    if (!isLive) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [call?.id, call?.status, call?.durationSeconds]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusConfig = (status: CallStatus) => {
    switch (status) {
      case 'calling':
        return {
          label: 'Calling (Exotel SIP Trunk)',
          color: 'text-amber-800 bg-amber-50 border-amber-200',
          icon: PhoneForwarded,
          pulse: true,
          speaker: 'none' as const,
        };
      case 'ringing':
        return {
          label: 'Ringing Prospect Device',
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          icon: Radio,
          pulse: true,
          speaker: 'none' as const,
        };
      case 'connected':
        return {
          label: 'Connected',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          icon: Radio,
          pulse: false,
          speaker: 'none' as const,
        };
      case 'speaking':
        return {
          label: 'AI Agent Speaking',
          color: 'text-blue-800 bg-blue-50 border-blue-300 ring-2 ring-blue-400/30',
          icon: Volume2,
          pulse: true,
          speaker: 'ai' as const,
        };
      case 'listening':
        return {
          label: 'Listening to Customer',
          color: 'text-emerald-800 bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30',
          icon: Mic,
          pulse: true,
          speaker: 'customer' as const,
        };
      case 'completed':
        return {
          label: 'Call Completed',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          icon: CheckCircle2,
          pulse: false,
          speaker: 'none' as const,
        };
      case 'failed':
        return {
          label: 'Call Failed / Rejected',
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          icon: AlertCircle,
          pulse: false,
          speaker: 'none' as const,
        };
      default:
        return {
          label: 'Ready / Standby',
          color: 'text-slate-600 bg-slate-50 border-slate-200',
          icon: PhoneCall,
          pulse: false,
          speaker: 'none' as const,
        };
    }
  };

  const statusConfig = getStatusConfig(call ? call.status : 'idle');
  const StatusIcon = statusConfig.icon;

  const getLeadBadge = () => {
    if (!call) return null;
    const lead = call.qualification.leadStatus;
    if (lead === 'HOT') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm shadow-red-200 tracking-wide" id="live-lead-hot">
          <Flame className="w-3.5 h-3.5 fill-white" />
          HOT INTENT
        </span>
      );
    }
    if (lead === 'WARM') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-amber-200 tracking-wide" id="live-lead-warm">
          <Sun className="w-3.5 h-3.5 text-white" />
          WARM INTENT
        </span>
      );
    }
    if (lead === 'COLD') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg tracking-wide" id="live-lead-cold">
          <Snowflake className="w-3.5 h-3.5 text-slate-500" />
          COLD LEAD
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs rounded-md font-medium">
        Evaluating Intent...
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs" id="live-call-panel">
      {/* Header Pipeline Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div>
          <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-1">
            Live Telephony Pipeline
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-semibold ${statusConfig.color}`}
              id="live-call-status-badge"
            >
              <StatusIcon className={`w-4 h-4 ${statusConfig.pulse ? 'animate-bounce' : ''}`} />
              <span>{statusConfig.label}</span>
              {statusConfig.pulse && (
                <span className="w-2 h-2 rounded-full bg-current animate-ping ml-1" />
              )}
            </div>

            {/* Lead Status Badge */}
            {getLeadBadge()}
          </div>
        </div>

        {/* Live Timer & Waveform */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-sm shadow-xs" id="live-call-timer">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-bold tracking-wider">{formatDuration(elapsedSeconds)}</span>
          </div>

          <AudioWaveform
            isActive={call?.status === 'speaking' || call?.status === 'listening'}
            speaker={statusConfig.speaker}
          />
        </div>
      </div>

      {/* Target Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Customer Phone & Identity */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
            Customer Endpoint
          </span>
          <div className="text-sm font-bold text-slate-900 font-mono truncate" id="live-phone-display">
            {call?.phoneNumber || '+91 98490 12345'}
          </div>
          <div className="text-xs text-slate-600 truncate mt-0.5 font-medium">
            {call?.customerName || 'Prospect'}
          </div>
        </div>

        {/* Detected Language */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
            Speech & Dialect
          </span>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Globe className="w-4 h-4 text-blue-600" />
            <span id="live-language-display">{call?.language || 'Telugu / Auto-Detect'}</span>
          </div>
          <div className="text-xs text-slate-500 truncate mt-0.5">
            Real-time ASR & Voice Synthesis
          </div>
        </div>

        {/* Real-time Intent Score */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Lead Score
            </span>
            <span className="text-xs font-mono font-bold text-blue-600" id="live-lead-score">
              {call?.qualification.leadScore ? `${call.qualification.leadScore}/100` : 'Evaluating'}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                (call?.qualification.leadScore || 0) >= 80
                  ? 'bg-red-500 shadow-xs shadow-red-500/50'
                  : (call?.qualification.leadScore || 0) >= 50
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(8, call?.qualification.leadScore || 15))}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-1">
            Intent: <strong className="text-slate-800">{call?.qualification.buyingIntent || 'Pending'}</strong>
          </div>
        </div>
      </div>

      {/* Current AI Action & Objective */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-lg" id="live-current-goal">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
            Active AI Objective
          </span>
        </div>
        <p className="text-xs text-slate-700 font-medium leading-relaxed" id="live-ai-goal-text">
          {call?.currentAiGoal || 'Ready to trigger outbound AI sales call...'}
        </p>
      </div>

      {/* Completed Summary Quick Action */}
      {call?.status === 'completed' && call.summary && onOpenSummary && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-emerald-700 font-medium">
            AI Sales Analysis & Follow-up ready for review
          </span>
          <button
            onClick={onOpenSummary}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            id="btn-view-summary-quick"
          >
            View Post-Call Summary &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

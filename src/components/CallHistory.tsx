import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Flame,
  Sun,
  Snowflake,
  Phone,
  Clock,
  Globe,
  Calendar,
  Eye,
  CheckCircle2,
  AlertCircle,
  Radio,
  FileText,
} from 'lucide-react';
import { CallFilters, CallRecord, CallStatus, LeadStatus } from '../types';

interface CallHistoryProps {
  calls: CallRecord[];
  onSelectCall: (call: CallRecord) => void;
  selectedCallId?: string;
}

export const CallHistory: React.FC<CallHistoryProps> = ({
  calls,
  onSelectCall,
  selectedCallId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [leadFilter, setLeadFilter] = useState<'ALL' | LeadStatus>('ALL');
  const [languageFilter, setLanguageFilter] = useState<string>('ALL');

  const filteredCalls = calls.filter((call) => {
    // Search query matches phone, customer name, or language
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      call.phoneNumber.toLowerCase().includes(query) ||
      (call.customerName && call.customerName.toLowerCase().includes(query)) ||
      call.language.toLowerCase().includes(query) ||
      (call.qualification.products && call.qualification.products.toLowerCase().includes(query));

    // Lead filter
    const matchesLead = leadFilter === 'ALL' || call.qualification.leadStatus === leadFilter;

    // Language filter
    const matchesLang = languageFilter === 'ALL' || call.language === languageFilter;

    return matchesSearch && matchesLead && matchesLang;
  });

  const getLeadBadge = (lead: LeadStatus) => {
    switch (lead) {
      case 'HOT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-bold">
            <Flame className="w-3 h-3 fill-red-500 text-red-500" />
            HOT
          </span>
        );
      case 'WARM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-bold">
            <Sun className="w-3 h-3 text-amber-600" />
            WARM
          </span>
        );
      case 'COLD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-bold">
            <Snowflake className="w-3 h-3 text-slate-500" />
            COLD
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded text-[11px]">
            Unassigned
          </span>
        );
    }
  };

  const getCallStatusBadge = (status: CallStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case 'calling':
      case 'ringing':
      case 'connected':
      case 'listening':
      case 'speaking':
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 text-xs font-semibold animate-pulse">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            Active
          </span>
        );
      default:
        return <span className="text-slate-500 text-xs">{status}</span>;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs" id="call-history-section">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide" id="history-heading">
            Call History & Past Lead Logs
          </h3>
          <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200 font-mono">
            {filteredCalls.length} calls
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone or name..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44"
              id="history-search-input"
            />
          </div>

          {/* Lead Filter */}
          <select
            value={leadFilter}
            onChange={(e) => setLeadFilter(e.target.value as 'ALL' | LeadStatus)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            id="history-lead-filter"
          >
            <option value="ALL">All Leads</option>
            <option value="HOT">HOT Leads</option>
            <option value="WARM">WARM Leads</option>
            <option value="COLD">COLD Leads</option>
          </select>

          {/* Language Filter */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            id="history-lang-filter"
          >
            <option value="ALL">All Languages</option>
            <option value="Telugu">Telugu</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </select>
        </div>
      </div>

      {/* Table for Desktop / Cards for Mobile */}
      <div className="overflow-x-auto" id="history-table-container">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px] bg-slate-50/80">
              <th className="py-3 px-3">Date / Time</th>
              <th className="py-3 px-3">Customer Phone</th>
              <th className="py-3 px-3">Duration</th>
              <th className="py-3 px-3">Language</th>
              <th className="py-3 px-3">Lead Status</th>
              <th className="py-3 px-3">Callback</th>
              <th className="py-3 px-3">Call Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCalls.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No call records found matching current filters.
                </td>
              </tr>
            ) : (
              filteredCalls.map((call) => {
                const isSelected = selectedCallId === call.id;

                return (
                  <tr
                    key={call.id}
                    onClick={() => onSelectCall(call)}
                    className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/60 border-l-2 border-blue-600' : ''
                    }`}
                    id={`history-row-${call.id}`}
                  >
                    {/* Date / Time */}
                    <td className="py-3 px-3 text-slate-600 font-mono whitespace-nowrap">
                      {new Date(call.startedAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Customer & Phone */}
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{call.phoneNumber}</span>
                        {call.customerName && (
                          <span className="text-[11px] text-slate-500 font-sans font-normal truncate max-w-[180px]">
                            {call.customerName}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 text-slate-600 font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatDuration(call.durationSeconds)}</span>
                      </div>
                    </td>

                    {/* Language */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-medium">
                        {call.language}
                      </span>
                    </td>

                    {/* Lead Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getLeadBadge(call.qualification.leadStatus)}
                    </td>

                    {/* Callback */}
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {call.callback.requested ? (
                        <div className="flex items-center gap-1 text-purple-700 text-[11px] font-medium">
                          <Calendar className="w-3 h-3 text-purple-600" />
                          <span className="truncate max-w-[130px]">{call.callback.parsedDateTime || 'Yes'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    {/* Call Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getCallStatusBadge(call.status)}
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCall(call);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded border border-slate-200 transition-colors font-medium"
                        title="View call details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

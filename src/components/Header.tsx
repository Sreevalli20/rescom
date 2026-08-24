import React from 'react';
import { PhoneCall, Activity, Server, Settings, Sparkles, RefreshCw } from 'lucide-react';
import { BackendHealth, CallRecord } from '../types';

interface HeaderProps {
  health: BackendHealth;
  activeCall: CallRecord | null;
  onOpenSettings: () => void;
  onRefreshHealth: () => void;
  isRefreshingHealth: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  activeCall,
  onOpenSettings,
  onRefreshHealth,
  isRefreshingHealth,
}) => {
  const getStatusBadge = () => {
    if (health.isMockMode) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold" id="header-status-mock">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Mock Simulation Mode</span>
        </div>
      );
    }

    if (health.status === 'healthy') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold" id="header-status-connected">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Backend Connected ({health.latencyMs ?? 15}ms)</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-semibold" id="header-status-offline">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        <span>Backend Offline</span>
      </div>
    );
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs" id="main-header">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Brand & Project Name */}
        <div className="flex items-center gap-3" id="header-brand-container">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs" id="header-logo-icon">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight" id="project-title">
                AI Voice Sales Agent
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full" id="project-badge">
                E-Commerce Telephony
              </span>
            </div>
            <p className="text-xs text-slate-500" id="project-subtitle">
              Exotel Telephony Gateway &bull; Multi-Lingual Speech &bull; Lead Qualification
            </p>
          </div>
        </div>

        {/* Right Side Status & Actions */}
        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto justify-between sm:justify-end" id="header-actions-container">
          {/* Active Call Quick Alert */}
          {activeCall && (activeCall.status === 'calling' || activeCall.status === 'ringing' || activeCall.status === 'connected' || activeCall.status === 'speaking' || activeCall.status === 'listening') && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium" id="header-active-call-alert">
              <Activity className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>Call Active: <strong className="text-slate-900">{activeCall.phoneNumber}</strong></span>
            </div>
          )}

          {/* Backend Connection Indicator */}
          {getStatusBadge()}

          {/* Refresh Ping Button */}
          <button
            onClick={onRefreshHealth}
            disabled={isRefreshingHealth}
            title="Check backend health"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
            id="btn-refresh-health"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingHealth ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Settings / API Bridge Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-all shadow-xs"
            id="btn-open-settings"
          >
            <Server className="w-3.5 h-3.5 text-blue-600" />
            <span>API Config</span>
            <Settings className="w-3.5 h-3.5 ml-1 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

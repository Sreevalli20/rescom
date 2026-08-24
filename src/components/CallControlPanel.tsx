import React, { useState } from 'react';
import { Phone, PhoneOff, Play, Flame, Sun, Snowflake, User, Globe, MessageSquare, Calendar } from 'lucide-react';
import { CallRecord, CallStatus } from '../types';
import { MOCK_SCENARIOS } from '../services/mockService';

interface CallControlPanelProps {
  activeCall: CallRecord | null;
  onStartCall: (phoneNumber: string, customerName?: string, scenarioKey?: string) => void;
  onEndCall: () => void;
  isStartingCall: boolean;
}

export const CallControlPanel: React.FC<CallControlPanelProps> = ({
  activeCall,
  onStartCall,
  onEndCall,
  isStartingCall,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('+91 98490 12345');
  const [customerName, setCustomerName] = useState('Lakshmi Devi (Hyderabad Sarees)');
  const [selectedScenario, setSelectedScenario] = useState<string>('telugu_hot');

  const isCallActive =
    activeCall !== null &&
    activeCall.status !== 'completed' &&
    activeCall.status !== 'failed' &&
    activeCall.status !== 'idle';

  const handleScenarioSelect = (scenarioKey: string) => {
    setSelectedScenario(scenarioKey);
    const scenario = MOCK_SCENARIOS[scenarioKey];
    if (scenario) {
      setPhoneNumber(scenario.phoneNumber);
      setCustomerName(scenario.customerName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    onStartCall(phoneNumber.trim(), customerName.trim(), selectedScenario);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs" id="call-control-panel">
      {/* Preset Scenarios Tabs */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            1-Click Test Scenarios (Telugu / Hindi / English)
          </label>
          <span className="text-[11px] text-slate-500">Auto-populates phone number & customer context</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="scenario-preset-selector">
          {/* Scenario 1: Telugu HOT */}
          <button
            type="button"
            onClick={() => handleScenarioSelect('telugu_hot')}
            disabled={isCallActive}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
              selectedScenario === 'telugu_hot'
                ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400/40'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
            } disabled:opacity-50`}
            id="preset-telugu-hot"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                Telugu HOT Lead
              </span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded font-mono font-bold">
                ₹35k Budget
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-900 truncate">Lakshmi Devi (Boutique)</div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">150 Sarees, Instant WhatsApp Quote</div>
          </button>

          {/* Scenario 2: Hindi WARM */}
          <button
            type="button"
            onClick={() => handleScenarioSelect('hindi_warm')}
            disabled={isCallActive}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
              selectedScenario === 'hindi_warm'
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
            } disabled:opacity-50`}
            id="preset-hindi-warm"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                Hindi WARM Lead
              </span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded font-mono font-bold">
                Callback
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-900 truncate">Rajesh Sharma (Spices)</div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">50 SKUs, Callback with Partner</div>
          </button>

          {/* Scenario 3: English COLD */}
          <button
            type="button"
            onClick={() => handleScenarioSelect('english_cold')}
            disabled={isCallActive}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
              selectedScenario === 'english_cold'
                ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/40'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
            } disabled:opacity-50`}
            id="preset-english-cold"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Snowflake className="w-3.5 h-3.5 text-slate-500" />
                English COLD Lead
              </span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] rounded font-mono font-bold">
                Passive
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-900 truncate">Vikram Menon (Gadgets)</div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">Amazon seller, Low buying intent</div>
          </button>
        </div>
      </div>

      {/* Dialer Form */}
      <form onSubmit={handleSubmit} className="space-y-3" id="dialer-form">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Customer Name Field */}
          <div className="sm:col-span-4">
            <label htmlFor="input-customer-name" className="block text-xs font-medium text-slate-600 mb-1">
              Customer / Business Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="input-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Smt. Lakshmi Devi"
                disabled={isCallActive}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 font-sans"
              />
            </div>
          </div>

          {/* Customer Phone Number Field */}
          <div className="sm:col-span-5">
            <label htmlFor="input-phone-number" className="block text-xs font-medium text-slate-600 mb-1">
              Customer Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="input-phone-number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98490 12345"
                required
                disabled={isCallActive}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Action Button: Start Call or End Call */}
          <div className="sm:col-span-3 flex items-end">
            {isCallActive ? (
              <button
                type="button"
                onClick={onEndCall}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                id="btn-end-call"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isStartingCall || !phoneNumber.trim()}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
                id="btn-start-call"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isStartingCall ? 'Initiating...' : 'Start Outbound Call'}</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Quick Status Bar when call is active or finished */}
      {activeCall && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs" id="control-quick-metrics">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Language: <strong className="text-slate-900">{activeCall.language}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp: <strong className="text-slate-900">{activeCall.actions.some(a => a.type === 'whatsapp_sent') ? 'Dispatched' : 'Pending'}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Callback: <strong className="text-slate-900">{activeCall.callback.requested ? activeCall.callback.parsedDateTime || 'Requested' : 'No'}</strong></span>
            </div>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            Call SID: {activeCall.id}
          </div>
        </div>
      )}
    </div>
  );
};

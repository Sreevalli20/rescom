import React, { useState } from 'react';
import {
  X,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { BackendHealth } from '../types';
import { apiClient } from '../services/apiClient';
import { callService } from '../services/callService';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: BackendHealth;
  onHealthUpdated: (health: BackendHealth) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  health,
  onHealthUpdated,
}) => {
  const [apiUrl, setApiUrl] = useState(apiClient.getBaseUrl());
  const [isMockMode, setIsMockMode] = useState(callService.isMockMode());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      apiClient.setBaseUrl(apiUrl);
      if (isMockMode) {
        setTestResult({
          success: true,
          message: 'Mock Mode Active — Local simulation engine responds in ~12ms.',
        });
        const h = await callService.checkBackendHealth();
        onHealthUpdated(h);
      } else {
        await apiClient.checkHealth();
        setTestResult({
          success: true,
          message: `Backend Connected! GET /health responded OK at ${apiUrl}`,
        });
        const h = await callService.checkBackendHealth();
        onHealthUpdated(h);
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to reach backend endpoint.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleMock = (enabled: boolean) => {
    setIsMockMode(enabled);
    callService.setMockMode(enabled);
    const updated = callService.getBackendHealth();
    onHealthUpdated(updated);
    setTestResult({
      success: true,
      message: enabled
        ? 'Switched to Mock Telephony Simulator Mode.'
        : `Switched to Live Backend Mode targeting ${apiUrl}`,
    });
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    apiClient.setBaseUrl(apiUrl);
    handleTestConnection();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="api-settings-modal">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight" id="modal-settings-title">
                Backend API & Environment Bridge
              </h2>
              <p className="text-xs text-slate-500">
                Configure Render backend URL & toggle between live REST endpoints and Mock Simulation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            id="btn-close-settings-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Security Guard Notice */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3" id="security-badge-info">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Exotel Telephony Security Architecture
              </h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                This web frontend contains <strong>ZERO private secrets</strong> (no Exotel API Key, SID, or Token). All telephony authentication is securely encapsulated on your backend server.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Simulation & Live Switch
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleToggleMock(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    isMockMode
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  id="btn-switch-mock"
                >
                  Mock Mode
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMock(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    !isMockMode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  id="btn-switch-live"
                >
                  Live Backend
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isMockMode
                ? 'Mock Mode is active (VITE_USE_MOCKS=true). Calls simulate realistic Telugu/Hindi/English outbound speech with timed qualifications, WhatsApp triggers, and callback scheduling.'
                : `Live Backend is active (VITE_USE_MOCKS=false). REST requests will be dispatched to ${apiUrl}.`}
            </p>
          </div>

          {/* Backend URL Configuration */}
          <form onSubmit={handleSaveUrl} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Backend Service URL (<code className="font-mono text-blue-700 font-bold">VITE_API_URL</code>)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://your-backend.onrender.com"
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  id="input-api-url"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  id="btn-test-backend"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : (
                    <Server className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>Test Ping</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </form>

          {/* Backend REST Contract Specification Guide */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 text-white">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Backend REST Contract Specification
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
              <div className="p-2 bg-slate-800/90 rounded border border-slate-700/80">
                <span className="text-emerald-400 font-bold">POST</span> /api/calls/start
              </div>
              <div className="p-2 bg-slate-800/90 rounded border border-slate-700/80">
                <span className="text-blue-400 font-bold">GET</span> /api/calls/:callId
              </div>
              <div className="p-2 bg-slate-800/90 rounded border border-slate-700/80">
                <span className="text-blue-400 font-bold">GET</span> /api/calls/:callId/transcript
              </div>
              <div className="p-2 bg-slate-800/90 rounded border border-slate-700/80">
                <span className="text-blue-400 font-bold">GET</span> /api/calls/:callId/qualification
              </div>
              <div className="p-2 bg-slate-800/90 rounded border border-slate-700/80">
                <span className="text-blue-400 font-bold">GET</span> /api/calls/:callId/actions
              </div>
              <div className="p-2 bg-slate-800/90 rounded border border-slate-700/80">
                <span className="text-blue-400 font-bold">GET</span> /api/calls/:callId/summary
              </div>
              <div className="p-2 bg-slate-800/90 rounded border border-slate-700/80">
                <span className="text-blue-400 font-bold">GET</span> /api/calls
              </div>
              <div className="p-2 bg-slate-800/90 rounded border border-slate-700/80">
                <span className="text-emerald-400 font-bold">POST</span> /api/calls/:callId/callback
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

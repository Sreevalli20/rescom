import React, { useEffect, useState, useCallback } from 'react';
import {
  Header,
} from './components/Header';
import { CallControlPanel } from './components/CallControlPanel';
import { LiveCallPanel } from './components/LiveCallPanel';
import { LiveTranscript } from './components/LiveTranscript';
import { LeadQualificationPanel } from './components/LeadQualificationPanel';
import { ActionPanel } from './components/ActionPanel';
import { CallbackPanel } from './components/CallbackPanel';
import { CallHistory } from './components/CallHistory';
import { CallSummaryModal } from './components/CallSummaryModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { BackendHealth, CallRecord, CallSummary } from './types';
import { callService } from './services/callService';

export default function App() {
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<CallSummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [health, setHealth] = useState<BackendHealth>(callService.getBackendHealth());
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);

  // Load calls list
  const loadCalls = useCallback(async () => {
    try {
      const calls = await callService.getCalls();
      setCallHistory(calls);
    } catch (err) {
      console.error('Failed to load calls:', err);
    }
  }, []);

  // Initial load & health check
  useEffect(() => {
    loadCalls();
    callService.checkBackendHealth().then(setHealth);

    // Subscribe to real-time call updates
    const unsubscribe = callService.subscribeToUpdates((updatedCall) => {
      setActiveCall((prev) => {
        if (!prev || prev.id === updatedCall.id) {
          return { ...updatedCall };
        }
        return prev;
      });

      // Update call in history list
      setCallHistory((prev) => {
        const index = prev.findIndex((c) => c.id === updatedCall.id);
        if (index >= 0) {
          const clone = [...prev];
          clone[index] = { ...updatedCall };
          return clone;
        }
        return [updatedCall, ...prev];
      });

      // Auto-prompt summary if completed
      if (updatedCall.status === 'completed' && updatedCall.summary) {
        setSelectedSummary(updatedCall.summary);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadCalls]);

  const handleRefreshHealth = async () => {
    setIsRefreshingHealth(true);
    try {
      const h = await callService.checkBackendHealth();
      setHealth(h);
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  const handleStartCall = async (
    phoneNumber: string,
    customerName?: string,
    scenarioKey?: string
  ) => {
    setIsStartingCall(true);
    try {
      const res = await callService.startCall({
        phoneNumber,
        customerName,
        scenarioPreset: scenarioKey,
      });

      // Poll or fetch initial call object
      const call = await callService.getCall(res.callId);
      setActiveCall(call);
      await loadCalls();
    } catch (err: unknown) {
      console.error('Error starting call:', err);
      alert(err instanceof Error ? err.message : 'Failed to initiate outbound call');
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    try {
      await callService.endCall(activeCall.id);
      const updated = await callService.getCall(activeCall.id);
      setActiveCall(updated);
      await loadCalls();
    } catch (err) {
      console.error('Error ending call:', err);
    }
  };

  const handleSelectHistoricalCall = (call: CallRecord) => {
    setActiveCall(call);
    if (call.summary) {
      setSelectedSummary(call.summary);
    }
  };

  const handleManualScheduleCallback = async (time: string, note?: string) => {
    if (!activeCall) return;
    try {
      await callService.scheduleCallback(activeCall.id, { time, note });
      const updated = await callService.getCall(activeCall.id);
      setActiveCall(updated);
      await loadCalls();
    } catch (err) {
      console.error('Error scheduling callback:', err);
    }
  };

  const isCallLive =
    activeCall !== null &&
    (activeCall.status === 'calling' ||
      activeCall.status === 'ringing' ||
      activeCall.status === 'connected' ||
      activeCall.status === 'listening' ||
      activeCall.status === 'speaking');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white" id="app-root">
      {/* Top Application Header */}
      <Header
        health={health}
        activeCall={activeCall}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onRefreshHealth={handleRefreshHealth}
        isRefreshingHealth={isRefreshingHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6" id="dashboard-main-content">
        {/* Call Trigger & Quick Dialer Section */}
        <section aria-label="Call Control" id="section-call-control">
          <CallControlPanel
            activeCall={activeCall}
            onStartCall={handleStartCall}
            onEndCall={handleEndCall}
            isStartingCall={isStartingCall}
          />
        </section>

        {/* Live Call Pipeline, Speech Transcript & Qualification Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="section-live-console">
          {/* Left Column (7 cols on desktop): Live Call Telephony Bar & Transcript */}
          <div className="lg:col-span-7 space-y-6">
            <LiveCallPanel
              call={activeCall}
              onOpenSummary={() => {
                if (activeCall?.summary) {
                  setSelectedSummary(activeCall.summary);
                  setIsSummaryModalOpen(true);
                }
              }}
            />

            <LiveTranscript
              messages={activeCall?.transcript || []}
              language={activeCall?.language}
              isCallLive={isCallLive}
            />
          </div>

          {/* Right Column (5 cols on desktop): Lead Qualification, Backend Actions, and Callback */}
          <div className="lg:col-span-5 space-y-6">
            <LeadQualificationPanel
              qualification={
                activeCall?.qualification || {
                  leadStatus: 'UNASSIGNED',
                  budget: 'Not provided',
                  products: 'Not provided',
                  productCount: 'Not provided',
                  timeline: 'Not provided',
                  features: [],
                  buyingIntent: 'Unknown',
                  barrier: 'None',
                  decisionMaker: 'Unknown',
                }
              }
            />

            <CallbackPanel
              callback={
                activeCall?.callback || {
                  requested: false,
                  status: 'none',
                }
              }
              onScheduleManual={handleManualScheduleCallback}
              callId={activeCall?.id}
            />

            <ActionPanel actions={activeCall?.actions || []} />
          </div>
        </section>

        {/* Historical Calls Section */}
        <section aria-label="Call History" id="section-call-history" className="pt-2">
          <CallHistory
            calls={callHistory}
            onSelectCall={handleSelectHistoricalCall}
            selectedCallId={activeCall?.id}
          />
        </section>
      </main>

      {/* Post-Call Comprehensive CRM Summary Modal */}
      <CallSummaryModal
        summary={selectedSummary}
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
      />

      {/* API Configuration & Contract Modal */}
      <ApiSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        health={health}
        onHealthUpdated={setHealth}
      />
    </div>
  );
}

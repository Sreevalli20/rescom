/**
 * Unified Call Service
 * Orchestrates calls between Mock Telephony Simulator and Real REST Backend (via VITE_API_URL).
 * Provides active call subscription, health monitoring, and data access.
 */

import {
  BackendHealth,
  CallAction,
  CallRecord,
  CallSummary,
  CallbackData,
  QualificationData,
  StartCallPayload,
  StartCallResponse,
  TranscriptMessage,
} from '../types';
import { apiClient } from './apiClient';
import { mockService } from './mockService';

class CallService {
  private useMockMode: boolean;
  private backendHealth: BackendHealth;
  private pollInterval: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Check environment variable VITE_USE_MOCKS (defaults to true if unset or set to 'true')
    const envUseMocks = import.meta.env.VITE_USE_MOCKS;
    this.useMockMode = envUseMocks !== 'false';

    this.backendHealth = {
      status: this.useMockMode ? 'healthy' : 'unreachable',
      isMockMode: this.useMockMode,
      apiUrl: apiClient.getBaseUrl(),
    };

    if (!this.useMockMode) {
      this.checkBackendHealth();
    }
  }

  public isMockMode(): boolean {
    return this.useMockMode;
  }

  public setMockMode(enabled: boolean): void {
    this.useMockMode = enabled;
    this.backendHealth.isMockMode = enabled;
    if (!enabled) {
      this.checkBackendHealth();
    } else {
      this.backendHealth.status = 'healthy';
    }
  }

  public getBackendHealth(): BackendHealth {
    return { ...this.backendHealth };
  }

  public async checkBackendHealth(): Promise<BackendHealth> {
    if (this.useMockMode) {
      this.backendHealth = {
        status: 'healthy',
        isMockMode: true,
        apiUrl: apiClient.getBaseUrl(),
        latencyMs: 12,
      };
      return this.backendHealth;
    }

    const start = performance.now();
    try {
      await apiClient.checkHealth();
      const latency = Math.round(performance.now() - start);
      this.backendHealth = {
        status: 'healthy',
        isMockMode: false,
        apiUrl: apiClient.getBaseUrl(),
        latencyMs: latency,
      };
    } catch {
      this.backendHealth = {
        status: 'unreachable',
        isMockMode: false,
        apiUrl: apiClient.getBaseUrl(),
      };
    }
    return this.backendHealth;
  }

  public subscribeToUpdates(listener: (call: CallRecord) => void): () => void {
    return mockService.subscribe(listener);
  }

  public async startCall(payload: StartCallPayload): Promise<StartCallResponse> {
    if (this.useMockMode) {
      return mockService.startCall(payload);
    }
    return apiClient.startCall(payload);
  }

  public async getCall(callId: string): Promise<CallRecord> {
    if (this.useMockMode) {
      const call = mockService.getCall(callId);
      if (!call) throw new Error('Call not found in mock store');
      return call;
    }
    return apiClient.getCall(callId);
  }

  public async getCalls(filters?: { leadStatus?: string; search?: string }): Promise<CallRecord[]> {
    if (this.useMockMode) {
      let list = mockService.getCalls();
      if (filters?.leadStatus && filters.leadStatus !== 'ALL') {
        list = list.filter((c) => c.qualification.leadStatus === filters.leadStatus);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (c) =>
            c.phoneNumber.toLowerCase().includes(q) ||
            (c.customerName && c.customerName.toLowerCase().includes(q)) ||
            c.language.toLowerCase().includes(q)
        );
      }
      return list;
    }
    return apiClient.getCalls(filters);
  }

  public async getTranscript(callId: string): Promise<TranscriptMessage[]> {
    if (this.useMockMode) {
      const call = mockService.getCall(callId);
      return call?.transcript || [];
    }
    return apiClient.getTranscript(callId);
  }

  public async getQualification(callId: string): Promise<QualificationData> {
    if (this.useMockMode) {
      const call = mockService.getCall(callId);
      if (!call) throw new Error('Call not found');
      return call.qualification;
    }
    return apiClient.getQualification(callId);
  }

  public async getActions(callId: string): Promise<CallAction[]> {
    if (this.useMockMode) {
      const call = mockService.getCall(callId);
      return call?.actions || [];
    }
    return apiClient.getActions(callId);
  }

  public async getSummary(callId: string): Promise<CallSummary | undefined> {
    if (this.useMockMode) {
      const call = mockService.getCall(callId);
      return call?.summary;
    }
    return apiClient.getSummary(callId);
  }

  public async scheduleCallback(
    callId: string,
    data: { time: string; note?: string }
  ): Promise<CallbackData> {
    if (this.useMockMode) {
      return mockService.scheduleCallback(callId, data);
    }
    return apiClient.scheduleCallback(callId, {
      requestedTime: data.time,
      parsedDateTime: data.time,
      notes: data.note,
    });
  }

  public async endCall(callId: string): Promise<void> {
    if (this.useMockMode) {
      mockService.cancelActiveSimulation();
      return;
    }
    await apiClient.endCall(callId);
  }
}

export const callService = new CallService();

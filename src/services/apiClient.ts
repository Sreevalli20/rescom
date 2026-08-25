/**
 * Centralized REST API client for communicating with the future Render/FastAPI/Express backend.
 * Configured via VITE_API_URL.
 */

import {
  CallAction,
  CallRecord,
  CallSummary,
  CallbackData,
  QualificationData,
  StartCallPayload,
  StartCallResponse,
  TranscriptMessage,
} from '../types';

export class ApiClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(baseUrl?: string, timeoutMs: number = 10000) {
    this.baseUrl = (baseUrl || (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000').replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson && typeof errorJson === 'object' && 'detail' in errorJson) {
            errorDetail = String(errorJson.detail);
          } else if (errorJson && typeof errorJson === 'object' && 'message' in errorJson) {
            errorDetail = String(errorJson.message);
          }
        } catch {
          // ignore parsing error
        }
        throw new Error(errorDetail);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Request timeout (${this.timeoutMs}ms) to ${endpoint}`);
      }
      throw err;
    }
  }

  /**
   * Check backend health
   * GET /health
   */
  async checkHealth(): Promise<{ status: string; timestamp?: string; version?: string }> {
    return this.request<{ status: string; timestamp?: string; version?: string }>('/health');
  }

  /**
   * Start a new outbound call
   * POST /api/calls/start
   */
  async startCall(payload: StartCallPayload): Promise<StartCallResponse> {
    return this.request<StartCallResponse>('/api/calls/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get single call status and details
   * GET /api/calls/:callId
   */
  async getCall(callId: string): Promise<CallRecord> {
    return this.request<CallRecord>(`/api/calls/${callId}`);
  }

  /**
   * Get live transcript for a call
   * GET /api/calls/:callId/transcript
   */
  async getTranscript(callId: string): Promise<TranscriptMessage[]> {
    return this.request<TranscriptMessage[]>(`/api/calls/${callId}/transcript`);
  }

  /**
   * Get real-time lead qualification data
   * GET /api/calls/:callId/qualification
   */
  async getQualification(callId: string): Promise<QualificationData> {
    return this.request<QualificationData>(`/api/calls/${callId}/qualification`);
  }

  /**
   * Get backend actions executed during the call
   * GET /api/calls/:callId/actions
   */
  async getActions(callId: string): Promise<CallAction[]> {
    return this.request<CallAction[]>(`/api/calls/${callId}/actions`);
  }

  /**
   * Get post-call AI synthesized summary
   * GET /api/calls/:callId/summary
   */
  async getSummary(callId: string): Promise<CallSummary> {
    return this.request<CallSummary>(`/api/calls/${callId}/summary`);
  }

  /**
   * Get call history list
   * GET /api/calls
   */
  async getCalls(filters?: { leadStatus?: string; search?: string }): Promise<CallRecord[]> {
    const params = new URLSearchParams();
    if (filters?.leadStatus && filters.leadStatus !== 'ALL') {
      params.append('leadStatus', filters.leadStatus);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<CallRecord[]>(`/api/calls${queryStr}`);
  }

  /**
   * Schedule or update a callback
   * POST /api/calls/:callId/callback
   */
  async scheduleCallback(
    callId: string,
    callbackData: { requestedTime?: string; parsedDateTime?: string; notes?: string }
  ): Promise<CallbackData> {
    return this.request<CallbackData>(`/api/calls/${callId}/callback`, {
      method: 'POST',
      body: JSON.stringify(callbackData),
    });
  }

  /**
   * End an active call
   * POST /api/calls/:callId/end
   */
  async endCall(callId: string): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(`/api/calls/${callId}/end`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();

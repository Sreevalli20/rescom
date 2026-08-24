/**
 * AI Voice Sales Agent - Type Definitions
 * Shared types across API client, Mock engine, and UI components.
 */

export type CallStatus =
  | 'idle'
  | 'calling'
  | 'ringing'
  | 'connected'
  | 'listening'
  | 'speaking'
  | 'completed'
  | 'failed';

export type LeadStatus = 'HOT' | 'WARM' | 'COLD' | 'UNASSIGNED';

export type BuyingIntent = 'Low' | 'Medium' | 'High' | 'Unknown';

export type DecisionMaker = 'Known' | 'Unknown';

export type SupportedLanguage = 'te' | 'hi' | 'en' | 'auto';

export interface TranscriptMessage {
  id: string;
  speaker: 'ai' | 'customer';
  text: string;
  timestamp: string;
  language?: string;
  translation?: string;
  audioDurationMs?: number;
  highlightedKeywords?: string[];
}

export interface QualificationData {
  leadStatus: LeadStatus;
  budget: string;
  products: string;
  productCount: string;
  timeline: string;
  features: string[];
  buyingIntent: BuyingIntent;
  barrier: string;
  decisionMaker: DecisionMaker;
  leadScore?: number; // 0 to 100
  confidenceScore?: number;
  lastUpdated?: string;
}

export type ActionType =
  | 'outbound_initiated'
  | 'language_detected'
  | 'lead_classified'
  | 'whatsapp_sent'
  | 'callback_requested'
  | 'callback_scheduled'
  | 'followup_prepared'
  | 'quote_generated';

export interface CallAction {
  id: string;
  type: ActionType;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  timestamp: string;
  title: string;
  description: string;
  payloadSnippet?: string;
  metadata?: Record<string, unknown>;
}

export interface CallbackData {
  requested: boolean;
  originalText?: string;
  requestedTime?: string;
  parsedDateTime?: string;
  status: 'none' | 'pending' | 'scheduled' | 'completed';
  scheduledIso?: string;
  assignedAgent?: string;
  notes?: string;
}

export interface CallSummary {
  id: string;
  callId: string;
  customerName?: string;
  phoneNumber: string;
  language: string;
  leadStatus: LeadStatus;
  whatTheyWant: string;
  budget: string;
  products: string;
  productCount: string;
  timeline: string;
  features: string[];
  customerConcerns: string;
  nextAction: string;
  importantStatements: string[];
  generatedAt: string;
  recommendedPackage?: string;
  estimatedDealValue?: string;
}

export interface CallRecord {
  id: string;
  phoneNumber: string;
  customerName?: string;
  status: CallStatus;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  language: string;
  qualification: QualificationData;
  callback: CallbackData;
  actions: CallAction[];
  summary?: CallSummary;
  transcript: TranscriptMessage[];
  currentAiGoal?: string;
  failureReason?: string;
}

export interface StartCallPayload {
  phoneNumber: string;
  customerName?: string;
  preferredLanguage?: SupportedLanguage;
  scenarioPreset?: string;
}

export interface StartCallResponse {
  success: boolean;
  callId: string;
  status: CallStatus;
  message?: string;
}

export interface BackendHealth {
  status: 'healthy' | 'degraded' | 'unreachable';
  isMockMode: boolean;
  apiUrl: string;
  latencyMs?: number;
  version?: string;
}

export interface CallFilters {
  searchQuery: string;
  leadStatus: 'ALL' | LeadStatus;
  language: 'ALL' | 'Telugu' | 'Hindi' | 'English';
  callStatus: 'ALL' | CallStatus;
}

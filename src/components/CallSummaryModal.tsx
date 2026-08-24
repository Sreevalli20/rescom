import React, { useState } from 'react';
import {
  X,
  Flame,
  Sun,
  Snowflake,
  Copy,
  Check,
  Download,
  IndianRupee,
  Package,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowRightCircle,
  Quote,
  Layers,
} from 'lucide-react';
import { CallSummary } from '../types';

interface CallSummaryModalProps {
  summary: CallSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CallSummaryModal: React.FC<CallSummaryModalProps> = ({
  summary,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !summary) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const textReport = `=========================================
AI VOICE SALES AGENT - POST-CALL CRM SUMMARY
=========================================
Call ID: ${summary.callId}
Generated At: ${summary.generatedAt}
Customer: ${summary.customerName || 'Prospect'}
Phone: ${summary.phoneNumber}
Language: ${summary.language}
Lead Status: ${summary.leadStatus}

WHAT THEY WANT:
${summary.whatTheyWant}

BUDGET: ${summary.budget}
PRODUCTS: ${summary.products} (${summary.productCount})
TIMELINE: ${summary.timeline}
FEATURES: ${summary.features.join(', ')}

CUSTOMER'S CONCERNS:
${summary.customerConcerns}

RECOMMENDED NEXT ACTION:
${summary.nextAction}

IMPORTANT CUSTOMER STATEMENTS:
${summary.importantStatements.map((s) => `• ${s}`).join('\n')}
=========================================`;

    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Call_Summary_${summary.phoneNumber.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getLeadBadge = () => {
    if (summary.leadStatus === 'HOT') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg" id="summary-lead-hot">
          <Flame className="w-4 h-4 fill-red-500 text-red-500" />
          HOT LEAD
        </span>
      );
    }
    if (summary.leadStatus === 'WARM') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg" id="summary-lead-warm">
          <Sun className="w-4 h-4 text-amber-600" />
          WARM LEAD
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg" id="summary-lead-cold">
        <Snowflake className="w-4 h-4 text-slate-500" />
        COLD LEAD
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="call-summary-modal">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight" id="modal-summary-title">
                Post-Call AI Sales Summary
              </h2>
              <p className="text-xs text-slate-500">
                Call ID: <span className="font-mono text-slate-700 font-medium">{summary.callId}</span> &bull; {new Date(summary.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Download text report"
              id="btn-download-summary"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyJson}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Copy JSON to clipboard"
              id="btn-copy-summary-json"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              id="btn-close-summary-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 divide-y divide-slate-100 text-sm">
          {/* Top Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Customer Name
              </span>
              <span className="text-sm font-bold text-slate-900 truncate block">
                {summary.customerName || 'Prospect'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Phone Number
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono truncate block">
                {summary.phoneNumber}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Language
              </span>
              <span className="text-sm font-bold text-blue-700 block">
                {summary.language}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Classification
              </span>
              <div>{getLeadBadge()}</div>
            </div>
          </div>

          {/* What they want */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              What They Want
            </h4>
            <p className="text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              {summary.whatTheyWant}
            </p>
          </div>

          {/* Discovery Pillars Grid */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Budget */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
              <IndianRupee className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Budget</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">{summary.budget}</span>
              </div>
            </div>

            {/* Products */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
              <Package className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Products</span>
                <span className="text-sm font-semibold text-slate-800">{summary.products}</span>
              </div>
            </div>

            {/* Product Count */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-purple-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Approx SKU Count</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{summary.productCount}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Timeline</span>
                <span className="text-sm font-bold text-slate-800">{summary.timeline}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Required Website Features
            </h4>
            <div className="flex flex-wrap gap-2">
              {summary.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>

          {/* Customer's Concerns */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Customer's Concerns & Barriers
            </h4>
            <p className="text-slate-800 leading-relaxed bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl">
              {summary.customerConcerns}
            </p>
          </div>

          {/* Next Action */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ArrowRightCircle className="w-4 h-4 text-emerald-600" />
              Recommended Next Action
            </h4>
            <p className="text-emerald-950 font-medium leading-relaxed bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl">
              {summary.nextAction}
            </p>
          </div>

          {/* Important Customer Statements */}
          {summary.importantStatements && summary.importantStatements.length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-blue-600" />
                Important Customer Statements (Verbatim)
              </h4>
              <div className="space-y-2">
                {summary.importantStatements.map((stmt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 italic font-mono flex items-start gap-2"
                  >
                    <span className="text-blue-600 font-bold">&ldquo;</span>
                    <span>{stmt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {summary.recommendedPackage && (
              <span>Recommended: <strong className="text-blue-700">{summary.recommendedPackage}</strong></span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};

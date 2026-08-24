import React from 'react';
import {
  Flame,
  Sun,
  Snowflake,
  HelpCircle,
  IndianRupee,
  Package,
  Layers,
  Calendar,
  Sparkles,
  ShieldAlert,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { QualificationData } from '../types';

interface LeadQualificationPanelProps {
  qualification: QualificationData;
}

export const LeadQualificationPanel: React.FC<LeadQualificationPanelProps> = ({
  qualification,
}) => {
  const getStatusBadge = () => {
    switch (qualification.leadStatus) {
      case 'HOT':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold shadow-xs" id="lead-badge-hot">
            <Flame className="w-4 h-4 fill-red-500 text-red-500" />
            <span>HOT LEAD (High Intent)</span>
          </div>
        );
      case 'WARM':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold shadow-xs" id="lead-badge-warm">
            <Sun className="w-4 h-4 text-amber-600" />
            <span>WARM LEAD (Callback / Partner)</span>
          </div>
        );
      case 'COLD':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-xs" id="lead-badge-cold">
            <Snowflake className="w-4 h-4 text-slate-500" />
            <span>COLD LEAD (Low Priority)</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-xs font-medium" id="lead-badge-unassigned">
            <HelpCircle className="w-4 h-4" />
            <span>Unassigned (Evaluating)</span>
          </div>
        );
    }
  };

  const getIntentBadge = () => {
    switch (qualification.buyingIntent) {
      case 'High':
        return <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded font-semibold text-xs">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold text-xs">Medium</span>;
      case 'Low':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-semibold text-xs">Low</span>;
      default:
        return <span className="text-xs text-slate-400">Evaluating...</span>;
    }
  };

  const isProvided = (val?: string) => val && val.trim() !== '' && val !== 'Not provided';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs" id="lead-qualification-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide" id="qualification-heading">
            Lead Qualification Intelligence
          </h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Grid of Key Discovery Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" id="qualification-grid">
        {/* Budget */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-3" id="qual-budget">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Discovered Budget
            </div>
            <div className={`text-sm font-semibold mt-0.5 truncate ${isProvided(qualification.budget) ? 'text-emerald-700 font-mono font-bold' : 'text-slate-400'}`}>
              {qualification.budget || 'Not provided'}
            </div>
          </div>
        </div>

        {/* Products Description */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-3" id="qual-products">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Package className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Products to Sell
            </div>
            <div className={`text-sm font-medium mt-0.5 line-clamp-2 ${isProvided(qualification.products) ? 'text-slate-900' : 'text-slate-400'}`}>
              {qualification.products || 'Not provided'}
            </div>
          </div>
        </div>

        {/* Product Count / SKU */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-3" id="qual-product-count">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Number of Products (SKUs)
            </div>
            <div className={`text-sm font-semibold mt-0.5 truncate ${isProvided(qualification.productCount) ? 'text-slate-900 font-mono' : 'text-slate-400'}`}>
              {qualification.productCount || 'Not provided'}
            </div>
          </div>
        </div>

        {/* Desired Timeline */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-3" id="qual-timeline">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Desired Timeline
            </div>
            <div className={`text-sm font-semibold mt-0.5 truncate ${isProvided(qualification.timeline) ? 'text-slate-900' : 'text-slate-400'}`}>
              {qualification.timeline || 'Not provided'}
            </div>
          </div>
        </div>
      </div>

      {/* Required Website Features */}
      <div className="mt-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg" id="qual-features">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Required Website Features
          </span>
        </div>
        {qualification.features && qualification.features.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {qualification.features.map((feat, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-md"
              >
                {feat}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400">Not provided / Awaiting feature discovery during dialogue</div>
        )}
      </div>

      {/* Meta Assessment Row (Buying Intent, Barrier, Decision Maker) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5">
        {/* Buying Intent */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">
            Buying Intent
          </span>
          <div>{getIntentBadge()}</div>
        </div>

        {/* Barrier */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>Perceived Barrier</span>
          </div>
          <div className="text-xs text-slate-800 truncate font-medium">
            {qualification.barrier || 'None'}
          </div>
        </div>

        {/* Decision Maker */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>Decision Maker</span>
          </div>
          <div className="text-xs text-slate-800 font-medium">
            {qualification.decisionMaker === 'Known' ? (
              <span className="text-emerald-700 font-semibold">Known (Owner / Partner)</span>
            ) : (
              <span className="text-slate-400">Unknown / Unconfirmed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

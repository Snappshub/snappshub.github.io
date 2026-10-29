import React, { useState } from 'react';
import { Plus, BadgeDollarSign, Eye, EyeOff, CheckCircle2, PauseCircle, Code, Edit2, Trash2, Copy } from 'lucide-react';
import { AdPlacement, SiteSettings } from '../../types';

interface AdsEarningsTabProps {
  adPlacements: AdPlacement[];
  settings: SiteSettings;
  onOpenAddAd: () => void;
  onOpenEditAd: (ad: AdPlacement) => void;
  onDeleteAd: (adId: string) => void;
  onToggleAdStatus: (adId: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const AdsEarningsTab: React.FC<AdsEarningsTabProps> = ({
  adPlacements,
  settings,
  onOpenAddAd,
  onOpenEditAd,
  onDeleteAd,
  onToggleAdStatus,
  showToast
}) => {
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);

  const totalImpressions = adPlacements.reduce((sum, a) => sum + a.impressionsToday, 0);
  const totalClicks = adPlacements.reduce((sum, a) => sum + a.clicksToday, 0);
  const activeCount = adPlacements.filter((a) => a.status === 'active').length;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('success', 'Code Copied', 'Ad script snippet copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold font-mono text-emerald-600 uppercase tracking-widest">Revenue Engine</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">Ads Placement & Code Injector</h2>
          <p className="text-xs text-slate-500">
            Inject Google AdSense, Adsterra, or Monetag tags with specific placement slots
          </p>
        </div>
        <button
          onClick={onOpenAddAd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ad Placement</span>
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Revenue</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums block mt-1">
            ${settings.totalEarnings.toFixed(2)}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">All Networks</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Today's Impressions</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums block mt-1">
            {totalImpressions.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Active views</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Clicks</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums block mt-1">
            {totalClicks.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">CTR ~ 3.4%</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Active Slots</span>
          <span className="text-xl font-extrabold text-emerald-600 font-mono tabular-nums block mt-1">
            {activeCount} / {adPlacements.length}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Displaying</span>
        </div>
      </div>

      {/* Ad Placements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adPlacements.map((ad) => {
          const isExpanded = expandedCodeId === ad.id;
          return (
            <div
              key={ad.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition ${
                ad.status === 'active' ? 'border-slate-200/80' : 'border-slate-200 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">{ad.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {ad.network}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Slot: {ad.slotType}</p>
                </div>

                <button
                  onClick={() => onToggleAdStatus(ad.id)}
                  className={`inline-flex items-center space-x-1 text-xs font-semibold px-2 py-1 rounded-lg transition cursor-pointer ${
                    ad.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {ad.status === 'active' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Paused</span>
                    </>
                  )}
                </button>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Views</span>
                  <span className="font-mono font-bold text-slate-800">{ad.impressionsToday.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Clicks</span>
                  <span className="font-mono font-bold text-slate-800">{ad.clicksToday}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Earnings</span>
                  <span className="font-mono font-bold text-emerald-600">${ad.estimatedEarnings.toFixed(2)}</span>
                </div>
              </div>

              {/* Code Snippet Drawer */}
              {isExpanded && (
                <div className="p-3 bg-slate-900 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">Injected Script:</span>
                    <button
                      onClick={() => copyCode(ad.adCode)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-32">
                    {ad.adCode}
                  </pre>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setExpandedCodeId(isExpanded ? null : ad.id)}
                  className="text-xs text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer font-medium"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{isExpanded ? 'Hide Script' : 'View Injected Script'}</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onOpenEditAd(ad)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    title="Edit Placement"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteAd(ad.id)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Placement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

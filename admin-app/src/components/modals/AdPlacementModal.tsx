import React, { useState, useEffect } from 'react';
import { X, Save, BadgeDollarSign } from 'lucide-react';
import { AdPlacement } from '../../types';

interface AdPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ad: AdPlacement) => void;
  editingAd: AdPlacement | null;
}

export const AdPlacementModal: React.FC<AdPlacementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAd
}) => {
  const [formData, setFormData] = useState<Partial<AdPlacement>>({
    name: '',
    network: 'Adsterra',
    slotType: 'Header Leaderboard',
    status: 'active',
    adCode: '',
    impressionsToday: 0,
    clicksToday: 0,
    estimatedEarnings: 0
  });

  useEffect(() => {
    if (editingAd) {
      setFormData(editingAd);
    } else {
      setFormData({
        name: '',
        network: 'AdSense',
        slotType: 'Header Leaderboard',
        status: 'active',
        adCode: '<!-- Insert Script Tag or iframe here -->\n<script type="text/javascript"></script>',
        impressionsToday: 0,
        clicksToday: 0,
        estimatedEarnings: 0
      });
    }
  }, [editingAd, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const ad: AdPlacement = {
      id: editingAd?.id || `ad-${Date.now()}`,
      name: formData.name.trim(),
      network: formData.network || 'AdSense',
      slotType: formData.slotType || 'Header Leaderboard',
      status: formData.status || 'active',
      adCode: formData.adCode || '',
      impressionsToday: Number(formData.impressionsToday) || 0,
      clicksToday: Number(formData.clicksToday) || 0,
      estimatedEarnings: Number(formData.estimatedEarnings) || 0
    };

    onSave(ad);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingAd ? 'Edit Ad Placement' : 'New Ad Placement & Script Injector'}
              </h3>
              <p className="text-xs text-slate-500">Inject monetization tags & banners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Placement Label *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Header Leaderboard 728x90"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ad Network</label>
              <select
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="AdSense">Google AdSense</option>
                <option value="Adsterra">Adsterra</option>
                <option value="Monetag">Monetag</option>
                <option value="PropellerAds">PropellerAds</option>
                <option value="Custom">Custom HTML / Direct Sponsor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slot Position</label>
              <select
                value={formData.slotType}
                onChange={(e) => setFormData({ ...formData, slotType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="Header Leaderboard">Header Leaderboard</option>
                <option value="In-Feed Native">In-Feed Native</option>
                <option value="Download Interstitial">Download Interstitial</option>
                <option value="Sticky Bottom">Sticky Bottom</option>
                <option value="Social Bar">Social Bar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Raw Ad Code / Script Injector</label>
            <textarea
              rows={4}
              required
              value={formData.adCode || ''}
              onChange={(e) => setFormData({ ...formData, adCode: e.target.value })}
              placeholder="<!-- Paste your AdSense ins tag or JS snippet here -->"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-semibold text-slate-700">Placement Active Status</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ad-status-toggle"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'paused' })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="ad-status-toggle" className="text-xs text-slate-600 cursor-pointer">
                {formData.status === 'active' ? 'Active (Displaying)' : 'Paused (Hidden)'}
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingAd ? 'Save Changes' : 'Inject Ad Slot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

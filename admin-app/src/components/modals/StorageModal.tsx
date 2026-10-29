import React, { useState, useEffect } from 'react';
import { X, Save, HardDrive } from 'lucide-react';
import { StorageProvider } from '../../types';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: StorageProvider) => void;
  editingProvider: StorageProvider | null;
}

export const StorageModal: React.FC<StorageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProvider
}) => {
  const [formData, setFormData] = useState<Partial<StorageProvider>>({
    name: '',
    type: 'telegram',
    capacity: 'Unlimited',
    used: '0 MB',
    isDefault: false,
    status: 'online',
    channelId: '@snappshub',
    botToken: '',
    folderUrl: '',
    notes: ''
  });

  useEffect(() => {
    if (editingProvider) {
      setFormData(editingProvider);
    } else {
      setFormData({
        name: '',
        type: 'telegram',
        capacity: 'Unlimited',
        used: '0 MB',
        isDefault: false,
        status: 'online',
        channelId: '@snappshub',
        botToken: '',
        folderUrl: '',
        notes: ''
      });
    }
  }, [editingProvider, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const provider: StorageProvider = {
      id: editingProvider?.id || `sp-${Date.now()}`,
      name: formData.name.trim(),
      type: formData.type || 'telegram',
      capacity: formData.capacity?.trim() || 'Unlimited',
      used: formData.used?.trim() || '0 MB',
      isDefault: Boolean(formData.isDefault),
      status: formData.status || 'online',
      channelId: formData.channelId?.trim() || '',
      botToken: formData.botToken?.trim() || '',
      folderUrl: formData.folderUrl?.trim() || '',
      notes: formData.notes?.trim() || ''
    };

    onSave(provider);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingProvider ? 'Edit Storage Provider' : 'Add Storage Provider'}
              </h3>
              <p className="text-xs text-slate-500">Configure cloud storage mirror endpoints</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Display Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Telegram Channel Cloud"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="telegram">Telegram Channel</option>
                <option value="gdrive">Google Drive</option>
                <option value="mediafire">MediaFire</option>
                <option value="mega">Mega.nz</option>
                <option value="github">GitHub Releases</option>
                <option value="direct">Direct VPS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Capacity</label>
              <input
                type="text"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="Unlimited, 15 GB, etc."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            {formData.type === 'telegram' ? (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Channel Username / ID</label>
                  <input
                    type="text"
                    value={formData.channelId || ''}
                    onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                    placeholder="@snappshub"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bot Token (Optional)</label>
                  <input
                    type="text"
                    value={formData.botToken || ''}
                    onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                    placeholder="8887180459:AAEvG4..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Endpoint / Folder URL</label>
                <input
                  type="url"
                  value={formData.folderUrl || ''}
                  onChange={(e) => setFormData({ ...formData, folderUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Description</label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Usage guidelines, mirror priority, or bandwidth limits..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2 flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="default-drive-check"
                checked={Boolean(formData.isDefault)}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="default-drive-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Set as Default Primary Drive for new APK uploads
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
              <span>{editingProvider ? 'Update Provider' : 'Add Provider'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

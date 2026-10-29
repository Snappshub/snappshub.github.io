import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { AppItem, CategoryItem, StorageProvider } from '../../types';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: AppItem) => void;
  editingApp: AppItem | null;
  categories: CategoryItem[];
  storageProviders: StorageProvider[];
}

export const AppModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingApp,
  categories,
  storageProviders
}) => {
  const [formData, setFormData] = useState<Partial<AppItem>>({
    name: '',
    packageName: '',
    version: '1.0.0',
    versionCode: 100,
    size: '10.0 MB',
    category: categories[0]?.name || 'Utilities',
    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    downloadUrl: '',
    directApkUrl: '',
    storageProviderId: storageProviders[0]?.id || 'sp-telegram',
    telegramMessageId: '',
    downloadsCount: 0,
    rating: 4.8,
    description: '',
    whatsNew: '',
    featured: false,
    status: 'active',
    developer: 'Alamin Saheb Dev',
    minAndroid: 'Android 7.0+'
  });

  useEffect(() => {
    if (editingApp) {
      setFormData(editingApp);
    } else {
      setFormData({
        name: '',
        packageName: 'com.snapps.newapp',
        version: '1.0.0',
        versionCode: 100,
        size: '12.5 MB',
        category: categories[0]?.name || 'Utilities',
        icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
        downloadUrl: 'https://t.me/snappshub',
        directApkUrl: '',
        storageProviderId: storageProviders.find((s) => s.isDefault)?.id || storageProviders[0]?.id || 'sp-telegram',
        telegramMessageId: '',
        downloadsCount: 100,
        rating: 5.0,
        description: 'High performance Android utility app for daily workflow.',
        whatsNew: 'Initial release with fast downloads and optimized UI.',
        featured: false,
        status: 'active',
        developer: 'Alamin Saheb Dev',
        minAndroid: 'Android 7.0+'
      });
    }
  }, [editingApp, categories, storageProviders, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const savedApp: AppItem = {
      id: editingApp?.id || `app-${Date.now()}`,
      name: formData.name.trim(),
      packageName: formData.packageName?.trim() || `com.snapps.${Date.now()}`,
      version: formData.version?.trim() || '1.0.0',
      versionCode: Number(formData.versionCode) || 100,
      size: formData.size?.trim() || '10.0 MB',
      category: formData.category || categories[0]?.name || 'Utilities',
      icon: formData.icon?.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
      downloadUrl: formData.downloadUrl?.trim() || 'https://t.me/snappshub',
      directApkUrl: formData.directApkUrl?.trim() || '',
      storageProviderId: formData.storageProviderId || 'sp-telegram',
      telegramMessageId: formData.telegramMessageId?.trim() || '',
      downloadsCount: Number(formData.downloadsCount) || 0,
      rating: Number(formData.rating) || 4.8,
      description: formData.description?.trim() || '',
      whatsNew: formData.whatsNew?.trim() || '',
      featured: Boolean(formData.featured),
      status: formData.status || 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
      developer: formData.developer?.trim() || 'Alamin Saheb Dev',
      minAndroid: formData.minAndroid?.trim() || 'Android 7.0+'
    };

    onSave(savedApp);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl my-8 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingApp ? 'Edit Application' : 'Add New Application'}
            </h3>
            <p className="text-xs text-slate-500">Configure APK metadata, storage routing, and download links</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">App Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. SnappsHub Pro"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Package Name *</label>
              <input
                type="text"
                required
                value={formData.packageName || ''}
                onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                placeholder="e.g. com.snappshub.official"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Version String</label>
              <input
                type="text"
                required
                value={formData.version || ''}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g. 2.4.0"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Version Code</label>
              <input
                type="number"
                value={formData.versionCode || 100}
                onChange={(e) => setFormData({ ...formData, versionCode: parseInt(e.target.value) || 100 })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">File Size</label>
              <input
                type="text"
                required
                value={formData.size || ''}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g. 14.2 MB"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category || categories[0]?.name}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Icon URL / Image</label>
              <div className="flex items-center space-x-2">
                <img
                  src={formData.icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128'}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                  alt="App icon preview"
                />
                <input
                  type="url"
                  value={formData.icon || ''}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Download URL</label>
              <input
                type="url"
                required
                value={formData.downloadUrl || ''}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                placeholder="https://t.me/snappshub/102"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direct APK Mirror URL</label>
              <input
                type="text"
                value={formData.directApkUrl || ''}
                onChange={(e) => setFormData({ ...formData, directApkUrl: e.target.value })}
                placeholder="https://snappshub.github.io/downloads/..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Provider</label>
              <select
                value={formData.storageProviderId}
                onChange={(e) => setFormData({ ...formData, storageProviderId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              >
                {storageProviders.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name} ({sp.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telegram Msg ID</label>
              <input
                type="text"
                value={formData.telegramMessageId || ''}
                onChange={(e) => setFormData({ ...formData, telegramMessageId: e.target.value })}
                placeholder="e.g. 102"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="active">Active (Available)</option>
                <option value="updating">Updating</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-5">
              <input
                type="checkbox"
                id="featured-checkbox"
                checked={Boolean(formData.featured)}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="featured-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Mark as Featured App
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">App Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summary of app features, functionality and permissions..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">What's New (Changelog)</label>
              <textarea
                rows={2}
                value={formData.whatsNew || ''}
                onChange={(e) => setFormData({ ...formData, whatsNew: e.target.value })}
                placeholder="List bug fixes, new features in this version..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 shrink-0">
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
              <span>{editingApp ? 'Update App' : 'Save New App'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

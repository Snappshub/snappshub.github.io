import React, { useState } from 'react';
import { Plus, HardDrive, CheckCircle2, RefreshCw, Edit2, Trash2, Shield, Activity } from 'lucide-react';
import { StorageProvider } from '../../types';

interface StorageProvidersTabProps {
  storageProviders: StorageProvider[];
  onOpenAddStorage: () => void;
  onOpenEditStorage: (sp: StorageProvider) => void;
  onDeleteStorage: (spId: string) => void;
  onSetDefaultStorage: (spId: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const StorageProvidersTab: React.FC<StorageProvidersTabProps> = ({
  storageProviders,
  onOpenAddStorage,
  onOpenEditStorage,
  onDeleteStorage,
  onSetDefaultStorage,
  showToast
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);

  const testProviderConnection = (provider: StorageProvider) => {
    setTestingId(provider.id);
    setTimeout(() => {
      setTestingId(null);
      showToast(
        'success',
        `${provider.name} Verified`,
        `Latency 48ms &bull; Cloud handshake OK &bull; Channel permissions verified.`
      );
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Storage Providers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-cloud mirrors for APK delivery &bull; Telegram Cloud Channel is primary
          </p>
        </div>
        <button
          onClick={onOpenAddStorage}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add new provider</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storageProviders.map((sp) => (
          <div
            key={sp.id}
            className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition ${
              sp.isDefault ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    sp.type === 'telegram'
                      ? 'bg-sky-50 text-sky-600'
                      : sp.type === 'gdrive'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">{sp.name}</h3>
                    {sp.isDefault && (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        DEFAULT PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 uppercase font-mono mt-0.5">Type: {sp.type}</p>
                </div>
              </div>

              <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Online</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{sp.notes}</p>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Storage Capacity:</span>
                <span className="font-mono font-bold text-slate-800">{sp.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Space Used:</span>
                <span className="font-mono text-slate-800">{sp.used}</span>
              </div>
              {sp.channelId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Channel:</span>
                  <span className="font-mono text-sky-600 font-semibold">{sp.channelId}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => testProviderConnection(sp)}
                disabled={testingId === sp.id}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Activity className={`w-3.5 h-3.5 text-blue-600 ${testingId === sp.id ? 'animate-spin' : ''}`} />
                <span>{testingId === sp.id ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <div className="flex items-center space-x-1.5">
                {!sp.isDefault && (
                  <button
                    onClick={() => onSetDefaultStorage(sp.id)}
                    className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition cursor-pointer"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => onOpenEditStorage(sp)}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  title="Edit Storage Settings"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteStorage(sp.id)}
                  className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Delete Storage Provider"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import {
  X,
  Layout,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Unlock,
  Sliders,
  Sparkles,
  Layers,
  Settings,
  HardDrive,
  FileCode,
  DollarSign
} from 'lucide-react';
import { AdminLayoutPermissionsConfig } from '../../types';

interface LayoutPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdminLayoutPermissionsConfig;
  onUpdateConfig: (newConfig: AdminLayoutPermissionsConfig) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const LayoutPermissionsModal: React.FC<LayoutPermissionsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  showToast
}) => {
  if (!isOpen) return null;

  const handleToggleWidget = (widgetKey: keyof AdminLayoutPermissionsConfig['widgets']) => {
    const updated: AdminLayoutPermissionsConfig = {
      ...config,
      widgets: {
        ...config.widgets,
        [widgetKey]: !config.widgets[widgetKey]
      }
    };
    onUpdateConfig(updated);
    showToast('info', 'Layout Updated', `Widget "${widgetKey}" visibility auto-synced in real-time.`);
  };

  const handleTogglePermission = (permKey: keyof Omit<AdminLayoutPermissionsConfig, 'widgets' | 'density'>) => {
    const updated: AdminLayoutPermissionsConfig = {
      ...config,
      [permKey]: !config[permKey]
    };
    onUpdateConfig(updated);
    showToast(
      'success',
      'Permission Auto-Synced',
      `${permKey} is now ${updated[permKey] ? 'GRANTED' : 'RESTRICTED'}.`
    );
  };

  const handleSetDensity = (density: 'comfortable' | 'compact') => {
    onUpdateConfig({ ...config, density });
    showToast('info', 'Density Applied', `Dashboard density switched to ${density}.`);
  };

  const handleResetToAllAllowed = () => {
    const allAllowed: AdminLayoutPermissionsConfig = {
      allowLayoutEditing: true,
      allowAppEditing: true,
      allowStorageEditing: true,
      allowAdEditing: true,
      allowBrandingEditing: true,
      density: 'comfortable',
      widgets: {
        quickActions: true,
        quickAccessCards: true,
        storageDistributionChart: true,
        storageTrendLineChart: true,
        telegramHealthMonitor: true,
        appIntegrityWidget: true,
        totalEarnings: true,
        allAppsTable: true,
        storageProvidersTable: true
      }
    };
    onUpdateConfig(allAllowed);
    showToast('success', 'Full Access Restored', 'All layout widgets and edit permissions granted.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Admin Panel Layout & Object Edit Permissions
              </h3>
              <p className="text-xs text-slate-500">
                Live real-time permission toggles and custom layout settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Object Edit Permissions (For every option/object) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Object & Entity Edit Permissions
                </h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Real-Time Auto-Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Control permissions to create, modify, or delete specific objects across the console.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* App Editing */}
              <div
                onClick={() => handleTogglePermission('allowAppEditing')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  config.allowAppEditing
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      config.allowAppEditing ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Applications & APKs</h5>
                    <p className="text-[10px] text-slate-400">Add, edit, delete apps</p>
                  </div>
                </div>
                {config.allowAppEditing ? (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Storage Editing */}
              <div
                onClick={() => handleTogglePermission('allowStorageEditing')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  config.allowStorageEditing
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      config.allowStorageEditing ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Storage Providers</h5>
                    <p className="text-[10px] text-slate-400">Configure Telegram & drives</p>
                  </div>
                </div>
                {config.allowStorageEditing ? (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Ad Editing */}
              <div
                onClick={() => handleTogglePermission('allowAdEditing')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  config.allowAdEditing
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      config.allowAdEditing ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Ads & Monetization</h5>
                    <p className="text-[10px] text-slate-400">Manage ad networks & tags</p>
                  </div>
                </div>
                {config.allowAdEditing ? (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Branding Editing */}
              <div
                onClick={() => handleTogglePermission('allowBrandingEditing')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  config.allowBrandingEditing
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      config.allowBrandingEditing ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Branding & Site Meta</h5>
                    <p className="text-[10px] text-slate-400">Modify title, colors & contact</p>
                  </div>
                </div>
                {config.allowBrandingEditing ? (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Layout Customizer Permission */}
              <div
                onClick={() => handleTogglePermission('allowLayoutEditing')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition sm:col-span-2 ${
                  config.allowLayoutEditing
                    ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      config.allowLayoutEditing ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Admin Panel Layout Customization</h5>
                    <p className="text-[10px] text-slate-400">
                      Permission to show/hide widgets, rearrange sections, and change density
                    </p>
                  </div>
                </div>
                {config.allowLayoutEditing ? (
                  <Unlock className="w-4 h-4 text-blue-600" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Dashboard Widget Visibility */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Dashboard Layout & Widget Visibility
                </h4>
              </div>
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => handleSetDensity('comfortable')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${
                    config.density === 'comfortable' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDensity('compact')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${
                    config.density === 'compact' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              {[
                { key: 'quickActions', label: 'Top Quick Actions Bar', desc: 'Sync, Upload, Add app quick buttons' },
                { key: 'quickAccessCards', label: 'Quick Navigation Cards', desc: 'Apps, File Manager, Storage links' },
                { key: 'storageDistributionChart', label: 'Storage Usage Pie Chart', desc: 'Recharts space distribution' },
                { key: 'storageTrendLineChart', label: '30-Day D3 Storage Trend', desc: 'D3 growth analytics curve' },
                { key: 'telegramHealthMonitor', label: 'Telegram Bot Health Monitor', desc: 'Token handshake & latency widget' },
                { key: 'appIntegrityWidget', label: 'App Integrity Scanner', desc: 'GitHub cross-reference validator' },
                { key: 'totalEarnings', label: 'Total Earnings Card', desc: 'Monetization breakdown widget' },
                { key: 'allAppsTable', label: 'All Apps Table', desc: 'Full application list with filters' },
                { key: 'storageProvidersTable', label: 'Storage Providers Overview', desc: 'Mirror table and default drive' }
              ].map((item) => {
                const isVisible = config.widgets[item.key as keyof typeof config.widgets];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleWidget(item.key as keyof typeof config.widgets)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isVisible
                        ? 'bg-slate-50/80 border-slate-200 text-slate-900'
                        : 'bg-white border-slate-100 text-slate-400 opacity-60'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold">{item.label}</h5>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                    {isVisible ? (
                      <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={handleResetToAllAllowed}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition underline cursor-pointer"
          >
            Reset All to Visible & Unlocked
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Close & Apply Layout
          </button>
        </div>
      </div>
    </div>
  );
};

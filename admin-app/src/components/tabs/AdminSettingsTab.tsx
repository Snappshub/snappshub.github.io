import React, { useState } from 'react';
import {
  SlidersHorizontal,
  BellRing,
  Download,
  UploadCloud,
  RefreshCw,
  Database,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  Layers,
  Zap,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardDrive,
  FileCode,
  DollarSign,
  Palette,
  Layout
} from 'lucide-react';
import {
  SiteSettings,
  AppItem,
  CategoryItem,
  StorageProvider,
  AdPlacement,
  UploadedFile,
  BackupScheduleConfig,
  AdminLayoutPermissionsConfig
} from '../../types';
import { TabKey } from '../Sidebar';

interface AdminSettingsTabProps {
  settings: SiteSettings;
  apps: AppItem[];
  categories: CategoryItem[];
  storageProviders: StorageProvider[];
  adPlacements: AdPlacement[];
  files?: UploadedFile[];
  backupSchedule: BackupScheduleConfig;
  onUpdateBackupSchedule: (newSchedule: BackupScheduleConfig) => void;
  layoutConfig: AdminLayoutPermissionsConfig;
  onUpdateLayoutConfig: (newConfig: AdminLayoutPermissionsConfig) => void;
  onRestoreAllData: (data: {
    apps: AppItem[];
    categories: CategoryItem[];
    settings: SiteSettings;
    storageProviders: StorageProvider[];
    adPlacements: AdPlacement[];
    files?: UploadedFile[];
    adminUser?: string;
  }) => void;
  onResetToDefaults: () => void;
  currentUsername: string;
  onUpdateCredentials: (newUser: string, newPass: string) => void;
  onSwitchTab?: (tab: TabKey) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  lastAutoSyncedTime?: string;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  apps,
  categories,
  storageProviders,
  adPlacements,
  files = [],
  backupSchedule,
  onUpdateBackupSchedule,
  layoutConfig,
  onUpdateLayoutConfig,
  onRestoreAllData,
  onResetToDefaults,
  currentUsername,
  onUpdateCredentials,
  onSwitchTab,
  showToast,
  lastAutoSyncedTime = 'Just now'
}) => {
  const [newAdminUser, setNewAdminUser] = useState(currentUsername);
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');

  const calculateNextBackupDate = (interval: BackupScheduleConfig['interval']): string => {
    const d = new Date();
    if (interval === 'daily') d.setDate(d.getDate() + 1);
    else if (interval === 'weekly') d.setDate(d.getDate() + 7);
    else if (interval === 'biweekly') d.setDate(d.getDate() + 14);
    else if (interval === 'monthly') d.setMonth(d.getMonth() + 1);
    return d.toISOString().replace('T', ' ').substring(0, 19);
  };

  const handleDownloadBackup = () => {
    try {
      const rawDump: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key);
          try {
            rawDump[key] = JSON.parse(val || 'null');
          } catch {
            rawDump[key] = val;
          }
        }
      }

      const payload = {
        meta: {
          app: 'SnappsHub Super Admin Command Center',
          version: '2.4.0',
          exportedAt: new Date().toISOString(),
          format: 'snappshub-full-localstorage-snapshot',
          stats: {
            appsCount: apps.length,
            categoriesCount: categories.length,
            storageCount: storageProviders.length,
            adsCount: adPlacements.length,
            filesCount: files.length
          }
        },
        localStorageKeys: rawDump,
        appState: {
          apps,
          categories,
          storageProviders,
          adPlacements,
          settings,
          files,
          adminUser: currentUsername,
          backupSchedule,
          layoutConfig
        }
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snappshub-admin-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const nextDate = calculateNextBackupDate(backupSchedule.interval);
      onUpdateBackupSchedule({
        ...backupSchedule,
        lastBackupDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        nextBackupDate: nextDate
      });

      showToast(
        'success',
        'Backup Downloaded',
        `Full JSON snapshot saved (${(jsonStr.length / 1024).toFixed(1)} KB).`
      );
    } catch (err: any) {
      showToast('error', 'Backup Failed', err.message || 'Could not export backup.');
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let restoredApps: AppItem[] = apps;
        let restoredCategories: CategoryItem[] = categories;
        let restoredSettings: SiteSettings = settings;
        let restoredStorage: StorageProvider[] = storageProviders;
        let restoredAds: AdPlacement[] = adPlacements;
        let restoredFiles: UploadedFile[] = files;
        let restoredUser: string = currentUsername;

        if (parsed.appState) {
          restoredApps = parsed.appState.apps || apps;
          restoredCategories = parsed.appState.categories || categories;
          restoredSettings = parsed.appState.settings || settings;
          restoredStorage = parsed.appState.storageProviders || storageProviders;
          restoredAds = parsed.appState.adPlacements || adPlacements;
          restoredFiles = parsed.appState.files || files;
          restoredUser = parsed.appState.adminUser || currentUsername;
          if (parsed.appState.backupSchedule) onUpdateBackupSchedule(parsed.appState.backupSchedule);
          if (parsed.appState.layoutConfig) onUpdateLayoutConfig(parsed.appState.layoutConfig);
        } else if (parsed.apps && parsed.categories) {
          restoredApps = parsed.apps;
          restoredCategories = parsed.categories;
          restoredSettings = parsed.settings || settings;
        }

        onRestoreAllData({
          apps: restoredApps,
          categories: restoredCategories,
          settings: restoredSettings,
          storageProviders: restoredStorage,
          adPlacements: restoredAds,
          files: restoredFiles,
          adminUser: restoredUser
        });

        setNewAdminUser(restoredUser);
        showToast(
          'success',
          'Restore Complete',
          `Restored ${restoredApps.length} apps and full command center state.`
        );
      } catch (err: any) {
        showToast('error', 'Restore Failed', err.message || 'Corrupt JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUser.trim()) {
      showToast('warning', 'Username Required', 'Please enter a valid admin username.');
      return;
    }
    if (newAdminPass.length < 6) {
      showToast('warning', 'Weak Password', 'New password must be at least 6 characters.');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      showToast('error', 'Mismatch', 'Passwords do not match.');
      return;
    }

    onUpdateCredentials(newAdminUser.trim(), newAdminPass);
    setNewAdminPass('');
    setConfirmAdminPass('');
    showToast('success', 'Credentials Saved', 'Master login credentials updated.');
  };

  const handleTogglePerm = (perm: keyof Omit<AdminLayoutPermissionsConfig, 'widgets' | 'density'>) => {
    const updated = {
      ...layoutConfig,
      [perm]: !layoutConfig[perm]
    };
    onUpdateLayoutConfig(updated);
    showToast(
      'info',
      'Permission Auto-Synced',
      `${perm} is now ${updated[perm] ? 'GRANTED' : 'RESTRICTED'}.`
    );
  };

  const handleToggleWidget = (widgetKey: keyof AdminLayoutPermissionsConfig['widgets']) => {
    const updated = {
      ...layoutConfig,
      widgets: {
        ...layoutConfig.widgets,
        [widgetKey]: !layoutConfig.widgets[widgetKey]
      }
    };
    onUpdateLayoutConfig(updated);
  };

  const isBackupDue = new Date().getTime() >= new Date(backupSchedule.nextBackupDate).getTime();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Panel Settings</h2>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>CONSOLE SECURITY & LAYOUT</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin console configuration, layout customization, edit permissions, recurring backups & credentials
          </p>
        </div>

        {onSwitchTab && (
          <button
            onClick={() => onSwitchTab('website_settings')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer border border-slate-200 self-start sm:self-auto"
          >
            <span>Go to Website Settings</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Real-time Auto-Sync Engine Card */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 shadow-xs border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Live Real-Time Auto-Sync Engine Active
              </h4>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.2 rounded border border-emerald-700/60">
                NO MANUAL SYNC REQUIRED
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5 leading-relaxed">
              Every admin option, layout adjustment, permission lock, and settings change is saved automatically in
              real-time. You never have to manually sync.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-emerald-300/70 block">Auto-Synced</span>
            <span className="font-mono text-white font-bold">{lastAutoSyncedTime}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 animate-pulse" />
        </div>
      </div>

      {/* 1. RECURRING REMINDER FOR JSON BACKUP DOWNLOAD */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Recurring Backup Reminder & Interval
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isBackupDue
                      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isBackupDue ? 'BACKUP DUE NOW' : 'UP TO DATE'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Set automated reminders or background downloads of full local storage JSON backups
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadBackup}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Backup Now</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-1">
          {/* Interval */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl space-y-1.5">
            <label className="block font-bold text-slate-700 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Backup Frequency</span>
            </label>
            <select
              value={backupSchedule.interval}
              onChange={(e) => {
                const interval = e.target.value as BackupScheduleConfig['interval'];
                const nextDate = calculateNextBackupDate(interval);
                onUpdateBackupSchedule({
                  ...backupSchedule,
                  interval,
                  nextBackupDate: nextDate
                });
                showToast('info', 'Schedule Updated', `Recurring interval set to ${interval}.`);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="daily">Daily (Every 24 Hours)</option>
              <option value="weekly">Weekly (Every 7 Days)</option>
              <option value="biweekly">Bi-Weekly (Every 14 Days)</option>
              <option value="monthly">Monthly (Every 30 Days)</option>
            </select>
          </div>

          {/* Toggle Reminder Switch */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-700 block">Enable Reminder</span>
              <span className="text-[10px] text-slate-400">Notifies when backup is due</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupSchedule.enabled}
                onChange={(e) => {
                  onUpdateBackupSchedule({ ...backupSchedule, enabled: e.target.checked });
                  showToast('info', 'Reminder Status', `Reminder ${e.target.checked ? 'Active' : 'Muted'}.`);
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-2 text-xs font-semibold text-slate-700">
                {backupSchedule.enabled ? 'Active' : 'Disabled'}
              </span>
            </label>
          </div>

          {/* Auto-Download on Due */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-700 block">Auto-Download When Due</span>
              <span className="text-[10px] text-slate-400">Instant background JSON trigger</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupSchedule.autoDownloadOnDue}
                onChange={(e) => {
                  onUpdateBackupSchedule({ ...backupSchedule, autoDownloadOnDue: e.target.checked });
                  showToast(
                    'info',
                    'Auto-Download',
                    `Auto-download ${e.target.checked ? 'Enabled' : 'Disabled'}.`
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-2 text-xs font-semibold text-slate-700">
                {backupSchedule.autoDownloadOnDue ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Last backup: <strong className="text-slate-900">{backupSchedule.lastBackupDate || 'Never'}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-600">Next scheduled due date: <strong className="text-emerald-700">{backupSchedule.nextBackupDate || 'Pending'}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. ADMIN PANEL LAYOUT & OBJECT EDIT PERMISSIONS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Layout Customization & Edit Permissions
                </h3>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Live Synced
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Permissions to edit every option & object, plus dashboard widget layout visibility
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onUpdateLayoutConfig({
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
              });
              showToast('success', 'Full Permissions Restored', 'All objects unlocked and widgets visible.');
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto"
          >
            Unlock All & Reset
          </button>
        </div>

        {/* Object Edit Permissions */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Object Edit Permissions</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Apps */}
            <div
              onClick={() => handleTogglePerm('allowAppEditing')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                layoutConfig.allowAppEditing
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                <div>
                  <span className="font-bold block">Apps Edit Permission</span>
                  <span className="text-[10px] text-slate-400">Add, edit, delete APKs</span>
                </div>
              </div>
              {layoutConfig.allowAppEditing ? (
                <Unlock className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {/* Storage */}
            <div
              onClick={() => handleTogglePerm('allowStorageEditing')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                layoutConfig.allowStorageEditing
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                <div>
                  <span className="font-bold block">Storage Edit Permission</span>
                  <span className="text-[10px] text-slate-400">Configure drives & Telegram</span>
                </div>
              </div>
              {layoutConfig.allowStorageEditing ? (
                <Unlock className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {/* Ads */}
            <div
              onClick={() => handleTogglePerm('allowAdEditing')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                layoutConfig.allowAdEditing
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <div>
                  <span className="font-bold block">Ads Edit Permission</span>
                  <span className="text-[10px] text-slate-400">Scripts & monetization</span>
                </div>
              </div>
              {layoutConfig.allowAdEditing ? (
                <Unlock className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {/* Branding */}
            <div
              onClick={() => handleTogglePerm('allowBrandingEditing')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                layoutConfig.allowBrandingEditing
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Palette className="w-3.5 h-3.5 text-purple-600" />
                <div>
                  <span className="font-bold block">Branding Edit Permission</span>
                  <span className="text-[10px] text-slate-400">Site title, contacts, meta</span>
                </div>
              </div>
              {layoutConfig.allowBrandingEditing ? (
                <Unlock className="w-4 h-4 text-emerald-600" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {/* Layout Customizer Permission */}
            <div
              onClick={() => handleTogglePerm('allowLayoutEditing')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition sm:col-span-2 ${
                layoutConfig.allowLayoutEditing
                  ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Layout className="w-3.5 h-3.5 text-blue-600" />
                <div>
                  <span className="font-bold block">Layout Customization Permission</span>
                  <span className="text-[10px] text-slate-400">Modify widgets, sections & visibility</span>
                </div>
              </div>
              {layoutConfig.allowLayoutEditing ? (
                <Unlock className="w-4 h-4 text-blue-600" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Widgets Visibility */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Dashboard Widgets Visibility</span>
            </h4>
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => onUpdateLayoutConfig({ ...layoutConfig, density: 'comfortable' })}
                className={`px-2 py-0.5 rounded-md font-semibold transition ${
                  layoutConfig.density === 'comfortable' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => onUpdateLayoutConfig({ ...layoutConfig, density: 'compact' })}
                className={`px-2 py-0.5 rounded-md font-semibold transition ${
                  layoutConfig.density === 'compact' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                Compact
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { key: 'quickAccessCards', label: 'Quick Navigation' },
              { key: 'storageDistributionChart', label: 'Storage Pie Chart' },
              { key: 'storageTrendLineChart', label: '30D D3 Storage Trend' },
              { key: 'telegramHealthMonitor', label: 'Telegram Health Monitor' },
              { key: 'appIntegrityWidget', label: 'App Integrity Scanner' },
              { key: 'totalEarnings', label: 'Total Earnings Card' },
              { key: 'allAppsTable', label: 'All Apps Table' },
              { key: 'storageProvidersTable', label: 'Storage Mirrors Table' }
            ].map((w) => {
              const checked = layoutConfig.widgets[w.key as keyof typeof layoutConfig.widgets];
              return (
                <label
                  key={w.key}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    checked ? 'bg-slate-50 border-slate-200 text-slate-900 font-semibold' : 'bg-white border-slate-100 text-slate-400'
                  }`}
                >
                  <span className="truncate">{w.label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleWidget(w.key as keyof typeof layoutConfig.widgets)}
                    className="rounded text-blue-600 focus:ring-0 ml-1.5"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. LOCAL STORAGE SNAPSHOT BACKUP & RESTORE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Local Storage Backup & Instant State Restore</h3>
            <p className="text-xs text-slate-500">Download single-file JSON backup or restore entire application state</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download Local Storage Backup (.json)</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center space-x-2 cursor-pointer">
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Upload File to Restore Entire App State</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              onResetToDefaults();
              showToast('info', 'Database Reset', 'Reset to initial factory defaults.');
            }}
            className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition flex items-center space-x-2 cursor-pointer ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Factory Defaults</span>
          </button>
        </div>
      </div>

      {/* 4. MASTER ADMIN CREDENTIALS */}
      <form onSubmit={handleChangePassword} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <Lock className="w-5 h-5 text-slate-700" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Change Master Admin Credentials</h3>
            <p className="text-xs text-slate-500">Update username and master login password for this console</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
            <input
              type="text"
              required
              value={newAdminUser}
              onChange={(e) => setNewAdminUser(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (Min 6 chars) *</label>
            <input
              type="password"
              value={newAdminPass}
              onChange={(e) => setNewAdminPass(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password *</label>
            <input
              type="password"
              value={confirmAdminPass}
              onChange={(e) => setConfirmAdminPass(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Update Master Password</span>
          </button>
        </div>
      </form>
    </div>
  );
};

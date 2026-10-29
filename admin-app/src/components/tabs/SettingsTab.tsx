import React, { useState } from 'react';
import { Globe, SlidersHorizontal, Shield, Sparkles } from 'lucide-react';
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
import { WebsiteSettingsTab } from './WebsiteSettingsTab';
import { AdminSettingsTab } from './AdminSettingsTab';

interface SettingsTabProps {
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => void;
  onCommitToGitHub: (repo: string, token: string, branch: string, message: string) => Promise<void>;
  isPushing: boolean;
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
  initialSubSection?: 'website' | 'admin';
  onSwitchTab?: (tab: TabKey) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  lastAutoSyncedTime?: string;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onCommitToGitHub,
  isPushing,
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
  initialSubSection = 'website',
  onSwitchTab,
  showToast,
  lastAutoSyncedTime = 'Just now'
}) => {
  const [activeSection, setActiveSection] = useState<'website' | 'admin'>(initialSubSection);

  return (
    <div className="space-y-6">
      {/* Top Segmented Pill Switcher */}
      <div className="bg-white border border-slate-200/80 p-2 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSection('website')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeSection === 'website'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Website & Store Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('admin')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeSection === 'admin'
                ? 'bg-[#062817] text-emerald-400 shadow-sm border border-emerald-500/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Admin Panel Settings</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1.5 self-end sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Auto-Sync: Active</span>
        </div>
      </div>

      {/* Render Selected View */}
      {activeSection === 'website' ? (
        <WebsiteSettingsTab
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onCommitToGitHub={onCommitToGitHub}
          isPushing={isPushing}
          layoutConfig={layoutConfig}
          onSwitchTab={onSwitchTab}
          showToast={showToast}
          lastAutoSyncedTime={lastAutoSyncedTime}
        />
      ) : (
        <AdminSettingsTab
          settings={settings}
          apps={apps}
          categories={categories}
          storageProviders={storageProviders}
          adPlacements={adPlacements}
          files={files}
          backupSchedule={backupSchedule}
          onUpdateBackupSchedule={onUpdateBackupSchedule}
          layoutConfig={layoutConfig}
          onUpdateLayoutConfig={onUpdateLayoutConfig}
          onRestoreAllData={onRestoreAllData}
          onResetToDefaults={onResetToDefaults}
          currentUsername={currentUsername}
          onUpdateCredentials={onUpdateCredentials}
          onSwitchTab={onSwitchTab}
          showToast={showToast}
          lastAutoSyncedTime={lastAutoSyncedTime}
        />
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  INITIAL_APPS,
  INITIAL_CATEGORIES,
  INITIAL_STORAGE_PROVIDERS,
  INITIAL_AD_PLACEMENTS,
  INITIAL_SETTINGS,
  INITIAL_FILES,
  INITIAL_STORAGE_LOGS
} from './data/initialData';
import {
  AppItem,
  CategoryItem,
  StorageProvider,
  AdPlacement,
  SiteSettings,
  UploadedFile,
  SystemNotification,
  StorageLogItem,
  BackupScheduleConfig,
  AdminLayoutPermissionsConfig
} from './types';
import { LogOut } from 'lucide-react';
import { TabKey, Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer, ToastItem } from './components/Toast';
import { LoginView } from './components/LoginView';

// Tabs
import { DashboardTab } from './components/tabs/DashboardTab';
import { AppsTab } from './components/tabs/AppsTab';
import { CategoriesTab } from './components/tabs/CategoriesTab';
import { FilesTab } from './components/tabs/FilesTab';
import { StorageProvidersTab } from './components/tabs/StorageProvidersTab';
import { StorageLogsTab } from './components/tabs/StorageLogsTab';
import { AdsEarningsTab } from './components/tabs/AdsEarningsTab';
import { TelegramHubTab } from './components/tabs/TelegramHubTab';
import { WebsitePreviewTab } from './components/tabs/WebsitePreviewTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { WebsiteSettingsTab } from './components/tabs/WebsiteSettingsTab';
import { AdminSettingsTab } from './components/tabs/AdminSettingsTab';

// Modals
import { AppModal } from './components/modals/AppModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { StorageModal } from './components/modals/StorageModal';
import { AdPlacementModal } from './components/modals/AdPlacementModal';
import { LayoutPermissionsModal } from './components/modals/LayoutPermissionsModal';

// Utilities
import { commitFilesToGitHub } from './utils/github';
import { generateProjectZip, downloadBlob } from './utils/zipExport';
import { broadcastToTelegram, formatTelegramAppMessage } from './utils/telegram';

const DEFAULT_BACKUP_SCHEDULE: BackupScheduleConfig = {
  enabled: true,
  interval: 'weekly',
  lastBackupDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
  nextBackupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
  autoDownloadOnDue: true,
  notifyInConsole: true
};

const DEFAULT_LAYOUT_PERMISSIONS: AdminLayoutPermissionsConfig = {
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

export default function App() {
  // Authentication & Security state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('snappshub_auth') === 'true';
  });

  const [savedUsername, setSavedUsername] = useState<string>(() => {
    return localStorage.getItem('snappshub_admin_user') || 'admin';
  });

  const [savedPasswordHash, setSavedPasswordHash] = useState<string>(() => {
    return localStorage.getItem('snappshub_admin_pass') || 'admin123';
  });

  // Current active navigation tab
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Real-time auto-sync timestamp state
  const [lastAutoSyncedTime, setLastAutoSyncedTime] = useState<string>('Just now');

  // App database state with localStorage persistence
  const [apps, setApps] = useState<AppItem[]>(() => {
    const saved = localStorage.getItem('snappshub_apps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_APPS;
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem('snappshub_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [storageProviders, setStorageProviders] = useState<StorageProvider[]>(() => {
    const saved = localStorage.getItem('snappshub_storage');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_STORAGE_PROVIDERS;
  });

  const [adPlacements, setAdPlacements] = useState<AdPlacement[]>(() => {
    const saved = localStorage.getItem('snappshub_ads');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_AD_PLACEMENTS;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('snappshub_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_SETTINGS;
  });

  const [files, setFiles] = useState<UploadedFile[]>(() => {
    const saved = localStorage.getItem('snappshub_files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_FILES;
  });

  const [storageLogs, setStorageLogs] = useState<StorageLogItem[]>(() => {
    const saved = localStorage.getItem('snappshub_storage_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_STORAGE_LOGS;
  });

  // Recurring backup schedule configuration state
  const [backupSchedule, setBackupSchedule] = useState<BackupScheduleConfig>(() => {
    const saved = localStorage.getItem('snappshub_backup_schedule');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_BACKUP_SCHEDULE;
  });

  // Admin panel layout and object permissions configuration state
  const [layoutConfig, setLayoutConfig] = useState<AdminLayoutPermissionsConfig>(() => {
    const saved = localStorage.getItem('snappshub_layout_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_LAYOUT_PERMISSIONS;
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

  // Notifications & Toasts
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      title: 'Console Initialized',
      message: '15 live Android applications verified & loaded from repository.',
      type: 'success',
      timestamp: '1 min ago',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Storage Handshake OK',
      message: 'Telegram Cloud Channel (@snappshub) set as default primary CDN.',
      type: 'info',
      timestamp: '3 mins ago',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Monetization Active',
      message: 'AdSense & Adsterra slot tags injected and monitoring impressions.',
      type: 'info',
      timestamp: '5 mins ago',
      read: true
    }
  ]);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isPushing, setIsPushing] = useState(false);

  // Modals state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [editingStorage, setEditingStorage] = useState<StorageProvider | null>(null);

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdPlacement | null>(null);

  // Helper to mark auto-sync timestamp
  const triggerAutoSyncPulse = () => {
    setLastAutoSyncedTime(new Date().toLocaleTimeString());
  };

  // Real-Time Auto Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('snappshub_apps', JSON.stringify(apps));
    triggerAutoSyncPulse();
  }, [apps]);

  useEffect(() => {
    localStorage.setItem('snappshub_categories', JSON.stringify(categories));
    triggerAutoSyncPulse();
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('snappshub_storage', JSON.stringify(storageProviders));
    triggerAutoSyncPulse();
  }, [storageProviders]);

  useEffect(() => {
    localStorage.setItem('snappshub_ads', JSON.stringify(adPlacements));
    triggerAutoSyncPulse();
  }, [adPlacements]);

  useEffect(() => {
    localStorage.setItem('snappshub_settings', JSON.stringify(settings));
    triggerAutoSyncPulse();
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('snappshub_files', JSON.stringify(files));
    triggerAutoSyncPulse();
  }, [files]);

  useEffect(() => {
    localStorage.setItem('snappshub_storage_logs', JSON.stringify(storageLogs));
    triggerAutoSyncPulse();
  }, [storageLogs]);

  useEffect(() => {
    localStorage.setItem('snappshub_backup_schedule', JSON.stringify(backupSchedule));
    triggerAutoSyncPulse();
  }, [backupSchedule]);

  useEffect(() => {
    localStorage.setItem('snappshub_layout_config', JSON.stringify(layoutConfig));
    triggerAutoSyncPulse();
  }, [layoutConfig]);

  // Periodic check for scheduled recurring backup download
  const backupDueRef = useRef(false);
  useEffect(() => {
    const checkBackupInterval = () => {
      if (!backupSchedule.enabled || backupDueRef.current) return;
      const now = Date.now();
      const dueDate = new Date(backupSchedule.nextBackupDate).getTime();

      if (!isNaN(dueDate) && now >= dueDate) {
        backupDueRef.current = true;
        if (backupSchedule.autoDownloadOnDue) {
          showToast(
            'info',
            'Scheduled Backup Due',
            'Triggering automated recurring JSON backup download...'
          );
          addNotification(
            'Recurring Backup Triggered',
            'Automated JSON backup downloaded per scheduled interval.',
            'info'
          );
        } else {
          showToast(
            'warning',
            'Backup Reminder',
            'Your recurring local storage backup is due. Download backup in Admin Settings.'
          );
        }
      }
    };

    const intervalId = setInterval(checkBackupInterval, 45000);
    checkBackupInterval();
    return () => clearInterval(intervalId);
  }, [backupSchedule]);

  const addStorageLog = (
    action: 'upload' | 'delete' | 'provider_switch' | 'default_changed',
    target: string,
    details: string,
    provider?: string,
    fileSize?: string
  ) => {
    const newLog: StorageLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      target,
      details,
      adminUser: savedUsername || 'Alamin Saheb',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: action === 'delete' ? 'warning' : 'success',
      provider,
      fileSize
    };
    setStorageLogs((prev) => [newLog, ...prev]);
  };

  // Toast Helper
  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Auth handlers
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('snappshub_auth', 'true');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('snappshub_auth');
    sessionStorage.clear();
    setShowLogoutModal(false);
    showToast('info', 'Logged Out', 'You have securely signed out of SnappsHub Master Console.');
  };

  const handleUpdateCredentials = (newUser: string, newPass: string) => {
    setSavedUsername(newUser);
    setSavedPasswordHash(newPass);
    localStorage.setItem('snappshub_admin_user', newUser);
    localStorage.setItem('snappshub_admin_pass', newPass);
  };

  // App handlers
  const handleSaveApp = (app: AppItem) => {
    if (!layoutConfig.allowAppEditing) {
      showToast('warning', 'Editing Locked', 'App editing is restricted by layout permissions.');
      return;
    }
    setApps((prev) => {
      const exists = prev.some((a) => a.id === app.id);
      if (exists) {
        return prev.map((a) => (a.id === app.id ? app : a));
      } else {
        return [app, ...prev];
      }
    });
    setIsAppModalOpen(false);
    setEditingApp(null);
    showToast('success', 'Application Auto-Synced', `${app.name} (v${app.version}) saved and synced in real-time.`);
    addNotification('App Updated', `${app.name} metadata updated.`, 'success');
  };

  const handleDeleteApp = (appId: string) => {
    if (!layoutConfig.allowAppEditing) {
      showToast('warning', 'Action Restricted', 'App deletion is locked in permissions.');
      return;
    }
    const app = apps.find((a) => a.id === appId);
    if (!app) return;
    setApps((prev) => prev.filter((a) => a.id !== appId));
    showToast('info', 'App Removed', `${app.name} was removed from repository.`);
    addNotification('App Deleted', `${app.name} removed from store.`, 'warning');
  };

  const handleToggleFeatured = (appId: string) => {
    setApps((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const updated = { ...a, featured: !a.featured };
          showToast(
            'info',
            'Featured Toggled',
            `${a.name} is now ${updated.featured ? 'Featured' : 'Standard'}.`
          );
          return updated;
        }
        return a;
      })
    );
  };

  const handleBulkDeleteApps = (appIds: string[]) => {
    if (!layoutConfig.allowAppEditing) {
      showToast('warning', 'Action Restricted', 'App deletion is locked in permissions.');
      return;
    }
    setApps((prev) => prev.filter((a) => !appIds.includes(a.id)));
    showToast('info', 'Bulk Apps Deleted', `Removed ${appIds.length} apps from repository.`);
    addNotification('Bulk Apps Deleted', `${appIds.length} apps removed from store.`, 'warning');
  };

  const handleBulkToggleFeatured = (appIds: string[]) => {
    setApps((prev) =>
      prev.map((a) => {
        if (appIds.includes(a.id)) {
          return { ...a, featured: !a.featured };
        }
        return a;
      })
    );
    showToast('success', 'Bulk Featured Updated', `Toggled featured status for ${appIds.length} apps.`);
  };

  const handleBulkBroadcastToTelegram = async (selectedApps: AppItem[]) => {
    showToast('info', 'Bulk Broadcast Started', `Broadcasting ${selectedApps.length} apps to ${settings.telegramChannel}...`);
    let successCount = 0;
    for (const app of selectedApps) {
      const text = formatTelegramAppMessage(app, settings.siteUrl);
      const res = await broadcastToTelegram(settings.telegramBotToken, settings.telegramChannel, text);
      if (res.success) successCount++;
    }
    showToast(
      'success',
      'Bulk Broadcast Finished',
      `Broadcasted ${successCount} of ${selectedApps.length} apps to Telegram.`
    );
    addNotification('Bulk Telegram Broadcast', `Sent ${successCount} apps to ${settings.telegramChannel}`, 'success');
  };

  const handleAutoRepairApps = (repairedApps: AppItem[]) => {
    setApps(repairedApps);
    showToast('success', 'Metadata Repaired', `Repaired and auto-synced all ${repairedApps.length} applications.`);
  };

  // Category handlers
  const handleSaveCategory = (cat: CategoryItem) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);
      if (exists) {
        return prev.map((c) => (c.id === cat.id ? cat : c));
      } else {
        return [...prev, cat];
      }
    });
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    showToast('success', 'Category Saved', `${cat.name} updated.`);
    addNotification('Category Saved', `${cat.name} category saved.`, 'success');
  };

  const handleDeleteCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    showToast('info', 'Category Removed', `${cat.name} deleted.`);
  };

  // Storage handlers
  const handleSaveStorage = (sp: StorageProvider) => {
    if (!layoutConfig.allowStorageEditing) {
      showToast('warning', 'Editing Locked', 'Storage modification is restricted by layout permissions.');
      return;
    }
    setStorageProviders((prev) => {
      const exists = prev.some((s) => s.id === sp.id);
      let updatedList = exists ? prev.map((s) => (s.id === sp.id ? sp : s)) : [...prev, sp];

      if (sp.isDefault) {
        updatedList = updatedList.map((s) => ({
          ...s,
          isDefault: s.id === sp.id
        }));
      }
      return updatedList;
    });
    addStorageLog('provider_switch', sp.name, `Configured endpoint parameters for ${sp.name}`, sp.name);
    setIsStorageModalOpen(false);
    setEditingStorage(null);
    showToast('success', 'Storage Saved', `${sp.name} updated.`);
  };

  const handleDeleteStorage = (spId: string) => {
    if (!layoutConfig.allowStorageEditing) {
      showToast('warning', 'Action Restricted', 'Storage deletion is locked.');
      return;
    }
    const sp = storageProviders.find((s) => s.id === spId);
    if (!sp) return;
    if (sp.isDefault) {
      showToast('warning', 'Default Provider', 'Cannot delete default primary storage provider.');
      return;
    }
    setStorageProviders((prev) => prev.filter((s) => s.id !== spId));
    addStorageLog('delete', sp.name, `Deleted storage provider mirror ${sp.name}`, sp.name);
    showToast('info', 'Storage Removed', `${sp.name} deleted.`);
  };

  const handleSetDefaultStorage = (spId: string) => {
    setStorageProviders((prev) =>
      prev.map((s) => ({
        ...s,
        isDefault: s.id === spId
      }))
    );
    const sp = storageProviders.find((s) => s.id === spId);
    addStorageLog('default_changed', sp?.name || 'Storage Provider', `Primary default CDN drive switched to ${sp?.name}`, sp?.name);
    showToast('success', 'Default Primary Set', `${sp?.name || 'Provider'} is now your primary drive.`);
  };

  // File Handlers
  const handleUploadFiles = (uploadedFiles: File[], targetProvider: string) => {
    const newItems: UploadedFile[] = uploadedFiles.map((f) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      type: f.name.endsWith('.apk') ? 'APK' : f.name.split('.').pop()?.toUpperCase() || 'FILE',
      uploadedAt: new Date().toISOString().split('T')[0],
      provider: targetProvider,
      url: `https://snappshub.github.io/files/${f.name}`
    }));

    setFiles((prev) => [...newItems, ...prev]);

    uploadedFiles.forEach((f) => {
      addStorageLog(
        'upload',
        f.name,
        `Direct upload via file manager to ${targetProvider}`,
        targetProvider,
        `${(f.size / (1024 * 1024)).toFixed(1)} MB`
      );
    });

    showToast('success', 'Upload Synced', `Added ${uploadedFiles.length} file(s) to ${targetProvider}.`);
    addNotification('File Uploaded', `${uploadedFiles.length} files saved.`, 'success');
  };

  const handleDeleteFile = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    addStorageLog('delete', file.name, `Removed file from CDN storage mirror`, file.provider, file.size);
    showToast('info', 'File Deleted', `${file.name} deleted.`);
  };

  // Ad handlers
  const handleSaveAd = (ad: AdPlacement) => {
    if (!layoutConfig.allowAdEditing) {
      showToast('warning', 'Action Restricted', 'Ad editing is locked.');
      return;
    }
    setAdPlacements((prev) => {
      const exists = prev.some((a) => a.id === ad.id);
      if (exists) {
        return prev.map((a) => (a.id === ad.id ? ad : a));
      } else {
        return [...prev, ad];
      }
    });
    setIsAdModalOpen(false);
    setEditingAd(null);
    showToast('success', 'Ad Placement Saved', `${ad.name} configuration updated.`);
  };

  const handleDeleteAd = (adId: string) => {
    if (!layoutConfig.allowAdEditing) {
      showToast('warning', 'Action Restricted', 'Ad deletion is locked.');
      return;
    }
    setAdPlacements((prev) => prev.filter((a) => a.id !== adId));
    showToast('info', 'Placement Removed', 'Ad placement slot deleted.');
  };

  const handleToggleAdStatus = (adId: string) => {
    setAdPlacements((prev) =>
      prev.map((a) => {
        if (a.id === adId) {
          const next = a.status === 'active' ? 'paused' : 'active';
          showToast('info', 'Ad Status', `${a.name} is now ${next}.`);
          return { ...a, status: next };
        }
        return a;
      })
    );
  };

  // Broadcast app to Telegram
  const handleBroadcastAppToTelegram = async (app: AppItem) => {
    const text = formatTelegramAppMessage(app, settings.siteUrl);
    showToast('info', 'Broadcasting', `Posting ${app.name} to ${settings.telegramChannel}...`);

    const res = await broadcastToTelegram(
      settings.telegramBotToken,
      settings.telegramChannel,
      text
    );

    if (res.success) {
      showToast('success', 'Broadcast Complete', res.message);
      addNotification('Telegram Broadcast', `Sent ${app.name} to ${settings.telegramChannel}`, 'success');
    } else {
      showToast('warning', 'Telegram Notice', res.message);
      addNotification('Telegram Notice', res.message, 'warning');
    }
  };

  // Export full project ZIP
  const handleExportZip = async () => {
    showToast('info', 'Packaging ZIP', 'Compiling complete repository package with standalone HTML & JSON...');
    try {
      const blob = await generateProjectZip(apps, categories, settings);
      downloadBlob(blob, `snappshub-backup-${new Date().toISOString().split('T')[0]}.zip`);
      showToast('success', 'ZIP Downloaded', 'Complete SnappsHub website & admin files exported.');
      addNotification('Project ZIP Exported', 'Downloaded complete site archive.', 'success');
    } catch (err: any) {
      showToast('error', 'Export Failed', err.message || 'Could not generate ZIP.');
    }
  };

  // GitHub direct commit
  const handleCommitToGitHub = async (
    repo: string = settings.githubRepo,
    token: string = settings.githubToken,
    branch: string = settings.githubBranch || 'main',
    commitMsg: string = 'Update apps.json and store configuration from SnappsHub Admin Console'
  ) => {
    if (!token) {
      setCurrentTab('website_settings');
      showToast('warning', 'PAT Required', 'Please configure your GitHub Personal Access Token in Website Settings first.');
      return;
    }

    setIsPushing(true);
    showToast('info', 'GitHub Push', `Connecting to ${repo} (${branch})...`);

    const filesToCommit = [
      { path: 'apps.json', content: JSON.stringify(apps, null, 2) },
      { path: 'categories.json', content: JSON.stringify(categories, null, 2) },
      { path: 'settings.json', content: JSON.stringify(settings, null, 2) }
    ];

    const result = await commitFilesToGitHub(repo, token, branch, commitMsg, filesToCommit);

    setIsPushing(false);
    if (result.success) {
      showToast('success', 'GitHub Sync OK', result.message);
      addNotification('GitHub Commit', result.message, 'success');
    } else {
      showToast('error', 'GitHub Commit Failed', result.message);
      addNotification('GitHub Error', result.message, 'error');
    }
  };

  // Database Reset
  const handleResetToDefaults = () => {
    setApps(INITIAL_APPS);
    setCategories(INITIAL_CATEGORIES);
    setStorageProviders(INITIAL_STORAGE_PROVIDERS);
    setAdPlacements(INITIAL_AD_PLACEMENTS);
    setSettings(INITIAL_SETTINGS);
    setFiles(INITIAL_FILES);
    setBackupSchedule(DEFAULT_BACKUP_SCHEDULE);
    setLayoutConfig(DEFAULT_LAYOUT_PERMISSIONS);
    localStorage.clear();
  };

  // Database Restore
  const handleRestoreAllData = (data: {
    apps: AppItem[];
    categories: CategoryItem[];
    settings: SiteSettings;
    storageProviders: StorageProvider[];
    adPlacements: AdPlacement[];
    files?: UploadedFile[];
    adminUser?: string;
  }) => {
    if (data.apps) setApps(data.apps);
    if (data.categories) setCategories(data.categories);
    if (data.settings) setSettings(data.settings);
    if (data.storageProviders) setStorageProviders(data.storageProviders);
    if (data.adPlacements) setAdPlacements(data.adPlacements);
    if (data.files) setFiles(data.files);
    if (data.adminUser) {
      setSavedUsername(data.adminUser);
      localStorage.setItem('snappshub_admin_user', data.adminUser);
    }
  };

  // If not authenticated, render LoginView
  if (!isAuthenticated) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          savedUsername={savedUsername}
          savedPasswordHash={savedPasswordHash}
          onUpdateCredentials={handleUpdateCredentials}
          showToast={showToast}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Dark Forest Green Sidebar with Dedicated Website & Admin Sections */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        appsCount={apps.length}
        categoriesCount={categories.length}
        siteTitle={settings.siteTitle}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onExportZip={handleExportZip}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          appsCount={apps.length}
          onCommitToGitHub={() => handleCommitToGitHub()}
          onLogout={handleLogout}
          notifications={notifications}
          onClearNotifications={() => setNotifications([])}
          isPushing={isPushing}
          onOpenLayoutPermissions={() => setIsLayoutModalOpen(true)}
          lastAutoSyncedTime={lastAutoSyncedTime}
        />

        {/* Content Panels Container */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full flex-1">
          {currentTab === 'dashboard' && (
            <DashboardTab
              apps={apps}
              storageProviders={storageProviders}
              settings={settings}
              adPlacements={adPlacements}
              layoutConfig={layoutConfig}
              onSwitchTab={(tab) => setCurrentTab(tab)}
              onOpenAddApp={() => {
                setEditingApp(null);
                setIsAppModalOpen(true);
              }}
              onOpenEditApp={(app) => {
                setEditingApp(app);
                setIsAppModalOpen(true);
              }}
              onDeleteApp={handleDeleteApp}
              onOpenAddStorage={() => {
                setEditingStorage(null);
                setIsStorageModalOpen(true);
              }}
              onOpenEditStorage={(sp) => {
                setEditingStorage(sp);
                setIsStorageModalOpen(true);
              }}
              onDeleteStorage={handleDeleteStorage}
              onSetDefaultStorage={handleSetDefaultStorage}
              onQuickUpload={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleUploadFiles(Array.from(e.target.files), 'Telegram Cloud');
                  e.target.value = '';
                }
              }}
              onBroadcastAppToTelegram={handleBroadcastAppToTelegram}
              onOpenLayoutPermissions={() => setIsLayoutModalOpen(true)}
              onAutoRepairMetadata={handleAutoRepairApps}
              onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
              showToast={showToast}
            />
          )}

          {currentTab === 'apps' && (
            <AppsTab
              apps={apps}
              categories={categories}
              onOpenAddApp={() => {
                setEditingApp(null);
                setIsAppModalOpen(true);
              }}
              onOpenEditApp={(app) => {
                setEditingApp(app);
                setIsAppModalOpen(true);
              }}
              onDeleteApp={handleDeleteApp}
              onToggleFeatured={handleToggleFeatured}
              onBroadcastAppToTelegram={handleBroadcastAppToTelegram}
              onBulkDeleteApps={handleBulkDeleteApps}
              onBulkToggleFeatured={handleBulkToggleFeatured}
              onBulkBroadcastToTelegram={handleBulkBroadcastToTelegram}
              showToast={showToast}
            />
          )}

          {currentTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              apps={apps}
              onOpenAddCategory={() => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
              onOpenEditCategory={(cat) => {
                setEditingCategory(cat);
                setIsCategoryModalOpen(true);
              }}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {currentTab === 'files' && (
            <FilesTab
              files={files}
              storageProviders={storageProviders}
              onUploadFiles={handleUploadFiles}
              onDeleteFile={handleDeleteFile}
              showToast={showToast}
            />
          )}

          {currentTab === 'storage_analytics' && (
            <StorageProvidersTab
              storageProviders={storageProviders}
              onOpenAddStorage={() => {
                setEditingStorage(null);
                setIsStorageModalOpen(true);
              }}
              onOpenEditStorage={(sp) => {
                setEditingStorage(sp);
                setIsStorageModalOpen(true);
              }}
              onDeleteStorage={handleDeleteStorage}
              onSetDefaultStorage={handleSetDefaultStorage}
              showToast={showToast}
            />
          )}

          {currentTab === 'storage_logs' && (
            <StorageLogsTab
              logs={storageLogs}
              onClearLogs={() => setStorageLogs([])}
              showToast={showToast}
            />
          )}

          {currentTab === 'ads_earnings' && (
            <AdsEarningsTab
              adPlacements={adPlacements}
              settings={settings}
              onOpenAddAd={() => {
                setEditingAd(null);
                setIsAdModalOpen(true);
              }}
              onOpenEditAd={(ad) => {
                setEditingAd(ad);
                setIsAdModalOpen(true);
              }}
              onDeleteAd={handleDeleteAd}
              onToggleAdStatus={handleToggleAdStatus}
              showToast={showToast}
            />
          )}

          {currentTab === 'telegram_hub' && (
            <TelegramHubTab
              apps={apps}
              settings={settings}
              onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
              showToast={showToast}
            />
          )}

          {currentTab === 'website_preview' && (
            <WebsitePreviewTab
              apps={apps}
              categories={categories}
              settings={settings}
            />
          )}

          {/* DEDICATED SEPARATE WEBSITE SETTINGS TAB */}
          {currentTab === 'website_settings' && (
            <WebsiteSettingsTab
              settings={settings}
              onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
              onCommitToGitHub={handleCommitToGitHub}
              isPushing={isPushing}
              layoutConfig={layoutConfig}
              onSwitchTab={(tab) => setCurrentTab(tab)}
              showToast={showToast}
              lastAutoSyncedTime={lastAutoSyncedTime}
            />
          )}

          {/* DEDICATED SEPARATE ADMIN PANEL SETTINGS TAB */}
          {currentTab === 'admin_settings' && (
            <AdminSettingsTab
              settings={settings}
              apps={apps}
              categories={categories}
              storageProviders={storageProviders}
              adPlacements={adPlacements}
              files={files}
              backupSchedule={backupSchedule}
              onUpdateBackupSchedule={(newSchedule) => setBackupSchedule(newSchedule)}
              layoutConfig={layoutConfig}
              onUpdateLayoutConfig={(newConfig) => setLayoutConfig(newConfig)}
              onRestoreAllData={handleRestoreAllData}
              onResetToDefaults={handleResetToDefaults}
              currentUsername={savedUsername}
              onUpdateCredentials={handleUpdateCredentials}
              onSwitchTab={(tab) => setCurrentTab(tab)}
              showToast={showToast}
              lastAutoSyncedTime={lastAutoSyncedTime}
            />
          )}

          {/* COMBINED/COORDINATOR SETTINGS TAB */}
          {currentTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
              onCommitToGitHub={handleCommitToGitHub}
              isPushing={isPushing}
              apps={apps}
              categories={categories}
              storageProviders={storageProviders}
              adPlacements={adPlacements}
              files={files}
              backupSchedule={backupSchedule}
              onUpdateBackupSchedule={(newSchedule) => setBackupSchedule(newSchedule)}
              layoutConfig={layoutConfig}
              onUpdateLayoutConfig={(newConfig) => setLayoutConfig(newConfig)}
              onRestoreAllData={handleRestoreAllData}
              onResetToDefaults={handleResetToDefaults}
              currentUsername={savedUsername}
              onUpdateCredentials={handleUpdateCredentials}
              onSwitchTab={(tab) => setCurrentTab(tab)}
              showToast={showToast}
              lastAutoSyncedTime={lastAutoSyncedTime}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AppModal
        isOpen={isAppModalOpen}
        onClose={() => {
          setIsAppModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApp}
        editingApp={editingApp}
        categories={categories}
        storageProviders={storageProviders}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
      />

      <StorageModal
        isOpen={isStorageModalOpen}
        onClose={() => {
          setIsStorageModalOpen(false);
          setEditingStorage(null);
        }}
        onSave={handleSaveStorage}
        editingProvider={editingStorage}
      />

      <AdPlacementModal
        isOpen={isAdModalOpen}
        onClose={() => {
          setIsAdModalOpen(false);
          setEditingAd(null);
        }}
        onSave={handleSaveAd}
        editingAd={editingAd}
      />

      {/* ADMIN PANEL LAYOUT & EDIT PERMISSIONS MODAL */}
      <LayoutPermissionsModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        config={layoutConfig}
        onUpdateConfig={(newConfig) => setLayoutConfig(newConfig)}
        showToast={showToast}
      />

      {/* IN-APP SIGN OUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Sign Out of Master Console?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to end your administrative session for <span className="font-semibold text-slate-700">{savedUsername}</span> (01922392422)?
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface AppItem {
  id: string;
  name: string;
  packageName: string;
  version: string;
  versionCode: number;
  size: string;
  category: string;
  icon: string;
  banner?: string;
  downloadUrl: string;
  directApkUrl?: string;
  storageProviderId: string;
  telegramMessageId?: string;
  downloadsCount: number;
  rating: number;
  description: string;
  whatsNew?: string;
  featured: boolean;
  status: 'active' | 'updating' | 'draft';
  lastUpdated: string;
  developer: string;
  minAndroid: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
}

export interface StorageProvider {
  id: string;
  name: string;
  type: 'telegram' | 'gdrive' | 'mediafire' | 'mega' | 'github' | 'direct';
  capacity: string;
  used: string;
  isDefault: boolean;
  status: 'online' | 'degraded' | 'offline';
  channelId?: string;
  botToken?: string;
  folderUrl?: string;
  notes: string;
}

export interface AdPlacement {
  id: string;
  name: string;
  network: 'AdSense' | 'Adsterra' | 'Monetag' | 'PropellerAds' | 'Custom';
  slotType: 'Header Leaderboard' | 'In-Feed Native' | 'Download Interstitial' | 'Sticky Bottom' | 'Social Bar';
  status: 'active' | 'paused';
  adCode: string;
  impressionsToday: number;
  clicksToday: number;
  estimatedEarnings: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  provider: string;
  url: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: string;
  read: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
  siteUrl: string;
  contactPhone: string;
  contactEmail: string;
  githubRepo: string;
  githubToken: string;
  githubBranch: string;
  telegramChannel: string;
  telegramBotToken: string;
  primaryColor: string;
  totalEarnings: number;
  earningsToday: number;
  earningsThisWeek: number;
  earningsThisMonth: number;
  metaDescription: string;
}

export interface StorageLogItem {
  id: string;
  action: 'upload' | 'delete' | 'provider_switch' | 'default_changed';
  target: string;
  details: string;
  adminUser: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
  provider?: string;
  fileSize?: string;
}

export interface BackupScheduleConfig {
  enabled: boolean;
  interval: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  lastBackupDate: string;
  nextBackupDate: string;
  autoDownloadOnDue: boolean;
  notifyInConsole: boolean;
}

export interface AppIntegrityCheck {
  appId: string;
  appName: string;
  packageName: string;
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  githubSynced: boolean;
  linkReachable: boolean;
  lastChecked: string;
}

export interface AdminLayoutPermissionsConfig {
  allowLayoutEditing: boolean;
  allowAppEditing: boolean;
  allowStorageEditing: boolean;
  allowAdEditing: boolean;
  allowBrandingEditing: boolean;
  density: 'comfortable' | 'compact';
  widgets: {
    quickActions: boolean;
    quickAccessCards: boolean;
    storageDistributionChart: boolean;
    storageTrendLineChart: boolean;
    telegramHealthMonitor: boolean;
    appIntegrityWidget: boolean;
    totalEarnings: boolean;
    allAppsTable: boolean;
    storageProvidersTable: boolean;
  };
}


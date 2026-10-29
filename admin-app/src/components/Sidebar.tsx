import React from 'react';
import {
  LayoutGrid,
  Layout,
  Tag,
  FolderUp,
  HardDrive,
  BadgeDollarSign,
  Send,
  Tv,
  Settings,
  Archive,
  LogOut,
  Shield,
  X,
  History,
  Globe,
  Sliders,
  SlidersHorizontal
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'apps'
  | 'categories'
  | 'files'
  | 'storage_analytics'
  | 'storage_logs'
  | 'ads_earnings'
  | 'telegram_hub'
  | 'website_preview'
  | 'website_settings'
  | 'admin_settings'
  | 'settings';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  appsCount: number;
  categoriesCount: number;
  siteTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onExportZip: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  appsCount,
  categoriesCount,
  siteTitle,
  isOpen,
  onClose,
  onExportZip,
  onLogout
}) => {
  const mainNavItems: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid className="w-4 h-4 text-emerald-400" />
    },
    {
      key: 'apps',
      label: 'Apps Repository',
      icon: <Layout className="w-4 h-4" />,
      badge: appsCount
    },
    {
      key: 'categories',
      label: 'Categories',
      icon: <Tag className="w-4 h-4" />,
      badge: categoriesCount
    },
    {
      key: 'files',
      label: 'Files & Uploads',
      icon: <FolderUp className="w-4 h-4 text-sky-400" />
    },
    {
      key: 'storage_analytics',
      label: 'Storage Providers',
      icon: <HardDrive className="w-4 h-4 text-amber-400" />
    },
    {
      key: 'storage_logs',
      label: 'Storage Event Logs',
      icon: <History className="w-4 h-4 text-purple-400" />
    },
    {
      key: 'ads_earnings',
      label: 'Ads & Monetization',
      icon: <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
    },
    {
      key: 'telegram_hub',
      label: 'Telegram Auto-Post',
      icon: <Send className="w-4 h-4 text-sky-400" />
    }
  ];

  const websiteNavItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: 'website_preview',
      label: 'Website Preview',
      icon: <Tv className="w-4 h-4 text-purple-400" />
    },
    {
      key: 'website_settings',
      label: 'Website Settings',
      icon: <Globe className="w-4 h-4 text-sky-400" />
    }
  ];

  const adminNavItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: 'admin_settings',
      label: 'Admin Panel Settings',
      icon: <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Dark Forest Green Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#062817] text-white flex flex-col transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static shrink-0 select-none`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-[#062817] font-extrabold text-base flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-emerald-500/20">
              S
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white leading-none truncate">{siteTitle}</h2>
              <span className="text-xs text-emerald-400 font-medium">Master Console</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-white/70 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Auto-Sync Status Chip */}
        <div className="px-5 py-2.5 border-b border-white/5 bg-emerald-950/40">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Auto-Sync</span>
            </div>
            <span className="text-emerald-400 font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Main App & Content */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400/70 font-semibold">
              Core Management
            </div>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSelectTab(item.key);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Website / Store Settings Section */}
          <div className="pt-2 border-t border-white/5">
            <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-sky-400/80 font-semibold flex items-center justify-between">
              <span>Website & Store</span>
              <span className="text-[9px] text-white/40">Public</span>
            </div>
            <div className="space-y-1">
              {websiteNavItems.map((item) => {
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSelectTab(item.key);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-sky-600/30 text-sky-300 border border-sky-500/30'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Panel Settings Section */}
          <div className="pt-2 border-t border-white/5">
            <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 font-semibold flex items-center justify-between">
              <span>Admin Console</span>
              <span className="text-[9px] text-white/40">Private</span>
            </div>
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = currentTab === item.key || currentTab === 'settings';
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSelectTab(item.key);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 space-y-1.5">
          <button
            onClick={onExportZip}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-semibold transition cursor-pointer"
            title="Download full project repository as ZIP archive"
          >
            <Archive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Project ZIP</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

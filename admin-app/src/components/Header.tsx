import React, { useState, useRef, useEffect } from 'react';
import { Menu, GitCommit, Bell, LogOut, Trash2, Sliders, Zap } from 'lucide-react';
import { SystemNotification } from '../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  appsCount: number;
  onCommitToGitHub: () => void;
  onLogout: () => void;
  notifications: SystemNotification[];
  onClearNotifications: () => void;
  isPushing: boolean;
  onOpenLayoutPermissions?: () => void;
  lastAutoSyncedTime?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  appsCount,
  onCommitToGitHub,
  onLogout,
  notifications,
  onClearNotifications,
  isPushing,
  onOpenLayoutPermissions,
  lastAutoSyncedTime = 'Just now'
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="px-5 py-3.5 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          snappshub.github.io &bull;{' '}
          <span className="text-emerald-600 font-bold">{appsCount} Live Apps Synced</span>
        </span>

        {/* Live Real-time Auto-Sync Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-mono text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold">Auto-Sync: Live</span>
          <span className="text-emerald-500">&bull;</span>
          <span className="text-emerald-600">{lastAutoSyncedTime}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Layout & Permissions Shortcut Button */}
        {onOpenLayoutPermissions && (
          <button
            onClick={onOpenLayoutPermissions}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            title="Edit Admin Panel layout and customize edit permissions for every object"
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Layout & Permissions</span>
          </button>
        )}

        <button
          onClick={onCommitToGitHub}
          disabled={isPushing}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
          title="Direct commit to GitHub Pages repository"
        >
          <GitCommit className={`w-3.5 h-3.5 text-emerald-400 ${isPushing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isPushing ? 'Committing...' : 'Commit to GitHub'}</span>
          <span className="sm:hidden">Commit</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition cursor-pointer"
            title="System Alerts & Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900">System Notifications</span>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full font-mono text-slate-600">
                    {notifications.length}
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-[11px] text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No recent notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
          title="Sign out of Admin Panel"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

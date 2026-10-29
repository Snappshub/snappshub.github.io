import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Send,
  Download,
  Star,
  CheckCircle2,
  Filter,
  Eye,
  X,
  Binary,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle,
  Radio,
  Layers
} from 'lucide-react';
import { AppItem, CategoryItem } from '../../types';

interface AppsTabProps {
  apps: AppItem[];
  categories: CategoryItem[];
  onOpenAddApp: () => void;
  onOpenEditApp: (app: AppItem) => void;
  onDeleteApp: (appId: string) => void;
  onToggleFeatured: (appId: string) => void;
  onBroadcastAppToTelegram: (app: AppItem) => void;
  onBulkDeleteApps?: (appIds: string[]) => void;
  onBulkToggleFeatured?: (appIds: string[]) => void;
  onBulkBroadcastToTelegram?: (selectedApps: AppItem[]) => Promise<void>;
  showToast?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const AppsTab: React.FC<AppsTabProps> = ({
  apps,
  categories,
  onOpenAddApp,
  onOpenEditApp,
  onDeleteApp,
  onToggleFeatured,
  onBroadcastAppToTelegram,
  onBulkDeleteApps,
  onBulkToggleFeatured,
  onBulkBroadcastToTelegram,
  showToast = () => {}
}) => {
  // Real-time text filter state for app name or package ID
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'downloads' | 'latest' | 'rating'>('downloads');

  // Multi-select state
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkBroadcasting, setIsBulkBroadcasting] = useState(false);

  const cleanTerm = filterQuery.trim().toLowerCase();

  const filteredApps = apps
    .filter((app) => {
      // Category filter
      const matchesCat = selectedCategory === 'All' || app.category === selectedCategory;

      // Real-time filter by app Name or Package ID
      const matchesNameOrPackage =
        !cleanTerm ||
        app.name.toLowerCase().includes(cleanTerm) ||
        app.packageName.toLowerCase().includes(cleanTerm);

      return matchesCat && matchesNameOrPackage;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') return b.downloadsCount - a.downloadsCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

  // Checkbox helpers
  const allFilteredSelected =
    filteredApps.length > 0 &&
    filteredApps.every((app) => selectedAppIds.includes(app.id));

  const someFilteredSelected =
    filteredApps.some((app) => selectedAppIds.includes(app.id)) && !allFilteredSelected;

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered apps
      const filteredIds = new Set(filteredApps.map((a) => a.id));
      setSelectedAppIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      // Select all filtered apps
      const filteredIds = filteredApps.map((a) => a.id);
      setSelectedAppIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleAppSelection = (appId: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const handleClearSelection = () => {
    setSelectedAppIds([]);
  };

  // Bulk Operations
  const selectedAppsList = apps.filter((a) => selectedAppIds.includes(a.id));

  const handleExecuteBulkToggleFeatured = () => {
    if (selectedAppIds.length === 0) return;

    if (onBulkToggleFeatured) {
      onBulkToggleFeatured(selectedAppIds);
    } else {
      selectedAppIds.forEach((id) => onToggleFeatured(id));
      showToast(
        'success',
        'Bulk Featured Toggled',
        `Toggled featured status for ${selectedAppIds.length} selected apps.`
      );
    }
  };

  const handleExecuteBulkBroadcast = async () => {
    if (selectedAppIds.length === 0) return;
    setIsBulkBroadcasting(true);

    if (onBulkBroadcastToTelegram) {
      await onBulkBroadcastToTelegram(selectedAppsList);
    } else {
      showToast(
        'info',
        'Bulk Telegram Broadcast',
        `Broadcasting ${selectedAppsList.length} applications to Telegram...`
      );
      for (const app of selectedAppsList) {
        onBroadcastAppToTelegram(app);
      }
    }

    setIsBulkBroadcasting(false);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedAppIds.length === 0) return;

    if (onBulkDeleteApps) {
      onBulkDeleteApps(selectedAppIds);
    } else {
      selectedAppIds.forEach((id) => onDeleteApp(id));
      showToast(
        'info',
        'Bulk Apps Deleted',
        `Removed ${selectedAppIds.length} applications from repository.`
      );
    }

    setSelectedAppIds([]);
    setShowBulkDeleteModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Applications</h2>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              {apps.length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your verified APK repository &bull; Multi-select enabled for bulk operations
          </p>
        </div>

        <button
          onClick={onOpenAddApp}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add new app</span>
        </button>
      </div>

      {/* Filter and Real-Time Search Bar Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="app-name-package-filter" className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Binary className="w-3.5 h-3.5 text-blue-600" />
              <span>Real-Time Filter (Name or Package ID)</span>
            </label>
            {cleanTerm && (
              <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Found {filteredApps.length} of {apps.length} matches
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Real-time text input specifically filtering by name or package ID */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="app-name-package-filter"
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter apps by name or package ID (e.g. SnappsHub, com.snapps, whats, org)..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition cursor-pointer"
                  title="Clear filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Sort by:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option value="downloads">Most Downloaded</option>
                <option value="latest">Latest Updated</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer text-xs ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({apps.length})
          </button>
          {categories.map((cat) => {
            const count = apps.filter((a) => a.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* BULK ACTIONS FLOATING / TOP BAR (ACTIVE WHEN APPS ARE SELECTED) */}
      {selectedAppIds.length > 0 && (
        <div className="sticky top-16 z-30 bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-400/30">
              {selectedAppIds.length}
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                <span>{selectedAppIds.length} application(s) selected</span>
              </h4>
              <p className="text-[11px] text-slate-300">
                Bulk operations ready to apply to all selected apps simultaneously
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Toggle Featured */}
            <button
              type="button"
              onClick={handleExecuteBulkToggleFeatured}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Toggle featured flag on all selected apps"
            >
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>Toggle Featured</span>
            </button>

            {/* Bulk Broadcast to Telegram */}
            <button
              type="button"
              onClick={handleExecuteBulkBroadcast}
              disabled={isBulkBroadcasting}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
              title="Broadcast selected apps to Telegram channel"
            >
              <Send className={`w-3.5 h-3.5 text-sky-300 ${isBulkBroadcasting ? 'animate-spin' : ''}`} />
              <span>{isBulkBroadcasting ? 'Broadcasting...' : 'Broadcast to Telegram'}</span>
            </button>

            {/* Bulk Delete */}
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Bulk delete selected apps"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-300" />
              <span>Delete ({selectedAppIds.length})</span>
            </button>

            {/* Deselect All */}
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 text-xs font-semibold transition cursor-pointer ml-1"
              title="Deselect all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Applications Grid / List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Table / List Header with Master Checkbox */}
        <div className="p-3.5 sm:px-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : someFilteredSelected ? (
                <MinusSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs">
                Select All ({filteredApps.length})
              </span>
            </button>

            {selectedAppIds.length > 0 && (
              <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {selectedAppIds.length} selected
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Showing {filteredApps.length} of {apps.length} apps
          </div>
        </div>

        {/* List of Applications */}
        <div className="divide-y divide-slate-100 p-2 sm:p-3">
          {filteredApps.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-semibold text-slate-700">No applications match "{filterQuery}"</p>
              <p className="text-xs text-slate-400">
                No apps found with that name or package ID in the selected category.
              </p>
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="mt-2 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  Clear real-time filter
                </button>
              )}
            </div>
          ) : (
            filteredApps.map((app) => {
              const isSelected = selectedAppIds.includes(app.id);

              return (
                <div
                  key={app.id}
                  className={`py-3.5 px-3 flex flex-col md:flex-row md:items-center justify-between gap-3.5 rounded-xl transition ${
                    isSelected
                      ? 'bg-blue-50/60 border border-blue-200/80 shadow-xs'
                      : 'hover:bg-slate-50/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    {/* Individual App Multi-Select Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleAppSelection(app.id)}
                      className="mt-1 text-slate-400 hover:text-blue-600 transition cursor-pointer shrink-0"
                      aria-label={`Select ${app.name}`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{app.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          v{app.version}
                        </span>
                        {app.featured && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            FEATURED
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          {app.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1">{app.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                          ID: {app.packageName}
                        </span>
                        <span>&bull;</span>
                        <span>{app.size}</span>
                        <span>&bull;</span>
                        <span>{app.category}</span>
                        <span>&bull;</span>
                        <span className="text-amber-500 flex items-center space-x-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{app.rating.toFixed(1)}</span>
                        </span>
                        <span>&bull;</span>
                        <span className="text-slate-600 font-semibold">{app.downloadsCount.toLocaleString()} downloads</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => onToggleFeatured(app.id)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        app.featured
                          ? 'border-amber-300 bg-amber-50 text-amber-600'
                          : 'border-slate-200 text-slate-400 hover:text-amber-500'
                      }`}
                      title={app.featured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <Star className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onBroadcastAppToTelegram(app)}
                      className="px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                      title="Broadcast to Telegram Channel @snappshub"
                    >
                      <Send className="w-3.5 h-3.5 text-sky-600" />
                      <span>Telegram</span>
                    </button>

                    <a
                      href={app.downloadUrl || app.directApkUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                      title="Direct Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onOpenEditApp(app)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onDeleteApp(app.id)}
                      className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* IN-APP BULK DELETE CONFIRMATION MODAL (AVOIDS WINDOW.CONFIRM IFRAME BLOCKS) */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Delete {selectedAppIds.length} Selected Applications?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete these {selectedAppIds.length} apps from the repository? This will remove their metadata and cloud mirror entries.
              </p>
            </div>

            {/* List preview of apps to delete */}
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 bg-slate-50 rounded-xl p-2 text-xs">
              {selectedAppsList.map((app) => (
                <div key={app.id} className="py-1 px-2 flex items-center justify-between text-slate-700">
                  <span className="font-semibold truncate">{app.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{app.version}</span>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Delete Selected Apps
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

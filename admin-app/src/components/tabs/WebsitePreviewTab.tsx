import React, { useState } from 'react';
import { Smartphone, Monitor, ExternalLink, Download, Search, Star, ShieldCheck } from 'lucide-react';
import { AppItem, CategoryItem, SiteSettings } from '../../types';

interface WebsitePreviewTabProps {
  apps: AppItem[];
  categories: CategoryItem[];
  settings: SiteSettings;
}

export const WebsitePreviewTab: React.FC<WebsitePreviewTabProps> = ({
  apps,
  categories,
  settings
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredApps = apps.filter((app) => {
    const matchCat = activeCategory === 'All' || app.category === activeCategory;
    const matchQ =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="space-y-5">
      {/* Top Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Website Public Preview</h2>
          <p className="text-xs text-slate-500">Live preview of your public SnappsHub visitor catalog</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                deviceMode === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                deviceMode === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          <a
            href={settings.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Simulated Device Frame */}
      <div className="flex justify-center">
        <div
          className={`transition-all duration-300 w-full overflow-hidden border border-slate-300 rounded-3xl shadow-2xl bg-[#062817] text-white flex flex-col ${
            deviceMode === 'mobile' ? 'max-w-sm min-h-[640px]' : 'max-w-5xl min-h-[580px]'
          }`}
        >
          {/* Mock Store Header */}
          <div className="px-5 py-3.5 border-b border-emerald-900/60 bg-[#041d10]/95 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-emerald-500/20">
                S
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-none text-white">{settings.siteTitle}</h3>
                <span className="text-[10px] text-emerald-400 font-mono">Store Front</span>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              100% CLEAN
            </span>
          </div>

          {/* Mock Store Hero */}
          <div className="p-5 sm:p-7 bg-gradient-to-br from-[#0a3b22] to-[#041d10] border-b border-emerald-900/40 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Direct & High Speed Downloads
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">Curated Android APKs & Tools</h2>
            <p className="text-xs text-slate-300 max-w-md">
              Download clean, fast & verified Android packages directly hosted on Telegram Cloud and fast mirrors.
            </p>

            {/* Search Input in Mock */}
            <div className="pt-2">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search among 15 verified apps..."
                  className="w-full pl-9 pr-4 py-2 bg-[#062817]/80 border border-emerald-800 rounded-xl text-xs text-white placeholder-emerald-500/60 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="px-5 py-3 border-b border-emerald-950 flex items-center space-x-2 overflow-x-auto text-xs bg-[#041d10]">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition cursor-pointer text-xs ${
                activeCategory === 'All'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
              }`}
            >
              All ({apps.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.name)}
                className={`px-3 py-1 rounded-lg whitespace-nowrap transition cursor-pointer text-xs ${
                  activeCategory === c.name
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Public Store Apps Grid */}
          <div className="p-5 flex-1 overflow-y-auto max-h-[460px]">
            <div
              className={`grid gap-3.5 ${
                deviceMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-[#08301b]/90 border border-emerald-900/60 hover:border-emerald-600 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-11 h-11 rounded-xl object-cover border border-emerald-900 bg-emerald-950 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{app.name}</h4>
                      <p className="text-[10px] text-emerald-400 font-mono">
                        v{app.version} &bull; {app.size}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{app.description}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-950 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400/80 font-mono">{app.category}</span>
                    <a
                      href={app.downloadUrl || app.directApkUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold flex items-center space-x-1 transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-emerald-950 text-center text-[11px] text-emerald-600 bg-[#041d10]">
            SnappsHub Public Store &bull; Curated by Alamin Saheb ({settings.contactPhone})
          </div>
        </div>
      </div>
    </div>
  );
};

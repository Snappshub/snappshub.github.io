import React, { useState, useEffect } from 'react';
import {
  Globe,
  GitCommit,
  Github,
  Phone,
  Mail,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Palette,
  FileCode,
  Share2,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { SiteSettings, AdminLayoutPermissionsConfig } from '../../types';
import { TabKey } from '../Sidebar';

interface WebsiteSettingsTabProps {
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => void;
  onCommitToGitHub: (repo: string, token: string, branch: string, message: string) => Promise<void>;
  isPushing: boolean;
  layoutConfig: AdminLayoutPermissionsConfig;
  onSwitchTab?: (tab: TabKey) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  lastAutoSyncedTime?: string;
}

export const WebsiteSettingsTab: React.FC<WebsiteSettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onCommitToGitHub,
  isPushing,
  layoutConfig,
  onSwitchTab,
  showToast,
  lastAutoSyncedTime = 'Just now'
}) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [showToken, setShowToken] = useState(false);
  const [commitMsg, setCommitMsg] = useState('Update apps.json and store configuration from SnappsHub Admin Console');

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...settings }));
  }, [settings]);

  // Real-time auto-sync: every change saves instantly without manual sync!
  const handleFieldChange = (field: keyof SiteSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    onUpdateSettings({ [field]: value });
  };

  const handleTriggerCommit = async () => {
    if (!formData.githubToken.trim()) {
      showToast('warning', 'Token Required', 'Please enter your GitHub Personal Access Token (PAT).');
      return;
    }
    await onCommitToGitHub(formData.githubRepo, formData.githubToken, formData.githubBranch || 'main', commitMsg);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Website & Store Settings</h2>
            <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              <span>PUBLIC STOREFRONT</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure public branding, theme color, contact info, Telegram channel & GitHub Pages repository sync
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {onSwitchTab && (
            <button
              onClick={() => onSwitchTab('admin_settings')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer border border-slate-200"
            >
              <span>Go to Admin Panel Settings</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}

          <button
            onClick={handleTriggerCommit}
            disabled={isPushing}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl px-4 py-2 text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <GitCommit className={`w-4 h-4 text-emerald-400 ${isPushing ? 'animate-spin' : ''}`} />
            <span>{isPushing ? 'Committing...' : 'Commit to GitHub'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Auto-Sync Notice */}
      <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-2xl flex items-center justify-between text-xs text-sky-900">
        <div className="flex items-center space-x-2.5">
          <Globe className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Website Real-Time Auto-Sync:</strong> All public site changes are auto-synced live to your browser and preview tab instantly.
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-sky-700 shrink-0 ml-2">
          Synced: {lastAutoSyncedTime}
        </span>
      </div>

      {/* 1. PUBLIC STORE BRANDING & IDENTITY */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Storefront Branding & Appearance</h3>
              <p className="text-xs text-slate-500">Public logo text, domain, color theme and tagline</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Real-Time Auto-Save
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Public Site Title</label>
            <input
              type="text"
              value={formData.siteTitle}
              disabled={!layoutConfig.allowBrandingEditing}
              onChange={(e) => handleFieldChange('siteTitle', e.target.value)}
              placeholder="SnappsHub"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Store Tagline / Subtitle</label>
            <input
              type="text"
              value={formData.siteSubtitle}
              disabled={!layoutConfig.allowBrandingEditing}
              onChange={(e) => handleFieldChange('siteSubtitle', e.target.value)}
              placeholder="Verified Android APK Store & Direct Cloud Downloads"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Public Website URL</label>
            <input
              type="text"
              value={formData.siteUrl}
              disabled={!layoutConfig.allowBrandingEditing}
              onChange={(e) => handleFieldChange('siteUrl', e.target.value)}
              placeholder="https://snappshub.github.io"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Theme Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.primaryColor || '#062817'}
                disabled={!layoutConfig.allowBrandingEditing}
                onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-200 p-1 cursor-pointer bg-slate-50 disabled:opacity-60"
              />
              <input
                type="text"
                value={formData.primaryColor || '#062817'}
                disabled={!layoutConfig.allowBrandingEditing}
                onChange={(e) => handleFieldChange('primaryColor', e.target.value)}
                placeholder="#062817"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. PUBLIC SUPPORT & CONTACT INFORMATION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Public Contact & Support Channels</h3>
              <p className="text-xs text-slate-500">Contact details shown in website footer & support modal</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Live Footer Sync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Phone / WhatsApp</span>
            </label>
            <input
              type="text"
              value={formData.contactPhone}
              disabled={!layoutConfig.allowBrandingEditing}
              onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
              placeholder="01922392422"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Contact Email</span>
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              disabled={!layoutConfig.allowBrandingEditing}
              onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
              placeholder="alaminsaheb2019@gmail.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* 3. TELEGRAM COMMUNITY INTEGRATION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Telegram Community & Broadcast Channel</h3>
              <p className="text-xs text-slate-500">Public Telegram join links and automated broadcast bot token</p>
            </div>
          </div>
          <a
            href={`https://t.me/${formData.telegramChannel.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-sky-600 hover:underline flex items-center space-x-1"
          >
            <span>Visit {formData.telegramChannel}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Public Channel Username</label>
            <input
              type="text"
              value={formData.telegramChannel}
              disabled={!layoutConfig.allowBrandingEditing}
              onChange={(e) => handleFieldChange('telegramChannel', e.target.value)}
              placeholder="@snappshub"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bot Token (Broadcaster & Cloud API)</label>
            <input
              type="text"
              value={formData.telegramBotToken}
              disabled={!layoutConfig.allowBrandingEditing}
              onChange={(e) => handleFieldChange('telegramBotToken', e.target.value)}
              placeholder="8887180459:AAE..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* 4. GITHUB ZERO-MANUAL PAGES REPOSITORY INTEGRATION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <Github className="w-5 h-5 text-slate-900" />
          <div>
            <h3 className="text-base font-bold text-slate-900">GitHub Pages Zero-Manual Repository Sync</h3>
            <p className="text-xs text-slate-500">
              Auto-pushes apps.json, settings.json & categories.json straight to GitHub Pages
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Repository (Owner/Repo)</label>
            <input
              type="text"
              value={formData.githubRepo}
              onChange={(e) => handleFieldChange('githubRepo', e.target.value)}
              placeholder="Snappshub/snappshub.github.io"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub PAT Token</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={formData.githubToken}
                onChange={(e) => handleFieldChange('githubToken', e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Branch</label>
            <input
              type="text"
              value={formData.githubBranch || 'main'}
              onChange={(e) => handleFieldChange('githubBranch', e.target.value)}
              placeholder="main"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Commit Message</label>
            <input
              type="text"
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <span className="text-[11px] text-emerald-600 font-mono flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Real-time local auto-sync enabled</span>
          </span>
          <button
            type="button"
            onClick={handleTriggerCommit}
            disabled={isPushing}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isPushing ? 'Pushing to GitHub...' : 'Commit & Push Now'}</span>
          </button>
        </div>
      </div>

      {/* 5. SEO & SEARCH ENGINE METADATA */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <Share2 className="w-4 h-4 text-purple-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">SEO & Social Meta Tags</h3>
            <p className="text-xs text-slate-500">Google search preview and OpenGraph share card description</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Meta Description</label>
          <textarea
            rows={3}
            value={formData.metaDescription || 'Download 100% verified Android APKs, direct cloud mirrors, and fast APK updates.'}
            disabled={!layoutConfig.allowBrandingEditing}
            onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
};

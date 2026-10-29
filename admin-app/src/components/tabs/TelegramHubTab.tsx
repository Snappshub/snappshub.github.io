import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Bot, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';
import { AppItem, SiteSettings } from '../../types';
import { broadcastToTelegram, formatTelegramAppMessage } from '../../utils/telegram';

interface TelegramHubTabProps {
  apps: AppItem[];
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const TelegramHubTab: React.FC<TelegramHubTabProps> = ({
  apps,
  settings,
  onUpdateSettings,
  showToast
}) => {
  const [botToken, setBotToken] = useState(settings.telegramBotToken);
  const [targetChannel, setTargetChannel] = useState(settings.telegramChannel);
  const [selectedAppId, setSelectedAppId] = useState(apps[0]?.id || '');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastLog, setLastLog] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });

  const selectedApp = apps.find((a) => a.id === selectedAppId) || apps[0];

  // Auto-generate preview message when selected app changes
  const activeMessage =
    customMessage || (selectedApp ? formatTelegramAppMessage(selectedApp, settings.siteUrl) : '');

  const handleTestBroadcast = async () => {
    setIsSending(true);
    setLastLog({ status: 'idle', message: 'Connecting to Telegram Bot API...' });

    const testMsg = `🔔 *SnappsHub Telegram Auto-Post Engine Connected!*\n\nChannel: \`${targetChannel}\`\nStatus: *Active & Operational*\nTime: \`${new Date().toLocaleString()}\`\n\n⚡ Automated APK distribution ready.`;

    const res = await broadcastToTelegram(botToken, targetChannel, testMsg);

    setIsSending(false);
    if (res.success) {
      setLastLog({ status: 'success', message: res.message });
      showToast('success', 'Telegram Broadcast Successful', res.message);
    } else {
      setLastLog({ status: 'error', message: res.message });
      showToast('warning', 'Telegram Notice', res.message);
    }
  };

  const handleBroadcastApp = async () => {
    if (!selectedApp) return;
    setIsSending(true);
    setLastLog({ status: 'idle', message: `Posting ${selectedApp.name} to ${targetChannel}...` });

    const res = await broadcastToTelegram(botToken, targetChannel, activeMessage);

    setIsSending(false);
    if (res.success) {
      setLastLog({ status: 'success', message: `Successfully posted ${selectedApp.name} to ${targetChannel}!` });
      showToast('success', 'App Broadcasted', `Posted ${selectedApp.name} to Telegram Channel!`);
    } else {
      setLastLog({ status: 'error', message: res.message });
      showToast('warning', 'Broadcast Response', res.message);
    }
  };

  const handleSaveConfig = () => {
    onUpdateSettings({ telegramBotToken: botToken.trim(), telegramChannel: targetChannel.trim() });
    showToast('success', 'Settings Saved', 'Telegram configuration updated.');
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Telegram Channel Live Auto-Poster</h2>
            <p className="text-xs text-slate-500">
              Official Channel:{' '}
              <a
                href="https://t.me/snappshub"
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 font-semibold hover:underline inline-flex items-center space-x-0.5"
              >
                <span>https://t.me/snappshub</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </p>
          </div>
        </div>

        <button
          onClick={handleTestBroadcast}
          disabled={isSending}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl px-4 py-2.5 text-xs shadow-xs transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSending ? 'Sending...' : 'Broadcast Test to @snappshub'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Configuration Column */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Bot className="w-4 h-4 text-slate-600" />
            <span>Bot & Channel API Configuration</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bot Token</label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="8887180459:AAEvG4..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Channel Username</label>
              <input
                type="text"
                value={targetChannel}
                onChange={(e) => setTargetChannel(e.target.value)}
                placeholder="@snappshub"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
            >
              Save Telegram Credentials
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Select App to Broadcast</h4>
            <select
              value={selectedAppId}
              onChange={(e) => {
                setSelectedAppId(e.target.value);
                setCustomMessage('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
            >
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} (v{app.version} - {app.size})
                </option>
              ))}
            </select>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Message Text / Markdown Override</label>
                {customMessage && (
                  <button
                    onClick={() => setCustomMessage('')}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    Reset to Default Template
                  </button>
                )}
              </div>
              <textarea
                rows={6}
                value={activeMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              onClick={handleBroadcastApp}
              disabled={isSending || !selectedApp}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast {selectedApp?.name} to {targetChannel}</span>
            </button>
          </div>
        </div>

        {/* Live Preview & Status Column */}
        <div className="space-y-4">
          <div className="bg-[#17212b] rounded-2xl p-5 text-white shadow-md border border-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-sky-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  S
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">SnappsHub Official</h4>
                  <p className="text-[10px] text-sky-400">Channel broadcast</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">LIVE PREVIEW</span>
            </div>

            {selectedApp && (
              <div className="flex items-center space-x-3 p-2.5 bg-[#0e1621] rounded-xl border border-white/5">
                <img
                  src={selectedApp.icon}
                  alt={selectedApp.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="text-xs">
                  <p className="font-bold text-white">{selectedApp.name}</p>
                  <p className="text-[11px] text-sky-400 font-mono">v{selectedApp.version} &bull; {selectedApp.size}</p>
                </div>
              </div>
            )}

            <pre className="text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-200 max-h-72 overflow-y-auto">
              {activeMessage}
            </pre>
          </div>

          {/* Activity / Response Log */}
          {lastLog.message && (
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                lastLog.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : lastLog.status === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold mb-1">
                {lastLog.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {lastLog.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>Telegram API Output</span>
              </div>
              <p className="font-mono text-[11px]">{lastLog.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

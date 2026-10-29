import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  UploadCloud,
  HardDrive,
  User,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { StorageLogItem } from '../../types';

interface StorageLogsTabProps {
  logs: StorageLogItem[];
  onClearLogs: () => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const StorageLogsTab: React.FC<StorageLogsTabProps> = ({
  logs,
  onClearLogs,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      log.target.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.adminUser.toLowerCase().includes(q) ||
      (log.provider && log.provider.toLowerCase().includes(q));

    return matchesAction && matchesSearch;
  });

  const exportLogsAsCsv = () => {
    if (logs.length === 0) {
      showToast('warning', 'Empty Logs', 'No logs available to export.');
      return;
    }

    const headers = ['ID', 'Timestamp', 'Action', 'Target', 'Storage Provider', 'Admin User', 'Details', 'Status'];
    const rows = logs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.target}"`,
      `"${l.provider || ''}"`,
      `"${l.adminUser}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `snappshub-storage-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('success', 'Logs Exported', 'Storage audit logs downloaded as CSV.');
  };

  const uploadCount = logs.filter((l) => l.action === 'upload').length;
  const deleteCount = logs.filter((l) => l.action === 'delete').length;
  const switchCount = logs.filter((l) => l.action === 'provider_switch' || l.action === 'default_changed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Storage Audit & Event Logs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical timeline of file uploads, deletions, and storage provider switches
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={exportLogsAsCsv}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear all storage historical logs?')) {
                onClearLogs();
                showToast('info', 'Logs Cleared', 'Storage audit log history was cleared.');
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Events</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums block mt-1">
            {logs.length}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Recorded actions</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">File Uploads</span>
          <span className="text-xl font-extrabold text-emerald-600 font-mono tabular-nums block mt-1">
            {uploadCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">New APKs & files</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Deletions</span>
          <span className="text-xl font-extrabold text-rose-600 font-mono tabular-nums block mt-1">
            {deleteCount}
          </span>
          <span className="text-[10px] text-rose-600 font-medium">Removed items</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block">Provider Switches</span>
          <span className="text-xl font-extrabold text-sky-600 font-mono tabular-nums block mt-1">
            {switchCount}
          </span>
          <span className="text-[10px] text-sky-600 font-medium">Endpoint changes</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by file name, admin username, provider, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto shrink-0 pb-1 sm:pb-0">
            <button
              onClick={() => setFilterAction('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterAction === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Logs ({logs.length})
            </button>
            <button
              onClick={() => setFilterAction('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterAction === 'upload'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Uploads ({uploadCount})
            </button>
            <button
              onClick={() => setFilterAction('delete')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterAction === 'delete'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Deletions ({deleteCount})
            </button>
            <button
              onClick={() => setFilterAction('provider_switch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterAction === 'provider_switch'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Switches ({switchCount})
            </button>
          </div>
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target File / Entity</th>
                <th className="py-3 px-4">Storage Provider</th>
                <th className="py-3 px-4">Admin User</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    No storage logs found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let badge = (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      <Info className="w-3 h-3" />
                      <span>EVENT</span>
                    </span>
                  );

                  if (log.action === 'upload') {
                    badge = (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <UploadCloud className="w-3 h-3 text-emerald-600" />
                        <span>UPLOAD</span>
                      </span>
                    );
                  } else if (log.action === 'delete') {
                    badge = (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>DELETED</span>
                      </span>
                    );
                  } else if (log.action === 'provider_switch' || log.action === 'default_changed') {
                    badge = (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        <ArrowRightLeft className="w-3 h-3 text-sky-600" />
                        <span>SWITCH</span>
                      </span>
                    );
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{badge}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center space-x-1.5">
                          <span className="truncate max-w-xs">{log.target}</span>
                          {log.fileSize && (
                            <span className="text-[10px] font-mono text-slate-400 font-normal">
                              ({log.fileSize})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                        {log.provider ? (
                          <div className="flex items-center space-x-1.5">
                            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.provider}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">&mdash;</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {log.adminUser.charAt(0)}
                          </div>
                          <span>{log.adminUser}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        <span className="line-clamp-1">{log.details}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

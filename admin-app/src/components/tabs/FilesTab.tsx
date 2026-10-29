import React, { useState } from 'react';
import { UploadCloud, Upload, FileCode2, Copy, Download, Trash2, Check, Search } from 'lucide-react';
import { UploadedFile, StorageProvider } from '../../types';

interface FilesTabProps {
  files: UploadedFile[];
  storageProviders: StorageProvider[];
  onUploadFiles: (newFiles: File[], selectedProvider: string) => void;
  onDeleteFile: (fileId: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const FilesTab: React.FC<FilesTabProps> = ({
  files,
  storageProviders,
  onUploadFiles,
  onDeleteFile,
  showToast
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>(
    storageProviders.find((s) => s.isDefault)?.name || 'Telegram Cloud'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fileSearch, setFileSearch] = useState('');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(Array.from(e.dataTransfer.files), selectedProvider);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(Array.from(e.target.files), selectedProvider);
      e.target.value = '';
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('success', 'URL Copied', 'Download link copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(fileSearch.toLowerCase()) ||
    f.provider.toLowerCase().includes(fileSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upload Box Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <span>Local File Upload & Storage Routing</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload APKs, XML manifest, or image icons directly to your cloud storage providers.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Route To:</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-600"
            >
              {storageProviders.map((sp) => (
                <option key={sp.id} value={sp.name}>
                  {sp.name} {sp.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-picker-input')?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            id="file-picker-input"
            onChange={handleFileChange}
            multiple
            accept=".apk,.xml,.png,.jpg,.webp,.zip"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-900">Click to select files or drag & drop</p>
          <p className="text-xs text-slate-400 mt-1">Supports APKs (.apk), XML (.xml), Images (.png, .webp) & ZIP (.zip)</p>
        </div>
      </div>

      {/* Files List Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-slate-900">Uploaded Files</h4>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {files.length} files
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              placeholder="Filter file by name..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Storage Provider</th>
                <th className="py-2.5 px-3">Uploaded</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No files found in storage.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <FileCode2 className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="truncate max-w-xs">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500">{file.size}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {file.provider}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{file.uploadedAt}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => copyToClipboard(file.url, file.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedId === file.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                          title="Download File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => onDeleteFile(file.id)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

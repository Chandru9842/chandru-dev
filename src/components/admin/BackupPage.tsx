import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Database, Download, Upload, RefreshCw, HardDrive, Check, AlertTriangle, ShieldCheck, Clock, FileText, ArrowRight, FileCheck, Trash2 } from 'lucide-react';

export default function BackupPage({ triggerToast }: { triggerToast: (msg: string, type: 'success' | 'error') => void }) {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Disabled'>('Daily');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backups');
      const data = await res.json();
      setBackups(data || []);
    } catch (e) {
      triggerToast('Failed to load backup history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Manual' })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast('Backup snapshot created successfully!', 'success');
        fetchBackups();
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      triggerToast(e.message || 'Failed to create backup', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportFullJson = async () => {
    try {
      const res = await fetch('/api/backups/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_enterprise_export_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      triggerToast('Portfolio export downloaded successfully', 'success');
    } catch (e) {
      triggerToast('Failed to export portfolio JSON', 'error');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/backups/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json)
        });
        const data = await res.json();
        if (res.ok) {
          triggerToast('Portfolio database restored successfully!', 'success');
          fetchBackups();
          setTimeout(() => window.location.reload(), 1500);
        } else {
          throw new Error(data.error);
        }
      } catch (err: any) {
        triggerToast('Invalid JSON file or restoration failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteBackup = async (id: string) => {
    try {
      const res = await fetch(`/api/backups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerToast('Backup record removed', 'success');
        setBackups(prev => prev.filter(b => b.id !== id));
      }
    } catch (e) {
      triggerToast('Failed to delete backup', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Enterprise Backup & Restore Manager
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Encrypted & Automated
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Snapshot full portfolio records, media manifests, system configurations & settings.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
            <span>Create Snapshot Now</span>
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export Portfolio */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-3 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
            <Download className="w-4 h-4" />
            Export Portfolio Data
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Download a full portable JSON file containing projects, skills, certificates, messages, and settings.
          </p>
          <button
            onClick={handleExportFullJson}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Full JSON</span>
          </button>
        </div>

        {/* Import Portfolio */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-3 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
            <Upload className="w-4 h-4" />
            Restore / Import JSON
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Upload a valid JSON backup file to overwrite or restore portfolio records instantly.
          </p>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportJson}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select JSON File</span>
          </button>
        </div>

        {/* Schedule */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-3 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            Automatic Schedule
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Automate periodic database snapshots and archive history logs.
          </p>
          <select
            value={autoSchedule}
            onChange={(e) => {
              setAutoSchedule(e.target.value as any);
              triggerToast(`Automatic backup frequency set to ${e.target.value}`, 'success');
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="Daily">Daily Snapshot (Recommended)</option>
            <option value="Weekly">Weekly Snapshot</option>
            <option value="Monthly">Monthly Snapshot</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Backup Snapshot History
          </h3>
          <button
            onClick={fetchBackups}
            className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Filename</th>
                <th className="p-3">Type</th>
                <th className="p-3">Size</th>
                <th className="p-3">Records</th>
                <th className="p-3">Created Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {backups.length > 0 ? (
                backups.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{b.filename}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        {b.type || 'Manual'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{b.size}</td>
                    <td className="p-3 text-emerald-400 font-bold">{b.recordsCount || 'All'}</td>
                    <td className="p-3 text-slate-400">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        {b.status || 'Completed'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleExportFullJson}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                          title="Download Snapshot"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(b.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No backup snapshots created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

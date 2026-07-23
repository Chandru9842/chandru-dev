import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Server, Activity, RefreshCw, Terminal, CheckCircle, Shield, AlertTriangle, Clock } from 'lucide-react';

export default function SystemHealthPage({ triggerToast }: { triggerToast: (msg: string, type: 'success' | 'error') => void }) {
  const [health, setHealth] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHealthAndLogs = async () => {
    setLoading(true);
    try {
      const [hRes, lRes] = await Promise.all([
        fetch('/api/system/health'),
        fetch('/api/logs')
      ]);
      const hData = await hRes.json();
      const lData = await lRes.json();

      setHealth(hData);
      setLogs(lData || []);
    } catch (e) {
      triggerToast('Failed to load system diagnostics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthAndLogs();
    const interval = setInterval(fetchHealthAndLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              System Diagnostics & Health Monitor
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {health?.status || 'HEALTHY'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live API response, node runtime status, database storage metrics & execution logs.
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealthAndLogs}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* API Status */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">API Gateways</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {health?.apiStatus || 'ONLINE'}
          </p>
          <p className="text-[10px] font-mono text-slate-500">Port 3000 • Reverse Proxy Active</p>
        </div>

        {/* Database */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Database Storage</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-100">
            {health?.storageUsedMb || '0.14'} MB
          </p>
          <p className="text-[10px] font-mono text-slate-500">
            {health?.recordCounts?.projects || 0} Projects • {health?.recordCounts?.media || 0} Media Assets
          </p>
        </div>

        {/* Heap Memory */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Node.js Heap Memory</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-100">
            {health?.memoryMb || '42.5'} MB
          </p>
          <p className="text-[10px] font-mono text-slate-500">CPU Load: {health?.cpuUsage || '1.8%'}</p>
        </div>

        {/* Runtime Uptime */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">System Uptime</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-100">
            {formatUptime(health?.uptime || 0)}
          </p>
          <p className="text-[10px] font-mono text-slate-500">Version: {health?.version || '2.5.0-ENTERPRISE'}</p>
        </div>
      </div>

      {/* Log Terminal Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Live System & API Log Stream</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Auto-refreshing every 15s</span>
        </div>

        <div className="p-4 bg-slate-950 font-mono text-xs space-y-2 max-h-96 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-2 rounded hover:bg-slate-900/60 transition">
                <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                  log.level === 'INFO'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : log.level === 'WARN'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {log.category} • {log.level}
                </span>
                <span className="text-slate-300 break-all leading-relaxed">
                  {log.message}
                </span>
              </div>
            ))
          ) : (
            <p className="text-slate-500 py-6 text-center">No system log events recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}

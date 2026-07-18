import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, RefreshCw, Trash2, Archive, 
  CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, 
  Database, Info, Eye, ShieldCheck, Settings, Globe, Loader2
} from 'lucide-react';

interface ActivityLog {
  timestamp: string;
  action: string;
  module: string;
  description: string;
  status: 'SUCCESS' | 'FAILED' | string;
  ip?: string;
  userAgent?: string;
  oldValue?: any;
  newValue?: any;
}

export default function ActivityHistoryPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
    return { 'Authorization': `Bearer ${token}` };
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/activity-history', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } else {
        setErrorMsg('Failed to fetch activity records from server.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error querying audit database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = async () => {
    if (!window.confirm('Purge all operational audit logs? This irreversible event will itself be recorded in system diagnostics.')) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/activity-history/clear', {
        method: 'POST',
        headers: getAuthHeader()
      });

      if (res.ok) {
        setSuccessMsg('Operational audit memory pool successfully cleared.');
        setLogs([]);
      } else {
        setErrorMsg('Authorization failed. System declined to purge logs.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while requesting log purge.');
    }
  };

  const handleArchiveLogs = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/activity-history/archive', {
        method: 'POST',
        headers: getAuthHeader()
      });

      if (res.ok) {
        setSuccessMsg('Current diagnostic memory pool successfully archived to historical vaults.');
        fetchLogs();
      } else {
        setErrorMsg('Failed to archive system files.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error during archival command dispatch.');
    }
  };

  // Extract unique module categories for filter list
  const modules = ['ALL', ...Array.from(new Set(logs.map(log => log.module || 'System')))];

  // Statistics summaries
  const totalActions = logs.length;
  const successfulActions = logs.filter(l => l.status === 'SUCCESS' || l.status === 'SUCCESSFUL').length;
  const failedActions = logs.filter(l => l.status === 'FAILED' || l.status === 'FAILURE').length;
  const authEvents = logs.filter(l => l.module === 'Authentication').length;

  // Filter application
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'SUCCESS' && (log.status === 'SUCCESS' || log.status === 'SUCCESSFUL')) ||
      (statusFilter === 'FAILED' && (log.status === 'FAILED' || log.status === 'FAILURE'));

    return matchesSearch && matchesModule && matchesStatus;
  });

  const toggleRow = (idx: number) => {
    if (expandedRow === idx) {
      setExpandedRow(null);
    } else {
      setExpandedRow(idx);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Activity History & Audit Logs
          </h2>
          <p className="text-xs text-slate-400">
            Real-time auditable stream of founder operations, authentication triggers, database logs, and security parameters modifications.
          </p>
        </div>

        {/* Audit Management tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload
          </button>
          <button
            onClick={handleArchiveLogs}
            disabled={totalActions === 0}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Archive className="w-3.5 h-3.5" />
            Archive
          </button>
          <button
            onClick={handleClearLogs}
            disabled={totalActions === 0}
            className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge Pool
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Statistic Blocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Actions */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-2.5 rounded-xl bg-slate-950 text-slate-400 border border-white/[0.03]">
            <Database className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider font-bold">Total Operations</span>
            <span className="text-xl font-bold font-mono text-slate-100">{totalActions}</span>
          </div>
        </div>

        {/* Successful Actions */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider font-bold">Successful Tasks</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{successfulActions}</span>
          </div>
        </div>

        {/* Lockout Events */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider font-bold">Failed Anomalies</span>
            <span className="text-xl font-bold font-mono text-rose-400">{failedActions}</span>
          </div>
        </div>

        {/* Authentications */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider font-bold">Auth Assertions</span>
            <span className="text-xl font-bold font-mono text-slate-100">{authEvents}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            placeholder="Search action names, audit descriptions, categories..."
          />
        </div>

        {/* Module Filter */}
        <div className="w-full md:w-48 flex items-center gap-2 bg-slate-950 px-3.5 py-1 rounded-xl border border-slate-800">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full bg-transparent border-0 text-xs text-slate-300 py-1.5 focus:ring-0 focus:outline-none font-mono"
          >
            {modules.map((mod, i) => (
              <option key={i} value={mod} className="bg-slate-950">{mod}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-40 flex items-center gap-2 bg-slate-950 px-3.5 py-1 rounded-xl border border-slate-800">
          <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent border-0 text-xs text-slate-300 py-1.5 focus:ring-0 focus:outline-none font-mono"
          >
            <option value="ALL" className="bg-slate-950">ALL STATUS</option>
            <option value="SUCCESS" className="bg-slate-950">SUCCESS</option>
            <option value="FAILED" className="bg-slate-950">FAILED</option>
          </select>
        </div>
      </div>

      {/* Main logs display list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-xs text-slate-400 font-mono">Discharging operational logs memory pools...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Module Class</th>
                  <th className="p-4">Operational Status</th>
                  <th className="p-4">Diagnostics Description</th>
                  <th className="p-4">Telemetry IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      No auditable operational events found matching selected parameters.
                    </td>
                  </tr>
                ) : (
                  [...filteredLogs].reverse().map((log, idx) => {
                    const isExpanded = expandedRow === idx;
                    const logStatus = log.status || 'SUCCESS';
                    const hasDetails = log.oldValue || log.newValue;

                    return (
                      <React.Fragment key={idx}>
                        <tr 
                          onClick={() => hasDetails && toggleRow(idx)}
                          className={`hover:bg-slate-800/15 transition-all duration-150 ${
                            hasDetails ? 'cursor-pointer' : ''
                          }`}
                        >
                          <td className="p-4 text-center">
                            {hasDetails && (
                              isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </td>
                          <td className="p-4 text-slate-400 shrink-0 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-4 font-bold text-slate-200">
                            {log.action}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                              {log.module}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              (logStatus === 'SUCCESS' || logStatus === 'SUCCESSFUL')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {(logStatus === 'SUCCESS' || logStatus === 'SUCCESSFUL') ? 'SUCCESS' : 'FAILED'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 font-sans leading-normal max-w-[280px]">
                            {log.description}
                          </td>
                          <td className="p-4 text-slate-500">
                            {log.ip || '127.0.0.1'}
                          </td>
                        </tr>

                        {/* Collapsible Row for Old/New Value comparison detail */}
                        {isExpanded && hasDetails && (
                          <tr className="bg-slate-950/50 border-t border-slate-800/30">
                            <td colSpan={7} className="p-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {log.oldValue && (
                                  <div className="space-y-1.5 text-left">
                                    <span className="text-[10px] font-mono uppercase text-rose-400 tracking-wider font-bold block">
                                      ← Old Configuration State
                                    </span>
                                    <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-[10px] text-slate-400 max-h-56 scrollbar-thin">
                                      {JSON.stringify(log.oldValue, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.newValue && (
                                  <div className="space-y-1.5 text-left">
                                    <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-bold block">
                                      → Updated Configuration State
                                    </span>
                                    <pre className="p-4 bg-slate-950 border border-emerald-500/10 rounded-xl overflow-x-auto text-[10px] text-emerald-300 max-h-56 scrollbar-thin">
                                      {JSON.stringify(log.newValue, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>

                              {log.userAgent && (
                                <div className="mt-4 pt-3 border-t border-slate-800/50 text-[10px] text-slate-500">
                                  <span className="font-bold font-mono">User Agent String:</span> {log.userAgent}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

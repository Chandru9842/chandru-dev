import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Database,
  ShieldCheck,
  Zap,
  RefreshCw,
  Lock,
  Server,
  Clock,
  TrendingUp,
  Play,
  Pause,
} from 'lucide-react';

type TimeRange = '1H' | '24H' | '7D' | '30D';
type ActiveView = 'overview' | 'logins' | 'transactions' | 'latency';

interface TelemetryDataPoint {
  time: string;
  successfulLogins: number;
  blockedAttempts: number;
  oauthHandshakes: number;
  dbReads: number;
  dbWrites: number;
  cacheHitRatio: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

const BASE_DATASETS: Record<TimeRange, TelemetryDataPoint[]> = {
  '1H': [
    { time: '08:00', successfulLogins: 14, blockedAttempts: 2, oauthHandshakes: 9, dbReads: 420, dbWrites: 115, cacheHitRatio: 98.4, p50Latency: 6.2, p95Latency: 11.4, p99Latency: 18.2 },
    { time: '08:05', successfulLogins: 19, blockedAttempts: 1, oauthHandshakes: 12, dbReads: 485, dbWrites: 132, cacheHitRatio: 98.7, p50Latency: 5.9, p95Latency: 10.8, p99Latency: 16.9 },
    { time: '08:10', successfulLogins: 24, blockedAttempts: 4, oauthHandshakes: 16, dbReads: 560, dbWrites: 168, cacheHitRatio: 98.1, p50Latency: 6.8, p95Latency: 12.6, p99Latency: 21.4 },
    { time: '08:15', successfulLogins: 21, blockedAttempts: 2, oauthHandshakes: 14, dbReads: 510, dbWrites: 144, cacheHitRatio: 98.9, p50Latency: 6.1, p95Latency: 11.1, p99Latency: 17.5 },
    { time: '08:20', successfulLogins: 32, blockedAttempts: 5, oauthHandshakes: 22, dbReads: 690, dbWrites: 210, cacheHitRatio: 97.8, p50Latency: 7.4, p95Latency: 14.2, p99Latency: 24.1 },
    { time: '08:25', successfulLogins: 28, blockedAttempts: 1, oauthHandshakes: 18, dbReads: 630, dbWrites: 185, cacheHitRatio: 98.6, p50Latency: 6.5, p95Latency: 11.9, p99Latency: 19.3 },
    { time: '08:30', successfulLogins: 36, blockedAttempts: 3, oauthHandshakes: 25, dbReads: 745, dbWrites: 228, cacheHitRatio: 99.1, p50Latency: 6.0, p95Latency: 11.2, p99Latency: 18.0 },
    { time: '08:35', successfulLogins: 31, blockedAttempts: 2, oauthHandshakes: 20, dbReads: 680, dbWrites: 196, cacheHitRatio: 99.0, p50Latency: 5.8, p95Latency: 10.6, p99Latency: 16.4 },
    { time: '08:40', successfulLogins: 42, blockedAttempts: 6, oauthHandshakes: 29, dbReads: 820, dbWrites: 264, cacheHitRatio: 98.5, p50Latency: 7.1, p95Latency: 13.5, p99Latency: 22.8 },
    { time: '08:45', successfulLogins: 38, blockedAttempts: 2, oauthHandshakes: 26, dbReads: 790, dbWrites: 240, cacheHitRatio: 99.2, p50Latency: 6.3, p95Latency: 11.5, p99Latency: 18.7 },
    { time: '08:50', successfulLogins: 45, blockedAttempts: 3, oauthHandshakes: 31, dbReads: 875, dbWrites: 282, cacheHitRatio: 99.3, p50Latency: 6.1, p95Latency: 11.0, p99Latency: 17.6 },
    { time: '08:55', successfulLogins: 49, blockedAttempts: 1, oauthHandshakes: 34, dbReads: 940, dbWrites: 310, cacheHitRatio: 99.4, p50Latency: 5.7, p95Latency: 10.4, p99Latency: 16.1 },
  ],
  '24H': [
    { time: '00:00', successfulLogins: 64, blockedAttempts: 8, oauthHandshakes: 41, dbReads: 1840, dbWrites: 490, cacheHitRatio: 98.9, p50Latency: 5.4, p95Latency: 9.8, p99Latency: 15.2 },
    { time: '03:00', successfulLogins: 48, blockedAttempts: 12, oauthHandshakes: 29, dbReads: 1420, dbWrites: 360, cacheHitRatio: 99.1, p50Latency: 5.1, p95Latency: 9.2, p99Latency: 14.5 },
    { time: '06:00', successfulLogins: 92, blockedAttempts: 6, oauthHandshakes: 64, dbReads: 2680, dbWrites: 740, cacheHitRatio: 98.6, p50Latency: 6.0, p95Latency: 11.4, p99Latency: 18.9 },
    { time: '09:00', successfulLogins: 186, blockedAttempts: 15, oauthHandshakes: 128, dbReads: 5420, dbWrites: 1640, cacheHitRatio: 98.2, p50Latency: 7.2, p95Latency: 13.8, p99Latency: 23.4 },
    { time: '12:00', successfulLogins: 214, blockedAttempts: 19, oauthHandshakes: 152, dbReads: 6390, dbWrites: 1980, cacheHitRatio: 98.5, p50Latency: 7.6, p95Latency: 14.5, p99Latency: 24.8 },
    { time: '15:00', successfulLogins: 198, blockedAttempts: 11, oauthHandshakes: 139, dbReads: 5890, dbWrites: 1790, cacheHitRatio: 98.8, p50Latency: 6.9, p95Latency: 12.9, p99Latency: 21.2 },
    { time: '18:00', successfulLogins: 232, blockedAttempts: 14, oauthHandshakes: 168, dbReads: 6840, dbWrites: 2150, cacheHitRatio: 99.0, p50Latency: 6.5, p95Latency: 12.1, p99Latency: 19.8 },
    { time: '21:00', successfulLogins: 145, blockedAttempts: 9, oauthHandshakes: 98, dbReads: 4120, dbWrites: 1190, cacheHitRatio: 99.3, p50Latency: 5.8, p95Latency: 10.6, p99Latency: 16.7 },
  ],
  '7D': [
    { time: 'Mon', successfulLogins: 940, blockedAttempts: 62, oauthHandshakes: 680, dbReads: 28400, dbWrites: 8420, cacheHitRatio: 98.6, p50Latency: 6.4, p95Latency: 12.2, p99Latency: 20.1 },
    { time: 'Tue', successfulLogins: 1120, blockedAttempts: 54, oauthHandshakes: 810, dbReads: 32900, dbWrites: 9640, cacheHitRatio: 98.8, p50Latency: 6.1, p95Latency: 11.7, p99Latency: 19.4 },
    { time: 'Wed', successfulLogins: 1280, blockedAttempts: 78, oauthHandshakes: 920, dbReads: 36800, dbWrites: 11200, cacheHitRatio: 98.4, p50Latency: 6.8, p95Latency: 13.1, p99Latency: 22.0 },
    { time: 'Thu', successfulLogins: 1190, blockedAttempts: 49, oauthHandshakes: 860, dbReads: 34500, dbWrites: 10300, cacheHitRatio: 99.0, p50Latency: 6.0, p95Latency: 11.4, p99Latency: 18.6 },
    { time: 'Fri', successfulLogins: 1450, blockedAttempts: 84, oauthHandshakes: 1040, dbReads: 41200, dbWrites: 12900, cacheHitRatio: 98.9, p50Latency: 6.5, p95Latency: 12.5, p99Latency: 20.8 },
    { time: 'Sat', successfulLogins: 890, blockedAttempts: 38, oauthHandshakes: 620, dbReads: 25600, dbWrites: 7200, cacheHitRatio: 99.2, p50Latency: 5.7, p95Latency: 10.5, p99Latency: 16.9 },
    { time: 'Sun', successfulLogins: 1020, blockedAttempts: 41, oauthHandshakes: 730, dbReads: 29800, dbWrites: 8650, cacheHitRatio: 99.3, p50Latency: 5.6, p95Latency: 10.2, p99Latency: 16.2 },
  ],
  '30D': [
    { time: 'Wk 1', successfulLogins: 6420, blockedAttempts: 310, oauthHandshakes: 4580, dbReads: 192000, dbWrites: 54800, cacheHitRatio: 98.7, p50Latency: 6.3, p95Latency: 12.0, p99Latency: 19.8 },
    { time: 'Wk 2', successfulLogins: 7180, blockedAttempts: 285, oauthHandshakes: 5190, dbReads: 218000, dbWrites: 62400, cacheHitRatio: 98.9, p50Latency: 6.1, p95Latency: 11.6, p99Latency: 18.9 },
    { time: 'Wk 3', successfulLogins: 7890, blockedAttempts: 340, oauthHandshakes: 5720, dbReads: 244000, dbWrites: 71200, cacheHitRatio: 99.1, p50Latency: 5.9, p95Latency: 11.2, p99Latency: 18.1 },
    { time: 'Wk 4', successfulLogins: 8640, blockedAttempts: 260, oauthHandshakes: 6310, dbReads: 268000, dbWrites: 78900, cacheHitRatio: 99.3, p50Latency: 5.7, p95Latency: 10.8, p99Latency: 17.2 },
  ],
};

export default function PlatformActivityInsights() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1H');
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [isLiveStream, setIsLiveStream] = useState<boolean>(true);
  const [streamData, setStreamData] = useState<TelemetryDataPoint[]>(BASE_DATASETS['1H']);

  useEffect(() => {
    setStreamData(BASE_DATASETS[timeRange]);
  }, [timeRange]);

  // Subtle live telemetry update when live stream is active
  useEffect(() => {
    if (!isLiveStream) return;
    const interval = setInterval(() => {
      setStreamData((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const jitter = (Math.random() - 0.48) * 0.08;
        const nextPoint: TelemetryDataPoint = {
          ...last,
          successfulLogins: Math.max(8, Math.round(last.successfulLogins * (1 + jitter))),
          blockedAttempts: Math.max(0, Math.round(last.blockedAttempts + (Math.random() > 0.7 ? 1 : 0))),
          oauthHandshakes: Math.max(5, Math.round(last.oauthHandshakes * (1 + jitter))),
          dbReads: Math.max(200, Math.round(last.dbReads * (1 + jitter))),
          dbWrites: Math.max(60, Math.round(last.dbWrites * (1 + jitter))),
          p50Latency: Number(Math.max(4.2, Math.min(9.5, last.p50Latency + (Math.random() - 0.5) * 0.4)).toFixed(1)),
          p95Latency: Number(Math.max(8.5, Math.min(18.0, last.p95Latency + (Math.random() - 0.5) * 0.7)).toFixed(1)),
          p99Latency: Number(Math.max(14.0, Math.min(28.0, last.p99Latency + (Math.random() - 0.5) * 1.1)).toFixed(1)),
        };
        return [...prev.slice(0, -1), nextPoint];
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [isLiveStream]);

  const handleSimulateBurst = () => {
    setStreamData((prev) =>
      prev.map((pt, idx) =>
        idx >= prev.length - 3
          ? {
              ...pt,
              successfulLogins: Math.round(pt.successfulLogins * 1.35),
              oauthHandshakes: Math.round(pt.oauthHandshakes * 1.4),
              dbReads: Math.round(pt.dbReads * 1.42),
              dbWrites: Math.round(pt.dbWrites * 1.38),
              p50Latency: Number((pt.p50Latency * 0.94).toFixed(1)),
              p95Latency: Number((pt.p95Latency * 0.95).toFixed(1)),
            }
          : pt
      )
    );
  };

  const aggregates = useMemo(() => {
    const totalLogins = streamData.reduce((acc, d) => acc + d.successfulLogins, 0);
    const totalBlocked = streamData.reduce((acc, d) => acc + d.blockedAttempts, 0);
    const totalTx = streamData.reduce((acc, d) => acc + d.dbReads + d.dbWrites, 0);
    const avgP95 =
      streamData.length > 0
        ? (
            streamData.reduce((acc, d) => acc + d.p95Latency, 0) /
            streamData.length
          ).toFixed(1)
        : '11.2';
    const avgP50 =
      streamData.length > 0
        ? (
            streamData.reduce((acc, d) => acc + d.p50Latency, 0) /
            streamData.length
          ).toFixed(1)
        : '6.1';

    return {
      totalLogins,
      totalBlocked,
      totalTx,
      avgP95,
      avgP50,
    };
  }, [streamData]);

  return (
    <div className="rounded-3xl bg-slate-900/75 border border-white/[0.08] backdrop-blur-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            <span>Platform Activity Insights</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">Recharts Telemetry Engine</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Authentication, Database Transactions & API Latency Telemetry
          </h3>
          <p className="text-xs text-slate-400">
            Real-time observability across JWT authentication gates, normalized 3NF database transaction pools, and microservice P50/P95/P99 response latencies.
          </p>
        </div>

        {/* Controls: Live Toggle, Burst Button & Time Horizon */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsLiveStream((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isLiveStream
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isLiveStream ? (
              <Pause className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{isLiveStream ? 'Live Telemetry' : 'Paused'}</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateBurst}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate Load Burst</span>
          </button>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-white/[0.08]">
            {(['1H', '24H', '7D', '30D'] as TimeRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Row + View Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <div
            onClick={() => setActiveView(activeView === 'logins' ? 'overview' : 'logins')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              activeView === 'logins'
                ? 'bg-emerald-950/40 border-emerald-500/50'
                : 'bg-slate-950/70 border-white/[0.06] hover:border-emerald-500/30'
            }`}
          >
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">
                Auth & Login Attempts
              </span>
              <span className="text-base sm:text-lg font-extrabold font-mono text-white tabular-nums">
                {aggregates.totalLogins.toLocaleString()}{' '}
                <span className="text-xs font-normal text-emerald-400">
                  ({aggregates.totalBlocked} throttled)
                </span>
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div
            onClick={() =>
              setActiveView(activeView === 'transactions' ? 'overview' : 'transactions')
            }
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              activeView === 'transactions'
                ? 'bg-cyan-950/40 border-cyan-500/50'
                : 'bg-slate-950/70 border-white/[0.06] hover:border-cyan-500/30'
            }`}
          >
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">
                DB Transaction Volume
              </span>
              <span className="text-base sm:text-lg font-extrabold font-mono text-white tabular-nums">
                {aggregates.totalTx.toLocaleString()}{' '}
                <span className="text-xs font-normal text-cyan-400">ops</span>
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Database className="w-4 h-4" />
            </div>
          </div>

          <div
            onClick={() => setActiveView(activeView === 'latency' ? 'overview' : 'latency')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              activeView === 'latency'
                ? 'bg-amber-950/40 border-amber-500/50'
                : 'bg-slate-950/70 border-white/[0.06] hover:border-amber-500/30'
            }`}
          >
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">
                API Request Latency
              </span>
              <span className="text-base sm:text-lg font-extrabold font-mono text-white tabular-nums">
                {aggregates.avgP50}ms{' '}
                <span className="text-xs font-normal text-amber-400">
                  (P95: {aggregates.avgP95}ms)
                </span>
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-white/[0.08] self-start lg:self-center">
          {(
            [
              { id: 'overview', label: 'All 3 Charts' },
              { id: 'logins', label: 'Logins' },
              { id: 'transactions', label: 'DB Volume' },
              { id: 'latency', label: 'API Latency' },
            ] as { id: ActiveView; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeView === tab.id
                  ? 'bg-white/10 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Grid */}
      <div
        className={`grid grid-cols-1 ${
          activeView === 'overview' ? 'xl:grid-cols-3' : 'grid-cols-1'
        } gap-5`}
      >
        {/* CHART 1: Simulated Login Attempts & Auth Handshakes */}
        {(activeView === 'overview' || activeView === 'logins') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold block">
                  01. Simulated Login Attempts
                </span>
                <p className="text-[11px] text-slate-400">
                  Verified JWT sessions, OAuth handshakes & throttled IPs
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                RS512 Guard
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={streamData}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: 'rgba(16, 185, 129, 0.35)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar
                    dataKey="successfulLogins"
                    name="Verified Logins"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="oauthHandshakes"
                    name="OAuth2 Handshakes"
                    fill="#14b8a6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="blockedAttempts"
                    name="Blocked / Rate-Limited"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Database Transaction Volume */}
        {(activeView === 'overview' || activeView === 'transactions') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold block">
                  02. Database Transaction Volume
                </span>
                <p className="text-[11px] text-slate-400">
                  Normalized 3NF read queries vs transactional write commits
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 tabular-nums">
                99.1% Cache Hit
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={streamData}
                  margin={{ top: 8, right: 8, left: -14, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="dbReadsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="dbWritesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: 'rgba(6, 182, 212, 0.35)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="dbReads"
                    name="Read Queries"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dbReadsGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="dbWrites"
                    name="Write Commits"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dbWritesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: API Request Latency Over Time */}
        {(activeView === 'overview' || activeView === 'latency') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold block">
                  03. API Request Latency Over Time
                </span>
                <p className="text-[11px] text-slate-400">
                  P50 median, P95 tail & P99 peak response times (ms)
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 tabular-nums">
                SLA &lt; 25ms
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={streamData}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="p95LatencyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    unit="ms"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: 'rgba(245, 158, 11, 0.35)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <ReferenceLine
                    y={25}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{
                      value: 'SLA Cap (25ms)',
                      fill: '#f43f5e',
                      fontSize: 9,
                      position: 'insideTopRight',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="p95Latency"
                    name="P95 Latency (ms)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#p95LatencyGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="p50Latency"
                    name="P50 Median (ms)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p99Latency"
                    name="P99 Peak (ms)"
                    stroke="#38bdf8"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

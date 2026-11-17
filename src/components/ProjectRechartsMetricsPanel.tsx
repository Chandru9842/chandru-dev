import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { motion } from 'motion/react';
import {
  Activity,
  Cpu,
  Gauge,
  HardDrive,
  Network,
  RefreshCw,
  Server,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { ProjectItem } from '../data/cmsMockData';

interface ProjectRechartsMetricsPanelProps {
  project: ProjectItem;
  onSoundClick?: (freq?: number) => void;
}

type HorizonKey = '1H' | '24H' | '7D' | '30D';
type SubViewKey = 'all' | 'traffic' | 'latency' | 'resources';

interface TelemetryPoint {
  time: string;
  requestsPerSec: number;
  bandwidthMbps: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  cpuPercent: number;
  memoryPercent: number;
  dbPoolPercent: number;
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function buildRechartsTelemetry(
  project: ProjectItem,
  horizon: HorizonKey,
  jitterSeed: number
): {
  data: TelemetryPoint[];
  peakRps: number;
  avgRps: number;
  avgP95Latency: number;
  avgP99Latency: number;
  avgCpu: number;
  avgMemory: number;
  avgDbPool: number;
} {
  const key = `${project.id || 1}-${project.slug || project.title || 'proj'}-${horizon}-${jitterSeed}`;
  const seed = hashSeed(key);
  const pointsCount = horizon === '1H' ? 12 : horizon === '24H' ? 12 : horizon === '7D' ? 14 : 15;

  const skillFactor = Math.min((project.skills?.length || 5) * 42, 360);
  const featuredFactor = project.isFeatured ? 1.32 : 1.0;
  const baseRps = Math.round((520 + (seed % 640) + skillFactor) * featuredFactor);
  const baseP50 = 11 + (seed % 9);

  const data: TelemetryPoint[] = [];

  for (let i = 0; i < pointsCount; i++) {
    const ptSeed = hashSeed(`${key}-slot-${i}`);
    const phase = (i / Math.max(1, pointsCount - 1)) * Math.PI * 2;
    const harmonic = Math.sin(phase + (seed % 5)) * 0.22 + Math.cos(phase * 1.7) * 0.08;
    const growth = (i / Math.max(1, pointsCount - 1)) * 0.16;

    const timeLabel =
      horizon === '1H'
        ? `-${(pointsCount - 1 - i) * 5}m`
        : horizon === '24H'
        ? `${String((i * 2) % 24).padStart(2, '0')}:00`
        : horizon === '7D'
        ? `Day ${i + 1}`
        : `D-${(pointsCount - i) * 2}`;

    const requestsPerSec = Math.max(
      140,
      Math.round(baseRps * (1 + harmonic + growth) + ((ptSeed % 90) - 45))
    );

    const bandwidthMbps = Number(
      Math.max(18, requestsPerSec * 0.085 + ((ptSeed % 17) - 8)).toFixed(1)
    );

    const p50LatencyMs = Number(
      Math.max(4.2, baseP50 + Math.sin(phase) * 2.4 + ((ptSeed % 11) - 5) * 0.25).toFixed(1)
    );
    const p95LatencyMs = Number(
      Math.max(p50LatencyMs + 6.5, p50LatencyMs * 1.72 + ((ptSeed % 13) - 4) * 0.4).toFixed(1)
    );
    const p99LatencyMs = Number(
      Math.max(p95LatencyMs + 5.2, p95LatencyMs * 1.34 + ((ptSeed % 15) - 5) * 0.55).toFixed(1)
    );

    const loadRatio = requestsPerSec / Math.max(1, baseRps * 1.35);
    const cpuPercent = Math.min(
      92,
      Math.max(24, Math.round(38 + loadRatio * 34 + ((ptSeed % 11) - 5)))
    );
    const memoryPercent = Math.min(
      88,
      Math.max(32, Math.round(48 + loadRatio * 22 + Math.cos(phase) * 5))
    );
    const dbPoolPercent = Math.min(
      85,
      Math.max(18, Math.round(30 + loadRatio * 31 + ((ptSeed % 9) - 4)))
    );

    data.push({
      time: timeLabel,
      requestsPerSec,
      bandwidthMbps,
      p50LatencyMs,
      p95LatencyMs,
      p99LatencyMs,
      cpuPercent,
      memoryPercent,
      dbPoolPercent,
    });
  }

  const peakRps = Math.max(...data.map((d) => d.requestsPerSec));
  const avgRps = Math.round(
    data.reduce((acc, d) => acc + d.requestsPerSec, 0) / Math.max(1, data.length)
  );
  const avgP95Latency = Number(
    (
      data.reduce((acc, d) => acc + d.p95LatencyMs, 0) / Math.max(1, data.length)
    ).toFixed(1)
  );
  const avgP99Latency = Number(
    (
      data.reduce((acc, d) => acc + d.p99LatencyMs, 0) / Math.max(1, data.length)
    ).toFixed(1)
  );
  const avgCpu = Math.round(
    data.reduce((acc, d) => acc + d.cpuPercent, 0) / Math.max(1, data.length)
  );
  const avgMemory = Math.round(
    data.reduce((acc, d) => acc + d.memoryPercent, 0) / Math.max(1, data.length)
  );
  const avgDbPool = Math.round(
    data.reduce((acc, d) => acc + d.dbPoolPercent, 0) / Math.max(1, data.length)
  );

  return {
    data,
    peakRps,
    avgRps,
    avgP95Latency,
    avgP99Latency,
    avgCpu,
    avgMemory,
    avgDbPool,
  };
}

function CustomGlassTooltip({ active, payload, label, unitMap }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl bg-slate-950/95 border border-emerald-500/40 backdrop-blur-xl px-3.5 py-2.5 shadow-2xl text-xs font-mono space-y-1.5">
      <div className="text-[10px] font-bold text-slate-400 border-b border-white/[0.08] pb-1 flex items-center justify-between gap-4">
        <span>WINDOW SLOT</span>
        <span className="text-emerald-300 tabular-nums">{label}</span>
      </div>
      <div className="space-y-1">
        {payload.map((entry: any, idx: number) => {
          const suffix = unitMap?.[entry.dataKey] || '';
          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-5 text-[11px] tabular-nums"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-white">
                {entry.value}
                {suffix}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProjectRechartsMetricsPanel({
  project,
  onSoundClick,
}: ProjectRechartsMetricsPanelProps) {
  const [horizon, setHorizon] = useState<HorizonKey>('24H');
  const [subView, setSubView] = useState<SubViewKey>('all');
  const [sampleSeed, setSampleSeed] = useState<number>(0);

  const telemetry = useMemo(
    () => buildRechartsTelemetry(project, horizon, sampleSeed),
    [project, horizon, sampleSeed]
  );

  const unitMap = {
    requestsPerSec: ' req/s',
    bandwidthMbps: ' MB/s',
    p50LatencyMs: ' ms',
    p95LatencyMs: ' ms',
    p99LatencyMs: ' ms',
    cpuPercent: '%',
    memoryPercent: '%',
    dbPoolPercent: '%',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl bg-gradient-to-b from-[#040d1a] via-[#030814] to-[#020617] border border-emerald-500/30 p-4 sm:p-5 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(52,211,153,0.22)] relative overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Ambient Illumination */}
      <div className="pointer-events-none absolute -top-20 left-1/4 w-72 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 w-72 h-32 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Top Console Controls Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 border-b border-white/[0.08] pb-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Gauge className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs sm:text-sm font-mono font-extrabold uppercase tracking-wider text-white">
                Performance Metrics &amp; Resource Telemetry
              </h4>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Recharts Engine
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Interactive throughput, P50/P95/P99 response latency, and container resource utilization for {project.title}
            </p>
          </div>
        </div>

        {/* Sub-View Filter & Time Horizon Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Focus Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900/95 border border-white/[0.08] text-[10px] font-mono">
            {(
              [
                { id: 'all', label: 'All Charts' },
                { id: 'traffic', label: 'Traffic' },
                { id: 'latency', label: 'Latency' },
                { id: 'resources', label: 'Resources' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSoundClick?.(820);
                  setSubView(tab.id);
                }}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  subView === tab.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time Horizon Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900/95 border border-white/[0.08] text-[10px] font-mono">
            {(['1H', '24H', '7D', '30D'] as HorizonKey[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  onSoundClick?.(900);
                  setHorizon(h);
                }}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  horizon === h
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Resample Telemetry Button */}
          <button
            type="button"
            onClick={() => {
              onSoundClick?.(960);
              setSampleSeed((prev) => prev + 1);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/35 text-[10px] font-mono text-slate-300 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
            title="Poll new telemetry sample"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sample</span>
          </button>
        </div>
      </div>

      {/* 4-Column Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>PEAK TRAFFIC</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base sm:text-lg font-mono font-extrabold text-emerald-300 tabular-nums">
            {telemetry.peakRps.toLocaleString()} req/s
          </div>
          <div className="text-[10px] font-mono text-slate-400 tabular-nums">
            Avg: {telemetry.avgRps.toLocaleString()} req/s
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/20 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>P95 / P99 LATENCY</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-base sm:text-lg font-mono font-extrabold text-cyan-300 tabular-nums">
            {telemetry.avgP95Latency} ms
          </div>
          <div className="text-[10px] font-mono text-slate-400 tabular-nums">
            P99 Tail: {telemetry.avgP99Latency} ms
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/90 border border-purple-500/20 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>CPU COMPUTE LOAD</span>
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-base sm:text-lg font-mono font-extrabold text-purple-300 tabular-nums">
            {telemetry.avgCpu}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 tabular-nums">
            JVM / Worker Threads
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/20 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>HEAP &amp; DB POOL</span>
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-mono font-extrabold text-amber-300 tabular-nums">
            {telemetry.avgMemory}% / {telemetry.avgDbPool}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 tabular-nums">
            Zero OOM / Pool Healthy
          </div>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div
        className={`grid grid-cols-1 ${
          subView === 'all' ? 'xl:grid-cols-2' : 'grid-cols-1'
        } gap-4 relative z-10`}
      >
        {/* CHART 1: Simulated Traffic & Bandwidth AreaChart */}
        {(subView === 'all' || subView === 'traffic') && (
          <div
            className={`rounded-2xl bg-[#040916]/95 border border-white/[0.08] p-4 space-y-3 ${
              subView === 'all' ? 'xl:col-span-2' : ''
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300">
                  <Network className="w-3.5 h-3.5 text-emerald-400" />
                  <span>INGRESS REQUEST TRAFFIC &amp; BANDWIDTH ({horizon})</span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  Concurrent HTTP/gRPC requests per second (req/s) and edge payload throughput (MB/s)
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                  <span>Requests/sec</span>
                </span>
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
                  <span>Bandwidth (MB/s)</span>
                </span>
              </div>
            </div>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={telemetry.data}
                  margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={`rcTrafficGrad-${project.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id={`rcBwGrad-${project.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip content={<CustomGlassTooltip unitMap={unitMap} />} />
                  <Area
                    type="monotone"
                    dataKey="requestsPerSec"
                    name="Requests"
                    stroke="#10b981"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill={`url(#rcTrafficGrad-${project.id})`}
                  />
                  <Area
                    type="monotone"
                    dataKey="bandwidthMbps"
                    name="Bandwidth"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#rcBwGrad-${project.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Multi-Percentile Response Latency LineChart (P50 / P95 / P99) */}
        {(subView === 'all' || subView === 'latency') && (
          <div className="rounded-2xl bg-[#040916]/95 border border-white/[0.08] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RESPONSE LATENCY DISTRIBUTION (P50 / P95 / P99)</span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  End-to-end API execution &amp; query response time in milliseconds
                </p>
              </div>
              <div className="flex items-center gap-2.5 text-[10px] font-mono">
                <span className="text-emerald-300">● P50</span>
                <span className="text-cyan-300">● P95</span>
                <span className="text-amber-300">● P99</span>
              </div>
            </div>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={telemetry.data}
                  margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip content={<CustomGlassTooltip unitMap={unitMap} />} />
                  <Line
                    type="monotone"
                    dataKey="p50LatencyMs"
                    name="P50 Median"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#10b981' }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p95LatencyMs"
                    name="P95 Latency"
                    stroke="#38bdf8"
                    strokeWidth={2.2}
                    dot={{ r: 2, fill: '#38bdf8' }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p99LatencyMs"
                    name="P99 Tail"
                    stroke="#f59e0b"
                    strokeWidth={1.8}
                    strokeDasharray="4 2"
                    dot={{ r: 2, fill: '#f59e0b' }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: Container Resource Utilization BarChart (CPU, Memory, DB Pool) */}
        {(subView === 'all' || subView === 'resources') && (
          <div className="rounded-2xl bg-[#040916]/95 border border-white/[0.08] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300">
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                  <span>RESOURCE UTILIZATION (CPU / HEAP / DB POOL)</span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  Compute saturation, JVM/Node heap allocation &amp; HikariCP pool usage (%)
                </p>
              </div>
              <div className="flex items-center gap-2.5 text-[10px] font-mono">
                <span className="text-purple-300">■ CPU</span>
                <span className="text-emerald-300">■ Heap</span>
                <span className="text-cyan-300">■ DB Pool</span>
              </div>
            </div>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={telemetry.data}
                  margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip content={<CustomGlassTooltip unitMap={unitMap} />} />
                  <Bar
                    dataKey="cpuPercent"
                    name="CPU Load"
                    fill="#a855f7"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="memoryPercent"
                    name="Heap Memory"
                    fill="#10b981"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="dbPoolPercent"
                    name="DB Pool"
                    fill="#06b6d4"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

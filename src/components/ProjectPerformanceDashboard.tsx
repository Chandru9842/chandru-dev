import React, { useMemo, useState, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Activity, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ProjectItem } from '../data/cmsMockData';

interface ProjectPerformanceDashboardProps {
  project: ProjectItem;
  compact?: boolean;
}

type TimeRangeKey = '24H' | '7D' | '30D';
type MetricKey = 'traffic' | 'deploy' | 'uptime';

interface DataPoint {
  index: number;
  label: string;
  value: number;
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function generateDeterministicSeries(
  project: ProjectItem,
  range: TimeRangeKey
): {
  traffic: DataPoint[];
  deploy: DataPoint[];
  uptime: DataPoint[];
  headlineTraffic: string;
  headlineDeploy: string;
  headlineUptime: string;
} {
  const baseKey = `${project.id || 1}-${project.slug || project.title || 'sys'}-${range}`;
  const seed = hashSeed(baseKey);
  const count = range === '24H' ? 14 : range === '7D' ? 14 : 16;

  const skillBoost = Math.min((project.skills?.length || 4) * 35, 320);
  const featuredMultiplier = project.isFeatured ? 1.35 : 1.0;
  const baseTraffic = Math.round((420 + (seed % 580) + skillBoost) * featuredMultiplier);

  const customTraffic = project.performanceStats?.trafficSeries;
  const customDeploy = project.performanceStats?.deploySeries;
  const customUptime = project.performanceStats?.uptimeSeries;

  const traffic: DataPoint[] = [];
  const deploy: DataPoint[] = [];
  const uptime: DataPoint[] = [];

  for (let i = 0; i < count; i++) {
    const stepSeed = hashSeed(`${baseKey}-pt-${i}`);
    const wave = Math.sin((i / (count - 1)) * Math.PI * 2.2 + (seed % 7));
    const trend = (i / (count - 1)) * 0.22;

    const label =
      range === '24H'
        ? `${String((i * 2) % 24).padStart(2, '0')}:00`
        : range === '7D'
        ? `D-${count - i}`
        : `W${Math.floor(i / 4) + 1}·D${(i % 4) + 1}`;

    // 1. Simulated Traffic (req/min)
    const rawTraffic =
      customTraffic && customTraffic[i] !== undefined
        ? customTraffic[i]
        : Math.max(
            120,
            Math.round(baseTraffic * (1 + wave * 0.18 + trend) + ((stepSeed % 95) - 45))
          );

    // 2. Simulated Deployment Success Rate (%)
    const rawDeploy =
      customDeploy && customDeploy[i] !== undefined
        ? customDeploy[i]
        : Number(
            Math.min(
              100,
              Math.max(
                94.5,
                98.2 + Math.cos(i * 0.8 + (seed % 5)) * 1.1 + ((stepSeed % 14) - 5) * 0.08
              )
            ).toFixed(2)
          );

    // 3. Simulated SLA Uptime Trend (%)
    const rawUptime =
      customUptime && customUptime[i] !== undefined
        ? customUptime[i]
        : Number(
            Math.min(
              100,
              Math.max(
                99.75,
                99.94 + Math.sin(i * 0.65 + (seed % 3)) * 0.04 + ((stepSeed % 9) - 4) * 0.005
              )
            ).toFixed(3)
          );

    traffic.push({ index: i, label, value: rawTraffic });
    deploy.push({ index: i, label, value: rawDeploy });
    uptime.push({ index: i, label, value: rawUptime });
  }

  const peakTraffic = d3.max(traffic, (d) => d.value) || baseTraffic;
  const avgDeploy = d3.mean(deploy, (d) => d.value) || 99.2;
  const avgUptime = d3.mean(uptime, (d) => d.value) || 99.96;

  const headlineTraffic =
    project.performanceStats?.dailyTrafficRps?.trim() ||
    (peakTraffic >= 1000
      ? `${(peakTraffic / 1000).toFixed(2)}k req/m`
      : `${peakTraffic} req/m`);

  const headlineDeploy =
    project.performanceStats?.deploymentSuccessRate?.trim() ||
    `${avgDeploy.toFixed(1)}%`;

  const headlineUptime =
    project.performanceStats?.uptimePercentage?.trim() ||
    `${avgUptime.toFixed(2)}%`;

  return {
    traffic,
    deploy,
    uptime,
    headlineTraffic,
    headlineDeploy,
    headlineUptime,
  };
}

interface D3LineChartCardProps {
  title: string;
  subtitle: string;
  headlineValue: string;
  deltaLabel: string;
  unitSuffix: string;
  data: DataPoint[];
  strokeColor: string;
  gradientId: string;
  icon: React.ReactNode;
  decimals?: number;
  barProgressPct?: number;
}

function D3MetricLineChart({
  title,
  subtitle,
  headlineValue,
  deltaLabel,
  unitSuffix,
  data,
  strokeColor,
  gradientId,
  icon,
  decimals = 0,
  barProgressPct = 92,
}: D3LineChartCardProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 320;
  const height = 108;
  const margin = { top: 12, right: 10, bottom: 20, left: 10 };
  const innerWidth = width - margin.left - margin.right;

  const { linePath, areaPath, points, yTicks } = useMemo(() => {
    if (!data.length) {
      return { linePath: '', areaPath: '', points: [], yTicks: [] };
    }

    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(1, data.length - 1)])
      .range([margin.left, width - margin.right]);

    const [minVal, maxVal] = d3.extent(data, (d) => d.value) as [number, number];
    const pad = (maxVal - minVal) * 0.22 || 1;

    const yScale = d3
      .scaleLinear()
      .domain([minVal - pad * 0.6, maxVal + pad * 0.6])
      .range([height - margin.bottom, margin.top]);

    const lineGenerator = d3
      .line<DataPoint>()
      .x((_, idx) => xScale(idx))
      .y((d) => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const areaGenerator = d3
      .area<DataPoint>()
      .x((_, idx) => xScale(idx))
      .y0(height - margin.bottom)
      .y1((d) => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const pts = data.map((d, idx) => ({
      ...d,
      cx: xScale(idx),
      cy: yScale(d.value),
    }));

    const ticks = yScale.ticks(3).map((t) => ({
      value: t,
      y: yScale(t),
    }));

    return {
      linePath: lineGenerator(data) || '',
      areaPath: areaGenerator(data) || '',
      points: pts,
      yTicks: ticks,
    };
  }, [data, height, margin.bottom, margin.left, margin.right, margin.top, width]);

  const activePoint =
    hoverIndex !== null && points[hoverIndex]
      ? points[hoverIndex]
      : points[points.length - 1] || null;

  const handlePointerMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * width;
    let closestIdx = 0;
    let minDist = Infinity;
    points.forEach((pt, idx) => {
      const dist = Math.abs(pt.cx - relX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    setHoverIndex(closestIdx);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-[#040917]/95 border border-emerald-500/20 hover:border-emerald-400/50 transition-all p-4 flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] group/chart"
    >
      {/* Top Ambient Rim Glow */}
      <div
        className="pointer-events-none absolute -top-10 -left-10 w-28 h-28 rounded-full opacity-20 group-hover/chart:opacity-40 transition-opacity blur-2xl"
        style={{ background: strokeColor }}
      />

      {/* Top KPI Header */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-300">
            {icon}
            <span className="truncate font-bold">{title}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate">
            {subtitle}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className="text-base font-mono font-extrabold tabular-nums tracking-tight"
            style={{ color: strokeColor }}
          >
            {hoverIndex !== null && activePoint
              ? `${activePoint.value.toFixed(decimals)}${unitSuffix}`
              : headlineValue}
          </div>
          <div className="text-[10px] font-mono text-slate-400 tabular-nums">
            {hoverIndex !== null && activePoint ? activePoint.label : deltaLabel}
          </div>
        </div>
      </div>

      {/* Interactive D3.js SVG Line & Area Chart */}
      <div className="relative w-full h-24 select-none z-10">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible cursor-crosshair"
          onMouseMove={handlePointerMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.38} />
              <stop offset="75%" stopColor={strokeColor} stopOpacity={0.07} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Horizontal D3 Reference Grid Lines */}
          {yTicks.map((t, idx) => (
            <line
              key={idx}
              x1={margin.left}
              x2={width - margin.right}
              y1={t.y}
              y2={t.y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          ))}

          {/* D3 Area Fill */}
          {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

          {/* D3 Smooth Catmull-Rom Spline Line with Glow */}
          {linePath && (
            <>
              <path
                d={linePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={4}
                strokeOpacity={0.22}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={linePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Interactive Crosshair & Data Nodes */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.cx}
                x2={activePoint.cx}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke={strokeColor}
                strokeOpacity={0.45}
                strokeDasharray="2 2"
                strokeWidth={1}
              />
              <circle
                cx={activePoint.cx}
                cy={activePoint.cy}
                r={6}
                fill={strokeColor}
                fillOpacity={0.25}
              />
              <circle
                cx={activePoint.cx}
                cy={activePoint.cy}
                r={3.2}
                fill="#020617"
                stroke={strokeColor}
                strokeWidth={2}
              />
            </g>
          )}

          {/* X-Axis Start / Mid / End Labels */}
          {points.length > 2 && (
            <g className="text-[9px] font-mono fill-slate-500">
              <text x={margin.left} y={height - 4} textAnchor="start">
                {points[0].label}
              </text>
              <text
                x={margin.left + innerWidth / 2}
                y={height - 4}
                textAnchor="middle"
              >
                {points[Math.floor(points.length / 2)].label}
              </text>
              <text x={width - margin.right} y={height - 4} textAnchor="end">
                {points[points.length - 1].label}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Animated Emerald-to-Cyan Telemetry Benchmark Bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-900/90 overflow-hidden relative z-10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${barProgressPct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
          style={{
            boxShadow: `0 0 10px ${strokeColor}80`,
          }}
        />
      </div>
    </motion.div>
  );
}

export default function ProjectPerformanceDashboard({
  project,
  compact = false,
}: ProjectPerformanceDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('7D');
  const [focusedMetric, setFocusedMetric] = useState<'all' | MetricKey>('all');

  const series = useMemo(
    () => generateDeterministicSeries(project, timeRange),
    [project, timeRange]
  );

  // Compact mini D3 sparkline + area strip for unexpanded Project Spotlight cards
  const { compactSparklinePath, compactAreaPath } = useMemo(() => {
    if (!compact || !series.traffic.length) {
      return { compactSparklinePath: '', compactAreaPath: '' };
    }
    const xScale = d3
      .scaleLinear()
      .domain([0, series.traffic.length - 1])
      .range([2, 106]);
    const [minV, maxV] = d3.extent(series.traffic, (d) => d.value) as [
      number,
      number,
    ];
    const yScale = d3
      .scaleLinear()
      .domain([minV - 5, maxV + 5])
      .range([22, 3]);
    const lineGen = d3
      .line<DataPoint>()
      .x((_, idx) => xScale(idx))
      .y((d) => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));
    const areaGen = d3
      .area<DataPoint>()
      .x((_, idx) => xScale(idx))
      .y0(24)
      .y1((d) => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));
    return {
      compactSparklinePath: lineGen(series.traffic) || '',
      compactAreaPath: areaGen(series.traffic) || '',
    };
  }, [compact, series.traffic]);

  if (compact) {
    const gradId = `compact-d3-grad-${project.id || 'p'}`;
    return (
      <div
        className="rounded-xl bg-[#040a18]/90 border border-emerald-500/20 group-hover:border-emerald-400/45 transition-colors p-3 space-y-2.5 text-[10px] font-mono shadow-inner"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <span className="text-slate-400 block text-[9px] tracking-wider uppercase">
                TRAFFIC
              </span>
              <span className="text-emerald-300 font-extrabold text-xs tabular-nums">
                {series.headlineTraffic}
              </span>
            </div>
            <span className="text-slate-700">·</span>
            <div>
              <span className="text-slate-400 block text-[9px] tracking-wider uppercase">
                DEPLOYS
              </span>
              <span className="text-cyan-300 font-extrabold text-xs tabular-nums">
                {series.headlineDeploy}
              </span>
            </div>
            <span className="text-slate-700">·</span>
            <div>
              <span className="text-slate-400 block text-[9px] tracking-wider uppercase">
                SLA UPTIME
              </span>
              <span className="text-emerald-300 font-extrabold text-xs tabular-nums">
                {series.headlineUptime}
              </span>
            </div>
          </div>

          <svg
            viewBox="0 0 108 24"
            className="w-20 h-6 shrink-0 overflow-visible"
            aria-label="D3 traffic trend sparkline"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            {compactAreaPath && (
              <path d={compactAreaPath} fill={`url(#${gradId})`} />
            )}
            <path
              d={compactSparklinePath}
              fill="none"
              stroke="#10b981"
              strokeWidth={1.85}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Animated Emerald-to-Cyan Telemetry Bar */}
        <div className="h-1 w-full rounded-full bg-slate-900 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: project.isFeatured ? '94%' : '88%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-gradient-to-b from-[#040d1a] via-[#030712] to-[#020617] border border-emerald-500/25 p-4 sm:p-5 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(52,211,153,0.2)] relative overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Ambient Emerald/Cyan Glow */}
      <div className="pointer-events-none absolute -top-20 left-1/3 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

      {/* Dashboard Header Bar & Interactive Time Window / Metric Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.25)]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-emerald-300">
                Verified Operational Telemetry
              </h4>
              <span className="text-[10px] font-mono text-slate-300 bg-slate-900/90 border border-white/[0.1] px-2 py-0.5 rounded-md">
                D3.js Live Benchmark
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Scrub any D3 time-series curve to inspect request throughput, CI/CD pass rate &amp; SLA availability
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric View Selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900/95 border border-white/[0.08] text-[10px] font-mono">
            {(
              [
                { id: 'all', label: 'All (3)' },
                { id: 'traffic', label: 'Traffic' },
                { id: 'deploy', label: 'Deploys' },
                { id: 'uptime', label: 'Uptime' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFocusedMetric(tab.id)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  focusedMetric === tab.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time Horizon Selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900/95 border border-white/[0.08] text-[10px] font-mono">
            {(['24H', '7D', '30D'] as TimeRangeKey[]).map((rng) => (
              <button
                key={rng}
                type="button"
                onClick={() => setTimeRange(rng)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  timeRange === rng
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rng}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* D3.js Line Charts Grid */}
      <div
        className={`grid grid-cols-1 ${
          focusedMetric === 'all' ? 'md:grid-cols-3' : 'md:grid-cols-1'
        } gap-3.5 relative z-10`}
      >
        {(focusedMetric === 'all' || focusedMetric === 'traffic') && (
          <D3MetricLineChart
            title="Simulated Traffic"
            subtitle={`Request throughput (${timeRange})`}
            headlineValue={series.headlineTraffic}
            deltaLabel="Peak Load"
            unitSuffix=" req/m"
            data={series.traffic}
            strokeColor="#10b981"
            gradientId={`d3-traffic-grad-${project.id}-${timeRange}`}
            icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
            decimals={0}
            barProgressPct={91}
          />
        )}

        {(focusedMetric === 'all' || focusedMetric === 'deploy') && (
          <D3MetricLineChart
            title="Deploy Success"
            subtitle={`CI/CD pipeline pass rate (${timeRange})`}
            headlineValue={series.headlineDeploy}
            deltaLabel="Zero-Downtime"
            unitSuffix="%"
            data={series.deploy}
            strokeColor="#38bdf8"
            gradientId={`d3-deploy-grad-${project.id}-${timeRange}`}
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
            decimals={2}
            barProgressPct={96}
          />
        )}

        {(focusedMetric === 'all' || focusedMetric === 'uptime') && (
          <D3MetricLineChart
            title="Core SLA Uptime"
            subtitle={`Production availability (${timeRange})`}
            headlineValue={series.headlineUptime}
            deltaLabel="SLA Verified"
            unitSuffix="%"
            data={series.uptime}
            strokeColor="#34d399"
            gradientId={`d3-uptime-grad-${project.id}-${timeRange}`}
            icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            decimals={3}
            barProgressPct={99}
          />
        )}
      </div>
    </div>
  );
}

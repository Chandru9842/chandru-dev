import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import {
  Activity,
  Award,
  BarChart2,
  Braces,
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  Flame,
  Github,
  Layers,
  Link,
  Sparkles,
  Terminal,
  TrendingUp,
} from 'lucide-react';
import { CodingProfileItem } from '../data/cmsMockData';

interface CodingProfileSpotlightCardProps {
  profile: CodingProfileItem;
  index: number;
  prefersReduced: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
  soundFx: {
    playClick: (freq?: number) => void;
    playHover: () => void;
    playSuccess: () => void;
    playTab: (freq?: number) => void;
  };
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function getCodingPlatformIcon(platform: string) {
  switch (platform) {
    case 'GitHub':
      return Github;
    case 'LeetCode':
      return Code2;
    case 'GeeksforGeeks':
      return Cpu;
    case 'Codeforces':
      return Activity;
    case 'CodeChef':
      return Braces;
    case 'HackerRank':
      return Terminal;
    case 'HackerEarth':
      return Layers;
    case 'AtCoder':
      return BarChart2;
    case 'TopCoder':
      return Award;
    default:
      return Link;
  }
}

interface PlatformTheme {
  primaryHex: string;
  secondaryHex: string;
  borderClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  defaultBadge: string;
  defaultSolved: string;
  defaultRating: string;
  defaultPercentile: string;
  defaultLang: string;
  metricLabel1: string;
  metricLabel2: string;
  metricLabel3: string;
}

function getPlatformTheme(platform: string): PlatformTheme {
  switch (platform) {
    case 'GitHub':
      return {
        primaryHex: '#a855f7',
        secondaryHex: '#38bdf8',
        borderClass: 'hover:border-purple-400/70',
        badgeBgClass: 'bg-purple-500/15 border-purple-400/35',
        badgeTextClass: 'text-purple-300',
        defaultBadge: 'Open-Source Architect',
        defaultSolved: '45+ Repositories',
        defaultRating: '1,420+ Commits',
        defaultPercentile: '99.2% Active',
        defaultLang: 'Java 21 · TypeScript',
        metricLabel1: 'REPOSITORIES',
        metricLabel2: 'COMMIT VELOCITY',
        metricLabel3: 'UPTIME STREAK',
      };
    case 'LeetCode':
      return {
        primaryHex: '#f59e0b',
        secondaryHex: '#10b981',
        borderClass: 'hover:border-amber-400/70',
        badgeBgClass: 'bg-amber-500/15 border-amber-400/35',
        badgeTextClass: 'text-amber-300',
        defaultBadge: 'Algorithmic Knight',
        defaultSolved: '650+ Solved',
        defaultRating: '1,985 Rating',
        defaultPercentile: 'Top 2.4%',
        defaultLang: 'Java · C++',
        metricLabel1: 'PROBLEMS SOLVED',
        metricLabel2: 'CONTEST RATING',
        metricLabel3: 'GLOBAL RANKING',
      };
    case 'GeeksforGeeks':
      return {
        primaryHex: '#10b981',
        secondaryHex: '#06b6d4',
        borderClass: 'hover:border-emerald-400/70',
        badgeBgClass: 'bg-emerald-500/15 border-emerald-400/35',
        badgeTextClass: 'text-emerald-300',
        defaultBadge: 'DSA Specialist',
        defaultSolved: '520+ Solved',
        defaultRating: '1,840 Coding Score',
        defaultPercentile: 'Institute Top #3',
        defaultLang: 'Java · Spring',
        metricLabel1: 'PROBLEMS SOLVED',
        metricLabel2: 'CODING SCORE',
        metricLabel3: 'STANDING',
      };
    case 'Codeforces':
      return {
        primaryHex: '#f43f5e',
        secondaryHex: '#f59e0b',
        borderClass: 'hover:border-rose-400/70',
        badgeBgClass: 'bg-rose-500/15 border-rose-400/35',
        badgeTextClass: 'text-rose-300',
        defaultBadge: 'Competitive Specialist',
        defaultSolved: '480+ Solved',
        defaultRating: '1,620 Max Rating',
        defaultPercentile: 'Div. 2 Finalist',
        defaultLang: 'C++20 · Java',
        metricLabel1: 'AC SUBMISSIONS',
        metricLabel2: 'MAX RATING',
        metricLabel3: 'DIVISION TIER',
      };
    case 'HackerRank':
      return {
        primaryHex: '#06b6d4',
        secondaryHex: '#10b981',
        borderClass: 'hover:border-cyan-400/70',
        badgeBgClass: 'bg-cyan-500/15 border-cyan-400/35',
        badgeTextClass: 'text-cyan-300',
        defaultBadge: '5★ Gold Verified',
        defaultSolved: '5★ Problem Solving',
        defaultRating: '5★ Java & SQL',
        defaultPercentile: 'Top 1% Verified',
        defaultLang: 'Java 21 · SQL',
        metricLabel1: 'STAR BADGES',
        metricLabel2: 'CERTIFIED TRACKS',
        metricLabel3: 'PERCENTILE',
      };
    case 'CodeChef':
      return {
        primaryHex: '#d97706',
        secondaryHex: '#fbbf24',
        borderClass: 'hover:border-amber-500/70',
        badgeBgClass: 'bg-amber-500/15 border-amber-500/35',
        badgeTextClass: 'text-amber-300',
        defaultBadge: '4★ Competitive',
        defaultSolved: '410+ Solved',
        defaultRating: '1,890 Rating',
        defaultPercentile: 'Global Top 3%',
        defaultLang: 'Java · C++',
        metricLabel1: 'PROBLEMS SOLVED',
        metricLabel2: 'PEAK RATING',
        metricLabel3: 'DIVISION STANDING',
      };
    default:
      return {
        primaryHex: '#10b981',
        secondaryHex: '#38bdf8',
        borderClass: 'hover:border-emerald-400/70',
        badgeBgClass: 'bg-emerald-500/15 border-emerald-400/35',
        badgeTextClass: 'text-emerald-300',
        defaultBadge: 'Verified Track',
        defaultSolved: '450+ Solved',
        defaultRating: '1,850 Score',
        defaultPercentile: 'Top 3%',
        defaultLang: 'Java · TypeScript',
        metricLabel1: 'PROBLEMS / REPOS',
        metricLabel2: 'RATING / SCORE',
        metricLabel3: 'PERCENTILE',
      };
  }
}

export default function CodingProfileSpotlightCard({
  profile: p,
  index,
  prefersReduced,
  isExpanded,
  onToggleExpand,
  soundFx,
}: CodingProfileSpotlightCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isCopied, setIsCopied] = useState(false);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  const IconComponent = getCodingPlatformIcon(p.platformType);
  const theme = getPlatformTheme(p.platformType);

  const badgeText = p.badgeLabel?.trim() || theme.defaultBadge;
  const solvedText = p.problemsSolved?.trim() || theme.defaultSolved;
  const ratingText = p.ratingOrRank?.trim() || theme.defaultRating;
  const percentileText = p.streakOrPercentile?.trim() || theme.defaultPercentile;
  const langText = p.primaryLanguage?.trim() || theme.defaultLang;
  const customHighlights =
    Array.isArray(p.highlights) && p.highlights.filter(Boolean).length > 0
      ? p.highlights.filter(Boolean)
      : [
          `Consistent algorithmic & system design execution on ${p.displayName}`,
          `Focused on ${langText} with clean O(n log n) & lock-free concurrency patterns`,
        ];

  // Deterministic 28-cell (4 rows x 7 cols) contribution/submission heatmap + 12-point D3 rating curve
  const { heatmapCells, d3Points, d3LinePath, d3AreaPath } = useMemo(() => {
    const seed = hashSeed(`${p.id}-${p.platformType}-${p.username}`);
    const cells: number[] = [];
    for (let i = 0; i < 28; i++) {
      const cellSeed = hashSeed(`${seed}-cell-${i}`);
      const level = (cellSeed + i * 3) % 5; // 0..4 intensity
      cells.push(level);
    }

    const customSeries =
      Array.isArray(p.activitySeries) && p.activitySeries.length >= 4
        ? p.activitySeries
        : null;

    const rawValues: number[] = [];
    if (customSeries) {
      customSeries.forEach((v) => rawValues.push(Number(v) || 1500));
    } else {
      const base = 1520 + (seed % 280);
      for (let i = 0; i < 12; i++) {
        const wave = Math.sin((i / 11) * Math.PI * 2 + (seed % 5)) * 38;
        const climb = i * 26;
        rawValues.push(Math.round(base + wave + climb));
      }
    }

    const width = 280;
    const height = 74;
    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(1, rawValues.length - 1)])
      .range([8, width - 8]);
    const [minV, maxV] = d3.extent(rawValues) as [number, number];
    const pad = (maxV - minV) * 0.2 || 15;
    const yScale = d3
      .scaleLinear()
      .domain([minV - pad, maxV + pad])
      .range([height - 10, 10]);

    const pts = rawValues.map((val, idx) => ({
      idx,
      val,
      cx: xScale(idx),
      cy: yScale(val),
      label: `M${idx + 1}`,
    }));

    const lineGen = d3
      .line<(typeof pts)[0]>()
      .x((d) => d.cx)
      .y((d) => d.cy)
      .curve(d3.curveCatmullRom.alpha(0.5));

    const areaGen = d3
      .area<(typeof pts)[0]>()
      .x((d) => d.cx)
      .y0(height - 6)
      .y1((d) => d.cy)
      .curve(d3.curveCatmullRom.alpha(0.5));

    return {
      heatmapCells: cells,
      d3Points: pts,
      d3LinePath: lineGen(pts) || '',
      d3AreaPath: areaGen(pts) || '',
    };
  }, [p.activitySeries, p.id, p.platformType, p.username]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReduced || window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const nx = centerX > 0 ? (x - centerX) / centerX : 0;
    const ny = centerY > 0 ? (y - centerY) / centerY : 0;
    const maxTilt = isExpanded ? 1.5 : 4.5;
    setTilt({
      rotateX: ny * -maxTilt,
      rotateY: nx * maxTilt,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setHoveredPointIdx(null);
  };

  const activePoint =
    hoveredPointIdx !== null && d3Points[hoveredPointIdx]
      ? d3Points[hoveredPointIdx]
      : d3Points[d3Points.length - 1];

  const gradId = `cp-d3-grad-${p.id || index}`;

  return (
    <div style={{ perspective: 1400 }} className="h-full">
      <motion.div
        initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        animate={{
          rotateX: prefersReduced ? 0 : tilt.rotateX,
          rotateY: prefersReduced ? 0 : tilt.rotateY,
          transformStyle: 'preserve-3d',
        }}
        transition={{
          duration: isHovered ? 0.14 : 0.35,
          ease: isHovered ? 'linear' : [0.16, 1, 0.3, 1],
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setIsHovered(true);
          soundFx.playHover();
        }}
        onMouseLeave={handleMouseLeave}
        className={`glass-card relative rounded-2xl overflow-hidden flex flex-col justify-between h-full group border backdrop-blur-md transition-colors duration-200 ${
          isExpanded
            ? 'spotlight-card-active-pulse border-emerald-400/90 bg-gradient-to-b from-[#071324]/98 via-slate-950/98 to-[#020617] z-30'
            : `border-white/[0.08] ${theme.borderClass} bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-[#020617] shadow-xl shadow-black/60`
        }`}
      >
        {/* Top Glowing Platform Signature Accent Bar */}
        <div
          className="h-1 w-full transition-opacity duration-300 opacity-80 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
            boxShadow: isHovered ? `0 0 16px ${theme.primaryHex}` : undefined,
          }}
        />

        {/* Interactive Radial Cursor Spotlight Glare */}
        {!prefersReduced && isHovered && (
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(460px circle at ${coords.x}px ${coords.y}px, ${theme.primaryHex}22, ${theme.secondaryHex}10 45%, transparent 75%)`,
            }}
          />
        )}

        {/* Card Top Chrome Bar */}
        <div className="relative z-20 flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-white/[0.06] text-[10px] font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="font-bold tabular-nums"
              style={{ color: theme.primaryHex }}
            >
              TRACK #{String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 truncate">{langText}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {p.featured && (
              <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-bold uppercase rounded flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-amber-400" />
                <span>Featured</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick(isExpanded ? 740 : 920);
                onToggleExpand(p.id);
              }}
              className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                isExpanded
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-900/90 border-white/[0.1] text-slate-300 hover:border-emerald-400/50 hover:text-emerald-300'
              }`}
            >
              <span>{isExpanded ? 'Collapse' : 'Dossier'}</span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Main Card Body */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5 relative z-20">
          <div className="space-y-4">
            {/* Platform Identity Header + Tier Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-12 h-12 rounded-2xl bg-slate-950 border flex items-center justify-center p-2.5 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                  style={{
                    borderColor: `${theme.primaryHex}55`,
                    boxShadow: `0 0 18px ${theme.primaryHex}28`,
                  }}
                >
                  {p.logoUrl ? (
                    <img
                      src={p.logoUrl}
                      alt={p.displayName}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: theme.primaryHex }}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-white font-luxury tracking-wide truncate group-hover:text-emerald-300 transition-colors">
                    {p.displayName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <span style={{ color: theme.primaryHex }} className="font-bold">
                      @{p.username}
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-xl border text-[10px] font-mono font-bold shrink-0 ${theme.badgeBgClass} ${theme.badgeTextClass}`}
              >
                {badgeText}
              </span>
            </div>

            {/* 3-Column Algorithmic KPI Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#040a18]/90 border border-white/[0.06] space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase block truncate">
                  {theme.metricLabel1}
                </span>
                <span className="text-xs font-mono font-extrabold text-white tabular-nums block truncate">
                  {solvedText}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#040a18]/90 border border-white/[0.06] space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase block truncate">
                  {theme.metricLabel2}
                </span>
                <span
                  className="text-xs font-mono font-extrabold tabular-nums block truncate"
                  style={{ color: theme.primaryHex }}
                >
                  {ratingText}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#040a18]/90 border border-white/[0.06] space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase block truncate">
                  {theme.metricLabel3}
                </span>
                <span className="text-xs font-mono font-extrabold text-cyan-300 tabular-nums block truncate">
                  {percentileText}
                </span>
              </div>
            </div>

            {/* Interactive D3.js Rating Trajectory + 28-Cell Activity Heatmap Matrix */}
            <div className="rounded-2xl bg-[#040917]/95 border border-white/[0.07] p-3.5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <TrendingUp
                    className="w-3.5 h-3.5"
                    style={{ color: theme.primaryHex }}
                  />
                  <span>RATING &amp; SUBMISSION VELOCITY</span>
                </div>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: theme.primaryHex }}
                >
                  {activePoint ? `${activePoint.val} pts` : ratingText}
                </span>
              </div>

              {/* D3 Trajectory SVG */}
              <div className="relative h-16 w-full select-none">
                <svg
                  viewBox="0 0 280 74"
                  className="w-full h-full overflow-visible cursor-crosshair"
                  onMouseLeave={() => setHoveredPointIdx(null)}
                >
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={theme.primaryHex}
                        stopOpacity={0.38}
                      />
                      <stop
                        offset="100%"
                        stopColor={theme.secondaryHex}
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>

                  {d3AreaPath && (
                    <path d={d3AreaPath} fill={`url(#${gradId})`} />
                  )}

                  {d3LinePath && (
                    <>
                      <path
                        d={d3LinePath}
                        fill="none"
                        stroke={theme.primaryHex}
                        strokeWidth={4}
                        strokeOpacity={0.2}
                        strokeLinecap="round"
                      />
                      <path
                        d={d3LinePath}
                        fill="none"
                        stroke={theme.primaryHex}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </>
                  )}

                  {d3Points.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.cx}
                      cy={pt.cy}
                      r={hoveredPointIdx === idx ? 4 : 2}
                      fill={
                        hoveredPointIdx === idx ? '#ffffff' : theme.primaryHex
                      }
                      className="transition-all cursor-pointer"
                      onMouseEnter={() => setHoveredPointIdx(idx)}
                    />
                  ))}
                </svg>
              </div>

              {/* 28-Cell Algorithmic Activity Heatmap Strip */}
              <div className="space-y-1.5 pt-1 border-t border-white/[0.05]">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>SUBMISSION CONSISTENCY MATRIX</span>
                  <span className="text-emerald-400 font-semibold">
                    VERIFIED ACTIVE
                  </span>
                </div>
                <div className="grid grid-cols-14 gap-1">
                  {heatmapCells.map((lvl, cIdx) => {
                    const opacities = [0.12, 0.28, 0.48, 0.72, 0.95];
                    return (
                      <div
                        key={cIdx}
                        className="h-2.5 rounded-[3px] transition-transform duration-200 hover:scale-125"
                        style={{
                          backgroundColor: theme.primaryHex,
                          opacity: opacities[lvl] || 0.25,
                        }}
                        title={`Activity window ${cIdx + 1}: Tier ${lvl + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Description / Summary */}
            {p.description && (
              <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-950/75 border border-white/[0.05] rounded-xl px-3.5 py-2.5">
                {p.description}
              </p>
            )}

            {/* Expanded Algorithmic Dossier Drawer */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-[#030712]/95 border border-emerald-500/30 space-y-3.5"
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center justify-between">
                  <span>Algorithmic Domain Mastery</span>
                  <span className="text-slate-400">{langText}</span>
                </div>

                {/* Difficulty Mastery Progress Bars */}
                <div className="space-y-2.5 text-[10px] font-mono">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Data Structures &amp; Graph Algorithms</span>
                      <span className="text-emerald-400 font-bold">94%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Dynamic Programming &amp; Optimization</span>
                      <span className="text-amber-400 font-bold">89%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full w-[89%] rounded-full bg-gradient-to-r from-amber-400 to-emerald-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>System Concurrency &amp; 3NF SQL</span>
                      <span className="text-cyan-400 font-bold">96%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-cyan-400 to-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                  {customHighlights.map((hl, hIdx) => (
                    <li
                      key={hIdx}
                      className="text-[11px] text-slate-300 flex items-start gap-2"
                    >
                      <span className="text-emerald-400 font-mono font-bold">
                        ▹
                      </span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Handle Copy & Direct Launch Footer */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(p.username);
                setIsCopied(true);
                soundFx.playSuccess();
                setTimeout(() => setIsCopied(false), 2200);
              }}
              className={`px-3 py-2 rounded-xl border text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                isCopied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                  : 'bg-slate-950/90 hover:bg-slate-900 text-slate-300 hover:text-white border-white/[0.08]'
              }`}
              title={`Copy handle @${p.username}`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied @{p.username}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>@{p.username}</span>
                </>
              )}
            </button>

            <a
              href={p.profileUrl}
              target={p.openInNewTab !== false ? '_blank' : '_self'}
              rel="noopener noreferrer"
              onClick={() => soundFx.playClick()}
              className="flex-1 py-2 px-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-center font-mono text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>Launch Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import {
  BookOpen,
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  ExternalLink,
  Feather,
  FileText,
  Quote,
  Sparkles,
} from 'lucide-react';
import { ArticleItem } from '../data/cmsMockData';

interface ArticleMonographCardProps {
  art: ArticleItem;
  index: number;
  prefersReduced: boolean;
  isExpanded: boolean;
  onToggleExpand: (articleId: number) => void;
  onOpenModal: (article: ArticleItem) => void;
  onSelectTag: (tag: string) => void;
  profileAvatar?: string;
  soundFx: {
    playClick: (freq?: number) => void;
    playModalOpen: () => void;
    playTab: (freq?: number) => void;
    playHover: () => void;
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

export default function ArticleMonographCard({
  art,
  index,
  prefersReduced,
  isExpanded,
  onToggleExpand,
  onOpenModal,
  onSelectTag,
  profileAvatar,
  soundFx,
}: ArticleMonographCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const coverImg = art.coverImageUrl || (art as any).coverImage || '';
  const excerptText = art.excerpt || (art as any).summary || '';
  const authorName = art.author || (art as any).authorName || 'Chandru Mohan';
  const authorRoleText = art.authorRole || 'Principal Systems Architect';
  const isFeatured = art.isFeatured ?? (art as any).featured ?? false;
  const readMins = art.readTimeMinutes || 5;
  const takeaways = Array.isArray(art.keyTakeaways)
    ? art.keyTakeaways.filter(Boolean)
    : [];

  const formattedDate = art.publishedAt
    ? new Date(art.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '2026 Edition';

  const wordEstimate = useMemo(() => {
    const words = (art.content || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(words, readMins * 210);
  }, [art.content, readMins]);

  // Extract markdown headings as "Chapters" for the editorial outline
  const chapters = useMemo(() => {
    const matches = (art.content || '')
      .split('\n')
      .filter((line) => /^#{2,3}\s+/.test(line.trim()))
      .map((line) => line.replace(/^#{2,3}\s+/, '').trim());
    if (matches.length > 0) return matches.slice(0, 4);
    if (takeaways.length > 0) return takeaways.slice(0, 3);
    return [
      'System Context & Architectural Problem Statement',
      'Core Concurrency & Throughput Design Patterns',
      'Production Benchmarks & SLA Takeaways',
    ];
  }, [art.content, takeaways]);

  // Editorial D3 citation/readership wave in Warm Amber-Gold & Indigo
  const { d3WavePath, d3AreaPath, readershipCount } = useMemo(() => {
    const seed = hashSeed(`${art.id || index}-${art.slug || art.title}`);
    const pts: number[] = [];
    const base = Math.max(240, (art.viewsCount || 520) + (seed % 410));
    for (let i = 0; i < 14; i++) {
      const wave = Math.sin((i / 13) * Math.PI * 2.4 + (seed % 5)) * 0.18;
      const trend = (i / 13) * 0.25;
      pts.push(Math.round(base * (0.76 + wave + trend)));
    }
    const xScale = d3.scaleLinear().domain([0, 13]).range([2, 138]);
    const [minV, maxV] = d3.extent(pts) as [number, number];
    const yScale = d3
      .scaleLinear()
      .domain([minV - 10, maxV + 10])
      .range([26, 3]);

    const lineGen = d3
      .line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveBasis);

    const areaGen = d3
      .area<number>()
      .x((_, i) => xScale(i))
      .y0(28)
      .y1((d) => yScale(d))
      .curve(d3.curveBasis);

    return {
      d3WavePath: lineGen(pts) || '',
      d3AreaPath: areaGen(pts) || '',
      readershipCount:
        maxV >= 1000 ? `${(maxV / 1000).toFixed(1)}k` : `${maxV}`,
    };
  }, [art.id, art.slug, art.title, art.viewsCount, index]);

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
    const maxTilt = isExpanded ? 1.2 : 3.2;
    setTilt({
      rotateX: ny * -maxTilt,
      rotateY: nx * maxTilt,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // Circular SVG reading dial math
  const dialRadius = 18;
  const dialCircumference = 2 * Math.PI * dialRadius;
  const dialPercent = Math.min(0.92, Math.max(0.28, readMins / 15));
  const dialDashoffset = dialCircumference * (1 - dialPercent);
  const gradId = `editorial-wave-${art.id || index}`;

  return (
    <div style={{ perspective: 1500 }} className="h-full">
      <motion.article
        layout="position"
        initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.12, margin: '-20px' }}
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
        onClick={() => {
          soundFx.playModalOpen();
          onOpenModal(art);
        }}
        className={`relative rounded-3xl overflow-hidden flex flex-col justify-between h-full group border backdrop-blur-md transition-colors duration-200 cursor-pointer ${
          isExpanded
            ? 'border-amber-400/80 bg-gradient-to-br from-[#13111c]/98 via-[#090d1a]/98 to-[#040711] shadow-[0_25px_65px_-12px_rgba(245,158,11,0.22),0_0_0_1px_rgba(251,191,36,0.45)] z-30'
            : isHovered
            ? 'border-amber-400/65 bg-gradient-to-br from-[#12101b]/95 via-[#080c18]/98 to-[#040711] shadow-[0_22px_50px_-12px_rgba(245,158,11,0.18),0_0_0_1px_rgba(251,191,36,0.3)] z-20'
            : 'border-white/[0.08] bg-gradient-to-br from-[#0c0f1d]/95 via-[#070a14]/95 to-[#03060f] shadow-xl shadow-black/60'
        }`}
      >
        {/* Warm Editorial Gold & Indigo Top Ribbon Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500/80 via-amber-300 to-indigo-400/80 opacity-75 group-hover:opacity-100 transition-opacity" />

        {/* Interactive Warm Amber/Indigo Radial Mouse Glare */}
        {!prefersReduced && isHovered && (
          <div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-100 transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(520px circle at ${coords.x}px ${coords.y}px, rgba(245, 158, 11, 0.12), rgba(99, 102, 241, 0.08) 45%, transparent 75%)`,
            }}
          />
        )}

        {/* Editorial Journal Masthead Bar */}
        <div className="relative z-20 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.06] bg-[#050811]/90 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/35 text-amber-300 font-bold tracking-wider uppercase tabular-nums whitespace-nowrap shrink-0">
              ISSUE NO. {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-indigo-300 font-semibold truncate">
              {art.category || 'System Architecture'}
            </span>
            {art.readingDifficulty && (
              <>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span className="text-slate-400 hidden sm:inline truncate">
                  {art.readingDifficulty}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isFeatured && (
              <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1 whitespace-nowrap">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                Lead Paper
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick(isExpanded ? 740 : 920);
                onToggleExpand(art.id);
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-lg border text-[10px] font-mono font-semibold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                isExpanded
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-sm'
                  : 'bg-slate-900/90 border-white/[0.1] text-slate-300 hover:border-amber-400/50 hover:text-amber-300'
              }`}
            >
              <span>{isExpanded ? 'Close Synopsis' : 'Synopsis & Chapters'}</span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Main Horizontal Magazine Spread Layout */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between gap-4 sm:gap-5 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column (5 cols): Editorial Cover Plate + Animated Circular Reading Time Dial */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/[0.08] group-hover:border-amber-400/35 transition-colors shadow-inner">
                {coverImg ? (
                  <img
                    src={coverImg}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#13111c] via-[#090d1a] to-slate-950 p-6">
                    <Feather className="w-10 h-10 text-amber-400/50 mb-2" />
                    <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest">
                      Engineering Monograph
                    </span>
                  </div>
                )}

                {/* Editorial sheen */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/15 to-transparent animate-glass-sheen" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/35 to-transparent pointer-events-none" />

                {/* Floating Circular Reading Time Dial & Date */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#050811]/90 backdrop-blur-md border border-amber-400/30">
                    <svg className="w-7 h-7 -rotate-90 shrink-0" viewBox="0 0 44 44">
                      <circle
                        cx="22"
                        cy="22"
                        r={dialRadius}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r={dialRadius}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="3"
                        strokeDasharray={dialCircumference}
                        strokeDashoffset={dialDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="text-[10px] font-mono leading-tight">
                      <span className="text-amber-300 font-extrabold block tabular-nums">
                        {readMins} MIN READ
                      </span>
                      <span className="text-slate-400 tabular-nums">
                        ~{wordEstimate.toLocaleString()} words
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#050811]/90 backdrop-blur-md border border-white/[0.08] text-[10px] font-mono text-slate-300">
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Author Byline & Editorial Readership Wave */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#050811]/85 border border-white/[0.06]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/40 bg-slate-900 shrink-0">
                    {art.authorAvatar || profileAvatar ? (
                      <img
                        src={art.authorAvatar || profileAvatar}
                        alt={authorName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-amber-300 flex items-center justify-center h-full">
                        C
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {authorName}
                    </div>
                    <div className="text-[10px] font-mono text-amber-300/90 truncate">
                      {authorRoleText}
                    </div>
                  </div>
                </div>

                {/* Editorial Readership Curve */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right font-mono">
                    <span className="text-[9px] text-slate-500 block uppercase">
                      CITATIONS
                    </span>
                    <span className="text-xs font-bold text-indigo-300 tabular-nums">
                      {readershipCount}
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 140 28"
                    className="w-16 h-6 overflow-visible shrink-0"
                  >
                    <defs>
                      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    {d3AreaPath && (
                      <path d={d3AreaPath} fill={`url(#${gradId})`} />
                    )}
                    <path
                      d={d3WavePath}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Editorial Typography, Thesis Quote & Chapter Index */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-extrabold font-luxury text-white group-hover:text-amber-200 transition-colors leading-snug tracking-tight">
                  {art.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300/95 leading-relaxed line-clamp-3">
                  {excerptText}
                </p>

                {/* Editorial Thesis Callout */}
                {(art.executiveSummary || takeaways[0]) && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/[0.08] via-indigo-500/[0.05] to-transparent border border-amber-400/25 flex items-start gap-3">
                    <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-100/90 italic leading-relaxed line-clamp-2">
                      {art.executiveSummary || takeaways[0]}
                    </p>
                  </div>
                )}

                {/* Manuscript Chapter / Section Index */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-indigo-400" />
                    <span>Manuscript Outline</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {chapters.slice(0, 4).map((chap, cIdx) => (
                      <div
                        key={cIdx}
                        className="px-2.5 py-1.5 rounded-xl bg-[#050811]/80 border border-white/[0.05] text-[11px] text-slate-300 flex items-center gap-2 truncate"
                      >
                        <span className="font-mono text-[10px] font-bold text-amber-400 tabular-nums shrink-0">
                          §0{cIdx + 1}
                        </span>
                        <span className="truncate">{chap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expanded Takeaways Drawer (when Synopsis is toggled open) */}
              {isExpanded && takeaways.length > 0 && (
                <div
                  className="p-4 rounded-2xl bg-[#050811]/95 border border-amber-400/30 space-y-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                    Key Architectural Takeaways &amp; Peer-Review Notes
                  </div>
                  <ul className="space-y-2">
                    {takeaways.map((tk, tIdx) => (
                      <li
                        key={tIdx}
                        className="text-xs text-slate-200 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="text-amber-400 font-mono font-bold shrink-0">
                          0{tIdx + 1}.
                        </span>
                        <span>{tk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Topic Tags & Editorial Reader CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                {art.tags && art.tags.length > 0 ? (
                  <div
                    className="flex flex-wrap gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {art.tags.slice(0, 4).map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          soundFx.playTab(840);
                          onSelectTag(tag);
                        }}
                        className="text-[10px] font-mono bg-slate-900/90 hover:bg-amber-500/15 border border-white/[0.07] hover:border-amber-400/40 px-2.5 py-1 rounded-lg text-slate-300 hover:text-amber-200 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span />
                )}

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {art.externalUrl && (
                    <a
                      href={art.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundFx.playClick()}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] hover:border-amber-400/40 text-[11px] font-mono text-slate-300 hover:text-amber-200 transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>Canonical</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playModalOpen();
                      onOpenModal(art);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-mono font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpenCheck className="w-3.5 h-3.5" />
                    <span>Read Manuscript</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

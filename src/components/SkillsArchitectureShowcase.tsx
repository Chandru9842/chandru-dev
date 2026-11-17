import React, { useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Activity,
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  FolderGit2,
  Layers,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { ProjectItem, SkillItem } from '../data/cmsMockData';
import SkillMediaRenderer from './SkillMediaRenderer';
import TechProficiencyHeatmap from './TechProficiencyHeatmap';

interface SkillsArchitectureShowcaseProps {
  skills: SkillItem[];
  projects: ProjectItem[];
  prefersReduced?: boolean;
  onSelectSkillForModal: (skill: SkillItem) => void;
  soundFx: {
    playHover: () => void;
    playClick: (freq?: number) => void;
    playModalOpen: () => void;
  };
}

interface DerivedSkillMeta {
  proficiency: number;
  years: number;
  tierTag: string;
  tierPill: string;
  tierBadgeColor: string;
  capabilityChips: string[];
  architectureSummary: string;
  benchmarkLabel: string;
  benchmarkValue: string;
}

function deriveSkillMeta(skill: SkillItem): DerivedSkillMeta {
  const itemColor = skill.color || '#10b981';
  const sName = (skill.name || '').toLowerCase();
  const sCat = (skill.category || '').toLowerCase();

  let defaultProficiency = 92;
  let defaultYears = 3;
  let tierTag = 'Core Stack';
  let tierPill = skill.tierBadge || 'Production Ready';
  let tierBadgeColor = itemColor;
  let capabilityChips =
    Array.isArray(skill.capabilities) && skill.capabilities.length > 0
      ? skill.capabilities
      : ['Enterprise Ready', 'Clean Architecture', 'Production SLA'];
  let architectureSummary =
    skill.architectureNotes ||
    skill.description ||
    'Engineered for high-throughput production workloads with strict type safety, modular boundaries, and automated CI verification.';
  let benchmarkLabel = 'Production SLA';
  let benchmarkValue = '99.95% Uptime';

  if (
    sName.includes('java') ||
    sName.includes('spring boot') ||
    sName.includes('microservices')
  ) {
    defaultProficiency = 98;
    defaultYears = 4;
    tierTag = 'Architect Tier';
    tierPill = skill.tierBadge || 'Principal Core';
    tierBadgeColor = '#10b981';
    if (!skill.capabilities?.length) {
      capabilityChips = [
        'JVM 21 Virtual Threads',
        'Spring Cloud Mesh',
        'High-Concurrency APIs',
      ];
    }
    if (!skill.architectureNotes) {
      architectureSummary =
        'Backbone of enterprise distributed microservices: non-blocking REST/gRPC controllers, HikariCP connection pooling, resilience circuit breakers, and JVM G1GC tuning.';
    }
    benchmarkLabel = 'Throughput Capacity';
    benchmarkValue = '18.4k+ RPS';
  } else if (sName.includes('security') || sName.includes('jwt') || sName.includes('oauth')) {
    defaultProficiency = 96;
    defaultYears = 4;
    tierTag = 'Zero-Trust Auth';
    tierPill = skill.tierBadge || 'Security Core';
    tierBadgeColor = '#10b981';
    if (!skill.capabilities?.length) {
      capabilityChips = ['OAuth2 / OIDC', 'Stateless JWT', 'Method-Level RBAC'];
    }
    benchmarkLabel = 'Auth Verification';
    benchmarkValue = '< 1.8ms P95';
  } else if (
    sName.includes('sql') ||
    sName.includes('postgres') ||
    sName.includes('redis') ||
    sName.includes('kafka') ||
    sName.includes('mysql') ||
    sName.includes('hibernate') ||
    sCat.includes('database')
  ) {
    defaultProficiency = 95;
    defaultYears = 4;
    tierTag = 'Distributed Data';
    tierPill = skill.tierBadge || 'High Throughput';
    tierBadgeColor = '#06b6d4';
    if (!skill.capabilities?.length) {
      capabilityChips = [
        '3NF/BCNF Schemas',
        'Composite Indexing',
        'ACID Transactions',
      ];
    }
    if (!skill.architectureNotes) {
      architectureSummary =
        'Designed normalized relational schemas, sub-millisecond Redis cache-aside topologies, and zero-downtime Flyway/Liquibase migrations.';
    }
    benchmarkLabel = 'Query Latency P95';
    benchmarkValue = '< 4.2ms';
  } else if (sName.includes('react') || sName.includes('next')) {
    defaultProficiency = 95;
    defaultYears = 4;
    tierTag = 'Modern Reactive';
    tierPill = skill.tierBadge || 'Enterprise UI';
    tierBadgeColor = '#3b82f6';
    if (!skill.capabilities?.length) {
      capabilityChips = [
        'React 19 Concurrent',
        'Custom State Hooks',
        '60FPS Motion UI',
      ];
    }
    benchmarkLabel = 'Render Frame Budget';
    benchmarkValue = '< 16ms (60fps)';
  } else if (sName.includes('typescript') || sName.includes('javascript')) {
    defaultProficiency = 94;
    defaultYears = 4;
    tierTag = 'Type Architecture';
    tierPill = skill.tierBadge || 'Strict Mode';
    tierBadgeColor = '#38bdf8';
    if (!skill.capabilities?.length) {
      capabilityChips = [
        'Strict Type Contracts',
        'End-to-End DTO Sync',
        'ESNext Pipelines',
      ];
    }
    benchmarkLabel = 'Compile-Time Safety';
    benchmarkValue = '100% Typed';
  } else if (sName.includes('tailwind') || sName.includes('css')) {
    defaultProficiency = 95;
    defaultYears = 4;
    tierTag = 'Design System';
    tierPill = skill.tierBadge || 'Token Architecture';
    tierBadgeColor = '#06b6d4';
    if (!skill.capabilities?.length) {
      capabilityChips = [
        'Glassmorphic Tokens',
        'Responsive Grid Systems',
        'Zero-Runtime CSS',
      ];
    }
    benchmarkLabel = 'Lighthouse CLS';
    benchmarkValue = '0.000 Score';
  } else if (
    sName.includes('docker') ||
    sName.includes('aws') ||
    sName.includes('kubernetes') ||
    sName.includes('cloud') ||
    sName.includes('ci/cd') ||
    sCat.includes('devops')
  ) {
    defaultProficiency = 91;
    defaultYears = 3;
    tierTag = 'Cloud Native';
    tierPill = skill.tierBadge || 'DevOps & Infra';
    tierBadgeColor = '#a855f7';
    if (!skill.capabilities?.length) {
      capabilityChips = [
        'Multi-Stage Containers',
        'Blue-Green Deploys',
        'Automated CI/CD',
      ];
    }
    benchmarkLabel = 'Deploy Recovery';
    benchmarkValue = 'Zero-Downtime';
  }

  const proficiency = Math.min(
    100,
    Math.max(40, Number(skill.proficiency) || defaultProficiency)
  );
  const years = Number(skill.yearsOfExperience) || defaultYears;

  return {
    proficiency,
    years,
    tierTag,
    tierPill,
    tierBadgeColor,
    capabilityChips,
    architectureSummary,
    benchmarkLabel,
    benchmarkValue,
  };
}

interface SkillSpotlightCardProps {
  skill: SkillItem;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenModal: () => void;
  matchingProjects: ProjectItem[];
  prefersReduced?: boolean;
  soundFx: SkillsArchitectureShowcaseProps['soundFx'];
}

const SkillSpotlightCard: React.FC<SkillSpotlightCardProps> = ({
  skill,
  index,
  isExpanded,
  onToggleExpand,
  onOpenModal,
  matchingProjects,
  prefersReduced,
  soundFx,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring-driven 3D tilt towards the cursor
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 260,
    damping: 24,
  });

  // Inner multi-layer 3D parallax translation offsets
  const parallaxFastX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 260,
    damping: 24,
  });
  const parallaxFastY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), {
    stiffness: 260,
    damping: 24,
  });
  const parallaxMidX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), {
    stiffness: 260,
    damping: 24,
  });
  const parallaxMidY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-4, 4]), {
    stiffness: 260,
    damping: 24,
  });

  const itemColor = skill.color || '#10b981';
  const isPulse = skill.animation === 'Pulse';
  const isSpin = skill.animation === 'Spin Slow';
  const meta = useMemo(() => deriveSkillMeta(skill), [skill]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReduced || isExpanded || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    cardRef.current.style.setProperty('--spot-x', `${(relX / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--spot-y', `${(relY / rect.height) * 100}%`);

    const normX = relX / rect.width - 0.5;
    const normY = relY / rect.height - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  // Circular SVG gauge geometry
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (meta.proficiency / 100) * circumference;

  return (
    <motion.div
      ref={cardRef}
      layout="position"
      initial={
        prefersReduced
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 20, scale: 0.97 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.12, margin: '-20px' }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.03, 0.18),
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        soundFx.playHover();
      }}
      onMouseLeave={handleMouseLeave}
      style={
        prefersReduced || isExpanded
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1100,
              transformStyle: 'preserve-3d',
            }
      }
      className={`group relative rounded-2xl border transition-colors duration-200 overflow-hidden flex flex-col justify-between bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 backdrop-blur-md ${
        isExpanded
          ? 'border-emerald-500/60 shadow-[0_0_45px_-10px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/30'
          : isHovered
          ? 'border-emerald-500/55 shadow-[0_22px_48px_-12px_rgba(16,185,129,0.28)]'
          : 'border-white/[0.08] shadow-lg'
      } ${isPulse ? 'animate-pulse' : ''}`}
    >
      {/* Dynamic Cursor-Tracking Radial Spotlight + 3D Glare */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `radial-gradient(380px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${itemColor}26, transparent 70%)`,
        }}
      />

      {/* Glowing Top Accent Line */}
      <div
        className="h-0.5 w-full transition-opacity duration-300 opacity-50 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${itemColor}, transparent)`,
        }}
      />

      <div
        className="p-5 space-y-4 relative z-10 flex-1 flex flex-col justify-between"
        style={
          prefersReduced || isExpanded
            ? undefined
            : { transformStyle: 'preserve-3d' }
        }
      >
        {/* Top Row: Parallax Depth Layer 1 (Icon + Circular Mastery Gauge) */}
        <div className="space-y-3.5">
          <motion.div
            style={
              prefersReduced || isExpanded
                ? undefined
                : {
                    x: parallaxFastX,
                    y: parallaxFastY,
                    translateZ: 28,
                  }
            }
            className="flex items-start justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 overflow-hidden bg-slate-950 p-2.5 shadow-inner"
                style={{
                  borderColor: `${itemColor}45`,
                  boxShadow: `0 0 16px ${itemColor}25`,
                }}
              >
                <SkillMediaRenderer
                  src={skill.iconUrl}
                  fallbackIcon={skill.iconName || 'Code2'}
                  fallbackColor={itemColor}
                  isSpin={isSpin}
                  alt={skill.name}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[9px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: `${meta.tierBadgeColor}15`,
                      color: meta.tierBadgeColor,
                      borderColor: `${meta.tierBadgeColor}35`,
                    }}
                  >
                    {meta.tierPill}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                    {meta.years}+ Yrs
                  </span>
                </div>

                <h3
                  onClick={onToggleExpand}
                  className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-emerald-300 transition-colors truncate mt-1 cursor-pointer"
                  title={skill.name}
                >
                  {skill.name}
                </h3>
                <span
                  className="text-[10px] font-mono block uppercase tracking-widest font-semibold"
                  style={{ color: itemColor }}
                >
                  {skill.category}
                </span>
              </div>
            </div>

            {/* Animated SVG Circular Mastery Gauge */}
            <div
              className="relative w-13 h-13 shrink-0 flex items-center justify-center"
              title={`${meta.proficiency}% Production Mastery`}
            >
              <svg className="w-13 h-13 -rotate-90" viewBox="0 0 52 52">
                <circle
                  cx="26"
                  cy="26"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="26"
                  cy="26"
                  r={radius}
                  fill="none"
                  stroke={itemColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  whileInView={{ strokeDashoffset }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] font-mono font-extrabold text-white leading-none">
                  {meta.proficiency}%
                </span>
                <span className="text-[7px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">
                  SLA
                </span>
              </div>
            </div>
          </motion.div>

          {/* Parallax Depth Layer 2: Description & Capability Chips */}
          <motion.div
            style={
              prefersReduced || isExpanded
                ? undefined
                : {
                    x: parallaxMidX,
                    y: parallaxMidY,
                    translateZ: 16,
                  }
            }
            className="space-y-3"
          >
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 font-sans">
              {skill.description || meta.architectureSummary}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {meta.capabilityChips.slice(0, 3).map((chip, cIdx) => (
                <span
                  key={cIdx}
                  className="px-2 py-0.5 rounded-md text-[9px] font-mono font-medium bg-slate-950/90 text-slate-300 border border-white/[0.07] shadow-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Expandable Inline Architecture & Project Cross-Reference Console */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-2 border-t border-white/[0.08] space-y-4">
                {/* Architectural Role & Benchmark Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2 p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      <span>Production Architecture Role</span>
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {meta.architectureSummary}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                      {meta.benchmarkLabel}
                    </span>
                    <div className="text-base font-mono font-extrabold text-emerald-400 mt-1">
                      {meta.benchmarkValue}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-1">
                      Tier: {meta.tierTag}
                    </span>
                  </div>
                </div>

                {/* Live Cross-Linked Projects Using This Skill */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        Verified Production Implementations (
                        {matchingProjects.length})
                      </span>
                    </span>
                  </div>

                  {matchingProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingProjects.slice(0, 4).map((proj) => (
                        <a
                          key={proj.id}
                          href="#projects"
                          onClick={() => soundFx.playClick(620)}
                          className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 transition-all flex items-center justify-between gap-2 group/proj"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-200 group-hover/proj:text-emerald-300 truncate">
                              {proj.title}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {proj.architectureType || proj.category}
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover/proj:text-emerald-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.05] text-[11px] font-mono text-slate-400">
                      Utilized across core backend services, CI/CD pipelines, and system architecture blueprints.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Action & Status Footer */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-slate-300 truncate">
              {meta.tierTag}
            </span>
            {matchingProjects.length > 0 && (
              <span className="text-[9px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 rounded">
                {matchingProjects.length}{' '}
                {matchingProjects.length === 1 ? 'Project' : 'Projects'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-300 border border-white/[0.07] hover:border-emerald-500/30 transition-all inline-flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>{isExpanded ? 'Collapse' : 'Blueprint'}</span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal();
              }}
              className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all inline-flex items-center gap-1 cursor-pointer font-bold"
              title="Open Full Competency Spec Modal"
            >
              <span>Specs</span>
              <span>↗</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function SkillsArchitectureShowcase({
  skills,
  projects,
  prefersReduced = false,
  onSelectSkillForModal,
  soundFx,
}: SkillsArchitectureShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<'default' | 'proficiency' | 'name'>(
    'default'
  );
  const [viewMode, setViewMode] = useState<
    'spotlight' | 'heatmap' | 'blueprint' | 'analytics'
  >('spotlight');
  const [expandedSkillId, setExpandedSkillId] = useState<number | null>(null);

  const visibleSkills = useMemo(() => {
    return (Array.isArray(skills) ? skills : []).filter(
      (s) => s && s.visibility !== false
    );
  }, [skills]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(visibleSkills.map((s) => s.category).filter(Boolean))
    );
    return ['All', ...unique];
  }, [visibleSkills]);

  // Map each skill ID to matching portfolio projects
  const projectsBySkillId = useMemo(() => {
    const map = new Map<number, ProjectItem[]>();
    const validProjects = (Array.isArray(projects) ? projects : []).filter(
      (p) => p && p.isVisible !== false
    );

    visibleSkills.forEach((skill) => {
      const sNameLower = (skill.name || '').toLowerCase();
      const matched = validProjects.filter((proj) => {
        const projSkills = Array.isArray(proj.skills) ? proj.skills : [];
        return projSkills.some((ps) => {
          const psLower = ps.toLowerCase();
          return (
            psLower === sNameLower ||
            psLower.includes(sNameLower) ||
            sNameLower.includes(psLower)
          );
        });
      });
      map.set(skill.id, matched);
    });

    return map;
  }, [visibleSkills, projects]);

  const filteredSkills = useMemo(() => {
    let list = [...visibleSkills];

    if (selectedCategory !== 'All') {
      list = list.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.category || '').toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      );
    }

    if (sortMode === 'proficiency') {
      list.sort(
        (a, b) =>
          deriveSkillMeta(b).proficiency - deriveSkillMeta(a).proficiency
      );
    } else if (sortMode === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }

    return list;
  }, [visibleSkills, selectedCategory, searchQuery, sortMode]);

  // Executive KPIs & Recharts data
  const summaryStats = useMemo(() => {
    if (visibleSkills.length === 0) {
      return {
        avgMastery: 95,
        architectTierCount: 0,
        domainData: [],
        topSkillsChartData: [],
      };
    }

    let totalProf = 0;
    let architectTierCount = 0;
    const domainGroups: Record<
      string,
      { category: string; count: number; totalProf: number; color: string }
    > = {};

    visibleSkills.forEach((s) => {
      const meta = deriveSkillMeta(s);
      totalProf += meta.proficiency;
      if (meta.proficiency >= 95) architectTierCount++;

      const cat = s.category || 'Engineering';
      if (!domainGroups[cat]) {
        domainGroups[cat] = {
          category: cat,
          count: 0,
          totalProf: 0,
          color: s.color || '#10b981',
        };
      }
      domainGroups[cat].count += 1;
      domainGroups[cat].totalProf += meta.proficiency;
    });

    const domainData = Object.values(domainGroups).map((d) => ({
      category: d.category,
      count: d.count,
      avgProficiency: Math.round(d.totalProf / d.count),
      color: d.color,
    }));

    const topSkillsChartData = [...filteredSkills]
      .slice(0, 12)
      .map((s) => {
        const meta = deriveSkillMeta(s);
        return {
          name: s.name,
          proficiency: meta.proficiency,
          years: meta.years,
          category: s.category,
          color: s.color || '#10b981',
        };
      });

    return {
      avgMastery: Math.round(totalProf / visibleSkills.length),
      architectTierCount,
      domainData,
      topSkillsChartData,
    };
  }, [visibleSkills, filteredSkills]);

  return (
    <div className="space-y-7">
      {/* Header with Title, View Switcher, Search & Sort Controls */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-4 border-b border-white/[0.06]">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>COMPETENCY LEDGER & SYSTEM CAPABILITIES</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{filteredSkills.length} Verified Technologies</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {summaryStats.avgMastery}% Avg Mastery SLA
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-luxury text-white tracking-wide">
            Expertise & Core Competencies
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
            Interactive 3D architectural competency matrix across enterprise Java 21 & Spring Boot microservices, reactive React 19 interfaces, normalized 3NF relational databases, and cloud-native infrastructure.
          </p>
          <div className="h-0.5 w-20 bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent rounded-full" />
        </div>

        {/* Right Controls: View Switcher + Search + Sort */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          {/* View Mode Switcher */}
          <div className="grid grid-cols-2 sm:flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-white/[0.08] text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setViewMode('spotlight');
                soundFx.playClick(540);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                viewMode === 'spotlight'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span>3D Parallax Cards</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('heatmap');
                soundFx.playClick(560);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                viewMode === 'heatmap'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>D3 Node Heatmap</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('blueprint');
                soundFx.playClick(580);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                viewMode === 'blueprint'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Architecture Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('analytics');
                soundFx.playClick(620);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                viewMode === 'analytics'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span>Telemetry</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter skills, domains..."
              className="w-full bg-slate-950/90 border border-white/[0.08] text-slate-200 text-xs rounded-xl pl-8 pr-7 py-2 focus:outline-none focus:border-emerald-500/60 transition-all placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Mode */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => {
                setSortMode('default');
                soundFx.playClick();
              }}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                sortMode === 'default'
                  ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Priority
            </button>
            <button
              type="button"
              onClick={() => {
                setSortMode('proficiency');
                soundFx.playClick();
              }}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                sortMode === 'proficiency'
                  ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mastery %
            </button>
            <button
              type="button"
              onClick={() => {
                setSortMode('name');
                soundFx.playClick();
              }}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                sortMode === 'name'
                  ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>A-Z</span>
            </button>
          </div>
        </div>
      </div>

      {/* Domain Telemetry Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] backdrop-blur-xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
              System Mastery Avg
            </span>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400 mt-0.5">
              {summaryStats.avgMastery}%
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Production SLA Verified
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] backdrop-blur-xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
              Architect-Tier Core
            </span>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-cyan-400 mt-0.5">
              {summaryStats.architectTierCount} Stack Pillars
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              95%+ Deep Proficiency
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] backdrop-blur-xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
              Engineering Domains
            </span>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-white mt-0.5">
              {Math.max(1, categories.length - 1)} Layers
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Full-Stack & Cloud Native
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] backdrop-blur-xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
              Interactive Blueprint
            </span>
            <div className="text-sm sm:text-base font-mono font-extrabold text-amber-400 mt-1">
              Click Any Card
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Inspect Projects & Specs
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-950/85 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap w-full sm:w-auto pb-0.5 sm:pb-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count =
              cat === 'All'
                ? visibleSkills.length
                : visibleSkills.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  soundFx.playClick();
                }}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive
                      ? 'bg-slate-950/25 text-slate-950 font-extrabold'
                      : 'bg-white/[0.05] text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {expandedSkillId !== null && viewMode === 'spotlight' && (
          <button
            type="button"
            onClick={() => setExpandedSkillId(null)}
            className="px-3 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[10px] font-mono font-bold cursor-pointer mr-1"
          >
            Collapse Expanded Console
          </button>
        )}
      </div>

      {/* VIEW 1: 3D Spotlight Matrix */}
      {viewMode === 'spotlight' && (
        <motion.div
          key={`spotlight-${selectedCategory}-${searchQuery}-${sortMode}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch"
        >
          {filteredSkills.map((skill, sIdx) => {
            const isExpanded = expandedSkillId === skill.id;
            const matchingProjects = projectsBySkillId.get(skill.id) || [];
            return (
              <div
                key={skill.id || `skill-${sIdx}`}
                className={
                  isExpanded
                    ? 'sm:col-span-2 lg:col-span-2 xl:col-span-2'
                    : 'col-span-1'
                }
              >
                <SkillSpotlightCard
                  skill={skill}
                  index={sIdx}
                  isExpanded={isExpanded}
                  onToggleExpand={() => {
                    setExpandedSkillId((prev) =>
                      prev === skill.id ? null : skill.id
                    );
                    soundFx.playClick(580);
                  }}
                  onOpenModal={() => {
                    onSelectSkillForModal(skill);
                    soundFx.playModalOpen();
                  }}
                  matchingProjects={matchingProjects}
                  prefersReduced={prefersReduced}
                  soundFx={soundFx}
                />
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Interactive D3.js Tech Proficiency Heatmap (Displayed in 'heatmap' mode or directly below 3D Spotlight Grid) */}
      {(viewMode === 'heatmap' || viewMode === 'spotlight') && (
        <TechProficiencyHeatmap
          skills={visibleSkills}
          projects={projects}
          prefersReduced={prefersReduced}
          onSelectSkillForModal={onSelectSkillForModal}
          soundFx={soundFx}
        />
      )}

      {/* VIEW 2: Architecture Blueprint Matrix (Grouped by Domain Layer) */}
      {viewMode === 'blueprint' && (
        <motion.div
          key="blueprint-matrix"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {categories
            .filter((c) => c !== 'All')
            .filter((c) => selectedCategory === 'All' || c === selectedCategory)
            .map((domain) => {
              const domainSkills = filteredSkills.filter(
                (s) => s.category === domain
              );
              if (domainSkills.length === 0) return null;

              return (
                <div
                  key={domain}
                  className="p-5 sm:p-6 rounded-2xl bg-slate-900/75 border border-white/[0.08] backdrop-blur-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                      <h3 className="text-base sm:text-lg font-extrabold text-white font-mono uppercase tracking-wider">
                        {domain} Architecture Layer
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {domainSkills.length} Active Subsystems
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {domainSkills.map((skill) => {
                      const meta = deriveSkillMeta(skill);
                      const itemColor = skill.color || '#10b981';
                      const matchedCount =
                        (projectsBySkillId.get(skill.id) || []).length;

                      return (
                        <div
                          key={skill.id}
                          onClick={() => {
                            onSelectSkillForModal(skill);
                            soundFx.playModalOpen();
                          }}
                          className="p-4 rounded-xl bg-slate-950/85 hover:bg-slate-950 border border-white/[0.06] hover:border-emerald-500/40 transition-all cursor-pointer group space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-9 h-9 rounded-lg border flex items-center justify-center p-1.5 bg-slate-900 shrink-0"
                                style={{ borderColor: `${itemColor}45` }}
                              >
                                <SkillMediaRenderer
                                  src={skill.iconUrl}
                                  fallbackIcon={skill.iconName || 'Code2'}
                                  fallbackColor={itemColor}
                                  alt={skill.name}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors truncate">
                                  {skill.name}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                                  <span>{meta.tierTag}</span>
                                  <span>•</span>
                                  <span>{meta.years}+ Yrs</span>
                                  {matchedCount > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-cyan-400">
                                        {matchedCount} Projects
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="text-xs font-mono font-extrabold text-emerald-400 shrink-0">
                              {meta.proficiency}%
                            </span>
                          </div>

                          {/* Linear Telemetry Progress Bar */}
                          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${meta.proficiency}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: itemColor }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </motion.div>
      )}

      {/* VIEW 3: Recharts Proficiency Telemetry Analytics */}
      {viewMode === 'analytics' && (
        <motion.div
          key="proficiency-analytics"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Left Chart: Top Technologies Proficiency Distribution */}
          <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  REAL-TIME COMPETENCY TELEMETRY
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                  Technology Proficiency & Production SLA Index (%)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                Top {summaryStats.topSkillsChartData.length} Filtered Skills
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summaryStats.topSkillsChartData}
                  margin={{ top: 10, right: 16, left: -12, bottom: 24 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={50}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(16,185,129,0.08)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(2, 6, 23, 0.95)',
                      borderColor: 'rgba(16, 185, 129, 0.35)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="proficiency" name="Mastery SLA %" radius={[6, 6, 0, 0]}>
                    {summaryStats.topSkillsChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color || '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Panel: Domain Layer Breakdown */}
          <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  ARCHITECTURAL COVERAGE
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                  Domain Layer Density
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                {summaryStats.domainData.map((dom) => (
                  <div
                    key={dom.category}
                    className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-200">
                        {dom.category}
                      </span>
                      <span className="text-emerald-400 font-extrabold">
                        {dom.avgProficiency}% Avg ({dom.count})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                        style={{ width: `${dom.avgProficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                All competencies synchronized with live Admin CMS & verified in production repositories.
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty Search Fallback */}
      {filteredSkills.length === 0 && (
        <div className="text-center py-12 px-4 bg-slate-900/40 rounded-2xl border border-white/[0.06] space-y-3">
          <Code2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">
            No matching technical skills found
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for different keywords or reset your category filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
          >
            Reset Skill Filters
          </button>
        </div>
      )}
    </div>
  );
}

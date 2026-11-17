import React, { useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'motion/react';
import {
  ArrowUpDown,
  Check,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  GitBranch,
  Layers,
  LayoutGrid,
  Search,
  Sparkles,
  Star,
  Terminal,
  Workflow,
  Wrench,
  X,
} from 'lucide-react';
import { ToolItem } from '../data/cmsMockData';
import { ToolIconRenderer } from '../utils/portfolioIconHelpers';

interface ToolsEcosystemWorkbenchProps {
  tools: ToolItem[];
  prefersReduced?: boolean;
  onSelectToolForModal: (tool: ToolItem) => void;
  soundFx: {
    playHover: () => void;
    playClick: (freq?: number) => void;
    playModalOpen: () => void;
  };
}

interface DerivedToolMeta {
  cliCommand: string;
  workflowStage: string;
  experiencePercent: number;
  yearsLabel: string;
  useCases: string[];
}

function deriveToolMeta(tool: ToolItem): DerivedToolMeta {
  const nameLower = (tool.name || '').toLowerCase();
  const catLower = (tool.category || '').toLowerCase();

  let defaultCli = `$ ${tool.slug || nameLower.replace(/\s+/g, '-')} --version && status --health=ok`;
  let defaultStage = tool.workflowStage || 'Core Engineering';
  let defaultUseCases =
    Array.isArray(tool.useCases) && tool.useCases.length > 0
      ? tool.useCases
      : ['Production Workflow', 'Automated Tooling'];

  if (nameLower.includes('intellij') || nameLower.includes('eclipse') || nameLower.includes('vs code') || nameLower.includes('vscode') || catLower.includes('ide')) {
    defaultCli = `$ idea64 ./enterprise-microservice --profile=spring-cloud-jvm21`;
    defaultStage = '01 · IDE & Code Authoring';
    if (!tool.useCases?.length) {
      defaultUseCases = ['JVM Profiler & Debugger', 'Refactoring & AST Analysis'];
    }
  } else if (nameLower.includes('git') || nameLower.includes('github') || catLower.includes('version')) {
    defaultCli = `$ git checkout -b feat/distributed-ledger && gh pr create --fill`;
    defaultStage = '01 · IDE & Code Authoring';
    if (!tool.useCases?.length) {
      defaultUseCases = ['Trunk-Based GitOps', 'Automated PR Checks'];
    }
  } else if (nameLower.includes('maven') || nameLower.includes('gradle') || nameLower.includes('spring') || nameLower.includes('java') || catLower.includes('backend')) {
    defaultCli = `$ mvn clean verify -Pproduction -Dspring.profiles.active=prod`;
    defaultStage = '02 · Backend & Persistence';
    if (!tool.useCases?.length) {
      defaultUseCases = ['Dependency Graph Management', 'Spring Boot Packaging'];
    }
  } else if (nameLower.includes('mysql') || nameLower.includes('postgres') || nameLower.includes('redis') || nameLower.includes('mongo') || catLower.includes('database')) {
    defaultCli = `$ psql -h prod-cluster.internal -c "EXPLAIN ANALYZE SELECT * FROM ledger_tx;"`;
    defaultStage = '02 · Backend & Persistence';
    if (!tool.useCases?.length) {
      defaultUseCases = ['3NF Query Execution Plans', 'Sub-ms Cache Inspection'];
    }
  } else if (nameLower.includes('react') || nameLower.includes('vite') || nameLower.includes('tailwind') || nameLower.includes('figma') || catLower.includes('frontend') || catLower.includes('design')) {
    defaultCli = `$ npm run build -- --mode production && vite preview --port 3000`;
    defaultStage = '03 · Reactive UI & Design';
    if (!tool.useCases?.length) {
      defaultUseCases = ['HMR Bundle Optimization', 'Design System Tokens'];
    }
  } else if (nameLower.includes('docker') || nameLower.includes('kubernetes') || nameLower.includes('aws') || nameLower.includes('vercel') || nameLower.includes('cloud') || catLower.includes('devops') || catLower.includes('cloud')) {
    defaultCli = `$ docker compose -f docker-compose.prod.yml up -d --build --scale api=4`;
    defaultStage = '04 · Cloud & Container Infra';
    if (!tool.useCases?.length) {
      defaultUseCases = ['Multi-Stage Containerization', 'Zero-Downtime Rollouts'];
    }
  } else if (nameLower.includes('postman') || nameLower.includes('swagger') || nameLower.includes('junit') || catLower.includes('api') || catLower.includes('test')) {
    defaultCli = `$ newman run ./collections/enterprise-api.json -e prod.env.json`;
    defaultStage = '05 · API Diagnostics & QA';
    if (!tool.useCases?.length) {
      defaultUseCases = ['OpenAPI 3.1 Contract Testing', 'Load & Latency Assertions'];
    }
  }

  let experiencePercent = 90;
  if (tool.experienceLevel === 'Expert') experiencePercent = 98;
  else if (tool.experienceLevel === 'Advanced') experiencePercent = 92;
  else if (tool.experienceLevel === 'Intermediate') experiencePercent = 82;
  else if (tool.experienceLevel === 'Beginner') experiencePercent = 70;

  const years = Number(tool.yearsOfExperience) || 3;

  return {
    cliCommand: tool.cliCommand || defaultCli,
    workflowStage: tool.workflowStage || defaultStage,
    experiencePercent,
    yearsLabel: `${years}+ Yrs Production`,
    useCases: defaultUseCases,
  };
}

interface WorkbenchToolCardProps {
  tool: ToolItem;
  index: number;
  isCliOpen: boolean;
  onToggleCli: () => void;
  onOpenModal: () => void;
  prefersReduced?: boolean;
  soundFx: ToolsEcosystemWorkbenchProps['soundFx'];
}

const WorkbenchToolCard: React.FC<WorkbenchToolCardProps> = ({
  tool,
  index,
  isCliOpen,
  onToggleCli,
  onOpenModal,
  prefersReduced,
  soundFx,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 250, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 250, damping: 24 });

  const brandColor = tool.brandColor || '#10B981';
  const meta = useMemo(() => deriveToolMeta(tool), [tool]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReduced || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    cardRef.current.style.setProperty('--spot-x', `${(relX / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--spot-y', `${(relY / rect.height) * 100}%`);
    rotateX.set(-((relY / rect.height) - 0.5) * 6);
    rotateY.set(((relX / rect.width) - 0.5) * 6);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const handleCopyCli = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(meta.cliCommand);
    setCopiedCli(true);
    soundFx.playClick(700);
    setTimeout(() => setCopiedCli(false), 1800);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={
        prefersReduced
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 18, scale: 0.97 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.12, margin: '-20px' }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.03, 0.18),
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => soundFx.playHover()}
      onMouseLeave={handleMouseLeave}
      style={
        prefersReduced
          ? undefined
          : {
              rotateX: springX,
              rotateY: springY,
              transformPerspective: 1050,
            }
      }
      onClick={onOpenModal}
      className="group relative rounded-2xl bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-md border border-white/[0.07] hover:border-emerald-500/45 transition-colors duration-200 flex flex-col justify-between overflow-hidden cursor-pointer shadow-lg"
    >
      {/* Dynamic Brand Radial Aura */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background: `radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${brandColor}22, transparent 70%)`,
        }}
      />

      {/* Top Workbench Header Strip */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-white/[0.05] flex items-center justify-between gap-2 text-[9px] font-mono text-slate-400 relative z-10">
        <div className="flex items-center gap-1.5 truncate">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: brandColor }}
          />
          <span className="truncate font-semibold text-slate-300">
            {meta.workflowStage}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {tool.isFeatured && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              <span>Core</span>
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]">
            {tool.category}
          </span>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-4 sm:p-5 space-y-3.5 relative z-10 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Icon + Name + Experience Badge */}
          <div className="flex items-start gap-3.5">
            <div
              className="p-2.5 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300 shrink-0 shadow-inner bg-slate-950"
              style={{
                borderColor: tool.borderColor || `${brandColor}45`,
                borderWidth: '1px',
                boxShadow: `0 0 14px ${brandColor}22`,
              }}
            >
              <ToolIconRenderer tool={tool} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3
                  className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors truncate"
                  title={tool.name}
                >
                  {tool.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-wider"
                  style={{ color: brandColor }}
                >
                  {tool.experienceLevel || 'Expert'}
                </span>
                <span className="text-slate-600 text-[10px]">•</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {meta.yearsLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {tool.description && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 font-sans">
              {tool.description}
            </p>
          )}

          {/* Use Case Micro-Tags */}
          <div className="flex flex-wrap gap-1.5">
            {meta.useCases.map((uc, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-slate-950/80 text-slate-300 border border-white/[0.06]"
              >
                {uc}
              </span>
            ))}
          </div>

          {/* Proficiency Meter Bar */}
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>WORKFLOW INTEGRATION</span>
              <span className="text-slate-200 font-bold">
                {meta.experiencePercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${meta.experiencePercent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: brandColor }}
              />
            </div>
          </div>
        </div>

        {/* Expandable Interactive CLI / Config Drawer */}
        <AnimatePresence initial={false}>
          {isCliOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 font-mono text-[10px] space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between text-slate-400 border-b border-white/[0.06] pb-1">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Terminal className="w-3 h-3" />
                    <span>WORKBENCH CLI</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCli}
                    className="px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedCli ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <code className="block text-emerald-300 break-all leading-relaxed">
                  {meta.cliCommand}
                </code>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="pt-3 mt-1 border-t border-white/[0.06] flex items-center justify-between gap-2 text-[10px] font-mono">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCli();
              soundFx.playClick(560);
            }}
            className={`px-2.5 py-1 rounded-lg border transition-all inline-flex items-center gap-1 cursor-pointer font-bold ${
              isCliOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.07]'
            }`}
          >
            <Terminal className="w-3 h-3 text-emerald-400" />
            <span>{isCliOpen ? 'Hide CLI' : 'CLI Spec'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {tool.officialWebsite && (
              <a
                href={tool.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                }}
                className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-400 border border-white/[0.06] transition-colors inline-flex items-center gap-1 font-bold"
                title={`Visit ${tool.name} official website`}
              >
                <span>Docs</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
            <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Inspect ↗
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function ToolsEcosystemWorkbench({
  tools,
  prefersReduced = false,
  onSelectToolForModal,
  soundFx,
}: ToolsEcosystemWorkbenchProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<'featured' | 'experience' | 'name'>(
    'featured'
  );
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'workbench' | 'pipeline'>(
    'workbench'
  );
  const [openCliToolIds, setOpenCliToolIds] = useState<Record<number, boolean>>(
    {}
  );

  const visibleTools = useMemo(() => {
    return (Array.isArray(tools) ? tools : []).filter(
      (t) => t && t.isVisible !== false
    );
  }, [tools]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(visibleTools.map((t) => t.category).filter(Boolean))
    );
    return ['All', ...unique];
  }, [visibleTools]);

  const filteredTools = useMemo(() => {
    let list = [...visibleTools];

    if (selectedCategory !== 'All') {
      list = list.filter((t) => t.category === selectedCategory);
    }

    if (featuredOnly) {
      list = list.filter((t) => t.isFeatured);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          (t.name || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }

    if (sortMode === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortMode === 'experience') {
      list.sort(
        (a, b) =>
          (Number(b.yearsOfExperience) || 3) -
          (Number(a.yearsOfExperience) || 3)
      );
    } else {
      list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
    }

    return list;
  }, [visibleTools, selectedCategory, featuredOnly, searchQuery, sortMode]);

  // Group tools by DevOps & Engineering Workflow Stage for Pipeline view
  const pipelineStages = useMemo(() => {
    const stageMap: Record<string, ToolItem[]> = {};
    filteredTools.forEach((tool) => {
      const stage = deriveToolMeta(tool).workflowStage;
      if (!stageMap[stage]) stageMap[stage] = [];
      stageMap[stage].push(tool);
    });
    return Object.entries(stageMap).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTools]);

  const toggleCliForTool = (id: number) => {
    setOpenCliToolIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-7">
      {/* Header with Workbench Mode Switcher, Search & Sort */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-4 border-b border-white/[0.06]">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>DEVELOPER WORKBENCH & ECOSYSTEM COMMAND CENTER</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{filteredTools.length} Active Utilities</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-luxury text-white tracking-wide">
            Tools & Engineering Environment
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
            Production IDEs, build orchestration engines, container runtimes, relational query analyzers, and API diagnostic suites powering daily systems engineering.
          </p>
          <div className="h-0.5 w-20 bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent rounded-full" />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          {/* View Mode Toggle */}
          <div className="grid grid-cols-2 sm:flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-white/[0.08] text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setViewMode('workbench');
                soundFx.playClick(540);
              }}
              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                viewMode === 'workbench'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span>Workbench Grid</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('pipeline');
                soundFx.playClick(600);
              }}
              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                viewMode === 'pipeline'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Workflow className="w-3.5 h-3.5 shrink-0" />
              <span>Delivery Pipeline</span>
            </button>
          </div>

          {/* Core Daily Driver Toggle */}
          <button
            type="button"
            onClick={() => {
              setFeaturedOnly((prev) => !prev);
              soundFx.playClick();
            }}
            className={`px-3 py-2 rounded-xl font-mono text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              featuredOnly
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-950/90 text-slate-400 hover:text-white border-white/[0.08]'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                featuredOnly ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
            <span>Core Drivers Only</span>
          </button>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools, IDEs, CLI..."
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
          <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-white/[0.08] text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setSortMode('featured');
                soundFx.playClick();
              }}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer text-center ${
                sortMode === 'featured'
                  ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Featured
            </button>
            <button
              type="button"
              onClick={() => {
                setSortMode('experience');
                soundFx.playClick();
              }}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer text-center ${
                sortMode === 'experience'
                  ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Years
            </button>
            <button
              type="button"
              onClick={() => {
                setSortMode('name');
                soundFx.playClick();
              }}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
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

      {/* Category Filter Bar */}
      {categories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap p-1.5 rounded-2xl bg-slate-950/85 border border-white/[0.08] backdrop-blur-xl">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count =
              cat === 'All'
                ? visibleTools.length
                : visibleTools.filter((t) => t.category === cat).length;
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
      )}

      {/* VIEW 1: 3D Workbench Command Grid */}
      {viewMode === 'workbench' && filteredTools.length > 0 && (
        <motion.div
          key={`tools-workbench-${selectedCategory}-${searchQuery}-${sortMode}-${featuredOnly}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
        >
          {filteredTools.map((tool, tIdx) => (
            <WorkbenchToolCard
              key={tool.id || `tool-${tIdx}`}
              tool={tool}
              index={tIdx}
              isCliOpen={Boolean(openCliToolIds[tool.id])}
              onToggleCli={() => toggleCliForTool(tool.id)}
              onOpenModal={() => {
                onSelectToolForModal(tool);
                soundFx.playModalOpen();
              }}
              prefersReduced={prefersReduced}
              soundFx={soundFx}
            />
          ))}
        </motion.div>
      )}

      {/* VIEW 2: Software Delivery & Operations Pipeline Flow */}
      {viewMode === 'pipeline' && filteredTools.length > 0 && (
        <motion.div
          key="tools-pipeline"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {pipelineStages.map(([stageName, stageTools], sIdx) => (
            <div
              key={stageName}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900/75 border border-white/[0.08] backdrop-blur-xl space-y-4 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-extrabold">
                    STAGE 0{sIdx + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white font-mono">
                    {stageName}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {stageTools.length} Integrated{' '}
                  {stageTools.length === 1 ? 'Utility' : 'Utilities'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {stageTools.map((tool) => {
                  const meta = deriveToolMeta(tool);
                  const brandColor = tool.brandColor || '#10B981';
                  return (
                    <div
                      key={tool.id}
                      onClick={() => {
                        onSelectToolForModal(tool);
                        soundFx.playModalOpen();
                      }}
                      className="p-4 rounded-xl bg-slate-950/85 hover:bg-slate-950 border border-white/[0.06] hover:border-emerald-500/40 transition-all cursor-pointer group space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="p-2 rounded-lg bg-slate-900 border shrink-0"
                            style={{ borderColor: `${brandColor}45` }}
                          >
                            <ToolIconRenderer tool={tool} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors truncate">
                              {tool.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {tool.experienceLevel} • {meta.yearsLabel}
                            </div>
                          </div>
                        </div>
                        {tool.isFeatured && (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        )}
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900/90 border border-white/[0.05] font-mono text-[10px] text-emerald-300 truncate">
                        {meta.cliCommand}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-14 px-4 bg-slate-900/40 rounded-2xl border border-white/[0.06] space-y-3">
          <Wrench className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">
            No matching workbench tools found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No software tools match your current filter query. Try resetting your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setFeaturedOnly(false);
              setSearchQuery('');
            }}
            className="px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
          >
            Reset Workbench Filters
          </button>
        </div>
      )}
    </div>
  );
}

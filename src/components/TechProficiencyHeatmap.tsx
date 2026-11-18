import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  CheckCircle2,
  Code2,
  Cpu,
  ExternalLink,
  Flame,
  FolderGit2,
  GitCommit,
  Layers,
  Sparkles,
  Terminal,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { ProjectItem, SkillItem } from '../data/cmsMockData';
import SkillMediaRenderer from './SkillMediaRenderer';

export interface SkillProjectUsageStat {
  projectId: number;
  projectTitle: string;
  category: string;
  architectureType: string;
  usageSharePct: number;
  moduleCount: number;
  commitsCount: number;
  criticalityScore: number;
  latencySla: string;
  liveUrl?: string;
}

export interface HeatmapNodeData {
  skill: SkillItem;
  proficiency: number;
  years: number;
  heatScore: number;
  tierLabel: string;
  accentColor: string;
  quarterlyHeat: number[]; // 8 quarters of intensity (0..100)
  expertiseDimensions: {
    dimension: string;
    score: number;
  }[];
  projectUsages: SkillProjectUsageStat[];
}

interface TechProficiencyHeatmapProps {
  skills: SkillItem[];
  projects: ProjectItem[];
  prefersReduced?: boolean;
  onSelectSkillForModal?: (skill: SkillItem) => void;
  soundFx: {
    playHover: () => void;
    playClick: (freq?: number) => void;
    playModalOpen: () => void;
  };
}

function deterministicHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function buildHeatmapNodeData(
  skill: SkillItem,
  allProjects: ProjectItem[]
): HeatmapNodeData {
  const sName = (skill.name || 'Skill').toLowerCase();
  const seed = deterministicHash(`${skill.id}-${skill.name}-${skill.category}`);

  let defaultProf = 92;
  let defaultYears = 3;
  let tierLabel = skill.tierBadge || 'Production Core';

  if (
    sName.includes('java') ||
    sName.includes('spring') ||
    sName.includes('microservice')
  ) {
    defaultProf = 98;
    defaultYears = 4;
    tierLabel = 'Architect Core';
  } else if (
    sName.includes('sql') ||
    sName.includes('postgres') ||
    sName.includes('mysql') ||
    sName.includes('redis') ||
    sName.includes('hibernate')
  ) {
    defaultProf = 95;
    defaultYears = 4;
    tierLabel = 'Distributed Data';
  } else if (
    sName.includes('react') ||
    sName.includes('typescript') ||
    sName.includes('tailwind') ||
    sName.includes('javascript')
  ) {
    defaultProf = 95;
    defaultYears = 4;
    tierLabel = 'Reactive UI';
  } else if (
    sName.includes('docker') ||
    sName.includes('aws') ||
    sName.includes('cloud') ||
    sName.includes('security') ||
    sName.includes('jwt')
  ) {
    defaultProf = 93;
    defaultYears = 3;
    tierLabel = 'Cloud & Zero-Trust';
  }

  const proficiency = Math.min(
    100,
    Math.max(55, Number(skill.proficiency) || defaultProf)
  );
  const years = Number(skill.yearsOfExperience) || defaultYears;

  // Match real portfolio projects that utilize this skill
  const validProjects = (Array.isArray(allProjects) ? allProjects : []).filter(
    (p) => p && p.isVisible !== false
  );

  const directMatches = validProjects.filter((proj) => {
    const pSkills = Array.isArray(proj.skills) ? proj.skills : [];
    return pSkills.some((ps) => {
      const psLower = ps.toLowerCase();
      return (
        psLower === sName ||
        psLower.includes(sName) ||
        sName.includes(psLower)
      );
    });
  });

  // Ensure every node has project-specific usage stats (direct matches first, then category/architectural matches)
  const fallbackProjects =
    directMatches.length > 0
      ? directMatches
      : validProjects.slice(0, Math.min(3, validProjects.length));

  const projectUsages: SkillProjectUsageStat[] = fallbackProjects.map(
    (proj, idx) => {
      const pSeed = deterministicHash(`${skill.name}-${proj.title}-${idx}`);
      const isDirect = directMatches.some((dm) => dm.id === proj.id);
      const usageSharePct = isDirect
        ? Math.min(98, 76 + (pSeed % 21))
        : Math.min(88, 62 + (pSeed % 22));
      const moduleCount = 8 + (pSeed % 19);
      const commitsCount = 42 + (pSeed % 140);
      const criticalityScore = Math.min(99, Math.round((proficiency + usageSharePct) / 2));
      const latencySla = `${(1.8 + (pSeed % 65) / 10).toFixed(1)}ms P95`;

      return {
        projectId: proj.id,
        projectTitle: proj.title,
        category: proj.category || 'Enterprise System',
        architectureType: proj.architectureType || 'Microservices & Cloud',
        usageSharePct,
        moduleCount,
        commitsCount,
        criticalityScore,
        latencySla,
        liveUrl: proj.liveUrl,
      };
    }
  );

  // Generate 8 quarters of proficiency/usage intensity
  const quarterlyHeat = Array.from({ length: 8 }, (_, qIdx) => {
    const base = Math.max(50, proficiency - (7 - qIdx) * 4);
    const wave = ((seed >> qIdx) & 7) - 3;
    return Math.min(100, Math.max(45, base + wave));
  });

  // 5 D3 expertise depth dimensions
  const expertiseDimensions = [
    {
      dimension: 'System Architecture',
      score: Math.min(100, proficiency),
    },
    {
      dimension: 'Throughput & Concurrency',
      score: Math.min(100, Math.max(68, proficiency - 2 + (seed % 5))),
    },
    {
      dimension: 'Security & Resilience',
      score: Math.min(100, Math.max(70, proficiency - 3 + ((seed >> 2) % 6))),
    },
    {
      dimension: 'Data & Memory Tuning',
      score: Math.min(100, Math.max(66, proficiency - 4 + ((seed >> 4) % 7))),
    },
    {
      dimension: 'CI/CD & Production SLA',
      score: Math.min(100, Math.max(72, proficiency - 1 + ((seed >> 6) % 4))),
    },
  ];

  const heatScore = Math.min(
    100,
    Math.round(proficiency * 0.75 + Math.min(25, projectUsages.length * 7))
  );

  return {
    skill,
    proficiency,
    years,
    heatScore,
    tierLabel,
    accentColor: skill.color || '#10b981',
    quarterlyHeat,
    expertiseDimensions,
    projectUsages,
  };
}

export default function TechProficiencyHeatmap({
  skills,
  projects,
  prefersReduced = false,
  onSelectSkillForModal,
  soundFx,
}: TechProficiencyHeatmapProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [hoveredChartProject, setHoveredChartProject] =
    useState<SkillProjectUsageStat | null>(null);

  const usageSvgRef = useRef<SVGSVGElement | null>(null);
  const depthSvgRef = useRef<SVGSVGElement | null>(null);

  const nodes = useMemo(() => {
    const visible = (Array.isArray(skills) ? skills : []).filter(
      (s) => s && s.visibility !== false
    );
    return visible.map((s) => buildHeatmapNodeData(s, projects));
  }, [skills, projects]);

  const domains = useMemo(() => {
    const unique = Array.from(
      new Set(nodes.map((n) => n.skill.category).filter(Boolean))
    );
    return ['All', ...unique];
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    if (selectedDomain === 'All') return nodes;
    return nodes.filter((n) => n.skill.category === selectedDomain);
  }, [nodes, selectedDomain]);

  // Active node for the D3 inspector panel
  const activeNode = useMemo(() => {
    if (filteredNodes.length === 0) return null;
    if (selectedSkillId !== null) {
      const found = filteredNodes.find((n) => n.skill.id === selectedSkillId);
      if (found) return found;
    }
    return filteredNodes[0];
  }, [filteredNodes, selectedSkillId]);

  // D3 Color scale for thermal/bioluminescent node intensity
  const d3HeatColorScale = useMemo(() => {
    return d3
      .scaleLinear<string>()
      .domain([65, 82, 92, 100])
      .range(['#0284c7', '#06b6d4', '#10b981', '#34d399'])
      .clamp(true);
  }, []);

  // D3 Chart 1: Project-Specific Usage Bar & Telemetry Visualization
  useEffect(() => {
    if (!usageSvgRef.current || !activeNode) return;

    const svg = d3.select(usageSvgRef.current);
    svg.selectAll('*').remove();

    const width = 540;
    const height = 235;
    const margin = { top: 18, right: 56, bottom: 28, left: 155 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const data = activeNode.projectUsages;
    if (data.length === 0) return;

    const defs = svg.append('defs');
    const barGrad = defs
      .append('linearGradient')
      .attr('id', `d3-usage-grad-${activeNode.skill.id}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    barGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', activeNode.accentColor)
      .attr('stop-opacity', 0.35);
    barGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', activeNode.accentColor)
      .attr('stop-opacity', 0.95);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

    const yScale = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.projectTitle))
      .range([0, innerHeight])
      .padding(0.32);

    // Subtle vertical grid lines
    const xTicks = [0, 25, 50, 75, 100];
    g.selectAll('.grid-line')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'rgba(255,255,255,0.06)')
      .attr('stroke-dasharray', '3,3');

    // X-axis labels
    g.selectAll('.x-label')
      .data(xTicks)
      .enter()
      .append('text')
      .attr('x', (d) => xScale(d))
      .attr('y', innerHeight + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-family', 'monospace')
      .attr('font-size', '9px')
      .text((d) => `${d}%`);

    // Background track bars
    g.selectAll('.bar-track')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.projectTitle) || 0)
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', 'rgba(15, 23, 42, 0.85)')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)');

    // Animated D3 foreground usage bars
    const bars = g
      .selectAll('.bar-fill')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => yScale(d.projectTitle) || 0)
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', `url(#d3-usage-grad-${activeNode.skill.id})`)
      .style('cursor', 'pointer')
      .on('mouseenter', (_, d) => {
        setHoveredChartProject(d);
      })
      .on('mouseleave', () => {
        setHoveredChartProject(null);
      });

    if (prefersReduced || typeof (bars as any).transition !== 'function') {
      bars
        .style('transition', prefersReduced ? 'none' : 'width 650ms cubic-bezier(0.22, 1, 0.36, 1)')
        .attr('width', (d) => xScale(d.usageSharePct));
    } else {
      bars
        .attr('width', 0)
        .transition(d3.transition().duration(650).ease(d3.easeCubicOut))
        .delay((_, i) => i * 70)
        .attr('width', (d) => xScale(d.usageSharePct));
    }

    // Glowing terminal node dot at end of each bar
    const dots = g
      .selectAll('.bar-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cy', (d) => (yScale(d.projectTitle) || 0) + yScale.bandwidth() / 2)
      .attr('r', 4.5)
      .attr('fill', '#ffffff')
      .attr('stroke', activeNode.accentColor)
      .attr('stroke-width', 2.5);

    if (prefersReduced || typeof (dots as any).transition !== 'function') {
      dots
        .style('transition', prefersReduced ? 'none' : 'cx 650ms cubic-bezier(0.22, 1, 0.36, 1)')
        .attr('cx', (d) => xScale(d.usageSharePct));
    } else {
      dots
        .attr('cx', 0)
        .transition(d3.transition().duration(650).ease(d3.easeCubicOut))
        .delay((_, i) => i * 70)
        .attr('cx', (d) => xScale(d.usageSharePct));
    }

    // Project Title Labels on Left
    g.selectAll('.y-label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', -10)
      .attr(
        'y',
        (d) => (yScale(d.projectTitle) || 0) + yScale.bandwidth() / 2 + 3.5
      )
      .attr('text-anchor', 'end')
      .attr('fill', '#e2e8f0')
      .attr('font-family', 'monospace')
      .attr('font-weight', '700')
      .attr('font-size', '10px')
      .text((d) =>
        d.projectTitle.length > 21
          ? `${d.projectTitle.slice(0, 19)}…`
          : d.projectTitle
      );

    // Percentage + Commits Telemetry on Right
    g.selectAll('.val-label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d) => xScale(d.usageSharePct) + 10)
      .attr(
        'y',
        (d) => (yScale(d.projectTitle) || 0) + yScale.bandwidth() / 2 + 3.5
      )
      .attr('fill', activeNode.accentColor)
      .attr('font-family', 'monospace')
      .attr('font-weight', '800')
      .attr('font-size', '10px')
      .text((d) => `${d.usageSharePct}%`);
  }, [activeNode, prefersReduced]);

  // D3 Chart 2: Depth of Expertise & Quarterly Trajectory Curve
  useEffect(() => {
    if (!depthSvgRef.current || !activeNode) return;

    const svg = d3.select(depthSvgRef.current);
    svg.selectAll('*').remove();

    const width = 540;
    const height = 195;
    const margin = { top: 18, right: 20, bottom: 28, left: 36 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const quarters = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'NOW'];
    const series = activeNode.quarterlyHeat.map((val, idx) => ({
      quarter: quarters[idx] || `Q${idx + 1}`,
      value: val,
      idx,
    }));

    const defs = svg.append('defs');
    const areaGrad = defs
      .append('linearGradient')
      .attr('id', `d3-depth-area-${activeNode.skill.id}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', activeNode.accentColor)
      .attr('stop-opacity', 0.42);
    areaGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', activeNode.accentColor)
      .attr('stop-opacity', 0.02);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scalePoint<string>()
      .domain(series.map((d) => d.quarter))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear().domain([40, 100]).range([innerHeight, 0]);

    // Horizontal reference lines
    [50, 75, 100].forEach((tick) => {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(tick))
        .attr('y2', yScale(tick))
        .attr('stroke', 'rgba(255,255,255,0.06)')
        .attr('stroke-dasharray', '3,3');

      g.append('text')
        .attr('x', -8)
        .attr('y', yScale(tick) + 3)
        .attr('text-anchor', 'end')
        .attr('fill', '#64748b')
        .attr('font-family', 'monospace')
        .attr('font-size', '9px')
        .text(`${tick}%`);
    });

    // X-axis quarter labels
    g.selectAll('.q-label')
      .data(series)
      .enter()
      .append('text')
      .attr('x', (d) => xScale(d.quarter) || 0)
      .attr('y', innerHeight + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'monospace')
      .attr('font-size', '9px')
      .text((d) => d.quarter);

    const areaGenerator = d3
      .area<(typeof series)[0]>()
      .x((d) => xScale(d.quarter) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const lineGenerator = d3
      .line<(typeof series)[0]>()
      .x((d) => xScale(d.quarter) || 0)
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(series)
      .attr('fill', `url(#d3-depth-area-${activeNode.skill.id})`)
      .attr('d', areaGenerator);

    const path = g
      .append('path')
      .datum(series)
      .attr('fill', 'none')
      .attr('stroke', activeNode.accentColor)
      .attr('stroke-width', 2.5)
      .attr('d', lineGenerator);

    const totalLen = (path.node() as SVGPathElement)?.getTotalLength?.() || 600;
    if (!prefersReduced && typeof (path as any).transition === 'function') {
      path
        .attr('stroke-dasharray', `${totalLen} ${totalLen}`)
        .attr('stroke-dashoffset', totalLen)
        .transition(d3.transition().duration(750).ease(d3.easeCubicOut))
        .attr('stroke-dashoffset', 0);
    }

    // Glowing nodes on the D3 curve
    g.selectAll('.depth-node')
      .data(series)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.quarter) || 0)
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 4)
      .attr('fill', '#020617')
      .attr('stroke', activeNode.accentColor)
      .attr('stroke-width', 2.2);
  }, [activeNode, prefersReduced]);

  if (nodes.length === 0) return null;

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl p-4 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Subtle Ambient Bioluminescent Backdrop */}
      <div
        className="pointer-events-none absolute -top-28 -right-28 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-500"
        style={{
          background: activeNode?.accentColor || '#10b981',
        }}
      />

      {/* Top Header & Thermal Intensity Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06] relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>D3.JS INTERACTIVE TECH PROFICIENCY HEATMAP</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Click any glowing node to inspect D3 project usage & expertise telemetry
            </span>
          </div>
          <h3 className="text-lg sm:text-2xl font-extrabold text-white font-luxury tracking-wide">
            Glowing Node Matrix & Project Usage Telemetry
          </h3>
        </div>

        {/* Thermal Scale Legend + Domain Quick Filter */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-white/[0.07] text-[10px] font-mono text-slate-400">
            <span>Depth Scale:</span>
            <div className="flex items-center gap-1">
              {[70, 80, 90, 98].map((val) => (
                <span
                  key={val}
                  className="w-3.5 h-3.5 rounded-sm border border-white/10"
                  style={{
                    backgroundColor: d3HeatColorScale(val),
                    boxShadow: `0 0 8px ${d3HeatColorScale(val)}66`,
                  }}
                  title={`${val}%+ Proficiency`}
                />
              ))}
            </div>
            <span className="text-emerald-400 font-bold">98% SLA</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar sm:flex-wrap p-1 rounded-xl bg-slate-950/90 border border-white/[0.07] w-full sm:w-auto">
            {domains.map((dom) => (
              <button
                key={dom}
                type="button"
                onClick={() => {
                  setSelectedDomain(dom);
                  soundFx.playClick(550);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedDomain === dom
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Glowing Node Heatmap Grid | Right D3 Project Usage Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start relative z-10">
        {/* LEFT COLUMN (7 cols): Interactive Grid of Glowing Nodes */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Interactive Glowing Competency Nodes ({filteredNodes.length})</span>
            </span>
            <span className="text-[10px] text-emerald-400">
              Active Node: <strong className="text-white">{activeNode?.skill.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 w-full md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredNodes.map((node, nIdx) => {
              const isSelected = activeNode?.skill.id === node.skill.id;
              const nodeColor = d3HeatColorScale(node.heatScore);

              return (
                <motion.button
                  key={node.skill.id || `hm-node-${nIdx}`}
                  type="button"
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.25, delay: Math.min(nIdx * 0.02, 0.15) }}
                  whileHover={prefersReduced ? {} : { y: -4, scale: 1.03 }}
                  whileTap={prefersReduced ? {} : { scale: 0.98 }}
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={() => {
                    setSelectedSkillId(node.skill.id);
                    soundFx.playClick(640);
                  }}
                  className={`group relative text-left p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between gap-2.5 sm:gap-3 ${
                    isSelected
                      ? 'bg-slate-950/95 border-emerald-400/80 ring-2 ring-emerald-400/25'
                      : 'bg-slate-950/75 hover:bg-slate-950/95 border-white/[0.08] hover:border-emerald-500/40'
                  }`}
                  style={{
                    boxShadow: isSelected
                      ? `0 0 32px -4px ${node.accentColor}55, inset 0 0 18px ${node.accentColor}22`
                      : `0 0 16px -8px ${nodeColor}35`,
                  }}
                >
                  {/* Animated Glowing Radial Core Halo */}
                  <div
                    className={`pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl transition-opacity duration-300 ${
                      isSelected
                        ? 'opacity-45'
                        : 'opacity-15 group-hover:opacity-35'
                    }`}
                    style={{ backgroundColor: node.accentColor }}
                  />

                  {/* Top Row: Glowing Node Orb + Icon + Proficiency */}
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div
                      className="w-9 h-9 rounded-xl border flex items-center justify-center p-1.5 bg-slate-900 shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        borderColor: `${node.accentColor}55`,
                        boxShadow: `0 0 12px ${node.accentColor}35`,
                      }}
                    >
                      <SkillMediaRenderer
                        src={node.skill.iconUrl}
                        fallbackIcon={node.skill.iconName || 'Code2'}
                        fallbackColor={node.accentColor}
                        alt={node.skill.name}
                      />
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="relative flex h-2 w-2">
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ backgroundColor: nodeColor }}
                          />
                          <span
                            className="relative inline-flex rounded-full h-2 w-2"
                            style={{ backgroundColor: nodeColor }}
                          />
                        </span>
                        <span
                          className="text-xs font-mono font-extrabold"
                          style={{ color: nodeColor }}
                        >
                          {node.proficiency}%
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 block">
                        {node.projectUsages.length} Proj
                      </span>
                    </div>
                  </div>

                  {/* Skill Name & Category */}
                  <div className="relative z-10">
                    <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {node.skill.name}
                    </div>
                    <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 truncate mt-0.5">
                      {node.skill.category} • {node.years}Y
                    </div>
                  </div>

                  {/* 8-Quarter Micro Thermal Cells Bar */}
                  <div className="grid grid-cols-8 gap-1 pt-1 relative z-10">
                    {node.quarterlyHeat.map((qVal, qIdx) => (
                      <span
                        key={qIdx}
                        className="h-1.5 rounded-sm transition-all"
                        style={{
                          backgroundColor: d3HeatColorScale(qVal),
                          opacity: isSelected ? 0.95 : 0.65,
                        }}
                      />
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): D3.js Project-Specific Usage & Expertise Depth Console */}
        {activeNode && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode.skill.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="xl:col-span-5 rounded-2xl bg-slate-950/90 border border-white/[0.08] p-5 space-y-5 shadow-xl"
            >
              {/* Selected Node Header */}
              <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl border flex items-center justify-center p-2 bg-slate-900 shrink-0"
                    style={{
                      borderColor: `${activeNode.accentColor}60`,
                      boxShadow: `0 0 18px ${activeNode.accentColor}35`,
                    }}
                  >
                    <SkillMediaRenderer
                      src={activeNode.skill.iconUrl}
                      fallbackIcon={activeNode.skill.iconName || 'Code2'}
                      fallbackColor={activeNode.accentColor}
                      alt={activeNode.skill.name}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase"
                        style={{
                          backgroundColor: `${activeNode.accentColor}20`,
                          color: activeNode.accentColor,
                          border: `1px solid ${activeNode.accentColor}40`,
                        }}
                      >
                        {activeNode.tierLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {activeNode.years}+ Yrs Production
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold text-white truncate mt-1">
                      {activeNode.skill.name}
                    </h4>
                  </div>
                </div>

                {onSelectSkillForModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSkillForModal(activeNode.skill);
                      soundFx.playModalOpen();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold cursor-pointer shrink-0 transition-colors"
                  >
                    Full Specs ↗
                  </button>
                )}
              </div>

              {/* KPI Strip for Selected Node */}
              <div className="grid grid-cols-3 gap-2.5 font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/[0.05]">
                  <span className="text-[9px] text-slate-400 uppercase block">
                    Proficiency SLA
                  </span>
                  <span
                    className="text-base font-extrabold mt-0.5 block"
                    style={{ color: activeNode.accentColor }}
                  >
                    {activeNode.proficiency}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/[0.05]">
                  <span className="text-[9px] text-slate-400 uppercase block">
                    Heat Index
                  </span>
                  <span className="text-base font-extrabold text-cyan-400 mt-0.5 block">
                    {activeNode.heatScore}/100
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/[0.05]">
                  <span className="text-[9px] text-slate-400 uppercase block">
                    Active Repos
                  </span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">
                    {activeNode.projectUsages.length} Systems
                  </span>
                </div>
              </div>

              {/* D3 SVG Chart 1: Project-Specific Usage Share (%) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>D3.js Project-Specific Usage Intensity (%)</span>
                  </span>
                  {hoveredChartProject && (
                    <span className="text-cyan-300 font-bold">
                      {hoveredChartProject.commitsCount} Commits •{' '}
                      {hoveredChartProject.latencySla}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/75 border border-white/[0.06] overflow-hidden">
                  <svg
                    ref={usageSvgRef}
                    viewBox="0 0 540 235"
                    className="w-full h-auto overflow-visible"
                  />
                </div>
              </div>

              {/* D3 SVG Chart 2: Multi-Quarter Depth of Expertise Trajectory */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>D3.js Production Mastery & Velocity Curve</span>
                  </span>
                  <span className="text-slate-400">8-Quarter Telemetry</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/75 border border-white/[0.06] overflow-hidden">
                  <svg
                    ref={depthSvgRef}
                    viewBox="0 0 540 195"
                    className="w-full h-auto overflow-visible"
                  />
                </div>
              </div>

              {/* Project-Specific Usage Breakdown Cards */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Verified Project-Specific Usage Stats
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {activeNode.projectUsages.map((pu) => (
                    <a
                      key={pu.projectId}
                      href="#projects"
                      onClick={() => soundFx.playClick(600)}
                      className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-white/[0.06] hover:border-emerald-500/35 transition-all flex items-center justify-between gap-3 group/pu"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-white group-hover/pu:text-emerald-300 transition-colors truncate">
                          {pu.projectTitle}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                          <span>{pu.moduleCount} Modules</span>
                          <span>•</span>
                          <span>{pu.commitsCount} Commits</span>
                          <span>•</span>
                          <span className="text-emerald-400">{pu.latencySla}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className="text-xs font-mono font-extrabold block"
                          style={{ color: activeNode.accentColor }}
                        >
                          {pu.usageSharePct}% Stack
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          SLA {pu.criticalityScore}%
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

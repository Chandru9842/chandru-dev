import React, { useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
} from 'motion/react';
import {
  Award,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Cpu,
  Database,
  GraduationCap,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { ExperienceItem, EducationItem } from '../data/cmsMockData';

export interface BiographyMilestoneItem {
  id: string;
  phaseNumber: string;
  period: string;
  title: string;
  roleOrSubtitle: string;
  category: 'Architecture' | 'Engineering' | 'Foundation';
  badge?: string;
  location?: string;
  description: string;
  deliverables?: string[];
  technologies?: string[];
  metricHighlight?: string;
}

interface AboutBiographyTimelineProps {
  profile: any;
  experiences?: ExperienceItem[];
  education?: EducationItem[];
  prefersReduced?: boolean;
  onSoundClick?: (freq?: number) => void;
}

export function buildDefaultBiographyMilestones(
  profile: any,
  experiences: ExperienceItem[] = [],
  education: EducationItem[] = []
): BiographyMilestoneItem[] {
  // 1. If the Admin explicitly saved custom biographyMilestones in Profile settings, use them directly
  if (
    Array.isArray(profile?.biographyMilestones) &&
    profile.biographyMilestones.length > 0
  ) {
    return profile.biographyMilestones.map((m: any, idx: number) => ({
      id: m.id || `bio-ms-${idx}`,
      phaseNumber: m.phaseNumber || `PHASE 0${idx + 1}`,
      period: m.period || 'Present',
      title: m.title || 'Career Milestone',
      roleOrSubtitle: m.roleOrSubtitle || profile?.title || 'Principal Systems Architect',
      category: m.category || 'Architecture',
      badge: m.badge || 'VERIFIED MILESTONE',
      location: m.location || profile?.location || 'Bengaluru, India',
      description: m.description || '',
      deliverables: Array.isArray(m.deliverables) ? m.deliverables : [],
      technologies: Array.isArray(m.technologies) ? m.technologies : [],
      metricHighlight: m.metricHighlight || '',
    }));
  }

  // 2. Otherwise synthesize a cohesive, authentic Career Phase Biography Timeline
  // combining custom Admin aboutHighlights + Experience + Education + Core Architectural Phases
  const milestones: BiographyMilestoneItem[] = [
    {
      id: 'phase-principal-architect',
      phaseNumber: 'PHASE 01',
      period: '2024 — PRESENT',
      title:
        profile?.title ||
        'Principal Systems Architect & Full Stack Java Developer',
      roleOrSubtitle: profile?.currentCompany
        ? `${profile?.professionalLabel || 'Lead Systems Architecture'} @ ${profile.currentCompany}`
        : 'Distributed Cloud & Enterprise Microservices Architecture',
      category: 'Architecture',
      badge: 'CURRENT PHASE',
      location: profile?.location
        ? `${profile.location}${profile.country ? `, ${profile.country}` : ''}`
        : 'Bengaluru, India',
      description:
        profile?.biography ||
        'Architecting mission-critical Java 21 & Spring Boot 3.4 microservices, fault-tolerant Kafka event pipelines, and high-concurrency full-stack platforms engineered for 99.99% production availability.',
      deliverables: [
        'Designed event-driven microservices sustaining 18.4k+ requests/sec with sub-12ms P95 latency',
        'Enforced strict 3NF relational schemas in MySQL/PostgreSQL paired with sub-millisecond Redis caching',
        'Spearheaded zero-trust JWT/OAuth2 RBAC security and automated Docker/AWS CI/CD pipelines',
      ],
      technologies: [
        'Java 21',
        'Spring Boot 3.4',
        'Apache Kafka',
        'React 19',
        'TypeScript',
        'PostgreSQL',
        'Redis',
        'AWS',
      ],
      metricHighlight: '99.99% SLA · 18.4k+ RPS',
    },
    {
      id: 'phase-fullstack-engineering',
      phaseNumber: 'PHASE 02',
      period: '2022 — 2024',
      title: 'Full-Stack Enterprise Systems & Cloud-Native Engineering',
      roleOrSubtitle:
        experiences[0]?.company
          ? `${experiences[0].role} · ${experiences[0].company}`
          : 'High-Throughput API Gateways & Reactive Web Applications',
      category: 'Engineering',
      badge: 'ENTERPRISE SCALE',
      location: experiences[0]?.location || 'Bengaluru, India',
      description:
        experiences[0]?.description ||
        'Engineered end-to-end enterprise platforms bridging Spring Cloud backends with hardware-accelerated React & TypeScript interfaces, real-time telemetry dashboards, and resilient database migrations.',
      deliverables: [
        'Built multi-tenant REST & GraphQL API gateways with automated rate-limiting and circuit breakers',
        'Reduced relational query execution times by 64% via composite indexing and HikariCP pool tuning',
        'Delivered responsive React & Tailwind design systems with real-time WebSocket/SSE telemetry',
      ],
      technologies: [
        'Spring Security',
        'Hibernate / JPA',
        'MySQL 3NF',
        'React',
        'Docker',
        'REST APIs',
      ],
      metricHighlight: '< 1.2ms Cache P99',
    },
  ];

  // Include custom Admin aboutHighlights as dedicated timeline phases if present
  if (Array.isArray(profile?.aboutHighlights) && profile.aboutHighlights.length > 0) {
    profile.aboutHighlights.slice(0, 2).forEach((hl: any, idx: number) => {
      milestones.push({
        id: hl.id || `phase-custom-hl-${idx}`,
        phaseNumber: `PHASE 0${milestones.length + 1}`,
        period: hl.badge || 'ARCHITECTURAL PILLAR',
        title: hl.title || 'Core Engineering Domain',
        roleOrSubtitle: 'Specialized Systems & Architectural Focus',
        category: 'Architecture',
        badge: hl.badge || 'CORE DOMAIN',
        location: profile?.location || 'Bengaluru, India',
        description:
          hl.description ||
          'Production-hardened engineering subsystem designed for high scalability and clean maintainability.',
        deliverables: [
          'Modular domain-driven design with strict separation of concerns',
          'Automated integration verification and real-time operational observability',
        ],
        technologies: ['Java 21', 'Spring Boot', 'React 19', 'Cloud Native'],
        metricHighlight: hl.badge || 'VERIFIED',
      });
    });
  }

  // Final Phase: Academic & Algorithmic Foundation
  const primaryEdu = education[0];
  milestones.push({
    id: 'phase-foundation',
    phaseNumber: `PHASE 0${milestones.length + 1}`,
    period: primaryEdu
      ? `${primaryEdu.startDate || '2019'} — ${primaryEdu.endDate || '2023'}`
      : '2019 — 2023',
    title: primaryEdu
      ? `${primaryEdu.degree}${primaryEdu.fieldOfStudy ? ` (${primaryEdu.fieldOfStudy})` : ''}`
      : 'Computer Science, Data Structures & Algorithmic Foundations',
    roleOrSubtitle: primaryEdu?.institution || 'Core Systems & Software Engineering',
    category: 'Foundation',
    badge: primaryEdu?.grade || 'HONOURS FOUNDATION',
    location: 'India',
    description:
      'Built a rigorous foundation in object-oriented architecture, relational database normalization (3NF/BCNF), operating system concurrency, and competitive algorithmic problem-solving across 500+ challenges.',
    deliverables: [
      'Mastered core data structures, graph algorithms, dynamic programming, and JVM memory internals',
      'Architected capstone full-stack cloud applications and relational database engines',
    ],
    technologies: ['Java', 'Data Structures', 'Algorithms', 'DBMS & SQL', 'OS Internals'],
    metricHighlight: '500+ Algorithms Solved',
  });

  return milestones;
}

function getPhaseIcon(category: BiographyMilestoneItem['category'], idx: number) {
  if (category === 'Architecture') {
    return idx === 0 ? Cpu : ShieldCheck;
  }
  if (category === 'Engineering') {
    return Layers;
  }
  return GraduationCap;
}

export default function AboutBiographyTimeline({
  profile,
  experiences = [],
  education = [],
  prefersReduced = false,
  onSoundClick,
}: AboutBiographyTimelineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | 'Architecture' | 'Engineering' | 'Foundation'
  >('All');
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(
    'phase-principal-architect'
  );

  const allMilestones = useMemo(
    () => buildDefaultBiographyMilestones(profile, experiences, education),
    [profile, experiences, education]
  );

  const filteredMilestones = useMemo(() => {
    if (selectedCategory === 'All') return allMilestones;
    return allMilestones.filter((m) => m.category === selectedCategory);
  }, [allMilestones, selectedCategory]);

  // Scroll-linked progress spine animation via Framer Motion
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'end 25%'],
  });

  const smoothScaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <div ref={containerRef} className="space-y-6 relative">
      {/* Timeline Header & Interactive Phase Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Biography Timeline</span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-cyan-300 tabular-nums">
              {filteredMilestones.length} Career Phases
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            Architectural Evolution &amp; Professional Milestones
          </h4>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-white/[0.08] text-[11px] font-mono">
          {(
            [
              { id: 'All', label: 'All Phases' },
              { id: 'Architecture', label: 'Architecture' },
              { id: 'Engineering', label: 'Engineering' },
              { id: 'Foundation', label: 'Foundation' },
            ] as const
          ).map((tab) => {
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSoundClick?.(820);
                  setSelectedCategory(tab.id);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll-Triggered Timeline Track + Glass-Morphism Phase Containers */}
      <div className="relative pl-6 sm:pl-9 space-y-6">
        {/* Background Static Vertical Track Line */}
        <div
          className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-[2px] bg-slate-800/90 rounded-full overflow-hidden"
          aria-hidden="true"
        >
          {/* Framer Motion Scroll-Driven Glowing Emerald-Cyan Beam */}
          <motion.div
            style={{
              scaleY: prefersReduced ? 1 : smoothScaleY,
              transformOrigin: 'top',
            }}
            className="w-full h-full bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_16px_rgba(16,185,129,0.9)]"
          />
        </div>

        <AnimatePresence mode="popLayout">
          {filteredMilestones.map((ms, idx) => {
            const IconComponent = getPhaseIcon(ms.category, idx);
            const isExpanded =
              expandedMilestoneId === ms.id ||
              (expandedMilestoneId === null && idx === 0);

            return (
              <motion.article
                key={ms.id}
                layout="position"
                initial={
                  prefersReduced
                    ? { opacity: 1, x: 0, y: 0 }
                    : { opacity: 0, x: 24, y: 18 }
                }
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(idx * 0.08, 0.3),
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={prefersReduced ? {} : { y: -3 }}
                onClick={() => {
                  onSoundClick?.(isExpanded ? 740 : 900);
                  setExpandedMilestoneId((prev) =>
                    prev === ms.id ? '' : ms.id
                  );
                }}
                className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 backdrop-blur-2xl transition-all duration-300 cursor-pointer overflow-hidden border ${
                  isExpanded
                    ? 'bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-[#04121e]/95 border-emerald-400/60 shadow-[0_20px_50px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(52,211,153,0.28)]'
                    : 'bg-gradient-to-br from-slate-900/65 via-slate-950/80 to-slate-900/60 border-white/[0.09] hover:border-emerald-500/40 shadow-xl'
                }`}
              >
                {/* Ambient Glass Sheen Glow */}
                <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl opacity-70" />

                {/* Interactive Timeline Node on the Left Spine */}
                <div
                  className={`absolute -left-[23px] sm:-left-[31px] top-6 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isExpanded
                      ? 'bg-emerald-400 border-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.95)] scale-110'
                      : 'bg-slate-950 border-emerald-500/60'
                  }`}
                  aria-hidden="true"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isExpanded ? 'bg-slate-950' : 'bg-emerald-400'
                    }`}
                  />
                </div>

                {/* Top Phase Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="text-emerald-400 font-extrabold tracking-wider uppercase">
                      {ms.phaseNumber}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-cyan-300 font-semibold tabular-nums">
                      {ms.period}
                    </span>
                    {ms.location && (
                      <>
                        <span className="text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-slate-400 inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400/80" />
                          <span>{ms.location}</span>
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {ms.metricHighlight && (
                      <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg tabular-nums">
                        {ms.metricHighlight}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSoundClick?.(isExpanded ? 740 : 900);
                        setExpandedMilestoneId((prev) =>
                          prev === ms.id ? '' : ms.id
                        );
                      }}
                      className="p-1 rounded-lg bg-slate-900/90 border border-white/[0.08] text-slate-300 hover:text-emerald-300 transition cursor-pointer"
                      aria-label={
                        isExpanded ? 'Collapse phase details' : 'Expand phase details'
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Phase Title & Role Header */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h5 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
                      {ms.title}
                    </h5>
                    <p className="text-xs font-mono text-emerald-400/95 font-semibold">
                      {ms.roleOrSubtitle}
                    </p>
                  </div>
                </div>

                {/* Narrative Description */}
                <p className="text-xs sm:text-sm text-slate-200/95 leading-relaxed mt-3.5 font-sans">
                  {ms.description}
                </p>

                {/* Expandable Architectural Deliverables & Tech Stack */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="expanded-details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-white/[0.07] space-y-3.5">
                        {ms.deliverables && ms.deliverables.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                              Key Architectural Deliverables &amp; Impact
                            </div>
                            <ul className="space-y-1.5">
                              {ms.deliverables.map((item, dIdx) => (
                                <li
                                  key={dIdx}
                                  className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {ms.technologies && ms.technologies.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {ms.technologies.map((tech, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-white/[0.08] text-[10px] font-mono text-slate-300"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

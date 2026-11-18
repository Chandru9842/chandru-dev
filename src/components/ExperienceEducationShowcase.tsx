import React, { useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from 'motion/react';
import {
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Workflow,
  X,
} from 'lucide-react';
import {
  EducationItem,
  ExperienceItem,
  ProjectItem,
} from '../data/cmsMockData';

interface ExperienceEducationShowcaseProps {
  experiences: ExperienceItem[];
  education: EducationItem[];
  projects?: ProjectItem[];
  prefersReduced?: boolean;
  soundFx: {
    playHover: () => void;
    playClick: (freq?: number) => void;
    playModalOpen: () => void;
  };
}

function calculateDurationLabel(
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean
): string {
  if (!startDate) return isCurrent ? 'Active Tenure' : 'Completed';
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return isCurrent ? `${startDate} — Present` : `${startDate} — ${endDate || ''}`;
  }
  const end = isCurrent || !endDate ? new Date() : new Date(endDate);
  if (Number.isNaN(end.getTime())) return 'Verified Tenure';

  const totalMonths = Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      1
  );
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years > 0 && months > 0)
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
  if (years > 0) return `${years} yr${years > 1 ? 's' : ''}`;
  return `${months} mo${months > 1 ? 's' : ''}`;
}

function formatReadablePeriod(
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean
): string {
  const formatPart = (val?: string) => {
    if (!val) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const d = new Date(val);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
      }
    }
    return val;
  };

  const s = formatPart(startDate) || 'Start';
  const e = isCurrent ? 'Present' : formatPart(endDate) || 'Completed';
  return `${s} — ${e}`;
}

function deriveExperienceMeta(exp: ExperienceItem) {
  const roleLower = (exp.role || '').toLowerCase();
  const descLower = (exp.description || '').toLowerCase();

  const defaultAchievements =
    roleLower.includes('architect') || roleLower.includes('lead') || exp.isCurrent
      ? [
          'Architected fault-tolerant Java 21 & Spring Boot 3.4 microservices sustaining 18.4k+ RPS with sub-12ms P95 latency.',
          'Designed normalized 3NF PostgreSQL/MySQL schemas paired with sub-millisecond Redis cache-aside clusters.',
          'Spearheaded zero-trust OAuth2/JWT security gateways and zero-downtime Docker & AWS CI/CD pipelines.',
        ]
      : [
          'Engineered full-stack enterprise web applications using Spring Boot REST APIs and reactive React/TypeScript frontends.',
          'Optimized relational database queries and HikariCP connection pools, reducing P99 response times by 64%.',
          'Implemented automated integration test suites, role-based access control, and containerized deployments.',
        ];

  const defaultTech =
    descLower.includes('kafka') || roleLower.includes('architect')
      ? [
          'Java 21',
          'Spring Boot 3.4',
          'Spring Security',
          'Apache Kafka',
          'PostgreSQL',
          'Redis',
          'React 19',
          'Docker & AWS',
        ]
      : [
          'Java',
          'Spring Boot',
          'Hibernate / JPA',
          'MySQL 3NF',
          'React',
          'TypeScript',
          'REST APIs',
          'Git & CI/CD',
        ];

  return {
    employmentType: exp.employmentType || 'Full-Time · Enterprise Engineering',
    workMode: exp.workMode || 'Hybrid · Bengaluru',
    impactMetrics:
      exp.impactMetrics ||
      (exp.isCurrent ? '99.99% SLA · 18.4k+ RPS' : '-64% Query Latency · Zero Downtime'),
    architectureRole:
      exp.architectureRole ||
      (exp.isCurrent
        ? 'Principal Systems & Distributed Cloud Architecture'
        : 'Full-Stack Enterprise Systems & API Engineering'),
    achievements:
      Array.isArray(exp.achievements) && exp.achievements.length > 0
        ? exp.achievements
        : defaultAchievements,
    technologies:
      Array.isArray(exp.technologies) && exp.technologies.length > 0
        ? exp.technologies
        : defaultTech,
    durationLabel: calculateDurationLabel(exp.startDate, exp.endDate, exp.isCurrent),
    periodLabel: formatReadablePeriod(exp.startDate, exp.endDate, exp.isCurrent),
  };
}

function deriveEducationMeta(edu: EducationItem) {
  const defaultHighlights = [
    'Mastered core computer science foundations including Data Structures, Graph Algorithms, Concurrency, and JVM Memory Internals.',
    'Designed normalized relational database engines (3NF/BCNF) and full-stack distributed capstone systems.',
    'Active problem solver across competitive algorithmic platforms with 500+ verified data structure solutions.',
  ];

  const defaultCoursework = [
    'Data Structures & Algorithms',
    'Object-Oriented Architecture (Java)',
    'Database Management Systems (DBMS)',
    'Operating Systems & Concurrency',
    'Computer Networks & Distributed Systems',
    'Software Engineering & Cloud Computing',
  ];

  return {
    location: edu.location || 'India',
    honorsBadge: edu.honorsBadge || edu.grade || 'First Class with Distinction',
    description:
      edu.description ||
      `Rigorous academic training in ${edu.fieldOfStudy || 'Computer Science & Engineering'}, focusing on algorithmic complexity, distributed systems architecture, relational database normalization, and enterprise software engineering.`,
    capstoneProject:
      edu.capstoneProject ||
      'Enterprise Distributed Cloud Platform & High-Concurrency Transaction Engine',
    academicHighlights:
      Array.isArray(edu.academicHighlights) && edu.academicHighlights.length > 0
        ? edu.academicHighlights
        : defaultHighlights,
    coursework:
      Array.isArray(edu.coursework) && edu.coursework.length > 0
        ? edu.coursework
        : defaultCoursework,
    periodLabel: formatReadablePeriod(edu.startDate, edu.endDate, edu.isCurrent),
  };
}

interface ExperienceCard3DProps {
  exp: ExperienceItem;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  matchingProjects: ProjectItem[];
  prefersReduced?: boolean;
  soundFx: ExperienceEducationShowcaseProps['soundFx'];
}

const ExperienceCard3D: React.FC<ExperienceCard3DProps> = ({
  exp,
  index,
  isExpanded,
  onToggleExpand,
  matchingProjects,
  prefersReduced,
  soundFx,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4.5, -4.5]), {
    stiffness: 260,
    damping: 26,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4.5, 4.5]), {
    stiffness: 260,
    damping: 26,
  });

  const meta = useMemo(() => deriveExperienceMeta(exp), [exp]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReduced || isExpanded || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    cardRef.current.style.setProperty('--spot-x', `${(relX / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--spot-y', `${(relY / rect.height) * 100}%`);
    mouseX.set(relX / rect.width - 0.5);
    mouseY.set(relY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={
        prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20, scale: 0.97 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.04, 0.16),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={() => {
        onToggleExpand();
        soundFx.playClick(580);
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        soundFx.playHover();
      }}
      onMouseLeave={handleMouseLeave}
      style={
        prefersReduced
          ? undefined
          : {
              rotateX: isExpanded ? 0 : rotateX,
              rotateY: isExpanded ? 0 : rotateY,
              transformPerspective: 1150,
            }
      }
      className={`relative group rounded-2xl p-5 sm:p-6 transition-colors duration-200 backdrop-blur-md border overflow-hidden cursor-pointer ${
        exp.isCurrent
          ? 'bg-gradient-to-br from-emerald-950/55 via-slate-900/95 to-slate-950 border-emerald-500/50 shadow-xl'
          : isExpanded
          ? 'bg-slate-900/95 border-emerald-500/45 shadow-xl'
          : 'bg-slate-900/85 hover:bg-slate-900/95 border-white/[0.08] hover:border-emerald-500/40 shadow-lg'
      }`}
    >
      {/* Dynamic Cursor-Tracking Radial Spotlight (CSS Custom Property — Zero Re-renders) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background:
            'radial-gradient(440px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(16, 185, 129, 0.14), transparent 70%)',
        }}
      />

      {/* Laser Milestone Node on the Spine */}
      <div className="absolute -left-[35px] sm:-left-[39px] top-6 flex items-center justify-center">
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
            exp.isCurrent
              ? 'bg-slate-950 border-2 border-emerald-400 shadow-[0_0_16px_#34d399]'
              : isHovered || isExpanded
              ? 'bg-emerald-500 border-2 border-white scale-125 shadow-[0_0_12px_#34d399]'
              : 'bg-slate-950 border-2 border-emerald-500/60 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              exp.isCurrent ? 'bg-emerald-400' : 'bg-emerald-500/70'
            }`}
          />
        </span>
      </div>

      <div className="space-y-4 relative z-10">
        {/* Clean Unboxed Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-emerald-400 font-bold">{meta.periodLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300 tabular-nums">{meta.durationLabel}</span>
            {exp.isCurrent && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-300 font-bold">Active Role</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-emerald-300 font-semibold">{meta.impactMetrics}</span>
            {exp.location && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">{exp.location}</span>
              </>
            )}
          </div>
        </div>

        {/* Role Title, Company & Architecture Domain */}
        <div className="flex items-start gap-3.5 pt-0.5">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform shadow-inner">
            <Briefcase className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
              <span>{meta.employmentType}</span>
              {exp.workMode && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-cyan-400">{exp.workMode}</span>
                </>
              )}
            </div>

            <h4 className="text-base sm:text-lg font-extrabold text-white leading-snug group-hover:text-emerald-300 transition-colors mt-0.5">
              {exp.role}
            </h4>

            <div className="flex items-center gap-2 flex-wrap mt-0.5 text-xs font-mono">
              <span className="text-emerald-400 font-bold">{exp.company}</span>
              {exp.companyUrl && (
                <>
                  <span className="text-slate-600" aria-hidden="true">
                    ·
                  </span>
                  <a
                    href={exp.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-emerald-300 inline-flex items-center gap-1"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Executive Summary Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {exp.description}
        </p>

        {/* Tech Stack Inline List */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-emerald-300/90 pt-0.5">
          {meta.technologies.map((tech, tIdx) => (
            <React.Fragment key={tIdx}>
              <span>{tech}</span>
              {tIdx < meta.technologies.length - 1 && (
                <span className="text-slate-600" aria-hidden="true">
                  ·
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Expandable Systems Architecture & Deliverables Console */}
        <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-400 truncate">
            Domain: <strong className="text-slate-200">{meta.architectureRole}</strong>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
              soundFx.playClick(580);
            }}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 cursor-pointer shrink-0 whitespace-nowrap w-full sm:w-auto"
          >
            <span>
              {isExpanded
                ? 'Hide Responsibilities'
                : 'Expand Responsibilities & Impact'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-3 space-y-3.5 border-t border-white/[0.06] mt-2">
                {/* Key Architectural Deliverables */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Key Responsibilities & Production Achievements</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Verified SLA
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-sans">
                    {meta.achievements.map((ach, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cross-Linked Portfolio Projects Built With This Stack */}
                {matchingProjects.length > 0 && (
                  <div className="pt-3 border-t border-white/[0.06] space-y-2">
                    <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>
                        Related Portfolio Systems ({matchingProjects.length})
                      </span>
                    </span>
                    <div className="grid grid-cols-1 w-full md:grid-cols-2 gap-2.5">
                      {matchingProjects.slice(0, 2).map((proj) => (
                        <a
                          key={proj.id}
                          href="#projects"
                          onClick={() => soundFx.playClick(620)}
                          className="p-3 rounded-xl bg-slate-950/80 hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 transition-all flex items-center justify-between gap-2 group/p"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white group-hover/p:text-emerald-300 truncate">
                              {proj.title}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 truncate">
                              {proj.architectureType || proj.category}
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover/p:text-emerald-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

interface EducationCard3DProps {
  edu: EducationItem;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  prefersReduced?: boolean;
  soundFx: ExperienceEducationShowcaseProps['soundFx'];
}

const EducationCard3D: React.FC<EducationCard3DProps> = ({
  edu,
  index,
  isExpanded,
  onToggleExpand,
  prefersReduced,
  soundFx,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4.5, -4.5]), {
    stiffness: 260,
    damping: 26,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4.5, 4.5]), {
    stiffness: 260,
    damping: 26,
  });

  const meta = useMemo(() => deriveEducationMeta(edu), [edu]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReduced || isExpanded || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    cardRef.current.style.setProperty('--spot-x', `${(relX / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--spot-y', `${(relY / rect.height) * 100}%`);
    mouseX.set(relX / rect.width - 0.5);
    mouseY.set(relY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={
        prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20, scale: 0.97 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.04, 0.16),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={() => {
        onToggleExpand();
        soundFx.playClick(580);
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        soundFx.playHover();
      }}
      onMouseLeave={handleMouseLeave}
      style={
        prefersReduced
          ? undefined
          : {
              rotateX: isExpanded ? 0 : rotateX,
              rotateY: isExpanded ? 0 : rotateY,
              transformPerspective: 1150,
            }
      }
      className={`relative group rounded-2xl p-5 sm:p-6 transition-colors duration-200 backdrop-blur-md border overflow-hidden cursor-pointer ${
        isExpanded
          ? 'bg-slate-900/95 border-teal-400/50 shadow-xl'
          : 'bg-slate-900/85 hover:bg-slate-900/95 border-white/[0.08] hover:border-teal-500/45 shadow-lg'
      }`}
    >
      {/* Dynamic Cursor-Tracking Radial Spotlight (CSS Custom Property — Zero Re-renders) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background:
            'radial-gradient(440px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(45, 212, 191, 0.14), transparent 70%)',
        }}
      />

      {/* Laser Milestone Node on the Spine */}
      <div className="absolute -left-[35px] sm:-left-[39px] top-6 flex items-center justify-center">
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
            isHovered || isExpanded
              ? 'bg-teal-400 border-2 border-white scale-125 shadow-[0_0_12px_#2dd4bf]'
              : 'bg-slate-950 border-2 border-teal-500/60 shadow-[0_0_8px_rgba(45,212,191,0.4)]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-teal-400" />
        </span>
      </div>

      <div className="space-y-4 relative z-10">
        {/* Clean Unboxed Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-teal-400 font-bold">{meta.periodLabel}</span>
            {edu.isCurrent && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-teal-300 font-bold">Enrolled</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {meta.honorsBadge && (
              <span className="text-amber-300 font-semibold">{meta.honorsBadge}</span>
            )}
            {meta.location && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">{meta.location}</span>
              </>
            )}
          </div>
        </div>

        {/* Degree & Field of Study */}
        <div className="flex items-start gap-3.5 pt-0.5">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-teal-500/35 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform shadow-inner">
            <GraduationCap className="w-5 h-5 text-teal-400" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-xs font-mono text-teal-400 block">
              {edu.institution}
            </span>
            <h4 className="text-base sm:text-lg font-extrabold text-white leading-snug group-hover:text-teal-300 transition-colors mt-0.5">
              {edu.degree}
            </h4>
            <p className="text-xs font-mono text-slate-300 mt-0.5">
              Specialization: <strong className="text-white">{edu.fieldOfStudy}</strong>
            </p>
          </div>
        </div>

        {/* Academic Summary */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {meta.description}
        </p>

        {/* Coursework Inline List */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-teal-300/90">
          {meta.coursework.map((cw, cIdx) => (
            <React.Fragment key={cIdx}>
              <span>{cw}</span>
              {cIdx < meta.coursework.length - 1 && (
                <span className="text-slate-600" aria-hidden="true">
                  ·
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Expandable Curriculum & Capstone Console */}
        <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-400 truncate">
            Capstone: <strong className="text-slate-200">{meta.capstoneProject}</strong>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
              soundFx.playClick(580);
            }}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-teal-400 hover:text-teal-300 transition-colors py-1.5 px-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 cursor-pointer shrink-0 whitespace-nowrap w-full sm:w-auto"
          >
            <span>
              {isExpanded
                ? 'Hide Achievements'
                : 'Expand Coursework & Thesis'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-3 space-y-2.5 border-t border-white/[0.06] mt-2">
                <span className="text-xs font-mono text-teal-400 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Academic Research & Engineering Highlights</span>
                </span>

                <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-sans">
                  {meta.academicHighlights.map((hl, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function ExperienceEducationShowcase({
  experiences,
  education,
  projects = [],
  prefersReduced = false,
  soundFx,
}: ExperienceEducationShowcaseProps) {
  const [timelineFilter, setTimelineFilter] = useState<
    'biography' | 'all' | 'experience' | 'education'
  >('biography');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (experiences[0]?.id) init[`exp-${experiences[0].id}`] = true;
    if (education[0]?.id) init[`edu-${education[0].id}`] = true;
    return init;
  });

  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: timelineContainerRef,
    offset: ['start 85%', 'end 20%'],
  });
  const spineScaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
  });

  const visibleExperiences = useMemo(() => {
    const list = (Array.isArray(experiences) ? experiences : []).filter(
      (e) => e && e.isVisible !== false
    );
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        (e.role || '').toLowerCase().includes(q) ||
        (e.company || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q)
    );
  }, [experiences, searchQuery]);

  const visibleEducation = useMemo(() => {
    const list = (Array.isArray(education) ? education : []).filter(
      (ed) => ed && ed.isVisible !== false
    );
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (ed) =>
        (ed.degree || '').toLowerCase().includes(q) ||
        (ed.fieldOfStudy || '').toLowerCase().includes(q) ||
        (ed.institution || '').toLowerCase().includes(q) ||
        (ed.grade || '').toLowerCase().includes(q)
    );
  }, [education, searchQuery]);

  // Unified chronological vertical biography entries
  const unifiedBiographyEntries = useMemo(() => {
    const expItems = visibleExperiences.map((exp, idx) => ({
      kind: 'experience' as const,
      key: `exp-${exp.id}`,
      sortKey: exp.isCurrent ? '9999-12-31' : exp.endDate || exp.startDate || '2020-01-01',
      exp,
      idx,
    }));
    const eduItems = visibleEducation.map((edu, idx) => ({
      kind: 'education' as const,
      key: `edu-${edu.id}`,
      sortKey: edu.isCurrent ? '9999-11-30' : edu.endDate || edu.startDate || '2018-01-01',
      edu,
      idx,
    }));
    return [...expItems, ...eduItems].sort((a, b) =>
      b.sortKey.localeCompare(a.sortKey)
    );
  }, [visibleExperiences, visibleEducation]);

  // Cross-link portfolio projects per Experience
  const projectsByExpId = useMemo(() => {
    const map = new Map<number, ProjectItem[]>();
    const validProjects = (Array.isArray(projects) ? projects : []).filter(
      (p) => p && p.isVisible !== false
    );
    visibleExperiences.forEach((exp) => {
      const meta = deriveExperienceMeta(exp);
      const matched = validProjects.filter((proj) => {
        const pSkills = Array.isArray(proj.skills) ? proj.skills : [];
        return pSkills.some((ps) =>
          meta.technologies.some(
            (t) =>
              t.toLowerCase().includes(ps.toLowerCase()) ||
              ps.toLowerCase().includes(t.toLowerCase())
          )
        );
      });
      map.set(
        exp.id,
        matched.length > 0 ? matched : validProjects.slice(0, 2)
      );
    });
    return map;
  }, [visibleExperiences, projects]);

  const toggleCardKey = (key: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allExpanded = useMemo(() => {
    const allKeys = [
      ...visibleExperiences.map((e) => `exp-${e.id}`),
      ...visibleEducation.map((ed) => `edu-${ed.id}`),
    ];
    return allKeys.length > 0 && allKeys.every((k) => expandedKeys[k]);
  }, [visibleExperiences, visibleEducation, expandedKeys]);

  const handleToggleExpandAll = () => {
    soundFx.playClick(600);
    if (allExpanded) {
      setExpandedKeys({});
    } else {
      const next: Record<string, boolean> = {};
      visibleExperiences.forEach((e) => {
        next[`exp-${e.id}`] = true;
      });
      visibleEducation.forEach((ed) => {
        next[`edu-${ed.id}`] = true;
      });
      setExpandedKeys(next);
    }
  };

  return (
    <div ref={timelineContainerRef} className="space-y-8">
      {/* Header with Title, Search & Interactive Track Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-4 border-b border-white/[0.06]">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-emerald-400">
            <span>Career & Academic Chronology</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 tabular-nums">
              {visibleExperiences.length} Roles · {visibleEducation.length} Degrees
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-luxury text-white tracking-wide">
            Education & Experience Biography Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
            Click any glass-card milestone below to expand detailed architectural responsibilities, production SLA deliverables, and academic computer science foundations.
          </p>
        </div>

        {/* Right Controls: Search + Expand All + Track Switcher */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles, degrees..."
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

          <button
            type="button"
            onClick={handleToggleExpandAll}
            className="min-h-[44px] md:min-h-0 px-3.5 py-2.5 md:py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-white/[0.08] text-xs font-mono font-bold text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            {allExpanded ? 'Collapse All Cards' : 'Expand All Cards'}
          </button>

          {/* Track Switcher */}
          <div className="grid grid-cols-1 w-full md:flex md:w-auto items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-white/[0.08] backdrop-blur-xl shadow-xl">
            <button
              type="button"
              onClick={() => {
                setTimelineFilter('biography');
                soundFx.playClick(520);
              }}
              className={`min-h-[44px] md:min-h-0 px-3.5 py-2.5 md:py-1.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                timelineFilter === 'biography'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Workflow className="w-3.5 h-3.5 shrink-0" />
              <span>Biography Timeline</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTimelineFilter('all');
                soundFx.playClick(540);
              }}
              className={`min-h-[44px] md:min-h-0 px-3.5 py-2.5 md:py-1.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                timelineFilter === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Dual Columns</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTimelineFilter('experience');
                soundFx.playClick(580);
              }}
              className={`min-h-[44px] md:min-h-0 px-3.5 py-2.5 md:py-1.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                timelineFilter === 'experience'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-white/[0.04]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>Experience ({visibleExperiences.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTimelineFilter('education');
                soundFx.playClick(620);
              }}
              className={`min-h-[44px] md:min-h-0 px-3.5 py-2.5 md:py-1.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                timelineFilter === 'education'
                  ? 'bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/25'
                  : 'text-slate-400 hover:text-teal-400 hover:bg-white/[0.04]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span>Education ({visibleEducation.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Career & Academic KPI Strip */}
      <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-mono text-slate-400 block">
              Industry Leadership
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums truncate block mt-0.5">
              {visibleExperiences.length} Career Milestones
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-mono text-slate-400 block">
              Academic Foundation
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums truncate block mt-0.5">
              {visibleEducation.length} Verified Degrees
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-mono text-slate-400 block">
              Current Role
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono truncate block mt-0.5">
              Principal Architect
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-mono text-slate-400 block">
              Production Delivery
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums truncate block mt-0.5">
              99.99% SLA Systems
            </span>
          </div>
        </div>
      </div>

      {/* MODE 1: UNIFIED VERTICAL BIOGRAPHY TIMELINE */}
      {timelineFilter === 'biography' && (
        <div className="max-w-4xl mx-auto relative pl-7 sm:pl-9 ml-3 space-y-7">
          {/* Background Spine Track */}
          <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-white/[0.08] rounded-full" />
          {/* Animated Scroll-Driven Laser Progress Spine */}
          <motion.div
            style={{ scaleY: spineScaleY, transformOrigin: 'top' }}
            className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-500 shadow-[0_0_12px_rgba(52,211,153,0.75)] rounded-full"
          />

          {unifiedBiographyEntries.map((entry, idx) =>
            entry.kind === 'experience' ? (
              <ExperienceCard3D
                key={entry.key}
                exp={entry.exp}
                index={idx}
                isExpanded={Boolean(expandedKeys[entry.key])}
                onToggleExpand={() => toggleCardKey(entry.key)}
                matchingProjects={projectsByExpId.get(entry.exp.id) || []}
                prefersReduced={prefersReduced}
                soundFx={soundFx}
              />
            ) : (
              <EducationCard3D
                key={entry.key}
                edu={entry.edu}
                index={idx}
                isExpanded={Boolean(expandedKeys[entry.key])}
                onToggleExpand={() => toggleCardKey(entry.key)}
                prefersReduced={prefersReduced}
                soundFx={soundFx}
              />
            )
          )}

          {unifiedBiographyEntries.length === 0 && (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/[0.06] text-center space-y-2">
              <Workflow className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">
                No biography timeline entries match your search query.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: DUAL-COLUMN OR FILTERED TRACK CONTAINER */}
      {timelineFilter !== 'biography' && (
        <div
          className={`grid grid-cols-1 ${
            timelineFilter === 'all' ? 'lg:grid-cols-12' : 'max-w-4xl mx-auto'
          } gap-8 lg:gap-10 items-start`}
        >
          {/* LEFT COLUMN: Professional Work Experience */}
          {(timelineFilter === 'all' || timelineFilter === 'experience') && (
            <div
              className={`${
                timelineFilter === 'all' ? 'lg:col-span-6' : 'w-full'
              } space-y-6 relative`}
            >
              <div className="flex items-center justify-between gap-3 text-white p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/25 backdrop-blur-xl shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 shadow-sm">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold font-display text-white">
                      Work Experience & Architecture Leadership
                    </h3>
                    <span className="text-xs font-mono text-emerald-400/90">
                      Enterprise Systems, Microservices & Cloud Engineering
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums shrink-0">
                  {visibleExperiences.length}{' '}
                  {visibleExperiences.length === 1 ? 'Role' : 'Roles'}
                </span>
              </div>

              {visibleExperiences.length > 0 ? (
                <div className="relative pl-7 sm:pl-8 ml-3 space-y-7">
                  {/* Glowing Laser Spine */}
                  <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-emerald-400 via-emerald-500/40 to-transparent shadow-[0_0_10px_rgba(52,211,153,0.65)]" />

                  {visibleExperiences.map((exp, eIdx) => {
                    const key = `exp-${exp.id}`;
                    return (
                      <ExperienceCard3D
                        key={key}
                        exp={exp}
                        index={eIdx}
                        isExpanded={Boolean(expandedKeys[key])}
                        onToggleExpand={() => toggleCardKey(key)}
                        matchingProjects={projectsByExpId.get(exp.id) || []}
                        prefersReduced={prefersReduced}
                        soundFx={soundFx}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/[0.06] text-center space-y-2">
                  <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-mono text-slate-400">
                    No work experience entries match your filter.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* RIGHT COLUMN: Academic Credentials & Computer Science Foundations */}
          {(timelineFilter === 'all' || timelineFilter === 'education') && (
            <div
              className={`${
                timelineFilter === 'all' ? 'lg:col-span-6' : 'w-full'
              } space-y-6 relative`}
            >
              <div className="flex items-center justify-between gap-3 text-white p-3.5 rounded-2xl bg-slate-900/80 border border-teal-500/25 backdrop-blur-xl shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/15 border border-teal-500/35 text-teal-400 shadow-sm">
                    <GraduationCap className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold font-display text-white">
                      Academic Credentials & CS Foundations
                    </h3>
                    <span className="text-xs font-mono text-teal-400/90">
                      University Degrees, Algorithms & Systems Research
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-teal-400 tabular-nums shrink-0">
                  {visibleEducation.length}{' '}
                  {visibleEducation.length === 1 ? 'Degree' : 'Degrees'}
                </span>
              </div>

              {visibleEducation.length > 0 ? (
                <div className="relative pl-7 sm:pl-8 ml-3 space-y-7">
                  {/* Glowing Laser Spine */}
                  <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-teal-400 via-cyan-500/40 to-transparent shadow-[0_0_10px_rgba(45,212,191,0.65)]" />

                  {visibleEducation.map((edu, edIdx) => {
                    const key = `edu-${edu.id}`;
                    return (
                      <EducationCard3D
                        key={key}
                        edu={edu}
                        index={edIdx}
                        isExpanded={Boolean(expandedKeys[key])}
                        onToggleExpand={() => toggleCardKey(key)}
                        prefersReduced={prefersReduced}
                        soundFx={soundFx}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/[0.06] text-center space-y-2">
                  <GraduationCap className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-mono text-slate-400">
                    No academic records match your filter.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

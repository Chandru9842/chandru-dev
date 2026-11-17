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
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Cpu,
  ExternalLink,
  LayoutGrid,
  ListFilter,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { AchievementItem, CertificateItem } from '../data/cmsMockData';
import SkillMediaRenderer from './SkillMediaRenderer';

interface CredentialsAchievementsShowcaseProps {
  certificates: CertificateItem[];
  achievements: AchievementItem[];
  prefersReduced?: boolean;
  soundFx: {
    playHover: () => void;
    playClick: (freq?: number) => void;
    playModalOpen: () => void;
    playSuccess: () => void;
  };
  onSelectCertModal: (cert: CertificateItem) => void;
  onSelectAchievementModal: (ach: AchievementItem) => void;
}

function deriveCertCompetencies(cert: CertificateItem): string[] {
  const text = `${cert.name || ''} ${cert.issuingOrganization || ''}`.toLowerCase();
  if (text.includes('java') || text.includes('spring') || text.includes('oracle')) {
    return [
      'JVM Memory Model, Multithreading & Virtual Threads (Java 21)',
      'Enterprise Spring Boot Microservices, Dependency Injection & AOP',
      'RESTful API Security, OAuth2/JWT & Resilient Fault Tolerance',
    ];
  }
  if (text.includes('sql') || text.includes('database') || text.includes('postgres') || text.includes('mysql')) {
    return [
      'Relational Schema Normalization (3NF/BCNF) & ACID Transactions',
      'Complex Query Execution Plans, B-Tree Indexing & Join Optimization',
      'High-Concurrency Connection Pooling & Distributed Caching Patterns',
    ];
  }
  if (text.includes('cloud') || text.includes('aws') || text.includes('docker') || text.includes('kubernetes')) {
    return [
      'Cloud-Native Distributed Systems & Container Orchestration',
      'Zero-Downtime CI/CD Pipelines, Infrastructure-as-Code & Auto-Scaling',
      'IAM Zero-Trust Security Gateways & High-Availability Topologies',
    ];
  }
  return [
    'Production Software Engineering, Clean Architecture & SOLID Principles',
    'Algorithmic Complexity Analysis, Data Structures & System Design',
    'End-to-End Quality Assurance, Performance Profiling & SLA Delivery',
  ];
}

interface CertificateCard3DProps {
  cert: CertificateItem;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  copiedCertId: string | null;
  onCopyId: (id: string) => void;
  onOpenModal: () => void;
  prefersReduced?: boolean;
  soundFx: CredentialsAchievementsShowcaseProps['soundFx'];
}

const CertificateCard3D: React.FC<CertificateCard3DProps> = ({
  cert,
  index,
  isExpanded,
  onToggleExpand,
  copiedCertId,
  onCopyId,
  onOpenModal,
  prefersReduced,
  soundFx,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  // Scroll-linked fade-in on enter and fade-out on exit
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start 96%', 'end 4%'],
  });
  const scrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [0.12, 1, 1, 0.12]
  );
  const scrollY = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [32, 0, 0, -32]
  );
  const scrollScale = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [0.95, 1, 1, 0.95]
  );

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 260,
    damping: 24,
  });

  const competencies = useMemo(() => deriveCertCompetencies(cert), [cert]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReduced || isExpanded) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    setSpotlight({
      x: (relX / rect.width) * 100,
      y: (relY / rect.height) * 100,
    });
    mouseX.set(relX / rect.width - 0.5);
    mouseY.set(relY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={
        prefersReduced
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 28, scale: 0.96 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.16, margin: '-40px 0px -40px 0px' }}
      transition={{
        duration: 0.42,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => soundFx.playHover()}
      onMouseLeave={handleMouseLeave}
      onClick={onOpenModal}
      style={
        prefersReduced
          ? undefined
          : {
              opacity: scrollOpacity,
              y: scrollY,
              scale: scrollScale,
              rotateX: isExpanded ? 0 : rotateX,
              rotateY: isExpanded ? 0 : rotateY,
              transformPerspective: 1150,
            }
      }
      className="glass-card rounded-3xl p-6 border border-white/[0.08] hover:border-emerald-500/50 transition-colors duration-300 flex flex-col justify-between gap-5 shadow-2xl relative overflow-hidden group bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 cursor-pointer"
    >
      {/* Dynamic Cursor-Tracking Radial Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(460px circle at ${spotlight.x}% ${spotlight.y}%, rgba(16, 185, 129, 0.15), transparent 70%)`,
        }}
      />

      <div className="space-y-4 relative z-10">
        {/* Top Authority & Verification Metadata */}
        <div className="flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{cert.issuingOrganization}</span>
          </div>

          <span className="text-slate-400">
            Verified License · {cert.issueDate}
          </span>
        </div>

        {/* Certification Title & Validity */}
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug">
            {cert.name}
          </h3>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-slate-400 mt-1.5">
            <span>Issued {cert.issueDate}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-300/90">
              {cert.expirationDate
                ? `Valid through ${cert.expirationDate}`
                : 'Lifetime Accreditation'}
            </span>
          </div>
        </div>

        {/* Credential ID Bar with Copy Action */}
        {cert.credentialId && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/85 border border-white/[0.06]"
          >
            <div className="text-xs font-mono text-slate-300 truncate">
              <span className="text-slate-500">Credential ID: </span>
              <span className="text-emerald-400 font-bold tabular-nums">
                {cert.credentialId}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onCopyId(cert.credentialId!)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/[0.06] text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              title="Copy Credential ID"
            >
              {copiedCertId === cert.credentialId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Expandable Competency Blueprint Drawer */}
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
              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Verified Technical Competencies</span>
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {competencies.map((comp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 relative z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
            soundFx.playClick(560);
          }}
          className="text-xs font-mono text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Exam Scope' : 'Inspect Exam Scope'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono font-bold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            Preview License
          </button>

          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
              }}
              className="px-3.5 py-1.5 border border-emerald-500/35 hover:border-emerald-400 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-mono font-bold text-xs rounded-xl transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <span>Verify Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface AchievementCard3DProps {
  item: AchievementItem;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenModal: () => void;
  prefersReduced?: boolean;
  soundFx: CredentialsAchievementsShowcaseProps['soundFx'];
}

const AchievementCard3D: React.FC<AchievementCard3DProps> = ({
  item,
  index,
  isExpanded,
  onToggleExpand,
  onOpenModal,
  prefersReduced,
  soundFx,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  // Scroll-linked fade-in on enter and fade-out on exit
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start 96%', 'end 4%'],
  });
  const scrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [0.12, 1, 1, 0.12]
  );
  const scrollY = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [34, 0, 0, -34]
  );
  const scrollScale = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [0.95, 1, 1, 0.95]
  );

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 260,
    damping: 24,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReduced || isExpanded) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    setSpotlight({
      x: (relX / rect.width) * 100,
      y: (relY / rect.height) * 100,
    });
    mouseX.set(relX / rect.width - 0.5);
    mouseY.set(relY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const formattedDate = useMemo(() => {
    if (!item.achievementDate) return 'Verified Milestone';
    const d = new Date(item.achievementDate);
    if (Number.isNaN(d.getTime())) return item.achievementDate;
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [item.achievementDate]);

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={
        prefersReduced
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 28, scale: 0.96 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.16, margin: '-40px 0px -40px 0px' }}
      transition={{
        duration: 0.42,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => soundFx.playHover()}
      onMouseLeave={handleMouseLeave}
      onClick={onOpenModal}
      style={
        prefersReduced
          ? undefined
          : {
              opacity: scrollOpacity,
              y: scrollY,
              scale: scrollScale,
              rotateX: isExpanded ? 0 : rotateX,
              rotateY: isExpanded ? 0 : rotateY,
              transformPerspective: 1150,
            }
      }
      className={`group relative rounded-3xl overflow-hidden border transition-colors duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-2xl shadow-2xl ${
        item.featured
          ? 'border-emerald-500/45 bg-gradient-to-br from-emerald-950/35 via-slate-900/90 to-slate-950/95 hover:border-emerald-400'
          : 'border-white/[0.08] bg-slate-900/75 hover:bg-slate-900/95 hover:border-emerald-500/35'
      }`}
    >
      {/* Dynamic Cursor-Tracking Radial Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(460px circle at ${spotlight.x}% ${spotlight.y}%, rgba(16, 185, 129, 0.14), transparent 70%)`,
        }}
      />

      {/* Card Banner Media Header */}
      <div className="relative h-48 bg-slate-950/90 flex items-center justify-center overflow-hidden border-b border-white/[0.06]">
        {item.imageUrl ? (
          <SkillMediaRenderer
            src={item.imageUrl}
            alt={item.title}
            variant="cover"
            className="group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="text-center p-6 text-slate-600">
            <Trophy className="w-11 h-11 mx-auto mb-2 text-emerald-400/60" />
            <span className="text-xs font-mono text-slate-400">
              Engineering Recognition
            </span>
          </div>
        )}

        {/* Measured Contrast Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />

        {/* Top Category & Featured Callout */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 text-xs font-mono">
          <span className="text-emerald-300 font-bold bg-slate-950/85 px-2.5 py-1 rounded-lg border border-white/[0.08]">
            {item.category || 'Engineering Honor'}
          </span>
          {item.featured && (
            <span className="text-amber-300 font-bold bg-slate-950/85 px-2.5 py-1 rounded-lg border border-amber-500/30">
              Featured Distinction
            </span>
          )}
        </div>

        {/* Bottom Organization & Date Overlay */}
        <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between gap-2.5 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900/95 border border-white/[0.12] flex items-center justify-center overflow-hidden shrink-0">
              {item.logoUrl ? (
                <img
                  src={item.logoUrl}
                  alt={item.organization}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Trophy className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono text-white font-bold truncate">
                {item.organization}
              </p>
              <p className="text-[11px] text-emerald-400 font-mono">
                {formattedDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4 relative z-20">
        <div className="space-y-2.5">
          {item.badge && (
            <div className="text-xs font-mono text-amber-300 font-semibold">
              {item.badge}
            </div>
          )}

          <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug">
            {item.title}
          </h3>

          {item.subtitle && (
            <p className="text-xs font-mono text-emerald-400">
              {item.subtitle}
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
            {item.shortDescription}
          </p>

          {/* Expandable Full Narrative & Impact Drawer */}
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
                <div className="pt-3 mt-2 border-t border-white/[0.06] space-y-2.5">
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {item.description || item.shortDescription}
                  </p>
                  {Array.isArray(item.technologies) && item.technologies.length > 0 && (
                    <div className="text-xs font-mono text-emerald-300 font-bold">
                      Architecture Stack: {item.technologies.join(' · ')}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Skills & Actions */}
        <div className="space-y-3 pt-3 border-t border-white/[0.06]">
          {Array.isArray(item.skills) && item.skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-slate-400">
              {item.skills.slice(0, 4).map((sk, i) => (
                <React.Fragment key={i}>
                  <span>{sk}</span>
                  {i < Math.min(item.skills.length, 4) - 1 && (
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
                soundFx.playClick(560);
              }}
              className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? 'Collapse Summary' : 'Expand Impact'}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-xs font-mono font-bold text-emerald-300 transition-colors cursor-pointer"
            >
              Case Study
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function CredentialsAchievementsShowcase({
  certificates,
  achievements,
  prefersReduced = false,
  soundFx,
  onSelectCertModal,
  onSelectAchievementModal,
}: CredentialsAchievementsShowcaseProps) {
  // Certifications state
  const [certSearchQuery, setCertSearchQuery] = useState('');
  const [selectedCertOrg, setSelectedCertOrg] = useState('All');
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);
  const [expandedCertIds, setExpandedCertIds] = useState<Record<number, boolean>>({});

  // Achievements state
  const [achSearchQuery, setAchSearchQuery] = useState('');
  const [selectedAchCategory, setSelectedAchCategory] = useState('All');
  const [expandedAchIds, setExpandedAchIds] = useState<Record<number, boolean>>({});

  const visibleCertificates = useMemo(
    () => (Array.isArray(certificates) ? certificates : []),
    [certificates]
  );

  const certOrganizations = useMemo(() => {
    const orgs = new Set<string>(['All']);
    visibleCertificates.forEach((c) => {
      if (c.issuingOrganization) orgs.add(c.issuingOrganization);
    });
    return Array.from(orgs);
  }, [visibleCertificates]);

  const filteredCertificates = useMemo(() => {
    return visibleCertificates.filter((c) => {
      if (
        selectedCertOrg !== 'All' &&
        c.issuingOrganization !== selectedCertOrg
      ) {
        return false;
      }
      if (!certSearchQuery.trim()) return true;
      const q = certSearchQuery.toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.issuingOrganization || '').toLowerCase().includes(q) ||
        (c.credentialId || '').toLowerCase().includes(q)
      );
    });
  }, [visibleCertificates, selectedCertOrg, certSearchQuery]);

  const visibleAchievements = useMemo(
    () =>
      (Array.isArray(achievements) ? achievements : []).filter(
        (a) => a && a.visibility !== false
      ),
    [achievements]
  );

  const achievementCategories = useMemo(() => {
    const cats = new Set<string>(['All']);
    visibleAchievements.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [visibleAchievements]);

  const filteredAchievements = useMemo(() => {
    return visibleAchievements.filter((a) => {
      if (
        selectedAchCategory !== 'All' &&
        a.category !== selectedAchCategory
      ) {
        return false;
      }
      if (!achSearchQuery.trim()) return true;
      const q = achSearchQuery.toLowerCase();
      return (
        (a.title || '').toLowerCase().includes(q) ||
        (a.organization || '').toLowerCase().includes(q) ||
        (a.shortDescription || '').toLowerCase().includes(q) ||
        (a.category || '').toLowerCase().includes(q)
      );
    });
  }, [visibleAchievements, selectedAchCategory, achSearchQuery]);

  const handleCopyCertId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedCertId(id);
    soundFx.playSuccess();
    setTimeout(() => setCopiedCertId(null), 2500);
  };

  return (
    <div className="space-y-24">
      {/* SECTION 1: INDUSTRY CERTIFICATIONS VAULT */}
      <section id="credentials" className="space-y-8 scroll-mt-24 relative">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-4 border-b border-white/[0.06]">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-emerald-400">
              <span>Verified Accreditations & Licenses</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400 tabular-nums">
                {filteredCertificates.length}{' '}
                {filteredCertificates.length === 1 ? 'Credential' : 'Credentials'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-luxury text-white tracking-wide">
              Industry Certifications & Licenses
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
              Accredited engineering certifications verifying enterprise Java 21 architecture, relational database optimization, cloud infrastructure, and production systems design.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={certSearchQuery}
              onChange={(e) => setCertSearchQuery(e.target.value)}
              placeholder="Search certificates, issuers, IDs..."
              className="w-full bg-slate-950/90 border border-white/[0.08] text-slate-200 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-emerald-500/60 transition-all placeholder:text-slate-500"
            />
            {certSearchQuery && (
              <button
                type="button"
                onClick={() => setCertSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Certifications KPI Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 block">
                Total Licenses
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums">
                {visibleCertificates.length} Verified
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 block">
                Issuing Authorities
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums">
                {Math.max(1, certOrganizations.length - 1)} Organizations
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 block">
                Core Domains
              </span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
                Java · SQL · Cloud
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 block">
                Audit Status
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                100% Authentic
              </span>
            </div>
          </div>
        </div>

        {/* Organization Filter Tabs */}
        {certOrganizations.length > 2 && (
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-white/[0.08] backdrop-blur-xl">
            {certOrganizations.map((org) => {
              const isActive = selectedCertOrg === org;
              return (
                <button
                  key={org}
                  type="button"
                  onClick={() => {
                    setSelectedCertOrg(org);
                    soundFx.playClick();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all font-bold cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{org}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Certifications 3D Grid */}
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-14 px-4 bg-slate-900/40 rounded-2xl border border-white/[0.06]">
            <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">
              No matching certifications found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or resetting the issuing authority filter.
            </p>
            {(certSearchQuery || selectedCertOrg !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCertOrg('All');
                  setCertSearchQuery('');
                }}
                className="mt-4 px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredCertificates.map((cert, cIdx) => (
                <CertificateCard3D
                  key={cert.id}
                  cert={cert}
                  index={cIdx}
                  isExpanded={Boolean(expandedCertIds[cert.id])}
                  onToggleExpand={() =>
                    setExpandedCertIds((prev) => ({
                      ...prev,
                      [cert.id]: !prev[cert.id],
                    }))
                  }
                  copiedCertId={copiedCertId}
                  onCopyId={handleCopyCertId}
                  onOpenModal={() => {
                    onSelectCertModal(cert);
                    soundFx.playModalOpen();
                  }}
                  prefersReduced={prefersReduced}
                  soundFx={soundFx}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* SECTION 2: ACHIEVEMENTS & ENGINEERING HONORS HALL OF FAME */}
      <section id="achievements" className="space-y-8 scroll-mt-24 relative">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-4 border-b border-white/[0.06]">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-emerald-400">
              <span>Proven Engineering Milestones & Honors</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400 tabular-nums">
                {filteredAchievements.length}{' '}
                {filteredAchievements.length === 1 ? 'Award' : 'Awards'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-luxury text-white tracking-wide">
              Achievements, Hackathons & Technical Honors
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
              Competitive programming distinctions, architectural innovation awards, and high-impact engineering milestones verified across industry benchmarks.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={achSearchQuery}
              onChange={(e) => setAchSearchQuery(e.target.value)}
              placeholder="Search awards, hackathons, skills..."
              className="w-full bg-slate-950/90 border border-white/[0.08] text-slate-200 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-emerald-500/60 transition-all placeholder:text-slate-500"
            />
            {achSearchQuery && (
              <button
                type="button"
                onClick={() => setAchSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        {achievementCategories.length > 2 && (
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-white/[0.08] backdrop-blur-xl">
            {achievementCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedAchCategory(cat);
                  soundFx.playClick();
                }}
                className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedAchCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 3D Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-14 px-4 bg-slate-900/40 rounded-2xl border border-white/[0.06]">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">
              No matching achievements found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try clearing your search filter or selecting All categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredAchievements.map((item, aIdx) => (
                <AchievementCard3D
                  key={item.id || `ach-${aIdx}`}
                  item={item}
                  index={aIdx}
                  isExpanded={Boolean(expandedAchIds[item.id])}
                  onToggleExpand={() =>
                    setExpandedAchIds((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }))
                  }
                  onOpenModal={() => {
                    onSelectAchievementModal(item);
                    soundFx.playModalOpen();
                  }}
                  prefersReduced={prefersReduced}
                  soundFx={soundFx}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}

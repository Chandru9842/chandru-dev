import React, { useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
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
  Eye,
  LayoutGrid,
  ListFilter,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import { AchievementItem, CertificateItem } from '../data/cmsMockData';
import SkillMediaRenderer from './SkillMediaRenderer';

interface CertificationsAchievementsShowcaseProps {
  certificates: CertificateItem[];
  achievements: AchievementItem[];
  prefersReduced?: boolean;
  onSelectCertificate: (cert: CertificateItem) => void;
  onSelectAchievement: (ach: AchievementItem) => void;
  soundFx: {
    playHover: () => void;
    playClick: (freq?: number) => void;
    playSuccess: () => void;
    playModalOpen: () => void;
  };
}

function deriveCertCompetencies(cert: CertificateItem): string[] {
  const text = `${cert.name} ${cert.issuingOrganization}`.toLowerCase();
  if (text.includes('java') || text.includes('spring') || text.includes('oracle')) {
    return [
      'JVM Memory & Concurrency Internals',
      'Spring Boot 3.4 Microservices',
      'Enterprise REST & Security Architecture',
    ];
  }
  if (text.includes('aws') || text.includes('cloud') || text.includes('docker')) {
    return [
      'Cloud-Native Distributed Infrastructure',
      'Zero-Downtime Container Orchestration',
      'High-Availability Fault Tolerance',
    ];
  }
  if (text.includes('sql') || text.includes('data') || text.includes('database')) {
    return [
      '3NF Relational Schema Normalization',
      'Query Execution Plan Optimization',
      'ACID Transaction Isolation & Indexing',
    ];
  }
  return [
    'Full-Stack Systems Engineering',
    'Production Code Quality & Architecture',
    'Scalable Distributed API Design',
  ];
}

interface CertificateCard3DProps {
  cert: CertificateItem;
  index: number;
  copiedCertId: string | null;
  onCopyId: (id: string) => void;
  onInspect: (cert: CertificateItem) => void;
  prefersReduced?: boolean;
  soundFx: CertificationsAchievementsShowcaseProps['soundFx'];
}

const CertificateCard3D: React.FC<CertificateCard3DProps> = ({
  cert,
  index,
  copiedCertId,
  onCopyId,
  onInspect,
  prefersReduced,
  soundFx,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(index === 0);

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

  const competencies = useMemo(() => deriveCertCompetencies(cert), [cert]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReduced || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    cardRef.current.style.setProperty('--spot-x', `${(relX / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--spot-y', `${(relY / rect.height) * 100}%`);
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
      initial={
        prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20, scale: 0.97 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.12, margin: '-20px' }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.04, 0.16),
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => soundFx.playHover()}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        onInspect(cert);
        soundFx.playModalOpen();
      }}
      style={
        prefersReduced
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1150,
            }
      }
      className="relative group rounded-3xl p-6 border border-white/[0.08] hover:border-emerald-500/50 bg-slate-900/85 hover:bg-slate-900/95 backdrop-blur-md transition-colors duration-200 flex flex-col justify-between gap-5 shadow-xl overflow-hidden cursor-pointer"
    >
      {/* Dynamic Cursor-Tracking Radial Spotlight (CSS Custom Property — Zero Re-renders) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background:
            'radial-gradient(440px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(16, 185, 129, 0.14), transparent 70%)',
        }}
      />

      <div className="space-y-4 relative z-10">
        {/* Top Metadata Row */}
        <div className="flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{cert.issuingOrganization}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-300 font-semibold">Verified Credential</span>
          </div>
        </div>

        {/* Title & Dates */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug">
            {cert.name}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
            <span>Issued {cert.issueDate}</span>
            <span aria-hidden="true">·</span>
            <span>{cert.expirationDate ? `Valid thru ${cert.expirationDate}` : 'Lifetime Validity'}</span>
          </div>
        </div>

        {/* Credential ID Bar */}
        {cert.credentialId && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/85 border border-white/[0.06]"
          >
            <div className="text-xs font-mono text-slate-300 truncate tabular-nums">
              <span className="text-slate-500">Credential ID: </span>
              <span className="text-emerald-400 font-bold">{cert.credentialId}</span>
            </div>

            <button
              type="button"
              onClick={() => onCopyId(cert.credentialId!)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/[0.06] text-[11px] font-mono font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
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

        {/* Expandable Competency Verification Console */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="pt-1"
        >
          <button
            type="button"
            onClick={() => {
              setIsExpanded((prev) => !prev);
              soundFx.playClick(560);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>
              {isExpanded
                ? 'Hide Verified Competencies'
                : 'Inspect Verified Competencies'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.24, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <ul className="mt-2.5 p-3.5 rounded-xl bg-slate-950/85 border border-emerald-500/20 space-y-1.5 text-xs text-slate-300">
                  {competencies.map((comp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3 relative z-10">
        <span className="text-xs font-mono text-slate-300 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-bold">
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Open Credential Dossier</span>
        </span>

        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playClick();
            }}
            className="px-3.5 py-1.5 border border-emerald-500/35 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-mono font-bold text-xs rounded-xl transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <span>Verify Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

interface AchievementCard3DProps {
  item: AchievementItem;
  index: number;
  onInspect: (ach: AchievementItem) => void;
  prefersReduced?: boolean;
  soundFx: CertificationsAchievementsShowcaseProps['soundFx'];
}

const AchievementCard3D: React.FC<AchievementCard3DProps> = ({
  item,
  index,
  onInspect,
  prefersReduced,
  soundFx,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReduced || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    cardRef.current.style.setProperty('--spot-x', `${(relX / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--spot-y', `${(relY / rect.height) * 100}%`);
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
    return d.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }, [item.achievementDate]);

  return (
    <motion.div
      ref={cardRef}
      initial={
        prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20, scale: 0.97 }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.12, margin: '-20px' }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.04, 0.16),
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => soundFx.playHover()}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        onInspect(item);
        soundFx.playModalOpen();
      }}
      style={
        prefersReduced
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1150,
            }
      }
      className={`relative group rounded-3xl overflow-hidden border transition-colors duration-200 cursor-pointer flex flex-col justify-between backdrop-blur-md shadow-xl ${
        item.featured
          ? 'border-emerald-500/45 bg-gradient-to-br from-emerald-950/45 via-slate-900/95 to-slate-950 hover:border-emerald-400'
          : 'border-white/[0.08] bg-slate-900/85 hover:bg-slate-900/95 hover:border-emerald-500/40'
      }`}
    >
      {/* Dynamic Cursor-Tracking Radial Spotlight (CSS Custom Property — Zero Re-renders) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
        style={{
          background:
            'radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(16, 185, 129, 0.14), transparent 70%)',
        }}
      />

      {/* Visual Banner Header */}
      <div className="relative h-48 bg-slate-950/90 flex items-center justify-center overflow-hidden border-b border-white/[0.06]">
        {item.imageUrl ? (
          <SkillMediaRenderer
            src={item.imageUrl}
            alt={item.title}
            variant="cover"
            className="group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-slate-400 block">
              Engineering Recognition
            </span>
          </div>
        )}

        {/* Measured Contrast Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />

        {/* Organization & Date Overlay */}
        <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/[0.12] flex items-center justify-center overflow-hidden shrink-0 shadow-md">
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
              <p className="text-[11px] font-mono text-emerald-400">
                {item.category} · {formattedDate}
              </p>
            </div>
          </div>

          {item.featured && (
            <span className="text-[11px] font-mono font-bold text-amber-300 shrink-0">
              Featured Honor
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4 relative z-10">
        <div className="space-y-2.5">
          {item.badge && (
            <div className="text-xs font-mono text-emerald-400 font-bold">
              {item.badge}
            </div>
          )}

          <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-snug">
            {item.title}
          </h3>

          {item.subtitle && (
            <p className="text-xs font-mono text-teal-300 leading-snug">
              {item.subtitle}
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
            {item.shortDescription}
          </p>

          {/* Expandable Full Context Drawer */}
          {item.description && item.description !== item.shortDescription && (
            <div onClick={(e) => e.stopPropagation()} className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded((prev) => !prev);
                  soundFx.playClick(580);
                }}
                className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                <span>{isExpanded ? 'Collapse Case Context' : 'Read Full Impact Breakdown'}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.24, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 p-3 rounded-xl bg-slate-950/85 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer Skills & Inspection Action */}
        <div className="space-y-3 pt-3 border-t border-white/[0.06]">
          {((item.skills && item.skills.length > 0) ||
            (item.technologies && item.technologies.length > 0)) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-slate-400">
              {[...(item.skills || []), ...(item.technologies || [])]
                .slice(0, 4)
                .map((tag, idx, arr) => (
                  <React.Fragment key={idx}>
                    <span className="text-slate-300">{tag}</span>
                    {idx < arr.length - 1 && (
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-bold group-hover:text-emerald-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Recognition Dossier</span>
            </span>

            {(item.credentialUrl || item.certificateUrl || item.projectUrl) && (
              <a
                href={item.credentialUrl || item.certificateUrl || item.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-white inline-flex items-center gap-1"
              >
                <span>Proof</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function CertificationsAchievementsShowcase({
  certificates,
  achievements,
  prefersReduced = false,
  onSelectCertificate,
  onSelectAchievement,
  soundFx,
}: CertificationsAchievementsShowcaseProps) {
  // Certifications state
  const [certSearchQuery, setCertSearchQuery] = useState('');
  const [selectedCertOrg, setSelectedCertOrg] = useState('All');
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  // Achievements state
  const [achSearchQuery, setAchSearchQuery] = useState('');
  const [selectedAchievementCategory, setSelectedAchievementCategory] =
    useState('All');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const visibleCertificates = useMemo(
    () => (Array.isArray(certificates) ? certificates : []),
    [certificates]
  );

  const certOrganizations = useMemo(() => {
    const orgs = Array.from(
      new Set(
        visibleCertificates
          .map((c) => c.issuingOrganization)
          .filter(Boolean)
      )
    );
    return ['All', ...orgs];
  }, [visibleCertificates]);

  const filteredCertificates = useMemo(() => {
    return visibleCertificates.filter((cert) => {
      const matchesOrg =
        selectedCertOrg === 'All' ||
        cert.issuingOrganization === selectedCertOrg;
      if (!matchesOrg) return false;
      if (!certSearchQuery.trim()) return true;
      const q = certSearchQuery.toLowerCase();
      return (
        (cert.name || '').toLowerCase().includes(q) ||
        (cert.issuingOrganization || '').toLowerCase().includes(q) ||
        (cert.credentialId || '').toLowerCase().includes(q)
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
    const cats = Array.from(
      new Set(visibleAchievements.map((a) => a.category).filter(Boolean))
    );
    return ['All', ...cats];
  }, [visibleAchievements]);

  const filteredAchievements = useMemo(() => {
    return visibleAchievements.filter((ach) => {
      if (showFeaturedOnly && !ach.featured) return false;
      const matchesCat =
        selectedAchievementCategory === 'All' ||
        ach.category === selectedAchievementCategory;
      if (!matchesCat) return false;
      if (!achSearchQuery.trim()) return true;
      const q = achSearchQuery.toLowerCase();
      return (
        (ach.title || '').toLowerCase().includes(q) ||
        (ach.organization || '').toLowerCase().includes(q) ||
        (ach.shortDescription || '').toLowerCase().includes(q) ||
        (ach.category || '').toLowerCase().includes(q)
      );
    });
  }, [
    visibleAchievements,
    selectedAchievementCategory,
    achSearchQuery,
    showFeaturedOnly,
  ]);

  const handleCopyCertId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedCertId(id);
    soundFx.playSuccess();
    setTimeout(() => setCopiedCertId(null), 2500);
  };

  return (
    <div className="space-y-20">
      {/* ===================================================================== */}
      {/* SECTION 1: INDUSTRY CERTIFICATIONS & ACCREDITATIONS VAULT             */}
      {/* ===================================================================== */}
      <section id="credentials" className="space-y-8 scroll-mt-24 relative">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-4 border-b border-white/[0.06]">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
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
              Cryptographically verifiable engineering licenses validating expertise in Java systems architecture, cloud infrastructure, relational database internals, and full-stack software delivery.
            </p>
          </div>

          {/* Search & Organization Filter Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
        </div>

        {/* Certifications KPI Telemetry Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-mono text-slate-400 block">
                Total Credentials
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums truncate block mt-0.5">
                {visibleCertificates.length} Verified Licenses
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-mono text-slate-400 block">
                Issuing Authorities
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums truncate block mt-0.5">
                {Math.max(1, certOrganizations.length - 1)} Global Bodies
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-mono text-slate-400 block">
                Core Domains
              </span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono truncate block mt-0.5">
                Java · Cloud · SQL
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.07] flex items-center gap-3.5 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-mono text-slate-400 block">
                Standing
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono truncate block mt-0.5">
                100% Active Standing
              </span>
            </div>
          </div>
        </div>

        {/* Organization Filter Tabs */}
        {certOrganizations.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap p-1.5 rounded-2xl bg-slate-950/90 border border-white/[0.08] backdrop-blur-xl">
            {certOrganizations.map((org) => {
              const isActive = selectedCertOrg === org;
              return (
                <button
                  key={org}
                  type="button"
                  onClick={() => {
                    setSelectedCertOrg(org);
                    soundFx.playClick(540);
                  }}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {org}
                </button>
              );
            })}
          </div>
        )}

        {/* Certifications 3D Vault Grid */}
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
              {filteredCertificates.map((cert, idx) => (
                <CertificateCard3D
                  key={cert.id}
                  cert={cert}
                  index={idx}
                  copiedCertId={copiedCertId}
                  onCopyId={handleCopyCertId}
                  onInspect={onSelectCertificate}
                  prefersReduced={prefersReduced}
                  soundFx={soundFx}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* SECTION 2: ACHIEVEMENTS, HONORS & ENGINEERING RECOGNITION             */}
      {/* ===================================================================== */}
      <section id="achievements" className="space-y-8 scroll-mt-24 relative">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-4 border-b border-white/[0.06]">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span>Honors & Engineering Milestones</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400 tabular-nums">
                {filteredAchievements.length}{' '}
                {filteredAchievements.length === 1 ? 'Recognition' : 'Recognitions'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-luxury text-white tracking-wide">
              Achievements, Awards & Milestones
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
              Distinguished engineering awards, hackathon victories, architectural benchmarks, and competitive algorithmic milestones.
            </p>
          </div>

          {/* Search & Featured Filter Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={achSearchQuery}
                onChange={(e) => setAchSearchQuery(e.target.value)}
                placeholder="Search honors, awards..."
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

            <button
              type="button"
              onClick={() => {
                setShowFeaturedOnly((prev) => !prev);
                soundFx.playClick(580);
              }}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                showFeaturedOnly
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg'
                  : 'bg-slate-950/90 border-white/[0.08] text-slate-300 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>{showFeaturedOnly ? 'Showing Featured' : 'Featured Only'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        {achievementCategories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap p-1.5 rounded-2xl bg-slate-950/90 border border-white/[0.08] backdrop-blur-xl">
            {achievementCategories.map((cat) => {
              const isActive = selectedAchievementCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedAchievementCategory(cat);
                    soundFx.playClick(540);
                  }}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Achievements 3D Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-14 px-4 bg-slate-900/40 rounded-2xl border border-white/[0.06]">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">
              No matching achievements found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try clearing your search or category filter to view all engineering milestones.
            </p>
            {(achSearchQuery || selectedAchievementCategory !== 'All' || showFeaturedOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAchievementCategory('All');
                  setAchSearchQuery('');
                  setShowFeaturedOnly(false);
                }}
                className="mt-4 px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredAchievements.map((item, idx) => (
                <AchievementCard3D
                  key={item.id || `ach-${idx}`}
                  item={item}
                  index={idx}
                  onInspect={onSelectAchievement}
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

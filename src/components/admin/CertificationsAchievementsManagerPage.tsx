import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Trophy,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  Star,
  Sparkles,
  Search,
  Workflow,
  Cpu,
  ShieldCheck,
  Fingerprint,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Medal,
} from 'lucide-react';
import { CertificateItem, AchievementItem } from '../../data/cmsMockData';
import CertificatesPage from './CertificatesPage';
import AchievementsPage from './AchievementsPage';

interface CertificationsAchievementsManagerPageProps {
  certificates: CertificateItem[];
  achievements: AchievementItem[];
  onAddCertificate: (cert: Omit<CertificateItem, 'id'>) => Promise<void>;
  onUpdateCertificate: (cert: CertificateItem) => Promise<void>;
  onDeleteCertificate: (id: number) => Promise<void>;
  onReorderCertificates?: (reordered: CertificateItem[]) => Promise<void>;
  onAddAchievement: (ach: Omit<AchievementItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateAchievement: (ach: AchievementItem) => Promise<void>;
  onDeleteAchievement: (id: number) => Promise<void>;
  onToggleAchievementVisibility: (id: number, visibility: boolean) => Promise<void>;
  onToggleAchievementFeatured: (id: number, featured: boolean) => Promise<void>;
  onReorderAchievements: (reordered: AchievementItem[]) => Promise<void>;
}

const ACHIEVEMENT_CATEGORIES: AchievementItem['category'][] = [
  'Hackathon',
  'Competition',
  'Award',
  'Coding',
  'Internship',
  'Research',
  'Open Source',
  'Academic',
  'Certification',
  'Leadership',
  'Volunteer',
  'Other',
];

function deriveCertDomain(cert: CertificateItem) {
  const text = `${cert.name} ${cert.issuingOrganization}`.toLowerCase();
  if (text.includes('java') || text.includes('spring')) {
    return {
      domain: 'Enterprise JVM & Microservices Architecture',
      competencies: [
        'Enterprise Java 21 / Spring Boot 3.4 Distributed Systems',
        'Object-Oriented Design Patterns & SOLID Architecture',
        'High-Concurrency Multi-Threading & Memory Optimization',
      ],
    };
  }
  if (text.includes('sql') || text.includes('database') || text.includes('mysql') || text.includes('postgres')) {
    return {
      domain: 'Relational Database Systems & Query Optimization',
      competencies: [
        '3NF/BCNF Schema Normalization & Indexing Strategies',
        'ACID Transactions, Isolation Levels & Query Execution Plans',
        'High-Throughput Connection Pooling & Data Persistence',
      ],
    };
  }
  if (text.includes('aws') || text.includes('cloud') || text.includes('docker')) {
    return {
      domain: 'Cloud-Native Infrastructure & Distributed Deployment',
      competencies: [
        'Fault-Tolerant Multi-AZ Cloud Topology & Auto-Scaling',
        'Zero-Downtime Container Orchestration & CI/CD Pipelines',
        'IAM Zero-Trust Security & Telemetry Observability',
      ],
    };
  }
  return {
    domain: 'Full-Stack Software Engineering & Systems Design',
    competencies: [
      'Production-Grade Full-Stack Application Architecture',
      'Clean Code, Algorithmic Efficiency & Automated Testing',
      'Enterprise API Security & System Reliability Standards',
    ],
  };
}

export default function CertificationsAchievementsManagerPage({
  certificates,
  achievements,
  onAddCertificate,
  onUpdateCertificate,
  onDeleteCertificate,
  onReorderCertificates,
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement,
  onToggleAchievementVisibility,
  onToggleAchievementFeatured,
  onReorderAchievements,
}: CertificationsAchievementsManagerPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'unified' | 'certificates' | 'achievements'>('unified');
  const [streamFilter, setStreamFilter] = useState<'all' | 'certificate' | 'achievement'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (certificates[0]) initial[`cert-${certificates[0].id}`] = true;
    if (achievements[0]) initial[`ach-${achievements[0].id}`] = true;
    return initial;
  });
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Modal Editor State for Unified View
  const [quickModalType, setQuickModalType] = useState<'certificate' | 'achievement' | null>(null);
  const [editingCert, setEditingCert] = useState<CertificateItem | null>(null);
  const [editingAch, setEditingAch] = useState<AchievementItem | null>(null);

  // Certificate Modal Form State
  const [certForm, setCertForm] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    displayOrder: 1,
  });

  // Achievement Modal Form State
  const [achForm, setAchForm] = useState({
    title: '',
    subtitle: '',
    category: 'Award' as AchievementItem['category'],
    organization: '',
    achievementDate: '',
    badge: '',
    awardType: 'Excellence Recognition',
    position: '1st Place / Top 1%',
    shortDescription: '',
    description: '',
    skillsText: 'Java 21, Spring Boot 3.4, System Architecture, Distributed Systems',
    technologiesText: 'Java, Spring Boot, PostgreSQL, React, Docker',
    credentialUrl: '',
    projectUrl: '',
    imageUrl: '',
    featured: true,
    visibility: true,
    displayOrder: 1,
  });

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const openAddCertificateModal = () => {
    setEditingCert(null);
    setCertForm({
      name: '',
      issuingOrganization: '',
      issueDate: new Date().toISOString().slice(0, 10),
      expirationDate: '',
      credentialId: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      credentialUrl: '',
      displayOrder: certificates.length + 1,
    });
    setQuickModalType('certificate');
  };

  const openEditCertificateModal = (cert: CertificateItem) => {
    setEditingCert(cert);
    setCertForm({
      name: cert.name || '',
      issuingOrganization: cert.issuingOrganization || '',
      issueDate: cert.issueDate || '',
      expirationDate: cert.expirationDate || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      displayOrder: cert.displayOrder ?? cert.order ?? 1,
    });
    setQuickModalType('certificate');
  };

  const openAddAchievementModal = () => {
    setEditingAch(null);
    setAchForm({
      title: '',
      subtitle: 'Enterprise Systems & Engineering Excellence',
      category: 'Award',
      organization: '',
      achievementDate: new Date().toISOString().slice(0, 10),
      badge: 'TOP 1% RECOGNITION',
      awardType: 'Engineering Excellence Award',
      position: 'Winner / Distinction',
      shortDescription: '',
      description: '',
      skillsText: 'Distributed Systems, Java 21, Spring Boot, Cloud Architecture',
      technologiesText: 'Java 21, Spring Boot 3.4, PostgreSQL, Redis, React 19, Docker',
      credentialUrl: '',
      projectUrl: '',
      imageUrl: '',
      featured: true,
      visibility: true,
      displayOrder: achievements.length + 1,
    });
    setQuickModalType('achievement');
  };

  const openEditAchievementModal = (ach: AchievementItem) => {
    setEditingAch(ach);
    setAchForm({
      title: ach.title || '',
      subtitle: ach.subtitle || '',
      category: ach.category || 'Award',
      organization: ach.organization || '',
      achievementDate: ach.achievementDate || '',
      badge: ach.badge || '',
      awardType: ach.awardType || '',
      position: ach.position || '',
      shortDescription: ach.shortDescription || '',
      description: ach.description || '',
      skillsText: Array.isArray(ach.skills) ? ach.skills.join(', ') : '',
      technologiesText: Array.isArray(ach.technologies) ? ach.technologies.join(', ') : '',
      credentialUrl: ach.credentialUrl || ach.certificateUrl || '',
      projectUrl: ach.projectUrl || '',
      imageUrl: ach.imageUrl || '',
      featured: Boolean(ach.featured),
      visibility: ach.visibility !== false,
      displayOrder: ach.displayOrder || 1,
    });
    setQuickModalType('achievement');
  };

  const handleSaveCertificateModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.name.trim() || !certForm.issuingOrganization.trim()) return;

    const payload: Omit<CertificateItem, 'id'> = {
      name: certForm.name.trim(),
      issuingOrganization: certForm.issuingOrganization.trim(),
      issueDate: certForm.issueDate,
      expirationDate: certForm.expirationDate.trim(),
      credentialId: certForm.credentialId.trim(),
      credentialUrl: certForm.credentialUrl.trim(),
      displayOrder: Number(certForm.displayOrder) || 1,
      order: Number(certForm.displayOrder) || 1,
    };

    if (editingCert) {
      await onUpdateCertificate({ ...editingCert, ...payload });
    } else {
      await onAddCertificate(payload);
    }
    setQuickModalType(null);
  };

  const handleSaveAchievementModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achForm.title.trim() || !achForm.organization.trim()) return;

    const skills = achForm.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const technologies = achForm.technologiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Omit<AchievementItem, 'id' | 'createdAt' | 'updatedAt'> = {
      title: achForm.title.trim(),
      subtitle: achForm.subtitle.trim(),
      category: achForm.category,
      organization: achForm.organization.trim(),
      achievementDate: achForm.achievementDate || new Date().toISOString().slice(0, 10),
      badge: achForm.badge.trim(),
      awardType: achForm.awardType.trim(),
      position: achForm.position.trim(),
      shortDescription: achForm.shortDescription.trim() || achForm.description.trim(),
      description: achForm.description.trim() || achForm.shortDescription.trim(),
      skills,
      technologies,
      credentialUrl: achForm.credentialUrl.trim(),
      projectUrl: achForm.projectUrl.trim(),
      imageUrl: achForm.imageUrl.trim(),
      featured: achForm.featured,
      visibility: achForm.visibility,
      displayOrder: Number(achForm.displayOrder) || 1,
    };

    if (editingAch) {
      await onUpdateAchievement({
        ...editingAch,
        ...payload,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await onAddAchievement(payload);
    }
    setQuickModalType(null);
  };

  const moveCertItem = async (index: number, direction: 'up' | 'down') => {
    if (!onReorderCertificates) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= certificates.length) return;
    const copy = [...certificates];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    await onReorderCertificates(
      copy.map((item, idx) => ({ ...item, displayOrder: idx + 1, order: idx + 1 }))
    );
  };

  const moveAchItem = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= achievements.length) return;
    const copy = [...achievements];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    await onReorderAchievements(
      copy.map((item, idx) => ({ ...item, displayOrder: idx + 1 }))
    );
  };

  // Unified chronological / priority stream combining Certificates + Achievements
  const unifiedStreamItems = useMemo(() => {
    const certNodes = certificates.map((cert, index) => ({
      key: `cert-${cert.id}`,
      type: 'certificate' as const,
      sortYear: parseInt(String(cert.issueDate || '2024').slice(0, 4), 10) || 2024,
      index,
      cert,
    }));

    const achNodes = achievements.map((ach, index) => ({
      key: `ach-${ach.id}`,
      type: 'achievement' as const,
      sortYear: parseInt(String(ach.achievementDate || '2024').slice(0, 4), 10) || 2024,
      index,
      ach,
    }));

    const combined = [...certNodes, ...achNodes].sort((a, b) => b.sortYear - a.sortYear);

    return combined.filter((item) => {
      if (streamFilter !== 'all' && item.type !== streamFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      if (item.type === 'certificate') {
        const c = item.cert;
        return (
          (c.name || '').toLowerCase().includes(q) ||
          (c.issuingOrganization || '').toLowerCase().includes(q) ||
          (c.credentialId || '').toLowerCase().includes(q)
        );
      } else {
        const a = item.ach;
        return (
          (a.title || '').toLowerCase().includes(q) ||
          (a.organization || '').toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q) ||
          (a.shortDescription || '').toLowerCase().includes(q)
        );
      }
    });
  }, [certificates, achievements, streamFilter, searchQuery]);

  const featuredAchievementsCount = useMemo(
    () => achievements.filter((a) => a.featured).length,
    [achievements]
  );

  const uniqueAuthoritiesCount = useMemo(() => {
    const orgs = new Set<string>();
    certificates.forEach((c) => {
      if (c.issuingOrganization) orgs.add(c.issuingOrganization.trim());
    });
    achievements.forEach((a) => {
      if (a.organization) orgs.add(a.organization.trim());
    });
    return orgs.size;
  }, [certificates, achievements]);

  return (
    <div className="space-y-6 text-left">
      {/* Top Executive Glass-Morphism Studio Banner */}
      <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CMS CREDENTIAL & MILESTONE LEDGER · FULL CRUD STUDIO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Certifications &amp; Achievements Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create, update, reorder, and verify accredited industry certifications and engineering honors. All mutations persist to the database and synchronize live with the portfolio frontend.
            </p>
          </div>

          {/* Quick-Create Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={openAddCertificateModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Certification</span>
            </button>

            <button
              type="button"
              onClick={openAddAchievementModal}
              className="px-4 py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/35 font-mono text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Achievement</span>
            </button>
          </div>
        </div>

        {/* Telemetry Summary Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/[0.06]">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.05]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Verified Certifications
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black font-mono text-emerald-400">
                {certificates.length}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Active Licenses
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.05]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Proven Milestones
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black font-mono text-teal-400">
                {achievements.length}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Awards &amp; Honors
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.05]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Featured Spotlights
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black font-mono text-amber-400">
                {featuredAchievementsCount}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Highlighted
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.05]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Issuing Authorities
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black font-mono text-cyan-400">
                {uniqueAuthoritiesCount}
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Live DB Synced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Bar: Unified Stream vs Dedicated Studio Tables */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-white/[0.08] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('unified')}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'unified'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Interactive Credentials Stream ({certificates.length + achievements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('certificates')}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'certificates'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-white/[0.04]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Certifications Studio ({certificates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('achievements')}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'achievements'
                ? 'bg-teal-400 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-teal-400 hover:bg-white/[0.04]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Achievements Studio ({achievements.length})</span>
          </button>
        </div>

        {activeSubTab === 'unified' && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter licenses, issuers, awards..."
                className="w-full bg-slate-950/90 border border-white/[0.08] text-slate-200 text-xs rounded-xl pl-8 pr-7 py-2 focus:outline-none focus:border-emerald-500/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-white/[0.08]">
              {(['all', 'certificate', 'achievement'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStreamFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold capitalize transition-all cursor-pointer ${
                    streamFilter === f
                      ? 'bg-white/10 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'certificate' ? 'Certifications' : 'Achievements'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: UNIFIED INTERACTIVE VERTICAL CREDENTIALS & ACHIEVEMENTS TIMELINE */}
      {activeSubTab === 'unified' && (
        <div className="relative pl-7 sm:pl-10 ml-2 sm:ml-4 space-y-6">
          {/* Vertical Glowing Spine */}
          <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-emerald-400 via-teal-500/60 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.6)]" />

          <AnimatePresence mode="popLayout" initial={false}>
            {unifiedStreamItems.map((item, idx) => {
              const isExpanded = Boolean(expandedKeys[item.key]);

              if (item.type === 'certificate') {
                const cert = item.cert;
                const domainMeta = deriveCertDomain(cert);

                return (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, x: -32, y: 14, scale: 0.98 }}
                    whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    viewport={{ once: false, margin: '-50px' }}
                    exit={{ opacity: 0, x: 36, scale: 0.95 }}
                    transition={{
                      duration: 0.32,
                      delay: Math.min(idx * 0.04, 0.2),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative rounded-2xl p-5 sm:p-6 backdrop-blur-xl border bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-slate-950/95 border-emerald-500/35 hover:border-emerald-400/60 shadow-xl transition-colors duration-300"
                  >
                    {/* Timeline Node */}
                    <div className="absolute -left-[37px] sm:-left-[49px] top-6 flex items-center justify-center">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-950 border-2 border-emerald-400 shadow-[0_0_14px_#34d399]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </span>
                    </div>

                    {/* Header Bar with Click-to-Expand and Quick CRUD Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div
                        onClick={() => toggleExpand(item.key)}
                        className="flex items-start gap-3.5 cursor-pointer flex-1 min-w-0"
                      >
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                            <span className="text-emerald-400 font-bold">VERIFIED CERTIFICATION</span>
                            <span>·</span>
                            <span>Issued: {cert.issueDate}</span>
                            <span>·</span>
                            <span>{cert.expirationDate || 'Lifetime License'}</span>
                          </div>

                          <h3 className="text-base sm:text-lg font-extrabold text-white">
                            {cert.name}{' '}
                            <span className="text-emerald-400 font-mono text-sm font-bold">
                              · {cert.issuingOrganization}
                            </span>
                          </h3>

                          <p className="text-xs font-mono text-slate-300">
                            {domainMeta.domain}
                            {cert.credentialId ? ` · ID: ${cert.credentialId}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Admin CRUD Action Toolbar */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.key)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Collapse' : 'Competency Matrix'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => moveCertItem(item.index, 'up')}
                          disabled={item.index === 0}
                          title="Move Priority Up"
                          className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.06] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveCertItem(item.index, 'down')}
                          disabled={item.index === certificates.length - 1}
                          title="Move Priority Down"
                          className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.06] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {cert.credentialId && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cert.credentialId);
                              setCopiedId(`cert-${cert.id}`);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            title="Copy Credential ID"
                            className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/[0.06] cursor-pointer"
                          >
                            {copiedId === `cert-${cert.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Fingerprint className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditCertificateModal(cert)}
                          title="Edit Certification"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/[0.08] text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const { id: _, ...rest } = cert;
                            onAddCertificate({
                              ...rest,
                              name: `${cert.name} (Copy)`,
                              displayOrder: certificates.length + 1,
                              order: certificates.length + 1,
                            });
                          }}
                          title="Duplicate Certification"
                          className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.06] cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteKey === item.key ? (
                          <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-500/40 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-mono text-rose-200 font-bold">Delete?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteCertificate(cert.id);
                                setConfirmDeleteKey(null);
                              }}
                              className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-mono font-bold cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteKey(null)}
                              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteKey(item.key)}
                            title="Delete Certification"
                            className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/[0.06] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Competency Matrix Drawer */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-8 p-4 rounded-xl bg-slate-950/85 border border-emerald-500/20 space-y-2">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5" />
                                <span>Verified Architectural Competencies</span>
                              </span>
                              <ul className="space-y-1.5 text-xs text-slate-300">
                                {domainMeta.competencies.map((comp, cIdx) => (
                                  <li key={cIdx} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{comp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="lg:col-span-4 p-4 rounded-xl bg-slate-950/85 border border-white/[0.06] space-y-2.5 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                                  Verification Metadata
                                </span>
                                <p className="text-xs font-mono text-emerald-300 font-bold mt-1">
                                  ID: {cert.credentialId || 'AUTHENTICATED'}
                                </p>
                                <p className="text-[11px] font-mono text-slate-400 mt-1">
                                  Authority: {cert.issuingOrganization}
                                </p>
                              </div>
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300"
                                >
                                  <span>Open Verification Registry</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              } else {
                const ach = item.ach;
                const tags = [...(ach.skills || []), ...(ach.technologies || [])];

                return (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, x: -32, y: 14, scale: 0.98 }}
                    whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    viewport={{ once: false, margin: '-50px' }}
                    exit={{ opacity: 0, x: 36, scale: 0.95 }}
                    transition={{
                      duration: 0.32,
                      delay: Math.min(idx * 0.04, 0.2),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`relative rounded-2xl p-5 sm:p-6 backdrop-blur-xl border transition-colors duration-300 ${
                      ach.visibility === false
                        ? 'bg-slate-950/50 border-slate-800/70 opacity-65'
                        : ach.featured
                        ? 'bg-gradient-to-br from-teal-950/35 via-slate-900/90 to-slate-950/95 border-teal-500/45 shadow-xl'
                        : 'bg-slate-900/75 hover:bg-slate-900/95 border-white/[0.08] hover:border-teal-500/40 shadow-lg'
                    }`}
                  >
                    {/* Timeline Node */}
                    <div className="absolute -left-[37px] sm:-left-[49px] top-6 flex items-center justify-center">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-950 border-2 border-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.5)]">
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                      </span>
                    </div>

                    {/* Header Bar with Click-to-Expand and Quick CRUD Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div
                        onClick={() => toggleExpand(item.key)}
                        className="flex items-start gap-3.5 cursor-pointer flex-1 min-w-0"
                      >
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-teal-500/35 flex items-center justify-center text-teal-400 shrink-0">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                            <span className="text-teal-400 font-bold uppercase">
                              {ach.category || 'ACHIEVEMENT'}
                            </span>
                            <span>·</span>
                            <span>{ach.achievementDate}</span>
                            {ach.featured && (
                              <>
                                <span>·</span>
                                <span className="text-amber-300 font-bold flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-300" /> Featured
                                </span>
                              </>
                            )}
                            {ach.visibility === false && (
                              <span className="text-amber-400 font-bold">· Hidden Draft</span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-extrabold text-white">
                            {ach.title}{' '}
                            <span className="text-teal-300 font-mono text-sm font-semibold">
                              @ {ach.organization}
                            </span>
                          </h3>

                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {ach.shortDescription}
                          </p>
                        </div>
                      </div>

                      {/* Admin CRUD Action Toolbar */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.key)}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/25 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Collapse' : 'Impact Dossier'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => moveAchItem(item.index, 'up')}
                          disabled={item.index === 0}
                          title="Move Up"
                          className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.06] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveAchItem(item.index, 'down')}
                          disabled={item.index === achievements.length - 1}
                          title="Move Down"
                          className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.06] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleAchievementFeatured(ach.id, !ach.featured)}
                          title={ach.featured ? 'Unfeature Milestone' : 'Mark as Featured'}
                          className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-white/[0.06] cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              ach.featured ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleAchievementVisibility(ach.id, !ach.visibility)}
                          title={ach.visibility === false ? 'Publish on Portfolio' : 'Hide from Portfolio'}
                          className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-teal-400 border border-white/[0.06] cursor-pointer"
                        >
                          {ach.visibility === false ? (
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-teal-400" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditAchievementModal(ach)}
                          title="Edit Achievement"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-white/[0.08] text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const { id: _, createdAt: _c, updatedAt: _u, ...rest } = ach;
                            onAddAchievement({
                              ...rest,
                              title: `${ach.title} (Copy)`,
                              displayOrder: achievements.length + 1,
                            });
                          }}
                          title="Duplicate Achievement"
                          className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.06] cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteKey === item.key ? (
                          <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-500/40 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-mono text-rose-200 font-bold">Delete?</span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteAchievement(ach.id);
                                setConfirmDeleteKey(null);
                              }}
                              className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-mono font-bold cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteKey(null)}
                              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteKey(item.key)}
                            title="Delete Achievement"
                            className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/[0.06] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Achievement Impact Drawer */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-8 p-4 rounded-xl bg-slate-950/85 border border-teal-500/20 space-y-2">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold flex items-center gap-1.5">
                                <Medal className="w-3.5 h-3.5" />
                                <span>Full Engineering Impact &amp; Recognition Context</span>
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {ach.description || ach.shortDescription}
                              </p>
                            </div>

                            <div className="lg:col-span-4 p-4 rounded-xl bg-slate-950/85 border border-white/[0.06] space-y-2.5">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                                Validated Skills &amp; Stack
                              </span>
                              {ach.badge && (
                                <p className="text-xs font-mono text-teal-300 font-bold">
                                  {ach.badge}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1.5">
                                {tags.map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/25 text-teal-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              }
            })}
          </AnimatePresence>

          {unifiedStreamItems.length === 0 && (
            <div className="rounded-2xl p-10 text-center bg-slate-900/50 border border-white/[0.06] space-y-3">
              <p className="text-sm font-bold text-slate-300">
                No matching certifications or achievements found.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={openAddCertificateModal}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-bold cursor-pointer"
                >
                  + Add Certification
                </button>
                <button
                  type="button"
                  onClick={openAddAchievementModal}
                  className="px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono text-xs font-bold cursor-pointer"
                >
                  + Add Achievement
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEDICATED CERTIFICATIONS STUDIO */}
      {activeSubTab === 'certificates' && (
        <CertificatesPage
          certificates={certificates}
          onAdd={onAddCertificate}
          onUpdate={onUpdateCertificate}
          onDelete={onDeleteCertificate}
          onReorder={onReorderCertificates}
        />
      )}

      {/* TAB 3: DEDICATED ACHIEVEMENTS STUDIO */}
      {activeSubTab === 'achievements' && (
        <AchievementsPage
          achievements={achievements}
          onAdd={onAddAchievement}
          onUpdate={onUpdateAchievement}
          onDelete={onDeleteAchievement}
          onToggleVisibility={onToggleAchievementVisibility}
          onToggleFeatured={onToggleAchievementFeatured}
          onReorder={onReorderAchievements}
        />
      )}

      {/* QUICK MODAL CRUD FOR UNIFIED VIEW */}
      <AnimatePresence>
        {quickModalType === 'certificate' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 sm:p-7 shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    {editingCert ? 'UPDATE ACCREDITED LICENSE' : 'NEW ACCREDITED LICENSE'}
                  </span>
                  <h3 className="text-lg font-extrabold text-white">
                    {editingCert ? `Edit ${editingCert.name}` : 'Register Industry Certification'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickModalType(null)}
                  className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-white/[0.08] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCertificateModal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Certification Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={certForm.name}
                      onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                      placeholder="e.g. Java Full Stack Development"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Issuing Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={certForm.issuingOrganization}
                      onChange={(e) =>
                        setCertForm({ ...certForm, issuingOrganization: e.target.value })
                      }
                      placeholder="e.g. Besant Technologies / HackerRank / AWS"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Issue Date *
                    </label>
                    <input
                      type="text"
                      required
                      value={certForm.issueDate}
                      onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                      placeholder="YYYY-MM-DD"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Expiration / Validity
                    </label>
                    <input
                      type="text"
                      value={certForm.expirationDate}
                      onChange={(e) =>
                        setCertForm({ ...certForm, expirationDate: e.target.value })
                      }
                      placeholder="Lifetime License or YYYY-MM-DD"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Credential ID
                    </label>
                    <input
                      type="text"
                      value={certForm.credentialId}
                      onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                      placeholder="e.g. BT-JFS-2023-884"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Official Verification URL
                  </label>
                  <input
                    type="url"
                    value={certForm.credentialUrl}
                    onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                    placeholder="https://www.hackerrank.com/certificates/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setQuickModalType(null)}
                    className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-white/[0.08] text-xs font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingCert ? 'Save Changes' : 'Create Certification'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {quickModalType === 'achievement' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-teal-500/30 p-6 sm:p-7 shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold">
                    {editingAch ? 'UPDATE ENGINEERING MILESTONE' : 'NEW ENGINEERING MILESTONE'}
                  </span>
                  <h3 className="text-lg font-extrabold text-white">
                    {editingAch ? `Edit ${editingAch.title}` : 'Add Achievement or Award'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickModalType(null)}
                  className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-white/[0.08] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAchievementModal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Achievement Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={achForm.title}
                      onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
                      placeholder="e.g. 5-Star Gold Badge in Java & Problem Solving"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Issuing Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={achForm.organization}
                      onChange={(e) => setAchForm({ ...achForm, organization: e.target.value })}
                      placeholder="e.g. HackerRank / LeetCode / National Symposium"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={achForm.category}
                      onChange={(e) =>
                        setAchForm({
                          ...achForm,
                          category: e.target.value as AchievementItem['category'],
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    >
                      {ACHIEVEMENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Achievement Date
                    </label>
                    <input
                      type="text"
                      value={achForm.achievementDate}
                      onChange={(e) =>
                        setAchForm({ ...achForm, achievementDate: e.target.value })
                      }
                      placeholder="YYYY-MM-DD"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Recognition Badge
                    </label>
                    <input
                      type="text"
                      value={achForm.badge}
                      onChange={(e) => setAchForm({ ...achForm, badge: e.target.value })}
                      placeholder="e.g. TOP 1% CODER"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Executive Summary *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={achForm.shortDescription}
                    onChange={(e) =>
                      setAchForm({ ...achForm, shortDescription: e.target.value })
                    }
                    placeholder="Concise summary of the award or milestone..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-teal-400 mb-1">
                    Full Case Context &amp; Impact Breakdown
                  </label>
                  <textarea
                    rows={3}
                    value={achForm.description}
                    onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
                    placeholder="Detailed architectural and algorithmic impact..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Validated Skills (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={achForm.skillsText}
                      onChange={(e) => setAchForm({ ...achForm, skillsText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Proof / Credential URL
                    </label>
                    <input
                      type="url"
                      value={achForm.credentialUrl}
                      onChange={(e) =>
                        setAchForm({ ...achForm, credentialUrl: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/[0.08]">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={achForm.featured}
                        onChange={(e) =>
                          setAchForm({ ...achForm, featured: e.target.checked })
                        }
                        className="rounded border-slate-700"
                      />
                      <span>Featured Spotlight</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={achForm.visibility}
                        onChange={(e) =>
                          setAchForm({ ...achForm, visibility: e.target.checked })
                        }
                        className="rounded border-slate-700"
                      />
                      <span>Visible on Portfolio</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuickModalType(null)}
                      className="px-4 py-2 rounded-xl bg-slate-950 text-slate-300 border border-white/[0.08] text-xs font-mono cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-mono text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingAch ? 'Save Changes' : 'Create Achievement'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

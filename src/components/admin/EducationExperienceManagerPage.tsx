import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  Star,
  Sparkles,
  Search,
  Layers,
  Workflow,
  Cpu,
  BookOpen,
  TrendingUp,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';
import { ExperienceItem, EducationItem } from '../../data/cmsMockData';
import ExperiencePage from './ExperiencePage';
import EducationPage from './EducationPage';

interface EducationExperienceManagerPageProps {
  experiences: ExperienceItem[];
  education: EducationItem[];
  onAddExperience: (exp: Omit<ExperienceItem, 'id'>) => Promise<void>;
  onUpdateExperience: (exp: ExperienceItem) => Promise<void>;
  onDeleteExperience: (id: number) => Promise<void>;
  onReorderExperiences?: (reordered: ExperienceItem[]) => Promise<void>;
  onAddEducation: (edu: Omit<EducationItem, 'id'>) => Promise<void>;
  onUpdateEducation: (edu: EducationItem) => Promise<void>;
  onDeleteEducation: (id: number) => Promise<void>;
  onReorderEducation?: (reordered: EducationItem[]) => Promise<void>;
}

export default function EducationExperienceManagerPage({
  experiences,
  education,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  onReorderExperiences,
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation,
  onReorderEducation,
}: EducationExperienceManagerPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'unified' | 'experience' | 'education'>('unified');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'experience' | 'education'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (experiences[0]) initial[`exp-${experiences[0].id}`] = true;
    if (education[0]) initial[`edu-${education[0].id}`] = true;
    return initial;
  });
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  // Quick Modal Editor State for Unified View
  const [quickModalType, setQuickModalType] = useState<'experience' | 'education' | null>(null);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [editingEdu, setEditingEdu] = useState<EducationItem | null>(null);

  // Experience Form State
  const [expForm, setExpForm] = useState({
    role: '',
    company: '',
    location: 'Bengaluru, India',
    employmentType: 'Full-Time · Enterprise Engineering',
    workMode: 'Hybrid',
    companyUrl: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    impactMetrics: '99.99% SLA · 18.4k+ RPS',
    architectureRole: 'Principal Systems & Distributed Cloud Architecture',
    description: '',
    achievementsText: '',
    technologiesText: 'Java 21, Spring Boot 3.4, Kafka, PostgreSQL, Redis, React 19, Docker',
    isVisible: true,
  });

  // Education Form State
  const [eduForm, setEduForm] = useState({
    degree: '',
    fieldOfStudy: '',
    institution: '',
    location: 'Tamil Nadu, India',
    startDate: '',
    endDate: '',
    isCurrent: false,
    grade: '',
    honorsBadge: 'First Class with Distinction',
    capstoneProject: 'Enterprise Distributed Cloud Platform & High-Concurrency Transaction Engine',
    description: '',
    highlightsText: '',
    courseworkText: 'Data Structures & Algorithms, Object-Oriented Architecture (Java), DBMS, Operating Systems, Distributed Systems',
    isVisible: true,
  });

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const openAddExperienceModal = () => {
    setEditingExp(null);
    setExpForm({
      role: '',
      company: '',
      location: 'Bengaluru, India',
      employmentType: 'Full-Time · Enterprise Engineering',
      workMode: 'Hybrid',
      companyUrl: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      isCurrent: true,
      impactMetrics: '99.99% SLA · 18.4k+ RPS',
      architectureRole: 'Principal Systems & Distributed Cloud Architecture',
      description: '',
      achievementsText:
        'Architected fault-tolerant Java 21 & Spring Boot 3.4 microservices sustaining 18.4k+ RPS.\nDesigned normalized 3NF PostgreSQL/MySQL schemas paired with sub-millisecond Redis cache clusters.\nSpearheaded zero-trust OAuth2/JWT security gateways and zero-downtime Docker & AWS CI/CD pipelines.',
      technologiesText: 'Java 21, Spring Boot 3.4, Apache Kafka, PostgreSQL, Redis, React 19, Docker, AWS',
      isVisible: true,
    });
    setQuickModalType('experience');
  };

  const openEditExperienceModal = (exp: ExperienceItem) => {
    setEditingExp(exp);
    setExpForm({
      role: exp.role || '',
      company: exp.company || '',
      location: exp.location || 'Bengaluru, India',
      employmentType: exp.employmentType || 'Full-Time · Enterprise Engineering',
      workMode: exp.workMode || 'Hybrid',
      companyUrl: exp.companyUrl || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      isCurrent: Boolean(exp.isCurrent),
      impactMetrics: exp.impactMetrics || '99.99% SLA · High-Concurrency Systems',
      architectureRole: exp.architectureRole || 'Principal Systems & Distributed Cloud Architecture',
      description: exp.description || '',
      achievementsText: Array.isArray(exp.achievements) ? exp.achievements.join('\n') : '',
      technologiesText: Array.isArray(exp.technologies) ? exp.technologies.join(', ') : 'Java 21, Spring Boot, PostgreSQL, Kafka, React',
      isVisible: exp.isVisible !== false,
    });
    setQuickModalType('experience');
  };

  const openAddEducationModal = () => {
    setEditingEdu(null);
    setEduForm({
      degree: '',
      fieldOfStudy: '',
      institution: '',
      location: 'Tamil Nadu, India',
      startDate: '2018-08-01',
      endDate: '2022-05-30',
      isCurrent: false,
      grade: '8.5 CGPA',
      honorsBadge: 'First Class with Distinction',
      capstoneProject: 'Enterprise Distributed Cloud Platform & High-Concurrency Transaction Engine',
      description: '',
      highlightsText:
        'Mastered core computer science foundations including Data Structures, Graph Algorithms, Concurrency, and JVM Memory Internals.\nDesigned normalized relational database engines (3NF/BCNF) and full-stack distributed capstone systems.',
      courseworkText:
        'Data Structures & Algorithms, Object-Oriented Architecture (Java), Database Management Systems (DBMS), Operating Systems & Concurrency, Computer Networks & Distributed Systems',
      isVisible: true,
    });
    setQuickModalType('education');
  };

  const openEditEducationModal = (edu: EducationItem) => {
    setEditingEdu(edu);
    setEduForm({
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      institution: edu.institution || '',
      location: edu.location || 'Tamil Nadu, India',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      isCurrent: Boolean(edu.isCurrent),
      grade: edu.grade || '',
      honorsBadge: edu.honorsBadge || edu.grade || 'First Class with Distinction',
      capstoneProject: edu.capstoneProject || 'Enterprise Distributed Cloud Platform & High-Concurrency Transaction Engine',
      description: edu.description || '',
      highlightsText: Array.isArray(edu.academicHighlights) ? edu.academicHighlights.join('\n') : '',
      courseworkText: Array.isArray(edu.coursework) ? edu.coursework.join(', ') : 'Data Structures & Algorithms, DBMS, Operating Systems, Distributed Systems',
      isVisible: edu.isVisible !== false,
    });
    setQuickModalType('education');
  };

  const handleSaveExperienceModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.role.trim() || !expForm.company.trim()) return;

    const achievements = expForm.achievementsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const technologies = expForm.technologiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Omit<ExperienceItem, 'id'> = {
      role: expForm.role.trim(),
      company: expForm.company.trim(),
      location: expForm.location.trim(),
      employmentType: expForm.employmentType.trim(),
      workMode: expForm.workMode.trim(),
      companyUrl: expForm.companyUrl.trim(),
      startDate: expForm.startDate,
      endDate: expForm.isCurrent ? '' : expForm.endDate,
      isCurrent: expForm.isCurrent,
      impactMetrics: expForm.impactMetrics.trim(),
      architectureRole: expForm.architectureRole.trim(),
      description: expForm.description.trim(),
      achievements,
      technologies,
      isVisible: expForm.isVisible,
    };

    if (editingExp) {
      onUpdateExperience({ ...editingExp, ...payload });
    } else {
      onAddExperience(payload);
    }
    setQuickModalType(null);
  };

  const handleSaveEducationModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.degree.trim() || !eduForm.institution.trim()) return;

    const academicHighlights = eduForm.highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const coursework = eduForm.courseworkText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Omit<EducationItem, 'id'> = {
      degree: eduForm.degree.trim(),
      fieldOfStudy: eduForm.fieldOfStudy.trim(),
      institution: eduForm.institution.trim(),
      location: eduForm.location.trim(),
      startDate: eduForm.startDate,
      endDate: eduForm.isCurrent ? 'Present' : eduForm.endDate,
      isCurrent: eduForm.isCurrent,
      grade: eduForm.grade.trim(),
      honorsBadge: eduForm.honorsBadge.trim(),
      capstoneProject: eduForm.capstoneProject.trim(),
      description: eduForm.description.trim(),
      academicHighlights,
      coursework,
      isVisible: eduForm.isVisible,
    };

    if (editingEdu) {
      onUpdateEducation({ ...editingEdu, ...payload });
    } else {
      onAddEducation(payload);
    }
    setQuickModalType(null);
  };

  // Unified chronological biography items
  const unifiedTimelineItems = useMemo(() => {
    const expEntries = experiences.map((exp, idx) => ({
      type: 'experience' as const,
      key: `exp-${exp.id}`,
      id: exp.id,
      index: idx,
      sortDate: exp.isCurrent ? '9999-12-31' : exp.endDate || exp.startDate || '2020-01-01',
      exp,
    }));

    const eduEntries = education.map((edu, idx) => ({
      type: 'education' as const,
      key: `edu-${edu.id}`,
      id: edu.id,
      index: idx,
      sortDate: edu.isCurrent ? '9999-11-30' : edu.endDate || edu.startDate || '2018-01-01',
      edu,
    }));

    const combined = [...expEntries, ...eduEntries].filter((item) => {
      if (timelineFilter === 'experience' && item.type !== 'experience') return false;
      if (timelineFilter === 'education' && item.type !== 'education') return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      if (item.type === 'experience') {
        const e = item.exp;
        return (
          (e.role || '').toLowerCase().includes(q) ||
          (e.company || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.location || '').toLowerCase().includes(q)
        );
      } else {
        const ed = item.edu;
        return (
          (ed.degree || '').toLowerCase().includes(q) ||
          (ed.fieldOfStudy || '').toLowerCase().includes(q) ||
          (ed.institution || '').toLowerCase().includes(q) ||
          (ed.grade || '').toLowerCase().includes(q)
        );
      }
    });

    return combined.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  }, [experiences, education, timelineFilter, searchQuery]);

  const moveExpItem = (index: number, direction: 'up' | 'down') => {
    if (!onReorderExperiences) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= experiences.length) return;
    const copy = [...experiences];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    onReorderExperiences(copy);
  };

  const moveEduItem = (index: number, direction: 'up' | 'down') => {
    if (!onReorderEducation) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= education.length) return;
    const copy = [...education];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    onReorderEducation(copy);
  };

  return (
    <div className="space-y-7">
      {/* Top Executive Glass Header */}
      <div className="relative rounded-3xl p-6 sm:p-7 bg-slate-900/65 border border-white/[0.08] backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-emerald-400" />
                <span>Biography & Credentials Command Center</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                {experiences.length} Career Milestones · {education.length} Academic Degrees
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Education & Experience Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Full CRUD control over career milestones, enterprise architecture deliverables, and academic degrees. Click any glass-card in the vertical biography timeline to expand responsibilities or edit records in real time.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={openAddExperienceModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Career Milestone</span>
            </button>

            <button
              type="button"
              onClick={openAddEducationModal}
              className="px-4 py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/35 font-mono text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Add Academic Degree</span>
            </button>
          </div>
        </div>

        {/* 4-Card KPI Telemetry Bar */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/[0.06]">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Career Roles</span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums">
                {experiences.length} Positions
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Academic Degrees</span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums">
                {education.length} Credentials
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Published Live</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono tabular-nums">
                {experiences.filter((e) => e.isVisible !== false).length +
                  education.filter((ed) => ed.isVisible !== false).length}{' '}
                Active Entries
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Persistence</span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono truncate block">
                Live DB Synced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Bar: Unified Biography Timeline vs Dedicated Table Editors */}
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
            <span>Interactive Biography Timeline ({experiences.length + education.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('experience')}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'experience'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-white/[0.04]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Experience Studio ({experiences.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('education')}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'education'
                ? 'bg-teal-400 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-teal-400 hover:bg-white/[0.04]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education Studio ({education.length})</span>
          </button>
        </div>

        {activeSubTab === 'unified' && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter timeline milestones..."
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
              {(['all', 'experience', 'education'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTimelineFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold capitalize transition-all cursor-pointer ${
                    timelineFilter === f
                      ? 'bg-white/10 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: UNIFIED INTERACTIVE VERTICAL BIOGRAPHY TIMELINE WITH INLINE CRUD */}
      {activeSubTab === 'unified' && (
        <div className="relative pl-7 sm:pl-10 ml-2 sm:ml-4 space-y-6">
          {/* Vertical Glowing Spine */}
          <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-emerald-400 via-teal-500/60 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.6)]" />

          <AnimatePresence mode="popLayout" initial={false}>
          {unifiedTimelineItems.map((item, idx) => {
            const isExpanded = Boolean(expandedKeys[item.key]);

            if (item.type === 'experience') {
              const exp = item.exp;
              const achievements =
                Array.isArray(exp.achievements) && exp.achievements.length > 0
                  ? exp.achievements
                  : [
                      'Architected fault-tolerant Java 21 & Spring Boot 3.4 microservices sustaining high-concurrency production traffic.',
                      'Designed normalized 3NF PostgreSQL/MySQL schemas paired with sub-millisecond Redis cache-aside clusters.',
                      'Spearheaded zero-trust OAuth2/JWT security gateways and automated Docker CI/CD pipelines.',
                    ];
              const technologies =
                Array.isArray(exp.technologies) && exp.technologies.length > 0
                  ? exp.technologies
                  : ['Java 21', 'Spring Boot 3.4', 'Apache Kafka', 'PostgreSQL', 'Redis', 'React 19', 'Docker'];

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
                    exp.isVisible === false
                      ? 'bg-slate-950/50 border-slate-800/70 opacity-65'
                      : exp.isCurrent
                      ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950/95 border-emerald-500/45 shadow-xl'
                      : 'bg-slate-900/75 hover:bg-slate-900/95 border-white/[0.08] hover:border-emerald-500/35 shadow-lg'
                  }`}
                >
                  {/* Timeline Node */}
                  <div className="absolute -left-[37px] sm:-left-[49px] top-6 flex items-center justify-center">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                        exp.isCurrent
                          ? 'bg-slate-950 border-emerald-400 shadow-[0_0_14px_#34d399]'
                          : 'bg-slate-950 border-emerald-500/70'
                      }`}
                    >
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
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span className="text-emerald-400 font-bold">CAREER MILESTONE</span>
                          <span>·</span>
                          <span>
                            {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                          </span>
                          {exp.location && (
                            <>
                              <span>·</span>
                              <span>{exp.location}</span>
                            </>
                          )}
                          {exp.isVisible === false && (
                            <span className="text-amber-400 font-bold">· Hidden Draft</span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                          {exp.role}{' '}
                          <span className="text-emerald-400 font-mono text-sm font-bold">
                            @ {exp.company}
                          </span>
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {exp.description}
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
                        <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => moveExpItem(item.index, 'up')}
                        disabled={item.index === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.06] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveExpItem(item.index, 'down')}
                        disabled={item.index === experiences.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.06] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateExperience({
                            ...exp,
                            isVisible: exp.isVisible === false ? true : false,
                          })
                        }
                        title={exp.isVisible === false ? 'Show on Portfolio' : 'Hide from Portfolio'}
                        className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-white/[0.06] cursor-pointer"
                      >
                        {exp.isVisible === false ? (
                          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditExperienceModal(exp)}
                        title="Edit Milestone"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/[0.08] text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const { id: _, ...rest } = exp;
                          onAddExperience({
                            ...rest,
                            role: `${exp.role} (Copy)`,
                          });
                        }}
                        title="Duplicate Milestone"
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
                              onDeleteExperience(exp.id);
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
                          title="Delete Milestone"
                          className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/[0.06] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Responsibilities & Achievements Drawer */}
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
                              <span>Key Responsibilities & Production Achievements</span>
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {achievements.map((ach, aIdx) => (
                                <li key={aIdx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{ach}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-950/85 border border-white/[0.06] space-y-2.5">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Architecture & Stack
                            </span>
                            <p className="text-xs text-emerald-300 font-mono font-semibold">
                              {exp.impactMetrics || '99.99% SLA · Enterprise Systems'}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {technologies.map((tech, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
                                >
                                  {tech}
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
            } else {
              const edu = item.edu;
              const highlights =
                Array.isArray(edu.academicHighlights) && edu.academicHighlights.length > 0
                  ? edu.academicHighlights
                  : [
                      'Mastered core Computer Science foundations including Data Structures, Algorithms, Operating Systems, and Relational DBMS.',
                      'Built distributed full-stack academic capstone systems with normalized 3NF schemas.',
                    ];
              const coursework =
                Array.isArray(edu.coursework) && edu.coursework.length > 0
                  ? edu.coursework
                  : ['Data Structures & Algorithms', 'OOP with Java', 'DBMS', 'Operating Systems', 'Computer Networks'];

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
                    edu.isVisible === false
                      ? 'bg-slate-950/50 border-slate-800/70 opacity-65'
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
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span className="text-teal-400 font-bold">ACADEMIC CREDENTIAL</span>
                          <span>·</span>
                          <span>
                            {edu.startDate} — {edu.endDate}
                          </span>
                          {edu.grade && (
                            <>
                              <span>·</span>
                              <span className="text-amber-300 font-bold">{edu.grade}</span>
                            </>
                          )}
                          {edu.isVisible === false && (
                            <span className="text-amber-400 font-bold">· Hidden Draft</span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-extrabold text-white">
                          {edu.degree}{' '}
                          <span className="text-teal-300 font-mono text-sm font-semibold">
                            in {edu.fieldOfStudy}
                          </span>
                        </h3>

                        <p className="text-xs font-mono text-slate-300">
                          {edu.institution} {edu.location ? `· ${edu.location}` : ''}
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
                        <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => moveEduItem(item.index, 'up')}
                        disabled={item.index === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.06] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveEduItem(item.index, 'down')}
                        disabled={item.index === education.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.06] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateEducation({
                            ...edu,
                            isVisible: edu.isVisible === false ? true : false,
                          })
                        }
                        title={edu.isVisible === false ? 'Show on Portfolio' : 'Hide from Portfolio'}
                        className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-teal-400 border border-white/[0.06] cursor-pointer"
                      >
                        {edu.isVisible === false ? (
                          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-teal-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditEducationModal(edu)}
                        title="Edit Degree"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-white/[0.08] text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const { id: _, ...rest } = edu;
                          onAddEducation({
                            ...rest,
                            degree: `${edu.degree} (Copy)`,
                          });
                        }}
                        title="Duplicate Degree"
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
                              onDeleteEducation(edu.id);
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
                          title="Delete Degree"
                          className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/[0.06] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Academic Highlights & Coursework Drawer */}
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
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Academic Research, Capstone & Highlights</span>
                            </span>
                            {edu.description && (
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {edu.description}
                              </p>
                            )}
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {highlights.map((hl, hIdx) => (
                                <li key={hIdx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                                  <span>{hl}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-950/85 border border-white/[0.06] space-y-2.5">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                              Core CS Coursework
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {coursework.map((cw, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/25 text-teal-300"
                                >
                                  {cw}
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

          {unifiedTimelineItems.length === 0 && (
            <div className="p-10 rounded-2xl bg-slate-900/50 border border-white/[0.06] text-center space-y-3">
              <Workflow className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No matching biography milestones found</p>
              <p className="text-xs text-slate-400">
                Try clearing your search filter or add a new Career Milestone or Academic Degree above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEDICATED EXPERIENCE STUDIO */}
      {activeSubTab === 'experience' && (
        <ExperiencePage
          experiences={experiences}
          onAdd={onAddExperience}
          onUpdate={onUpdateExperience}
          onDelete={onDeleteExperience}
          onReorder={onReorderExperiences}
        />
      )}

      {/* TAB 3: DEDICATED EDUCATION STUDIO */}
      {activeSubTab === 'education' && (
        <EducationPage
          education={education}
          onAdd={onAddEducation}
          onUpdate={onUpdateEducation}
          onDelete={onDeleteEducation}
          onReorder={onReorderEducation}
        />
      )}

      {/* GLASS-MORPHISM MODAL FOR ADDING/EDITING CAREER EXPERIENCE OR EDUCATION */}
      <AnimatePresence>
        {quickModalType === 'experience' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickModalType(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.form
              onSubmit={handleSaveExperienceModal}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative z-10 w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-slate-900/95 border border-emerald-500/30 p-6 sm:p-7 shadow-2xl space-y-4 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {editingExp ? 'Edit Career Milestone' : 'Add Career Milestone'}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      Persists directly to database and updates the biography timeline
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickModalType(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={expForm.role}
                    onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                    placeholder="e.g., Principal Systems Architect"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    placeholder="e.g., Enterprise Cloud Systems"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={expForm.location}
                    onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Impact / SLA Metric
                  </label>
                  <input
                    type="text"
                    value={expForm.impactMetrics}
                    onChange={(e) => setExpForm({ ...expForm, impactMetrics: e.target.value })}
                    placeholder="e.g., 99.99% SLA · 18.4k+ RPS"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    placeholder="YYYY-MM-DD or Year"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    disabled={expForm.isCurrent}
                    value={expForm.isCurrent ? 'Present' : expForm.endDate}
                    onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    placeholder="YYYY-MM-DD or Present"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white disabled:opacity-50 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expForm.isCurrent}
                    onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked })}
                    className="rounded accent-emerald-500"
                  />
                  <span>Current Active Position</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expForm.isVisible}
                    onChange={(e) => setExpForm({ ...expForm, isVisible: e.target.checked })}
                    className="rounded accent-emerald-500"
                  />
                  <span>Visible on Public Portfolio</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Executive Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Concise overview of engineering scope and architectural ownership..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Detailed Responsibilities & Achievements (One per line)
                </label>
                <textarea
                  rows={4}
                  value={expForm.achievementsText}
                  onChange={(e) => setExpForm({ ...expForm, achievementsText: e.target.value })}
                  placeholder="Architected fault-tolerant Java 21 microservices..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Technologies & Stack (Comma-separated)
                </label>
                <input
                  type="text"
                  value={expForm.technologiesText}
                  onChange={(e) => setExpForm({ ...expForm, technologiesText: e.target.value })}
                  placeholder="Java 21, Spring Boot 3.4, Kafka, PostgreSQL, React 19"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setQuickModalType(null)}
                  className="px-4 py-2 rounded-xl border border-white/[0.08] text-xs font-mono text-slate-300 hover:bg-white/[0.04] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {editingExp ? 'Update Milestone' : 'Save Milestone'}
                </button>
              </div>
            </motion.form>
          </div>
        )}

        {quickModalType === 'education' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickModalType(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.form
              onSubmit={handleSaveEducationModal}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative z-10 w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-slate-900/95 border border-teal-500/30 p-6 sm:p-7 shadow-2xl space-y-4 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {editingEdu ? 'Edit Academic Credential' : 'Add Academic Credential'}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      Persists directly to database and updates the biography timeline
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickModalType(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Degree Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={eduForm.degree}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                    placeholder="e.g., Bachelor of Engineering (B.E.)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Field of Study / Specialization *
                  </label>
                  <input
                    type="text"
                    required
                    value={eduForm.fieldOfStudy}
                    onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                    placeholder="e.g., Computer Science & Engineering"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Institution / University *
                  </label>
                  <input
                    type="text"
                    required
                    value={eduForm.institution}
                    onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                    placeholder="e.g., Anna University"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Grade / CGPA / Honors
                  </label>
                  <input
                    type="text"
                    value={eduForm.grade}
                    onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })}
                    placeholder="e.g., 8.5 CGPA · First Class with Distinction"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Start Date / Year
                  </label>
                  <input
                    type="text"
                    value={eduForm.startDate}
                    onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                    placeholder="e.g., 2018-08-01"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    End Date / Year
                  </label>
                  <input
                    type="text"
                    value={eduForm.endDate}
                    onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })}
                    placeholder="e.g., 2022-05-30"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eduForm.isVisible}
                    onChange={(e) => setEduForm({ ...eduForm, isVisible: e.target.checked })}
                    className="rounded accent-teal-500"
                  />
                  <span>Visible on Public Portfolio</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Academic Overview
                </label>
                <textarea
                  rows={2}
                  value={eduForm.description}
                  onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
                  placeholder="Summary of academic focus, thesis, and engineering foundations..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Academic Achievements & Research Highlights (One per line)
                </label>
                <textarea
                  rows={3}
                  value={eduForm.highlightsText}
                  onChange={(e) => setEduForm({ ...eduForm, highlightsText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Core Coursework Modules (Comma-separated)
                </label>
                <input
                  type="text"
                  value={eduForm.courseworkText}
                  onChange={(e) => setEduForm({ ...eduForm, courseworkText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setQuickModalType(null)}
                  className="px-4 py-2 rounded-xl border border-white/[0.08] text-xs font-mono text-slate-300 hover:bg-white/[0.04] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-lg shadow-teal-500/20"
                >
                  {editingEdu ? 'Update Credential' : 'Save Credential'}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

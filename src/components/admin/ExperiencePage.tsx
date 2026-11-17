import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  Calendar,
  AlertCircle,
  Check,
  Loader2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Copy,
  Eye,
  EyeOff,
  Cpu,
  TrendingUp,
  X,
} from 'lucide-react';
import { ExperienceItem } from '../../data/cmsMockData';

interface ExperiencePageProps {
  experiences: ExperienceItem[];
  onAdd: (exp: Omit<ExperienceItem, 'id'>) => Promise<void>;
  onUpdate: (exp: ExperienceItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onReorder?: (reorderedList: ExperienceItem[]) => Promise<void>;
}

export default function ExperiencePage({
  experiences,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}: ExperiencePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentExp, setCurrentExp] = useState<ExperienceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState(
    'Full-Time · Principal Architecture'
  );
  const [workMode, setWorkMode] = useState('Hybrid');
  const [companyUrl, setCompanyUrl] = useState('');
  const [impactMetrics, setImpactMetrics] = useState(
    '99.99% SLA · 18.4k+ RPS'
  );
  const [architectureRole, setArchitectureRole] = useState(
    'Distributed Microservices & Cloud Architecture'
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [achievementsText, setAchievementsText] = useState('');
  const [technologiesText, setTechnologiesText] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  // Drag & drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const filteredExps = useMemo(() => {
    const list = Array.isArray(experiences) ? experiences : [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        (e?.company || '').toLowerCase().includes(q) ||
        (e?.role || '').toLowerCase().includes(q) ||
        (e?.description || '').toLowerCase().includes(q) ||
        (e?.location || '').toLowerCase().includes(q)
    );
  }, [experiences, searchQuery]);

  // Pagination bounds
  const paginatedExps = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExps.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExps, currentPage]);

  const totalPages = Math.ceil(filteredExps.length / itemsPerPage) || 1;

  const openAddForm = () => {
    setCurrentExp(null);
    setCompany('');
    setRole('');
    setLocation('Bengaluru, India');
    setEmploymentType('Full-Time · Enterprise Engineering');
    setWorkMode('Hybrid');
    setCompanyUrl('');
    setImpactMetrics('99.99% SLA · 18.4k+ RPS');
    setArchitectureRole('Distributed Systems & Full-Stack Architecture');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
    setAchievementsText(
      'Architected fault-tolerant Java 21 & Spring Boot 3.4 microservices sustaining 18.4k+ RPS\nDesigned normalized 3NF PostgreSQL/MySQL schemas paired with sub-millisecond Redis caching\nSpearheaded zero-trust OAuth2/JWT security gateways and automated Docker CI/CD pipelines'
    );
    setTechnologiesText(
      'Java 21, Spring Boot 3.4, Apache Kafka, PostgreSQL, Redis, React 19, TypeScript, Docker'
    );
    setIsVisible(true);
    setDisplayOrder(experiences.length + 1);
    setErrors({});
    setIsEditing(true);
  };

  const openEditForm = (exp: ExperienceItem) => {
    setCurrentExp(exp);
    setCompany(exp.company || '');
    setRole(exp.role || '');
    setLocation(exp.location || '');
    setEmploymentType(
      exp.employmentType || 'Full-Time · Enterprise Engineering'
    );
    setWorkMode(exp.workMode || 'Hybrid');
    setCompanyUrl(exp.companyUrl || '');
    setImpactMetrics(exp.impactMetrics || '99.99% SLA · High Throughput');
    setArchitectureRole(
      exp.architectureRole || 'Enterprise Systems & Cloud Architecture'
    );
    setStartDate(exp.startDate || '');
    setEndDate(exp.endDate || '');
    setIsCurrent(Boolean(exp.isCurrent));
    setDescription(exp.description || '');
    setAchievementsText(
      Array.isArray(exp.achievements) && exp.achievements.length > 0
        ? exp.achievements.join('\n')
        : 'Engineered resilient microservice architectures with Java 21, Spring Boot, and PostgreSQL.\nOrchestrated high-throughput event pipelines and low-latency REST API gateways.\nEnforced zero-downtime CI/CD container deployments via Docker and cloud infrastructure.'
    );
    setTechnologiesText(
      Array.isArray(exp.technologies) && exp.technologies.length > 0
        ? exp.technologies.join(', ')
        : 'Java 21, Spring Boot, PostgreSQL, Redis, React, TypeScript, Docker'
    );
    setIsVisible(exp.isVisible !== false);
    setDisplayOrder(
      exp.displayOrder ??
        exp.order ??
        experiences.findIndex((e) => e.id === exp.id) + 1
    );
    setErrors({});
    setIsEditing(true);
  };

  const handleDuplicate = async (exp: ExperienceItem) => {
    const { id, ...rest } = exp;
    await onAdd({
      ...rest,
      role: `${exp.role} (Copy)`,
      displayOrder: experiences.length + 1,
      order: experiences.length + 1,
    });
  };

  const handleToggleVisibility = async (exp: ExperienceItem) => {
    await onUpdate({
      ...exp,
      isVisible: exp.isVisible === false ? true : false,
    });
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!company.trim()) tempErrors.company = 'Company name is required.';
    if (!role.trim()) tempErrors.role = 'Job title/role is required.';
    if (!location.trim()) tempErrors.location = 'Office location is required.';
    if (!startDate.trim()) tempErrors.startDate = 'Start date is required.';

    if (!isCurrent && !endDate.trim()) {
      tempErrors.endDate =
        'End date is required unless this is your current role.';
    }
    if (!description.trim())
      tempErrors.description = 'Work description is required.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const parsedAchievements = achievementsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const parsedTechnologies = technologiesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const payload: Omit<ExperienceItem, 'id'> = {
      company: company.trim(),
      role: role.trim(),
      location: location.trim(),
      employmentType: employmentType.trim(),
      workMode: workMode.trim(),
      companyUrl: companyUrl.trim(),
      impactMetrics: impactMetrics.trim(),
      architectureRole: architectureRole.trim(),
      startDate: startDate.trim(),
      endDate: isCurrent ? '' : endDate.trim(),
      isCurrent,
      description: description.trim(),
      achievements: parsedAchievements,
      technologies: parsedTechnologies,
      isVisible,
      displayOrder,
      order: displayOrder,
    };

    try {
      if (currentExp) {
        await onUpdate({
          ...payload,
          id: currentExp.id,
        });
      } else {
        await onAdd(payload);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveUp = async (id: number) => {
    if (!onReorder) return;
    const currentIndex = experiences.findIndex((e) => e.id === id);
    if (currentIndex <= 0) return;

    const newList = [...experiences];
    const temp = newList[currentIndex];
    newList[currentIndex] = newList[currentIndex - 1];
    newList[currentIndex - 1] = temp;

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
      order: idx + 1,
    }));
    await onReorder(reordered);
  };

  const handleMoveDown = async (id: number) => {
    if (!onReorder) return;
    const currentIndex = experiences.findIndex((e) => e.id === id);
    if (currentIndex === -1 || currentIndex >= experiences.length - 1) return;

    const newList = [...experiences];
    const temp = newList[currentIndex];
    newList[currentIndex] = newList[currentIndex + 1];
    newList[currentIndex + 1] = temp;

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
      order: idx + 1,
    }));
    await onReorder(reordered);
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    setDragOverId(null);
    if (draggedId === null || draggedId === targetId || !onReorder) {
      setDraggedId(null);
      return;
    }

    const sourceIdx = experiences.findIndex((item) => item.id === draggedId);
    const targetIdx = experiences.findIndex((item) => item.id === targetId);

    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedId(null);
      return;
    }

    const newList = [...experiences];
    const [movedItem] = newList.splice(sourceIdx, 1);
    newList.splice(targetIdx, 0, movedItem);

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
      order: idx + 1,
    }));

    setDraggedId(null);
    await onReorder(reordered);
  };

  return (
    <div className="space-y-6 text-left">
      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                Career Architecture Ledger Editor
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                {currentExp
                  ? `Update Experience: ${currentExp.role} @ ${currentExp.company}`
                  : 'Record New Career Milestone'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel Edit
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Company */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.company ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Enterprise Cloud Systems"
                />
                {errors.company && (
                  <span className="text-[10px] font-mono text-rose-400">
                    {errors.company}
                  </span>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Position / Role Title *
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.role ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Principal Systems Architect"
                />
                {errors.role && (
                  <span className="text-[10px] font-mono text-rose-400">
                    {errors.role}
                  </span>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Office Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 ${
                    errors.location ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Bengaluru, India"
                />
                {errors.location && (
                  <span className="text-[10px] font-mono text-rose-400">
                    {errors.location}
                  </span>
                )}
              </div>

              {/* Employment Type */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Employment Tier / Type
                </label>
                <input
                  type="text"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Full-Time · Principal Architecture"
                />
              </div>

              {/* Work Mode */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Work Mode
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-Site">On-Site</option>
                </select>
              </div>

              {/* Impact Metrics Badge */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Headline SLA / Impact Metric Badge
                </label>
                <input
                  type="text"
                  value={impactMetrics}
                  onChange={(e) => setImpactMetrics(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500/50"
                  placeholder="99.99% SLA · 18.4k+ RPS"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Start Date *
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="YYYY-MM-DD or 2023"
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 ${
                    errors.startDate ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.startDate && (
                  <span className="text-[10px] font-mono text-rose-400">
                    {errors.startDate}
                  </span>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  End Date
                </label>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isCurrent}
                  placeholder={isCurrent ? 'Present (Active Role)' : 'YYYY-MM-DD or 2024'}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 disabled:opacity-45 ${
                    errors.endDate ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.endDate && (
                  <span className="text-[10px] font-mono text-rose-400">
                    {errors.endDate}
                  </span>
                )}
              </div>

              {/* Priority / Display Order */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Display Priority Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) =>
                    setDisplayOrder(parseInt(e.target.value) || 1)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Architecture Domain & Company Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Primary Architecture Domain Focus
                </label>
                <input
                  type="text"
                  value={architectureRole}
                  onChange={(e) => setArchitectureRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Distributed Cloud & Microservices Architecture"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Company Website URL (Optional)
                </label>
                <input
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Toggles Row: Current Role + Portfolio Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-950/60 p-3.5 border border-slate-800 rounded-xl">
                <input
                  id="currentExpCheck"
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => {
                    setIsCurrent(e.target.checked);
                    if (e.target.checked) setEndDate('');
                  }}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 cursor-pointer"
                />
                <label
                  htmlFor="currentExpCheck"
                  className="text-xs font-mono text-slate-300 cursor-pointer select-none"
                >
                  Active / Ongoing Position (Shows pulsing ACTIVE badge)
                </label>
              </div>

              <button
                type="button"
                onClick={() => setIsVisible((prev) => !prev)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  isVisible
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-2 font-bold">
                  {isVisible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  <span>
                    {isVisible
                      ? 'Published on Portfolio Frontend'
                      : 'Hidden / Draft'}
                  </span>
                </span>
                <span className="text-[10px] uppercase">Toggle</span>
              </button>
            </div>

            {/* Executive Summary Description */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400 font-semibold">
                Executive Role Summary *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full bg-slate-950 border rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 leading-relaxed ${
                  errors.description ? 'border-rose-500/50' : 'border-slate-800'
                }`}
                placeholder="Summarize core architectural ownership and business impact..."
              />
              {errors.description && (
                <span className="text-[10px] font-mono text-rose-400">
                  {errors.description}
                </span>
              )}
            </div>

            {/* Key Architectural Deliverables & Technologies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-emerald-400 font-semibold">
                  Key Architectural Deliverables (One bullet per line)
                </label>
                <textarea
                  value={achievementsText}
                  onChange={(e) => setAchievementsText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-mono"
                  placeholder="Architected fault-tolerant Java 21 microservices...&#10;Reduced query latency by 64%..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-cyan-400 font-semibold">
                  Production Tech Stack Chips (Comma-separated)
                </label>
                <textarea
                  value={technologiesText}
                  onChange={(e) => setTechnologiesText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-mono"
                  placeholder="Java 21, Spring Boot 3.4, Apache Kafka, PostgreSQL, Redis, React 19, Docker"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Experience...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>
                      {currentExp ? 'Save Experience Changes' : 'Add Experience'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                placeholder="Search work experiences by role, company, stack..."
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Drag rows or use arrows to reorder</span>
              </div>
              <button
                type="button"
                onClick={openAddForm}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Experience</span>
              </button>
            </div>
          </div>

          {/* List panel */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            {filteredExps.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">
                  No Work Experiences Found
                </h4>
                <p className="text-xs text-slate-500">
                  Click &ldquo;New Experience&rdquo; above to add a career milestone.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                <AnimatePresence mode="popLayout" initial={false}>
                {paginatedExps.map((exp, idx) => {
                  const absoluteIndex = experiences.findIndex(
                    (e) => e.id === exp.id
                  );
                  const isDragging = draggedId === exp.id;
                  const isOver = dragOverId === exp.id;
                  const isConfirmingDelete = confirmDeleteId === exp.id;

                  return (
                    <motion.div
                      key={exp.id}
                      layout
                      initial={{ opacity: 0, x: -28, y: 10, scale: 0.98 }}
                      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      viewport={{ once: false, margin: '-50px' }}
                      exit={{ opacity: 0, x: 32, scale: 0.96 }}
                      transition={{
                        duration: 0.28,
                        delay: Math.min(idx * 0.04, 0.2),
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      draggable={!searchQuery.trim()}
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, exp.id)}
                      onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent<HTMLDivElement>, exp.id)}
                      onDrop={(e) => handleDrop(e as unknown as React.DragEvent<HTMLDivElement>, exp.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      className={`p-4 sm:p-5 flex flex-col lg:flex-row items-start justify-between gap-4 transition-colors ${
                        isDragging
                          ? 'opacity-40 bg-emerald-500/5'
                          : 'hover:bg-slate-950/30'
                      } ${
                        isOver
                          ? 'border-t-2 border-emerald-500 bg-emerald-500/10'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                        {/* Drag & Priority Control Column */}
                        <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-slate-950/80 border border-slate-800/80 rounded-xl p-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(exp.id)}
                            disabled={absoluteIndex <= 0}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors disabled:opacity-20 cursor-pointer"
                            title="Move Priority Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          <div
                            className="flex items-center gap-0.5"
                            title="Display Priority Rank"
                          >
                            <GripVertical className="w-3 h-3 text-slate-600 cursor-grab active:cursor-grabbing" />
                            <span className="text-[10px] font-mono font-bold text-emerald-400 px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              #{absoluteIndex + 1}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleMoveDown(exp.id)}
                            disabled={
                              absoluteIndex === -1 ||
                              absoluteIndex >= experiences.length - 1
                            }
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors disabled:opacity-20 cursor-pointer"
                            title="Move Priority Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
                        </div>

                        <div className="min-w-0 space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-bold text-slate-100">
                              {exp.role}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              @ {exp.company}
                            </span>
                            {exp.isCurrent && (
                              <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-emerald-400 text-slate-950">
                                ACTIVE
                              </span>
                            )}
                            {exp.isVisible === false && (
                              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                Hidden
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3.5 flex-wrap text-[10px] font-mono text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              {exp.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-cyan-400" />
                              {exp.startDate} —{' '}
                              {exp.isCurrent ? 'Present' : exp.endDate}
                            </span>
                            {exp.impactMetrics && (
                              <span className="flex items-center gap-1 text-emerald-300">
                                <TrendingUp className="w-3 h-3" />
                                {exp.impactMetrics}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                            {exp.description}
                          </p>

                          {Array.isArray(exp.technologies) &&
                            exp.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {exp.technologies.slice(0, 6).map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Action Column */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/60 w-full lg:w-auto justify-end flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(exp)}
                          className={`p-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                            exp.isVisible === false
                              ? 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                              : 'bg-slate-950 border-slate-800 text-emerald-400 hover:border-emerald-500/30'
                          }`}
                          title={
                            exp.isVisible === false
                              ? 'Show on Portfolio'
                              : 'Hide from Portfolio'
                          }
                        >
                          {exp.isVisible === false ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(exp)}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/30 hover:text-cyan-400 text-slate-400 transition-all flex items-center gap-1 text-xs font-mono cursor-pointer"
                          title="Duplicate Experience"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditForm(exp)}
                          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/30 hover:text-emerald-400 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer"
                          title="Edit Experience"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/40 rounded-lg px-2 py-1">
                            <span className="text-[10px] font-mono text-rose-300 font-bold">
                              Delete?
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                setConfirmDeleteId(null);
                                await onDelete(exp.id);
                              }}
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-mono font-bold cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="p-1 text-slate-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(exp.id)}
                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/30 hover:text-rose-400 text-slate-400 transition-all flex items-center gap-1 text-xs font-mono cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Showing Page {currentPage} of {totalPages} (
                  {filteredExps.length} total experiences)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

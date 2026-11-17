import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Calendar,
  Award,
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
  MapPin,
  BookOpen,
  X,
} from 'lucide-react';
import { EducationItem } from '../../data/cmsMockData';

interface EducationPageProps {
  education: EducationItem[];
  onAdd: (edu: Omit<EducationItem, 'id'>) => Promise<void>;
  onUpdate: (edu: EducationItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onReorder?: (reorderedList: EducationItem[]) => Promise<void>;
}

export default function EducationPage({
  education,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}: EducationPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdu, setCurrentEdu] = useState<EducationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form states
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [grade, setGrade] = useState('');
  const [honorsBadge, setHonorsBadge] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [capstoneProject, setCapstoneProject] = useState('');
  const [academicHighlightsText, setAcademicHighlightsText] = useState('');
  const [courseworkText, setCourseworkText] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  // Drag & drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter
  const filteredEdus = useMemo(() => {
    const list = Array.isArray(education) ? education : [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        (e?.institution || '').toLowerCase().includes(q) ||
        (e?.degree || '').toLowerCase().includes(q) ||
        (e?.fieldOfStudy || '').toLowerCase().includes(q) ||
        (e?.grade || '').toLowerCase().includes(q)
    );
  }, [education, searchQuery]);

  // Paginated list
  const paginatedEdus = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEdus.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEdus, currentPage]);

  const totalPages = Math.ceil(filteredEdus.length / itemsPerPage) || 1;

  const openAddForm = () => {
    setCurrentEdu(null);
    setInstitution('');
    setDegree('');
    setFieldOfStudy('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setGrade('');
    setHonorsBadge('First Class with Distinction');
    setLocation('India');
    setDescription('');
    setCapstoneProject(
      'Enterprise Distributed Cloud Platform & High-Concurrency Transaction Engine'
    );
    setAcademicHighlightsText(
      'Mastered core computer science foundations including Data Structures, Graph Algorithms, Concurrency, and JVM Memory Internals.\nDesigned normalized relational database engines (3NF/BCNF) and full-stack distributed capstone systems.'
    );
    setCourseworkText(
      'Data Structures & Algorithms, Object-Oriented Architecture (Java), Database Management Systems (DBMS), Operating Systems & Concurrency, Computer Networks, Cloud Computing'
    );
    setIsVisible(true);
    setDisplayOrder(education.length + 1);
    setErrors({});
    setIsEditing(true);
  };

  const openEditForm = (edu: EducationItem) => {
    setCurrentEdu(edu);
    setInstitution(edu.institution || '');
    setDegree(edu.degree || '');
    setFieldOfStudy(edu.fieldOfStudy || '');
    setStartDate(edu.startDate || '');
    setEndDate(edu.endDate || '');
    setIsCurrent(Boolean(edu.isCurrent));
    setGrade(edu.grade || '');
    setHonorsBadge(edu.honorsBadge || edu.grade || 'First Class Honors');
    setLocation(edu.location || 'India');
    setDescription(
      edu.description ||
        `Rigorous academic training in ${edu.fieldOfStudy || 'Computer Science & Engineering'}, focusing on algorithmic complexity, distributed systems architecture, and enterprise software engineering.`
    );
    setCapstoneProject(
      edu.capstoneProject ||
        'Enterprise Distributed Cloud Platform & Relational Database Engine'
    );
    setAcademicHighlightsText(
      Array.isArray(edu.academicHighlights) && edu.academicHighlights.length > 0
        ? edu.academicHighlights.join('\n')
        : 'Mastered core computer science foundations including Data Structures, Graph Algorithms, Concurrency, and JVM Memory Internals.\nDesigned normalized relational database engines (3NF/BCNF) and full-stack distributed capstone systems.'
    );
    setCourseworkText(
      Array.isArray(edu.coursework) && edu.coursework.length > 0
        ? edu.coursework.join(', ')
        : 'Data Structures & Algorithms, Object-Oriented Architecture (Java), Database Management Systems, Operating Systems, Computer Networks'
    );
    setIsVisible(edu.isVisible !== false);
    setDisplayOrder(
      edu.displayOrder ??
        edu.order ??
        education.findIndex((e) => e.id === edu.id) + 1
    );
    setErrors({});
    setIsEditing(true);
  };

  const handleDuplicate = async (edu: EducationItem) => {
    const { id, ...rest } = edu;
    await onAdd({
      ...rest,
      degree: `${edu.degree} (Copy)`,
      displayOrder: education.length + 1,
      order: education.length + 1,
    });
  };

  const handleToggleVisibility = async (edu: EducationItem) => {
    await onUpdate({
      ...edu,
      isVisible: edu.isVisible === false ? true : false,
    });
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!institution.trim())
      tempErrors.institution = 'Academic Institution is required.';
    if (!degree.trim()) tempErrors.degree = 'Degree level is required.';
    if (!fieldOfStudy.trim())
      tempErrors.fieldOfStudy = 'Field of Study is required.';
    if (!startDate.trim()) tempErrors.startDate = 'Start Date is required.';

    if (!isCurrent && !endDate.trim()) {
      tempErrors.endDate = 'End Date is required unless currently studying.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const parsedHighlights = academicHighlightsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const parsedCoursework = courseworkText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const payload: Omit<EducationItem, 'id'> = {
      institution: institution.trim(),
      degree: degree.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      startDate: startDate.trim(),
      endDate: isCurrent ? '' : endDate.trim(),
      isCurrent,
      grade: grade.trim(),
      honorsBadge: honorsBadge.trim() || grade.trim(),
      location: location.trim(),
      description: description.trim(),
      capstoneProject: capstoneProject.trim(),
      academicHighlights: parsedHighlights,
      coursework: parsedCoursework,
      isVisible,
      displayOrder,
      order: displayOrder,
    };

    try {
      if (currentEdu) {
        await onUpdate({
          ...payload,
          id: currentEdu.id,
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
    const currentIndex = education.findIndex((e) => e.id === id);
    if (currentIndex <= 0) return;

    const newList = [...education];
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
    const currentIndex = education.findIndex((e) => e.id === id);
    if (currentIndex === -1 || currentIndex >= education.length - 1) return;

    const newList = [...education];
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

    const sourceIdx = education.findIndex((item) => item.id === draggedId);
    const targetIdx = education.findIndex((item) => item.id === targetId);

    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedId(null);
      return;
    }

    const newList = [...education];
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
              <span className="text-[10px] font-mono tracking-widest text-teal-400 uppercase font-bold">
                Academic Credentials & CS Curriculum Editor
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                {currentEdu
                  ? `Update Credential: ${currentEdu.degree}`
                  : 'Register New Academic Record'}
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
              {/* Institution */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Institution / University Name *
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-teal-500/50 ${
                    errors.institution
                      ? 'border-rose-500/50'
                      : 'border-slate-800'
                  }`}
                  placeholder="e.g. Anna University"
                />
                {errors.institution && (
                  <span className="text-[10px] font-mono text-rose-400">
                    {errors.institution}
                  </span>
                )}
              </div>

              {/* Degree */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Degree Classification *
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-teal-500/50 ${
                    errors.degree ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Bachelor of Engineering (B.E.)"
                />
                {errors.degree && (
                  <span className="text-[10px] font-mono text-rose-400">
                    {errors.degree}
                  </span>
                )}
              </div>

              {/* Field of Study */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Field of Study / Major *
                </label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 ${
                    errors.fieldOfStudy
                      ? 'border-rose-500/50'
                      : 'border-slate-800'
                  }`}
                  placeholder="e.g. Computer Science & Engineering"
                />
                {errors.fieldOfStudy && (
                  <span className="text-[10px] font-mono text-rose-400">
                    {errors.fieldOfStudy}
                  </span>
                )}
              </div>

              {/* Grade / GPA */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Grade / CGPA Score
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
                  placeholder="e.g. CGPA: 8.6 / 10"
                />
              </div>

              {/* Honors Badge */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Honors / Distinction Badge
                </label>
                <input
                  type="text"
                  value={honorsBadge}
                  onChange={(e) => setHonorsBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-teal-500/50"
                  placeholder="First Class with Distinction"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Campus Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
                  placeholder="e.g. Tamil Nadu, India"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Start Date / Year *
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="YYYY-MM-DD or 2019"
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 ${
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
                  Completion Date / Year
                </label>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isCurrent}
                  placeholder={isCurrent ? 'Currently Enrolled' : 'YYYY-MM-DD or 2023'}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 disabled:opacity-45 ${
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
                />
              </div>
            </div>

            {/* Capstone Project */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400 font-semibold">
                Capstone Architecture Project / Thesis Title
              </label>
              <input
                type="text"
                value={capstoneProject}
                onChange={(e) => setCapstoneProject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
                placeholder="Enterprise Distributed Cloud Platform & High-Concurrency Transaction Engine"
              />
            </div>

            {/* Toggles Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-950/60 p-3.5 border border-slate-800 rounded-xl">
                <input
                  id="currentEduCheck"
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => {
                    setIsCurrent(e.target.checked);
                    if (e.target.checked) setEndDate('');
                  }}
                  className="w-4 h-4 rounded text-teal-500 bg-slate-900 border-slate-800 cursor-pointer"
                />
                <label
                  htmlFor="currentEduCheck"
                  className="text-xs font-mono text-slate-300 cursor-pointer select-none"
                >
                  Currently enrolled in these studies
                </label>
              </div>

              <button
                type="button"
                onClick={() => setIsVisible((prev) => !prev)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  isVisible
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
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

            {/* Academic Summary */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400 font-semibold">
                Academic Foundation Summary
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 leading-relaxed"
                placeholder="Summarize core computer science focus, research, and engineering preparation..."
              />
            </div>

            {/* Highlights & Coursework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-teal-400 font-semibold">
                  Academic Highlights & Research (One bullet per line)
                </label>
                <textarea
                  value={academicHighlightsText}
                  onChange={(e) => setAcademicHighlightsText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 leading-relaxed font-mono"
                  placeholder="Mastered Data Structures, Graph Algorithms, and JVM Internals..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-cyan-400 font-semibold">
                  Core CS Coursework Modules (Comma-separated)
                </label>
                <textarea
                  value={courseworkText}
                  onChange={(e) => setCourseworkText(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 leading-relaxed font-mono"
                  placeholder="Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks"
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
                    <span>Saving Credential...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>
                      {currentEdu ? 'Save Education Changes' : 'Add Education'}
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
                placeholder="Search academic credentials, institutions, majors..."
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
                <span>New Academic Record</span>
              </button>
            </div>
          </div>

          {/* List panel */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            {filteredEdus.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">
                  No Education Records Found
                </h4>
                <p className="text-xs text-slate-500">
                  Click &ldquo;New Academic Record&rdquo; above to add a degree.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                <AnimatePresence mode="popLayout" initial={false}>
                {paginatedEdus.map((edu, idx) => {
                  const absoluteIndex = education.findIndex(
                    (e) => e.id === edu.id
                  );
                  const isDragging = draggedId === edu.id;
                  const isOver = dragOverId === edu.id;
                  const isConfirmingDelete = confirmDeleteId === edu.id;

                  return (
                    <motion.div
                      key={edu.id}
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
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, edu.id)}
                      onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent<HTMLDivElement>, edu.id)}
                      onDrop={(e) => handleDrop(e as unknown as React.DragEvent<HTMLDivElement>, edu.id)}
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
                            onClick={() => handleMoveUp(edu.id)}
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
                            onClick={() => handleMoveDown(edu.id)}
                            disabled={
                              absoluteIndex === -1 ||
                              absoluteIndex >= education.length - 1
                            }
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors disabled:opacity-20 cursor-pointer"
                            title="Move Priority Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-teal-400 shrink-0">
                          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
                        </div>

                        <div className="min-w-0 space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-bold text-slate-100">
                              {edu.degree}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                              {edu.institution}
                            </span>
                            {edu.isVisible === false && (
                              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                Hidden
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-mono text-slate-300">
                            Specialization: {edu.fieldOfStudy}
                          </p>

                          <div className="flex items-center gap-3.5 flex-wrap text-[10px] font-mono text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-teal-400" />
                              {edu.startDate} —{' '}
                              {edu.isCurrent ? 'Present' : edu.endDate}
                            </span>
                            {(edu.grade || edu.honorsBadge) && (
                              <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                <Award className="w-3 h-3" />
                                {edu.honorsBadge || edu.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Panel */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/60 w-full lg:w-auto justify-end flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(edu)}
                          className={`p-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                            edu.isVisible === false
                              ? 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                              : 'bg-slate-950 border-slate-800 text-teal-400 hover:border-teal-500/30'
                          }`}
                          title={
                            edu.isVisible === false
                              ? 'Show on Portfolio'
                              : 'Hide from Portfolio'
                          }
                        >
                          {edu.isVisible === false ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(edu)}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/30 hover:text-cyan-400 text-slate-400 transition-all flex items-center gap-1 text-xs font-mono cursor-pointer"
                          title="Duplicate Education Record"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditForm(edu)}
                          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-teal-500/30 hover:text-teal-400 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer"
                          title="Edit Education"
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
                                await onDelete(edu.id);
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
                            onClick={() => setConfirmDeleteId(edu.id)}
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
                  {filteredEdus.length} total credentials)
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

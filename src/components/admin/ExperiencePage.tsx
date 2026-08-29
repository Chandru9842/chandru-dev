import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ArrowLeft, ArrowRight, Briefcase, 
  MapPin, Calendar, AlertCircle, Check, Loader2, GripVertical, ChevronUp, ChevronDown, Sparkles
} from 'lucide-react';
import { ExperienceItem } from '../../data/cmsMockData';

interface ExperiencePageProps {
  experiences: ExperienceItem[];
  onAdd: (exp: Omit<ExperienceItem, 'id'>) => Promise<void>;
  onUpdate: (exp: ExperienceItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onReorder?: (reorderedList: ExperienceItem[]) => Promise<void>;
}

export default function ExperiencePage({ experiences, onAdd, onUpdate, onDelete, onReorder }: ExperiencePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentExp, setCurrentExp] = useState<ExperienceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
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
    return list.filter(e => 
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
    setLocation('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
    setDisplayOrder(experiences.length + 1);
    setErrors({});
    setIsEditing(true);
  };

  const openEditForm = (exp: ExperienceItem) => {
    setCurrentExp(exp);
    setCompany(exp.company);
    setRole(exp.role);
    setLocation(exp.location);
    setStartDate(exp.startDate);
    setEndDate(exp.endDate);
    setIsCurrent(exp.isCurrent);
    setDescription(exp.description);
    setDisplayOrder(exp.displayOrder ?? exp.order ?? (experiences.findIndex(e => e.id === exp.id) + 1));
    setErrors({});
    setIsEditing(true);
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!company.trim()) tempErrors.company = "Company name is required.";
    if (!role.trim()) tempErrors.role = "Job title/role is required.";
    if (!location.trim()) tempErrors.location = "Office location is required.";
    if (!startDate) tempErrors.startDate = "Start date is required.";
    
    if (!isCurrent && !endDate) {
      tempErrors.endDate = "End date is required unless this is your current job.";
    }
    if (!isCurrent && endDate && startDate && new Date(endDate) < new Date(startDate)) {
      tempErrors.endDate = "End date cannot be prior to start date.";
    }

    if (!description.trim()) tempErrors.description = "Work description is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (currentExp) {
        await onUpdate({
          id: currentExp.id,
          company,
          role,
          location,
          startDate,
          endDate: isCurrent ? '' : endDate,
          isCurrent,
          description,
          displayOrder,
          order: displayOrder
        });
      } else {
        await onAdd({
          company,
          role,
          location,
          startDate,
          endDate: isCurrent ? '' : endDate,
          isCurrent,
          description,
          displayOrder,
          order: displayOrder
        });
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
    const currentIndex = experiences.findIndex(e => e.id === id);
    if (currentIndex <= 0) return;
    
    const newList = [...experiences];
    const temp = newList[currentIndex];
    newList[currentIndex] = newList[currentIndex - 1];
    newList[currentIndex - 1] = temp;

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
      order: idx + 1
    }));
    await onReorder(reordered);
  };

  const handleMoveDown = async (id: number) => {
    if (!onReorder) return;
    const currentIndex = experiences.findIndex(e => e.id === id);
    if (currentIndex === -1 || currentIndex >= experiences.length - 1) return;
    
    const newList = [...experiences];
    const temp = newList[currentIndex];
    newList[currentIndex] = newList[currentIndex + 1];
    newList[currentIndex + 1] = temp;

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
      order: idx + 1
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
    if (draggedId === null || draggedId === id) return;
    setDragOverId(id);
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    setDragOverId(null);
    if (draggedId === null || draggedId === targetId || !onReorder) {
      setDraggedId(null);
      return;
    }

    const sourceIdx = experiences.findIndex(item => item.id === draggedId);
    const targetIdx = experiences.findIndex(item => item.id === targetId);

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
      order: idx + 1
    }));

    setDraggedId(null);
    await onReorder(reordered);
  };

  return (
    <div className="space-y-6 text-left">
      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Interactive Form Editor</span>
              <h3 className="text-lg font-bold text-slate-100">
                {currentExp ? "Modify Career Experience" : "Record Career Milestone"}
              </h3>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel Edit
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Company */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Company Name *</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.company ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Acme Corporation"
                />
                {errors.company && <span className="text-[10px] font-mono text-rose-400">{errors.company}</span>}
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Position / Job Title *</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.role ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Lead Full Stack Architect"
                />
                {errors.role && <span className="text-[10px] font-mono text-rose-400">{errors.role}</span>}
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Office Location / Remote *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.location ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Bengaluru, India (Hybrid)"
                />
                {errors.location && <span className="text-[10px] font-mono text-rose-400">{errors.location}</span>}
              </div>

              {/* Priority / Display Order */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Display Priority (Rank / Order)</label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. 1 (Top Priority)"
                />
                <span className="text-[10px] font-mono text-slate-500">Lower numbers appear higher in the portfolio list.</span>
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.startDate ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.startDate && <span className="text-[10px] font-mono text-rose-400">{errors.startDate}</span>}
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isCurrent}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 disabled:opacity-45 ${
                    errors.endDate ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.endDate && <span className="text-[10px] font-mono text-rose-400">{errors.endDate}</span>}
              </div>
            </div>

            {/* Is Current role toggle */}
            <div className="flex items-center gap-3 bg-slate-950/40 p-3.5 border border-slate-800/80 rounded-xl">
              <input
                id="currentExpCheck"
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => {
                  setIsCurrent(e.target.checked);
                  if (e.target.checked) setEndDate('');
                }}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 focus:ring-emerald-500 focus:ring-offset-slate-900 focus:ring-1"
              />
              <label htmlFor="currentExpCheck" className="text-xs font-mono text-slate-300 cursor-pointer select-none">
                I currently hold this role (Ongoing position).
              </label>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400">Key Contributions & Responsibilities *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full bg-slate-950 border rounded-xl p-3.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 leading-relaxed ${
                  errors.description ? 'border-rose-500/50' : 'border-slate-800'
                }`}
                placeholder="Detail architecture highlights, key metrics achieved, and technologies leveraged..."
              />
              {errors.description && <span className="text-[10px] font-mono text-rose-400">{errors.description}</span>}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving Record...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    {currentExp ? "Save Experience" : "Add Experience"}
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
                placeholder="Search work experiences by company or description..."
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Drag rows or use arrows to set priority</span>
              </div>
              <button
                onClick={openAddForm}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                New Experience
              </button>
            </div>
          </div>

          {/* List panel */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            {filteredExps.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300">No Experiences Found</h4>
                <p className="text-xs text-slate-500 mt-1">Populate professional milestones or modify query.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {paginatedExps.map((exp) => {
                  const absoluteIndex = experiences.findIndex(e => e.id === exp.id);
                  const isDragging = draggedId === exp.id;
                  const isOver = dragOverId === exp.id;

                  return (
                    <div 
                      key={exp.id} 
                      draggable={!searchQuery.trim()}
                      onDragStart={(e) => handleDragStart(e, exp.id)}
                      onDragOver={(e) => handleDragOver(e, exp.id)}
                      onDrop={(e) => handleDrop(e, exp.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4 transition-all ${
                        isDragging ? 'opacity-40 bg-emerald-500/5' : 'hover:bg-slate-950/20'
                      } ${isOver ? 'border-t-2 border-emerald-500 bg-emerald-500/10' : ''}`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                        {/* Drag & Priority Control Column */}
                        <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-slate-950/80 border border-slate-800/80 rounded-xl p-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(exp.id)}
                            disabled={absoluteIndex <= 0}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Priority Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-0.5" title="Display Priority Rank">
                            <GripVertical className="w-3 h-3 text-slate-600 cursor-grab active:cursor-grabbing" />
                            <span className="text-[10px] font-mono font-bold text-emerald-400 px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              #{absoluteIndex + 1}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleMoveDown(exp.id)}
                            disabled={absoluteIndex === -1 || absoluteIndex >= experiences.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Priority Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
                        </div>

                        <div className="min-w-0 space-y-1 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-200 truncate">{exp.role}</h4>
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                              {exp.company}
                            </span>
                          </div>

                          <div className="flex items-center gap-3.5 flex-wrap text-[10px] font-mono text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> {exp.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> {exp.startDate} to {exp.isCurrent ? "Present" : exp.endDate}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 pt-2 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                        </div>
                      </div>

                      {/* Action Column */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => openEditForm(exp)}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/25 hover:text-emerald-400 text-slate-400 transition-all flex items-center gap-1 text-xs font-mono"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="sm:hidden">Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete experience record for "${exp.company}"?`)) {
                              onDelete(exp.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/25 hover:text-rose-400 text-slate-400 transition-all flex items-center gap-1 text-xs font-mono"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sm:hidden">Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Showing Page {currentPage} of {totalPages} ({filteredExps.length} total experiences)
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-40 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-40 text-slate-400 hover:text-slate-200 transition-colors"
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

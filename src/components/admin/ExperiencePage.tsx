import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ArrowLeft, ArrowRight, Briefcase, 
  MapPin, Calendar, AlertCircle, Check, Loader2
} from 'lucide-react';
import { ExperienceItem } from '../../data/cmsMockData';

interface ExperiencePageProps {
  experiences: ExperienceItem[];
  onAdd: (exp: Omit<ExperienceItem, 'id'>) => Promise<void>;
  onUpdate: (exp: ExperienceItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function ExperiencePage({ experiences, onAdd, onUpdate, onDelete }: ExperiencePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentExp, setCurrentExp] = useState<ExperienceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const filteredExps = useMemo(() => {
    return experiences.filter(e => 
      e.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
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
          description
        });
      } else {
        await onAdd({
          company,
          role,
          location,
          startDate,
          endDate: isCurrent ? '' : endDate,
          isCurrent,
          description
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Interactive Form Editor</span>
              <h3 className="text-lg font-bold text-slate-100">
                {currentExp ? "Edit Experience details" : "Add Experience Record"}
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
                  placeholder="e.g. Google AI Studio Labs"
                />
                {errors.company && <span className="text-[10px] font-mono text-rose-400">{errors.company}</span>}
              </div>

              {/* Role Title */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Job Title / Role *</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.role ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Senior Full-Stack Architect"
                />
                {errors.role && <span className="text-[10px] font-mono text-rose-400">{errors.role}</span>}
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Location *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.location ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Mountain View, CA (Remote)"
                />
                {errors.location && <span className="text-[10px] font-mono text-rose-400">{errors.location}</span>}
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

            {/* Is Current Role Toggle */}
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
                I currently hold this active workspace role.
              </label>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400">Core Accomplishments / Responsibilities *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                  errors.description ? 'border-rose-500/50' : 'border-slate-800'
                }`}
                placeholder="List major code integrations, team alignments, microservices delivered, or optimizations achieved..."
              />
              {errors.description && <span className="text-[10px] font-mono text-rose-400">{errors.description}</span>}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Committing changes...
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
            
            <button
              onClick={openAddForm}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Experience
            </button>
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
                {paginatedExps.map((exp) => (
                  <div key={exp.id} className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-slate-950/20 transition-all">
                    
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                        <Briefcase className="w-6 h-6 stroke-[1.5]" />
                      </div>

                      <div className="min-w-0 space-y-1">
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
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      <button
                        onClick={() => openEditForm(exp)}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/25 hover:text-emerald-400 text-slate-400 transition-all"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete experience record for "${exp.company}"?`)) {
                            onDelete(exp.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/25 hover:text-rose-400 text-slate-400 transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Showing Page {currentPage} of {totalPages}
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

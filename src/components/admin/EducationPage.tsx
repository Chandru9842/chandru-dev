import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ArrowLeft, ArrowRight, GraduationCap, 
  Calendar, Award, AlertCircle, Check, Loader2
} from 'lucide-react';
import { EducationItem } from '../../data/cmsMockData';

interface EducationPageProps {
  education: EducationItem[];
  onAdd: (edu: Omit<EducationItem, 'id'>) => Promise<void>;
  onUpdate: (edu: EducationItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function EducationPage({ education, onAdd, onUpdate, onDelete }: EducationPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdu, setCurrentEdu] = useState<EducationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form states
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [grade, setGrade] = useState('');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter
  const filteredEdus = useMemo(() => {
    return education.filter(e => 
      e.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.degree.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fieldOfStudy.toLowerCase().includes(searchQuery.toLowerCase())
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
    setErrors({});
    setIsEditing(true);
  };

  const openEditForm = (edu: EducationItem) => {
    setCurrentEdu(edu);
    setInstitution(edu.institution);
    setDegree(edu.degree);
    setFieldOfStudy(edu.fieldOfStudy);
    setStartDate(edu.startDate);
    setEndDate(edu.endDate);
    setIsCurrent(edu.isCurrent);
    setGrade(edu.grade);
    setErrors({});
    setIsEditing(true);
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!institution.trim()) tempErrors.institution = "Academic Institution is required.";
    if (!degree.trim()) tempErrors.degree = "Degree level is required.";
    if (!fieldOfStudy.trim()) tempErrors.fieldOfStudy = "Field of Study is required.";
    if (!startDate) tempErrors.startDate = "Start Date is required.";
    
    if (!isCurrent && !endDate) {
      tempErrors.endDate = "End Date is required unless currently studying.";
    }
    if (!isCurrent && endDate && startDate && new Date(endDate) < new Date(startDate)) {
      tempErrors.endDate = "Completion Date cannot reside prior to start.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (currentEdu) {
        await onUpdate({
          id: currentEdu.id,
          institution,
          degree,
          fieldOfStudy,
          startDate,
          endDate: isCurrent ? '' : endDate,
          isCurrent,
          grade
        });
      } else {
        await onAdd({
          institution,
          degree,
          fieldOfStudy,
          startDate,
          endDate: isCurrent ? '' : endDate,
          isCurrent,
          grade
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
                {currentEdu ? "Edit Academic credentials" : "Register Academic Record"}
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
              {/* Institution */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Institution / University Name *</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.institution ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Stanford University"
                />
                {errors.institution && <span className="text-[10px] font-mono text-rose-400">{errors.institution}</span>}
              </div>

              {/* Degree */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Degree Classification *</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.degree ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Master of Science"
                />
                {errors.degree && <span className="text-[10px] font-mono text-rose-400">{errors.degree}</span>}
              </div>

              {/* Field of Study */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Field of Study / Major *</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.fieldOfStudy ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Computer Science (AI Specialization)"
                />
                {errors.fieldOfStudy && <span className="text-[10px] font-mono text-rose-400">{errors.fieldOfStudy}</span>}
              </div>

              {/* Grade GPA */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Grade / GPA Score</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. GPA: 3.92/4.0"
                />
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
                <label className="block text-xs font-mono text-slate-400">Completion Date</label>
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

            {/* Is Current studies toggle */}
            <div className="flex items-center gap-3 bg-slate-950/40 p-3.5 border border-slate-800/80 rounded-xl">
              <input
                id="currentEduCheck"
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => {
                  setIsCurrent(e.target.checked);
                  if (e.target.checked) setEndDate('');
                }}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 focus:ring-emerald-500 focus:ring-offset-slate-900 focus:ring-1"
              />
              <label htmlFor="currentEduCheck" className="text-xs font-mono text-slate-300 cursor-pointer select-none">
                I am currently enrolled in these studies.
              </label>
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
                    {currentEdu ? "Save Education" : "Add Education"}
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
                placeholder="Search academic milestones..."
              />
            </div>
            
            <button
              onClick={openAddForm}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Academic Record
            </button>
          </div>

          {/* List panel */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            {filteredEdus.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300">No Education Records</h4>
                <p className="text-xs text-slate-500 mt-1">Register degrees, certifications, or adjust query.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {paginatedEdus.map((edu) => (
                  <div key={edu.id} className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-slate-950/20 transition-all">
                    
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                        <GraduationCap className="w-6 h-6 stroke-[1.5]" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-200 truncate">{edu.degree}</h4>
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                            {edu.institution}
                          </span>
                        </div>

                        <p className="text-xs font-mono text-slate-400">{edu.fieldOfStudy}</p>

                        <div className="flex items-center gap-3.5 flex-wrap text-[10px] font-mono text-slate-500 pt-1">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {edu.startDate} to {edu.isCurrent ? "Present" : edu.endDate}
                          </span>
                          {edu.grade && (
                            <span className="flex items-center gap-1 text-amber-400 bg-amber-400/5 px-1.5 rounded border border-amber-400/10">
                              <Award className="w-3 h-3" /> {edu.grade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      <button
                        onClick={() => openEditForm(edu)}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/25 hover:text-emerald-400 text-slate-400 transition-all"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete academic record for "${edu.institution}"?`)) {
                            onDelete(edu.id);
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

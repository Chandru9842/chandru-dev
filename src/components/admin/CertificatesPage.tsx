import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ArrowLeft, ArrowRight, ExternalLink, 
  Award, AlertCircle, Check, Loader2, Calendar, GripVertical, ChevronUp, ChevronDown, Sparkles
} from 'lucide-react';
import { CertificateItem } from '../../data/cmsMockData';

interface CertificatesPageProps {
  certificates: CertificateItem[];
  onAdd: (cert: Omit<CertificateItem, 'id'>) => Promise<void>;
  onUpdate: (cert: CertificateItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onReorder?: (reorderedList: CertificateItem[]) => Promise<void>;
}

export default function CertificatesPage({ certificates, onAdd, onUpdate, onDelete, onReorder }: CertificatesPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentCert, setCurrentCert] = useState<CertificateItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form states
  const [name, setName] = useState('');
  const [issuingOrganization, setIssuingOrganization] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  // Drag & drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter lists
  const filteredCerts = useMemo(() => {
    const list = Array.isArray(certificates) ? certificates : [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(c => 
      (c?.name || '').toLowerCase().includes(q) ||
      (c?.issuingOrganization || '').toLowerCase().includes(q) ||
      (c?.credentialId || '').toLowerCase().includes(q)
    );
  }, [certificates, searchQuery]);

  // Paginated elements
  const paginatedCerts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCerts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCerts, currentPage]);

  const totalPages = Math.ceil(filteredCerts.length / itemsPerPage) || 1;

  const openAddForm = () => {
    setCurrentCert(null);
    setName('');
    setIssuingOrganization('');
    setIssueDate('');
    setExpirationDate('');
    setCredentialId('');
    setCredentialUrl('');
    setDisplayOrder(certificates.length + 1);
    setErrors({});
    setIsEditing(true);
  };

  const openEditForm = (cert: CertificateItem) => {
    setCurrentCert(cert);
    setName(cert.name);
    setIssuingOrganization(cert.issuingOrganization);
    setIssueDate(cert.issueDate);
    setExpirationDate(cert.expirationDate || '');
    setCredentialId(cert.credentialId || '');
    setCredentialUrl(cert.credentialUrl || '');
    setDisplayOrder(cert.displayOrder ?? cert.order ?? (certificates.findIndex(c => c.id === cert.id) + 1));
    setErrors({});
    setIsEditing(true);
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!name.trim()) tempErrors.name = "Certificate title name is required.";
    if (!issuingOrganization.trim()) tempErrors.issuingOrganization = "Issuing organization is required.";
    if (!issueDate) tempErrors.issueDate = "Date of achievement is required.";

    if (credentialUrl.trim()) {
      try {
        const url = new URL(credentialUrl.trim());
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error("Invalid protocol");
        }
      } catch {
        tempErrors.credentialUrl = "Please supply a valid verification website URL.";
      }
    }

    if (expirationDate && issueDate && new Date(expirationDate) < new Date(issueDate)) {
      tempErrors.expirationDate = "Expiration date cannot precede issue date.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (currentCert) {
        await onUpdate({
          id: currentCert.id,
          name,
          issuingOrganization,
          issueDate,
          expirationDate,
          credentialId,
          credentialUrl,
          displayOrder,
          order: displayOrder
        });
      } else {
        await onAdd({
          name,
          issuingOrganization,
          issueDate,
          expirationDate,
          credentialId,
          credentialUrl,
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
    const currentIndex = certificates.findIndex(c => c.id === id);
    if (currentIndex <= 0) return;
    
    const newList = [...certificates];
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
    const currentIndex = certificates.findIndex(c => c.id === id);
    if (currentIndex === -1 || currentIndex >= certificates.length - 1) return;
    
    const newList = [...certificates];
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

    const sourceIdx = certificates.findIndex(item => item.id === draggedId);
    const targetIdx = certificates.findIndex(item => item.id === targetId);

    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedId(null);
      return;
    }

    const newList = [...certificates];
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
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Certifications Studio</span>
              <h3 className="text-lg font-bold text-slate-100">
                {currentCert ? "Modify Certificate" : "Register Certification"}
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
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Certificate Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.name ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. AWS Certified Solutions Architect"
                />
                {errors.name && <span className="text-[10px] font-mono text-rose-400">{errors.name}</span>}
              </div>

              {/* Organization */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Issuing Organization *</label>
                <input
                  type="text"
                  value={issuingOrganization}
                  onChange={(e) => setIssuingOrganization(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.issuingOrganization ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Amazon Web Services"
                />
                {errors.issuingOrganization && <span className="text-[10px] font-mono text-rose-400">{errors.issuingOrganization}</span>}
              </div>

              {/* Credential ID */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Credential ID</label>
                <input
                  type="text"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. AWS-PSA-920492"
                />
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

              {/* Verification URL */}
              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-mono text-slate-400">Verification URL / Credly Link</label>
                <input
                  type="url"
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.credentialUrl ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="https://www.credly.com/badges/..."
                />
                {errors.credentialUrl && <span className="text-[10px] font-mono text-rose-400">{errors.credentialUrl}</span>}
              </div>

              {/* Issue Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Issue Date *</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.issueDate ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.issueDate && <span className="text-[10px] font-mono text-rose-400">{errors.issueDate}</span>}
              </div>

              {/* Expiration Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.expirationDate ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.expirationDate && <span className="text-[10px] font-mono text-rose-400">{errors.expirationDate}</span>}
              </div>
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
                    Saving Certification...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    {currentCert ? "Save Certificate" : "Add Certificate"}
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
                placeholder="Search certificates by title, issuer, or ID..."
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
                New Certificate
              </button>
            </div>
          </div>

          {/* List panel */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            {filteredCerts.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300">No Certificates Found</h4>
                <p className="text-xs text-slate-500 mt-1">Add certification benchmarks or adjust query parameters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {paginatedCerts.map((cert) => {
                  const absoluteIndex = certificates.findIndex(c => c.id === cert.id);
                  const isDragging = draggedId === cert.id;
                  const isOver = dragOverId === cert.id;

                  return (
                    <div 
                      key={cert.id} 
                      draggable={!searchQuery.trim()}
                      onDragStart={(e) => handleDragStart(e, cert.id)}
                      onDragOver={(e) => handleDragOver(e, cert.id)}
                      onDrop={(e) => handleDrop(e, cert.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                        isDragging ? 'opacity-40 bg-emerald-500/5' : 'hover:bg-slate-950/20'
                      } ${isOver ? 'border-t-2 border-emerald-500 bg-emerald-500/10' : ''}`}
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        {/* Drag & Priority Column */}
                        <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-slate-950/80 border border-slate-800/80 rounded-xl p-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(cert.id)}
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
                            onClick={() => handleMoveDown(cert.id)}
                            disabled={absoluteIndex === -1 || absoluteIndex >= certificates.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Priority Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                          <Award className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
                        </div>

                        <div className="min-w-0 space-y-1 flex-1">
                          <h4 className="text-sm font-bold text-slate-200 truncate">{cert.name}</h4>
                          
                          <div className="flex items-center gap-2.5 flex-wrap text-xs text-slate-400">
                            <span className="font-semibold text-emerald-400">{cert.issuingOrganization}</span>
                            <span className="text-slate-600">•</span>
                            <span className="font-mono text-[10px] text-slate-500">ID: {cert.credentialId || "N/A"}</span>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" /> Issued: {cert.issueDate}
                            </span>
                            {cert.expirationDate && (
                              <span>• Expires: {cert.expirationDate}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                        {cert.credentialUrl && (
                          <a 
                            href={cert.credentialUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                            title="Verify Credentials"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => openEditForm(cert)}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/25 hover:text-emerald-400 text-slate-400 transition-all flex items-center gap-1 text-xs font-mono"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="sm:hidden">Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete certificate: "${cert.name}"?`)) {
                              onDelete(cert.id);
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
                  Showing Page {currentPage} of {totalPages} ({filteredCerts.length} total certificates)
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

import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ArrowLeft, ArrowRight, ExternalLink, 
  Award, AlertCircle, Check, Loader2, Calendar, FileText
} from 'lucide-react';
import { CertificateItem } from '../../data/cmsMockData';

interface CertificatesPageProps {
  certificates: CertificateItem[];
  onAdd: (cert: Omit<CertificateItem, 'id'>) => Promise<void>;
  onUpdate: (cert: CertificateItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function CertificatesPage({ certificates, onAdd, onUpdate, onDelete }: CertificatesPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentCert, setCurrentCert] = useState<CertificateItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form states
  const [name, setName] = useState('');
  const [issuingOrganization, setIssuingOrganization] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter lists
  const filteredCerts = useMemo(() => {
    return certificates.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuingOrganization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.credentialId.toLowerCase().includes(searchQuery.toLowerCase())
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
    setErrors({});
    setIsEditing(true);
  };

  const openEditForm = (cert: CertificateItem) => {
    setCurrentCert(cert);
    setName(cert.name);
    setIssuingOrganization(cert.issuingOrganization);
    setIssueDate(cert.issueDate);
    setExpirationDate(cert.expirationDate);
    setCredentialId(cert.credentialId);
    setCredentialUrl(cert.credentialUrl);
    setErrors({});
    setIsEditing(true);
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!name.trim()) tempErrors.name = "Certificate title name is required.";
    if (!issuingOrganization.trim()) tempErrors.issuingOrganization = "Issuing organization is required.";
    if (!issueDate) tempErrors.issueDate = "Date of achievement is required.";

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (credentialUrl && !urlPattern.test(credentialUrl)) {
      tempErrors.credentialUrl = "Please supply a valid verification website URL.";
    }

    if (expirationDate && issueDate && new Date(expirationDate) < new Date(issueDate)) {
      tempErrors.expirationDate = "Expiration date cannot occur prior to issue date.";
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
          credentialUrl
        });
      } else {
        await onAdd({
          name,
          issuingOrganization,
          issueDate,
          expirationDate,
          credentialId,
          credentialUrl
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
                {currentCert ? "Edit Certification details" : "Register Certification Record"}
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
              {/* Certificate Name */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Certification Name / Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.name ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. AWS Solutions Architect Professional"
                />
                {errors.name && <span className="text-[10px] font-mono text-rose-400">{errors.name}</span>}
              </div>

              {/* Issuing Organization */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Issuing Organization *</label>
                <input
                  type="text"
                  value={issuingOrganization}
                  onChange={(e) => setIssuingOrganization(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.issuingOrganization ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Amazon Web Services (AWS)"
                />
                {errors.issuingOrganization && <span className="text-[10px] font-mono text-rose-400">{errors.issuingOrganization}</span>}
              </div>

              {/* Issue Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Date Achieved *</label>
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

              {/* Credential ID */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Credential Reference ID / Serial</label>
                <input
                  type="text"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. AWS-SAP-778912"
                />
              </div>

              {/* Credential URL */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Verification URL</label>
                <input
                  type="text"
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.credentialUrl ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="https://credly.com/verify-credentials"
                />
                {errors.credentialUrl && <span className="text-[10px] font-mono text-rose-400">{errors.credentialUrl}</span>}
              </div>
            </div>

            {/* Actions Bar */}
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
                    {currentCert ? "Save Certificate" : "Register Certificate"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header Action Bar */}
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
                placeholder="Search certifications by name or issuer..."
              />
            </div>
            
            <button
              onClick={openAddForm}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Certificate
            </button>
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
                {paginatedCerts.map((cert) => (
                  <div key={cert.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-950/20 transition-all">
                    
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                        <Award className="w-6 h-6 stroke-[1.5]" />
                      </div>

                      <div className="min-w-0 space-y-1">
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
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
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
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/25 hover:text-emerald-400 text-slate-400 transition-all"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete certificate: "${cert.name}"?`)) {
                            onDelete(cert.id);
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

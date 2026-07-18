import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, UploadCloud, Eye, Download, Trash2, CheckCircle, 
  XCircle, History, RefreshCw, AlertCircle, Calendar, ChevronLeft, 
  ChevronRight, Plus, Edit, ShieldCheck, ToggleLeft, ToggleRight, Search, Filter, HelpCircle
} from 'lucide-react';
import { ResumeItem } from '../../data/cmsMockData';

interface ResumePageProps {
  onTriggerToast: (message: string, type: 'success' | 'error') => void;
  onResumeUpdated?: () => void;
}

export default function ResumePage({ onTriggerToast, onResumeUpdated }: ResumePageProps) {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeItem | null>(null);
  
  // Upload Fields
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadVersion, setUploadVersion] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadIsActive, setUploadIsActive] = useState(false);
  const [uploadIsDownloadEnabled, setUploadIsDownloadEnabled] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Edit Fields
  const [editTitle, setEditTitle] = useState('');
  const [editVersion, setEditVersion] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsDownloadEnabled, setEditIsDownloadEnabled] = useState(true);

  // Confirmation Modals
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<number | null>(null);
  const [confirmActivateId, setConfirmActivateId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('alex_dev_jwt_token') || localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const getJsonHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
  };

  // Fetch resumes
  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resume', {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      } else {
        onTriggerToast('Failed to retrieve resume files.', 'error');
      }
    } catch (e) {
      onTriggerToast('Could not reach backend API pool.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Format File Size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Drag Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    // PDF and DOCX validation
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isAllowed = file.type === 'application/pdf' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                      ext === '.pdf' || 
                      ext === '.docx';
    if (!isAllowed) {
      onTriggerToast('Only PDF and DOCX files are supported.', 'error');
      return;
    }
    // Size limit 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      onTriggerToast('File exceeds maximum size threshold of 10 MB.', 'error');
      return;
    }
    
    setUploadFile(file);
    // Autofill title and version if empty
    if (!uploadTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      setUploadTitle(cleanName);
    }
    if (!uploadVersion) {
      // Look for numbers like 1.2 or v3
      const versionMatch = file.name.match(/(?:v)?(\d+\.\d+(?:\.\d+)?)/i);
      setUploadVersion(versionMatch ? versionMatch[1] : '1.0.0');
    }
  };

  // Upload/Submit Handler (Simulation for Cloudinary integration as requested)
  const handleUploadResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      onTriggerToast('Please select or drop a resume PDF file.', 'error');
      return;
    }
    if (!uploadTitle.trim()) {
      onTriggerToast('Please provide a descriptive Resume Title.', 'error');
      return;
    }
    if (!uploadVersion.trim()) {
      onTriggerToast('Please specify a version tag (e.g. 1.0.0).', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Simulated progress to reflect streaming to Cloudinary and OCR processing
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      // Read file to base64
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(uploadFile);
      });

      clearInterval(interval);
      setUploadProgress(100);

      const payload = {
        title: uploadTitle.trim(),
        version: uploadVersion.trim(),
        description: uploadDescription.trim(),
        fileName: uploadFile.name,
        fileUrl: fileDataUrl, // base64 payload
        fileType: uploadFile.type || (uploadFile.name.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'),
        fileSize: uploadFile.size,
        cloudinaryPublicId: `portfolio/resume/alex_cv_${Date.now()}_${uploadVersion.replace(/\./g, '_')}`,
        thumbnailImage: `https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=260&auto=format&fit=crop`,
        isActive: uploadIsActive,
        isDownloadEnabled: uploadIsDownloadEnabled
      };

      // Slight timeout for UX finish
      await new Promise(resolve => setTimeout(resolve, 400));

      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onTriggerToast(`Uploaded version ${uploadVersion} successfully and synced with Cloudinary CDN.`, 'success');
        setIsUploadOpen(false);
        resetUploadForm();
        fetchResumes();
        onResumeUpdated?.();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || 'Failed to upload resume.', 'error');
      }
    } catch (err: any) {
      onTriggerToast(err.message || 'Error uploading file.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadVersion('');
    setUploadDescription('');
    setUploadFile(null);
    setUploadIsActive(false);
    setUploadIsDownloadEnabled(true);
    setUploadProgress(0);
    setIsUploading(false);
  };

  // Edit Resume Submit Handler
  const handleEditResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResume) return;

    try {
      const res = await fetch(`/api/resume/${selectedResume.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          title: editTitle.trim(),
          version: editVersion.trim(),
          description: editDescription.trim(),
          isDownloadEnabled: editIsDownloadEnabled
        })
      });

      if (res.ok) {
        onTriggerToast('Updated resume metadata successfully.', 'success');
        setIsEditOpen(false);
        setSelectedResume(null);
        fetchResumes();
        onResumeUpdated?.();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || 'Failed to save edits.', 'error');
      }
    } catch (e) {
      onTriggerToast('Error calling update API.', 'error');
    }
  };

  const openEditModal = (resume: ResumeItem) => {
    setSelectedResume(resume);
    setEditTitle(resume.title);
    setEditVersion(resume.version);
    setEditDescription(resume.description);
    setEditIsDownloadEnabled(resume.isDownloadEnabled);
    setIsEditOpen(true);
  };

  // Toggle Download Action
  const handleToggleDownload = async (resume: ResumeItem) => {
    const nextStatus = !resume.isDownloadEnabled;
    try {
      const res = await fetch(`/api/resume/${resume.id}/download`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ isDownloadEnabled: nextStatus })
      });
      if (res.ok) {
        onTriggerToast(`Visitor downloads are now ${nextStatus ? 'ENABLED' : 'DISABLED'} for version ${resume.version}.`, 'success');
        fetchResumes();
        onResumeUpdated?.();
      } else {
        onTriggerToast('Failed to toggle download status.', 'error');
      }
    } catch (e) {
      onTriggerToast('Network error during configuration change.', 'error');
    }
  };

  // Toggle Activation
  const handleActivate = async (id: number) => {
    try {
      const res = await fetch(`/api/resume/${id}/activate`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });
      if (res.ok) {
        onTriggerToast('Successfully activated resume version. All other copies deactivated.', 'success');
        fetchResumes();
        onResumeUpdated?.();
      } else {
        onTriggerToast('Failed to activate resume.', 'error');
      }
    } catch (e) {
      onTriggerToast('Network error during activation.', 'error');
    } finally {
      setConfirmActivateId(null);
    }
  };

  // Delete Action
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        onTriggerToast('Purged resume version draft from SQL storage and Cloudinary CDN.', 'success');
        fetchResumes();
        onResumeUpdated?.();
      } else {
        onTriggerToast('Failed to delete resume draft.', 'error');
      }
    } catch (e) {
      onTriggerToast('Network error during delete action.', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // Restore previous version
  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`/api/resume/${id}/restore`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) {
        const updated = await res.json();
        onTriggerToast(`Restored version ${updated.version} as the active CV.`, 'success');
        fetchResumes();
        onResumeUpdated?.();
      } else {
        onTriggerToast('Failed to restore previous version.', 'error');
      }
    } catch (e) {
      onTriggerToast('Network error during restoration.', 'error');
    } finally {
      setConfirmRestoreId(null);
    }
  };

  // Search & Filter compute
  const filteredResumes = resumes.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'active') return matchesSearch && item.isActive;
    if (filterStatus === 'inactive') return matchesSearch && !item.isActive;
    return matchesSearch;
  });

  // Pagination compute
  const totalPages = Math.ceil(filteredResumes.length / itemsPerPage);
  const paginatedResumes = filteredResumes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Active Resume details
  const activeResume = resumes.find(r => r.isActive);

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Resume & CV Manager
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Publish, version-control, and toggle availability of your professional qualifications. Mapped dynamically to portfolio buttons.
          </p>
        </div>
        
        <button
          onClick={() => {
            resetUploadForm();
            setIsUploadOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer self-start sm:self-auto hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          New Resume CV
        </button>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Active Draft Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Active Document</span>
            <h4 className="text-sm font-bold text-slate-200 mt-0.5 truncate max-w-[200px]">
              {activeResume ? activeResume.title : 'No Active CV'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.2 rounded font-semibold">
                v{activeResume ? activeResume.version : '0.0.0'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {activeResume ? formatBytes(activeResume.fileSize) : '0 KB'}
              </span>
            </div>
          </div>
        </div>

        {/* Total Revisions Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <History className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Version History</span>
            <h4 className="text-sm font-bold text-slate-200 mt-0.5">
              {resumes.length} Total Drafts
            </h4>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">
              All records archived in Local JSON Pool
            </span>
          </div>
        </div>

        {/* Global Security / Sync status */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">CDN & Storage Integration</span>
            <h4 className="text-sm font-bold text-slate-200 mt-0.5">
              Cloudinary Mapped
            </h4>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.2 rounded font-semibold block w-fit mt-1">
              Secure Delivery Protocol
            </span>
          </div>
        </div>

      </div>

      {/* Main active document display (if exists) */}
      {activeResume && (
        <div className="bg-slate-900/20 border border-slate-800/50 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-stretch gap-6">
            
            {/* Visual Thumbnail Preview Container (Lazy Load Simulation) */}
            <div className="w-full lg:w-48 shrink-0 bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center relative group min-h-[220px]">
              <div className="w-full aspect-[3/4] rounded bg-slate-900 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-inner p-2 text-center">
                
                {/* Simulated thumbnail preview lines representing a resume */}
                <div className="absolute inset-x-3 top-3 space-y-1.5 opacity-40">
                  <div className="h-2.5 w-1/2 bg-slate-700 rounded mx-auto" />
                  <div className="h-1.5 w-3/4 bg-slate-800 rounded mx-auto" />
                  <div className="h-0.5 w-full bg-slate-800 rounded mt-2" />
                </div>

                <div className="absolute inset-x-3 top-12 space-y-2 text-left opacity-30">
                  <div className="h-1.5 w-1/4 bg-slate-700 rounded" />
                  <div className="h-1 w-full bg-slate-800 rounded" />
                  <div className="h-1 w-5/6 bg-slate-800 rounded" />
                  <div className="h-1.5 w-1/3 bg-slate-700 rounded mt-1" />
                  <div className="h-1 w-full bg-slate-800 rounded" />
                </div>

                <div className="z-10 bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-xl">
                  <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
                  <span className="text-[10px] font-mono text-slate-300 font-bold block mt-2">ACTIVE CV</span>
                  <span className="text-[8px] font-mono text-slate-500 block mt-0.5 truncate max-w-[120px]">{activeResume.fileName}</span>
                </div>

                {/* Overlay link */}
                <a
                  href={activeResume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                  <Eye className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-mono text-slate-200">Open Live Preview</span>
                </a>
              </div>
              
              <span className="text-[9px] font-mono text-slate-500 mt-2 text-center truncate max-w-[150px]">
                {activeResume.cloudinaryPublicId}
              </span>
            </div>

            {/* Resume Info & Action Console */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-emerald-400 text-slate-950 font-mono text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                    Live Active Version
                  </span>
                  <span className="text-slate-500 text-xs font-mono">•</span>
                  <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Updated {new Date(activeResume.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-100">{activeResume.title}</h3>
                
                <p className="text-slate-400 text-xs leading-relaxed">
                  {activeResume.description || 'No description provided for this version.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase">Version</span>
                    <span className="text-xs font-mono font-bold text-slate-300">{activeResume.version}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase">File Size</span>
                    <span className="text-xs font-mono font-bold text-slate-300">{formatBytes(activeResume.fileSize)}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase">Format</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">PDF</span>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase">Public Access</span>
                    <span className={`text-xs font-mono font-bold ${activeResume.isDownloadEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {activeResume.isDownloadEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Rows */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-900">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setUploadTitle(`Overwrite: ${activeResume.title}`);
                      setUploadVersion(`${parseInt(activeResume.version.split('.')[0]) + 1}.0.0`);
                      setUploadDescription(`Supersedes previous version ${activeResume.version}`);
                      setUploadIsActive(true);
                      setIsUploadOpen(true);
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace CV file
                  </button>
                  <button
                    onClick={() => openEditModal(activeResume)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Info
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Download toggle button */}
                  <button
                    onClick={() => handleToggleDownload(activeResume)}
                    className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {activeResume.isDownloadEnabled ? (
                      <>
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                        <span>Public Download OK</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                        <span>Public Download Disabled</span>
                      </>
                    )}
                  </button>

                  <a
                    href={activeResume.fileUrl}
                    download={activeResume.fileName}
                    className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search resumes by title, version, description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Status:</span>
          
          <div className="flex items-center bg-slate-900 border border-slate-800/80 p-0.5 rounded-xl">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-[10px] font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VERSION TIMELINE HISTORY */}
      <div className="bg-slate-900/10 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-400" />
            Qualification Revisions & Timeline
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Showing {filteredResumes.length} records found
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
            <p className="text-xs font-mono text-slate-500">Connecting to dynamic JPA schemas...</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-400">No Resume records matching filter</h4>
            <p className="text-[10px] text-slate-600 font-mono">Register your credentials or reset filters to begin</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-900">
            {paginatedResumes.map((item, idx) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + idx;
              return (
                <div 
                  key={item.id} 
                  className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/10 transition-colors ${
                    item.isActive ? 'bg-emerald-500/[0.01]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Left Timeline Indicator */}
                    <div className="relative flex flex-col items-center justify-center shrink-0 pt-1">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        item.isActive 
                          ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/20' 
                          : 'bg-slate-950 border-slate-800'
                      }`} />
                      {globalIndex < filteredResumes.length - 1 && (
                        <div className="w-[1px] h-12 bg-slate-850 absolute top-4" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 truncate max-w-[280px]">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded font-bold">
                          v{item.version}
                        </span>
                        
                        {item.isActive && (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono px-1 rounded uppercase font-bold">
                            Active
                          </span>
                        )}
                        {!item.isDownloadEnabled && (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-mono px-1 rounded uppercase font-bold">
                            Hidden
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 truncate max-w-xl">
                        {item.description || 'No description logged.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500">
                        <span>File: <span className="text-slate-400 font-semibold">{item.fileName}</span></span>
                        <span>•</span>
                        <span>Size: <span className="text-slate-400 font-semibold">{formatBytes(item.fileSize)}</span></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Uploaded {new Date(item.uploadedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right controls */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto pl-7 md:pl-0">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-950/40 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    
                    <a
                      href={item.fileUrl}
                      download={item.fileName}
                      className="p-1.5 bg-slate-950/40 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {/* Restore Previous Button */}
                    {!item.isActive && (
                      <button
                        onClick={() => setConfirmRestoreId(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-850 hover:border-slate-700 text-[10px] font-semibold transition-all cursor-pointer"
                        title="Restore this draft"
                      >
                        <RefreshCw className="w-3 h-3 text-amber-500" />
                        Restore
                      </button>
                    )}

                    {/* Activate Button */}
                    {!item.isActive && (
                      <button
                        onClick={() => setConfirmActivateId(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 text-[10px] font-bold transition-all cursor-pointer"
                        title="Activate draft"
                      >
                        Activate
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 bg-slate-950/40 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Edit metadata"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/20 cursor-pointer"
                      title="Purge record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION PANEL */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================================
          UPLOAD NEW RESUME MODAL / PANEL
          ========================================================== */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                Upload New Resume draft
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors font-mono text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadResumeSubmit} className="space-y-4">
              
              {/* Drag & Drop Zone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">PDF FILE ATTACHMENT</label>
                
                {uploadFile ? (
                  <div className="border border-slate-800 rounded-xl bg-slate-950/40 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{uploadFile.name}</p>
                        <p className="text-[9px] font-mono text-slate-500">{formatBytes(uploadFile.size)} • PDF document</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="text-xs font-mono text-rose-400 hover:text-rose-300 border border-rose-500/10 hover:border-rose-500/35 bg-rose-500/5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      dragActive 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-slate-800 bg-slate-950/30 hover:bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <UploadCloud className={`w-8 h-8 transition-transform duration-200 ${dragActive ? 'scale-110 text-emerald-400' : 'text-slate-500'}`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Drag & drop your PDF or DOCX file, or <span className="text-emerald-400">browse</span></p>
                        <p className="text-[10px] text-slate-500 mt-1">Accepts PDF and DOCX documents up to 10 MB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-2 py-1 bg-slate-950/30 border border-slate-800 rounded-xl p-3">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 animate-pulse flex items-center gap-1.5 font-bold">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Uploading & Syncing with Cloudinary...
                    </span>
                    <span className="text-slate-400 font-semibold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Form Input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Resume CV Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Dev - principal Cloud Engineer"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Version tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2.4.1"
                    value={uploadVersion}
                    onChange={(e) => setUploadVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Version changelog & Description</label>
                <textarea
                  placeholder="Summarize the core focus of this draft or describe revisions made..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={uploadIsActive}
                    onChange={(e) => setUploadIsActive(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-805 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                  />
                  Set immediately as ACTIVE Resume
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={uploadIsDownloadEnabled}
                    onChange={(e) => setUploadIsDownloadEnabled(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-805 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                  />
                  Allow Visitor Downloads
                </label>
              </div>

              {/* Submit panel */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-lg border border-slate-850 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isUploading ? 'Syncing to CDN...' : 'Sync & Commit'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          EDIT METADATA MODAL
          ========================================================== */}
      {isEditOpen && selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" />
                Edit Resume details
              </h3>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedResume(null);
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors font-mono text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditResumeSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Resume CV Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Dev - Senior React Lead"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Version tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2.1"
                  value={editVersion}
                  onChange={(e) => setEditVersion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Changelog & Description</label>
                <textarea
                  placeholder="Describe target areas, performance specs..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none pt-1">
                <input
                  type="checkbox"
                  checked={editIsDownloadEnabled}
                  onChange={(e) => setEditIsDownloadEnabled(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-805 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                />
                Allow public download for this version
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedResume(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-lg border border-slate-850 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Save changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          CONFIRM RESTORE MODAL
          ========================================================== */}
      {confirmRestoreId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-sm p-5 text-center space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <RefreshCw className="w-5 h-5 animate-spin-reverse" />
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-100">Restore this Resume version?</h4>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                This will set this older CV version as your active and public profile. The current active version will be deactivated but preserved.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setConfirmRestoreId(null)}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-850 rounded-lg text-xs font-semibold cursor-pointer"
              >
                No, Keep current
              </button>
              <button
                onClick={() => confirmRestoreId !== null && handleRestore(confirmRestoreId)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Yes, Restore CV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          CONFIRM ACTIVATE MODAL
          ========================================================== */}
      {confirmActivateId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-sm p-5 text-center space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-100">Activate this Resume version?</h4>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                This version will immediately replace your current active CV across all public portfolio access points.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setConfirmActivateId(null)}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-850 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmActivateId !== null && handleActivate(confirmActivateId)}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Yes, Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          CONFIRM DELETE MODAL
          ========================================================== */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-sm p-5 text-center space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-100">Purge Resume record?</h4>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete this resume revision? This action will purge the metadata from your databases and is <span className="text-rose-400 font-semibold">irreversible</span>.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-850 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)}
                className="px-4 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Yes, Purge Draft
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

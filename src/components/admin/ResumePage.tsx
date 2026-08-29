import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, UploadCloud, Eye, Download, Trash2, CheckCircle, 
  XCircle, History, RefreshCw, AlertCircle, Calendar, ChevronLeft, 
  ChevronRight, Plus, Edit, ShieldCheck, ToggleLeft, ToggleRight, 
  Search, Filter, ExternalLink, X, ArrowUpRight, Check, HardDrive
} from 'lucide-react';
import { ResumeItem } from '../../data/cmsMockData';
import { notifyCmsUpdate } from '../../utils/notifyCmsSync';

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
  const itemsPerPage = 5;

  // Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeItem | null>(null);
  const [replaceTargetResume, setReplaceTargetResume] = useState<ResumeItem | null>(null);
  const [previewModalResume, setPreviewModalResume] = useState<ResumeItem | null>(null);
  
  // Upload Fields
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadVersion, setUploadVersion] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadIsActive, setUploadIsActive] = useState(true);
  const [uploadIsDownloadEnabled, setUploadIsDownloadEnabled] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Edit Fields
  const [editTitle, setEditTitle] = useState('');
  const [editVersion, setEditVersion] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsDownloadEnabled, setEditIsDownloadEnabled] = useState(true);
  const [editIsActive, setEditIsActive] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editDragActive, setEditDragActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Replace Fields
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceMode, setReplaceMode] = useState<'inplace' | 'new_version'>('inplace');
  const [replaceTitle, setReplaceTitle] = useState('');
  const [replaceVersion, setReplaceVersion] = useState('');
  const [replaceDescription, setReplaceDescription] = useState('');
  const [replaceIsActive, setReplaceIsActive] = useState(true);
  const [replaceIsDownloadEnabled, setReplaceIsDownloadEnabled] = useState(true);
  const [replaceDragActive, setReplaceDragActive] = useState(false);
  const [replaceProgress, setReplaceProgress] = useState(0);
  const [isReplacing, setIsReplacing] = useState(false);

  // Confirmation Modals
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<number | null>(null);
  const [confirmActivateId, setConfirmActivateId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch resumes with cache buster and local document hydration
  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resume?t=${Date.now()}`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        let list: ResumeItem[] = Array.isArray(data) ? data : [];

        // Merge local cache for base64 file attachments
        try {
          const cachedStr = localStorage.getItem('cms_resumes_cache');
          if (cachedStr) {
            const cachedList: ResumeItem[] = JSON.parse(cachedStr);
            if (Array.isArray(cachedList)) {
              list = list.map((item) => {
                const match = cachedList.find(c => c.id === item.id || c.version === item.version);
                if (match && match.fileUrl && match.fileUrl.startsWith('data:')) {
                  return { ...item, fileUrl: match.fileUrl, fileName: match.fileName || item.fileName };
                }
                return item;
              });

              // Also include any new locally uploaded items not yet present
              cachedList.forEach((cachedItem) => {
                if (!list.some(l => l.id === cachedItem.id || l.version === cachedItem.version)) {
                  list.push(cachedItem);
                }
              });
            }
          }
        } catch (err) {}

        setResumes(list);
        const active = list.find(r => r.isActive);
        if (active) {
          try {
            localStorage.setItem('cms_custom_active_resume', JSON.stringify(active));
          } catch (e) {}
        }
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
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Convert File to Base64 data URL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Validate File
  const validateDocFile = (file: File): boolean => {
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isAllowed = file.type === 'application/pdf' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                      ext === '.pdf' || 
                      ext === '.docx';
    if (!isAllowed) {
      onTriggerToast('Only PDF and DOCX documents are supported.', 'error');
      return false;
    }
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      onTriggerToast('File exceeds maximum size threshold of 10 MB.', 'error');
      return false;
    }
    return true;
  };

  // Handle Drag Handlers Generic
  const handleDrag = (e: React.DragEvent, setDrag: (active: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDrag(true);
    } else if (e.type === "dragleave") {
      setDrag(false);
    }
  };

  // Upload File Selection Handler
  const handleUploadFileSelected = (file: File) => {
    if (!validateDocFile(file)) return;
    setUploadFile(file);
    if (!uploadTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      setUploadTitle(cleanName);
    }
    if (!uploadVersion) {
      const versionMatch = file.name.match(/(?:v)?(\d+\.\d+(?:\.\d+)?)/i);
      setUploadVersion(versionMatch ? versionMatch[1] : '2.4.1');
    }
  };

  // Replace File Selection Handler
  const handleReplaceFileSelected = (file: File) => {
    if (!validateDocFile(file)) return;
    setReplaceFile(file);
    if (!replaceTitle && replaceTargetResume) {
      setReplaceTitle(replaceTargetResume.title);
    }
    if (replaceMode === 'new_version' && !replaceVersion && replaceTargetResume) {
      const parts = (replaceTargetResume.version || '1.0').split('.');
      const major = parseInt(parts[0]) || 1;
      const minor = parseInt(parts[1] || '0') + 1;
      setReplaceVersion(`${major}.${minor}.0`);
    }
  };

  // Edit File Selection Handler
  const handleEditFileSelected = (file: File) => {
    if (!validateDocFile(file)) return;
    setEditFile(file);
  };

  // Upload New Resume Form Submit
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
      onTriggerToast('Please specify a version tag (e.g. 2.4.1).', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 85 ? prev : prev + 15));
    }, 100);

    try {
      const fileDataUrl = await readFileAsDataUrl(uploadFile);
      clearInterval(interval);
      setUploadProgress(95);

      const payload = {
        title: uploadTitle.trim(),
        version: uploadVersion.trim(),
        description: uploadDescription.trim(),
        fileName: uploadFile.name,
        fileUrl: fileDataUrl,
        fileType: uploadFile.type || (uploadFile.name.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'),
        fileSize: uploadFile.size,
        cloudinaryPublicId: `portfolio/resume/chandru_mohan_resume_${Date.now()}_${uploadVersion.replace(/\./g, '_')}`,
        thumbnailImage: `https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=260&auto=format&fit=crop`,
        isActive: uploadIsActive,
        isDownloadEnabled: uploadIsDownloadEnabled,
        overwrite: true
      };

      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedData = await res.json();
        setUploadProgress(100);
        
        // Persist to local cache with full dataUrl for immediate availability
        try {
          const itemToCache: ResumeItem = {
            ...savedData,
            fileUrl: fileDataUrl,
            fileName: uploadFile.name,
            fileSize: uploadFile.size
          };
          const cachedStr = localStorage.getItem('cms_resumes_cache');
          let cachedList: ResumeItem[] = cachedStr ? JSON.parse(cachedStr) : [];
          cachedList = cachedList.filter(c => c.id !== itemToCache.id && c.version !== itemToCache.version);
          if (itemToCache.isActive) {
            cachedList.forEach(c => { c.isActive = false; });
            localStorage.setItem('cms_custom_active_resume', JSON.stringify(itemToCache));
          }
          cachedList.unshift(itemToCache);
          localStorage.setItem('cms_resumes_cache', JSON.stringify(cachedList));
        } catch (e) {}

        onTriggerToast(`Uploaded version ${uploadVersion} successfully and published live.`, 'success');
        setIsUploadOpen(false);
        resetUploadForm();
        await fetchResumes();
        notifyCmsUpdate();
        onResumeUpdated?.();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || 'Failed to upload resume.', 'error');
      }
    } catch (err: any) {
      onTriggerToast(err.message || 'Error uploading file.', 'error');
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Open Replace Modal targeting a specific resume
  const handleOpenReplaceModal = (resume: ResumeItem, mode: 'inplace' | 'new_version' = 'inplace') => {
    setReplaceTargetResume(resume);
    setReplaceMode(mode);
    setReplaceFile(null);
    setReplaceTitle(resume.title);
    
    if (mode === 'new_version') {
      const parts = (resume.version || '1.0').split('.');
      const major = parseInt(parts[0]) || 1;
      const minor = parseInt(parts[1] || '0') + 1;
      setReplaceVersion(`${major}.${minor}.0`);
      setReplaceDescription(`Revises previous draft v${resume.version}`);
    } else {
      setReplaceVersion(resume.version);
      setReplaceDescription(resume.description || '');
    }

    setReplaceIsActive(resume.isActive);
    setReplaceIsDownloadEnabled(resume.isDownloadEnabled);
    setIsReplaceOpen(true);
  };

  // Replace Modal Submit Handler
  const handleReplaceResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTargetResume) return;
    if (!replaceFile) {
      onTriggerToast('Please select a new PDF or DOCX file to replace the document.', 'error');
      return;
    }

    setIsReplacing(true);
    setReplaceProgress(25);

    const interval = setInterval(() => {
      setReplaceProgress((prev) => (prev >= 85 ? prev : prev + 15));
    }, 100);

    try {
      const fileDataUrl = await readFileAsDataUrl(replaceFile);
      clearInterval(interval);
      setReplaceProgress(95);

      const payload = {
        title: replaceTitle.trim() || replaceTargetResume.title,
        version: replaceVersion.trim() || replaceTargetResume.version,
        description: replaceDescription.trim(),
        fileName: replaceFile.name,
        fileUrl: fileDataUrl,
        fileType: replaceFile.type || (replaceFile.name.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'),
        fileSize: replaceFile.size,
        cloudinaryPublicId: `portfolio/resume/chandru_mohan_resume_${Date.now()}`,
        isActive: replaceIsActive,
        isDownloadEnabled: replaceIsDownloadEnabled,
        mode: replaceMode
      };

      const res = await fetch(`/api/resume/${replaceTargetResume.id}/replace`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedData = await res.json();
        setReplaceProgress(100);
        
        try {
          const itemToCache: ResumeItem = {
            ...savedData,
            fileUrl: fileDataUrl,
            fileName: replaceFile.name,
            fileSize: replaceFile.size
          };
          const cachedStr = localStorage.getItem('cms_resumes_cache');
          let cachedList: ResumeItem[] = cachedStr ? JSON.parse(cachedStr) : [];
          cachedList = cachedList.filter(c => c.id !== itemToCache.id && c.version !== itemToCache.version);
          if (itemToCache.isActive) {
            cachedList.forEach(c => { c.isActive = false; });
            localStorage.setItem('cms_custom_active_resume', JSON.stringify(itemToCache));
          }
          cachedList.unshift(itemToCache);
          localStorage.setItem('cms_resumes_cache', JSON.stringify(cachedList));
        } catch (e) {}

        onTriggerToast(
          replaceMode === 'new_version'
            ? `Published new revision v${replaceVersion} replacing previous draft.`
            : `Successfully replaced document for v${replaceTargetResume.version}.`,
          'success'
        );
        setIsReplaceOpen(false);
        setReplaceFile(null);
        setReplaceTargetResume(null);
        await fetchResumes();
        notifyCmsUpdate();
        onResumeUpdated?.();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || 'Failed to replace resume document.', 'error');
      }
    } catch (err: any) {
      onTriggerToast(err.message || 'Error processing replacement document.', 'error');
    } finally {
      clearInterval(interval);
      setIsReplacing(false);
      setReplaceProgress(0);
    }
  };

  // Edit Resume Submit Handler (Supports metadata edit AND optional file replacement)
  const handleEditResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResume) return;

    setIsEditing(true);
    try {
      let fileDataUrl: string | undefined = undefined;
      let detectedType: string | undefined = undefined;
      let detectedSize: number | undefined = undefined;
      let detectedName: string | undefined = undefined;

      if (editFile) {
        fileDataUrl = await readFileAsDataUrl(editFile);
        detectedName = editFile.name;
        detectedSize = editFile.size;
        detectedType = editFile.type || (editFile.name.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf');
      }

      const payload: any = {
        title: editTitle.trim(),
        version: editVersion.trim(),
        description: editDescription.trim(),
        isDownloadEnabled: editIsDownloadEnabled,
        isActive: editIsActive
      };

      if (fileDataUrl) {
        payload.fileUrl = fileDataUrl;
        payload.fileName = detectedName;
        payload.fileSize = detectedSize;
        payload.fileType = detectedType;
      }

      const res = await fetch(`/api/resume/${selectedResume.id}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedData = await res.json();
        try {
          const itemToCache: ResumeItem = {
            ...savedData,
            fileUrl: fileDataUrl || selectedResume.fileUrl,
            fileName: detectedName || selectedResume.fileName,
            fileSize: detectedSize || selectedResume.fileSize
          };
          const cachedStr = localStorage.getItem('cms_resumes_cache');
          let cachedList: ResumeItem[] = cachedStr ? JSON.parse(cachedStr) : [];
          cachedList = cachedList.map(c => (c.id === itemToCache.id ? itemToCache : c));
          if (itemToCache.isActive) {
            cachedList.forEach(c => { if (c.id !== itemToCache.id) c.isActive = false; });
            localStorage.setItem('cms_custom_active_resume', JSON.stringify(itemToCache));
          }
          localStorage.setItem('cms_resumes_cache', JSON.stringify(cachedList));
        } catch (e) {}

        onTriggerToast(
          editFile 
            ? 'Updated resume details and replaced attached document successfully.' 
            : 'Updated resume metadata successfully.',
          'success'
        );
        setIsEditOpen(false);
        setSelectedResume(null);
        setEditFile(null);
        await fetchResumes();
        notifyCmsUpdate();
        onResumeUpdated?.();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || 'Failed to save edits.', 'error');
      }
    } catch (e) {
      onTriggerToast('Error calling update API.', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const openEditModal = (resume: ResumeItem) => {
    setSelectedResume(resume);
    setEditTitle(resume.title);
    setEditVersion(resume.version);
    setEditDescription(resume.description || '');
    setEditIsDownloadEnabled(resume.isDownloadEnabled !== false);
    setEditIsActive(resume.isActive);
    setEditFile(null);
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
        onTriggerToast(`Visitor downloads are now ${nextStatus ? 'ENABLED' : 'DISABLED'} for v${resume.version}.`, 'success');
        await fetchResumes();
        notifyCmsUpdate();
        onResumeUpdated?.();
      } else {
        onTriggerToast('Failed to toggle download status.', 'error');
      }
    } catch (e) {
      onTriggerToast('Network error during configuration change.', 'error');
    }
  };

  // Activate Resume Version
  const handleActivate = async (id: number) => {
    try {
      const res = await fetch(`/api/resume/${id}/activate`, {
        method: 'PATCH',
        headers: getJsonHeaders()
      });
      if (res.ok) {
        onTriggerToast('Successfully activated resume version across all portfolio views.', 'success');
        await fetchResumes();
        notifyCmsUpdate();
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
        headers: getJsonHeaders()
      });
      if (res.ok) {
        onTriggerToast('Purged resume version record from storage.', 'success');
        await fetchResumes();
        notifyCmsUpdate();
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
        headers: getJsonHeaders()
      });
      if (res.ok) {
        const updated = await res.json();
        onTriggerToast(`Restored version ${updated.version} as the active primary CV.`, 'success');
        await fetchResumes();
        notifyCmsUpdate();
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

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadVersion('');
    setUploadDescription('');
    setUploadFile(null);
    setUploadIsActive(true);
    setUploadIsDownloadEnabled(true);
    setUploadProgress(0);
    setIsUploading(false);
  };

  // Search & Filter compute
  const filteredResumes = (Array.isArray(resumes) ? resumes : []).filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (item?.title || '').toLowerCase().includes(q) ||
      (item?.version || '').toLowerCase().includes(q) ||
      (item?.description || '').toLowerCase().includes(q) ||
      (item?.fileName || '').toLowerCase().includes(q);

    if (filterStatus === 'active') return matchesSearch && item.isActive;
    if (filterStatus === 'inactive') return matchesSearch && !item.isActive;
    return matchesSearch;
  });

  // Pagination compute
  const totalPages = Math.ceil(filteredResumes.length / itemsPerPage) || 1;
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
            Publish, replace, and version-control your professional qualifications. Synchronized dynamically across portfolio hero and contact access points.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetUploadForm();
              setIsUploadOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer self-start sm:self-auto hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Upload New Resume
          </button>
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Active Draft Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Active Document</span>
            <h4 className="text-sm font-bold text-slate-200 mt-0.5 truncate max-w-[200px]">
              {activeResume ? activeResume.title : 'No Active CV Configured'}
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
              {resumes.length} Total Draft{resumes.length !== 1 ? 's' : ''}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">
              All drafts safely archived in database
            </span>
          </div>
        </div>

        {/* Global Security / Storage status */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Storage & Delivery Protocol</span>
            <h4 className="text-sm font-bold text-slate-200 mt-0.5">
              High-Speed Stream Engine
            </h4>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.2 rounded font-semibold block w-fit mt-1">
              Direct Binary Stream
            </span>
          </div>
        </div>

      </div>

      {/* Main active document display */}
      {activeResume ? (
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-stretch gap-6">
            
            {/* Visual Thumbnail & Live Preview Launcher */}
            <div className="w-full lg:w-48 shrink-0 bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center relative group min-h-[220px]">
              <div className="w-full aspect-[3/4] rounded bg-slate-900 border border-slate-800/90 flex flex-col items-center justify-center relative overflow-hidden shadow-inner p-2 text-center">
                
                {/* Visual document lines */}
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

                <div className="z-10 bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-xl text-center">
                  <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
                  <span className="text-[10px] font-mono text-slate-300 font-bold block mt-2">ACTIVE CV</span>
                  <span className="text-[8px] font-mono text-slate-500 block mt-0.5 truncate max-w-[120px]" title={activeResume.fileName}>
                    {activeResume.fileName}
                  </span>
                </div>

                {/* Overlay trigger for in-app preview modal */}
                <button
                  type="button"
                  onClick={() => setPreviewModalResume(activeResume)}
                  className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                  <Eye className="w-6 h-6 text-emerald-400" />
                  <span className="text-[10px] font-mono text-slate-200 font-semibold">Open Live Preview</span>
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => setPreviewModalResume(activeResume)}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 mt-2 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                Quick Preview
              </button>
            </div>

            {/* Resume Info & Action Console */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-emerald-400 text-slate-950 font-mono text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Live Active Version
                  </span>
                  <span className="text-slate-500 text-xs font-mono">•</span>
                  <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Updated {new Date(activeResume.updatedAt || activeResume.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-100">{activeResume.title}</h3>
                
                <p className="text-slate-400 text-xs leading-relaxed">
                  {activeResume.description || 'Principal Systems Architect CV focusing on Full-Stack Java systems architecture, Spring Boot, Microservices, and React.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Version</span>
                    <span className="text-xs font-mono font-bold text-slate-200">v{activeResume.version}</span>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">File Size</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{formatBytes(activeResume.fileSize)}</span>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Format</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                      {activeResume.fileName.toLowerCase().endsWith('.docx') ? 'DOCX' : 'PDF'}
                    </span>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-900 text-center">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Public Access</span>
                    <span className={`text-xs font-mono font-bold ${activeResume.isDownloadEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {activeResume.isDownloadEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Rows */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-900">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Replace Document Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenReplaceModal(activeResume, 'inplace')}
                    className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace Resume File
                  </button>

                  {/* Edit Metadata Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(activeResume)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Details
                  </button>

                  {/* Live Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewModalResume(activeResume)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Live Preview
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Download toggle button */}
                  <button
                    type="button"
                    onClick={() => handleToggleDownload(activeResume)}
                    className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {activeResume.isDownloadEnabled ? (
                      <>
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                        <span className="hidden sm:inline">Public Download OK</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                        <span className="hidden sm:inline">Download Disabled</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`/api/resume/${activeResume.id}/download?fileName=${encodeURIComponent(activeResume.fileName)}&t=${Date.now()}`}
                    download={activeResume.fileName}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* Empty State Card if no active resume */
        <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Active Resume Configured</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload your resume PDF to automatically bind it to your portfolio hero download and view buttons.
          </p>
          <button
            onClick={() => {
              resetUploadForm();
              setIsUploadOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Upload & Set Active Resume
          </button>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search resumes by title, version, description, file..."
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
            Showing {filteredResumes.length} record{filteredResumes.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
            <p className="text-xs font-mono text-slate-500">Connecting to dynamic storage pool...</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-400">No Resume records matching filter</h4>
            <p className="text-[10px] text-slate-600 font-mono">Upload your document or reset filters to begin</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-900">
            {paginatedResumes.map((item, idx) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + idx;
              return (
                <div 
                  key={item.id} 
                  className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/20 transition-colors ${
                    item.isActive ? 'bg-emerald-500/[0.015]' : ''
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
                            Downloads Hidden
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
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-auto pl-7 md:pl-0">
                    {/* Live Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewModalResume(item)}
                      className="p-1.5 bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                      title="Live Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Download Button */}
                    <a
                      href={`/api/resume/${item.id}/download?fileName=${encodeURIComponent(item.fileName)}&t=${Date.now()}`}
                      download={item.fileName}
                      className="p-1.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {/* Replace Document Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenReplaceModal(item, 'inplace')}
                      className="flex items-center gap-1 px-2 py-1.5 bg-slate-950/60 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                      title="Replace file attachment for this revision"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Replace
                    </button>

                    {/* Restore Previous Button */}
                    {!item.isActive && (
                      <button
                        onClick={() => setConfirmRestoreId(item.id)}
                        className="flex items-center gap-1 px-2 py-1.5 bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 hover:border-slate-700 text-[10px] font-semibold transition-all cursor-pointer"
                        title="Restore this draft"
                      >
                        <History className="w-3 h-3 text-amber-500" />
                        Restore
                      </button>
                    )}

                    {/* Activate Button */}
                    {!item.isActive && (
                      <button
                        onClick={() => setConfirmActivateId(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 text-[10px] font-bold transition-all cursor-pointer"
                        title="Set as Active CV"
                      >
                        Activate
                      </button>
                    )}

                    {/* Edit Metadata Button */}
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Edit metadata & attachment"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Purge / Delete Button */}
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
                className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================================
          DEDICATED REPLACE RESUME FILE MODAL
          ========================================================== */}
      {isReplaceOpen && replaceTargetResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                Replace Resume Document
              </h3>
              <button
                onClick={() => {
                  setIsReplaceOpen(false);
                  setReplaceFile(null);
                  setReplaceTargetResume(null);
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors font-mono text-xs cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReplaceResumeSubmit} className="space-y-4">
              
              {/* Target Resume Summary Banner */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Target Document</span>
                  <span className="font-bold text-slate-200">{replaceTargetResume.title}</span>
                  <span className="text-[10px] font-mono text-emerald-400 ml-2">v{replaceTargetResume.version}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Current: {replaceTargetResume.fileName}</span>
              </div>

              {/* Replacement Mode Selector */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">REPLACEMENT STRATEGY</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReplaceMode('inplace');
                      setReplaceVersion(replaceTargetResume.version);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      replaceMode === 'inplace'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block">In-Place Overwrite</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Replace file in current draft (keeps ID)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReplaceMode('new_version');
                      const parts = (replaceTargetResume.version || '1.0').split('.');
                      const major = parseInt(parts[0]) || 1;
                      const minor = parseInt(parts[1] || '0') + 1;
                      setReplaceVersion(`${major}.${minor}.0`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      replaceMode === 'new_version'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block">Publish New Version</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Create revision & archive previous</span>
                  </button>
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">NEW PDF / DOCX FILE</label>
                
                {replaceFile ? (
                  <div className="border border-emerald-500/30 rounded-xl bg-emerald-500/5 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{replaceFile.name}</p>
                        <p className="text-[9px] font-mono text-emerald-400">{formatBytes(replaceFile.size)} • New Document Ready</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplaceFile(null)}
                      className="text-xs font-mono text-rose-400 hover:text-rose-300 border border-rose-500/20 bg-rose-500/5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={(e) => handleDrag(e, setReplaceDragActive)}
                    onDragOver={(e) => handleDrag(e, setReplaceDragActive)}
                    onDragLeave={(e) => handleDrag(e, setReplaceDragActive)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setReplaceDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleReplaceFileSelected(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => replaceFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      replaceDragActive 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-slate-800 bg-slate-950/30 hover:bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <input
                      ref={replaceFileInputRef}
                      type="file"
                      accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleReplaceFileSelected(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    
                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <UploadCloud className={`w-8 h-8 transition-transform duration-200 ${replaceDragActive ? 'scale-110 text-emerald-400' : 'text-slate-500'}`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-300">Drop your replacement PDF/DOCX here, or <span className="text-emerald-400">browse</span></p>
                        <p className="text-[10px] text-slate-500 mt-1">Accepts PDF & DOCX up to 10 MB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isReplacing && (
                <div className="space-y-2 py-1 bg-slate-950/30 border border-slate-800 rounded-xl p-3">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 animate-pulse flex items-center gap-1.5 font-bold">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Streaming & replacing document payload...
                    </span>
                    <span className="text-slate-400 font-semibold">{replaceProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${replaceProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Version & Title inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Resume CV Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Chandru Mohan - Principal Systems Architect Resume"
                    value={replaceTitle}
                    onChange={(e) => setReplaceTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Version tag</label>
                  <input
                    type="text"
                    required
                    placeholder="2.4.1"
                    value={replaceVersion}
                    onChange={(e) => setReplaceVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Replacement Changelog & Note</label>
                <textarea
                  placeholder="Describe reason for update or revisions made..."
                  value={replaceDescription}
                  onChange={(e) => setReplaceDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={replaceIsActive}
                    onChange={(e) => setReplaceIsActive(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                  />
                  Set as LIVE ACTIVE Resume
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={replaceIsDownloadEnabled}
                    onChange={(e) => setReplaceIsDownloadEnabled(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                  />
                  Allow Visitor Downloads
                </label>
              </div>

              {/* Submit panel */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsReplaceOpen(false);
                    setReplaceFile(null);
                    setReplaceTargetResume(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-lg border border-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReplacing || !replaceFile}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isReplacing ? 'Replacing...' : 'Apply Replacement'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          UPLOAD NEW RESUME MODAL
          ========================================================== */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                Upload New Resume Document
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors font-mono text-xs cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadResumeSubmit} className="space-y-4">
              
              {/* Drag & Drop Zone */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">PDF / DOCX ATTACHMENT</label>
                
                {uploadFile ? (
                  <div className="border border-emerald-500/30 rounded-xl bg-emerald-500/5 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{uploadFile.name}</p>
                        <p className="text-[9px] font-mono text-emerald-400">{formatBytes(uploadFile.size)} • Ready to Publish</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="text-xs font-mono text-rose-400 hover:text-rose-300 border border-rose-500/20 bg-rose-500/5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={(e) => handleDrag(e, setDragActive)}
                    onDragOver={(e) => handleDrag(e, setDragActive)}
                    onDragLeave={(e) => handleDrag(e, setDragActive)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleUploadFileSelected(e.dataTransfer.files[0]);
                      }
                    }}
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
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadFileSelected(e.target.files[0]);
                        }
                      }}
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
                      Ingesting & streaming document...
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
                    placeholder="Chandru Mohan - Principal Systems Architect Resume"
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
                    placeholder="2.4.1"
                    value={uploadVersion}
                    onChange={(e) => setUploadVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Changelog & Description</label>
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
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                  />
                  Set immediately as ACTIVE Resume
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={uploadIsDownloadEnabled}
                    onChange={(e) => setUploadIsDownloadEnabled(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                  />
                  Allow Visitor Downloads
                </label>
              </div>

              {/* Submit panel */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-lg border border-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isUploading ? 'Publishing...' : 'Upload & Publish'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          EDIT METADATA & DOCUMENT MODAL
          ========================================================== */}
      {isEditOpen && selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" />
                Edit Resume Details & Document
              </h3>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedResume(null);
                  setEditFile(null);
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors font-mono text-xs cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditResumeSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Resume CV Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Chandru Mohan - Principal Systems Architect Resume"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Version tag</label>
                  <input
                    type="text"
                    required
                    placeholder="2.4.1"
                    value={editVersion}
                    onChange={(e) => setEditVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Changelog & Description</label>
                <textarea
                  placeholder="Describe target areas, performance specs..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none resize-none"
                />
              </div>

              {/* Optional Document Replacement Dropzone */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  REPLACE ATTACHED DOCUMENT (OPTIONAL)
                </label>
                
                {editFile ? (
                  <div className="border border-emerald-500/30 rounded-xl bg-emerald-500/5 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{editFile.name}</p>
                        <p className="text-[9px] font-mono text-emerald-400">{formatBytes(editFile.size)} • Replacement document attached</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditFile(null)}
                      className="text-[10px] font-mono text-rose-400 hover:text-rose-300 border border-rose-500/20 bg-rose-500/5 px-2 py-1 rounded cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={(e) => handleDrag(e, setEditDragActive)}
                    onDragOver={(e) => handleDrag(e, setEditDragActive)}
                    onDragLeave={(e) => handleDrag(e, setEditDragActive)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleEditFileSelected(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => editFileInputRef.current?.click()}
                    className={`border border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                      editDragActive 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleEditFileSelected(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                      <UploadCloud className="w-4 h-4 text-slate-500" />
                      <span>Current: <strong className="text-slate-300">{selectedResume.fileName}</strong> — <span className="text-emerald-400">browse replacement</span></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                  />
                  Set as Active live resume
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={editIsDownloadEnabled}
                    onChange={(e) => setEditIsDownloadEnabled(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                  />
                  Allow public download for this version
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedResume(null);
                    setEditFile(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-lg border border-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isEditing ? 'Saving...' : 'Save changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          IN-APP LIVE PDF PREVIEW MODAL
          ========================================================== */}
      {previewModalResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-3.5 sm:px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">{previewModalResume.title}</h3>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold shrink-0">
                      v{previewModalResume.version}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">
                    {previewModalResume.fileName} • {formatBytes(previewModalResume.fileSize)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!previewModalResume) return;
                    const fileName = previewModalResume.fileName || 'Resume.pdf';
                    if (previewModalResume.fileUrl && previewModalResume.fileUrl.startsWith('data:')) {
                      try {
                        const commaIndex = previewModalResume.fileUrl.indexOf(',');
                        const base64Data = previewModalResume.fileUrl.substring(commaIndex + 1);
                        const byteCharacters = atob(base64Data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: previewModalResume.fileType || 'application/pdf' });
                        const blobUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = fileName;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
                        onTriggerToast('Downloaded CV document successfully.', 'success');
                        return;
                      } catch (err) {}
                    }
                    const dlUrl = `/api/resume/${previewModalResume.id}/download?fileName=${encodeURIComponent(fileName)}&t=${Date.now()}`;
                    window.open(dlUrl, '_blank');
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!previewModalResume) return;
                    if (previewModalResume.fileUrl && previewModalResume.fileUrl.startsWith('data:')) {
                      try {
                        const commaIndex = previewModalResume.fileUrl.indexOf(',');
                        const base64Data = previewModalResume.fileUrl.substring(commaIndex + 1);
                        const byteCharacters = atob(base64Data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: previewModalResume.fileType || 'application/pdf' });
                        const blobUrl = URL.createObjectURL(blob);
                        window.open(blobUrl, '_blank', 'noopener,noreferrer');
                        return;
                      } catch (err) {}
                    }
                    const viewUrl = `/api/resume/${previewModalResume.id}/file?t=${Date.now()}`;
                    window.open(viewUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewModalResume(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Document Viewer Iframe / Object */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center">
              <iframe
                src={previewModalResume.fileUrl && previewModalResume.fileUrl.startsWith('data:') ? `${previewModalResume.fileUrl}#toolbar=1` : `/api/resume/${previewModalResume.id}/file?t=${Date.now()}#toolbar=1`}
                title={`Live Preview of ${previewModalResume.title}`}
                className="w-full h-full border-0 bg-slate-900"
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const target = previewModalResume;
                    setPreviewModalResume(null);
                    handleOpenReplaceModal(target, 'inplace');
                  }}
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono text-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace This Document
                </button>
              </div>

              <div className="flex items-center gap-2">
                {!previewModalResume.isActive && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = previewModalResume.id;
                      setPreviewModalResume(null);
                      handleActivate(id);
                    }}
                    className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    Set as Active CV
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewModalResume(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================================
          CONFIRM RESTORE MODAL
          ========================================================== */}
      {confirmRestoreId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 text-center space-y-4 shadow-2xl">
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
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 text-center space-y-4 shadow-2xl">
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
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 text-center space-y-4 shadow-2xl">
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
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
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

import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ExternalLink, GitBranch, ArrowLeft, 
  ArrowRight, Sparkles, AlertCircle, Check, Loader2, Image as ImageIcon,
  Film, Layout, Eye, Cpu, Calendar, Clock, ListFilter, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, UploadCloud, X
} from 'lucide-react';
import { ProjectItem } from '../../data/cmsMockData';
import ImageUploader from '../ImageUploader';

interface ProjectsPageProps {
  projects: ProjectItem[];
  onAdd: (project: Omit<ProjectItem, 'id'>) => Promise<void>;
  onUpdate: (project: ProjectItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function ProjectsPage({ projects, onAdd, onUpdate, onDelete }: ProjectsPageProps) {
  // Navigation & edit states
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectItem | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterFeatured, setFilterFeatured] = useState('All');
  const [sortBy, setSortBy] = useState<'displayOrder' | 'date' | 'title'>('displayOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [skillsString, setSkillsString] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // New Enhanced Fields
  const [category, setCategory] = useState('Full-Stack');
  const [status, setStatus] = useState<'Concept' | 'In Development' | 'Completed' | 'Maintained' | 'Archived'>('Completed');
  const [videoUrl, setVideoUrl] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [createdAt, setCreatedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  // Gallery Drag Active state
  const [galleryDragActive, setGalleryDragActive] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available options
  const categories = ['Full-Stack', 'Frontend', 'Backend', 'AI/Data Science', 'Mobile', 'DevOps'];
  const statuses = ['Concept', 'In Development', 'Completed', 'Maintained', 'Archived'];

  // Filter projects dynamically
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.skills.some(s => s.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filterCategory !== 'All') {
      result = result.filter(p => p.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'All') {
      result = result.filter(p => p.status === filterStatus);
    }

    // Featured filter
    if (filterFeatured === 'Featured') {
      result = result.filter(p => p.isFeatured);
    } else if (filterFeatured === 'Standard') {
      result = result.filter(p => !p.isFeatured);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'displayOrder') {
        comparison = (a.displayOrder || 0) - (b.displayOrder || 0);
      } else if (sortBy === 'date') {
        comparison = new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [projects, searchQuery, filterCategory, filterStatus, filterFeatured, sortBy, sortDirection]);

  // Paginated view of projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!currentProject) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const openAddForm = () => {
    setCurrentProject(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setLiveUrl('');
    setGithubUrl('');
    setStartDate('');
    setEndDate('');
    setIsFeatured(false);
    setDisplayOrder(projects.length + 1);
    setSkillsString('');
    setImageUrl('');
    setCategory('Full-Stack');
    setStatus('Completed');
    setVideoUrl('');
    setGallery([]);
    setCreatedAt(new Date().toISOString());
    setUpdatedAt(new Date().toISOString());
    setErrors({});
    setIsEditing(true);
  };

  const openEditForm = (project: ProjectItem) => {
    setCurrentProject(project);
    setTitle(project.title);
    setSlug(project.slug);
    setDescription(project.description);
    setLiveUrl(project.liveUrl || '');
    setGithubUrl(project.githubUrl || '');
    setStartDate(project.startDate || '');
    setEndDate(project.endDate || '');
    setIsFeatured(project.isFeatured || false);
    setDisplayOrder(project.displayOrder || 1);
    setSkillsString((project.skills || []).join(', '));
    setImageUrl(project.imageUrl || '');
    setCategory(project.category || 'Full-Stack');
    setStatus(project.status || 'Completed');
    setVideoUrl(project.videoUrl || '');
    setGallery(project.gallery || []);
    setCreatedAt(project.createdAt || new Date().toISOString());
    setUpdatedAt(project.updatedAt || new Date().toISOString());
    setErrors({});
    setIsEditing(true);
  };

  // Form Validation
  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!title.trim()) tempErrors.title = "Project title is required.";
    if (!slug.trim()) tempErrors.slug = "URL slug path is required.";
    if (!description.trim()) tempErrors.description = "Project description is required.";
    else if (description.length < 15) tempErrors.description = "Description should be at least 15 characters.";
    
    // URL validations
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (liveUrl && !urlPattern.test(liveUrl)) tempErrors.liveUrl = "Enter a valid URL.";
    if (githubUrl && !urlPattern.test(githubUrl)) tempErrors.githubUrl = "Enter a valid GitHub URL.";

    if (!startDate) tempErrors.startDate = "Start date is required.";
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      tempErrors.endDate = "End date cannot be prior to start date.";
    }

    if (!skillsString.trim()) tempErrors.skills = "At least one technology tag is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Client-Side Canvas Multi Image Compression for Gallery
  const compressAndAddGalleryImages = async (files: FileList) => {
    setGalleryUploading(true);
    const compressedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const compressedBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject();
          reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              // Max gallery dimension 800px
              const MAX_DIM = 800;
              if (width > height) {
                if (width > MAX_DIM) {
                  height *= MAX_DIM / width;
                  width = MAX_DIM;
                }
              } else {
                if (height > MAX_DIM) {
                  width *= MAX_DIM / height;
                  height = MAX_DIM;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // compress to jpeg 70%
              } else {
                resolve(e.target?.result as string);
              }
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        });

        compressedUrls.push(compressedBase64);
      } catch (err) {
        console.error("Gallery compression failed:", err);
      }
    }

    setGallery(prev => [...prev, ...compressedUrls]);
    setGalleryUploading(false);
  };

  const handleGalleryDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setGalleryDragActive(true);
    } else if (e.type === "dragleave") {
      setGalleryDragActive(false);
    }
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      compressAndAddGalleryImages(e.dataTransfer.files);
    }
  };

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      compressAndAddGalleryImages(e.target.files);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGallery(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const moveGalleryImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === gallery.length - 1) return;

    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    const updated = [...gallery];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setGallery(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const skills = skillsString.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const payload = {
        title,
        slug,
        description,
        liveUrl,
        githubUrl,
        startDate,
        endDate,
        isFeatured,
        displayOrder: Number(displayOrder),
        skills,
        imageUrl,
        category,
        status,
        videoUrl,
        gallery,
        createdAt: createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (currentProject) {
        await onUpdate({
          ...payload,
          id: currentProject.id
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

  return (
    <div className="space-y-6 text-left" id="projects-page-admin-root">
      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">Relational CMS Editor</span>
              <h3 className="text-lg font-bold text-slate-100">
                {currentProject ? `Update: ${currentProject.title}` : `Create New Portfolio Project Entry`}
              </h3>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel Edit
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Project Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.title ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. AI Financial Forecaster"
                />
                {errors.title && <span className="text-[10px] font-mono text-rose-400">{errors.title}</span>}
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">URL Route Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 ${
                    errors.slug ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.slug && <span className="text-[10px] font-mono text-rose-400">{errors.slug}</span>}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">System Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 font-mono"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Operational Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 font-mono"
                >
                  {statuses.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Start Date *</label>
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
                <label className="block text-xs font-mono text-slate-400 font-semibold">End Date (Empty if current)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.endDate ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.endDate && <span className="text-[10px] font-mono text-rose-400">{errors.endDate}</span>}
              </div>

              {/* Live URL */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Live Systems URL</label>
                <input
                  type="text"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.liveUrl ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="https://deploy.net"
                />
                {errors.liveUrl && <span className="text-[10px] font-mono text-rose-400">{errors.liveUrl}</span>}
              </div>

              {/* GitHub URL */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Repository URL</label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.githubUrl ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="https://github.com/alex/project"
                />
                {errors.githubUrl && <span className="text-[10px] font-mono text-rose-400">{errors.githubUrl}</span>}
              </div>

              {/* Video Embedding URL */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Demo Video Embed URL (YouTube/Vimeo)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                />
              </div>

              {/* Display Order */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Sequence Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  min="1"
                />
              </div>

              {/* Created Timestamp */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Database Creation Date *</label>
                <input
                  type="text"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 font-mono focus:outline-none focus:border-emerald-500/50"
                  placeholder="2026-07-09T04:00:00Z"
                />
              </div>

              {/* Updated Timestamp */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Latest Record Audit Update</label>
                <input
                  type="text"
                  value={updatedAt || new Date().toISOString()}
                  readOnly
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 font-mono select-none"
                  placeholder="Auto assigned"
                />
              </div>
            </div>

            {/* Skills String */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400 font-semibold">Technology Stack Tags (Comma-separated) *</label>
              <input
                type="text"
                value={skillsString}
                onChange={(e) => setSkillsString(e.target.value)}
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                  errors.skills ? 'border-rose-500/50' : 'border-slate-800'
                }`}
                placeholder="React, Spring Boot, MySQL, Cloudinary, Canvas Compression"
              />
              {errors.skills && <span className="text-[10px] font-mono text-rose-400">{errors.skills}</span>}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-400 font-semibold">Detailed Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                  errors.description ? 'border-rose-500/50' : 'border-slate-800'
                }`}
                placeholder="Describe architectural hurdles, database normalization practices, and user experience paradigms achieved..."
              />
              {errors.description && <span className="text-[10px] font-mono text-rose-400">{errors.description}</span>}
            </div>

            {/* Cloudinary Compressed Primary Image */}
            <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                Primary Thumbnail (Auto-compressed)
              </h4>
              <ImageUploader 
                currentUrl={imageUrl}
                onUploadComplete={(url) => setImageUrl(url)}
                onClear={() => setImageUrl('')}
              />
            </div>

            {/* Cloudinary Compressed Multiple Gallery Upload (Drag & Drop + Order sorting) */}
            <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Film className="w-4 h-4 text-emerald-400" />
                    Project Media Gallery
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Drag-and-drop multiple screenshots. Canvas compression scales them down automatically.</p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                  {gallery.length} Images Committed
                </span>
              </div>

              {/* Gallery Drag & Drop Box */}
              <div
                onDragEnter={handleGalleryDrag}
                onDragOver={handleGalleryDrag}
                onDragLeave={handleGalleryDrag}
                onDrop={handleGalleryDrop}
                onClick={() => galleryFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  galleryDragActive
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-slate-800 bg-slate-900/10 hover:bg-slate-900/30 hover:border-slate-700'
                }`}
              >
                <input 
                  type="file"
                  ref={galleryFileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleGalleryFileSelect}
                  className="hidden"
                />
                {galleryUploading ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-2">
                    <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                    <p className="text-xs font-mono text-slate-400">Stream compressing files to Cloudinary delivery paths...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="w-8 h-8 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-300 font-semibold">Drag & drop multiple gallery images here, or <span className="text-emerald-400">browse</span></p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Canvas compress automatically on drop</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Previews list with Sorting Reorder (Left/Right) & Deletion */}
              {gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
                  {gallery.map((imgStr, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-950/60 p-1.5 flex flex-col gap-2">
                      <div className="aspect-video w-full rounded overflow-hidden bg-slate-900">
                        <img 
                          src={imgStr} 
                          alt={`Gallery index ${idx}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveGalleryImage(idx, 'left')}
                            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded transition-colors"
                            title="Move left"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === gallery.length - 1}
                            onClick={() => moveGalleryImage(idx, 'right')}
                            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded transition-colors"
                            title="Move right"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[9px] font-mono text-slate-500">Idx: {idx}</span>

                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="p-1 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 rounded transition-colors border border-rose-500/10"
                          title="Delete image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Switch */}
            <div className="flex items-center gap-3 bg-slate-950/40 p-3.5 border border-slate-800/80 rounded-xl">
              <input
                id="featuredCheck"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 focus:ring-emerald-500 focus:ring-offset-slate-900 focus:ring-1"
              />
              <label htmlFor="featuredCheck" className="text-xs font-mono text-slate-300 cursor-pointer select-none">
                Promote to <span className="text-emerald-400">Featured Showcase</span> on primary portfolio page.
              </label>
            </div>

            {/* Save Buttons */}
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
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Writing Schema...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    {currentProject ? "Save Project Details" : "Publish Project"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Header Toolbar and Rich Filter Parameters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  placeholder="Search projects by title, stack tags, category..."
                />
              </div>
              
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Clear Filters Button */}
                {(filterCategory !== 'All' || filterStatus !== 'All' || filterFeatured !== 'All' || searchQuery !== '') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('All');
                      setFilterStatus('All');
                      setFilterFeatured('All');
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-2 rounded-lg text-xs font-mono border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    Reset Filters
                  </button>
                )}

                <button
                  onClick={openAddForm}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  New Project
                </button>
              </div>
            </div>

            {/* Sub-Filters Panel (Category, Status, Featured, Sort direction) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800/60 text-xs font-mono">
              {/* Category Filter */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Category</span>
                <select
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-medium focus:outline-none text-[11px]"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Status</span>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-medium focus:outline-none text-[11px]"
                >
                  <option value="All">All Statuses</option>
                  {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              {/* Featured Filter */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Showcase</span>
                <select
                  value={filterFeatured}
                  onChange={(e) => { setFilterFeatured(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-medium focus:outline-none text-[11px]"
                >
                  <option value="All">All Projects</option>
                  <option value="Featured">Featured Only</option>
                  <option value="Standard">Standard Only</option>
                </select>
              </div>

              {/* Sort By selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Sort Attribute</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-medium focus:outline-none text-[11px]"
                >
                  <option value="displayOrder">Display Order</option>
                  <option value="date">Start Date</option>
                  <option value="title">Project Title</option>
                </select>
              </div>

              {/* Direction selector */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Direction</span>
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="w-full text-left bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-slate-300 font-medium focus:outline-none flex items-center justify-between text-[11px]"
                >
                  <span>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</span>
                  {sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />}
                </button>
              </div>
            </div>

          </div>

          {/* List display pane */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-9 h-9 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300">No Projects Match Criteria</h4>
                <p className="text-xs text-slate-500 mt-1">Try resetting filters or adjusting search queries.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {paginatedProjects.map((project) => (
                  <div key={project.id} className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:bg-slate-950/25 transition-all">
                    
                    {/* Left details info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-16 h-16 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shrink-0 flex items-center justify-center relative">
                        {project.imageUrl ? (
                          <img 
                            src={project.imageUrl} 
                            alt={project.title} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-700" />
                        )}
                        {project.isFeatured && (
                          <span className="absolute -top-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-slate-900" title="Featured Project" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-200">{project.title}</h4>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 font-semibold">
                            {project.category || 'Full-Stack'}
                          </span>
                          
                          {/* Status Badge */}
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border ${
                            project.status === 'Completed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/15' :
                            project.status === 'In Development' ? 'bg-amber-950/40 text-amber-400 border-amber-500/15' :
                            project.status === 'Concept' ? 'bg-purple-950/40 text-purple-400 border-purple-500/15' :
                            project.status === 'Maintained' ? 'bg-sky-950/40 text-sky-400 border-sky-500/15' :
                            'bg-slate-950/40 text-slate-400 border-slate-500/15'
                          }`}>
                            {project.status || 'Completed'}
                          </span>

                          {project.isFeatured && (
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                              <Sparkles className="w-2.5 h-2.5" /> Featured
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed max-w-3xl">{project.description}</p>
                        
                        <div className="flex items-center gap-3.5 flex-wrap pt-0.5">
                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{project.startDate} to {project.endDate || "Ongoing"}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Seq: {project.displayOrder}</span>
                          </div>

                          {project.gallery && project.gallery.length > 0 && (
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-1.5 rounded">
                              {project.gallery.length} Slides
                            </span>
                          )}

                          {project.videoUrl && (
                            <span className="text-[10px] font-mono text-sky-400 bg-sky-500/5 border border-sky-500/10 px-1.5 rounded flex items-center gap-1">
                              <Film className="w-3 h-3" /> Video Demo
                            </span>
                          )}

                          <div className="flex gap-1.5 flex-wrap">
                            {(project.skills || []).map((skill, index) => (
                              <span key={index} className="text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-800/80 px-1.5 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right action controls */}
                    <div className="flex items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800/60">
                      {project.liveUrl && (
                        <a 
                          href={project.liveUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                          title="View Live Deploy"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a 
                          href={project.githubUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                          title="View Repository"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => openEditForm(project)}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/25 hover:text-emerald-400 text-slate-400 transition-all cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you absolutely sure you want to permanently delete project: "${project.title}"?`)) {
                            onDelete(project.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/25 hover:text-rose-400 text-slate-400 transition-all cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Pagination Panel */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Showing {currentPage} of {totalPages} Pages • {filteredProjects.length} matching rows
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

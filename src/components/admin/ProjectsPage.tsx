import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Search, ExternalLink, GitBranch, ArrowLeft,
  ArrowRight, Sparkles, AlertCircle, Check, Loader2, Image as ImageIcon,
  Film, Eye, EyeOff, Calendar, Clock, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, UploadCloud, X, Folder, GripVertical, ChevronUp, ChevronDown,
  Copy, Sliders, Save
} from 'lucide-react';
import { ProjectItem } from '../../data/cmsMockData';
import ImageUploader from '../ImageUploader';
import MediaLibraryModal from './MediaLibraryModal';
import { notifyCmsUpdate } from '../../utils/notifyCmsSync';

interface ProjectsPageProps {
  projects: ProjectItem[];
  onAdd: (project: Omit<ProjectItem, 'id'>) => Promise<void>;
  onUpdate: (project: ProjectItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onReorder?: (reorderedList: ProjectItem[]) => Promise<void>;
}

function isValidUrl(urlStr: string): boolean {
  if (!urlStr || !urlStr.trim()) return true;
  const trimmed = urlStr.trim();
  if (trimmed.length > 2000) return false;
  try {
    const toTest = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(toTest);
    return Boolean(parsed.hostname && parsed.hostname.includes('.') && parsed.hostname.length > 3);
  } catch {
    return false;
  }
}

export default function ProjectsPage({
  projects,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}: ProjectsPageProps) {
  // Navigation & edit states
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Section Header Customization State (Synced with /api/profile)
  const [showSectionHeaderConfig, setShowSectionHeaderConfig] = useState(false);
  const [projectsBadge, setProjectsBadge] = useState('Featured Engineering Work');
  const [projectsHeading, setProjectsHeading] = useState('Selected Case Studies & Production Systems');
  const [projectsSubtitle, setProjectsSubtitle] = useState(
    'End-to-end cloud architectures, distributed microservices, and interactive full-stack applications.'
  );
  const [savingHeaderConfig, setSavingHeaderConfig] = useState(false);
  const [headerSavedSuccess, setHeaderSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          if (data.projectsBadge !== undefined) setProjectsBadge(data.projectsBadge);
          if (data.projectsHeading !== undefined) setProjectsHeading(data.projectsHeading);
          if (data.projectsSubtitle !== undefined) setProjectsSubtitle(data.projectsSubtitle);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSectionHeader = async () => {
    setSavingHeaderConfig(true);
    setHeaderSavedSuccess(false);
    try {
      const token =
        localStorage.getItem('admin_jwt_token') ||
        sessionStorage.getItem('admin_jwt_token') ||
        '';
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          projectsBadge,
          projectsHeading,
          projectsSubtitle,
        }),
      });
      if (res.ok) {
        notifyCmsUpdate();
        setHeaderSavedSuccess(true);
        setTimeout(() => setHeaderSavedSuccess(false), 2500);
      }
    } catch (e) {
      console.error('Failed to save Projects section header:', e);
    } finally {
      setSavingHeaderConfig(false);
    }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterFeatured, setFilterFeatured] = useState('All');
  const [sortBy, setSortBy] = useState<'displayOrder' | 'date' | 'title'>('displayOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Drag & drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [skillsString, setSkillsString] = useState('');
  const [newSkillTag, setNewSkillTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Developer Portfolio Case Study Fields
  const [category, setCategory] = useState('Full-Stack');
  const [status, setStatus] = useState<'Concept' | 'In Development' | 'Completed' | 'Maintained' | 'Archived'>('Completed');
  const [role, setRole] = useState('');
  const [architectureType, setArchitectureType] = useState('');
  const [metricsBadge, setMetricsBadge] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Array<{ label: string; value: string }>>([]);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [dailyTrafficRps, setDailyTrafficRps] = useState('');
  const [deploymentSuccessRate, setDeploymentSuccessRate] = useState('');
  const [uptimePercentage, setUptimePercentage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [createdAt, setCreatedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  // Gallery Drag Active state
  const [galleryDragActive, setGalleryDragActive] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Media modal picker target
  const [mediaModalTarget, setMediaModalTarget] = useState<'primary' | 'gallery' | null>(null);

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCategories = ['Full-Stack', 'Frontend', 'Backend', 'Cloud & DevOps', 'AI/Data Science', 'Mobile', 'Distributed Systems'];
  const categories = useMemo(() => {
    const custom = projects.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...defaultCategories, ...custom]));
  }, [projects]);
  const statuses = ['Concept', 'In Development', 'Completed', 'Maintained', 'Archived'];

  // Filter projects dynamically
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p?.title || '').toLowerCase().includes(q) ||
          (p?.description || '').toLowerCase().includes(q) ||
          (p?.role || '').toLowerCase().includes(q) ||
          (p?.architectureType || '').toLowerCase().includes(q) ||
          (Array.isArray(p?.skills) && p.skills.some((s) => (s || '').toLowerCase().includes(q))) ||
          ((p?.category || '') && p.category.toLowerCase().includes(q))
      );
    }

    if (filterCategory !== 'All') {
      result = result.filter((p) => p.category === filterCategory);
    }

    if (filterStatus !== 'All') {
      result = result.filter((p) => p.status === filterStatus);
    }

    if (filterFeatured === 'Featured') {
      result = result.filter((p) => p.isFeatured);
    } else if (filterFeatured === 'Standard') {
      result = result.filter((p) => !p.isFeatured);
    }

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

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;

  const handleMoveUp = async (id: number) => {
    if (!onReorder) return;
    const currentIndex = projects.findIndex((p) => p.id === id);
    if (currentIndex <= 0) return;

    const newList = [...projects];
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
    const currentIndex = projects.findIndex((p) => p.id === id);
    if (currentIndex === -1 || currentIndex >= projects.length - 1) return;

    const newList = [...projects];
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

    const sourceIdx = projects.findIndex((item) => item.id === draggedId);
    const targetIdx = projects.findIndex((item) => item.id === targetId);

    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedId(null);
      return;
    }

    const newList = [...projects];
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!currentProject) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const openAddForm = () => {
    setCurrentProject(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setLiveUrl('');
    setGithubUrl('');
    setStartDate(new Date().toISOString().substring(0, 10));
    setEndDate('');
    setIsFeatured(false);
    setIsVisible(true);
    setDisplayOrder(projects.length + 1);
    setSkillsString('');
    setNewSkillTag('');
    setImageUrl('');
    setCategory('Full-Stack');
    setStatus('Completed');
    setRole('');
    setArchitectureType('');
    setMetricsBadge('');
    setHighlights([]);
    setMetrics([]);
    setDeploymentLogs([]);
    setDailyTrafficRps('');
    setDeploymentSuccessRate('');
    setUptimePercentage('');
    setVideoUrl('');
    setGallery([]);
    setCreatedAt(new Date().toISOString());
    setUpdatedAt(new Date().toISOString());
    setErrors({});
    setIsEditing(true);
  };

  const openEditForm = (project: ProjectItem) => {
    setCurrentProject(project);
    setTitle(project.title || '');
    setSlug(project.slug || '');
    setDescription(project.description || '');
    setLiveUrl(project.liveUrl || '');
    setGithubUrl(project.githubUrl || '');
    setStartDate(project.startDate || '');
    setEndDate(project.endDate || '');
    setIsFeatured(Boolean(project.isFeatured));
    setIsVisible(project.isVisible !== false);
    setDisplayOrder(project.displayOrder || 1);
    setSkillsString((project.skills || []).join(', '));
    setNewSkillTag('');
    setImageUrl(project.imageUrl || '');
    setCategory(project.category || 'Full-Stack');
    setStatus(project.status || 'Completed');
    setRole(project.role || '');
    setArchitectureType(project.architectureType || '');
    setMetricsBadge(project.metricsBadge || '');
    setHighlights(Array.isArray(project.highlights) ? [...project.highlights] : []);
    setMetrics(Array.isArray(project.metrics) ? [...project.metrics] : []);
    setDeploymentLogs(Array.isArray(project.deploymentLogs) ? [...project.deploymentLogs] : []);
    setDailyTrafficRps(project.performanceStats?.dailyTrafficRps || '');
    setDeploymentSuccessRate(project.performanceStats?.deploymentSuccessRate || '');
    setUptimePercentage(project.performanceStats?.uptimePercentage || '');
    setVideoUrl(project.videoUrl || '');
    setGallery(Array.isArray(project.gallery) ? [...project.gallery] : []);
    setCreatedAt(project.createdAt || new Date().toISOString());
    setUpdatedAt(project.updatedAt || new Date().toISOString());
    setErrors({});
    setIsEditing(true);
  };

  const handleDuplicateProject = async (project: ProjectItem) => {
    const { id: _unused, ...rest } = project;
    await onAdd({
      ...rest,
      title: `${project.title} (Copy)`,
      slug: `${project.slug}-copy-${Date.now().toString().slice(-4)}`,
      displayOrder: projects.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleQuickToggleFeatured = async (project: ProjectItem) => {
    await onUpdate({
      ...project,
      isFeatured: !project.isFeatured,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleQuickToggleVisible = async (project: ProjectItem) => {
    const currentlyVisible = project.isVisible !== false;
    await onUpdate({
      ...project,
      isVisible: !currentlyVisible,
      updatedAt: new Date().toISOString(),
    });
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!title.trim()) tempErrors.title = 'Project title is required.';
    if (!slug.trim()) tempErrors.slug = 'URL slug path is required.';
    if (!description.trim()) tempErrors.description = 'Project description is required.';

    if (liveUrl && !isValidUrl(liveUrl)) tempErrors.liveUrl = 'Enter a valid URL.';
    if (githubUrl && !isValidUrl(githubUrl)) tempErrors.githubUrl = 'Enter a valid GitHub URL.';

    if (!startDate) tempErrors.startDate = 'Start date is required.';
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      tempErrors.endDate = 'End date cannot be prior to start date.';
    }

    if (!skillsString.trim()) tempErrors.skills = 'At least one technology tag is required.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

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
                resolve(canvas.toDataURL('image/jpeg', 0.7));
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
        console.error('Gallery compression failed:', err);
      }
    }

    setGallery((prev) => [...prev, ...compressedUrls]);
    setGalleryUploading(false);
  };

  const handleGalleryDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setGalleryDragActive(true);
    } else if (e.type === 'dragleave') {
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
    setGallery((prev) => prev.filter((_, idx) => idx !== indexToRemove));
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
    const skills = skillsString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        liveUrl: liveUrl.trim(),
        githubUrl: githubUrl.trim(),
        startDate,
        endDate,
        isFeatured,
        isVisible,
        displayOrder: Number(displayOrder),
        skills,
        imageUrl,
        category: category.trim() || 'Full-Stack',
        status,
        role: role.trim(),
        architectureType: architectureType.trim(),
        metricsBadge: metricsBadge.trim(),
        highlights: highlights.map((h) => h.trim()).filter(Boolean),
        metrics: metrics.filter((m) => m.label.trim() || m.value.trim()),
        deploymentLogs: deploymentLogs.map((l) => l.trim()).filter(Boolean),
        performanceStats: {
          ...(currentProject?.performanceStats || {}),
          dailyTrafficRps: dailyTrafficRps.trim(),
          deploymentSuccessRate: deploymentSuccessRate.trim(),
          uptimePercentage: uptimePercentage.trim(),
        },
        videoUrl: videoUrl.trim(),
        gallery,
        createdAt: createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (currentProject) {
        await onUpdate({
          ...payload,
          id: currentProject.id,
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

  const parsedSkillChips = useMemo(() => {
    return skillsString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [skillsString]);

  return (
    <div className="space-y-6 text-left" id="projects-page-admin-root">
      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                Developer Portfolio Case Study Editor
              </span>
              <h3 className="text-lg font-bold text-slate-100">
                {currentProject
                  ? `Edit Project: ${currentProject.title}`
                  : 'Create New Portfolio Project'}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Core Project Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.title ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. Distributed Payment Gateway"
                />
                {errors.title && (
                  <span className="text-[10px] font-mono text-rose-400">{errors.title}</span>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  URL Route Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 ${
                    errors.slug ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.slug && (
                  <span className="text-[10px] font-mono text-rose-400">{errors.slug}</span>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  System Category *
                </label>
                <input
                  type="text"
                  list="project-category-options"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                  placeholder="e.g. Full-Stack, Backend, Cloud..."
                />
                <datalist id="project-category-options">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Operational Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 font-mono"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.startDate ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.startDate && (
                  <span className="text-[10px] font-mono text-rose-400">{errors.startDate}</span>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  End Date (Empty if Present)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.endDate ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
                {errors.endDate && (
                  <span className="text-[10px] font-mono text-rose-400">{errors.endDate}</span>
                )}
              </div>
            </div>

            {/* Developer Portfolio Role, Architecture & Impact Badges */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Case Study Role, Architecture &amp; Benchmark Badges (Optional)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Leave any field empty to hide it on the portfolio card
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-slate-400">
                      Engineering Role
                    </label>
                    {role && (
                      <button
                        type="button"
                        onClick={() => setRole('')}
                        className="text-[10px] font-mono text-rose-400 hover:text-rose-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g. Principal Architect"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-slate-400">
                      Architecture Pattern
                    </label>
                    {architectureType && (
                      <button
                        type="button"
                        onClick={() => setArchitectureType('')}
                        className="text-[10px] font-mono text-rose-400 hover:text-rose-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={architectureType}
                    onChange={(e) => setArchitectureType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g. Event-Driven Microservices"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-slate-400">
                      Impact / Benchmark Badge
                    </label>
                    {metricsBadge && (
                      <button
                        type="button"
                        onClick={() => setMetricsBadge('')}
                        className="text-[10px] font-mono text-rose-400 hover:text-rose-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={metricsBadge}
                    onChange={(e) => setMetricsBadge(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    placeholder="e.g. <15ms Latency · 99.99% SLA"
                  />
                </div>
              </div>
            </div>

            {/* Links & Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Live URL */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Live Deployment URL
                </label>
                <input
                  type="text"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.liveUrl ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="https://your-live-app.com"
                />
                {errors.liveUrl && (
                  <span className="text-[10px] font-mono text-rose-400">{errors.liveUrl}</span>
                )}
              </div>

              {/* GitHub URL */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.githubUrl ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="https://github.com/Chandru9842/repo"
                />
                {errors.githubUrl && (
                  <span className="text-[10px] font-mono text-rose-400">{errors.githubUrl}</span>
                )}
              </div>

              {/* Video Embedding URL */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Demo Video Embed URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>

              {/* Display Order */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Display Priority Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                  min="1"
                />
              </div>
            </div>

            {/* Interactive Technology Stack Tags */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-slate-300 font-semibold">
                  Technology Stack Tags (Comma-separated or add below) *
                </label>
                {skillsString && (
                  <button
                    type="button"
                    onClick={() => setSkillsString('')}
                    className="text-[10px] font-mono text-rose-400 hover:text-rose-300"
                  >
                    Clear All Tags
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={skillsString}
                  onChange={(e) => setSkillsString(e.target.value)}
                  className={`flex-1 bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.skills ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="Java 21, Spring Boot, React, MySQL, Docker, AWS"
                />
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newSkillTag}
                    onChange={(e) => setNewSkillTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSkillTag.trim()) {
                        e.preventDefault();
                        const next = [...parsedSkillChips, newSkillTag.trim()];
                        setSkillsString(next.join(', '));
                        setNewSkillTag('');
                      }
                    }}
                    placeholder="Quick add tag..."
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 w-36"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSkillTag.trim()) return;
                      const next = [...parsedSkillChips, newSkillTag.trim()];
                      setSkillsString(next.join(', '));
                      setNewSkillTag('');
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
              {errors.skills && (
                <span className="text-[10px] font-mono text-rose-400">{errors.skills}</span>
              )}

              {parsedSkillChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {parsedSkillChips.map((chip, idx) => (
                    <span
                      key={`${chip}-${idx}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono"
                    >
                      {chip}
                      <button
                        type="button"
                        onClick={() => {
                          const remaining = parsedSkillChips.filter((_, i) => i !== idx);
                          setSkillsString(remaining.join(', '));
                        }}
                        className="text-slate-400 hover:text-rose-400 font-bold"
                        title={`Remove ${chip}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-slate-400 font-semibold">
                  Case Study Summary &amp; Architecture Description *
                </label>
                {description && (
                  <button
                    type="button"
                    onClick={() => setDescription('')}
                    className="text-[10px] font-mono text-rose-400 hover:text-rose-300"
                  >
                    Clear Description
                  </button>
                )}
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                  errors.description ? 'border-rose-500/50' : 'border-slate-800'
                }`}
                placeholder="Describe the engineering problem, system architecture, and outcomes..."
              />
              {errors.description && (
                <span className="text-[10px] font-mono text-rose-400">{errors.description}</span>
              )}
            </div>

            {/* Key Engineering Highlights Builder (Add / Edit / Delete Bullet Points) */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-200">
                    Key Engineering Highlights &amp; Outcomes ({highlights.length})
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500">
                    Add, edit, or delete bullet points displayed in the project card and case study modal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHighlights((prev) => [...prev, ''])}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Highlight
                </button>
              </div>

              {highlights.length > 0 && (
                <div className="space-y-2">
                  {highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-400 w-6 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={hl}
                        onChange={(e) => {
                          const next = [...highlights];
                          next[idx] = e.target.value;
                          setHighlights(next);
                        }}
                        placeholder="e.g. Reduced p99 API latency by 45% using Redis read-through caching"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                        title="Delete Highlight"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Project Metrics Builder (Add / Edit / Delete Metric Pairs) */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-200">
                    Custom Project Metrics ({metrics.length})
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500">
                    Add custom key-value metrics (e.g. Throughput: 15k RPS) shown on the project card.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMetrics((prev) => [...prev, { label: '', value: '' }])}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Metric
                </button>
              </div>

              {metrics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800"
                    >
                      <input
                        type="text"
                        value={m.label}
                        onChange={(e) => {
                          const next = [...metrics];
                          next[idx] = { ...m, label: e.target.value };
                          setMetrics(next);
                        }}
                        placeholder="Label (e.g. Latency)"
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                      />
                      <input
                        type="text"
                        value={m.value}
                        onChange={(e) => {
                          const next = [...metrics];
                          next[idx] = { ...m, value: e.target.value };
                          setMetrics(next);
                        }}
                        placeholder="Value (e.g. <12ms)"
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setMetrics(metrics.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                        title="Delete Metric"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simulated Deployment Log Builder (Optional - Shown in Expanded 3D Project Spotlight) */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-200">
                    Spotlight Deployment Pipeline Log ({deploymentLogs.length})
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500">
                    Customize the simulated Deployment Log lines shown when a user expands this project in the 3D Project Spotlight gallery (leave empty to auto-generate from project stack &amp; status).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeploymentLogs((prev) => [...prev, ''])}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Log Step
                </button>
              </div>

              {deploymentLogs.length > 0 && (
                <div className="space-y-2">
                  {deploymentLogs.map((logLine, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-emerald-400 w-10 text-right shrink-0">
                        step #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={logLine}
                        onChange={(e) => {
                          const next = [...deploymentLogs];
                          next[idx] = e.target.value;
                          setDeploymentLogs(next);
                        }}
                        placeholder="e.g. [BUILD] Compiled Spring Boot 3.4 image & verified health checks (0 errors)"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDeploymentLogs(deploymentLogs.filter((_, i) => i !== idx))
                        }
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                        title="Remove Log Step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* D3.js Project Performance Dashboard Overrides (Optional) */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-mono font-bold text-emerald-400">
                    D3.js Project Performance Dashboard KPIs (Optional)
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500">
                    Customize the headline values for the D3.js Traffic, Deployment Success Rate, and Uptime Trend charts inside the Project Spotlight card (leave blank to auto-calculate).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">
                    Simulated Traffic Peak / RPS
                  </label>
                  <input
                    type="text"
                    value={dailyTrafficRps}
                    onChange={(e) => setDailyTrafficRps(e.target.value)}
                    placeholder="e.g. 14.8k req/min"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">
                    Deployment Success Rate
                  </label>
                  <input
                    type="text"
                    value={deploymentSuccessRate}
                    onChange={(e) => setDeploymentSuccessRate(e.target.value)}
                    placeholder="e.g. 99.4%"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">
                    SLA Uptime Trend
                  </label>
                  <input
                    type="text"
                    value={uptimePercentage}
                    onChange={(e) => setUptimePercentage(e.target.value)}
                    placeholder="e.g. 99.98%"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Primary Thumbnail */}
            <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Primary Project Cover Image
                </h4>
                <button
                  type="button"
                  onClick={() => setMediaModalTarget('primary')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Folder className="w-3.5 h-3.5" />
                  Select from Media Library
                </button>
              </div>
              <ImageUploader
                currentUrl={imageUrl}
                onUploadComplete={(url) => setImageUrl(url)}
                onClear={() => setImageUrl('')}
              />
            </div>

            {/* Project Media Gallery */}
            <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Film className="w-4 h-4 text-emerald-400" />
                    Project Screenshots Gallery
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Drag-and-drop multiple screenshots for interactive card preview &amp; case study slider.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaModalTarget('gallery')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    Pick from Library
                  </button>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                    {gallery.length} Images
                  </span>
                </div>
              </div>

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
                    <p className="text-xs font-mono text-slate-400">Optimizing gallery images...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="w-8 h-8 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-300 font-semibold">
                        Drag &amp; drop multiple gallery images here, or{' '}
                        <span className="text-emerald-400">browse</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
                  {gallery.map((imgStr, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-950/60 p-1.5 flex flex-col gap-2"
                    >
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

                        <span className="text-[9px] font-mono text-slate-500">#{idx + 1}</span>

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

            {/* Visibility & Featured Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 bg-slate-950/40 p-3.5 border border-slate-800/80 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800"
                />
                <span className="text-xs font-mono text-slate-300">
                  Highlight as <strong className="text-emerald-400">Featured Case Study</strong>
                </span>
              </label>

              <label className="flex items-center gap-3 bg-slate-950/40 p-3.5 border border-slate-800/80 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800"
                />
                <span className="text-xs font-mono text-slate-300">
                  <strong className="text-emerald-400">Visible</strong> on Live Portfolio Frontend
                </span>
              </label>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving Project...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    {currentProject ? 'Save Project Updates' : 'Publish New Project'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header Toolbar & Section Header Customizer */}
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
                  placeholder="Search projects by title, stack tags, role, category..."
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setShowSectionHeaderConfig((prev) => !prev)}
                  className={`px-3 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showSectionHeaderConfig
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Section Header Text</span>
                </button>

                {(filterCategory !== 'All' ||
                  filterStatus !== 'All' ||
                  filterFeatured !== 'All' ||
                  searchQuery !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('All');
                      setFilterStatus('All');
                      setFilterFeatured('All');
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-2 rounded-lg text-xs font-mono border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}

                <button
                  type="button"
                  onClick={openAddForm}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  New Project
                </button>
              </div>
            </div>

            {/* Collapsible Projects Section Header Editor */}
            {showSectionHeaderConfig && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-emerald-400">
                      Projects Section Heading &amp; Subtitle (Live Portfolio)
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400">
                      Customize or clear the top badge, title, and subtitle of the #projects section.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveSectionHeader}
                    disabled={savingHeaderConfig}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingHeaderConfig ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{headerSavedSuccess ? 'Saved!' : 'Save Section Header'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono text-slate-400">Eyebrow Badge</label>
                      {projectsBadge && (
                        <button
                          type="button"
                          onClick={() => setProjectsBadge('')}
                          className="text-[10px] font-mono text-rose-400"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={projectsBadge}
                      onChange={(e) => setProjectsBadge(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                      placeholder="e.g. Featured Engineering Work"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono text-slate-400">Main Heading</label>
                      {projectsHeading && (
                        <button
                          type="button"
                          onClick={() => setProjectsHeading('')}
                          className="text-[10px] font-mono text-rose-400"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={projectsHeading}
                      onChange={(e) => setProjectsHeading(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                      placeholder="e.g. Selected Case Studies"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono text-slate-400">Subtitle</label>
                      {projectsSubtitle && (
                        <button
                          type="button"
                          onClick={() => setProjectsSubtitle('')}
                          className="text-[10px] font-mono text-rose-400"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={projectsSubtitle}
                      onChange={(e) => setProjectsSubtitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                      placeholder="Section description..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Filters Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800/60 text-xs font-mono">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Category</span>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-medium focus:outline-none text-[11px]"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Status</span>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-medium focus:outline-none text-[11px]"
                >
                  <option value="All">All Statuses</option>
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Showcase</span>
                <select
                  value={filterFeatured}
                  onChange={(e) => {
                    setFilterFeatured(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-medium focus:outline-none text-[11px]"
                >
                  <option value="All">All Projects</option>
                  <option value="Featured">Featured Only</option>
                  <option value="Standard">Standard Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Sort By</span>
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

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Direction</span>
                <button
                  type="button"
                  onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="w-full text-left bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-slate-300 font-medium focus:outline-none flex items-center justify-between text-[11px] cursor-pointer"
                >
                  <span>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</span>
                  {sortDirection === 'asc' ? (
                    <ArrowUp className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-emerald-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Projects List Display */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-9 h-9 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300">No Projects Match Criteria</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Try resetting filters or click &ldquo;New Project&rdquo; to add one.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {paginatedProjects.map((project) => {
                  const absoluteIndex = projects.findIndex((p) => p.id === project.id);
                  const isDragging = draggedId === project.id;
                  const isOver = dragOverId === project.id;
                  const projVisible = project.isVisible !== false;

                  return (
                    <div
                      key={project.id}
                      draggable={
                        !searchQuery.trim() &&
                        filterCategory === 'All' &&
                        filterStatus === 'All' &&
                        filterFeatured === 'All'
                      }
                      onDragStart={(e) => handleDragStart(e, project.id)}
                      onDragOver={(e) => handleDragOver(e, project.id)}
                      onDrop={(e) => handleDrop(e, project.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      className={`p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-all ${
                        !projVisible ? 'opacity-60 bg-slate-950/40' : ''
                      } ${isDragging ? 'opacity-40 bg-emerald-500/5' : 'hover:bg-slate-950/25'} ${
                        isOver ? 'border-t-2 border-emerald-500 bg-emerald-500/10' : ''
                      }`}
                    >
                      {/* Left details info */}
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                        {/* Drag & Priority Control Column */}
                        <div className="flex flex-col items-center justify-center gap-1 shrink-0 bg-slate-950/80 border border-slate-800/80 rounded-xl p-1.5 self-center">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(project.id)}
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
                            onClick={() => handleMoveDown(project.id)}
                            disabled={absoluteIndex === -1 || absoluteIndex >= projects.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Priority Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

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
                        </div>

                        <div className="min-w-0 space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-100">{project.title}</h4>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 font-semibold">
                              {project.category || 'Full-Stack'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {project.status || 'Completed'}
                            </span>
                            {project.role && (
                              <span className="text-[10px] font-mono text-cyan-300">
                                · {project.role}
                              </span>
                            )}
                            {!projVisible && (
                              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                                Hidden from Live Portfolio
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed max-w-3xl">
                            {project.description}
                          </p>

                          <div className="flex items-center gap-3.5 flex-wrap pt-0.5">
                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {project.startDate} to {project.endDate || 'Present'}
                              </span>
                            </div>

                            {Array.isArray(project.highlights) && project.highlights.length > 0 && (
                              <span className="text-[10px] font-mono text-emerald-400">
                                {project.highlights.length} Highlights
                              </span>
                            )}

                            <div className="flex gap-1.5 flex-wrap">
                              {(project.skills || []).map((skill, index) => (
                                <span
                                  key={index}
                                  className="text-[9px] font-mono text-slate-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right One-Click Action Controls */}
                      <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800/60 flex-wrap">
                        {/* Quick Toggle Featured */}
                        <button
                          type="button"
                          onClick={() => handleQuickToggleFeatured(project)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            project.isFeatured
                              ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title="Toggle Featured Status"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{project.isFeatured ? 'Featured' : 'Feature'}</span>
                        </button>

                        {/* Quick Toggle Visible / Hidden */}
                        <button
                          type="button"
                          onClick={() => handleQuickToggleVisible(project)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            projVisible
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                          title={projVisible ? 'Click to Hide on Live Portfolio' : 'Click to Show on Live Portfolio'}
                        >
                          {projVisible ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>

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

                        {/* Duplicate Project */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateProject(project)}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/30 hover:text-cyan-400 text-slate-400 transition-all cursor-pointer"
                          title="Duplicate Project"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Project */}
                        <button
                          type="button"
                          onClick={() => openEditForm(project)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Inline Reliable Delete Confirmation */}
                        {confirmDeleteId === project.id ? (
                          <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/40 rounded-lg px-2 py-1">
                            <button
                              type="button"
                              onClick={async () => {
                                await onDelete(project.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-mono font-bold hover:bg-rose-400 cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(project.id)}
                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/40 hover:text-rose-400 text-slate-400 transition-all cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Panel */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  Showing {currentPage} of {totalPages} Pages · {filteredProjects.length} projects
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 disabled:opacity-40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

      {/* Centralized Media Picker Modal */}
      <MediaLibraryModal
        isOpen={mediaModalTarget !== null}
        onClose={() => setMediaModalTarget(null)}
        onSelectMedia={(media) => {
          if (mediaModalTarget === 'primary') {
            setImageUrl(media.url);
          } else if (mediaModalTarget === 'gallery') {
            setGallery((prev) => [...prev, media.url]);
          }
          setMediaModalTarget(null);
        }}
        allowedTypes={['image', 'svg']}
      />
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Edit3, Trash2, Copy, Eye, EyeOff, ArrowUp, ArrowDown, 
  BarChart3, Users, Briefcase, Code2, GitBranch, Award, Cpu, Zap, Trophy, 
  Star, Shield, Terminal, Globe, Flame, Target, Rocket, Activity, CheckCircle2, 
  Layout, Database, Layers, Sparkles, TrendingUp, Check, X, RefreshCw, 
  SlidersHorizontal, Monitor, Smartphone, Tablet, HelpCircle, Info, Sparkle,
  Upload, Link as LinkIcon, FileCode, CheckSquare, Square, ChevronLeft, ChevronRight, Lock,
  GripVertical
} from 'lucide-react';
import { PortfolioMetricItem } from '../../data/cmsMockData';
import { checkAndBlockDemoAction, isDemoSessionActive } from '../../utils/demoAuthUtils';

export interface PortfolioMetricsPageProps {
  metrics: PortfolioMetricItem[];
  onAdd: (metric: Omit<PortfolioMetricItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (metric: PortfolioMetricItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onBulkDelete?: (ids: number[]) => Promise<void>;
  onBulkVisibility?: (ids: number[], visible: boolean) => Promise<void>;
  onToggleVisibility: (id: number, visible: boolean) => Promise<void>;
  onReorder: (orderedMetrics: PortfolioMetricItem[]) => Promise<void>;
  onDuplicate?: (id: number) => Promise<void>;
  triggerToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const COLOR_ACCENTS: Record<string, {
  name: string;
  bg: string;
  border: string;
  text: string;
  glow: string;
  badgeBg: string;
}> = {
  emerald: {
    name: "Emerald Green",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  },
  blue: {
    name: "Electric Blue",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  },
  purple: {
    name: "Cyber Purple",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  },
  amber: {
    name: "Solar Amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  },
  cyan: {
    name: "Neon Cyan",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
  },
  rose: {
    name: "Radiant Rose",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.2)]",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30"
  },
  indigo: {
    name: "Deep Indigo",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-400",
    glow: "shadow-[0_0_20px_rgba(99,102,241,0.2)]",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
  },
  teal: {
    name: "Aqua Teal",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    text: "text-teal-400",
    glow: "shadow-[0_0_20px_rgba(20,184,166,0.2)]",
    badgeBg: "bg-teal-500/20 text-teal-300 border-teal-500/30"
  },
  violet: {
    name: "Ultra Violet",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    text: "text-violet-400",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.2)]",
    badgeBg: "bg-violet-500/20 text-violet-300 border-violet-500/30"
  }
};

export const PRESET_LUCIDE_ICONS = [
  "Eye", "Users", "Briefcase", "Code2", "GitBranch", "Award", "Cpu", "Zap", 
  "Trophy", "Star", "Shield", "Terminal", "Globe", "Flame", "Target", "Rocket", 
  "Activity", "CheckCircle2", "Layout", "Database", "Layers", "Sparkles", "TrendingUp", "BarChart3"
];

export const SOURCE_TYPES = [
  { id: "manual", label: "Manual CMS Value", desc: "Value managed directly inside CMS dashboard" },
  { id: "google_analytics", label: "Google Analytics 4", desc: "Live sync via GA4 Reporting API" },
  { id: "github_api", label: "GitHub API", desc: "Live repo & star count sync via REST v3" },
  { id: "leetcode_api", label: "LeetCode API", desc: "Live problem counts via LeetCode GraphQL" },
  { id: "cloudflare", label: "Cloudflare Analytics", desc: "Zone requests & edge bandwidth sync" },
  { id: "plausible", label: "Plausible Analytics", desc: "Privacy-focused stats API" },
  { id: "umami", label: "Umami Analytics", desc: "Self-hosted telemetry engine sync" },
  { id: "clarity", label: "Microsoft Clarity", desc: "Behavioral analytics API" },
  { id: "custom_api", label: "Custom REST/GraphQL Webhook", desc: "External API integration" }
];

export const PRESET_METRICS = [
  { title: "Page Views", value: "12,450", subtitle: "Live Impressions", icon: "Eye", color: "emerald", sourceType: "manual" },
  { title: "Unique Visitors", value: "4,820", subtitle: "Distinct Clients", icon: "Users", color: "blue", sourceType: "manual" },
  { title: "Projects Delivered", value: "15+", subtitle: "Production Grade", icon: "Briefcase", color: "purple", sourceType: "manual" },
  { title: "LeetCode Solved", value: "350+", subtitle: "Knight Rating 2150+", icon: "Code2", color: "amber", sourceType: "leetcode_api" },
  { title: "GitHub Repositories", value: "28", subtitle: "Open Source", icon: "GitBranch", color: "cyan", sourceType: "github_api" },
  { title: "Certifications", value: "12+", subtitle: "AWS & Kubernetes", icon: "Award", color: "indigo", sourceType: "manual" },
  { title: "Hackathon Wins", value: "3", subtitle: "1st Place Trophies", icon: "Trophy", color: "amber", sourceType: "manual" },
  { title: "Years Experience", value: "4+", subtitle: "Full Stack Eng", icon: "Zap", color: "teal", sourceType: "manual" }
];

// Helper to render metric icon dynamically
export const MetricIconRenderer: React.FC<{
  metric: Partial<PortfolioMetricItem>;
  className?: string;
}> = ({ metric, className = "w-5 h-5" }) => {
  const iconType = metric.iconType || 'lucide';
  const iconName = metric.icon || 'BarChart3';

  if (iconType === 'url' && metric.icon) {
    return <img src={metric.icon} alt={metric.title || "Icon"} className={`${className} object-contain rounded`} />;
  }

  if (iconType === 'svg' && metric.customSvg) {
    return (
      <div 
        className={`${className} flex items-center justify-center fill-current`} 
        dangerouslySetInnerHTML={{ __html: metric.customSvg }} 
      />
    );
  }

  // Lucide Icons Map
  const iconMap: Record<string, React.ReactNode> = {
    Eye: <Eye className={className} />,
    Users: <Users className={className} />,
    Briefcase: <Briefcase className={className} />,
    Code2: <Code2 className={className} />,
    GitBranch: <GitBranch className={className} />,
    Award: <Award className={className} />,
    Cpu: <Cpu className={className} />,
    Zap: <Zap className={className} />,
    Trophy: <Trophy className={className} />,
    Star: <Star className={className} />,
    Shield: <Shield className={className} />,
    Terminal: <Terminal className={className} />,
    Globe: <Globe className={className} />,
    Flame: <Flame className={className} />,
    Target: <Target className={className} />,
    Rocket: <Rocket className={className} />,
    Activity: <Activity className={className} />,
    CheckCircle2: <CheckCircle2 className={className} />,
    Layout: <Layout className={className} />,
    Database: <Database className={className} />,
    Layers: <Layers className={className} />,
    Sparkles: <Sparkles className={className} />,
    TrendingUp: <TrendingUp className={className} />,
    BarChart3: <BarChart3 className={className} />
  };

  return (
    <span className="inline-flex items-center justify-center">
      {iconMap[iconName] || <BarChart3 className={className} />}
    </span>
  );
};

export default function PortfolioMetricsPage({
  metrics = [],
  onAdd,
  onUpdate,
  onDelete,
  onBulkDelete,
  onBulkVisibility,
  onToggleVisibility,
  onReorder,
  onDuplicate,
  triggerToast
}: PortfolioMetricsPageProps) {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'value' | 'updated'>('order');

  // Multi-select & Bulk operations
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<PortfolioMetricItem | null>(null);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    iconType: 'lucide' | 'url' | 'svg';
    customSvg: string;
    displayOrder: number;
    visible: boolean;
    animationEnabled: boolean;
    counterAnimationToggle: boolean;
    color: string;
    sourceType: 'manual' | 'google_analytics' | 'github_api' | 'leetcode_api' | 'cloudflare' | 'plausible' | 'umami' | 'clarity' | 'custom_api';
    tooltip: string;
  }>({
    title: '',
    value: '',
    subtitle: '',
    icon: 'BarChart3',
    iconType: 'lucide',
    customSvg: '',
    displayOrder: metrics.length + 1,
    visible: true,
    animationEnabled: true,
    counterAnimationToggle: true,
    color: 'emerald',
    sourceType: 'manual',
    tooltip: ''
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const total = metrics.length;
    const visibleCount = metrics.filter(m => m.visible).length;
    const hiddenCount = total - visibleCount;
    const apiSyncedCount = metrics.filter(m => m.sourceType && m.sourceType !== 'manual').length;
    return { total, visibleCount, hiddenCount, apiSyncedCount };
  }, [metrics]);

  // Filter & Sort
  const filteredMetrics = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (Array.isArray(metrics) ? metrics : [])
      .filter(metric => {
        const matchesSearch = 
          (metric?.title || '').toLowerCase().includes(q) ||
          (metric?.value || '').toLowerCase().includes(q) ||
          (metric?.subtitle || '').toLowerCase().includes(q) ||
          (metric?.tooltip || '').toLowerCase().includes(q);

        const matchesSource = sourceFilter === 'all' || metric.sourceType === sourceFilter;
        const matchesColor = colorFilter === 'all' || metric.color === colorFilter;
        const matchesVisibility = 
          visibilityFilter === 'all' || 
          (visibilityFilter === 'visible' && metric.visible) ||
          (visibilityFilter === 'hidden' && !metric.visible);

        return matchesSearch && matchesSource && matchesColor && matchesVisibility;
      })
      .sort((a, b) => {
        if (sortBy === 'order') return (a.displayOrder || 0) - (b.displayOrder || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'value') return a.value.localeCompare(b.value);
        if (sortBy === 'updated') {
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        }
        return 0;
      });
  }, [metrics, searchQuery, sourceFilter, colorFilter, visibilityFilter, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMetrics.length / itemsPerPage) || 1;
  const paginatedMetrics = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMetrics.slice(start, start + itemsPerPage);
  }, [filteredMetrics, currentPage, itemsPerPage]);

  // Handle Form Modal Open
  const handleOpenAddModal = () => {
    setEditingMetric(null);
    setFormData({
      title: '',
      value: '',
      subtitle: '',
      icon: 'BarChart3',
      iconType: 'lucide',
      customSvg: '',
      displayOrder: metrics.length + 1,
      visible: true,
      animationEnabled: true,
      counterAnimationToggle: true,
      color: 'emerald',
      sourceType: 'manual',
      tooltip: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (metric: PortfolioMetricItem) => {
    setEditingMetric(metric);
    setFormData({
      title: metric.title,
      value: metric.value,
      subtitle: metric.subtitle || '',
      icon: metric.icon || 'BarChart3',
      iconType: metric.iconType || 'lucide',
      customSvg: metric.customSvg || '',
      displayOrder: metric.displayOrder,
      visible: metric.visible,
      animationEnabled: metric.animationEnabled !== undefined ? metric.animationEnabled : true,
      counterAnimationToggle: metric.counterAnimationToggle !== undefined ? metric.counterAnimationToggle : true,
      color: metric.color || 'emerald',
      sourceType: metric.sourceType || 'manual',
      tooltip: metric.tooltip || ''
    });
    setIsAddModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof PRESET_METRICS[0]) => {
    setFormData(prev => ({
      ...prev,
      title: preset.title,
      value: preset.value,
      subtitle: preset.subtitle,
      icon: preset.icon,
      color: preset.color,
      sourceType: preset.sourceType as any
    }));
    if (triggerToast) triggerToast(`Applied "${preset.title}" preset template`, 'info');
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      if (triggerToast) triggerToast('Metric title is required.', 'error');
      return;
    }

    if (checkAndBlockDemoAction(triggerToast)) {
      setIsAddModalOpen(false);
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingMetric) {
        await onUpdate({
          ...editingMetric,
          ...formData,
          title: formData.title.trim(),
          value: formData.value.trim(),
          subtitle: formData.subtitle.trim(),
          tooltip: formData.tooltip.trim()
        });
        if (triggerToast) triggerToast(`Updated metric "${formData.title}"`, 'success');
      } else {
        await onAdd({
          ...formData,
          title: formData.title.trim(),
          value: formData.value.trim(),
          subtitle: formData.subtitle.trim(),
          tooltip: formData.tooltip.trim()
        });
        if (triggerToast) triggerToast(`Added new metric "${formData.title}"`, 'success');
      }
      setIsAddModalOpen(false);
    } catch (err) {
      if (triggerToast) triggerToast('Failed to save metric.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Reorder Handler (Up / Down)
  const handleMove = async (id: number, direction: 'up' | 'down') => {
    if (checkAndBlockDemoAction(triggerToast)) return;

    const sorted = [...metrics].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex(m => m.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    // Swap displayOrder
    const temp = sorted[index].displayOrder;
    sorted[index].displayOrder = sorted[targetIndex].displayOrder;
    sorted[targetIndex].displayOrder = temp;

    const reordered = sorted.sort((a, b) => a.displayOrder - b.displayOrder);
    await onReorder(reordered);
    if (triggerToast) triggerToast('Reordered metrics order', 'success');
  };

  // Drag & Drop HTML5 Handler
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    if (checkAndBlockDemoAction(triggerToast)) return;

    const reorderedList = [...filteredMetrics];
    const [draggedItem] = reorderedList.splice(draggedIndex, 1);
    reorderedList.splice(dropIndex, 0, draggedItem);

    // Update display orders sequentially
    const updatedWithOrders = reorderedList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setDraggedIndex(null);
    await onReorder(updatedWithOrders);
    if (triggerToast) triggerToast('Updated display order', 'success');
  };

  // Selection logic
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedMetrics.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedMetrics.map(m => m.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (checkAndBlockDemoAction(triggerToast)) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} metric(s)?`)) {
      if (onBulkDelete) {
        await onBulkDelete(selectedIds);
      } else {
        for (const id of selectedIds) {
          await onDelete(id);
        }
      }
      setSelectedIds([]);
      if (triggerToast) triggerToast(`Deleted ${selectedIds.length} metric(s)`, 'success');
    }
  };

  const handleBulkToggleVisibility = async (visible: boolean) => {
    if (selectedIds.length === 0) return;
    if (checkAndBlockDemoAction(triggerToast)) return;

    if (onBulkVisibility) {
      await onBulkVisibility(selectedIds, visible);
    } else {
      for (const id of selectedIds) {
        await onToggleVisibility(id, visible);
      }
    }
    if (triggerToast) triggerToast(`Set ${selectedIds.length} metric(s) to ${visible ? 'visible' : 'hidden'}`, 'success');
  };

  const handleDuplicateMetric = async (id: number) => {
    if (checkAndBlockDemoAction(triggerToast)) return;

    if (onDuplicate) {
      await onDuplicate(id);
      if (triggerToast) triggerToast('Duplicated metric item', 'success');
    } else {
      const source = metrics.find(m => m.id === id);
      if (source) {
        await onAdd({
          ...source,
          title: `${source.title} (Copy)`,
          displayOrder: metrics.length + 1
        });
        if (triggerToast) triggerToast(`Duplicated metric "${source.title}"`, 'success');
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Module Header & Summary Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display tracking-tight text-white">Portfolio Metrics Manager</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Full CMS CRUD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage, customize, reorder, and live-preview all key statistics displayed across your portfolio hero & dashboard banners.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={() => setIsLivePreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>Live Preview Modal</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Metric</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Stat Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Metrics</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <BarChart3 className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Visible on Hero</p>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{stats.visibleCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Eye className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Hidden / Draft</p>
            <p className="text-xl font-bold font-mono text-amber-400 mt-0.5">{stats.hiddenCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <EyeOff className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Live API Synced</p>
            <p className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{stats.apiSyncedCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Preset Quick Generators Bar */}
      <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">One-Click Quick Presets:</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Click to load pre-filled metric config</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_METRICS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setEditingMetric(null);
                handleApplyPreset(preset);
                setIsAddModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500/40 text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3 h-3 text-emerald-400" />
              <span>{preset.title}</span>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 py-0.2 rounded">
                {preset.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search, Filter & Bulk Operations Bar */}
      <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, value, subtitle or tooltip..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Visibility Filter */}
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Visibility</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>

            {/* Source Type Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Data Sources</option>
              {SOURCE_TYPES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            {/* Color Filter */}
            <select
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Colors</option>
              {Object.entries(COLOR_ACCENTS).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500/50 font-medium"
            >
              <option value="order">Sort: Display Order</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="value">Sort: Value</option>
              <option value="updated">Sort: Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Control Bar when items are selected */}
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/20"
          >
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>{selectedIds.length} item(s) selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkToggleVisibility(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show Selected</span>
              </button>

              <button
                onClick={() => handleBulkToggleVisibility(false)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Selected</span>
              </button>

              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 rounded-lg text-slate-400 hover:text-white text-[11px] cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Metrics Table / List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <button 
                    onClick={handleSelectAll} 
                    className="cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {selectedIds.length > 0 && selectedIds.length === paginatedMetrics.length ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3.5 w-16 text-center">Order</th>
                <th className="p-3.5">Metric & Title</th>
                <th className="p-3.5">Value</th>
                <th className="p-3.5">Subtitle</th>
                <th className="p-3.5">Color Accent</th>
                <th className="p-3.5">Data Source</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedMetrics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500 font-mono">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-400">No portfolio metrics found.</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting search filters or create a new metric.</p>
                  </td>
                </tr>
              ) : (
                paginatedMetrics.map((metric, index) => {
                  const colorConfig = COLOR_ACCENTS[metric.color || 'emerald'] || COLOR_ACCENTS.emerald;
                  const isSelected = selectedIds.includes(metric.id);

                  return (
                    <tr 
                      key={metric.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-emerald-500/5' : ''
                      } ${!metric.visible ? 'opacity-60 bg-slate-950/30' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button 
                          onClick={() => handleToggleSelect(metric.id)}
                          className="cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Display Order Controls */}
                      <td className="p-3.5 text-center font-mono font-bold">
                        <div className="flex items-center justify-center gap-1">
                          <span className="w-5 text-center text-slate-400">{metric.displayOrder}</span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMove(metric.id, 'up')}
                              className="text-slate-500 hover:text-emerald-400 transition-colors p-0.5 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMove(metric.id, 'down')}
                              className="text-slate-500 hover:text-emerald-400 transition-colors p-0.5 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Metric Title & Icon */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${colorConfig.bg} ${colorConfig.border} border flex items-center justify-center ${colorConfig.text} shrink-0`}>
                            <MetricIconRenderer metric={metric} className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-100">{metric.title}</span>
                              {metric.tooltip && (
                                <span title={metric.tooltip} className="text-slate-500 hover:text-slate-300 cursor-help">
                                  <Info className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 block">ID: #{metric.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="p-3.5">
                        <span className="font-bold font-mono text-white text-sm bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
                          {metric.value}
                        </span>
                      </td>

                      {/* Subtitle */}
                      <td className="p-3.5 text-slate-400 font-medium">
                        {metric.subtitle || <span className="text-slate-600 font-mono text-[10px]">—</span>}
                      </td>

                      {/* Color Accent */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${colorConfig.badgeBg}`}>
                          {colorConfig.name.split(' ')[0]}
                        </span>
                      </td>

                      {/* Data Source */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400">
                          {SOURCE_TYPES.find(s => s.id === metric.sourceType)?.label.split(' ')[0] || 'Manual'}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            if (checkAndBlockDemoAction(triggerToast)) return;
                            onToggleVisibility(metric.id, !metric.visible);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                            metric.visible 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                              : 'bg-slate-800/80 text-slate-500 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          {metric.visible ? 'Visible' : 'Hidden'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDuplicateMetric(metric.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                            title="Duplicate Metric"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(metric)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title="Edit Metric"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={async () => {
                              if (checkAndBlockDemoAction(triggerToast)) return;
                              if (window.confirm(`Delete metric "${metric.title}"?`)) {
                                await onDelete(metric.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Metric"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
            <div>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMetrics.length)} of {filteredMetrics.length} metrics
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-500/40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 font-bold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-500/40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Metric Modal Drawer */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative my-8 text-slate-100"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display text-white">
                      {editingMetric ? `Edit Metric: ${editingMetric.title}` : 'Add New Portfolio Metric'}
                    </h2>
                    <p className="text-xs text-slate-400">Configure title, value, color accent, icon and analytics source</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveForm} className="space-y-4">
                
                {/* Real-time Preview Banner inside Modal */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Real-time Card Preview:</span>
                    <div className="flex items-center gap-3 mt-2">
                      <div className={`w-10 h-10 rounded-xl ${COLOR_ACCENTS[formData.color]?.bg || 'bg-emerald-500/10'} ${COLOR_ACCENTS[formData.color]?.border || 'border-emerald-500/30'} border flex items-center justify-center ${COLOR_ACCENTS[formData.color]?.text || 'text-emerald-400'}`}>
                        <MetricIconRenderer metric={formData} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-bold font-mono text-white leading-none">
                          {formData.value || "100+"}
                        </div>
                        <div className="text-xs font-semibold text-slate-300 mt-0.5">
                          {formData.title || "Metric Title"}
                        </div>
                        {formData.subtitle && (
                          <div className="text-[10px] font-mono text-slate-500">
                            {formData.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase border ${COLOR_ACCENTS[formData.color]?.badgeBg}`}>
                      {COLOR_ACCENTS[formData.color]?.name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Metric Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Metric Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Projects Delivered, LeetCode Problems"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  {/* Metric Value */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Metric Display Value <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="e.g. 15+, 350+, 12,450, 99.9%"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Optional Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="e.g. Completed, Solved, Live Impressions"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Display Sequence Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Color Accent Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Color Accent Theme
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {Object.entries(COLOR_ACCENTS).map(([key, val]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: key }))}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          formData.color === key 
                            ? `${val.bg} ${val.border} ${val.text} ring-2 ring-emerald-400/30` 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{val.name.split(' ')[0]}</span>
                        <div className={`w-3 h-3 rounded-full ${val.bg} border ${val.border}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Selection Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Icon Selection Strategy
                    </label>
                    <div className="flex gap-1.5 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, iconType: 'lucide' }))}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          formData.iconType === 'lucide' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Lucide Gallery
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, iconType: 'url' }))}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          formData.iconType === 'url' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Image URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, iconType: 'svg' }))}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          formData.iconType === 'svg' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Custom SVG
                      </button>
                    </div>
                  </div>

                  {formData.iconType === 'lucide' && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto no-scrollbar">
                        {PRESET_LUCIDE_ICONS.map(iconName => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                            className={`p-2 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              formData.icon === iconName 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                            title={iconName}
                          >
                            <MetricIconRenderer metric={{ iconType: 'lucide', icon: iconName }} className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.iconType === 'url' && (
                    <input
                      type="url"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="https://example.com/icon.svg or .png"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  )}

                  {formData.iconType === 'svg' && (
                    <textarea
                      rows={2}
                      value={formData.customSvg}
                      onChange={(e) => setFormData(prev => ({ ...prev, customSvg: e.target.value }))}
                      placeholder="<svg viewBox='0 0 24 24'>...</svg>"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500/50"
                    />
                  )}
                </div>

                {/* Data Source Mode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data Source & Provider Sync
                  </label>
                  <select
                    value={formData.sourceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceType: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    {SOURCE_TYPES.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.label} — ({st.desc})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tooltip Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tooltip Explanation (Hover text)
                  </label>
                  <input
                    type="text"
                    value={formData.tooltip}
                    onChange={(e) => setFormData(prev => ({ ...prev, tooltip: e.target.value }))}
                    placeholder="Brief explanatory note shown when visitors hover this metric"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Toggles Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <label className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-slate-300">Visible on Hero</span>
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-slate-300">Fade In Entrance</span>
                    <input
                      type="checkbox"
                      checked={formData.animationEnabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, animationEnabled: e.target.checked }))}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </label>

                  <label className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-slate-300">Count-Up Animation</span>
                    <input
                      type="checkbox"
                      checked={formData.counterAnimationToggle}
                      onChange={(e) => setFormData(prev => ({ ...prev, counterAnimationToggle: e.target.checked }))}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Action Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingMetric ? 'Save Changes' : 'Create Metric'}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Preview Device Simulation Modal */}
      <AnimatePresence>
        {isLivePreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-5xl shadow-2xl relative my-6 text-slate-100 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display text-white">Live Portfolio Hero Preview</h2>
                    <p className="text-xs text-slate-400">Responsive preview of enabled metrics as rendered on the public frontend</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Device View Switcher */}
                  <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        previewDevice === 'desktop' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop</span>
                    </button>
                    <button
                      onClick={() => setPreviewDevice('tablet')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        previewDevice === 'tablet' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                      <span>Tablet</span>
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        previewDevice === 'mobile' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsLivePreviewOpen(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Simulated Hero Card Container */}
              <div className="flex justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800/80 overflow-x-auto min-h-[320px]">
                <div 
                  className={`transition-all duration-300 bg-slate-950 border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative ${
                    previewDevice === 'desktop' ? 'w-full max-w-4xl' :
                    previewDevice === 'tablet' ? 'w-[640px]' : 'w-[360px]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-5">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>HERO METRICS PREVIEW MODE ({previewDevice.toUpperCase()})</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {metrics.filter(m => m.visible).length} Enabled Metrics
                    </span>
                  </div>

                  {/* Render simulated grid */}
                  <div className={`grid gap-4 ${
                    previewDevice === 'desktop' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' :
                    previewDevice === 'tablet' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
                  }`}>
                    {metrics.filter(m => m.visible).length === 0 ? (
                      <div className="col-span-full text-center py-8 text-slate-500 font-mono text-xs">
                        No enabled metrics to display on portfolio hero.
                      </div>
                    ) : (
                      metrics
                        .filter(m => m.visible)
                        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                        .map((metric) => {
                          const colorConfig = COLOR_ACCENTS[metric.color || 'emerald'] || COLOR_ACCENTS.emerald;
                          return (
                            <div 
                              key={metric.id}
                              className={`p-3.5 rounded-xl border ${colorConfig.border} bg-slate-900/80 backdrop-blur-md flex items-center gap-3 shadow-lg hover:scale-102 transition-transform`}
                            >
                              <div className={`w-9 h-9 rounded-lg ${colorConfig.bg} ${colorConfig.border} border flex items-center justify-center ${colorConfig.text} shrink-0`}>
                                <MetricIconRenderer metric={metric} className="w-4.5 h-4.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-base font-bold font-mono text-white tracking-tight truncate">
                                  {metric.value}
                                </div>
                                <div className="text-[11px] font-semibold text-slate-300 truncate">
                                  {metric.title}
                                </div>
                                {metric.subtitle && (
                                  <div className="text-[9px] font-mono text-slate-500 truncate">
                                    {metric.subtitle}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-2">
                <span>⚡ Instant state sync: No browser reload required</span>
                <button
                  onClick={() => setIsLivePreviewOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-semibold cursor-pointer hover:bg-slate-700"
                >
                  Close Live Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

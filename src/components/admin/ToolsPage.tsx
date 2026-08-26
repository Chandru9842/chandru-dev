import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Edit3, Trash2, Copy, Eye, EyeOff, Star, ArrowUp, ArrowDown, 
  ExternalLink, Code2, Upload, Link as LinkIcon, Palette, Wrench, Check, X, 
  Sparkles, Layers, Sliders, FileCode, Atom, Server, Database, Box, Cloud, 
  GitBranch, Send, Figma, Terminal, Cpu, Shield, Globe, RefreshCw, Folder
} from 'lucide-react';
import { ToolItem } from '../../data/cmsMockData';
import MediaLibraryModal from './MediaLibraryModal';

interface ToolsPageProps {
  tools: ToolItem[];
  onAdd: (tool: Omit<ToolItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (tool: ToolItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleVisibility: (id: number, isVisible: boolean) => Promise<void>;
  onToggleFeatured: (id: number, isFeatured: boolean) => Promise<void>;
  onReorder: (orderedTools: ToolItem[]) => Promise<void>;
}

export const CATEGORY_OPTIONS = [
  "Development IDEs",
  "Programming Languages",
  "Frontend",
  "Backend",
  "Databases",
  "Version Control",
  "Cloud & Deployment",
  "DevOps",
  "Testing",
  "API Tools",
  "Design",
  "AI Tools",
  "Productivity",
  "Operating Systems",
  "Other"
];

export const PRESET_LUCIDE_ICONS = [
  "Code2", "FileCode", "Atom", "Server", "Database", "Box", "Cloud", 
  "GitBranch", "Send", "Figma", "Sparkles", "Terminal", "Cpu", "Shield", 
  "Globe", "Layers", "Wrench", "Sliders", "RefreshCw", "ExternalLink"
];

// Reusable Tool Icon Renderer
export const ToolIconRenderer: React.FC<{
  tool: Partial<ToolItem>;
  className?: string;
}> = ({ tool, className = "" }) => {
  const logoType = tool.logoType || 'icon';
  const size = tool.logoSize || 28;

  if (logoType === 'upload' || logoType === 'url') {
    if (tool.logoUrl) {
      return (
        <img 
          src={tool.logoUrl} 
          alt={tool.name || 'Tool Logo'} 
          className={`object-contain ${className}`}
          style={{ width: `${size}px`, height: `${size}px` }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to generic icon if image load breaks
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
  }

  if (logoType === 'svg' && tool.customSvg) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        dangerouslySetInnerHTML={{ __html: tool.customSvg }}
      />
    );
  }

  // Fallback icon selector map
  const iconName = tool.iconName || 'Wrench';
  const iconProps = {
    style: { width: `${size}px`, height: `${size}px`, color: tool.brandColor || '#10B981' },
    className: className
  };

  switch (iconName) {
    case 'Code2': return <Code2 {...iconProps} />;
    case 'FileCode': return <FileCode {...iconProps} />;
    case 'Atom': return <Atom {...iconProps} />;
    case 'Server': return <Server {...iconProps} />;
    case 'Database': return <Database {...iconProps} />;
    case 'Box': return <Box {...iconProps} />;
    case 'Cloud': return <Cloud {...iconProps} />;
    case 'GitBranch': return <GitBranch {...iconProps} />;
    case 'Send': return <Send {...iconProps} />;
    case 'Figma': return <Figma {...iconProps} />;
    case 'Sparkles': return <Sparkles {...iconProps} />;
    case 'Terminal': return <Terminal {...iconProps} />;
    case 'Cpu': return <Cpu {...iconProps} />;
    case 'Shield': return <Shield {...iconProps} />;
    case 'Globe': return <Globe {...iconProps} />;
    case 'Layers': return <Layers {...iconProps} />;
    default: return <Wrench {...iconProps} />;
  }
};

export default function ToolsPage({
  tools = [],
  onAdd,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onToggleFeatured,
  onReorder
}: ToolsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ToolItem>>({
    name: '',
    slug: '',
    category: 'Frontend',
    description: '',
    officialWebsite: '',
    logoType: 'icon',
    logoUrl: '',
    customSvg: '',
    iconLibrary: 'lucide',
    iconName: 'Code2',
    brandColor: '#10B981',
    backgroundColor: '#10B98115',
    borderColor: '#10B98140',
    hoverColor: '#10B981',
    logoSize: 28,
    logoPadding: 10,
    borderRadius: '0.75rem',
    hasGlow: true,
    hoverScale: 1.05,
    hoverRotation: 0,
    experienceLevel: 'Advanced',
    yearsOfExperience: 3,
    isFeatured: false,
    displayOrder: tools.length + 1,
    isVisible: true
  });

  const [saving, setSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Extract list of all unique categories (defaults + existing items)
  const allCategories = Array.from(
    new Set([...CATEGORY_OPTIONS, ...tools.map(t => t.category).filter(Boolean)])
  );

  // Filter tools
  const filteredTools = (Array.isArray(tools) ? tools : []).filter(tool => {
    const matchesSearch = 
      (tool?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tool?.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tool?.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Open Form for Add
  const handleOpenAdd = () => {
    setEditingTool(null);
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setFormData({
      name: '',
      slug: '',
      category: 'Frontend',
      description: '',
      officialWebsite: '',
      logoType: 'icon',
      logoUrl: '',
      customSvg: '',
      iconLibrary: 'lucide',
      iconName: 'Code2',
      brandColor: '#10B981',
      backgroundColor: '#10B98115',
      borderColor: '#10B98140',
      hoverColor: '#10B981',
      logoSize: 28,
      logoPadding: 10,
      borderRadius: '0.75rem',
      hasGlow: true,
      hoverScale: 1.05,
      hoverRotation: 0,
      experienceLevel: 'Advanced',
      yearsOfExperience: 3,
      isFeatured: false,
      displayOrder: tools.length + 1,
      isVisible: true
    });
    setShowFormModal(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (tool: ToolItem) => {
    setEditingTool(tool);
    const isCustom = !CATEGORY_OPTIONS.includes(tool.category);
    setIsCustomCategory(isCustom);
    setCustomCategoryInput(isCustom ? tool.category : '');
    setFormData({ ...tool });
    setShowFormModal(true);
  };

  // Duplicate Tool
  const handleDuplicate = async (tool: ToolItem) => {
    const duplicated: Omit<ToolItem, 'id' | 'createdAt' | 'updatedAt'> = {
      ...tool,
      name: `${tool.name} (Copy)`,
      slug: `${tool.slug}-copy`,
      displayOrder: tools.length + 1
    };
    await onAdd(duplicated);
  };

  // Move up / down reorder
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= tools.length) return;

    const updated = [...tools];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // re-assign display orders
    const reordered = updated.map((t, idx) => ({ ...t, displayOrder: idx + 1 }));
    await onReorder(reordered);
  };

  // Save Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setSaving(true);
    try {
      const finalCategory = isCustomCategory ? (customCategoryInput || 'Other') : (formData.category || 'Other');
      const finalSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const payload = {
        ...formData,
        name: formData.name,
        slug: finalSlug,
        category: finalCategory,
        description: formData.description || '',
        officialWebsite: formData.officialWebsite || '',
        logoType: formData.logoType || 'icon',
        logoUrl: formData.logoUrl || '',
        customSvg: formData.customSvg || '',
        iconLibrary: formData.iconLibrary || 'lucide',
        iconName: formData.iconName || 'Code2',
        brandColor: formData.brandColor || '#10B981',
        backgroundColor: formData.backgroundColor || '#10B98115',
        borderColor: formData.borderColor || '#10B98140',
        hoverColor: formData.hoverColor || '#10B981',
        logoSize: Number(formData.logoSize || 28),
        logoPadding: Number(formData.logoPadding || 10),
        borderRadius: formData.borderRadius || '0.75rem',
        hasGlow: !!formData.hasGlow,
        hoverScale: Number(formData.hoverScale || 1.05),
        hoverRotation: Number(formData.hoverRotation || 0),
        experienceLevel: formData.experienceLevel || 'Intermediate',
        yearsOfExperience: Number(formData.yearsOfExperience || 1),
        isFeatured: !!formData.isFeatured,
        displayOrder: Number(formData.displayOrder || tools.length + 1),
        isVisible: formData.isVisible !== undefined ? formData.isVisible : true
      } as ToolItem;

      if (editingTool) {
        await onUpdate({ ...payload, id: editingTool.id });
      } else {
        await onAdd(payload);
      }
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string, logoType: 'upload' }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 text-slate-100">
      
      {/* Top Header & Stat Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
              Tools & Technologies CMS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Manage your developer toolbox, frameworks, platforms, and custom logo styling.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Tool</span>
        </button>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tools or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 w-full lg:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            All ({tools.length})
          </button>
          {allCategories.map(cat => {
            const count = tools.filter(t => t.category === cat).length;
            if (count === 0 && cat !== selectedCategory) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool, index) => {
          const brandColor = tool.brandColor || '#10B981';
          return (
            <div
              key={tool.id}
              className={`bg-slate-950/80 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 relative group ${
                tool.isFeatured 
                  ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
                  : 'border-slate-800/80 hover:border-slate-700'
              } ${!tool.isVisible ? 'opacity-50' : ''}`}
            >
              {/* Card Header Info */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105"
                      style={{ 
                        backgroundColor: tool.backgroundColor || `${brandColor}15`,
                        borderColor: tool.borderColor || `${brandColor}40`,
                        boxShadow: tool.hasGlow ? `0 0 12px ${brandColor}20` : 'none'
                      }}
                    >
                      <ToolIconRenderer tool={tool} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-100 truncate">{tool.name}</h3>
                        {tool.isFeatured && (
                          <span className="p-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30" title="Featured Tool">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  {/* Move Up/Down Controls */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-500 hover:text-emerald-400 disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === filteredTools.length - 1}
                      className="p-1 text-slate-500 hover:text-emerald-400 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {tool.description || 'No description provided.'}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                    Level: {tool.experienceLevel || 'Intermediate'}
                  </span>
                  {tool.yearsOfExperience && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      {tool.yearsOfExperience} yrs
                    </span>
                  )}
                  {tool.officialWebsite && (
                    <a
                      href={tool.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleVisibility(tool.id, !tool.isVisible)}
                    className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                      tool.isVisible
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                    title={tool.isVisible ? 'Visible in Portfolio' : 'Hidden from Portfolio'}
                  >
                    {tool.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onToggleFeatured(tool.id, !tool.isFeatured)}
                    className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                      tool.isFeatured
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                    title={tool.isFeatured ? 'Featured Tool' : 'Mark as Featured'}
                  >
                    <Star className={`w-3.5 h-3.5 ${tool.isFeatured ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(tool)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
                    title="Duplicate Tool"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(tool)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-800 transition cursor-pointer"
                    title="Edit Tool"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeletingId(tool.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 transition cursor-pointer"
                    title="Delete Tool"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16 bg-slate-950/60 rounded-2xl border border-slate-900">
          <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-bounce" />
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">No Tools Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try tweaking your search term or add a new tool.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Confirm Tool Deletion
              </h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove this tool? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onDelete(deletingId);
                    setDeletingId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-red-500 text-slate-950 hover:bg-red-400 cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Form Modal with Live Preview */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-8 max-w-5xl w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl"
            >
              {/* Modal Title */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-100">
                      {editingTool ? `Edit Tool: ${editingTool.name}` : 'Add New Tool'}
                    </h2>
                    <p className="text-[11px] font-mono text-slate-400">
                      Configure tool details, custom logo styling, and review the live card preview.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Form Controls Column (7 cols) */}
                <div className="lg:col-span-7 space-y-5 text-xs font-mono">
                  
                  {/* Tool Name & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5 uppercase">Tool Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VS Code, React, Docker"
                        value={formData.name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                          setFormData(prev => ({ ...prev, name: val, slug }));
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5 uppercase">Category</label>
                      {!isCustomCategory ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={formData.category || 'Frontend'}
                            onChange={(e) => {
                              if (e.target.value === 'CUSTOM_NEW') {
                                setIsCustomCategory(true);
                              } else {
                                setFormData(prev => ({ ...prev, category: e.target.value }));
                              }
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                          >
                            {CATEGORY_OPTIONS.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="CUSTOM_NEW">+ Create Custom Category...</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Enter Custom Category..."
                            value={customCategoryInput}
                            onChange={(e) => {
                              setCustomCategoryInput(e.target.value);
                              setFormData(prev => ({ ...prev, category: e.target.value }));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => setIsCustomCategory(false)}
                            className="p-2 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl cursor-pointer"
                            title="Back to dropdown"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slug & Official Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5 uppercase">URL Slug</label>
                      <input
                        type="text"
                        placeholder="vs-code"
                        value={formData.slug || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5 uppercase">Official Website</label>
                      <input
                        type="url"
                        placeholder="https://code.visualstudio.com"
                        value={formData.officialWebsite || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, officialWebsite: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 uppercase">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Short summary of what this tool is used for..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Experience Level & Years */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5 uppercase">Experience Level</label>
                      <select
                        value={formData.experienceLevel || 'Intermediate'}
                        onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5 uppercase">Years of Experience</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={formData.yearsOfExperience ?? 3}
                        onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* LOGO MANAGEMENT SECTION */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs">
                      <Palette className="w-4 h-4" />
                      <span>Logo Management & Source</span>
                    </div>

                    {/* Logo Type Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'media', label: 'Media Manager', icon: Folder },
                        { id: 'upload', label: 'Upload File', icon: Upload },
                        { id: 'icon', label: 'Lucide Icon', icon: Code2 },
                        { id: 'url', label: 'Paste URL', icon: LinkIcon },
                        { id: 'svg', label: 'Custom SVG', icon: FileCode }
                      ].map((opt) => {
                        const Icon = opt.icon;
                        const active = formData.logoType === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, logoType: opt.id as any }));
                              if (opt.id === 'media') {
                                setIsMediaModalOpen(true);
                              }
                            }}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-[11px] font-bold cursor-pointer transition ${
                              active 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm' 
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Option 0: Media Manager Picker */}
                    {formData.logoType === 'media' && (
                      <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        {formData.logoUrl ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
                              <img src={formData.logoUrl} alt="Selected Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-xs font-mono text-emerald-400 font-bold truncate max-w-xs">
                              Selected: {formData.logoUrl.split('/').pop() || 'Media Asset'}
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsMediaModalOpen(true)}
                              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Folder className="w-4 h-4" />
                              Change Asset from Media Manager
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 py-2">
                            <p className="text-xs text-slate-400 font-mono">No asset selected from Media Manager yet.</p>
                            <button
                              type="button"
                              onClick={() => setIsMediaModalOpen(true)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                            >
                              <Folder className="w-4 h-4" />
                              Open Media Manager
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Option 1: Icon Selector */}
                    {formData.logoType === 'icon' && (
                      <div className="space-y-3">
                        <label className="block text-slate-400 font-bold uppercase">Choose Icon Preset</label>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                          {PRESET_LUCIDE_ICONS.map((icName) => {
                            const isSel = formData.iconName === icName;
                            return (
                              <button
                                key={icName}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, iconName: icName }))}
                                className={`p-2 rounded-lg flex items-center justify-center border cursor-pointer transition ${
                                  isSel ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                                title={icName}
                              >
                                <ToolIconRenderer tool={{ logoType: 'icon', iconName: icName, logoSize: 20, brandColor: isSel ? '#10B981' : '#94A3B8' }} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Option 2: Upload File */}
                    {formData.logoType === 'upload' && (
                      <div className="space-y-2">
                        <label className="block text-slate-400 font-bold uppercase">Upload Image (PNG, SVG, WEBP, JPEG)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-xs cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-500/20 file:text-emerald-400 file:font-bold"
                        />
                      </div>
                    )}

                    {/* Option 3: Paste URL */}
                    {formData.logoType === 'url' && (
                      <div className="space-y-2">
                        <label className="block text-slate-400 font-bold uppercase">Paste Logo URL</label>
                        <input
                          type="url"
                          placeholder="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
                          value={formData.logoUrl || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}

                    {/* Option 4: Custom SVG */}
                    {formData.logoType === 'svg' && (
                      <div className="space-y-2">
                        <label className="block text-slate-400 font-bold uppercase">Paste Custom SVG Markup</label>
                        <textarea
                          rows={3}
                          placeholder='<svg viewBox="0 0 24 24" fill="currentColor">...</svg>'
                          value={formData.customSvg || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, customSvg: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* LOGO VISUAL STYLING CONTROLS */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs">
                      <Sliders className="w-4 h-4" />
                      <span>Logo Visual Styling & Editor</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Brand Color */}
                      <div>
                        <label className="block text-slate-400 font-bold mb-1 uppercase">Brand Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.brandColor || '#10B981'}
                            onChange={(e) => {
                              const c = e.target.value;
                              setFormData(prev => ({ 
                                ...prev, 
                                brandColor: c,
                                backgroundColor: `${c}15`,
                                borderColor: `${c}40`,
                                hoverColor: c
                              }));
                            }}
                            className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.brandColor || '#10B981'}
                            onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      {/* Logo Size */}
                      <div>
                        <label className="block text-slate-400 font-bold mb-1 uppercase">
                          Logo Size: {formData.logoSize || 28}px
                        </label>
                        <input
                          type="range"
                          min={16}
                          max={60}
                          value={formData.logoSize || 28}
                          onChange={(e) => setFormData(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* Rounded Corners */}
                      <div>
                        <label className="block text-slate-400 font-bold mb-1 uppercase">Corner Radius</label>
                        <select
                          value={formData.borderRadius || '0.75rem'}
                          onChange={(e) => setFormData(prev => ({ ...prev, borderRadius: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100"
                        >
                          <option value="0px font-mono">Square (0px)</option>
                          <option value="0.375rem">Small (6px)</option>
                          <option value="0.75rem">Medium (12px)</option>
                          <option value="1rem">Large (16px)</option>
                          <option value="9999px">Pill / Circle</option>
                        </select>
                      </div>

                      {/* Glow Toggle */}
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-slate-300 font-bold uppercase">Enable Glow Effect</span>
                        <input
                          type="checkbox"
                          checked={!!formData.hasGlow}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasGlow: e.target.checked }))}
                          className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData.isFeatured}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span className="text-slate-300 font-bold uppercase">Mark as Featured</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isVisible !== false}
                        onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className="text-slate-300 font-bold uppercase">Visible in Portfolio</span>
                    </label>
                  </div>
                </div>

                {/* Live Preview Column (5 cols) */}
                <div className="lg:col-span-5 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-900 pt-6 lg:pt-0 lg:pl-6">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase text-xs mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Real-Time Card Live Preview</span>
                  </div>

                  <p className="text-[11px] font-mono text-slate-500">
                    This is how your tool card will render on desktop, mobile, and tablet grids.
                  </p>

                  {/* Preview Card */}
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-900 shadow-2xl flex items-center justify-center min-h-[260px]">
                    <div 
                      className={`w-full max-w-sm glass-card rounded-xl p-5 border border-white/[0.06] transition-all duration-300 relative overflow-hidden bg-slate-950/80 ${
                        formData.isFeatured ? 'ring-1 ring-emerald-500/50 shadow-xl shadow-emerald-500/10' : ''
                      }`}
                      style={{
                        boxShadow: formData.hasGlow ? `0 0 20px ${(formData.brandColor || '#10B981')}25` : 'none'
                      }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="flex items-center justify-center shrink-0 border transition-all duration-300"
                            style={{ 
                              width: `${(formData.logoSize || 28) + (formData.logoPadding || 10) * 2}px`,
                              height: `${(formData.logoSize || 28) + (formData.logoPadding || 10) * 2}px`,
                              borderRadius: formData.borderRadius || '0.75rem',
                              backgroundColor: formData.backgroundColor || `${formData.brandColor || '#10B981'}15`,
                              borderColor: formData.borderColor || `${formData.brandColor || '#10B981'}40`
                            }}
                          >
                            <ToolIconRenderer tool={formData} />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-base truncate">
                              {formData.name || 'Tool Name'}
                            </h4>
                            <span 
                              className="text-[10px] font-mono uppercase tracking-widest block font-bold"
                              style={{ color: formData.brandColor || '#10B981' }}
                            >
                              {isCustomCategory ? (customCategoryInput || 'Category') : (formData.category || 'Category')}
                            </span>
                          </div>
                        </div>

                        {formData.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 fill-emerald-400" />
                            Featured
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                        {formData.description || 'Description summary will appear here on your portfolio grid.'}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-300 font-semibold">
                            {formData.experienceLevel || 'Intermediate'}
                          </span>
                          {formData.yearsOfExperience ? (
                            <span className="text-slate-400 font-medium">
                              {formData.yearsOfExperience} {formData.yearsOfExperience === 1 ? 'yr' : 'yrs'} exp
                            </span>
                          ) : null}
                        </div>

                        {formData.officialWebsite ? (
                          <a
                            href={formData.officialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                            onClick={(e) => e.preventDefault()}
                          >
                            <span>Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-6 border-t border-slate-900 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFormModal(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !formData.name}
                      className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{editingTool ? 'Save Tool Changes' : 'Create Tool Record'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centralized Media Library Modal for Tool Logos */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectMedia={(media) => {
          setFormData(prev => ({
            ...prev,
            logoType: 'media',
            logoUrl: media.url
          }));
          setIsMediaModalOpen(false);
        }}
        title="Select Tool Logo from Centralized Media Library"
      />
    </div>
  );
}

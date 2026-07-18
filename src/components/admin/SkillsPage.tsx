import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ArrowLeft, ArrowRight, AlertCircle, 
  Check, Loader2, Cpu, Layout, Database, Terminal, ShieldCheck, Sliders,
  Palette, Layers, Globe, Smartphone, Network, Braces, Cloud, Lock, Settings,
  Activity, Sparkles, Code2, ArrowUp, ArrowDown, ListFilter, RotateCcw,
  Eye, EyeOff, Upload
} from 'lucide-react';
import { SkillItem } from '../../data/cmsMockData';
import SkillMediaRenderer from '../SkillMediaRenderer';

interface SkillsPageProps {
  skills: SkillItem[];
  onAdd: (skill: Omit<SkillItem, 'id'>) => Promise<void>;
  onUpdate: (skill: SkillItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function SkillsPage({ skills, onAdd, onUpdate, onDelete }: SkillsPageProps) {
  // Navigation & form trigger
  const [isEditing, setIsEditing] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<SkillItem | null>(null);
  
  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterVisibility, setFilterVisibility] = useState('All');
  const [sortBy, setSortBy] = useState<'displayOrder' | 'name'>('displayOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form parameters
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [iconName, setIconName] = useState('Code2');
  const [iconUrl, setIconUrl] = useState('');
  const [color, setColor] = useState('#10b981'); // default to emerald
  const [animation, setAnimation] = useState('Glow'); // default animation style
  const [visibility, setVisibility] = useState(true);

  // Custom Category & Color helpers
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategoryActive, setIsCustomCategoryActive] = useState(false);
  const [customColor, setCustomColor] = useState('#10b981');

  // Icon upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Validation & async submit
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available Category Options
  const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile'];

  // Beautiful Preset Colors
  const presetColors = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Sky', hex: '#0ea5e9' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Orange', hex: '#f97316' }
  ];

  // Animation Preset Options
  const animationPresets = [
    { name: 'Glow', desc: 'Subtle high-tech ambient outer glow' },
    { name: 'Pulse', desc: 'Continuous slow pulsing glow' },
    { name: 'Slide In', desc: 'Bounces gently from the side on load' },
    { name: 'Scale Up', desc: 'Pops out with a scale entrance' },
    { name: 'Spin Slow', desc: 'Extremely slow rotational loop' },
    { name: 'None', desc: 'Simple static layout display' }
  ];

  // Preset Icons mapping
  const availableIcons = [
    { name: 'Code2', component: Code2 },
    { name: 'Layout', component: Layout },
    { name: 'Cpu', component: Cpu },
    { name: 'Database', component: Database },
    { name: 'Terminal', component: Terminal },
    { name: 'Sliders', component: Sliders },
    { name: 'Palette', component: Palette },
    { name: 'ShieldCheck', component: ShieldCheck },
    { name: 'Layers', component: Layers },
    { name: 'Globe', component: Globe },
    { name: 'Smartphone', component: Smartphone },
    { name: 'Network', component: Network },
    { name: 'Braces', component: Braces },
    { name: 'Cloud', component: Cloud },
    { name: 'Lock', component: Lock },
    { name: 'Settings', component: Settings },
    { name: 'Activity', component: Activity },
    { name: 'Sparkles', component: Sparkles }
  ];

  // Helper to resolve skill icon dynamically
  const renderIconByName = (name: string, customColorHex?: string) => {
    const found = availableIcons.find(item => item.name === name);
    const IconComponent = found ? found.component : Code2;
    return <IconComponent className="w-5 h-5 transition-transform" style={{ color: customColorHex || '#10b981' }} />;
  };

  const handleIconFileSelected = async (file: File) => {
    const validTypes = [
      'image/svg+xml',
      'image/png',
      'image/webp',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/avif',
      'video/mp4',
      'video/webm',
      'application/json',
      'application/gzip',
      'application/x-gzip',
      'application/octet-stream'
    ];
    
    const isTgs = file.name.toLowerCase().endsWith('.tgs');
    const isJson = file.name.toLowerCase().endsWith('.json');
    
    if (!validTypes.includes(file.type) && !isTgs && !isJson) {
      setUploadError("Invalid file format. Supported: SVG, PNG, JPG, GIF, WebP, AVIF, MP4, WebM, Lottie (.json/.tgs)");
      return;
    }
    
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_SIZE) {
      setUploadError("File size exceeds 15MB limit.");
      return;
    }

    setUploadError('');
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
        const res = await fetch('/api/skills/upload-icon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ image: base64 })
        });
        if (res.ok) {
          const data = await res.json();
          setIconUrl(data.url);
        } else {
          const errorData = await res.json().catch(() => ({}));
          setUploadError(errorData.error || "Simulated Cloudinary secure upload gateway refused storage.");
        }
      } catch (err) {
        setUploadError("Gateway connection error uploading asset.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter & Sort skills dynamically
  const filteredSkills = useMemo(() => {
    let list = [...skills];

    // 1. Search Query filter (matches Name, Category, or Description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    // 2. Category classification filter
    if (filterCategory !== 'All') {
      list = list.filter(s => s.category === filterCategory);
    }

    // 3. Visibility Filter
    if (filterVisibility !== 'All') {
      if (filterVisibility === 'Visible') {
        list = list.filter(s => s.visibility !== false);
      } else if (filterVisibility === 'Hidden') {
        list = list.filter(s => s.visibility === false);
      }
    }

    // 4. Sorting logic
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'displayOrder') {
        comparison = (a.displayOrder || 0) - (b.displayOrder || 0);
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [skills, searchQuery, filterCategory, filterVisibility, sortBy, sortDirection]);

  // Paginated View List
  const paginatedSkills = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSkills.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSkills, currentPage]);

  const totalPages = Math.ceil(filteredSkills.length / itemsPerPage) || 1;

  const openAddForm = () => {
    setCurrentSkill(null);
    setName('');
    setCategory('Frontend');
    setDisplayOrder(skills.length + 1);
    setIconName('Code2');
    setIconUrl('');
    setDescription('');
    setColor('#10b981');
    setAnimation('Glow');
    setVisibility(true);
    setCustomCategory('');
    setIsCustomCategoryActive(false);
    setErrors({});
    setIsEditing(true);
  };

  const openEditForm = (skill: SkillItem) => {
    setCurrentSkill(skill);
    setName(skill.name);
    
    if (categories.includes(skill.category)) {
      setCategory(skill.category);
      setIsCustomCategoryActive(false);
    } else {
      setCategory('Custom');
      setCustomCategory(skill.category);
      setIsCustomCategoryActive(true);
    }

    setDisplayOrder(skill.displayOrder || 1);
    setIconName(skill.iconName || 'Code2');
    setIconUrl(skill.iconUrl || '');
    setDescription(skill.description || '');
    setColor(skill.color || '#10b981');
    setAnimation(skill.animation || 'Glow');
    setVisibility(skill.visibility ?? true);
    setErrors({});
    setIsEditing(true);
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    
    if (!name.trim()) {
      tempErrors.name = "Skill / Technology name is required.";
    } else if (name.length < 2) {
      tempErrors.name = "Technology name must be at least 2 characters.";
    }

    if (isCustomCategoryActive && !customCategory.trim()) {
      tempErrors.category = "Please enter a valid custom category name.";
    }

    if (!displayOrder || displayOrder < 1) {
      tempErrors.displayOrder = "Display order must be a positive integer.";
    }

    if (!color || !color.startsWith('#')) {
      tempErrors.color = "Please specify a valid HEX color code (e.g. #FF5500).";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const resolvedCategory = isCustomCategoryActive ? customCategory.trim() : category;

    try {
      const payload = {
        name: name.trim(),
        category: resolvedCategory,
        displayOrder: Number(displayOrder),
        iconName,
        iconUrl,
        description: description.trim(),
        color,
        animation,
        visibility
      };

      if (currentSkill) {
        await onUpdate({
          ...payload,
          id: currentSkill.id
        });
      } else {
        await onAdd(payload);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to commit skill entry:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShiftOrder = async (skill: SkillItem, direction: 'up' | 'down') => {
    const shift = direction === 'up' ? -1 : 1;
    const nextOrder = Math.max(1, (skill.displayOrder || 1) + shift);
    
    try {
      await onUpdate({
        ...skill,
        displayOrder: nextOrder
      });
    } catch (err) {
      console.error("Reorder shift failed:", err);
    }
  };

  return (
    <div className="space-y-6 text-left" id="skills-module-admin-root">
      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-fadeIn">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">Skills Module Registry</span>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                {currentSkill ? `Update Competency: ${currentSkill.name}` : `Register New Skill Ledger Entry`}
              </h3>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Real-time Rendering Preview Block */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider font-semibold">Real-time Frontend Preview</span>
                <p className="text-[11px] text-slate-400">See how this skill compiles and renders in the Expertise Matrix.</p>
              </div>

              {/* Dynamic Simulated Card */}
              <div 
                className="bg-[#0b0f19] border border-white/[0.04] rounded-xl p-5 flex flex-col gap-3 min-w-[280px] max-w-[320px] shadow-lg shadow-black/40 transition-all duration-300"
                style={{
                  boxShadow: animation === 'Glow' ? `0 0 12px ${color}15` : 'none'
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div 
                    className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 overflow-hidden bg-slate-950"
                    style={{ 
                      borderColor: `${color}35`,
                    }}
                  >
                    <SkillMediaRenderer 
                      src={iconUrl} 
                      fallbackIcon={iconName} 
                      fallbackColor={color} 
                      isSpin={animation === 'Spin Slow'} 
                      alt={name || "Preview"} 
                    />
                  </div>

                  <div className="min-w-0 flex-grow">
                    <span className="font-bold text-white block text-sm truncate">{name || "Tech Name"}</span>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest mt-0.5" style={{ color }}>
                      {isCustomCategoryActive ? (customCategory || 'Custom Category') : category}
                    </span>
                  </div>
                </div>
                
                {description && (
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-2 border-t border-slate-900">
                  <span>Display order: <b className="text-slate-300">{displayOrder}</b></span>
                  <span className={visibility ? "text-emerald-400" : "text-slate-500"}>
                    {visibility ? "● Visible" : "○ Hidden"}
                  </span>
                </div>
              </div>
            </div>

            {/* Input fields grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Skill Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Skill / Technology Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.name ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                  placeholder="e.g. React Native"
                />
                {errors.name && <span className="text-[10px] font-mono text-rose-400">{errors.name}</span>}
              </div>

              {/* Category classification dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Category Classification *</label>
                <select
                  value={isCustomCategoryActive ? 'Custom' : category}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Custom') {
                      setIsCustomCategoryActive(true);
                      setCategory('Custom');
                    } else {
                      setIsCustomCategoryActive(false);
                      setCategory(val);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 font-mono"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Custom">+ Custom Category</option>
                </select>
              </div>

              {/* Custom Category input field if active */}
              {isCustomCategoryActive && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-mono text-slate-400 font-semibold">Enter Custom Category *</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                      errors.category ? 'border-rose-500/50' : 'border-slate-800'
                    }`}
                    placeholder="e.g. Machine Learning"
                  />
                  {errors.category && <span className="text-[10px] font-mono text-rose-400">{errors.category}</span>}
                </div>
              )}

              {/* Sequence Display Order */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Sequence Display Order index</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-transparent border-0 text-xs font-mono text-slate-300 focus:outline-none px-2.5 py-1.5"
                    min="1"
                  />
                  <div className="flex flex-col gap-0.5 shrink-0 px-1">
                    <button 
                      type="button" 
                      onClick={() => setDisplayOrder(prev => prev + 1)}
                      className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button 
                      type="button" 
                      disabled={displayOrder <= 1}
                      onClick={() => setDisplayOrder(prev => Math.max(1, prev - 1))}
                      className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-30"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {errors.displayOrder && <span className="text-[10px] font-mono text-rose-400">{errors.displayOrder}</span>}
              </div>

              {/* Animation Preset selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Interaction Animation Preset</label>
                <select
                  value={animation}
                  onChange={(e) => setAnimation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 font-mono"
                >
                  {animationPresets.map(preset => (
                    <option key={preset.name} value={preset.name}>{preset.name} — {preset.desc}</option>
                  ))}
                </select>
              </div>

              {/* Visibility Switch */}
              <div className="space-y-1.5 flex flex-col justify-center">
                <label className="block text-xs font-mono text-slate-400 font-semibold">Portfolio Visibility State</label>
                <button
                  type="button"
                  onClick={() => setVisibility(prev => !prev)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    visibility 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {visibility ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{visibility ? "Visible on Frontend" : "Hidden / Draft Mode"}</span>
                </button>
              </div>

            </div>

            {/* Description textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-400 font-semibold">Skill Description / Technical Focus Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                placeholder="Briefly summarize your competencies, frameworks, or projects implemented using this technology."
              />
            </div>

            {/* Custom Brand Color Picker Block */}
            <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  Custom Branding Theme Color
                </span>
                <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-bold text-slate-300">
                  HEX: <span style={{ color }}>{color}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5 items-center">
                {presetColors.map((pc) => (
                  <button
                    key={pc.hex}
                    type="button"
                    onClick={() => {
                      setColor(pc.hex);
                      setCustomColor(pc.hex);
                    }}
                    className={`w-9 h-9 rounded-full relative border transition-all ${
                      color.toLowerCase() === pc.hex.toLowerCase()
                        ? 'ring-2 ring-white/40 border-white scale-110'
                        : 'border-slate-800 hover:scale-105'
                    }`}
                    style={{ backgroundColor: pc.hex }}
                    title={pc.name}
                  >
                    {color.toLowerCase() === pc.hex.toLowerCase() && (
                      <Check className="w-4 h-4 text-slate-950 absolute inset-0 m-auto stroke-[3]" />
                    )}
                  </button>
                ))}

                <div className="h-6 w-[1px] bg-slate-800 mx-1" />

                <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setColor(e.target.value);
                    }}
                    className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded-lg"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const val = e.target.value;
                      setColor(val);
                      if (val.startsWith('#') && val.length === 7) {
                        setCustomColor(val);
                      }
                    }}
                    className="w-20 bg-transparent border-0 text-xs font-mono text-slate-300 focus:outline-none p-1 uppercase"
                    placeholder="#10B981"
                  />
                </div>
              </div>
              {errors.color && <p className="text-[10px] font-mono text-rose-400">{errors.color}</p>}
            </div>

            {/* Skill Icon Uploader and Management */}
            <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-5 space-y-4">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                Skill Icon (SVG / Multi-format Media / Lottie)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Drag and Drop Zone or Preview area */}
                <div className="border border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-5 bg-slate-950/50 flex flex-col items-center justify-center text-center gap-3 relative transition-all min-h-[160px]">
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                      <p className="text-xs font-mono text-slate-400">Uploading to Cloudinary...</p>
                    </div>
                  ) : iconUrl ? (
                    <div className="space-y-3 w-full flex flex-col items-center">
                      <div className="w-16 h-16 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center p-2 relative overflow-hidden">
                        <SkillMediaRenderer src={iconUrl} alt="Preview" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/svg+xml,image/png,image/webp,image/jpeg,image/gif,image/avif,video/mp4,video/webm,application/json,.tgs';
                            input.onchange = (e) => {
                              const files = (e.target as HTMLInputElement).files;
                              if (files && files[0]) handleIconFileSelected(files[0]);
                            };
                            input.click();
                          }}
                          className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded text-[11px] font-mono hover:bg-slate-800 transition-colors"
                        >
                          Replace Icon
                        </button>
                        <button
                          type="button"
                          onClick={() => setIconUrl('')}
                          className="px-2.5 py-1 bg-slate-900/40 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded text-[11px] font-mono hover:bg-rose-950/20 transition-colors"
                        >
                          Delete Icon
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-300">Drag & drop or click to upload</p>
                        <p className="text-[10px] font-mono text-slate-500">Supports SVG, PNG, JPG, GIF, WebP, AVIF, MP4, WebM, Lottie up to 15MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/svg+xml,image/png,image/webp,image/jpeg,image/gif,image/avif,video/mp4,video/webm,application/json,.tgs"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleIconFileSelected(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </>
                  )}
                  {uploadError && <p className="text-[10px] font-mono text-rose-400 absolute bottom-2">{uploadError}</p>}
                </div>

                {/* Preset Option Fallback */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono text-slate-400 block">Or select fallback vector preset:</span>
                  <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {availableIcons.map((ico) => {
                      const IconComp = ico.component;
                      const isSelected = iconName === ico.name && !iconUrl;
                      return (
                        <button
                          key={ico.name}
                          type="button"
                          onClick={() => {
                            setIconName(ico.name);
                            setIconUrl('');
                          }}
                          className={`py-2 px-1 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all bg-slate-950/40 cursor-pointer ${
                            isSelected 
                              ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400 font-bold' 
                              : 'border-slate-800/80 hover:border-slate-700 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <IconComp className="w-4 h-4" style={{ color: isSelected ? color : '#475569' }} />
                          <span className="text-[8px] font-mono truncate w-full text-center">{ico.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
                    Syncing database...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    {currentSkill ? "Save Competency Changes" : "Register Skill record"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Header Action Bar and rich filtering dashboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Live search bar */}
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
                  placeholder="Search skills by name, category, or description..."
                />
              </div>

              {/* Reset, Create Actions */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {(filterCategory !== 'All' || filterVisibility !== 'All' || searchQuery !== '') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('All');
                      setFilterVisibility('All');
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-2 rounded-lg text-xs font-mono border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                )}

                <button
                  onClick={openAddForm}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Add New Competency
                </button>
              </div>

            </div>

            {/* Filter segments & Sorting attributes panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2.5 border-t border-slate-800/60 text-xs font-mono">
              
              {/* Filter: Category classification */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Category Segment</span>
                <select
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 font-medium focus:outline-none text-[11px]"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {Array.from(new Set(skills.map(s => s.category)))
                    .filter(cat => !categories.includes(cat))
                    .map(customCat => (
                      <option key={customCat} value={customCat}>{customCat} (Custom)</option>
                    ))}
                </select>
              </div>

              {/* Filter: Visibility state */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Visibility State</span>
                <select
                  value={filterVisibility}
                  onChange={(e) => { setFilterVisibility(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 font-medium focus:outline-none text-[11px]"
                >
                  <option value="All">All States</option>
                  <option value="Visible">Visible Only</option>
                  <option value="Hidden">Hidden Only</option>
                </select>
              </div>

              {/* Sort field parameter */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Sort Attribute</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 font-medium focus:outline-none text-[11px]"
                >
                  <option value="displayOrder">Display Order</option>
                  <option value="name">Technology Name</option>
                </select>
              </div>

              {/* Sort direction controls */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Order Direction</span>
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="w-full text-left bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 font-medium focus:outline-none flex items-center justify-between text-[11px]"
                >
                  <span>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</span>
                  {sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>

              {/* Metrics Count indicator */}
              <div className="space-y-1.5 col-span-2 sm:col-span-1 flex items-end">
                <div className="w-full bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-1.5 text-center text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
                  <ListFilter className="w-3 h-3 text-emerald-400" />
                  <span>{filteredSkills.length} matches of {skills.length} rows</span>
                </div>
              </div>

            </div>

          </div>

          {/* Grid display layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSkills.length === 0 ? (
              <div className="col-span-full bg-slate-900 border border-slate-800/80 rounded-2xl p-16 text-center shadow-xl">
                <AlertCircle className="w-9 h-9 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300 font-mono">No Matching Competency Found</h4>
                <p className="text-xs text-slate-500 mt-1">Try clearing search parameters or adjust sub-filters.</p>
              </div>
            ) : (
              paginatedSkills.map((skill) => (
                <div 
                  key={skill.id} 
                  className="bg-[#0b0f19] border border-slate-800/70 hover:border-slate-700/90 rounded-2xl p-4.5 transition-all group flex flex-col justify-between shadow-lg relative"
                >
                  
                  {/* Subtle Accent Glow Indicator based on custom color setting */}
                  <div 
                    className="absolute top-0 inset-x-0 h-[3px] rounded-t-2xl opacity-70"
                    style={{ backgroundColor: skill.color || '#10b981' }}
                  />

                  <div>
                    {/* Icon, tag labels & quick action controls */}
                    <div className="flex justify-between items-start mb-3.5 pt-1">
                      <div 
                        className="w-10 h-10 rounded-xl border flex items-center justify-center bg-slate-950 overflow-hidden"
                        style={{ 
                          borderColor: `${skill.color || '#10b981'}25`,
                        }}
                      >
                        <SkillMediaRenderer 
                          src={skill.iconUrl} 
                          fallbackIcon={skill.iconName || 'Code2'} 
                          fallbackColor={skill.color || '#10b981'} 
                          isSpin={false} 
                          alt={skill.name} 
                        />
                      </div>
                      
                      {/* Action edit/delete controls */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                        <button
                          onClick={() => openEditForm(skill)}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:text-emerald-400 text-slate-400 transition-all cursor-pointer"
                          title="Edit Competency"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you absolutely sure you want to permanently delete competency: "${skill.name}"?`)) {
                              onDelete(skill.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:text-rose-400 text-slate-400 transition-all cursor-pointer"
                          title="Purge Competency"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Skill Meta Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 justify-between">
                        <h4 className="text-sm font-bold text-slate-200 truncate pr-2 flex-grow" title={skill.name}>{skill.name}</h4>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          skill.visibility !== false ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500 border border-slate-700/50"
                        }`}>
                          {skill.visibility !== false ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                        <span className="bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-semibold uppercase">
                          {skill.category}
                        </span>
                        
                        {skill.animation && skill.animation !== 'None' && (
                          <span className="text-slate-500 bg-white/[0.02] border border-white/[0.04] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                            <Sparkles className="w-2.5 h-2.5" /> {skill.animation}
                          </span>
                        )}
                      </div>

                      {skill.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-2">
                          {skill.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom strip: Display index adjustment arrow triggers */}
                  <div className="mt-4 pt-3 border-t border-slate-800/40 flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>Display order: <b className="text-slate-300 font-semibold">{skill.displayOrder || 1}</b></span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleShiftOrder(skill, 'up')}
                        disabled={skill.displayOrder <= 1}
                        className="p-1 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-emerald-400 disabled:opacity-20 rounded transition-colors cursor-pointer border border-slate-900"
                        title="Move priority up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleShiftOrder(skill, 'down')}
                        className="p-1 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-emerald-400 rounded transition-colors cursor-pointer border border-slate-900"
                        title="Move priority down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Pagination bar controls */}
          {totalPages > 1 && (
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl">
              <span className="text-xs font-mono text-slate-500">
                Page {currentPage} of {totalPages} • Showing {paginatedSkills.length} of {filteredSkills.length} entries
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
      )}
    </div>
  );
}

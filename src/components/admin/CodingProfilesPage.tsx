import React, { useState } from 'react';
import { 
  Github, Code2, Terminal, Cpu, Braces, Activity, Layers, BarChart2, Award, Link, 
  Plus, Edit2, Trash2, Eye, EyeOff, MoveUp, MoveDown, Save, X, AlertCircle, Info, ExternalLink, ShieldAlert,
  GripVertical
} from 'lucide-react';
import { CodingProfileItem } from '../../data/cmsMockData';

// Platform Lucide Icon mapping helper
export const getPlatformIconComponent = (platform: string) => {
  switch (platform) {
    case 'GitHub': return Github;
    case 'LeetCode': return Code2;
    case 'GeeksforGeeks': return Cpu;
    case 'Codeforces': return Activity;
    case 'CodeChef': return Braces;
    case 'HackerRank': return Terminal;
    case 'HackerEarth': return Layers;
    case 'AtCoder': return BarChart2;
    case 'TopCoder': return Award;
    default: return Link;
  }
};

// Platforms Styling color helper
export const getPlatformColors = (platform: string) => {
  switch (platform) {
    case 'GitHub': return 'text-slate-100 bg-slate-800/40 border-slate-700/50 hover:border-slate-500/50';
    case 'LeetCode': return 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40';
    case 'GeeksforGeeks': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40';
    case 'Codeforces': return 'text-red-400 bg-red-400/10 border-red-400/20 hover:border-red-400/40';
    case 'CodeChef': return 'text-amber-700 bg-amber-700/10 border-amber-700/20 hover:border-amber-700/40';
    case 'HackerRank': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:border-emerald-400/40';
    case 'HackerEarth': return 'text-violet-400 bg-violet-400/10 border-violet-400/20 hover:border-violet-400/40';
    case 'AtCoder': return 'text-neutral-400 bg-neutral-800/40 border-neutral-700/50 hover:border-neutral-500/50';
    case 'TopCoder': return 'text-sky-400 bg-sky-400/10 border-sky-400/20 hover:border-sky-400/40';
    default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40';
  }
};

interface CodingProfilesPageProps {
  profiles: CodingProfileItem[];
  onAdd: (profile: Omit<CodingProfileItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (profile: CodingProfileItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleVisibility: (id: number, visible: boolean) => Promise<void>;
  onReorder: (reorderedList: CodingProfileItem[]) => Promise<void>;
}

export default function CodingProfilesPage({
  profiles,
  onAdd,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onReorder
}: CodingProfilesPageProps) {
  const platformTypes = [
    'GitHub', 'LeetCode', 'GeeksforGeeks', 'Codeforces', 'CodeChef',
    'HackerRank', 'HackerEarth', 'AtCoder', 'TopCoder', 'Custom'
  ];

  // States
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Form Fields
  const [platformType, setPlatformType] = useState('GitHub');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [visible, setVisible] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [openInNewTab, setOpenInNewTab] = useState(true);

  // Errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const resetForm = () => {
    setIsOpenForm(false);
    setIsEditing(false);
    setEditId(null);
    setPlatformType('GitHub');
    setDisplayName('');
    setUsername('');
    setProfileUrl('');
    setDescription('');
    setLogoUrl('');
    setDisplayOrder(profiles.length + 1);
    setVisible(true);
    setFeatured(false);
    setOpenInNewTab(true);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!platformType) {
      errors.platformType = 'Platform type is required.';
    }

    const name = platformType === 'Custom' ? displayName.trim() : platformType;
    if (platformType === 'Custom' && !displayName.trim()) {
      errors.displayName = 'Custom platform name is required.';
    }

    if (!username.trim()) {
      errors.username = 'Username / handle is required.';
    }

    const trimmedUrl = profileUrl.trim();
    if (!trimmedUrl) {
      errors.profileUrl = 'Profile URL is required.';
    } else {
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        errors.profileUrl = 'URL must start with http:// or https://';
      } else {
        try {
          new URL(trimmedUrl);
        } catch (e) {
          errors.profileUrl = 'Please enter a valid URL structure.';
        }
      }
    }

    // Prevent duplicate identical platform URLs
    const isDuplicateUrl = profiles.some(p => {
      if (isEditing && p.id === editId) return false;
      return p.profileUrl.trim().toLowerCase() === trimmedUrl.toLowerCase();
    });

    if (isDuplicateUrl) {
      errors.profileUrl = 'A coding profile with this Profile URL already exists.';
      errors.duplicate = 'Validation Error: Dual entries with the same profile URL are disallowed.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, logo: 'Logo file size exceeds 5MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoUrl(base64);
      setFormErrors(prev => ({ ...prev, logo: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (profile: CodingProfileItem) => {
    setIsEditing(true);
    setEditId(profile.id);
    setPlatformType(profile.platformType);
    setDisplayName(profile.platformType === 'Custom' ? profile.displayName : '');
    setUsername(profile.username);
    setProfileUrl(profile.profileUrl);
    setDescription(profile.description || '');
    setLogoUrl(profile.logoUrl || '');
    setDisplayOrder(profile.displayOrder);
    setVisible(profile.visible);
    setFeatured(!!profile.featured);
    setOpenInNewTab(profile.openInNewTab !== false);
    setFormErrors({});
    setIsOpenForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        platformType,
        displayName: platformType === 'Custom' ? displayName.trim() : platformType,
        username: username.trim(),
        profileUrl: profileUrl.trim(),
        description: description.trim(),
        logoUrl: logoUrl || undefined,
        displayOrder,
        visible,
        featured,
        openInNewTab
      };

      if (isEditing && editId !== null) {
        await onUpdate({
          ...payload,
          id: editId
        } as CodingProfileItem);
      } else {
        await onAdd(payload);
      }
      resetForm();
    } catch (err: any) {
      setFormErrors(prev => ({ ...prev, submit: err.message || 'Error saving coding profile.' }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    setDragOverId(null);
    if (draggedId === null || draggedId === targetId || !onReorder) {
      setDraggedId(null);
      return;
    }

    const sourceIdx = profiles.findIndex(item => item.id === draggedId);
    const targetIdx = profiles.findIndex(item => item.id === targetId);

    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedId(null);
      return;
    }

    const newList = [...profiles];
    const [movedItem] = newList.splice(sourceIdx, 1);
    newList.splice(targetIdx, 0, movedItem);

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setDraggedId(null);
    await onReorder(reordered);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newList = [...profiles];
    const [movedItem] = newList.splice(index, 1);
    newList.splice(index - 1, 0, movedItem);

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));
    await onReorder(reordered);
  };

  const handleMoveDown = async (index: number) => {
    if (index === profiles.length - 1) return;
    const newList = [...profiles];
    const [movedItem] = newList.splice(index, 1);
    newList.splice(index + 1, 0, movedItem);

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));
    await onReorder(reordered);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider font-mono text-slate-100 flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span>Coding Profiles</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Manage your competitive programming, open source, and algorithmic platforms handles.
          </p>
        </div>
        {!isOpenForm && (
          <button
            onClick={() => {
              resetForm();
              setIsOpenForm(true);
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Coding Profile</span>
          </button>
        )}
      </div>

      {/* Form Area */}
      {isOpenForm && (
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-400/40 to-emerald-500/20" />
          
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-400 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Modify Profile Parameters' : 'Register New Programming Channel'}</span>
            </h3>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.duplicate && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400 font-mono">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{formErrors.duplicate}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Platform Type dropdown */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Platform Type
                </label>
                <select
                  value={platformType}
                  onChange={(e) => {
                    setPlatformType(e.target.value);
                    if (e.target.value !== 'Custom') {
                      setDisplayName('');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                >
                  {platformTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Display Name (only for Custom) */}
              {platformType === 'Custom' && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Custom Platform Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Coding Ninjas, Sphere Online Judge"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-all"
                  />
                  {formErrors.displayName && (
                    <span className="text-[10px] text-rose-400 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.displayName}
                    </span>
                  )}
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Username / Handle
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or numeric ID"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-all"
                />
                {formErrors.username && (
                  <span className="text-[10px] text-rose-400 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.username}
                  </span>
                )}
              </div>

              {/* Profile URL Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Profile URL / Endpoint
                </label>
                <input
                  type="text"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://leetcode.com/username"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-all"
                />
                {formErrors.profileUrl && (
                  <span className="text-[10px] text-rose-400 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.profileUrl}
                  </span>
                )}
              </div>

              {/* Description Input */}
              <div className="space-y-1 md:col-span-2">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Short Description (Optional Badge, Rank, Rating, Solved Problems etc.)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Top 0.5% Rank | Max Rating 2050 | 800+ Solved"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-all resize-none"
                />
              </div>

              {/* Display Order */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>

              {/* Checkboxes container */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:col-span-2 border-t border-slate-900/60 pt-4">
                {/* Visibility checkbox */}
                <div className="flex items-center gap-2.5">
                  <input
                    id="visible"
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-900 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="visible" className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold cursor-pointer selection:bg-transparent">
                    Visible on Portfolio
                  </label>
                </div>

                {/* Featured checkbox */}
                <div className="flex items-center gap-2.5">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-900 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold cursor-pointer selection:bg-transparent flex items-center gap-1.5">
                    <span>Featured Profile</span>
                    <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-bold rounded uppercase">Promo</span>
                  </label>
                </div>

                {/* Open in new tab checkbox */}
                <div className="flex items-center gap-2.5">
                  <input
                    id="openInNewTab"
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-900 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="openInNewTab" className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold cursor-pointer selection:bg-transparent">
                    Open in New Tab
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Logo Upload Section */}
            <div className="space-y-1.5 border-t border-slate-900 pt-4 mt-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Platform Logo / Brand Identity
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950 border border-slate-900 rounded-xl p-3.5">
                {/* Logo Preview box */}
                <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Platform Brand Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    (() => {
                      const IconComp = getPlatformIconComponent(platformType);
                      return <IconComp className="w-5 h-5 text-slate-500" />;
                    })()
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  {logoUrl ? (
                    <div className="flex items-center gap-3">
                      <label className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer underline flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Replace Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-mono underline cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-1">
                      <label className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer underline flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload Custom Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                      <span className="text-[9px] text-slate-500">
                        {platformType === 'Custom' 
                          ? 'Highly recommended for custom channels (PNG, JPG, SVG up to 5MB)' 
                          : 'Optional. Replaces default vector icon.'}
                      </span>
                    </div>
                  )}
                  {formErrors.logo && (
                    <span className="text-[10px] text-rose-400 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.logo}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-3 pt-3 border-t border-slate-900 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Processing...' : isEditing ? 'Update Configuration' : 'Register Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profiles list */}
      <div className="border border-slate-900 rounded-2xl bg-slate-950/40 overflow-hidden">
        {profiles.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Code2 className="w-10 h-10 mx-auto text-slate-700 stroke-[1.5]" />
            <p className="text-xs font-mono uppercase tracking-wide">No Coding Profiles Registered</p>
            <p className="text-xs font-sans text-slate-600 max-w-sm mx-auto">
              Add links to GitHub, LeetCode, CodeChef, and more to show your achievements on your portfolio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/80 font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Username & description</th>
                  <th className="py-3 px-4">URL</th>
                  <th className="py-3 px-4 text-center">Visible</th>
                  <th className="py-3 px-4 text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {profiles.map((profile, idx) => {
                  const IconComp = getPlatformIconComponent(profile.platformType);
                  const colors = getPlatformColors(profile.platformType);
                  const isDragging = draggedId === profile.id;
                  const isOver = dragOverId === profile.id;

                  return (
                    <tr 
                      key={profile.id} 
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, profile.id)}
                      onDragOver={(e) => handleDragOver(e, profile.id)}
                      onDrop={(e) => handleDrop(e, profile.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      className={`hover:bg-slate-900/10 transition-all group ${
                        isDragging ? 'opacity-40 bg-emerald-500/10' : ''
                      } ${isOver ? 'bg-emerald-500/15 ring-2 ring-emerald-500' : ''}`}
                    >
                      {/* Drag / Reorder column */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div 
                            className="p-1 text-slate-600 group-hover:text-emerald-400 cursor-grab active:cursor-grabbing transition-colors"
                            title="Drag to reorder profile"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col items-center justify-center gap-1">
                            <button
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              className="p-0.5 text-slate-600 hover:text-emerald-400 disabled:opacity-20 cursor-pointer transition-all"
                              title="Move Up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-mono font-bold text-slate-500">{profile.displayOrder}</span>
                            <button
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === profiles.length - 1}
                              className="p-0.5 text-slate-600 hover:text-emerald-400 disabled:opacity-20 cursor-pointer transition-all"
                              title="Move Down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Platform */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${colors}`}>
                            {profile.logoUrl ? (
                              <img src={profile.logoUrl} alt={profile.displayName} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <IconComp className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-100 font-bold block">{profile.displayName}</span>
                              {profile.featured && (
                                <span className="px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-bold rounded uppercase">Featured</span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 font-sans block">{profile.platformType}</span>
                          </div>
                        </div>
                      </td>

                      {/* Username & Description */}
                      <td className="py-3 px-4 font-mono text-slate-400 font-bold">
                        <div>
                          <span>{profile.username}</span>
                          {profile.description && (
                            <span className="text-[10px] text-slate-500 font-sans font-normal block max-w-xs truncate" title={profile.description}>
                              {profile.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Profile URL */}
                      <td className="py-3 px-4">
                        <a
                          href={profile.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-emerald-400 transition-all font-mono inline-flex items-center gap-1 max-w-[180px] truncate"
                        >
                          <span className="truncate">{profile.profileUrl.replace(/^https?:\/\//i, '')}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      {/* Visibility indicator */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onToggleVisibility(profile.id, !profile.visible)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            profile.visible
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : 'text-slate-600 bg-slate-900 border-slate-800'
                          }`}
                        >
                          {profile.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* CRUD Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(profile)}
                            className="p-1.5 rounded-lg border border-slate-850 hover:border-emerald-500/30 hover:bg-slate-900 text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          {deleteConfirmId === profile.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  onDelete(profile.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono text-[9px] font-black rounded-lg transition-all cursor-pointer uppercase"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 rounded-lg border border-slate-800 text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(profile.id)}
                              className="p-1.5 rounded-lg border border-slate-850 hover:border-rose-500/30 hover:bg-slate-900 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

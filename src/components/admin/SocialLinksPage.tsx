import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Move, Save, X, AlertCircle,
  Linkedin, Github, Instagram, Twitter, Youtube, Mail, Code2, 
  Terminal, Award, Cpu, Braces, Activity, BookOpen, Layers, Globe, Link, ExternalLink, HelpCircle,
  CheckCircle2, Info
} from 'lucide-react';
import { SocialLinkItem } from '../../data/cmsMockData';

// Dynamic Lucide platform mapping helper
export const getPlatformIconComponent = (platform: string) => {
  switch (platform) {
    case 'LinkedIn': return Linkedin;
    case 'GitHub': return Github;
    case 'Instagram': return Instagram;
    case 'X (Twitter)': return Twitter;
    case 'YouTube': return Youtube;
    case 'Email': return Mail;
    case 'LeetCode': return Code2;
    case 'HackerRank': return Terminal;
    case 'CodeChef': return Braces;
    case 'Codeforces': return Activity;
    case 'Medium': return BookOpen;
    case 'Dev.to': return Layers;
    case 'Portfolio': return Globe;
    default: return Link;
  }
};

// Platform color mapping for a highly curated visual experience
export const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'LinkedIn': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'GitHub': return 'text-slate-200 bg-slate-800/20 border-slate-700/30';
    case 'Instagram': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
    case 'X (Twitter)': return 'text-sky-300 bg-sky-400/10 border-sky-400/20';
    case 'YouTube': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    case 'Email': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'LeetCode': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'HackerRank': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'CodeChef': return 'text-amber-600 bg-amber-600/10 border-amber-600/20';
    case 'Codeforces': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'Medium': return 'text-neutral-200 bg-neutral-800/20 border-neutral-700/30';
    case 'Dev.to': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
    case 'Portfolio': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    default: return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
  }
};

interface SocialLinksPageProps {
  socialLinks: SocialLinkItem[];
  onAdd: (social: Omit<SocialLinkItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (social: SocialLinkItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleVisibility: (id: number, isVisible: boolean) => Promise<void>;
  onReorder: (reorderedList: SocialLinkItem[]) => Promise<void>;
}

export default function SocialLinksPage({
  socialLinks,
  onAdd,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onReorder
}: SocialLinksPageProps) {
  // Platforms Enum
  const platformsList = [
    'LinkedIn', 'GitHub', 'Instagram', 'X (Twitter)', 'YouTube', 'Email',
    'LeetCode', 'HackerRank', 'CodeChef', 'Codeforces', 'Medium', 'Dev.to',
    'Portfolio', 'Custom Platform'
  ];

  const standardPlatforms = [
    'LinkedIn', 'GitHub', 'Instagram', 'X (Twitter)', 'YouTube', 'Email',
    'LeetCode', 'HackerRank', 'CodeChef', 'Codeforces', 'Medium', 'Dev.to',
    'Portfolio'
  ];

  // Component States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [platform, setPlatform] = useState<string>('GitHub');
  const [customPlatformName, setCustomPlatformName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [customIcon, setCustomIcon] = useState<string>('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Form errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Confirm delete dialog modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Reset form helper
  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setPlatform('GitHub');
    setCustomPlatformName('');
    setUsername('');
    setProfileUrl('');
    setLogoUrl('');
    setCustomIcon('');
    setDisplayOrder((socialLinks?.length || 0) + 1);
    setIsVisible(true);
    setFormErrors({});
  };

  // Form Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    const finalPlatformName = platform === 'Custom Platform' ? customPlatformName.trim() : platform;

    if (!platform || !platformsList.includes(platform)) {
      errors.platform = 'Select a supported platform option.';
    } else if (platform === 'Custom Platform' && !customPlatformName.trim()) {
      errors.platform = 'Custom platform name is required.';
    } else {
      const isDuplicate = isEditing && editId !== null
        ? socialLinks.some(s => s.platform.toLowerCase() === finalPlatformName.toLowerCase() && s.id !== editId)
        : socialLinks.some(s => s.platform.toLowerCase() === finalPlatformName.toLowerCase());
      if (isDuplicate) {
        errors.platform = `A social link for ${finalPlatformName} already exists.`;
      }
    }

    if (!username.trim()) {
      errors.username = 'Username or identifier is required.';
    }

    const trimmedUrl = profileUrl.trim();
    if (!trimmedUrl) {
      errors.profileUrl = 'Profile URL or endpoint is required.';
    } else {
      const isEmail = platform === 'Email';
      if (isEmail) {
        if (!trimmedUrl.startsWith('mailto:') && !trimmedUrl.includes('@')) {
          errors.profileUrl = 'Invalid email input. Enter a valid email address.';
        }
      } else {
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('mailto:')) {
          errors.profileUrl = 'URL must begin with http://, https://, or mailto:';
        } else {
          if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
            try {
              new URL(trimmedUrl);
            } catch (e) {
              errors.profileUrl = 'Please input a structurally valid URL standard.';
            }
          }
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Upload Logo handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, logo: 'File size exceeds 5MB limit.' }));
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let finalUrl = profileUrl.trim();
    if (platform === 'Email' && !finalUrl.startsWith('mailto:')) {
      finalUrl = `mailto:${finalUrl}`;
    }

    const finalPlatformName = platform === 'Custom Platform' ? customPlatformName.trim() : platform;

    try {
      if (isEditing && editId !== null) {
        const original = socialLinks.find(s => s.id === editId);
        if (original) {
          await onUpdate({
            ...original,
            platform: finalPlatformName,
            username: username.trim(),
            profileUrl: finalUrl,
            icon: platform, 
            logoUrl: logoUrl,
            displayOrder: Number(displayOrder) || original.displayOrder,
            isVisible,
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        await onAdd({
          platform: finalPlatformName,
          username: username.trim(),
          profileUrl: finalUrl,
          icon: platform,
          logoUrl: logoUrl,
          displayOrder: socialLinks.length + 1,
          isVisible
        });
      }
      resetForm();
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  // Trigger edit mode filling the state
  const startEdit = (link: SocialLinkItem) => {
    setIsEditing(true);
    setEditId(link.id);
    
    const isStandard = standardPlatforms.includes(link.platform);
    if (isStandard) {
      setPlatform(link.platform);
      setCustomPlatformName('');
    } else {
      setPlatform('Custom Platform');
      setCustomPlatformName(link.platform);
    }
    
    setUsername(link.username);
    // Strip mailto: prefix for Email platform editing convenience
    if (link.platform === 'Email' && link.profileUrl.startsWith('mailto:')) {
      setProfileUrl(link.profileUrl.replace('mailto:', ''));
    } else {
      setProfileUrl(link.profileUrl);
    }
    setLogoUrl(link.logoUrl || '');
    setDisplayOrder(link.displayOrder);
    setIsVisible(link.isVisible);
    setFormErrors({});
  };

  // Native HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // For transparent shadow drag effect standard
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...socialLinks];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, removed);

    // Re-assign displayOrder numbers strictly sequentially
    const updatedWithOrders = reordered.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    onReorder(updatedWithOrders);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6 text-left relative">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Social Links Directory</h2>
        <p className="text-xs text-slate-400 font-sans">
          Manage, sort, and configure outbound personal social connections and technical credentials dynamically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Social Links List with Sorting */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Move className="w-4 h-4 text-emerald-400" />
                <span>Displays & Priority Stack</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">
                Drag cards by handle icon to re-prioritize outbound hierarchy.
              </p>
            </div>
            {isEditing && (
              <button 
                onClick={resetForm}
                className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/10 cursor-pointer"
              >
                + New Social link
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {socialLinks.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-800 rounded-xl text-center space-y-2">
                <Info className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500">No social media endpoints registered in full-stack pool.</p>
                <button 
                  onClick={resetForm}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg hover:bg-emerald-400 cursor-pointer"
                >
                  Create Initial Mock Connection
                </button>
              </div>
            ) : (
              socialLinks.map((link, idx) => {
                const IconComponent = getPlatformIconComponent(link.platform);
                const colorTheme = getPlatformColor(link.platform);
                const isItemDragged = draggedIndex === idx;

                return (
                  <div
                    key={link.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`p-3.5 bg-slate-950/60 border rounded-xl flex items-center justify-between gap-3 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                      isItemDragged 
                        ? 'border-emerald-500/50 bg-slate-900 shadow-2xl scale-[1.01]' 
                        : 'border-slate-800 hover:border-slate-700/60'
                    }`}
                  >
                    {/* Platform Icon and Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Drag handle */}
                      <div className="text-slate-600 hover:text-slate-400 cursor-grab shrink-0">
                        <Move className="w-3.5 h-3.5" />
                      </div>

                      {/* Icon circle */}
                      <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden ${colorTheme}`}>
                        {link.logoUrl ? (
                          <img 
                            src={link.logoUrl} 
                            alt={link.platform} 
                            className="w-5.5 h-5.5 object-contain" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <IconComponent className="w-4 h-4 stroke-[2]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 truncate">{link.platform}</span>
                          <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-900 px-1 rounded">
                            #{link.displayOrder}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 truncate font-mono">{link.username}</p>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Visibility switcher */}
                      <button
                        type="button"
                        onClick={() => onToggleVisibility(link.id, !link.isVisible)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          link.isVisible
                            ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                            : 'text-slate-500 bg-slate-900 border-slate-800 hover:text-slate-300'
                        }`}
                        title={link.isVisible ? 'Hide Link' : 'Show Link'}
                      >
                        {link.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={() => startEdit(link)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-emerald-400 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Connection Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(link.id)}
                        className="p-1.5 bg-slate-900 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-900/30 rounded-lg transition-colors cursor-pointer"
                        title="Purge Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Add/Edit Form & Realtime Canvas Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Form container */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                {isEditing ? 'Modify Social Connection' : 'Register New Connection'}
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">
                {isEditing ? 'Update dynamic profiles and URL pointers.' : 'Add new engineering metrics & handles.'}
              </p>
            </div>

             <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              {/* Platform Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Network Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => {
                    setPlatform(e.target.value);
                    setFormErrors(prev => ({ ...prev, platform: '' }));
                  }}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/40 transition-colors ${
                    formErrors.platform ? 'border-rose-500/40' : 'border-slate-800'
                  }`}
                >
                  {platformsList.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {formErrors.platform && (
                  <span className="text-[10px] text-rose-400 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.platform}
                  </span>
                )}
              </div>

              {/* Custom Platform Name Input */}
              {platform === 'Custom Platform' && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Custom Platform Name
                  </label>
                  <input
                    type="text"
                    value={customPlatformName}
                    onChange={(e) => {
                      setCustomPlatformName(e.target.value);
                      setFormErrors(prev => ({ ...prev, platform: '' }));
                    }}
                    placeholder="e.g. LeetCode, Email, GeeksforGeeks"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-emerald-500/40 transition-colors font-sans"
                  />
                </div>
              )}

              {/* Custom Logo Upload */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Custom Logo / Icon (Optional)
                </label>
                <div className="border border-slate-800 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                  {logoUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                        <img 
                          src={logoUrl} 
                          alt="Custom logo preview" 
                          className="w-8 h-8 object-contain" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-mono underline cursor-pointer"
                      >
                        Remove Custom Logo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <label className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer underline flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        <span>Upload Custom Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                      <span className="text-[9px] text-slate-600 font-sans">PNG, JPG, SVG, WebP up to 5MB</span>
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

              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Username / Handle
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setFormErrors(prev => ({ ...prev, username: '' }));
                  }}
                  placeholder={platform === 'Email' ? 'alex@example.com' : 'alex_dev'}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-emerald-500/40 transition-colors font-mono ${
                    formErrors.username ? 'border-rose-500/40' : 'border-slate-800'
                  }`}
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
                  Destination Link
                </label>
                <input
                  type="text"
                  value={profileUrl}
                  onChange={(e) => {
                    setProfileUrl(e.target.value);
                    setFormErrors(prev => ({ ...prev, profileUrl: '' }));
                  }}
                  placeholder={platform === 'Email' ? 'alex@example.com' : 'https://github.com/alex_dev'}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-emerald-500/40 transition-colors font-mono ${
                    formErrors.profileUrl ? 'border-rose-500/40' : 'border-slate-800'
                  }`}
                />
                {formErrors.profileUrl && (
                  <span className="text-[10px] text-rose-400 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.profileUrl}
                  </span>
                )}
              </div>

              {/* Switch options */}
              <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-300">Live Visibility</span>
                    <span className="text-[9px] text-slate-500">Enable to render link in frontend grids.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none ${
                    isVisible ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 ${
                    isVisible ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Form buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update Connection' : 'Register Connection'}</span>
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
                    title="Cancel edit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Social Links Canvas Live Preview Widget */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Frontend Render Simulator</span>
              </h4>
              <p className="text-[10px] text-slate-500 font-sans">
                Real-time active mock showing how links dynamically load on client headers, contacts, and footers.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/60 flex flex-col items-center justify-center py-6 space-y-4 text-center">
              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Preview: Hero Dock</span>
              <div className="flex flex-wrap justify-center gap-2.5">
                {socialLinks.filter(l => l.isVisible).map((link) => {
                  const Icon = getPlatformIconComponent(link.platform);
                  const colorTheme = getPlatformColor(link.platform);
                  return (
                    <div 
                      key={link.id} 
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-lg overflow-hidden ${colorTheme}`}
                      title={`${link.platform}: ${link.username}`}
                    >
                      {link.logoUrl ? (
                        <img 
                          src={link.logoUrl} 
                          alt={link.platform} 
                          className="w-5.5 h-5.5 object-contain" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Icon className="w-4 h-4 stroke-[2]" />
                      )}
                    </div>
                  );
                })}
              </div>

              {socialLinks.filter(l => l.isVisible).length === 0 && (
                <span className="text-[10px] text-slate-600 italic">No visible social icons. Set visibility toggle above.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Delete Dialog Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-2xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100">Purge Connection?</h4>
              <p className="text-[11px] text-slate-400 font-sans">
                Are you sure you want to permanently delete this social link endpoint from full-stack CMS registries? This action is irreversible.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (deleteConfirmId !== null) {
                    await onDelete(deleteConfirmId);
                    setDeleteConfirmId(null);
                    if (editId === deleteConfirmId) {
                      resetForm();
                    }
                  }
                }}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

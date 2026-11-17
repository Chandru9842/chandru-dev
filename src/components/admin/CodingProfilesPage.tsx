import React, { useState, useEffect } from 'react';
import { 
  Github, Code2, Terminal, Cpu, Braces, Activity, Layers, BarChart2, Award, Link, 
  Plus, Edit2, Trash2, Eye, EyeOff, MoveUp, MoveDown, Save, X, AlertCircle, Info, ExternalLink, ShieldAlert,
  GripVertical, Sparkles, Sliders, Check, Copy, Flame
} from 'lucide-react';
import { CodingProfileItem, initialProfile } from '../../data/cmsMockData';
import { notifyCmsUpdate } from '../../utils/notifyCmsSync';

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
    case 'GitHub': return 'text-purple-300 bg-purple-500/10 border-purple-500/30 hover:border-purple-400/50';
    case 'LeetCode': return 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:border-amber-400/50';
    case 'GeeksforGeeks': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/50';
    case 'Codeforces': return 'text-rose-400 bg-rose-500/10 border-rose-500/30 hover:border-rose-400/50';
    case 'CodeChef': return 'text-orange-400 bg-orange-500/10 border-orange-500/30 hover:border-orange-400/50';
    case 'HackerRank': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-400/50';
    case 'HackerEarth': return 'text-violet-400 bg-violet-500/10 border-violet-500/30 hover:border-violet-400/50';
    case 'AtCoder': return 'text-slate-300 bg-slate-800/40 border-slate-700/50 hover:border-slate-500/50';
    case 'TopCoder': return 'text-sky-400 bg-sky-500/10 border-sky-500/30 hover:border-sky-400/50';
    default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/50';
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

  // Section Header Customizer States
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);
  const [sectionBadge, setSectionBadge] = useState(
    initialProfile.codingProfilesBadge || 'CODING PROFILES & ALGORITHMIC TELEMETRY'
  );
  const [sectionHeading, setSectionHeading] = useState(
    initialProfile.codingProfilesHeading || 'Competitive Programming & Open-Source Velocity'
  );
  const [sectionSubtitle, setSectionSubtitle] = useState(
    initialProfile.codingProfilesSubtitle ||
      'Live algorithmic benchmarks, data-structure problem velocity, submission heatmaps, and open-source repository contributions across global developer platforms.'
  );
  const [savingHeader, setSavingHeader] = useState(false);
  const [headerSavedSuccess, setHeaderSavedSuccess] = useState(false);

  useEffect(() => {
    const loadSectionHeader = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.codingProfilesBadge) setSectionBadge(data.codingProfilesBadge);
          if (data.codingProfilesHeading) setSectionHeading(data.codingProfilesHeading);
          if (data.codingProfilesSubtitle) setSectionSubtitle(data.codingProfilesSubtitle);
        }
      } catch (e) {
        // Fallback to localStorage overrides if any
        try {
          const localStr = localStorage.getItem('cms_profile_overrides');
          if (localStr) {
            const parsed = JSON.parse(localStr);
            if (parsed.codingProfilesBadge) setSectionBadge(parsed.codingProfilesBadge);
            if (parsed.codingProfilesHeading) setSectionHeading(parsed.codingProfilesHeading);
            if (parsed.codingProfilesSubtitle) setSectionSubtitle(parsed.codingProfilesSubtitle);
          }
        } catch (_) {}
      }
    };
    loadSectionHeader();
  }, []);

  const handleSaveSectionHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHeader(true);
    try {
      const getRes = await fetch('/api/profile');
      const existingProfile = getRes.ok ? await getRes.json() : initialProfile;
      const updatedProfile = {
        ...existingProfile,
        codingProfilesBadge: sectionBadge.trim(),
        codingProfilesHeading: sectionHeading.trim(),
        codingProfilesSubtitle: sectionSubtitle.trim()
      };

      const token = localStorage.getItem('admin_jwt_token');
      await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedProfile)
      });

      try {
        const existingOverrides = JSON.parse(localStorage.getItem('cms_profile_overrides') || '{}');
        localStorage.setItem(
          'cms_profile_overrides',
          JSON.stringify({
            ...existingOverrides,
            codingProfilesBadge: sectionBadge.trim(),
            codingProfilesHeading: sectionHeading.trim(),
            codingProfilesSubtitle: sectionSubtitle.trim()
          })
        );
      } catch (_) {}

      notifyCmsUpdate();
      setHeaderSavedSuccess(true);
      setTimeout(() => setHeaderSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save coding profiles section header:', err);
    } finally {
      setSavingHeader(false);
    }
  };

  // Form States
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Core Form Fields
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

  // New Developer Telemetry & Algorithmic Benchmark Fields
  const [ratingOrRank, setRatingOrRank] = useState('');
  const [problemsSolved, setProblemsSolved] = useState('');
  const [streakOrPercentile, setStreakOrPercentile] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [badgeLabel, setBadgeLabel] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [activitySeriesInput, setActivitySeriesInput] = useState('');

  // Errors & Status
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
    setRatingOrRank('');
    setProblemsSolved('');
    setStreakOrPercentile('');
    setPrimaryLanguage('');
    setBadgeLabel('');
    setHighlightsInput('');
    setActivitySeriesInput('');
    setFormErrors({});
  };

  const applyPlatformPresets = (platform: string) => {
    if (platform === 'GitHub') {
      if (!ratingOrRank) setRatingOrRank('24+ Public Repos');
      if (!problemsSolved) setProblemsSolved('1,480+ Commits');
      if (!streakOrPercentile) setStreakOrPercentile('99.4% CI Pass');
      if (!primaryLanguage) setPrimaryLanguage('Java 21 · TypeScript · SQL');
      if (!badgeLabel) setBadgeLabel('Principal Architect');
    } else if (platform === 'LeetCode') {
      if (!ratingOrRank) setRatingOrRank('Top 4.8% · 1,890 Rating');
      if (!problemsSolved) setProblemsSolved('520+ Solved');
      if (!streakOrPercentile) setStreakOrPercentile('96.4% Beats');
      if (!primaryLanguage) setPrimaryLanguage('Java 21 · C++');
      if (!badgeLabel) setBadgeLabel('Knight Badge');
    } else if (platform === 'GeeksforGeeks') {
      if (!ratingOrRank) setRatingOrRank('Institute Rank #4');
      if (!problemsSolved) setProblemsSolved('380+ Solved');
      if (!streakOrPercentile) setStreakOrPercentile('1,240+ Score');
      if (!primaryLanguage) setPrimaryLanguage('Java · Algorithms');
      if (!badgeLabel) setBadgeLabel('Gold Problem Solver');
    } else if (platform === 'HackerRank') {
      if (!ratingOrRank) setRatingOrRank('5★ Gold Badge');
      if (!problemsSolved) setProblemsSolved('310+ Challenges');
      if (!streakOrPercentile) setStreakOrPercentile('Top 2% Java & SQL');
      if (!primaryLanguage) setPrimaryLanguage('Java 21 · MySQL 3NF');
      if (!badgeLabel) setBadgeLabel('5★ Gold Tier');
    } else if (platform === 'Codeforces') {
      if (!ratingOrRank) setRatingOrRank('Specialist · 1,540');
      if (!problemsSolved) setProblemsSolved('290+ Solved');
      if (!streakOrPercentile) setStreakOrPercentile('Top 12% Div.2');
      if (!primaryLanguage) setPrimaryLanguage('C++20 · Java');
      if (!badgeLabel) setBadgeLabel('Specialist');
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!platformType) {
      errors.platformType = 'Platform type is required.';
    }

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
    setRatingOrRank(profile.ratingOrRank || '');
    setProblemsSolved(profile.problemsSolved || '');
    setStreakOrPercentile(profile.streakOrPercentile || '');
    setPrimaryLanguage(profile.primaryLanguage || '');
    setBadgeLabel(profile.badgeLabel || '');
    setHighlightsInput(Array.isArray(profile.highlights) ? profile.highlights.join('\n') : '');
    setActivitySeriesInput(Array.isArray(profile.activitySeries) ? profile.activitySeries.join(', ') : '');
    setFormErrors({});
    setIsOpenForm(true);
  };

  const handleDuplicateProfile = async (profile: CodingProfileItem) => {
    const duplicatePayload: Omit<CodingProfileItem, 'id' | 'createdAt' | 'updatedAt'> = {
      platformType: profile.platformType,
      displayName: `${profile.displayName} (Copy)`,
      username: profile.username,
      profileUrl: `${profile.profileUrl}#copy-${Date.now().toString().slice(-3)}`,
      description: profile.description,
      logoUrl: profile.logoUrl,
      displayOrder: profiles.length + 1,
      visible: profile.visible,
      featured: false,
      openInNewTab: profile.openInNewTab !== false,
      ratingOrRank: profile.ratingOrRank,
      problemsSolved: profile.problemsSolved,
      streakOrPercentile: profile.streakOrPercentile,
      primaryLanguage: profile.primaryLanguage,
      badgeLabel: profile.badgeLabel,
      highlights: profile.highlights,
      activitySeries: profile.activitySeries
    };
    await onAdd(duplicatePayload);
    notifyCmsUpdate();
  };

  const handleToggleFeatured = async (profile: CodingProfileItem) => {
    await onUpdate({
      ...profile,
      featured: !profile.featured
    });
    notifyCmsUpdate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const parsedHighlights = highlightsInput
        .split(/\n|,/)
        .map(s => s.trim())
        .filter(Boolean);

      const parsedActivity = activitySeriesInput
        .split(',')
        .map(s => parseFloat(s.trim()))
        .filter(n => !isNaN(n));

      const payload: Omit<CodingProfileItem, 'id' | 'createdAt' | 'updatedAt'> = {
        platformType,
        displayName: platformType === 'Custom' ? displayName.trim() : platformType,
        username: username.trim(),
        profileUrl: profileUrl.trim(),
        description: description.trim(),
        logoUrl: logoUrl || undefined,
        displayOrder,
        visible,
        featured,
        openInNewTab,
        ratingOrRank: ratingOrRank.trim() || undefined,
        problemsSolved: problemsSolved.trim() || undefined,
        streakOrPercentile: streakOrPercentile.trim() || undefined,
        primaryLanguage: primaryLanguage.trim() || undefined,
        badgeLabel: badgeLabel.trim() || undefined,
        highlights: parsedHighlights.length > 0 ? parsedHighlights : undefined,
        activitySeries: parsedActivity.length >= 4 ? parsedActivity : undefined
      };

      if (isEditing && editId !== null) {
        await onUpdate({
          ...payload,
          id: editId
        } as CodingProfileItem);
      } else {
        await onAdd(payload);
      }
      notifyCmsUpdate();
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
    notifyCmsUpdate();
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
    notifyCmsUpdate();
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
    notifyCmsUpdate();
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider font-mono text-slate-100 flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span>Coding Profiles &amp; Algorithmic Telemetry CMS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Configure competitive programming handles, D3 velocity curves, 3-column KPIs, and domain mastery dossiers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowHeaderSettings(prev => !prev)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              showHeaderSettings
                ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-500/30 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Section Header</span>
          </button>

          {!isOpenForm && (
            <button
              type="button"
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
      </div>

      {/* Collapsible Frontend Section Header Customizer */}
      {showHeaderSettings && (
        <form
          onSubmit={handleSaveSectionHeader}
          className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Frontend Coding Profiles Section Header Customizer</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHeaderSettings(false)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Eyebrow Badge Text
              </label>
              <input
                type="text"
                value={sectionBadge}
                onChange={(e) => setSectionBadge(e.target.value)}
                placeholder="CODING PROFILES & ALGORITHMIC TELEMETRY"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Main Section Heading
              </label>
              <input
                type="text"
                value={sectionHeading}
                onChange={(e) => setSectionHeading(e.target.value)}
                placeholder="Competitive Programming & Open-Source Velocity"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Section Subtitle / Lead Description
              </label>
              <textarea
                rows={2}
                value={sectionSubtitle}
                onChange={(e) => setSectionSubtitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-sans focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {headerSavedSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Synced to Live Portfolio!</span>
              </span>
            )}
            <button
              type="submit"
              disabled={savingHeader}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingHeader ? 'Saving...' : 'Save Header Copy'}</span>
            </button>
          </div>
        </form>
      )}

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Arenas</div>
          <div className="text-xl font-mono font-extrabold text-white mt-0.5">{profiles.length}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Visible on Live Site</div>
          <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">
            {profiles.filter(p => p.visible !== false).length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Featured Arenas</div>
          <div className="text-xl font-mono font-extrabold text-amber-400 mt-0.5">
            {profiles.filter(p => p.featured).length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Custom Telemetry</div>
          <div className="text-xl font-mono font-extrabold text-cyan-400 mt-0.5">
            {profiles.filter(p => p.ratingOrRank || p.problemsSolved).length || profiles.length}
          </div>
        </div>
      </div>

      {/* Add / Edit Form Area */}
      {isOpenForm && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-400/50 to-cyan-500/20" />
          
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-400 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Modify Coding Arena & Telemetry Parameters' : 'Register New Programming Arena'}</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyPlatformPresets(platformType)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300 cursor-pointer transition-all"
              >
                Auto-Fill {platformType} Benchmarks
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formErrors.duplicate && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400 font-mono">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{formErrors.duplicate}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
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
                    placeholder="e.g. Coding Ninjas, SPOJ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-all"
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
                  placeholder="e.g. Chandru9842"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-all"
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
                  placeholder="https://leetcode.com/u/Chandru9842/"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-all"
                />
                {formErrors.profileUrl && (
                  <span className="text-[10px] text-rose-400 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.profileUrl}
                  </span>
                )}
              </div>
            </div>

            {/* 3D Card Telemetry & Algorithmic KPI Fields */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  3D Card KPI Strip &amp; Algorithmic Telemetry (Displayed on Portfolio Cards)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Leave blank to use intelligent platform defaults
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Rating / Rank / Repos (KPI 1)
                  </label>
                  <input
                    type="text"
                    value={ratingOrRank}
                    onChange={(e) => setRatingOrRank(e.target.value)}
                    placeholder="e.g. Top 4.8% · 1,890 Rating"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Problems Solved / Commits (KPI 2)
                  </label>
                  <input
                    type="text"
                    value={problemsSolved}
                    onChange={(e) => setProblemsSolved(e.target.value)}
                    placeholder="e.g. 520+ Solved / 1,480+ Commits"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Percentile / SLA / Score (KPI 3)
                  </label>
                  <input
                    type="text"
                    value={streakOrPercentile}
                    onChange={(e) => setStreakOrPercentile(e.target.value)}
                    placeholder="e.g. 96.4% Beats / 99.4% CI Pass"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Primary Languages / Stack
                  </label>
                  <input
                    type="text"
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                    placeholder="e.g. Java 21 · C++ · SQL"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Tier / Honour Badge Label
                  </label>
                  <input
                    type="text"
                    value={badgeLabel}
                    onChange={(e) => setBadgeLabel(e.target.value)}
                    placeholder="e.g. Knight Tier / 5★ Gold Badge"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    D3 Velocity Curve (12 comma-separated pts)
                  </label>
                  <input
                    type="text"
                    value={activitySeriesInput}
                    onChange={(e) => setActivitySeriesInput(e.target.value)}
                    placeholder="e.g. 1520, 1590, 1640, 1710, 1785, 1840, 1890"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Executive Summary / Short Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Algorithmic problem solving in Dynamic Programming, Graphs, Trees, and System Concurrency."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-sans focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Expandable Dossier Highlights (One per line)
                  </label>
                  <textarea
                    value={highlightsInput}
                    onChange={(e) => setHighlightsInput(e.target.value)}
                    placeholder={`Solved 500+ algorithmic problems across Graphs, DP & Trees\nConsistent sub-5ms runtime optimization in Java 21\nActive weekly contest participant`}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>

              {/* Checkboxes container */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                <div className="flex items-center gap-2.5">
                  <input
                    id="visible"
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="visible" className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold cursor-pointer">
                    Visible on Portfolio
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold cursor-pointer flex items-center gap-1.5">
                    <span>Featured Arena</span>
                    <span className="px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[8px] font-bold rounded uppercase">Spotlight</span>
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    id="openInNewTab"
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="openInNewTab" className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold cursor-pointer">
                    Open in New Tab
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Logo Upload Section */}
            <div className="space-y-1.5 border-t border-slate-900 pt-4">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Platform Logo / Brand Identity
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950 border border-slate-900 rounded-xl p-3.5">
                <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Platform Brand Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    (() => {
                      const IconComp = getPlatformIconComponent(platformType);
                      return <IconComp className="w-5 h-5 text-emerald-400" />;
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
                        Optional. Overrides default platform vector icon (PNG, JPG, SVG up to 5MB).
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
                <span>{isSaving ? 'Processing...' : isEditing ? 'Update Arena & Telemetry' : 'Register Coding Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profiles Table */}
      <div className="border border-slate-900 rounded-2xl bg-slate-950/40 overflow-hidden">
        {profiles.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Code2 className="w-10 h-10 mx-auto text-slate-700 stroke-[1.5]" />
            <p className="text-xs font-mono uppercase tracking-wide">No Coding Profiles Registered</p>
            <p className="text-xs font-sans text-slate-600 max-w-sm mx-auto">
              Add links to GitHub, LeetCode, CodeChef, and more to show your algorithmic telemetry on your portfolio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/80 font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 w-14 text-center">Order</th>
                  <th className="py-3 px-4">Platform &amp; Tier</th>
                  <th className="py-3 px-4">Handle &amp; Telemetry KPIs</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Visible</th>
                  <th className="py-3 px-4 text-right w-40">Actions</th>
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
                      className={`hover:bg-slate-900/20 transition-all group ${
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
                              type="button"
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              className="p-0.5 text-slate-600 hover:text-emerald-400 disabled:opacity-20 cursor-pointer transition-all"
                              title="Move Up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-mono font-bold text-slate-500">{profile.displayOrder}</span>
                            <button
                              type="button"
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
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${colors}`}>
                            {profile.logoUrl ? (
                              <img src={profile.logoUrl} alt={profile.displayName} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <IconComp className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-100 font-bold block">{profile.displayName}</span>
                              {profile.badgeLabel && (
                                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[9px] font-mono rounded">
                                  {profile.badgeLabel}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {profile.primaryLanguage || profile.platformType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Username & Telemetry KPIs */}
                      <td className="py-3 px-4 font-mono">
                        <div className="space-y-1">
                          <div className="text-slate-200 font-bold">@{profile.username}</div>
                          {(profile.ratingOrRank || profile.problemsSolved) && (
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              {profile.ratingOrRank && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                                  {profile.ratingOrRank}
                                </span>
                              )}
                              {profile.problemsSolved && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                                  {profile.problemsSolved}
                                </span>
                              )}
                            </div>
                          )}
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
                          className="text-slate-400 hover:text-emerald-400 transition-all font-mono inline-flex items-center gap-1 max-w-[170px] truncate"
                        >
                          <span className="truncate">{profile.profileUrl.replace(/^https?:\/\//i, '')}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      {/* 1-Click Featured Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(profile)}
                          title={profile.featured ? 'Remove from Featured' : 'Mark as Featured Arena'}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            profile.featured
                              ? 'text-amber-400 bg-amber-500/15 border-amber-500/35 shadow-sm'
                              : 'text-slate-600 bg-slate-900 border-slate-800 hover:text-slate-400'
                          }`}
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Visibility indicator */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={async () => {
                            await onToggleVisibility(profile.id, !profile.visible);
                            notifyCmsUpdate();
                          }}
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicateProfile(profile)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
                            title="Duplicate Arena"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditClick(profile)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900 text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
                            title="Edit Arena & Telemetry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          {deleteConfirmId === profile.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={async () => {
                                  await onDelete(profile.id);
                                  notifyCmsUpdate();
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono text-[9px] font-black rounded-lg transition-all cursor-pointer uppercase"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 rounded-lg border border-slate-800 text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(profile.id)}
                              className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 hover:bg-slate-900 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
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

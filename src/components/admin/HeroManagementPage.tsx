import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, User, Image as ImageIcon, FileText, Share2, Edit2, Check, RefreshCw, 
  Trash2, UploadCloud, Sliders, CheckCircle2, AlertTriangle, Save, 
  RotateCcw, Eye, Download, Info, Globe, Mail, EyeOff, Plus, Folder
} from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';
import { notifyCmsUpdate } from '../../utils/notifyCmsSync';

interface HeroProfileData {
  id: number;
  fullName: string;
  displayName: string;
  title: string;
  subtitle: string;
  typingText: string;
  shortBio: string;
  aboutDescription: string;
  heroBadge?: string;
  heroName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroAvatar?: string;
  heroBackground?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  quickStats?: string;
  highlightTags?: string;
  heroVisibility?: boolean;
  shortTagline?: string;
  shortIntroduction?: string;
  resumeDownloadText?: string;
}

interface HeroManagementPageProps {
  onTriggerToast: (message: string, type: 'success' | 'error') => void;
  onHeroUpdated?: () => void;
}

export default function HeroManagementPage({ onTriggerToast, onHeroUpdated }: HeroManagementPageProps) {
  const [profile, setProfile] = useState<HeroProfileData | null>(null);
  const [originalProfile, setOriginalProfile] = useState<HeroProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const getJwtToken = () =>
  localStorage.getItem("alex_dev_jwt_token") ||
  localStorage.getItem("admin_token") ||
  sessionStorage.getItem("admin_token");
  // Split stats state helper
  const [stats, setStats] = useState<{ value: string; label: string }[]>([]);
  const [newStatValue, setNewStatValue] = useState('');
  const [newStatLabel, setNewStatLabel] = useState('');

  // History state for Undo Changes
  const [history, setHistory] = useState<HeroProfileData[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Media picker modal target
  const [mediaModalTarget, setMediaModalTarget] = useState<'avatar' | 'background' | null>(null);

  // Load hero and profile data
  const fetchHeroData = async () => {
    setLoading(true);
    try {
      const cacheBuster = `t=${Date.now()}`;
      const res = await fetch(`/api/profile?${cacheBuster}`);
      if (res.ok) {
        const data: HeroProfileData = await res.json();
        setProfile(data);
        setOriginalProfile(JSON.parse(JSON.stringify(data)));
        setHistory([JSON.parse(JSON.stringify(data))]);
        setCurrentHistoryIndex(0);

        // Parse quickStats (e.g. "8+ Years Exp | 50+ Projects Mapped")
        if (data.quickStats) {
          const parsedStats = data.quickStats.split('|').map(item => {
            const parts = item.trim().split(' ');
            return {
              value: parts[0] || '',
              label: parts.slice(1).join(' ') || ''
            };
          });
          setStats(parsedStats);
        } else {
          setStats([]);
        }
      } else {
        onTriggerToast("Failed to fetch Hero settings.", "error");
      }
    } catch (err) {
      onTriggerToast("Network error loading Hero data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroData();
  }, []);

  // Update history state
  const updateProfileWithHistory = (updated: HeroProfileData, updatedStatsList?: { value: string; label: string }[]) => {
    const finalStatsList = updatedStatsList || stats;
    // Compile stats back into string
    const quickStatsString = finalStatsList
      .filter(s => s.value.trim() && s.label.trim())
      .map(s => `${s.value.trim()} ${s.label.trim()}`)
      .join(' | ');

    const finalProfile = {
      ...updated,
      quickStats: quickStatsString,
      updatedAt: new Date().toISOString()
    };

    setProfile(finalProfile);

    const nextHistory = history.slice(0, currentHistoryIndex + 1);
    setHistory([...nextHistory, JSON.parse(JSON.stringify(finalProfile))]);
    setCurrentHistoryIndex(nextHistory.length);
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1;
      const prevProfile = history[prevIndex];
      setProfile(JSON.parse(JSON.stringify(prevProfile)));
      setCurrentHistoryIndex(prevIndex);

      // Re-parse stats
      if (prevProfile.quickStats) {
        const parsedStats = prevProfile.quickStats.split('|').map(item => {
          const parts = item.trim().split(' ');
          return {
            value: parts[0] || '',
            label: parts.slice(1).join(' ') || ''
          };
        });
        setStats(parsedStats);
      } else {
        setStats([]);
      }
      onTriggerToast("Reverted last unsaved change.", "success");
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      const nextProfile = history[nextIndex];
      setProfile(JSON.parse(JSON.stringify(nextProfile)));
      setCurrentHistoryIndex(nextIndex);

      // Re-parse stats
      if (nextProfile.quickStats) {
        const parsedStats = nextProfile.quickStats.split('|').map(item => {
          const parts = item.trim().split(' ');
          return {
            value: parts[0] || '',
            label: parts.slice(1).join(' ') || ''
          };
        });
        setStats(parsedStats);
      } else {
        setStats([]);
      }
      onTriggerToast("Restored unsaved change.", "success");
    }
  };

  // Add a dynamic stat
  const handleAddStat = () => {
    if (!newStatValue.trim() || !newStatLabel.trim()) {
      onTriggerToast("Stat Value and Label cannot be empty.", "error");
      return;
    }
    if (stats.length >= 4) {
      onTriggerToast("A maximum of 4 operational metrics is supported on the Hero layout.", "error");
      return;
    }
    const updatedStats = [...stats, { value: newStatValue.trim(), label: newStatLabel.trim() }];
    setStats(updatedStats);
    setNewStatValue('');
    setNewStatLabel('');
    if (profile) {
      updateProfileWithHistory(profile, updatedStats);
    }
  };

  // Remove a dynamic stat
  const handleRemoveStat = (index: number) => {
    const updatedStats = stats.filter((_, idx) => idx !== index);
    setStats(updatedStats);
    if (profile) {
      updateProfileWithHistory(profile, updatedStats);
    }
  };

  // Save changes to database
  const handleSaveHero = async () => {
    if (!profile) return;
   const token = getJwtToken();

if (!token) {
    onTriggerToast("Administrative session expired or locked. Please re-login.", "error");
    return;
}

    setSaving(true);
    try {
      // Compile stats before saving just to be safe
      const quickStatsString = stats
        .filter(s => s.value.trim() && s.label.trim())
        .map(s => `${s.value.trim()} ${s.label.trim()}`)
        .join(' | ');

      const payload = {
        ...profile,
        quickStats: quickStatsString,
        heroVisibility: profile.heroVisibility !== false
      };

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedData = await res.json();
        setProfile(savedData);
        setOriginalProfile(JSON.parse(JSON.stringify(savedData)));
        setHistory([JSON.parse(JSON.stringify(savedData))]);
        setCurrentHistoryIndex(0);
        onTriggerToast("Hero configuration successfully published to database!", "success");
        notifyCmsUpdate();
        if (onHeroUpdated) {
          onHeroUpdated();
        }
      } else {
        const errorData = await res.json();
        onTriggerToast(errorData.error || "Failed to commit Hero changes.", "error");
      }
    } catch (err) {
      onTriggerToast("Network error trying to commit changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload helpers for Avatar and Background
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = getJwtToken();

if (!token) {
    onTriggerToast("Upload locked. Please unlock admin panel first.", "error");
    return;
}

    // Read file as base64 data URL
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      try {
        const patchRoute = `/api/profile/${type === 'avatar' ? 'hero-avatar' : 'hero-background'}`;
        onTriggerToast(`Uploading and compressing ${type} asset...`, "success");
        
        const uploadRes = await fetch(patchRoute, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: dataUrl })
        });

        if (uploadRes.ok) {
          const resData = await uploadRes.json();
          setProfile(resData.profile);
          setOriginalProfile(JSON.parse(JSON.stringify(resData.profile)));
          onTriggerToast(`Cloudinary ${type} upload complete and saved!`, "success");
          if (onHeroUpdated) {
            onHeroUpdated();
          }
        } else {
          onTriggerToast("Cloudinary gateway refused asset storage.", "error");
        }
      } catch (err) {
        onTriggerToast("Gateway error uploading image.", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = async (type: 'avatar' | 'background') => {
    if (!profile) return;

    const token = getJwtToken();

    if (!token) return;

    try {
      const deleteRoute = `/api/profile/${type === 'avatar' ? 'hero-avatar' : 'hero-background'}`;
      const res = await fetch(deleteRoute, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const resData = await res.json();
        setProfile(resData.profile);
        setOriginalProfile(JSON.parse(JSON.stringify(resData.profile)));
        onTriggerToast(`Removed Hero ${type} image successfully.`, "success");
        if (onHeroUpdated) {
          onHeroUpdated();
        }
      } else {
        onTriggerToast(`Failed to delete ${type} image.`, "error");
      }
    } catch (err) {
      onTriggerToast("Gateway error purging image asset.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="font-mono text-xs text-slate-500">Loading dynamic Hero structures from JPA database...</p>
      </div>
    );
  }

  if (!profile) return null;

  const isDirty = JSON.stringify(profile) !== JSON.stringify(originalProfile);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1.5" id="hero-management-container">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/40 border border-slate-900 p-6 rounded-3xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100 font-mono tracking-tight">Hero Customizer</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
            Manage the content, buttons, highlight tags, avatar, background, and typewriter settings for the main landing presentation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleUndo}
            disabled={currentHistoryIndex <= 0}
            className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-950 disabled:opacity-30 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Undo Change"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={currentHistoryIndex >= history.length - 1}
            className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-950 disabled:opacity-30 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer animate-none"
            title="Redo Change"
          >
            <RotateCcw className="w-4 h-4 transform scale-x-[-1]" />
          </button>

          <button
            onClick={handleSaveHero}
            disabled={!isDirty || saving}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              isDirty 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10' 
                : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Publish Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Assets */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Section: Visibility & Global Controls */}
          <div className="bg-slate-900/20 border border-slate-900/60 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-900">
              Hero Section State
            </h3>
            
            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/50 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-slate-200 block">Hero Visibility</span>
                <span className="text-[10px] text-slate-500 block">Toggle hero layout on frontend</span>
              </div>
              <button
                onClick={() => updateProfileWithHistory({ ...profile, heroVisibility: profile.heroVisibility === false ? true : false })}
                className={`px-3 py-1 text-[10px] font-mono rounded-lg border transition cursor-pointer ${
                  profile.heroVisibility !== false 
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10' 
                    : 'bg-rose-950/20 border-rose-500/20 text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                {profile.heroVisibility !== false ? '● Visible' : '○ Hidden'}
              </button>
            </div>
          </div>

          {/* Section: Avatar and Background Media Assets */}
          <div className="bg-slate-900/20 border border-slate-900/60 p-5 rounded-3xl space-y-6">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-900">
              Visual Media Assets
            </h3>

            {/* Avatar Image */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-slate-400">Hero Avatar Photo</label>
              <div className="flex items-center gap-4 p-3 bg-slate-950/40 border border-slate-850 rounded-2xl">
                <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {profile.heroAvatar ? (
                    <img src={profile.heroAvatar} alt="Hero Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div className="flex-grow space-y-1.5 min-w-0">
                  {profile.heroAvatar ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDeleteImage('avatar')}
                        className="px-2 py-1 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-900/20 hover:border-rose-800/45 text-[9px] font-mono rounded-lg transition cursor-pointer"
                      >
                        Delete Avatar
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          id="hero-avatar-file-input"
                          onChange={(e) => handleImageFileChange(e, 'avatar')}
                          className="hidden"
                        />
                        <label 
                          htmlFor="hero-avatar-file-input"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-mono rounded-xl transition cursor-pointer hover:text-emerald-400"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload Avatar</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMediaModalTarget('avatar')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold rounded-xl transition cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Media Library</span>
                      </button>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-500 font-mono truncate">{profile.heroAvatar || "No avatar loaded"}</p>
                </div>
              </div>
            </div>

            {/* Background Image */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-slate-400">Hero Landscape Background</label>
              <div className="space-y-2.5 p-3 bg-slate-950/40 border border-slate-850 rounded-2xl">
                <div className="w-full h-24 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden relative group">
                  {profile.heroBackground ? (
                    <img src={profile.heroBackground} alt="Hero Background Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-[9px] font-mono text-slate-600">No Custom Background</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex-grow">
                    {profile.heroBackground ? (
                      <button
                        onClick={() => handleDeleteImage('background')}
                        className="px-2.5 py-1 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-900/20 hover:border-rose-800/45 text-[9px] font-mono rounded-lg transition cursor-pointer"
                      >
                        Delete Background
                      </button>
                    ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          id="hero-bg-file-input"
                          onChange={(e) => handleImageFileChange(e, 'background')}
                          className="hidden"
                        />
                        <label 
                          htmlFor="hero-bg-file-input"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-mono rounded-xl transition cursor-pointer hover:text-emerald-400"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload Background</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMediaModalTarget('background')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold rounded-xl transition cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Media Library</span>
                      </button>
                    </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono truncate max-w-[150px]">{profile.heroBackground ? "Custom Background" : "Default Wallpaper"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section: Highlight Tags */}
          <div className="bg-slate-900/20 border border-slate-900/60 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-900">
              Highlight Tags
            </h3>
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-slate-400">Comma-Separated Highlight Tags</label>
              <input 
                type="text"
                value={profile.highlightTags || ""}
                onChange={(e) => updateProfileWithHistory({ ...profile, highlightTags: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                placeholder="e.g. #CloudNative, #HighConcurrency, #ZeroDowntime"
              />
              <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
                Tags are displayed as neon-bordered micro-pills next to the Hero Badge to establish quick competency focus.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Hero Content & Typography */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Card: Copy, Typography & Titles */}
          <div className="bg-slate-900/20 border border-slate-900/60 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-900">
              Copy, Typography & Titles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Hero Badge */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400">Hero Badge Text</label>
                <input 
                  type="text" 
                  value={profile.heroBadge || ""} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, heroBadge: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  placeholder="e.g. Full Stack Java Developer"
                />
              </div>

              {/* Hero Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400">Hero Display Name</label>
                <input 
                  type="text" 
                  value={profile.heroName || profile.fullName || ""} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, heroName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              {/* Hero Title */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400">Hero Display Title</label>
                <input 
                  type="text" 
                  value={profile.heroTitle || profile.title || ""} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, heroTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  placeholder="e.g. Principal Systems Architect"
                />
              </div>

              {/* Hero Subtitle */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400">Hero Display Subtitle</label>
                <input 
                  type="text" 
                  value={profile.heroSubtitle || profile.shortTagline || ""} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, heroSubtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  placeholder="e.g. Ecosystem Architect & Product Pioneer"
                />
              </div>

              {/* Hero Typing Animation list */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400">Typing Animation Words (Comma-Separated)</label>
                <input 
                  type="text" 
                  value={profile.typingText || ""} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, typingText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  placeholder="e.g. Systems Architect, Full-Stack Pioneer, Clean Code Advocate"
                />
                <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
                  Words will loop with a typing/deleting typewriter effect on the Hero textual overview.
                </p>
              </div>

              {/* Hero Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400">Hero Short Description</label>
                <textarea 
                  rows={3}
                  value={profile.heroDescription || profile.shortIntroduction || ""} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, heroDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-100 transition focus:outline-none resize-none leading-relaxed"
                  placeholder="I design and build resilient cloud systems, real-time analytics engines, and gorgeous web-based developer interfaces..."
                />
              </div>

            </div>
          </div>

          {/* Card: Hero Buttons Config */}
          <div className="bg-slate-900/20 border border-slate-900/60 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-900">
              Hero Call-to-Action Buttons
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Primary button Text */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400">Primary Button Text</label>
                <input 
                  type="text" 
                  value={profile.primaryCtaText || "Explore Engineering"} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, primaryCtaText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  placeholder="e.g. Explore Engineering"
                />
              </div>

              {/* Primary button Link */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400">Primary Button Target URL / ID</label>
                <input 
                  type="text" 
                  value={profile.primaryCtaUrl || "#projects"} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, primaryCtaUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  placeholder="e.g. #projects"
                />
              </div>

              {/* Secondary button Text */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400">Contact Button Text</label>
                <input 
                  type="text" 
                  value={profile.secondaryCtaText || "Get in Touch"} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, secondaryCtaText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  placeholder="e.g. Get in Touch"
                />
              </div>

              {/* Secondary button Link */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-slate-400">Contact Button Target URL / ID</label>
                <input 
                  type="text" 
                  value={profile.secondaryCtaUrl || "#contact"} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, secondaryCtaUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  placeholder="e.g. #contact"
                />
              </div>

              {/* Resume download text */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400">Resume Download Button Text</label>
                <input 
                  type="text" 
                  value={profile.resumeDownloadText || "View Resume"} 
                  onChange={(e) => updateProfileWithHistory({ ...profile, resumeDownloadText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                  placeholder="e.g. View Resume"
                />
              </div>

            </div>
          </div>

          {/* Card: Hero Statistics Operational Metrics builder */}
          <div className="bg-slate-900/20 border border-slate-900/60 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Hero Statistics (Operational Metrics)
              </h3>
              <span className="text-[10px] font-mono text-slate-500">{stats.length}/4 Active</span>
            </div>

            {/* List of active metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                  <div className="min-w-0">
                    <span className="text-sm font-bold font-mono text-white block">{stat.value}</span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block truncate">{stat.label}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveStat(index)}
                    className="p-1.5 bg-rose-950/15 border border-rose-950/40 hover:bg-rose-500/10 rounded-lg text-rose-400 transition cursor-pointer shrink-0"
                    title="Remove Metric"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add metric form */}
            {stats.length < 4 && (
              <div className="bg-slate-950/40 border border-slate-800/50 p-4 rounded-xl space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Add New Operational Metric</span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Value (e.g. 8+)" 
                    value={newStatValue}
                    onChange={(e) => setNewStatValue(e.target.value)}
                    className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 flex-1 focus:outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Label (e.g. Years Exp)" 
                    value={newStatLabel}
                    onChange={(e) => setNewStatLabel(e.target.value)}
                    className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 flex-1 focus:outline-none"
                  />
                  <button
                    onClick={handleAddStat}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}
            
          </div>

        </div>

      </div>

      {/* Media Picker Modal */}
      <MediaLibraryModal
        isOpen={mediaModalTarget !== null}
        onClose={() => setMediaModalTarget(null)}
        onSelectMedia={(media) => {
          if (mediaModalTarget === 'avatar') {
            updateProfileWithHistory({ ...profile, heroAvatar: media.url });
          } else if (mediaModalTarget === 'background') {
            updateProfileWithHistory({ ...profile, heroBackground: media.url });
          }
          setMediaModalTarget(null);
          onTriggerToast(`Selected "${media.title}" from Media Library`, 'success');
        }}
        allowedTypes={['image', 'svg']}
      />

    </div>
  );
}

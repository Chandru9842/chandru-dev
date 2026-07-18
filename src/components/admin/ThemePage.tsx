import React, { useState } from 'react';
import { 
  Palette, Sliders, Layout, Sparkles, HelpCircle, Eye, RefreshCw, 
  Upload, Trash2, Check, Loader2, ArrowRight, ToggleLeft, ToggleRight, Type, Square, ShieldAlert, Video, Layers
} from 'lucide-react';
import { ThemeSettings, BackgroundConfig } from '../../data/cmsMockData';

interface ThemePageProps {
  theme: ThemeSettings | null;
  onSave: (theme: ThemeSettings) => Promise<void>;
  onReset: () => Promise<void>;
}

export default function ThemePage({ theme, onSave, onReset }: ThemePageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'colors' | 'backgrounds' | 'animations' | '3d' | 'typography' | 'buttons' | 'layout'>('colors');
  const [localTheme, setLocalTheme] = useState<ThemeSettings | null>(theme);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [previewBgKey, setPreviewBgKey] = useState<string | null>(null);

  // Synchronize local state with prop when theme prop changes initially
  React.useEffect(() => {
    if (theme && !localTheme) {
      setLocalTheme(theme);
    }
  }, [theme]);

  if (!localTheme) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
        <span className="font-mono text-xs">Loading theme configurations...</span>
      </div>
    );
  }

  const updateSetting = async (key: keyof ThemeSettings, value: any) => {
    const updated = { ...localTheme, [key]: value };
    setLocalTheme(updated);
    // Instant Live Preview trigger (save to DB on change without refreshing, matching the prompt)
    try {
      await onSave(updated);
    } catch (err) {
      console.error('Failed to auto-save theme change:', err);
    }
  };

  const updateBackgroundSetting = async (bgKey: 'heroBackground' | 'aboutBackground' | 'sectionBackgrounds' | 'footerBackground' | 'customWallpaper', nestedKey: keyof BackgroundConfig, value: any) => {
    const updatedBg = { ...localTheme[bgKey], [nestedKey]: value };
    const updated = { ...localTheme, [bgKey]: updatedBg };
    setLocalTheme(updated);
    try {
      await onSave(updated);
    } catch (err) {
      console.error('Failed to auto-save background theme change:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bgKey: 'heroBackground' | 'aboutBackground' | 'sectionBackgrounds' | 'footerBackground' | 'customWallpaper') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      
      const updatedBg = { 
        ...localTheme[bgKey], 
        src: dataUrl,
        type: type as any,
        enabled: true
      };
      const updated = { ...localTheme, [bgKey]: updatedBg };
      setLocalTheme(updated);
      
      try {
        await onSave(updated);
      } catch (err) {
        console.error('Failed to save uploaded background file:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to restore the default professional Emerald theme? This will overwrite all custom theme & layout configurations.")) {
      setIsResetting(true);
      try {
        await onReset();
        // Wait briefly for server state update to propagate
        const res = await fetch('/api/theme');
        if (res.ok) {
          const fresh = await res.json();
          setLocalTheme(fresh);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSave(localTheme);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-400" /> Theme & Appearance Manager
          </h2>
          <p className="text-xs text-slate-400">Completely customize the portfolio’s background images, typography styles, layout constraints, 3D animations, and branding colors dynamically.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-850 flex items-center gap-2 transition-all"
          >
            {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Reset Default
          </button>
          
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Theme
          </button>
        </div>
      </div>

      {/* Warning banner */}
      <div className="p-3 bg-slate-950/40 border border-emerald-500/15 rounded-xl flex items-start gap-3 text-[11px] text-emerald-400/90 font-mono">
        <ShieldAlert className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
        <div>
          <span className="font-bold uppercase text-emerald-400">Operational Mode: </span>
          Only Authenticated Admins can modify theme parameters. Every change instantly syncs to the central database and reflects in the live portfolio preview below.
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Sub Tabs & Customizer Panel (Col 7) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Sub Navigation */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-950 border border-slate-900 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('colors')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                activeSubTab === 'colors' ? 'bg-slate-900 text-emerald-400 border border-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Colors & Preset
            </button>
            <button
              onClick={() => setActiveSubTab('backgrounds')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                activeSubTab === 'backgrounds' ? 'bg-slate-900 text-emerald-400 border border-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Backgrounds
            </button>
            <button
              onClick={() => setActiveSubTab('animations')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                activeSubTab === 'animations' ? 'bg-slate-900 text-emerald-400 border border-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Animations
            </button>
            <button
              onClick={() => setActiveSubTab('3d')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                activeSubTab === '3d' ? 'bg-slate-900 text-emerald-400 border border-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Settings
            </button>
            <button
              onClick={() => setActiveSubTab('typography')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                activeSubTab === 'typography' ? 'bg-slate-900 text-emerald-400 border border-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Typography
            </button>
            <button
              onClick={() => setActiveSubTab('buttons')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                activeSubTab === 'buttons' ? 'bg-slate-900 text-emerald-400 border border-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Buttons
            </button>
            <button
              onClick={() => setActiveSubTab('layout')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                activeSubTab === 'layout' ? 'bg-slate-900 text-emerald-400 border border-emerald-500/15' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Layout
            </button>
          </div>

          {/* Active configuration panel */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            
            {/* 1. Theme Mode and Preset Colors */}
            {activeSubTab === 'colors' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800/80 pb-4">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Global Color Palette Settings
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Select theme modes and edit base colors. No coding required.</p>
                </div>

                {/* Theme Mode selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-slate-400">Theme Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'auto'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => updateSetting('themeMode', mode)}
                        className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                          localTheme.themeMode === mode 
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' 
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color pickers grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Primary Color</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                      <input
                        type="color"
                        value={localTheme.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={localTheme.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Secondary Color</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                      <input
                        type="color"
                        value={localTheme.secondaryColor}
                        onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={localTheme.secondaryColor}
                        onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Accent Color</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                      <input
                        type="color"
                        value={localTheme.accentColor}
                        onChange={(e) => updateSetting('accentColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={localTheme.accentColor}
                        onChange={(e) => updateSetting('accentColor', e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Text Color</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                      <input
                        type="color"
                        value={localTheme.textColor}
                        onChange={(e) => updateSetting('textColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={localTheme.textColor}
                        onChange={(e) => updateSetting('textColor', e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Background Color</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                      <input
                        type="color"
                        value={localTheme.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={localTheme.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Card Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Card Color</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                      <input
                        type="color"
                        value={localTheme.cardColor.substring(0, 7)}
                        onChange={(e) => updateSetting('cardColor', e.target.value + (localTheme.cardColor.substring(7) || '66'))}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={localTheme.cardColor}
                        onChange={(e) => updateSetting('cardColor', e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Border Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Border Color</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                      <input
                        type="color"
                        value={localTheme.borderColor.substring(0, 7)}
                        onChange={(e) => updateSetting('borderColor', e.target.value + (localTheme.borderColor.substring(7) || '33'))}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={localTheme.borderColor}
                        onChange={(e) => updateSetting('borderColor', e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Button Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Button Color</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                      <input
                        type="color"
                        value={localTheme.buttonColor}
                        onChange={(e) => updateSetting('buttonColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={localTheme.buttonColor}
                        onChange={(e) => updateSetting('buttonColor', e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Hover Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Hover Color</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                      <input
                        type="color"
                        value={localTheme.hoverColor}
                        onChange={(e) => updateSetting('hoverColor', e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={localTheme.hoverColor}
                        onChange={(e) => updateSetting('hoverColor', e.target.value)}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Gradient Colors */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Gradient Start & End</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                        <input
                          type="color"
                          value={localTheme.gradientStart}
                          onChange={(e) => updateSetting('gradientStart', e.target.value)}
                          className="w-6 h-6 rounded border-0 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono">{localTheme.gradientStart}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                        <input
                          type="color"
                          value={localTheme.gradientEnd}
                          onChange={(e) => updateSetting('gradientEnd', e.target.value)}
                          className="w-6 h-6 rounded border-0 cursor-pointer"
                        />
                        <span className="text-[9px] font-mono">{localTheme.gradientEnd}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Background Management */}
            {activeSubTab === 'backgrounds' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800/80 pb-4">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Section Backgrounds & Canvas Wallpapers
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Configure full background parameters, overlay filters, and custom media files for individual sections.</p>
                </div>

                <div className="space-y-4">
                  {([
                    { label: 'Hero Section Background', key: 'heroBackground' },
                    { label: 'About Section Background', key: 'aboutBackground' },
                    { label: 'Section Common Backgrounds', key: 'sectionBackgrounds' },
                    { label: 'Footer Background', key: 'footerBackground' },
                    { label: 'Custom Wallpaper Layer', key: 'customWallpaper' }
                  ] as const).map(({ label, key }) => {
                    const bg = localTheme[key];
                    const isPreviewActive = previewBgKey === key;

                    return (
                      <div key={key} className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 space-y-4 text-left">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-200">{label}</span>
                            <span className="text-[9px] font-mono text-emerald-400/80 block uppercase mt-0.5">Mode: {bg.type}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Enable/Disable Toggle */}
                            <button
                              type="button"
                              onClick={() => updateBackgroundSetting(key, 'enabled', !bg.enabled)}
                              className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                                bg.enabled 
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                                  : 'bg-slate-900 border-slate-800 text-slate-500'
                              }`}
                            >
                              {bg.enabled ? 'Enabled' : 'Disabled'}
                            </button>

                            {/* Preview Toggle */}
                            <button
                              type="button"
                              onClick={() => setPreviewBgKey(isPreviewActive ? null : key)}
                              className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all ${
                                isPreviewActive 
                                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' 
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {isPreviewActive ? 'Stop Preview' : 'Preview'}
                            </button>

                            {/* Delete/Clear source */}
                            <button
                              type="button"
                              onClick={() => updateBackgroundSetting(key, 'src', '')}
                              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-slate-500 transition-all"
                              title="Clear / Delete Image source"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Background configurations */}
                        {bg.enabled && (
                          <div className="space-y-4">
                            {/* Source and background type selector */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-mono text-slate-400 uppercase">Background Source Type</label>
                                <select
                                  value={bg.type}
                                  onChange={(e) => updateBackgroundSetting(key, 'type', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                                >
                                  <option value="image">Image Asset</option>
                                  <option value="video">Video Loop</option>
                                  <option value="animated">Animated Effect</option>
                                  <option value="gradient">Gradient Colors</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-mono text-slate-400 uppercase">Source URL / Upload File</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={bg.src.startsWith('data:') ? '[Uploaded File/Base64]' : bg.src}
                                    onChange={(e) => updateBackgroundSetting(key, 'src', e.target.value)}
                                    placeholder="Enter image / video URL..."
                                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                                  />
                                  
                                  <label className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 cursor-pointer flex items-center justify-center text-slate-300">
                                    <Upload className="w-4 h-4" />
                                    <input
                                      type="file"
                                      accept="image/*,video/*"
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(e, key)}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Sliders: Opacity, Blur, Brightness, Overlay */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                              {/* Opacity */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                                  <span>Opacity</span>
                                  <span>{Math.round(bg.opacity * 100)}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={bg.opacity}
                                  onChange={(e) => updateBackgroundSetting(key, 'opacity', parseFloat(e.target.value))}
                                  className="w-full accent-emerald-400 bg-slate-900"
                                />
                              </div>

                              {/* Blur */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                                  <span>Blur Filter</span>
                                  <span>{bg.blur}px</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="24"
                                  step="1"
                                  value={bg.blur}
                                  onChange={(e) => updateBackgroundSetting(key, 'blur', parseInt(e.target.value))}
                                  className="w-full accent-emerald-400 bg-slate-900"
                                />
                              </div>

                              {/* Brightness */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                                  <span>Brightness</span>
                                  <span>{Math.round(bg.brightness * 100)}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0.2"
                                  max="2"
                                  step="0.05"
                                  value={bg.brightness}
                                  onChange={(e) => updateBackgroundSetting(key, 'brightness', parseFloat(e.target.value))}
                                  className="w-full accent-emerald-400 bg-slate-900"
                                />
                              </div>

                              {/* Overlay Color */}
                              <div className="space-y-1">
                                <label className="block text-[10px] font-mono text-slate-400 uppercase">Overlay Color</label>
                                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                                  <input
                                    type="color"
                                    value={bg.overlayColor}
                                    onChange={(e) => updateBackgroundSetting(key, 'overlayColor', e.target.value)}
                                    className="w-5 h-5 rounded border-0 cursor-pointer"
                                  />
                                  <span className="text-[10px] font-mono text-slate-300">{bg.overlayColor}</span>
                                </div>
                              </div>
                            </div>

                            {/* Inline Visual Preview */}
                            {isPreviewActive && bg.src && (
                              <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-amber-500/20 bg-slate-950">
                                <div 
                                  className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                                  style={{
                                    backgroundImage: bg.type === 'image' ? `url(${bg.src})` : 'none',
                                    opacity: bg.opacity,
                                    filter: `blur(${bg.blur}px) brightness(${bg.brightness})`
                                  }}
                                >
                                  {bg.type === 'video' && (
                                    <video src={bg.src} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                  )}
                                  {bg.type === 'gradient' && (
                                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${localTheme.gradientStart}, ${localTheme.gradientEnd})` }} />
                                  )}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 text-center">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-slate-950/80 border border-amber-500/20 px-2 py-0.5 rounded shadow">
                                    Background Active Preview Layer
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Animations Settings */}
            {activeSubTab === 'animations' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800/80 pb-4">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Framer Motion & Interactive Canvas Physics
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Fine-tune responsive micro-animations, cursor overlays, particles, and entering speed multipliers.</p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-200">Global System Animations</span>
                      <span className="text-[10px] text-slate-400 block">Master switch to enable or disable all CSS/Framer motion movements</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSetting('animationsEnabled', !localTheme.animationsEnabled)}
                      className="text-emerald-400 focus:outline-none"
                    >
                      {localTheme.animationsEnabled ? (
                        <ToggleRight className="w-9 h-9 text-emerald-400 cursor-pointer" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-slate-600 cursor-pointer" />
                      )}
                    </button>
                  </div>

                  {localTheme.animationsEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Page transition */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-slate-400">Page Transition Motion</label>
                        <select
                          value={localTheme.pageTransition}
                          onChange={(e) => updateSetting('pageTransition', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="fade">Fade-In Stagger</option>
                          <option value="zoom">Scale Elastic Zoom</option>
                          <option value="slide">Slide From Right</option>
                          <option value="parallax">Parallax Layer Shift</option>
                          <option value="none">Instant (None)</option>
                        </select>
                      </div>

                      {/* Cursor effect */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono text-slate-400">Cursor Overlay Effect</label>
                        <select
                          value={localTheme.cursorEffect}
                          onChange={(e) => updateSetting('cursorEffect', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="none">Default Pointer</option>
                          <option value="sparkle">Sparkle Trail Particles</option>
                          <option value="trail">Ambient Cursor Halo</option>
                          <option value="invert">Inverting Glass Dot</option>
                        </select>
                      </div>

                      {/* Animation speed slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-slate-400">
                          <span>Animation Speed Scale</span>
                          <span>{localTheme.animationSpeed}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.25"
                          max="2.5"
                          step="0.25"
                          value={localTheme.animationSpeed}
                          onChange={(e) => updateSetting('animationSpeed', parseFloat(e.target.value))}
                          className="w-full accent-emerald-400 bg-slate-950 p-2 border border-slate-800 rounded-xl"
                        />
                      </div>

                      {/* Interactive checkboxes */}
                      <div className="space-y-3 bg-slate-950/60 p-3.5 border border-slate-850 rounded-xl">
                        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">Interactive Switches</span>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-300">Ambient Mouse Glow</span>
                          <input
                            type="checkbox"
                            checked={localTheme.mouseGlow}
                            onChange={(e) => updateSetting('mouseGlow', e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-300">Floating Objects Physics</span>
                          <input
                            type="checkbox"
                            checked={localTheme.floatingObjects}
                            onChange={(e) => updateSetting('floatingObjects', e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-300">Particles Layer Enabled</span>
                          <input
                            type="checkbox"
                            checked={localTheme.particlesEnabled}
                            onChange={(e) => updateSetting('particlesEnabled', e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-300">Glass Backdrops (Blur)</span>
                          <input
                            type="checkbox"
                            checked={localTheme.glassEffect}
                            onChange={(e) => updateSetting('glassEffect', e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. 3D settings */}
            {activeSubTab === '3d' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800/80 pb-4">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                    <Video className="w-4 h-4" /> Three.js & Fiber 3D Simulation Controls
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Configure parameters for ThreeJS canvas, orbital galaxies, lights, fog densities, and performance modes.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-200">Enable 3D Hero Render</span>
                      <span className="text-[10px] text-slate-400 block">Controls whether ThreeDHero canvas and orbits are loaded in hero header</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSetting('threeDEnabled', !localTheme.threeDEnabled)}
                      className="text-emerald-400 focus:outline-none"
                    >
                      {localTheme.threeDEnabled ? (
                        <ToggleRight className="w-9 h-9 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-slate-600" />
                      )}
                    </button>
                  </div>

                  {localTheme.threeDEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Interactive checkboxes */}
                      <div className="space-y-2 bg-slate-950/60 p-4 border border-slate-850 rounded-xl text-xs">
                        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">3D Scene Assets</span>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-300">Orbital Cosmic Galaxy</span>
                          <input
                            type="checkbox"
                            checked={localTheme.galaxyEnabled}
                            onChange={(e) => updateSetting('galaxyEnabled', e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-300">Stars Constellation field</span>
                          <input
                            type="checkbox"
                            checked={localTheme.starsEnabled}
                            onChange={(e) => updateSetting('starsEnabled', e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-300">Planet Earth wireframe model</span>
                          <input
                            type="checkbox"
                            checked={localTheme.planetEarthEnabled}
                            onChange={(e) => updateSetting('planetEarthEnabled', e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-300">Dev Laptop 3D model</span>
                          <input
                            type="checkbox"
                            checked={localTheme.laptopModelEnabled}
                            onChange={(e) => updateSetting('laptopModelEnabled', e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-300">Floating Tech Icons</span>
                          <input
                            type="checkbox"
                            checked={localTheme.floatingIconsEnabled}
                            onChange={(e) => updateSetting('floatingIconsEnabled', e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                        </div>
                      </div>

                      {/* Scene parameters */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono text-slate-400">Camera Movement Physics</label>
                          <select
                            value={localTheme.cameraMovement}
                            onChange={(e) => updateSetting('cameraMovement', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="none">Static Centered View</option>
                            <option value="rotate">Automatic Orbital Rotation</option>
                            <option value="pan">Slight Left/Right Panning</option>
                            <option value="follow">Mouse Direction Following</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono text-slate-400 uppercase">Lighting Intensity</label>
                            <input
                              type="number"
                              min="0"
                              max="3"
                              step="0.1"
                              value={localTheme.lightingIntensity}
                              onChange={(e) => updateSetting('lightingIntensity', parseFloat(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono text-slate-400 uppercase">Fog Density</label>
                            <input
                              type="number"
                              min="0"
                              max="0.1"
                              step="0.005"
                              value={localTheme.fogDensity}
                              onChange={(e) => updateSetting('fogDensity', parseFloat(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                          <div>
                            <span className="text-[11px] font-mono font-bold text-slate-300">Performance Eco Mode</span>
                            <span className="text-[9px] text-slate-500 block">Lowers pixel ratio on slow or high-res screens</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={localTheme.performanceMode}
                            onChange={(e) => updateSetting('performanceMode', e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Typography settings */}
            {activeSubTab === 'typography' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800/80 pb-4">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                    <Type className="w-4 h-4" /> Google Fonts & Layout Sizing Scale
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Configure base visual typography elements, headings, body text, line-height, and letter-spacings.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Font family */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Heading Typography Font</label>
                    <select
                      value={localTheme.headingFont}
                      onChange={(e) => updateSetting('headingFont', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-sans"
                    >
                      <option value="Space Grotesk">Space Grotesk (Tech Geometric)</option>
                      <option value="Inter">Inter (Swiss Corporate)</option>
                      <option value="JetBrains Mono">JetBrains Mono (Sleek Hacker)</option>
                      <option value="Outfit">Outfit (Clean Display)</option>
                      <option value="Playfair Display">Playfair Display (Serif Elegance)</option>
                    </select>
                  </div>

                  {/* Body font */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Body Paragraph Font</label>
                    <select
                      value={localTheme.bodyFont}
                      onChange={(e) => updateSetting('bodyFont', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Inter">Inter (Highly Legible Sans)</option>
                      <option value="Outfit">Outfit (Slightly Rounded)</option>
                      <option value="JetBrains Mono">JetBrains Mono (Technical Flat)</option>
                      <option value="system-ui">Standard System UI Default</option>
                    </select>
                  </div>

                  {/* Base size */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Base Font Size Scale</label>
                    <select
                      value={localTheme.fontSizeBase}
                      onChange={(e) => updateSetting('fontSizeBase', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="sm">Small Compact (13px)</option>
                      <option value="base">Standard Medium (15px)</option>
                      <option value="lg">Expanded Large (17px)</option>
                      <option value="xl">Bigger Display (19px)</option>
                    </select>
                  </div>

                  {/* Letter spacing */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Letter Tracking (Spacing)</label>
                    <select
                      value={localTheme.letterSpacing}
                      onChange={(e) => updateSetting('letterSpacing', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="tighter">Tightest tracking</option>
                      <option value="tight">Slightly compressed</option>
                      <option value="normal">Default letters spacing</option>
                      <option value="wide">Wide display style</option>
                      <option value="widest">Extreme tracking wide</option>
                    </select>
                  </div>

                  {/* Line height */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Paragraph Line Height (Leading)</label>
                    <select
                      value={localTheme.lineHeight}
                      onChange={(e) => updateSetting('lineHeight', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="none">Zero padding</option>
                      <option value="tight">Tight</option>
                      <option value="snug">Snug</option>
                      <option value="normal">Normal spacing</option>
                      <option value="relaxed">Relaxed / Breathable</option>
                      <option value="loose">Loose display spacing</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Buttons customizations */}
            {activeSubTab === 'buttons' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800/80 pb-4">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                    <Square className="w-4 h-4" /> CTA & Primary Button Styles
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Design the geometric shape, border radius, outer shadow depths, and micro-hover glow effects of clickable triggers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Button shape */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Button Shape Preset</label>
                    <select
                      value={localTheme.buttonShape}
                      onChange={(e) => {
                        const val = e.target.value;
                        const rMap: any = { square: '0px', rounded: '0.75rem', pill: '9999px' };
                        const updated = { ...localTheme, buttonShape: val as any, buttonBorderRadius: rMap[val] };
                        setLocalTheme(updated);
                        onSave(updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="square">Sharp Square Corners</option>
                      <option value="rounded">Organic Rounded Edges</option>
                      <option value="pill">Pill Shape (Fully Oval)</option>
                    </select>
                  </div>

                  {/* Border Radius manual input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Custom Border Radius CSS</label>
                    <input
                      type="text"
                      value={localTheme.buttonBorderRadius}
                      onChange={(e) => updateSetting('buttonBorderRadius', e.target.value)}
                      placeholder="e.g. 0.75rem, 8px"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono focus:border-emerald-500/50"
                    />
                  </div>

                  {/* Button Shadow */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Shadow Depth Layer</label>
                    <select
                      value={localTheme.buttonShadow}
                      onChange={(e) => updateSetting('buttonShadow', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="none">Flat (No Shadow)</option>
                      <option value="sm">Subtle Low Shadow</option>
                      <option value="md">Medium Elegant Depth</option>
                      <option value="lg">Large High Contrast</option>
                      <option value="xl">Bento Float Shadow</option>
                      <option value="glow">Neon Glow Border Aura</option>
                    </select>
                  </div>

                  {/* Hover effect */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Mouse Hover Action</label>
                    <select
                      value={localTheme.buttonHoverEffect}
                      onChange={(e) => updateSetting('buttonHoverEffect', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="none">Instant Hover Color State</option>
                      <option value="scale">Elastic Bounce Scale</option>
                      <option value="lift">Elegant Vertical Lift</option>
                      <option value="shine">Sweep Light Shine Flash</option>
                    </select>
                  </div>

                  {/* Button animation looping */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Looping Idle Animation</label>
                    <select
                      value={localTheme.buttonAnimation}
                      onChange={(e) => updateSetting('buttonAnimation', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="none">Static (Default)</option>
                      <option value="pulse">Soft Breath Pulse (Glow)</option>
                      <option value="bounce">Subtle Periodic Bounce</option>
                      <option value="wiggle">Playful Accent Wiggle</option>
                    </select>
                  </div>

                  {/* Toggle button glow */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-850 mt-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-300">Active LED Border Glow</span>
                      <span className="text-[9px] text-slate-500 block">Emits a soft visual aura behind buttons</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localTheme.buttonGlow}
                      onChange={(e) => updateSetting('buttonGlow', e.target.checked)}
                      className="accent-emerald-400 w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. Layout settings */}
            {activeSubTab === 'layout' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800/80 pb-4">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                    <Layout className="w-4 h-4" /> Global Container Bounds & Grid Spacings
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Configure page horizontal alignments, container widths, spacing density, and navigation panels.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Container width */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Maximum Container Width</label>
                    <select
                      value={localTheme.containerWidth}
                      onChange={(e) => updateSetting('containerWidth', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="max-w-5xl">5XL Tight (1024px)</option>
                      <option value="max-w-6xl">6XL Balanced (1152px)</option>
                      <option value="max-w-7xl">7XL standard wide (1280px)</option>
                      <option value="max-w-full">Full Cinematic Screen (100%)</option>
                    </select>
                  </div>

                  {/* Sidebar Width */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Admin Sidebar Width</label>
                    <select
                      value={localTheme.sidebarWidth}
                      onChange={(e) => updateSetting('sidebarWidth', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="w-60">Narrow (240px)</option>
                      <option value="w-64">Medium Standard (256px)</option>
                      <option value="w-72">Wide (288px)</option>
                      <option value="w-80">Cinematic (320px)</option>
                    </select>
                  </div>

                  {/* Navbar Style */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Navbar Glassmorphic Style</label>
                    <select
                      value={localTheme.navbarStyle}
                      onChange={(e) => updateSetting('navbarStyle', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="glass">Blurry Frosted Glass</option>
                      <option value="solid">Opaque Solid Fill</option>
                      <option value="transparent">Fully Transparent Minimalist</option>
                    </select>
                  </div>

                  {/* Footer Style */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Footer Grid Structure</label>
                    <select
                      value={localTheme.footerStyle}
                      onChange={(e) => updateSetting('footerStyle', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="simple">Simple Centerline Copyright</option>
                      <option value="centered">Segmented links centered</option>
                      <option value="detailed">Expanded Bento grid directory</option>
                    </select>
                  </div>

                  {/* Layout spacing */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Grid Vertical padding Density</label>
                    <select
                      value={localTheme.layoutSpacing}
                      onChange={(e) => updateSetting('layoutSpacing', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="compact">Compact tight gap padding</option>
                      <option value="normal">Standard balanced breathing gap</option>
                      <option value="relaxed">Expanded generous spacing margins</option>
                    </select>
                  </div>

                  {/* Layout Border Radius */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-400">Card & Panel Border Radius</label>
                    <select
                      value={localTheme.layoutBorderRadius}
                      onChange={(e) => updateSetting('layoutBorderRadius', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="none">Flat Sharp Right Corners</option>
                      <option value="sm">Small Corner Radius (4px)</option>
                      <option value="md">Medium Corner Radius (8px)</option>
                      <option value="lg">Large Corner Radius (12px)</option>
                      <option value="xl">Extra Large (16px / Default)</option>
                      <option value="2xl">Hyper Rounded Curved (24px)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Settings Code View / Schema Blueprint Card (Col 5) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Live Interactive Preview
            </h3>
            
            <p className="text-[11px] text-slate-400">
              The layout container below simulates how elements will render on your portfolio with your active color customizations, layout widths, button styling, and fonts.
            </p>

            {/* Dynamic element simulation */}
            <div 
              className="p-5 border rounded-xl space-y-5 transition-all text-left overflow-hidden relative"
              style={{
                backgroundColor: localTheme.backgroundColor,
                color: localTheme.textColor,
                fontFamily: `'${localTheme.bodyFont}', sans-serif`,
                borderColor: localTheme.borderColor,
                borderRadius: localTheme.layoutBorderRadius === 'none' ? '0px' : 
                              localTheme.layoutBorderRadius === 'sm' ? '0.25rem' :
                              localTheme.layoutBorderRadius === 'md' ? '0.375rem' :
                              localTheme.layoutBorderRadius === 'lg' ? '0.5rem' :
                              localTheme.layoutBorderRadius === 'xl' ? '1rem' : '1.5rem',
              }}
            >
              {/* Background preview simulation wrapper */}
              <div 
                className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none transition-all duration-300"
                style={{
                  backgroundImage: localTheme.heroBackground.enabled && localTheme.heroBackground.type === 'image' && localTheme.heroBackground.src ? `url(${localTheme.heroBackground.src})` : 'none',
                  filter: `blur(${localTheme.heroBackground.blur}px)`
                }}
              />

              {/* Title heading simulation */}
              <div className="space-y-1 relative z-10">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em]" style={{ color: localTheme.accentColor }}>
                  {localTheme.headingFont} Font Header
                </span>
                <h1 
                  className="text-lg font-extrabold leading-tight tracking-tight"
                  style={{
                    fontFamily: `'${localTheme.headingFont}', sans-serif`,
                    fontSize: localTheme.fontSizeBase === 'sm' ? '1.125rem' : 
                              localTheme.fontSizeBase === 'base' ? '1.25rem' : 
                              localTheme.fontSizeBase === 'lg' ? '1.5rem' : '1.875rem'
                  }}
                >
                  Interactive Design System
                </h1>
              </div>

              {/* Card element simulation */}
              <div 
                className="p-4 border relative z-10 transition-all duration-300"
                style={{
                  backgroundColor: localTheme.cardColor,
                  borderColor: localTheme.borderColor,
                  borderRadius: localTheme.layoutBorderRadius === 'none' ? '0px' : 
                                localTheme.layoutBorderRadius === 'sm' ? '0.25rem' :
                                localTheme.layoutBorderRadius === 'md' ? '0.375rem' :
                                localTheme.layoutBorderRadius === 'lg' ? '0.5rem' :
                                localTheme.layoutBorderRadius === 'xl' ? '0.75rem' : '1.25rem',
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: `${localTheme.primaryColor}22`,
                      color: localTheme.primaryColor,
                      border: `1px solid ${localTheme.primaryColor}44`
                    }}
                  >
                    A
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Portfolio Glassmorphic Card</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Border radius is customized dynamically</span>
                  </div>
                </div>
              </div>

              {/* Button styling preview */}
              <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all`}
                  style={{
                    backgroundColor: localTheme.buttonColor,
                    color: '#000',
                    borderRadius: localTheme.buttonBorderRadius,
                    boxShadow: localTheme.buttonShadow === 'glow' ? `0 0 15px ${localTheme.primaryColor}` : 'none',
                    fontFamily: `'${localTheme.headingFont}', sans-serif`
                  }}
                >
                  Action Button
                  <ArrowRight className="w-3 h-3" />
                </button>

                <span className="text-[9px] font-mono text-slate-400">
                  Shape: <span className="text-slate-200">{localTheme.buttonShape}</span>
                </span>
              </div>
            </div>

            {/* Live Database Document State JSON (Highly technical & satisfying) */}
            <div className="space-y-2">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">ThemeSettings DB Schema Blueprint</span>
              <pre className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-[9px] text-emerald-400 font-mono overflow-x-auto max-h-48 text-left">
                {JSON.stringify(localTheme, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Settings, Sliders, Globe, Code2, ShieldAlert, Check, Loader2, 
  HelpCircle, Eye, Radio, AlertCircle
} from 'lucide-react';
import { SettingsConfig } from '../../data/cmsMockData';

interface SettingsPageProps {
  settings: SettingsConfig;
  onSave: (settings: SettingsConfig) => Promise<void>;
}

export default function SettingsPage({ settings, onSave }: SettingsPageProps) {
  // System Form states
  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription);
  const [metaKeywords, setMetaKeywords] = useState(settings.metaKeywords);
  const [themeColor, setThemeColor] = useState(settings.themeColor);
  const [analyticsId, setAnalyticsId] = useState(settings.analyticsId);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(settings.isMaintenanceMode);
  const [allowContact, setAllowContact] = useState(settings.allowContact);

  // Status
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!siteName.trim()) tempErrors.siteName = "Site SEO Name is required.";
    if (!siteDescription.trim()) tempErrors.siteDescription = "Site SEO Description is required.";
    if (analyticsId && !analyticsId.startsWith('G-')) {
      tempErrors.analyticsId = "Google Analytics Measurement IDs should begin with 'G-'.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave({
        siteName,
        siteDescription,
        metaKeywords,
        themeColor,
        analyticsId,
        isMaintenanceMode,
        allowContact
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">System Settings & CMS Controls</h2>
        <p className="text-xs text-slate-400">Configure global metadata tags, SEO presets, Google Analytics integrations, and maintenance configurations.</p>
      </div>

      <form onSubmit={handleSystemSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: General & SEO Configuration (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* General Metadata card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" /> General SEO Configuration
            </h3>

            <div className="space-y-4">
              {/* Site Title */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Site Title *</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.siteName ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'
                  }`}
                  placeholder="e.g. Alex Dev Portfolio"
                  required
                />
                {errors.siteName && (
                  <span className="text-[10px] text-rose-500 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.siteName}
                  </span>
                )}
              </div>

              {/* Site Description */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Site Description *</label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  rows={4}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 ${
                    errors.siteDescription ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'
                  }`}
                  placeholder="Tell search engines who you are..."
                  required
                />
                {errors.siteDescription && (
                  <span className="text-[10px] text-rose-500 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.siteDescription}
                  </span>
                )}
              </div>

              {/* Meta Keywords */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Meta Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                  placeholder="e.g. portfolio, react developer, fullstack engineer"
                />
              </div>
            </div>
          </div>

          {/* Third Party Integrations card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4" /> Integrations & Telemetry
            </h3>

            <div className="space-y-4">
              {/* Google Analytics ID */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-mono text-slate-400">Google Analytics Measurement ID</label>
                  <span className="text-[9px] font-mono text-slate-500">Requires production build</span>
                </div>
                <input
                  type="text"
                  value={analyticsId}
                  onChange={(e) => setAnalyticsId(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500/50 ${
                    errors.analyticsId ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'
                  }`}
                  placeholder="e.g. G-XXXXXX"
                />
                {errors.analyticsId && (
                  <span className="text-[10px] text-rose-500 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.analyticsId}
                  </span>
                )}
              </div>

              {/* Theme Primary Palette */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">CMS Theme Hex Accent Override</label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0">
                    <div className="w-6 h-6 rounded-lg shadow-inner transition-colors" style={{ backgroundColor: themeColor }} />
                  </div>
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none"
                    placeholder="e.g. #10B981"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Server Toggle Controls (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" /> System States
            </h3>

            <div className="space-y-4">
              {/* Maintenance Mode Toggle */}
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Maintenance Mode</span>
                  <span className="text-[10px] text-slate-500 block leading-normal">Halts public-facing traffic with an adaptive countdown screen.</span>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isMaintenanceMode}
                    onChange={(e) => setIsMaintenanceMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-400" />
                </label>
              </div>

              {/* Allow Contact Toggle */}
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Accept Incoming Messages</span>
                  <span className="text-[10px] text-slate-500 block leading-normal">Exposes lead forms and triggers automated email confirmation triggers.</span>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowContact}
                    onChange={(e) => setAllowContact(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-400" />
                </label>
              </div>
            </div>
          </div>

          {/* Quick System specs */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">System Specifications</h4>
            
            <div className="space-y-2 font-mono text-[10px] text-slate-500">
              <p className="flex justify-between">
                <span>Vite Version:</span>
                <span className="text-slate-300">6.2.3</span>
              </p>
              <p className="flex justify-between">
                <span>React Version:</span>
                <span className="text-slate-300">19.0.1</span>
              </p>
              <p className="flex justify-between">
                <span>Tailwind CSS:</span>
                <span className="text-slate-300">v4 (Embedded Plugin)</span>
              </p>
              <p className="flex justify-between">
                <span>Container Host:</span>
                <span className="text-emerald-400">Cloud Run Ingress</span>
              </p>
            </div>
          </div>

          {/* Commit Save Action block */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 shadow-xl">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving config...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  Save System Settings
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

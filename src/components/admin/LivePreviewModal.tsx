import React, { useState } from 'react';
import { 
  Monitor, Tablet, Smartphone, Moon, Sun, RefreshCw, X, 
  ExternalLink, Layers, Sparkles, CheckCircle2, ShieldCheck, Maximize2, Minimize2
} from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LivePreviewModal({ isOpen, onClose }: LivePreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [activeSection, setActiveSection] = useState('hero');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const getWidthClass = () => {
    switch (deviceMode) {
      case 'mobile': return 'w-[390px] max-w-full h-[720px] max-h-full border-[10px] border-slate-800 rounded-[38px] shadow-2xl my-auto shrink-0';
      case 'tablet': return 'w-[768px] max-w-full h-[800px] max-h-full border-[8px] border-slate-800 rounded-[28px] shadow-2xl my-auto shrink-0';
      case 'desktop': return 'w-full h-full rounded-xl border border-slate-800/80';
    }
  };

  const sections = [
    { id: 'hero', label: 'Hero' },
    { id: 'about', label: 'About' },
    { id: 'techstack', label: 'Tech Stack' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'contact', label: 'Contact' }
  ];

  const previewUrl = `/?preview=true&theme=${themeMode}&section=${activeSection}&t=${refreshKey}`;

  return (
    <div className={`fixed inset-0 z-[130] flex flex-col bg-slate-950/95 backdrop-blur-xl ${
      isFullscreen ? 'p-0' : 'p-3 sm:p-5'
    }`}>
      {/* Control Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              Live Real-Time CMS Preview
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ACTIVE SYNC
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Instantly previews edits across all screen break-points</p>
          </div>
        </div>

        {/* Devices, Theme & Control buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Device toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold transition-all ${
                deviceMode === 'desktop' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold transition-all ${
                deviceMode === 'tablet' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold transition-all ${
                deviceMode === 'mobile' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Theme mode simulator */}
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className="p-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold transition-all"
          >
            {themeMode === 'dark' ? <Moon className="w-3.5 h-3.5 text-emerald-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="uppercase">{themeMode}</span>
          </button>

          {/* Refresh preview */}
          <button
            type="button"
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Open in new tab */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">New Tab</span>
          </a>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Quick Jump Section Navbar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-1.5 mb-3 flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-xs">
        <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Section Jump:</span>
        {sections.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors shrink-0 ${
              activeSection === s.id ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            #{s.label}
          </button>
        ))}
      </div>

      {/* Embedded Device Frame Container */}
      <div className="flex-1 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-center p-2 sm:p-4 overflow-auto relative min-h-0">
        <div className={`transition-all duration-300 relative overflow-hidden bg-slate-950 ${getWidthClass()}`}>
          <iframe
            key={refreshKey}
            src={previewUrl}
            title="Portfolio Live Preview"
            className="w-full h-full rounded-xl bg-slate-950 border-0"
          />
        </div>
      </div>
    </div>
  );
}

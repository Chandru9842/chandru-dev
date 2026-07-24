import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Moon, Sun, Sparkles, ArrowLeft } from 'lucide-react';

interface PublicPreviewWrapperProps {
  children: React.ReactNode;
}

export default function PublicPreviewWrapper({ children }: PublicPreviewWrapperProps) {
  const [isIframe, setIsIframe] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile' | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Detect if running inside an iframe (e.g. CMS LivePreview modal or device preview frame)
    const inIframe = window.self !== window.top;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('preview');
    const theme = params.get('theme');

    // If running in an iframe or explicitly requested with preview=iframe, disable outer device frame
    setIsIframe(inIframe || mode === 'iframe');

    if (mode === 'mobile') setPreviewMode('mobile');
    else if (mode === 'tablet') setPreviewMode('tablet');
    else if (mode === 'desktop' || mode === 'true') setPreviewMode('desktop');
    else setPreviewMode(null);

    if (theme === 'light') setThemeMode('light');
    else setThemeMode('dark');
  }, []);

  // If inside iframe or no preview parameter, render children directly without outer device wrapper
  if (isIframe || !previewMode) {
    return <>{children}</>;
  }

  const updatePreviewMode = (newMode: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewMode(newMode);
    const params = new URLSearchParams(window.location.search);
    params.set('preview', newMode);
    window.history.replaceState(null, '', `?${params.toString()}`);
  };

  const toggleThemeMode = () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
    const params = new URLSearchParams(window.location.search);
    params.set('theme', newTheme);
    window.history.replaceState(null, '', `?${params.toString()}`);
  };

  const getDeviceFrameClass = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-[390px] h-[740px] max-h-[82vh] border-[8px] border-slate-800 rounded-[38px] shadow-2xl my-auto shrink-0 bg-[#030712] relative overflow-hidden';
      case 'tablet':
        return 'w-[768px] max-w-full h-[840px] max-h-[82vh] border-[8px] border-slate-800 rounded-[28px] shadow-2xl my-auto shrink-0 bg-[#030712] relative overflow-hidden';
      case 'desktop':
      default:
        return 'w-full h-full max-w-[1400px] border border-slate-800/80 rounded-2xl bg-[#030712] relative overflow-hidden shadow-2xl';
    }
  };

  const iframeSrc = `/?preview=iframe&theme=${themeMode}`;

  return (
    <div className="min-h-screen h-screen bg-slate-950 text-slate-100 font-sans flex flex-col p-3 sm:p-5 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Preview Control Header Bar */}
      <header className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-2xl z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Device Layout Preview
              </h1>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                {previewMode} ({previewMode === 'mobile' ? '390px' : previewMode === 'tablet' ? '768px' : 'Responsive Desktop'})
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Active viewport breakpoint simulation with responsive media rendering</p>
          </div>
        </div>

        {/* Device Switcher & Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => updatePreviewMode('desktop')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
                previewMode === 'desktop' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => updatePreviewMode('tablet')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
                previewMode === 'tablet' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => updatePreviewMode('mobile')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
                previewMode === 'mobile' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <button
            type="button"
            onClick={toggleThemeMode}
            className="p-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            {themeMode === 'dark' ? <Moon className="w-3.5 h-3.5 text-emerald-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="uppercase">{themeMode}</span>
          </button>

          <a
            href="/"
            className="p-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold transition-all"
            title="Exit Preview Mode"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Exit Preview</span>
          </a>
        </div>
      </header>

      {/* Main Container Viewport Frame */}
      <main className="flex-1 w-full bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center justify-center p-2 sm:p-4 overflow-hidden relative min-h-0">
        <div className={`transition-all duration-300 ${getDeviceFrameClass()}`}>
          <iframe
            src={iframeSrc}
            className="w-full h-full border-0 bg-[#030712] rounded-[inherit]"
            title="Device Layout Preview Frame"
          />
        </div>
      </main>
    </div>
  );
}

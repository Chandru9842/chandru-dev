import React, { useState, useEffect } from 'react';
import { Search, Save, Globe, Share2, FileCode, Check, RefreshCw, Smartphone, Eye, ExternalLink, Image as ImageIcon, Sparkles, Folder, Trash2 } from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';

// Notify all open tabs & previews of CMS updates
const notifyCmsUpdate = () => {
  try {
    localStorage.setItem('cms_update_timestamp', Date.now().toString());
    window.dispatchEvent(new CustomEvent('cms-data-updated', { detail: { timestamp: Date.now() } }));
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'CMS_DATA_UPDATED', timestamp: Date.now() }, '*');
    }
  } catch (e) {}
};

export default function SEOManagerPage({ triggerToast }: { triggerToast: (msg: string, type: 'success' | 'error') => void }) {
  const [saving, setSaving] = useState(false);
  const [mediaModalTarget, setMediaModalTarget] = useState<'websiteLogo' | 'faviconUrl' | 'ogImage' | null>(null);
  const [seoConfig, setSeoConfig] = useState<any>({
    metaTitle: 'Chandru Mohan | Principal Systems Architect & Full Stack Java Developer',
    metaDescription: 'Enterprise portfolio of Chandru Mohan featuring high-scale distributed systems, Java 21, Spring Boot microservices, Kafka event streams, and cloud architecture.',
    keywords: 'Chandru Mohan, Systems Architect, Full Stack Java Developer, Spring Boot, Kafka, React, Cloud, Microservices, TypeScript',
    ogTitle: 'Chandru Mohan - Principal Systems Architect Portfolio CMS',
    ogDescription: 'Architecting high-performance cloud applications & resilient enterprise platforms.',
    ogImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    websiteLogo: '',
    faviconUrl: '/favicon.svg',
    twitterCard: 'summary_large_image',
    twitterSite: '@chandru_dev',
    robotsTxt: 'User-agent: *\nAllow: /\nSitemap: https://chandru-dev-lime.vercel.app/sitemap.xml',
    pwaEnabled: true,
    offlineMode: true,
    highContrastMode: false
  });

  useEffect(() => {
    fetch('/api/seo')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          let merged = { ...seoConfig, ...data };
          try {
            const overridesStr = localStorage.getItem('cms_profile_overrides');
            if (overridesStr) {
              const overrides = JSON.parse(overridesStr);
              if (overrides.websiteLogo !== undefined) merged.websiteLogo = overrides.websiteLogo;
              if (overrides.faviconUrl !== undefined) merged.faviconUrl = overrides.faviconUrl;
              if (overrides.seoTitle) merged.metaTitle = overrides.seoTitle;
              if (overrides.seoDescription) merged.metaDescription = overrides.seoDescription;
              if (overrides.seoKeywords) merged.keywords = overrides.seoKeywords;
            }
          } catch (e) {}
          setSeoConfig(merged);
        }
      })
      .catch(() => triggerToast('Failed to load SEO configuration', 'error'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const res = await fetch('/api/seo', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(seoConfig)
      });
      if (res.ok) {
        try {
          const overridesStr = localStorage.getItem('cms_profile_overrides');
          const overrides = overridesStr ? JSON.parse(overridesStr) : {};
          overrides.websiteLogo = seoConfig.websiteLogo || '';
          overrides.logoUrl = seoConfig.websiteLogo || '';
          overrides.faviconUrl = seoConfig.faviconUrl || '';
          overrides.seoTitle = seoConfig.metaTitle;
          overrides.seoDescription = seoConfig.metaDescription;
          overrides.seoKeywords = seoConfig.keywords;
          overrides.ogTitle = seoConfig.ogTitle;
          overrides.ogImage = seoConfig.ogImage;
          localStorage.setItem('cms_profile_overrides', JSON.stringify(overrides));
        } catch (e) {}

        notifyCmsUpdate();
        triggerToast('SEO, Site Logo & Browser Favicon configurations updated successfully!', 'success');
      } else {
        throw new Error('Failed to update SEO configuration');
      }
    } catch (e: any) {
      triggerToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              SEO, Brand Logo & Favicon Engine
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Search Engine Optimization
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Configure browser tab search favicon, site navbar logo, Google metadata, social share cards, and XML sitemaps.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save & Publish Live</span>
        </button>
      </div>

      {/* Visual Identity: Site Logo & Tab Favicon */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Brand Visual Assets (Site Navbar Logo & Browser Tab Favicon)
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Separated from personal profile photo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Main Website / Navbar Logo */}
          <div className="border border-slate-850 bg-slate-950/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold font-mono text-slate-200">Main Navbar / Site Brand Logo</h4>
                <p className="text-[10px] text-slate-500 font-mono">Displayed top-left in the sticky website header</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMediaModalTarget('websiteLogo')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Folder className="w-3 h-3" />
                  Media Library
                </button>
                {seoConfig.websiteLogo && (
                  <button
                    type="button"
                    onClick={() => setSeoConfig({ ...seoConfig, websiteLogo: '' })}
                    className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center overflow-hidden shrink-0">
                {seoConfig.websiteLogo ? (
                  <img src={seoConfig.websiteLogo} alt="Site Logo" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-luxury font-bold text-emerald-400 text-xl">C</span>
                )}
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <input
                  type="text"
                  value={seoConfig.websiteLogo || ''}
                  onChange={(e) => setSeoConfig({ ...seoConfig, websiteLogo: e.target.value })}
                  placeholder="https://example.com/site-logo.png or SVG URL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[9px] text-slate-500 font-mono">If left empty, a clean neon monogram ("C") will be displayed.</p>
              </div>
            </div>
          </div>

          {/* Browser Tab Favicon */}
          <div className="border border-slate-850 bg-slate-950/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold font-mono text-slate-200">Browser Tab Search Favicon (.svg / .ico / .png)</h4>
                <p className="text-[10px] text-slate-500 font-mono">Appears in browser tabs and search engine result listings</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMediaModalTarget('faviconUrl')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Folder className="w-3 h-3" />
                  Media Library
                </button>
                {seoConfig.faviconUrl && seoConfig.faviconUrl !== '/favicon.svg' && (
                  <button
                    type="button"
                    onClick={() => setSeoConfig({ ...seoConfig, faviconUrl: '/favicon.svg' })}
                    className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Reset to Default Favicon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-slate-900/50 border border-slate-800/80 rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src={seoConfig.faviconUrl || '/favicon.svg'} 
                  alt="Favicon Preview" 
                  className="w-8 h-8 object-contain" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <input
                  type="text"
                  value={seoConfig.faviconUrl || ''}
                  onChange={(e) => setSeoConfig({ ...seoConfig, faviconUrl: e.target.value })}
                  placeholder="/favicon.svg or https://example.com/favicon.png"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[9px] text-slate-500 font-mono">Dynamic head synchronizer replaces all icon links immediately.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Google Search Result Live Preview Snippet */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          Live Google Search Result Preview
        </span>
        <div className="p-4 bg-white/[0.02] border border-slate-850 rounded-2xl space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
            <img src={seoConfig.faviconUrl || '/favicon.svg'} alt="Favicon" className="w-4 h-4 rounded-sm object-contain" />
            <span className="text-slate-300 font-medium">https://chandru-dev-lime.vercel.app</span>
          </div>
          <h4 className="text-base text-blue-400 hover:underline font-medium cursor-pointer">
            {seoConfig.metaTitle || "Chandru Mohan | Principal Systems Architect"}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
            {seoConfig.metaDescription || "Enterprise portfolio of Chandru Mohan featuring high-scale distributed systems, Java 21, Spring Boot microservices, Kafka event streams, and cloud architecture."}
          </p>
        </div>
      </div>

      {/* Primary Search Engine Meta Tags */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search Engine Metadata (Google / Bing)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Meta Title Tag</label>
            <input
              type="text"
              value={seoConfig.metaTitle}
              onChange={(e) => setSeoConfig({ ...seoConfig, metaTitle: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Meta Keywords</label>
            <input
              type="text"
              value={seoConfig.keywords}
              onChange={(e) => setSeoConfig({ ...seoConfig, keywords: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-slate-400 mb-1">Meta Description</label>
            <textarea
              rows={3}
              value={seoConfig.metaDescription}
              onChange={(e) => setSeoConfig({ ...seoConfig, metaDescription: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Social Cards (OpenGraph & Twitter) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Social Share Cards (OpenGraph & Twitter)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">OpenGraph Title</label>
            <input
              type="text"
              value={seoConfig.ogTitle}
              onChange={(e) => setSeoConfig({ ...seoConfig, ogTitle: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono text-slate-400">Social Preview Image URL</label>
              <button
                type="button"
                onClick={() => setMediaModalTarget('ogImage')}
                className="text-[9px] font-mono text-emerald-400 hover:underline"
              >
                Media Library
              </button>
            </div>
            <input
              type="text"
              value={seoConfig.ogImage}
              onChange={(e) => setSeoConfig({ ...seoConfig, ogImage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Twitter Handle</label>
            <input
              type="text"
              value={seoConfig.twitterSite}
              onChange={(e) => setSeoConfig({ ...seoConfig, twitterSite: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Sitemap & Robots.txt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Dynamic Sitemap (/sitemap.xml)
            </h3>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 hover:underline"
            >
              <span>View XML</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Auto-generated XML sitemap featuring all active projects, skills, case studies, and section routes.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <FileCode className="w-4 h-4" />
            Robots.txt Rules
          </h3>
          <textarea
            rows={3}
            value={seoConfig.robotsTxt}
            onChange={(e) => setSeoConfig({ ...seoConfig, robotsTxt: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaLibraryModal
        isOpen={mediaModalTarget !== null}
        onClose={() => setMediaModalTarget(null)}
        onSelectMedia={(media) => {
          if (mediaModalTarget) {
            setSeoConfig({ ...seoConfig, [mediaModalTarget]: media.url });
          }
          setMediaModalTarget(null);
          triggerToast(`Selected "${media.title}" from Media Library`, 'success');
        }}
        allowedTypes={['image', 'svg']}
      />

    </div>
  );
}

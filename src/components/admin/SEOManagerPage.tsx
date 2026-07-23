import React, { useState, useEffect } from 'react';
import { Search, Save, Globe, Share2, FileCode, Check, RefreshCw, Smartphone, Eye, ExternalLink } from 'lucide-react';

export default function SEOManagerPage({ triggerToast }: { triggerToast: (msg: string, type: 'success' | 'error') => void }) {
  const [saving, setSaving] = useState(false);
  const [seoConfig, setSeoConfig] = useState<any>({
    metaTitle: 'Alex Dev | Senior Full Stack Architect & Systems Engineer',
    metaDescription: 'Enterprise portfolio of Alex Dev featuring high-scale distributed systems, microservices, cloud infrastructure, and AI applications.',
    keywords: 'Software Engineer, Full Stack Architect, React, Node.js, Cloud, Microservices, TypeScript',
    ogTitle: 'Alex Dev - Enterprise Portfolio CMS',
    ogDescription: 'Architecting high-performance cloud applications & resilient enterprise platforms.',
    ogImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    twitterCard: 'summary_large_image',
    twitterSite: '@alex_dev_arch',
    robotsTxt: 'User-agent: *\nAllow: /\nSitemap: https://alexdev.io/sitemap.xml',
    pwaEnabled: true,
    offlineMode: true,
    highContrastMode: false
  });

  useEffect(() => {
    fetch('/api/seo')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSeoConfig((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch(() => triggerToast('Failed to load SEO configuration', 'error'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seoConfig)
      });
      if (res.ok) {
        triggerToast('SEO & PWA configurations updated successfully!', 'success');
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              SEO, OpenGraph, PWA & Accessibility Engine
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Search Engine Optimization
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Automated sitemap.xml, robots.txt, social share cards, PWA manifest, and WCAG accessibility tools.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save SEO Configuration</span>
        </button>
      </div>

      {/* Primary Search Engine Meta Tags */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
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
            <label className="block text-xs font-mono text-slate-400 mb-1">Social Preview Image URL</label>
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
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
    </div>
  );
}

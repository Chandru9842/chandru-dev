import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, BookOpen, Cpu, Award, Briefcase, GraduationCap, Mail, Folder, Shield, ArrowRight, CornerDownLeft } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabName: string) => void;
  allData: {
    projects?: any[];
    skills?: any[];
    certificates?: any[];
    experiences?: any[];
    education?: any[];
    messages?: any[];
    mediaItems?: any[];
    codingProfiles?: any[];
  };
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigateTab,
  allData
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent or key handler
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search through all modules
  const results = [];

  if (q) {
    // Projects
    (allData.projects || []).forEach(p => {
      if (p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)) {
        results.push({
          type: 'Project',
          title: p.title,
          subtitle: p.category || 'Portfolio Project',
          tab: 'Projects',
          icon: <BookOpen className="w-4 h-4 text-emerald-400" />
        });
      }
    });

    // Skills
    (allData.skills || []).forEach(s => {
      if (s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q)) {
        results.push({
          type: 'Skill',
          title: s.name,
          subtitle: `${s.category} • Proficiency: ${s.proficiency || 'Advanced'}%`,
          tab: 'Skills',
          icon: <Cpu className="w-4 h-4 text-emerald-400" />
        });
      }
    });

    // Messages
    (allData.messages || []).forEach(m => {
      if (m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q) || m.message?.toLowerCase().includes(q)) {
        results.push({
          type: 'Message',
          title: `Message from ${m.name}`,
          subtitle: m.subject || m.message?.slice(0, 50),
          tab: 'Messages',
          icon: <Mail className="w-4 h-4 text-emerald-400" />
        });
      }
    });

    // Certificates
    (allData.certificates || []).forEach(c => {
      if (c.title?.toLowerCase().includes(q) || c.issuer?.toLowerCase().includes(q)) {
        results.push({
          type: 'Certificate',
          title: c.title,
          subtitle: c.issuer,
          tab: 'Certificates',
          icon: <Award className="w-4 h-4 text-emerald-400" />
        });
      }
    });

    // Experience
    (allData.experiences || []).forEach(e => {
      if (e.role?.toLowerCase().includes(q) || e.company?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)) {
        results.push({
          type: 'Experience',
          title: `${e.role} at ${e.company}`,
          subtitle: `${e.period || ''}`,
          tab: 'Experience',
          icon: <Briefcase className="w-4 h-4 text-emerald-400" />
        });
      }
    });

    // Media
    (allData.mediaItems || []).forEach(m => {
      if (m.title?.toLowerCase().includes(q) || m.folder?.toLowerCase().includes(q)) {
        results.push({
          type: 'Media Asset',
          title: m.title,
          subtitle: `${m.folder} • ${m.type}`,
          tab: 'Media Manager',
          icon: <Folder className="w-4 h-4 text-emerald-400" />
        });
      }
    });
  }

  // Quick Nav Options when query is empty
  const quickNav = [
    { label: 'Projects & Case Studies', tab: 'Projects', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
    { label: 'Skills & Architecture', tab: 'Skills', icon: <Cpu className="w-4 h-4 text-emerald-400" /> },
    { label: 'Visitor Analytics & Metrics', tab: 'Analytics', icon: <Briefcase className="w-4 h-4 text-emerald-400" /> },
    { label: 'Messages & Contact Inbox', tab: 'Messages', icon: <Mail className="w-4 h-4 text-emerald-400" /> },
    { label: 'Security & Audit Logs', tab: 'Security Settings', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
    { label: 'System Health & Logs', tab: 'System Health', icon: <Cpu className="w-4 h-4 text-emerald-400" /> },
    { label: 'Backup & Restore Manager', tab: 'Backup Manager', icon: <Folder className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-950/60">
            <Search className="w-5 h-5 text-emerald-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search everything across CMS (Projects, Skills, Messages, Media, Logs...)"
              className="w-full bg-transparent text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results or Quick Nav */}
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
            {q ? (
              results.length > 0 ? (
                results.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onNavigateTab(res.tab);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 transition text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-emerald-500/30 shrink-0">
                        {res.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {res.type}
                          </span>
                          <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-emerald-300">
                            {res.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                          {res.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 group-hover:text-emerald-400 shrink-0 ml-2">
                      <span>Jump</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center text-xs font-mono text-slate-500">
                  No matches found for "{query}". Try searching for projects, skills, or messages.
                </div>
              )
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-1">
                  Quick Navigation Shortcuts
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickNav.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onNavigateTab(item.tab);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/60 transition text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span className="text-xs font-mono font-medium text-slate-300 group-hover:text-emerald-300">
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">ESC</kbd> to exit</span>
            <span>Enterprise Global Index</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

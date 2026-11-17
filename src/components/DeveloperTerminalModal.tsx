import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, X, Maximize2, Minimize2, 
  Check, Copy, Mail, AlertCircle, Sparkles, Move, Minus,
  Cpu, Layers, Palette, Compass, Zap, Play
} from 'lucide-react';
import {
  ProjectItem,
  SkillItem,
  ExperienceItem,
  EducationItem,
  PortfolioMetricItem,
  initialProjects,
  initialSkills,
  initialExperiences,
  initialEducation,
  initialPortfolioMetrics,
  initialProfile
} from '../data/cmsMockData';
import { notifyCmsUpdate } from '../utils/notifyCmsSync';

export interface PortfolioStateMutation {
  type:
    | 'SET_THEME'
    | 'SET_HERO_BADGE'
    | 'SET_AVAILABILITY'
    | 'TOGGLE_PROJECT_FEATURED'
    | 'FILTER_PROJECTS'
    | 'SET_PROJECT_VIEW'
    | 'BOOST_SKILL'
    | 'SET_METRIC'
    | 'TOGGLE_3D_CORE'
    | 'SCROLL_SECTION'
    | 'NAVIGATE_ROUTE'
    | 'OPEN_CMS'
    | 'PULSE_TELEMETRY'
    | 'RESET_STATE';
  payload?: any;
}

export interface DeveloperTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: ProjectItem[];
  skills?: SkillItem[];
  experiences?: ExperienceItem[];
  education?: EducationItem[];
  metrics?: PortfolioMetricItem[];
  profile?: any;
  currentRoute?: string;
  onNavigate?: (routeOrTab: string) => void;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: React.ReactNode;
  timestamp: string;
  badge?: string;
}

const COMMAND_LIST = [
  'help',
  'state',
  'status',
  'theme emerald',
  'theme cyan',
  'theme violet',
  'theme amber',
  'theme rose',
  'badge set',
  'availability online',
  'project feature',
  'projects --filter',
  'projects --view grid',
  'projects --view showcase',
  'skill boost',
  'metric set',
  '3d toggle',
  'pulse',
  'goto projects',
  'goto skills',
  'goto experience',
  'goto contact',
  'goto admin',
  'goto explorer',
  'goto schema',
  'whoami',
  'skills',
  'projects',
  'experience',
  'education',
  'contact',
  'metrics',
  'sudo hire chandru',
  'reset',
  'clear',
  'exit'
];

const THEME_PRESETS: Record<string, { primary: string; secondary: string; label: string }> = {
  emerald: { primary: '#10b981', secondary: '#06b6d4', label: 'Emerald Cyber Core (#10b981)' },
  cyan: { primary: '#06b6d4', secondary: '#3b82f6', label: 'Quantum Cyan Mesh (#06b6d4)' },
  violet: { primary: '#8b5cf6', secondary: '#ec4899', label: 'Deep Nebula Violet (#8b5cf6)' },
  amber: { primary: '#f59e0b', secondary: '#10b981', label: 'Solaris Gold Matrix (#f59e0b)' },
  rose: { primary: '#f43f5e', secondary: '#8b5cf6', label: 'Crimson Plasma (#f43f5e)' },
};

export function dispatchPortfolioMutation(mutation: PortfolioStateMutation) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio-cli-mutation', { detail: mutation }));
  }
}

function TerminalHireForm({ onClose }: { onClose: () => void }) {
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Senior Full-Stack Engineer / Lead Architect');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'smtp' | 'relay' | 'activation_needed' | 'cms_only'>('smtp');
  const [statusNote, setStatusNote] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [error, setError] = useState('');

  const targetEmail = "chandrumohan550@gmail.com";

  const dynamicSubject = encodeURIComponent(
    roleTitle 
      ? `Interview Opportunity: ${roleTitle} (${companyName || 'Engineering Role'})`
      : `Software Engineering Opportunity for Chandru Mohan`
  );
  
  const dynamicBody = encodeURIComponent(
    `Hi Chandru,\n\n` +
    (recruiterName || companyName 
      ? `I am ${recruiterName || 'a recruiter'}${companyName ? ` from ${companyName}` : ''}.\n\n` 
      : `I came across your interactive architecture portfolio and was impressed by your engineering work.\n\n`) +
    (message 
      ? `${message}\n\n` 
      : `We would love to schedule a brief introductory call to discuss a ${roleTitle || 'Senior Full-Stack / Systems Architect'} opportunity with our engineering team.\n\n`) +
    `Best regards,\n` +
    `${recruiterName || '[Your Name]'}\n` +
    `${recruiterEmail ? `Email: ${recruiterEmail}` : ''}`
  );

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${dynamicSubject}&body=${dynamicBody}`;
  const defaultMailtoUrl = `mailto:${targetEmail}?subject=${dynamicSubject}&body=${dynamicBody}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(targetEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleDirectSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruiterName.trim() || !recruiterEmail.trim() || !message.trim()) {
      setError('Please fill in your Name, Email, and Message.');
      return;
    }

    setError('');
    setIsSending(true);
    setStatusNote('Saving to Portfolio CMS Inbox & dispatching to chandrumohan550@gmail.com...');

    const subjectLine = `🚀 [Terminal Hire Request] ${roleTitle || 'Engineering Role'} at ${companyName || 'Organization'} — from ${recruiterName}`;
    const formattedMessage = `Recruiter / Sender: ${recruiterName}\nEmail: ${recruiterEmail}\nCompany: ${companyName || 'Not specified'}\nRole / Position: ${roleTitle || 'Not specified'}\n\nMessage:\n${message}`;

    let backendSaved = false;
    let backendSmtpSent = false;
    let relaySent = false;
    let relayNeedsActivation = false;

    try {
      const cmsRes = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: `${recruiterName}${companyName ? ` (${companyName})` : ''}`,
          name: `${recruiterName}${companyName ? ` (${companyName})` : ''}`,
          senderEmail: recruiterEmail,
          email: recruiterEmail,
          subject: subjectLine,
          messageContent: formattedMessage,
          message: formattedMessage
        })
      });

      if (cmsRes.ok) {
        backendSaved = true;
        const cmsData = await cmsRes.json().catch(() => ({}));
        if (cmsData.emailDelivered) {
          backendSmtpSent = true;
        }
      }

      if (!backendSmtpSent) {
        try {
          const relayRes = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              name: recruiterName,
              email: recruiterEmail,
              _replyto: recruiterEmail,
              company: companyName || 'Direct Recruiter Outreach',
              role: roleTitle || 'Full-Stack / Backend Architect',
              _subject: subjectLine,
              message: message,
              _template: 'table',
              _captcha: 'false'
            })
          });

          const relayData = await relayRes.json().catch(() => ({}));
          const relayMsg = String(relayData?.message || '').toLowerCase();

          if (relayRes.ok && (relayData?.success === 'true' || relayData?.success === true)) {
            relaySent = true;
          } else if (relayMsg.includes('activate') || relayMsg.includes('confirm') || relayMsg.includes('activation')) {
            relayNeedsActivation = true;
          }
        } catch {
          // Ignore external relay network errors
        }
      }

      notifyCmsUpdate();

      if (backendSmtpSent) {
        setDeliveryMode('smtp');
      } else if (relaySent) {
        setDeliveryMode('relay');
      } else if (relayNeedsActivation) {
        setDeliveryMode('activation_needed');
      } else if (backendSaved) {
        setDeliveryMode('cms_only');
      }

      setIsSent(true);
    } catch {
      setError('Network error while dispatching message. Please use the 1-Click Gmail button below.');
    } finally {
      setIsSending(false);
      setStatusNote('');
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="space-y-3 text-xs font-mono py-3 px-4 bg-emerald-950/25 border border-emerald-500/40 rounded-xl my-1 shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
        <p className="text-emerald-400 font-bold text-sm flex items-center gap-2">
          <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>⚡ Direct Interview & Hire Dispatcher [sudo hire chandru]</span>
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-slate-900/90 border border-slate-700 text-cyan-300 px-2 py-0.5 rounded font-mono">
            To: {targetEmail}
          </span>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] border border-slate-700 transition cursor-pointer flex items-center gap-1"
          >
            {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {isSent ? (
        <div className="bg-slate-900/90 border border-emerald-500/50 rounded-xl p-4 space-y-3 text-slate-200">
          <div className="flex items-start gap-2.5 text-emerald-400 font-bold text-xs">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p>✓ Message Recorded in Chandru&apos;s Admin CMS Inbox!</p>
              {deliveryMode === 'smtp' && (
                <p className="text-[11px] text-emerald-300/90 font-normal mt-1">
                  Delivered directly to <span className="text-white font-semibold">{targetEmail}</span> via authenticated SMTP.
                </p>
              )}
              {deliveryMode === 'relay' && (
                <p className="text-[11px] text-emerald-300/90 font-normal mt-1">
                  Dispatched to <span className="text-white font-semibold">{targetEmail}</span> and saved to the Admin CMS Messages tab.
                </p>
              )}
              {(deliveryMode === 'activation_needed' || deliveryMode === 'cms_only') && (
                <p className="text-[11px] text-amber-300/90 font-normal mt-1">
                  Saved in the Admin CMS Messages Inbox! To also send an instant copy from your own email address to <span className="text-white font-semibold">{targetEmail}</span>, click Gmail or Mail App below:
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2.5">
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Also Open in Gmail Web (1-Click Send) ↗</span>
            </a>

            <a
              href={defaultMailtoUrl}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Open Default Mail App ↗</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setIsSent(false);
                setMessage('');
              }}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition cursor-pointer ml-auto"
            >
              Send Another Message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleDirectSend} className="space-y-3">
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Fill out the quick dispatch form below to send your interview invitation directly to <span className="text-emerald-300 font-bold">{targetEmail}</span> &amp; Chandru&apos;s Admin Inbox:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 rounded-lg bg-slate-900/95 border border-slate-700/80 focus:border-emerald-400 text-slate-100 text-xs outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Your Work Email *</label>
              <input
                type="email"
                required
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="e.g. sarah@company.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-900/95 border border-slate-700/80 focus:border-emerald-400 text-slate-100 text-xs outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Company / Organization</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stripe / Google / Startup"
                className="w-full px-3 py-2 rounded-lg bg-slate-900/95 border border-slate-700/80 focus:border-emerald-400 text-slate-100 text-xs outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Role / Opportunity</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Java Full-Stack Engineer"
                className="w-full px-3 py-2 rounded-lg bg-slate-900/95 border border-slate-700/80 focus:border-emerald-400 text-slate-100 text-xs outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Message / Interview Details *</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi Chandru, we reviewed your portfolio and would love to schedule a technical interview..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900/95 border border-slate-700/80 focus:border-emerald-400 text-slate-100 text-xs outline-none transition resize-y"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-950/40 border border-rose-500/30 px-3 py-2 rounded-lg text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {statusNote && (
            <p className="text-cyan-300 text-[11px] animate-pulse">{statusNote}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="submit"
              disabled={isSending}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isSending ? 'Dispatching to Chandru...' : '🚀 Send Direct Message Now'}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={gmailComposeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Open in Gmail ↗</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-[11px] transition cursor-pointer"
              >
                Scroll to Contact Form
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function DeveloperTerminalModal({
  isOpen,
  onClose,
  projects: propProjects,
  skills: propSkills,
  experiences: propExperiences,
  education: propEducation,
  metrics: propMetrics,
  profile: propProfile,
  currentRoute,
  onNavigate
}: DeveloperTerminalModalProps) {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [pastCommands, setPastCommands] = useState<string[]>([]);
  const [windowMode, setWindowMode] = useState<'floating' | 'maximized' | 'minimized'>('floating');
  const [copied, setCopied] = useState(false);

  // Live synchronized portfolio state inside the console
  const [liveProjects, setLiveProjects] = useState<ProjectItem[]>(propProjects && propProjects.length > 0 ? propProjects : initialProjects);
  const [liveSkills, setLiveSkills] = useState<SkillItem[]>(propSkills && propSkills.length > 0 ? propSkills : initialSkills);
  const [liveExperiences, setLiveExperiences] = useState<ExperienceItem[]>(propExperiences && propExperiences.length > 0 ? propExperiences : initialExperiences);
  const [liveEducation, setLiveEducation] = useState<EducationItem[]>(propEducation && propEducation.length > 0 ? propEducation : initialEducation);
  const [liveMetrics, setLiveMetrics] = useState<PortfolioMetricItem[]>(propMetrics && propMetrics.length > 0 ? propMetrics : initialPortfolioMetrics);
  const [liveProfile, setLiveProfile] = useState<any>(propProfile && Object.keys(propProfile).length > 0 ? propProfile : initialProfile);
  const [activeThemeName, setActiveThemeName] = useState<string>('emerald');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [is3DCoreEnabled, setIs3DCoreEnabled] = useState<boolean>(true);
  const [mutationCount, setMutationCount] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Keep console state synced with props when passed from PortfolioFrontend
  useEffect(() => {
    if (propProjects && propProjects.length > 0) setLiveProjects(propProjects);
  }, [propProjects]);
  useEffect(() => {
    if (propSkills && propSkills.length > 0) setLiveSkills(propSkills);
  }, [propSkills]);
  useEffect(() => {
    if (propExperiences && propExperiences.length > 0) setLiveExperiences(propExperiences);
  }, [propExperiences]);
  useEffect(() => {
    if (propEducation && propEducation.length > 0) setLiveEducation(propEducation);
  }, [propEducation]);
  useEffect(() => {
    if (propMetrics && propMetrics.length > 0) setLiveMetrics(propMetrics);
  }, [propMetrics]);
  useEffect(() => {
    if (propProfile && Object.keys(propProfile).length > 0) setLiveProfile(propProfile);
  }, [propProfile]);

  // Also fetch live state from /api/portfolio when opened on Admin / Schema routes
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch('/api/portfolio')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data) return;
        if (Array.isArray(data.projects) && data.projects.length > 0) setLiveProjects(data.projects);
        if (Array.isArray(data.skills) && data.skills.length > 0) setLiveSkills(data.skills);
        if (Array.isArray(data.experiences) && data.experiences.length > 0) setLiveExperiences(data.experiences);
        if (Array.isArray(data.education) && data.education.length > 0) setLiveEducation(data.education);
        if (Array.isArray(data.portfolioMetrics) && data.portfolioMetrics.length > 0) setLiveMetrics(data.portfolioMetrics);
        if (data.profile && Object.keys(data.profile).length > 0) setLiveProfile(data.profile);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && windowMode !== 'minimized') {
      setTimeout(() => inputRef.current?.focus(), 120);
      scrollToBottom();
      if (history.length === 0) {
        setHistory([
          {
            id: 'init-1',
            command: 'console --attach-state',
            timestamp: new Date().toLocaleTimeString(),
            badge: 'STATE READY',
            output: (
              <div className="text-slate-300 space-y-2 font-mono text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-emerald-400 font-bold">
                    ⚡ Chandru Mohan [Developer Command Console • Live State Runtime]
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                    DRAGGABLE FLOATING HUD
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Connected to live portfolio state store. Run <span className="text-emerald-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">help</span> to view commands, <span className="text-cyan-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">state</span> to inspect live state, or mutate the UI in real time (e.g. <span className="text-amber-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">theme cyan</span>, <span className="text-amber-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">badge set CLOUD ARCHITECT</span>, <span className="text-amber-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">project feature 1</span>).
                </p>
              </div>
            )
          }
        ]);
      }
    }
  }, [isOpen, windowMode]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  };

  const handleCommandExecution = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setPastCommands(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const mainCmd = parts[0].toLowerCase();
    const subCmd = parts[1]?.toLowerCase() || '';
    const restArgs = parts.slice(2).join(' ');

    let outputNode: React.ReactNode = null;
    let badgeText: string | undefined = undefined;

    switch (mainCmd) {
      case 'help':
      case '?':
        badgeText = 'MANUAL';
        outputNode = (
          <div className="space-y-3 text-xs font-mono py-1">
            <div>
              <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>1. Live Portfolio State Mutation Commands:</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1.5 text-slate-300 bg-slate-900/60 border border-slate-800/90 rounded-xl p-2.5">
                <div><span className="text-amber-300 font-bold">state</span> — Inspect live portfolio state tree</div>
                <div><span className="text-amber-300 font-bold">theme &lt;emerald|cyan|violet|amber|rose&gt;</span> — Switch live UI accent</div>
                <div><span className="text-amber-300 font-bold">badge set &lt;TEXT&gt;</span> — Update live Hero badge text</div>
                <div><span className="text-amber-300 font-bold">availability &lt;online|available|busy&gt;</span> — Mutate status badge</div>
                <div><span className="text-amber-300 font-bold">project feature &lt;id|name&gt;</span> — Toggle project featured state</div>
                <div><span className="text-amber-300 font-bold">projects --filter &lt;All|Backend|Cloud&gt;</span> — Filter live projects</div>
                <div><span className="text-amber-300 font-bold">projects --view &lt;grid|showcase&gt;</span> — Switch project layout</div>
                <div><span className="text-amber-300 font-bold">skill boost &lt;name&gt; [99]</span> — Boost skill proficiency %</div>
                <div><span className="text-amber-300 font-bold">metric set &lt;index&gt; &lt;value&gt;</span> — Mutate live KPI metric card</div>
                <div><span className="text-amber-300 font-bold">3d toggle</span> — Toggle interactive 3D Core engine</div>
                <div><span className="text-amber-300 font-bold">pulse</span> — Fire real-time telemetry pulse event</div>
                <div><span className="text-amber-300 font-bold">reset</span> — Restore default portfolio state</div>
              </div>
            </div>

            <div>
              <p className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>2. Navigation, Inspection &amp; Direct Hire Commands:</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1.5 text-slate-300 bg-slate-900/60 border border-slate-800/90 rounded-xl p-2.5">
                <div><span className="text-cyan-400 font-bold">goto &lt;projects|skills|contact|admin|explorer|schema&gt;</span></div>
                <div><span className="text-cyan-400 font-bold">whoami</span> — Owner profile &amp; systems role</div>
                <div><span className="text-cyan-400 font-bold">skills [--backend|--frontend]</span> — Tech stack matrix</div>
                <div><span className="text-cyan-400 font-bold">projects [--featured]</span> — Scaled repositories</div>
                <div><span className="text-cyan-400 font-bold">experience / education / metrics</span> — Career &amp; KPIs</div>
                <div><span className="text-emerald-400 font-bold">sudo hire chandru</span> — Direct email dispatcher</div>
              </div>
            </div>
          </div>
        );
        break;

      case 'state':
      case 'status': {
        badgeText = 'STATE SNAPSHOT';
        const featuredCount = liveProjects.filter(p => p.isFeatured).length;
        const currentUrlPath = currentRoute || (typeof window !== 'undefined' ? window.location.pathname : '/');
        outputNode = (
          <div className="space-y-2.5 text-xs font-mono py-1">
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  Live Portfolio State Store (Redux/Event Sync)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Mutations: {mutationCount}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">OWNER IDENTITY</span>
                  <span className="text-slate-100 font-bold">{liveProfile?.fullName || 'Chandru Mohan'}</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">ACTIVE ROUTE</span>
                  <span className="text-cyan-300 font-bold">{currentUrlPath}</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">ACTIVE THEME</span>
                  <span className="text-emerald-400 font-bold uppercase">{activeThemeName}</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">HERO BADGE</span>
                  <span className="text-amber-300 font-bold truncate block">{liveProfile?.heroBadge || 'SENIOR CLOUD ARCHITECT'}</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">PROJECTS LOADED</span>
                  <span className="text-slate-100 font-bold">{liveProjects.length} ({featuredCount} Featured)</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">SKILLS &amp; 3D CORE</span>
                  <span className="text-emerald-300 font-bold">{liveSkills.length} Skills • 3D {is3DCoreEnabled ? 'ON' : 'OFF'}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">Quick Mutate:</span>
                {['theme cyan', 'theme emerald', 'projects --view grid', 'projects --view showcase', 'pulse'].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleCommandExecution(q)}
                    className="px-2 py-0.5 rounded bg-slate-950 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 text-cyan-300 text-[10px] transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
        break;
      }

      case 'theme': {
        const requestedTheme = (subCmd.replace('--', '') || 'emerald').toLowerCase();
        const preset = THEME_PRESETS[requestedTheme];
        if (!preset) {
          outputNode = (
            <div className="space-y-1.5 text-xs font-mono">
              <p className="text-amber-300">
                Usage: <span className="text-white font-bold">theme &lt;emerald|cyan|violet|amber|rose&gt;</span>
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.keys(THEME_PRESETS).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleCommandExecution(`theme ${t}`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-bold cursor-pointer"
                  >
                    theme {t}
                  </button>
                ))}
              </div>
            </div>
          );
          break;
        }

        setActiveThemeName(requestedTheme);
        setMutationCount(c => c + 1);
        document.documentElement.style.setProperty('--theme-primary', preset.primary);
        document.documentElement.style.setProperty('--theme-secondary', preset.secondary);

        dispatchPortfolioMutation({
          type: 'SET_THEME',
          payload: {
            primaryColor: preset.primary,
            secondaryColor: preset.secondary,
            name: requestedTheme
          }
        });

        const token = getAuthToken();
        if (token) {
          fetch('/api/theme', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              primaryColor: preset.primary,
              secondaryColor: preset.secondary
            })
          }).then(() => notifyCmsUpdate()).catch(() => {});
        }

        badgeText = 'STATE MUTATED';
        outputNode = (
          <div className="flex items-center gap-2.5 text-xs font-mono bg-slate-900/80 border border-emerald-500/30 px-3 py-2 rounded-xl">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/30"
              style={{ backgroundColor: preset.primary, boxShadow: `0 0 12px ${preset.primary}` }}
            />
            <div>
              <p className="text-emerald-400 font-bold">
                ✓ Portfolio Theme State Updated → {preset.label}
              </p>
              <p className="text-[11px] text-slate-400">
                Applied live CSS custom properties (<code className="text-cyan-300">--theme-primary: {preset.primary}</code>) across active viewport components.
              </p>
            </div>
          </div>
        );
        break;
      }

      case 'badge': {
        const badgeTextValue = subCmd === 'set' ? restArgs.trim() : parts.slice(1).join(' ').trim();
        if (!badgeTextValue) {
          outputNode = (
            <p className="text-amber-300 text-xs font-mono">
              Usage: <span className="text-white font-bold">badge set &lt;NEW HERO BADGE&gt;</span> (e.g. <code className="text-emerald-300">badge set PRINCIPAL CLOUD ARCHITECT</code>)
            </p>
          );
          break;
        }
        const finalBadge = badgeTextValue === 'reset' ? 'SENIOR CLOUD ARCHITECT' : badgeTextValue.toUpperCase();
        setLiveProfile((prev: any) => ({ ...prev, heroBadge: finalBadge }));
        setMutationCount(c => c + 1);

        dispatchPortfolioMutation({
          type: 'SET_HERO_BADGE',
          payload: { heroBadge: finalBadge }
        });

        const token = getAuthToken();
        if (token) {
          fetch('/api/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ...liveProfile,
              fullName: 'Chandru Mohan',
              email: 'chandrumohan550@gmail.com',
              heroBadge: finalBadge
            })
          }).then(() => notifyCmsUpdate()).catch(() => {});
        }

        badgeText = 'STATE MUTATED';
        outputNode = (
          <div className="text-xs font-mono bg-slate-900/80 border border-emerald-500/30 px-3 py-2 rounded-xl space-y-1">
            <p className="text-emerald-400 font-bold">
              ✓ Hero Badge State Updated → <span className="text-cyan-300">[{finalBadge}]</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Live Hero section badge mutated for Chandru Mohan.
            </p>
          </div>
        );
        break;
      }

      case 'availability': {
        const rawStatus = (subCmd || 'online').toLowerCase();
        const statusMap: Record<string, string> = {
          online: 'Online',
          available: 'Available for Work',
          open: 'Open to Opportunities',
          busy: 'In Deep Architecture Sprint'
        };
        const nextStatus = statusMap[rawStatus] || parts.slice(1).join(' ') || 'Online';
        setLiveProfile((prev: any) => ({ ...prev, availabilityStatus: nextStatus }));
        setMutationCount(c => c + 1);

        dispatchPortfolioMutation({
          type: 'SET_AVAILABILITY',
          payload: { availabilityStatus: nextStatus }
        });

        badgeText = 'STATE MUTATED';
        outputNode = (
          <div className="text-xs font-mono bg-slate-900/80 border border-emerald-500/30 px-3 py-2 rounded-xl">
            <p className="text-emerald-400 font-bold">
              ✓ Candidate Availability State → <span className="text-cyan-300">{nextStatus}</span>
            </p>
          </div>
        );
        break;
      }

      case 'project': {
        if (subCmd === 'feature' || subCmd === 'unfeature' || subCmd === 'toggle') {
          const targetQuery = restArgs.trim().toLowerCase();
          if (!targetQuery) {
            outputNode = (
              <p className="text-amber-300 text-xs font-mono">
                Usage: <span className="text-white font-bold">project feature &lt;project-id or title keyword&gt;</span> (e.g. <code className="text-emerald-300">project feature 1</code>)
              </p>
            );
            break;
          }

          const targetProject = liveProjects.find(
            (p, idx) =>
              String(p.id) === targetQuery ||
              String(idx + 1) === targetQuery ||
              p.title.toLowerCase().includes(targetQuery)
          );

          if (!targetProject) {
            outputNode = (
              <p className="text-rose-400 text-xs font-mono">
                Project matching &apos;{restArgs}&apos; not found. Run <span className="text-emerald-300 font-bold">projects</span> to list IDs.
              </p>
            );
            break;
          }

          const nextFeatured =
            subCmd === 'feature'
              ? true
              : subCmd === 'unfeature'
              ? false
              : !targetProject.isFeatured;

          const updatedProjects = liveProjects.map(p =>
            p.id === targetProject.id ? { ...p, isFeatured: nextFeatured } : p
          );
          setLiveProjects(updatedProjects);
          setMutationCount(c => c + 1);

          dispatchPortfolioMutation({
            type: 'TOGGLE_PROJECT_FEATURED',
            payload: { projectId: targetProject.id, isFeatured: nextFeatured }
          });

          const token = getAuthToken();
          if (token) {
            fetch(`/api/projects/${targetProject.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ ...targetProject, isFeatured: nextFeatured })
            }).then(() => notifyCmsUpdate()).catch(() => {});
          }

          badgeText = 'STATE MUTATED';
          outputNode = (
            <div className="text-xs font-mono bg-slate-900/80 border border-emerald-500/30 px-3 py-2 rounded-xl space-y-1">
              <p className="text-emerald-400 font-bold">
                ✓ Project [{targetProject.title}] → isFeatured: <span className="text-cyan-300">{String(nextFeatured)}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Portfolio project showcase state synchronized.
              </p>
            </div>
          );
          break;
        }
        outputNode = (
          <p className="text-amber-300 text-xs font-mono">
            Try <span className="text-emerald-300 font-bold">project feature 1</span> or <span className="text-emerald-300 font-bold">projects --featured</span>.
          </p>
        );
        break;
      }

      case 'skill': {
        if (subCmd === 'boost' || subCmd === 'set') {
          const skillArgs = parts.slice(2);
          if (skillArgs.length === 0) {
            outputNode = (
              <p className="text-amber-300 text-xs font-mono">
                Usage: <span className="text-white font-bold">skill boost &lt;skill-name&gt; [proficiency]</span> (e.g. <code className="text-emerald-300">skill boost Java 99</code>)
              </p>
            );
            break;
          }
          const lastArgNum = Number(skillArgs[skillArgs.length - 1]);
          const hasExplicitNum = !Number.isNaN(lastArgNum) && skillArgs.length > 1;
          const skillNameQuery = (hasExplicitNum ? skillArgs.slice(0, -1).join(' ') : skillArgs.join(' ')).toLowerCase();

          const matchedSkill = liveSkills.find(s => s.name.toLowerCase().includes(skillNameQuery));
          if (!matchedSkill) {
            outputNode = (
              <p className="text-rose-400 text-xs font-mono">
                Skill matching &apos;{skillNameQuery}&apos; not found. Run <span className="text-emerald-300 font-bold">skills</span> to inspect available skills.
              </p>
            );
            break;
          }

          const newProficiency = hasExplicitNum
            ? Math.max(10, Math.min(100, lastArgNum))
            : Math.min(100, (matchedSkill.proficiency || 90) + 5);

          setLiveSkills(prev =>
            prev.map(s => (s.id === matchedSkill.id ? { ...s, proficiency: newProficiency } : s))
          );
          setMutationCount(c => c + 1);

          dispatchPortfolioMutation({
            type: 'BOOST_SKILL',
            payload: { skillId: matchedSkill.id, name: matchedSkill.name, proficiency: newProficiency }
          });

          const token = getAuthToken();
          if (token) {
            fetch(`/api/skills/${matchedSkill.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ ...matchedSkill, proficiency: newProficiency })
            }).then(() => notifyCmsUpdate()).catch(() => {});
          }

          badgeText = 'STATE MUTATED';
          outputNode = (
            <div className="text-xs font-mono bg-slate-900/80 border border-emerald-500/30 px-3 py-2 rounded-xl">
              <p className="text-emerald-400 font-bold">
                ✓ Skill Proficiency Mutated: <span className="text-cyan-300">{matchedSkill.name}</span> → <span className="text-amber-300">{newProficiency}%</span>
              </p>
            </div>
          );
          break;
        }
        outputNode = (
          <p className="text-amber-300 text-xs font-mono">
            Try <span className="text-emerald-300 font-bold">skill boost Java 99</span> or <span className="text-emerald-300 font-bold">skills</span>.
          </p>
        );
        break;
      }

      case 'metric': {
        if (subCmd === 'set') {
          const targetIdxOrName = parts[2];
          const newValue = parts.slice(3).join(' ');
          if (!targetIdxOrName || !newValue) {
            outputNode = (
              <p className="text-amber-300 text-xs font-mono">
                Usage: <span className="text-white font-bold">metric set &lt;1..{liveMetrics.length}&gt; &lt;new-value&gt;</span> (e.g. <code className="text-emerald-300">metric set 1 24.8k+ RPS</code>)
              </p>
            );
            break;
          }
          const idx = Number(targetIdxOrName) - 1;
          const targetMetric =
            !Number.isNaN(idx) && liveMetrics[idx]
              ? liveMetrics[idx]
              : liveMetrics.find(m => m.title.toLowerCase().includes(targetIdxOrName.toLowerCase()));

          if (!targetMetric) {
            outputNode = (
              <p className="text-rose-400 text-xs font-mono">
                Metric not found. Run <span className="text-emerald-300 font-bold">metrics</span> to view indices.
              </p>
            );
            break;
          }

          setLiveMetrics(prev =>
            prev.map(m => (m.id === targetMetric.id ? { ...m, value: newValue } : m))
          );
          setMutationCount(c => c + 1);

          dispatchPortfolioMutation({
            type: 'SET_METRIC',
            payload: { metricId: targetMetric.id, value: newValue }
          });

          badgeText = 'STATE MUTATED';
          outputNode = (
            <div className="text-xs font-mono bg-slate-900/80 border border-emerald-500/30 px-3 py-2 rounded-xl">
              <p className="text-emerald-400 font-bold">
                ✓ Metric [{targetMetric.title}] Updated → <span className="text-cyan-300">{newValue}</span>
              </p>
            </div>
          );
          break;
        }
        outputNode = (
          <p className="text-amber-300 text-xs font-mono">
            Usage: <span className="text-emerald-300 font-bold">metric set 1 25k+ RPS</span> or <span className="text-emerald-300 font-bold">metrics</span>.
          </p>
        );
        break;
      }

      case '3d': {
        const next3D = subCmd === 'off' ? false : subCmd === 'on' ? true : !is3DCoreEnabled;
        setIs3DCoreEnabled(next3D);
        setMutationCount(c => c + 1);
        dispatchPortfolioMutation({
          type: 'TOGGLE_3D_CORE',
          payload: { enabled: next3D }
        });
        badgeText = '3D ENGINE';
        outputNode = (
          <div className="text-xs font-mono bg-slate-900/80 border border-emerald-500/30 px-3 py-2 rounded-xl">
            <p className="text-emerald-400 font-bold">
              ✓ 3D Cyber-Core Engine → <span className="text-cyan-300">{next3D ? 'ONLINE (60FPS WebGL)' : 'PAUSED (Low-Power Mode)'}</span>
            </p>
          </div>
        );
        break;
      }

      case 'pulse':
      case 'telemetry': {
        setMutationCount(c => c + 1);
        dispatchPortfolioMutation({
          type: 'PULSE_TELEMETRY',
          payload: { timestamp: Date.now() }
        });
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'cli_telemetry_pulse' })
        }).catch(() => {});

        const simulatedRps = (16400 + Math.floor(Math.random() * 3200)).toLocaleString();
        const simulatedLatency = (0.72 + Math.random() * 0.35).toFixed(2);
        badgeText = 'TELEMETRY PULSE';
        outputNode = (
          <div className="text-xs font-mono bg-slate-900/80 border border-cyan-500/30 px-3 py-2.5 rounded-xl space-y-1">
            <p className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>⚡ Cluster Telemetry Pulse Dispatched [ap-south-1 • Spring Boot 3.4]</span>
            </p>
            <p className="text-[11px] text-slate-300">
              Throughput: <span className="text-emerald-400 font-bold">{simulatedRps} RPS</span> • P99 Latency: <span className="text-emerald-400 font-bold">{simulatedLatency}ms</span> • Analytics Counter Incremented
            </p>
          </div>
        );
        break;
      }

      case 'goto':
      case 'nav':
      case 'cd': {
        const target = (subCmd || 'home').replace(/^\/+/, '').toLowerCase();
        badgeText = 'NAVIGATION';
        if (['admin', 'dashboard', 'cms'].includes(target)) {
          if (onNavigate) {
            onNavigate('/admin/dashboard');
          } else {
            dispatchPortfolioMutation({ type: 'OPEN_CMS' });
          }
          outputNode = (
            <p className="text-emerald-400 text-xs font-mono font-bold">
              ✓ Switching viewport to Interactive CMS Dashboard...
            </p>
          );
          break;
        }
        if (['explorer', 'schema'].includes(target)) {
          if (onNavigate) {
            onNavigate(target);
          } else {
            dispatchPortfolioMutation({ type: 'NAVIGATE_ROUTE', payload: { target } });
          }
          outputNode = (
            <p className="text-emerald-400 text-xs font-mono font-bold">
              ✓ Navigating to Architecture [{target.toUpperCase()}] module...
            </p>
          );
          break;
        }
        if (['portfolio', 'root', '~'].includes(target)) {
          if (onNavigate) onNavigate('/');
          outputNode = (
            <p className="text-emerald-400 text-xs font-mono font-bold">
              ✓ Navigating to Public Portfolio Home (/)...
            </p>
          );
          break;
        }

        // Scroll to section on portfolio page
        if (onNavigate && window.location.pathname.startsWith('/admin')) {
          onNavigate('/');
        }
        setTimeout(() => {
          dispatchPortfolioMutation({
            type: 'SCROLL_SECTION',
            payload: { section: target }
          });
          const el = document.getElementById(target);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else if (target === 'home' || target === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 80);

        outputNode = (
          <p className="text-emerald-400 text-xs font-mono font-bold">
            ✓ Smooth-scrolling viewport to section <span className="text-cyan-300">#{target}</span>
          </p>
        );
        break;
      }

      case 'reset': {
        setActiveThemeName('emerald');
        setActiveFilter('All');
        setIs3DCoreEnabled(true);
        document.documentElement.style.setProperty('--theme-primary', '#10b981');
        document.documentElement.style.setProperty('--theme-secondary', '#06b6d4');
        dispatchPortfolioMutation({ type: 'RESET_STATE' });
        badgeText = 'STATE RESET';
        outputNode = (
          <p className="text-emerald-400 text-xs font-mono font-bold">
            ✓ Portfolio UI state restored to default production baseline (Emerald Cyber Core).
          </p>
        );
        break;
      }

      case 'whoami':
      case 'bio':
        outputNode = (
          <div className="space-y-2 text-xs font-mono py-1 text-slate-200">
            <p className="text-emerald-400 font-bold text-sm">
              {liveProfile?.fullName || "Chandru Mohan"}
            </p>
            <p className="text-cyan-300 font-medium">
              {liveProfile?.heroTitle || "Principal Systems Architect & Full-Stack Developer"}
            </p>
            <p className="text-slate-300 leading-relaxed max-w-2xl">
              {liveProfile?.heroDescription || "Engineering resilient distributed platforms, high-performance web applications, and database architectures."}
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-slate-400">
              <span>📍 Bengaluru, India (Open to Remote)</span>
              <span>🟢 {liveProfile?.availabilityStatus || 'Online'}</span>
              <span>📧 {liveProfile?.email || "chandrumohan550@gmail.com"}</span>
            </div>
          </div>
        );
        break;

      case 'skills': {
        let filteredSkills = liveSkills;
        if (subCmd === '--backend') {
          filteredSkills = liveSkills.filter(s => (s.category || '').toLowerCase().includes('backend'));
        } else if (subCmd === '--frontend') {
          filteredSkills = liveSkills.filter(s => (s.category || '').toLowerCase().includes('frontend'));
        }

        outputNode = (
          <div className="space-y-2 text-xs font-mono py-1">
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              Technical Skills Matrix {subCmd ? `[${subCmd}]` : ''} (Tip: run &apos;skill boost Java 99&apos;):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {filteredSkills.map((s, idx) => (
                <span 
                  key={idx} 
                  className="bg-slate-900/90 border border-slate-700/80 text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-medium"
                >
                  {s.name} {s.proficiency ? <span className="text-cyan-400 text-[10px]">({s.proficiency}%)</span> : ''}
                </span>
              ))}
            </div>
          </div>
        );
        break;
      }

      case 'projects': {
        if (subCmd === '--filter' && restArgs) {
          const category = restArgs.trim();
          setActiveFilter(category);
          setMutationCount(c => c + 1);
          dispatchPortfolioMutation({
            type: 'FILTER_PROJECTS',
            payload: { category }
          });
          badgeText = 'STATE MUTATED';
          outputNode = (
            <p className="text-emerald-400 text-xs font-mono font-bold">
              ✓ Live Portfolio Projects filtered by category → <span className="text-cyan-300">[{category}]</span>
            </p>
          );
          break;
        }

        if (subCmd === '--view' && restArgs) {
          const mode = restArgs.trim().toLowerCase() === 'grid' ? 'grid' : 'showcase';
          setMutationCount(c => c + 1);
          dispatchPortfolioMutation({
            type: 'SET_PROJECT_VIEW',
            payload: { mode }
          });
          badgeText = 'STATE MUTATED';
          outputNode = (
            <p className="text-emerald-400 text-xs font-mono font-bold">
              ✓ Portfolio Projects display mode switched to → <span className="text-cyan-300 uppercase">[{mode}]</span>
            </p>
          );
          break;
        }

        const displayProjects = subCmd === '--featured' 
          ? liveProjects.filter(p => p.isFeatured) 
          : liveProjects.slice(0, 6);

        outputNode = (
          <div className="space-y-3 text-xs font-mono py-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                Engineering Projects Directory ({displayProjects.length} loaded • Filter: {activeFilter}):
              </p>
              <span className="text-[10px] text-slate-400">
                Try: <code className="text-amber-300">project feature 1</code> or <code className="text-amber-300">projects --view grid</code>
              </span>
            </div>
            <div className="space-y-2">
              {displayProjects.map((p, idx) => (
                <div key={p.id} className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-cyan-300 font-bold text-xs">
                      #{idx + 1} {p.title} {p.isFeatured ? <span className="text-amber-300 text-[10px]">★ Featured</span> : ''}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCommandExecution(`project toggle ${p.id}`)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 cursor-pointer transition"
                      >
                        {p.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                        {p.category || 'Production'}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
        break;
      }

      case 'experience':
        outputNode = (
          <div className="space-y-2.5 text-xs font-mono py-1">
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              Professional Experience Timeline:
            </p>
            <div className="space-y-2">
              {liveExperiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-emerald-500/50 pl-3 py-1">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-bold text-cyan-300">{exp.role}</span>
                    <span className="text-[10px] text-slate-500">{exp.startDate} - {exp.endDate || 'Present'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/80 font-medium">{exp.company}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'education':
        outputNode = (
          <div className="space-y-2 text-xs font-mono py-1">
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              Scholastic Milestones:
            </p>
            <div className="space-y-2">
              {liveEducation.map((edu) => (
                <div key={edu.id} className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-cyan-300 font-bold">{edu.degree}</span>
                  <p className="text-[11px] text-slate-300">{edu.institution}</p>
                  <p className="text-[10px] text-emerald-400/80 mt-0.5">Timeline: {edu.startDate ? `${edu.startDate} - ${edu.endDate}` : edu.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'contact':
      case 'email':
        if (subCmd === '--send' || subCmd === 'send' || subCmd === 'chandrumohan550@gmail.com') {
          outputNode = <TerminalHireForm onClose={onClose} />;
          break;
        }
        outputNode = (
          <div className="space-y-2.5 text-xs font-mono py-1 text-slate-300">
            <p className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider">Direct Coordinates:</p>
            <p>• Email: <a href="mailto:chandrumohan550@gmail.com" className="text-cyan-300 hover:underline">chandrumohan550@gmail.com</a></p>
            <p>• GitHub: <a href="https://github.com/Chandru9842" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">github.com/Chandru9842</a></p>
            <p>• LinkedIn: <a href="https://www.linkedin.com/in/chandru9842/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">linkedin.com/in/chandru9842</a></p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleCommandExecution('sudo hire chandru')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>🚀 Launch Direct Email Dispatcher (chandrumohan550@gmail.com)</span>
              </button>
            </div>
          </div>
        );
        break;

      case 'mail':
      case 'send':
      case 'hire':
        outputNode = <TerminalHireForm onClose={onClose} />;
        break;

      case 'metrics':
      case 'stats':
        outputNode = (
          <div className="space-y-2 text-xs font-mono py-1">
            <div className="flex items-center justify-between">
              <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Live Portfolio Metrics:</p>
              <span className="text-[10px] text-slate-400">Mutate via: <code className="text-amber-300">metric set 1 24k+ RPS</code></span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {liveMetrics.map((m, idx) => (
                <div key={m.id} className="bg-slate-900/70 border border-slate-800 p-2 rounded-xl text-center">
                  <p className="text-base font-extrabold text-emerald-400">{m.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">#{idx + 1} {m.title}</p>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'sudo':
        if (trimmed.toLowerCase() === 'sudo hire chandru' || trimmed.toLowerCase() === 'sudo hire' || trimmed.toLowerCase().startsWith('sudo hire') || trimmed.toLowerCase().startsWith('sudo mail') || trimmed.toLowerCase().startsWith('sudo send')) {
          outputNode = <TerminalHireForm onClose={onClose} />;
        } else {
          outputNode = (
            <p className="text-red-400 font-mono text-xs">
              sudo: &apos;{trimmed}&apos; is not authorized. Did you mean <span className="text-emerald-400 font-bold">sudo hire chandru</span>?
            </p>
          );
        }
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        setInputVal('');
        return;

      case 'exit':
      case 'quit':
        onClose();
        setInputVal('');
        return;

      default:
        outputNode = (
          <p className="text-red-400 font-mono text-xs">
            zsh: command not found: <span className="text-slate-200 font-bold">{trimmed}</span>. Type <span className="text-emerald-300 font-bold">help</span> or <span className="text-cyan-300 font-bold">state</span> to interact with portfolio state.
          </p>
        );
        break;
    }

    setHistory(prev => [
      ...prev,
      {
        id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        command: trimmed,
        output: outputNode,
        timestamp: new Date().toLocaleTimeString(),
        badge: badgeText
      }
    ]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommandExecution(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pastCommands.length === 0) return;
      const nextIndex = historyIndex === -1 ? pastCommands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(pastCommands[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1 && historyIndex < pastCommands.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInputVal(pastCommands[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal.toLowerCase().trim();
      if (!current) return;
      const match = COMMAND_LIST.find(cmd => cmd.startsWith(current));
      if (match) {
        setInputVal(match);
      }
    }
  };

  const handleCopyLogs = () => {
    const text = history.map(h => `$ ${h.command}\n`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && windowMode === 'minimized' && (
        <motion.div
          key="console-minimized-bar"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          className="fixed bottom-16 left-4 z-[120] glass-card rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-emerald-500/35 shadow-2xl font-mono text-xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-200 font-bold">Developer Command Console</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Theme: {activeThemeName} • Mutations: {mutationCount}
          </span>
          <button
            type="button"
            onClick={() => setWindowMode('floating')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold cursor-pointer transition"
          >
            Restore Window
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer transition"
            title="Close Console"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {isOpen && windowMode !== 'minimized' && (
        <div
          key="console-window-wrapper"
          className={
            windowMode === 'maximized'
              ? 'fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md'
              : 'fixed bottom-16 left-4 sm:left-6 z-[120] pointer-events-none flex items-end justify-start'
          }
        >
          {windowMode === 'maximized' && (
            <div className="absolute inset-0" onClick={onClose} />
          )}

          {/* Floating Draggable Command Console Window */}
          <motion.div
            drag={windowMode === 'floating'}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto relative z-10 glass-card ${
              windowMode === 'maximized'
                ? 'w-full h-[88vh] max-w-6xl'
                : 'w-[92vw] sm:w-[650px] lg:w-[720px] h-[470px] sm:h-[510px]'
            } rounded-2xl border border-emerald-500/30 shadow-[0_28px_70px_-15px_rgba(2,6,23,0.92),0_0_40px_-10px_rgba(16,185,129,0.22)] flex flex-col overflow-hidden text-slate-100 font-mono`}
          >
            {/* Draggable Console Title Bar */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-white/[0.08] flex items-center justify-between select-none cursor-grab active:cursor-grabbing">
              {/* Window Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-400 transition cursor-pointer"
                  title="Close Console (exit)"
                />
                <button
                  type="button"
                  onClick={() => setWindowMode('minimized')}
                  className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400 transition cursor-pointer"
                  title="Minimize to HUD bar"
                />
                <button
                  type="button"
                  onClick={() => setWindowMode(windowMode === 'maximized' ? 'floating' : 'maximized')}
                  className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 transition cursor-pointer"
                  title="Toggle Floating / Maximized"
                />
              </div>

              {/* Console Title & Live State Badge */}
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold truncate">
                <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Developer Command Console — chandru@state-engine</span>
                {windowMode === 'floating' && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-400 border border-slate-700/70">
                    <Move className="w-2.5 h-2.5 text-emerald-400" />
                    Drag Window
                  </span>
                )}
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="p-1.5 rounded-lg hover:text-emerald-400 hover:bg-slate-800/80 transition cursor-pointer"
                  title="Copy command history"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setWindowMode('minimized')}
                  className="p-1.5 rounded-lg hover:text-amber-300 hover:bg-slate-800/80 transition cursor-pointer"
                  title="Minimize Console"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setWindowMode(windowMode === 'maximized' ? 'floating' : 'maximized')}
                  className="p-1.5 rounded-lg hover:text-slate-200 hover:bg-slate-800/80 transition cursor-pointer"
                  title={windowMode === 'maximized' ? "Restore Floating Window" : "Maximize Console"}
                >
                  {windowMode === 'maximized' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-slate-800/80 transition cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live State Status Strip */}
            <div className="px-4 py-1.5 bg-slate-950/80 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 select-none">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  STATE CONNECTED
                </span>
                <span>Theme: <strong className="text-cyan-300 uppercase">{activeThemeName}</strong></span>
                <span>Badge: <strong className="text-amber-300">{liveProfile?.heroBadge || 'SENIOR CLOUD ARCHITECT'}</strong></span>
                <span>Projects: <strong className="text-slate-200">{liveProjects.length}</strong></span>
                <span>3D Core: <strong className="text-emerald-300">{is3DCoreEnabled ? 'ACTIVE' : 'PAUSED'}</strong></span>
              </div>
              <span className="text-slate-500 hidden sm:inline">Mutations: {mutationCount}</span>
            </div>

            {/* Console Output Scroll Area */}
            <div 
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('input, textarea, button, a, form, select')) return;
                inputRef.current?.focus();
              }}
              className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs font-mono cursor-text bg-slate-950/60"
            >
              {history.map((item) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400 font-bold">chandru@console</span>
                    <span className="text-slate-600">:</span>
                    <span className="text-cyan-400 font-bold">~</span>
                    <span className="text-slate-500">$</span>
                    <span className="text-slate-100 font-semibold">{item.command}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-600 ml-auto">{item.timestamp}</span>
                  </div>
                  <div className="pl-3 sm:pl-4">{item.output}</div>
                </div>
              ))}

              {/* Active Command Input Line */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-emerald-400 font-bold shrink-0">chandru@console</span>
                <span className="text-slate-600 shrink-0">:</span>
                <span className="text-cyan-400 font-bold shrink-0">~</span>
                <span className="text-slate-500 shrink-0">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-emerald-300 font-mono text-xs caret-emerald-400"
                  autoFocus
                  placeholder="Run CLI command ('state', 'theme cyan', 'badge set ...', 'project feature 1', 'help')..."
                />
              </div>

              <div ref={terminalEndRef} />
            </div>

            {/* Interactive Quick Command Chips */}
            <div className="px-3.5 py-2 bg-slate-900/80 border-t border-white/[0.07] flex items-center justify-between gap-2 text-[11px] text-slate-400 select-none">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-emerald-400 uppercase shrink-0 flex items-center gap-1">
                  <Play className="w-2.5 h-2.5" />
                  Run:
                </span>
                {[
                  'state',
                  'theme cyan',
                  'theme violet',
                  'theme emerald',
                  'project feature 1',
                  'skill boost Java 99',
                  'pulse',
                  'goto projects',
                  'sudo hire chandru',
                  'help'
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCommandExecution(c)}
                    className="hover:text-emerald-300 hover:border-emerald-500/40 transition cursor-pointer text-[10px] font-mono bg-slate-950/90 px-2 py-0.5 rounded-md border border-slate-800 shrink-0"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 shrink-0 hidden md:inline">
                <span className="text-slate-300 font-bold">Ctrl+K</span> Toggle
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

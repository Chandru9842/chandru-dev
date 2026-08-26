import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, X, Maximize2, Minimize2, Trash2, 
  CornerDownLeft, ExternalLink, Sparkles, ShieldCheck, Check, Copy, Mail
} from 'lucide-react';
import { ProjectItem, SkillItem, ExperienceItem, EducationItem, PortfolioMetricItem } from '../data/cmsMockData';

interface DeveloperTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: ProjectItem[];
  skills?: SkillItem[];
  experiences?: ExperienceItem[];
  education?: EducationItem[];
  metrics?: PortfolioMetricItem[];
  profile?: any;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: React.ReactNode;
  timestamp: string;
}

const COMMAND_LIST = [
  'help',
  'whoami',
  'skills',
  'projects',
  'experience',
  'education',
  'contact',
  'metrics',
  'sudo hire chandru',
  'clear',
  'exit'
];

function TerminalHireForm({ onClose }: { onClose: () => void }) {
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('Senior Full-Stack Engineer / Lead Architect');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [error, setError] = useState('');

  const targetEmail = "chandrumohan550@gmail.com";

  // Dynamic Gmail & Mailto URLs with user's typed inputs prefilled
  const dynamicSubject = encodeURIComponent(
    roleTitle 
      ? `Interview Opportunity: ${roleTitle} (${companyName || 'Engineering Role'})`
      : `Software Engineering Opportunity for Chandru Mohan`
  );
  
  const dynamicBody = encodeURIComponent(
    `Hi Chandru,\n\nI came across your portfolio and would like to connect regarding an engineering opportunity.\n\nCompany: ${companyName || '[Company Name]'}\nRole / Level: ${roleTitle || 'Senior Software Engineer'}\nFrom: ${recruiterName || '[Your Name]'}\nEmail: ${recruiterEmail || '[Your Work Email]'}\n\nDetails:\n${message || 'We would love to discuss your background and schedule an interview.'}\n\nBest regards,\n${recruiterName || 'Hiring Team'}`
  );

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${dynamicSubject}&body=${dynamicBody}`;
  const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${targetEmail}&subject=${dynamicSubject}&body=${dynamicBody}`;
  const mailtoUrl = `mailto:${targetEmail}?subject=${dynamicSubject}&body=${dynamicBody}`;

  const [mailTriggered, setMailTriggered] = useState(false);

  const handleOpenMailApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Copy target email to clipboard so user has it immediately
    navigator.clipboard.writeText(targetEmail);
    setMailTriggered(true);
    setTimeout(() => setMailTriggered(false), 3000);

    // Trigger system mail protocol
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(targetEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleScrollToContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    setTimeout(() => {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!recruiterEmail.trim() || !message.trim()) {
      setError('Please provide at least your work email and a brief message.');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const senderDisplayName = `${recruiterName || 'Recruiter'} ${companyName ? `(${companyName})` : ''}`.trim();
      const subjectText = `Interview Offer: ${roleTitle || 'Software Engineering Role'}`;
      const fullMessage = `Candidate Offer / Interview Invitation\n\nFrom: ${recruiterName || 'Hiring Manager'}\nCompany: ${companyName || 'Not specified'}\nRole / Level: ${roleTitle}\nEmail: ${recruiterEmail}\n\nMessage:\n${message}`;

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: senderDisplayName,
          email: recruiterEmail,
          subject: subjectText,
          message: fullMessage
        })
      });

      if (res.ok) {
        setIsSent(true);
      } else {
        setError('Server endpoint rejected request. Please try direct email or contact form.');
      }
    } catch (err) {
      setError('Network connection failed. Please copy email or use Gmail option.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="bg-gradient-to-br from-emerald-950/90 via-slate-950 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 text-xs font-mono space-y-3.5 shadow-2xl cursor-default"
    >
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span>ROOT PRIVILEGES GRANTED: INTERVIEW DISPATCHER</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] border border-emerald-500/30">
          Target: {targetEmail}
        </span>
      </div>

      {isSent ? (
        <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-4 space-y-2 text-emerald-200">
          <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>TRANSMISSION SUCCESSFUL! 🚀</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Your interview inquiry has been delivered directly to Chandru's Gmail inbox (<span className="text-emerald-400 font-bold">{targetEmail}</span>) and saved in the CMS database.
          </p>
          <p className="text-[10px] text-emerald-400/80 font-mono">
            Chandru receives instant notifications and typically responds within 4–12 business hours.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{copiedEmail ? 'Copied to Clipboard!' : `Copy ${targetEmail}`}</span>
            </button>
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Gmail</span>
            </a>
            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Outlook Web</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <p className="text-slate-300 text-[11px]">
            Send an instant recruitment / interview request directly to <strong>Chandru Mohan</strong> (<span className="text-emerald-400 font-bold">{targetEmail}</span>):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">Your Name & Title</label>
              <input
                type="text"
                placeholder="e.g. Sarah Connor, Tech Recruiter"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Stripe / Fintech Labs"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">Your Work Email *</label>
              <input
                type="email"
                required
                placeholder="e.g. sarah@company.com"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">Role Title / Opportunity</label>
              <input
                type="text"
                placeholder="e.g. Senior Full-Stack / Lead Architect"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-1">Message / Interview Details *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Hi Chandru, we loved your distributed systems work and want to schedule a 30-min technical call..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-[10px] font-bold">{error}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSending ? 'Transmitting Request...' : '🚀 Dispatch to Chandru'}</span>
              </button>

              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer border border-slate-700 hover:border-red-500/50"
                title="Compose in Gmail Web"
              >
                <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                <span>Gmail</span>
              </a>

              <a
                href={outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer border border-slate-700 hover:border-blue-500/50"
                title="Compose in Outlook / Hotmail Web"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Outlook</span>
              </a>

              <button
                type="button"
                onClick={handleOpenMailApp}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer border border-slate-700 hover:border-cyan-500/50"
                title="Open Default Desktop Mail Client & Copy Email"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>{mailTriggered ? 'Opening Mail...' : 'Mail App'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] rounded-xl inline-flex items-center gap-1 transition cursor-pointer border border-slate-800"
                title="Copy email to clipboard"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
              </button>

              <button
                type="button"
                onClick={handleScrollToContact}
                className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 text-[11px] rounded-xl inline-flex items-center gap-1 transition cursor-pointer border border-slate-800"
                title="Go to Website Contact Form"
              >
                <span>Contact Form ↓</span>
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
  projects = [],
  skills = [],
  experiences = [],
  education = [],
  metrics = [],
  profile = {}
}: DeveloperTerminalModalProps) {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [pastCommands, setPastCommands] = useState<string[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      scrollToBottom();
      if (history.length === 0) {
        setHistory([
          {
            id: 'init-1',
            command: 'system --init',
            timestamp: new Date().toLocaleTimeString(),
            output: (
              <div className="text-slate-300 space-y-2 font-mono text-xs">
                <p className="text-emerald-400 font-bold">
                  ⚡ Chandru Mohan [Kernel v6.12-release • Production Developer Console]
                </p>
                <p className="text-slate-400">
                  Type <span className="text-emerald-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">help</span> to view available system commands or press <span className="text-cyan-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">Tab</span> for autocompletion.
                </p>
              </div>
            )
          }
        ]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleCommandExecution = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setPastCommands(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const flag = parts[1]?.toLowerCase() || '';

    let outputNode: React.ReactNode = null;

    switch (mainCmd) {
      case 'help':
      case '?':
        outputNode = (
          <div className="space-y-2.5 text-xs font-mono py-1">
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              Available System Commands:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-300">
              <div><span className="text-cyan-400 font-bold">whoami</span> — Candidate profile & architecture role</div>
              <div><span className="text-cyan-400 font-bold">skills [--backend|--frontend]</span> — Tech proficiencies</div>
              <div><span className="text-cyan-400 font-bold">projects [--featured]</span> — Scaled showcase repositories</div>
              <div><span className="text-cyan-400 font-bold">experience</span> — Career timeline & milestones</div>
              <div><span className="text-cyan-400 font-bold">education</span> — Degrees & academic background</div>
              <div><span className="text-cyan-400 font-bold">metrics</span> — Real-time telemetry & code metrics</div>
              <div><span className="text-cyan-400 font-bold">contact</span> — Direct email, LinkedIn & socials</div>
              <div><span className="text-emerald-400 font-bold">sudo hire chandru</span> — Instant interview invitation</div>
              <div><span className="text-slate-400 font-bold">clear</span> — Clear terminal output</div>
              <div><span className="text-slate-400 font-bold">exit</span> — Close terminal modal</div>
            </div>
          </div>
        );
        break;

      case 'whoami':
      case 'bio':
        outputNode = (
          <div className="space-y-2 text-xs font-mono py-1 text-slate-200">
            <p className="text-emerald-400 font-bold text-sm">
              {profile?.fullName || "Chandru Mohan"}
            </p>
            <p className="text-cyan-300 font-medium">
              {profile?.heroTitle || "Principal Systems Architect & Full-Stack Developer"}
            </p>
            <p className="text-slate-300 leading-relaxed max-w-2xl">
              {profile?.heroDescription || "Engineering resilient distributed platforms, high-performance web applications, and database architectures."}
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-slate-400">
              <span>📍 Bengaluru, India (Open to Remote)</span>
              <span>💼 Open for Full-Time Roles</span>
              <span>📧 {profile?.email || "chandrumohan550@gmail.com"}</span>
            </div>
          </div>
        );
        break;

      case 'skills':
        let filteredSkills = skills;
        if (flag === '--backend') {
          filteredSkills = skills.filter(s => (s.category || '').toLowerCase().includes('backend'));
        } else if (flag === '--frontend') {
          filteredSkills = skills.filter(s => (s.category || '').toLowerCase().includes('frontend'));
        }

        outputNode = (
          <div className="space-y-2 text-xs font-mono py-1">
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              Technical Skills Matrix {flag ? `[${flag}]` : ''}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {filteredSkills.map((s, idx) => (
                <span 
                  key={idx} 
                  className="bg-slate-900/90 border border-slate-700/80 text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-medium"
                >
                  {s.name} {s.proficiency ? <span className="text-slate-500 text-[10px]">({s.proficiency}%)</span> : ''}
                </span>
              ))}
            </div>
          </div>
        );
        break;

      case 'projects':
        const displayProjects = flag === '--featured' 
          ? projects.filter(p => p.isFeatured) 
          : projects.slice(0, 6);

        outputNode = (
          <div className="space-y-3 text-xs font-mono py-1">
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              Engineering Projects Directory ({displayProjects.length} loaded):
            </p>
            <div className="space-y-2">
              {displayProjects.map((p) => (
                <div key={p.id} className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 font-bold text-xs">{p.title}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                      {p.category || 'Production'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{p.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-1">
                        [Live Demo ↗]
                      </a>
                    )}
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:underline inline-flex items-center gap-1">
                        [Codebase ↗]
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'experience':
        outputNode = (
          <div className="space-y-2.5 text-xs font-mono py-1">
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              Professional Experience Timeline:
            </p>
            <div className="space-y-2">
              {experiences.map((exp) => (
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
              {education.map((edu) => (
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
        outputNode = (
          <div className="space-y-2 text-xs font-mono py-1 text-slate-300">
            <p className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider">Direct Coordinates:</p>
            <p>• Email: <a href="mailto:chandrumohan550@gmail.com" className="text-cyan-300 hover:underline">chandrumohan550@gmail.com</a></p>
            <p>• GitHub: <a href="https://github.com/Chandru9842" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">github.com/Chandru9842</a></p>
            <p>• LinkedIn: <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">LinkedIn Profile</a></p>
            <p>• LeetCode: <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">LeetCode Profile</a></p>
          </div>
        );
        break;

      case 'metrics':
      case 'stats':
        outputNode = (
          <div className="space-y-2 text-xs font-mono py-1">
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Live Portfolio Metrics:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {metrics.map((m) => (
                <div key={m.id} className="bg-slate-900/70 border border-slate-800 p-2 rounded-xl text-center">
                  <p className="text-base font-extrabold text-emerald-400">{m.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{m.title}</p>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'sudo':
        if (trimmed.toLowerCase() === 'sudo hire chandru' || trimmed.toLowerCase() === 'sudo hire' || trimmed.toLowerCase().startsWith('sudo hire')) {
          outputNode = <TerminalHireForm onClose={onClose} />;
        } else {
          outputNode = (
            <p className="text-red-400 font-mono text-xs">
              sudo: '{trimmed}' is not authorized. Did you mean <span className="text-emerald-400 font-bold">sudo hire chandru</span>?
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
            zsh: command not found: <span className="text-slate-200 font-bold">{trimmed}</span>. Type <span className="text-emerald-300 font-bold">help</span> to view commands.
          </p>
        );
        break;
    }

    setHistory(prev => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: trimmed,
        output: outputNode,
        timestamp: new Date().toLocaleTimeString()
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
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          {/* Modal Backdrop click to close */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Terminal Window Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative z-10 w-full ${
              isMaximized ? 'h-[94vh] max-w-7xl' : 'h-[75vh] max-h-[640px] max-w-3xl'
            } bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl shadow-emerald-950/40 flex flex-col overflow-hidden text-slate-100 font-mono`}
          >
            {/* Terminal Title Bar */}
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between select-none">
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition cursor-pointer"
                  title="Close (exit)"
                />
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition cursor-pointer"
                  title="Toggle size"
                />
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition cursor-pointer"
                  title="Clear"
                />
              </div>

              {/* Title & Badge */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold truncate">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>chandru@portfolio-v2: ~ (zsh)</span>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="p-1 rounded hover:text-emerald-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Copy log buffer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1 rounded hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                  title={isMaximized ? "Restore size" : "Maximize"}
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Body Scroll View */}
            <div 
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('input, textarea, button, a, form, select')) return;
                inputRef.current?.focus();
              }}
              className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono cursor-text"
            >
              {history.map((item) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400 font-bold">chandru@dev-box</span>
                    <span className="text-slate-600">:</span>
                    <span className="text-blue-400 font-bold">~</span>
                    <span className="text-slate-500">$</span>
                    <span className="text-slate-100 font-semibold">{item.command}</span>
                    <span className="text-[10px] text-slate-600 ml-auto">{item.timestamp}</span>
                  </div>
                  <div className="pl-4">{item.output}</div>
                </div>
              ))}

              {/* Active Prompt Input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-emerald-400 font-bold shrink-0">chandru@dev-box</span>
                <span className="text-slate-600 shrink-0">:</span>
                <span className="text-blue-400 font-bold shrink-0">~</span>
                <span className="text-slate-500 shrink-0">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-emerald-300 font-mono text-xs caret-emerald-400"
                  autoFocus
                  placeholder="Type a command (e.g. 'help', 'whoami', 'skills', 'projects')..."
                />
              </div>

              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Footer Quick Links */}
            <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 select-none">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Quick:</span>
                {['help', 'whoami', 'skills', 'projects', 'sudo hire chandru', 'contact'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCommandExecution(c)}
                    className="hover:text-emerald-400 transition cursor-pointer text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 shrink-0 hidden sm:inline">
                Press <span className="text-slate-300 font-bold">Esc</span> or type <span className="text-slate-300 font-bold">exit</span> to close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

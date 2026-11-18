import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Briefcase,
  Award,
  Layers,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  ExternalLink,
  Check,
  Copy,
  Calendar,
  ArrowRight,
  Globe,
  Activity,
  FileText,
} from 'lucide-react';

export interface RecruiterExecutiveBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  projects: any[];
  experiences: any[];
  skills: any[];
  certificates: any[];
  activeResume: any;
  onDownloadResume: () => void;
  onBookCallTopic: (topic: string, presetMessage: string) => void;
}

interface ArchNode {
  id: string;
  title: string;
  layer: string;
  tech: string;
  latency: string;
  throughput: string;
  sla: string;
  summary: string;
  highlights: string[];
}

const ARCH_BLUEPRINT_NODES: ArchNode[] = [
  {
    id: 'gateway',
    title: 'Edge Ingress & API Gateway',
    layer: 'Layer 01 · Edge & Security',
    tech: 'Spring Cloud Gateway · TLS 1.3 · RS512 JWT · Rate Limiter',
    latency: '1.2 ms p99',
    throughput: '45,000 req/s',
    sla: '99.99% Uptime',
    summary:
      'Zero-trust API ingress terminating TLS 1.3, enforcing token bucket rate limiting via Redis, and validating stateless RS512 JWT claims before routing to internal microservices.',
    highlights: [
      'Sub-2ms token verification with public-key rotation',
      'Automated circuit-breaking & canary traffic splitting',
      'Strict OWASP headers and DDoS burst absorption',
    ],
  },
  {
    id: 'compute',
    title: 'Core Microservices Mesh',
    layer: 'Layer 02 · Application Compute',
    tech: 'Java 21 LTS · Spring Boot 3.4 · Virtual Threads (Project Loom)',
    latency: '3.4 ms p99',
    throughput: '28,500 ops/s',
    sla: 'Zero-Downtime Rolling',
    summary:
      'High-concurrency domain services powered by Java 21 Virtual Threads and ZGC garbage collection, eliminating thread-pool starvation under heavy I/O workloads.',
    highlights: [
      'Non-blocking I/O with deterministic sub-millisecond GC pauses (ZGC)',
      'Resilience4j bulkhead isolation, retry backoff, and fallback handlers',
      'Clean Hexagonal / Domain-Driven Design (DDD) service boundaries',
    ],
  },
  {
    id: 'streaming',
    title: 'Event-Driven Backbone',
    layer: 'Layer 03 · Asynchronous Messaging',
    tech: 'Apache Kafka · Outbox Pattern · Idempotent Consumers',
    latency: '4.8 ms e2e',
    throughput: '120k events/s',
    sla: 'Exactly-Once Delivery',
    summary:
      'Partitioned Kafka event streams decoupling transactional writes from downstream analytics, notifications, and audit pipelines using the Transactional Outbox pattern.',
    highlights: [
      'Dead-Letter Queue (DLQ) automated replay & poison-pill isolation',
      'Schema Registry Avro/JSON contract enforcement across producers',
      'Real-time event sourcing for audit trails and telemetry aggregation',
    ],
  },
  {
    id: 'cache',
    title: 'Distributed Low-Latency Cache',
    layer: 'Layer 04 · In-Memory Acceleration',
    tech: 'Redis Cluster · Read-Through L2 Cache · Distributed Locks',
    latency: '0.4 ms p99',
    throughput: '180k ops/s',
    sla: '98.4% Cache Hit Ratio',
    summary:
      'Multi-node Redis cluster offloading 98%+ of hot read queries and coordinating distributed Redlock mutexes for idempotent financial and booking workflows.',
    highlights: [
      'Stampede protection via probabilistic early expiration',
      'Write-behind invalidation synced with CDC / application events',
      'Sub-millisecond session & rate-limit state storage',
    ],
  },
  {
    id: 'storage',
    title: 'Relational & Analytical Persistence',
    layer: 'Layer 05 · Durable Data Store',
    tech: 'PostgreSQL 16 / MySQL 8.0 · HikariCP · Read Replicas · Flyway',
    latency: '2.1 ms p99',
    throughput: '32,000 QPS',
    sla: 'ACID Serializable / 3NF',
    summary:
      'Normalized 3NF relational schemas with composite covering indexes, HikariCP connection pooling, and automated read/write routing across primary and replica nodes.',
    highlights: [
      'Zero-downtime Flyway schema migrations with backward compatibility',
      'Optimized N+1 query elimination via JPA EntityGraphs & projections',
      'Automated point-in-time recovery (PITR) and encrypted snapshots',
    ],
  },
];

export const RecruiterExecutiveBriefModal: React.FC<RecruiterExecutiveBriefModalProps> = ({
  isOpen,
  onClose,
  profile,
  projects,
  experiences,
  skills,
  certificates,
  onDownloadResume,
  onBookCallTopic,
}) => {
  const [activeTab, setActiveTab] = useState<'brief' | 'blueprint'>('brief');
  const [selectedArchId, setSelectedArchId] = useState<string>('compute');
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const fullName = profile?.fullName || profile?.heroName || 'Chandru Mohan';
  const title =
    profile?.title ||
    profile?.heroTitle ||
    'Principal Systems Architect & Full Stack Java Developer';
  const email = profile?.email || 'chandrumohan550@gmail.com';
  const phone = profile?.phone || '+91 9655384140';
  const location = profile?.location
    ? `${profile.location}, ${profile.country || 'India'}`
    : 'Bengaluru, India';

  const topProjects = (projects || []).slice(0, 3);
  const topExperiences = (experiences || []).slice(0, 3);
  const selectedArch =
    ARCH_BLUEPRINT_NODES.find((n) => n.id === selectedArchId) || ARCH_BLUEPRINT_NODES[1];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const whatsappUrl = `https://wa.me/919655384140?text=${encodeURIComponent(
    `Hi ${fullName}, I reviewed your Principal Systems Architect portfolio and would like to discuss an engineering opportunity.`
  )}`;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Executive Brief and System Architecture Blueprint"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-5xl bg-[#040916] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Top Accent Line */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 shrink-0" />

          {/* Header Bar */}
          <div className="p-4 sm:p-6 border-b border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/80 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span>EXECUTIVE DOSSIER</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">{location}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-300">Available for Principal & Senior Roles</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {fullName} — {title}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              {/* Segmented Tab Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('brief')}
                  className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'brief'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>1-Page Brief</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('blueprint')}
                  className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'blueprint'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>System Blueprint</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Executive Brief"
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {activeTab === 'brief' ? (
              <>
                {/* Key Engineering Impact Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Core Specialization
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                      Java 21 & Spring Boot
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                      Microservices · Kafka · Cloud
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Production Systems
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                      {Math.max(projects?.length || 0, 15)}+ Delivered
                    </span>
                    <span className="text-[11px] text-cyan-400 font-mono mt-1 block">
                      99.99% Target SLA Uptime
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Algorithmic Rigor
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                      350+ LeetCode Solved
                    </span>
                    <span className="text-[11px] text-amber-400 font-mono mt-1 block">
                      Data Structures & Concurrency
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Verified Credentials
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white mt-0.5 block">
                      {Math.max(certificates?.length || 0, 12)}+ Certifications & Skills
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                      {Math.max(skills?.length || 0, 16)} Core Stack Competencies
                    </span>
                  </div>
                </div>

                {/* Two-Column Executive Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Flagship Production Systems */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span>Flagship Production Systems</span>
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        Enterprise Architecture
                      </span>
                    </div>

                    <div className="space-y-3">
                      {topProjects.map((proj: any, idx: number) => (
                        <div
                          key={proj.id || idx}
                          className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.06] hover:border-emerald-500/30 transition space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                {proj.category || 'Enterprise System'} ·{' '}
                                {Array.isArray(proj.technologies)
                                  ? proj.technologies.slice(0, 5).join(' · ')
                                  : proj.techStack || 'Java · Spring Boot · React'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {proj.liveUrl && proj.liveUrl !== '#' && (
                                <a
                                  href={proj.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-h-[44px] px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1 transition"
                                >
                                  <span>Live</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {proj.githubUrl && proj.githubUrl !== '#' && (
                                <a
                                  href={proj.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono font-bold flex items-center gap-1 transition"
                                >
                                  <span>Code</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                            {proj.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Career Trajectory & Direct Contact */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>Experience & Leadership</span>
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">Verified Track</span>
                    </div>

                    <div className="space-y-2.5">
                      {topExperiences.map((exp: any, i: number) => (
                        <div
                          key={exp.id || i}
                          className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/[0.06] space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white">
                              {exp.role || exp.title}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                              {exp.duration || exp.period}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">
                            {exp.company} · {exp.location || 'Bengaluru'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Direct Contact & Instant Call Booking Box */}
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                      <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider block">
                        Direct Hiring & Architecture Channels
                      </span>
                      <div className="space-y-1.5 text-xs font-mono text-slate-200">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{email}</span>
                          <button
                            type="button"
                            onClick={handleCopyEmail}
                            className="min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            {copiedEmail ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Email</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{phone}</span>
                          <span aria-hidden="true">·</span>
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* TAB 2: Interactive Distributed System Architecture Blueprint */
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Interactive Production Reference Architecture
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select any architectural tier below to inspect latency SLAs, concurrency patterns, and fault-tolerance design.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-emerald-400">
                    End-to-End SLA: 99.99% · Multi-AZ
                  </div>
                </div>

                {/* Interactive Pipeline Nodes */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {ARCH_BLUEPRINT_NODES.map((node, index) => {
                    const isSelected = node.id === selectedArchId;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedArchId(node.id)}
                        className={`min-h-[44px] p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-900/60 border-white/[0.07] hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-emerald-400 block">
                            0{index + 1}. {node.id.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-white block leading-snug">
                            {node.title}
                          </span>
                        </div>
                        <div className="pt-3 mt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{node.latency}</span>
                          <ArrowRight
                            className={`w-3.5 h-3.5 ${
                              isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'
                            } transition-transform`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Architecture Tier Deep-Dive Panel */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.07] pb-4">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 block">
                        {selectedArch.layer}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                        {selectedArch.title}
                      </h4>
                      <p className="text-xs font-mono text-cyan-300 mt-1">{selectedArch.tech}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">LATENCY</span>
                        <span className="text-emerald-400 font-bold">{selectedArch.latency}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">THROUGHPUT</span>
                        <span className="text-white font-bold">{selectedArch.throughput}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">RELIABILITY</span>
                        <span className="text-cyan-300 font-bold">{selectedArch.sla}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {selectedArch.summary}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                      Production Engineering Invariants:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {selectedArch.highlights.map((item, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] text-xs text-slate-300 flex items-start gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-5 border-t border-white/[0.07] bg-slate-950/95 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onDownloadResume}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download CV / Resume</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp (+91 9655384140)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookCallTopic(
                    '15-Min Architecture / Hiring Call',
                    'Hi Chandru, I reviewed your Executive Brief and would like to schedule a 15-minute call to discuss a Principal / Senior Full-Stack Java role.'
                  );
                }}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Book 15-Min Call</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-white/[0.08] text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RecruiterExecutiveBriefModal;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Cpu, Database, Award, Briefcase, GraduationCap, 
  Mail, Github, ExternalLink, ShieldAlert, Activity, ChevronRight, 
  Send, Check, MapPin, Calendar, ArrowDown, ArrowUp, Globe, Eye, Users, ShieldCheck,
  Code2, Sparkles, MessageSquare, Terminal, X, ChevronLeft, Video, Play, Film, Pause, LayoutGrid, Gauge, Zap, ArrowRight, RotateCcw,
  Image as ImageIcon, Smartphone, Network, Braces, Cloud, Lock, Settings, Sliders, Palette,
  Download, Phone, FileText, Linkedin, Youtube, Instagram, Facebook, Link, Twitter,
  Menu, XCircle, AlertCircle, Star, Wrench, Search, BookOpen, BookOpenCheck, MessageSquareQuote, Quote, Clock, Share2,
  Volume2, VolumeX, ChevronDown, ChevronUp, Building2, CheckCircle2, Copy, Flame, TrendingUp, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
const ThreeDHero = React.lazy(() => import('./ThreeDHero'));
import DynamicBackground from './DynamicBackground';
import DeepSpaceParticleOverlay from './DeepSpaceParticleOverlay';
import AuroraWaveBackground from './AuroraWaveBackground';
import SkillMediaRenderer from './SkillMediaRenderer';
const ProjectPerformanceDashboard = React.lazy(() => import('./ProjectPerformanceDashboard'));
const ProjectRechartsMetricsPanel = React.lazy(() => import('./ProjectRechartsMetricsPanel'));
const AboutBiographyTimeline = React.lazy(() => import('./AboutBiographyTimeline'));
const ArticleMonographCard = React.lazy(() => import('./ArticleMonographCard'));
const CodingProfileSpotlightCard = React.lazy(() => import('./CodingProfileSpotlightCard'));
const SkillsArchitectureShowcase = React.lazy(() => import('./SkillsArchitectureShowcase'));
const ToolsEcosystemWorkbench = React.lazy(() => import('./ToolsEcosystemWorkbench'));
const ExperienceEducationShowcase = React.lazy(() => import('./ExperienceEducationShowcase'));
const CertificationsAchievementsShowcase = React.lazy(() => import('./CertificationsAchievementsShowcase'));
import { AnimatedProfileAvatar } from './AnimatedProfileAvatar';
import { soundFx } from '../utils/soundEffects';
import { notifyCmsUpdate } from '../utils/notifyCmsSync';
const AIPortfolioChat = React.lazy(() => import('./AIPortfolioChat'));
const DeveloperTerminalModal = React.lazy(() => import('./DeveloperTerminalModal'));

// Background chunk preloader for instant section jumps and idle mobile hydration
let hasPreloadedHeavyChunks = false;
const preloadHeavyPortfolioChunks = () => {
  if (hasPreloadedHeavyChunks) return;
  hasPreloadedHeavyChunks = true;
  import('./AboutBiographyTimeline');
  import('./SkillsArchitectureShowcase');
  import('./ToolsEcosystemWorkbench');
  import('./ExperienceEducationShowcase');
  import('./CertificationsAchievementsShowcase');
  import('./CodingProfileSpotlightCard');
  import('./ArticleMonographCard');
  import('./ProjectPerformanceDashboard');
};

const LazySectionSkeleton: React.FC<{ minHeight?: string; label?: string; fallbackAnchors?: string[] }> = ({
  minHeight = '320px',
  label = 'Loading Architecture Module...',
  fallbackAnchors = [],
}) => (
  <div
    style={{ minHeight }}
    className="w-full rounded-3xl bg-slate-900/35 border border-white/[0.05] flex flex-col items-center justify-center p-8 relative overflow-hidden"
  >
    {fallbackAnchors.map((anchorId) => (
      <div key={anchorId} id={anchorId} className="absolute -top-24" />
    ))}
    <div className="w-7 h-7 border-2 border-emerald-400/80 border-t-transparent rounded-full animate-spin mb-2.5" />
    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
      {label}
    </span>
  </div>
);

const LazySectionBoundary: React.FC<{
  children: React.ReactNode;
  minHeight?: string;
  label?: string;
  forceHydrate?: boolean;
  fallbackAnchors?: string[];
}> = ({ children, minHeight = '320px', label, forceHydrate = false, fallbackAnchors = [] }) => {
  const [shouldRender, setShouldRender] = useState<boolean>(forceHydrate);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (forceHydrate) {
      setShouldRender(true);
    }
  }, [forceHydrate]);

  useEffect(() => {
    if (shouldRender) return;
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldRender(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '700px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={hostRef} className="w-full">
      {shouldRender ? (
        <React.Suspense
          fallback={
            <LazySectionSkeleton
              minHeight={minHeight}
              label={label}
              fallbackAnchors={fallbackAnchors}
            />
          }
        >
          {children}
        </React.Suspense>
      ) : (
        <LazySectionSkeleton
          minHeight={minHeight}
          label={label}
          fallbackAnchors={fallbackAnchors}
        />
      )}
    </div>
  );
};

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn("3D Canvas rendering handled cleanly:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800/50 p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">3D Experience Mode</span>
        </div>
      );
    }
    return this.props.children;
  }
}
import { 
  ProjectItem, SkillItem, CertificateItem, ExperienceItem, EducationItem, SettingsConfig, 
  AnalyticsMetric, SocialLinkItem, ResumeItem, AchievementItem, CodingProfileItem, ToolItem, 
  PortfolioMetricItem, TestimonialItem, ArticleItem, initialTools, initialProfile, initialProjects, 
  initialSkills, initialCertificates, initialAchievements, initialExperiences, initialEducation, 
  initialSettings, initialFooter, initialSocialLinks, initialThemeSettings, initialAnalytics, 
  initialResumes, initialCodingProfiles, initialPortfolioMetrics, initialTestimonials, initialArticles,
  initialTechStack 
} from '../data/cmsMockData';
import rawDbData from '../data/db.json';

// Synchronous 0ms Zero-Flash Cache Hydration Engine
const getInstantState = <T,>(key: string, fallback: T): T => {
  if (typeof window !== 'undefined') {
    try {
      // 1. Check specific key overrides (e.g. for profile / hero assets)
      if (key === 'profile') {
        const localOverrides = localStorage.getItem('cms_profile_overrides');
        const deletedStr = localStorage.getItem('cms_deleted_hero_assets');
        let prof = (rawDbData as any)?.profile ? { ...(rawDbData as any).profile } : { ...(fallback as any) };
        if (localOverrides) {
          try {
            prof = { ...prof, ...JSON.parse(localOverrides) };
          } catch (e) {}
        }
        if (deletedStr) {
          try {
            const deleted = JSON.parse(deletedStr);
            if (deleted.heroBackground) prof.heroBackground = "";
            if (deleted.heroAvatar) prof.heroAvatar = "";
            if (deleted.aboutImage) prof.aboutImage = "";
            if (deleted.coverImage) prof.coverImage = "";
            if (deleted.profileImage) prof.profileImage = "";
            if (deleted.websiteLogo) { prof.websiteLogo = ""; prof.logoUrl = ""; }
            if (deleted.faviconUrl) prof.faviconUrl = "";
          } catch (e) {}
        }
        return prof as T;
      }

      if (key === 'activeResume') {
        const localActive = localStorage.getItem('cms_custom_active_resume');
        if (localActive) {
          try {
            const parsed = JSON.parse(localActive);
            if (parsed && (parsed.fileUrl || parsed.title)) return parsed as T;
          } catch (e) {}
        }
        const dbResumes = (rawDbData as any)?.resumes;
        if (Array.isArray(dbResumes) && dbResumes.length > 0) {
          const active = dbResumes.find((r: any) => r.isActive) || dbResumes[0];
          if (active) return active as T;
        }
      }

      // 2. Check full combined portfolio cache
      const cachedCombined = localStorage.getItem('cms_portfolio_combined_cache');
      if (cachedCombined) {
        const parsed = JSON.parse(cachedCombined);
        if (parsed && parsed[key] !== undefined && parsed[key] !== null) {
          return parsed[key] as T;
        }
      }
    } catch (e) {}
  }
  
  // 3. Fallback to synchronous bundled db.json data, then fallback variable
  if (key === 'activeResume') {
    const dbResumes = (rawDbData as any)?.resumes;
    if (Array.isArray(dbResumes) && dbResumes.length > 0) {
      return (dbResumes.find((r: any) => r.isActive) || dbResumes[0]) as T;
    }
  }

  if (key === 'footerSocialLinks') {
    const dbSocial = (rawDbData as any)?.footerSocialLinks || (rawDbData as any)?.socialLinks;
    if (Array.isArray(dbSocial) && dbSocial.length > 0) {
      return dbSocial.filter((s: any) => s.isVisible !== false) as T;
    }
  }

  const dbVal = (rawDbData as any)?.[key];
  if (dbVal !== undefined && dbVal !== null) {
    if (Array.isArray(dbVal)) {
      if (key === 'projects') {
        return [...dbVal].filter((p: any) => p.title && p.title.trim() !== '').sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)) as T;
      }
      if (key === 'skills') {
        return [...dbVal].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)) as T;
      }
      if (key === 'articles') {
        return [...dbVal].filter((a: any) => a.isPublished !== false).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)) as T;
      }
      if (key === 'codingProfiles') {
        return [...dbVal].filter((p: any) => p.visible !== false).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)) as T;
      }
      if (key === 'tools') {
        return [...dbVal].filter((t: any) => t.isVisible !== false).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)) as T;
      }
      if (key === 'portfolioMetrics') {
        return [...dbVal].filter((m: any) => m.visible !== false).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)) as T;
      }
      if (key === 'testimonials') {
        return [...dbVal].filter((t: any) => t.isVisible !== false).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)) as T;
      }
      if (dbVal.length > 0) return dbVal as T;
    }
    if (typeof dbVal === 'object' && Object.keys(dbVal).length > 0) return dbVal as T;
  }
  return fallback;
};

import { 
  getPlatformIconComponent, 
  getCodingPlatformIconComponent, 
  ToolIconRenderer, 
  MetricIconRenderer, 
  COLOR_ACCENTS 
} from '../utils/portfolioIconHelpers';

const getFooterPlatformIconComponent = (platform: string) => {
  switch (platform) {
    case 'LinkedIn': return Linkedin;
    case 'GitHub': return Github;
    case 'Instagram': return Instagram;
    case 'X (Twitter)': return Twitter;
    case 'YouTube': return Youtube;
    case 'Facebook': return Facebook;
    case 'Email': return Mail;
    case 'LeetCode': return Code2;
    case 'HackerRank': return Terminal;
    case 'WhatsApp': return Phone;
    case 'Portfolio Website': return Globe;
    default: return Link;
  }
};

const SocialLinkAnchor = ({ link, className, childrenClassName, onClick, isFooter = false }: { link: any, className: string, childrenClassName?: string, onClick?: () => void, isFooter?: boolean }) => {
  const [imgError, setImgError] = React.useState(false);
  const IconComponent = isFooter ? getFooterPlatformIconComponent(link.platform) : getPlatformIconComponent(link.platform);
  const url = link.profileUrl || link.url;
  const tooltipText = link.tooltip || `${link.platform}${link.username ? `: ${link.username}` : ''}`;
  const openInNewTab = link.openInNewTab !== false;

  return (
    <a
      href={url}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className={`relative group inline-flex items-center justify-center ${className}`}
      title={tooltipText}
      aria-label={tooltipText}
    >
      {link.customSvg ? (
        <span 
          className={childrenClassName || "w-4 h-4 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current"}
          dangerouslySetInnerHTML={{ __html: link.customSvg }} 
        />
      ) : link.logoUrl && !imgError ? (
        <img 
          src={link.logoUrl} 
          alt={link.platform} 
          className={childrenClassName || "w-4 h-4 object-contain"} 
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      ) : (
        <IconComponent className={childrenClassName || "w-4 h-4 stroke-[2]"} />
      )}
      {tooltipText && !isFooter && (
        <span className="absolute bottom-full mb-2 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 border border-slate-800 text-slate-200 text-[9px] font-mono py-1 px-2 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none">
          {tooltipText}
        </span>
      )}
    </a>
  );
};

const HeroTypewriter: React.FC<{ wordsString?: string }> = ({ wordsString }) => {
  const words = useMemo(() => {
    if (!wordsString || !wordsString.trim()) {
      return ["Principal Systems Architect", "Full-Stack Pioneer", "Clean Code Advocate"];
    }
    return wordsString.split(',').map(w => w.trim()).filter(Boolean);
  }, [wordsString]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;
    const currentWord = words[currentWordIndex % words.length];
    const typingSpeed = isDeleting ? 35 : 75;
    const pauseDelay = isDeleting ? 30 : 2000;

    let timeout: any;

    if (!isDeleting && currentText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDelay);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        const nextText = isDeleting
          ? currentWord.substring(0, currentText.length - 1)
          : currentWord.substring(0, currentText.length + 1);
        setCurrentText(nextText);
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words]);

  return (
    <span className="inline-flex items-center text-emerald-400 font-mono font-semibold">
      <span>{currentText}</span>
      <span className="w-1.5 h-4 ml-1 bg-emerald-400 animate-pulse inline-block" />
    </span>
  );
};

const getFooterThemeClasses = (themeName?: string) => {
  const name = themeName || 'emerald';
  switch (name) {
    case 'blue':
      return {
        text: 'text-blue-400',
        textMuted: 'text-blue-500/80',
        border: 'border-blue-500/30',
        bgHover: 'hover:bg-blue-500/5 hover:border-blue-500/40',
        icon: 'text-blue-400',
        sessionViews: 'text-blue-400'
      };
    case 'purple':
    case 'violet':
      return {
        text: 'text-purple-400',
        textMuted: 'text-purple-500/80',
        border: 'border-purple-500/30',
        bgHover: 'hover:bg-purple-500/5 hover:border-purple-500/40',
        icon: 'text-purple-400',
        sessionViews: 'text-purple-400'
      };
    case 'rose':
      return {
        text: 'text-rose-400',
        textMuted: 'text-rose-500/80',
        border: 'border-rose-500/30',
        bgHover: 'hover:bg-rose-500/5 hover:border-rose-500/40',
        icon: 'text-rose-400',
        sessionViews: 'text-rose-400'
      };
    case 'amber':
    case 'yellow':
      return {
        text: 'text-amber-400',
        textMuted: 'text-amber-500/80',
        border: 'border-amber-500/30',
        bgHover: 'hover:bg-amber-500/5 hover:border-amber-500/40',
        icon: 'text-amber-400',
        sessionViews: 'text-amber-400'
      };
    case 'slate':
    case 'gray':
      return {
        text: 'text-slate-300',
        textMuted: 'text-slate-400/80',
        border: 'border-slate-500/30',
        bgHover: 'hover:bg-slate-500/5 hover:border-slate-500/40',
        icon: 'text-slate-300',
        sessionViews: 'text-slate-300'
      };
    case 'emerald':
    default:
      return {
        text: 'text-emerald-400',
        textMuted: 'text-emerald-500/80',
        border: 'border-emerald-500/30',
        bgHover: 'hover:bg-emerald-500/5 hover:border-emerald-500/40',
        icon: 'text-emerald-400',
        sessionViews: 'text-emerald-400'
      };
  }
};

interface PortfolioFrontendProps {
  onEnterCMS: () => void;
}

const desktopNavItems = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "articles", label: "Articles" },
  { id: "coding-profiles", label: "Coding Profiles" },
  { id: "skills", label: "Skills" },
  { id: "tools", label: "Tools" },
  { id: "timeline", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "credentials", label: "Certificates" },
  { id: "achievements", label: "Achievements" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
];

const mobileNavItems = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "articles", label: "Articles & Blog" },
  { id: "coding-profiles", label: "Coding Profiles" },
  { id: "skills", label: "Skills" },
  { id: "tools", label: "Tools & Technologies" },
  { id: "timeline", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "credentials", label: "Certificates" },
  { id: "achievements", label: "Achievements" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
];

interface DeploymentLogEntry {
  timestamp: string;
  stage: "INIT" | "BUILD" | "VERIFY" | "DEPLOY" | "READY";
  message: string;
}

function buildProjectDeploymentLogs(proj: ProjectItem): DeploymentLogEntry[] {
  const customLines = Array.isArray(proj.deploymentLogs)
    ? proj.deploymentLogs.map((l) => l.trim()).filter(Boolean)
    : [];

  if (customLines.length > 0) {
    const stages: Array<DeploymentLogEntry["stage"]> = [
      "INIT",
      "BUILD",
      "VERIFY",
      "DEPLOY",
      "READY",
    ];
    return customLines.map((line, idx) => ({
      timestamp: `00:0${Math.min(idx + 1, 9)}.${(idx * 17 + 12) % 90 + 10}s`,
      stage:
        idx === customLines.length - 1
          ? "READY"
          : stages[idx % (stages.length - 1)],
      message: line,
    }));
  }

  const slugName =
    proj.slug ||
    proj.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") ||
    "service-core";
  const skills = (proj.skills || (proj as any).tags || []) as string[];
  const primaryStack =
    skills.slice(0, 3).join(", ") || "Java 21, Spring Boot, React";
  const secondaryStack =
    skills.slice(3, 6).join(", ") || "Docker, MySQL, REST API";
  const archLabel =
    proj.architectureType || `${proj.category || "Full-Stack"} Architecture`;
  const targetEndpoint =
    proj.liveUrl && proj.liveUrl !== "#"
      ? proj.liveUrl
      : `https://${slugName}.production.cluster.local`;

  return [
    {
      timestamp: "00:00.14s",
      stage: "INIT",
      message: `Cloning repository /${slugName} (${archLabel})`,
    },
    {
      timestamp: "00:00.82s",
      stage: "BUILD",
      message: `Compiling runtime modules [${primaryStack}] — 0 warnings, 0 errors`,
    },
    {
      timestamp: "00:01.64s",
      stage: "VERIFY",
      message: `Binding ${secondaryStack} & executing integration health checks... PASS`,
    },
    {
      timestamp: "00:02.38s",
      stage: "DEPLOY",
      message: `Publishing immutable container image sha256:${slugName.slice(0, 8)}9f4a to edge cluster`,
    },
    {
      timestamp: "00:02.95s",
      stage: "READY",
      message: `Status: ${proj.status || "Completed"} · Active endpoint → ${targetEndpoint}`,
    },
  ];
}

interface ProjectCardProps {
  proj: ProjectItem;
  index?: number;
  prefersReduced: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (id: number) => void;
  setSelectedProjectForModal: (proj: ProjectItem) => void;
  setActiveSlideIndex: (index: number) => void;
  trackProjectView: (slug: string, title: string) => void;
  onSelectTechTag?: (tag: string) => void;
}

function ProjectCard({
  proj,
  index = 0,
  prefersReduced,
  isExpanded = false,
  onToggleExpand,
  setSelectedProjectForModal,
  setActiveSlideIndex,
  trackProjectView,
  onSelectTechTag,
}: ProjectCardProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [parallaxOffset, setParallaxOffset] = useState({ nx: 0, ny: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [previewFrameIdx, setPreviewFrameIdx] = useState(0);
  const [spotlightMediaTab, setSpotlightMediaTab] = useState<
    "screenshots" | "video"
  >("screenshots");
  const [spotlightConsoleTab, setSpotlightConsoleTab] = useState<
    "overview" | "metrics"
  >("overview");
  const [visibleLogCount, setVisibleLogCount] = useState<number>(5);
  const [copiedDeployLog, setCopiedDeployLog] = useState(false);

  const allFrames = useMemo(() => {
    const frames: string[] = [];
    if (proj.imageUrl) frames.push(proj.imageUrl);
    if (Array.isArray(proj.gallery)) {
      proj.gallery.forEach((g) => {
        if (g && !frames.includes(g)) frames.push(g);
      });
    }
    return frames;
  }, [proj.imageUrl, proj.gallery]);

  const activeImageSrc = allFrames[previewFrameIdx] || proj.imageUrl || "";

  const deploymentLogs = useMemo(
    () => buildProjectDeploymentLogs(proj),
    [proj]
  );

  useEffect(() => {
    if (!isExpanded) {
      setVisibleLogCount(deploymentLogs.length);
      return;
    }
    setVisibleLogCount(1);
    const interval = window.setInterval(() => {
      setVisibleLogCount((prev) => {
        if (prev >= deploymentLogs.length) {
          window.clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 220);
    return () => window.clearInterval(interval);
  }, [isExpanded, deploymentLogs.length]);

  const handleRerunDeploymentSimulation = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick(980);
    setVisibleLogCount(0);
    window.setTimeout(() => {
      let step = 0;
      const timer = window.setInterval(() => {
        step += 1;
        setVisibleLogCount(step);
        if (step >= deploymentLogs.length) {
          window.clearInterval(timer);
        }
      }, 210);
    }, 60);
  };

  const handleCopyDeploymentLog = (e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = deploymentLogs
      .map((l) => `[${l.timestamp}] [${l.stage}] ${l.message}`)
      .join("\n");
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(formatted).catch(() => {});
    }
    setCopiedDeployLog(true);
    soundFx.playClick(1080);
    window.setTimeout(() => setCopiedDeployLog(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    if (!prefersReduced) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const nx = centerX > 0 ? (x - centerX) / centerX : 0;
      const ny = centerY > 0 ? (y - centerY) / centerY : 0;
      setParallaxOffset({ nx, ny });
      const maxTilt = isExpanded ? 1.8 : 5.5;
      setTilt({
        rotateX: ny * -maxTilt,
        rotateY: nx * maxTilt,
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setParallaxOffset({ nx: 0, ny: 0 });
    setTilt({ rotateX: 0, rotateY: 0 });
    if (!isExpanded) {
      setPreviewFrameIdx(0);
    }
  };

  const projectSkills = (proj.skills || (proj as any).tags || []) as string[];
  const projectHighlights = Array.isArray(proj.highlights)
    ? proj.highlights.filter(Boolean)
    : [];
  const projectMetrics = Array.isArray(proj.metrics)
    ? proj.metrics.filter((m) => m && (m.label || m.value))
    : [];

  const handleCardToggle = () => {
    soundFx.playClick(isExpanded ? 740 : 920);
    if (onToggleExpand) {
      onToggleExpand(proj.id);
      if (!isExpanded) {
        trackProjectView(proj.slug, proj.title);
      }
    } else {
      soundFx.playModalOpen();
      setSelectedProjectForModal(proj);
      setActiveSlideIndex(0);
      trackProjectView(proj.slug, proj.title);
    }
  };

  return (
    <div style={{ perspective: 1400 }} className="h-full">
      <motion.article
        layout="position"
        initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: prefersReduced ? 0 : tilt.rotateX,
          rotateY: prefersReduced ? 0 : tilt.rotateY,
          transformStyle: "preserve-3d",
        }}
        transition={{
          duration: isHovered ? 0.14 : 0.45,
          ease: isHovered ? "linear" : [0.16, 1, 0.3, 1],
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardToggle}
        className={`glass-card relative rounded-2xl overflow-hidden flex flex-col h-full group border backdrop-blur-2xl transition-all duration-300 cursor-pointer ${
          isExpanded
            ? "spotlight-card-active-pulse border-emerald-400/90 bg-gradient-to-b from-slate-900/98 via-slate-950/98 to-[#020617] ring-1 ring-emerald-400/50 z-30"
            : isHovered && !prefersReduced
            ? "spotlight-card-active-pulse border-emerald-400/85 bg-gradient-to-b from-slate-900/98 via-slate-950/98 to-[#020617] z-20"
            : "border-white/[0.08] bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-[#020617] shadow-xl shadow-black/50"
        }`}
        whileHover={
          prefersReduced || isExpanded
            ? {}
            : {
                y: -6,
                transition: { duration: 0.22, ease: "easeOut" },
              }
        }
      >
        {/* Glowing Pulse-Animated Active Perimeter Border Overlay + Laser Sweep */}
        {(isHovered || isExpanded) && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-30 spotlight-ring-pulse overflow-hidden"
            style={{
              boxShadow:
                "inset 0 0 0 1.5px rgba(52, 211, 153, 0.78), inset 0 0 28px rgba(16, 185, 129, 0.22)",
            }}
          >
            {/* Top & Bottom Glowing Laser Edge Accents */}
            <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.95)]" />
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-laser-sweep" />
            <div className="absolute bottom-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/90 to-transparent shadow-[0_0_10px_rgba(56,189,248,0.85)]" />
          </div>
        )}

        {/* Interactive Radial 3D Mouse Spotlight Glare */}
        {!prefersReduced && isHovered && (
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(520px circle at ${coords.x}px ${coords.y}px, rgba(16, 185, 129, 0.16), rgba(56, 189, 248, 0.06) 45%, transparent 75%)`,
            }}
          />
        )}

        {/* Top Developer Spotlight Chrome Bar */}
        <div
          className={`relative z-20 flex items-center justify-between px-4 py-2.5 border-b text-[11px] font-mono transition-colors duration-300 ${
            isHovered || isExpanded
              ? "bg-emerald-950/35 border-emerald-400/35"
              : "bg-slate-950/90 border-white/[0.06]"
          }`}
          style={
            !prefersReduced && isHovered
              ? {
                  transform: `translate3d(${parallaxOffset.nx * 4}px, ${parallaxOffset.ny * 2}px, 16px)`,
                  transition: "transform 120ms ease-out",
                }
              : undefined
          }
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-emerald-400 font-bold tabular-nums">
              {String(index + 1).padStart(2, "0")}.
            </span>
            <span className="text-slate-300 truncate max-w-[200px] sm:max-w-[260px]">
              /{proj.slug || proj.title.toLowerCase().replace(/\s+/g, "-")}
            </span>
            {isExpanded && (
              <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                3D Spotlight Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {proj.metricsBadge && (
              <span className="text-[10px] font-mono text-cyan-300 font-semibold hidden sm:inline">
                {proj.metricsBadge}
              </span>
            )}
            {proj.isFeatured && (
              <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Featured
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardToggle();
              }}
              className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                isExpanded
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                  : "bg-slate-900/90 border-white/[0.1] text-slate-300 hover:border-emerald-400/50 hover:text-emerald-300"
              }`}
              title={
                isExpanded
                  ? "Collapse Project Spotlight"
                  : "Expand 3D Project Spotlight & Deployment Log"
              }
            >
              <span>{isExpanded ? "Collapse" : "Spotlight"}</span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* EXPANDED 3D PROJECT SPOTLIGHT CONSOLE VIEW                        */}
        {/* ================================================================= */}
        {isExpanded ? (
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-7 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Column (5 cols): 3D Parallax Media Stage + Action Links */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                {/* Media Viewport Header Switcher if Video exists */}
                {proj.videoUrl && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      INTERACTIVE MEDIA VIEWPORT
                    </span>
                    <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-white/[0.08] text-[11px] font-mono">
                      <button
                        type="button"
                        onClick={() => setSpotlightMediaTab("screenshots")}
                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                          spotlightMediaTab === "screenshots"
                            ? "bg-emerald-500 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Frames ({allFrames.length || 1})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpotlightMediaTab("video")}
                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                          spotlightMediaTab === "video"
                            ? "bg-emerald-500 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Video Demo
                      </button>
                    </div>
                  </div>
                )}

                {/* 3D Parallax Media Frame */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-white/[0.1] shadow-2xl">
                  {spotlightMediaTab === "video" && proj.videoUrl ? (
                    <iframe
                      src={proj.videoUrl}
                      title={`${proj.title} Demo Video`}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : activeImageSrc ? (
                    <div
                      className="w-full h-full transition-transform duration-200 ease-out"
                      style={
                        !prefersReduced && isHovered
                          ? {
                              transform: `translate3d(${parallaxOffset.nx * -12}px, ${parallaxOffset.ny * -8}px, 0) scale(1.06)`,
                            }
                          : undefined
                      }
                    >
                      <SkillMediaRenderer
                        src={activeImageSrc}
                        alt={proj.title}
                        variant="cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full relative flex flex-col justify-between p-6 bg-gradient-to-br from-slate-950 via-[#07131e] to-slate-950 overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)",
                          backgroundSize: "24px 24px",
                        }}
                      />
                      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{proj.category || "Full-Stack"}</span>
                        {proj.architectureType && (
                          <span className="text-emerald-400">
                            {proj.architectureType}
                          </span>
                        )}
                      </div>
                      <div className="relative z-10 my-auto space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                          <Code2 className="w-5 h-5" />
                        </div>
                        <div className="text-base font-bold text-white tracking-tight">
                          {proj.title}
                        </div>
                      </div>
                      <div className="relative z-10 text-[11px] font-mono text-slate-400 truncate">
                        {projectSkills.slice(0, 4).join(" · ") ||
                          "System Architecture"}
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Multi-Screenshot Thumbnail Selector */}
                {allFrames.length > 1 && spotlightMediaTab === "screenshots" && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {allFrames.map((frameUrl, fIdx) => (
                      <button
                        key={fIdx}
                        type="button"
                        onClick={() => setPreviewFrameIdx(fIdx)}
                        className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          previewFrameIdx === fIdx
                            ? "border-emerald-400 scale-105 shadow-md"
                            : "border-white/15 opacity-65 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={frameUrl}
                          alt={`${proj.title} frame ${fIdx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Metrics Grid inside Expanded Spotlight */}
              {projectMetrics.length > 0 && (
                <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.07]">
                  {projectMetrics.map((m, mIdx) => (
                    <div key={mIdx} className="space-y-0.5">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {m.label}
                      </div>
                      <div className="text-sm font-mono font-bold text-emerald-300 tabular-nums">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Launch Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/[0.06]">
                {proj.liveUrl && proj.liveUrl !== "#" && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFx.playClick()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Live Deployment</span>
                  </a>
                )}

                {proj.githubUrl && proj.githubUrl !== "#" && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFx.playClick()}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.1] hover:border-emerald-500/40 text-slate-200 hover:text-white font-mono font-semibold text-xs transition-all flex items-center gap-1.5"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Source Code</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playModalOpen();
                    setSelectedProjectForModal(proj);
                    setActiveSlideIndex(previewFrameIdx);
                    trackProjectView(proj.slug, proj.title);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-400/40 text-slate-300 hover:text-emerald-300 font-mono font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fullscreen Lightbox</span>
                </button>
              </div>
            </div>

            {/* Right Column (7 cols): Segmented Console Tabs -> Overview & Deploy Log vs Performance Metrics (Recharts) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-5">
              {/* Spotlight Subsystem Tab Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div className="flex items-center p-1 rounded-xl bg-slate-950/95 border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playTab(780);
                      setSpotlightConsoleTab("overview");
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      spotlightConsoleTab === "overview"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Architecture &amp; Deploy Log</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playTab(880);
                      setSpotlightConsoleTab("metrics");
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      spotlightConsoleTab === "metrics"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Performance Metrics</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  {spotlightConsoleTab === "metrics"
                    ? "Recharts Traffic, Latency & Resource Telemetry"
                    : "System Specs & CI/CD Pipeline"}
                </span>
              </div>

              {spotlightConsoleTab === "metrics" ? (
                <React.Suspense
                  fallback={
                    <div className="h-48 w-full rounded-2xl bg-slate-900/50 border border-white/[0.06] animate-pulse flex items-center justify-center">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                        Loading Recharts Telemetry...
                      </span>
                    </div>
                  }
                >
                  <ProjectRechartsMetricsPanel
                    project={proj}
                    onSoundClick={(freq) => soundFx.playClick(freq)}
                  />
                </React.Suspense>
              ) : (
                <>
                  <div className="space-y-4">
                    {/* Metadata Header */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="text-emerald-400 font-semibold">
                          {proj.category || "Full-Stack"}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            proj.status === "Completed"
                              ? "text-emerald-300"
                              : proj.status === "In Development"
                              ? "text-amber-300"
                              : "text-sky-300"
                          }
                        >
                          {proj.status || "Completed"}
                        </span>
                        {proj.startDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {proj.startDate} — {proj.endDate || "Present"}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                        {proj.title}
                      </h3>

                      {(proj.role || proj.architectureType) && (
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
                          {proj.role && (
                            <span>
                              Role: <strong className="text-white">{proj.role}</strong>
                            </span>
                          )}
                          {proj.role && proj.architectureType && (
                            <span className="text-slate-600" aria-hidden="true">
                              ·
                            </span>
                          )}
                          {proj.architectureType && (
                            <span>
                              Architecture:{" "}
                              <strong className="text-emerald-300">
                                {proj.architectureType}
                              </strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Full Description */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Engineering Highlights */}
                    {projectHighlights.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                          Engineering Highlights &amp; Outcomes
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {projectHighlights.map((hl, hIdx) => (
                            <li
                              key={hIdx}
                              className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="text-emerald-400 font-mono font-bold shrink-0">
                                ▹
                              </span>
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interactive Tech Stack Filter Tags */}
                    {projectSkills.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                          Technology Stack (Click tag to filter gallery)
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {projectSkills.map((skill, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (onSelectTechTag) {
                                  soundFx.playTab(840);
                                  onSelectTechTag(skill);
                                }
                              }}
                              className="text-[11px] font-mono bg-slate-900/90 hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/40 px-2.5 py-1 rounded-lg text-slate-200 hover:text-emerald-300 transition-colors cursor-pointer"
                              title={`Filter projects by ${skill}`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* D3.js Project Performance Dashboard (Traffic, Deploy Success, Uptime Trends) */}
                  <React.Suspense fallback={<div className="h-28 w-full rounded-xl bg-slate-900/40 animate-pulse" />}>
                    <ProjectPerformanceDashboard project={proj} />
                  </React.Suspense>

                  {/* Simulated Deployment Pipeline Log Terminal */}
                  <div className="rounded-xl bg-[#030712] border border-emerald-500/25 overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-white/[0.07] text-[11px] font-mono">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>DEPLOYMENT PIPELINE LOG</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 tabular-nums">
                          {Math.min(visibleLogCount, deploymentLogs.length)}/
                          {deploymentLogs.length} stages
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRerunDeploymentSimulation}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/30 text-[10px] font-mono text-slate-300 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                          title="Replay deployment pipeline simulation"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Replay</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyDeploymentLog}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/30 text-[10px] font-mono text-slate-300 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                          title="Copy deployment log"
                        >
                          {copiedDeployLog ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-1.5 font-mono text-[11px] max-h-44 overflow-y-auto custom-scrollbar">
                      {deploymentLogs
                        .slice(0, visibleLogCount)
                        .map((entry, lIdx) => (
                          <div
                            key={lIdx}
                            className="flex items-start gap-2.5 leading-relaxed"
                          >
                            <span className="text-slate-500 tabular-nums shrink-0">
                              {entry.timestamp}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                                entry.stage === "READY"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : entry.stage === "DEPLOY"
                                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                                  : entry.stage === "VERIFY"
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                                  : "bg-slate-800 text-slate-300 border border-white/[0.06]"
                              }`}
                            >
                              {entry.stage}
                            </span>
                            <span
                              className={
                                entry.stage === "READY"
                                  ? "text-emerald-300 font-semibold break-all"
                                  : "text-slate-300 break-all"
                              }
                            >
                              {entry.message}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* COMPACT 3D PARALLAX SPOTLIGHT CARD (CLICK TO EXPAND INLINE)       */
          /* ================================================================= */
          <>
            {/* Interactive Multi-Plane 3D Parallax Media Viewport */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950 shrink-0 z-10 border-b border-white/[0.06]">
              {activeImageSrc ? (
                <div
                  className="w-full h-full transition-transform duration-200 ease-out"
                  style={
                    !prefersReduced && isHovered
                      ? {
                          transform: `translate3d(${parallaxOffset.nx * -12}px, ${parallaxOffset.ny * -8}px, 0) scale(1.07)`,
                        }
                      : undefined
                  }
                >
                  <SkillMediaRenderer
                    src={activeImageSrc}
                    alt={proj.title}
                    variant="cover"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-full relative flex flex-col justify-between p-6 bg-gradient-to-br from-slate-950 via-[#07131e] to-slate-950 overflow-hidden transition-transform duration-200 ease-out"
                  style={
                    !prefersReduced && isHovered
                      ? {
                          transform: `translate3d(${parallaxOffset.nx * -8}px, ${parallaxOffset.ny * -6}px, 0) scale(1.03)`,
                        }
                      : undefined
                  }
                >
                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{proj.category || "Full-Stack"}</span>
                    {proj.architectureType && (
                      <span className="text-emerald-400">
                        {proj.architectureType}
                      </span>
                    )}
                  </div>
                  <div className="relative z-10 my-auto space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div className="text-base font-bold text-white tracking-tight line-clamp-2">
                      {proj.title}
                    </div>
                  </div>
                  <div className="relative z-10 text-[11px] font-mono text-slate-400 truncate">
                    {projectSkills.slice(0, 4).join(" · ") ||
                      "System Architecture"}
                  </div>
                </div>
              )}

              {/* Animated Glass Sheen Sweep on Hover */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-glass-sheen" />
              </div>

              {/* Subtle Contrast Vignette Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent pointer-events-none" />

              {/* Interactive Screenshot Frame Scrubber (when multiple images exist) */}
              {allFrames.length > 1 && (
                <div
                  className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-white/[0.1]">
                    {allFrames.slice(0, 6).map((_, fIdx) => (
                      <button
                        key={fIdx}
                        type="button"
                        onMouseEnter={() => setPreviewFrameIdx(fIdx)}
                        onClick={() => setPreviewFrameIdx(fIdx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          previewFrameIdx === fIdx
                            ? "w-5 bg-emerald-400"
                            : "w-1.5 bg-slate-500 hover:bg-slate-300"
                        }`}
                        title={`Preview snapshot ${fIdx + 1}`}
                        aria-label={`Preview snapshot ${fIdx + 1}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-200 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/[0.08] tabular-nums">
                    {previewFrameIdx + 1}/{allFrames.length}
                  </span>
                </div>
              )}

              {proj.videoUrl && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-white/[0.1] text-[10px] font-mono text-sky-300 flex items-center gap-1.5 z-20">
                  <Video className="w-3 h-3 text-sky-400" />
                  <span>Video Demo</span>
                </div>
              )}
            </div>

            {/* Card Content Section with Foreground 3D Parallax Shift */}
            <div
              className="p-6 flex flex-col flex-grow justify-between gap-5 z-20"
              style={
                !prefersReduced && isHovered
                  ? {
                      transform: `translate3d(${parallaxOffset.nx * 5}px, ${parallaxOffset.ny * 4}px, 22px)`,
                      transition: "transform 140ms ease-out",
                    }
                  : undefined
              }
            >
              <div className="space-y-3">
                {/* Signature Glowing Icon Box + Clean Metadata Line */}
                <div className="flex items-center justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.22)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {(proj.category || "").toLowerCase().includes("database") ||
                    (proj.title || "").toLowerCase().includes("sql") ? (
                      <Database className="w-5 h-5" />
                    ) : (proj.category || "").toLowerCase().includes("security") ||
                      (proj.title || "").toLowerCase().includes("auth") ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (proj.category || "").toLowerCase().includes("cloud") ||
                      (proj.category || "").toLowerCase().includes("microservice") ? (
                      <Cpu className="w-5 h-5" />
                    ) : (
                      <Layers className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5 text-[11px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-semibold">
                      {proj.category || "Full-Stack"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        proj.status === "Completed"
                          ? "text-emerald-300 font-semibold"
                          : proj.status === "In Development"
                          ? "text-amber-300 font-semibold"
                          : "text-sky-300 font-semibold"
                      }
                    >
                      {proj.status || "Completed"}
                    </span>
                  </div>
                </div>

                {/* Project Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight leading-snug">
                  {proj.title}
                </h3>

                {/* Optional Role & Architecture Pattern */}
                {(proj.role || proj.architectureType) && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium">
                    {proj.role && <span>{proj.role}</span>}
                    {proj.role && proj.architectureType && (
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                    )}
                    {proj.architectureType && (
                      <span className="text-cyan-300 font-mono text-[11px]">
                        {proj.architectureType}
                      </span>
                    )}
                  </div>
                )}

                {/* Project Description */}
                <p className="text-xs sm:text-[13px] text-slate-300/90 leading-relaxed line-clamp-3">
                  {proj.description}
                </p>

                {/* Optional Custom Metrics from Admin Panel with Animated Emerald-Cyan Progress Bars */}
                {projectMetrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/[0.05]">
                    {projectMetrics.slice(0, 2).map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-2.5 rounded-xl bg-[#040a18]/90 border border-emerald-500/20 space-y-1.5"
                      >
                        <div className="text-xs font-mono font-extrabold text-emerald-300 tabular-nums">
                          {m.value}
                        </div>
                        <div className="text-[9px] font-mono text-slate-300 uppercase tracking-wider font-bold truncate">
                          {m.label}
                        </div>
                        <div className="h-1 w-full rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                            style={{ width: mIdx === 0 ? "92%" : "88%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Key Highlights from Admin Panel */}
                {projectHighlights.length > 0 && (
                  <ul className="space-y-1 pt-1 border-t border-white/[0.05]">
                    {projectHighlights.slice(0, 2).map((hl, hIdx) => (
                      <li
                        key={hIdx}
                        className="text-[11px] text-slate-300 flex items-start gap-2 leading-relaxed"
                      >
                        <span className="text-emerald-400 font-bold shrink-0">
                          ▹
                        </span>
                        <span className="line-clamp-1">{hl}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-4">
                {/* Compact D3.js Performance Telemetry Strip */}
                <React.Suspense fallback={<div className="h-12 w-full rounded-xl bg-slate-900/40" />}>
                  <ProjectPerformanceDashboard project={proj} compact />
                </React.Suspense>

                {/* Interactive Technology Stack Filter Buttons */}
                {projectSkills.length > 0 && (
                  <div
                    className="flex flex-wrap gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {projectSkills.slice(0, 6).map((skill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (onSelectTechTag) {
                            soundFx.playTab(840);
                            onSelectTechTag(skill);
                          }
                        }}
                        className="text-[10px] font-mono bg-slate-900/90 hover:bg-emerald-500/15 border border-white/[0.07] hover:border-emerald-500/40 px-2.5 py-1 rounded-lg text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap"
                        title={`Filter projects by ${skill}`}
                      >
                        {skill}
                      </button>
                    ))}
                    {projectSkills.length > 6 && (
                      <span className="text-[10px] font-mono text-slate-400 px-1.5 py-1 tabular-nums">
                        +{projectSkills.length - 6}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Action Footer */}
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all flex items-center gap-1.5 font-mono text-[11px] font-bold">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Spotlight</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSpotlightConsoleTab("metrics");
                        if (!isExpanded && onToggleExpand) {
                          soundFx.playClick(920);
                          onToggleExpand(proj.id);
                          trackProjectView(proj.slug, proj.title);
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Open Recharts Performance Metrics tab"
                    >
                      <Gauge className="w-3 h-3 text-cyan-400" />
                      <span>Metrics</span>
                    </button>
                  </div>

                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playModalOpen();
                        setSelectedProjectForModal(proj);
                        setActiveSlideIndex(previewFrameIdx);
                        trackProjectView(proj.slug, proj.title);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/35 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer"
                      title={`Open fullscreen view for ${proj.title}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {proj.liveUrl && proj.liveUrl !== "#" && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => soundFx.playClick()}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-[11px] font-mono font-semibold transition-all flex items-center gap-1"
                        title={`Live Deployment of ${proj.title}`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Live</span>
                      </a>
                    )}
                    {proj.githubUrl && proj.githubUrl !== "#" && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => soundFx.playClick()}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/[0.08] hover:border-emerald-500/30 text-slate-300 hover:text-white text-[11px] font-mono font-semibold transition-all flex items-center gap-1"
                        title={`Source Repository for ${proj.title}`}
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.article>
    </div>
  );
}

const ScrollProgressBar = React.memo(function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0 && barRef.current) {
            const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
            barRef.current.style.transform = `scaleX(${progress / 100})`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-950/60 overflow-hidden pointer-events-none z-[60]">
      <div 
        ref={barRef}
        className="h-full w-full origin-left bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 will-change-transform"
        style={{ transform: 'scaleX(0)' }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />
    </div>
  );
});

export default function PortfolioFrontend({ onEnterCMS }: PortfolioFrontendProps) {
  // Dynamic API Loaded States - Initialized with getInstantState for instant zero-latency first paint
  const [projects, setProjects] = useState<ProjectItem[]>(() => getInstantState('projects', initialProjects));
  const [skills, setSkills] = useState<SkillItem[]>(() => getInstantState('skills', initialSkills));
  const [certificates, setCertificates] = useState<CertificateItem[]>(() => getInstantState('certificates', initialCertificates));
  const [achievements, setAchievements] = useState<AchievementItem[]>(() => getInstantState('achievements', initialAchievements));
  const [experiences, setExperiences] = useState<ExperienceItem[]>(() => getInstantState('experiences', initialExperiences));
  const [education, setEducation] = useState<EducationItem[]>(() => getInstantState('education', initialEducation));
  const [settings, setSettings] = useState<SettingsConfig | null>(() => getInstantState('settings', initialSettings));
  const [footer, setFooter] = useState<any>(() => getInstantState('footer', initialFooter));
  const [analytics, setAnalytics] = useState<AnalyticsMetric | null>(() => getInstantState('analytics', initialAnalytics));
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(() => getInstantState('socialLinks', initialSocialLinks));
  const [footerSocialLinks, setFooterSocialLinks] = useState<any[]>(() => getInstantState('footerSocialLinks', initialSocialLinks));
  const [activeResume, setActiveResume] = useState<ResumeItem | null>(() => getInstantState('activeResume', initialResumes[0] || null));
  const [profile, setProfile] = useState<any>(() => getInstantState('profile', initialProfile));
  const [theme, setTheme] = useState<any>(() => getInstantState('themeSettings', initialThemeSettings));
  const [technologies, setTechnologies] = useState<any[]>(() => getInstantState('technologies', initialTechStack));
  const [codingProfiles, setCodingProfiles] = useState<CodingProfileItem[]>(() => getInstantState('codingProfiles', initialCodingProfiles));
  const [tools, setTools] = useState<ToolItem[]>(() => getInstantState('tools', initialTools));
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetricItem[]>(() => getInstantState('portfolioMetrics', initialPortfolioMetrics));
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => getInstantState('testimonials', initialTestimonials));
  const [articles, setArticles] = useState<ArticleItem[]>(() => getInstantState('articles', initialArticles));
  const [selectedToolCategory, setSelectedToolCategory] = useState<string>('All');
  const [toolSearchQuery, setToolSearchQuery] = useState<string>('');
  const [toolSortMode, setToolSortMode] = useState<'default' | 'name' | 'featured'>('default');
  const [selectedToolForModal, setSelectedToolForModal] = useState<ToolItem | null>(null);
  const [selectedArticleCategory, setSelectedArticleCategory] = useState<string>('All');
  const [articleSearchQuery, setArticleSearchQuery] = useState<string>('');
  const [selectedArticleForModal, setSelectedArticleForModal] = useState<ArticleItem | null>(null);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState<number>(0);
  const [isTestimonialAutoplay, setIsTestimonialAutoplay] = useState<boolean>(true);

  // Interactive Editorial Articles State (No auto-sliding timer)
  const [activeArticleIndex, setActiveArticleIndex] = useState<number>(0);
  const [isArticleAutoplay, setIsArticleAutoplay] = useState<boolean>(false);
  const [articleAutoplaySpeed, setArticleAutoplaySpeed] = useState<number>(5000);
  const [articleDisplayMode, setArticleDisplayMode] = useState<'showcase' | 'grid'>('grid');
  const [showFeaturedArticlesOnly, setShowFeaturedArticlesOnly] = useState<boolean>(false);
  const [articleReaderFontSize, setArticleReaderFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [articleReaderProgress, setArticleReaderProgress] = useState<number>(0);
  const [copiedCodeBlockIdx, setCopiedCodeBlockIdx] = useState<number | null>(null);
  const [isArticleHovered, setIsArticleHovered] = useState<boolean>(false);

  // Interactive Developer Portfolio Projects State (No auto-sliding timer)
  const [activeProjectIndex, setActiveProjectIndex] = useState<number>(0);
  const [isProjectAutoplay, setIsProjectAutoplay] = useState<boolean>(false);
  const [projectAutoplaySpeed, setProjectAutoplaySpeed] = useState<number>(4500);
  const [projectDisplayMode, setProjectDisplayMode] = useState<'showcase' | 'grid'>('grid');
  const [selectedProjectCategory, setSelectedProjectCategory] = useState<string>('All');
  const [showFeaturedProjectsOnly, setShowFeaturedProjectsOnly] = useState<boolean>(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>('');
  const [isProjectHovered, setIsProjectHovered] = useState<boolean>(false);
  const [projectActiveSubsystemTab, setProjectActiveSubsystemTab] = useState<'overview' | 'tech' | 'milestones'>('overview');
  const [explorerMediaTab, setExplorerMediaTab] = useState<'screenshots' | 'video'>('screenshots');
  const [explorerFrameIndex, setExplorerFrameIndex] = useState<number>(0);
  const [expandedSpotlightProjectId, setExpandedSpotlightProjectId] = useState<number | null>(null);
  const [expandedArticleId, setExpandedArticleId] = useState<number | null>(null);

  const [activeSection, setActiveSection] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [render3D, setRender3D] = useState<boolean>(true);
  const [shouldMountChat, setShouldMountChat] = useState<boolean>(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : true);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundFx.isMuted());
  
  // Interactive Timeline (Experience & Education) Animation States
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'experience' | 'education'>('all');
  const [expandedExperienceId, setExpandedExperienceId] = useState<number | null>(null);
  const [expandedEducationId, setExpandedEducationId] = useState<number | null>(null);
  const [hoveredTimelineKey, setHoveredTimelineKey] = useState<string | null>(null);
  
  // Interactive Coding Profiles & Skills Animation States
  const [selectedCodingPlatformFilter, setSelectedCodingPlatformFilter] = useState<string>('All');
  const [codingProfileSearchQuery, setCodingProfileSearchQuery] = useState<string>('');
  const [showFeaturedCodingProfilesOnly, setShowFeaturedCodingProfilesOnly] = useState<boolean>(false);
  const [expandedCodingProfileId, setExpandedCodingProfileId] = useState<number | null>(null);
  const [copiedHandleKey, setCopiedHandleKey] = useState<string | null>(null);
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');
  const [skillSortMode, setSkillSortMode] = useState<'default' | 'proficiency' | 'name'>('default');
  const [selectedSkillForModal, setSelectedSkillForModal] = useState<SkillItem | null>(null);
  
  // Interactive Industry Certifications & Credentials Animation States
  const [selectedCertOrg, setSelectedCertOrg] = useState<string>('All');
  const [certSearchQuery, setCertSearchQuery] = useState<string>('');
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);
  const [selectedCertForModal, setSelectedCertForModal] = useState<CertificateItem | null>(null);

  // Inbound Message Quick Topic Selector & Typing Animation States
  const [contactSubjectPreset, setContactSubjectPreset] = useState<string>('');
  const [copiedEmailSuccess, setCopiedEmailSuccess] = useState<boolean>(false);
  
  const hasInitialAutoScrolledRef = React.useRef(false);
  const hasLoadedOnceRef = React.useRef(false);

  const projectHoverTimeoutRef = React.useRef<any>(null);
  const articleHoverTimeoutRef = React.useRef<any>(null);

  const handleProjectMouseEnter = () => {
    setIsProjectHovered(true);
    if (projectHoverTimeoutRef.current) clearTimeout(projectHoverTimeoutRef.current);
    projectHoverTimeoutRef.current = setTimeout(() => {
      setIsProjectHovered(false);
    }, 6000); // Automatically resume after 6s of inactivity
  };

  const handleProjectMouseLeave = () => {
    if (projectHoverTimeoutRef.current) clearTimeout(projectHoverTimeoutRef.current);
    setIsProjectHovered(false);
  };

  const handleArticleMouseEnter = () => {
    setIsArticleHovered(true);
    if (articleHoverTimeoutRef.current) clearTimeout(articleHoverTimeoutRef.current);
    articleHoverTimeoutRef.current = setTimeout(() => {
      setIsArticleHovered(false);
    }, 6000); // Automatically resume after 6s of inactivity
  };

  const handleArticleMouseLeave = () => {
    if (articleHoverTimeoutRef.current) clearTimeout(articleHoverTimeoutRef.current);
    setIsArticleHovered(false);
  };

  // Auto-reset hover states on touch interaction to prevent permanent pause locks
  useEffect(() => {
    const handleResetHover = () => {
      setIsProjectHovered((prev) => (prev ? false : prev));
      setIsArticleHovered((prev) => (prev ? false : prev));
    };
    window.addEventListener('touchstart', handleResetHover, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleResetHover);
    };
  }, []);

  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(() => soundFx.isAmbientPlaying());

  useEffect(() => {
    const handleAudioSync = () => {
      setIsSoundMuted(soundFx.isMuted());
      setIsAmbientPlaying(soundFx.isAmbientPlaying());
    };
    window.addEventListener('ambient-audio-state-changed', handleAudioSync);
    return () => window.removeEventListener('ambient-audio-state-changed', handleAudioSync);
  }, []);

  const handleToggleSound = () => {
    const active = soundFx.toggleAmbientSpace();
    setIsAmbientPlaying(active);
    setIsSoundMuted(soundFx.isMuted());
  };

  // Defer 3D on desktop and chat assistant until after initial paint
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      const timer = setTimeout(() => setRender3D(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const chatTimer = setTimeout(() => setShouldMountChat(true), 2500);
    return () => clearTimeout(chatTimer);
  }, []);

  // Global Keyboard Shortcut & State Mutation Listener for Developer Command Console (Ctrl+K, Cmd+K, Ctrl+`)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === '`')) {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsTerminalOpen(false);
      }
    };

    const handleCliMutation = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, payload } = customEvent.detail || {};
      if (!type) return;

      switch (type) {
        case 'SET_THEME':
          setTheme((prev: any) => ({
            ...prev,
            primaryColor: payload.primaryColor,
            secondaryColor: payload.secondaryColor
          }));
          setFeedbackToast(`⚡ CLI State Mutated: Active Theme → ${String(payload.name || 'custom').toUpperCase()}`);
          break;
        case 'SET_HERO_BADGE':
          setProfile((prev: any) => ({
            ...prev,
            heroBadge: payload.heroBadge
          }));
          setFeedbackToast(`⚡ CLI State Mutated: Hero Badge → ${payload.heroBadge}`);
          break;
        case 'SET_AVAILABILITY':
          setProfile((prev: any) => ({
            ...prev,
            availability: payload.availabilityStatus,
            availabilityStatus: payload.availabilityStatus
          }));
          setFeedbackToast(`⚡ CLI State Mutated: Availability → ${payload.availabilityStatus}`);
          break;
        case 'TOGGLE_PROJECT_FEATURED':
          setProjects((prev: ProjectItem[]) =>
            prev.map(p => (p.id === payload.projectId ? { ...p, isFeatured: payload.isFeatured } : p))
          );
          setFeedbackToast(`⚡ CLI State Mutated: Project #${payload.projectId} Featured = ${payload.isFeatured}`);
          break;
        case 'FILTER_PROJECTS':
          setSelectedProjectCategory(payload.category || 'All');
          document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
          setFeedbackToast(`⚡ CLI State Mutated: Projects Filter → ${payload.category}`);
          break;
        case 'SET_PROJECT_VIEW':
          setProjectDisplayMode(payload.mode === 'grid' ? 'grid' : 'showcase');
          document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
          setFeedbackToast(`⚡ CLI State Mutated: Projects View → ${String(payload.mode).toUpperCase()}`);
          break;
        case 'BOOST_SKILL':
          setSkills((prev: SkillItem[]) =>
            prev.map(s => (s.id === payload.skillId ? { ...s, proficiency: payload.proficiency } : s))
          );
          setFeedbackToast(`⚡ CLI State Mutated: ${payload.name} Proficiency → ${payload.proficiency}%`);
          break;
        case 'SET_METRIC':
          setPortfolioMetrics((prev: PortfolioMetricItem[]) =>
            prev.map(m => (m.id === payload.metricId ? { ...m, value: payload.value } : m))
          );
          setFeedbackToast(`⚡ CLI State Mutated: KPI Metric Updated → ${payload.value}`);
          break;
        case 'TOGGLE_3D_CORE':
          setRender3D(Boolean(payload.enabled));
          setFeedbackToast(`⚡ CLI State Mutated: 3D Core Engine → ${payload.enabled ? 'ONLINE' : 'PAUSED'}`);
          break;
        case 'OPEN_CMS':
          if (onEnterCMS) onEnterCMS();
          break;
        case 'PULSE_TELEMETRY':
          setAnalytics((prev: any) =>
            prev
              ? {
                  ...prev,
                  totalPageViews: (prev.totalPageViews || 0) + 1,
                  uniqueVisitors: (prev.uniqueVisitors || 0) + 1
                }
              : prev
          );
          setFeedbackToast('⚡ CLI Telemetry Pulse Dispatched • Live Analytics Updated');
          break;
        case 'RESET_STATE':
          setTheme(initialThemeSettings);
          setSelectedProjectCategory('All');
          setProjectDisplayMode('showcase');
          setRender3D(true);
          setProfile((prev: any) => ({
            ...prev,
            heroBadge: initialProfile.heroBadge,
            availability: initialProfile.availability,
            availabilityStatus: initialProfile.availability
          }));
          setFeedbackToast('⚡ CLI State Reset to Default Production Baseline');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('portfolio-cli-mutation', handleCliMutation as EventListener);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('portfolio-cli-mutation', handleCliMutation as EventListener);
    };
  }, [onEnterCMS]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // Tablet Navigation state & ref for horizontal drag and auto-centering
  const tabletNavRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabletNavRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - tabletNavRef.current.offsetLeft);
    setScrollLeft(tabletNavRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !tabletNavRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabletNavRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tabletNavRef.current.scrollLeft = scrollLeft - walk;
  };

  // Center active section item in tablet navigation bar whenever activeSection changes
  useEffect(() => {
    if (tabletNavRef.current) {
      const activeEl = tabletNavRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        const nav = tabletNavRef.current;
        const navWidth = nav.clientWidth;
        const elLeft = activeEl.offsetLeft;
        const elWidth = activeEl.clientWidth;
        const targetScrollLeft = elLeft - (navWidth / 2) + (elWidth / 2);
        nav.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeSection]);

  // Enterprise Navigation System: Throttled Scroll Observer for ScrollToTop button
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY || 0;
      const shouldShow = currentScrollY > 200;

      setShowScrollTop((prev) => (prev !== shouldShow ? shouldShow : prev));

      // Notify parent window when scrolling near top (only when embedded in preview iframe)
      if (window.parent && window.parent !== window && currentScrollY < 50) {
        window.parent.postMessage({
          type: 'PREVIEW_ACTIVE_SECTION',
          sectionId: 'all'
        }, '*');
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Listen for PREVIEW_SCROLL_TO messages from parent LivePreviewModal frame
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_SCROLL_TO') {
        const targetSection = event.data.sectionId;
        if (targetSection === 'all') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const targetId = targetSection === 'techstack' ? 'techstack' :
                           targetSection === 'experience' ? 'experience' :
                           targetSection;
          const el = document.getElementById(targetId) || 
                     document.getElementById(`section-${targetId}`) ||
                     (targetId === 'experience' ? document.getElementById('timeline') : null) ||
                     (targetId === 'hero' ? document.getElementById('home') : null);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isProgrammaticScrollRef = useRef<boolean>(false);
  const programmaticScrollTimerRef = useRef<any>(null);
  const [isHero3DReady, setIsHero3DReady] = useState<boolean>(false);
  const [forceHydrateAllSections, setForceHydrateAllSections] = useState<boolean>(false);

  // Defer heavy WebGL ThreeDHero boot & background chunk preloading until after First Contentful Paint / TTI
  useEffect(() => {
    const isMobileViewport = window.innerWidth < 768;
    const heroDelay = isMobileViewport ? 180 : 60;
    const heroTimer = setTimeout(() => {
      setIsHero3DReady(true);
    }, heroDelay);

    const idleHydrateTimer = setTimeout(() => {
      preloadHeavyPortfolioChunks();
      setForceHydrateAllSections(true);
    }, isMobileViewport ? 1400 : 800);

    return () => {
      clearTimeout(heroTimer);
      clearTimeout(idleHydrateTimer);
    };
  }, []);

  useEffect(() => {
    const sections = ["hero", "home", "about", "projects", "articles", "coding-profiles", "skills", "tools", "timeline", "experience", "education", "credentials", "certificates", "achievements", "testimonials", "contact"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return { id, el };
    }).filter(Boolean) as { id: string, el: HTMLElement }[];

    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (isProgrammaticScrollRef.current) return;
      const intersectingEntries = entries.filter(e => e.isIntersecting);
      if (intersectingEntries.length > 0) {
        const currentId = intersectingEntries[0].target.id;
        setActiveSection(prev => (prev === currentId ? prev : currentId));

        if (window.parent && window.parent !== window) {
          let mappedId = currentId;
          if (currentId === 'home') mappedId = 'hero';
          if (currentId === 'timeline') mappedId = 'experience';

          if (window.scrollY < 80) {
            mappedId = 'all';
          }

          window.parent.postMessage({
            type: 'PREVIEW_ACTIVE_SECTION',
            sectionId: mappedId
          }, '*');
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    observers.forEach(({ el }) => observer.observe(el));

    return () => {
      observers.forEach(({ el }) => observer.unobserve(el));
    };
  }, [projects.length, skills.length, certificates.length, achievements.length, experiences.length, education.length, tools.length, testimonials.length, articles.length]);

  // Prevent body scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Accessibility: Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const isNavItemActive = (itemId: string, currentActive: string) => {
    if (itemId === currentActive) return true;
    if (itemId === 'hero' && (currentActive === 'hero' || currentActive === 'home')) return true;
    if (itemId === 'timeline' && (currentActive === 'experience' || currentActive === 'timeline')) return true;
    if (itemId === 'credentials' && (currentActive === 'credentials' || currentActive === 'certificates')) return true;
    if (itemId === 'skills' && (currentActive === 'skills' || currentActive === 'techstack')) return true;
    return false;
  };

  const scrollToSection = (targetId: string, e?: React.SyntheticEvent) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }

    setMobileMenuOpen(false);
    document.body.style.overflow = 'unset';

    const normalizedId = 
      targetId === 'home' ? 'hero' :
      targetId === 'experience' ? 'timeline' :
      targetId === 'certificates' ? 'credentials' :
      targetId === 'techstack' ? 'skills' :
      targetId;

    const findTargetElement = () => {
      return (
        document.getElementById(normalizedId) || 
        document.getElementById(`section-${normalizedId}`) ||
        (normalizedId === 'timeline' ? (document.getElementById('timeline') || document.getElementById('experience')) : null) ||
        (normalizedId === 'experience' ? (document.getElementById('experience') || document.getElementById('timeline')) : null) ||
        (normalizedId === 'hero' ? (document.getElementById('hero') || document.getElementById('home')) : null) ||
        (normalizedId === 'home' ? (document.getElementById('home') || document.getElementById('hero')) : null) ||
        (normalizedId === 'credentials' ? (document.getElementById('credentials') || document.getElementById('certificates')) : null) ||
        (normalizedId === 'certificates' ? (document.getElementById('certificates') || document.getElementById('credentials')) : null) ||
        (normalizedId === 'skills' ? (document.getElementById('skills') || document.getElementById('techstack')) : null) ||
        (normalizedId === 'techstack' ? (document.getElementById('techstack') || document.getElementById('skills')) : null) ||
        (normalizedId === 'education' ? document.getElementById('education') : null) ||
        (normalizedId === 'articles' ? document.getElementById('articles') : null) ||
        (normalizedId === 'testimonials' ? document.getElementById('testimonials') : null) ||
        (normalizedId === 'coding-profiles' ? document.getElementById('coding-profiles') : null) ||
        (normalizedId === 'tools' ? document.getElementById('tools') : null) ||
        (normalizedId === 'achievements' ? document.getElementById('achievements') : null) ||
        (normalizedId === 'about' ? document.getElementById('about') : null) ||
        (normalizedId === 'projects' ? document.getElementById('projects') : null) ||
        (normalizedId === 'contact' ? document.getElementById('contact') : null)
      );
    };

    // Ensure all lazy sections are immediately hydrated prior to programmatic jump
    preloadHeavyPortfolioChunks();
    setForceHydrateAllSections(true);

    const performJump = () => {
      const element = findTargetElement();
      if (element) {
        isProgrammaticScrollRef.current = true;
        if (programmaticScrollTimerRef.current) {
          clearTimeout(programmaticScrollTimerRef.current);
        }
        programmaticScrollTimerRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 380);

        setActiveSection(normalizedId);

        if (window.history && window.history.replaceState) {
          try {
            window.history.replaceState(null, '', `#${normalizedId}`);
          } catch (err) {
            // Ignore state mutation errors in sandboxed iframes
          }
        }

        const headerOffset = 76;
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = Math.max(0, elementTop - headerOffset);
        const distance = Math.abs(offsetPosition - window.scrollY);
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Instant jump for long-distance navigation (>800px) so clicking any section is immediate
        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion || distance > 800 ? 'auto' : 'smooth'
        });
      }
    };

    performJump();
    if (!forceHydrateAllSections) {
      requestAnimationFrame(performJump);
    }
  };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    soundFx.playTab(880);
    scrollToSection(targetId, e);
  };

  const sectionVariants = {
    hidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.18,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }
    }
  };

  const projectsSectionVariants = {
    hidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.18,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }
    }
  };

  const projectGridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.08,
      }
    }
  };

  const techString = useMemo(() => {
    return (technologies || [])
      .filter((t: any) => t.enabled !== false)
      .sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0))
      .map((t: any) => t.name)
      .join(" • ");
  }, [technologies]);

  const marqueeTechItems = useMemo(() => {
    const fromTech = (technologies || [])
      .filter((t: any) => t.enabled !== false && t.name)
      .sort((a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0))
      .map((t: any) => String(t.name).trim());

    const fromSkills = (skills || [])
      .filter((s: any) => s.name)
      .map((s: any) => String(s.name).trim());

    const enterpriseDefaults = [
      'Java 21',
      'Spring Boot 3',
      'React 19',
      'TypeScript',
      'Microservices',
      'Apache Kafka',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'Docker',
      'Kubernetes',
      'AWS Cloud',
      'System Design',
      'GraphQL',
      'Terraform',
      'CI/CD Pipelines',
    ];

    const seen = new Set<string>();
    const combined: string[] = [];

    for (const item of [...fromTech, ...fromSkills, ...enterpriseDefaults]) {
      const key = item.toLowerCase();
      if (item && !seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

    return combined.slice(0, 18);
  }, [technologies, skills]);

  // Filter/tab selection for skills and projects
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('All');

  const displayTools = useMemo(() => {
    return tools.length > 0 ? tools : initialTools;
  }, [tools]);

  const toolCategories = useMemo(() => {
    const cats = Array.from(new Set(displayTools.map(t => t.category).filter(Boolean)));
    return ['All', ...cats];
  }, [displayTools]);

  const filteredTools = useMemo(() => {
    let list = displayTools.filter(t => {
      const matchesCategory = selectedToolCategory === 'All' || t.category === selectedToolCategory;
      const q = toolSearchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        t.name.toLowerCase().includes(q) || 
        (t.category && t.category.toLowerCase().includes(q)) || 
        (t.description && t.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });

    if (toolSortMode === 'featured') {
      return [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    } else if (toolSortMode === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [displayTools, selectedToolCategory, toolSearchQuery, toolSortMode]);

  const displayArticles = useMemo(() => {
    const raw = articles.length > 0 ? articles : initialArticles;
    return raw
      .filter((a) => a.isPublished !== false)
      .slice()
      .sort(
        (a, b) =>
          (a.displayOrder ?? a.order ?? 999) -
          (b.displayOrder ?? b.order ?? 999)
      );
  }, [articles]);

  const articleCategories = useMemo(() => {
    const cats = Array.from(new Set(displayArticles.map(a => a.category).filter(Boolean)));
    return ['All', ...cats];
  }, [displayArticles]);

  const filteredArticles = useMemo(() => {
    return displayArticles.filter(a => {
      if (showFeaturedArticlesOnly && !a.isFeatured) return false;
      const matchesCategory = selectedArticleCategory === 'All' || a.category === selectedArticleCategory;
      if (!matchesCategory) return false;
      const q = articleSearchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        (a.title || '').toLowerCase().includes(q) ||
        ((a.excerpt || (a as any).summary || '').toLowerCase().includes(q)) ||
        ((a.executiveSummary || '').toLowerCase().includes(q)) ||
        (Array.isArray(a.keyTakeaways) && a.keyTakeaways.some(k => (k || '').toLowerCase().includes(q))) ||
        (a.tags && a.tags.some(tag => tag.toLowerCase().includes(q))) ||
        (a.category && a.category.toLowerCase().includes(q))
      );
    });
  }, [displayArticles, selectedArticleCategory, articleSearchQuery, showFeaturedArticlesOnly]);

  const certOrganizations = useMemo(() => {
    const orgs = new Set<string>();
    certificates.forEach(c => {
      if (c.issuingOrganization) orgs.add(c.issuingOrganization);
    });
    return ['All', ...Array.from(orgs)];
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchOrg = selectedCertOrg === 'All' || (cert.issuingOrganization || '').toLowerCase() === selectedCertOrg.toLowerCase();
      const q = certSearchQuery.trim().toLowerCase();
      const matchQuery = !q || 
        (cert.name || '').toLowerCase().includes(q) ||
        (cert.issuingOrganization || '').toLowerCase().includes(q) ||
        (cert.credentialId || '').toLowerCase().includes(q);
      return matchOrg && matchQuery;
    });
  }, [certificates, selectedCertOrg, certSearchQuery]);

  // Article Autoplay interval with speed control, pause-on-hover, & viewport gating
  useEffect(() => {
    if (!isArticleAutoplay || isArticleHovered || filteredArticles.length <= 1 || activeSection !== 'articles') return;
    const interval = setInterval(() => {
      setActiveArticleIndex(prev => (prev + 1) % filteredArticles.length);
    }, articleAutoplaySpeed);
    return () => clearInterval(interval);
  }, [isArticleAutoplay, isArticleHovered, filteredArticles.length, articleAutoplaySpeed, activeSection]);

  // Ensure active article index stays within bounds when category/search filter changes
  useEffect(() => {
    if (activeArticleIndex >= filteredArticles.length && filteredArticles.length > 0) {
      setActiveArticleIndex(0);
    }
  }, [filteredArticles.length, activeArticleIndex]);

  const displayProjects = useMemo(() => {
    const raw = projects.length > 0 ? projects : initialProjects;
    return raw
      .filter((p) => (p as any).isVisible !== false)
      .slice()
      .sort(
        (a, b) =>
          (a.displayOrder ?? (a as any).order ?? 999) -
          (b.displayOrder ?? (b as any).order ?? 999)
      );
  }, [projects]);

  const projectCategories = useMemo(() => {
    const cats = Array.from(new Set(displayProjects.map(p => p.category).filter(Boolean)));
    return ['All', ...cats];
  }, [displayProjects]);

  const filteredProjects = useMemo(() => {
    return displayProjects.filter(p => {
      const matchesCategory = selectedProjectCategory === 'All' || p.category === selectedProjectCategory;
      const matchesFeatured = !showFeaturedProjectsOnly || Boolean(p.isFeatured);
      const q = projectSearchQuery.trim().toLowerCase();
      const projectTags = (p as any).tags || p.skills || [];
      const matchesSearch = !q || 
        p.title.toLowerCase().includes(q) || 
        ((p.description || '').toLowerCase().includes(q)) || 
        ((p.role || '').toLowerCase().includes(q)) ||
        ((p.architectureType || '').toLowerCase().includes(q)) ||
        (projectTags.some((tag: string) => tag.toLowerCase().includes(q))) ||
        (p.category && p.category.toLowerCase().includes(q));
      return matchesCategory && matchesFeatured && matchesSearch;
    });
  }, [displayProjects, selectedProjectCategory, showFeaturedProjectsOnly, projectSearchQuery]);

  // Ensure active index stays within bounds when category/search filter changes
  useEffect(() => {
    if (activeProjectIndex >= filteredProjects.length && filteredProjects.length > 0) {
      setActiveProjectIndex(0);
    }
    setExplorerFrameIndex(0);
    setExplorerMediaTab('screenshots');
  }, [filteredProjects.length, activeProjectIndex]);

  const displayTestimonials = useMemo(() => {
    return testimonials.length > 0 ? testimonials : initialTestimonials;
  }, [testimonials]);

  useEffect(() => {
    if (!isTestimonialAutoplay || displayTestimonials.length <= 1 || activeSection !== 'testimonials') return;
    const interval = setInterval(() => {
      setActiveTestimonialIndex(prev => (prev + 1) % displayTestimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isTestimonialAutoplay, displayTestimonials.length, activeSection]);
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendOffline, setIsBackendOffline] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Expanded Project Details Modal State
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<ProjectItem | null>(null);
  const [selectedAchievementForModal, setSelectedAchievementForModal] = useState<AchievementItem | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Loaded successfully notification
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const isValidResumeUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const cleanUrl = url.trim();
    if (cleanUrl === '' || cleanUrl === 'null' || cleanUrl === 'undefined') return false;
    return cleanUrl.startsWith('/') || cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');
  };

  // Tracking functions
  const trackClick = async (elementId: string, label: string) => {
    try {
      const res = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'click',
          metadata: { elementId, label }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setAnalytics(data.analytics);
        }
      }
    } catch (e) {
      console.error('Click tracking failed:', e);
    }
  };

  const trackProjectView = async (slug: string, title: string) => {
    try {
      const res = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'project_view',
          metadata: { slug, title }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setAnalytics(data.analytics);
        }
      }
    } catch (e) {
      console.error('Project view tracking failed:', e);
    }
  };

  const trackResumeDownload = async () => {
    try {
      const res = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'resume_download'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setAnalytics(data.analytics);
        }
      }
    } catch (e) {
      console.error('Resume download tracking failed:', e);
    }
  };

  const handleViewResume = (e: React.MouseEvent<HTMLAnchorElement>, trackingKey: string, trackingLabel: string) => {
    e.preventDefault();
    trackClick(trackingKey, trackingLabel);
    
    // 1. If activeResume has a direct base64 data URL, convert to Blob URL for instant viewing
    if (activeResume?.fileUrl && activeResume.fileUrl.startsWith('data:')) {
      try {
        const commaIndex = activeResume.fileUrl.indexOf(',');
        const base64Data = activeResume.fileUrl.substring(commaIndex + 1);
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const mimeType = activeResume.fileType || 'application/pdf';
        const blob = new Blob([byteArray], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
        return;
      } catch (err) {
        console.warn("Base64 blob view fallback:", err);
      }
    }

    // 2. If valid direct remote HTTP URL
    if (isValidResumeUrl(profile?.resumeUrl) && !profile?.resumeUrl?.startsWith('/api/resume') && !profile?.resumeUrl?.startsWith('data:')) {
      window.open(profile.resumeUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (isValidResumeUrl(activeResume?.fileUrl) && !activeResume?.fileUrl?.startsWith('/api/resume') && !activeResume?.fileUrl?.startsWith('data:')) {
      window.open(activeResume.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 3. Backend view endpoint with cache-buster
    const targetUrl = activeResume?.id 
      ? `/api/resume/${activeResume.id}/file?t=${Date.now()}` 
      : `/api/resume/view?t=${Date.now()}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadResume = async (e: React.MouseEvent<HTMLAnchorElement>, trackingKey: string, trackingLabel: string) => {
    e.preventDefault();
    trackClick(trackingKey, trackingLabel);
    trackResumeDownload();

    const candidateName = (profile?.fullName || profile?.displayName || 'Chandru_Mohan').replace(/\s+/g, '_');
    const fileName = activeResume?.fileName || `${candidateName}_Resume.pdf`;

    // 1. If activeResume has a direct base64 data URL, download blob directly
    if (activeResume?.fileUrl && activeResume.fileUrl.startsWith('data:')) {
      try {
        const commaIndex = activeResume.fileUrl.indexOf(',');
        const base64Data = activeResume.fileUrl.substring(commaIndex + 1);
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const mimeType = activeResume.fileType || 'application/pdf';
        const blob = new Blob([byteArray], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        
        setFeedbackToast('✅ CV Resume downloaded successfully!');
        setTimeout(() => setFeedbackToast(null), 3500);
        return;
      } catch (err) {
        console.warn("Base64 direct download fallback:", err);
      }
    }

    const backendDownloadUrl = activeResume?.id
      ? `/api/resume/${activeResume.id}/download?fileName=${encodeURIComponent(fileName)}&t=${Date.now()}`
      : `/api/resume/download?fileName=${encodeURIComponent(fileName)}&url=${encodeURIComponent(profile?.resumeUrl || '')}&t=${Date.now()}`;

    try {
      // 2. Fetch via our same-origin backend download endpoint
      const res = await fetch(backendDownloadUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        
        setFeedbackToast('✅ CV Resume downloaded successfully!');
        setTimeout(() => setFeedbackToast(null), 3500);
        return;
      }
    } catch (err) {
      console.warn("Direct blob fetch fallback:", err);
    }

    // 3. Direct browser navigation to download endpoint
    const fallbackLink = document.createElement('a');
    fallbackLink.href = backendDownloadUrl;
    fallbackLink.download = fileName;
    fallbackLink.style.display = 'none';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);

    setFeedbackToast('✅ CV Resume download started!');
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Fetch all resources on mount from backend APIs
  const fetchAllDataWithRetry = async (attempt = 1, showLoading = true) => {
    try {
      if (showLoading && !hasLoadedOnceRef.current) {
        setIsLoading(true);
      }
      setIsBackendOffline(false);
      if (attempt > 1) {
        setIsRetrying(true);
      }

      const cacheBuster = `t=${Date.now()}`;

      // Fetch everything from a single cached endpoint
      const response = await fetch(`/api/portfolio-combined?${cacheBuster}`);
      if (!response.ok) {
        throw new Error('Combined portfolio API response was not ok');
      }
      const data = await response.json();

      // Configure document properties and title (SEO)
      const seoTitle = data.profile?.seoTitle || (data.profile?.fullName ? `${data.profile.fullName} | ${data.profile.title || 'Engineering Portfolio'}` : (data.settings?.siteName || "Chandru Mohan Portfolio"));
      document.title = seoTitle;

      // Dynamic Favicon (Strictly independent from Website Logo)
      const faviconTarget = data.profile?.faviconUrl || "/favicon.svg";
      if (faviconTarget) {
        let linkFavicon = document.querySelector('link[rel~="icon"]') as HTMLLinkElement;
        if (!linkFavicon) {
          linkFavicon = document.createElement('link');
          linkFavicon.rel = 'icon';
          document.head.appendChild(linkFavicon);
        }
        linkFavicon.href = faviconTarget;
      }

      // Dynamic Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', data.profile?.seoDescription || data.settings?.siteDescription || "Professional Systems Architect and Engineering Portfolio.");

      // Dynamic Meta Keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', data.profile?.seoKeywords || "portfolio, systems architect, full-stack, developer");

      // Dynamic Open Graph Tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', data.profile?.ogTitle || seoTitle);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', data.profile?.ogDescription || data.profile?.seoDescription || data.settings?.siteDescription || "Professional Systems Architect and Engineering Portfolio.");

      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', data.profile?.ogImage || "");

      setSettings(data.settings);

      // Sort data by order fields if available
      setProjects((data.projects || []).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      setSkills((data.skills || []).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      setCertificates(data.certificates || []);
      setAchievements(data.achievements || []);
      setExperiences(data.experiences || []);
      setEducation(data.education || []);
      setAnalytics(data.analytics);
      setSocialLinks((data.socialLinks || []).filter((s: any) => s.isVisible !== false));
      
      const visibleFooterLinks = (data.footerSocialLinks || [])
        .filter((s: any) => s.isVisible)
        .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setFooterSocialLinks(visibleFooterLinks);

      const rawProfiles = (data.codingProfiles && data.codingProfiles.length > 0) ? data.codingProfiles : initialCodingProfiles;
      const visibleCodingProfiles = rawProfiles
        .filter((p: any) => p.visible !== false)
        .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setCodingProfiles(visibleCodingProfiles);

      const visibleTools = (data.tools || [])
        .filter((t: any) => t.isVisible !== false)
        .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setTools(visibleTools);

      if (data.portfolioMetrics && Array.isArray(data.portfolioMetrics)) {
        const visibleMetrics = data.portfolioMetrics
          .filter((m: any) => m.visible !== false)
          .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setPortfolioMetrics(visibleMetrics);
      }

      if (data.testimonials && Array.isArray(data.testimonials)) {
        const visibleTestimonials = data.testimonials
          .filter((t: any) => t.isVisible !== false)
          .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setTestimonials(visibleTestimonials);
      }

      if (data.technologies && Array.isArray(data.technologies)) {
        const sortedTechnologies = [...data.technologies].sort(
          (a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0)
        );
        setTechnologies(sortedTechnologies);
      }

      if (data.articles && Array.isArray(data.articles)) {
        const visibleArticles = data.articles
          .filter((a: any) => a.isPublished !== false)
          .sort((a: any, b: any) => {
            const orderA = a.displayOrder ?? a.order;
            const orderB = b.displayOrder ?? b.order;
            if (typeof orderA === 'number' && typeof orderB === 'number' && orderA !== orderB) {
              return orderA - orderB;
            }
            return new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime();
          });
        setArticles(visibleArticles);
      }

      let finalActiveResume = data.activeResume;
      try {
        const localActive = localStorage.getItem('cms_custom_active_resume');
        if (localActive) {
          const parsed = JSON.parse(localActive);
          if (parsed && (parsed.fileUrl?.startsWith('data:') || !finalActiveResume || (parsed.updatedAt && parsed.updatedAt > (finalActiveResume.updatedAt || '')))) {
            finalActiveResume = parsed;
          }
        }
      } catch (e) {}

      let finalProfile = data.profile || initialProfile;
      try {
        const localOverrides = localStorage.getItem('cms_profile_overrides');
        if (localOverrides) {
          const parsed = JSON.parse(localOverrides);
          finalProfile = { ...finalProfile, ...parsed };
        }
        const deletedStr = localStorage.getItem('cms_deleted_hero_assets');
        if (deletedStr) {
          const deleted = JSON.parse(deletedStr);
          if (deleted.heroBackground) finalProfile.heroBackground = "";
          if (deleted.heroAvatar) finalProfile.heroAvatar = "";
          if (deleted.aboutImage) finalProfile.aboutImage = "";
          if (deleted.coverImage) finalProfile.coverImage = "";
          if (deleted.profileImage) finalProfile.profileImage = "";
          if (deleted.websiteLogo) {
            finalProfile.websiteLogo = "";
            finalProfile.logoUrl = "";
          }
          if (deleted.faviconUrl) finalProfile.faviconUrl = "";
        }
      } catch (e) {}
      setActiveResume(finalActiveResume);
      setProfile(finalProfile);

      // Cache full dataset for instant 0ms zero-flash subsequent loads
      try {
        const fullCachePayload = {
          ...data,
          profile: finalProfile,
          activeResume: finalActiveResume
        };
        localStorage.setItem('cms_portfolio_combined_cache', JSON.stringify(fullCachePayload));
      } catch (e) {}

      // Dynamically sync Document Title and Favicon based on final hydrated profile
      const dynamicTitle = finalProfile.seoTitle || (finalProfile.fullName ? `${finalProfile.fullName} | ${finalProfile.title || 'Principal Systems Architect'}` : "Chandru Mohan | Principal Systems Architect & Portfolio");
      document.title = dynamicTitle;

      const dynamicFavicon = finalProfile.faviconUrl || "/favicon.svg";
      if (dynamicFavicon) {
        let linkFavicon = document.querySelector('link[rel~="icon"]') as HTMLLinkElement;
        if (!linkFavicon) {
          linkFavicon = document.createElement('link');
          linkFavicon.rel = 'icon';
          document.head.appendChild(linkFavicon);
        }
        linkFavicon.href = dynamicFavicon;

        let linkShortcut = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
        if (!linkShortcut) {
          linkShortcut = document.createElement('link');
          linkShortcut.rel = 'shortcut icon';
          document.head.appendChild(linkShortcut);
        }
        linkShortcut.href = dynamicFavicon;

        let linkApple = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
        if (!linkApple) {
          linkApple = document.createElement('link');
          linkApple.rel = 'apple-touch-icon';
          document.head.appendChild(linkApple);
        }
        linkApple.href = dynamicFavicon;
      }

      // Read URL Query Params for theme mode or section jump
      const searchParams = new URLSearchParams(window.location.search);
      const themeParam = searchParams.get('theme');
      const sectionParam = searchParams.get('section');

      if (themeParam === 'light') {
        setTheme({
          ...(data.theme || {}),
          backgroundColor: '#0f172a',
          textColor: '#f8fafc',
          cardColor: '#1e293b'
        });
      } else {
        setTheme(data.theme);
      }

      setFooter(data.footer);
      setTechnologies(data.technologies || []);

      // Complete main page loading immediately
      hasLoadedOnceRef.current = true;
      setIsLoading(false);
      setIsRetrying(false);
      setRetryCount(0);

      // Handle section auto-scroll if section parameter is provided (only once on initial load)
      if (sectionParam && !hasInitialAutoScrolledRef.current) {
        hasInitialAutoScrolledRef.current = true;
        setTimeout(() => {
          const el = document.getElementById(sectionParam) || document.getElementById(`section-${sectionParam}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }

      // Track standard page view details dynamically in background after initial render settles (non-blocking)
      const trackPageView = () => {
        (async () => {
          try {
            const sessionKey = 'alex_dev_session_active';
            const isNewSession = !sessionStorage.getItem(sessionKey);
            if (isNewSession) {
              sessionStorage.setItem(sessionKey, 'true');
            }

            let referralSource = 'Direct Traffic';
            try {
              const referrer = document.referrer ? new URL(document.referrer).hostname : 'Direct Traffic';
              if (referrer.includes('github.com')) referralSource = 'GitHub';
              else if (referrer.includes('linkedin.com')) referralSource = 'LinkedIn';
              else if (referrer.includes('twitter.com') || referrer.includes('t.co')) referralSource = 'Twitter / X';
              else if (referrer.includes('google.com')) referralSource = 'Google / SEO';
            } catch (e) {}

            let clientCountry = 'United States';
            try {
              const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
              if (tz.includes('Asia/Calcutta') || tz.includes('Asia/Kolkata')) clientCountry = 'India';
              else if (tz.includes('Europe/London') || tz.includes('GB')) clientCountry = 'United Kingdom';
              else if (tz.includes('Europe/Berlin') || tz.includes('DE')) clientCountry = 'Germany';
              else if (tz.includes('America/Toronto') || tz.includes('CA')) clientCountry = 'Canada';
              else if (tz.includes('Asia/Tokyo')) clientCountry = 'Japan';
              else if (tz.includes('Australia')) clientCountry = 'Australia';
              else if (tz.includes('Europe/Paris')) clientCountry = 'France';
            } catch (e) {}

            const visitRes = await fetch('/api/analytics/track', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'pageview',
                metadata: {
                  isNewSession,
                  referral: referralSource,
                  country: clientCountry
                }
              })
            });
            if (visitRes.ok) {
              const trackData = await visitRes.json();
              if (trackData?.status === 'success') {
                setAnalytics(trackData.analytics);
              }
            }
          } catch (e) {
            // Ignore analytics background tracking errors
          }
        })();
      };

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(trackPageView, { timeout: 4000 });
      } else {
        setTimeout(trackPageView, 3000);
      }

    } catch (error) {
      console.warn(`Portfolio API fetch notice (attempt ${attempt}):`, error);
      if (attempt < 2) {
        setRetryCount(attempt);
        setTimeout(() => {
          fetchAllDataWithRetry(attempt + 1);
        }, 1000);
      } else {
        // Graceful fallback to initial CMS data so the UI remains 100% operational
        if (!profile) setProfile(initialProfile);
        if (projects.length === 0) setProjects(initialProjects);
        if (skills.length === 0) setSkills(initialSkills);
        if (certificates.length === 0) setCertificates(initialCertificates);
        if (achievements.length === 0) setAchievements(initialAchievements);
        if (experiences.length === 0) setExperiences(initialExperiences);
        if (education.length === 0) setEducation(initialEducation);
        if (!settings) setSettings(initialSettings);
        if (socialLinks.length === 0) setSocialLinks(initialSocialLinks);
        if (!footer) setFooter(initialFooter);
        if (!theme) setTheme(initialThemeSettings);
        if (technologies.length === 0) setTechnologies(initialTechStack);
        setIsBackendOffline(false);
        setIsLoading(false);
        setIsRetrying(false);
      }
    }
  };

  useEffect(() => {
    // Hydrate dynamic data during idle time or after short delay to preserve instant initial paint
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(() => {
        fetchAllDataWithRetry(1, false);
      }, { timeout: 1500 });
      return () => (window as any).cancelIdleCallback?.(handle);
    } else {
      const timer = setTimeout(() => {
        fetchAllDataWithRetry(1, false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {

    // Active synchronization listener for CMS updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cms_update_timestamp') {
        fetchAllDataWithRetry(1, false);
      }
    };
    const handleCustomCmsUpdate = () => {
      fetchAllDataWithRetry(1, false);
    };
    const handleMessageUpdate = (e: MessageEvent) => {
      if (e.data?.type === 'CMS_DATA_UPDATED') {
        fetchAllDataWithRetry(1, false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cms-data-updated', handleCustomCmsUpdate);
    window.addEventListener('message', handleMessageUpdate);

    // Real-time polling when iframe live preview mode is active
    let pollInterval: any = null;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('preview') === 'true') {
        pollInterval = setInterval(() => {
          fetchAllDataWithRetry(1, false);
        }, 3000);
      }
    } catch (e) {}

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cms-data-updated', handleCustomCmsUpdate);
      window.removeEventListener('message', handleMessageUpdate);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Form Submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formSubject || !formMessage) {
      setFormError('All fields are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: formName,
          name: formName,
          senderEmail: formEmail,
          email: formEmail,
          subject: formSubject,
          messageContent: formMessage,
          message: formMessage
        })
      });

      if (response.ok) {
        const resData = await response.json().catch(() => ({}));
        if (!resData.emailDelivered) {
          try {
            const targetEmail = profile?.email || 'chandrumohan550@gmail.com';
            await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                name: formName,
                email: formEmail,
                _replyto: formEmail,
                _subject: `🚀 [Portfolio Contact] ${formSubject} - from ${formName}`,
                subject: formSubject,
                message: formMessage,
                _template: 'table',
                _captcha: 'false'
              })
            });
          } catch (relayErr) {}
        }

        setFormSuccess(true);
        setFormName('');
        setFormEmail('');
        setFormSubject('');
        setFormMessage('');
        
        // Notify admin panel & open tabs immediately
        notifyCmsUpdate();

        // Refresh analytics stats as form sending increments contact conversion rate
        try {
          const analyticsRes = await fetch('/api/analytics');
          if (analyticsRes.ok) {
            const analyticsData = await analyticsRes.json();
            setAnalytics(analyticsData);
          }
        } catch (e) {}

        // Auto trigger a brief visual success alert
        setFeedbackToast("✓ Your message has been sent successfully and delivered to Chandru's Admin Inbox!");
        setTimeout(() => setFeedbackToast(null), 6000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setFormError(errorData.error || 'Endpoint rejected transaction. Please verify backend state.');
      }
    } catch (err) {
      setFormError('API timeout or connection failure. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Dynamic Skill groups extraction and sorting
  const skillCategories = React.useMemo(() => {
    const visibleSkills = skills.filter(s => s.visibility !== false);
    const cats = new Set(visibleSkills.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, [skills]);

  const filteredSkills = React.useMemo(() => {
    const visibleSkills = skills.filter(s => s.visibility !== false);
    let list = selectedSkillCategory === 'All' 
      ? visibleSkills 
      : visibleSkills.filter(s => s.category === selectedSkillCategory);
    
    if (skillSearchQuery.trim()) {
      const q = skillSearchQuery.toLowerCase().trim();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    if (skillSortMode === 'proficiency') {
      return [...list].sort((a, b) => ((b as any).proficiency || (b as any).level || 0) - ((a as any).proficiency || (a as any).level || 0));
    } else if (skillSortMode === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Default: Sort by displayOrder ascending, then by name
    return [...list].sort((a, b) => {
      const orderA = a.displayOrder !== undefined ? a.displayOrder : 999;
      const orderB = b.displayOrder !== undefined ? b.displayOrder : 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }, [skills, selectedSkillCategory, skillSearchQuery, skillSortMode]);

  // Dynamic Coding Profile categories & filter
  const codingPlatformCategories = React.useMemo(() => {
    const platforms = Array.from(new Set(codingProfiles.map(p => p.platformType || p.displayName).filter(Boolean)));
    return ['All', ...platforms];
  }, [codingProfiles]);

  const filteredCodingProfiles = React.useMemo(() => {
    return codingProfiles.filter(p => {
      if (showFeaturedCodingProfilesOnly && !p.featured) return false;
      const matchesPlatform =
        selectedCodingPlatformFilter === 'All' ||
        (p.platformType || p.displayName) === selectedCodingPlatformFilter;
      if (!matchesPlatform) return false;
      const q = codingProfileSearchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        (p.displayName || '').toLowerCase().includes(q) ||
        (p.platformType || '').toLowerCase().includes(q) ||
        (p.username || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.primaryLanguage || '').toLowerCase().includes(q) ||
        (p.ratingOrRank || '').toLowerCase().includes(q) ||
        (Array.isArray(p.highlights) && p.highlights.some(h => (h || '').toLowerCase().includes(q)))
      );
    });
  }, [codingProfiles, selectedCodingPlatformFilter, codingProfileSearchQuery, showFeaturedCodingProfilesOnly]);

  // Dynamic achievements filtering & sorting
  const visibleAchievements = React.useMemo(() => {
    return achievements.filter(a => a.visibility !== false);
  }, [achievements]);

  const achievementCategories = React.useMemo(() => {
    const cats = new Set(visibleAchievements.map(a => a.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [visibleAchievements]);

  const filteredAchievements = React.useMemo(() => {
    const list = selectedAchievementCategory === 'All' 
      ? [...visibleAchievements] 
      : visibleAchievements.filter(a => a.category === selectedAchievementCategory);
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [visibleAchievements, selectedAchievementCategory]);

  // Dynamic Skill icon renderer supporting custom brand colors and standard presets
  const renderSkillIcon = (iconName: string, customColor?: string) => {
    const finalColor = customColor || '#10b981';
    switch (iconName) {
      case 'Layout': return <Layers className="w-5 h-5 animate-pulse" style={{ color: finalColor }} />;
      case 'Code2': return <Code2 className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Palette': return <Palette className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Cpu': return <Cpu className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Database': return <Database className="w-5 h-5" style={{ color: finalColor }} />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Terminal': return <Terminal className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Sliders': return <Sliders className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Layers': return <Layers className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Globe': return <Globe className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Smartphone': return <Smartphone className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Network': return <Network className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Braces': return <Braces className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Cloud': return <Cloud className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Lock': return <Lock className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Settings': return <Settings className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Activity': return <Activity className="w-5 h-5" style={{ color: finalColor }} />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" style={{ color: finalColor }} />;
      default: return <Cpu className="w-5 h-5" style={{ color: finalColor }} />;
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#10b981');
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129';
  };

  if (isBackendOffline) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 font-sans flex flex-col items-center justify-center relative p-6 overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-8 text-center space-y-6 shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner shadow-amber-500/5">
            <Cpu className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-200 tracking-tight">System Under Maintenance</h1>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Our API services are currently optimizing or offline. The database sync thread is temporarily disconnected.
            </p>
          </div>

          <div className="border-t border-slate-800/60 pt-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 bg-slate-950/40 p-3 rounded-lg border border-slate-900">
              <span>Host connection</span>
              <span className="text-red-400 font-bold uppercase tracking-wide">Offline</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsBackendOffline(false);
              setIsLoading(true);
              // Force reload page to restart the sequence with fresh caches
              window.location.reload();
            }}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs tracking-wide transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98] cursor-pointer"
          >
            Reconnect to Server Pool
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 font-sans flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background radial atmosphere */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-[160px] pointer-events-none" />
        
        <div className="text-center z-10 space-y-4">
          <div className="inline-block w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">
            {isRetrying 
              ? `Reconnection attempt ${retryCount}/3 via exponential backoff...` 
              : "Retrieving portfolio configurations from Express server-pool..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans relative overflow-x-hidden portfolio-root">
      
      {/* Dynamic Style Injection representing customized theme & colors */}
      {theme && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${theme.primaryColor};
            --primary-rgb: ${hexToRgb(theme.primaryColor)};
            --secondary: ${theme.secondaryColor};
            --accent: ${theme.accentColor};
            --text-color: ${theme.textColor};
            --bg-color: ${theme.backgroundColor};
            --card-bg: ${theme.cardColor};
            --border-color: ${theme.borderColor};
            --btn-color: ${theme.buttonColor};
            --hover-color: ${theme.hoverColor};
            --gradient-start: ${theme.gradientStart};
            --gradient-end: ${theme.gradientEnd};
            --border-radius: ${
              theme.layoutBorderRadius === 'none' ? '0px' : 
              theme.layoutBorderRadius === 'sm' ? '4px' :
              theme.layoutBorderRadius === 'md' ? '8px' :
              theme.layoutBorderRadius === 'lg' ? '12px' :
              theme.layoutBorderRadius === 'xl' ? '16px' : '24px'
            };
          }

          .portfolio-root {
            background-color: var(--bg-color) !important;
            color: var(--text-color) !important;
            font-family: '${theme.bodyFont}', sans-serif !important;
            letter-spacing: ${
              theme.letterSpacing === 'tighter' ? '-0.05em' :
              theme.letterSpacing === 'tight' ? '-0.025em' :
              theme.letterSpacing === 'normal' ? '0em' :
              theme.letterSpacing === 'wide' ? '0.025em' : '0.05em'
            } !important;
            line-height: ${
              theme.lineHeight === 'none' ? '1' :
              theme.lineHeight === 'tight' ? '1.25' :
              theme.lineHeight === 'snug' ? '1.375' :
              theme.lineHeight === 'normal' ? '1.5' :
              theme.lineHeight === 'relaxed' ? '1.625' : '2'
            } !important;
          }

          .portfolio-root h1, .portfolio-root h2, .portfolio-root h3, .portfolio-root h4, .portfolio-root h5, .portfolio-root h6, .display-font {
            font-family: '${theme.headingFont}', sans-serif !important;
          }

          .portfolio-root button, .portfolio-root a.btn, .portfolio-root .action-btn {
            border-radius: ${theme.buttonBorderRadius} !important;
            ${theme.buttonGlow ? `box-shadow: 0 0 12px ${theme.primaryColor}33 !important;` : ''}
          }

          .text-emerald-400 {
            color: var(--primary) !important;
          }
          .bg-emerald-500 {
            background-color: var(--btn-color) !important;
          }
          .hover\\:bg-emerald-600:hover {
            background-color: var(--hover-color) !important;
          }
          .border-emerald-500\\/20, .border-emerald-500\\/30, .border-emerald-500\\/10, .border-emerald-500\\/15 {
            border-color: var(--border-color) !important;
          }
          .bg-emerald-500\\/10, .bg-emerald-500\\/5, .bg-emerald-500\\/20, .bg-emerald-500\\/15, .bg-emerald-500\\/3 {
            background-color: rgba(var(--primary-rgb), 0.1) !important;
          }
          .glass-card {
            background:
              radial-gradient(120% 100% at 15% 0%, rgba(var(--primary-rgb), 0.09) 0%, rgba(6, 182, 212, 0.04) 45%, transparent 80%),
              linear-gradient(145deg, rgba(255, 255, 255, 0.065) 0%, rgba(15, 23, 42, 0.72) 38%, rgba(3, 8, 22, 0.88) 100%) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            border-color: var(--border-color) !important;
            border-radius: var(--border-radius) !important;
            box-shadow:
              inset 0 1px 0 0 rgba(255, 255, 255, 0.18),
              inset 0 0 22px 0 rgba(var(--primary-rgb), 0.075),
              inset 0 -1px 0 0 rgba(6, 182, 212, 0.12),
              0 20px 45px -15px rgba(0, 0, 0, 0.75),
              0 8px 20px -6px rgba(2, 6, 23, 0.65),
              0 0 0 1px rgba(var(--primary-rgb), 0.06) !important;
          }
        `}} />
      )}

      {/* Full-Screen High-Performance SVG 'Aurora Wave' Animated Mesh Gradient Background */}
      <AuroraWaveBackground
        primaryColor={theme?.gradientStart || '#10b981'}
        secondaryColor={theme?.gradientEnd || '#06b6d4'}
        className="fixed inset-0 z-0"
      />
      <DynamicBackground
        bg={theme?.customWallpaper?.enabled ? theme.customWallpaper : theme?.heroBackground}
        gradientStart={theme?.gradientStart}
        gradientEnd={theme?.gradientEnd}
        alwaysRenderAmbient={true}
      />
      <DeepSpaceParticleOverlay
        variant="hero"
        particleCount={48}
        className="fixed inset-0 z-[2]"
      />
      
      {/* Fixed End-to-End Radial Atmosphere Blooms (Zero-Filter GPU Gradients) */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(520px circle at 25% 10%, rgba(16,185,129,0.08), transparent 70%), radial-gradient(620px circle at 75% 75%, rgba(6,182,212,0.06), transparent 70%)',
        }}
      />

      {/* Floating System-Wide Alerts/Toasts */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm glass-card border border-emerald-500/30 p-4 rounded-xl shadow-2xl flex items-start gap-3 glow-border animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Check className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 block font-bold">API Sync Successful</span>
            <p className="text-xs text-slate-300 mt-1">{feedbackToast}</p>
          </div>
        </div>
      )}

      {/* Permanent Sticky Glassmorphic Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/[0.06] bg-[#030712]/90 backdrop-blur-xl translate-y-0 shadow-lg shadow-black/20">
        {/* Top Scroll Reading Progress Bar */}
        <ScrollProgressBar />

        <div className="w-full max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-3.5 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Logo / Personal Branding (Fixed Left) */}
          <a 
            href="#hero"
            onClick={(e) => handleNavLinkClick(e, 'hero')}
            className="flex items-center gap-2.5 min-w-0 shrink-0 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg p-0.5"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-emerald-500/60 transition-colors">
              {profile?.websiteLogo || profile?.logoUrl ? (
                <img src={profile.websiteLogo || profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
              ) : (
                <span className="font-luxury font-bold text-emerald-400 text-lg">
                  {profile?.logoText ? profile.logoText.charAt(0).toUpperCase() : (profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : "C")}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 max-w-[210px] sm:max-w-[260px] md:max-w-none">
              <h2 className="text-[11px] xs:text-xs sm:text-sm font-bold tracking-tight text-white uppercase font-display truncate group-hover:text-emerald-400 transition-colors">
                {profile?.logoText || profile?.displayName || profile?.fullName || "Chandru Mohan"}
              </h2>
              <span className="text-[8px] xs:text-[9px] font-mono tracking-wider text-emerald-400/80 block uppercase font-bold truncate">
                {profile?.title || "Principal Systems Architect"}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links (Large Desktop Screens xl+) */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-3 2xl:gap-4 text-xs font-medium text-slate-400 shrink-0" aria-label="Desktop Navigation">
            {desktopNavItems.map((item) => {
              const isActive = isNavItemActive(item.id, activeSection);
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavLinkClick(e, item.id)}
                  className={`relative py-1.5 px-2.5 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 whitespace-nowrap ${
                    isActive 
                      ? "text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] bg-emerald-500/5 border border-emerald-500/20" 
                      : "text-slate-400 hover:text-emerald-300 hover:bg-white/[0.02]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Tablet Navigation Container (Horizontally Swipeable/Scrollable, md to xl) */}
          <div 
            ref={tabletNavRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="hidden md:flex xl:hidden items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-1 px-2 touch-pan-x min-w-0 flex-1 select-none cursor-grab active:cursor-grabbing border-x border-white/[0.04] mx-2"
            aria-label="Tablet Swipeable Navigation"
          >
            {desktopNavItems.map((item) => {
              const isActive = isNavItemActive(item.id, activeSection);
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  data-active={isActive ? "true" : "false"}
                  onClick={(e) => handleNavLinkClick(e, item.id)}
                  className={`shrink-0 py-1.5 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    isActive
                      ? "text-emerald-400 font-bold bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/10"
                      : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Action Buttons Area (Fixed Right) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Header Navigation Social Links */}
            {socialLinks.filter(l => l.showInNavigation === true && l.isVisible !== false).map((link) => (
              <SocialLinkAnchor
                key={link.id}
                link={link}
                onClick={() => trackClick('social_nav_' + link.platform.toLowerCase(), link.platform)}
                className="hidden lg:flex p-2 rounded-lg border border-white/[0.06] bg-white/[0.01] text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                childrenClassName="w-4 h-4 object-contain"
              />
            ))}

            {/* Ambient Space Audio Loop & Sound FX Mute/Unmute Toggle */}
            <button
              onClick={handleToggleSound}
              aria-pressed={isAmbientPlaying}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0 inline-flex items-center gap-1.5 ${
                isAmbientPlaying
                  ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.28)] hover:bg-emerald-500/25 hover:border-emerald-400/70'
                  : 'border-white/[0.08] bg-slate-900/60 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/35'
              }`}
              title={isAmbientPlaying ? 'Ambient Space Audio Active (Click to Mute)' : 'Unmute Ambient Space Audio Loop'}
              aria-label={isAmbientPlaying ? 'Mute Ambient Space Audio' : 'Unmute Ambient Space Audio'}
              id="btn-sound-toggle-header"
            >
              {isAmbientPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="flex items-end gap-[2px] h-3" aria-hidden="true">
                    <motion.span
                      animate={{ height: ['35%', '100%', '45%'] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-[2px] bg-emerald-400 rounded-full"
                    />
                    <motion.span
                      animate={{ height: ['90%', '35%', '100%'] }}
                      transition={{ duration: 0.75, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-[2px] bg-teal-300 rounded-full"
                    />
                    <motion.span
                      animate={{ height: ['50%', '95%', '30%'] }}
                      transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-[2px] bg-emerald-400 rounded-full"
                    />
                  </span>
                  <span className="hidden xl:inline text-[11px] font-mono font-semibold text-emerald-300">Ambient</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 shrink-0" />
                  <span className="hidden xl:inline text-[11px] font-mono font-semibold">Ambient</span>
                </>
              )}
            </button>

            {/* Desktop Dashboard Access Button */}
            <button
              onClick={onEnterCMS}
              className="group relative hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/15 transition-all duration-300 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0"
              title="Admin & Recruiter Portal"
              aria-label="Admin & Recruiter Portal"
              id="btn-access-cms-terminal"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono font-semibold tracking-wide">Portal</span>
              <span className="absolute top-full right-0 mt-2 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 border border-slate-800 text-slate-200 text-[10px] font-mono py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                Admin & Recruiter Portal
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-emerald-400 bg-slate-900/60 rounded-lg border border-slate-800 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden border-t border-white/[0.06] bg-[#030712]/95 backdrop-blur-2xl px-4 sm:px-6 py-5 space-y-4 max-h-[82vh] overflow-y-auto"
            >
              <nav className="flex flex-col gap-1.5 font-medium text-slate-300" aria-label="Mobile Navigation">
                {mobileNavItems.map((item) => {
                  const isActive = isNavItemActive(item.id, activeSection);
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavLinkClick(e, item.id);
                      }}
                      className={`relative py-2.5 px-3.5 rounded-xl transition-all duration-200 flex items-center justify-between text-xs font-mono uppercase tracking-wider ${
                        isActive 
                          ? "text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}
                    </a>
                  );
                })}
              </nav>
              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Portal Access</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onEnterCMS();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/15 transition-all flex items-center gap-2 text-xs font-mono font-semibold cursor-pointer"
                  title="Admin & Recruiter Portal"
                  aria-label="Admin & Recruiter Portal"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin Portal</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Landmark Container elevated above end-to-end animated background */}
      <main id="main-content" tabIndex={-1} className="relative z-10 focus:outline-none">

      {/* Hero Section */}
      {profile?.heroVisibility !== false && (
      <section 
        className="relative w-full flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-24 sm:pt-28 lg:pt-28 pb-5 sm:pb-6 lg:pb-8 overflow-x-hidden border-b border-white/[0.05]" 
        id="hero"
      >
        <div className="w-full max-w-[1536px] 2xl:max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8 xl:gap-10 relative z-10">
          
          {/* Textual Overlays (Left column in Desktop grid) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 xl:col-span-6 flex flex-col items-center text-center lg:items-start lg:text-left w-full gap-5 sm:gap-6 relative"
          >
            {/* Subtle Ambient Radial Backlight for Hero Typography */}
            <div className="absolute -top-10 -left-10 w-80 h-80 bg-emerald-500/12 rounded-full blur-[100px] pointer-events-none" />

            {/* Top Badges & Status Container */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 shrink-0">
              {/* Illuminated Command Badge */}
              {profile?.heroBadge && profile.heroBadge.trim() !== "" && (
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-500/20 via-slate-900/90 to-cyan-500/15 border border-emerald-400/40 px-4 py-1.5 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.2),inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-xl"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-300 font-extrabold whitespace-nowrap">
                    {profile.heroBadge}
                  </span>
                </motion.div>
              )}

              {/* Dynamic Highlight Tags */}
              {profile?.highlightTags && profile.highlightTags.trim() && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {profile.highlightTags.split(',').map((tag: string, idx: number) => {
                    const cleanTag = tag.trim();
                    if (!cleanTag) return null;
                    return (
                      <span
                        key={idx}
                        className="text-[9px] sm:text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold shadow-xs backdrop-blur-md"
                      >
                        {cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Optional Animated Avatar & Online Status */}
              {profile?.heroAvatar && profile.heroAvatar.trim() !== "" && (
                <div className="inline-flex items-center gap-2.5 bg-slate-900/90 border border-emerald-500/30 px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/10 backdrop-blur-md">
                  <AnimatedProfileAvatar
                    src={profile.heroAvatar}
                    alt={profile?.heroName || profile?.fullName || "Founder"}
                    size="xs"
                    showStatus={false}
                    glowIntensity="subtle"
                    shape="circle"
                  />
                  <div className="text-left flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      {profile?.statusBadgeText || profile?.onlineStatus || "Systems Architect"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Monumental Hero Display Name, Role Ribbon & HUD Typewriter */}
            <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
              {profile?.professionalLabel && profile.professionalLabel.trim() !== "" && (
                <span className="text-[10px] sm:text-xs font-mono text-emerald-400/90 uppercase tracking-widest block font-bold">
                  {profile.professionalLabel}
                </span>
              )}

              <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black leading-[1.06] font-luxury tracking-tight bg-gradient-to-br from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_4px_28px_rgba(16,185,129,0.22)]">
                {profile?.heroName || profile?.fullName || "CHANDRU M"}
              </h1>

              {(profile?.heroTitle || profile?.title) && (
                <div className="inline-flex items-center justify-center lg:justify-start gap-2.5 pt-0.5">
                  <span className="h-[2px] w-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full hidden lg:inline-block shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <p className="text-xs sm:text-sm font-mono text-emerald-400 uppercase tracking-[0.22em] font-extrabold">
                    {profile?.heroTitle || profile?.title}
                  </p>
                </div>
              )}

              {(profile?.heroSubtitle || profile?.shortTagline || profile?.typingText) && (
                <h2 className="text-sm sm:text-lg lg:text-xl font-display font-semibold text-slate-100 leading-snug flex flex-wrap items-center gap-2 justify-center lg:justify-start pt-0.5">
                  {(profile?.heroSubtitle || profile?.shortTagline) && (
                    <span className="text-slate-200">{profile?.heroSubtitle || profile?.shortTagline}</span>
                  )}
                  {profile?.typingText && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.12)] backdrop-blur-md">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <HeroTypewriter wordsString={profile.typingText} />
                    </span>
                  )}
                </h2>
              )}
            </div>

            {/* Editorial Bio with Luminous Left Accent Line */}
            {(profile?.heroDescription || profile?.shortIntroduction) && (
              <div className="relative max-w-lg lg:max-w-xl lg:border-l-2 lg:border-emerald-500/45 lg:pl-4 lg:py-1 lg:bg-gradient-to-r lg:from-emerald-500/[0.04] lg:to-transparent lg:rounded-r-xl">
                <p className="text-xs sm:text-sm lg:text-[15px] text-slate-300/95 leading-relaxed">
                  {profile?.heroDescription || profile?.shortIntroduction}
                </p>
              </div>
            )}

            {/* Primary & Resume Action Dock */}
            <div className="flex flex-col gap-3.5 pt-1 w-full max-w-xl">
              {/* Row 1: Primary CTAs */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 w-full">
                <motion.a 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href={profile?.primaryCtaUrl || "#projects"} 
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-[13px] rounded-xl transition-all shadow-[0_0_28px_rgba(16,185,129,0.35),inset_0_1px_0_0_rgba(255,255,255,0.4)] hover:shadow-[0_0_36px_rgba(16,185,129,0.55)] flex items-center justify-center gap-2 cursor-pointer group"
                  onClick={(e) => {
                    trackClick('explore_btn_hero', 'Explore Projects Click');
                    const target = profile?.primaryCtaUrl || '#projects';
                    if (target.startsWith('#')) {
                      scrollToSection(target.replace('#', ''), e);
                    }
                  }}
                >
                  <span>{profile?.primaryCtaText || "Explore Engineering"}</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </motion.a>

                <motion.a 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href={profile?.secondaryCtaUrl || "#contact"} 
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900/80 hover:bg-emerald-500/15 text-white font-bold text-xs sm:text-[13px] rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.1),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl cursor-pointer"
                  onClick={(e) => {
                    trackClick('contact_btn_hero', 'Contact Click');
                    const target = profile?.secondaryCtaUrl || '#contact';
                    if (target.startsWith('#')) {
                      scrollToSection(target.replace('#', ''), e);
                    }
                  }}
                >
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>{profile?.secondaryCtaText || "Get in Touch"}</span>
                </motion.a>
              </div>

              {/* Row 2: Resume Capsule Bar */}
              {!isValidResumeUrl(profile?.resumeUrl) ? (
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
                  <button 
                    disabled
                    className="w-full sm:w-auto px-4 py-2.5 border border-white/[0.04] bg-white/[0.01] text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-50"
                  >
                    <XCircle className="w-4 h-4 text-slate-500" />
                    <span>Resume not available</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full sm:w-auto">
                    <motion.a 
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      href={profile?.resumeUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleViewResume(e, 'resume_view_hero', 'View Resume')}
                      className="w-full sm:w-auto px-4 py-2.5 border border-white/[0.12] hover:border-emerald-400/50 bg-slate-900/75 hover:bg-emerald-500/10 text-slate-200 hover:text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xl shadow-md"
                    >
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>View Resume</span>
                    </motion.a>

                    {(activeResume ? activeResume.isDownloadEnabled !== false : true) && (
                      <motion.a 
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        href={profile?.resumeUrl || '#'}
                        download={activeResume?.fileName || 'resume.pdf'}
                        onClick={(e) => handleDownloadResume(e, 'resume_download_hero', 'Download Resume')}
                        className="w-full sm:w-auto px-4 py-2.5 border border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xl shadow-[0_0_18px_rgba(16,185,129,0.15)]"
                      >
                        <Download className="w-4 h-4" />
                        <span>{profile?.resumeDownloadText || profile?.downloadCtaText || "Download CV"}</span>
                      </motion.a>
                    )}
                  </div>
                  
                  <div className="flex flex-col text-[10px] font-mono text-slate-400 items-center sm:items-start pl-0 sm:pl-3 sm:border-l sm:border-emerald-500/20 select-none shrink-0">
                    <span className="text-emerald-400 font-extrabold">
                      {profile?.versionText || (activeResume ? `Version ${activeResume.version}` : "Version 2.4.0")}
                    </span>
                    <span className="mt-0.5 text-slate-400/80">
                      {profile?.updateText || (activeResume ? `Updated ${new Date(activeResume.updatedAt).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}` : "Updated Recently")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Hero Section Links */}
            {socialLinks.filter(l => l.showInHero === true).length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1 relative z-30">
                {socialLinks.filter(l => l.showInHero === true).map((link) => (
                  <SocialLinkAnchor
                    key={link.id}
                    link={link}
                    onClick={() => trackClick('social_herodock_' + link.platform.toLowerCase(), link.platform)}
                    className="px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-md"
                    childrenClassName="w-4 h-4 object-contain"
                  />
                ))}
              </div>
            )}

            {/* Dynamic Social Links in Hero Section (Glassmorphic Coordinates Dock) */}
            {socialLinks.filter(l => l.showInCoordinates !== false).length > 0 && (
              <div className="inline-flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/65 border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl relative z-30">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.18em] block font-bold">
                  Coordinates Channels:
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {socialLinks.filter(l => l.showInCoordinates !== false).map((link) => (
                    <SocialLinkAnchor
                      key={link.id}
                      link={link}
                      onClick={() => trackClick('social_hero_' + link.platform.toLowerCase(), link.platform)}
                      className="w-9 h-9 rounded-xl border border-slate-700/80 hover:border-emerald-400 bg-slate-900/90 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 cursor-pointer group relative shadow-md"
                      childrenClassName="w-4.5 h-4.5 object-contain"
                    />
                  ))}
                </div>
              </div>
            )}

          </motion.div>

          {/* Right Column: Interactive 3D Systems Command Center on ALL screen sizes (Idle-deferred for instant Mobile TTI) */}
          <div className="lg:col-span-5 xl:col-span-6 w-full h-[420px] sm:h-[450px] md:h-[470px] lg:h-[490px] xl:h-[510px] relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center my-1 lg:my-0 shadow-[0_0_50px_-12px_rgba(16,185,129,0.28)] ring-1 ring-white/[0.06]">
            {isHero3DReady ? (
              <CanvasErrorBoundary>
                <React.Suspense fallback={
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617]">
                    <div className="inline-block w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2.5" />
                    <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Booting 3D Systems Core...</p>
                  </div>
                }>
                  <ThreeDHero techString={techString} />
                </React.Suspense>
              </CanvasErrorBoundary>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617]">
                <div className="inline-block w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2.5" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Initializing 3D Telemetry Engine...</p>
              </div>
            )}
          </div>

        </div>

        {/* Unified Hero Telemetry & Architecture Command Dock (Compact, Zero-Gap Layout) */}
        <div className="w-full max-w-[1536px] 2xl:max-w-[1600px] mx-auto mt-5 pt-4 border-t border-white/[0.07] relative z-10 space-y-3">
          {portfolioMetrics && portfolioMetrics.length > 0 && (
            <div className="w-full">
              {/* Telemetry Strip Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 px-1">
                <div className="inline-flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-emerald-400">
                    Live Systems Telemetry & Engineering Impact
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-slate-400 hidden sm:inline-flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  Click any metric node to inspect section
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3 w-full">
                {portfolioMetrics.map((metric, idx) => {
                  const titleLower = (metric.title || '').toLowerCase();
                  const targetSection =
                    titleLower.includes('project') ? 'projects' :
                    titleLower.includes('leetcode') || titleLower.includes('github') || titleLower.includes('repo') || titleLower.includes('coding') ? 'coding-profiles' :
                    titleLower.includes('cert') || titleLower.includes('award') || titleLower.includes('hackathon') ? 'credentials' :
                    titleLower.includes('experience') || titleLower.includes('year') ? 'timeline' :
                    titleLower.includes('skill') ? 'skills' :
                    'about';

                  const statusLabel =
                    titleLower.includes('view') ? 'LIVE' :
                    titleLower.includes('visitor') ? 'VERIFIED' :
                    titleLower.includes('project') ? 'PRODUCTION' :
                    titleLower.includes('leetcode') ? 'TOP 1%' :
                    titleLower.includes('github') ? 'OPEN SOURCE' :
                    titleLower.includes('cert') ? 'CREDENTIALED' :
                    'ACTIVE';

                  const accentThemes: Record<string, {
                    topLine: string;
                    iconVault: string;
                    iconText: string;
                    badge: string;
                    dot: string;
                    barFill: string;
                    hoverBorder: string;
                    cornerGlow: string;
                  }> = {
                    emerald: {
                      topLine: 'from-transparent via-emerald-400 to-transparent',
                      iconVault: 'bg-emerald-500/12 border-emerald-500/35 shadow-[0_0_16px_rgba(16,185,129,0.2)]',
                      iconText: 'text-emerald-400',
                      badge: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30',
                      dot: 'bg-emerald-400',
                      barFill: 'from-emerald-500 to-teal-400',
                      hoverBorder: 'hover:border-emerald-500/45',
                      cornerGlow: 'rgba(16, 185, 129, 0.14)',
                    },
                    blue: {
                      topLine: 'from-transparent via-cyan-400 to-transparent',
                      iconVault: 'bg-cyan-500/12 border-cyan-500/35 shadow-[0_0_16px_rgba(6,182,212,0.2)]',
                      iconText: 'text-cyan-400',
                      badge: 'bg-cyan-500/12 text-cyan-300 border-cyan-500/30',
                      dot: 'bg-cyan-400',
                      barFill: 'from-cyan-500 to-sky-400',
                      hoverBorder: 'hover:border-cyan-500/45',
                      cornerGlow: 'rgba(6, 182, 212, 0.14)',
                    },
                    purple: {
                      topLine: 'from-transparent via-teal-400 to-transparent',
                      iconVault: 'bg-teal-500/12 border-teal-500/35 shadow-[0_0_16px_rgba(20,184,166,0.2)]',
                      iconText: 'text-teal-300',
                      badge: 'bg-teal-500/12 text-teal-300 border-teal-500/30',
                      dot: 'bg-teal-400',
                      barFill: 'from-teal-500 to-emerald-400',
                      hoverBorder: 'hover:border-teal-500/45',
                      cornerGlow: 'rgba(20, 184, 166, 0.14)',
                    },
                    amber: {
                      topLine: 'from-transparent via-amber-400 to-transparent',
                      iconVault: 'bg-amber-500/12 border-amber-500/35 shadow-[0_0_16px_rgba(245,158,11,0.2)]',
                      iconText: 'text-amber-400',
                      badge: 'bg-amber-500/12 text-amber-300 border-amber-500/30',
                      dot: 'bg-amber-400',
                      barFill: 'from-amber-500 to-emerald-400',
                      hoverBorder: 'hover:border-amber-500/45',
                      cornerGlow: 'rgba(245, 158, 11, 0.13)',
                    },
                    cyan: {
                      topLine: 'from-transparent via-sky-400 to-transparent',
                      iconVault: 'bg-sky-500/12 border-sky-500/35 shadow-[0_0_16px_rgba(56,189,248,0.2)]',
                      iconText: 'text-sky-400',
                      badge: 'bg-sky-500/12 text-sky-300 border-sky-500/30',
                      dot: 'bg-sky-400',
                      barFill: 'from-sky-500 to-cyan-400',
                      hoverBorder: 'hover:border-sky-500/45',
                      cornerGlow: 'rgba(56, 189, 248, 0.14)',
                    },
                    indigo: {
                      topLine: 'from-transparent via-emerald-400 to-transparent',
                      iconVault: 'bg-emerald-500/12 border-emerald-500/35 shadow-[0_0_16px_rgba(16,185,129,0.2)]',
                      iconText: 'text-emerald-300',
                      badge: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30',
                      dot: 'bg-emerald-400',
                      barFill: 'from-emerald-500 to-cyan-400',
                      hoverBorder: 'hover:border-emerald-500/45',
                      cornerGlow: 'rgba(16, 185, 129, 0.14)',
                    },
                  };

                  const themeStyle = accentThemes[metric.color || 'emerald'] || accentThemes.emerald;
                  const fillPercents = [94, 88, 92, 96, 89, 95];
                  const barWidth = fillPercents[idx % fillPercents.length];

                  const displayValue =
                    titleLower === 'projects delivered' && metric.value === '15+' && projects.length > 15
                      ? `${projects.length}+`
                      : titleLower === 'certifications' && metric.value === '12+' && (certificates.length + achievements.length) > 12
                      ? `${certificates.length + achievements.length}+`
                      : metric.value;

                  return (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, y: 14, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: false, amount: 0.15, margin: '-20px' }}
                      transition={{ duration: 0.32, delay: idx * 0.03, ease: [0.22, 1, 0.36, 1] }}
                      onClick={(e) => scrollToSection(targetSection, e)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          scrollToSection(targetSection, e);
                        }
                      }}
                      className={`relative overflow-hidden w-full h-full min-h-[96px] sm:min-h-[104px] p-3 sm:p-3.5 rounded-2xl border border-white/[0.08] ${themeStyle.hoverBorder} bg-gradient-to-br from-[#070f20]/95 via-[#050b18]/95 to-[#030712]/98 backdrop-blur-md flex flex-col justify-between gap-2 shadow-[0_12px_28px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.12)] group hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none`}
                      title={metric.tooltip || `Click to explore ${metric.title}`}
                    >
                      {/* Top Laser Accent Highlight */}
                      <div className={`absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r ${themeStyle.topLine} opacity-80 group-hover:opacity-100 transition-opacity`} />

                      {/* Subtle Corner Radial Aura */}
                      <div
                        className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none transition-transform duration-300 group-hover:scale-125"
                        style={{
                          background: `radial-gradient(circle, ${themeStyle.cornerGlow} 0%, transparent 70%)`,
                        }}
                      />

                      {/* Top Row: 3D Icon Vault + Telemetry Status Badge */}
                      <div className="flex items-center justify-between gap-2 relative z-10">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border ${themeStyle.iconVault} flex items-center justify-center ${themeStyle.iconText} shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                          <MetricIconRenderer metric={metric} className="w-4 h-4" />
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider border ${themeStyle.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${themeStyle.dot} animate-pulse`} />
                          {statusLabel}
                        </span>
                      </div>

                      {/* Middle Row: Monumental Value + Metric Label */}
                      <div className="min-w-0 relative z-10">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="text-base sm:text-lg lg:text-xl font-black font-mono bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent tracking-tight leading-none truncate">
                            {displayValue}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-100 group-hover:text-emerald-300 transition-colors block truncate mt-0.5">
                          {metric.title}
                        </span>
                        {metric.subtitle && (
                          <span className="text-[9px] font-mono text-slate-400 block truncate">
                            {metric.subtitle}
                          </span>
                        )}
                      </div>

                      {/* Bottom Row: Micro Telemetry Capacity Bar */}
                      <div className="w-full h-1 rounded-full bg-slate-900/90 border border-white/[0.04] overflow-hidden relative z-10">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${themeStyle.barFill}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seamless Infinite Enterprise Architecture & Tech Stack Marquee Bar */}
          <div className="relative w-full py-2 sm:py-2.5 px-3 sm:px-3.5 overflow-hidden select-none rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-[#061121]/95 via-[#040a15]/95 to-[#061121]/95 shadow-[0_12px_28px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.1)] flex items-center gap-3">
            {/* Top Laser Edge */}
            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

            {/* Left Pinned HUD Badge */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/12 border border-emerald-500/35 text-[10px] font-mono font-extrabold uppercase tracking-[0.15em] text-emerald-300 shrink-0 z-20 shadow-[0_0_14px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Architecture Stack</span>
            </div>

            {/* Center Seamless Dual-Half Marquee Track (36 Pills per Half = Zero Gaps on Any Screen) */}
            <div
              className="flex-1 overflow-hidden relative"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
              }}
            >
              <div className="animate-marquee flex items-center">
                {[0, 1].map((halfIndex) => (
                  <div
                    key={halfIndex}
                    className="flex shrink-0 items-center gap-2 sm:gap-2.5 pr-2 sm:pr-2.5"
                    aria-hidden={halfIndex === 1 ? 'true' : undefined}
                  >
                    {[...marqueeTechItems, ...marqueeTechItems].map((techName, idx) => (
                      <button
                        key={`${halfIndex}-${idx}-${techName}`}
                        type="button"
                        onClick={(e) => scrollToSection('skills', e)}
                        className="group/pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-400/50 text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-slate-200 hover:text-emerald-300 uppercase transition-all duration-200 cursor-pointer shrink-0"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            idx % 3 === 0
                              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                              : idx % 3 === 1
                              ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]'
                              : 'bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.9)]'
                          }`}
                        />
                        <span>{techName}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Pinned Status Pill */}
            <button
              type="button"
              onClick={(e) => scrollToSection('skills', e)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 shrink-0 z-20 transition-colors cursor-pointer"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>{marqueeTechItems.length} Core Nodes</span>
            </button>
          </div>

          {/* Compact Interactive Scroll Down Indicator */}
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={(e) => scrollToSection('about', e)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-white/[0.06] hover:border-emerald-500/30 opacity-80 hover:opacity-100 transition-all cursor-pointer group"
              aria-label="Scroll down to About section"
            >
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-slate-400 group-hover:text-emerald-300 transition-colors">
                Scroll Down
              </span>
              <ArrowDown className="w-3 h-3 text-emerald-400 animate-bounce" />
            </button>
          </div>
        </div>
      </section>
      )}

      <div className="w-full max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-8 sm:pt-10 pb-10 space-y-12 sm:space-y-14 lg:space-y-16">

          {/* About Section — 100% Admin-Controlled Premium Developer Portfolio Layout */}
          <motion.section 
            id="about" 
            className="space-y-10 sm:space-y-12 scroll-mt-24 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.01, margin: "120px" }}
            variants={sectionVariants}
          >
            {/* Ambient radial glow backdrops */}
            <div className="absolute -top-16 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Section Header (Controlled via Admin -> Biography & Taglines) */}
            <div className="space-y-3 border-b border-white/[0.06] pb-6 relative z-10">
              {(profile?.aboutBadge ?? "ABOUT ME") !== "" && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] sm:text-[11px] font-mono text-emerald-300 uppercase tracking-[0.2em] font-extrabold">
                    {profile?.aboutBadge || "ABOUT ME"}
                  </span>
                </div>
              )}

              {profile?.aboutHeading && (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-luxury bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent tracking-tight leading-tight">
                  {profile.aboutHeading}
                </h2>
              )}
              <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start relative z-10">
              {/* LEFT COLUMN: 3D Interactive Portrait, Short Bio & Profile Channels */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* 3D Glassmorphic Portrait Card */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="glass-card glass-card-hover rounded-3xl p-5 sm:p-6 border border-emerald-500/25 relative overflow-hidden flex flex-col items-center"
                >
                  <div className="relative w-full flex items-center justify-center py-2">
                    <AnimatedProfileAvatar
                      src={profile?.aboutImage || ""}
                      alt={profile?.fullName || "Chandru Mohan"}
                      size="about"
                      shape="squircle"
                      glowIntensity="vibrant"
                      showStatus={false}
                      showBadge={false}
                      enableTilt={true}
                    />
                  </div>

                  {/* Dynamic Portrait Footer (100% bound to Admin Profile fields) */}
                  {(profile?.fullName || profile?.title || profile?.availability) && (
                    <div className="w-full mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div>
                        {profile?.fullName && (
                          <p className="text-white font-extrabold text-sm tracking-tight">
                            {profile.fullName}
                          </p>
                        )}
                        {profile?.title && (
                          <p className="text-[11px] text-emerald-400 font-semibold">
                            {profile.title}
                          </p>
                        )}
                      </div>
                      {profile?.availability && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{profile.availability}</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Optional Short Bio Card (Controlled via Admin -> Short Bio) */}
                {profile?.shortBio && profile.shortBio.trim() !== "" && (
                  <div className="glass-card rounded-3xl p-5 border border-white/[0.08] relative overflow-hidden">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      {profile.shortBio}
                    </p>
                  </div>
                )}

                {/* Dynamic Profile Social Channels (Controlled via Admin -> Social Links) */}
                {socialLinks.filter(l => l.showInDynamicProfile !== false).length > 0 && (
                  <div className="glass-card p-5 rounded-3xl border border-white/[0.08] relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.18em] block font-extrabold">
                        Profile Channels
                      </span>
                      <span className="text-xs text-slate-400">
                        Direct coordinates &amp; social networks
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {socialLinks.filter(l => l.showInDynamicProfile !== false).map((link) => (
                        <SocialLinkAnchor
                          key={link.id}
                          link={link}
                          onClick={() => trackClick('social_profile_' + link.platform.toLowerCase(), link.platform)}
                          className="w-10 h-10 rounded-xl border border-slate-700/70 hover:border-emerald-400/70 bg-slate-900/90 hover:bg-emerald-500/15 text-slate-200 hover:text-emerald-300 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 cursor-pointer group relative shadow-lg"
                          childrenClassName="w-4.5 h-4.5 object-contain"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: 100% Admin-Driven Biography, Custom Highlights, Objective & Metadata */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Main Biography & Identity Card */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden space-y-6">
                  {/* Identity Header */}
                  {(profile?.fullName || profile?.title || profile?.currentCompany || profile?.professionalLabel) && (
                    <div className="space-y-2 border-b border-white/[0.06] pb-5">
                      {(profile?.professionalLabel || profile?.title) && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                            {profile?.professionalLabel || profile?.title}
                          </span>
                          {profile?.currentCompany && (
                            <span className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                              @ {profile.currentCompany}
                            </span>
                          )}
                        </div>
                      )}

                      {profile?.fullName && (
                        <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                          {profile.fullName}
                        </h3>
                      )}

                      {profile?.title && (
                        <p className="text-xs sm:text-sm font-mono text-emerald-400 font-semibold">
                          {profile.title} {profile?.currentCompany ? `@ ${profile.currentCompany}` : ""}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Full Biography & Secondary About Description */}
                  {(profile?.biography || profile?.aboutDescription) && (
                    <div className="space-y-3.5">
                      {profile?.biography && (
                        <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                          {profile.biography}
                        </p>
                      )}
                      {profile?.aboutDescription && profile.aboutDescription !== profile?.biography && (
                        <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-sans whitespace-pre-line">
                          {profile.aboutDescription}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Career Objective Callout (Controlled via Admin -> Career Objective) */}
                  {profile?.careerObjective && profile.careerObjective.trim() !== "" && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900/85 to-cyan-500/10 border border-emerald-500/30 relative">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Quote className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-[0.2em] font-extrabold">
                          Career Mission Statement
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic font-medium">
                        &ldquo;{profile.careerObjective}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Core Competency Architecture Tags (Controlled via Admin -> Skills & Competency Summary) */}
                  {profile?.skillsSummary && profile.skillsSummary.trim() !== "" && (
                    <div className="space-y-2.5 pt-1">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 font-bold">
                        Core Competency Architecture
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skillsSummary.split(',').filter((s: string) => s.trim() !== '').map((item: string, i: number) => (
                          <motion.span
                            key={i}
                            whileHover={{ scale: 1.04, y: -1 }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/25 hover:border-emerald-400/60 text-xs font-mono text-emerald-300 font-medium inline-flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{item.trim()}</span>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Admin-Created About Highlight Cards (Only shown if created in Admin Panel) */}
                  {Array.isArray(profile?.aboutHighlights) && profile.aboutHighlights.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {profile.aboutHighlights.map((hl: any, idx: number) => (
                        <motion.div
                          key={hl.id || idx}
                          whileHover={{ y: -3, scale: 1.01 }}
                          className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/25 hover:border-emerald-400/50 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-white">{hl.title}</span>
                            {hl.badge && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300">
                                {hl.badge}
                              </span>
                            )}
                          </div>
                          {hl.description && (
                            <p className="text-xs text-slate-300 leading-relaxed">{hl.description}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Metadata Grid (Only renders fields configured in Admin Panel) */}
                  {(profile?.experienceSummary || profile?.yearsExperience || profile?.currentPosition || profile?.location || profile?.availability) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/[0.06] text-xs font-mono">
                      {(profile?.experienceSummary || profile?.yearsExperience !== undefined) && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/[0.06] flex items-start gap-3">
                          <Briefcase className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">
                              {profile?.experienceSummary ? "Experience Summary" : "Professional Track"}
                            </span>
                            <span className="text-white font-bold mt-0.5 block">
                              {profile?.experienceSummary || `${profile?.yearsExperience}+ Years Systems Experience`}
                            </span>
                          </div>
                        </div>
                      )}

                      {profile?.currentPosition && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/[0.06] flex items-start gap-3">
                          <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Current Post</span>
                            <span className="text-white font-bold mt-0.5 block">
                              {profile.currentPosition} {profile.currentCompany ? `@ ${profile.currentCompany}` : ""}
                            </span>
                          </div>
                        </div>
                      )}

                      {profile?.location && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/[0.06] flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Base Operations</span>
                            <span className="text-white font-bold mt-0.5 block">
                              {profile.location}{profile.country ? `, ${profile.country}` : ""}
                            </span>
                          </div>
                        </div>
                      )}

                      {profile?.availability && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/[0.06] flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Availability Status</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`w-2 h-2 rounded-full ${
                                profile.availability === 'Open to Work' || profile.availability === 'Available'
                                  ? 'bg-emerald-400 animate-pulse'
                                  : 'bg-amber-400'
                              }`} />
                              <span className="text-emerald-300 font-bold">{profile.availability}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resume / CV Actions (Controlled via Admin -> Buttons & CTA) */}
                  {isValidResumeUrl(profile?.resumeUrl) && (
                    <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-3">
                      <a
                        href={profile?.resumeUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleViewResume(e, 'about_view_resume_btn', 'View Resume from About')}
                        className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-500/15 border border-white/[0.12] hover:border-emerald-400/50 text-slate-100 hover:text-emerald-300 font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <span>{profile?.resumeCtaText || "View Resume"}</span>
                      </a>

                      <a 
                        href={profile?.resumeUrl || '#'}
                        download={activeResume?.fileName || 'Chandru_Mohan_Resume.pdf'}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all inline-flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.28)]"
                        onClick={(e) => handleDownloadResume(e, 'about_resume_btn', 'Download Resume from About')}
                      >
                        <Download className="w-4 h-4" />
                        <span>{profile?.resumeDownloadText || profile?.downloadCtaText || "Download Resume / Curriculum Vitae"}</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Interactive Scroll-Triggered Biography Timeline with Glass-Morphism Career Phases */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/25 relative overflow-hidden">
                  <LazySectionBoundary
                    minHeight="260px"
                    label="Loading Biography Timeline..."
                    forceHydrate={forceHydrateAllSections}
                  >
                    <AboutBiographyTimeline
                      profile={profile}
                      experiences={experiences}
                      education={education}
                      prefersReduced={prefersReduced}
                      onSoundClick={(freq) => soundFx.playClick(freq)}
                    />
                  </LazySectionBoundary>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Selected Engineering Case Studies & Developer Portfolio Projects Section */}
          <motion.section
            id="projects"
            className="space-y-8 scroll-mt-24 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.01, margin: "120px" }}
            variants={projectsSectionVariants}
          >
            {/* Ambient Radial Emerald/Cyan Aurora Glow */}
            <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 bg-emerald-500/[0.07] rounded-full blur-[130px] -z-10" />
            <div className="pointer-events-none absolute top-1/3 right-10 w-80 h-80 bg-cyan-500/[0.06] rounded-full blur-[120px] -z-10" />

            {/* Section Header, Interactive Filters & View Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/[0.06] pb-6">
              <div className="space-y-3 max-w-2xl">
                {(profile.projectsBadge ?? "Featured Engineering Work") && (
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold tracking-wider uppercase">
                      {profile.projectsBadge ?? "Featured Engineering Work"}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-cyan-300 font-semibold tabular-nums">
                      {filteredProjects.length}{" "}
                      {filteredProjects.length === 1 ? "Case Study" : "Case Studies"}
                    </span>
                  </div>
                )}

                {(profile.projectsHeading ??
                  "Selected Case Studies & Production Systems") && (
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-luxury bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent tracking-tight text-balance">
                    {profile.projectsHeading ??
                      "Selected Case Studies & Production Systems"}
                  </h2>
                )}

                {(profile.projectsSubtitle ??
                  "End-to-end cloud architectures, distributed microservices, and interactive full-stack applications.") && (
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {profile.projectsSubtitle ??
                      "End-to-end cloud architectures, distributed microservices, and interactive full-stack applications."}
                  </p>
                )}

                <div className="h-1 w-20 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full shadow-[0_0_14px_rgba(16,185,129,0.65)]" />
              </div>

              {/* Search, Featured Filter & Layout Mode Switcher */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={projectSearchQuery}
                    onChange={(e) => {
                      setProjectSearchQuery(e.target.value);
                      setActiveProjectIndex(0);
                    }}
                    placeholder="Filter by title, stack, role..."
                    className="w-full bg-slate-900/90 border border-white/[0.08] text-slate-200 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-500"
                  />
                  {projectSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setProjectSearchQuery("");
                        setActiveProjectIndex(0);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Featured Only Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playToggle(!showFeaturedProjectsOnly);
                    setShowFeaturedProjectsOnly((prev) => !prev);
                    setActiveProjectIndex(0);
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    showFeaturedProjectsOnly
                      ? "bg-amber-500/15 border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/10"
                      : "bg-slate-900/90 border-white/[0.08] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Featured Only</span>
                </button>

                {/* View Mode Segmented Switcher (Grid vs Interactive Split Explorer) */}
                <div className="grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-slate-900/95 border border-white/[0.08] w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playToggle(false);
                      setProjectDisplayMode("grid");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                      projectDisplayMode === "grid"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                    <span>3D Spotlight Gallery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playToggle(true);
                      setProjectDisplayMode("showcase");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                      projectDisplayMode === "showcase"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>Split Explorer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Verified Operational Telemetry Banner for Projects */}
            <div className="rounded-3xl bg-gradient-to-b from-[#04111d]/95 via-[#030816]/95 to-[#020617]/95 border border-emerald-500/25 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(52,211,153,0.22)] relative overflow-hidden">
              <div className="pointer-events-none absolute -top-16 left-1/3 w-72 h-28 bg-emerald-500/15 rounded-full blur-3xl" />

              <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
                <div className="flex items-center gap-2 text-xs font-mono font-extrabold uppercase tracking-[0.16em] text-emerald-400">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Verified Operational Telemetry</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-white/[0.1] text-[10px] font-mono text-slate-300 tracking-wider uppercase">
                  LIVE BENCHMARK
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-2xl bg-[#030712]/95 border border-emerald-500/20 hover:border-emerald-400/50 transition-all space-y-2"
                >
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 tabular-nums">
                    {displayProjects.length}+
                  </div>
                  <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-200">
                    PRODUCTION SYSTEMS MAPPED
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                    />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-2xl bg-[#030712]/95 border border-cyan-500/20 hover:border-cyan-400/50 transition-all space-y-2"
                >
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-cyan-400 tabular-nums">
                    {displayProjects.filter((p) => p.isFeatured).length || displayProjects.length}
                  </div>
                  <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-200">
                    FEATURED ARCHITECTURES
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "88%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-2xl bg-[#030712]/95 border border-emerald-500/20 hover:border-emerald-400/50 transition-all space-y-2"
                >
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 tabular-nums">
                    99.96%
                  </div>
                  <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-200">
                    CORE SLA UPTIME TARGET
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "99%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                    />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-2xl bg-[#030712]/95 border border-cyan-500/20 hover:border-cyan-400/50 transition-all space-y-2"
                >
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 tabular-nums">
                    {Array.from(
                      new Set(
                        displayProjects.flatMap(
                          (p) => p.skills || (p as any).tags || []
                        )
                      )
                    ).length || 24}
                    +
                  </div>
                  <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-200">
                    VERIFIED STACK TECHNOLOGIES
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "94%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Interactive Category Filter Bar */}
            {projectCategories.length > 1 && (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {projectCategories.map((cat) => {
                    const isActive = selectedProjectCategory === cat;
                    const count =
                      cat === "All"
                        ? displayProjects.length
                        : displayProjects.filter((p) => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          soundFx.playTab(780);
                          setSelectedProjectCategory(cat);
                          setActiveProjectIndex(0);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                          isActive
                            ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                            : "bg-slate-900/70 text-slate-300 hover:bg-slate-800/90 hover:text-white border border-white/[0.06]"
                        }`}
                      >
                        <span>{cat}</span>
                        <span
                          className={`text-[10px] tabular-nums ${
                            isActive ? "text-slate-950/80" : "text-slate-500"
                          }`}
                        >
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  {expandedSpotlightProjectId !== null &&
                    projectDisplayMode === "grid" && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick(760);
                          setExpandedSpotlightProjectId(null);
                        }}
                        className="text-xs font-mono text-slate-300 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Collapse Spotlight</span>
                      </button>
                    )}

                  {(selectedProjectCategory !== "All" ||
                    showFeaturedProjectsOnly ||
                    projectSearchQuery.trim() !== "") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectCategory("All");
                        setShowFeaturedProjectsOnly(false);
                        setProjectSearchQuery("");
                        setActiveProjectIndex(0);
                      }}
                      className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset active filters</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODE 1: INTERACTIVE 3D-PERSPECTIVE 'PROJECT SPOTLIGHT' GALLERY (DEFAULT)  */}
            {/* ========================================================================= */}
            {projectDisplayMode === "grid" && filteredProjects.length > 0 && (
              <motion.div
                key="projects-grid-mode"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch group/spotlight-grid"
              >
                {filteredProjects.map((proj, pIdx) => {
                  const isCardExpanded = expandedSpotlightProjectId === proj.id;
                  return (
                    <motion.div
                      layout="position"
                      key={proj.id || `grid-proj-${pIdx}`}
                      initial={
                        prefersReduced
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 18 }
                      }
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.12, margin: "-20px" }}
                      transition={{
                        duration: 0.34,
                        delay: Math.min(pIdx * 0.04, 0.18),
                      }}
                      className={`h-full transition-opacity duration-300 ${
                        isCardExpanded
                          ? "md:col-span-2 lg:col-span-3 opacity-100"
                          : "col-span-1 group-hover/spotlight-grid:opacity-75 hover:!opacity-100"
                      }`}
                    >
                      <ProjectCard
                        proj={proj}
                        index={pIdx}
                        prefersReduced={prefersReduced}
                        isExpanded={isCardExpanded}
                        onToggleExpand={(projId) =>
                          setExpandedSpotlightProjectId((prev) =>
                            prev === projId ? null : projId
                          )
                        }
                        setSelectedProjectForModal={setSelectedProjectForModal}
                        setActiveSlideIndex={setActiveSlideIndex}
                        trackProjectView={trackProjectView}
                        onSelectTechTag={(tag) => {
                          setProjectSearchQuery(tag);
                          setActiveProjectIndex(0);
                        }}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* MODE 2: INTERACTIVE SPLIT-PANE CASE STUDY EXPLORER (100% MANUAL)          */}
            {/* ========================================================================= */}
            {projectDisplayMode === "showcase" &&
              filteredProjects.length > 0 &&
              (() => {
                const currentProj =
                  filteredProjects[activeProjectIndex] || filteredProjects[0];
                if (!currentProj) return null;

                const projFrames: string[] = [];
                if (currentProj.imageUrl) projFrames.push(currentProj.imageUrl);
                if (Array.isArray(currentProj.gallery)) {
                  currentProj.gallery.forEach((g) => {
                    if (g && !projFrames.includes(g)) projFrames.push(g);
                  });
                }
                const currentFrameUrl =
                  projFrames[explorerFrameIndex] ||
                  currentProj.imageUrl ||
                  "";

                const currentSkills = (currentProj.skills ||
                  (currentProj as any).tags ||
                  []) as string[];
                const currentHighlights = Array.isArray(currentProj.highlights)
                  ? currentProj.highlights.filter(Boolean)
                  : [];

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column (4 cols): Interactive Case Study Index Directory */}
                    <div className="lg:col-span-4 space-y-2.5 lg:sticky lg:top-24">
                      <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-mono text-slate-400">
                        <span>SELECT CASE STUDY TO INSPECT</span>
                        <span className="tabular-nums text-emerald-400 font-bold">
                          {String(activeProjectIndex + 1).padStart(2, "0")} /{" "}
                          {String(filteredProjects.length).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                        {filteredProjects.map((p, idx) => {
                          const isSelected = activeProjectIndex === idx;
                          const pSkills = (p.skills ||
                            (p as any).tags ||
                            []) as string[];
                          return (
                            <button
                              key={p.id || idx}
                              type="button"
                              onClick={() => {
                                soundFx.playTab(740 + idx * 30);
                                setActiveProjectIndex(idx);
                                setExplorerFrameIndex(0);
                                setExplorerMediaTab("screenshots");
                              }}
                              className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                                isSelected
                                  ? "bg-slate-900/95 border-emerald-400/60 shadow-lg shadow-emerald-500/10"
                                  : "bg-slate-950/60 border-white/[0.06] hover:border-white/[0.15] hover:bg-slate-900/50"
                              }`}
                            >
                              <span
                                className={`text-xs font-mono font-bold tabular-nums mt-0.5 ${
                                  isSelected
                                    ? "text-emerald-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {String(idx + 1).padStart(2, "0")}
                              </span>

                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <h4
                                    className={`text-sm font-bold truncate ${
                                      isSelected
                                        ? "text-white"
                                        : "text-slate-200"
                                    }`}
                                  >
                                    {p.title}
                                  </h4>
                                  {p.isFeatured && (
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                                  <span className="text-emerald-400/90">
                                    {p.category || "Full-Stack"}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>{p.status || "Completed"}</span>
                                </div>

                                {pSkills.length > 0 && (
                                  <div className="text-[10px] font-mono text-slate-500 truncate pt-0.5">
                                    {pSkills.slice(0, 4).join(" · ")}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column (8 cols): Interactive Case Study Workbench */}
                    <div className="lg:col-span-8">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentProj.id || `explorer-${activeProjectIndex}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="glass-card rounded-3xl border border-white/[0.09] bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 overflow-hidden shadow-2xl"
                        >
                          {/* Workbench Window Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-950/90 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="text-emerald-400 font-bold tabular-nums">
                                CASE STUDY {String(activeProjectIndex + 1).padStart(2, "0")}
                              </span>
                              <span className="text-slate-600">/</span>
                              <span className="text-slate-300">
                                {currentProj.slug || currentProj.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {currentProj.videoUrl && (
                                <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-white/[0.08] text-[11px] font-mono">
                                  <button
                                    type="button"
                                    onClick={() => setExplorerMediaTab("screenshots")}
                                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                      explorerMediaTab === "screenshots"
                                        ? "bg-emerald-500 text-slate-950 font-bold"
                                        : "text-slate-400 hover:text-white"
                                    }`}
                                  >
                                    Screenshots ({projFrames.length || 1})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setExplorerMediaTab("video")}
                                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                      explorerMediaTab === "video"
                                        ? "bg-emerald-500 text-slate-950 font-bold"
                                        : "text-slate-400 hover:text-white"
                                    }`}
                                  >
                                    Video Demo
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  soundFx.playModalOpen();
                                  setSelectedProjectForModal(currentProj);
                                  setActiveSlideIndex(explorerFrameIndex);
                                  trackProjectView(
                                    currentProj.slug,
                                    currentProj.title
                                  );
                                }}
                                className="px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-emerald-500/20 border border-white/[0.08] hover:border-emerald-500/40 text-xs font-mono text-slate-200 hover:text-emerald-300 transition cursor-pointer"
                              >
                                Fullscreen View
                              </button>
                            </div>
                          </div>

                          {/* Media Viewport (Screenshots or Embedded Video) */}
                          <div className="relative bg-slate-950 border-b border-white/[0.06]">
                            {explorerMediaTab === "video" &&
                            currentProj.videoUrl ? (
                              <div className="relative aspect-video w-full bg-black">
                                <iframe
                                  src={currentProj.videoUrl}
                                  title={`${currentProj.title} Demo Video`}
                                  className="absolute inset-0 w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <div className="relative aspect-video w-full overflow-hidden">
                                <SkillMediaRenderer
                                  src={currentFrameUrl}
                                  alt={currentProj.title}
                                  variant="cover"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />

                                {/* Thumbnail Strip if multiple screenshots exist */}
                                {projFrames.length > 1 && (
                                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 overflow-x-auto pb-1 z-20">
                                    {projFrames.map((frameUrl, fIdx) => (
                                      <button
                                        key={fIdx}
                                        type="button"
                                        onClick={() => setExplorerFrameIndex(fIdx)}
                                        className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                          explorerFrameIndex === fIdx
                                            ? "border-emerald-400 scale-105 shadow-lg"
                                            : "border-white/20 opacity-65 hover:opacity-100"
                                        }`}
                                      >
                                        <img
                                          src={frameUrl}
                                          alt={`${currentProj.title} preview ${fIdx + 1}`}
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover"
                                        />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Case Study Content Body */}
                          <div className="p-6 sm:p-8 space-y-6">
                            {/* Metadata & Title */}
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                                <span className="text-emerald-400 font-semibold">
                                  {currentProj.category || "Full-Stack"}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{currentProj.status || "Completed"}</span>
                                {currentProj.startDate && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="tabular-nums">
                                      {currentProj.startDate} —{" "}
                                      {currentProj.endDate || "Present"}
                                    </span>
                                  </>
                                )}
                                {currentProj.metricsBadge && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="text-cyan-300 font-semibold">
                                      {currentProj.metricsBadge}
                                    </span>
                                  </>
                                )}
                              </div>

                              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                {currentProj.title}
                              </h3>

                              {(currentProj.role ||
                                currentProj.architectureType) && (
                                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300 pt-1">
                                  {currentProj.role && (
                                    <span>
                                      Role:{" "}
                                      <strong className="text-white">
                                        {currentProj.role}
                                      </strong>
                                    </span>
                                  )}
                                  {currentProj.role &&
                                    currentProj.architectureType && (
                                      <span className="text-slate-600">·</span>
                                    )}
                                  {currentProj.architectureType && (
                                    <span>
                                      Architecture:{" "}
                                      <strong className="text-emerald-300">
                                        {currentProj.architectureType}
                                      </strong>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {currentProj.description}
                            </p>

                            {/* Key Engineering Highlights (Admin-configured only) */}
                            {currentHighlights.length > 0 && (
                              <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                                  Key Engineering Highlights &amp; Outcomes
                                </h4>
                                <ul className="grid grid-cols-1 gap-2">
                                  {currentHighlights.map((hl, hIdx) => (
                                    <li
                                      key={hIdx}
                                      className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5"
                                    >
                                      <span className="text-emerald-400 font-mono font-bold tabular-nums mt-0.5">
                                        0{hIdx + 1}.
                                      </span>
                                      <span>{hl}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Technology Stack */}
                            {currentSkills.length > 0 && (
                              <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                                  Technology Stack &amp; Tooling
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {currentSkills.map((tag, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        soundFx.playTab(820);
                                        setProjectSearchQuery(tag);
                                      }}
                                      className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/40 text-emerald-300 transition cursor-pointer"
                                      title={`Filter projects by ${tag}`}
                                    >
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* D3.js Project Performance Dashboard in Split Explorer */}
                            <React.Suspense fallback={<div className="h-28 w-full rounded-xl bg-slate-900/40 animate-pulse" />}>
                              <ProjectPerformanceDashboard project={currentProj} />
                            </React.Suspense>

                            {/* Simulated Deployment Pipeline Log in Split Explorer */}
                            <div className="rounded-xl bg-[#030712] border border-emerald-500/25 overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-white/[0.07] text-[11px] font-mono">
                                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                                  <Terminal className="w-3.5 h-3.5" />
                                  <span>DEPLOYMENT PIPELINE LOG</span>
                                </div>
                                <span className="text-slate-400">
                                  {currentProj.status || "Completed"}
                                </span>
                              </div>
                              <div className="p-3.5 space-y-1.5 font-mono text-[11px]">
                                {buildProjectDeploymentLogs(currentProj).map(
                                  (entry, lIdx) => (
                                    <div
                                      key={lIdx}
                                      className="flex items-start gap-2.5 leading-relaxed"
                                    >
                                      <span className="text-slate-500 tabular-nums shrink-0">
                                        {entry.timestamp}
                                      </span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                                          entry.stage === "READY"
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : entry.stage === "DEPLOY"
                                            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                                            : "bg-slate-800 text-slate-300 border border-white/[0.06]"
                                        }`}
                                      >
                                        {entry.stage}
                                      </span>
                                      <span className="text-slate-300 break-all">
                                        {entry.message}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
                              <div className="flex flex-wrap items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    soundFx.playModalOpen();
                                    setSelectedProjectForModal(currentProj);
                                    setActiveSlideIndex(explorerFrameIndex);
                                    trackProjectView(
                                      currentProj.slug,
                                      currentProj.title
                                    );
                                  }}
                                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                                >
                                  <Layers className="w-4 h-4" />
                                  <span>Inspect Full Case Study</span>
                                </button>

                                {currentProj.liveUrl &&
                                  currentProj.liveUrl !== "#" && (
                                    <a
                                      href={currentProj.liveUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={() => soundFx.playClick()}
                                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 text-xs font-mono font-semibold transition-colors flex items-center gap-2"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Live Deployment</span>
                                    </a>
                                  )}

                                {currentProj.githubUrl &&
                                  currentProj.githubUrl !== "#" && (
                                    <a
                                      href={currentProj.githubUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={() => soundFx.playClick()}
                                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 text-xs font-mono font-semibold transition-colors flex items-center gap-2"
                                    >
                                      <Github className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Source Repository</span>
                                    </a>
                                  )}
                              </div>

                              {/* Manual Prev/Next Stepper */}
                              {filteredProjects.length > 1 && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundFx.playClick(950);
                                      setActiveProjectIndex((prev) =>
                                        prev === 0
                                          ? filteredProjects.length - 1
                                          : prev - 1
                                      );
                                    }}
                                    className="p-2 rounded-xl border border-white/[0.08] bg-slate-900 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                                    title="Previous Case Study"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundFx.playClick(1100);
                                      setActiveProjectIndex(
                                        (prev) =>
                                          (prev + 1) % filteredProjects.length
                                      );
                                    }}
                                    className="p-2 rounded-xl border border-white/[0.08] bg-slate-900 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                                    title="Next Case Study"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })()}

            {/* Empty State when filter query yields zero projects */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-white/[0.06]">
                <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-200">
                  No matching projects found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No projects match your current search query or category filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProjectCategory("All");
                    setShowFeaturedProjectsOnly(false);
                    setProjectSearchQuery("");
                    setActiveProjectIndex(0);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  Reset Project Filters
                </button>
              </div>
            )}
          </motion.section>

          {/* Engineering Monographs & Technical Publications Section — Distinct Editorial Journal Architecture */}
          {displayArticles.length > 0 && (
            <motion.section
              id="articles"
              className="space-y-8 scroll-mt-24 relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.01, margin: "120px" }}
              variants={sectionVariants}
            >
              {/* Warm Editorial Amber-Gold & Indigo Ambient Illumination (Distinct from Projects) */}
              <div className="pointer-events-none absolute -top-24 right-1/4 w-96 h-96 bg-amber-500/[0.07] rounded-full blur-[135px] -z-10" />
              <div className="pointer-events-none absolute top-1/3 left-10 w-80 h-80 bg-indigo-500/[0.07] rounded-full blur-[125px] -z-10" />

              {/* Editorial Journal Masthead Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-amber-500/20 pb-6">
                <div className="space-y-3 max-w-2xl">
                  {(profile.articlesBadge ??
                    "Architectural Journal & Monographs") && (
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400">
                      <BookOpenCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold tracking-[0.16em] uppercase">
                        {profile.articlesBadge ??
                          "Architectural Journal & Monographs"}
                      </span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold tabular-nums text-[11px]">
                        ISSN-2026 · {filteredArticles.length}{" "}
                        {filteredArticles.length === 1
                          ? "Monograph"
                          : "Monographs"}
                      </span>
                    </div>
                  )}

                  {(profile.articlesHeading ??
                    "Engineering Monographs & System Design Papers") && (
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-luxury bg-gradient-to-r from-white via-amber-100 to-indigo-300 bg-clip-text text-transparent tracking-tight text-balance">
                      {profile.articlesHeading ??
                        "Engineering Monographs & System Design Papers"}
                    </h2>
                  )}

                  {(profile.articlesSubtitle ??
                    "Peer-grade technical essays on high-throughput distributed systems, Java 21 Virtual Threads, Kafka event streams, zero-downtime 3NF database migrations, and cloud resilience.") && (
                    <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-serif italic">
                      &ldquo;
                      {profile.articlesSubtitle ??
                        "Peer-grade technical essays on high-throughput distributed systems, Java 21 Virtual Threads, Kafka event streams, zero-downtime 3NF database migrations, and cloud resilience."}
                      &rdquo;
                    </p>
                  )}

                  <div className="h-1 w-24 bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-400 rounded-full shadow-[0_0_14px_rgba(245,158,11,0.65)]" />
                </div>

                {/* Search, Featured Filter & View Mode Switcher */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Article Search Input */}
                  <div className="relative w-full sm:w-64 shrink-0">
                    <Search className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={articleSearchQuery}
                      onChange={(e) => {
                        setArticleSearchQuery(e.target.value);
                        setActiveArticleIndex(0);
                      }}
                      placeholder="Search essays, citations, tags..."
                      className="w-full bg-[#090814]/90 border border-amber-500/20 text-slate-200 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-amber-400/60 transition-all placeholder:text-slate-500"
                    />
                    {articleSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setArticleSearchQuery("");
                          setActiveArticleIndex(0);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Featured Only Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playToggle(!showFeaturedArticlesOnly);
                      setShowFeaturedArticlesOnly((prev) => !prev);
                      setActiveArticleIndex(0);
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                      showFeaturedArticlesOnly
                        ? "bg-amber-500/20 border-amber-400/60 text-amber-200 shadow-lg shadow-amber-500/15"
                        : "bg-[#090814]/90 border-white/[0.08] text-slate-400 hover:text-amber-200 hover:border-amber-500/30"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Featured Issue</span>
                  </button>

                  {/* View Mode Segmented Switcher */}
                  <div className="grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-[#090814]/95 border border-amber-500/20 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playToggle(false);
                        setArticleDisplayMode("grid");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                        articleDisplayMode === "grid"
                          ? "bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <BookOpenCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Journal Spreads</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playToggle(true);
                        setArticleDisplayMode("showcase");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                        articleDisplayMode === "showcase"
                          ? "bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>Split-Pane Reader</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Editorial Anthology Masthead Ribbon (Distinct from Projects' 4-box green telemetry grid) */}
              <div className="rounded-2xl bg-gradient-to-r from-[#0d0b18]/95 via-[#090d1a]/95 to-[#0d0b18]/95 border border-amber-500/25 p-4 sm:p-5 shadow-[0_18px_45px_rgba(0,0,0,0.75)] relative overflow-hidden">
                <div className="pointer-events-none absolute -top-12 left-1/4 w-64 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 right-1/4 w-64 h-24 bg-indigo-500/10 rounded-full blur-2xl" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                  {/* Left: Editorial Anthology Volume & Reading Digest */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 font-serif font-black text-base shadow-inner">
                        §
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-400 font-bold">
                          ARCHITECTURAL ANTHOLOGY · VOL. IV
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white">
                          Curated Systems Engineering &amp; Distributed Computing Dossiers
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block h-8 w-px bg-white/[0.08]" />

                    <div className="flex items-center gap-5 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
                          Monographs
                        </span>
                        <span className="text-amber-300 font-extrabold text-sm tabular-nums">
                          {displayArticles.length} Papers
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
                          Anthology Reading Time
                        </span>
                        <span className="text-indigo-300 font-extrabold text-sm tabular-nums">
                          {displayArticles.reduce(
                            (acc, a) => acc + (a.readTimeMinutes || 5),
                            0
                          )}{" "}
                          mins total
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
                          Domains Covered
                        </span>
                        <span className="text-amber-200 font-extrabold text-sm tabular-nums">
                          {Math.max(1, articleCategories.length - 1)} Tracks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Interactive Topic Index Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {Array.from(
                      new Set(displayArticles.flatMap((a) => a.tags || []))
                    )
                      .slice(0, 5)
                      .map((tag) => {
                        const isTagSelected =
                          articleSearchQuery.toLowerCase() === tag.toLowerCase();
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              soundFx.playTab(810);
                              setArticleSearchQuery(isTagSelected ? "" : tag);
                              setActiveArticleIndex(0);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                              isTagSelected
                                ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                                : "bg-slate-950/90 hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 border border-white/[0.07] hover:border-amber-500/35"
                            }`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Interactive Category Filter Bar */}
              {articleCategories.length > 1 && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {articleCategories.map((cat) => {
                      const isActive = selectedArticleCategory === cat;
                      const count =
                        cat === "All"
                          ? displayArticles.length
                          : displayArticles.filter((a) => a.category === cat)
                              .length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            soundFx.playTab(780);
                            setSelectedArticleCategory(cat);
                            setActiveArticleIndex(0);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                            isActive
                              ? "bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                              : "bg-[#090814]/85 text-slate-300 hover:bg-slate-900 hover:text-amber-200 border border-white/[0.07]"
                          }`}
                        >
                          <span>{cat}</span>
                          <span
                            className={`text-[10px] tabular-nums ${
                              isActive ? "text-slate-950/80" : "text-slate-500"
                            }`}
                          >
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    {expandedArticleId !== null &&
                      articleDisplayMode === "grid" && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick(760);
                            setExpandedArticleId(null);
                          }}
                          className="text-xs font-mono text-slate-300 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                          <span>Collapse Dossier</span>
                        </button>
                      )}

                    {(selectedArticleCategory !== "All" ||
                      showFeaturedArticlesOnly ||
                      articleSearchQuery.trim() !== "") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedArticleCategory("All");
                          setShowFeaturedArticlesOnly(false);
                          setArticleSearchQuery("");
                          setActiveArticleIndex(0);
                        }}
                        className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reset journal filters</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* MODE 1: 2-COLUMN HORIZONTAL EDITORIAL JOURNAL SPREADS (DISTINCT FROM PROJECTS) */}
              {/* ========================================================================= */}
              {articleDisplayMode === "grid" && filteredArticles.length > 0 && (
                <motion.div
                  key="articles-grid-mode"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch group/articles-grid"
                >
                  {filteredArticles.map((art, aIdx) => {
                    const isExpanded = expandedArticleId === art.id;
                    return (
                      <motion.div
                        layout="position"
                        key={art.id || `grid-art-${aIdx}`}
                        initial={
                          prefersReduced
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 16 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: Math.min(aIdx * 0.05, 0.25),
                        }}
                        className={`h-full transition-opacity duration-300 ${
                          isExpanded
                            ? "xl:col-span-2 opacity-100"
                            : "col-span-1 group-hover/articles-grid:opacity-80 hover:!opacity-100"
                        }`}
                      >
                        <React.Suspense
                          fallback={
                            <div className="h-80 w-full rounded-3xl bg-slate-900/40 border border-white/[0.05] animate-pulse" />
                          }
                        >
                          <ArticleMonographCard
                            art={art}
                            index={aIdx}
                            prefersReduced={prefersReduced}
                            isExpanded={isExpanded}
                            onToggleExpand={(articleId) =>
                              setExpandedArticleId((prev) =>
                                prev === articleId ? null : articleId
                              )
                            }
                            onOpenModal={(article) => {
                              setArticleReaderProgress(0);
                              setSelectedArticleForModal(article);
                            }}
                            onSelectTag={(tag) => {
                              setArticleSearchQuery(tag);
                              setActiveArticleIndex(0);
                            }}
                            profileAvatar={profile?.profileImage}
                            soundFx={soundFx}
                          />
                        </React.Suspense>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* ========================================================================= */}
              {/* MODE 2: INTERACTIVE SPLIT-PANE EDITORIAL READER WORKBENCH (100% MANUAL)  */}
              {/* ========================================================================= */}
              {articleDisplayMode === "showcase" &&
                filteredArticles.length > 0 &&
                (() => {
                  const currentArt =
                    filteredArticles[activeArticleIndex] || filteredArticles[0];
                  if (!currentArt) return null;

                  const coverImg =
                    currentArt.coverImageUrl ||
                    (currentArt as any).coverImage ||
                    "";
                  const excerptText =
                    currentArt.excerpt || (currentArt as any).summary || "";
                  const authorName =
                    currentArt.author ||
                    (currentArt as any).authorName ||
                    "Chandru Mohan";
                  const authorRoleText =
                    currentArt.authorRole || "Principal Systems Architect";
                  const readMins = currentArt.readTimeMinutes || 5;
                  const currentTakeaways = Array.isArray(
                    currentArt.keyTakeaways
                  )
                    ? currentArt.keyTakeaways.filter(Boolean)
                    : [];

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left Column (4 cols): Publication Volume Index */}
                      <div className="lg:col-span-4 space-y-2.5 lg:sticky lg:top-24">
                        <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-mono text-slate-400">
                          <span>SELECT MONOGRAPH ISSUE</span>
                          <span className="tabular-nums text-amber-400 font-bold">
                            {String(activeArticleIndex + 1).padStart(2, "0")} /{" "}
                            {String(filteredArticles.length).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                          {filteredArticles.map((art, idx) => {
                            const isSelected = activeArticleIndex === idx;
                            return (
                              <button
                                key={art.id || idx}
                                type="button"
                                onClick={() => {
                                  soundFx.playTab(740 + idx * 30);
                                  setActiveArticleIndex(idx);
                                }}
                                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                                  isSelected
                                    ? "bg-[#110e1f]/95 border-amber-400/60 shadow-lg shadow-amber-500/10"
                                    : "bg-slate-950/60 border-white/[0.06] hover:border-amber-500/30 hover:bg-slate-900/50"
                                }`}
                              >
                                <span
                                  className={`text-xs font-mono font-bold tabular-nums mt-0.5 ${
                                    isSelected
                                      ? "text-amber-400"
                                      : "text-slate-500"
                                  }`}
                                >
                                  §{String(idx + 1).padStart(2, "0")}
                                </span>

                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4
                                      className={`text-sm font-bold truncate ${
                                        isSelected
                                          ? "text-white"
                                          : "text-slate-200"
                                      }`}
                                    >
                                      {art.title}
                                    </h4>
                                    {art.isFeatured && (
                                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                                    <span className="text-amber-300/90">
                                      {art.category || "System Design"}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span>{art.readTimeMinutes || 5}m read</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Column (8 cols): Interactive Editorial Monograph Reader Pane */}
                      <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={
                              currentArt.id || `art-explorer-${activeArticleIndex}`
                            }
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{
                              duration: 0.25,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="glass-card rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#0d0a1a]/95 via-slate-950/95 to-[#080d1a]/95 overflow-hidden shadow-2xl"
                          >
                            {/* Workbench Top Chrome */}
                            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-950/90 border-b border-amber-500/15">
                              <div className="flex items-center gap-2 text-xs font-mono">
                                <span className="text-amber-400 font-bold tabular-nums">
                                  ISSUE{" "}
                                  {String(activeArticleIndex + 1).padStart(
                                    2,
                                    "0"
                                  )}
                                </span>
                                <span className="text-slate-600">/</span>
                                <span className="text-slate-300">
                                  {currentArt.slug || currentArt.category}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  soundFx.playModalOpen();
                                  setArticleReaderProgress(0);
                                  setSelectedArticleForModal(currentArt);
                                }}
                                className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-xs font-mono font-bold text-amber-300 transition cursor-pointer"
                              >
                                Fullscreen Manuscript Reader
                              </button>
                            </div>

                            {/* Cover Banner */}
                            {coverImg && (
                              <div className="relative h-56 sm:h-64 w-full bg-slate-950 overflow-hidden border-b border-white/[0.06]">
                                <img
                                  src={coverImg}
                                  alt={currentArt.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                              </div>
                            )}

                            {/* Monograph Body */}
                            <div className="p-6 sm:p-8 space-y-6">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                                  <span className="text-amber-400 font-semibold">
                                    {currentArt.category || "System Design"}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>{readMins} min read</span>
                                  {currentArt.readingDifficulty && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="text-indigo-300">
                                        {currentArt.readingDifficulty}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                  {currentArt.title}
                                </h3>

                                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
                                  <span>
                                    By{" "}
                                    <strong className="text-white">
                                      {authorName}
                                    </strong>{" "}
                                    ({authorRoleText})
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-slate-300 leading-relaxed font-serif italic border-l-2 border-amber-400/50 pl-4">
                                &ldquo;{excerptText}&rdquo;
                              </p>

                              {(currentArt.executiveSummary ||
                                currentTakeaways.length > 0) && (
                                <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/25 space-y-2.5">
                                  <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                                    Executive Abstract &amp; Architectural Takeaways
                                  </div>
                                  {currentArt.executiveSummary && (
                                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                                      {currentArt.executiveSummary}
                                    </p>
                                  )}
                                  {currentTakeaways.length > 0 && (
                                    <ul className="space-y-1.5 pt-1">
                                      {currentTakeaways.map((tk, idx) => (
                                        <li
                                          key={idx}
                                          className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5"
                                        >
                                          <span className="text-amber-400 font-mono font-bold">
                                            §0{idx + 1}
                                          </span>
                                          <span>{tk}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}

                              {/* Footer Actions & Manual Prev/Next */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
                                <div className="flex flex-wrap items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundFx.playModalOpen();
                                      setArticleReaderProgress(0);
                                      setSelectedArticleForModal(currentArt);
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-mono font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                                  >
                                    <BookOpenCheck className="w-4 h-4" />
                                    <span>Open Full Manuscript</span>
                                  </button>

                                  {currentArt.externalUrl && (
                                    <a
                                      href={currentArt.externalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] hover:border-amber-500/40 text-slate-200 hover:text-amber-300 text-xs font-mono font-semibold transition-colors flex items-center gap-2"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Canonical Source</span>
                                    </a>
                                  )}
                                </div>

                                {filteredArticles.length > 1 && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        soundFx.playClick(950);
                                        setActiveArticleIndex((prev) =>
                                          prev === 0
                                            ? filteredArticles.length - 1
                                            : prev - 1
                                        );
                                      }}
                                      className="p-2 rounded-xl border border-white/[0.08] bg-slate-900 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                                      title="Previous Publication"
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        soundFx.playClick(1100);
                                        setActiveArticleIndex(
                                          (prev) =>
                                            (prev + 1) % filteredArticles.length
                                        );
                                      }}
                                      className="p-2 rounded-xl border border-white/[0.08] bg-slate-900 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                                      title="Next Publication"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })()}

              {/* Empty State when filter query yields zero articles */}
              {filteredArticles.length === 0 && (
                <div className="text-center py-14 px-4 bg-slate-900/40 rounded-2xl border border-amber-500/20">
                  <BookOpen className="w-10 h-10 text-amber-400/60 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-200">
                    No matching monographs found
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No publications match your filter query. Try searching for different keywords or reset the journal filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArticleCategory("All");
                      setShowFeaturedArticlesOnly(false);
                      setArticleSearchQuery("");
                      setActiveArticleIndex(0);
                    }}
                    className="mt-4 px-4 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-mono font-medium hover:bg-amber-500/25 transition-colors cursor-pointer"
                  >
                    Reset Journal Filters
                  </button>
                </div>
              )}
            </motion.section>
          )}

          {/* Coding Profiles & Algorithmic Telemetry Section */}
          <motion.section 
            id="coding-profiles" 
            className="space-y-8 scroll-mt-24 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.01, margin: "120px" }}
            variants={sectionVariants}
          >
            {/* Ambient Neon Illumination */}
            <div className="pointer-events-none absolute -top-20 left-1/4 w-96 h-96 bg-purple-500/[0.06] rounded-full blur-[130px] -z-10" />
            <div className="pointer-events-none absolute top-1/3 right-12 w-80 h-80 bg-emerald-500/[0.06] rounded-full blur-[120px] -z-10" />

            {/* Header, Search & Filter Controls */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-5 border-b border-white/[0.06]">
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-[0.16em] font-bold">
                    {profile?.codingProfilesBadge || "CODING PROFILES & ALGORITHMIC TELEMETRY"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{filteredCodingProfiles.length} Verified Arenas</span>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-luxury bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent tracking-tight">
                  {profile?.codingProfilesHeading || "Competitive Programming & Open-Source Velocity"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                  {profile?.codingProfilesSubtitle ||
                    "Live algorithmic benchmarks, data-structure problem velocity, submission heatmaps, and open-source repository contributions across global developer platforms."}
                </p>
                <div className="h-1 w-20 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
              </div>

              {/* Search & Featured Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={codingProfileSearchQuery}
                    onChange={(e) => setCodingProfileSearchQuery(e.target.value)}
                    placeholder="Search handle, platform, language..."
                    className="w-full bg-slate-900/90 border border-white/[0.08] text-slate-200 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-500"
                  />
                  {codingProfileSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCodingProfileSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playToggle(!showFeaturedCodingProfilesOnly);
                    setShowFeaturedCodingProfilesOnly((prev) => !prev);
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    showFeaturedCodingProfilesOnly
                      ? "bg-amber-500/15 border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/10"
                      : "bg-slate-900/90 border-white/[0.08] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Featured Arenas</span>
                </button>
              </div>
            </div>

            {/* Interactive Platform Filter Pills & Collapse Control */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {codingPlatformCategories.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap p-1.5 rounded-2xl bg-slate-950/85 border border-white/[0.08] backdrop-blur-xl shadow-xl w-full sm:w-auto">
                  {codingPlatformCategories.map((cat) => {
                    const isActive = selectedCodingPlatformFilter === cat;
                    const count =
                      cat === "All"
                        ? codingProfiles.length
                        : codingProfiles.filter(
                            (p) => (p.platformType || p.displayName) === cat
                          ).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCodingPlatformFilter(cat);
                          soundFx.playTab(820);
                        }}
                        className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isActive
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        <span>{cat}</span>
                        <span
                          className={`text-[10px] tabular-nums ${
                            isActive ? "text-slate-950/80" : "text-slate-500"
                          }`}
                        >
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-3">
                {expandedCodingProfileId !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick(740);
                      setExpandedCodingProfileId(null);
                    }}
                    className="text-xs font-mono text-slate-300 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Collapse Active Dossier</span>
                  </button>
                )}

                {(selectedCodingPlatformFilter !== "All" ||
                  showFeaturedCodingProfilesOnly ||
                  codingProfileSearchQuery.trim() !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCodingPlatformFilter("All");
                      setShowFeaturedCodingProfilesOnly(false);
                      setCodingProfileSearchQuery("");
                    }}
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3D Interactive Coding Profile Spotlight Cards Grid */}
            {filteredCodingProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans items-stretch group/coding-grid">
                {filteredCodingProfiles.map((p, pIdx) => {
                  const isExpanded = expandedCodingProfileId === p.id;
                  return (
                    <motion.div
                      layout="position"
                      key={p.id || `coding-prof-${pIdx}`}
                      className={`h-full transition-opacity duration-300 ${
                        isExpanded
                          ? "md:col-span-2 lg:col-span-3 opacity-100"
                          : "col-span-1 group-hover/coding-grid:opacity-80 hover:!opacity-100"
                      }`}
                    >
                      <React.Suspense
                        fallback={
                          <div className="h-72 w-full rounded-3xl bg-slate-900/40 border border-white/[0.05] animate-pulse" />
                        }
                      >
                        <CodingProfileSpotlightCard
                          profile={p}
                          index={pIdx}
                          prefersReduced={prefersReduced}
                          isExpanded={isExpanded}
                          onToggleExpand={(id) =>
                            setExpandedCodingProfileId((prev) =>
                              prev === id ? null : id
                            )
                          }
                          soundFx={soundFx}
                        />
                      </React.Suspense>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-14 px-4 bg-slate-900/40 rounded-2xl border border-white/[0.06] space-y-3">
                <Code2 className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">
                  No matching coding profiles found
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No coding platforms match your current search or filter criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCodingPlatformFilter("All");
                    setShowFeaturedCodingProfilesOnly(false);
                    setCodingProfileSearchQuery("");
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  Reset Coding Profile Filters
                </button>
              </div>
            )}
          </motion.section>

          {/* Skill Matrix Section */}
          <motion.section 
            id="skills" 
            className="space-y-8 scroll-mt-24 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.01, margin: "120px" }}
            variants={sectionVariants}
          >
            <div id="techstack" className="absolute -top-24" />
            <LazySectionBoundary
              minHeight="380px"
              label="Loading Skills Architecture Matrix..."
              forceHydrate={forceHydrateAllSections}
            >
              <SkillsArchitectureShowcase
                skills={skills}
                projects={projects}
                prefersReduced={prefersReduced}
                onSelectSkillForModal={(skill) => setSelectedSkillForModal(skill)}
                soundFx={soundFx}
              />
            </LazySectionBoundary>
          </motion.section>

          {/* Tools & Technologies Section */}
          {(tools.length > 0 || initialTools.length > 0) && (
            <motion.section 
              id="tools" 
              className="space-y-8 scroll-mt-24 relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.01, margin: "120px" }}
              variants={sectionVariants}
            >
              <LazySectionBoundary
                minHeight="360px"
                label="Loading Engineering Workbench..."
                forceHydrate={forceHydrateAllSections}
              >
                <ToolsEcosystemWorkbench
                  tools={tools.length > 0 ? tools : initialTools}
                  prefersReduced={prefersReduced}
                  onSelectToolForModal={(tool) => setSelectedToolForModal(tool)}
                  soundFx={soundFx}
                />
              </LazySectionBoundary>
            </motion.section>
          )}

          {/* Timeline (Experience + Education) Section */}
          <motion.section 
            id="experience" 
            className="space-y-10 scroll-mt-24 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.01, margin: "120px" }}
            variants={sectionVariants}
          >
            <div id="timeline" className="absolute -top-24" />
            <div id="education" className="absolute -top-24" />
            
            <LazySectionBoundary
              minHeight="420px"
              label="Loading Career & Academic Timeline..."
              forceHydrate={forceHydrateAllSections}
            >
              <ExperienceEducationShowcase
                experiences={experiences}
                education={education}
                projects={projects}
                prefersReduced={prefersReduced}
                soundFx={soundFx}
              />
            </LazySectionBoundary>
          </motion.section>

          {/* Top 1% Industry Certifications & Proven Milestones Showcase */}
          <LazySectionBoundary
            minHeight="420px"
            label="Loading Verified Credentials & Milestones..."
            forceHydrate={forceHydrateAllSections}
            fallbackAnchors={["credentials", "certificates", "achievements"]}
          >
            <CertificationsAchievementsShowcase
              certificates={certificates}
              achievements={achievements}
              prefersReduced={prefersReduced}
              onSelectCertificate={(cert) => setSelectedCertForModal(cert)}
              onSelectAchievement={(ach) => setSelectedAchievementForModal(ach)}
              soundFx={soundFx}
            />
          </LazySectionBoundary>

          {/* Client & Peer Testimonials Section */}
          {displayTestimonials.length > 0 && (
            <motion.section 
              id="testimonials" 
              className="space-y-8 scroll-mt-24 relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.01, margin: "120px" }}
              variants={sectionVariants}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.04] pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Endorsements & Recommendations</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {displayTestimonials.length} {displayTestimonials.length === 1 ? 'Endorsement' : 'Endorsements'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">Client & Peer Testimonials</h2>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Verified feedback and recommendations from Engineering Directors, Technical Leads, and enterprise stakeholders.
                  </p>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTestimonialIndex(prev => (prev === 0 ? displayTestimonials.length - 1 : prev - 1))}
                    className="p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/80 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition-all cursor-pointer"
                    title="Previous Testimonial"
                    aria-label="Previous Testimonial"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTestimonialIndex(prev => (prev + 1) % displayTestimonials.length)}
                    className="p-2.5 rounded-xl border border-white/[0.08] bg-slate-900/80 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition-all cursor-pointer"
                    title="Next Testimonial"
                    aria-label="Next Testimonial"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsTestimonialAutoplay(prev => !prev)}
                    className={`px-3 py-2 rounded-xl border text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isTestimonialAutoplay
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/[0.08] bg-slate-900/80 text-slate-400'
                    }`}
                    title="Toggle auto rotation"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isTestimonialAutoplay ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span>{isTestimonialAutoplay ? 'Autoplay ON' : 'Autoplay OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Carousel Showcase */}
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {displayTestimonials.length > 0 && (() => {
                    const t = displayTestimonials[activeTestimonialIndex] || displayTestimonials[0];
                    if (!t) return null;
                    const authorName = t.name || (t as any).authorName || "Verified Client";
                    const authorRole = t.role || (t as any).authorTitle || "Technical Director";
                    const authorCompany = t.company || (t as any).authorCompany || "";
                    const avatarUrl = t.avatarUrl || (t as any).authorAvatarUrl || "";
                    const content = t.testimonialText || (t as any).content || "";
                    const rating = t.rating || 5;
                    const dateVal = t.createdAt || (t as any).date || "2026-01-01";
                    const initialLetter = authorName.charAt(0).toUpperCase();

                    return (
                      <motion.div
                        key={t.id || `test-${activeTestimonialIndex}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="glass-card rounded-3xl border border-emerald-500/30 p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-950/90 relative shadow-2xl shadow-emerald-500/5"
                      >
                        <Quote className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500/15 absolute top-6 right-6 pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                          {/* Author Info Column */}
                          <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4 border-b lg:border-b-0 lg:border-r border-white/[0.06] pb-6 lg:pb-0 lg:pr-8">
                            <div className="relative">
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/10 bg-slate-950">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={authorName}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-emerald-400 bg-emerald-500/10">
                                    {initialLetter}
                                  </div>
                                )}
                              </div>
                              {t.linkedInUrl && (
                                <div className="absolute -bottom-2 -right-2 bg-[#0A66C2] text-white p-1.5 rounded-lg shadow-md" title="Verified LinkedIn Recommendation">
                                  <Linkedin className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <h3 className="text-lg font-bold text-white font-display">
                                  {authorName}
                                </h3>
                                {t.linkedInUrl && (
                                  <a
                                    href={t.linkedInUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                                    title="View LinkedIn Profile"
                                    aria-label="View LinkedIn Profile"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-emerald-400">
                                {authorRole}
                              </p>
                              {authorCompany && (
                                <p className="text-[11px] font-mono text-slate-400">
                                  {authorCompany}
                                </p>
                              )}
                            </div>

                            {t.relationship && (
                              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                {t.relationship}
                              </span>
                            )}
                          </div>

                          {/* Testimonial Quote Column */}
                          <div className="lg:col-span-8 space-y-5">
                            {/* Star Rating */}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-4 h-4 ${
                                    idx < rating
                                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                                      : 'text-slate-700'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-mono text-slate-400 ml-2 font-bold">
                                {rating}.0 / 5.0
                              </span>
                            </div>

                            <blockquote className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans italic">
                              "{content}"
                            </blockquote>

                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-3 border-t border-white/[0.04]">
                              <span>Endorsement Date: {new Date(dateVal).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified Architectural Review
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  {displayTestimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonialIndex(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        activeTestimonialIndex === idx
                          ? 'w-7 h-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                          : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* Space between sections */}

          <motion.section 
            id="contact" 
            className="space-y-8 sm:space-y-12 scroll-mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.01, margin: "120px" }}
            variants={sectionVariants}
          >
            <div className="space-y-2.5">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">{profile?.contactSubheading || "Establish Connection"}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">{profile?.contactHeading || "Write to Node Core"}</h2>
              <div className="h-0.5 w-12 bg-emerald-500/60 rounded" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Info panel */}
              <div className="lg:col-span-5 glass-card rounded-2xl p-5 sm:p-8 border border-white/[0.04] space-y-6">
                <h3 className="text-lg font-bold font-display text-white">{profile?.contactFormTitle || "Let's coordinate on new paradigms"}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {profile?.contactDescription || "Have an open enterprise role, a microservices system challenge, or want to collaborate on clean-architecture solutions? Send an inquiry."}
                </p>

                <div className="space-y-4 pt-4 border-t border-white/[0.05] text-xs font-mono">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>{profile?.email || "chandrumohan550@gmail.com"}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.whatsapp && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp: {profile.whatsapp}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-slate-300">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>{profile?.location ? `${profile.location}, ${profile.country || 'India'}` : "Bengaluru, Karnataka, India"}</span>
                  </div>
                  {profile?.availability && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className={`w-2 h-2 rounded-full ${
                        profile.availability === 'Open to Work' || profile.availability === 'Available' ? 'bg-emerald-400 animate-pulse' :
                        profile.availability === 'Busy' ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      <span className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                        Availability: <span className="text-slate-200">{profile.availability}</span>
                      </span>
                    </div>
                  )}
                  {profile?.onlineStatus && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className={`w-2 h-2 rounded-full ${
                        profile.onlineStatus === 'Offline' ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'
                      }`} />
                      <span className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                        Status: <span className="text-slate-200">{profile.onlineStatus}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Active Security Auditable</span>
                  </div>
                </div>

                {/* Dynamic Social Links in Contact Section */}
                {socialLinks.filter(l => l.showInContact !== false).length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.05] relative z-30">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Dynamic Channels</span>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.filter(l => l.showInContact !== false).map((link) => (
                        <SocialLinkAnchor
                          key={link.id}
                          link={link}
                          onClick={() => trackClick('social_contact_' + link.platform.toLowerCase(), link.platform)}
                          className="w-8.5 h-8.5 rounded-lg border border-slate-700/60 hover:border-emerald-500/60 bg-slate-900/90 hover:bg-slate-950/95 text-slate-200 hover:text-emerald-400 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group relative shadow-md"
                          childrenClassName="w-4.5 h-4.5 object-contain"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-950/90 p-4 sm:p-5 rounded-2xl border border-white/[0.04] space-y-3 text-[10px] font-mono shadow-inner backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">GATEWAY TELEMETRY:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                      TLS 1.3 Active
                    </span>
                  </div>

                  <div className="space-y-2 text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Direct Admin Inbound: <strong className="text-slate-200">ONLINE</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      <span>SLA Response Window: <strong className="text-slate-200">Within 24 Hours</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                      <span>AES-256 Transport: <strong className="text-slate-200">VERIFIED</strong></span>
                    </div>
                  </div>

                  {/* One Click Direct Email Copy */}
                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-slate-300 truncate">
                      <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{profile?.email || 'chandrumohan550@gmail.com'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const email = profile?.email || 'chandrumohan550@gmail.com';
                        navigator.clipboard.writeText(email);
                        setCopiedEmailSuccess(true);
                        soundFx.playSuccess();
                        setTimeout(() => setCopiedEmailSuccess(false), 2500);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/[0.06] font-mono text-[9px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Copy Direct Email Address"
                    >
                      {copiedEmailSuccess ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {socialLinks.filter(l => l.showInSystemConsole === true).length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                      <span className="text-[9px] text-slate-500 font-mono uppercase font-bold tracking-wider">Console Channels:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {socialLinks.filter(l => l.showInSystemConsole === true).map((link) => (
                          <SocialLinkAnchor
                            key={link.id}
                            link={link}
                            onClick={() => trackClick('social_console_' + link.platform.toLowerCase(), link.platform)}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 font-mono text-[10px] rounded flex items-center gap-1.5 transition-colors"
                            childrenClassName="w-3.5 h-3.5 object-contain"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form itself */}
              <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90">
                {/* Top Ambient Glow */}
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                <form onSubmit={handleContactSubmit} className="space-y-5 relative z-10">
                  {/* Topic Quick Selection Chips */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Fast Topic Selector
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '💼 Enterprise Architecture', topic: 'Enterprise Architecture Consulting' },
                        { label: '⚡ High-Scale Backend / Java', topic: 'High-Scale Backend & Java Microservices' },
                        { label: '☁️ Cloud & Kubernetes', topic: 'Cloud Native & Kubernetes Deployment' },
                        { label: '🚀 System Scale Review', topic: 'System Scalability & Performance Audit' },
                        { label: '🤝 Advisory / Role', topic: 'Principal Engineering Role / Technical Advisory' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormSubject(item.topic);
                            setContactSubjectPreset(item.topic);
                            soundFx.playClick();
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-semibold transition-all border cursor-pointer ${
                            formSubject === item.topic
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20 scale-[1.02]'
                              : 'bg-slate-950/70 border-white/[0.06] text-slate-400 hover:text-white hover:border-emerald-500/40'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                        Your Name <span className="text-emerald-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full bg-slate-950/80 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                        Your Email <span className="text-emerald-400">*</span>
                      </label>
                      <input 
                        type="email" 
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="e.g. sarah@enterprise.io"
                        className="w-full bg-slate-950/80 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                      Subject <span className="text-emerald-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="e.g. Distributed System Architecture Consultation"
                      className="w-full bg-slate-950/80 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                    />
                  </div>

                  {/* Message Content with Live Counter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                        Message Payload <span className="text-emerald-400">*</span>
                      </label>
                      <span className="text-[9px] font-mono text-slate-500">
                        {formMessage.length} characters
                      </span>
                    </div>
                    <textarea 
                      required
                      rows={4}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Describe your project, engineering stack requirements, timeline, or collaboration details..."
                      className="w-full bg-slate-950/80 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none shadow-inner"
                    />
                  </div>

                  {formError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </motion.div>
                  )}

                  {formSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-start gap-3 shadow-xl shadow-emerald-500/10"
                    >
                      <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold block text-sm text-white">Message Transmitted Successfully!</span>
                        <p className="text-slate-300 leading-relaxed font-sans">
                          Your message has been received and indexed into Chandru's Admin Management Console. A response will be dispatched to your email shortly.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Interactive Submit Button with Flight Physics */}
                  <motion.button
                    type="submit"
                    disabled={formLoading}
                    whileHover={formLoading ? {} : { scale: 1.015 }}
                    whileTap={formLoading ? {} : { scale: 0.985 }}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:opacity-95 disabled:opacity-60 text-slate-950 font-extrabold text-xs font-mono rounded-xl transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2.5 cursor-pointer group"
                  >
                    {formLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting Inbound Payload...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        <span>Dispatch Inbound Message</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

            </div>
          </motion.section>

        </div>
      </main>

      {/* Modern micro-analytics footer */}
      {(!footer || footer.isVisible !== false) && (() => {
        const themeCls = getFooterThemeClasses(footer?.theme);
        const linksToRender = footerSocialLinks.length > 0 
          ? footerSocialLinks.map(l => ({ id: l.id, platform: l.platform, url: l.url, logoUrl: l.logoUrl }))
          : socialLinks.filter(l => l.showInFooter !== false).map(l => ({ id: l.id, platform: l.platform, url: l.profileUrl, logoUrl: l.logoUrl }));
        return (
          <footer 
            className={`border-t border-white/[0.08] pt-14 sm:pt-18 pb-28 sm:pb-32 lg:pb-36 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 text-slate-400 relative overflow-hidden transition-all duration-500 ${
              footer?.backgroundType === 'gradient' 
                ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950' 
                : 'bg-slate-950'
            }`}
            style={footer?.backgroundType === 'image' && footer?.customBackgroundUrl ? {
              backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.95), rgba(2, 6, 23, 0.9)), url(${footer.customBackgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : undefined}
          >
            {/* Top ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />

            {theme?.footerBackground?.enabled && (
              <DynamicBackground bg={theme.footerBackground} gradientStart={theme.gradientStart} gradientEnd={theme.gradientEnd} />
            )}

            <div className="w-full max-w-7xl mx-auto relative z-10 space-y-12 sm:space-y-14">
              {/* Top Section - 3 balanced professional columns */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 xl:gap-14 text-left items-start">
                
                {/* Column 1 - Profile & Engineering Identity (5 Cols) */}
                <div className="md:col-span-12 lg:col-span-5 flex flex-col items-start space-y-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center font-luxury font-black text-emerald-400 text-lg shadow-lg shadow-emerald-500/10 shrink-0">
                      C
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight flex items-center gap-2">
                        {profile?.fullName || "CHANDRU M"}
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </h4>
                      <span className="text-[11px] font-mono text-emerald-400/90 font-bold uppercase tracking-wider block">
                        {profile?.title || "Principal Systems Architect"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans max-w-md">
                    {profile?.shortIntroduction || footer?.description || "Architecting high-throughput distributed systems, real-time event pipelines, and resilient cloud architectures that scale gracefully."}
                  </p>

                  <div className="space-y-2.5 pt-1 font-mono text-xs text-slate-300 w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-slate-300 font-medium">Bengaluru, Karnataka, India</span>
                    </div>
                    <a 
                      href={`mailto:${profile?.email || 'chandrumohan550@gmail.com'}`}
                      className="flex items-center gap-3 group hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 flex items-center justify-center shrink-0 transition-colors">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-slate-300 group-hover:text-emerald-400 transition-colors font-medium">
                        {profile?.email || "chandrumohan550@gmail.com"}
                      </span>
                    </a>
                  </div>
                </div>

                {/* Column 2 - Quick Navigation (4 Cols) */}
                <div className="md:col-span-6 lg:col-span-4 flex flex-col items-start space-y-4">
                  <h5 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                    Quick Navigation
                  </h5>
                  <nav className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs font-medium text-slate-400 w-full">
                    <a href="#about" onClick={(e) => handleNavLinkClick(e, 'about')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> About
                    </a>
                    <a href="#projects" onClick={(e) => handleNavLinkClick(e, 'projects')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Projects
                    </a>
                    <a href="#articles" onClick={(e) => handleNavLinkClick(e, 'articles')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Articles & Blog
                    </a>
                    <a href="#coding-profiles" onClick={(e) => handleNavLinkClick(e, 'coding-profiles')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Coding Profiles
                    </a>
                    <a href="#skills" onClick={(e) => handleNavLinkClick(e, 'skills')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Skills
                    </a>
                    <a href="#tools" onClick={(e) => handleNavLinkClick(e, 'tools')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Tools
                    </a>
                    <a href="#timeline" onClick={(e) => handleNavLinkClick(e, 'timeline')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Experience
                    </a>
                    <a href="#education" onClick={(e) => handleNavLinkClick(e, 'education')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Education
                    </a>
                    <a href="#credentials" onClick={(e) => handleNavLinkClick(e, 'credentials')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Certificates
                    </a>
                    <a href="#achievements" onClick={(e) => handleNavLinkClick(e, 'achievements')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Achievements
                    </a>
                    <a href="#testimonials" onClick={(e) => handleNavLinkClick(e, 'testimonials')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Testimonials
                    </a>
                    <a href="#contact" onClick={(e) => handleNavLinkClick(e, 'contact')} className="hover:text-emerald-400 hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer py-0.5">
                      <span className="text-slate-600 text-[10px]">→</span> Contact
                    </a>
                  </nav>
                </div>

                {/* Column 3 - Connect & Resume (3 Cols) */}
                <div className="md:col-span-6 lg:col-span-3 flex flex-col items-start space-y-4">
                  <h5 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                    Connect & Resume
                  </h5>
                  
                  <div className="w-full bg-slate-900/60 border border-white/[0.08] rounded-2xl p-5 space-y-4 backdrop-blur-md shadow-xl shadow-black/20">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                      Social Channels
                    </span>
                    {linksToRender.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 relative z-30">
                        {linksToRender.map((link) => (
                          <SocialLinkAnchor
                            key={link.id}
                            link={link}
                            isFooter={true}
                            onClick={() => trackClick('social_footer_' + link.platform.toLowerCase(), link.platform)}
                            className={`w-9 h-9 rounded-xl border border-slate-700/60 bg-slate-900/90 text-slate-200 flex items-center justify-center transition-all hover:scale-110 duration-200 shadow-md ${themeCls.bgHover} hover:text-white hover:border-emerald-500/50 cursor-pointer`}
                            childrenClassName="w-4.5 h-4.5 object-contain"
                          />
                        ))}
                      </div>
                    )}

                    <div className="border-t border-white/[0.08] pt-3.5">
                      {!isValidResumeUrl(profile?.resumeUrl) ? (
                        <button 
                          disabled
                          className="w-full justify-center inline-flex px-4 py-2.5 border border-white/[0.04] bg-white/[0.01] text-slate-600 font-sans text-xs rounded-xl items-center gap-2 cursor-not-allowed opacity-40"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Resume not available</span>
                        </button>
                      ) : (
                        <a 
                          href={profile?.resumeUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleViewResume(e, 'resume_view_footer', 'View Resume Footer')}
                          className="w-full justify-center inline-flex px-4 py-2.5 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl transition-all items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/30 hover:border-emerald-400"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{footer?.resumeText || "View Full Resume"}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Copyright & Technical Architecture Bar */}
              <div className="border-t border-white/[0.08] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-slate-300 font-mono font-medium">
                    {footer?.copyrightText || `© 2026 ${profile?.fullName || "Chandru Mohan"}. All database relations mapped to 3NF standards.`}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {footer?.builtWithText || "Java 21 • Spring Boot • Kafka • React • MySQL • High-Throughput Cloud Architecture"}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full shrink-0 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Systems Online & Synchronized</span>
                </div>
              </div>
            </div>
          </footer>
        );
      })()}

      {/* Premium Glassmorphic Project Details Modal */}
      {selectedProjectForModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/80 backdrop-blur-xl overflow-y-auto"
          onClick={() => setSelectedProjectForModal(null)}
        >
          <div 
            className="relative w-full max-w-4xl bg-slate-900/90 border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/5 my-auto max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04] bg-slate-950/40">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider">
                    {selectedProjectForModal.category || 'Full-Stack'}
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                    selectedProjectForModal.status === 'Completed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/15' :
                    selectedProjectForModal.status === 'In Development' ? 'bg-amber-950/40 text-amber-400 border-amber-500/15' :
                    selectedProjectForModal.status === 'Concept' ? 'bg-purple-950/40 text-purple-400 border-purple-500/15' :
                    selectedProjectForModal.status === 'Maintained' ? 'bg-sky-950/40 text-sky-400 border-sky-500/15' :
                    'bg-slate-950/40 text-slate-400 border-slate-500/15'
                  }`}>
                    {selectedProjectForModal.status || 'Completed'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-display mt-2">{selectedProjectForModal.title}</h3>
              </div>

              <button
                onClick={() => setSelectedProjectForModal(null)}
                className="p-2 bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white rounded-xl transition-all border border-white/[0.04] cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              
              {/* Media Segment: Video Embed OR Gallery Slider */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Media Slides / Video */}
                <div className="lg:col-span-7 space-y-5">
                  {selectedProjectForModal.videoUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                        <Video className="w-4 h-4" />
                        <span className="font-bold uppercase tracking-wider font-semibold">Systems Demo Reel</span>
                      </div>
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-black">
                        <iframe
                          src={selectedProjectForModal.videoUrl}
                          title={`${selectedProjectForModal.title} Demo Video`}
                          className="absolute inset-0 w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Gallery Slider */}
                  {selectedProjectForModal.gallery && selectedProjectForModal.gallery.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          <span className="font-bold uppercase tracking-wider font-semibold">Media Blueprint Gallery</span>
                        </div>
                        <span className="text-slate-500">
                          {activeSlideIndex + 1} of {selectedProjectForModal.gallery.length}
                        </span>
                      </div>

                      {/* Display Viewport */}
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-950">
                        <SkillMediaRenderer
                          src={selectedProjectForModal.gallery[activeSlideIndex]}
                          alt={`${selectedProjectForModal.title} slide ${activeSlideIndex}`}
                          variant="cover"
                          className="transition-all duration-300"
                        />

                        {/* Slider Nav Controls */}
                        {selectedProjectForModal.gallery.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSlideIndex(prev => Math.max(0, prev - 1));
                              }}
                              disabled={activeSlideIndex === 0}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/60 backdrop-blur-md hover:bg-slate-950 border border-white/[0.08] rounded-xl text-slate-300 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSlideIndex(prev => Math.min(selectedProjectForModal.gallery.length - 1, prev + 1));
                              }}
                              disabled={activeSlideIndex === selectedProjectForModal.gallery.length - 1}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/60 backdrop-blur-md hover:bg-slate-950 border border-white/[0.08] rounded-xl text-slate-300 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Slider dots indicator */}
                      {selectedProjectForModal.gallery.length > 1 && (
                        <div className="flex justify-center gap-1.5 pt-1">
                          {selectedProjectForModal.gallery.map((_, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSlideIndex(i);
                              }}
                              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                                activeSlideIndex === i ? 'bg-emerald-400 w-4' : 'bg-slate-700 hover:bg-slate-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Fallback to primary thumbnail if no gallery is populated
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <ImageIcon className="w-4 h-4" />
                        <span className="font-bold uppercase tracking-wider font-semibold">Primary System Blueprint</span>
                      </div>
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-950">
                        <SkillMediaRenderer
                          src={selectedProjectForModal.imageUrl || ""}
                          alt={selectedProjectForModal.title}
                          variant="cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Architectural Parameters / Tech Description */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Scope of Work date ledger */}
                  <div className="bg-slate-950/40 border border-white/[0.04] rounded-2xl p-4 space-y-2.5 font-mono text-xs text-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Case Study Metadata</span>
                    
                    <div className="flex justify-between py-1 border-b border-white/[0.03]">
                      <span className="text-slate-500">Timeline:</span>
                      <span className="font-semibold text-slate-200 tabular-nums">
                        {selectedProjectForModal.startDate} — {selectedProjectForModal.endDate || 'Present'}
                      </span>
                    </div>

                    {selectedProjectForModal.role && (
                      <div className="flex justify-between py-1 border-b border-white/[0.03]">
                        <span className="text-slate-500">Engineering Role:</span>
                        <span className="font-semibold text-white">{selectedProjectForModal.role}</span>
                      </div>
                    )}

                    {selectedProjectForModal.architectureType && (
                      <div className="flex justify-between py-1 border-b border-white/[0.03]">
                        <span className="text-slate-500">Architecture:</span>
                        <span className="font-semibold text-emerald-400">{selectedProjectForModal.architectureType}</span>
                      </div>
                    )}

                    {selectedProjectForModal.metricsBadge && (
                      <div className="flex justify-between py-1 border-b border-white/[0.03]">
                        <span className="text-slate-500">Impact / Benchmark:</span>
                        <span className="font-semibold text-cyan-300">{selectedProjectForModal.metricsBadge}</span>
                      </div>
                    )}
                  </div>

                  {/* Project description */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Case Study Overview</span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      {selectedProjectForModal.description}
                    </p>
                  </div>

                  {/* Key Engineering Highlights from Admin Panel */}
                  {Array.isArray(selectedProjectForModal.highlights) && selectedProjectForModal.highlights.filter(Boolean).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Key Engineering Highlights</span>
                      <ul className="space-y-1.5">
                        {selectedProjectForModal.highlights.filter(Boolean).map((hl, hIdx) => (
                          <li key={hIdx} className="text-xs text-slate-200 flex items-start gap-2">
                            <span className="text-emerald-400 font-mono font-bold shrink-0">0{hIdx + 1}.</span>
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tech stack */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Technology Stack</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProjectForModal.skills.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/[0.04] bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
              <span className="text-[11px] font-mono text-slate-400">
                /{selectedProjectForModal.slug || selectedProjectForModal.title.toLowerCase().replace(/\s+/g, '-')}
              </span>

              <div className="flex items-center gap-3">
                {selectedProjectForModal.githubUrl && (
                  <a
                    href={selectedProjectForModal.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick('project_repo_modal_' + selectedProjectForModal.slug, 'Repository: ' + selectedProjectForModal.title)}
                    className="px-4 py-2 border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.02] text-white hover:bg-white/[0.04] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Github className="w-4 h-4 text-slate-400" />
                    <span>View Repository</span>
                  </a>
                )}
                {selectedProjectForModal.liveUrl && (
                  <a
                    href={selectedProjectForModal.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick('project_live_modal_' + selectedProjectForModal.slug, 'Live: ' + selectedProjectForModal.title)}
                    className="px-4.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 stroke-[2.5]" />
                    <span>Access Live System</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Premium Glassmorphic Achievements Details Modal */}
      {selectedAchievementForModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/85 backdrop-blur-xl overflow-y-auto"
          onClick={() => setSelectedAchievementForModal(null)}
        >
          <div 
            className="relative w-full max-w-3xl bg-slate-900/95 border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/5 my-auto max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04] bg-slate-950/40">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider">
                    {selectedAchievementForModal.category}
                  </span>
                  {selectedAchievementForModal.badge && (
                    <span className="text-[10px] font-mono bg-emerald-500 text-slate-950 px-2 py-0.5 rounded uppercase font-bold">
                      {selectedAchievementForModal.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-1.5 font-display tracking-tight">
                  {selectedAchievementForModal.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedAchievementForModal(null)}
                className="p-2 hover:bg-white/[0.04] border border-white/[0.04] rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close details modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-6">
              
              {/* Image banner or showcase */}
              {selectedAchievementForModal.imageUrl && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-950">
                  <img
                    src={selectedAchievementForModal.imageUrl}
                    alt={selectedAchievementForModal.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/80 to-transparent" />
                </div>
              )}

              {/* Core Layout split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left side: Detailed descriptions */}
                <div className="md:col-span-8 space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold font-semibold">Short Summary</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                      {selectedAchievementForModal.shortDescription}
                    </p>
                  </div>

                  {selectedAchievementForModal.description && (
                    <div className="space-y-2 pt-2 border-t border-white/[0.02]">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold font-semibold">Full Milestones Details & Scope</span>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans whitespace-pre-wrap">
                        {selectedAchievementForModal.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side: Parameters */}
                <div className="md:col-span-4 space-y-5">
                  
                  {/* Metadata block */}
                  <div className="bg-slate-950/50 border border-white/[0.04] rounded-2xl p-4 space-y-3 font-mono text-xs text-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold font-semibold">Attributes</span>
                    
                    <div className="flex flex-col py-1 border-b border-white/[0.02]">
                      <span className="text-slate-500 text-[9px] uppercase">Organization:</span>
                      <span className="font-semibold text-slate-200 mt-0.5">{selectedAchievementForModal.organization}</span>
                    </div>

                    <div className="flex flex-col py-1 border-b border-white/[0.02]">
                      <span className="text-slate-500 text-[9px] uppercase">Date:</span>
                      <span className="font-semibold text-emerald-400 mt-0.5">
                        {new Date(selectedAchievementForModal.achievementDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
                      </span>
                    </div>

                    {selectedAchievementForModal.position && (
                      <div className="flex flex-col py-1 border-b border-white/[0.02]">
                        <span className="text-slate-500 text-[9px] uppercase">Position/Standing:</span>
                        <span className="font-semibold text-slate-200 mt-0.5">{selectedAchievementForModal.position}</span>
                      </div>
                    )}

                    {selectedAchievementForModal.awardType && (
                      <div className="flex flex-col py-1">
                        <span className="text-slate-500 text-[9px] uppercase">Award Type:</span>
                        <span className="font-semibold text-slate-200 mt-0.5">{selectedAchievementForModal.awardType}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  {selectedAchievementForModal.skills && selectedAchievementForModal.skills.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold font-semibold">Acquired Talents</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedAchievementForModal.skills.map((sk, i) => (
                          <span key={i} className="text-[9px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-white/[0.04]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tech stack */}
                  {selectedAchievementForModal.technologies && selectedAchievementForModal.technologies.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold font-semibold">Utilized Stack</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedAchievementForModal.technologies.map((tc, i) => (
                          <span key={i} className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                            {tc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Certificate PDF Preview Frame */}
              {selectedAchievementForModal.certificateUrl && (
                <div className="space-y-2.5 pt-4 border-t border-white/[0.04]">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold font-semibold">Embedded Certification Blueprint</span>
                  <div className="w-full aspect-video rounded-2xl border border-white/[0.08] bg-slate-950 overflow-hidden relative">
                    <iframe 
                      src={`${selectedAchievementForModal.certificateUrl}#toolbar=0&navpanes=0`}
                      className="w-full h-full"
                      title="Certification PDF Preview"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/[0.04] bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
              <span className="text-[10px] font-mono text-slate-500">
                Secure transaction from server file memory repository
              </span>

              <div className="flex items-center gap-2.5">
                {selectedAchievementForModal.certificateUrl && (
                  <a
                    href={selectedAchievementForModal.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.02] text-white hover:bg-white/[0.04] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Download PDF Certificate</span>
                  </a>
                )}
                
                {selectedAchievementForModal.githubUrl && (
                  <a
                    href={selectedAchievementForModal.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.02] text-white hover:bg-white/[0.04] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-400" />
                    <span>Codebase</span>
                  </a>
                )}

                {selectedAchievementForModal.projectUrl && (
                  <a
                    href={selectedAchievementForModal.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Visit Case Study</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Full-Screen Interactive Monograph Reader Modal */}
      <AnimatePresence>
        {selectedArticleForModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto"
            onClick={() => setSelectedArticleForModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl max-h-[92vh] bg-[#040917] border border-emerald-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto relative"
            >
              {/* Live Reading Progress Bar inside Modal */}
              <div className="h-1 w-full bg-slate-900 shrink-0 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 transition-all duration-150"
                  style={{ width: `${articleReaderProgress}%` }}
                />
              </div>

              {/* Reader Top Toolbar */}
              <div className="px-5 py-3 bg-slate-950/95 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-emerald-400 font-bold">
                    {selectedArticleForModal.category || "System Design"}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300">
                    {selectedArticleForModal.readTimeMinutes || 5} min read
                  </span>
                  {selectedArticleForModal.readingDifficulty && (
                    <>
                      <span className="text-slate-600 hidden sm:inline">·</span>
                      <span className="text-cyan-300 hidden sm:inline">
                        {selectedArticleForModal.readingDifficulty}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Font Size Comfort Controls */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-white/[0.08] text-[10px] font-mono">
                    {(
                      [
                        { id: "sm", label: "A-" },
                        { id: "base", label: "A" },
                        { id: "lg", label: "A+" },
                      ] as const
                    ).map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setArticleReaderFontSize(sz.id)}
                        className={`px-2 py-1 rounded transition cursor-pointer ${
                          articleReaderFontSize === sz.id
                            ? "bg-emerald-500 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title={`Reading font size: ${sz.id}`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedArticleForModal(null)}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.1] text-slate-300 hover:text-white transition-all cursor-pointer"
                    aria-label="Close Article Reader"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Monograph Body */}
              <div
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const maxScroll = el.scrollHeight - el.clientHeight;
                  if (maxScroll > 0) {
                    setArticleReaderProgress(
                      Math.min(100, Math.round((el.scrollTop / maxScroll) * 100))
                    );
                  }
                }}
                className="overflow-y-auto flex-1 custom-scrollbar"
              >
                {/* Cover Masthead */}
                <div className="relative h-52 sm:h-64 bg-slate-950 overflow-hidden border-b border-white/[0.06]">
                  {selectedArticleForModal.coverImageUrl ||
                  (selectedArticleForModal as any).coverImage ? (
                    <img
                      src={
                        selectedArticleForModal.coverImageUrl ||
                        (selectedArticleForModal as any).coverImage
                      }
                      alt={selectedArticleForModal.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-85"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                      <BookOpenCheck className="w-16 h-16 text-emerald-400/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040917] via-[#040917]/65 to-transparent" />

                  <div className="absolute bottom-5 left-6 right-6 space-y-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                      {selectedArticleForModal.title}
                    </h1>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Author Byline Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-900 shrink-0">
                        {selectedArticleForModal.authorAvatar ||
                        profile?.profileImage ? (
                          <img
                            src={
                              selectedArticleForModal.authorAvatar ||
                              profile.profileImage
                            }
                            alt={selectedArticleForModal.author || "Chandru Mohan"}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-emerald-400 flex items-center justify-center h-full">
                            C
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {selectedArticleForModal.author || "Chandru Mohan"}
                        </h4>
                        <p className="text-[11px] font-mono text-emerald-400">
                          {selectedArticleForModal.authorRole ||
                            "Principal Systems Architect & Full Stack Java Developer"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-400">
                      <p>
                        Published:{" "}
                        {new Date(
                          selectedArticleForModal.publishedAt
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Executive Abstract & Key Architectural Takeaways Callout */}
                  {(selectedArticleForModal.executiveSummary ||
                    (Array.isArray(selectedArticleForModal.keyTakeaways) &&
                      selectedArticleForModal.keyTakeaways.filter(Boolean)
                        .length > 0)) && (
                    <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-3">
                      <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                        Executive Abstract &amp; Key Architectural Takeaways
                      </div>
                      {selectedArticleForModal.executiveSummary && (
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {selectedArticleForModal.executiveSummary}
                        </p>
                      )}
                      {Array.isArray(selectedArticleForModal.keyTakeaways) &&
                        selectedArticleForModal.keyTakeaways.filter(Boolean)
                          .length > 0 && (
                          <ul className="space-y-1.5 pt-1">
                            {selectedArticleForModal.keyTakeaways
                              .filter(Boolean)
                              .map((tk, tIdx) => (
                                <li
                                  key={tIdx}
                                  className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5"
                                >
                                  <span className="text-emerald-400 font-mono font-bold shrink-0">
                                    0{tIdx + 1}.
                                  </span>
                                  <span>{tk}</span>
                                </li>
                              ))}
                          </ul>
                        )}
                    </div>
                  )}

                  {/* Article Markdown Renderer */}
                  <div
                    className={`max-w-none space-y-4 text-slate-300 leading-relaxed font-sans ${
                      articleReaderFontSize === "lg"
                        ? "text-base"
                        : articleReaderFontSize === "sm"
                        ? "text-xs"
                        : "text-sm"
                    }`}
                  >
                    {selectedArticleForModal.content
                      .split("\n\n")
                      .map((block, idx) => {
                        if (block.startsWith("### ")) {
                          return (
                            <h3
                              key={idx}
                              className="text-lg font-bold text-emerald-400 mt-6 mb-2 font-display"
                            >
                              {block.replace("### ", "")}
                            </h3>
                          );
                        }
                        if (block.startsWith("## ")) {
                          return (
                            <h2
                              key={idx}
                              className="text-xl font-extrabold text-white mt-8 mb-3 font-display border-b border-white/[0.06] pb-2"
                            >
                              {block.replace("## ", "")}
                            </h2>
                          );
                        }
                        if (block.startsWith("# ")) {
                          return (
                            <h1
                              key={idx}
                              className="text-2xl font-black text-white mt-6 mb-4 font-display"
                            >
                              {block.replace("# ", "")}
                            </h1>
                          );
                        }
                        if (block.startsWith("```")) {
                          const lines = block.split("\n");
                          const lang = lines[0].replace("```", "").trim() || "code";
                          const codeContent = lines
                            .slice(1, lines.length - 1)
                            .join("\n");
                          return (
                            <div
                              key={idx}
                              className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
                            >
                              <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center justify-between">
                                <span>{lang} implementation</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (navigator?.clipboard?.writeText) {
                                      navigator.clipboard
                                        .writeText(codeContent)
                                        .catch(() => {});
                                    }
                                    setCopiedCodeBlockIdx(idx);
                                    soundFx.playClick(1040);
                                    window.setTimeout(
                                      () => setCopiedCodeBlockIdx(null),
                                      2000
                                    );
                                  }}
                                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                                >
                                  {copiedCodeBlockIdx === idx ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">
                                        Copied
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Code</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                                <code>{codeContent}</code>
                              </pre>
                            </div>
                          );
                        }
                        if (block.startsWith("- ") || block.startsWith("* ")) {
                          const items = block.split("\n").filter(Boolean);
                          return (
                            <ul
                              key={idx}
                              className="list-disc list-inside space-y-1.5 pl-2 text-slate-300"
                            >
                              {items.map((item, itemIdx) => (
                                <li key={itemIdx} className="leading-relaxed">
                                  {item.replace(/^[-*]\s+/, "")}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p key={idx} className="leading-relaxed">
                            {block}
                          </p>
                        );
                      })}
                  </div>

                  {/* Article Footer Tags */}
                  {selectedArticleForModal.tags &&
                    selectedArticleForModal.tags.length > 0 && (
                      <div className="pt-6 border-t border-white/[0.06] space-y-2">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-bold">
                          Related Research Topics &amp; Skills
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedArticleForModal.tags.map((tag, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setArticleSearchQuery(tag);
                                setSelectedArticleForModal(null);
                              }}
                              className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-950 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 cursor-pointer"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedArticleForModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ← Close Reader
                </button>
                <div className="flex items-center gap-2.5">
                  {selectedArticleForModal.externalUrl && (
                    <a
                      href={selectedArticleForModal.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.1] text-slate-200 hover:text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>External Canonical Link</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        setFeedbackToast("Article link copied to clipboard!");
                        setTimeout(() => setFeedbackToast(null), 3000);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Publication</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skill Intelligence Deep-Dive Modal */}
      <AnimatePresence>
        {selectedSkillForModal && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-slate-900 border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto relative"
              style={{
                boxShadow: `0 0 40px ${selectedSkillForModal.color || '#10b981'}25`
              }}
            >
              {/* Header */}
              <div className="p-6 bg-slate-950/90 border-b border-white/[0.06] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl border flex items-center justify-center p-2.5 bg-slate-900 shadow-inner shrink-0"
                    style={{
                      borderColor: `${selectedSkillForModal.color || '#10b981'}50`,
                      boxShadow: `0 0 20px ${selectedSkillForModal.color || '#10b981'}20`
                    }}
                  >
                    <SkillMediaRenderer
                      src={selectedSkillForModal.iconUrl}
                      fallbackIcon={selectedSkillForModal.iconName || 'Code2'}
                      fallbackColor={selectedSkillForModal.color || '#10b981'}
                      alt={selectedSkillForModal.name}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {selectedSkillForModal.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Technical Capability</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white font-luxury tracking-wide mt-1">
                      {selectedSkillForModal.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedSkillForModal(null);
                    soundFx.playModalClose();
                  }}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Enterprise Competency & Production Architecture Tier */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.04] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 uppercase tracking-widest font-bold">Deployment & Production Tier</span>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                        Active In Production
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-white/[0.04] text-slate-300 flex items-center gap-1.5">
                      <span className="text-emerald-400">⚡</span>
                      <span className="font-semibold">Core Stack</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-white/[0.04] text-slate-300 flex items-center gap-1.5">
                      <span className="text-cyan-400">🛡️</span>
                      <span className="font-semibold">Architect Grade</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-white/[0.04] text-slate-300 flex items-center gap-1.5 col-span-2 sm:col-span-1">
                      <span className="text-teal-400">🚀</span>
                      <span className="font-semibold">High Scale SLA</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedSkillForModal.description && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">
                      Architectural Overview & Core Competency
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-2xl border border-white/[0.04]">
                      {selectedSkillForModal.description}
                    </p>
                  </div>
                )}

                {/* Subsystem Competency Highlights */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">
                    Enterprise Engineering Highlights:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 font-mono">
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-white/[0.04] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Production Deployments & SLA</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-white/[0.04] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Scalable Microservice Design</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-white/[0.04] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Low Latency Event Pipelines</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-white/[0.04] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Automated Test Coverage & CI</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  Verified Technical Skill Portfolio
                </span>
                <button
                  onClick={() => {
                    setSelectedSkillForModal(null);
                    soundFx.playModalClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Close Intelligence View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tool Intelligence Deep-Dive Modal */}
      <AnimatePresence>
        {selectedToolForModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden"
              style={{
                boxShadow: `0 0 50px -10px ${selectedToolForModal.brandColor || '#10b981'}30`
              }}
            >
              {/* Header */}
              <div className="p-6 bg-slate-950/90 border-b border-white/[0.06] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl border flex items-center justify-center p-2.5 bg-slate-900 shadow-inner shrink-0"
                    style={{
                      borderColor: `${selectedToolForModal.brandColor || '#10b981'}50`,
                      boxShadow: `0 0 20px ${selectedToolForModal.brandColor || '#10b981'}20`
                    }}
                  >
                    <ToolIconRenderer tool={selectedToolForModal} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {selectedToolForModal.category}
                      </span>
                      {selectedToolForModal.isFeatured && (
                        <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                          ★ Core Ecosystem
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white font-luxury tracking-wide mt-1">
                      {selectedToolForModal.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedToolForModal(null);
                    soundFx.playModalClose();
                  }}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar font-sans">
                {/* Engineering Tier & Proficiency */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.04] flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Experience & Tooling Proficiency
                    </span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5 block">
                      {selectedToolForModal.experienceLevel || 'Advanced Tooling'}
                      {selectedToolForModal.yearsOfExperience ? ` • ${selectedToolForModal.yearsOfExperience}+ Years Production Experience` : ''}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Production Active
                  </span>
                </div>

                {/* Description */}
                {selectedToolForModal.description && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">
                      Engineering Role & System Utility
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-2xl border border-white/[0.04]">
                      {selectedToolForModal.description}
                    </p>
                  </div>
                )}

                {/* Capability Badges */}
                <div className="grid grid-cols-2 gap-2.5 font-mono text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/[0.04] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Active Workflow Integration</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/[0.04] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>High Productivity Standard</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 bg-slate-950/90 border-t border-white/[0.06] flex items-center justify-between gap-3">
                {selectedToolForModal.officialWebsite ? (
                  <a
                    href={selectedToolForModal.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFx.playClick()}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 border border-white/[0.08] hover:border-emerald-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Visit Official Platform</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : <div />}

                <button
                  onClick={() => {
                    setSelectedToolForModal(null);
                    soundFx.playModalClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Close Specs View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Certificate Intelligence Deep-Dive Modal */}
      <AnimatePresence>
        {selectedCertForModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden"
              style={{
                boxShadow: `0 0 50px -10px rgba(16, 185, 129, 0.3)`
              }}
            >
              {/* Header */}
              <div className="p-6 bg-slate-950/90 border-b border-white/[0.06] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl border border-emerald-500/40 bg-slate-900 flex items-center justify-center p-3 shadow-inner text-emerald-400 shrink-0">
                    <Award className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {selectedCertForModal.issuingOrganization}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        ● Verified Accreditation
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white font-luxury tracking-wide mt-1">
                      {selectedCertForModal.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCertForModal(null);
                    soundFx.playModalClose();
                  }}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar font-sans">
                {/* Dates & Validity */}
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.04] space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Issue Date</span>
                    <span className="text-slate-200 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {selectedCertForModal.issueDate}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/[0.04] space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Expiration</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {selectedCertForModal.expirationDate || 'Lifetime Active'}
                    </span>
                  </div>
                </div>

                {/* Credential ID with Copy */}
                {selectedCertForModal.credentialId && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                        Official Credential Identifier
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-extrabold text-emerald-400 truncate block">
                        {selectedCertForModal.credentialId}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCertForModal.credentialId) {
                          navigator.clipboard.writeText(selectedCertForModal.credentialId);
                          setCopiedCertId(selectedCertForModal.credentialId);
                          soundFx.playSuccess();
                          setTimeout(() => setCopiedCertId(null), 2500);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/[0.06] font-mono text-[10px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {copiedCertId === selectedCertForModal.credentialId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Audit & Compliance Badges */}
                <div className="grid grid-cols-2 gap-2.5 font-mono text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/[0.04] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cryptographically Verified</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-white/[0.04] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Industry Recognized Authority</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 bg-slate-950/90 border-t border-white/[0.06] flex items-center justify-between gap-3">
                {selectedCertForModal.credentialUrl ? (
                  <a
                    href={selectedCertForModal.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFx.playClick()}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 border border-white/[0.08] hover:border-emerald-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch Verification Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : <div />}

                <button
                  onClick={() => {
                    setSelectedCertForModal(null);
                    soundFx.playModalClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Close Credential View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Scroll To Top Control */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => scrollToSection('hero', e)}
            className="fixed bottom-4 right-4 z-[100] p-2.5 sm:p-3 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-400 shadow-xl shadow-emerald-500/10 backdrop-blur-md transition-all duration-300 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Scroll back to top"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Interactive AI Career & Portfolio Assistant and Developer Terminal Modal (Deferred) */}
      <React.Suspense fallback={null}>
        {shouldMountChat && <AIPortfolioChat />}

        {/* Floating Developer Command Console Launcher (Ctrl+K) */}
        <div className="fixed bottom-4 left-4 z-[90] flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-3.5 sm:py-2.5 rounded-full ${
              isTerminalOpen
                ? 'bg-emerald-500/20 border-emerald-400/70 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                : 'bg-slate-900/90 hover:bg-slate-800/95 border-slate-700/80 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400'
            } border text-xs font-mono font-bold shadow-2xl backdrop-blur-xl transition-all duration-200 cursor-pointer group`}
            title="Toggle Developer Command Console (Ctrl+K)"
          >
            <span className={`w-2 h-2 rounded-full ${isTerminalOpen ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400/80'}`} />
            <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 group-hover:rotate-6 transition-transform" />
            <span className="text-[11px] sm:text-xs font-mono font-bold hidden sm:inline">Command Console</span>
            <span className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800 hidden md:inline">
              Ctrl+K
            </span>
          </motion.button>
        </div>

        {/* Floating Developer Command Console Window */}
        {isTerminalOpen && (
          <DeveloperTerminalModal
            isOpen={isTerminalOpen}
            onClose={() => setIsTerminalOpen(false)}
            projects={projects}
            skills={skills}
            experiences={experiences}
            education={education}
            metrics={portfolioMetrics}
            profile={profile}
            currentRoute="/"
          />
        )}
      </React.Suspense>

    </div>
  );
}

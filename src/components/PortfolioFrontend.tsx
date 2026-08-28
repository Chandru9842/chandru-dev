import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Cpu, Database, Award, Briefcase, GraduationCap, 
  Mail, Github, ExternalLink, ShieldAlert, Activity, ChevronRight, 
  Send, Check, MapPin, Calendar, ArrowDown, ArrowUp, Globe, Eye, Users, ShieldCheck,
  Code2, Sparkles, MessageSquare, Terminal, X, ChevronLeft, Video, Play, Film,
  Image as ImageIcon, Smartphone, Network, Braces, Cloud, Lock, Settings, Sliders, Palette,
  Download, Phone, FileText, Linkedin, Youtube, Instagram, Facebook, Link, Twitter,
  Menu, XCircle, AlertCircle, Star, Wrench, Search, BookOpen, BookOpenCheck, MessageSquareQuote, Quote, Clock, Share2
} from 'lucide-react';
const ThreeDHero = React.lazy(() => import('./ThreeDHero'));
import DynamicBackground from './DynamicBackground';
import SkillMediaRenderer from './SkillMediaRenderer';
const AIPortfolioChat = React.lazy(() => import('./AIPortfolioChat'));
const DeveloperTerminalModal = React.lazy(() => import('./DeveloperTerminalModal'));

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
  initialResumes, initialCodingProfiles, initialPortfolioMetrics, initialTestimonials, initialArticles 
} from '../data/cmsMockData';
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

interface ProjectCardProps {
  proj: ProjectItem;
  prefersReduced: boolean;
  setSelectedProjectForModal: (proj: ProjectItem) => void;
  setActiveSlideIndex: (index: number) => void;
  trackProjectView: (slug: string, title: string) => void;
}

function ProjectCard({ proj, prefersReduced, setSelectedProjectForModal, setActiveSlideIndex, trackProjectView }: ProjectCardProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const projectCardVariants = {
    hidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }
    }
  };

  return (
    <motion.article 
      variants={projectCardVariants}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setSelectedProjectForModal(proj);
        setActiveSlideIndex(0);
        trackProjectView(proj.slug, proj.title);
      }}
      className="relative glass-card rounded-2xl overflow-hidden flex flex-col h-full group border border-white/[0.04] hover:border-emerald-500/30 transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/10"
      whileHover={prefersReduced ? {} : {
        scale: 1.015,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      {/* Light spotlight effect */}
      {!prefersReduced && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(16, 185, 129, 0.08), transparent 85%)`,
            zIndex: 1,
          }}
        />
      )}

      {/* Subtle border glow spotlight */}
      {!prefersReduced && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300 border border-emerald-500/20"
          style={{
            background: `radial-gradient(200px circle at ${coords.x}px ${coords.y}px, rgba(16, 185, 129, 0.15), transparent 60%)`,
            maskImage: 'linear-gradient(black, black)',
            WebkitMaskImage: 'linear-gradient(black, black)',
            zIndex: 0,
          }}
        />
      )}

      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 shrink-0 z-10">
        <SkillMediaRenderer 
          src={proj.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80"} 
          alt={proj.title}
          variant="cover"
          className="group-hover:scale-105 transition-all duration-700 opacity-80 group-hover:opacity-100"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/25 uppercase tracking-wider">
            {proj.category || "Full-Stack"}
          </span>
          <span className={`backdrop-blur-md font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
            proj.status === 'Completed' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/20' :
            proj.status === 'In Development' ? 'bg-amber-950/80 text-amber-400 border-amber-500/20' :
            proj.status === 'Concept' ? 'bg-purple-950/80 text-purple-400 border-purple-500/20' :
            proj.status === 'Maintained' ? 'bg-sky-950/80 text-sky-400 border-sky-500/20' :
            'bg-slate-950/80 text-slate-400 border-slate-500/20'
          }`}>
            {proj.status || "Completed"}
          </span>
        </div>

        {proj.isFeatured && (
          <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-mono text-[9px] font-extrabold px-2 py-0.5 rounded border border-amber-400/20 uppercase tracking-widest shadow-md flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Featured</span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow justify-between gap-6 z-10">
        <div className="space-y-3.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>{proj.startDate} — {proj.endDate || 'Present'}</span>
            {proj.gallery && proj.gallery.length > 0 && (
              <span className="text-emerald-500/80">+{proj.gallery.length} Screens</span>
            )}
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {proj.title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
            {proj.description}
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            {proj.skills.map((skill, idx) => (
              <span 
                key={idx} 
                className="text-[9px] font-mono bg-white/[0.03] border border-white/[0.04] px-2 py-0.5 rounded text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 text-xs font-semibold">
            <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-mono text-[10px] uppercase">
              <span>Review Blueprint</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>

            <div className="flex items-center gap-3.5" onClick={(e) => e.stopPropagation()}>
              {proj.liveUrl && (
                <a 
                  href={proj.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                  title={`Live Deployment of ${proj.title}`}
                  aria-label={`Live site for ${proj.title}`}
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
              {proj.githubUrl && (
                <a 
                  href={proj.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                  title={`Source Repository for ${proj.title}`}
                  aria-label={`Source repository for ${proj.title}`}
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
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
            barRef.current.style.width = `${progress}%`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-slate-950/40 overflow-hidden pointer-events-none">
      <div 
        ref={barRef}
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(52,211,153,0.8)]"
        style={{ width: '0%' }}
        role="progressbar"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />
    </div>
  );
});

export default function PortfolioFrontend({ onEnterCMS }: PortfolioFrontendProps) {
  // Dynamic API Loaded States - Initialized with cmsMockData defaults for instant zero-latency first paint
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills);
  const [certificates, setCertificates] = useState<CertificateItem[]>(initialCertificates);
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements);
  const [experiences, setExperiences] = useState<ExperienceItem[]>(initialExperiences);
  const [education, setEducation] = useState<EducationItem[]>(initialEducation);
  const [settings, setSettings] = useState<SettingsConfig | null>(initialSettings);
  const [footer, setFooter] = useState<any>(initialFooter);
  const [analytics, setAnalytics] = useState<AnalyticsMetric | null>(initialAnalytics);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(initialSocialLinks);
  const [footerSocialLinks, setFooterSocialLinks] = useState<any[]>(initialSocialLinks);
  const [activeResume, setActiveResume] = useState<ResumeItem | null>(initialResumes[0] || null);
  const [profile, setProfile] = useState<any>(initialProfile);
  const [theme, setTheme] = useState<any>(initialThemeSettings);
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [codingProfiles, setCodingProfiles] = useState<CodingProfileItem[]>(initialCodingProfiles);
  const [tools, setTools] = useState<ToolItem[]>(initialTools);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetricItem[]>(initialPortfolioMetrics);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials);
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [selectedToolCategory, setSelectedToolCategory] = useState<string>('All');
  const [toolSearchQuery, setToolSearchQuery] = useState<string>('');
  const [selectedArticleCategory, setSelectedArticleCategory] = useState<string>('All');
  const [articleSearchQuery, setArticleSearchQuery] = useState<string>('');
  const [selectedArticleForModal, setSelectedArticleForModal] = useState<ArticleItem | null>(null);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState<number>(0);
  const [isTestimonialAutoplay, setIsTestimonialAutoplay] = useState<boolean>(true);

  const [activeSection, setActiveSection] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [render3D, setRender3D] = useState<boolean>(false);
  const [shouldMountChat, setShouldMountChat] = useState<boolean>(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : true);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const hasInitialAutoScrolledRef = React.useRef(false);
  const hasLoadedOnceRef = React.useRef(false);

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

  // Global Keyboard Shortcut Listener for Developer Terminal (Ctrl+K, Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsTerminalOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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

  useEffect(() => {    const sections = ["hero", "home", "about", "projects", "articles", "coding-profiles", "skills", "tools", "timeline", "experience", "education", "credentials", "certificates", "achievements", "testimonials", "contact"];
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
      const intersectingEntries = entries.filter(e => e.isIntersecting);
      if (intersectingEntries.length > 0) {
        const currentId = intersectingEntries[0].target.id;
        setActiveSection(currentId);

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
  }, [projects, skills, certificates, achievements, experiences, education, tools, testimonials, articles]);

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

    const performScroll = () => {
      const element = findTargetElement();

      if (element) {
        setActiveSection(normalizedId);

        if (window.history && window.history.replaceState) {
          try {
            window.history.replaceState(null, '', `#${normalizedId}`);
          } catch (err) {
            // Ignore state mutation errors in sandboxed iframes
          }
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const headerOffset = 76;
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = Math.max(0, elementTop - headerOffset);

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    };

    performScroll();
    requestAnimationFrame(performScroll);
    setTimeout(performScroll, 50);
    setTimeout(performScroll, 150);
  };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    scrollToSection(targetId, e);
  };

  const sectionVariants = {
    hidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }
    }
  };

  const projectsSectionVariants = {
    hidden: prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        when: "beforeChildren",
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
    return displayTools.filter(t => {
      const matchesCategory = selectedToolCategory === 'All' || t.category === selectedToolCategory;
      const q = toolSearchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        t.name.toLowerCase().includes(q) || 
        (t.category && t.category.toLowerCase().includes(q)) || 
        (t.description && t.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [displayTools, selectedToolCategory, toolSearchQuery]);

  const displayArticles = useMemo(() => {
    return articles.length > 0 ? articles : initialArticles;
  }, [articles]);

  const articleCategories = useMemo(() => {
    const cats = Array.from(new Set(displayArticles.map(a => a.category).filter(Boolean)));
    return ['All', ...cats];
  }, [displayArticles]);

  const filteredArticles = useMemo(() => {
    return displayArticles.filter(a => {
      const matchesCategory = selectedArticleCategory === 'All' || a.category === selectedArticleCategory;
      const q = articleSearchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        a.title.toLowerCase().includes(q) || 
        (a.summary && a.summary.toLowerCase().includes(q)) || 
        (a.tags && a.tags.some(tag => tag.toLowerCase().includes(q))) ||
        (a.category && a.category.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [displayArticles, selectedArticleCategory, articleSearchQuery]);

  const displayTestimonials = useMemo(() => {
    return testimonials.length > 0 ? testimonials : initialTestimonials;
  }, [testimonials]);

  useEffect(() => {
    if (!isTestimonialAutoplay || displayTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonialIndex(prev => (prev + 1) % displayTestimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isTestimonialAutoplay, displayTestimonials.length]);
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
    
    // Open in new tab: if valid direct URL use it, otherwise use backend view endpoint
    const targetUrl = (isValidResumeUrl(profile?.resumeUrl) && !profile?.resumeUrl?.startsWith('/api/resume'))
      ? profile.resumeUrl
      : (activeResume?.id ? `/api/resume/${activeResume.id}/file` : '/api/resume/view');
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadResume = async (e: React.MouseEvent<HTMLAnchorElement>, trackingKey: string, trackingLabel: string) => {
    e.preventDefault();
    trackClick(trackingKey, trackingLabel);
    trackResumeDownload();

    const candidateName = (profile?.fullName || profile?.displayName || 'Chandru_Mohan').replace(/\s+/g, '_');
    const fileName = activeResume?.fileName || `${candidateName}_Resume.pdf`;
    const backendDownloadUrl = activeResume?.id
      ? `/api/resume/${activeResume.id}/download?fileName=${encodeURIComponent(fileName)}&t=${Date.now()}`
      : `/api/resume/download?fileName=${encodeURIComponent(fileName)}&url=${encodeURIComponent(profile?.resumeUrl || '')}&t=${Date.now()}`;

    try {
      // 1. Fetch via our same-origin backend download endpoint which always returns attachment headers
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

    // 2. Direct browser navigation to download endpoint (guarantees browser download dialog)
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
      ogTitle.setAttribute('content', seoTitle);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', data.profile?.seoDescription || data.settings?.siteDescription || "Professional Systems Architect and Engineering Portfolio.");

      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', data.profile?.profileImage || "");

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

      if (data.articles && Array.isArray(data.articles)) {
        const visibleArticles = data.articles
          .filter((a: any) => a.isPublished !== false)
          .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setArticles(visibleArticles);
      }

      setActiveResume(data.activeResume);
      setProfile(data.profile);

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
          senderEmail: formEmail,
          subject: formSubject,
          messageContent: formMessage
        })
      });

      if (response.ok) {
        setFormSuccess(true);
        setFormName('');
        setFormEmail('');
        setFormSubject('');
        setFormMessage('');
        
        // Refresh analytics stats as form sending increments contact conversion rate
        const analyticsRes = await fetch('/api/analytics');
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);

        // Auto trigger a brief visual success alert
        setFeedbackToast("Your message has been sent successfully and delivered to Chandru's Admin Inbox!");
        setTimeout(() => setFeedbackToast(null), 5000);
      } else {
        setFormError('Endpoint rejected transaction. Please verify backend state.');
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
    const list = selectedSkillCategory === 'All' 
      ? visibleSkills 
      : visibleSkills.filter(s => s.category === selectedSkillCategory);
    // Sort by displayOrder ascending, then by name
    return list.sort((a, b) => {
      const orderA = a.displayOrder !== undefined ? a.displayOrder : 999;
      const orderB = b.displayOrder !== undefined ? b.displayOrder : 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }, [skills, selectedSkillCategory]);

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
            background-color: var(--card-bg) !important;
            border-color: var(--border-color) !important;
            border-radius: var(--border-radius) !important;
          }
        `}} />
      )}

      {/* Custom Global Wallpaper Layer */}
      {theme?.customWallpaper?.enabled && (
        <DynamicBackground bg={theme.customWallpaper} gradientStart={theme.gradientStart} gradientEnd={theme.gradientEnd} />
      )}
      
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-[160px] pointer-events-none" />

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
              {profile?.profileImage ? (
                <img src={profile.profileImage} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="font-luxury font-bold text-emerald-400 text-lg">A</span>
              )}
            </div>
            <div className="min-w-0 flex-1 max-w-[210px] sm:max-w-[260px] md:max-w-none">
              <h2 className="text-[11px] xs:text-xs sm:text-sm font-bold tracking-tight text-white uppercase font-display truncate group-hover:text-emerald-400 transition-colors">
                {profile?.displayName || (settings?.siteName ? settings.siteName.split('|')[0].trim() : "Alex Dev")}
              </h2>
              <span className="text-[8px] xs:text-[9px] font-mono tracking-wider text-emerald-400/80 block uppercase font-bold truncate">
                {profile?.title || "Systems Architect"}
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

            {/* Desktop Dashboard Access Button */}
            <button
              onClick={onEnterCMS}
              className="group relative hidden md:flex p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.01] text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0"
              title="Admin Access"
              aria-label="Admin Access"
              id="btn-access-cms-terminal"
            >
              <Lock className="w-4 h-4" />
              <span className="absolute top-full right-0 mt-2 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 border border-slate-800 text-slate-200 text-[9px] font-mono py-1 px-2 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none">
                Admin Access
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
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Admin Control</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onEnterCMS();
                  }}
                  className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.01] text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all flex items-center gap-2 text-xs font-mono cursor-pointer"
                  title="Admin Access"
                  aria-label="Admin Access"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Terminal CMS</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Landmark Container */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none">

      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-28 sm:pt-32 md:pt-36 lg:pt-32 xl:pt-36 2xl:pt-40 pb-12 sm:pb-16 lg:pb-20 overflow-x-hidden border-b border-white/[0.02]" id="hero">
        
        {theme?.heroBackground?.enabled && (
          <DynamicBackground bg={theme.heroBackground} gradientStart={theme.gradientStart} gradientEnd={theme.gradientEnd} />
        )}

        <div className="w-full max-w-[1536px] 2xl:max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-start gap-8 lg:gap-10 xl:gap-12 relative z-10">
          
          {/* Textual Overlays (Left column in Desktop grid) */}
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col items-center text-center lg:items-start lg:text-left w-full gap-4 sm:gap-5 lg:gap-6">

            {/* Top Badges & Status Container */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 shrink-0">
              {/* Developer Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold whitespace-nowrap">
                  {profile?.heroBadge || "Full Stack Java Developer"}
                </span>
              </div>

              {/* Optional Avatar & Online Status */}
              {profile?.heroAvatar && (
                <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-white/[0.08] px-3 py-1 rounded-full shadow-sm">
                  <img
                    src={profile.heroAvatar}
                    alt={profile?.heroName || profile?.fullName || "Founder"}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-emerald-500/40"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      {profile?.statusBadgeText || "Founder Online"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Name, Professional Eyebrow, Title & Subtitle */}
            <div className="flex flex-col gap-2 sm:gap-2.5 w-full">
              <span className="text-[10px] sm:text-xs font-mono text-emerald-400/90 uppercase tracking-widest block font-bold">
                {profile?.professionalLabel || "Systems Architect"}
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight font-luxury tracking-normal">
                {profile?.heroName || profile?.fullName || "Chandru M"}
              </h1>
              <p className="text-xs sm:text-sm font-mono text-emerald-400 uppercase tracking-widest font-bold">
                {profile?.heroTitle || profile?.title || "Principal Systems Architect"}
              </p>
              <h2 className="text-sm sm:text-lg lg:text-xl font-display font-medium text-slate-300 leading-snug">
                {profile?.heroSubtitle || profile?.shortTagline || "Ecosystem Architect & Product Pioneer"}
              </h2>
            </div>

            {/* Short Introduction */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-400 leading-relaxed max-w-lg lg:max-w-xl">
              {profile?.heroDescription || profile?.shortIntroduction || "I design and build resilient cloud systems, real-time analytics engines, and gorgeous web-based developer interfaces that scale dynamically."}
            </p>

            {/* Primary Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 sm:pt-2 w-full">
              <a 
                href={profile?.primaryCtaUrl || "#projects"} 
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                onClick={(e) => {
                  trackClick('explore_btn_hero', 'Explore Projects Click');
                  const target = profile?.primaryCtaUrl || '#projects';
                  if (target.startsWith('#')) {
                    scrollToSection(target.replace('#', ''), e);
                  }
                }}
              >
                <span>{profile?.primaryCtaText || "Explore Engineering"}</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <a 
                href={profile?.secondaryCtaUrl || "#contact"} 
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 glass-card hover:bg-white/[0.03] text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-white/[0.08]"
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
              </a>

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
                    {/* View Resume Button */}
                    <a 
                      href={profile?.resumeUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleViewResume(e, 'resume_view_hero', 'View Resume')}
                      className="w-full sm:w-auto px-4 py-2.5 border border-white/[0.08] hover:border-emerald-500/30 bg-white/[0.02] hover:bg-emerald-500/5 text-slate-300 hover:text-emerald-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>View Resume</span>
                    </a>

                    {/* Download Resume Button */}
                    {(activeResume ? activeResume.isDownloadEnabled !== false : true) && (
                      <a 
                        href={profile?.resumeUrl || '#'}
                        download={activeResume?.fileName || 'resume.pdf'}
                        onClick={(e) => handleDownloadResume(e, 'resume_download_hero', 'Download Resume')}
                        className="w-full sm:w-auto px-4 py-2.5 border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>{profile?.resumeDownloadText || profile?.downloadCtaText || "Download CV"}</span>
                      </a>
                    )}
                  </div>
                  
                  {/* Resume Last Updated & Version Metadata */}
                  <div className="flex flex-col text-[10px] font-mono text-slate-500 items-center sm:items-start pl-0 sm:pl-3 sm:border-l sm:border-white/[0.06] select-none shrink-0">
                    <span className="text-emerald-400/80 font-bold">
                      {profile?.versionText || (activeResume ? `Version ${activeResume.version}` : "Version 2.4.0")}
                    </span>
                    <span className="mt-0.5 text-slate-600">
                      {profile?.updateText || (activeResume ? `Updated ${new Date(activeResume.updatedAt).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}` : "Updated Recently")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Hero Section Links */}
            {socialLinks.filter(l => l.showInHero === true).length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-3 relative z-30">
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

            {/* Dynamic Social Links in Hero Section (Coordinates Channels) */}
            {socialLinks.filter(l => l.showInCoordinates !== false).length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 pt-5 border-t border-white/[0.04] w-full max-w-lg lg:max-w-xl relative z-30">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-semibold">Coordinates Channels:</span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {socialLinks.filter(l => l.showInCoordinates !== false).map((link) => (
                    <SocialLinkAnchor
                      key={link.id}
                      link={link}
                      onClick={() => trackClick('social_hero_' + link.platform.toLowerCase(), link.platform)}
                      className="w-8.5 h-8.5 rounded-lg border border-slate-700/60 hover:border-emerald-500/60 bg-slate-900/90 hover:bg-slate-950/95 text-slate-200 hover:text-emerald-400 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group relative shadow-md"
                      childrenClassName="w-4.5 h-4.5 object-contain"
                    />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: 3D Canvas Universe / Interactive Cyber Showcase on ALL screen sizes */}
          <div className="lg:col-span-5 xl:col-span-6 w-full h-[320px] sm:h-[380px] md:h-[440px] lg:h-[480px] xl:h-[540px] relative rounded-3xl overflow-hidden border border-white/[0.06] bg-slate-950/40 backdrop-blur-xs flex items-center justify-center my-2 lg:my-0 shadow-2xl shadow-emerald-500/5">
            <CanvasErrorBoundary>
              <React.Suspense fallback={
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm">
                  <div className="inline-block w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Initializing Universe...</p>
                </div>
              }>
                {render3D ? (
                  <ThreeDHero techString={techString} />
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 select-none overflow-hidden">
                    {/* Background ambient glow */}
                    <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl animate-pulse" />
                    
                    {/* Outer rotating orbit ring */}
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-emerald-500/20 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                      {/* Orbital node */}
                      <div className="absolute -top-1.5 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                      
                      {/* Middle counter-rotating ring */}
                      <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-dashed border-emerald-400/30 flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                        {/* Inner core glowing planet */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-slate-950 via-emerald-950/80 to-emerald-500/20 border border-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* Futuristic telemetry pill & Launch 3D Button */}
                    <div className="mt-4 flex flex-col items-center gap-2.5 z-10">
                      <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 shadow-lg shadow-emerald-950/40 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                          {techString || "JAVA • SPRING BOOT • REACT • MYSQL"}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setRender3D(true)}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer group"
                        title="Experience interactive 3D WebGL universe"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                        <span>Interactive 3D Mode</span>
                      </button>
                    </div>
                  </div>
                )}
              </React.Suspense>
            </CanvasErrorBoundary>
          </div>

          {/* Hero Analytics Grid (Spanning full width of Hero section) */}
          {portfolioMetrics && portfolioMetrics.length > 0 && (
            <div className="lg:col-span-12 w-full pt-6 sm:pt-10 border-t border-white/[0.06] mt-4 lg:mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5 md:gap-4 w-full">
                {portfolioMetrics.map((metric) => {
                  const colorConfig = COLOR_ACCENTS[metric.color || 'emerald'] || COLOR_ACCENTS.emerald;
                  return (
                    <motion.div 
                      key={metric.id}
                      initial={metric.animationEnabled ? { opacity: 0, y: 10 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      className={`w-full h-full min-h-[68px] sm:min-h-[76px] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border ${colorConfig.border} ${colorConfig.bg} backdrop-blur-md flex items-center gap-2.5 sm:gap-3 shadow-md group hover:scale-[1.02] transition-all duration-200`}
                      title={metric.tooltip || undefined}
                    >
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${colorConfig.bg} ${colorConfig.border} border flex items-center justify-center ${colorConfig.text} shrink-0 group-hover:rotate-6 transition-transform`}>
                        <MetricIconRenderer metric={metric} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm sm:text-base lg:text-lg font-bold font-mono text-white tracking-tight leading-none truncate">
                            {metric.value}
                          </span>
                          {metric.color === 'emerald' && (
                            <span className="relative flex h-1.5 w-1.5 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 block truncate mt-0.5">
                          {metric.title}
                        </span>
                        {metric.subtitle && (
                          <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 block truncate mt-0.5">
                            {metric.subtitle}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Technology marquee/ticker for All Viewports */}
        <div className="w-full max-w-[1536px] 2xl:max-w-[1600px] mx-auto py-2.5 sm:py-3 overflow-hidden select-none bg-emerald-500/5 border-y border-emerald-500/10 mt-8 mb-2 rounded-2xl relative z-10">
          <div className="flex w-max animate-marquee gap-8">
            <div className="flex shrink-0 items-center gap-8 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              <span>{techString || "JAVA • SPRING BOOT • REACT • MYSQL • DOCKER • AWS • KUBERNETES • REDIS • POSTGRESQL • GRAPHQL • NEXT.JS • TAILWIND"}</span>
              <span className="text-slate-600">•</span>
            </div>
            <div className="flex shrink-0 items-center gap-8 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase" aria-hidden="true">
              <span>{techString || "JAVA • SPRING BOOT • REACT • MYSQL • DOCKER • AWS • KUBERNETES • REDIS • POSTGRESQL • GRAPHQL • NEXT.JS • TAILWIND"}</span>
              <span className="text-slate-600">•</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50 z-10 pointer-events-none hidden sm:flex">
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Scroll Down</span>
          <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
        </div>
      </section>

      <div className="w-full max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-16 pb-10 space-y-20 lg:space-y-24">

          {/* About Section */}
          <motion.section 
            id="about" 
            className="space-y-12 scroll-mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div className="space-y-2.5">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">ABOUT ME</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">
                {profile?.aboutHeading || "Who I Am"}
              </h2>
              <div className="h-0.5 w-12 bg-emerald-500/60 rounded" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Image & Stats side */}
              <div className="lg:col-span-5 space-y-6">
                <div className="relative group w-full aspect-square rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-900/40 p-4">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {profile?.aboutImage ? (
                    <SkillMediaRenderer 
                      src={profile.aboutImage} 
                      alt={profile?.fullName || "Founder"} 
                      variant="cover"
                      className="rounded-xl border border-white/[0.04]"
                    />
                  ) : profile?.profileImage ? (
                    <SkillMediaRenderer 
                      src={profile.profileImage} 
                      alt={profile?.fullName || "Founder"} 
                      variant="cover"
                      className="rounded-xl border border-white/[0.04]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-slate-950/80 border border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-3 text-slate-500">
                      <Code2 className="w-10 h-10 text-emerald-400" />
                      <span className="text-[10px] font-mono tracking-widest uppercase">Node Founder</span>
                    </div>
                  )}
                </div>

                {/* Quick Statistics block */}
                {profile?.quickStats && (
                  <div className="glass-card p-5 rounded-2xl border border-white/[0.05] bg-slate-950/40 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-3">Operational Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {profile.quickStats.split('|').map((stat, idx) => {
                        const parts = stat.split(' ');
                        const value = parts[0] || '';
                        const label = parts.slice(1).join(' ') || 'Metric';
                        return (
                          <div key={idx} className="space-y-0.5">
                            <span className="text-lg font-bold font-mono text-white block">{value}</span>
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dynamic Profile Social Links */}
                {socialLinks.filter(l => l.showInDynamicProfile !== false).length > 0 && (
                  <div className="glass-card p-4 rounded-2xl border border-white/[0.05] bg-slate-950/40 relative space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Profile Channels</span>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.filter(l => l.showInDynamicProfile !== false).map((link) => (
                        <SocialLinkAnchor
                          key={link.id}
                          link={link}
                          onClick={() => trackClick('social_profile_' + link.platform.toLowerCase(), link.platform)}
                          className="w-8.5 h-8.5 rounded-lg border border-slate-700/60 hover:border-emerald-500/60 bg-slate-900/90 hover:bg-slate-950/95 text-slate-200 hover:text-emerald-400 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group relative shadow-md"
                          childrenClassName="w-4.5 h-4.5 object-contain"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text description & detailed data side */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-display text-white">
                    {profile?.fullName || "Chandru Mohan"}
                  </h3>
                  <p className="text-xs font-mono text-emerald-400">
                    {profile?.title || "Principal Architect"} {profile?.currentCompany ? `@ ${profile.currentCompany}` : ""}
                  </p>
                </div>

                {/* Professional Biography */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Professional Biography</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {profile?.biography || profile?.aboutDescription || "Designing clean-coded enterprise ecosystems and highly responsive visualizers. A bespoke, fully decentralized engineering environment connected directly to real-time micro-databases."}
                  </p>
                </div>

                {/* Career Objective */}
                {profile?.careerObjective && (
                  <div className="glass-card p-4 rounded-xl border border-white/[0.03] bg-emerald-500/[0.01] relative">
                    <span className="text-[9px] font-mono text-emerald-400/80 uppercase tracking-widest block mb-1.5 font-bold">Career Mission Statement</span>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "{profile.careerObjective}"
                    </p>
                  </div>
                )}

                {/* Skills Summary */}
                {profile?.skillsSummary && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Core Competency Architecture</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {profile.skillsSummary}
                    </p>
                  </div>
                )}

                {/* Grid of Key Metadata */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.04] text-xs font-mono">
                  {profile?.experienceSummary ? (
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">Experience Summary</span>
                      <span className="text-white font-medium">{profile.experienceSummary}</span>
                    </div>
                  ) : profile?.yearsExperience !== undefined ? (
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">Professional Track</span>
                      <span className="text-white font-medium">{profile.yearsExperience}+ Years Systems Experience</span>
                    </div>
                  ) : null}

                  {profile?.currentPosition && (
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">Current Post</span>
                      <span className="text-white font-medium">{profile.currentPosition} {profile.currentCompany ? `@ ${profile.currentCompany}` : ""}</span>
                    </div>
                  )}

                  {profile?.location && (
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">Base Operations</span>
                      <span className="text-white font-medium">{profile.location}, {profile.country || "US"}</span>
                    </div>
                  )}

                  {profile?.availability && (
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">Availability Status</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          profile.availability === 'Open to Work' || profile.availability === 'Available' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`} />
                        <span className="text-white font-medium">{profile.availability}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Resume Button in About section */}
                {!isValidResumeUrl(profile?.resumeUrl) ? (
                  <div className="pt-4 flex flex-wrap gap-3">
                    <button 
                      disabled
                      className="px-5 py-2.5 border border-white/[0.04] bg-white/[0.01] text-slate-500 font-bold text-xs rounded-lg flex items-center gap-2 cursor-not-allowed opacity-50"
                    >
                      <XCircle className="w-4 h-4 text-slate-500" />
                      <span>Resume not available</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 flex flex-wrap gap-3">
                    <a 
                      href={profile?.resumeUrl || '#'}
                      download={activeResume?.fileName || 'Chandru_Mohan_Resume.pdf'}
                      className="px-5 py-2.5 border border-emerald-500/20 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/15"
                      onClick={(e) => handleDownloadResume(e, 'about_resume_btn', 'Download Resume from About')}
                    >
                      <Download className="w-4 h-4" />
                      <span>{profile?.resumeDownloadText || profile?.downloadCtaText || "Download Resume / Curriculum Vitae"}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Featured Projects Section */}
          <motion.section 
            id="projects" 
            className="space-y-12 scroll-mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={projectsSectionVariants}
          >
            <div className="space-y-2.5">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Featured Subsystems</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">Committed Projects</h2>
              <div className="h-0.5 w-12 bg-emerald-500/60 rounded" />
            </div>

            <motion.div 
              variants={projectGridVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {projects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  proj={proj}
                  prefersReduced={prefersReduced}
                  setSelectedProjectForModal={setSelectedProjectForModal}
                  setActiveSlideIndex={setActiveSlideIndex}
                  trackProjectView={trackProjectView}
                />
              ))}
            </motion.div>
          </motion.section>

          {/* Engineering Blog & Technical Articles Section */}
          {displayArticles.length > 0 && (
            <motion.section 
              id="articles" 
              className="space-y-8 scroll-mt-24 relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.04] pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Thought Leadership & Publications</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {filteredArticles.length} {filteredArticles.length === 1 ? 'Article' : 'Articles'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">Engineering Blog & Articles</h2>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Deep dives into high-throughput distributed systems, Java 21 Virtual Threads, Kafka event streams, zero-downtime database migrations, and microservices scalability.
                  </p>
                </div>

                {/* Article Search Input */}
                <div className="relative w-full md:w-72 shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={articleSearchQuery}
                    onChange={(e) => setArticleSearchQuery(e.target.value)}
                    placeholder="Search articles, tags, topics..."
                    className="w-full bg-slate-900/90 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-500 shadow-inner"
                  />
                  {articleSearchQuery && (
                    <button
                      onClick={() => setArticleSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              {articleCategories.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {articleCategories.map((cat) => {
                    const isActive = selectedArticleCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedArticleCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Articles Grid */}
              {filteredArticles.length === 0 ? (
                <div className="text-center py-14 px-4 bg-slate-900/40 rounded-2xl border border-white/[0.04]">
                  <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-300">No matching articles found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No publications match your filter query. Try searching for different keywords or reset the filter.
                  </p>
                  {(articleSearchQuery || selectedArticleCategory !== 'All') && (
                    <button
                      onClick={() => {
                        setSelectedArticleCategory('All');
                        setArticleSearchQuery('');
                      }}
                      className="mt-4 px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((art) => (
                    <motion.article
                      key={art.id}
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`glass-card rounded-2xl border flex flex-col justify-between overflow-hidden group transition-all duration-300 ${
                        art.featured
                          ? 'border-emerald-500/40 bg-emerald-500/[0.02] shadow-xl shadow-emerald-500/5'
                          : 'border-white/[0.05] bg-slate-900/40 hover:border-emerald-500/30'
                      }`}
                    >
                      {/* Card Cover Image */}
                      <div className="relative h-48 bg-slate-950 overflow-hidden shrink-0">
                        {art.coverImage ? (
                          <img
                            src={art.coverImage}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                            <BookOpenCheck className="w-12 h-12 text-emerald-400/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent" />
                        
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 items-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 uppercase">
                            {art.category}
                          </span>
                          {art.featured && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 uppercase flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                              <Sparkles className="w-3 h-3" />
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3.5 right-3.5 flex items-center gap-2 text-[10px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/[0.08]">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span>{art.readTimeMinutes} min read</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2.5">
                          <h3 
                            onClick={() => setSelectedArticleForModal(art)}
                            className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug cursor-pointer line-clamp-2"
                          >
                            {art.title}
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            {art.summary}
                          </p>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-white/[0.04]">
                          {/* Tags */}
                          {art.tags && art.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {art.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[9px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/[0.04]">
                                  #{tag}
                                </span>
                              ))}
                              {art.tags.length > 3 && (
                                <span className="text-[9px] font-mono text-slate-500 px-1 py-0.5">
                                  +{art.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer Action */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-500/40 bg-slate-950 shrink-0">
                                {profile?.profileImage ? (
                                  <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-bold text-emerald-400 flex items-center justify-center h-full">C</span>
                                )}
                              </div>
                              <span className="text-[11px] font-medium text-slate-300 truncate">{art.authorName || "Chandru Mohan"}</span>
                            </div>

                            <button
                              onClick={() => setSelectedArticleForModal(art)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer group-hover:translate-x-0.5"
                            >
                              <span>Read Article</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {/* Coding Profiles Section */}
          <motion.section 
            id="coding-profiles" 
            className="space-y-12 scroll-mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
              <div className="space-y-2.5">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">CODING PROFILES</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">
                  Competitive Programming & Developer Profiles
                </h2>
                <p className="text-sm text-slate-400 font-sans max-w-2xl">
                  Showcasing my coding journey across competitive programming, open-source, and developer communities.
                </p>
                <div className="h-0.5 w-12 bg-emerald-500/60 rounded" />
              </div>

              {/* Grid Layout for Coding Profile Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                {codingProfiles.map((p) => {
                  const IconComponent = getCodingPlatformIconComponent(p.platformType);
                  
                  // Premium colors per platform
                  const platformBorderGlow = p.featured
                    ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:border-amber-500/60'
                    : p.platformType === 'GitHub' ? 'hover:shadow-slate-500/5 hover:border-slate-800' :
                      p.platformType === 'LeetCode' ? 'hover:shadow-amber-500/5 hover:border-amber-500/20' :
                      p.platformType === 'GeeksforGeeks' ? 'hover:shadow-emerald-500/5 hover:border-emerald-500/20' :
                      p.platformType === 'Codeforces' ? 'hover:shadow-red-500/5 hover:border-red-500/20' :
                      p.platformType === 'CodeChef' ? 'hover:shadow-amber-700/5 hover:border-amber-700/20' :
                      p.platformType === 'HackerRank' ? 'hover:shadow-emerald-400/5 hover:border-emerald-400/20' :
                      p.platformType === 'HackerEarth' ? 'hover:shadow-violet-400/5 hover:border-violet-400/20' :
                      'hover:shadow-emerald-500/5 hover:border-emerald-500/20';

                  const cardScale = p.featured 
                    ? 'scale-[1.02] md:scale-[1.03] border-amber-500/30' 
                    : 'border-white/[0.03]';

                  return (
                    <motion.div
                      key={p.id}
                      className={`relative bg-slate-900/30 border rounded-2xl p-4 sm:p-5 lg:p-6 hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between group shadow-lg ${platformBorderGlow} ${cardScale}`}
                      whileHover={{ y: -6, scale: p.featured ? 1.04 : 1.015 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {/* Featured Badge */}
                      {p.featured && (
                        <span className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-mono font-bold uppercase rounded-md tracking-wider shadow-sm animate-pulse">
                          ★ Featured
                        </span>
                      )}

                      <div>
                        {/* Card Header */}
                        <div className="flex items-start gap-3 sm:gap-4 mb-2.5 sm:mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center p-2 sm:p-2.5 shrink-0 transition-transform group-hover:scale-110 duration-300 shadow-inner">
                            {p.logoUrl ? (
                              <img 
                                src={p.logoUrl} 
                                alt={p.displayName} 
                                className="w-full h-full object-contain" 
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            ) : (
                              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                            )}
                          </div>
                          <div className="min-w-0 pr-12 sm:pr-16">
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-100 font-luxury tracking-wide truncate group-hover:text-emerald-400 transition-colors duration-300">
                              {p.displayName}
                            </h3>
                            <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-widest truncate">
                              {p.platformType}
                            </p>
                          </div>
                        </div>

                        {/* Username Display Box */}
                        <div className="bg-slate-950/40 border border-white/[0.02] rounded-xl px-3 py-2 sm:px-4 sm:py-3 mb-2.5 sm:mb-4 font-mono text-center">
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1 font-bold">Handle / Username</p>
                          <p className="text-xs sm:text-sm font-bold text-slate-200 truncate tracking-wide group-hover:text-emerald-400 transition-colors duration-300">
                            {p.username}
                          </p>
                        </div>

                        {/* Optional Description / Badge */}
                        {p.description && (
                          <div className="mb-3 sm:mb-5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/[0.01] border border-white/[0.03] rounded-xl text-xs text-slate-400 font-sans leading-relaxed flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <p className="flex-1 font-mono text-[10px] sm:text-[11px] font-medium tracking-wide">
                              {p.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <a
                        href={p.profileUrl}
                        target={p.openInNewTab !== false ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        aria-label={`Visit ${p.displayName || p.platformType || 'Coding'} Profile of ${p.username}`}
                        className="w-full py-2 sm:py-2.5 bg-white/[0.02] hover:bg-emerald-500 hover:text-slate-950 border border-white/[0.04] hover:border-emerald-500 text-center font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer text-slate-300 shadow-md group-hover:shadow-emerald-500/10"
                      >
                        <span>Visit Profile</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

          {/* Skill Matrix Section */}
          <motion.section 
            id="skills" 
            className="space-y-12 scroll-mt-24 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div id="techstack" className="absolute -top-24" />
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-2.5">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Competency Ledger</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">Expertise Matrix</h2>
                <div className="h-0.5 w-12 bg-emerald-500/60 rounded" />
              </div>

              {/* Categorization controls */}
              <div className="flex flex-wrap gap-1 bg-slate-900/60 border border-white/[0.04] rounded-lg p-1 text-xs">
                {skillCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedSkillCategory(cat)}
                    className={`px-3 py-1.5 rounded-md font-mono text-[11px] transition-all font-semibold cursor-pointer ${
                      selectedSkillCategory === cat 
                        ? 'bg-emerald-500 text-slate-950 shadow-md' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredSkills.map(skill => {
                const itemColor = skill.color || '#10b981';
                
                // Determine entrance animation props dynamically
                let initialProps: any = { opacity: 0 };
                let animateProps: any = { opacity: 1 };
                
                if (skill.animation === 'Slide In') {
                  initialProps = { opacity: 0, x: -20 };
                  animateProps = { opacity: 1, x: 0 };
                } else if (skill.animation === 'Scale Up') {
                  initialProps = { opacity: 0, scale: 0.95 };
                  animateProps = { opacity: 1, scale: 1 };
                }

                // Determine continuous / hover classes & styles
                const isPulse = skill.animation === 'Pulse';
                const isSpin = skill.animation === 'Spin Slow';
                const isGlow = skill.animation === 'Glow';

                return (
                  <motion.div 
                    key={skill.id} 
                    initial={initialProps}
                    whileInView={animateProps}
                    viewport={{ once: true }}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`glass-card rounded-xl p-3 sm:p-5 border border-white/[0.04] hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-2.5 sm:gap-4 relative overflow-hidden ${
                      isPulse ? 'animate-pulse' : ''
                    }`}
                    style={{
                      // fallback subtle outline shadow for beautiful glow effect
                      boxShadow: isGlow ? `0 0 12px ${itemColor}05` : 'none'
                    }}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-4">
                      <div 
                        className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 transition-all duration-500 overflow-hidden bg-slate-950/60 p-1.5 sm:p-2"
                        style={{ 
                          borderColor: `${itemColor}30`,
                        }}
                      >
                        <SkillMediaRenderer 
                          src={skill.iconUrl} 
                          fallbackIcon={skill.iconName || 'Code2'} 
                          fallbackColor={itemColor} 
                          isSpin={isSpin} 
                          alt={skill.name} 
                        />
                      </div>
                      <div className="min-w-0 flex-grow">
                        <span className="font-semibold text-white block text-xs sm:text-base truncate" title={skill.name}>{skill.name}</span>
                        <span className="text-[8px] sm:text-[10px] font-mono text-slate-400 block uppercase tracking-wider truncate mt-0.5" style={{ color: itemColor }}>
                          {skill.category}
                        </span>
                      </div>
                    </div>
                    {skill.description && (
                      <p className="text-[10px] sm:text-xs text-slate-400 leading-snug sm:leading-relaxed line-clamp-2">
                        {skill.description}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Tools & Technologies Section */}
          {(tools.length > 0 || initialTools.length > 0) && (
            <motion.section 
              id="tools" 
              className="space-y-8 scroll-mt-24 relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.04] pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Ecosystem Tools & Software</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {filteredTools.length} {filteredTools.length === 1 ? 'Tool' : 'Tools'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">Tools & Technologies</h2>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Frameworks, IDEs, databases, development platforms, and tools utilized across system design, full-stack engineering, and cloud workflows.
                  </p>
                </div>

                {/* Real-time Search Input */}
                <div className="relative w-full md:w-72 shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={toolSearchQuery}
                    onChange={(e) => setToolSearchQuery(e.target.value)}
                    placeholder="Search tools, tags, categories..."
                    className="w-full bg-slate-900/90 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-500 shadow-inner"
                  />
                  {toolSearchQuery && (
                    <button
                      onClick={() => setToolSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              {toolCategories.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {toolCategories.map((cat) => {
                    const isActive = selectedToolCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedToolCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty state if search/filter produces no items */}
              {filteredTools.length === 0 ? (
                <div className="text-center py-14 px-4 bg-slate-900/40 rounded-2xl border border-white/[0.04]">
                  <Wrench className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-300">No matching tools found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No software tools match your current filter query. Try searching for another keyword or resetting the category filter.
                  </p>
                  {(toolSearchQuery || selectedToolCategory !== 'All') && (
                    <button
                      onClick={() => {
                        setSelectedToolCategory('All');
                        setToolSearchQuery('');
                      }}
                      className="mt-4 px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                /* Tools Cards Grid (2-column compact on mobile for space optimization) */
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                  {filteredTools.map((tool) => {
                    const brandColor = tool.brandColor || '#10B981';
                    const hoverScale = tool.hoverScale || 1.02;
                    const hoverRotation = tool.hoverRotation || 0;

                    return (
                      <motion.div
                        key={tool.id}
                        whileHover={{ 
                          y: -4, 
                          scale: hoverScale,
                          rotate: hoverRotation,
                          transition: { duration: 0.2, ease: "easeOut" } 
                        }}
                        className="group relative bg-slate-900/60 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-800/90 p-3 sm:p-4 lg:p-5 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
                        style={{
                          boxShadow: tool.hasGlow ? `0 0 24px -6px ${brandColor}30` : undefined
                        }}
                      >
                        <div className="space-y-1.5 sm:space-y-3">
                          {/* Header: Icon + Category Badge + Star if featured */}
                          <div className="flex items-start justify-between gap-1.5 sm:gap-2.5">
                            <div 
                              className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shrink-0"
                              style={{ 
                                backgroundColor: tool.backgroundColor || `${brandColor}15`,
                                borderColor: tool.borderColor || `${brandColor}30`,
                                borderWidth: '1px'
                              }}
                            >
                              <ToolIconRenderer tool={tool} />
                            </div>
                            <div className="flex items-center gap-1 flex-wrap justify-end min-w-0">
                              {tool.isFeatured && (
                                <span className="p-0.5 sm:p-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shrink-0" title="Featured Tool">
                                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
                                </span>
                              )}
                              {tool.category && (
                                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-mono tracking-wider font-semibold uppercase bg-slate-800/90 text-slate-300 border border-slate-700/60 truncate max-w-[80px] sm:max-w-none">
                                  {tool.category}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Tool Name & Description */}
                          <div>
                            <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1 truncate" title={tool.name}>
                              {tool.name}
                            </h3>
                            {tool.description && (
                              <p className="text-[10px] sm:text-xs text-slate-400 leading-snug sm:leading-relaxed mt-0.5 sm:mt-1.5 line-clamp-2 sm:line-clamp-3">
                                {tool.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Footer Meta & Website Link */}
                        <div className="pt-2 mt-2 sm:pt-3.5 sm:mt-3 border-t border-slate-800/80 flex items-center justify-between text-[9px] sm:text-[11px] font-mono text-slate-400">
                          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
                            {tool.experienceLevel && (
                              <span className="text-emerald-400 font-medium truncate">
                                {tool.experienceLevel}
                              </span>
                            )}
                            {tool.yearsOfExperience && (
                              <span className="text-slate-500 hidden xs:inline">• {tool.yearsOfExperience}y</span>
                            )}
                          </div>

                          {tool.officialWebsite && (
                            <a
                              href={tool.officialWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors py-0.5 px-1 sm:px-1.5 rounded hover:bg-emerald-500/10 shrink-0"
                              title={`Visit ${tool.name} official website`}
                              aria-label={`Visit ${tool.name} official website`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="hidden xs:inline">Website</span>
                              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.section>
          )}

          {/* Timeline (Experience + Education) Section */}
          <motion.section 
            id="experience" 
            className="space-y-12 scroll-mt-24 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div id="timeline" className="absolute -top-24" />
            <div className="space-y-2.5">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Chronology of Achievements</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">Professional Timeline</h2>
              <div className="h-0.5 w-12 bg-emerald-500/60 rounded" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Professional Work Experience column */}
              <div className="lg:col-span-6 space-y-8 relative">
                <div className="flex items-center gap-2.5 text-white mb-6">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold font-display">Work milestones</h3>
                </div>

                <div className="border-l border-white/[0.05] pl-6 ml-3 space-y-10 relative">
                  {experiences.map(exp => (
                    <div key={exp.id} className="relative group space-y-2">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-emerald-500 transition-all group-hover:scale-125" />
                      
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                        {exp.location && (
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {exp.location}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white leading-tight">
                        {exp.role} <span className="text-slate-500">at</span> <span className="text-emerald-400">{exp.company}</span>
                      </h4>

                      <p className="text-xs text-slate-400 leading-relaxed pr-2">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Education column */}
              <div className="lg:col-span-6 space-y-8 relative">
                <div id="education" className="absolute -top-24" />
                <div className="flex items-center gap-2.5 text-white mb-6">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold font-display">Academic Background</h3>
                </div>

                <div className="border-l border-white/[0.05] pl-6 ml-3 space-y-10 relative">
                  {education.map(edu => (
                    <div key={edu.id} className="relative group space-y-2">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-emerald-500 transition-all group-hover:scale-125" />
                      
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {edu.startDate} — {edu.endDate}
                        </span>
                        {edu.grade && (
                          <span className="text-[10px] font-mono text-slate-300 border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 rounded">
                            {edu.grade}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white leading-tight">
                        {edu.degree} <span className="text-slate-500">in</span> <span className="text-emerald-400">{edu.fieldOfStudy}</span>
                      </h4>
                      <p className="text-xs text-slate-400 leading-normal">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.section>

          {/* Credentials and Certifications */}
          <motion.section 
            id="credentials" 
            className="space-y-12 scroll-mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div className="space-y-2.5">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Verified Badges</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">Industry Certifications</h2>
              <div className="h-0.5 w-12 bg-emerald-500/60 rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {certificates.map(cert => (
                <div 
                  key={cert.id} 
                  className="glass-card rounded-2xl p-6 border border-white/[0.04] hover:border-emerald-500/20 transition-all duration-300 flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="space-y-3.5 flex-grow">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                      <Award className="w-3 h-3" />
                      <span>{cert.issuingOrganization}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{cert.name}</h3>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-mono text-slate-500">
                      <span>Issued: {cert.issueDate}</span>
                      <span>•</span>
                      <span>Expires: {cert.expirationDate || 'Never'}</span>
                    </div>

                    {cert.credentialId && (
                      <div className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded inline-block border border-white/[0.04]">
                        ID: {cert.credentialId}
                      </div>
                    )}
                  </div>

                  {cert.credentialUrl && (
                    <div className="md:self-center shrink-0">
                      <a 
                        href={cert.credentialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-white/[0.08] hover:border-emerald-500/30 bg-white/[0.02] hover:bg-emerald-500/5 text-slate-300 hover:text-emerald-400 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <span>Verify Credentials</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Achievements & Milestones Section */}
          <motion.section 
            id="achievements" 
            className="space-y-12 scroll-mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div className="space-y-2.5">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Proven Milestones</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">Achievements & Awards</h2>
              <div className="h-0.5 w-12 bg-emerald-500/60 rounded" />
            </div>

            {/* Category Filter Pills */}
            {achievementCategories.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {achievementCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedAchievementCategory(cat)}
                    className={`px-3.5 py-1.5 text-[10px] font-mono font-bold tracking-wider rounded-xl border transition-all cursor-pointer uppercase ${
                      selectedAchievementCategory === cat
                        ? 'bg-emerald-500 text-slate-950 border-transparent shadow-lg shadow-emerald-500/15'
                        : 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedAchievementForModal(item)}
                  className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col justify-between ${
                    item.featured 
                      ? 'border-emerald-500/30 bg-emerald-500/[0.01] hover:border-emerald-500/50 shadow-2xl shadow-emerald-500/5' 
                      : 'border-white/[0.04] bg-slate-900/40 hover:bg-slate-900/60 hover:border-white/[0.1]'
                  }`}
                >
                  {/* Card Banner Image / Header */}
                  <div className="relative h-44 bg-slate-950/60 flex items-center justify-center overflow-hidden border-b border-white/[0.04]">
                    {item.imageUrl ? (
                      <SkillMediaRenderer 
                        src={item.imageUrl} 
                        alt={item.title} 
                        variant="cover"
                        className="group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="text-center p-6 text-slate-700 group-hover:text-slate-500 transition-colors">
                        <Award className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <span className="text-[10px] font-mono tracking-wider">Milestone asset</span>
                      </div>
                    )}

                    {/* Gradient atmosphere overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/30 to-transparent" />

                    {/* Badge Pill layout */}
                    <div className="absolute top-3.5 right-3.5 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] font-mono font-bold tracking-wider bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                        {item.category}
                      </span>
                      {item.featured && (
                        <span className="text-[9px] font-bold tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5 shadow-lg shadow-emerald-500/20">
                          <Sparkles className="w-2.5 h-2.5" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Organization Logo and details */}
                    <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center overflow-hidden shrink-0">
                        {item.logoUrl ? (
                          <img src={item.logoUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <Award className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono text-slate-300 font-semibold leading-none truncate">{item.organization}</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5 leading-none">
                          {new Date(item.achievementDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      {item.badge && (
                        <span className="inline-block text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.2 rounded font-mono font-bold uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-[10px] font-mono text-emerald-400 leading-tight">
                          {item.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {item.shortDescription}
                      </p>
                    </div>

                    {/* Footer tags */}
                    <div className="space-y-2.5 pt-3 border-t border-white/[0.04]">
                      {item.skills && item.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.skills.slice(0, 3).map((sk, i) => (
                            <span key={i} className="text-[8px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-white/[0.04]">
                              {sk}
                            </span>
                          ))}
                          {item.skills.length > 3 && (
                            <span className="text-[8px] font-mono text-slate-500 px-1 py-0.5">
                              +{item.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {item.technologies && item.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[8px] font-mono text-slate-600">Tech:</span>
                          {item.technologies.slice(0, 3).map((tc, i) => (
                            <span key={i} className="text-[8px] font-mono text-slate-400 px-1 py-0.2 bg-white/[0.02] border border-white/[0.04] rounded">
                              {tc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Client & Peer Testimonials Section */}
          {displayTestimonials.length > 0 && (
            <motion.section 
              id="testimonials" 
              className="space-y-8 scroll-mt-24 relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
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
                  {displayTestimonials[activeTestimonialIndex] && (() => {
                    const currentTestimonial = displayTestimonials[activeTestimonialIndex];
                    return (
                      <motion.div
                        key={currentTestimonial.id}
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
                                {currentTestimonial.authorAvatarUrl ? (
                                  <img
                                    src={currentTestimonial.authorAvatarUrl}
                                    alt={currentTestimonial.authorName}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-emerald-400 bg-emerald-500/10">
                                    {currentTestimonial.authorName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              {currentTestimonial.verifiedOnLinkedIn && (
                                <div className="absolute -bottom-2 -right-2 bg-[#0A66C2] text-white p-1.5 rounded-lg shadow-md" title="Verified LinkedIn Recommendation">
                                  <Linkedin className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <h3 className="text-lg font-bold text-white font-display">
                                  {currentTestimonial.authorName}
                                </h3>
                                {currentTestimonial.linkedInUrl && (
                                  <a
                                    href={currentTestimonial.linkedInUrl}
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
                                {currentTestimonial.authorTitle}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400">
                                {currentTestimonial.authorCompany}
                              </p>
                            </div>

                            {currentTestimonial.relationship && (
                              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                {currentTestimonial.relationship}
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
                                    idx < currentTestimonial.rating
                                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                                      : 'text-slate-700'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-mono text-slate-400 ml-2 font-bold">
                                {currentTestimonial.rating}.0 / 5.0
                              </span>
                            </div>

                            <blockquote className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans italic">
                              "{currentTestimonial.content}"
                            </blockquote>

                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-3 border-t border-white/[0.04]">
                              <span>Endorsement Date: {new Date(currentTestimonial.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
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
            className="space-y-12 scroll-mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div className="space-y-2.5">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">{profile?.contactSubheading || "Establish Connection"}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white tracking-wide">{profile?.contactHeading || "Write to Node Core"}</h2>
              <div className="h-0.5 w-12 bg-emerald-500/60 rounded" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Info panel */}
              <div className="lg:col-span-5 glass-card rounded-2xl p-8 border border-white/[0.04] space-y-6">
                <h3 className="text-lg font-bold font-display text-white">{profile?.contactFormTitle || "Let's coordinate on new paradigms"}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {profile?.contactDescription || "Have an open enterprise role, a microservices system challenge, or want to collaborate on clean-architecture solutions? Send an inquiry."}
                </p>

                <div className="space-y-4 pt-4 border-t border-white/[0.05] text-xs font-mono">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>{profile?.email || "alex.dev@stanford.edu"}</span>
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
                    <span>{profile?.location ? `${profile.location}, ${profile.country}` : "San Francisco Bay Area, CA"}</span>
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

                <div className="bg-slate-950 p-4 rounded-xl border border-white/[0.02] space-y-2 text-[10px] font-mono">
                  <span className="text-emerald-400 block font-bold">ACTIVE API STATUS:</span>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span>REST Pool: ONLINE</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span>Cascade Purge Hooks: ATTACHED</span>
                  </div>

                  {socialLinks.filter(l => l.showInSystemConsole === true).length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                      <span className="text-[9px] text-slate-500 font-mono uppercase font-bold tracking-wider">Console Telemetry Channels:</span>
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
              <div className="lg:col-span-7 glass-card rounded-2xl p-8 border border-white/[0.04]">
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-900 border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/40 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Your Email</label>
                      <input 
                        type="email" 
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-slate-900 border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="Enterprise Integration Consulting"
                      className="w-full bg-slate-900 border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/40 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Message content</label>
                    <textarea 
                      required
                      rows={4}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Describe your project, technology stack requirements, or collaboration details..."
                      className="w-full bg-slate-900 border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/40 transition-colors resize-none"
                    />
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Message successfully written to server REST repository!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {formLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Sending Transaction...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Inbound Message</span>
                      </>
                    )}
                  </button>
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
            className={`border-t border-white/[0.04] py-8 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 text-[10px] font-mono text-slate-500 relative overflow-hidden transition-all duration-500 ${
              footer?.backgroundType === 'gradient' 
                ? 'bg-gradient-to-b from-slate-950 to-slate-900' 
                : 'bg-slate-950'
            }`}
            style={footer?.backgroundType === 'image' && footer?.customBackgroundUrl ? {
              backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.95), rgba(2, 6, 23, 0.9)), url(${footer.customBackgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : undefined}
          >
            {theme?.footerBackground?.enabled && (
              <DynamicBackground bg={theme.footerBackground} gradientStart={theme.gradientStart} gradientEnd={theme.gradientEnd} />
            )}
            <div className="w-full max-w-[1536px] 2xl:max-w-[1600px] mx-auto relative z-10 space-y-10 sm:space-y-12">
              {/* Top Section - 3 balanced columns */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 xl:gap-16 text-left items-start">
                
                {/* Column 1 - Profile / Identity */}
                <div className="md:col-span-12 lg:col-span-5 xl:col-span-5 flex flex-col items-start space-y-4">
                  <div className="flex items-center gap-3">
                    {profile?.profileImage ? (
                      <img 
                        src={profile.profileImage} 
                        alt={profile?.fullName || "Avatar"} 
                        className="w-12 h-12 rounded-full object-cover border border-white/[0.08] shadow-md shadow-emerald-500/5 shrink-0" 
                        referrerPolicy="no-referrer" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-luxury font-bold text-emerald-400 text-base shrink-0">
                        {(profile?.fullName || "Chandru Mohan")[0]}
                      </div>
                    )}
                    
                    <div className="space-y-0.5">
                      <h4 className="text-base font-sans font-extrabold text-slate-100 tracking-tight">
                        {profile?.fullName || "Chandru Mohan"}
                      </h4>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider block">
                        {profile?.title || "Systems Architect"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-md">
                    {profile?.shortIntroduction || footer?.description || "I design and build resilient cloud systems, real-time analytics engines, and gorgeous web-based developer interfaces that scale dynamically."}
                  </p>

                  <div className="space-y-2 pt-1 font-mono text-[11px] text-slate-400">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{profile?.location ? `${profile.location}, ${profile.country || 'India'}` : "Bengaluru, Karnataka, India"}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{profile?.email || "chandrumohan550@gmail.com"}</span>
                    </div>
                  </div>
                </div>

                {/* Column 2 - Quick Links */}
                <div className="md:col-span-6 lg:col-span-3 xl:col-span-3 flex flex-col items-start space-y-4">
                  <h5 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Quick Links
                  </h5>
                  <nav className="grid grid-cols-2 lg:grid-cols-2 gap-2.5 text-xs font-medium text-slate-400 w-full">
                    <a href="#about" onClick={(e) => handleNavLinkClick(e, 'about')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> About
                    </a>
                    <a href="#projects" onClick={(e) => handleNavLinkClick(e, 'projects')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Projects
                    </a>
                    <a href="#articles" onClick={(e) => handleNavLinkClick(e, 'articles')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Articles & Blog
                    </a>
                    <a href="#coding-profiles" onClick={(e) => handleNavLinkClick(e, 'coding-profiles')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Coding Profiles
                    </a>
                    <a href="#skills" onClick={(e) => handleNavLinkClick(e, 'skills')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Skills
                    </a>
                    <a href="#tools" onClick={(e) => handleNavLinkClick(e, 'tools')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Tools
                    </a>
                    <a href="#timeline" onClick={(e) => handleNavLinkClick(e, 'timeline')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Experience
                    </a>
                    <a href="#education" onClick={(e) => handleNavLinkClick(e, 'education')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Education
                    </a>
                    <a href="#credentials" onClick={(e) => handleNavLinkClick(e, 'credentials')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Certificates
                    </a>
                    <a href="#achievements" onClick={(e) => handleNavLinkClick(e, 'achievements')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Achievements
                    </a>
                    <a href="#testimonials" onClick={(e) => handleNavLinkClick(e, 'testimonials')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Testimonials
                    </a>
                    <a href="#contact" onClick={(e) => handleNavLinkClick(e, 'contact')} className="hover:text-emerald-400 transition-colors w-fit flex items-center gap-1.5 cursor-pointer">
                      <span className="text-slate-600 text-[10px]">→</span> Contact
                    </a>
                  </nav>
                </div>

                {/* Column 3 - Connect & Resume */}
                <div className="md:col-span-6 lg:col-span-4 xl:col-span-4 flex flex-col items-start space-y-4">
                  <h5 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Connect & Resume
                  </h5>
                  
                  <div className="w-full bg-white/[0.015] border border-white/[0.05] rounded-2xl p-4 sm:p-5 space-y-4 backdrop-blur-sm shadow-xl shadow-black/20">
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
                            className={`w-9 h-9 rounded-xl border border-slate-700/60 bg-slate-900/90 text-slate-200 flex items-center justify-center transition-transform hover:scale-105 duration-200 shadow-md ${themeCls.bgHover} hover:text-white transition-colors`}
                            childrenClassName="w-4.5 h-4.5 object-contain"
                          />
                        ))}
                      </div>
                    )}

                    <div className="border-t border-white/[0.05] pt-3">
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
                          className={`w-full justify-center inline-flex px-4 py-2.5 border border-white/[0.08] bg-white/[0.02] text-slate-200 font-sans text-xs rounded-xl transition-all items-center gap-2 cursor-pointer hover:text-white hover:border-emerald-500/30 ${themeCls.bgHover} shadow-sm`}
                        >
                          <Download className={`w-3.5 h-3.5 ${themeCls.icon}`} />
                          <span className="font-semibold">{footer?.resumeText || "View Resume"}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.06] w-full" />

              {/* Bottom Footer Information Bar */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 pt-2">
                
                {/* Copyright + Technical Details */}
                <div className="flex flex-col gap-1 text-center lg:text-left">
                  <p className="text-[11px] text-slate-400 font-mono">
                    {footer?.copyrightText || `© 2026 ${profile?.fullName || "Chandru Mohan"} Portfolio. All database relations mapped to 3NF standards.`}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono">
                    {footer?.builtWithText || "Securely served from local sandbox cache. Admin actions synchronized with backend."}
                  </p>
                </div>

                {/* Right side: Analytics badges bar + Admin lock icon */}
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 sm:gap-4">
                  {/* Dedicated Analytics Badges Bar */}
                  <div className="flex items-center gap-2.5 bg-white/[0.02] border border-white/[0.05] px-3 py-1.5 rounded-xl shadow-inner text-[10px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Eye className={`w-3.5 h-3.5 ${themeCls.icon}`} />
                      <span>Views: <strong className="text-slate-200 font-semibold">{analytics?.pageViews ? analytics.pageViews.toLocaleString() : '12,450'}</strong></span>
                    </div>
                    <span className="text-white/10">|</span>
                    <div className="flex items-center gap-1.5">
                      <Users className={`w-3.5 h-3.5 ${themeCls.icon}`} />
                      <span>Visitors: <strong className="text-slate-200 font-semibold">{analytics?.uniqueVisitors ? analytics.uniqueVisitors.toLocaleString() : '4,120'}</strong></span>
                    </div>
                  </div>

                  {/* Admin Lock Button */}
                  <button 
                    onClick={onEnterCMS} 
                    className="group relative p-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-300 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] cursor-pointer"
                    title="Admin Access"
                    aria-label="Admin Access"
                  >
                    <Lock className="w-4 h-4" />
                    <span className="absolute bottom-full right-0 mb-2 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 border border-slate-800 text-slate-200 text-[9px] font-mono py-1 px-2 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                      Admin Access
                    </span>
                  </button>
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
                          src={selectedProjectForModal.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80"}
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
                  <div className="bg-slate-950/40 border border-white/[0.04] rounded-2xl p-4 space-y-3 font-mono text-xs text-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold font-semibold">Ledger Attributes</span>
                    
                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">Initiated:</span>
                      <span className="font-semibold text-slate-200">{selectedProjectForModal.startDate}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">Completed:</span>
                      <span className="font-semibold text-emerald-400">{selectedProjectForModal.endDate || 'Ongoing Lifecycle'}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-white/[0.02]">
                      <span className="text-slate-500">Sequence Index:</span>
                      <span className="font-semibold text-slate-200">{selectedProjectForModal.displayOrder}</span>
                    </div>

                    {selectedProjectForModal.createdAt && (
                      <div className="flex justify-between py-1.5 text-[11px] text-slate-500">
                        <span>Database commit:</span>
                        <span className="truncate max-w-[150px]" title={selectedProjectForModal.createdAt}>
                          {selectedProjectForModal.createdAt.substring(0, 10)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project description */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold font-semibold">Systems Architecture Scope</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {selectedProjectForModal.description}
                    </p>
                  </div>

                  {/* Tech stack */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold font-semibold">Integrated Core Technologies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProjectForModal.skills.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[9.5px] font-mono bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 px-2.5 py-1 rounded"
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
              <span className="text-[10px] font-mono text-slate-500">
                Data securely synchronized from Spring REST endpoint
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

      {/* Full-Screen Article Reader Modal */}
      <AnimatePresence>
        {selectedArticleForModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
            >
              {/* Modal Header */}
              <div className="relative h-48 sm:h-64 bg-slate-950 shrink-0 overflow-hidden">
                {selectedArticleForModal.coverImage ? (
                  <img
                    src={selectedArticleForModal.coverImage}
                    alt={selectedArticleForModal.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                    <BookOpenCheck className="w-16 h-16 text-emerald-400/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                <button
                  onClick={() => setSelectedArticleForModal(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/[0.1] text-slate-300 hover:text-white hover:border-emerald-500/50 transition-all cursor-pointer z-10"
                  aria-label="Close Article Reader"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500 text-slate-950 uppercase">
                      {selectedArticleForModal.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-950/80 text-slate-300 border border-white/[0.1] flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {selectedArticleForModal.readTimeMinutes} min read
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-950/80 text-slate-300 border border-white/[0.1] flex items-center gap-1.5">
                      <Eye className="w-3 h-3 text-emerald-400" />
                      {selectedArticleForModal.viewsCount || 342} views
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-luxury leading-tight">
                    {selectedArticleForModal.title}
                  </h1>
                </div>
              </div>

              {/* Modal Body / Article Content */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
                {/* Author Card */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-900 shrink-0">
                      {profile?.profileImage ? (
                        <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-emerald-400 flex items-center justify-center h-full">C</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedArticleForModal.authorName || "Chandru Mohan"}</h4>
                      <p className="text-[11px] font-mono text-emerald-400">Principal Systems Architect & Full Stack Java Developer</p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-400 hidden sm:block">
                    <p>Published: {new Date(selectedArticleForModal.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Article Markdown Renderer */}
                <div className="max-w-none space-y-4 text-slate-300 text-sm leading-relaxed font-sans">
                  {selectedArticleForModal.content.split('\n\n').map((block, idx) => {
                    if (block.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-lg font-bold text-emerald-400 mt-6 mb-2 font-display">
                          {block.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (block.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="text-xl font-extrabold text-white mt-8 mb-3 font-display border-b border-white/[0.06] pb-2">
                          {block.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (block.startsWith('# ')) {
                      return (
                        <h1 key={idx} className="text-2xl font-black text-white mt-6 mb-4 font-display">
                          {block.replace('# ', '')}
                        </h1>
                      );
                    }
                    if (block.startsWith('```')) {
                      const lines = block.split('\n');
                      const lang = lines[0].replace('```', '') || 'code';
                      const codeContent = lines.slice(1, lines.length - 1).join('\n');
                      return (
                        <div key={idx} className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center justify-between">
                            <span>{lang} snippet</span>
                            <span className="text-slate-500">production code</span>
                          </div>
                          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                            <code>{codeContent}</code>
                          </pre>
                        </div>
                      );
                    }
                    if (block.startsWith('- ') || block.startsWith('* ')) {
                      const items = block.split('\n').filter(Boolean);
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
                          {items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-xs leading-relaxed">
                              {item.replace(/^[-*]\s+/, '')}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {block}
                      </p>
                    );
                  })}
                </div>

                {/* Article Footer Tags */}
                {selectedArticleForModal.tags && selectedArticleForModal.tags.length > 0 && (
                  <div className="pt-6 border-t border-white/[0.06] space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-bold">Related Topics & Skills:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticleForModal.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-950 text-emerald-400 border border-emerald-500/20">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedArticleForModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ← Close Article
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        setFeedbackToast('Article link copied to clipboard!');
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

        {/* Floating Developer Terminal Launcher (Ctrl+K) */}
        <div className="fixed bottom-4 left-4 z-[90] flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-3.5 sm:py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800/95 border border-slate-700/80 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 text-xs font-mono font-bold shadow-2xl backdrop-blur-xl transition-all duration-200 cursor-pointer group"
            title="Open Developer Terminal (Ctrl+K)"
          >
            <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 group-hover:rotate-6 transition-transform" />
            <span className="text-[11px] sm:text-xs font-mono font-bold hidden sm:inline">CLI Terminal</span>
            <span className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800 hidden md:inline">
              Ctrl+K
            </span>
          </motion.button>
        </div>

        {/* Developer CLI Terminal Modal (loaded strictly on open) */}
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
          />
        )}
      </React.Suspense>

    </div>
  );
}

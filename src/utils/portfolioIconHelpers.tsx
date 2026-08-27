/**
 * portfolioIconHelpers.ts
 * 
 * Lightweight icon-mapping utilities extracted from the heavy admin pages
 * (SocialLinksPage, CodingProfilesPage, ToolsPage, PortfolioMetricsPage)
 * to prevent the 265 KB+ admin module tree from being bundled into the 
 * public portfolio critical path.
 */
import React from 'react';
import { 
  Linkedin, Github, Instagram, Twitter, Youtube, Mail, Code2, 
  Terminal, Braces, Activity, BookOpen, Layers, Globe, Link as LinkIcon,
  Cpu, Award, BarChart2, Wrench, FileCode, Atom, Server, Database, 
  Box, Cloud, GitBranch, Send, Figma, Sparkles, Shield, Eye, Users,
  Briefcase, Zap, Trophy, Star, Flame, Target, Rocket, CheckCircle2,
  Layout, TrendingUp, BarChart3
} from 'lucide-react';

// ── Social Links Platform → Icon mapping ──
export const getPlatformIconComponent = (platform: string) => {
  switch (platform) {
    case 'LinkedIn': return Linkedin;
    case 'GitHub': return Github;
    case 'Instagram': return Instagram;
    case 'X (Twitter)': return Twitter;
    case 'Twitter/X': return Twitter;
    case 'YouTube': return Youtube;
    case 'Email': return Mail;
    case 'LeetCode': return Code2;
    case 'HackerRank': return Terminal;
    case 'CodeChef': return Braces;
    case 'Codeforces': return Activity;
    case 'Medium': return BookOpen;
    case 'Dev.to': return Layers;
    case 'Portfolio': return Globe;
    default: return LinkIcon;
  }
};

// ── Coding Profiles Platform → Icon mapping ──
export const getCodingPlatformIconComponent = (platform: string) => {
  switch (platform) {
    case 'GitHub': return Github;
    case 'LeetCode': return Code2;
    case 'GeeksforGeeks': return Cpu;
    case 'Codeforces': return Activity;
    case 'CodeChef': return Braces;
    case 'HackerRank': return Terminal;
    case 'HackerEarth': return Layers;
    case 'AtCoder': return BarChart2;
    case 'TopCoder': return Award;
    default: return LinkIcon;
  }
};

// ── Tool Icon Renderer ──
interface ToolItem {
  logoType?: string;
  logoUrl?: string;
  customSvg?: string;
  iconName?: string;
  logoSize?: number;
  brandColor?: string;
  name?: string;
}

export const ToolIconRenderer: React.FC<{
  tool: Partial<ToolItem>;
  className?: string;
}> = ({ tool, className = "" }) => {
  const logoType = tool.logoType || 'icon';
  const size = tool.logoSize || 28;

  if (logoType === 'upload' || logoType === 'url') {
    if (tool.logoUrl) {
      return React.createElement('img', {
        src: tool.logoUrl,
        alt: tool.name || 'Tool Logo',
        className: `object-contain ${className}`,
        style: { width: `${size}px`, height: `${size}px` },
        referrerPolicy: 'no-referrer',
        loading: 'lazy',
        decoding: 'async',
        onError: (e: any) => { (e.target as HTMLElement).style.display = 'none'; }
      });
    }
  }

  if (logoType === 'svg' && tool.customSvg) {
    return React.createElement('div', {
      className: `flex items-center justify-center ${className}`,
      style: { width: `${size}px`, height: `${size}px` },
      dangerouslySetInnerHTML: { __html: tool.customSvg }
    });
  }

  const iconName = tool.iconName || 'Wrench';
  const iconProps = {
    style: { width: `${size}px`, height: `${size}px`, color: tool.brandColor || '#10B981' },
    className: className
  };

  const toolIconMap: Record<string, React.ComponentType<any>> = {
    Code2, FileCode, Atom, Server, Database, Box, Cloud,
    GitBranch, Send, Figma, Sparkles, Terminal, Cpu, Shield,
    Globe, Layers, Wrench
  };
  const Icon = toolIconMap[iconName] || Wrench;
  return React.createElement(Icon, iconProps);
};

// ── Metric Color Accents ──
export const COLOR_ACCENTS: Record<string, {
  name: string;
  bg: string;
  border: string;
  text: string;
  glow: string;
  badgeBg: string;
}> = {
  emerald: { name: "Emerald Green", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]", badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  blue: { name: "Electric Blue", bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]", badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  purple: { name: "Cyber Purple", bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]", badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  amber: { name: "Solar Amber", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]", badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  cyan: { name: "Neon Cyan", bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", glow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]", badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  rose: { name: "Radiant Rose", bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", glow: "shadow-[0_0_20px_rgba(244,63,94,0.2)]", badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  indigo: { name: "Deep Indigo", bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", glow: "shadow-[0_0_20px_rgba(99,102,241,0.2)]", badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  teal: { name: "Aqua Teal", bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-400", glow: "shadow-[0_0_20px_rgba(20,184,166,0.2)]", badgeBg: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  violet: { name: "Ultra Violet", bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400", glow: "shadow-[0_0_20px_rgba(139,92,246,0.2)]", badgeBg: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
};

// ── Metric Icon Renderer ──
interface MetricItemPartial {
  iconType?: string;
  icon?: string;
  customSvg?: string;
  title?: string;
}

export const MetricIconRenderer: React.FC<{
  metric: Partial<MetricItemPartial>;
  className?: string;
}> = ({ metric, className = "w-5 h-5" }) => {
  const iconType = metric.iconType || 'lucide';
  const iconName = metric.icon || 'BarChart3';

  if (iconType === 'url' && metric.icon) {
    return React.createElement('img', {
      src: metric.icon,
      alt: metric.title || 'Icon',
      className: `${className} object-contain rounded`,
      loading: 'lazy',
      decoding: 'async'
    });
  }

  if (iconType === 'svg' && metric.customSvg) {
    return React.createElement('div', {
      className: `${className} flex items-center justify-center fill-current`,
      dangerouslySetInnerHTML: { __html: metric.customSvg }
    });
  }

  const metricIconMap: Record<string, React.ComponentType<any>> = {
    Eye, Users, Briefcase, Code2, GitBranch, Award, Cpu, Zap,
    Trophy, Star, Shield, Terminal, Globe, Flame, Target, Rocket,
    Activity, CheckCircle2, Layout, Database, Layers, Sparkles,
    TrendingUp, BarChart3
  };
  const Icon = metricIconMap[iconName] || BarChart3;
  return React.createElement('span', { className: 'inline-flex items-center justify-center' },
    React.createElement(Icon, { className })
  );
};

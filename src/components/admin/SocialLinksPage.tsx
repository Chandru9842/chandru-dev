import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Move, Save, X, AlertCircle,
  Linkedin, Github, Instagram, Twitter, Youtube, Mail, Code2, 
  Terminal, Award, Cpu, Braces, Activity, BookOpen, Layers, Globe, Link as LinkIcon, ExternalLink, HelpCircle,
  CheckCircle2, Info, Copy, Archive, Upload, Download, RefreshCw, Sparkles, Check,
  Search, Filter, RotateCcw, Monitor, Smartphone, Tablet, Sun, Moon, Image as ImageIcon,
  ShieldCheck, Zap, BarChart2, MousePointer, Lock, MessageSquare, Star, GitFork, Users, Tag,
  ChevronRight, Sliders, Palette, Compass, Crop, Maximize2, FileText, Share2, Layers3, Flame
} from 'lucide-react';
import { SocialLinkItem } from '../../data/cmsMockData';

// Dynamic Lucide platform mapping helper
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

// Platform color mapping helper
export const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'LinkedIn': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'GitHub': return 'text-slate-200 bg-slate-800/20 border-slate-700/30';
    case 'Instagram': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
    case 'X (Twitter)': 
    case 'Twitter/X': return 'text-sky-300 bg-sky-400/10 border-sky-400/20';
    case 'YouTube': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    case 'Email': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'LeetCode': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'HackerRank': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'CodeChef': return 'text-amber-600 bg-amber-600/10 border-amber-600/20';
    case 'Codeforces': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'Medium': return 'text-neutral-200 bg-neutral-800/20 border-neutral-700/30';
    case 'Dev.to': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
    case 'Portfolio': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    default: return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
  }
};

interface SocialLinksPageProps {
  socialLinks: SocialLinkItem[];
  onAdd: (social: Omit<SocialLinkItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (social: SocialLinkItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleVisibility: (id: number, isVisible: boolean) => Promise<void>;
  onReorder: (reorderedList: SocialLinkItem[]) => Promise<void>;
}

export default function SocialLinksPage({
  socialLinks,
  onAdd,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onReorder
}: SocialLinksPageProps) {
  // Platforms Enum
  const platformsList = [
    'LinkedIn', 'GitHub', 'LeetCode', 'HackerRank', 'CodeChef', 'Codeforces',
    'GeeksforGeeks', 'Twitter/X', 'Instagram', 'Facebook', 'YouTube', 'Discord',
    'Dev.to', 'Medium', 'Hashnode', 'Portfolio', 'Resume', 'Email', 'WhatsApp',
    'Telegram', 'Custom Platform'
  ];

  // Editor Tabs
  type TabType = 'info' | 'branding' | 'media' | 'visibility' | 'card' | 'links' | 'fx' | 'seo' | 'analytics';
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSection, setFilterSection] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form Mode
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Core Fields
  const [platform, setPlatform] = useState<string>('GitHub');
  const [customPlatformName, setCustomPlatformName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [darkLogoUrl, setDarkLogoUrl] = useState<string>('');
  const [lightLogoUrl, setLightLogoUrl] = useState<string>('');
  const [monochromeLogoUrl, setMonochromeLogoUrl] = useState<string>('');
  const [customSvg, setCustomSvg] = useState<string>('');
  const [tooltip, setTooltip] = useState<string>('');
  const [openInNewTab, setOpenInNewTab] = useState<boolean>(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Profile Info
  const [displayName, setDisplayName] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('');
  const [profileTitle, setProfileTitle] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Developer');
  const [status, setStatus] = useState<string>('Active');
  const [verifiedBadge, setVerifiedBadge] = useState<boolean>(true);
  const [followers, setFollowers] = useState<string>('12.5k');
  const [following, setFollowing] = useState<string>('450');
  const [repositories, setRepositories] = useState<string>('84');
  const [stars, setStars] = useState<string>('1.2k');
  const [customStats, setCustomStats] = useState<{ label: string; value: string }[]>([
    { label: 'Contributions', value: '2,450' }
  ]);

  // Branding Colors
  const [brandColor, setBrandColor] = useState<string>('#10b981');
  const [backgroundColor, setBackgroundColor] = useState<string>('#020617');
  const [borderColor, setBorderColor] = useState<string>('#1e293b');
  const [hoverColor, setHoverColor] = useState<string>('#059669');
  const [textColor, setTextColor] = useState<string>('#f8fafc');
  const [accentColor, setAccentColor] = useState<string>('#34d399');

  // Media & Images
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [bannerImageUrl, setBannerImageUrl] = useState<string>('');
  const [imageScale, setImageScale] = useState<number>(100);
  const [imageRotate, setImageRotate] = useState<number>(0);

  // Independent Section Visibilities
  const [showInCoordinates, setShowInCoordinates] = useState<boolean>(true);
  const [showInDynamicProfile, setShowInDynamicProfile] = useState<boolean>(true);
  const [showInContact, setShowInContact] = useState<boolean>(true);
  const [showInFooter, setShowInFooter] = useState<boolean>(true);
  const [showInNavigation, setShowInNavigation] = useState<boolean>(true);
  const [showInHeroCard, setShowInHeroCard] = useState<boolean>(true);
  const [showInAbout, setShowInAbout] = useState<boolean>(true);
  const [showInProjects, setShowInProjects] = useState<boolean>(true);
  const [showInResume, setShowInResume] = useState<boolean>(true);
  const [showInSystemConsole, setShowInSystemConsole] = useState<boolean>(true);
  const [showInHero, setShowInHero] = useState<boolean>(false);

  // Profile Card
  const [enableProfileCard, setEnableProfileCard] = useState<boolean>(true);
  const [cardTitle, setCardTitle] = useState<string>('');
  const [cardSubtitle, setCardSubtitle] = useState<string>('');
  const [cardDescription, setCardDescription] = useState<string>('');
  const [ctaButtonText, setCtaButtonText] = useState<string>('Connect');
  const [profileBadge, setProfileBadge] = useState<string>('Official Channel');
  const [statusIndicator, setStatusIndicator] = useState<string>('Active');
  const [onlineIndicator, setOnlineIndicator] = useState<boolean>(true);
  const [featuredBadge, setFeaturedBadge] = useState<boolean>(false);

  // Links & Buttons
  const [secondaryUrl, setSecondaryUrl] = useState<string>('');
  const [documentationUrl, setDocumentationUrl] = useState<string>('');
  const [communityUrl, setCommunityUrl] = useState<string>('');
  const [supportUrl, setSupportUrl] = useState<string>('');
  const [blogUrl, setBlogUrl] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [buttonText, setButtonText] = useState<string>('Visit Profile');
  const [buttonIcon, setButtonIcon] = useState<string>('ExternalLink');
  const [buttonStyle, setButtonStyle] = useState<'filled' | 'outline' | 'ghost' | 'gradient' | 'glass'>('filled');

  // FX & Animations
  const [hoverEffect, setHoverEffect] = useState<'glow' | 'lift' | 'scale' | 'rotate' | 'shadow' | 'glass' | 'border'>('glow');
  const [animationEffect, setAnimationEffect] = useState<'fade' | 'slide' | 'zoom' | 'bounce' | 'framer'>('fade');

  // SEO
  const [seoTitle, setSeoTitle] = useState<string>('');
  const [seoDescription, setSeoDescription] = useState<string>('');
  const [seoKeywords, setSeoKeywords] = useState<string>('');
  const [ogImageUrl, setOgImageUrl] = useState<string>('');
  const [twitterImageUrl, setTwitterImageUrl] = useState<string>('');

  // Analytics
  const [clicks, setClicks] = useState<number>(142);
  const [ctr, setCtr] = useState<number>(4.8);
  const [visitors, setVisitors] = useState<number>(2950);
  const [lastClicked, setLastClicked] = useState<string>('12 mins ago');
  const [topReferrer, setTopReferrer] = useState<string>('Direct / Portfolio');

  // Archive state
  const [isArchived, setIsArchived] = useState<boolean>(false);

  // UI States
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [previewSectionTab, setPreviewSectionTab] = useState<string>('Coordinates');

  // Undo/Redo/Autosave History Stack
  const [historyStack, setHistoryStack] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File Input Hidden Refs
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setPlatform('GitHub');
    setCustomPlatformName('');
    setUsername('');
    setProfileUrl('');
    setLogoUrl('');
    setDarkLogoUrl('');
    setLightLogoUrl('');
    setMonochromeLogoUrl('');
    setCustomSvg('');
    setTooltip('');
    setOpenInNewTab(true);
    setDisplayOrder((socialLinks?.length || 0) + 1);
    setIsVisible(true);

    setDisplayName('');
    setProfileName('');
    setProfileTitle('');
    setShortDescription('');
    setCategory('Developer');
    setStatus('Active');
    setVerifiedBadge(true);
    setFollowers('12.5k');
    setFollowing('450');
    setRepositories('84');
    setStars('1.2k');
    setCustomStats([{ label: 'Contributions', value: '2,450' }]);

    setBrandColor('#10b981');
    setBackgroundColor('#020617');
    setBorderColor('#1e293b');
    setHoverColor('#059669');
    setTextColor('#f8fafc');
    setAccentColor('#34d399');

    setAvatarUrl('');
    setCoverImageUrl('');
    setBannerImageUrl('');
    setImageScale(100);
    setImageRotate(0);

    setShowInCoordinates(true);
    setShowInDynamicProfile(true);
    setShowInContact(true);
    setShowInFooter(true);
    setShowInNavigation(true);
    setShowInHeroCard(true);
    setShowInAbout(true);
    setShowInProjects(true);
    setShowInResume(true);
    setShowInSystemConsole(true);
    setShowInHero(false);

    setEnableProfileCard(true);
    setCardTitle('');
    setCardSubtitle('');
    setCardDescription('');
    setCtaButtonText('Connect');
    setProfileBadge('Official Channel');
    setStatusIndicator('Active');
    setOnlineIndicator(true);
    setFeaturedBadge(false);

    setSecondaryUrl('');
    setDocumentationUrl('');
    setCommunityUrl('');
    setSupportUrl('');
    setBlogUrl('');
    setPortfolioUrl('');
    setButtonText('Visit Profile');
    setButtonIcon('ExternalLink');
    setButtonStyle('filled');

    setHoverEffect('glow');
    setAnimationEffect('fade');

    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setOgImageUrl('');
    setTwitterImageUrl('');

    setClicks(0);
    setCtr(0);
    setVisitors(0);
    setLastClicked('Never');
    setTopReferrer('Direct');
    setIsArchived(false);

    setFormErrors({});
  };

  // Populate form for Editing
  const populateForm = (link: SocialLinkItem) => {
    setIsEditing(true);
    setEditId(link.id);

    const isStd = platformsList.includes(link.platform) && link.platform !== 'Custom Platform';
    setPlatform(isStd ? link.platform : 'Custom Platform');
    setCustomPlatformName(isStd ? '' : link.platform);

    setUsername(link.username || '');
    setProfileUrl(link.profileUrl || '');
    setLogoUrl(link.logoUrl || '');
    setDarkLogoUrl(link.darkLogoUrl || '');
    setLightLogoUrl(link.lightLogoUrl || '');
    setMonochromeLogoUrl(link.monochromeLogoUrl || '');
    setCustomSvg(link.customSvg || '');
    setTooltip(link.tooltip || '');
    setOpenInNewTab(link.openInNewTab !== false);
    setDisplayOrder(link.displayOrder || 1);
    setIsVisible(link.isVisible !== false);

    setDisplayName(link.displayName || link.platform);
    setProfileName(link.profileName || link.username || '');
    setProfileTitle(link.profileTitle || '');
    setShortDescription(link.shortDescription || '');
    setCategory(link.category || 'Developer');
    setStatus(link.status || 'Active');
    setVerifiedBadge(link.verifiedBadge !== false);
    setFollowers(String(link.followers || '0'));
    setFollowing(String(link.following || '0'));
    setRepositories(String(link.repositories || '0'));
    setStars(String(link.stars || '0'));
    setCustomStats(link.customStats || []);

    setBrandColor(link.brandColor || '#10b981');
    setBackgroundColor(link.backgroundColor || '#020617');
    setBorderColor(link.borderColor || '#1e293b');
    setHoverColor(link.hoverColor || '#059669');
    setTextColor(link.textColor || '#f8fafc');
    setAccentColor(link.accentColor || '#34d399');

    setAvatarUrl(link.avatarUrl || '');
    setCoverImageUrl(link.coverImageUrl || '');
    setBannerImageUrl(link.bannerImageUrl || '');

    setShowInCoordinates(link.showInCoordinates !== false);
    setShowInDynamicProfile(link.showInDynamicProfile !== false);
    setShowInContact(link.showInContact !== false);
    setShowInFooter(link.showInFooter !== false);
    setShowInNavigation(link.showInNavigation !== false);
    setShowInHeroCard(link.showInHeroCard !== false);
    setShowInAbout(link.showInAbout !== false);
    setShowInProjects(link.showInProjects !== false);
    setShowInResume(link.showInResume !== false);
    setShowInSystemConsole(link.showInSystemConsole === true);
    setShowInHero(link.showInHero === true);

    setEnableProfileCard(link.enableProfileCard !== false);
    setCardTitle(link.cardTitle || link.displayName || link.platform);
    setCardSubtitle(link.cardSubtitle || link.profileTitle || '');
    setCardDescription(link.cardDescription || link.shortDescription || '');
    setCtaButtonText(link.ctaButtonText || 'Connect');
    setProfileBadge(link.profileBadge || 'Official Channel');
    setStatusIndicator(link.statusIndicator || 'Active');
    setOnlineIndicator(link.onlineIndicator !== false);
    setFeaturedBadge(link.featuredBadge === true);

    setSecondaryUrl(link.secondaryUrl || '');
    setDocumentationUrl(link.documentationUrl || '');
    setCommunityUrl(link.communityUrl || '');
    setSupportUrl(link.supportUrl || '');
    setBlogUrl(link.blogUrl || '');
    setPortfolioUrl(link.portfolioUrl || '');
    setButtonText(link.buttonText || 'Visit Profile');
    setButtonIcon(link.buttonIcon || 'ExternalLink');
    setButtonStyle(link.buttonStyle || 'filled');

    setHoverEffect(link.hoverEffect || 'glow');
    setAnimationEffect(link.animationEffect || 'fade');

    setSeoTitle(link.seoTitle || '');
    setSeoDescription(link.seoDescription || '');
    setSeoKeywords(link.seoKeywords || '');
    setOgImageUrl(link.ogImageUrl || '');
    setTwitterImageUrl(link.twitterImageUrl || '');

    setClicks(link.clicks || 0);
    setCtr(link.ctr || 0);
    setVisitors(link.visitors || 0);
    setLastClicked(link.lastClicked || 'Recently');
    setTopReferrer(link.topReferrer || 'Direct');
    setIsArchived(link.isArchived === true);

    setFormErrors({});
  };

  // Image Upload Reader helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'avatar' | 'banner' | 'cover' | 'og') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'logo') setLogoUrl(dataUrl);
      if (target === 'avatar') setAvatarUrl(dataUrl);
      if (target === 'banner') setBannerImageUrl(dataUrl);
      if (target === 'cover') setCoverImageUrl(dataUrl);
      if (target === 'og') setOgImageUrl(dataUrl);
      triggerToast(`${target.toUpperCase()} image loaded.`);
    };
    reader.readAsDataURL(file);
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const finalPlatform = platform === 'Custom Platform' ? customPlatformName.trim() : platform;

    if (!finalPlatform) {
      setFormErrors({ platform: 'Platform name is required' });
      setIsSaving(false);
      return;
    }

    if (!profileUrl) {
      setFormErrors({ profileUrl: 'Profile URL is required' });
      setIsSaving(false);
      return;
    }

    const payload: Omit<SocialLinkItem, 'id' | 'createdAt' | 'updatedAt'> = {
      platform: finalPlatform,
      username: username.trim(),
      profileUrl: profileUrl.trim(),
      icon: finalPlatform,
      logoUrl,
      darkLogoUrl,
      lightLogoUrl,
      monochromeLogoUrl,
      customSvg,
      tooltip: tooltip || `${finalPlatform} Profile`,
      openInNewTab,
      displayOrder,
      isVisible,

      displayName: displayName || finalPlatform,
      profileName: profileName || username,
      profileTitle,
      shortDescription,
      category,
      status,
      verifiedBadge,
      followers,
      following,
      repositories,
      stars,
      customStats,

      brandColor,
      backgroundColor,
      borderColor,
      hoverColor,
      textColor,
      accentColor,

      avatarUrl,
      coverImageUrl,
      bannerImageUrl,

      showInCoordinates,
      showInDynamicProfile,
      showInContact,
      showInFooter,
      showInNavigation,
      showInHeroCard,
      showInAbout,
      showInProjects,
      showInResume,
      showInSystemConsole,
      showInHero,

      enableProfileCard,
      cardTitle: cardTitle || displayName || finalPlatform,
      cardSubtitle: cardSubtitle || profileTitle,
      cardDescription: cardDescription || shortDescription,
      ctaButtonText,
      profileBadge,
      statusIndicator,
      onlineIndicator,
      featuredBadge,

      secondaryUrl,
      documentationUrl,
      communityUrl,
      supportUrl,
      blogUrl,
      portfolioUrl,

      buttonText,
      buttonIcon,
      buttonStyle,

      hoverEffect,
      animationEffect,

      seoTitle,
      seoDescription,
      seoKeywords,
      ogImageUrl,
      twitterImageUrl,

      clicks,
      ctr,
      visitors,
      lastClicked,
      topReferrer,
      isArchived
    };

    try {
      if (isEditing && editId !== null) {
        const existing = socialLinks.find(s => s.id === editId);
        if (existing) {
          await onUpdate({
            ...existing,
            ...payload,
            updatedAt: new Date().toISOString()
          });
          triggerToast(`Profile for ${finalPlatform} updated!`);
        }
      } else {
        await onAdd(payload);
        triggerToast(`New Profile channel for ${finalPlatform} registered!`);
      }
      resetForm();
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Failed to save profile connection.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Clone / Duplicate
  const handleDuplicate = async (link: SocialLinkItem) => {
    const clonePayload: Omit<SocialLinkItem, 'id' | 'createdAt' | 'updatedAt'> = {
      ...link,
      platform: `${link.platform} (Copy)`,
      displayOrder: socialLinks.length + 1
    };
    await onAdd(clonePayload);
    triggerToast(`Cloned ${link.platform} channel.`);
  };

  // Archive toggle
  const handleArchive = async (link: SocialLinkItem) => {
    await onUpdate({
      ...link,
      isArchived: !link.isArchived,
      updatedAt: new Date().toISOString()
    });
    triggerToast(link.isArchived ? `Restored ${link.platform}` : `Archived ${link.platform}`);
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(socialLinks, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social_profiles_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    triggerToast('Exported social profiles JSON!');
  };

  // Import JSON
  const handleImportJsonSubmit = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) throw new Error('JSON must be an array of social profiles');
      for (const item of parsed) {
        if (item.platform && item.profileUrl) {
          await onAdd(item);
        }
      }
      setShowImportModal(false);
      setImportJsonText('');
      triggerToast('Imported social profiles successfully!');
    } catch (e: any) {
      alert(`Invalid JSON format: ${e.message}`);
    }
  };

  // Filtered profiles list
  const filteredLinks = useMemo(() => {
    return (socialLinks || []).filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        item.platform.toLowerCase().includes(q) ||
        (item.username && item.username.toLowerCase().includes(q)) ||
        (item.displayName && item.displayName.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));

      const matchCat = filterCategory === 'All' || item.category === filterCategory;
      const matchStatus = filterStatus === 'All' ? !item.isArchived : (filterStatus === 'Archived' ? item.isArchived : item.status === filterStatus);

      let matchSection = true;
      if (filterSection === 'Coordinates') matchSection = item.showInCoordinates !== false;
      if (filterSection === 'Dynamic Profile') matchSection = item.showInDynamicProfile !== false;
      if (filterSection === 'Contact') matchSection = item.showInContact !== false;
      if (filterSection === 'Footer') matchSection = item.showInFooter !== false;
      if (filterSection === 'Navigation') matchSection = item.showInNavigation !== false;
      if (filterSection === 'Hero Card') matchSection = item.showInHeroCard !== false;
      if (filterSection === 'About') matchSection = item.showInAbout !== false;
      if (filterSection === 'Projects') matchSection = item.showInProjects !== false;
      if (filterSection === 'Resume') matchSection = item.showInResume !== false;
      if (filterSection === 'System Console') matchSection = item.showInSystemConsole === true;

      return matchSearch && matchCat && matchStatus && matchSection;
    });
  }, [socialLinks, searchQuery, filterCategory, filterSection, filterStatus]);

  // Active Profile Item being edited or current default for live preview
  const currentPreviewItem: Partial<SocialLinkItem> = useMemo(() => {
    if (isEditing) {
      return {
        platform: platform === 'Custom Platform' ? customPlatformName : platform,
        username,
        profileUrl,
        logoUrl,
        avatarUrl,
        bannerImageUrl,
        displayName: displayName || platform,
        profileTitle,
        shortDescription,
        category,
        status,
        verifiedBadge,
        followers,
        repositories,
        stars,
        brandColor,
        ctaButtonText,
        profileBadge,
        buttonStyle,
        hoverEffect,
        openInNewTab,
        isVisible,
        showInCoordinates,
        showInDynamicProfile,
        showInContact,
        showInFooter,
        showInNavigation,
        showInProjects,
        showInAbout,
        showInResume,
        showInHeroCard,
        showInSystemConsole,
        showInHero
      };
    }
    return filteredLinks[0] || socialLinks[0] || {
      platform: 'GitHub',
      displayName: 'GitHub Profile',
      username: 'alexrivera',
      brandColor: '#10b981',
      followers: '12.5k',
      repositories: '84',
      status: 'Active',
      isVisible: true,
      showInCoordinates: true,
      showInDynamicProfile: true,
      showInContact: true,
      showInFooter: true,
      showInNavigation: true,
      showInProjects: true,
      showInAbout: true,
      showInResume: true,
      showInHeroCard: true,
      showInSystemConsole: true,
      showInHero: true
    };
  }, [
    isEditing, platform, customPlatformName, username, profileUrl, logoUrl, avatarUrl, bannerImageUrl,
    displayName, profileTitle, shortDescription, category, status, verifiedBadge, followers, repositories,
    stars, brandColor, ctaButtonText, profileBadge, buttonStyle, hoverEffect, openInNewTab, isVisible,
    showInCoordinates, showInDynamicProfile, showInContact, showInFooter, showInNavigation, showInProjects,
    showInAbout, showInResume, showInHeroCard, showInSystemConsole, showInHero, filteredLinks, socialLinks
  ]);

  return (
    <div className="space-y-8 pb-16 text-slate-100 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-mono text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-display text-white tracking-tight">Enterprise Social Profile Manager</h1>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold rounded-full uppercase">CMS v2.4</span>
              </div>
              <p className="text-xs text-slate-400">Manage every social connection as a fully customized, brand-aligned profile channel across all frontend components.</p>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => { resetForm(); setIsEditing(true); }}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Social Profile</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl flex items-center gap-2 border border-slate-700/60 transition-all cursor-pointer"
            title="Import Profiles JSON"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl flex items-center gap-2 border border-slate-700/60 transition-all cursor-pointer"
            title="Export Profiles JSON"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl flex items-center gap-2 border border-slate-700/60 transition-all cursor-pointer"
            title="Version History & Audit Logs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Logs</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Total Profiles</span>
          <p className="text-xl font-bold text-white">{socialLinks.length}</p>
        </div>
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Active Channels</span>
          <p className="text-xl font-bold text-emerald-400">{socialLinks.filter(s => s.isVisible !== false && !s.isArchived).length}</p>
        </div>
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Featured Profiles</span>
          <p className="text-xl font-bold text-purple-400">{socialLinks.filter(s => s.featuredBadge).length}</p>
        </div>
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Total Clicks</span>
          <p className="text-xl font-bold text-sky-400">{socialLinks.reduce((acc, curr) => acc + (curr.clicks || 0), 0)}</p>
        </div>
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80 space-y-1 col-span-2 md:col-span-1">
          <span className="text-[10px] text-slate-500 uppercase">System Status</span>
          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>All Nodes Online</span>
          </p>
        </div>
      </div>

      {/* Main Content Grid: Editor / List + Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 Cols): Editor or Profile List */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

          {/* Form Editor Modal / Panel */}
          {isEditing ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    {editId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {editId ? `Edit Profile Channel: ${platform}` : 'Create New Social Profile Channel'}
                    </h2>
                    <p className="text-[11px] text-slate-400">Configure branding, assets, placement, SEO, and interactive features.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Editor Tabs Header */}
              <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                {[
                  { id: 'info', label: 'Profile Info', icon: FileText },
                  { id: 'branding', label: 'Branding & Colors', icon: Palette },
                  { id: 'media', label: 'Media & Assets', icon: ImageIcon },
                  { id: 'visibility', label: 'Frontend Visibility', icon: Eye },
                  { id: 'card', label: 'Profile Card', icon: Layers3 },
                  { id: 'links', label: 'Links & CTA', icon: LinkIcon },
                  { id: 'fx', label: 'FX & Motion', icon: Sparkles },
                  { id: 'seo', label: 'SEO & Analytics', icon: BarChart2 }
                ].map(tab => {
                  const IconC = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        active 
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-md' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <IconC className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* TAB 1: PROFILE INFORMATION */}
                {activeTab === 'info' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Platform Network *</label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {platformsList.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      {platform === 'Custom Platform' && (
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Custom Platform Name *</label>
                          <input
                            type="text"
                            value={customPlatformName}
                            onChange={(e) => setCustomPlatformName(e.target.value)}
                            placeholder="e.g. Substack, Polywork, Threads"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Display Name / Title</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Principal GitHub"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Username / Handle</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. @alexrivera"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Profile Title / Role</label>
                        <input
                          type="text"
                          value={profileTitle}
                          onChange={(e) => setProfileTitle(e.target.value)}
                          placeholder="e.g. Lead Systems Architect"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Developer', 'Professional', 'Social', 'Gaming', 'Media', 'Design', 'Writing', 'Custom'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Channel Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          {['Active', 'Beta', 'VIP', 'Featured', 'Offline', 'Archived'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Short Description / Bio</label>
                      <textarea
                        rows={2}
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Brief summary shown on hover cards and dynamic profile components..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Followers, Following, Repos, Stars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">Followers</label>
                        <input
                          type="text"
                          value={followers}
                          onChange={(e) => setFollowers(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">Following</label>
                        <input
                          type="text"
                          value={following}
                          onChange={(e) => setFollowing(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">Repositories</label>
                        <input
                          type="text"
                          value={repositories}
                          onChange={(e) => setRepositories(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">Stars / Karma</label>
                        <input
                          type="text"
                          value={stars}
                          onChange={(e) => setStars(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Custom Statistics Table */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 font-bold">Custom Statistics Metrics</span>
                        <button
                          type="button"
                          onClick={() => setCustomStats([...customStats, { label: 'Metric', value: '100' }])}
                          className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Metric
                        </button>
                      </div>

                      {customStats.map((st, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={st.label}
                            onChange={(e) => {
                              const updated = [...customStats];
                              updated[i].label = e.target.value;
                              setCustomStats(updated);
                            }}
                            placeholder="Label (e.g. PRs)"
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs w-1/2 font-mono"
                          />
                          <input
                            type="text"
                            value={st.value}
                            onChange={(e) => {
                              const updated = [...customStats];
                              updated[i].value = e.target.value;
                              setCustomStats(updated);
                            }}
                            placeholder="Value (e.g. 1.2k)"
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs w-1/2 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setCustomStats(customStats.filter((_, idx) => idx !== i))}
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: BRANDING & COLORS */}
                {activeTab === 'branding' && (
                  <div className="space-y-4 text-xs">
                    {/* Brand Colors */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 font-bold mb-1">Brand Main Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={brandColor}
                            onChange={(e) => setBrandColor(e.target.value)}
                            className="w-8 h-8 rounded border border-slate-700 bg-slate-950 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={brandColor}
                            onChange={(e) => setBrandColor(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 font-bold mb-1">Background Tint</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-8 h-8 rounded border border-slate-700 bg-slate-950 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 font-bold mb-1">Hover Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={hoverColor}
                            onChange={(e) => setHoverColor(e.target.value)}
                            className="w-8 h-8 rounded border border-slate-700 bg-slate-950 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={hoverColor}
                            onChange={(e) => setHoverColor(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logo Variants Upload */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[11px] font-mono text-slate-300 font-bold block">Brand Logo Variants & Assets</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Standard Logo */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 font-bold">Primary Logo</span>
                            {logoUrl && (
                              <button
                                type="button"
                                onClick={() => setLogoUrl('')}
                                className="text-[9px] text-red-400 hover:underline"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          
                          {logoUrl ? (
                            <div className="h-12 bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center justify-center">
                              <img src={logoUrl} alt="Logo" className="max-h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={logoUrl}
                              onChange={(e) => setLogoUrl(e.target.value)}
                              placeholder="Logo URL or upload file below..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono"
                            />
                          )}

                          <input
                            type="file"
                            ref={logoInputRef}
                            onChange={(e) => handleFileUpload(e, 'logo')}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3 h-3 text-emerald-400" /> Upload Primary Logo
                          </button>
                        </div>

                        {/* Dark Mode Logo */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold block">Dark Mode Logo URL</span>
                          <input
                            type="text"
                            value={darkLogoUrl}
                            onChange={(e) => setDarkLogoUrl(e.target.value)}
                            placeholder="https://.../dark-logo.svg"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Custom SVG Code */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Custom Raw SVG Code (Optional)</label>
                      <textarea
                        rows={3}
                        value={customSvg}
                        onChange={(e) => setCustomSvg(e.target.value)}
                        placeholder="<svg viewBox='0 0 24 24' fill='none'...></svg>"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-[10px]"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: MEDIA & PROFILE IMAGES */}
                {activeTab === 'media' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Avatar Image */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-[11px] font-mono text-slate-300 font-bold block">Profile Avatar Image</span>
                        {avatarUrl ? (
                          <div className="w-16 h-16 mx-auto rounded-full border border-emerald-500/40 overflow-hidden">
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://.../avatar.jpg"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                          />
                        )}
                        <input
                          type="file"
                          ref={avatarInputRef}
                          onChange={(e) => handleFileUpload(e, 'avatar')}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3 text-sky-400" /> Choose Avatar Image
                        </button>
                      </div>

                      {/* Banner Image */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-[11px] font-mono text-slate-300 font-bold block">Cover / Banner Header</span>
                        {bannerImageUrl ? (
                          <div className="h-16 w-full rounded-lg border border-slate-800 overflow-hidden">
                            <img src={bannerImageUrl} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={bannerImageUrl}
                            onChange={(e) => setBannerImageUrl(e.target.value)}
                            placeholder="https://.../banner.jpg"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono"
                          />
                        )}
                        <input
                          type="file"
                          ref={bannerInputRef}
                          onChange={(e) => handleFileUpload(e, 'banner')}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3 text-purple-400" /> Choose Banner Image
                        </button>
                      </div>
                    </div>

                    {/* Scale and Rotate Controls */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                      <span className="text-[10px] text-slate-400 font-bold block">Asset Transformation & Preview Scale</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-slate-500 block">Scale ({imageScale}%)</label>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={imageScale}
                            onChange={(e) => setImageScale(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block">Rotation ({imageRotate}°)</label>
                          <button
                            type="button"
                            onClick={() => setImageRotate((imageRotate + 90) % 360)}
                            className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-[10px] flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-400" /> Rotate 90°
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: INDEPENDENT SECTION VISIBILITY */}
                {activeTab === 'visibility' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Independent Section Placement System
                      </span>
                      <p className="text-[10.5px] text-slate-300">Choose exactly where this social connection appears across the portfolio layout. Every section toggle is completely independent.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { label: 'Coordinates Channels', state: showInCoordinates, set: setShowInCoordinates },
                        { label: 'Dynamic Profile Card', state: showInDynamicProfile, set: setShowInDynamicProfile },
                        { label: 'Contact Section', state: showInContact, set: setShowInContact },
                        { label: 'Footer Section', state: showInFooter, set: setShowInFooter },
                        { label: 'Header Navigation', state: showInNavigation, set: setShowInNavigation },
                        { label: 'Hero Card Dock', state: showInHeroCard, set: setShowInHeroCard },
                        { label: 'About Section', state: showInAbout, set: setShowInAbout },
                        { label: 'Projects Section', state: showInProjects, set: setShowInProjects },
                        { label: 'Resume Credentials', state: showInResume, set: setShowInResume },
                        { label: 'System Console', state: showInSystemConsole, set: setShowInSystemConsole },
                        { label: 'Hero Dock Badge', state: showInHero, set: setShowInHero }
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-300">{item.label}</span>
                          <button
                            type="button"
                            onClick={() => item.set(!item.state)}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                              item.state ? 'bg-emerald-500' : 'bg-slate-800'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                              item.state ? 'translate-x-4.5' : 'translate-x-0.75'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3 font-mono text-xs">
                      <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-300">Global Master Visibility</span>
                        <button
                          type="button"
                          onClick={() => setIsVisible(!isVisible)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                            isVisible ? 'bg-emerald-500' : 'bg-slate-800'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                            isVisible ? 'translate-x-4.5' : 'translate-x-0.75'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-300">Open In New Tab</span>
                        <button
                          type="button"
                          onClick={() => setOpenInNewTab(!openInNewTab)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                            openInNewTab ? 'bg-emerald-500' : 'bg-slate-800'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                            openInNewTab ? 'translate-x-4.5' : 'translate-x-0.75'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: PROFILE CARD */}
                {activeTab === 'card' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Card Title</label>
                        <input
                          type="text"
                          value={cardTitle}
                          onChange={(e) => setCardTitle(e.target.value)}
                          placeholder="e.g. GitHub Ecosystem"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Card Subtitle</label>
                        <input
                          type="text"
                          value={cardSubtitle}
                          onChange={(e) => setCardSubtitle(e.target.value)}
                          placeholder="e.g. Open Source Repositories"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Badge Tag Label</label>
                        <input
                          type="text"
                          value={profileBadge}
                          onChange={(e) => setProfileBadge(e.target.value)}
                          placeholder="e.g. Top 1% Creator"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">CTA Button Text</label>
                        <input
                          type="text"
                          value={ctaButtonText}
                          onChange={(e) => setCtaButtonText(e.target.value)}
                          placeholder="e.g. Visit GitHub Profile"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                        />
                      </div>
                    </div>

                    {/* Card Toggles */}
                    <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                      <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-300">Verified Badge</span>
                        <input
                          type="checkbox"
                          checked={verifiedBadge}
                          onChange={(e) => setVerifiedBadge(e.target.checked)}
                          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-300">Featured Profile Badge</span>
                        <input
                          type="checkbox"
                          checked={featuredBadge}
                          onChange={(e) => setFeaturedBadge(e.target.checked)}
                          className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: LINKS & BUTTONS */}
                {activeTab === 'links' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Primary Destination URL *</label>
                      <input
                        type="url"
                        value={profileUrl}
                        onChange={(e) => setProfileUrl(e.target.value)}
                        placeholder="https://github.com/alexrivera"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">Secondary / Backup URL</label>
                        <input
                          type="url"
                          value={secondaryUrl}
                          onChange={(e) => setSecondaryUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">Documentation URL</label>
                        <input
                          type="url"
                          value={documentationUrl}
                          onChange={(e) => setDocumentationUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">Community / Discord URL</label>
                        <input
                          type="url"
                          value={communityUrl}
                          onChange={(e) => setCommunityUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">Blog / Article URL</label>
                        <input
                          type="url"
                          value={blogUrl}
                          onChange={(e) => setBlogUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Button Style Archetype</label>
                      <select
                        value={buttonStyle}
                        onChange={(e) => setButtonStyle(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                      >
                        <option value="filled">Filled Accent (Solid)</option>
                        <option value="outline">Subtle Outline Border</option>
                        <option value="ghost">Ghost Minimal</option>
                        <option value="gradient">Enterprise Gradient</option>
                        <option value="glass">Glassmorphic Glow</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* TAB 7: FX & MOTION */}
                {activeTab === 'fx' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Hover FX Preset</label>
                        <select
                          value={hoverEffect}
                          onChange={(e) => setHoverEffect(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                        >
                          <option value="glow">Emerald Glow Pulse</option>
                          <option value="lift">Lift & Shadow (+3px)</option>
                          <option value="scale">Subtle Scale Zoom (1.08x)</option>
                          <option value="rotate">3D Tilt Rotate</option>
                          <option value="shadow">Deep Ambient Shadow</option>
                          <option value="border">Border Shimmer Sweep</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Entrance Animation</label>
                        <select
                          value={animationEffect}
                          onChange={(e) => setAnimationEffect(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                        >
                          <option value="fade">Fade In Smooth</option>
                          <option value="slide">Slide Up Spring</option>
                          <option value="zoom">Elastic Zoom Pop</option>
                          <option value="bounce">Subtle Bounce Drop</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 8: SEO & ANALYTICS */}
                {activeTab === 'seo' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">Custom SEO Meta Title</label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="e.g. Alex Rivera | Official GitHub Profile"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 font-bold mb-1">OpenGraph Meta Description</label>
                      <textarea
                        rows={2}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Description for social card shares..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                      />
                    </div>

                    {/* Analytics Summary Card */}
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Analytics Ledger</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Total Clicks</span>
                          <span className="text-sm font-bold text-emerald-400">{clicks}</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">CTR %</span>
                          <span className="text-sm font-bold text-sky-400">{ctr}%</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Visitors</span>
                          <span className="text-sm font-bold text-purple-400">{visitors}</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Last Active</span>
                          <span className="text-[10px] text-slate-300">{lastClicked}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Error Warning */}
                {formErrors.submit && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formErrors.submit}</span>
                  </div>
                )}

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{editId ? 'Update Profile Channel' : 'Register Connection'}</span>
                  </button>
                </div>

              </form>
            </div>
          ) : (
            /* Search, Filter & List View */
            <div className="space-y-4">
              {/* Search and Filters Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search profiles, handles, platforms..."
                    className="bg-transparent text-slate-200 focus:outline-none w-full font-mono text-xs"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  {/* Category Filter */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 text-xs"
                  >
                    <option value="All">All Categories</option>
                    <option value="Developer">Developer</option>
                    <option value="Professional">Professional</option>
                    <option value="Social">Social</option>
                    <option value="Gaming">Gaming</option>
                  </select>

                  {/* Section Filter */}
                  <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 text-xs"
                  >
                    <option value="All">All Sections</option>
                    <option value="Coordinates">Coordinates Channels</option>
                    <option value="Dynamic Profile">Dynamic Profile</option>
                    <option value="Contact">Contact</option>
                    <option value="Footer">Footer</option>
                    <option value="Navigation">Navigation</option>
                    <option value="Hero Card">Hero Card</option>
                    <option value="About">About</option>
                    <option value="Projects">Projects</option>
                    <option value="Resume">Resume</option>
                    <option value="System Console">System Console</option>
                  </select>
                </div>
              </div>

              {/* Profiles Grid / List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredLinks.map((link) => {
                  const IconComp = getPlatformIconComponent(link.platform);
                  const isVis = link.isVisible !== false && !link.isArchived;

                  return (
                    <div
                      key={link.id}
                      className={`bg-slate-900/60 p-4 rounded-2xl border transition-all duration-300 space-y-3 relative group ${
                        isVis ? 'border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/90' : 'border-slate-800/40 opacity-60'
                      }`}
                    >
                      {/* Top Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getPlatformColor(link.platform)}`}>
                            {link.logoUrl ? (
                              <img src={link.logoUrl} alt={link.platform} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <IconComp className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-white tracking-tight">{link.displayName || link.platform}</h3>
                              {link.verifiedBadge && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                              {link.isArchived && <span className="text-[9px] font-mono px-1.5 py-0.2 bg-red-500/10 text-red-400 border border-red-500/20 rounded">Archived</span>}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">{link.username || link.profileUrl}</p>
                          </div>
                        </div>

                        {/* Quick Toggle Visibility */}
                        <button
                          type="button"
                          onClick={() => onToggleVisibility(link.id, !link.isVisible)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isVis ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                          }`}
                          title={isVis ? 'Visible on Frontend' : 'Hidden from Frontend'}
                        >
                          {isVis ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Compact Section Visibility Summary */}
                      {(() => {
                        const activeSections: string[] = [];
                        if (link.showInCoordinates !== false) activeSections.push('Coordinates');
                        if (link.showInDynamicProfile !== false) activeSections.push('Dynamic Profile');
                        if (link.showInContact !== false) activeSections.push('Contact');
                        if (link.showInFooter !== false) activeSections.push('Footer');
                        if (link.showInNavigation === true) activeSections.push('Navigation');
                        if (link.showInProjects === true) activeSections.push('Projects');
                        if (link.showInAbout === true) activeSections.push('About');
                        if (link.showInResume === true) activeSections.push('Resume');
                        if (link.showInHeroCard === true) activeSections.push('Hero Card');
                        if (link.showInSystemConsole === true) activeSections.push('System Console');

                        const count = activeSections.length;
                        let summaryText = 'Hidden from all sections';
                        if (count > 0) {
                          if (count <= 3) {
                            summaryText = activeSections.join(' • ');
                          } else {
                            summaryText = `${activeSections.slice(0, 2).join(' • ')} + ${count - 2} more`;
                          }
                        }

                        return (
                          <div className="pt-2 border-t border-slate-800/60 font-mono text-[10px] flex items-center justify-between gap-2">
                            <span className="text-slate-500 shrink-0">Visible In:</span>
                            <span
                              title={count > 0 ? `Active Sections:\n• ${activeSections.join('\n• ')}` : 'Hidden from all sections'}
                              className={`truncate font-medium transition-colors ${
                                count > 0 ? 'text-slate-300 hover:text-emerald-400 cursor-help' : 'text-slate-600'
                              }`}
                            >
                              {summaryText}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Item Bottom Action Bar */}
                      <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-slate-500">
                        <span>Clicks: {link.clicks || 0}</span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => populateForm(link)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(link)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="Duplicate Profile"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleArchive(link)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="Archive Profile"
                          >
                            <Archive className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(link.id)}
                            className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredLinks.length === 0 && (
                  <div className="col-span-2 p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-3">
                    <Globe className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-mono">No matching social profile channels found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column (4 Cols): Live Interactive Device Simulator */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-xl sticky top-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Frontend Render Simulator</span>
              </div>

              {/* Device Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1 rounded ${previewDevice === 'tablet' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Section Switcher Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-[10px] font-mono">
              {['Coordinates', 'Dynamic Profile', 'Contact', 'Footer', 'Navigation', 'Projects', 'About', 'Resume', 'Hero Card', 'System Console'].map(sec => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setPreviewSectionTab(sec)}
                  className={`px-2 py-1 rounded transition-colors ${
                    previewSectionTab === sec ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            {/* Simulated Frame */}
            <div className={`mx-auto bg-[#030712] border border-slate-800/80 rounded-2xl p-4 transition-all duration-300 space-y-4 ${
              previewDevice === 'mobile' ? 'max-w-[280px]' : (previewDevice === 'tablet' ? 'max-w-[340px]' : 'w-full')
            }`}>
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-b border-slate-800/60 pb-2">
                <span>SIMULATOR: {previewSectionTab.toUpperCase()}</span>
                <span className="text-emerald-400 font-bold">100% MATCH</span>
              </div>

              {/* Dynamic Preview Card / Hidden State */}
              {(() => {
                let isSectionActive = true;
                if (previewSectionTab === 'Coordinates') isSectionActive = currentPreviewItem.showInCoordinates !== false;
                if (previewSectionTab === 'Dynamic Profile') isSectionActive = currentPreviewItem.showInDynamicProfile !== false;
                if (previewSectionTab === 'Contact') isSectionActive = currentPreviewItem.showInContact !== false;
                if (previewSectionTab === 'Footer') isSectionActive = currentPreviewItem.showInFooter !== false;
                if (previewSectionTab === 'Navigation') isSectionActive = currentPreviewItem.showInNavigation === true;
                if (previewSectionTab === 'Projects') isSectionActive = currentPreviewItem.showInProjects === true;
                if (previewSectionTab === 'About') isSectionActive = currentPreviewItem.showInAbout === true;
                if (previewSectionTab === 'Resume') isSectionActive = currentPreviewItem.showInResume === true;
                if (previewSectionTab === 'Hero Card') isSectionActive = currentPreviewItem.showInHeroCard === true;
                if (previewSectionTab === 'System Console') isSectionActive = currentPreviewItem.showInSystemConsole === true;

                if (currentPreviewItem.isVisible === false || !isSectionActive) {
                  return (
                    <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-6 text-center space-y-3 font-mono">
                      <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                        <EyeOff className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-300">Hidden in {previewSectionTab}</h5>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
                          This connection is currently toggled OFF for {previewSectionTab}.
                        </p>
                      </div>
                      <div className="inline-block px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] rounded-full">
                        Toggle ON under Frontend Visibility tab
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                    {currentPreviewItem.bannerImageUrl && (
                      <div className="h-12 -mx-4 -mt-4 mb-2 overflow-hidden border-b border-slate-800">
                        <img src={currentPreviewItem.bannerImageUrl} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                          style={{ 
                            backgroundColor: currentPreviewItem.brandColor ? `${currentPreviewItem.brandColor}20` : '#10b98120',
                            borderColor: currentPreviewItem.brandColor || '#10b981',
                            color: currentPreviewItem.brandColor || '#10b981'
                          }}
                        >
                          {currentPreviewItem.logoUrl ? (
                            <img src={currentPreviewItem.logoUrl} alt="Logo" className="w-4 h-4 object-contain" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1">
                            <span>{currentPreviewItem.displayName || currentPreviewItem.platform}</span>
                            {currentPreviewItem.verifiedBadge && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">{currentPreviewItem.username || '@handle'}</p>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {currentPreviewItem.status || 'Active'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                      {currentPreviewItem.shortDescription || 'Enterprise verified social channel connected directly to micro-database.'}
                    </p>

                    {/* Simulated Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 font-mono text-[9px] text-slate-400">
                      <div>Followers: <span className="text-slate-200 font-bold">{currentPreviewItem.followers || '12.5k'}</span></div>
                      <div>Repos: <span className="text-slate-200 font-bold">{currentPreviewItem.repositories || '84'}</span></div>
                    </div>

                    {/* Simulated Button */}
                    <a
                      href={currentPreviewItem.profileUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer mt-2"
                    >
                      <span>{currentPreviewItem.ctaButtonText || 'Visit Channel'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Profile Channel?</h3>
              <p className="text-xs text-slate-400 mt-1">Are you sure you want to remove this social link profile? This action is permanent.</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                  triggerToast('Social profile channel deleted.');
                }}
                className="w-full py-2 bg-red-500 hover:bg-red-400 text-white font-bold font-mono text-xs rounded-xl shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Import Social Profiles JSON</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">Paste your exported JSON array of social profile items below:</p>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[{"platform": "GitHub", "profileUrl": "https://github.com/..."}]'
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
              <button onClick={handleImportJsonSubmit} className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">Import Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Drawer */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Audit Trail & Activity Logs</span>
              </h3>
              <button onClick={() => setShowHistoryDrawer(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold block">[SYSTEM INIT]</span>
                <p>Social Profile Manager engine initialized with independent section placement routing.</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-sky-400 font-bold block">[DATABASE BACKFILL]</span>
                <p>Synced {socialLinks.length} profile channels with full branding & telemetry schemas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

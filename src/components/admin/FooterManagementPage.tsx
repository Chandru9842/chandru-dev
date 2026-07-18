import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Save, X, AlertCircle, Info, Sliders, 
  ChevronUp, ChevronDown, Linkedin, Github, Instagram, Twitter, Youtube, 
  Mail, Code2, Terminal, Globe, Link, Facebook, Phone, MessageSquare, UploadCloud
} from 'lucide-react';

export interface FooterSocialLinkItem {
  id: number;
  platform: string;
  url: string;
  icon: string;
  isVisible: boolean;
  displayOrder: number;
  logoUrl?: string;
}

interface FooterData {
  title: string;
  description: string;
  copyrightText: string;
  builtWithText: string;
  contactInfo?: string;
  showResume: boolean;
  resumeText: string;
  logoText?: string;
  logoUrl?: string;
  backgroundType?: 'none' | 'glass' | 'emerald' | 'purple' | 'slate' | 'custom';
  customBackgroundUrl?: string;
  theme?: 'dark' | 'light' | 'colored' | 'glass';
  isVisible?: boolean;
}

// Dynamic Lucide platform mapping helper
export const getPlatformIconComponent = (platform: string) => {
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

// Platform color mapping for a highly curated visual experience
export const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'LinkedIn': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'GitHub': return 'text-slate-200 bg-slate-800/20 border-slate-700/30';
    case 'Instagram': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
    case 'X (Twitter)': return 'text-sky-300 bg-sky-400/10 border-sky-400/20';
    case 'YouTube': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    case 'Facebook': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'Email': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'LeetCode': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'HackerRank': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'WhatsApp': return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'Portfolio Website': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    default: return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
  }
};

interface FooterManagementPageProps {
  footer: FooterData;
  onSaveFooter: (footer: FooterData) => Promise<void>;
  footerSocialLinks: FooterSocialLinkItem[];
  onAddSocialLink: (link: Omit<FooterSocialLinkItem, 'id'>) => Promise<void>;
  onUpdateSocialLink: (link: FooterSocialLinkItem) => Promise<void>;
  onDeleteSocialLink: (id: number) => Promise<void>;
  onToggleSocialLinkVisibility: (id: number, isVisible: boolean) => Promise<void>;
  onReorderSocialLinks: (orderedList: FooterSocialLinkItem[]) => Promise<void>;
  onTriggerToast: (message: string, type: 'success' | 'error') => void;
}

export default function FooterManagementPage({
  footer,
  onSaveFooter,
  footerSocialLinks,
  onAddSocialLink,
  onUpdateSocialLink,
  onDeleteSocialLink,
  onToggleSocialLinkVisibility,
  onReorderSocialLinks,
  onTriggerToast
}: FooterManagementPageProps) {
  // Section A states
  const [footerTitle, setFooterTitle] = useState(footer?.title || "");
  const [footerDescription, setFooterDescription] = useState(footer?.description || "");
  const [copyrightText, setCopyrightText] = useState(footer?.copyrightText || "");
  const [builtWithText, setBuiltWithText] = useState(footer?.builtWithText || "");
  const [showResume, setShowResume] = useState(footer?.showResume !== false);
  const [resumeText, setResumeText] = useState(footer?.resumeText || "View Resume");
  const [logoText, setLogoText] = useState(footer?.logoText || "");
  const [logoUrl, setLogoUrl] = useState(footer?.logoUrl || "");
  const [backgroundType, setBackgroundType] = useState<FooterData['backgroundType']>(footer?.backgroundType || "glass");
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState(footer?.customBackgroundUrl || "");
  const [theme, setTheme] = useState<FooterData['theme']>(footer?.theme || "glass");
  const [isVisible, setIsVisible] = useState(footer?.isVisible !== false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Update Section A fields when footer prop changes
  useEffect(() => {
    if (footer) {
      setFooterTitle(footer.title || "");
      setFooterDescription(footer.description || "");
      setCopyrightText(footer.copyrightText || "");
      setBuiltWithText(footer.builtWithText || "");
      setShowResume(footer.showResume !== false);
      setResumeText(footer.resumeText || "View Resume");
      setLogoText(footer.logoText || "");
      setLogoUrl(footer.logoUrl || "");
      setBackgroundType(footer.backgroundType || "glass");
      setCustomBackgroundUrl(footer.customBackgroundUrl || "");
      setTheme(footer.theme || "glass");
      setIsVisible(footer.isVisible !== false);
    }
  }, [footer]);

  // Section B (Social Links) form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [platform, setPlatform] = useState('GitHub');
  const [templatePlatform, setTemplatePlatform] = useState('GitHub');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [linkLogoUrl, setLinkLogoUrl] = useState('');
  const [linkIsVisible, setLinkIsVisible] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSavingLink, setIsSavingLink] = useState(false);

  const platformsList = [
    'GitHub', 'LinkedIn', 'LeetCode', 'GeeksforGeeks', 'X/Twitter', 'Email', 'WhatsApp', 'Custom'
  ];

  const resetLinkForm = () => {
    setIsEditing(false);
    setEditId(null);
    setPlatform('GitHub');
    setTemplatePlatform('GitHub');
    setUrl('');
    setIcon('');
    setLinkLogoUrl('');
    setLinkIsVisible(true);
    setDisplayOrder((footerSocialLinks?.length || 0) + 1);
    setFormErrors({});
  };

  const validateLinkForm = () => {
    const errors: { [key: string]: string } = {};

    if (!platform || !platform.trim()) {
      errors.platform = 'Platform name is required.';
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      errors.url = 'URL is required.';
    } else {
      if (platform === 'Email') {
        if (!trimmedUrl.startsWith('mailto:') && !trimmedUrl.includes('@')) {
          errors.url = 'Enter a valid email address or mailto: URL.';
        }
      } else if (platform === 'WhatsApp') {
        if (!trimmedUrl.startsWith('https://wa.me/') && !/^\+?\d+$/.test(trimmedUrl)) {
          errors.url = 'Enter a valid phone number or WhatsApp URL (https://wa.me/...).';
        }
      } else {
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
          errors.url = 'URL must start with http:// or https://';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    try {
      await onSaveFooter({
        title: footerTitle.trim(),
        description: footerDescription.trim(),
        copyrightText: copyrightText.trim(),
        builtWithText: builtWithText.trim(),
        showResume,
        resumeText: resumeText.trim(),
        logoText: logoText.trim(),
        logoUrl: logoUrl.trim(),
        backgroundType,
        customBackgroundUrl: customBackgroundUrl.trim(),
        theme,
        isVisible
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLinkForm()) return;

    setIsSavingLink(true);
    let finalUrl = url.trim();
    if (platform === 'Email' && !finalUrl.startsWith('mailto:')) {
      finalUrl = `mailto:${finalUrl}`;
    } else if (platform === 'WhatsApp' && !finalUrl.startsWith('https://wa.me/')) {
      // Stripping potential symbols for WhatsApp wa.me format
      const cleaned = finalUrl.replace(/[^\d]/g, '');
      finalUrl = `https://wa.me/${cleaned}`;
    }

    try {
      if (isEditing && editId !== null) {
        await onUpdateSocialLink({
          id: editId,
          platform: platform.trim(),
          url: finalUrl,
          icon: icon.trim() || platform.trim(),
          logoUrl: linkLogoUrl,
          isVisible: linkIsVisible,
          displayOrder
        });
        onTriggerToast(`Updated ${platform} link successfully.`, 'success');
      } else {
        await onAddSocialLink({
          platform: platform.trim(),
          url: finalUrl,
          icon: icon.trim() || platform.trim(),
          logoUrl: linkLogoUrl,
          isVisible: linkIsVisible,
          displayOrder: footerSocialLinks.length + 1
        });
        onTriggerToast(`Added ${platform} link successfully.`, 'success');
      }
      resetLinkForm();
    } catch (err: any) {
      onTriggerToast(err.message || 'Error saving footer social link.', 'error');
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleEditClick = (link: FooterSocialLinkItem) => {
    setIsEditing(true);
    setEditId(link.id);
    setPlatform(link.platform);
    
    const isStandard = ['GitHub', 'LinkedIn', 'LeetCode', 'GeeksforGeeks', 'X (Twitter)', 'Email', 'WhatsApp'].includes(link.platform);
    setTemplatePlatform(isStandard ? link.platform : 'Custom');
    
    setUrl(link.url);
    setIcon(link.icon || '');
    setLinkLogoUrl(link.logoUrl || '');
    setLinkIsVisible(link.isVisible);
    setDisplayOrder(link.displayOrder);
    setFormErrors({});
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newList = [...footerSocialLinks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    // Swap elements
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    // Re-assign displayOrders
    const updatedList = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    await onReorderSocialLinks(updatedList);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <span>Footer Management Hub</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage Section A (Footer biographical details, copyright statements) and Section B (independent footer social links directory) in total architectural isolation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SECTION A: FOOTER INFORMATION */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleInfoSubmit} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800/60 pb-3">
              <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
                Section A: Footer Information
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Biographical, branding, and interactive assets shown in footer canvas.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Footer Title *</label>
                <input
                  type="text"
                  value={footerTitle}
                  onChange={(e) => setFooterTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none"
                  placeholder="e.g. Alex Rivera"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Footer Description</label>
                <textarea
                  value={footerDescription}
                  onChange={(e) => setFooterDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none resize-none"
                  placeholder="Tell visitors what you focus on..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Copyright Statement</label>
                <input
                  type="text"
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none"
                  placeholder="e.g. © 2026 Chandru Mohan. All rights reserved."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-400">Built With Text</label>
                <input
                  type="text"
                  value={builtWithText}
                  onChange={(e) => setBuiltWithText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none"
                  placeholder="e.g. Designed with React & Tailwind CSS."
                />
              </div>

              <div className="pt-2 border-t border-slate-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-mono font-bold text-slate-300">Show Resume Action Button</span>
                    <span className="text-[10px] text-slate-500 font-mono">Include dynamic link directly to your active resume</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={showResume}
                      onChange={(e) => setShowResume(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-emerald-400 after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-950/40 border border-slate-800" />
                  </label>
                </div>

                {showResume && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="block text-xs font-mono text-slate-400">Resume Button Text</label>
                    <input
                      type="text"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none"
                      placeholder="e.g. Download Resume"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-mono font-bold text-slate-300">Footer Visibility</span>
                      <span className="text-[10px] text-slate-500 font-mono">Toggle whether the entire footer section is visible</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={isVisible}
                        onChange={(e) => setIsVisible(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-emerald-400 after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-950/40 border border-slate-800" />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-slate-400">Footer Logo Text</label>
                      <input
                        type="text"
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                        placeholder="e.g. Alex Dev"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-slate-400">Footer Logo Icon/URL</label>
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                        placeholder="e.g. /public/icon.png"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-slate-400">Footer Background</label>
                      <select
                        value={backgroundType}
                        onChange={(e) => setBackgroundType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                      >
                        <option value="none">None / Transparent</option>
                        <option value="glass">Dark Glass</option>
                        <option value="emerald">Emerald Focus</option>
                        <option value="purple">Cyberpunk Purple</option>
                        <option value="slate">Slate Minimal</option>
                        <option value="custom">Custom Image URL</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-slate-400">Footer Theme</label>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                      >
                        <option value="glass">Glass Theme</option>
                        <option value="dark">Solid Dark</option>
                        <option value="light">Solid Light</option>
                        <option value="colored">Colored Accents</option>
                      </select>
                    </div>
                  </div>

                  {backgroundType === 'custom' && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="block text-[11px] font-mono text-slate-400">Custom Background Image URL</label>
                      <input
                        type="text"
                        value={customBackgroundUrl}
                        onChange={(e) => setCustomBackgroundUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-none"
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                    </div>
                  )}

                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingInfo}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-slate-950 font-mono font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Save className="w-4 h-4" />
              {isSavingInfo ? 'Saving Section A...' : 'Save Footer Information'}
            </button>
          </form>
        </div>

        {/* SECTION B: FOOTER SOCIAL LINKS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Social Link Form Column (Col 5) */}
            <form onSubmit={handleLinkSubmit} className="md:col-span-5 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4 self-start">
              <div className="border-b border-slate-800/60 pb-2 flex justify-between items-center">
                <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
                  {isEditing ? 'Edit Social Link' : 'Add Social Link'}
                </h3>
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={resetLinkForm}
                    className="text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-slate-400">Platform Template</label>
                  <select
                    value={templatePlatform}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTemplatePlatform(val);
                      if (val !== 'Custom') {
                        setPlatform(val);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                  >
                    {platformsList.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-slate-400">Platform / Display Name *</label>
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                    placeholder="e.g. GeeksforGeeks, Custom Link"
                    required
                  />
                  {formErrors.platform && (
                    <span className="text-[10px] text-rose-500 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.platform}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-slate-400">
                    {platform === 'Email' ? 'Email Address *' : platform === 'WhatsApp' ? 'Phone (with Country Code) *' : 'Profile URL *'}
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                    placeholder={
                      platform === 'Email' ? 'alex@example.com' :
                      platform === 'WhatsApp' ? '919655384140' :
                      'https://...'
                    }
                  />
                  {formErrors.url && (
                    <span className="text-[10px] text-rose-500 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.url}
                    </span>
                  )}
                </div>

                {/* Custom Logo Upload Section */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-slate-400">Custom Logo/Icon</label>
                  {linkLogoUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-800">
                      <img 
                        src={linkLogoUrl} 
                        alt="Logo Preview" 
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 object-contain rounded bg-slate-900 border border-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block text-[10px] font-mono text-emerald-400 truncate font-bold">Logo Uploaded</span>
                        <span className="block text-[9px] text-slate-500 font-mono truncate">Ready to save</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="cursor-pointer text-[10px] font-mono text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded">
                          Replace
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (!file.type.startsWith('image/')) {
                                  onTriggerToast('Please select an image file.', 'error');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setLinkLogoUrl(event.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                            className="hidden" 
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setLinkLogoUrl('')}
                          className="text-[10px] font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 p-1 rounded"
                          title="Remove Logo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/30 hover:bg-slate-950/50 rounded-xl cursor-pointer transition text-center">
                      <UploadCloud className="w-5 h-5 text-slate-500 mb-1" />
                      <span className="text-[10px] font-mono text-slate-400">Upload Custom Logo (PNG, SVG, JPG)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!file.type.startsWith('image/')) {
                              onTriggerToast('Please select an image file.', 'error');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setLinkLogoUrl(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-slate-400">Custom Lucide Icon Name (Optional)</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                    placeholder="Defaults to platform name"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-slate-400">Visible on Portfolio</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={linkIsVisible}
                      onChange={(e) => setLinkIsVisible(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-emerald-400 after:border-slate-600 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-950/40 border border-slate-800" />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingLink}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-[11px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isEditing ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {isSavingLink ? 'Saving Link...' : isEditing ? 'Update Link' : 'Add Link'}
              </button>
            </form>

            {/* Social Links List Column (Col 7) */}
            <div className="md:col-span-7 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="border-b border-slate-800/60 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
                  Section B: Footer Social Links Directory
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">CRUD and reordering of active social handles. These do not affect profile fields.</p>
              </div>

              {footerSocialLinks.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                  No footer social links configured. Add one on the left to start!
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 select-none">
                  {footerSocialLinks.map((item, index) => {
                    const IconComponent = getPlatformIconComponent(item.platform);
                    const colorClass = getPlatformColor(item.platform);
                    return (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isEditing && editId === item.id 
                            ? 'bg-emerald-950/10 border-emerald-500/30 shadow-md shadow-emerald-500/5' 
                            : 'bg-slate-950/30 border-slate-800/60 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Reordering indicators */}
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveItem(index, 'up')}
                              className="text-slate-600 hover:text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === footerSocialLinks.length - 1}
                              onClick={() => moveItem(index, 'down')}
                              className="text-slate-600 hover:text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Dynamic Icon with Badge Color or Custom Logo */}
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 overflow-hidden ${colorClass}`}>
                            {item.logoUrl ? (
                              <img 
                                src={item.logoUrl} 
                                alt={item.platform} 
                                referrerPolicy="no-referrer"
                                className="w-5 h-5 object-contain" 
                              />
                            ) : (
                              <IconComponent className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="block text-xs font-mono font-bold text-slate-200">{item.platform}</span>
                            <span className="block text-[10px] text-slate-500 font-mono truncate max-w-[140px]" title={item.url}>
                              {item.url}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => onToggleSocialLinkVisibility(item.id, !item.isVisible)}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                              item.isVisible 
                                ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/20' 
                                : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400 hover:bg-slate-900'
                            }`}
                            title={item.isVisible ? 'Visible' : 'Hidden'}
                          >
                            {item.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            className="w-7 h-7 rounded-lg border border-slate-800/80 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
                            title="Edit Link"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSocialLink(item.id)}
                            className="w-7 h-7 rounded-lg border border-slate-800/80 hover:border-rose-500/30 bg-slate-950/60 hover:bg-rose-500/5 text-slate-500 hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
                            title="Delete Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

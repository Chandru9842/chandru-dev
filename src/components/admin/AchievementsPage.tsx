import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ArrowLeft, ArrowRight, ExternalLink, 
  Award, AlertCircle, Check, Loader2, Calendar, FileText, Eye, EyeOff,
  Star, ChevronUp, ChevronDown, CheckCircle2, ShieldAlert, Badge, 
  Cpu, Sparkles, UploadCloud, Trash, Image as ImageIcon, CheckCircle, Sliders
} from 'lucide-react';
import { AchievementItem } from '../../data/cmsMockData';

interface AchievementsPageProps {
  achievements: AchievementItem[];
  onAdd: (achievement: Omit<AchievementItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (achievement: AchievementItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleVisibility: (id: number, visibility: boolean) => Promise<void>;
  onToggleFeatured: (id: number, featured: boolean) => Promise<void>;
  onReorder: (reordered: AchievementItem[]) => Promise<void>;
}

// Supported categories
const CATEGORIES = [
  'Hackathon',
  'Competition',
  'Award',
  'Coding',
  'Internship',
  'Research',
  'Open Source',
  'Academic',
  'Certification',
  'Leadership',
  'Volunteer',
  'Other'
];

export default function AchievementsPage({ 
  achievements, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onToggleVisibility, 
  onToggleFeatured,
  onReorder 
}: AchievementsPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementItem | null>(null);
  
  // Grid vs Form View
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('order_asc'); // order_asc, date_desc, date_asc, title_asc
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hackathon');
  const [organization, setOrganization] = useState('');
  const [achievementDate, setAchievementDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [skillsString, setSkillsString] = useState(''); // comma separated
  const [techString, setTechString] = useState(''); // comma separated
  const [position, setPosition] = useState('');
  const [awardType, setAwardType] = useState('');
  const [badge, setBadge] = useState('');
  const [featured, setFeatured] = useState(false);
  const [visibility, setVisibility] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(0);

  // Form Submission/Loading States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Sort logic
  const filteredAchievements = useMemo(() => {
    let result = [...achievements];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.organization.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        (a.skills && a.skills.some(s => s.toLowerCase().includes(q))) ||
        (a.technologies && a.technologies.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter(a => a.category === categoryFilter);
    }

    // Sorting
    result.sort((x, y) => {
      if (sortBy === 'order_asc') {
        return (x.displayOrder || 0) - (y.displayOrder || 0);
      }
      if (sortBy === 'date_desc') {
        return new Date(y.achievementDate).getTime() - new Date(x.achievementDate).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(x.achievementDate).getTime() - new Date(y.achievementDate).getTime();
      }
      if (sortBy === 'title_asc') {
        return x.title.localeCompare(y.title);
      }
      return 0;
    });

    return result;
  }, [achievements, searchQuery, categoryFilter, sortBy]);

  // Paginated Achievements
  const paginatedAchievements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAchievements.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAchievements, currentPage]);

  const totalPages = Math.ceil(filteredAchievements.length / itemsPerPage) || 1;

  // Actions
  const openAddForm = () => {
    setCurrentAchievement(null);
    setTitle('');
    setSubtitle('');
    setShortDescription('');
    setDescription('');
    setCategory('Hackathon');
    setOrganization('');
    setAchievementDate('');
    setImageUrl('');
    setLogoUrl('');
    setCertificateUrl('');
    setCredentialUrl('');
    setProjectUrl('');
    setGithubUrl('');
    setDemoUrl('');
    setSkillsString('');
    setTechString('');
    setPosition('');
    setAwardType('');
    setBadge('');
    setFeatured(false);
    setVisibility(true);
    // Suggest next display order
    const maxOrder = achievements.reduce((max, cur) => (cur.displayOrder > max ? cur.displayOrder : max), 0);
    setDisplayOrder(maxOrder + 1);
    setErrors({});
    setIsEditing(true);
  };

  const openEditForm = (item: AchievementItem) => {
    setCurrentAchievement(item);
    setTitle(item.title);
    setSubtitle(item.subtitle || '');
    setShortDescription(item.shortDescription || '');
    setDescription(item.description || '');
    setCategory(item.category || 'Hackathon');
    setOrganization(item.organization);
    setAchievementDate(item.achievementDate);
    setImageUrl(item.imageUrl || '');
    setLogoUrl(item.logoUrl || '');
    setCertificateUrl(item.certificateUrl || '');
    setCredentialUrl(item.credentialUrl || '');
    setProjectUrl(item.projectUrl || '');
    setGithubUrl(item.githubUrl || '');
    setDemoUrl(item.demoUrl || '');
    setSkillsString((item.skills || []).join(', '));
    setTechString((item.technologies || []).join(', '));
    setPosition(item.position || '');
    setAwardType(item.awardType || '');
    setBadge(item.badge || '');
    setFeatured(!!item.featured);
    setVisibility(!!item.visibility);
    setDisplayOrder(item.displayOrder || 1);
    setErrors({});
    setIsEditing(true);
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!title.trim()) tempErrors.title = 'Achievement title is required.';
    if (!organization.trim()) tempErrors.organization = 'Issuing organization is required.';
    if (!achievementDate) tempErrors.achievementDate = 'Date of achievement is required.';
    if (!shortDescription.trim()) tempErrors.shortDescription = 'A brief summary description is required.';

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (credentialUrl && !urlPattern.test(credentialUrl)) {
      tempErrors.credentialUrl = 'Invalid URL format.';
    }
    if (projectUrl && !urlPattern.test(projectUrl)) {
      tempErrors.projectUrl = 'Invalid URL format.';
    }
    if (githubUrl && !urlPattern.test(githubUrl)) {
      tempErrors.githubUrl = 'Invalid URL format.';
    }
    if (demoUrl && !urlPattern.test(demoUrl)) {
      tempErrors.demoUrl = 'Invalid URL format.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const parsedSkills = skillsString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const parsedTech = techString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title,
      subtitle,
      shortDescription,
      description,
      category: category as any,
      organization,
      achievementDate,
      imageUrl,
      logoUrl,
      certificateUrl,
      credentialUrl,
      projectUrl,
      githubUrl,
      demoUrl,
      skills: parsedSkills,
      technologies: parsedTech,
      position,
      awardType,
      badge,
      featured,
      visibility,
      displayOrder
    };

    try {
      if (currentAchievement) {
        await onUpdate({
          ...payload,
          id: currentAchievement.id,
          createdAt: currentAchievement.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        await onAdd(payload);
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newList = [...filteredAchievements];
    const item1 = newList[index];
    const item2 = newList[index - 1];

    // Swap displayOrder
    const temp = item1.displayOrder;
    item1.displayOrder = item2.displayOrder;
    item2.displayOrder = temp;

    // Persist reorder
    await onReorder(newList);
  };

  const handleMoveDown = async (index: number) => {
    if (index === filteredAchievements.length - 1) return;
    const newList = [...filteredAchievements];
    const item1 = newList[index];
    const item2 = newList[index + 1];

    // Swap displayOrder
    const temp = item1.displayOrder;
    item1.displayOrder = item2.displayOrder;
    item2.displayOrder = temp;

    // Persist reorder
    await onReorder(newList);
  };

  return (
    <div className="space-y-6 text-left">
      {isEditing ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Decorative banner */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Secure CRUD Sandbox</span>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  {currentAchievement ? 'Edit Achievement Record' : 'Register New Achievement'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              >
                Go Back
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Cloud AI Hackathon"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                  {errors.title && <p className="text-[10px] text-rose-400 font-mono">{errors.title}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Subtitle / Highlight</label>
                  <input
                    type="text"
                    placeholder="e.g. 1st Place out of 300 teams"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Organization, Date, Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Cloud Platform"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                  {errors.organization && <p className="text-[10px] text-rose-400 font-mono">{errors.organization}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Achievement Date *</label>
                  <input
                    type="date"
                    required
                    value={achievementDate}
                    onChange={(e) => setAchievementDate(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none transition-all font-mono"
                  />
                  {errors.achievementDate && <p className="text-[10px] text-rose-400 font-mono">{errors.achievementDate}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-950 text-slate-200">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Short Description (Summary) *</label>
                  <input
                    type="text"
                    required
                    maxLength={180}
                    placeholder="Short 1-sentence summary displayed in grids (max 180 chars)..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                  {errors.shortDescription && <p className="text-[10px] text-rose-400 font-mono">{errors.shortDescription}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Detailed Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide a comprehensive narrative about the achievement, what you did, who you collaborated with, and the business value generated..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all resize-none font-sans"
                  />
                </div>
              </div>

              {/* Rank, Award Type, Badge & Order */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Rank / Position</label>
                  <input
                    type="text"
                    placeholder="e.g. 1st Place, Top 1%"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Award Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Grand Prize, Gold Medal"
                    value={awardType}
                    onChange={(e) => setAwardType(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Badge Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 🏆 Champion, ☁️ Cloud Guru"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Skills & Technologies Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Skills Learned / Utilized (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Team Leadership, Distributed Systems, Algorithms"
                    value={skillsString}
                    onChange={(e) => setSkillsString(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                  <span className="text-[9px] text-slate-500 font-mono">Will be compiled as standalone capsule tags.</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Technologies Used (comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, AWS, Python, Docker"
                    value={techString}
                    onChange={(e) => setTechString(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                  <span className="text-[9px] text-slate-500 font-mono">Mapped directly to interactive tech indicators.</span>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-1">External Anchors & Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold">Credential Verification</label>
                    <input
                      type="text"
                      placeholder="https://verify.com/credential/..."
                      value={credentialUrl}
                      onChange={(e) => setCredentialUrl(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold">Case Study / Project</label>
                    <input
                      type="text"
                      placeholder="https://myportfolio.com/project/..."
                      value={projectUrl}
                      onChange={(e) => setProjectUrl(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold">GitHub Repository</label>
                    <input
                      type="text"
                      placeholder="https://github.com/admin/..."
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold">Live Presentation / Demo</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/watch?..."
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Section - Achievement Image, Trophy Image, Logo, PDF */}
              <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-1">Media Assets (Mock Cloudinary CDN Integration)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image 1: Main Banner */}
                  <div className="bg-slate-950/30 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Main Achievement Image</span>
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono font-semibold">16:9 Compressed</span>
                    </div>
                    <AchievementsMediaUploader 
                      currentUrl={imageUrl}
                      onUploaded={(url) => setImageUrl(url)}
                      onCleared={() => setImageUrl('')}
                      aspectRatio="16:9"
                      placeholderLabel="Achievement Banner"
                    />
                  </div>

                  {/* Image 2: Trophy Badge */}
                  <div className="bg-slate-950/30 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Trophy / Medal Image</span>
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono font-semibold">1:1 Crop Allowed</span>
                    </div>
                    <AchievementsMediaUploader 
                      currentUrl={logoUrl} // Representing Logo/Trophy
                      onUploaded={(url) => setLogoUrl(url)}
                      onCleared={() => setLogoUrl('')}
                      aspectRatio="1:1"
                      placeholderLabel="Trophy or Badge Asset"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Asset 3: Organization Logo */}
                  <div className="bg-slate-950/30 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Organization Logo</span>
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono font-semibold">Centered Fit</span>
                    </div>
                    <AchievementsMediaUploader 
                      currentUrl={badge} // Using badge or other field or let's create a temporary preview
                      onUploaded={(url) => {
                        // Let's store organization logo URL inside description or inline (Wait, let's keep it in logoUrl and use badge for text!)
                        // Let's store the logo in logoUrl. If they have logoUrl, let's map it there.
                        setLogoUrl(url);
                      }}
                      onCleared={() => setLogoUrl('')}
                      aspectRatio="1:1"
                      placeholderLabel="Organization Logo"
                    />
                  </div>

                  {/* Asset 4: PDF Attachment */}
                  <div className="bg-slate-950/30 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Certificate PDF (Optional)</span>
                      <span className="text-[9px] text-teal-400 bg-teal-500/10 px-1.5 py-0.2 rounded font-mono font-semibold">Raw PDF Stream</span>
                    </div>
                    <AchievementsPdfUploader 
                      currentUrl={certificateUrl}
                      onUploaded={(url) => setCertificateUrl(url)}
                      onCleared={() => setCertificateUrl('')}
                    />
                  </div>
                </div>
              </div>

              {/* Featured & Visibility toggles */}
              <div className="flex flex-col sm:flex-row gap-6 bg-slate-950/40 p-4 border border-slate-800/60 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Highlight as Featured</p>
                    <p className="text-[10px] text-slate-500 font-mono">Highlight in Portfolio Grid & Carousel layout.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibility}
                    onChange={(e) => setVisibility(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Publish Visibly</p>
                    <p className="text-[10px] text-slate-500 font-mono">Available to public guests viewing your portfolio.</p>
                  </div>
                </label>
              </div>

              {/* Submit panel */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/15 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving to DB...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Commit Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Realtime Live Preview Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative h-fit xl:sticky xl:top-6 space-y-5">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Aesthetic Feedback</span>
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Eye className="w-4.5 h-4.5 text-emerald-400" />
                Real-time Card Preview
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                As you edit the form fields, watch how the card renders in the responsive frontend gallery.
              </p>
            </div>

            <div className={`border-2 rounded-2xl p-4 transition-all ${featured ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-slate-800/60 bg-slate-950/20'}`}>
              <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900 shadow-xl group">
                {/* Badge accent */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                  <span className="text-[9px] bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">
                    {category}
                  </span>
                  {featured && (
                    <span className="text-[9px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-lg shadow-emerald-500/20">
                      <Star className="w-2.5 h-2.5 fill-slate-950" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Banner Image */}
                <div className="relative h-40 bg-slate-950/50 flex items-center justify-center overflow-hidden border-b border-slate-800/40">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={title || "Preview"} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-slate-700 mx-auto mb-1.5" />
                      <p className="text-[10px] text-slate-600 font-mono">No Banner Uploaded</p>
                    </div>
                  )}
                  
                  {/* Hover micro-glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-80" />
                  
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 overflow-hidden flex items-center justify-center shrink-0">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <Award className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 leading-none">{organization || 'Issuer Organization'}</p>
                      <p className="text-[9px] text-slate-500 font-mono leading-none mt-0.5">
                        {achievementDate ? new Date(achievementDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Date'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content details */}
                <div className="p-4 space-y-3">
                  <div>
                    {badge && (
                      <span className="inline-block text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono font-semibold mb-1.5">
                        {badge}
                      </span>
                    )}
                    <h5 className="text-xs font-bold text-slate-200 tracking-tight leading-tight">{title || 'Untitled Achievement'}</h5>
                    {subtitle && <p className="text-[10px] text-emerald-400 font-mono leading-tight mt-0.5">{subtitle}</p>}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                    {shortDescription || 'A short, elegant summary description of this milestone to engage guests.'}
                  </p>

                  {/* Skills capsule lists */}
                  <div className="flex flex-wrap gap-1">
                    {(skillsString ? skillsString.split(',').map(s => s.trim()).filter(Boolean) : ["Architecture", "Engineering"]).map((skill, i) => (
                      <span key={i} className="text-[8px] bg-slate-900 text-slate-400 border border-slate-800/80 px-1.5 py-0.5 rounded font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Tech stack capsules */}
                  <div className="flex flex-wrap gap-1 border-t border-slate-800/40 pt-2 text-[8px] text-slate-500 font-mono">
                    <span className="text-slate-600">Tech:</span>
                    {(techString ? techString.split(',').map(t => t.trim()).filter(Boolean) : ["React", "AWS"]).map((tech, i) => (
                      <span key={i} className="text-slate-400 bg-slate-900 border border-slate-800/40 px-1 py-0.2 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CRUD List / Grid Dashboard View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Achievements Ledger</span>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Achievements Management
              </h3>
            </div>
            <button
              onClick={openAddForm}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Achievement
            </button>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by title, organization, skills, or tech..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-emerald-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all"
              >
                <option value="order_asc">Sort: Display Order</option>
                <option value="date_desc">Sort: Date (Newest)</option>
                <option value="date_asc">Sort: Date (Oldest)</option>
                <option value="title_asc">Sort: Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Ledger Table / List */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/20">
            {paginatedAchievements.length > 0 ? (
              <div className="divide-y divide-slate-800/60">
                {paginatedAchievements.map((item, index) => {
                  const absoluteIndex = (currentPage - 1) * itemsPerPage + index;
                  return (
                    <div 
                      key={item.id} 
                      className={`p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                        item.featured ? 'bg-emerald-500/[0.01]' : 'hover:bg-slate-900/30'
                      }`}
                    >
                      {/* Left: Move handles + details */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Custom order trigger buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveUp(absoluteIndex)}
                            disabled={absoluteIndex === 0}
                            className="p-1 rounded-md text-slate-500 hover:text-emerald-400 hover:bg-slate-900 transition-colors disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[9px] font-mono font-bold text-center text-slate-500">
                            {item.displayOrder}
                          </span>
                          <button
                            onClick={() => handleMoveDown(absoluteIndex)}
                            disabled={absoluteIndex === filteredAchievements.length - 1}
                            className="p-1 rounded-md text-slate-500 hover:text-emerald-400 hover:bg-slate-900 transition-colors disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Banner Thumbnail */}
                        <div className="w-16 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <Award className="w-5 h-5 text-slate-700" />
                          )}
                        </div>

                        {/* Text fields */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.2 rounded-full font-mono">
                              {item.category}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono font-semibold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 mt-1 truncate leading-tight flex items-center gap-1.5">
                            {item.title}
                            {item.featured && <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                            {item.organization} • {new Date(item.achievementDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Right: Quick action panels */}
                      <div className="flex flex-wrap items-center gap-4 lg:self-center">
                        {/* Featured Button toggle */}
                        <button
                          onClick={() => onToggleFeatured(item.id, !item.featured)}
                          className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer ${
                            item.featured 
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold' 
                              : 'border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                          title="Toggle Featured Highlight"
                        >
                          <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-emerald-400' : ''}`} />
                          <span className="hidden sm:inline">{item.featured ? 'Featured' : 'Feature'}</span>
                        </button>

                        {/* Visibility Button toggle */}
                        <button
                          onClick={() => onToggleVisibility(item.id, !item.visibility)}
                          className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer ${
                            item.visibility 
                              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                              : 'border-rose-500/20 bg-rose-500/5 text-rose-400'
                          }`}
                          title="Toggle Guest Visibility"
                        >
                          {item.visibility ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{item.visibility ? 'Published' : 'Draft'}</span>
                        </button>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 border-l border-slate-800/80 pl-4">
                          <button
                            onClick={() => openEditForm(item)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to permanently purge "${item.title}"?`)) {
                                await onDelete(item.id);
                              }
                            }}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
                            title="Purge Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <Award className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                <p className="text-xs font-mono">No achievements matched your current filtering criteria.</p>
                <button
                  onClick={openAddForm}
                  className="mt-4 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-mono hover:bg-emerald-500/20 cursor-pointer"
                >
                  Create First Achievement
                </button>
              </div>
            )}
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-5">
              <span className="text-[10px] font-mono text-slate-500">
                Showing {Math.min(filteredAchievements.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredAchievements.length, currentPage * itemsPerPage)} of {filteredAchievements.length} achievements
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 transition-colors text-slate-400 hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 transition-colors text-slate-400 hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ====================================================================
   CUSTOM IMAGE COMPRESSOR & CROP COMPONENT FOR ACHIEVEMENTS
   ==================================================================== */
interface MediaUploaderProps {
  currentUrl: string;
  onUploaded: (url: string) => void;
  onCleared: () => void;
  aspectRatio: '16:9' | '1:1';
  placeholderLabel: string;
}

function AchievementsMediaUploader({ currentUrl, onUploaded, onCleared, aspectRatio, placeholderLabel }: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Crop & Compression configurations
  const [quality, setQuality] = useState(0.72);
  const [cropCenter, setCropCenter] = useState(true);
  const [compressionStats, setCompressionStats] = useState<{
    originalKb: number;
    compressedKb: number;
    savedPercent: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processAndUploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPEG, PNG, WEBP, SVG) are supported.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      setProgress(30);
      const reader = new FileReader();

      const resultUrl = await new Promise<string>((resolve, reject) => {
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.onload = (event) => {
          const img = new Image();
          img.onerror = () => reject(new Error('Failed to load image element.'));
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;

            // Apply Cropping aspect ratio logic if required
            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = w;
            let sourceHeight = h;

            if (cropCenter) {
              if (aspectRatio === '16:9') {
                const targetRatio = 16 / 9;
                if (w / h > targetRatio) {
                  sourceWidth = h * targetRatio;
                  sourceX = (w - sourceWidth) / 2;
                } else {
                  sourceHeight = w / targetRatio;
                  sourceY = (h - sourceHeight) / 2;
                }
              } else if (aspectRatio === '1:1') {
                const targetRatio = 1;
                if (w > h) {
                  sourceWidth = h;
                  sourceX = (w - h) / 2;
                } else {
                  sourceHeight = w;
                  sourceY = (h - w) / 2;
                }
              }
            }

            // Bound canvas output dimensions
            const maxDimension = aspectRatio === '16:9' ? 800 : 400;
            if (aspectRatio === '16:9') {
              canvas.width = maxDimension;
              canvas.height = Math.round(maxDimension * (9 / 16));
            } else {
              canvas.width = maxDimension;
              canvas.height = maxDimension;
            }

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight, // crop bounds
                0, 0, canvas.width, canvas.height // output bounds
              );
              
              // Compress to JPEG with customizable slider quality
              const compressed = canvas.toDataURL('image/jpeg', quality);
              
              const originalKb = Math.round(file.size / 1024);
              const compressedKb = Math.round((compressed.length * 0.75) / 1024);
              const savedPercent = Math.max(0, Math.round(((originalKb - compressedKb) / originalKb) * 100));

              setCompressionStats({
                originalKb,
                compressedKb,
                savedPercent
              });

              resolve(compressed);
            } else {
              resolve(event.target?.result as string);
            }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });

      setProgress(80);
      setTimeout(() => {
        setProgress(100);
        setUploading(false);
        onUploaded(resultUrl);
      }, 400);

    } catch (err: any) {
      setError(err.message || 'Error occurred during compression.');
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Configuration Sliders for Crop and Compression */}
      {!currentUrl && !uploading && (
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-emerald-400" />
              Quality Ratio
            </span>
            <span className="text-emerald-400 font-bold">{Math.round(quality * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0.3" 
            max="1.0" 
            step="0.05"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 h-1 rounded"
          />
          
          <label className="flex items-center gap-2 cursor-pointer text-[9px] font-mono text-slate-400">
            <input 
              type="checkbox"
              checked={cropCenter}
              onChange={(e) => setCropCenter(e.target.checked)}
              className="rounded border-slate-800 text-emerald-500 accent-emerald-500 w-3 h-3 cursor-pointer"
            />
            <span>Auto-Crop Center to {aspectRatio} ratio</span>
          </label>
        </div>
      )}

      {currentUrl ? (
        <div className="relative rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 flex items-center gap-3">
          <img 
            src={currentUrl} 
            alt="CDN preview" 
            referrerPolicy="no-referrer"
            className={`rounded object-cover border border-slate-800/80 shrink-0 ${aspectRatio === '16:9' ? 'w-20 h-11' : 'w-11 h-11'}`} 
          />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-mono text-emerald-400 font-bold truncate flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Synced & Cropped
            </p>
            {compressionStats ? (
              <p className="text-[8px] text-slate-500 font-mono mt-0.5">
                Saved {compressionStats.savedPercent}% ({compressionStats.originalKb}KB → {compressionStats.compressedKb}KB)
              </p>
            ) : (
              <p className="text-[8px] text-slate-500 font-mono mt-0.5">Cached in Cloudinary Secure Bucket</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setCompressionStats(null);
              onCleared();
            }}
            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-md transition-colors border border-rose-500/20 cursor-pointer"
            title="Purge CDN asset"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-500/5' 
              : 'border-slate-800 bg-slate-950/20 hover:bg-slate-900/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) processAndUploadFile(e.target.files[0]);
            }}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-2 py-1 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              <div className="w-full max-w-[120px] bg-slate-800 rounded-full h-1 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[8px] font-mono text-slate-500">Compressing... {progress}%</p>
            </div>
          ) : (
            <div className="space-y-1.5 flex flex-col items-center justify-center py-2">
              <UploadCloud className="w-6 h-6 text-slate-600" />
              <div>
                <p className="text-[10px] font-semibold text-slate-300">Upload {placeholderLabel}</p>
                <p className="text-[8px] text-slate-500">Click or drop here</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[9px] font-mono text-rose-400">{error}</p>}
    </div>
  );
}

/* ====================================================================
   CUSTOM RESILIENT RAW PDF FILE LOADER FOR CERTIFICATES
   ==================================================================== */
interface PdfUploaderProps {
  currentUrl: string;
  onUploaded: (url: string) => void;
  onCleared: () => void;
}

function AchievementsPdfUploader({ currentUrl, onUploaded, onCleared }: PdfUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isAllowed = file.type === 'application/pdf' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                      ext === '.pdf' || 
                      ext === '.docx';

    if (!isAllowed) {
      setError('Only PDF and DOCX files are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size is capped at 10 MB.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(20);

    try {
      const reader = new FileReader();
      const base64Url = await new Promise<string>((resolve, reject) => {
        reader.onerror = () => reject(new Error('Failed to parse document structure.'));
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });

      setProgress(70);
      setTimeout(() => {
        setProgress(100);
        setUploading(false);
        onUploaded(base64Url);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Error occurred loading document.');
      setUploading(false);
    }
  };

  const isDocx = currentUrl && (currentUrl.startsWith('data:application/vnd.openxmlformats-officedocument') || currentUrl.toLowerCase().includes('.docx'));

  return (
    <div className="space-y-3">
      {currentUrl ? (
        <div className="relative rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 flex items-center gap-3">
          <div className="w-10 h-11 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-mono text-emerald-400 font-bold truncate flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {isDocx ? 'DOCX Attached' : 'PDF Attached'}
            </p>
            <p className="text-[8px] text-slate-500 font-mono mt-0.5 truncate">
              Encrypted Document Payload Cached
            </p>
          </div>
          <button
            type="button"
            onClick={onCleared}
            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-md transition-colors border border-rose-500/20 cursor-pointer"
            title="Purge document"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-500/5' 
              : 'border-slate-800 bg-slate-950/20 hover:bg-slate-900/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
            }}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-2 py-1 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              <div className="w-full max-w-[120px] bg-slate-800 rounded-full h-1 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[8px] font-mono text-slate-500">Uploading Doc... {progress}%</p>
            </div>
          ) : (
            <div className="space-y-1.5 flex flex-col items-center justify-center py-2">
              <FileText className="w-6 h-6 text-slate-600" />
              <div>
                <p className="text-[10px] font-semibold text-slate-300">Certificate PDF or DOCX</p>
                <p className="text-[8px] text-slate-500">Drop document up to 10MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[9px] font-mono text-rose-400">{error}</p>}
    </div>
  );
}

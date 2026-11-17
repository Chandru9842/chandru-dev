import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpenCheck, Plus, Edit2, Trash2, Eye, EyeOff,
  Save, X, ExternalLink, Search, CheckCircle2,
  Clock, Tag, Sparkles, Layers,
  GripVertical, ChevronUp, ChevronDown, Folder, Edit3, Check,
  Copy, Sliders, Image as ImageIcon, Code2, ListChecks
} from 'lucide-react';
import { ArticleItem } from '../../data/cmsMockData';
import ImageUploader from '../ImageUploader';
import MediaLibraryModal from './MediaLibraryModal';
import { notifyCmsUpdate } from '../../utils/notifyCmsSync';

interface ArticlesPageProps {
  articles: ArticleItem[];
  onAdd: (item: Omit<ArticleItem, 'id' | 'publishedAt' | 'updatedAt' | 'viewsCount'>) => Promise<void>;
  onUpdate: (item: ArticleItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleStatus: (id: number, isPublished: boolean) => Promise<void>;
  onReorder?: (reorderedList: ArticleItem[]) => Promise<void>;
}

export const PRESET_CATEGORIES = [
  'System Design',
  'Java Engineering',
  'Database Architecture',
  'Microservices',
  'Cloud & DevOps',
  'High Concurrency & Kafka'
];

export default function ArticlesPage({
  articles,
  onAdd,
  onUpdate,
  onDelete,
  onToggleStatus,
  onReorder
}: ArticlesPageProps) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Inline iframe-safe delete confirmation states (No window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<string | null>(null);

  // Media Library Modal Target
  const [mediaModalTarget, setMediaModalTarget] = useState<'cover' | 'avatar' | null>(null);

  // Section Header Customization State (Synced with /api/profile)
  const [showSectionHeaderConfig, setShowSectionHeaderConfig] = useState(false);
  const [articlesBadge, setArticlesBadge] = useState('Thought Leadership & Publications');
  const [articlesHeading, setArticlesHeading] = useState('Engineering Monographs & System Design Papers');
  const [articlesSubtitle, setArticlesSubtitle] = useState(
    'Deep dives into high-throughput distributed systems, Java 21 Virtual Threads, Kafka event streams, zero-downtime database migrations, and cloud scalability.'
  );
  const [savingHeaderConfig, setSavingHeaderConfig] = useState(false);
  const [headerSavedSuccess, setHeaderSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          if (data.articlesBadge !== undefined) setArticlesBadge(data.articlesBadge);
          if (data.articlesHeading !== undefined) setArticlesHeading(data.articlesHeading);
          if (data.articlesSubtitle !== undefined) setArticlesSubtitle(data.articlesSubtitle);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSectionHeader = async () => {
    setSavingHeaderConfig(true);
    setHeaderSavedSuccess(false);
    try {
      const token =
        localStorage.getItem('admin_jwt_token') ||
        sessionStorage.getItem('admin_jwt_token') ||
        '';
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          articlesBadge,
          articlesHeading,
          articlesSubtitle,
        }),
      });
      if (res.ok) {
        notifyCmsUpdate();
        setHeaderSavedSuccess(true);
        showToast('Saved Articles section header settings.');
        setTimeout(() => setHeaderSavedSuccess(false), 2500);
      }
    } catch (e) {
      console.error('Failed to save Articles section header:', e);
    } finally {
      setSavingHeaderConfig(false);
    }
  };

  // Custom Category Input Mode in Form
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Category Manager State (Rename / Add / Delete)
  const [newCatName, setNewCatName] = useState('');
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [renameCatValue, setRenameCatValue] = useState('');
  const [categoryActionFeedback, setCategoryActionFeedback] = useState<string | null>(null);

  // Custom Categories list stored locally
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cms_custom_article_categories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cms_custom_article_categories', JSON.stringify(customCategories));
    } catch {}
  }, [customCategories]);

  // Combined Unique Category List
  const allCategories = useMemo(() => {
    const articleCats = articles.map((a) => a.category).filter(Boolean);
    const combined = Array.from(new Set([...PRESET_CATEGORIES, ...customCategories, ...articleCats]));
    return combined.sort((a, b) => a.localeCompare(b));
  }, [articles, customCategories]);

  // Drag & drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    executiveSummary: '',
    keyTakeaways: [] as string[],
    externalUrl: '',
    readingDifficulty: 'Advanced Architecture',
    content: '',
    coverImageUrl: '',
    category: 'System Design',
    tags: [] as string[],
    tagInput: '',
    readTimeMinutes: 6,
    isPublished: true,
    isFeatured: false,
    displayOrder: 1,
    author: 'Chandru Mohan',
    authorRole: 'Principal Systems Architect',
    authorAvatar: ''
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered & ordered list
  const filteredArticles = useMemo(() => {
    const sorted = [...articles].sort(
      (a, b) => (a.displayOrder ?? a.order ?? 999) - (b.displayOrder ?? b.order ?? 999)
    );
    return sorted.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (item.title || '').toLowerCase().includes(q) ||
        (item.excerpt || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.executiveSummary || '').toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'published'
          ? item.isPublished
          : filterStatus === 'draft'
          ? !item.isPublished
          : Boolean(item.isFeatured);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [articles, searchTerm, filterCategory, filterStatus]);

  // Metrics
  const totalArticles = articles.length;
  const publishedCount = articles.filter((a) => a.isPublished).length;
  const featuredCount = articles.filter((a) => a.isFeatured).length;
  const totalViews = articles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setIsCustomCategoryMode(false);
    setCustomCategoryInput('');
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      executiveSummary: '',
      keyTakeaways: [
        'Sub-millisecond p99 latency achieved through lock-free ring buffers and read-through Redis caching',
        'Strict idempotency guarantees across distributed Kafka consumer groups'
      ],
      externalUrl: '',
      readingDifficulty: 'Advanced Architecture',
      content: `## Architectural Overview\n\nExplain the production problem statement, scale constraints, and architectural trade-offs here.\n\n### Core System Design\n- High-throughput concurrency patterns with Java 21 Virtual Threads\n- Fault-tolerant event streaming and dead-letter queue recovery\n\n\`\`\`java\npublic final class DistributedEventProcessor {\n    public CompletableFuture<Ack> dispatch(EventPayload payload) {\n        return CompletableFuture.completedFuture(Ack.verified());\n    }\n}\n\`\`\`\n\n### Production Benchmark Outcomes\nSummarize latency reductions, throughput gains, and operational telemetry.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      category: 'System Design',
      tags: ['Java 21', 'Spring Boot', 'System Design'],
      tagInput: '',
      readTimeMinutes: 6,
      isPublished: true,
      isFeatured: false,
      displayOrder: articles.length + 1,
      author: 'Chandru Mohan',
      authorRole: 'Principal Systems Architect',
      authorAvatar: ''
    });
    setEditorTab('write');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ArticleItem) => {
    setEditingId(item.id);
    const isCustom = !PRESET_CATEGORIES.includes(item.category);
    setIsCustomCategoryMode(isCustom);
    setCustomCategoryInput(isCustom ? item.category : '');
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      excerpt: item.excerpt || '',
      executiveSummary: item.executiveSummary || '',
      keyTakeaways: Array.isArray(item.keyTakeaways) ? [...item.keyTakeaways] : [],
      externalUrl: item.externalUrl || '',
      readingDifficulty: item.readingDifficulty || 'Advanced Architecture',
      content: item.content || '',
      coverImageUrl: item.coverImageUrl || '',
      category: item.category || 'System Design',
      tags: Array.isArray(item.tags) ? [...item.tags] : [],
      tagInput: '',
      readTimeMinutes: item.readTimeMinutes || 5,
      isPublished: item.isPublished !== false,
      isFeatured: Boolean(item.isFeatured),
      displayOrder:
        item.displayOrder ??
        item.order ??
        articles.findIndex((a) => a.id === item.id) + 1,
      author: item.author || 'Chandru Mohan',
      authorRole: item.authorRole || 'Principal Systems Architect',
      authorAvatar: item.authorAvatar || ''
    });
    setEditorTab('write');
    setIsFormOpen(true);
  };

  const handleDuplicateArticle = async (article: ArticleItem) => {
    const { id: _id, publishedAt: _p, updatedAt: _u, viewsCount: _v, ...rest } = article;
    await onAdd({
      ...rest,
      title: `${article.title} (Copy)`,
      slug: `${article.slug}-copy-${Date.now().toString().slice(-4)}`,
      displayOrder: articles.length + 1,
      isPublished: false
    });
    notifyCmsUpdate();
    showToast('Duplicated article as a new draft.');
  };

  const handleQuickToggleFeatured = async (article: ArticleItem) => {
    await onUpdate({
      ...article,
      isFeatured: !article.isFeatured,
      updatedAt: new Date().toISOString()
    });
    notifyCmsUpdate();
    showToast(
      !article.isFeatured
        ? 'Marked article as Featured Monograph.'
        : 'Removed Featured status.'
    );
  };

  const handleMoveUp = async (id: number) => {
    if (!onReorder) return;
    const currentIndex = articles.findIndex((a) => a.id === id);
    if (currentIndex <= 0) return;

    const newList = [...articles];
    const temp = newList[currentIndex];
    newList[currentIndex] = newList[currentIndex - 1];
    newList[currentIndex - 1] = temp;

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
      order: idx + 1
    }));
    await onReorder(reordered);
    notifyCmsUpdate();
    showToast('Updated article priority rank.');
  };

  const handleMoveDown = async (id: number) => {
    if (!onReorder) return;
    const currentIndex = articles.findIndex((a) => a.id === id);
    if (currentIndex === -1 || currentIndex >= articles.length - 1) return;

    const newList = [...articles];
    const temp = newList[currentIndex];
    newList[currentIndex] = newList[currentIndex + 1];
    newList[currentIndex + 1] = temp;

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
      order: idx + 1
    }));
    await onReorder(reordered);
    notifyCmsUpdate();
    showToast('Updated article priority rank.');
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    setDragOverId(null);
    if (draggedId === null || draggedId === targetId || !onReorder) {
      setDraggedId(null);
      return;
    }

    const sourceIdx = articles.findIndex((item) => item.id === draggedId);
    const targetIdx = articles.findIndex((item) => item.id === targetId);

    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedId(null);
      return;
    }

    const newList = [...articles];
    const [movedItem] = newList.splice(sourceIdx, 1);
    newList.splice(targetIdx, 0, movedItem);

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
      order: idx + 1
    }));

    setDraggedId(null);
    await onReorder(reordered);
    notifyCmsUpdate();
    showToast('Article position updated.');
  };

  const handleAddTag = () => {
    if (!formData.tagInput.trim()) return;
    const newTag = formData.tagInput.trim();
    if (!formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
        tagInput: ''
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove)
    });
  };

  const insertMarkdownSnippet = (snippet: string) => {
    setFormData((prev) => ({
      ...prev,
      content: `${prev.content}\n\n${snippet}`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Title and Content are required.');
      return;
    }

    let finalCategory = formData.category;
    if (isCustomCategoryMode && customCategoryInput.trim()) {
      finalCategory = customCategoryInput.trim();
      if (!customCategories.includes(finalCategory)) {
        setCustomCategories((prev) => [...prev, finalCategory]);
      }
    }

    const computedSlug = formData.slug.trim() || generateSlug(formData.title);
    const wordCount = formData.content.trim().split(/\s+/).length;
    const computedReadTime =
      formData.readTimeMinutes > 0
        ? Number(formData.readTimeMinutes)
        : Math.max(1, Math.ceil(wordCount / 200));

    const cleanedTakeaways = formData.keyTakeaways
      .map((k) => k.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      if (editingId !== null) {
        const existing = articles.find((a) => a.id === editingId);
        await onUpdate({
          id: editingId,
          ...formData,
          executiveSummary: formData.executiveSummary.trim(),
          keyTakeaways: cleanedTakeaways,
          externalUrl: formData.externalUrl.trim(),
          readingDifficulty: formData.readingDifficulty,
          category: finalCategory,
          slug: computedSlug,
          readTimeMinutes: computedReadTime,
          viewsCount: existing?.viewsCount || 0,
          publishedAt: existing?.publishedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        notifyCmsUpdate();
        showToast('Article updated and synced to live portfolio.');
      } else {
        await onAdd({
          ...formData,
          executiveSummary: formData.executiveSummary.trim(),
          keyTakeaways: cleanedTakeaways,
          externalUrl: formData.externalUrl.trim(),
          readingDifficulty: formData.readingDifficulty,
          category: finalCategory,
          slug: computedSlug,
          readTimeMinutes: computedReadTime
        });
        notifyCmsUpdate();
        showToast('New technical article published.');
      }
      setIsFormOpen(false);
    } catch (err) {
      showToast('Failed to save article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmAndDeleteArticle = async (id: number) => {
    try {
      await onDelete(id);
      setConfirmDeleteId(null);
      notifyCmsUpdate();
      showToast('Article deleted.');
    } catch (err) {
      showToast('Failed to delete article.');
    }
  };

  // Category Management Actions
  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCatName.trim();
    if (!clean) return;
    if (allCategories.includes(clean)) {
      setCategoryActionFeedback('Category already exists.');
      return;
    }
    setCustomCategories((prev) => [...prev, clean]);
    setNewCatName('');
    setCategoryActionFeedback(`Added "${clean}" category.`);
    setTimeout(() => setCategoryActionFeedback(null), 3000);
  };

  const handleRenameCategory = async (oldCategory: string) => {
    const cleanNew = renameCatValue.trim();
    if (!cleanNew || cleanNew === oldCategory) {
      setEditingCategoryKey(null);
      return;
    }

    setCustomCategories((prev) => prev.map((c) => (c === oldCategory ? cleanNew : c)));

    const affectedArticles = articles.filter((a) => a.category === oldCategory);
    if (affectedArticles.length > 0) {
      try {
        for (const art of affectedArticles) {
          await onUpdate({
            ...art,
            category: cleanNew,
            updatedAt: new Date().toISOString()
          });
        }
        notifyCmsUpdate();
        setCategoryActionFeedback(
          `Renamed "${oldCategory}" to "${cleanNew}" across ${affectedArticles.length} article(s).`
        );
      } catch (err) {
        setCategoryActionFeedback('Error updating some articles.');
      }
    } else {
      setCategoryActionFeedback(`Renamed "${oldCategory}" to "${cleanNew}".`);
    }

    setEditingCategoryKey(null);
    setRenameCatValue('');
    setTimeout(() => setCategoryActionFeedback(null), 4000);
  };

  const executeDeleteCategory = async (catToDelete: string) => {
    const affectedArticles = articles.filter((a) => a.category === catToDelete);
    if (affectedArticles.length > 0) {
      for (const art of affectedArticles) {
        await onUpdate({
          ...art,
          category: 'System Design',
          updatedAt: new Date().toISOString()
        });
      }
      notifyCmsUpdate();
    }

    setCustomCategories((prev) => prev.filter((c) => c !== catToDelete));
    setConfirmDeleteCategory(null);
    setCategoryActionFeedback(
      affectedArticles.length > 0
        ? `Reassigned ${affectedArticles.length} article(s) to "System Design" and removed "${catToDelete}".`
        : `Category "${catToDelete}" removed.`
    );
    setTimeout(() => setCategoryActionFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs font-mono font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Admin Header & Action Bar */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Editorial Publications &amp; Monographs CMS
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] font-mono text-slate-400">
                {publishedCount} Published / {totalArticles} Total
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100">
              Engineering Articles &amp; System Design Publications
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Full control over section headings, executive abstracts, key architectural takeaways, markdown content, cover media, and publication order.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowSectionHeaderConfig((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                showSectionHeaderConfig
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Section Header Text</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Folder className="w-3.5 h-3.5 text-emerald-400" />
              <span>Manage Categories</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/15 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Write New Article</span>
            </button>
          </div>
        </div>

        {/* Collapsible Section Header Customizer */}
        {showSectionHeaderConfig && (
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Customize Portfolio Articles Section Header
                </h4>
                <p className="text-[11px] text-slate-400">
                  Edit the kicker badge, main heading, and subtitle displayed at the top of the #articles section.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveSectionHeader}
                disabled={savingHeaderConfig}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                { headerSavedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved to Portfolio</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingHeaderConfig ? 'Saving...' : 'Save Header Text'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">
                  Section Kicker Badge
                </label>
                <input
                  type="text"
                  value={articlesBadge}
                  onChange={(e) => setArticlesBadge(e.target.value)}
                  placeholder="Thought Leadership & Publications"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">
                  Section Main Heading
                </label>
                <input
                  type="text"
                  value={articlesHeading}
                  onChange={(e) => setArticlesHeading(e.target.value)}
                  placeholder="Engineering Monographs & System Design Papers"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={articlesSubtitle}
                  onChange={(e) => setArticlesSubtitle(e.target.value)}
                  placeholder="Deep dives into distributed systems..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metric KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
            Total Publications
          </span>
          <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block tabular-nums">
            {totalArticles}
          </span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
          <span className="text-[10px] font-mono text-emerald-400 block uppercase tracking-wider">
            Live Published
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block tabular-nums">
            {publishedCount}
          </span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
          <span className="text-[10px] font-mono text-amber-400 block uppercase tracking-wider">
            Featured Monographs
          </span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block tabular-nums">
            {featuredCount}
          </span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
          <span className="text-[10px] font-mono text-sky-400 block uppercase tracking-wider">
            Cumulative Reads
          </span>
          <span className="text-2xl font-bold font-mono text-sky-400 mt-1 block tabular-nums">
            {totalViews}
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, abstract, tags, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Categories ({allCategories.length})</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Status</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="featured">Featured Only</option>
          </select>
        </div>
      </div>

      {/* Articles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/30 border border-slate-800/60 rounded-2xl">
            <BookOpenCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">No matching articles found.</p>
            <p className="text-xs text-slate-500 mt-1">
              Adjust your search filters or author a new engineering publication.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
            >
              + Write New Article
            </button>
          </div>
        ) : (
          filteredArticles.map((article, index) => {
            const isDragging = draggedId === article.id;
            const isOver = dragOverId === article.id;
            const isDraggable = !searchTerm.trim();
            const takeawaysCount = Array.isArray(article.keyTakeaways)
              ? article.keyTakeaways.filter(Boolean).length
              : 0;

            return (
              <div
                key={article.id}
                draggable={isDraggable}
                onDragStart={(e) => isDraggable && handleDragStart(e, article.id)}
                onDragOver={(e) => isDraggable && handleDragOver(e, article.id)}
                onDrop={(e) => isDraggable && handleDrop(e, article.id)}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                className={`bg-slate-900/60 border border-slate-800/90 hover:border-emerald-500/40 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between group ${
                  isDragging ? 'opacity-40 bg-emerald-500/5' : ''
                } ${isOver ? 'ring-2 ring-emerald-500 bg-emerald-500/10' : ''}`}
              >
                <div>
                  {/* Top Priority & Quick Status Bar */}
                  <div className="px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800/70 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`cursor-grab active:cursor-grabbing p-0.5 -ml-1 transition-colors ${
                          isDraggable
                            ? 'text-slate-500 group-hover:text-emerald-400'
                            : 'text-slate-700 cursor-not-allowed'
                        }`}
                        title={
                          isDraggable ? 'Drag to reorder article' : 'Clear search to reorder'
                        }
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-emerald-400 tabular-nums">
                        #{article.displayOrder ?? article.order ?? index + 1}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300 truncate max-w-[130px]">
                        {article.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickToggleFeatured(article)}
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-mono flex items-center gap-1 transition cursor-pointer ${
                          article.isFeatured
                            ? 'bg-amber-500/15 border-amber-400/40 text-amber-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                        title="Toggle Featured Monograph"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{article.isFeatured ? 'Featured' : 'Standard'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveUp(article.id)}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-emerald-400 disabled:opacity-30 transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(article.id)}
                        disabled={index === filteredArticles.length - 1}
                        className="p-1 text-slate-400 hover:text-emerald-400 disabled:opacity-30 transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Cover Image Viewport */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950 border-b border-slate-800/60">
                    {article.coverImageUrl ? (
                      <img
                        src={article.coverImageUrl}
                        alt={article.title}
                        draggable={false}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100 select-none"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-center">
                        <BookOpenCheck className="w-8 h-8 text-emerald-400/50 mb-1.5" />
                        <span className="text-[10px] font-mono text-slate-400">
                          {article.category}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Status Badge */}
                    <button
                      type="button"
                      onClick={() => {
                        onToggleStatus(article.id, !article.isPublished);
                        notifyCmsUpdate();
                      }}
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border cursor-pointer transition ${
                        article.isPublished
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                      }`}
                      title="Click to toggle Published / Draft status"
                    >
                      {article.isPublished ? 'Published' : 'Draft (Hidden)'}
                    </button>

                    {/* Read Time & Views Overlay */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span className="flex items-center gap-1.5 bg-slate-950/85 px-2.5 py-0.5 rounded-md border border-white/[0.08]">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {article.readTimeMinutes || 5} min read
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-950/85 px-2.5 py-0.5 rounded-md border border-white/[0.08]">
                        <Eye className="w-3 h-3 text-sky-400" />
                        {article.viewsCount || 0} reads
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-emerald-300 transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>

                    {(takeawaysCount > 0 || article.executiveSummary) && (
                      <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400/90 pt-0.5">
                        <ListChecks className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {takeawaysCount > 0
                            ? `${takeawaysCount} Key Takeaway${takeawaysCount > 1 ? 's' : ''}`
                            : 'Executive Abstract configured'}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {article.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-md text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 4 && (
                          <span className="text-[10px] font-mono px-1 text-slate-500">
                            +{article.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    By <span className="text-slate-200">{article.author || 'Chandru Mohan'}</span>
                  </div>

                  {confirmDeleteId === article.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => confirmAndDeleteArticle(article.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500 text-slate-950 font-mono font-bold text-[10px] hover:bg-rose-400 cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px] hover:bg-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onToggleStatus(article.id, !article.isPublished);
                          notifyCmsUpdate();
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          article.isPublished
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-amber-400 hover:bg-amber-500/10'
                        }`}
                        title={
                          article.isPublished
                            ? 'Published (Click to switch to Draft)'
                            : 'Draft (Click to Publish)'
                        }
                      >
                        {article.isPublished ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateArticle(article)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate Article"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(article)}
                        className="p-1.5 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(article.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6 flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Folder className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Article Categories Manager</h3>
                  <p className="text-[11px] text-slate-400">
                    Add, rename, or remove publication categories
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategoryKey(null);
                  setConfirmDeleteCategory(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {categoryActionFeedback && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>{categoryActionFeedback}</span>
                </div>
              )}

              <form onSubmit={handleAddNewCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new custom category (e.g. Distributed Consensus)..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold font-mono text-xs rounded-xl transition-all shrink-0 cursor-pointer"
                >
                  Add Category
                </button>
              </form>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {allCategories.map((cat) => {
                  const articleCount = articles.filter((a) => a.category === cat).length;
                  const isEditingThis = editingCategoryKey === cat;

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl gap-2"
                    >
                      {isEditingThis ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={renameCatValue}
                            onChange={(e) => setRenameCatValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameCategory(cat);
                              if (e.key === 'Escape') setEditingCategoryKey(null);
                            }}
                            autoFocus
                            className="flex-1 px-2.5 py-1 bg-slate-900 border border-emerald-500/50 rounded-lg text-xs text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameCategory(cat)}
                            className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategoryKey(null)}
                            className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5">
                            <Tag className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-medium text-slate-200">{cat}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                              {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                            </span>
                          </div>

                          {confirmDeleteCategory === cat ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => executeDeleteCategory(cat)}
                                className="px-2 py-1 rounded bg-rose-500 text-slate-950 font-mono font-bold text-[10px] cursor-pointer"
                              >
                                Confirm Remove
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteCategory(null)}
                                className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategoryKey(cat);
                                  setRenameCatValue(cat);
                                }}
                                className="p-1.5 text-slate-400 hover:text-sky-400 rounded-lg transition-colors cursor-pointer"
                                title="Rename Category"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteCategory(cat)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                title="Remove Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write / Edit Article Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl">
                  <BookOpenCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                    Technical Publication Studio
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    {editingId
                      ? `Edit Article: ${formData.title}`
                      : 'Author New Engineering Monograph'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditorTab('write')}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                      editorTab === 'write'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Editor &amp; Metadata
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('preview')}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                      editorTab === 'preview'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Live Monograph Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              {editorTab === 'write' ? (
                <>
                  {/* Title, Category & Reading Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-xs font-mono text-slate-400 font-semibold">
                        Article Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Architecting High-Throughput Event-Driven Systems"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title: e.target.value,
                            slug: editingId ? formData.slug : generateSlug(e.target.value)
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-mono text-slate-400 font-semibold">
                          Category *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCategoryMode(!isCustomCategoryMode);
                            if (!isCustomCategoryMode) {
                              setCustomCategoryInput(formData.category || '');
                            }
                          }}
                          className="text-[10px] font-mono text-emerald-400 hover:underline cursor-pointer"
                        >
                          {isCustomCategoryMode ? 'Select preset' : '+ Custom'}
                        </button>
                      </div>

                      {isCustomCategoryMode ? (
                        <input
                          type="text"
                          required
                          placeholder="Type custom category..."
                          value={customCategoryInput}
                          onChange={(e) => {
                            setCustomCategoryInput(e.target.value);
                            setFormData({ ...formData, category: e.target.value });
                          }}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-emerald-500/50 rounded-xl text-xs text-white focus:outline-none"
                        />
                      ) : (
                        <select
                          value={formData.category}
                          onChange={(e) => {
                            if (e.target.value === '__NEW_CUSTOM__') {
                              setIsCustomCategoryMode(true);
                              setCustomCategoryInput('');
                            } else {
                              setFormData({ ...formData, category: e.target.value });
                            }
                          }}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                        >
                          {allCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                          <option value="__NEW_CUSTOM__">+ Add Custom Category...</option>
                        </select>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-slate-400 font-semibold">
                        Technical Depth Badge
                      </label>
                      <select
                        value={formData.readingDifficulty}
                        onChange={(e) =>
                          setFormData({ ...formData, readingDifficulty: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="Production Case Study">Production Case Study</option>
                        <option value="Advanced Architecture">Advanced Architecture</option>
                        <option value="Deep-Dive Benchmark">Deep-Dive Benchmark</option>
                        <option value="Engineering Guide">Engineering Guide</option>
                      </select>
                    </div>
                  </div>

                  {/* Slug, Read Time, Priority Order & External Canonical Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-slate-400 font-semibold">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        placeholder="auto-generated-slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-slate-400 font-semibold">
                        Read Time (Minutes)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={formData.readTimeMinutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            readTimeMinutes: Math.max(1, parseInt(e.target.value) || 1)
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-slate-400 font-semibold">
                        Display Priority Order
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formData.displayOrder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            displayOrder: parseInt(e.target.value) || 1
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-slate-400 font-semibold">
                        External Canonical URL (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="https://medium.com/... or dev.to/..."
                        value={formData.externalUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, externalUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Author Byline Customization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Author Display Name
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Chandru Mohan"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Author Title / Role Byline
                      </label>
                      <input
                        type="text"
                        value={formData.authorRole}
                        onChange={(e) =>
                          setFormData({ ...formData, authorRole: e.target.value })
                        }
                        placeholder="Principal Systems Architect"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Cover Image Upload & Media Library Picker */}
                  <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span>Publication Cover Image</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setMediaModalTarget('cover')}
                        className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Select from Media Library</span>
                      </button>
                    </div>
                    <ImageUploader
                      currentUrl={formData.coverImageUrl}
                      onUploadComplete={(url) =>
                        setFormData((prev) => ({ ...prev, coverImageUrl: url }))
                      }
                      onClear={() =>
                        setFormData((prev) => ({ ...prev, coverImageUrl: '' }))
                      }
                    />
                  </div>

                  {/* Card Excerpt & Executive Abstract */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-slate-400 font-semibold">
                        Card Excerpt / Lead Summary *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Concise summary displayed on the article card..."
                        value={formData.excerpt}
                        onChange={(e) =>
                          setFormData({ ...formData, excerpt: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-mono text-emerald-400 font-semibold">
                          Executive Abstract (Expandable Card &amp; Reader Callout)
                        </label>
                        {formData.executiveSummary && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, executiveSummary: '' })
                            }
                            className="text-[10px] font-mono text-rose-400 hover:text-rose-300"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Optional executive synthesis shown when a reader expands the article abstract..."
                        value={formData.executiveSummary}
                        onChange={(e) =>
                          setFormData({ ...formData, executiveSummary: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Key Architectural Takeaways Builder (Add / Edit / Delete Bullet Points) */}
                  <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-slate-200">
                          Key Architectural Takeaways ({formData.keyTakeaways.length})
                        </h4>
                        <p className="text-[10px] font-mono text-slate-500">
                          Add, edit, or remove bulleted takeaways displayed in the article spotlight drawer and reader modal.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            keyTakeaways: [...prev.keyTakeaways, '']
                          }))
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Takeaway
                      </button>
                    </div>

                    {formData.keyTakeaways.length > 0 && (
                      <div className="space-y-2">
                        {formData.keyTakeaways.map((tk, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs font-mono text-emerald-400 w-6 text-right">
                              0{idx + 1}.
                            </span>
                            <input
                              type="text"
                              value={tk}
                              onChange={(e) => {
                                const next = [...formData.keyTakeaways];
                                next[idx] = e.target.value;
                                setFormData({ ...formData, keyTakeaways: next });
                              }}
                              placeholder="e.g. Zero-downtime schema migration pattern across sharded MySQL clusters"
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  keyTakeaways: formData.keyTakeaways.filter(
                                    (_, i) => i !== idx
                                  )
                                })
                              }
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                              title="Remove Takeaway"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tags Manager */}
                  <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2.5">
                    <label className="block text-xs font-mono text-slate-300 font-semibold">
                      Research Topics &amp; Technology Tags
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type tag name (e.g. Java 21, Kafka, Redis) and press Enter..."
                        value={formData.tagInput}
                        onChange={(e) =>
                          setFormData({ ...formData, tagInput: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs text-emerald-300 font-mono font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        + Add Tag
                      </button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-rose-400 transition-colors cursor-pointer font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rich Markdown Editor with Formatting Toolbar */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-mono text-slate-300 font-semibold">
                        Article Manuscript (Markdown) *
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => insertMarkdownSnippet('## Section Heading')}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer"
                        >
                          + H2 Section
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdownSnippet('### Subsection Heading')}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer"
                        >
                          + H3 Subheading
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            insertMarkdownSnippet(
                              '```java\n// Production implementation\npublic class ServiceNode {\n}\n```'
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Code2 className="w-3 h-3" /> Code Block
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            insertMarkdownSnippet(
                              '- First architectural invariant\n- Second operational guarantee'
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer"
                        >
                          + Bullet List
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={14}
                      required
                      placeholder="Write your article content in Markdown format..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 leading-relaxed resize-y"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) =>
                          setFormData({ ...formData, isPublished: e.target.checked })
                        }
                        className="rounded text-emerald-500 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs font-mono text-slate-300">
                        <strong className="text-emerald-400">Published</strong> (Visible on Live Portfolio)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          setFormData({ ...formData, isFeatured: e.target.checked })
                        }
                        className="rounded text-emerald-500 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs font-mono text-slate-300">
                        <strong className="text-amber-400">Featured Monograph</strong> (Highlighted Badge)
                      </span>
                    </label>
                  </div>
                </>
              ) : (
                /* Live Monograph Preview */
                <div className="space-y-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-200">
                  <div className="border-b border-slate-800 pb-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                      <span>
                        {isCustomCategoryMode
                          ? customCategoryInput || 'Uncategorized'
                          : formData.category}
                      </span>
                      <span>·</span>
                      <span>{formData.readTimeMinutes} min read</span>
                      {formData.readingDifficulty && (
                        <>
                          <span>·</span>
                          <span className="text-cyan-300">{formData.readingDifficulty}</span>
                        </>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                      {formData.title || 'Untitled Article'}
                    </h1>
                    <p className="text-xs text-slate-400">{formData.excerpt}</p>
                  </div>

                  {(formData.executiveSummary ||
                    formData.keyTakeaways.filter(Boolean).length > 0) && (
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                        Executive Abstract &amp; Key Takeaways
                      </div>
                      {formData.executiveSummary && (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {formData.executiveSummary}
                        </p>
                      )}
                      {formData.keyTakeaways.filter(Boolean).length > 0 && (
                        <ul className="space-y-1 pt-1">
                          {formData.keyTakeaways
                            .filter(Boolean)
                            .map((tk, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-slate-200 flex items-start gap-2"
                              >
                                <span className="text-emerald-400 font-mono font-bold">
                                  ▹
                                </span>
                                <span>{tk}</span>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-3 font-sans whitespace-pre-wrap">
                    {formData.content}
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white font-medium rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting
                      ? 'Saving...'
                      : editingId
                      ? 'Save Article Changes'
                      : 'Publish Article'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Library Modal for Cover Image */}
      <MediaLibraryModal
        isOpen={mediaModalTarget !== null}
        onClose={() => setMediaModalTarget(null)}
        allowedTypes={['image', 'svg']}
        onSelectMedia={(media) => {
          if (mediaModalTarget === 'cover') {
            setFormData((prev) => ({ ...prev, coverImageUrl: media.url }));
          }
          setMediaModalTarget(null);
        }}
      />
    </div>
  );
}

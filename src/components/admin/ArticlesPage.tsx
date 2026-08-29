import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpenCheck, Plus, Edit2, Trash2, Eye, EyeOff, 
  Save, X, ExternalLink, Search, Filter, CheckCircle2, 
  Clock, Tag, Sparkles, FileText, Share2, Layers, BarChart2,
  GripVertical, ChevronUp, ChevronDown, Folder, Edit3, AlertCircle, Check
} from 'lucide-react';
import { ArticleItem } from '../../data/cmsMockData';

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
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Custom Category Input Mode in Form
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Category Manager State (Rename / Add / Delete)
  const [newCatName, setNewCatName] = useState('');
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [renameCatValue, setRenameCatValue] = useState('');
  const [categoryActionFeedback, setCategoryActionFeedback] = useState<string | null>(null);

  // Custom Categories list stored locally or in memory
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
    const articleCats = articles.map(a => a.category).filter(Boolean);
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
    content: '',
    coverImageUrl: '',
    category: 'System Design',
    tags: [] as string[],
    tagInput: '',
    readTimeMinutes: 5,
    isPublished: true,
    isFeatured: false,
    displayOrder: 1,
    author: 'Chandru Mohan',
    authorRole: 'Principal Systems Architect',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered list
  const filteredArticles = useMemo(() => {
    return articles.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'published' ? item.isPublished : !item.isPublished);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [articles, searchTerm, filterCategory, filterStatus]);

  // Metrics
  const totalArticles = articles.length;
  const publishedCount = articles.filter(a => a.isPublished).length;
  const draftCount = articles.filter(a => !a.isPublished).length;
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
      content: `## 🚀 Overview\n\nExplain the architectural problem statement here...\n\n### Key Concepts\n- High throughput concurrency patterns\n- Distributed event streaming\n\n\`\`\`java\npublic class SystemService {\n    // Core enterprise logic\n}\n\`\`\`\n\n### Conclusion\nSummary of results, benchmark metrics, and production findings.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      category: 'System Design',
      tags: ['Java', 'Spring Boot', 'Architecture'],
      tagInput: '',
      readTimeMinutes: 5,
      isPublished: true,
      isFeatured: false,
      displayOrder: 1,
      author: 'Chandru Mohan',
      authorRole: 'Principal Systems Architect',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
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
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      coverImageUrl: item.coverImageUrl,
      category: item.category || 'System Design',
      tags: item.tags || [],
      tagInput: '',
      readTimeMinutes: item.readTimeMinutes || 5,
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
      displayOrder: item.displayOrder ?? item.order ?? (articles.findIndex(a => a.id === item.id) + 1),
      author: item.author || 'Chandru Mohan',
      authorRole: item.authorRole || 'Principal Systems Architect',
      authorAvatar: item.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });
    setEditorTab('write');
    setIsFormOpen(true);
  };

  const handleMoveUp = async (id: number) => {
    if (!onReorder) return;
    const currentIndex = articles.findIndex(a => a.id === id);
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
    showToast('Updated article priority rank.');
  };

  const handleMoveDown = async (id: number) => {
    if (!onReorder) return;
    const currentIndex = articles.findIndex(a => a.id === id);
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
    showToast('Updated article priority rank.');
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (draggedId === null || draggedId === id) return;
    setDragOverId(id);
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    setDragOverId(null);
    if (draggedId === null || draggedId === targetId || !onReorder) {
      setDraggedId(null);
      return;
    }

    const sourceIdx = articles.findIndex(item => item.id === draggedId);
    const targetIdx = articles.findIndex(item => item.id === targetId);

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
      tags: formData.tags.filter(t => t !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('⚠️ Title and Content are required.');
      return;
    }

    let finalCategory = formData.category;
    if (isCustomCategoryMode && customCategoryInput.trim()) {
      finalCategory = customCategoryInput.trim();
      if (!customCategories.includes(finalCategory)) {
        setCustomCategories(prev => [...prev, finalCategory]);
      }
    }

    const computedSlug = formData.slug.trim() || generateSlug(formData.title);
    const wordCount = formData.content.split(/\s+/).length;
    const computedReadTime = Math.max(1, Math.ceil(wordCount / 200));

    setIsSubmitting(true);
    try {
      if (editingId !== null) {
        const existing = articles.find(a => a.id === editingId);
        await onUpdate({
          id: editingId,
          ...formData,
          category: finalCategory,
          slug: computedSlug,
          readTimeMinutes: computedReadTime,
          viewsCount: existing?.viewsCount || 0,
          publishedAt: existing?.publishedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        showToast('✅ Article updated successfully!');
      } else {
        await onAdd({
          ...formData,
          category: finalCategory,
          slug: computedSlug,
          readTimeMinutes: computedReadTime
        });
        showToast('✅ New technical article published!');
      }
      setIsFormOpen(false);
    } catch (err) {
      showToast('❌ Failed to save article.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await onDelete(id);
        showToast('🗑️ Article deleted.');
      } catch (err) {
        showToast('❌ Failed to delete article.');
      }
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
    setCustomCategories(prev => [...prev, clean]);
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

    // Update custom categories list
    setCustomCategories(prev => prev.map(c => c === oldCategory ? cleanNew : c));

    // Bulk update any articles that use this category
    const affectedArticles = articles.filter(a => a.category === oldCategory);
    if (affectedArticles.length > 0) {
      try {
        for (const art of affectedArticles) {
          await onUpdate({
            ...art,
            category: cleanNew,
            updatedAt: new Date().toISOString()
          });
        }
        setCategoryActionFeedback(`Renamed "${oldCategory}" to "${cleanNew}" across ${affectedArticles.length} article(s).`);
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

  const handleDeleteCategory = async (catToDelete: string) => {
    const articleCount = articles.filter(a => a.category === catToDelete).length;
    if (articleCount > 0) {
      const confirmReassign = window.confirm(
        `There are ${articleCount} article(s) tagged as "${catToDelete}". Reassign them to "System Design" and delete this category?`
      );
      if (!confirmReassign) return;

      const affectedArticles = articles.filter(a => a.category === catToDelete);
      for (const art of affectedArticles) {
        await onUpdate({
          ...art,
          category: 'System Design',
          updatedAt: new Date().toISOString()
        });
      }
    }

    setCustomCategories(prev => prev.filter(c => c !== catToDelete));
    setCategoryActionFeedback(`Category "${catToDelete}" removed.`);
    setTimeout(() => setCategoryActionFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 font-display">Thought Leadership & Publications</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Author and manage deep-dive technical articles, architecture benchmarks, and system design whitepapers under your verified byline.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <Folder className="w-4 h-4 text-emerald-400" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Write Article</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl backdrop-blur-sm">
          <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">Total Articles</span>
          <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block">{totalArticles}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl backdrop-blur-sm">
          <span className="text-[11px] font-mono text-emerald-400 block uppercase tracking-wider">Published</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">{publishedCount}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl backdrop-blur-sm">
          <span className="text-[11px] font-mono text-amber-400 block uppercase tracking-wider">Drafts</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">{draftCount}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl backdrop-blur-sm">
          <span className="text-[11px] font-mono text-sky-400 block uppercase tracking-wider">Total Reads</span>
          <span className="text-2xl font-bold font-mono text-sky-400 mt-1 block">{totalViews}</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title, tags, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Drag cards or use arrows to prioritize</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Categories ({allCategories.length})</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Status</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Articles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/20 border border-slate-800/60 rounded-2xl">
            <BookOpenCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No technical articles found.</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or publish your first article.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-mono font-bold uppercase transition-all"
            >
              + Write New Article
            </button>
          </div>
        ) : (
          filteredArticles.map((article, index) => {
            const isDragging = draggedId === article.id;
            const isOver = dragOverId === article.id;

            return (
            <div
              key={article.id}
              draggable={!searchTerm.trim() && filterCategory === 'all' && filterStatus === 'all'}
              onDragStart={(e) => handleDragStart(e, article.id)}
              onDragOver={(e) => handleDragOver(e, article.id)}
              onDrop={(e) => handleDrop(e, article.id)}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverId(null);
              }}
              className={`bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-200 flex flex-col justify-between group ${
                isDragging ? 'opacity-40 bg-emerald-500/5' : ''
              } ${isOver ? 'ring-2 ring-emerald-500 bg-emerald-500/10' : ''}`}
            >
              <div>
                {/* Drag Handle & Priority Bar */}
                <div className="px-3.5 py-2 bg-slate-950/80 border-b border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors cursor-grab active:cursor-grabbing" />
                    <span className="font-bold text-emerald-400">#{article.displayOrder ?? article.order ?? (index + 1)}</span>
                    <span className="text-slate-500">Priority</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(article.id)}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      title="Move Up in Display Order"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(article.id)}
                      disabled={index === filteredArticles.length - 1}
                      className="p-1 text-slate-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      title="Move Down in Display Order"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Article Card Image Cover */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={article.coverImageUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-emerald-400">
                    {article.category}
                  </span>

                  {/* Status Pill */}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                    article.isPublished
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  }`}>
                    {article.isPublished ? 'Published' : 'Draft'}
                  </span>

                  {/* Read Time & Views Overlay */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span className="flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {article.readTimeMinutes} min read
                    </span>
                    <span className="flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      <Eye className="w-3 h-3 text-sky-400" />
                      {article.viewsCount || 0} reads
                    </span>
                  </div>
                </div>

                {/* Article Info */}
                <div className="p-4 space-y-2.5">
                  <h3 className="text-sm font-bold text-white font-sans leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {article.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 bg-slate-800/60 border border-slate-700/50 rounded-md text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-[10px] font-mono px-1 text-slate-500">
                          +{article.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={article.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={article.author}
                    className="w-5 h-5 rounded-full object-cover border border-slate-700"
                  />
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-[100px]">
                    {article.author}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleStatus(article.id, !article.isPublished)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      article.isPublished
                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                        : 'text-amber-400 hover:bg-amber-500/10'
                    }`}
                    title={article.isPublished ? 'Published (Click to Unpublish)' : 'Draft (Click to Publish)'}
                  >
                    {article.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(article)}
                    className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Edit Article"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6 animate-scale-up flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Folder className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Article Categories Manager</h3>
                  <p className="text-[11px] text-slate-400">Add, rename, or remove topic categories</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategoryKey(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Feedback alert */}
              {categoryActionFeedback && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>{categoryActionFeedback}</span>
                </div>
              )}

              {/* Add Category Form */}
              <form onSubmit={handleAddNewCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new custom category (e.g. Distributed Consensus, Cloud Native)..."
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

              {/* List of Existing Categories */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {allCategories.map((cat) => {
                  const articleCount = articles.filter(a => a.category === cat).length;
                  const isEditingThis = editingCategoryKey === cat;

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl"
                    >
                      {isEditingThis ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
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
                            onClick={() => handleRenameCategory(cat)}
                            className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategoryKey(null)}
                            className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <Tag className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-medium text-slate-200">{cat}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                            {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                          </span>
                        </div>
                      )}

                      {!isEditingThis && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCategoryKey(cat);
                              setRenameCatValue(cat);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition-colors cursor-pointer"
                            title="Rename Category"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
              <button
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 animate-scale-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <BookOpenCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white font-display">
                  {editingId ? 'Edit Engineering Article' : 'Write & Publish Technical Article'}
                </h3>
              </div>

              {/* Editor Tabs: Write vs Preview */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditorTab('write')}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                      editorTab === 'write'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Write (Markdown)
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
                    Live Preview
                  </button>
                </div>

                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {editorTab === 'write' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Article Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Architecting High-Throughput Event-Driven Systems"
                        value={formData.title}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          title: e.target.value,
                          slug: editingId ? formData.slug : generateSlug(e.target.value)
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-mono text-slate-400">
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
                          {isCustomCategoryMode ? 'Choose from list' : '+ Custom Category'}
                        </button>
                      </div>

                      {isCustomCategoryMode ? (
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Type custom category name..."
                            value={customCategoryInput}
                            onChange={(e) => {
                              setCustomCategoryInput(e.target.value);
                              setFormData({ ...formData, category: e.target.value });
                            }}
                            className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/50 rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>
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
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                        >
                          {allCategories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="__NEW_CUSTOM__">+ Add Custom Category...</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        placeholder="auto-generated-slug-from-title"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Cover Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.coverImageUrl}
                        onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Display Priority (Rank / Order)
                      </label>
                      <input
                        type="number"
                        min={1}
                        placeholder="1 (Top Priority)"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Excerpt / Summary */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Short Excerpt / SEO Description (Max 2 sentences)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief overview of key findings, benchmarks, and architectural patterns covered in this article..."
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 font-sans"
                    />
                  </div>

                  {/* Tags Manager */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Tags & Topics (e.g. Java 21, Kafka, Spring Boot, Concurrency)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Type tag name and click Add or press Enter..."
                        value={formData.tagInput}
                        onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white font-mono rounded-xl transition-colors cursor-pointer"
                      >
                        Add Tag
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rich Markdown Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-mono text-slate-400">
                        Article Body (GitHub Flavored Markdown) *
                      </label>
                      <span className="text-[11px] font-mono text-slate-500">
                        Supports # headers, ```code blocks, tables, lists
                      </span>
                    </div>
                    <textarea
                      rows={14}
                      required
                      placeholder="Write your article content in Markdown format..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-mono resize-y"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="rounded text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs font-medium text-slate-300">Publish Immediately</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="rounded text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs font-medium text-slate-300">Feature at Top of Blog</span>
                    </label>
                  </div>
                </>
              ) : (
                /* Live Markdown Preview */
                <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-200">
                  <div className="border-b border-slate-800 pb-4">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase font-bold">
                      {isCustomCategoryMode ? (customCategoryInput || 'Uncategorized') : formData.category}
                    </span>
                    <h1 className="text-2xl font-bold text-white mt-2 font-display">
                      {formData.title || 'Untitled Article'}
                    </h1>
                    <p className="text-xs text-slate-400 mt-2 font-sans italic">
                      {formData.excerpt}
                    </p>
                  </div>

                  {/* Content Preview */}
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
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

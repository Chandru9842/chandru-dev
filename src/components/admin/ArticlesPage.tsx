import React, { useState, useMemo } from 'react';
import { 
  BookOpenCheck, Plus, Edit2, Trash2, Eye, EyeOff, 
  Save, X, ExternalLink, Search, Filter, CheckCircle2, 
  Clock, Tag, Sparkles, FileText, Share2, Layers, BarChart2
} from 'lucide-react';
import { ArticleItem } from '../../data/cmsMockData';

interface ArticlesPageProps {
  articles: ArticleItem[];
  onAdd: (item: Omit<ArticleItem, 'id' | 'publishedAt' | 'updatedAt' | 'viewsCount'>) => Promise<void>;
  onUpdate: (item: ArticleItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleStatus: (id: number, isPublished: boolean) => Promise<void>;
}

export default function ArticlesPage({
  articles,
  onAdd,
  onUpdate,
  onDelete,
  onToggleStatus
}: ArticlesPageProps) {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

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
    author: 'Chandru Mohan',
    authorRole: 'Principal Systems Architect',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const categories = [
    'System Design',
    'Java Engineering',
    'Database Architecture',
    'Microservices',
    'Cloud & DevOps',
    'High Concurrency & Kafka'
  ];

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
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: `## 🚀 Overview\n\nExplain the architectural problem statement here...\n\n### Key Concepts\n- Concurrency patterns\n- Throughput optimization\n\n\`\`\`java\npublic class SystemService {\n    // Core logic\n}\n\`\`\`\n\n### Conclusion\nSummary of results and production findings.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      category: 'System Design',
      tags: ['Java', 'Spring Boot', 'Architecture'],
      tagInput: '',
      readTimeMinutes: 5,
      isPublished: true,
      isFeatured: false,
      author: 'Chandru Mohan',
      authorRole: 'Principal Systems Architect',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });
    setEditorTab('write');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ArticleItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      coverImageUrl: item.coverImageUrl,
      category: item.category,
      tags: item.tags || [],
      tagInput: '',
      readTimeMinutes: item.readTimeMinutes || 5,
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
      author: item.author || 'Chandru Mohan',
      authorRole: item.authorRole || 'Principal Systems Architect',
      authorAvatar: item.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });
    setEditorTab('write');
    setIsFormOpen(true);
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

  return (
    <div className="space-y-6">
      {/* Toast */}
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
            <h1 className="text-xl font-bold text-slate-100 font-display">Engineering Blog & Articles</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Author and publish deep-dive technical articles, architecture benchmarks, and system design whitepapers under your verified byline.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Publications</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalArticles}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Published</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{publishedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Drafts</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{draftCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Article Reads</p>
            <p className="text-2xl font-extrabold text-purple-400 mt-1">{totalViews.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/30 p-3 rounded-2xl border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, tags, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
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

      {/* Articles Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-slate-900/20 border border-slate-800/50 rounded-2xl">
            <BookOpenCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No articles match your search filter.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
            >
              Write your first article
            </button>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                  <img
                    src={article.coverImageUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                    className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Edit Article"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
                <h3 className="text-sm font-bold text-white">
                  {editingId ? 'Edit Engineering Article' : 'Write & Publish Technical Article'}
                </h3>
              </div>

              {/* Editor Tabs: Write vs Preview */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditorTab('write')}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
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
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
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
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-2"
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
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white font-mono rounded-xl transition-colors"
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
                            className="hover:text-rose-400 transition-colors"
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
                      {formData.category}
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
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
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

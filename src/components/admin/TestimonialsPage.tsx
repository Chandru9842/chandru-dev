import React, { useState, useMemo } from 'react';
import { 
  MessageSquareQuote, Star, Plus, Edit2, Trash2, Eye, EyeOff, 
  MoveUp, MoveDown, Save, X, ExternalLink, ShieldCheck, 
  Search, Filter, CheckCircle2, User, Building, HeartHandshake, Copy, Award, GripVertical
} from 'lucide-react';
import { TestimonialItem } from '../../data/cmsMockData';

interface TestimonialsPageProps {
  testimonials: TestimonialItem[];
  onAdd: (item: Omit<TestimonialItem, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (item: TestimonialItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleVisibility: (id: number, isVisible: boolean) => Promise<void>;
  onReorder: (items: TestimonialItem[]) => Promise<void>;
}

export default function TestimonialsPage({
  testimonials,
  onAdd,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onReorder
}: TestimonialsPageProps) {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    avatarUrl: '',
    linkedInUrl: '',
    relationship: 'Managed Chandru directly',
    testimonialText: '',
    rating: 5,
    isFeatured: true,
    isVisible: true,
    displayOrder: 1
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const relationshipOptions = [
    'Managed Chandru directly',
    'Senior Colleague / Tech Lead',
    'Collaborated on Enterprise Deliverables',
    'Reported to Chandru',
    'Client / Enterprise Stakeholder',
    'Open Source Co-Contributor'
  ];

  // Filtered list
  const filteredTestimonials = useMemo(() => {
    return testimonials
      .filter(item => {
        const matchesSearch = 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.testimonialText.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = filterRating === 'all' || item.rating === filterRating;
        return matchesSearch && matchesRating;
      })
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [testimonials, searchTerm, filterRating]);

  // Summary Metrics
  const totalCount = testimonials.length;
  const featuredCount = testimonials.filter(t => t.isFeatured).length;
  const visibleCount = testimonials.filter(t => t.isVisible).length;
  const avgRating = testimonials.length > 0 
    ? (testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / testimonials.length).toFixed(1)
    : '5.0';

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: '',
      company: '',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      linkedInUrl: 'https://www.linkedin.com/in/chandru9842/',
      relationship: 'Managed Chandru directly',
      testimonialText: '',
      rating: 5,
      isFeatured: true,
      isVisible: true,
      displayOrder: testimonials.length + 1
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      role: item.role,
      company: item.company,
      avatarUrl: item.avatarUrl,
      linkedInUrl: item.linkedInUrl || '',
      relationship: item.relationship,
      testimonialText: item.testimonialText,
      rating: item.rating,
      isFeatured: item.isFeatured,
      isVisible: item.isVisible,
      displayOrder: item.displayOrder
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.testimonialText.trim()) {
      showToast('⚠️ Please provide both Name and Endorsement text.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId !== null) {
        await onUpdate({
          id: editingId,
          ...formData,
          createdAt: testimonials.find(t => t.id === editingId)?.createdAt || new Date().toISOString()
        });
        showToast('✅ Testimonial updated successfully!');
      } else {
        await onAdd(formData);
        showToast('✅ New testimonial endorsement added!');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      showToast('❌ Failed to save testimonial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove endorsement from "${name}"?`)) {
      try {
        await onDelete(id);
        showToast('🗑️ Testimonial deleted.');
      } catch (err) {
        showToast('❌ Failed to delete testimonial.');
      }
    }
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

    const sourceIdx = testimonials.findIndex(item => item.id === draggedId);
    const targetIdx = testimonials.findIndex(item => item.id === targetId);

    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedId(null);
      return;
    }

    const newList = [...testimonials];
    const [movedItem] = newList.splice(sourceIdx, 1);
    newList.splice(targetIdx, 0, movedItem);

    const reordered = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    setDraggedId(null);
    try {
      await onReorder(reordered);
      showToast('↔️ Order updated successfully.');
    } catch (err) {
      showToast('❌ Failed to update order.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredTestimonials.length) return;

    const currentItem = filteredTestimonials[index];
    const targetItem = filteredTestimonials[targetIndex];
    const sourceIdx = testimonials.findIndex(t => t.id === currentItem.id);
    const targetIdx = testimonials.findIndex(t => t.id === targetItem.id);

    if (sourceIdx === -1 || targetIdx === -1) return;

    const newList = [...testimonials];
    const [movedItem] = newList.splice(sourceIdx, 1);
    newList.splice(targetIdx, 0, movedItem);

    const updatedOrder = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    try {
      await onReorder(updatedOrder);
      showToast('↔️ Order updated successfully.');
    } catch (err) {
      showToast('❌ Failed to update order.');
    }
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
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 font-display">Client & Peer Testimonials</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Manage authentic social proof, client reviews, and executive peer endorsements praising your systems architecture and delivery excellence.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Endorsement</span>
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Reviews</p>
            <p className="text-2xl font-extrabold text-white mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Average Rating</p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-2xl font-extrabold text-amber-400">{avgRating}</p>
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Featured</p>
            <p className="text-2xl font-extrabold text-purple-400 mt-1">{featuredCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Live Visible</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{visibleCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/30 p-3 rounded-2xl border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Rating:</span>
          </div>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Ratings (1-5 ⭐)</option>
            <option value={5}>5 Stars Only (⭐⭐⭐⭐⭐)</option>
            <option value={4}>4 Stars Only (⭐⭐⭐⭐)</option>
          </select>
        </div>
      </div>

      {/* Testimonials Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTestimonials.length === 0 ? (
          <div className="lg:col-span-2 text-center py-16 bg-slate-900/20 border border-slate-800/50 rounded-2xl">
            <MessageSquareQuote className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No testimonials match your filter.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
            >
              Add your first endorsement
            </button>
          </div>
        ) : (
          filteredTestimonials.map((item, index) => {
            const isDragging = draggedId === item.id;
            const isOver = dragOverId === item.id;
            const isDraggable = !searchTerm.trim();

            return (
              <div
                key={item.id}
                draggable={isDraggable}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                className={`relative bg-slate-900/40 border rounded-2xl p-5 backdrop-blur-sm transition-all duration-200 flex flex-col justify-between group ${
                  item.isVisible ? 'border-slate-800/80 hover:border-slate-700' : 'border-slate-800/30 opacity-60'
                } ${isDragging ? 'opacity-40 scale-95 border-dashed border-emerald-500/80 shadow-2xl' : ''} ${
                  isOver ? 'border-emerald-400 ring-2 ring-emerald-500/30 scale-[1.01] bg-slate-900/90' : ''
                }`}
              >
                <div>
                  {/* Card Top: Author, Company, Rating, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`p-1 -ml-2 rounded transition-colors shrink-0 cursor-grab active:cursor-grabbing ${
                          isDraggable ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-700 cursor-not-allowed'
                        }`}
                        title={isDraggable ? "Drag to reorder endorsement" : "Clear search to reorder"}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <img
                        src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={item.name}
                        draggable={false}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700/60 bg-slate-800 shrink-0 select-none"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white font-sans">{item.name}</h3>
                          {item.linkedInUrl && (
                            <a
                              href={item.linkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-400 hover:text-sky-300 p-0.5 hover:bg-sky-500/10 rounded transition-colors"
                              title="Verified LinkedIn Profile"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium">{item.role}</p>
                        <p className="text-[11px] text-emerald-400 font-mono">{item.company}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {/* Star Rating */}
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (item.rating || 5) ? 'fill-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Featured Badge */}
                      {item.isFeatured && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Relationship Tag */}
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400">
                      <HeartHandshake className="w-3 h-3 text-emerald-400" />
                      {item.relationship}
                    </span>
                  </div>

                  {/* Testimonial Quote Text */}
                  <div className="mt-3.5 relative">
                    <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50 font-sans">
                      "{item.testimonialText}"
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === filteredTestimonials.length - 1}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-500 ml-1">
                      #{item.displayOrder || index + 1}
                    </span>
                  </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleVisibility(item.id, !item.isVisible)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.isVisible
                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                        : 'text-slate-500 hover:bg-slate-800'
                    }`}
                    title={item.isVisible ? 'Visible (Click to Hide)' : 'Hidden (Click to Show)'}
                  >
                    {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Edit Endorsement"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Endorsement"
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

      {/* Add / Edit Testimonial Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8 animate-scale-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {editingId ? 'Edit Testimonial Endorsement' : 'Add New Client / Peer Endorsement'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Endorser Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Vikram Sethi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Professional Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VP of Cloud Engineering"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FinScale Technologies"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Professional Relationship *
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    {relationshipOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Avatar Photo Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/in/..."
                    value={formData.linkedInUrl}
                    onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating ? 'fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    {formData.rating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Testimonial Quote Text */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Endorsement / Review Text *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe Chandru's technical leadership, architecture, or project impact..."
                  value={formData.testimonialText}
                  onChange={(e) => setFormData({ ...formData, testimonialText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
                />
              </div>

              {/* Toggles: Featured & Visible */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-medium text-slate-300">Feature on Hero & Highlights</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-medium text-slate-300">Visible on Public Portfolio</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
                  <span>{isSubmitting ? 'Saving...' : editingId ? 'Update Endorsement' : 'Save Endorsement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

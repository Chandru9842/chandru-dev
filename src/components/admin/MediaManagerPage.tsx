import React, { useState, useEffect } from 'react';
import { 
  Folder, Image as ImageIcon, FileText, Film, Music, FileCode, Upload, 
  Search, Filter, Trash2, Edit3, Check, X, Copy, ExternalLink, Tag, Grid, List, 
  Maximize2, Eye, ShieldAlert, Sparkles, RefreshCw, FolderPlus, Download, CheckSquare, Square
} from 'lucide-react';
import ImageUploader from '../ImageUploader';
import MediaLibraryModal, { MediaItem } from './MediaLibraryModal';

export default function MediaManagerPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // New asset form modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFolder, setUploadFolder] = useState('General');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadType, setUploadType] = useState<'image' | 'svg' | 'pdf' | 'video' | 'audio' | 'document'>('image');
  const [uploadSvg, setUploadSvg] = useState('');

  const folders = ['All', 'Hero & Profile', 'Projects', 'Certificates & Badges', 'SVGs & Logos', 'Resumes & Documents', 'General'];

  const getAuthHeader = () => {
    const token = localStorage.getItem('alex_dev_jwt_token') || localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data);
      }
    } catch (e) {
      console.error('Failed to fetch media:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const filteredItems = mediaItems.filter(item => {
    if (selectedType !== 'All' && item.type !== selectedType.toLowerCase()) {
      return false;
    }
    if (selectedFolder !== 'All' && item.folder !== selectedFolder) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchFolder = item.folder.toLowerCase().includes(q);
      const matchTags = item.tags?.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchFolder || matchTags;
    }
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} media assets?`)) return;

    try {
      const res = await fetch('/api/media/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setMediaItems(prev => prev.filter(i => !selectedIds.includes(i.id)));
        setSelectedIds([]);
        if (selectedItem && selectedIds.includes(selectedItem.id)) {
          setSelectedItem(null);
        }
      }
    } catch (e) {
      console.error('Failed to delete media items:', e);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Delete this media asset?')) return;
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setMediaItems(prev => prev.filter(i => i.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
      }
    } catch (e) {
      console.error('Failed to delete media item:', e);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl && !uploadSvg) return;

    try {
      const tagsArr = uploadTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          title: uploadTitle || 'Untitled Asset',
          url: uploadUrl || 'data:image/svg+xml;utf8,' + encodeURIComponent(uploadSvg),
          type: uploadType,
          folder: uploadFolder,
          tags: tagsArr,
          svgMarkup: uploadSvg
        })
      });

      if (res.ok) {
        const created = await res.json();
        setMediaItems(prev => [created, ...prev]);
        setIsUploadOpen(false);
        setUploadTitle('');
        setUploadUrl('');
        setUploadSvg('');
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'svg': return <FileCode className="w-4 h-4 text-purple-400" />;
      case 'pdf': return <FileText className="w-4 h-4 text-rose-400" />;
      case 'video': return <Film className="w-4 h-4 text-blue-400" />;
      case 'audio': return <Music className="w-4 h-4 text-amber-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            Centralized Media Library
            <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              {mediaItems.length} Assets
            </span>
          </h2>
          <p className="text-xs text-slate-400">Upload, organize, crop, and reuse images, vectors, logos, and documents across CMS modules.</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-mono font-bold uppercase transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            <Upload className="w-4 h-4" />
            Upload Asset
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px] shadow-xl">
        
        {/* Left Folder Directory Sidebar */}
        <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-4 space-y-6 shrink-0">
          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
              Media Folders
            </span>
            <div className="space-y-1">
              {folders.map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFolder(f)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-semibold flex items-center justify-between transition-all ${
                    selectedFolder === f 
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{f}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {f === 'All' ? mediaItems.length : mediaItems.filter(i => i.folder === f).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
              Filter By Type
            </span>
            <div className="space-y-1 font-mono text-xs">
              {['All', 'Image', 'SVG', 'PDF', 'Video'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left transition-all ${
                    selectedType === t ? 'text-emerald-400 font-bold bg-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Asset Stream */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Action bar */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/20">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets by title, tag, folder..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 font-sans"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-500" />
                )}
                Select All
              </button>

              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Asset List Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                <span className="text-xs font-mono text-slate-500">Loading Media Library...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <Folder className="w-10 h-10 text-slate-700" />
                <p className="text-xs font-mono text-slate-400">No media assets in this view.</p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider"
                >
                  Upload New Asset
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isFocused = selectedItem?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`group relative bg-slate-950 border rounded-2xl p-2.5 transition-all cursor-pointer overflow-hidden ${
                        isFocused 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-900' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Checkbox badge */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        className="absolute top-2 left-2 z-10 p-1 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300"
                      >
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
                      </button>

                      {/* Thumbnail container */}
                      <div className="w-full h-32 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden relative mb-2">
                        {item.type === 'image' ? (
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : item.type === 'svg' && item.svgMarkup ? (
                          <div className="w-12 h-12 flex items-center justify-center text-emerald-400 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: item.svgMarkup }} />
                        ) : item.type === 'svg' ? (
                          <img src={item.url} alt={item.title} className="w-12 h-12 object-contain" />
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            {getMediaIcon(item.type)}
                            <span className="text-[9px] font-mono text-slate-500 uppercase">{item.type}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>{item.folder}</span>
                          <span className="uppercase">{item.type}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List view */
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 bg-slate-950 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      selectedItem?.id === item.id ? 'border-emerald-500 bg-slate-900' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        className="text-slate-500 hover:text-emerald-400"
                      >
                        {selectedIds.includes(item.id) ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                      </button>

                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.type === 'image' ? (
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          getMediaIcon(item.type)
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                        <p className="text-[10px] font-mono text-slate-500">{item.folder} • {item.type.toUpperCase()}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Details Inspection Panel */}
        {selectedItem && (
          <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/60 p-5 space-y-5 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase">Asset Inspector</span>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Large Preview */}
            <div className="w-full h-44 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden p-2">
              {selectedItem.type === 'image' ? (
                <img src={selectedItem.url} alt={selectedItem.title} className="w-full h-full object-contain" />
              ) : selectedItem.type === 'svg' && selectedItem.svgMarkup ? (
                <div className="w-16 h-16 text-emerald-400 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: selectedItem.svgMarkup }} />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {getMediaIcon(selectedItem.type)}
                  <span className="text-xs font-mono text-slate-400 uppercase">{selectedItem.type}</span>
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Title</span>
                <span className="text-slate-200 font-bold font-sans">{selectedItem.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Folder</span>
                  <span className="text-slate-300">{selectedItem.folder}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Type</span>
                  <span className="text-slate-300 uppercase">{selectedItem.type}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">URL</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={selectedItem.url}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(selectedItem.url)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-emerald-400"
                    title="Copy URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[9px] text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteItem(selectedItem.id)}
                  className="flex-1 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal Drawer */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Upload Asset to Cloud Storage</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. AWS Certification Badge"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Folder</label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                  >
                    {folders.filter(f => f !== 'All').map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                  >
                    <option value="image">Image (PNG, JPG, WEBP)</option>
                    <option value="svg">SVG Vector</option>
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Upload Image File / URL</label>
                <ImageUploader
                  currentUrl={uploadUrl}
                  onUploadComplete={(url) => setUploadUrl(url)}
                  onClear={() => setUploadUrl('')}
                />
              </div>

              {uploadType === 'svg' && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Inline SVG Markup (Optional)</label>
                  <textarea
                    value={uploadSvg}
                    onChange={(e) => setUploadSvg(e.target.value)}
                    placeholder='<svg viewBox="0 0 24 24" ...> ... </svg>'
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="e.g. project, cloud, hero"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider"
                >
                  Commit Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Folder, Image as ImageIcon, FileText, Film, Music, FileCode, Upload, 
  Search, Filter, Trash2, Edit3, Check, X, Copy, ExternalLink, Tag, Grid, List, 
  Maximize2, Eye, ShieldAlert, Sparkles, RefreshCw, FolderPlus, Download
} from 'lucide-react';
import ImageUploader from '../ImageUploader';

export interface MediaItem {
  id: number;
  title: string;
  url: string;
  type: 'image' | 'svg' | 'pdf' | 'video' | 'audio' | 'document';
  folder: string;
  size?: number; // in bytes
  dimensions?: string;
  tags?: string[];
  svgMarkup?: string;
  publicId?: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia?: (media: MediaItem) => void;
  allowedTypes?: ('image' | 'svg' | 'pdf' | 'video' | 'audio' | 'document')[];
  title?: string;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectMedia,
  allowedTypes,
  title = "Select Asset from Centralized Media Library"
}: MediaLibraryModalProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  
  // New upload form inside modal
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
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
      console.error('Failed to fetch media assets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = mediaItems.filter(item => {
    // Type filter
    if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(item.type)) {
      return false;
    }
    if (selectedType !== 'All' && item.type !== selectedType.toLowerCase()) {
      return false;
    }
    // Folder filter
    if (selectedFolder !== 'All' && item.folder !== selectedFolder) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchFolder = item.folder.toLowerCase().includes(q);
      const matchTags = item.tags?.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchFolder || matchTags;
    }
    return true;
  });

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
        if (onSelectMedia) {
          onSelectMedia(created);
          onClose();
        } else {
          setActiveTab('library');
          setUploadTitle('');
          setUploadUrl('');
          setUploadSvg('');
        }
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">{title}</h3>
              <p className="text-[10px] text-slate-400">Centralized Cloud & Local Portfolio Asset Storage</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === 'library' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Media Library ({filteredItems.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'upload' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Asset
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'library' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar filter column */}
            <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/30 p-4 space-y-5 shrink-0 overflow-y-auto">
              <div>
                <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Folders
                </span>
                <div className="space-y-1">
                  {folders.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFolder(f)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all text-left ${
                        selectedFolder === f 
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Asset Type
                </span>
                <div className="space-y-1">
                  {['All', 'Image', 'SVG', 'PDF', 'Video'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedType(t)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all text-left ${
                        selectedType === t ? 'text-emerald-400 font-bold bg-slate-900' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main items grid */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/10">
              {/* Search & layout bar */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/50">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by asset title, tag, or folder..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
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

              {/* Items display area */}
              <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                    <span className="text-xs font-mono text-slate-500">Loading media library...</span>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                    <Folder className="w-10 h-10 text-slate-700" />
                    <p className="text-xs font-mono text-slate-400">No media assets found matching the filter.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider"
                    >
                      Upload First Asset
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`group relative bg-slate-900 border rounded-2xl p-2.5 transition-all cursor-pointer overflow-hidden ${
                          selectedItem?.id === item.id 
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-900/90' 
                            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        {/* Preview thumbnail */}
                        <div className="w-full h-28 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative mb-2">
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

                          <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[8px] font-mono text-slate-400 uppercase">
                            {item.type}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>{item.folder}</span>
                            {item.dimensions && <span>{item.dimensions}</span>}
                          </div>
                        </div>

                        {/* Quick action button overlay */}
                        {onSelectMedia && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectMedia(item);
                                onClose();
                              }}
                              className="w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-[10px] font-mono font-bold uppercase transition-all"
                            >
                              Insert Asset
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List view */
                  <div className="space-y-1.5">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-3 bg-slate-900 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          selectedItem?.id === item.id ? 'border-emerald-500 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
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

                        {onSelectMedia && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMedia(item);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold uppercase"
                          >
                            Select
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Upload tab form */
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950/20">
            <form onSubmit={handleUploadSubmit} className="max-w-2xl mx-auto space-y-5">
              <div className="space-y-1 text-center mb-6">
                <h4 className="text-base font-bold text-white">Upload or Register New Portfolio Asset</h4>
                <p className="text-xs text-slate-400">Upload images, custom SVG code, documents, or register hosted asset URLs.</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Asset Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Hero Graphic Banner or Company Logo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Folder Category</label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                  >
                    {folders.filter(f => f !== 'All').map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Asset Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                  >
                    <option value="image">Image (PNG, JPG, WEBP)</option>
                    <option value="svg">SVG Vector / Markup</option>
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
              </div>

              {/* Upload image widget */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Upload File / Image URL</label>
                <ImageUploader
                  currentUrl={uploadUrl}
                  onUploadComplete={(url) => setUploadUrl(url)}
                  onClear={() => setUploadUrl('')}
                />
              </div>

              {uploadType === 'svg' && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Inline SVG Code (Optional)</label>
                  <textarea
                    value={uploadSvg}
                    onChange={(e) => setUploadSvg(e.target.value)}
                    placeholder='<svg viewBox="0 0 24 24" ...> ... </svg>'
                    rows={4}
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
                  placeholder="e.g. hero, dark, vector, logo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('library')}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider"
                >
                  Commit Asset to Media Library
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

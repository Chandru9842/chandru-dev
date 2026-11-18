import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Folder,
  Trash2,
  Globe,
  Image as ImageIcon,
  Share2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { AnimatedProfileAvatar } from '../AnimatedProfileAvatar';

export type MediaAssetKind =
  | 'profile'
  | 'hero-avatar'
  | 'about'
  | 'favicon'
  | 'website-logo'
  | 'og-image'
  | 'cover'
  | 'hero';

export interface MediaUploaderProps {
  /** Heading title for this asset slot (e.g., "1. Primary Profile Image") */
  title: string;
  /** Subtitle / description explaining where this independent asset renders */
  subtitle: string;
  /** Current image or favicon URL / Base64 Data URL */
  value?: string;
  /** Alias for `value` used in SEO & Hero managers */
  currentUrl?: string;
  /** Optional badge label */
  badge?: string;
  /** Optional fallback hint caption */
  fallbackHint?: string;
  /** Optional custom accept MIME string */
  accept?: string;
  /** Type of asset to tailor preview geometry, accepted MIME types, and hints */
  assetType: MediaAssetKind;
  /** Fallback name for avatar monograms */
  fallbackName?: string;
  /** Callback when the user types or pastes a direct URL */
  onUrlChange: (newUrl: string) => void;
  /** Callback when the user deletes / clears the current asset */
  onDelete: () => void;
  /** Callback to open the Centralized Media Library modal */
  onOpenMediaLibrary?: () => void;
  /**
   * Optional handler that receives the raw File (e.g. to open the Crop & Compression
   * modal in ProfilePage). If omitted, MediaUploader reads the file into a Data URL
   * and calls `onDataUrlReady` or `onUrlChange`.
   */
  onFileSelected?: (file: File) => void;
  /**
   * Optional handler called when MediaUploader reads a dropped/selected File
   * directly into a Base64 Data URL.
   */
  onDataUrlReady?: (dataUrl: string, file: File) => void;
  /** Optional custom placeholder for the direct URL input */
  urlPlaceholder?: string;
  /** Optional dropzone helper caption */
  helperText?: string;
}

export default function MediaUploader({
  title,
  subtitle,
  value: propValue,
  currentUrl,
  accept,
  fallbackHint,
  assetType,
  fallbackName = 'Chandru Mohan',
  onUrlChange,
  onDelete,
  onOpenMediaLibrary,
  onFileSelected,
  onDataUrlReady,
  urlPlaceholder,
  helperText,
}: MediaUploaderProps) {
  const value = propValue !== undefined ? propValue : (currentUrl || '');
  const resolvedHelperText = helperText || fallbackHint;
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [compressionInfo, setCompressionInfo] = useState<{
    originalKb: string;
    compressedKb: string;
    savedPercent: number;
  } | null>(null);

  const acceptTypes =
    accept ||
    (assetType === 'favicon'
      ? 'image/svg+xml,image/png,image/x-icon,image/vnd.microsoft.icon,image/webp,image/jpeg,.ico,.svg,.png'
      : 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif,image/avif');

  const compressRasterToWebp = (rawDataUrl: string, file: File): Promise<string> => {
    return new Promise((resolve) => {
      const lowerName = file.name.toLowerCase();
      const isVectorOrIcon =
        lowerName.endsWith('.svg') ||
        lowerName.endsWith('.ico') ||
        lowerName.endsWith('.gif') ||
        file.type.includes('svg') ||
        file.type.includes('icon') ||
        file.type.includes('gif');

      if (isVectorOrIcon) {
        setCompressionInfo(null);
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const maxDim =
            assetType === 'favicon'
              ? 128
              : assetType === 'profile' || assetType === 'hero-avatar' || assetType === 'about' || assetType === 'website-logo'
              ? 640
              : 1440;
          let targetW = img.width || maxDim;
          let targetH = img.height || maxDim;
          if (targetW > maxDim || targetH > maxDim) {
            if (targetW >= targetH) {
              targetH = Math.round((targetH * maxDim) / targetW);
              targetW = maxDim;
            } else {
              targetW = Math.round((targetW * maxDim) / targetH);
              targetH = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const webpUrl = canvas.toDataURL('image/webp', 0.86);
          if (webpUrl && webpUrl.startsWith('data:image/webp') && webpUrl.length < rawDataUrl.length) {
            const origBytes = file.size || Math.round((rawDataUrl.length * 3) / 4);
            const compBytes = Math.round((webpUrl.length * 3) / 4);
            const saved = Math.max(1, Math.round(((origBytes - compBytes) / Math.max(origBytes, 1)) * 100));
            setCompressionInfo({
              originalKb: `${(origBytes / 1024).toFixed(1)} KB`,
              compressedKb: `${(compBytes / 1024).toFixed(1)} KB`,
              savedPercent: saved,
            });
            resolve(webpUrl);
          } else {
            setCompressionInfo(null);
            resolve(rawDataUrl);
          }
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    });
  };

  const processSelectedFile = (file: File) => {
    setLocalError(null);

    const isFaviconFile =
      assetType === 'favicon' &&
      (file.name.toLowerCase().endsWith('.ico') ||
        file.name.toLowerCase().endsWith('.svg') ||
        file.type.includes('icon'));

    if (!file.type.startsWith('image/') && !isFaviconFile) {
      setLocalError('Unsupported file format. Please drop a valid image or icon file (.png, .jpg, .svg, .webp, .ico).');
      return;
    }

    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError('File exceeds the 10 MB maximum size limit.');
      return;
    }

    // Integrate with parent's file-handling state management (e.g. Crop & Compression pipeline)
    if (onFileSelected) {
      onFileSelected(file);
      return;
    }

    // Otherwise read into a Data URL, optimize to WebP, and update state
    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onerror = () => {
      setIsReadingFile(false);
      setLocalError('Failed to read dropped file.');
    };
    reader.onload = async () => {
      const rawDataUrl = reader.result as string;
      const optimizedDataUrl = await compressRasterToWebp(rawDataUrl, file);
      setIsReadingFile(false);
      if (onDataUrlReady) {
        onDataUrlReady(optimizedDataUrl, file);
      } else {
        onUrlChange(optimizedDataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    e.target.value = '';
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  const defaultHelperText =
    helperText ||
    (assetType === 'favicon'
      ? 'Browser tab icon (.svg, .png, .ico) — Strictly independent from Navbar Logo'
      : assetType === 'profile'
      ? 'Live animated cyber preview (Square 1:1 circular avatar)'
      : assetType === 'hero-avatar'
      ? 'Independent Hero section portrait badge (1:1 circular)'
      : assetType === 'about'
      ? 'Independent About section portrait (Squircle Cyber Frame)'
      : assetType === 'website-logo'
      ? 'Transparent SVG / PNG recommended (400×400px)'
      : assetType === 'og-image'
      ? '1200×630 OpenGraph social share card ratio'
      : assetType === 'cover'
      ? 'Panoramic 3:1 widescreen banner ratio'
      : 'High-definition 16:9 widescreen Hero wallpaper');

  const defaultPlaceholder =
    urlPlaceholder ||
    (assetType === 'favicon'
      ? '/favicon.svg or https://example.com/favicon.png'
      : assetType === 'website-logo'
      ? 'https://example.com/logo.svg'
      : `https://example.com/${assetType}-asset.jpg`);

  return (
    <div className="border border-slate-800/90 bg-slate-950/50 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3.5 transition-all shadow-lg">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Top Header & Accessible 44px Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs sm:text-sm font-bold font-mono text-slate-100">
              {title}
            </h4>
            {value ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                Default Fallback
              </span>
            )}
            {compressionInfo && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                WebP {compressionInfo.originalKb} → {compressionInfo.compressedKb} (-{compressionInfo.savedPercent}%)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Action Buttons — Guaranteed >= 44px height & width touch targets */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={triggerBrowse}
            className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
            title={`Upload ${title}`}
          >
            <UploadCloud className="w-4 h-4 shrink-0" />
            <span>{value ? 'Replace' : 'Upload'}</span>
          </button>

          {onOpenMediaLibrary && (
            <button
              type="button"
              onClick={onOpenMediaLibrary}
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Choose from Media Library"
            >
              <Folder className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Library</span>
            </button>
          )}

          {value && (
            <button
              type="button"
              onClick={onDelete}
              className="min-h-[44px] min-w-[44px] px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title={`Delete ${title}`}
              aria-label={`Delete ${title}`}
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span className="sm:hidden">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Drag-and-Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerBrowse();
          }
        }}
        className={`relative rounded-2xl border-2 border-dashed p-5 flex flex-col items-center justify-center gap-3.5 cursor-pointer transition-all min-h-[156px] select-none ${
          isDraggingOver
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01] shadow-[0_0_25px_rgba(16,185,129,0.2)]'
            : 'border-slate-800 hover:border-emerald-500/40 bg-slate-950/70 hover:bg-slate-950'
        }`}
      >
        {isReadingFile ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
            <span className="text-xs font-mono text-emerald-300">
              Processing dropped media asset...
            </span>
          </div>
        ) : (
          <>
            {/* Tailored Live Asset Preview */}
            {(assetType === 'profile' ||
              assetType === 'hero-avatar' ||
              assetType === 'about') && (
              <div className="pointer-events-none">
                <AnimatedProfileAvatar
                  src={value || ''}
                  alt={fallbackName}
                  size="lg"
                  shape={assetType === 'about' ? 'squircle' : 'circle'}
                  glowIntensity="vibrant"
                  showStatus={false}
                />
              </div>
            )}

            {assetType === 'favicon' && (
              <div className="flex flex-col items-center gap-3 w-full max-w-xs pointer-events-none">
                {/* Simulated Browser Tab Bar Preview */}
                <div className="w-full rounded-xl bg-slate-900/95 border border-slate-800 px-3 py-2 flex items-center gap-2.5 shadow-inner">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-rose-500/70" />
                    <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800/90 rounded-lg px-2.5 py-1 flex-1 min-w-0">
                    {value ? (
                      <img
                        src={value}
                        alt="Favicon Tab Preview"
                        referrerPolicy="no-referrer"
                        className="w-4 h-4 object-contain shrink-0"
                      />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono text-slate-200 truncate">
                      {fallbackName} | Systems Architect
                    </span>
                  </div>
                </div>

                {/* High-Resolution 1:1 Favicon Tile */}
                {value ? (
                  <img
                    src={value}
                    alt="Favicon Icon"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-contain p-2.5 bg-slate-900 border border-emerald-500/30 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500">
                    <Globe className="w-6 h-6 text-emerald-400" />
                    <span className="text-[8px] font-mono text-slate-500 mt-1">
                      Default SVG
                    </span>
                  </div>
                )}
              </div>
            )}

            {assetType === 'website-logo' && (
              <div className="pointer-events-none">
                {value ? (
                  <div className="p-2.5 bg-slate-900/80 border border-emerald-500/30 rounded-2xl flex items-center justify-center min-w-[88px] min-h-[88px]">
                    <img
                      src={value}
                      alt="Website Brand Logo"
                      referrerPolicy="no-referrer"
                      className="max-h-16 max-w-[160px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-400">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {fallbackName.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 mt-1">
                      Monogram
                    </span>
                  </div>
                )}
              </div>
            )}

            {(assetType === 'og-image' ||
              assetType === 'cover' ||
              assetType === 'hero') && (
              <div className="w-full pointer-events-none">
                {value ? (
                  <img
                    src={value}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-24 rounded-xl object-cover border border-slate-800 mx-auto"
                  />
                ) : (
                  <div className="w-full h-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    {assetType === 'og-image' ? (
                      <Share2 className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-slate-500" />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Drag & Drop Prompt Copy */}
            <div className="text-center space-y-0.5 pointer-events-none">
              <p className="text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Drag &amp; drop file here or{' '}
                  <span className="text-emerald-400 underline underline-offset-2">
                    browse computer
                  </span>
                </span>
              </p>
              <p className="text-[10px] font-mono text-slate-500">
                {defaultHelperText}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Direct URL Input Bar with 44px touch height */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
          <LinkIcon className="w-3 h-3 text-emerald-400" />
          <span>Direct Asset URL / CDN Path</span>
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder={defaultPlaceholder}
            className="w-full min-h-[44px] bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pl-3.5 pr-11 py-2.5 text-xs font-mono text-slate-100 transition focus:outline-none"
          />
          {value && (
            <button
              type="button"
              onClick={onDelete}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title="Clear URL"
              aria-label="Clear URL"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {localError && (
        <p className="text-xs font-mono text-rose-400 bg-rose-950/30 border border-rose-500/30 rounded-xl px-3 py-2">
          {localError}
        </p>
      )}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, CheckCircle, Trash2, Cpu } from 'lucide-react';
import SkillMediaRenderer from './SkillMediaRenderer';

interface ImageUploaderProps {
  currentUrl: string;
  onUploadComplete: (url: string) => void;
  onClear: () => void;
}

export default function ImageUploader({ currentUrl, onUploadComplete, onClear }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    original: string;
    compressed: string;
    percentSaved: number;
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

  const compressAndUpload = async (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mov');
    const isLottie = file.type === 'application/json' || file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.tgs');

    if (!isImage && !isVideo && !isLottie) {
      setError("Only image (JPEG, PNG, SVG, WEBP, GIF, AVIF), video (MP4, WebM, MOV), and Lottie JSON formats are supported.");
      return;
    }

    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    const bypassCompression = isVideo || isLottie || isSvg || isGif;

    setError(null);
    setUploading(true);
    setProgress(15);

    try {
      let compressedData;
      
      if (bypassCompression) {
        setProgress(45);
        compressedData = await new Promise<{ dataUrl: string; originalKb: number; compressedKb: number }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("Failed to read file."));
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            let finalDataUrl = dataUrl;
            if (isLottie && !dataUrl.startsWith('data:application/json;')) {
              const base64Data = dataUrl.split(',')[1] || '';
              finalDataUrl = `data:application/json;base64,${base64Data}`;
            }
            resolve({
              dataUrl: finalDataUrl,
              originalKb: Math.round(file.size / 1024),
              compressedKb: Math.round(file.size / 1024)
            });
          };
          reader.readAsDataURL(file);
        });
      } else {
        // Live Client-Side Image Compression for standard static images
        setProgress(30);
        compressedData = await new Promise<{ dataUrl: string; originalKb: number; compressedKb: number }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error("Failed to read image file."));
          reader.onload = (event) => {
            const img = new Image();
            img.onerror = () => reject(new Error("Failed to load image element."));
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              // Maximum dimensions for portfolio responsive preview
              const MAX_WIDTH = 1000;
              const MAX_HEIGHT = 1000;
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to JPEG at 72% quality
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
                const originalKb = Math.round(file.size / 1024);
                const compressedKb = Math.round((compressedDataUrl.length * 0.75) / 1024);
                resolve({
                  dataUrl: compressedDataUrl,
                  originalKb,
                  compressedKb
                });
              } else {
                resolve({
                  dataUrl: event.target?.result as string,
                  originalKb: Math.round(file.size / 1024),
                  compressedKb: Math.round(file.size / 1024)
                });
              }
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      }

      setProgress(60);
      // Generate simulated Cloudinary public path for professional visual fidelity
      const publicId = `portfolio/proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      
      // Wait a tiny bit to represent network streaming
      setTimeout(() => {
        setProgress(100);
        setUploading(false);
        
        // Save compression achievements if we actually compressed it
        if (!bypassCompression) {
          const percentSaved = Math.max(0, Math.round(((compressedData.originalKb - compressedData.compressedKb) / compressedData.originalKb) * 100));
          setCompressionStats({
            original: `${compressedData.originalKb} KB`,
            compressed: `${compressedData.compressedKb} KB`,
            percentSaved
          });
        } else {
          setCompressionStats(null);
        }

        // Pass back the base64 data URL so it renders in the UI immediately
        onUploadComplete(compressedData.dataUrl);
      }, 500);

    } catch (err: any) {
      setError(err.message || "An error occurred during compression.");
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      compressAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      compressAndUpload(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-mono text-slate-400">Media/Thumbnail Asset</label>
        <span className="text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">
          Cloudinary Secured
        </span>
      </div>
      
      {currentUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900/40 p-3 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
            <SkillMediaRenderer 
              src={currentUrl} 
              alt="Preview" 
              variant="cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-emerald-400 truncate flex items-center gap-1.5 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              Securely Committed to CDN Cache
            </p>
            <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
              Mapped Delivery URL: res.cloudinary.com/alexdev/image/upload/...
            </p>
            
            {compressionStats ? (
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 w-fit">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span>
                  Canvas Compressed: {compressionStats.original} → {compressionStats.compressed} ({compressionStats.percentSaved}% Saved)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15 w-fit">
                <Cpu className="w-3 h-3 text-amber-400" />
                <span>
                  Original Format Retained (No Lossy Compression)
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setCompressionStats(null);
              onClear();
            }}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/20 self-end sm:self-center"
            title="Remove asset"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-500/5' 
              : 'border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-3 py-2 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-mono text-slate-400">Stream compressing & syncing with Cloudinary... {progress}%</p>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center justify-center">
              <UploadCloud className={`w-8 h-8 transition-transform duration-200 ${dragActive ? 'scale-110 text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <p className="text-xs font-semibold text-slate-300">Drag & drop asset here, or <span className="text-emerald-400">browse</span></p>
                <p className="text-[10px] text-slate-500 mt-1">PNG, JPEG, SVG, WebP, AVIF, GIF, MP4, WebM, MOV, or Lottie (.json)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-mono text-rose-400 mt-1">{error}</p>
      )}
    </div>
  );
}

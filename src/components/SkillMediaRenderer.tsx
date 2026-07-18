import React, { useEffect, useRef, useState } from 'react';
import { 
  Code2, Layout, Cpu, Database, Terminal, Sliders, Palette, 
  ShieldCheck, Layers, Globe, Smartphone, Network, Braces, 
  Cloud, Lock, Settings, Activity, Sparkles 
} from 'lucide-react';
import lottie from 'lottie-web';

// Mapping of preset names to Lucide icons
const iconMapping: { [key: string]: React.ComponentType<any> } = {
  Code2,
  Layout,
  Cpu,
  Database,
  Terminal,
  Sliders,
  Palette,
  ShieldCheck,
  Layers,
  Globe,
  Smartphone,
  Network,
  Braces,
  Cloud,
  Lock,
  Settings,
  Activity,
  Sparkles
};

// Detect media format from base64 string or URL
export function detectMediaType(src: string): 'svg' | 'image' | 'video' | 'lottie' | 'unknown' {
  if (!src) return 'unknown';

  if (src.startsWith('data:')) {
    const mimeMatch = src.match(/^data:([^;]+);/);
    if (mimeMatch) {
      const mime = mimeMatch[1].toLowerCase();
      if (mime.includes('svg')) return 'svg';
      if (mime.includes('mp4') || mime.includes('webm') || mime.includes('ogg') || mime.includes('video')) return 'video';
      if (mime.includes('json')) return 'lottie';
      if (mime.includes('image')) return 'image';
      
      // Secondary check for text/json or octet-stream holding Lottie
      if (mime.includes('octet-stream') || mime.includes('gzip') || mime.includes('json')) {
        try {
          const base64Data = src.split(',')[1];
          const decoded = atob(base64Data);
          if (decoded.trim().startsWith('{') && decoded.trim().endsWith('}')) {
            return 'lottie';
          }
        } catch (e) {
          // Ignore
        }
      }
    }
    return 'image';
  }

  const cleanUrl = src.split('?')[0].split('#')[0].toLowerCase();
  if (cleanUrl.endsWith('.svg') || cleanUrl.endsWith('.svgz')) return 'svg';
  if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg')) return 'video';
  if (cleanUrl.endsWith('.json')) return 'lottie';
  if (
    cleanUrl.endsWith('.png') || 
    cleanUrl.endsWith('.jpg') || 
    cleanUrl.endsWith('.jpeg') || 
    cleanUrl.endsWith('.gif') || 
    cleanUrl.endsWith('.webp') || 
    cleanUrl.endsWith('.avif')
  ) {
    return 'image';
  }

  // Fallback check if it contains JSON markers
  if (src.trim().startsWith('{') && src.trim().endsWith('}')) {
    return 'lottie';
  }

  return 'image';
}

// 1. SvgAutoCropper for SVGs with large padding
interface SvgAutoCropperProps {
  svgUrl: string;
  className?: string;
  alt?: string;
  variant?: 'icon' | 'cover';
}

export function SvgAutoCropper({ svgUrl, className, alt, variant = 'icon' }: SvgAutoCropperProps) {
  const [croppedSvg, setCroppedSvg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadAndCrop = async () => {
      try {
        let svgText = '';
        if (svgUrl.startsWith('data:image/svg+xml;base64,')) {
          const base64Data = svgUrl.substring('data:image/svg+xml;base64,'.length);
          svgText = atob(base64Data);
        } else if (svgUrl.startsWith('data:image/svg+xml;utf8,')) {
          svgText = decodeURIComponent(svgUrl.substring('data:image/svg+xml;utf8,'.length));
        } else if (svgUrl.startsWith('data:image/svg+xml,')) {
          svgText = decodeURIComponent(svgUrl.substring('data:image/svg+xml,'.length));
        } else {
          const res = await fetch(svgUrl);
          svgText = await res.text();
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (!svgEl) return;

        // Determine initial coordinate space
        let origX = 0, origY = 0, origW = 100, origH = 100;
        const viewBoxAttr = svgEl.getAttribute('viewBox');
        if (viewBoxAttr) {
          const parts = viewBoxAttr.trim().split(/[\s,]+/).map(Number);
          if (parts.length === 4 && parts.every(p => !isNaN(p))) {
            [origX, origY, origW, origH] = parts;
          }
        } else {
          const widthAttr = svgEl.getAttribute('width');
          const heightAttr = svgEl.getAttribute('height');
          const w = widthAttr ? parseFloat(widthAttr) : 100;
          const h = heightAttr ? parseFloat(heightAttr) : 100;
          origW = isNaN(w) ? 100 : w;
          origH = isNaN(h) ? 100 : h;
        }

        // Draw offscreen to scan visible pixels
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 256;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            return;
          }
          ctx.drawImage(img, 0, 0, 256, 256);
          
          const imgData = ctx.getImageData(0, 0, 256, 256);
          const data = imgData.data;
          let minX = 256, minY = 256, maxX = 0, maxY = 0;
          let hasPixels = false;
          
          for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
              const alpha = data[(y * 256 + x) * 4 + 3];
              if (alpha > 5) { // alpha threshold for visual content
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
                hasPixels = true;
              }
            }
          }
          
          URL.revokeObjectURL(url);
          
          if (hasPixels && isMounted) {
            // Apply slight 2-pixel safety buffer to prevent edge clips
            const padding = 2;
            const cropMinX = Math.max(0, minX - padding);
            const cropMinY = Math.max(0, minY - padding);
            const cropMaxX = Math.min(256, maxX + padding);
            const cropMaxY = Math.min(256, maxY + padding);
            
            const pMinX = (cropMinX / 256);
            const pMinY = (cropMinY / 256);
            const pW = ((cropMaxX - cropMinX) / 256);
            const pH = ((cropMaxY - cropMinY) / 256);
            
            const newX = origX + pMinX * origW;
            const newY = origY + pMinY * origH;
            const newW = pW * origW;
            const newH = pH * origH;
            
            svgEl.setAttribute('viewBox', `${newX} ${newY} ${newW} ${newH}`);
          }
          
          // Force liquid, full responsive layout
          svgEl.removeAttribute('width');
          svgEl.removeAttribute('height');
          svgEl.setAttribute('width', '100%');
          svgEl.setAttribute('height', '100%');
          svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          
          if (isMounted) {
            const serializer = new XMLSerializer();
            setCroppedSvg(serializer.serializeToString(svgEl));
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          if (isMounted) {
            svgEl.removeAttribute('width');
            svgEl.removeAttribute('height');
            svgEl.setAttribute('width', '100%');
            svgEl.setAttribute('height', '100%');
            svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            const serializer = new XMLSerializer();
            setCroppedSvg(serializer.serializeToString(svgEl));
          }
        };
        
        img.src = url;
      } catch (err) {
        console.error("Error parsing/cropping SVG:", err);
        if (isMounted) setCroppedSvg(null);
      }
    };
    
    loadAndCrop();
    
    return () => {
      isMounted = false;
    };
  }, [svgUrl]);

  if (croppedSvg) {
    return (
      <div 
        className={`${className} flex items-center justify-center ${variant === 'cover' ? 'w-full h-full' : 'w-[88%] h-[88%]'}`} 
        dangerouslySetInnerHTML={{ __html: croppedSvg }} 
      />
    );
  }

  return (
    <img 
      src={svgUrl} 
      alt={alt || "Skill Icon"} 
      className={`${className} ${variant === 'cover' ? 'w-full h-full object-cover' : 'w-[88%] h-[88%] object-contain'}`} 
      referrerPolicy="no-referrer" 
    />
  );
}

// 2. Lottie Player Component using lightweight, standard lottie-web
interface LottiePlayerProps {
  src: string;
  className?: string;
  variant?: 'icon' | 'cover';
}

export function LottiePlayer({ src, className, variant = 'icon' }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    let animationData: any = null;

    const loadLottie = async () => {
      try {
        if (src.startsWith('data:')) {
          const parts = src.split(',');
          if (parts.length > 1) {
            const base64Data = parts[1];
            const decoded = atob(base64Data);
            animationData = JSON.parse(decoded);
          }
        } else {
          const res = await fetch(src);
          animationData = await res.json();
        }

        if (!isMounted) return;

        if (animationRef.current) {
          animationRef.current.destroy();
        }

        animationRef.current = lottie.loadAnimation({
          container: containerRef.current!,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: animationData,
        });
      } catch (err) {
        console.error("Failed to render Lottie asset:", err);
        if (isMounted) setError(true);
      }
    };

    loadLottie();

    return () => {
      isMounted = false;
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [src]);

  if (error) {
    return (
      <div className="text-[10px] text-rose-400 font-mono text-center flex items-center justify-center h-full w-full">
        Lottie Error
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`${className} flex items-center justify-center`} 
      style={{ 
        width: variant === 'cover' ? '100%' : '88%', 
        height: variant === 'cover' ? '100%' : '88%', 
        overflow: 'hidden' 
      }}
    />
  );
}

// 3. Main Unified Media / Fallback Icon Renderer
interface SkillMediaRendererProps {
  src?: string;
  className?: string;
  fallbackIcon?: string;
  fallbackColor?: string;
  alt?: string;
  isSpin?: boolean;
  variant?: 'icon' | 'cover';
}

export default function SkillMediaRenderer({
  src,
  className = '',
  fallbackIcon = 'Code2',
  fallbackColor = '#10b981',
  alt = 'Skill icon',
  isSpin = false,
  variant = 'icon'
}: SkillMediaRendererProps) {
  
  if (!src) {
    // Render fallback Lucide Preset Vector
    const IconComponent = iconMapping[fallbackIcon] || Code2;
    return (
      <div className={`flex items-center justify-center w-full h-full ${isSpin ? 'animate-spin-slow' : ''}`}>
        <IconComponent 
          className={`${className} w-[60%] h-[60%] transition-all duration-300`} 
          style={{ color: fallbackColor }} 
        />
      </div>
    );
  }

  const mediaType = detectMediaType(src);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-transparent select-none">
      {mediaType === 'svg' && (
        <SvgAutoCropper svgUrl={src} className={className} alt={alt} variant={variant} />
      )}

      {mediaType === 'image' && (
        <img 
          src={src} 
          alt={alt} 
          className={`${className} ${variant === 'cover' ? 'w-full h-full object-cover rounded-lg' : 'w-[88%] h-[88%] object-contain rounded-lg'}`} 
          referrerPolicy="no-referrer" 
        />
      )}

      {mediaType === 'video' && (
        <video 
          src={src} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className={`${className} ${variant === 'cover' ? 'w-full h-full object-cover rounded-lg' : 'w-[88%] h-[88%] object-contain rounded-lg'}`}
        />
      )}

      {mediaType === 'lottie' && (
        <LottiePlayer src={src} className={className} variant={variant} />
      )}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';

export interface AnimatedProfileAvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | 'about';
  showStatus?: boolean;
  statusText?: string;
  isOnline?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  shape?: 'circle' | 'squircle' | 'rounded';
  glowIntensity?: 'subtle' | 'vibrant' | 'none';
  onClick?: () => void;
  interactive?: boolean;
  enableTilt?: boolean;
  fullFit?: boolean;
  objectPosition?: string;
}

export const AnimatedProfileAvatar: React.FC<AnimatedProfileAvatarProps> = ({
  src,
  alt = 'Chandru Mohan',
  size = 'md',
  showStatus = false,
  statusText = 'Online',
  isOnline = true,
  showBadge = false,
  badgeText = '',
  className = '',
  shape = 'squircle',
  glowIntensity = 'vibrant',
  onClick,
  interactive = true,
  enableTilt = true,
  fullFit = true,
  objectPosition = 'object-center'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });

  // Handle subtle 3D tilt and dynamic specular light wave tracking on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current || size === 'xs' || size === 'sm') return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  // Dimension presets
  const sizeConfig = {
    xs: {
      container: 'w-7 h-7',
      initials: 'text-[9px]'
    },
    sm: {
      container: 'w-10 h-10',
      initials: 'text-xs font-bold'
    },
    md: {
      container: 'w-16 h-16',
      initials: 'text-base font-bold'
    },
    lg: {
      container: 'w-24 h-24',
      initials: 'text-2xl font-bold'
    },
    xl: {
      container: 'w-32 h-32',
      initials: 'text-3xl font-extrabold'
    },
    '2xl': {
      container: 'w-48 h-48 sm:w-56 sm:h-56',
      initials: 'text-4xl font-extrabold'
    },
    hero: {
      container: 'w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44',
      initials: 'text-3xl sm:text-4xl font-extrabold'
    },
    about: {
      container: 'w-full max-w-[460px] aspect-square',
      initials: 'text-5xl font-extrabold'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;
  const radiusClass = shape === 'circle' ? 'rounded-full' : shape === 'squircle' ? 'rounded-3xl' : 'rounded-2xl';
  const hasImage = Boolean(src && src.trim() && !imageError);

  const getInitials = (name: string) => {
    if (!name) return 'CM';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div
      ref={cardRef}
      className={`relative inline-flex items-center justify-center select-none ${config.container} ${className} ${
        interactive ? 'cursor-pointer group' : ''
      }`}
      style={{
        perspective: 1200
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* ========================================================================= */}
      {/* 1. LAYER: EXPANDING CONCENTRIC RADAR RIPPLE WAVES                         */}
      {/* ========================================================================= */}
      {glowIntensity !== 'none' && (
        <>
          <div
            className={`absolute inset-0 ${radiusClass} border border-emerald-400/50 pointer-events-none animate-ripple-wave`}
            style={{ animationDelay: '0s' }}
          />
          <div
            className={`absolute inset-0 ${radiusClass} border border-cyan-400/40 pointer-events-none animate-ripple-wave`}
            style={{ animationDelay: '1.2s' }}
          />
          <div
            className={`absolute inset-0 ${radiusClass} border border-teal-300/30 pointer-events-none animate-ripple-wave`}
            style={{ animationDelay: '2.4s' }}
          />
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. LAYER: WAVING LIQUID AURORA AURA (ROTATING & UNDULATING GLOW WAVE)    */}
      {/* ========================================================================= */}
      {glowIntensity !== 'none' && (
        <div
          className={`absolute -inset-3 ${radiusClass} blur-2xl transition-all duration-700 pointer-events-none opacity-80 group-hover:opacity-100 ${
            glowIntensity === 'vibrant' ? 'animate-wave-aurora' : ''
          }`}
          style={{
            background:
              'radial-gradient(circle at 35% 35%, rgba(16,185,129,0.65), rgba(6,182,212,0.55), rgba(59,130,246,0.35), transparent 75%)'
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. LAYER: RUNNING ELECTRIC LIGHT BEAM (ORBITING CONIC HIGH-SPEED BEAM)    */}
      {/* ========================================================================= */}
      <div
        className={`absolute -inset-[3px] ${radiusClass} overflow-hidden pointer-events-none transition-opacity duration-500 p-[3px]`}
      >
        <div
          className="absolute w-[260%] h-[260%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-running-light pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, rgba(6,182,212,0.6) 290deg, rgba(52,211,153,1) 335deg, rgba(255,255,255,1) 360deg)'
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN INNER CARD CONTAINER (FULL FIT EDGE-TO-EDGE WITH 3D TILT)         */}
      {/* ========================================================================= */}
      <div
        className={`relative z-10 w-full h-full ${radiusClass} bg-slate-950 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-2xl transition-transform duration-200 ease-out`}
        style={{
          transform: enableTilt && isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.025, 1.025, 1.025)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
        }}
      >
        {/* ===================================================================== */}
        {/* 5. IMAGE / CONTENT VIEWPORT (100% FULL FIT, CRISP OBJECT-COVER)       */}
        {/* ===================================================================== */}
        <div
          className={`relative z-10 w-full h-full ${radiusClass} overflow-hidden bg-slate-900 flex items-center justify-center`}
        >
          {hasImage ? (
            <img
              src={src}
              alt={alt}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover ${objectPosition} transition-transform duration-700 ease-out ${
                isHovered ? 'scale-106' : 'scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/70 text-emerald-400">
              <span className={`font-mono font-extrabold tracking-wider ${config.initials}`}>
                {getInitials(alt)}
              </span>
            </div>
          )}

          {/* Dynamic Specular Flash following cursor */}
          {isHovered && enableTilt && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-30 mix-blend-overlay z-20"
              style={{
                background: `radial-gradient(circle 240px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.9), transparent 70%)`
              }}
            />
          )}

          {/* Sweeping Glass Light Wave (periodic diagonal light beam) */}
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-glass-sheen z-20" />
        </div>

        {/* ===================================================================== */}
        {/* 6. FUTURISTIC CORNER ACCENTS (FOR LARGE / HERO / ABOUT DISPLAY)       */}
        {/* ===================================================================== */}
        {(size === 'about' || size === 'hero' || size === '2xl') && (
          <>
            <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400/90 rounded-tl-sm pointer-events-none z-30" />
            <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400/90 rounded-tr-sm pointer-events-none z-30" />
            <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400/90 rounded-bl-sm pointer-events-none z-30" />
            <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400/90 rounded-br-sm pointer-events-none z-30" />
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. OPTIONAL CLEAN FLOATING BADGE (ONLY IF EXPLICITLY ENABLED)             */}
      {/* ========================================================================= */}
      {showBadge && badgeText && badgeText.trim() !== '' && (
        <div className="absolute -bottom-3 z-30 px-3 py-1 rounded-full bg-slate-950/95 border border-emerald-500/40 text-emerald-400 text-[11px] font-mono font-semibold shadow-xl shadow-emerald-500/10 flex items-center gap-1.5 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{badgeText}</span>
        </div>
      )}
    </div>
  );
};

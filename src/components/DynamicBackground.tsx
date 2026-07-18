import React from 'react';
import { BackgroundConfig } from '../data/cmsMockData';

interface DynamicBackgroundProps {
  bg: BackgroundConfig | null | undefined;
  gradientStart?: string;
  gradientEnd?: string;
}

export default React.memo(function DynamicBackground({ bg, gradientStart = '#10b981', gradientEnd = '#059669' }: DynamicBackgroundProps) {
  if (!bg || !bg.enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Background layer */}
      <div 
        className="absolute inset-0 transition-all duration-500 bg-cover bg-center"
        style={{
          opacity: bg.opacity,
          filter: `blur(${bg.blur}px) brightness(${bg.brightness})`,
          backgroundImage: bg.type === 'image' && bg.src ? `url(${bg.src})` : 'none',
        }}
      >
        {/* Video loop render */}
        {bg.type === 'video' && bg.src && (
          <video 
            src={bg.src} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}

        {/* Animated matrix / star field effect simulation */}
        {bg.type === 'animated' && (
          <div className="w-full h-full relative bg-slate-950">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] animate-[pulse_3s_infinite]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950" />
          </div>
        )}

        {/* Gradient flow */}
        {bg.type === 'gradient' && (
          <div 
            className="w-full h-full animate-pulse duration-1000" 
            style={{ 
              background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` 
            }} 
          />
        )}
      </div>

      {/* Solid/Semi-Transparent Overlay Color Filter */}
      {bg.overlayColor && (
        <div 
          className="absolute inset-0 transition-all duration-500 mix-blend-multiply pointer-events-none" 
          style={{ backgroundColor: bg.overlayColor, opacity: 0.4 }} 
        />
      )}
    </div>
  );
});

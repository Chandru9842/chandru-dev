import React, { useMemo } from 'react';

export interface DeepSpaceParticleOverlayProps {
  /** Density of particles */
  particleCount?: number;
  /** Visual intensity preset */
  variant?: 'dashboard' | 'hero' | 'global';
  className?: string;
}

interface SpaceParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}

/**
 * DeepSpaceParticleOverlay
 * Ultra-lightweight, GPU-friendly deep-space starfield & coordinate grid overlay
 * with zero JS animation loops and zero heavy CSS blur filters for instant 60-120 FPS scrolling.
 */
export const DeepSpaceParticleOverlay: React.FC<DeepSpaceParticleOverlayProps> = React.memo(
  ({ particleCount = 16, variant = 'dashboard', className = '' }) => {
    const cappedCount = Math.min(particleCount, 18);

    const particles = useMemo<SpaceParticle[]>(() => {
      const palette = ['#10b981', '#34d399', '#06b6d4', '#38bdf8', '#818cf8'];

      return Array.from({ length: cappedCount }, (_, i) => {
        const seed1 = ((i * 73 + 19) % 100) / 100;
        const seed2 = ((i * 41 + 53) % 100) / 100;
        const color = palette[i % palette.length];

        return {
          id: i,
          x: seed1 * 96 + 2,
          y: seed2 * 94 + 3,
          size: i % 4 === 0 ? 3 : 2,
          color,
          opacity: variant === 'hero' ? 0.55 : 0.4,
        };
      });
    }, [cappedCount, variant]);

    return (
      <div
        className={`pointer-events-none select-none overflow-hidden ${className}`}
        aria-hidden="true"
        style={{ contain: 'strict' }}
      >
        {/* 1. Zero-Filter Radial Nebula Gradients (Replaces heavy blur-[120px] divs) */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle 340px at 14% 12%, rgba(16, 185, 129, 0.09) 0%, transparent 75%),
              radial-gradient(circle 380px at 86% 82%, rgba(6, 182, 212, 0.08) 0%, transparent 75%)
            `,
          }}
        />

        {/* 2. Subtle Perspective Cyber Grid Mesh */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(16, 185, 129, 0.14) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(16, 185, 129, 0.14) 1px, transparent 1px)
            `,
            backgroundSize: variant === 'hero' ? '56px 56px' : '64px 64px',
          }}
        />

        {/* 3. Static / CSS-Composited Starfield Nodes */}
        {particles.map((p) => (
          <span
            key={p.id}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
            }}
            className="absolute rounded-full"
          />
        ))}
      </div>
    );
  }
);

export default DeepSpaceParticleOverlay;

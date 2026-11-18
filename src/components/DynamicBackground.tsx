import React, { useEffect, useRef } from 'react';
import { BackgroundConfig } from '../data/cmsMockData';

interface DynamicBackgroundProps {
  bg?: BackgroundConfig | null | undefined;
  gradientStart?: string;
  gradientEnd?: string;
  /** Always render the ambient interactive cyber-constellation & aurora canvas end-to-end */
  alwaysRenderAmbient?: boolean;
}

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

export default React.memo(function DynamicBackground({
  bg,
  gradientStart = '#10b981',
  gradientEnd = '#06b6d4',
  alwaysRenderAmbient = true,
}: DynamicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let isScrolling = false;
    let scrollTimeoutId: number | null = null;
    let lastFrameTime = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const isMobileViewport = width < 768;
    const shouldAnimate = !prefersReducedMotion && !isMobileViewport;

    const palette = ['#10b981', '#34d399', '#06b6d4', '#38bdf8'];
    const nodeCount = isMobileViewport
      ? 10
      : Math.min(Math.max(Math.floor((width * height) / 68000), 14), 24);

    const nodes: ParticleNode[] = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.4 + 0.9,
      color: palette[i % palette.length],
      alpha: Math.random() * 0.4 + 0.2,
    }));

    const maxConnectDistSq = 135 * 135;

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (shouldAnimate) {
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0) n.x = width;
          if (n.x > width) n.x = 0;
          if (n.y < 0) n.y = height;
          if (n.y > height) n.y = 0;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.alpha;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxConnectDistSq) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = '#10b981';
            ctx.globalAlpha = (1 - distSq / maxConnectDistSq) * 0.14;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
    };

    const render = (timestamp: number) => {
      if (!shouldAnimate || isScrolling || document.hidden) {
        animationFrameId = 0;
        return;
      }
      animationFrameId = window.requestAnimationFrame(render);

      if (timestamp - lastFrameTime < 48) {
        return;
      }
      lastFrameTime = timestamp;
      drawFrame();
    };

    const handleScrollPause = () => {
      if (!shouldAnimate) return;
      isScrolling = true;
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
      if (scrollTimeoutId !== null) {
        window.clearTimeout(scrollTimeoutId);
      }
      scrollTimeoutId = window.setTimeout(() => {
        isScrolling = false;
        if (!animationFrameId && shouldAnimate && !document.hidden) {
          animationFrameId = window.requestAnimationFrame(render);
        }
      }, 180);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    if (shouldAnimate) {
      window.addEventListener('scroll', handleScrollPause, { passive: true });
    }

    // Draw initial crisp frame immediately
    drawFrame();
    if (shouldAnimate) {
      animationFrameId = window.requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      if (scrollTimeoutId !== null) window.clearTimeout(scrollTimeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScrollPause);
    };
  }, []);

  const hasCustomBg = Boolean(bg && bg.enabled);

  if (!hasCustomBg && !alwaysRenderAmbient) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-[1]"
      style={{ contain: 'strict' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      />

      {hasCustomBg && bg && (
        <div
          className="absolute inset-0 transition-opacity duration-500 bg-cover bg-center"
          style={{
            opacity: bg.opacity,
            filter: `blur(${Math.min(bg.blur || 0, 12)}px) brightness(${bg.brightness})`,
            backgroundImage: bg.type === 'image' && bg.src ? `url(${bg.src})` : 'none',
          }}
        >
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

          {bg.type === 'animated' && (
            <div className="w-full h-full relative bg-slate-950/60">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950" />
            </div>
          )}

          {bg.type === 'gradient' && (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
              }}
            />
          )}
        </div>
      )}

      {hasCustomBg && bg?.overlayColor && (
        <div
          className="absolute inset-0 transition-opacity duration-500 mix-blend-multiply pointer-events-none"
          style={{ backgroundColor: bg.overlayColor, opacity: 0.4 }}
        />
      )}
    </div>
  );
});

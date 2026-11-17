import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

/**
 * Slim, emerald-colored progress bar fixed at the very top of the screen
 * that tracks page scroll position to provide spatial context on long-form documentation.
 */
export const TopScrollProgressBar = React.memo(function TopScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001
  });
  const [percent, setPercent] = useState<number>(0);

  useEffect(() => {
    const updateScrollPercent = () => {
      const docEl = document.documentElement;
      const totalScrollable = docEl.scrollHeight - window.innerHeight;
      if (totalScrollable <= 0) {
        setPercent(0);
        return;
      }
      const currentProgress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalScrollable) * 100)));
      setPercent(currentProgress);
    };

    updateScrollPercent();
    window.addEventListener('scroll', updateScrollPercent, { passive: true });
    window.addEventListener('resize', updateScrollPercent, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollPercent);
      window.removeEventListener('resize', updateScrollPercent);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[150] h-[3px] bg-slate-950/50 pointer-events-none overflow-hidden"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll reading progress"
    >
      <motion.div
        style={{ scaleX: smoothProgress, transformOrigin: '0% 50%' }}
        className="w-full h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(16,185,129,0.95),0_0_4px_rgba(52,211,153,0.9)]"
      />
    </div>
  );
});

/**
 * Navigation bar Mute/Unmute button for the subtle, low-volume 'ambient space' audio loop.
 */
export function AmbientSpaceAudioToggle({ className = '' }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => soundFx.isAmbientPlaying());

  useEffect(() => {
    const handleSync = () => {
      setIsPlaying(soundFx.isAmbientPlaying());
    };
    window.addEventListener('ambient-audio-state-changed', handleSync);
    return () => window.removeEventListener('ambient-audio-state-changed', handleSync);
  }, []);

  const handleToggle = () => {
    const active = soundFx.toggleAmbientSpace();
    setIsPlaying(active);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? 'Mute Ambient Space Audio' : 'Unmute Ambient Space Audio'}
      title={isPlaying ? 'Ambient Space Audio Active (Click to Mute)' : 'Play Subtle Ambient Space Audio Loop'}
      className={`group relative inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0 ${
        isPlaying
          ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.28)] hover:bg-emerald-500/25'
          : 'border-white/[0.08] bg-slate-900/70 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/35 hover:bg-slate-900'
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          {/* Animated 3-bar Equalizer Indicator */}
          <span className="flex items-end gap-[2px] h-3" aria-hidden="true">
            <motion.span
              animate={{ height: ['35%', '100%', '45%'] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              className="w-[2px] bg-emerald-400 rounded-full"
            />
            <motion.span
              animate={{ height: ['90%', '35%', '100%'] }}
              transition={{ duration: 0.75, repeat: Infinity, ease: 'easeInOut' }}
              className="w-[2px] bg-teal-300 rounded-full"
            />
            <motion.span
              animate={{ height: ['50%', '95%', '30%'] }}
              transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut' }}
              className="w-[2px] bg-emerald-400 rounded-full"
            />
          </span>
          <span className="hidden sm:inline text-[11px] tracking-wide text-emerald-300">Ambient</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0 transition-colors" />
          <span className="hidden sm:inline text-[11px] tracking-wide">Ambient</span>
        </>
      )}
    </button>
  );
}

export default TopScrollProgressBar;

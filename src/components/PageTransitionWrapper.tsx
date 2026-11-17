import React, { useEffect, useId, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  Variants,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

/**
 * Smooth hardware-accelerated easing curves for perceived performance
 * Follows 150ms–260ms UI motion budget with exponential out-settling.
 */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT_CUBIC: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.992,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: EASE_OUT_EXPO,
      when: 'beforeChildren',
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    transition: {
      duration: 0.14,
      ease: EASE_IN_OUT_CUBIC,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.02,
    },
  },
};

export const cardEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.985,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: EASE_OUT_EXPO,
    },
  },
};

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Attaches an interactive SVG screen-glare & material reflection shimmer overlay
 * to standalone `.glass-card` DOM nodes not already wrapped in `<AnimatedCard />`.
 */
function attachStandaloneGlassCardSvgShimmer(card: HTMLElement, uid: string): () => void {
  if (card.dataset.svgShimmerAttached === 'true') return () => {};
  card.dataset.svgShimmerAttached = 'true';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.className.baseVal =
    'pointer-events-none select-none absolute inset-0 w-full h-full rounded-[inherit] opacity-0 transition-opacity duration-300 z-[1]';

  const radialId = `gc-glare-rad-${uid}`;
  const linearId = `gc-glare-lin-${uid}`;

  svg.innerHTML = `
    <defs>
      <radialGradient id="${radialId}" cx="50%" cy="50%" r="55%" fx="50%" fy="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.20" />
        <stop offset="28%" stop-color="#6ee7b7" stop-opacity="0.11" />
        <stop offset="58%" stop-color="#38bdf8" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#020617" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="${linearId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="42%" stop-color="#ffffff" stop-opacity="0.03" />
        <stop offset="50%" stop-color="#a7f3d0" stop-opacity="0.12" />
        <stop offset="58%" stop-color="#bae6fd" stop-opacity="0.04" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="100" height="100" fill="url(#${radialId})" />
    <rect x="0" y="0" width="100" height="100" fill="url(#${linearId})" />
    <rect x="0.4" y="0.4" width="99.2" height="99.2" rx="4" fill="none" stroke="url(#${radialId})" stroke-width="0.9" />
  `;

  card.appendChild(svg);

  const radGrad = svg.querySelector(`#${radialId}`);
  const linGrad = svg.querySelector(`#${linearId}`);

  const onMove = (e: PointerEvent) => {
    const rect = card.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100));

    if (radGrad) {
      radGrad.setAttribute('cx', `${xPct.toFixed(1)}%`);
      radGrad.setAttribute('cy', `${yPct.toFixed(1)}%`);
      radGrad.setAttribute('fx', `${xPct.toFixed(1)}%`);
      radGrad.setAttribute('fy', `${yPct.toFixed(1)}%`);
    }
    if (linGrad) {
      linGrad.setAttribute('x1', `${(xPct - 45).toFixed(1)}%`);
      linGrad.setAttribute('y1', `${(yPct - 45).toFixed(1)}%`);
      linGrad.setAttribute('x2', `${(xPct + 55).toFixed(1)}%`);
      linGrad.setAttribute('y2', `${(yPct + 55).toFixed(1)}%`);
    }
    svg.style.opacity = '1';
    card.style.setProperty('--glare-x', `${xPct.toFixed(1)}%`);
    card.style.setProperty('--glare-y', `${yPct.toFixed(1)}%`);
  };

  const onLeave = () => {
    svg.style.opacity = '0';
  };

  card.addEventListener('pointermove', onMove, { passive: true });
  card.addEventListener('pointerleave', onLeave, { passive: true });

  return () => {
    card.removeEventListener('pointermove', onMove);
    card.removeEventListener('pointerleave', onLeave);
    if (svg.parentNode === card) {
      card.removeChild(svg);
    }
    delete card.dataset.svgShimmerAttached;
  };
}

export interface PageTransitionWrapperProps {
  /** Unique key representing the active route, tab, or dashboard subpage */
  pageKey: string;
  children: React.ReactNode;
  className?: string;
  /** Automatically stagger-animate child cards & panels inside the page on switch */
  autoStaggerCards?: boolean;
  /** Transition mode for AnimatePresence */
  mode?: 'wait' | 'sync' | 'popLayout';
}

/**
 * Global PageTransitionWrapper
 * Wraps dashboard page switches and view changes with Framer Motion's AnimatePresence,
 * orchestrates staggered card entrance animations, and attaches SVG screen-glare shimmer
 * to standalone `.glass-card` elements.
 */
export const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({
  pageKey,
  children,
  className = '',
  autoStaggerCards = true,
  mode = 'wait',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const root = containerRef.current;
    const animations: Animation[] = [];
    const cleanups: (() => void)[] = [];

    if (autoStaggerCards) {
      const cardTargets = root.querySelectorAll<HTMLElement>(
        '.glass-card, .rounded-2xl, .rounded-3xl, [data-animate-card="true"]'
      );

      cardTargets.forEach((el, index) => {
        if (el.dataset.framerManaged === 'true') return;
        const delayMs = Math.min(index * 38, 320);
        if (typeof el.animate === 'function') {
          const anim = el.animate(
            [
              {
                opacity: '0',
                transform: 'translate3d(0, 14px, 0) scale(0.988)',
              },
              {
                opacity: '1',
                transform: 'translate3d(0, 0, 0) scale(1)',
              },
            ],
            {
              duration: 320,
              delay: delayMs,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'backwards',
            }
          );
          animations.push(anim);
        }
      });
    }

    // Attach SVG shimmer glare to standalone .glass-card elements
    const glassCards = root.querySelectorAll<HTMLElement>('.glass-card');
    glassCards.forEach((card, idx) => {
      if (card.dataset.framerManaged === 'true') return;
      cleanups.push(attachStandaloneGlassCardSvgShimmer(card, `${pageKey}-${idx}`));
    });

    return () => {
      animations.forEach((anim) => anim.cancel());
      cleanups.forEach((fn) => fn());
    };
  }, [pageKey, autoStaggerCards]);

  return (
    <AnimatePresence mode={mode} initial={false}>
      <motion.div
        key={pageKey}
        ref={containerRef}
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`will-change-[transform,opacity] ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

/**
 * StaggerContainer
 * Orchestrates staggered entrance animations for child <AnimatedCard /> components.
 */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.055,
  delayChildren = 0.02,
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  /** Optional index for standalone staggered delay when not inside a StaggerContainer */
  index?: number;
  /** Enable subtle hover lift & 3D float effect */
  hoverLift?: boolean;
  /** Enable continuous subtle ambient float oscillation */
  ambientFloat?: boolean;
  /** Maximum 3D perspective tilt angle in degrees during pointer hover */
  tiltIntensity?: number;
  onClick?: () => void;
}

/**
 * AnimatedCard
 * Reusable Framer Motion card entrance, ambient levitation 'float', 3D perspective tilt,
 * and dynamic SVG-based 'shimmer' screen-glare overlay that follows mouse movement.
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  index,
  hoverLift = true,
  ambientFloat = true,
  tiltIntensity = 3.5,
  onClick,
}) => {
  const rawUid = useId().replace(/:/g, '');
  const cardRef = useRef<HTMLDivElement | null>(null);
  const svgRadGradRef = useRef<SVGRadialGradientElement | null>(null);
  const svgLinGradRef = useRef<SVGLinearGradientElement | null>(null);
  const svgGlareStreakRef = useRef<SVGLineElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Normalized pointer coordinates (-0.5 to 0.5) for 3D float & tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 260, damping: 24, mass: 0.6 };
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]),
    springConfig
  );
  const floatOffsetX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2.5, 2.5]), springConfig);
  const floatOffsetY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-4.5, 1.5]), springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    const relX = (e.clientX - rect.left) / width;
    const relY = (e.clientY - rect.top) / height;

    mouseX.set(relX - 0.5);
    mouseY.set(relY - 0.5);

    const xPct = Math.max(0, Math.min(100, relX * 100));
    const yPct = Math.max(0, Math.min(100, relY * 100));

    // Directly update SVG gradient & anamorphic glare coordinates for 60FPS zero-re-render tracking
    if (svgRadGradRef.current) {
      svgRadGradRef.current.setAttribute('cx', `${xPct.toFixed(1)}%`);
      svgRadGradRef.current.setAttribute('cy', `${yPct.toFixed(1)}%`);
      svgRadGradRef.current.setAttribute('fx', `${xPct.toFixed(1)}%`);
      svgRadGradRef.current.setAttribute('fy', `${yPct.toFixed(1)}%`);
    }
    if (svgLinGradRef.current) {
      svgLinGradRef.current.setAttribute('x1', `${(xPct - 45).toFixed(1)}%`);
      svgLinGradRef.current.setAttribute('y1', `${(yPct - 45).toFixed(1)}%`);
      svgLinGradRef.current.setAttribute('x2', `${(xPct + 55).toFixed(1)}%`);
      svgLinGradRef.current.setAttribute('y2', `${(yPct + 55).toFixed(1)}%`);
    }
    if (svgGlareStreakRef.current) {
      svgGlareStreakRef.current.setAttribute('x1', `${(xPct - 28).toFixed(1)}`);
      svgGlareStreakRef.current.setAttribute('y1', `${(yPct - 18).toFixed(1)}`);
      svgGlareStreakRef.current.setAttribute('x2', `${(xPct + 28).toFixed(1)}`);
      svgGlareStreakRef.current.setAttribute('y2', `${(yPct + 18).toFixed(1)}`);
    }

    cardRef.current.style.setProperty('--glare-x', `${xPct.toFixed(1)}%`);
    cardRef.current.style.setProperty('--glare-y', `${yPct.toFixed(1)}%`);
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const customVariants: Variants =
    typeof index === 'number'
      ? {
          hidden: { opacity: 0, y: 16, scale: 0.985 },
          show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.28,
              delay: Math.min(index * 0.055, 0.35),
              ease: EASE_OUT_EXPO,
            },
          },
        }
      : cardEntranceVariants;

  const floatDuration = 5.2 + ((index ?? 0) % 4) * 0.65;
  const radId = `svg-shimmer-rad-${rawUid}`;
  const linId = `svg-shimmer-lin-${rawUid}`;
  const streakId = `svg-shimmer-streak-${rawUid}`;

  return (
    <motion.div
      ref={cardRef}
      data-framer-managed="true"
      variants={customVariants}
      initial={typeof index === 'number' ? 'hidden' : undefined}
      animate={typeof index === 'number' ? 'show' : undefined}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      whileHover={
        hoverLift
          ? {
              y: -6,
              scale: 1.008,
              transition: { type: 'spring', stiffness: 320, damping: 22 },
            }
          : {
              y: -3,
              transition: { type: 'spring', stiffness: 300, damping: 24 },
            }
      }
      whileTap={
        onClick
          ? {
              scale: 0.992,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      style={{
        perspective: 1100,
        rotateX: hoverLift ? rotateX : 0,
        rotateY: hoverLift ? rotateY : 0,
        x: hoverLift ? floatOffsetX : 0,
        y: hoverLift ? floatOffsetY : 0,
      }}
      onClick={onClick}
      className={`will-change-[transform,opacity] ${className}`}
    >
      {/* Subtle Continuous Ambient Float Wrapper */}
      <motion.div
        animate={
          ambientFloat && !isHovered
            ? {
                y: [0, -3, 0],
              }
            : { y: 0 }
        }
        transition={
          ambientFloat && !isHovered
            ? {
                duration: floatDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.2 }
        }
        className="w-full h-full relative"
      >
        {/* ===================================================================
            DYNAMIC SVG-BASED 'SHIMMER' & SCREEN GLARE OVERLAY
            Follows mouse movement for specular reflection & prism dispersion
        =================================================================== */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          className={`pointer-events-none select-none absolute inset-0 w-full h-full rounded-[inherit] z-0 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <defs>
            {/* Primary Cursor-Tracked Specular Screen Glare Radial Gradient */}
            <radialGradient
              ref={svgRadGradRef}
              id={radId}
              cx="50%"
              cy="50%"
              r="56%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="24%" stopColor="#6ee7b7" stopOpacity="0.13" />
              <stop offset="52%" stopColor="#38bdf8" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>

            {/* Diagonal Anamorphic Glass Sheen Band */}
            <linearGradient ref={svgLinGradRef} id={linId} x1="5%" y1="5%" x2="95%" y2="95%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="38%" stopColor="#ffffff" stopOpacity="0.025" />
              <stop offset="50%" stopColor="#a7f3d0" stopOpacity="0.14" />
              <stop offset="62%" stopColor="#bae6fd" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Specular Glare Streak Gradient */}
            <linearGradient id={streakId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Radial Specular Glare Surface */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${radId})`} />

          {/* Diagonal Anamorphic Screen Reflection */}
          <rect x="0" y="0" width="100" height="100" fill={`url(#${linId})`} />

          {/* Dynamic Specular Glare Streak Line */}
          <line
            ref={svgGlareStreakRef}
            x1="22"
            y1="32"
            x2="78"
            y2="68"
            stroke={`url(#${streakId})`}
            strokeWidth="0.6"
            strokeLinecap="round"
          />

          {/* Perimeter Bevel Inner-Edge Specular Reflection */}
          <rect
            x="0.35"
            y="0.35"
            width="99.3"
            height="99.3"
            rx="4"
            fill="none"
            stroke={`url(#${radId})`}
            strokeWidth="0.85"
          />
        </svg>

        <div className="relative z-10 w-full h-full">{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default PageTransitionWrapper;

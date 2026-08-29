import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, Shield, Database, BarChart3, Palette, 
  Cpu, ArrowRight, X, Sparkles, CheckCircle2, Lock, KeyRound
} from 'lucide-react';

interface RecruiterDemoGateProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterDemo: () => void;
  onAdminLogin?: () => void;
}

export default function RecruiterDemoGate({ isOpen, onClose, onEnterDemo, onAdminLogin }: RecruiterDemoGateProps) {
  const [isEntering, setIsEntering] = useState(false);

  // Lock background body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnterDemo();
      setIsEntering(false);
    }, 600);
  };

  const features = [
    { icon: <Database className="w-4 h-4" />, label: 'Live Database Explorer', desc: 'Browse projects, skills, certificates & work history records' },
    { icon: <BarChart3 className="w-4 h-4" />, label: 'Real-Time Analytics', desc: 'Inspect live traffic metrics, visitor engagement & logs' },
    { icon: <Palette className="w-4 h-4" />, label: 'Theme & Appearance', desc: 'Preview the theming engine & typography design controls' },
    { icon: <Cpu className="w-4 h-4" />, label: 'System Architecture', desc: 'Explore system health, API endpoints & microservice status' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex items-center justify-center min-h-screen"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xl" />
          
          {/* Animated ambient glowing waves */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Gate Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg my-auto bg-gradient-to-b from-slate-900/98 via-slate-950/99 to-[#020617] border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/80 overflow-hidden max-h-[90vh] flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top running gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 shrink-0" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all z-20 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scrollable Body Content */}
            <div className="px-6 sm:px-8 pt-7 pb-6 overflow-y-auto flex-1 overscroll-contain">
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-center mb-3.5 shadow-lg shadow-emerald-500/10"
                >
                  <Eye className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                </motion.div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-1.5">
                  Recruiter & Admin Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                  Welcome! Choose how you would like to explore Chandru's full-stack CMS architecture.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                      {feature.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">{feature.label}</p>
                      <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15 mb-5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-0.5">Read-Only Recruiter Tour</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Instant 1-click access with zero credentials required. All write operations are safely sandboxed to protect production data.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                {/* Primary: Recruiter Demo Tour */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnter}
                  disabled={isEntering}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isEntering ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Sparkles className="w-4.5 h-4.5 text-slate-950" />
                      </motion.div>
                      <span>Entering Recruiter Tour...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4.5 h-4.5 text-slate-950" />
                      <span>Enter Recruiter Tour (Instant Access)</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </motion.button>

                {/* Secondary: Master Admin Login */}
                {onAdminLogin && (
                  <button
                    onClick={onAdminLogin}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Master Admin Sign In (Full Write Access)</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2 px-4 rounded-xl bg-transparent border border-white/[0.05] hover:border-white/[0.12] text-slate-500 hover:text-slate-300 text-xs font-mono transition-all cursor-pointer"
                >
                  ← Return to Portfolio
                </button>
              </div>
            </div>

            {/* Bottom badge */}
            <div className="px-6 sm:px-8 py-3 border-t border-white/[0.04] bg-white/[0.01] flex items-center justify-center gap-2 shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest text-center">
                Instant 1-Click Access • Clean Architecture • Production-Safe
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

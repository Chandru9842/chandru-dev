import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, Shield, Lock, Database, BarChart3, Palette, 
  Cpu, ArrowRight, X, Sparkles, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface RecruiterDemoGateProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterDemo: () => void;
}

export default function RecruiterDemoGate({ isOpen, onClose, onEnterDemo }: RecruiterDemoGateProps) {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnterDemo();
      setIsEntering(false);
    }, 800);
  };

  const features = [
    { icon: <Database className="w-4 h-4" />, label: 'Live Database Explorer', desc: 'Browse all projects, skills, certifications & experience records' },
    { icon: <BarChart3 className="w-4 h-4" />, label: 'Real-Time Analytics', desc: 'View traffic metrics, visitor engagement & performance data' },
    { icon: <Palette className="w-4 h-4" />, label: 'Theme & Appearance', desc: 'Inspect the full theming engine & design system controls' },
    { icon: <Cpu className="w-4 h-4" />, label: 'System Architecture', desc: 'Explore system health, API endpoints & infrastructure status' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          
          {/* Animated ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/6 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Gate Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/98 via-slate-950/99 to-[#020617] border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-all z-10 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 sm:px-8 pt-8 pb-6">
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10"
                >
                  <Eye className="w-7 h-7 text-emerald-400" />
                </motion.div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-1.5">
                  Recruiter & Reviewer Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                  Explore Chandru's full-stack CMS architecture with <span className="text-emerald-400 font-semibold">complete read-only access</span> to every system module.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
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
                      <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 mb-6">
                <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-0.5">Read-Only Sandbox</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    All write operations (create, edit, delete) are sandboxed. The production database remains fully protected. Admin-level modifications require master authentication via <span className="text-slate-300 font-mono">/admin</span>.
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnter}
                  disabled={isEntering}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isEntering ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Sparkles className="w-4.5 h-4.5" />
                      </motion.div>
                      <span>Initializing Demo Session...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4.5 h-4.5" />
                      <span>Enter Recruiter Demo Tour</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </motion.button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-transparent border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-white/[0.12] text-xs font-mono font-medium transition-all cursor-pointer"
                >
                  ← Back to Portfolio
                </button>
              </div>
            </div>

            {/* Bottom badge */}
            <div className="px-6 sm:px-8 py-3 border-t border-white/[0.04] bg-white/[0.01] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                No credentials required • Instant access • Production-safe
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

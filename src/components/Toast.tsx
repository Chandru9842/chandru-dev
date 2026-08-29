import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-2xl max-w-md overflow-hidden ${
        isSuccess
          ? 'bg-slate-950/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40'
          : 'bg-slate-950/95 border-rose-500/40 text-rose-200 shadow-rose-950/40'
      }`}
    >
      {/* Running gradient accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] ${
          isSuccess
            ? 'bg-gradient-to-r from-emerald-500 via-teal-300 to-cyan-400 animate-pulse'
            : 'bg-gradient-to-r from-rose-500 via-red-400 to-amber-400 animate-pulse'
        }`}
      />

      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
          isSuccess
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs font-mono font-semibold leading-snug">{message}</p>
      </div>

      <button
        onClick={onClose}
        className="p-1 hover:bg-white/[0.08] rounded-lg text-slate-400 hover:text-slate-100 transition-colors cursor-pointer shrink-0"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

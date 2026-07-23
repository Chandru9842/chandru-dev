import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Trash2, X, Info, AlertTriangle, UserCheck, ShieldAlert, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onNavigateTab: (tab: string) => void;
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onNavigateTab
}: NotificationsDrawerProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  System Notifications
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </h3>
                <p className="text-[10px] font-mono text-slate-400">Real-time alerts & activity log</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 rounded-xl transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between px-5 text-xs font-mono">
            <button
              onClick={onMarkAllRead}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClearAll}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear all</span>
            </button>
          </div>

          {/* List */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.read
                      ? 'bg-slate-950/30 border-slate-800/60 opacity-80'
                      : 'bg-slate-950/80 border-emerald-500/30 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                        {item.type}
                      </span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 mt-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  {item.link && (
                    <button
                      onClick={() => {
                        if (item.link) onNavigateTab(item.link);
                        onClose();
                      }}
                      className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                    >
                      <span>View in {item.link}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-3">
                <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-mono text-slate-500">No active notifications</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-[10px] font-mono text-slate-500 text-center">
            Enterprise Security Notification System Active
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

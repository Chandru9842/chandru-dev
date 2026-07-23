import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, Activity, ShieldAlert, Rocket, Mail, Clock, Megaphone, Settings,
  Search, Filter, CheckCircle2, AlertTriangle, Info, XCircle, Pin, Trash2,
  Archive, Download, RefreshCw, Plus, Send, ExternalLink, RotateCcw,
  ShieldCheck, Cpu, BookOpen, Folder, User, Check, Eye, Sliders, Globe,
  Calendar, Zap, HardDrive, Terminal
} from 'lucide-react';

export interface NotificationEvent {
  id: string;
  eventId?: string;
  module: string;
  action: string;
  title: string;
  description: string;
  message?: string;
  performedBy?: string;
  timestamp: string;
  createdAt?: string;
  severity: 'Information' | 'Success' | 'Warning' | 'Error' | 'Critical';
  category: string;
  icon?: string;
  color?: string;
  status?: string;
  read: boolean;
  unread?: boolean;
  pinned?: boolean;
  archived?: boolean;
  metadata?: any;
}

interface NotificationCenterPageProps {
  onTriggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onNavigateTab?: (tab: string) => void;
  initialSubTab?: string;
}

export default function NotificationCenterPage({
  onTriggerToast,
  onNavigateTab,
  initialSubTab = 'dashboard'
}: NotificationCenterPageProps) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Selected item IDs for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modals & Forms
  const [showNewNotifModal, setShowNewNotifModal] = useState(false);
  const [newNotifForm, setNewNotifForm] = useState({
    module: 'System Notice',
    action: 'Admin Broadcast',
    title: '',
    description: '',
    severity: 'Information' as const,
    category: 'Announcements',
    pinned: false
  });

  // Settings state
  const [notifSettings, setNotifSettings] = useState({
    toastAlerts: true,
    soundEnabled: false,
    emailAlertsOnCritical: true,
    desktopAlerts: false,
    retentionDays: 60,
    enabledCategories: ['Projects', 'Profile', 'Media', 'Security', 'System', 'Deployment', 'Email', 'Tasks', 'Announcements']
  });

  useEffect(() => {
    fetchNotifications();
    fetchSettings();

    // Auto polling for live notifications every 6 seconds
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/notification-settings');
      if (res.ok) {
        const data = await res.json();
        setNotifSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch notification settings', err);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // --- ACTIONS ---
  const handleMarkRead = async (id?: string) => {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (!id || n.id === id || n.eventId === id ? { ...n, read: true, unread: false, status: 'READ' } : n))
        );
        onTriggerToast(id ? 'Marked notification as read.' : 'Marked all notifications as read.', 'success');
      }
    } catch (err) {
      onTriggerToast('Failed to update notification state.', 'error');
    }
  };

  const handleMarkUnread = async (id: string) => {
    try {
      const res = await fetch('/api/notifications/mark-unread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id || n.eventId === id ? { ...n, read: false, unread: true, status: 'UNREAD' } : n))
        );
        onTriggerToast('Marked notification as unread.', 'success');
      }
    } catch (err) {
      onTriggerToast('Failed to update notification.', 'error');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const res = await fetch('/api/notifications/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id || n.eventId === id ? { ...n, pinned: !n.pinned } : n))
        );
        onTriggerToast('Toggled notification pin state.', 'success');
      }
    } catch (err) {
      onTriggerToast('Failed to pin notification.', 'error');
    }
  };

  const handleToggleArchive = async (id: string) => {
    try {
      const res = await fetch('/api/notifications/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id || n.eventId === id ? { ...n, archived: !n.archived } : n))
        );
        onTriggerToast('Updated notification archived state.', 'success');
      }
    } catch (err) {
      onTriggerToast('Failed to archive notification.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id && n.eventId !== id));
        onTriggerToast('Notification deleted.', 'success');
      }
    } catch (err) {
      onTriggerToast('Failed to delete notification.', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all non-pinned notifications?')) return;
    try {
      const res = await fetch('/api/notifications/clear', { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.pinned));
        onTriggerToast('Cleared non-pinned notifications.', 'success');
      }
    } catch (err) {
      onTriggerToast('Failed to clear notifications.', 'error');
    }
  };

  const handleTriggerDeploy = async (provider = 'Railway Deploy') => {
    try {
      onTriggerToast(`Initiated ${provider} deployment...`, 'info');
      const res = await fetch('/api/deployments/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, environment: 'Production', branch: 'main' })
      });
      if (res.ok) {
        onTriggerToast('Deployment build sequence started!', 'success');
        setTimeout(() => fetchNotifications(), 500);
      }
    } catch (err) {
      onTriggerToast('Failed to trigger deployment.', 'error');
    }
  };

  const handleRunTask = async (taskName: string) => {
    try {
      onTriggerToast(`Running task "${taskName}"...`, 'info');
      const res = await fetch('/api/tasks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskName })
      });
      if (res.ok) {
        onTriggerToast(`Task "${taskName}" executed successfully.`, 'success');
        fetchNotifications();
      }
    } catch (err) {
      onTriggerToast('Failed to execute scheduled task.', 'error');
    }
  };

  const handleRetryEmail = async (notificationId: string, recipient = 'client@example.com') => {
    try {
      onTriggerToast(`Retrying email delivery to ${recipient}...`, 'info');
      const res = await fetch('/api/email/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, recipient })
      });
      if (res.ok) {
        onTriggerToast(`Email delivered to ${recipient}.`, 'success');
        fetchNotifications();
      }
    } catch (err) {
      onTriggerToast('Failed to retry email.', 'error');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifForm.title.trim() || !newNotifForm.description.trim()) {
      onTriggerToast('Title and description are required.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotifForm)
      });
      if (res.ok) {
        onTriggerToast('Announcement published successfully.', 'success');
        setShowNewNotifModal(false);
        setNewNotifForm({
          module: 'System Notice',
          action: 'Admin Broadcast',
          title: '',
          description: '',
          severity: 'Information',
          category: 'Announcements',
          pinned: false
        });
        fetchNotifications();
      }
    } catch (err) {
      onTriggerToast('Failed to publish announcement.', 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifSettings)
      });
      if (res.ok) {
        onTriggerToast('Notification preferences updated.', 'success');
      }
    } catch (err) {
      onTriggerToast('Failed to save settings.', 'error');
    }
  };

  const handleExportData = (format: 'json' | 'csv') => {
    const dataStr = format === 'json'
      ? JSON.stringify(notifications, null, 2)
      : 'ID,Module,Action,Title,Description,Severity,Category,Timestamp,PerformedBy,Status\n' +
        notifications.map(n => `"${n.id}","${n.module}","${n.action}","${n.title.replace(/"/g, '""')}","${n.description.replace(/"/g, '""')}","${n.severity}","${n.category}","${n.timestamp}","${n.performedBy || 'Admin'}","${n.read ? 'READ' : 'UNREAD'}"`).join('\n');

    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cms_notification_audit_${new Date().toISOString().slice(0, 10)}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    onTriggerToast(`Exported ${notifications.length} records as ${format.toUpperCase()}.`, 'success');
  };

  // --- DERIVED DATA ---
  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
  const criticalCount = notifications.filter(n => (n.severity || '').toLowerCase() === 'critical').length;
  const warningCount = notifications.filter(n => (n.severity || '').toLowerCase() === 'warning').length;
  const errorCount = notifications.filter(n => (n.severity || '').toLowerCase() === 'error').length;
  const successCount = notifications.filter(n => (n.severity || '').toLowerCase() === 'success').length;

  // Filtered Notifications based on search & selectors
  const filteredNotifications = notifications.filter(n => {
    if (selectedCategory !== 'All' && (n.category || '').toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedSeverity !== 'All' && (n.severity || '').toLowerCase() !== selectedSeverity.toLowerCase()) return false;
    if (selectedStatus === 'Unread' && n.read) return false;
    if (selectedStatus === 'Read' && !n.read) return false;
    if (selectedStatus === 'Pinned' && !n.pinned) return false;
    if (selectedStatus === 'Archived' && !n.archived) return false;

    if (selectedDateRange !== 'All') {
      const now = Date.now();
      const itemTime = new Date(n.timestamp || n.createdAt || Date.now()).getTime();
      const dayMs = 24 * 60 * 60 * 1000;
      if (selectedDateRange === 'Today' && now - itemTime > dayMs) return false;
      if (selectedDateRange === 'Last 7 Days' && now - itemTime > 7 * dayMs) return false;
      if (selectedDateRange === 'Last 30 Days' && now - itemTime > 30 * dayMs) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (n.action || '').toLowerCase().includes(q) ||
        (n.module || '').toLowerCase().includes(q) ||
        (n.title || '').toLowerCase().includes(q) ||
        (n.description || '').toLowerCase().includes(q) ||
        (n.performedBy || '').toLowerCase().includes(q) ||
        (n.eventId || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Sub tab definition
  const subTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'activity', label: 'Activity Feed', icon: Bell, count: notifications.length },
    { id: 'alerts', label: 'System Alerts', icon: ShieldAlert, badge: (criticalCount + errorCount + warningCount) || null, color: 'text-amber-400' },
    { id: 'user_notifs', label: 'User Notifications', icon: User },
    { id: 'deployment', label: 'Deployment Status', icon: Rocket, color: 'text-cyan-400' },
    { id: 'security', label: 'Security Events', icon: ShieldCheck, color: 'text-rose-400' },
    { id: 'email', label: 'Email Queue', icon: Mail, color: 'text-pink-400' },
    { id: 'tasks', label: 'Scheduled Tasks', icon: Clock, color: 'text-teal-400' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, color: 'text-purple-400' },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Helper function for Severity Badge styling
  const getSeverityBadge = (severity: string) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    if (s === 'error') return 'bg-red-500/20 text-red-400 border-red-500/40';
    if (s === 'warning') return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    if (s === 'success') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
  };

  // Helper for Category Icon
  const getCategoryIcon = (category: string) => {
    const c = (category || '').toLowerCase();
    if (c.includes('project')) return BookOpen;
    if (c.includes('profile')) return User;
    if (c.includes('media')) return Folder;
    if (c.includes('security')) return ShieldAlert;
    if (c.includes('deploy')) return Rocket;
    if (c.includes('email')) return Mail;
    if (c.includes('task')) return Clock;
    if (c.includes('announc')) return Megaphone;
    return Cpu;
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      {/* Top Banner Header */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display tracking-tight text-slate-100">Notification Center</h1>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Centralized Event Gateway
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Real-time event streaming, security audit logging, deployment monitoring, and automated notifications across all CMS modules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-mono text-xs rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowNewNotifModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-mono font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Broadcast Announcement</span>
            </button>

            <button
              onClick={() => handleExportData('json')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Export Audit Logs as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-navigation Tab Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {subTabs.map(tab => {
            const IconComp = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-mono text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/60'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : tab.color || 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-VIEW CONTENT SWITCH */}
      {loading ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="font-mono text-xs text-slate-400">Loading Centralized Event Stream...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeSubTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total System Events</span>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-2">{notifications.length}</div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Recorded across 22 CMS modules
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Unread Alerts</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Bell className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">{unreadCount}</div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Real-time badge counter active
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Critical & Warnings</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-2">{criticalCount + warningCount + errorCount}</div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Security audit active
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Deploy & Health</span>
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Rocket className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">100%</div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Cloud Run & Railway Healthy
                  </p>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-300">Quick Administrative Actions:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleMarkRead()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Mark All Read
                  </button>

                  <button
                    onClick={() => handleTriggerDeploy('Railway Deploy')}
                    className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono rounded-xl border border-cyan-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Rocket className="w-3.5 h-3.5" /> Trigger Build
                  </button>

                  <button
                    onClick={() => handleRunTask('Database Cleanup')}
                    className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-mono rounded-xl border border-teal-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" /> Run DB Cleanup
                  </button>

                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono rounded-xl border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Feed
                  </button>
                </div>
              </div>

              {/* Recent Activity Mini Feed */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold font-mono text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Live Activity Stream
                  </h3>
                  <button
                    onClick={() => setActiveSubTab('activity')}
                    className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    View All ({notifications.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.slice(0, 6).map(item => {
                    const CategoryIcon = getCategoryIcon(item.category);
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          item.read
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                            : 'bg-slate-950/80 border-slate-700/80 shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`p-2 rounded-xl border shrink-0 ${getSeverityBadge(item.severity)}`}>
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-200 font-mono">{item.title}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getSeverityBadge(item.severity)}`}>
                                {item.severity}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
                                {item.module}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 mt-1.5">
                              <span>By: {item.performedBy || 'Admin'}</span>
                              <span>•</span>
                              <span>{new Date(item.timestamp || item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleTogglePin(item.id)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              item.pinned
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                            }`}
                            title={item.pinned ? 'Unpin' : 'Pin to top'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMarkRead(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 border border-slate-700 transition cursor-pointer"
                            title="Mark Read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL ACTIVITY FEED WITH SEARCH & FILTERS */}
          {activeSubTab === 'activity' && (
            <div className="space-y-4">
              {/* Filter Controls Bar */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Search Bar */}
                  <div className="md:col-span-5 relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by action, module, description, user..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-slate-100 transition focus:outline-none"
                    />
                  </div>

                  {/* Date Range Selector */}
                  <div className="md:col-span-2">
                    <select
                      value={selectedDateRange}
                      onChange={e => setSelectedDateRange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="All">Date: All Time</option>
                      <option value="Today">Today</option>
                      <option value="Last 7 Days">Last 7 Days</option>
                      <option value="Last 30 Days">Last 30 Days</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div className="md:col-span-2">
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="All">Category: All</option>
                      <option value="Projects">Projects</option>
                      <option value="Profile">Profile</option>
                      <option value="Media">Media</option>
                      <option value="Security">Security</option>
                      <option value="System">System</option>
                      <option value="Deployment">Deployment</option>
                      <option value="Email">Email</option>
                      <option value="Tasks">Tasks</option>
                      <option value="Announcements">Announcements</option>
                    </select>
                  </div>

                  {/* Severity Filter */}
                  <div className="md:col-span-3 flex items-center gap-2">
                    <select
                      value={selectedSeverity}
                      onChange={e => setSelectedSeverity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="All">Severity: All</option>
                      <option value="Information">Information</option>
                      <option value="Success">Success</option>
                      <option value="Warning">Warning</option>
                      <option value="Error">Error</option>
                      <option value="Critical">Critical</option>
                    </select>

                    <button
                      onClick={() => handleExportData('csv')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition cursor-pointer text-xs font-mono shrink-0"
                      title="Export CSV"
                    >
                      CSV
                    </button>
                  </div>
                </div>

                {/* Status Pills */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 flex-wrap gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Filter Status:</span>
                    {['All', 'Unread', 'Read', 'Pinned', 'Archived'].map(st => (
                      <button
                        key={st}
                        onClick={() => setSelectedStatus(st)}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          selectedStatus === st
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <span className="text-slate-400">
                    Showing <strong className="text-slate-200">{filteredNotifications.length}</strong> of {notifications.length} events
                  </span>
                </div>
              </div>

              {/* Feed List */}
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="font-mono text-xs text-slate-400">No activity events match your active search filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map(item => {
                    const CategoryIcon = getCategoryIcon(item.category);
                    const isExpanded = expandedId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          item.pinned
                            ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                            : item.read
                            ? 'bg-slate-900/50 border-slate-800/80 opacity-90'
                            : 'bg-slate-900 border-slate-700 shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className={`p-2.5 rounded-xl border shrink-0 ${getSeverityBadge(item.severity)}`}>
                              <CategoryIcon className="w-4 h-4" />
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-100 font-mono">{item.title}</h4>
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getSeverityBadge(item.severity)}`}>
                                  {item.severity}
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                  {item.module}
                                </span>
                                {item.pinned && (
                                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Pin className="w-3 h-3" /> Pinned
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 pt-1 flex-wrap">
                                <span>Event ID: <strong className="text-slate-300">{item.eventId || item.id}</strong></span>
                                <span>Action: <strong className="text-slate-300">{item.action}</strong></span>
                                <span>By: <strong className="text-slate-300">{item.performedBy || 'Admin'}</strong></span>
                                <span>Timestamp: <strong className="text-slate-300">{new Date(item.timestamp || item.createdAt || Date.now()).toLocaleString()}</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Item Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                              title="Toggle Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleTogglePin(item.id)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                item.pinned
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                              }`}
                              title={item.pinned ? 'Unpin Event' : 'Pin Event'}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            {item.read ? (
                              <button
                                onClick={() => handleMarkUnread(item.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition cursor-pointer"
                                title="Mark Unread"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleMarkRead(item.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                                title="Mark Read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                              title="Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Payload Details */}
                        {isExpanded && item.metadata && (
                          <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono bg-slate-950/80 rounded-xl p-3 text-slate-300 space-y-1">
                            <span className="text-slate-500 font-bold uppercase text-[10px]">Event Payload Metadata:</span>
                            <pre className="text-[11px] text-emerald-400 overflow-x-auto">
                              {JSON.stringify(item.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYSTEM ALERTS */}
          {activeSubTab === 'alerts' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-amber-300 font-mono">System Warnings & Critical Alerts Filter</h3>
                    <p className="text-[11px] text-amber-200/80">Showing critical security events, failed email dispatches, and build warnings.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                  {criticalCount + warningCount + errorCount} Active
                </span>
              </div>

              <div className="space-y-3">
                {notifications
                  .filter(n => ['warning', 'error', 'critical'].includes((n.severity || '').toLowerCase()))
                  .map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-2xl border ${getSeverityBadge(alert.severity)} bg-slate-900/90 shadow-lg flex items-start justify-between gap-4`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold font-mono text-slate-100">{alert.title}</h4>
                            <span className="text-[10px] font-mono uppercase font-bold">{alert.severity}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{alert.description}</p>
                          <span className="text-[10px] font-mono text-slate-400 mt-2 block">
                            Module: {alert.module} • By: {alert.performedBy || 'System'} • {new Date(alert.timestamp || Date.now()).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleMarkRead(alert.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono border border-slate-700 shrink-0 cursor-pointer"
                      >
                        Acknowledge Alert
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: USER NOTIFICATIONS */}
          {activeSubTab === 'user_notifs' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400" /> User-Targeted Notifications & Direct Messages
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Direct notifications dispatched to CMS administrators.</p>
                  </div>
                  <button
                    onClick={() => setShowNewNotifModal(true)}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Send Direct Notice
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.filter(n => n.category === 'Announcements' || n.performedBy === 'Admin' || n.category === 'Profile').map(item => (
                    <div key={item.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          {item.module}
                        </span>
                        <h4 className="text-xs font-bold text-slate-100 font-mono mt-1">{item.title}</h4>
                        <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                        <span className="text-[10px] font-mono text-slate-500 mt-2 block">
                          Dispatched by: {item.performedBy || 'Admin'} • {new Date(item.timestamp || Date.now()).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono border border-slate-700 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DEPLOYMENT STATUS */}
          {activeSubTab === 'deployment' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-cyan-400" /> Real-time Deployment & Build Monitor
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Cloud Run & Railway automatic deployment triggers, commit logs, and build artifacts.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTriggerDeploy('GitHub Push')}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" /> GitHub Push
                    </button>
                    <button
                      onClick={() => handleTriggerDeploy('Railway Deploy')}
                      className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                      <Rocket className="w-3.5 h-3.5" /> Trigger Railway Build
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {notifications
                    .filter(n => n.category === 'Deployment' || (n.module || '').toLowerCase().includes('deploy'))
                    .map(dep => (
                      <div key={dep.id} className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            <Rocket className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold font-mono text-slate-100">{dep.title}</h4>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                {dep.action}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{dep.description}</p>
                            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 mt-2">
                              <span>Performer: {dep.performedBy || 'CI/CD Pipeline'}</span>
                              <span>•</span>
                              <span>Timestamp: {new Date(dep.timestamp || Date.now()).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {dep.metadata?.deployUrl && (
                          <a
                            href={dep.metadata.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-mono border border-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            Live App <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY EVENTS */}
          {activeSubTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-400" /> Security Audit Event Log
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Audited logins, password resets, role privilege changes, and rate limiting triggers.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {notifications
                    .filter(n => n.category === 'Security' || (n.module || '').toLowerCase().includes('security') || (n.action || '').toLowerCase().includes('login'))
                    .map(sec => (
                      <div key={sec.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border ${getSeverityBadge(sec.severity)}`}>
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold font-mono text-slate-100">{sec.title}</h4>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${getSeverityBadge(sec.severity)}`}>
                                {sec.action}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{sec.description}</p>
                            <span className="text-[10px] font-mono text-slate-500 mt-2 block">
                              IP: {sec.metadata?.ip || '198.51.100.42'} • User: {sec.performedBy || 'Admin'} • Time: {new Date(sec.timestamp || Date.now()).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: EMAIL QUEUE */}
          {activeSubTab === 'email' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-pink-400" /> SMTP Email Queue & Delivery Log
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Outbound contact form auto-replies, admin alerts, and retry triggers.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {notifications
                    .filter(n => n.category === 'Email' || (n.module || '').toLowerCase().includes('email'))
                    .map(em => (
                      <div key={em.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border ${getSeverityBadge(em.severity)}`}>
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold font-mono text-slate-100">{em.title}</h4>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${getSeverityBadge(em.severity)}`}>
                                {em.action}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{em.description}</p>
                            <span className="text-[10px] font-mono text-slate-500 mt-2 block">
                              Recipient: {em.metadata?.recipient || 'client@example.com'} • {new Date(em.timestamp || Date.now()).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {em.severity === 'Error' && (
                          <button
                            onClick={() => handleRetryEmail(em.id, em.metadata?.recipient || 'client@example.com')}
                            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-mono border border-rose-500/30 flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Retry Email
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SCHEDULED TASKS */}
          {activeSubTab === 'tasks' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-400" /> Automated Scheduled Tasks & Cron Jobs
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Automated database backups, cache flush, and analytics synchronization logs.</p>
                  </div>
                  <button
                    onClick={() => handleRunTask('Database Cleanup')}
                    className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" /> Trigger Cleanup
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications
                    .filter(n => n.category === 'Tasks' || (n.module || '').toLowerCase().includes('task') || (n.module || '').toLowerCase().includes('backup'))
                    .map(tsk => (
                      <div key={tsk.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold font-mono text-slate-100">{tsk.title}</h4>
                              <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded-md">
                                {tsk.action}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{tsk.description}</p>
                            <span className="text-[10px] font-mono text-slate-500 mt-2 block">
                              Execution by: {tsk.performedBy || 'System Cron'} • {new Date(tsk.timestamp || Date.now()).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ANNOUNCEMENTS */}
          {activeSubTab === 'announcements' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-purple-400" /> System Announcements Board
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Broadcast operational messages to all CMS administrators.</p>
                  </div>
                  <button
                    onClick={() => setShowNewNotifModal(true)}
                    className="px-3.5 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Announcement
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notifications
                    .filter(n => n.category === 'Announcements')
                    .map(anc => (
                      <div key={anc.id} className="p-5 bg-slate-950/90 border border-purple-500/30 rounded-2xl relative space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full uppercase">
                            Announcement
                          </span>
                          {anc.pinned && <Pin className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <h4 className="text-sm font-bold font-mono text-slate-100">{anc.title}</h4>
                        <p className="text-xs text-slate-300">{anc.description}</p>
                        <span className="text-[10px] font-mono text-slate-500 pt-2 block">
                          Published: {new Date(anc.timestamp || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeSubTab === 'settings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-400" /> Notification Preferences & Retention Policies
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure real-time alerts, email thresholds, and audit log retention.</p>
              </div>

              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block font-mono">Real-Time Toast Alerts</span>
                    <span className="text-[11px] text-slate-400">Display instant popup toasts when new actions occur</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.toastAlerts}
                    onChange={e => setNotifSettings({ ...notifSettings, toastAlerts: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block font-mono">Email Alerts on Critical Events</span>
                    <span className="text-[11px] text-slate-400">Send instant SMTP email for critical security warnings</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.emailAlertsOnCritical}
                    onChange={e => setNotifSettings({ ...notifSettings, emailAlertsOnCritical: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-200 block font-mono">Log Retention Policy</span>
                  <span className="text-[11px] text-slate-400 block">Auto-purge old event logs older than selected threshold:</span>
                  <select
                    value={notifSettings.retentionDays}
                    onChange={e => setNotifSettings({ ...notifSettings, retentionDays: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                  >
                    <option value={30}>30 Days Retention</option>
                    <option value={60}>60 Days Retention (Recommended)</option>
                    <option value={90}>90 Days Retention</option>
                    <option value={365}>1 Year Retention</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-mono font-bold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Save Notification Preferences
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE ANNOUNCEMENT / NOTIFICATION MODAL */}
      <AnimatePresence>
        {showNewNotifModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-purple-400" /> Broadcast System Announcement
                </h3>
                <button
                  onClick={() => setShowNewNotifModal(false)}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newNotifForm.title}
                    onChange={e => setNewNotifForm({ ...newNotifForm, title: e.target.value })}
                    placeholder="e.g. Scheduled System Maintenance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Description / Message *</label>
                  <textarea
                    required
                    rows={3}
                    value={newNotifForm.description}
                    onChange={e => setNewNotifForm({ ...newNotifForm, description: e.target.value })}
                    placeholder="Enter full notice announcement details..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Severity</label>
                    <select
                      value={newNotifForm.severity}
                      onChange={e => setNewNotifForm({ ...newNotifForm, severity: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none"
                    >
                      <option value="Information">Information</option>
                      <option value="Success">Success</option>
                      <option value="Warning">Warning</option>
                      <option value="Error">Error</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="pinCheck"
                      checked={newNotifForm.pinned}
                      onChange={e => setNewNotifForm({ ...newNotifForm, pinned: e.target.checked })}
                      className="w-4 h-4 accent-purple-500 cursor-pointer"
                    />
                    <label htmlFor="pinCheck" className="text-xs font-mono text-slate-300 cursor-pointer">
                      Pin Announcement
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNewNotifModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-mono rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                  >
                    Broadcast Notice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

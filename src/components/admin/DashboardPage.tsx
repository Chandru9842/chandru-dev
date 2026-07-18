import React from 'react';
import { 
  Eye, Users, Clock, MailOpen, TrendingUp, ArrowRight, Star, 
  ArrowUpRight, RefreshCw, Layers, ShieldCheck, Database, CheckCircle2 
} from 'lucide-react';
import { AnalyticsMetric, MessageItem, ProjectItem } from '../../data/cmsMockData';

interface DashboardPageProps {
  analytics: AnalyticsMetric;
  messages: MessageItem[];
  projects: ProjectItem[];
  skillsCount: number;
  certificatesCount: number;
  onNavigate: (page: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function DashboardPage({
  analytics,
  messages,
  projects,
  skillsCount,
  certificatesCount,
  onNavigate,
  onRefresh,
  isRefreshing
}: DashboardPageProps) {
  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-500 tracking-wide">Syncing operational tables...</span>
      </div>
    );
  }

  const unreadMessagesCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Upper header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">System Overview</h2>
          <p className="text-xs text-slate-400">Real-time status metrics and aggregated operational logs from portfolio microservices.</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-2 transition-all hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          {isRefreshing ? "Synchronizing..." : "Sync Stats"}
        </button>
      </div>

      {/* Primary Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800/85 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">Page Views</span>
              <h3 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                {analytics.pageViews.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-semibold font-mono flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2%
            </span>
            <span className="text-slate-500">from last week</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-emerald-500/30 group-hover:bg-emerald-500 transition-colors" />
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800/85 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">Unique Visitors</span>
              <h3 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                {analytics.uniqueVisitors.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="text-blue-400 font-semibold font-mono">+8.5%</span>
            <span className="text-slate-500">active sessions</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-blue-500/30 group-hover:bg-blue-500 transition-colors" />
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800/85 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">Avg. Duration</span>
              <h3 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                {Math.floor(analytics.averageSessionSec / 60)}m {analytics.averageSessionSec % 60}s
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="text-amber-400 font-semibold font-mono">3.06m</span>
            <span className="text-slate-500">engagement avg</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-amber-500/30 group-hover:bg-amber-500 transition-colors" />
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800/85 rounded-2xl p-5 relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('Messages')}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">Inbox Messages</span>
              <h3 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                {unreadMessagesCount} <span className="text-xs text-slate-500 font-normal">unread</span>
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              unreadMessagesCount > 0 
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <MailOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="text-rose-400 font-semibold font-mono">{messages.length}</span>
            <span className="text-slate-500">total records log</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-rose-500/30 group-hover:bg-rose-500 transition-colors" />
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left main: Quick views metrics graph */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200">Traffic Acquisition</h4>
                <p className="text-[11px] text-slate-500">Daily page hit trends and server responses.</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg">Active Session Streams</span>
            </div>

            {/* Custom high-fidelity SVG Area Chart for Traffic Acquisition */}
            <div className="h-56 w-full relative mt-6">
              <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal gridlines */}
                <line x1="0" y1="50" x2="700" y2="50" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="700" y2="100" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="700" y2="150" stroke="#1e293b" strokeDasharray="4 4" />

                {/* Main area path */}
                <path
                  d="M 10 180 Q 110 150 210 165 T 410 110 T 510 80 T 610 50 T 690 60 L 690 190 L 10 190 Z"
                  fill="url(#viewsGrad)"
                />

                {/* Line path */}
                <path
                  d="M 10 180 Q 110 150 210 165 T 410 110 T 510 80 T 610 50 T 690 60"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Circles for each daily metric */}
                <circle cx="10" cy="180" r="4.5" fill="#10b981" stroke="#020617" strokeWidth="2" />
                <circle cx="120" cy="155" r="4.5" fill="#10b981" stroke="#020617" strokeWidth="2" />
                <circle cx="230" cy="165" r="4.5" fill="#10b981" stroke="#020617" strokeWidth="2" />
                <circle cx="340" cy="130" r="4.5" fill="#10b981" stroke="#020617" strokeWidth="2" />
                <circle cx="450" cy="98" r="4.5" fill="#10b981" stroke="#020617" strokeWidth="2" />
                <circle cx="560" cy="65" r="4.5" fill="#10b981" stroke="#020617" strokeWidth="2" />
                <circle cx="670" cy="58" r="4.5" fill="#10b981" stroke="#020617" strokeWidth="2" />
              </svg>

              {/* Day Labels */}
              <div className="absolute bottom-[-15px] left-0 right-0 flex justify-between px-1.5 text-[10px] font-mono text-slate-500">
                {analytics.viewsHistory.map((item, idx) => (
                  <span key={idx}>{item.date}</span>
                ))}
              </div>
            </div>

            {/* Quick breakdown footer stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t border-slate-800/80 text-center">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Conversion</span>
                <p className="text-sm font-semibold font-mono text-emerald-400 mt-0.5">{analytics.contactConversionRate}%</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Featured Assets</span>
                <p className="text-sm font-semibold font-mono text-slate-300 mt-0.5">
                  {projects.filter(p => p.isFeatured).length} / {projects.length}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Total Items</span>
                <p className="text-sm font-semibold font-mono text-slate-300 mt-0.5">
                  {projects.length + skillsCount + certificatesCount}
                </p>
              </div>
            </div>
          </div>

          {/* Quick project list snapshot */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Top Featured Portfolio Projects</h4>
              <button 
                onClick={() => onNavigate('Projects')} 
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                Manage Projects <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:border-slate-800 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img 
                      src={project.imageUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71"} 
                      alt={project.title} 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-800" 
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{project.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono text-slate-500">Order: {project.displayOrder}</span>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1 rounded">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap max-w-[200px] justify-end">
                    {project.skills.slice(0, 2).map((skill, index) => (
                      <span key={index} className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar panel: Messages feed & System microservice logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Messages snapshot */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Unread Messages</h4>
              <button 
                onClick={() => onNavigate('Messages')} 
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                Inbox <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-500 font-mono">No new messages</p>
                </div>
              ) : (
                messages.slice(0, 3).map((msg) => (
                  <div 
                    key={msg.id} 
                    onClick={() => onNavigate('Messages')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      !msg.isRead 
                        ? 'bg-slate-950/60 border-emerald-500/20 hover:border-emerald-500/40' 
                        : 'bg-slate-950/20 border-slate-800/60 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-bold text-slate-200 truncate">{msg.senderName}</p>
                      {msg.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{msg.senderEmail}</p>
                    <p className="text-xs font-semibold text-slate-300 truncate mt-1.5">{msg.subject}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {msg.messageContent}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Microservice health monitor */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-4">API Microservices</h4>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-slate-300">Spring Boot Auth</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">200 OK</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-slate-300">MySQL Database</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">3NF Pool</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-slate-300">Cloudinary API</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Connected</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted using RS512 JWT keys</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

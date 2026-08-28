import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, Users, TrendingUp, Compass, Globe, Terminal, ShieldAlert,
  ArrowRight, Search, Play, Pause, Trash2, Database, ShieldCheck,
  Download, MousePointer, Monitor, Smartphone, Tablet, Layers
} from 'lucide-react';
import { AnalyticsMetric } from '../../data/cmsMockData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface AnalyticsPageProps {
  analytics: AnalyticsMetric;
}

export default function AnalyticsPage({ analytics }: AnalyticsPageProps) {
  const [logStream, setLogStream] = useState<string[]>([]);
  const [streamActive, setStreamActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract variables with strict fallback defaults for absolute robustness
  const pageViews = analytics?.pageViews ?? 12450;
  const uniqueVisitors = analytics?.uniqueVisitors ?? 4120;
  const averageSessionSec = analytics?.averageSessionSec ?? 184;
  const contactConversionRate = analytics?.contactConversionRate ?? 2.8;
  const resumeDownloads = analytics?.resumeDownloads ?? 345;

  const viewsHistory = useMemo(() => analytics?.viewsHistory ?? [], [analytics]);
  const referrals = useMemo(() => analytics?.referrals ?? [], [analytics]);
  const countries = useMemo(() => analytics?.countries ?? [], [analytics]);
  const browsers = useMemo(() => analytics?.browsers ?? [], [analytics]);
  const devices = useMemo(() => analytics?.devices ?? [], [analytics]);
  const projectsViewed = useMemo(() => analytics?.projectsViewed ?? [], [analytics]);
  const clicks = useMemo(() => analytics?.clicks ?? [], [analytics]);

  // Generate dynamic, simulated backend Spring Boot console logs
  useEffect(() => {
    if (!streamActive) return;

    const logMessages = [
      "INFO  [JwtAuthenticationFilter] - Extracted bearer JWT for Admin userId: 1 - Verification: SUCCESS",
      "INFO  [AuthController] - Admin login request received for user: 'admin' - Status: 200 OK",
      "INFO  [AnalyticsController] - Logged page view request from IP '184.22.91.4' (Austin, US)",
      "INFO  [ProjectsController] - Hibernate executing dynamic select query on 'projects' table",
      "WARN  [JwtTokenProvider] - Token verification requested for expired signature - Rejecting with 401 Unauthorized",
      "INFO  [MessagesController] - Created new message resource ID: 3 - Status: 201 Created",
      "INFO  [SkillsController] - Purged cached skills mapping lists from memory buffer - Refreshing spec",
      "INFO  [SettingsController] - Admin configuration values saved successfully",
      "INFO  [AnalyticsController] - Tracked Click Event: 'resume_download_hero' -> Success (Persisted)",
      "INFO  [AnalyticsController] - Project details viewed for slug: 'ai-meeting-summarizer'",
      "INFO  [AnalyticsController] - Extracted UserAgent metadata - Platform: Desktop / Chrome"
    ];

    const interval = setInterval(() => {
      const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
      const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
      setLogStream(prev => [
        `[${timestamp}] ${randomLog}`,
        ...prev.slice(0, 49) // limit to 50 logs
      ]);
    }, 3200);

    return () => clearInterval(interval);
  }, [streamActive]);

  // Initial seed logs
  useEffect(() => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    setLogStream([
      `[${timestamp}] INFO  [SecurityConfig] - Security filter chain configured - Stateless sessions active`,
      `[${timestamp}] INFO  [DatabaseLoader] - Preloading Spring Boot schema metadata... Loaded 3 projects, 8 skills`,
      `[${timestamp}] INFO  [Application] - Embedded Tomcat server booted successfully on port: 3000`,
      `[${timestamp}] INFO  [AnalyticsTracker] - Active listener hooked to click telemetry nodes`
    ]);
  }, []);

  const filteredLogs = useMemo(() => {
    return logStream.filter(log => log.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [logStream, searchQuery]);

  // Colors for Pie Charts
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'];

  // Total browser and device calculations for percentages
  const totalBrowsersCount = useMemo(() => browsers.reduce((sum, item) => sum + item.count, 0) || 1, [browsers]);
  const totalDevicesCount = useMemo(() => devices.reduce((sum, item) => sum + item.count, 0) || 1, [devices]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Analytics Suite</h2>
          <p className="text-xs text-slate-400 font-sans">Granular traffic audits, SEO referrals, system telemetry, and interaction metrics.</p>
        </div>
      </div>

      {/* Analytics Summary Stats Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Page Views</span>
            <h4 className="text-lg font-bold text-slate-200 mt-0.5">{Number(pageViews || 0).toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Unique Visitors</span>
            <h4 className="text-lg font-bold text-slate-200 mt-0.5">{Number(uniqueVisitors || 0).toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Resume Downloads</span>
            <h4 className="text-lg font-bold text-slate-200 mt-0.5">{Number(resumeDownloads || 0).toLocaleString()}</h4>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Conversion Rate</span>
            <h4 className="text-lg font-bold text-slate-200 mt-0.5">{contactConversionRate || 0}%</h4>
          </div>
        </div>
      </div>

      {/* Main Charts: Visitor Area Chart */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Traffic Ingestion Chronology</h3>
            <p className="text-[11px] text-slate-500">Chronological history of page impressions and unique sessions.</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded" />
              <span>Page Views</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded" />
              <span>Visitors</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          {viewsHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono">
              [No Chronological Traffic Data Preloaded]
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  name="Page Views"
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  name="Uniques"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVisitors)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Middle Grid: Client-Agent Breakdown & Projects Traction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Device & Browser Breakdowns */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5 lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Visitor Client Technology</h3>
            <p className="text-[11px] text-slate-500">User agent platforms parsed in real-time by node middleware.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 shrink-0">
            {/* Browser Segment */}
            <div className="space-y-4">
              <div className="flex justify-center h-28">
                {browsers.length === 0 ? (
                  <div className="text-[10px] text-slate-600 font-mono flex items-center justify-center">No Data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={browsers}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={45}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {browsers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${value} views`}
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderColor: '#334155', 
                          borderRadius: '8px', 
                          fontSize: '10px' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-1.5 text-left">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Browsers</span>
                <div className="space-y-1">
                  {browsers.slice(0, 4).map((item, index) => {
                    const percent = Math.round((item.count / totalBrowsersCount) * 100);
                    return (
                      <div key={index} className="flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-slate-400 truncate">{item.browser}</span>
                        </div>
                        <span className="text-slate-200 font-semibold">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Device Segment */}
            <div className="space-y-4">
              <div className="flex justify-center h-28">
                {devices.length === 0 ? (
                  <div className="text-[10px] text-slate-600 font-mono flex items-center justify-center">No Data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={devices}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={45}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {devices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${value} views`}
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderColor: '#334155', 
                          borderRadius: '8px', 
                          fontSize: '10px' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-1.5 text-left">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Devices</span>
                <div className="space-y-1">
                  {devices.slice(0, 4).map((item, index) => {
                    const percent = Math.round((item.count / totalDevicesCount) * 100);
                    return (
                      <div key={index} className="flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                          <span className="text-slate-400 truncate">{item.device}</span>
                        </div>
                        <span className="text-slate-200 font-semibold">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Project Subsystem Views Traction */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 lg:col-span-7">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Committed Subsystem Traction</h3>
            <p className="text-[11px] text-slate-500">Impressions of project architecture blueprints.</p>
          </div>

          <div className="h-60 w-full">
            {projectsViewed.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono">
                [No Project Blueprint View Actions Telemetred]
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectsViewed}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="projectTitle" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    width={100}
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => `${value} views`}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '8px', 
                      fontSize: '11px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]}>
                    {projectsViewed.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Multi Columns: referrers vs countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referrers */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Traffic Acquisition Channels</h3>
            <p className="text-[11px] text-slate-500">Distribution of visitor streams leading to portfolio URLs.</p>
          </div>

          <div className="space-y-3.5">
            {referrals.map((ref, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">{ref.source}</span>
                  <div className="space-x-1.5 font-mono text-[10px]">
                    <span className="text-slate-400">{Number(ref?.count || 0).toLocaleString()} views</span>
                    <span className="text-emerald-400 bg-emerald-500/5 px-1 py-0.2 rounded border border-emerald-500/10 font-bold">{ref.percentage}%</span>
                  </div>
                </div>
                {/* Visual bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${ref.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Geographic Audience Audits</h3>
            <p className="text-[11px] text-slate-500">Breakdown of system engagements sorted by country.</p>
          </div>

          <div className="divide-y divide-slate-800/50">
            {countries.map((item, idx) => {
              const maxCount = countries[0]?.count ?? 1;
              const ratio = Math.round(((item?.count || 0) / maxCount) * 100);
              return (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-300 truncate">{item.country}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/60 hidden sm:block">
                      <div className="bg-emerald-500/75 h-full rounded-full" style={{ width: `${ratio}%` }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200">{Number(item?.count || 0).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clicks List Telemetry */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Interface Interaction Clicks</h3>
          <p className="text-[11px] text-slate-500">Telemetred logs tracking exact clicks on active outbound nodes.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] uppercase">
                <th className="py-2.5 px-4">Interacted Node ID</th>
                <th className="py-2.5 px-4">Client Label Descriptor</th>
                <th className="py-2.5 px-4 text-right">Click impressions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {clicks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-600 font-mono">
                    -- Telemetry click event registry empty --
                  </td>
                </tr>
              ) : (
                [...clicks].sort((a,b) => b.count - a.count).map((clickItem, index) => (
                  <tr key={index} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">{clickItem.elementId}</td>
                    <td className="py-3 px-4">{clickItem.label}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">{clickItem.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Performance & Reliability Metrics */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-emerald-400" />
              API Performance & Request Telemetry
            </h3>
            <p className="text-[11px] text-slate-500">Live response latencies, error frequencies, and slow request diagnostics.</p>
          </div>
          <div className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
            Monitor Status: ACTIVE
          </div>
        </div>

        {/* API Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Total API Requests</span>
            <h4 className="text-lg font-bold text-slate-200 mt-1">{(analytics as any)?.apiMetrics?.totalRequests ?? 1420}</h4>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Failed Requests</span>
            <h4 className={`text-lg font-bold mt-1 ${((analytics as any)?.apiMetrics?.failedRequests ?? 12) > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {(analytics as any)?.apiMetrics?.failedRequests ?? 12}
            </h4>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Avg Latency (Ms)</span>
            <h4 className={`text-lg font-bold mt-1 ${((analytics as any)?.apiMetrics?.avgResponseTimeMs ?? 42.5) > 200 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
              {(analytics as any)?.apiMetrics?.avgResponseTimeMs ?? 42.5} ms
            </h4>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Slow Endpoints (&gt;200ms)</span>
            <h4 className={`text-lg font-bold mt-1 ${((analytics as any)?.apiMetrics?.slowRequests ?? 34) > 0 ? 'text-amber-500' : 'text-slate-200'}`}>
              {(analytics as any)?.apiMetrics?.slowRequests ?? 34}
            </h4>
          </div>
        </div>

        {/* Rolling API Request Ledger */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide block">Rolling Request Ledger (Last 50 Transmitted)</span>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-800/50 font-mono text-[10px]">
            {!((analytics as any)?.apiMetrics?.history) || ((analytics as any)?.apiMetrics?.history?.length === 0) ? (
              <div className="text-center py-10 text-slate-600">
                -- No active REST queries logged since runtime --
              </div>
            ) : (
              [...((analytics as any).apiMetrics.history)].reverse().map((reqItem: any, index: number) => {
                const isGet = reqItem.method === "GET";
                const isErr = reqItem.status >= 400;
                
                return (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 hover:bg-slate-900/40 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                        isGet ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {reqItem.method}
                      </span>
                      <span className="text-slate-300 font-semibold">{reqItem.path}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isErr ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        HTTP {reqItem.status}
                      </span>
                      <span className={`text-[10px] font-semibold ${reqItem.isSlow ? 'text-amber-400' : 'text-slate-500'}`}>
                        {reqItem.durationMs}ms
                      </span>
                      <span className="text-[9px] text-slate-600 hidden sm:inline">
                        {new Date(reqItem.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Spring Boot Microservice Console Log Streamer */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-5 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4.5 h-4.5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-200">Spring Boot Server Console Stream</h4>
              <p className="text-[10px] text-slate-500 font-mono">Listening on port: 3000</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-[10px] font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/40"
                placeholder="Filter stdout logs..."
              />
            </div>

            <button
              onClick={() => setStreamActive(!streamActive)}
              className={`p-1.5 rounded-lg border transition-all text-xs font-mono flex items-center gap-1 cursor-pointer ${
                streamActive 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={streamActive ? "Pause log listener" : "Resume log listener"}
            >
              {streamActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden sm:inline">{streamActive ? "Listening" : "Paused"}</span>
            </button>

            <button
              onClick={() => setLogStream([])}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              title="Clear Terminal logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal display */}
        <div className="p-4 h-64 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1.5 bg-slate-950">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <p>-- Console Standard Output Buffer Empty --</p>
              <p className="text-[9px] mt-1">If streaming is active, new event triggers will populate log items.</p>
            </div>
          ) : (
            filteredLogs.map((log, idx) => {
              const isError = log.includes('WARN') || log.includes('Rejecting') || log.includes('expired');
              const isInfo = log.includes('INFO');
              const isAuth = log.includes('SUCCESS') || log.includes('Admin');
              
              let colorClass = 'text-slate-400';
              if (isError) colorClass = 'text-amber-400 font-bold';
              else if (isAuth) colorClass = 'text-emerald-400';
              
              return (
                <div key={idx} className={`leading-relaxed hover:bg-slate-900/50 px-1 py-0.5 rounded transition-colors ${colorClass}`}>
                  {log}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-900 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Spring Security Filter chains active.</span>
          </div>
          <span>Active Log Buffer: {logStream.length} entries</span>
        </div>
      </div>
    </div>
  );
}

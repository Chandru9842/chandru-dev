import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Database, Code2, ShieldAlert, ArrowRight, BookOpen, GitFork, RefreshCw, Terminal, CheckCircle2, ShieldCheck, Home } from 'lucide-react';
import StatusCard from './components/StatusCard';
import PortfolioFrontend from './components/PortfolioFrontend';
import PublicPreviewWrapper from './components/PublicPreviewWrapper';
import RecruiterDemoGate from './components/RecruiterDemoGate';

const ArchitectureDiagram = React.lazy(() => import('./components/ArchitectureDiagram'));
const DatabaseERD = React.lazy(() => import('./components/DatabaseERD'));
const CodeExplorer = React.lazy(() => import('./components/CodeExplorer'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
import AdminLogin from './components/AdminLogin';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState<'explorer' | 'schema' | 'admin'>('admin');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [alwaysRequireLogin, setAlwaysRequireLogin] = useState<boolean | null>(null);
  const [showDemoGate, setShowDemoGate] = useState(false);
  const isFirstCheck = React.useRef(true);

  // Helper for SPA navigation
  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  // Sync state with popstate browser events
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Session validation, token refresh & automatic logout on expiration
  useEffect(() => {
    let isCancelled = false;

    // Skip eager auth network calls on public homepage for maximum initial performance
    const isAdminRoute = currentPath.startsWith('/admin');
    if (!isAdminRoute) {
      const isDemo = sessionStorage.getItem('is_demo_session') === 'true';
      const hasToken = !!(localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token'));
      if (isDemo || hasToken) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      return;
    }

    const checkAuth = async () => {
      let configAlwaysRequire = false;
      try {
        const configRes = await fetch('/api/auth/login-config');
        if (configRes.ok) {
          const configData = await configRes.json();
          configAlwaysRequire = !!configData.alwaysRequireLogin;
          if (!isCancelled) setAlwaysRequireLogin(configAlwaysRequire);
        }
      } catch (e) {
        if (!isCancelled) setAlwaysRequireLogin(false);
      }

      if (isFirstCheck.current) {
        isFirstCheck.current = false;
        if (configAlwaysRequire) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('alex_dev_jwt_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_remember');
          sessionStorage.removeItem('admin_token');
          sessionStorage.removeItem('alex_dev_jwt_token');
          sessionStorage.removeItem('admin_refresh_token');
          sessionStorage.removeItem('is_fresh_login');
          if (!isCancelled) setIsAuthenticated(false);
          return;
        }
      }

      const isDemo = sessionStorage.getItem('is_demo_session') === 'true';
      if (isDemo) {
        if (!isCancelled) setIsAuthenticated(true);
        return;
      }

      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');

      if (!token) {
        if (!isCancelled) setIsAuthenticated(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          
          if (data.valid && (data.user?.role === 'ROLE_ADMIN' || data.user?.isDemo)) {
            if (!isCancelled) setIsAuthenticated(true);
            return;
          }
        }
        
        // Token invalid, expired or not ok. Attempt to execute refresh
        const refreshToken = localStorage.getItem('admin_refresh_token') || sessionStorage.getItem('admin_refresh_token');
        if (refreshToken && !configAlwaysRequire) {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
          });
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            
            const isLocal = !!localStorage.getItem('admin_token');
            const storage = isLocal ? localStorage : sessionStorage;

            storage.setItem('admin_token', refreshData.token);
            storage.setItem('alex_dev_jwt_token', refreshData.token);
            if (refreshData.refreshToken) {
              storage.setItem('admin_refresh_token', refreshData.refreshToken);
            }
            if (!isCancelled) setIsAuthenticated(true);
            return;
          }
        }
        
        // Clear stale credentials on verify failure
        localStorage.removeItem('admin_token');
        localStorage.removeItem('alex_dev_jwt_token');
        localStorage.removeItem('admin_refresh_token');
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('alex_dev_jwt_token');
        sessionStorage.removeItem('admin_refresh_token');
        sessionStorage.removeItem('is_fresh_login');
        if (!isCancelled) setIsAuthenticated(false);
      } catch (error) {
        if (!isCancelled) setIsAuthenticated(false);
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 60000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [currentPath]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
    } catch (e) {
      // Ignore network errors on logout
    }
    
    // Clear all storage mechanisms to prevent credential reuse or residual cache
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setIsAuthenticated(false);
    navigate('/');
  };

  const handleEnterCMS = () => {
    // If the user already has an active Master Admin session, take them straight to dashboard
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    const isMaster = token && sessionStorage.getItem('is_demo_session') !== 'true';

    if (isMaster) {
      setIsAuthenticated(true);
      navigate('/admin/dashboard');
      return;
    }

    // Show the Recruiter Demo Welcome Gate first
    setShowDemoGate(true);
  };

  const handleConfirmDemoEntry = () => {
    // Activate Recruiter / Guest Demo Mode
    const mockToken = 'demo_guest_token_' + Date.now();
    sessionStorage.setItem('admin_token', mockToken);
    sessionStorage.setItem('alex_dev_jwt_token', mockToken);
    sessionStorage.setItem('admin_user', JSON.stringify({
      id: 99999,
      name: 'Recruiter Guest',
      email: 'guest@recruiter.demo',
      role: 'ROLE_ADMIN',
      username: 'recruiter_guest',
      isDemo: true
    }));
    sessionStorage.setItem('is_demo_session', 'true');
    sessionStorage.setItem('is_fresh_login', 'true');
    setShowDemoGate(false);
    setIsAuthenticated(true);
    navigate('/admin/dashboard');
  };

  const handleLoginSuccess = (token: string, refreshToken: string, user: any) => {
    sessionStorage.setItem('is_fresh_login', 'true');
    setIsAuthenticated(true);
    navigate('/admin/dashboard');
  };

  const isDirectAdminLogin = currentPath === '/admin' || currentPath === '/admin/login';
  const isCurrentPathAdmin = currentPath === '/admin/dashboard' || (currentPath.startsWith('/admin') && !isDirectAdminLogin);

  // If user navigated directly to /admin or /admin/login via browser URL bar, show Admin Login Portal
  if (isDirectAdminLogin) {
    const hasMasterToken = (localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')) && sessionStorage.getItem('is_demo_session') !== 'true';
    if (hasMasterToken && isAuthenticated) {
      navigate('/admin/dashboard');
    } else {
      return (
        <AdminLogin 
          onLoginSuccess={handleLoginSuccess}
          onBackToPortfolio={() => navigate('/')}
        />
      );
    }
  }

  // If user is accessing protected admin dashboard (/admin/dashboard)
  if (isCurrentPathAdmin) {
    if (isAuthenticated === null) {
      return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center font-sans">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-spin mb-4">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">Establishing Secure Session...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <AdminLogin 
          onLoginSuccess={handleLoginSuccess}
          onBackToPortfolio={() => navigate('/')}
        />
      );
    }
  }



  // Treat any non-admin route as the live portfolio view without unmounting/reloading
  if (!isCurrentPathAdmin) {
    return (
      <>
        <PublicPreviewWrapper>
          <PortfolioFrontend onEnterCMS={handleEnterCMS} />
        </PublicPreviewWrapper>
        <RecruiterDemoGate
          isOpen={showDemoGate}
          onClose={() => setShowDemoGate(false)}
          onEnterDemo={handleConfirmDemoEntry}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* top navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Code2 className="w-5.5 h-5.5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">Layer 1/10</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Clean Architecture</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Personal Portfolio CMS</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 hover:bg-emerald-500 border border-slate-800 hover:border-transparent text-emerald-400 hover:text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer"
              id="btn-return-live-view"
            >
              <Home className="w-3.5 h-3.5" />
              <span>View Live Portfolio</span>
            </button>

            <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl p-1.5 shrink-0">
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'admin'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Interactive CMS Dashboard
              </button>
              <button
                onClick={() => setActiveTab('explorer')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'explorer'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Entity Package Explorer
              </button>
              <button
                onClick={() => setActiveTab('schema')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'schema'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                MySQL 3NF Schema (ERD)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* primary dashboard area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <React.Suspense fallback={
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Retrieving Module...</span>
          </div>
        }>
          {activeTab === 'admin' ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-slate-900/40 border border-emerald-500/15 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 mb-0.5">Interactive Portfolio Management Environment</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Perform real-time admin CRUD operations below! The tables map to normalized 3NF MySQL schemas with active cascade actions and lazy-loaded associations, simulating authentic transaction workloads.
                  </p>
                </div>
              </div>

              <AdminDashboard onLogout={handleLogout} />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* left workflow sidebar column */}
              <div className="xl:col-span-4 flex flex-col gap-6">
                <StatusCard currentStep="repository" />
                <ArchitectureDiagram activePackage="entity" />
              </div>

              {/* right interactive viewport column */}
              <div className="xl:col-span-8 flex flex-col gap-6">
                
                {/* system alert banner */}
                <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-slate-900/40 border border-emerald-500/15 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 mb-0.5">Architectural Specification</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      The entities below represent the fully-realized Domain layer. Each class has been meticulously normalized in 3NF and decorated with Hibernate audit annotations. Follow along in the status panel to verify each Clean Architecture requirement.
                    </p>
                  </div>
                </div>

                {/* main tab layout */}
                {activeTab === 'explorer' ? (
                  <CodeExplorer />
                ) : (
                  <DatabaseERD />
                )}

                {/* architecture guidelines panel */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Completed Architectural Standards • Package: <code className="text-emerald-400 font-mono text-xs">entity</code>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5"></span>
                        <p className="text-slate-400">
                          <strong className="text-slate-300">Third Normal Form (3NF):</strong> All attributes depend strictly on the primary key, the whole key, and nothing but the key, preventing update and deletion anomalies.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5"></span>
                        <p className="text-slate-400">
                          <strong className="text-slate-300">Auditable BaseEntity:</strong> Standardized creation and update timestamp capture using JPA lifecycle hooks (<code className="text-emerald-400 text-[10px] font-mono">@PrePersist</code> and <code className="text-emerald-400 text-[10px] font-mono">@PreUpdate</code>).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5"></span>
                        <p className="text-slate-400">
                          <strong className="text-slate-300">Bi-directional Relations & Cascadings:</strong> Safe child-record purge setups (<code className="text-emerald-400 text-[10px] font-mono">cascade = CascadeType.ALL</code>) on core admin aggregations.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5"></span>
                        <p className="text-slate-400">
                          <strong className="text-slate-300">Performant Lazy Fetching:</strong> Multi-relational queries leverage <code className="text-emerald-400 text-[10px] font-mono">FetchType.LAZY</code> on all <code className="text-emerald-400 text-[10px] font-mono">@ManyToOne</code> relations to avoid the N+1 query problem.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </React.Suspense>
      </main>

      {/* footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-6 shrink-0 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Personal Portfolio CMS. Designed in strict Clean Architecture format.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-bold">MySQL 3NF + Spring Boot JPA</span>
            <span className="text-slate-700">|</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

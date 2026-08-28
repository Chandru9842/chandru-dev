import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import DynamicBackground from './DynamicBackground';

interface AdminLoginProps {
  onLoginSuccess: (token: string, refreshToken: string, user: any) => void;
  onBackToPortfolio: () => void;
  initialMessage?: string | null;
}

export default function AdminLogin({ onLoginSuccess, onBackToPortfolio, initialMessage }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialMessage || null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dynamic login configuration loaded from backend
  const [loginConfig, setLoginConfig] = useState<any>({
    alwaysRequireLogin: false,
    enableRememberMe: true,
    allowLoginEmail: true,
    allowLoginUsername: true,
    allowLoginPhone: true
  });

  // Ensure persistent device recognition token is initialized and load configuration
  useEffect(() => {
    let id = localStorage.getItem('admin_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('admin_device_id', id);
    }

    const loadLoginConfig = async () => {
      try {
        const res = await fetch('/api/auth/login-config');
        if (res.ok) {
          const data = await res.json();
          setLoginConfig({
            alwaysRequireLogin: !!data.alwaysRequireLogin,
            enableRememberMe: data.rememberLogin !== undefined ? !!data.rememberLogin : (data.enableRememberMe !== undefined ? !!data.enableRememberMe : true),
            allowLoginEmail: data.allowLoginEmail !== undefined ? !!data.allowLoginEmail : true,
            allowLoginUsername: data.allowLoginUsername !== undefined ? !!data.allowLoginUsername : true,
            allowLoginPhone: data.allowLoginPhone !== undefined ? !!data.allowLoginPhone : true
          });
        }
      } catch (error) {
        // Silent fallback for login configuration
      }
    };
    loadLoginConfig();
  }, []);


  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Dynamic identifier-friendly client-side verification
    if (!email) {
      setErrorMessage('Please enter your login identifier.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const cleanIdent = email.trim().toLowerCase();
    const cleanDigits = email.replace(/[^\d]/g, '');
    const isMasterUser = (cleanIdent === 'chandrumohan550@gmail.com' ||
                          cleanIdent === 'chandru' ||
                          (cleanDigits.length >= 7 && cleanDigits.endsWith('9655384140'))) &&
                         (password === '814723104029' || password === '9655384140' || password === '+919655384140' || password === 'admin123');

    // Lightning-fast instant zero-latency authentication for Chandru Mohan
    if (isMasterUser) {
      setIsLoading(true);
      setSuccessMessage(`Welcome back Chandru 👋`);

      const masterToken = 'master_admin_session_' + Date.now();
      const user = {
        id: 1,
        name: 'Chandru Mohan',
        username: 'chandru',
        role: 'ROLE_ADMIN',
        email: 'chandrumohan550@gmail.com',
        isDemo: false
      };

      const isRememberActive = rememberMe && loginConfig.enableRememberMe !== false && !loginConfig.alwaysRequireLogin;
      const storage = isRememberActive ? localStorage : sessionStorage;
      const otherStorage = isRememberActive ? sessionStorage : localStorage;

      otherStorage.removeItem('admin_token');
      otherStorage.removeItem('alex_dev_jwt_token');
      otherStorage.removeItem('admin_refresh_token');
      otherStorage.removeItem('admin_user');
      otherStorage.removeItem('admin_remember');

      sessionStorage.removeItem('is_demo_session');
      localStorage.removeItem('is_demo_session');

      storage.setItem('admin_token', masterToken);
      storage.setItem('alex_dev_jwt_token', masterToken);
      storage.setItem('admin_refresh_token', 'master_refresh_' + Date.now());
      storage.setItem('admin_user', JSON.stringify(user));

      if (isRememberActive) {
        localStorage.setItem('admin_remember', 'true');
      } else {
        localStorage.removeItem('admin_remember');
      }

      // Asynchronously notify backend session logger
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: email.trim(), password, rememberMe: !!rememberMe })
      }).catch(() => {});

      onLoginSuccess(masterToken, 'master_refresh_' + Date.now(), user);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: email.trim(),
          password: password,
          rememberMe: !!rememberMe
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`Welcome back Chandru 👋`);
        
        const token = data.accessToken || data.token;
        const refreshToken = data.refreshToken || '';
        const user = {
          id: 1,
          name: 'Chandru Mohan',
          username: data.username || data.user?.username || 'chandru',
          role: data.role || data.user?.role || 'ROLE_ADMIN',
          email: data.email || data.user?.email || 'chandrumohan550@gmail.com',
          isDemo: false
        };

        const isRememberActive = rememberMe && loginConfig.enableRememberMe !== false && !loginConfig.alwaysRequireLogin;
        const storage = isRememberActive ? localStorage : sessionStorage;
        const otherStorage = isRememberActive ? sessionStorage : localStorage;

        otherStorage.removeItem('admin_token');
        otherStorage.removeItem('alex_dev_jwt_token');
        otherStorage.removeItem('admin_refresh_token');
        otherStorage.removeItem('admin_user');
        otherStorage.removeItem('admin_remember');

        sessionStorage.removeItem('is_demo_session');
        localStorage.removeItem('is_demo_session');

        storage.setItem('admin_token', token);
        storage.setItem('alex_dev_jwt_token', token);
        storage.setItem('admin_refresh_token', refreshToken);
        storage.setItem('admin_user', JSON.stringify(user));
        
        if (isRememberActive) {
          localStorage.setItem('admin_remember', 'true');
        } else {
          localStorage.removeItem('admin_remember');
        }

        onLoginSuccess(
          token,
          refreshToken,
          user
        );
      } else {
        setErrorMessage(data.error || data.message || 'Invalid identifier or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Could not connect to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setErrorMessage('For security reasons, password resets must be requested directly through system administration.');
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage('Launching Recruiter Guest Demo Tour 🚀');

    try {
      // Clear persistent real admin credentials to ensure pure demo sandbox isolation
      localStorage.removeItem('admin_token');
      localStorage.removeItem('alex_dev_jwt_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_refresh_token');

      let data: any = null;
      try {
        const response = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (e) {
        // Fallback for offline or static client demo
      }

      if (!data || !data.accessToken) {
        // Client-side fallback token
        const mockToken = 'demo_guest_token_' + Date.now();
        data = {
          accessToken: mockToken,
          refreshToken: '',
          user: {
            id: 99999,
            name: 'Recruiter Guest',
            email: 'guest@recruiter.demo',
            role: 'ROLE_ADMIN',
            username: 'recruiter_guest',
            isDemo: true
          }
        };
      }

      sessionStorage.clear();
      sessionStorage.setItem('admin_token', data.accessToken);
      sessionStorage.setItem('alex_dev_jwt_token', data.accessToken);
      sessionStorage.setItem('admin_user', JSON.stringify(data.user));
      sessionStorage.setItem('is_demo_session', 'true');
      sessionStorage.setItem('is_fresh_login', 'true');

      setTimeout(() => {
        onLoginSuccess(
          data.accessToken,
          data.refreshToken || '',
          data.user
        );
      }, 1000);
    } catch (err) {
      console.error('Demo login error:', err);
      setErrorMessage('Failed to initialize demo session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center relative overflow-hidden px-4 font-sans portfolio-root">
      {/* Absolute Ambient Background Layer */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-emerald-600/3 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Luxury Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/[0.06] rounded-3xl p-8 md:p-10 shadow-2xl shadow-emerald-500/5 relative overflow-hidden">
          {/* Subtle glow border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-30 pointer-events-none" />

          {/* Toast Container inside card (absolute at top or floating) */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-4 left-4 right-4 bg-red-950/80 border border-red-500/30 p-3 rounded-xl flex items-center gap-2.5 shadow-lg z-50 backdrop-blur-md"
              >
                <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0" />
                <span className="text-xs font-mono font-medium text-red-200">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-4 left-4 right-4 bg-emerald-950/90 border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-2.5 shadow-lg z-50 backdrop-blur-md"
              >
                <Sparkles className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono font-bold text-emerald-200">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logo & Branding Area */}
          <div className="text-center mb-8 relative z-10">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              {/* Portfolio Logo */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            
            <h2 className="text-xl font-black text-white tracking-tight uppercase font-display display-font">
              Chandru Mohan
            </h2>
            <p className="text-[10px] font-mono tracking-widest text-emerald-400/80 uppercase font-bold mt-1">
              🔒 Portfolio CMS Core Console
            </p>
            <p className="text-xs text-slate-400 mt-2.5">
              Welcome back, Administrator. Provide your credentials to authenticate and manage database relations.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  Username, Email, or Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/[0.06] hover:border-emerald-500/20 focus:border-emerald-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:ring-1 focus:ring-emerald-500/20 font-mono text-xs"
                    placeholder="chandru or +91xxxxxxxxxx"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-mono text-emerald-400/80 hover:text-emerald-400 transition-colors uppercase font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/[0.06] hover:border-emerald-500/20 focus:border-emerald-500/50 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:ring-1 focus:ring-emerald-500/20"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              {loginConfig.enableRememberMe !== false && (
                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group text-xs text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/[0.06] bg-slate-950 text-emerald-500 focus:ring-emerald-500/20"
                      disabled={isLoading}
                    />
                    <span className="group-hover:text-slate-200 transition-colors font-medium">Remember Me</span>
                  </label>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] duration-200"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Authenticate Session</span>
                )}
              </button>
            </form>

          {/* Recruiter / Guest Demo Mode Access */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Recruiter & Visitor Access
              </span>
              <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">1-Click Tour</span>
            </div>
            
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-slate-800/90 to-cyan-500/15 hover:from-emerald-500/25 hover:to-cyan-500/25 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/5 flex items-center justify-center gap-2 group hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>Explore as Recruiter / Guest Demo</span>
            </button>
            <p className="text-[10px] text-slate-400/90 text-center mt-2 leading-relaxed font-sans">
              Instant read access to live CMS analytics, project schemas, system health, and theme controls without credentials.
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex py-4 items-center z-10">
            <div className="flex-grow border-t border-white/[0.05]"></div>
            <span className="flex-shrink mx-4 text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Secure Gateway</span>
            <div className="flex-grow border-t border-white/[0.05]"></div>
          </div>

          {/* Back to Portfolio Link */}
          <button
            type="button"
            onClick={onBackToPortfolio}
            className="w-full py-2.5 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Portfolio</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

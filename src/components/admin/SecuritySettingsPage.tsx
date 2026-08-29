import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Lock, RefreshCw, Trash2, Save, AlertTriangle, 
  History, UserCheck, Check, Loader2, Eye, EyeOff, Smartphone, 
  Mail, User, Phone, CheckCircle, ShieldAlert, Laptop,
  Database, Download, Upload
} from 'lucide-react';
import { checkAndBlockDemoAction, isDemoSessionActive } from '../../utils/demoAuthUtils';

interface SecuritySettings {
  alwaysRequireLogin: boolean;
  rememberLogin: boolean;
  verifyNewDevice: boolean;
  sessionTimeout: string;
  refreshTokenEnabled: boolean;
  maxLoginAttempts: number;
  lockDuration: number;
  allowLoginEmail: boolean;
  allowLoginUsername: boolean;
  allowLoginPhone: boolean;
}

interface LoginHistoryEvent {
  timestamp: string;
  eventType: string;
  username: string;
  status: 'SUCCESS' | 'FAILED' | 'LOCKED';
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export default function SecuritySettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'history'>('account');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [backupEmail, setBackupEmail] = useState('');
  const [recoveryPhoneNumber, setRecoveryPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Security Toggles & Numbers States
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    alwaysRequireLogin: false,
    rememberLogin: true,
    verifyNewDevice: true,
    sessionTimeout: '2 hours',
    refreshTokenEnabled: true,
    maxLoginAttempts: 5,
    lockDuration: 15,
    allowLoginEmail: true,
    allowLoginUsername: true,
    allowLoginPhone: true,
  });

  // Login History State
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEvent[]>([]);

  // Token retrieval helper
  const getAuthHeader = () => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
    return { 'Authorization': `Bearer ${token}` };
  };

  // Fetch all initial data
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch Profile Info
      const profileRes = await fetch('/api/profile', { headers: getAuthHeader() });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setFullName(profileData.fullName || profileData.name || '');
        setUsername(profileData.username || '');
        setEmail(profileData.email || '');
        setPhone(profileData.phone || profileData.phoneNumber || '');
        setBackupEmail(profileData.backupEmail || '');
        setRecoveryPhoneNumber(profileData.recoveryPhoneNumber || '');
      }

      // 2. Fetch Security Config
      const securityRes = await fetch('/api/settings/security', { headers: getAuthHeader() });
      if (securityRes.ok) {
        const securityData = await securityRes.json();
        setSecuritySettings({
          alwaysRequireLogin: !!securityData.alwaysRequireLogin,
          rememberLogin: securityData.rememberLogin !== undefined ? !!securityData.rememberLogin : true,
          verifyNewDevice: securityData.verifyNewDevice !== undefined ? !!securityData.verifyNewDevice : true,
          sessionTimeout: securityData.sessionTimeout || '2 hours',
          refreshTokenEnabled: securityData.refreshTokenEnabled !== undefined ? !!securityData.refreshTokenEnabled : true,
          maxLoginAttempts: Number(securityData.maxLoginAttempts) || 5,
          lockDuration: Number(securityData.lockDuration) || 15,
          allowLoginEmail: securityData.allowLoginEmail !== undefined ? !!securityData.allowLoginEmail : true,
          allowLoginUsername: securityData.allowLoginUsername !== undefined ? !!securityData.allowLoginUsername : true,
          allowLoginPhone: securityData.allowLoginPhone !== undefined ? !!securityData.allowLoginPhone : true,
        });
      }

      // 3. Fetch Login History
      const historyRes = await fetch('/api/settings/security/login-history', { headers: getAuthHeader() });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setLoginHistory(Array.isArray(historyData) ? historyData : []);
      }
    } catch (err) {
      console.error('Error fetching security payload:', err);
      setErrorMsg('Failed to load system authentication details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Account Profile Changes
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAndBlockDemoAction((msg) => setErrorMsg(msg))) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        fullName,
        name: fullName,
        username,
        email,
        phone,
        backupEmail,
        recoveryPhoneNumber,
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg('Founder account profile and security credentials updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
        // Refresh to get any normalized strings
        const updatedData = await res.json();
        if (updatedData.username) {
          setUsername(updatedData.username);
        }
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update founder credentials.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while committing account settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Security Settings
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAndBlockDemoAction((msg) => setErrorMsg(msg))) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    // Make sure at least one login method is permitted
    if (!securitySettings.allowLoginEmail && !securitySettings.allowLoginUsername && !securitySettings.allowLoginPhone) {
      setErrorMsg('Operational Warning: You must allow at least one authentication identifier (Email, Username, or Phone).');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(securitySettings)
      });

      if (res.ok) {
        setSuccessMsg('Global authentication settings and session controls saved successfully.');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to apply security configurations.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while posting custom security configurations.');
    } finally {
      setIsSaving(false);
    }
  };

  // Clear Login History Log
  const handleClearHistory = async () => {
    if (checkAndBlockDemoAction((msg) => setErrorMsg(msg))) return;
    if (!window.confirm('Clear all login history? This action is recorded in the central audit logs.')) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/settings/security/login-history/clear', {
        method: 'POST',
        headers: getAuthHeader()
      });

      if (res.ok) {
        setSuccessMsg('Central login attempts history has been purged.');
        setLoginHistory([]);
      } else {
        setErrorMsg('Failed to purge login history.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error during transaction.');
    }
  };

  const handleToggleSetting = (key: keyof SecuritySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNumberChange = (key: keyof SecuritySettings, value: number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-xs text-slate-400 font-mono">Querying central security controls...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Security & Authentication
          </h2>
          <p className="text-xs text-slate-400">
            Control login methods, two-factor authentication, account lockouts, active sessions, and verify system security states.
          </p>
        </div>

        {/* Action Toggles tab menu */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/[0.04] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'account' 
                ? 'bg-emerald-500 text-slate-950' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Account Setup
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security' 
                ? 'bg-emerald-500 text-slate-950' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Auth Policies
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history' 
                ? 'bg-emerald-500 text-slate-950' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Login History
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: FOUNDER ACCOUNT SETTINGS */}
      {activeTab === 'account' && (
        <form onSubmit={handleSaveAccount} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2 border-b border-white/[0.04] pb-3">
                <User className="w-4 h-4" /> Founder Identity & System Handle
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                      placeholder="Chandru Mohan"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400">Username Identifier</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                    placeholder="chandru"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400">Primary Dispatch Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50 font-mono"
                      placeholder="chandrumohan550@gmail.com"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400">Primary Telephone Contact</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                    placeholder="+919655384140"
                  />
                </div>
              </div>
            </div>

            {/* Backups & Emergency parameters */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider flex items-center gap-2 border-b border-white/[0.04] pb-3">
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Out-of-Band & Recovery Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Backup Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400">Secondary / Recovery Email</label>
                  <input
                    type="email"
                    value={backupEmail}
                    onChange={(e) => setBackupEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                    placeholder="alternate@domain.com"
                  />
                </div>

                {/* Recovery Phone Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400">Backup Phone / OTP Redundancy</label>
                  <input
                    type="tel"
                    value={recoveryPhoneNumber}
                    onChange={(e) => setRecoveryPhoneNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500/50"
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* System Backup & Disaster Recovery */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2 border-b border-white/[0.04] pb-3">
                <Database className="w-4 h-4 text-emerald-400" /> Database Backup & Recovery (JSON)
              </h3>
              
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Export the entire server database configuration state, system settings, activity histories, and analytics metrics into a secure, single-file JSON layout. Restore states instantly via the recovery thread.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {/* Export Button */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      const res = await fetch("/api/admin/database/export", {
                        headers: getAuthHeader()
                      });
                      if (!res.ok) {
                        throw new Error("Backup file generation rejected by API pool.");
                      }
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `portfolio_db_backup_${new Date().toISOString().split("T")[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                      setSuccessMsg("Database backup JSON downloaded successfully.");
                    } catch (err: any) {
                      setErrorMsg(err.message || "Failed to download database backup.");
                    }
                  }}
                  className="flex-1 py-2.5 px-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900 text-slate-200 hover:text-emerald-400 text-xs font-semibold rounded-xl tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Export Database JSON
                </button>

                {/* Import Picker */}
                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept=".json"
                    id="db-backup-upload-input"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setErrorMsg(null);
                      setSuccessMsg(null);
                      
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        try {
                          const jsonText = event.target?.result as string;
                          const parsed = JSON.parse(jsonText);
                          
                          if (!parsed || typeof parsed !== "object" || !parsed.users) {
                            throw new Error("Invalid backup JSON layout schema.");
                          }

                          const res = await fetch("/api/admin/database/import", {
                            method: "POST",
                            headers: {
                              ...getAuthHeader(),
                              "Content-Type": "application/json"
                            },
                            body: jsonText
                          });

                          if (!res.ok) {
                            const errData = await res.json();
                            throw new Error(errData.error || "Recovery target rejected by API thread.");
                          }

                          setSuccessMsg("Disaster recovery completed: Database state reconstructed!");
                          loadData();
                        } catch (err: any) {
                          setErrorMsg("Import Failed: " + err.message);
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                  <label
                    htmlFor="db-backup-upload-input"
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-xl tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
                  >
                    <Upload className="w-4 h-4" /> Import Backup & Restore
                  </label>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2 border-b border-white/[0.04] pb-3">
                <Key className="w-4 h-4" /> Change Session Passcode
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                      placeholder="Minimum 8 complex characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400">Confirm Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                    placeholder="Verify passcode"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Access Clearance</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                To commit credentials or identity values to persistent memory pools, you must confirm you are verified.
              </p>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Account Specs
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY CONTROLS */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurity} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            
            {/* Login Identifiers Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2 border-b border-white/[0.04] pb-3">
                <UserCheck className="w-4 h-4" /> Permitted Access Identifiers
              </h3>

              <p className="text-[11px] text-slate-400">
                Configure which communication identifiers can be entered in the terminal login field to route credentials validation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email Identifier */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-normal">Permit login with email addresses.</span>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={securitySettings.allowLoginEmail}
                      onChange={() => handleToggleSetting('allowLoginEmail')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-400" />
                  </label>
                </div>

                {/* Username Identifier */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Username
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-normal">Permit short-name username inputs.</span>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={securitySettings.allowLoginUsername}
                      onChange={() => handleToggleSetting('allowLoginUsername')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-400" />
                  </label>
                </div>

                {/* Phone Identifier */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-normal">Permit telephone number formats.</span>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={securitySettings.allowLoginPhone}
                      onChange={() => handleToggleSetting('allowLoginPhone')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-400" />
                  </label>
                </div>
              </div>
            </div>



            {/* Lockout & Dynamic Limits */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider flex items-center gap-2 border-b border-white/[0.04] pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Intrusion Protection & Lockout Thresholds
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400 font-bold text-amber-400">Max Login Failures Allowed</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => handleNumberChange('maxLoginAttempts', Math.max(2, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 block pt-0.5">Locks user out temporarily on threshold failure.</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400 font-bold text-amber-400">Temporary Lockout Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={securitySettings.lockDuration}
                    onChange={(e) => handleNumberChange('lockDuration', Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 block pt-0.5">Minutes lock remains active before retry window.</span>
                </div>
              </div>
            </div>

            {/* Session Expirations & Token options */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2 border-b border-white/[0.04] pb-3">
                <Lock className="w-4 h-4" /> Session & Token Security
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400">JWT Session Timeout</label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
                  >
                    <option value="15 minutes">15 Minutes</option>
                    <option value="30 minutes">30 Minutes</option>
                    <option value="1 hour">1 Hour</option>
                    <option value="2 hours">2 Hours (Standard)</option>
                    <option value="4 hours">4 Hours</option>
                    <option value="8 hours">8 Hours</option>
                    <option value="24 hours">24 Hours</option>
                    <option value="7 days">7 Days</option>
                    <option value="30 days">30 Days (Maximum)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 block pt-0.5 font-mono text-slate-400">Maximum token lifetime.</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 self-end">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block">Session Refresh Tokens</span>
                    <span className="text-[10px] text-slate-500 block leading-normal">Issue long-term offline tokens.</span>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={securitySettings.refreshTokenEnabled}
                      onChange={() => handleToggleSetting('refreshTokenEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-400" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right column options */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Access Policies</h4>
              
              <div className="space-y-4">
                {/* Always require login */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block">Always Force Login</span>
                    <span className="text-[10px] text-slate-500 block leading-normal">Bypasses cookies, requiring sign in on every reload.</span>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={securitySettings.alwaysRequireLogin}
                      onChange={() => handleToggleSetting('alwaysRequireLogin')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-400" />
                  </label>
                </div>

                {/* Device Recognition Bypass */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40 opacity-50 cursor-not-allowed select-none" title="This feature is currently unavailable because the backend is missing a step-2 / Multi-Factor Authentication (MFA) OTP verification engine.">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-400 block flex items-center gap-1.5">
                      Recognized Devices Bypass <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase uppercase tracking-wider">Unavailable</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-normal">Bypass step-2 verification code on remembered browsers.</span>
                    <span className="text-[9.5px] text-amber-500/80 font-mono block pt-1">
                      ⚠️ Requires backend OTP or secondary-verification service.
                    </span>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-not-allowed select-none">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled={true}
                      readOnly={true}
                      className="sr-only"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-600 after:border-slate-700 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>

                {/* Remember Login Option */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200 block">Allow Remember Me</span>
                    <span className="text-[10px] text-slate-500 block leading-normal">Exposes Remember checkbox on login panel.</span>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={securitySettings.rememberLogin}
                      onChange={() => handleToggleSetting('rememberLogin')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950 peer-checked:after:border-emerald-400" />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-slate-950" />}
                  Apply Security Policy
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: LOGIN HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Laptop className="w-4 h-4" /> Terminal Access Audit Trail
            </h3>
            <div className="flex gap-2">
              <button
                onClick={loadData}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 font-mono uppercase font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button
                onClick={handleClearHistory}
                disabled={loginHistory.length === 0}
                className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5 font-mono uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Logs
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Event Description</th>
                    <th className="p-4">Input Identifier</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4">User Agent / Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {loginHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No login events registered in audit pool memory.
                      </td>
                    </tr>
                  ) : (
                    [...loginHistory].reverse().map((evt, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 text-slate-400 shrink-0 whitespace-nowrap">
                          {new Date(evt.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 text-slate-200">
                          {evt.eventType || 'Access Check'}
                          {evt.details && (
                            <span className="block text-[10px] text-slate-500 leading-normal font-sans pt-0.5">
                              {evt.details}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-300 font-bold">
                          {evt.username || 'System'}
                        </td>
                        <td className="p-4 text-slate-400">
                          {evt.ipAddress || '127.0.0.1'}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            evt.status === 'SUCCESS' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : evt.status === 'LOCKED'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {evt.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 max-w-[200px] truncate" title={evt.userAgent}>
                          {evt.userAgent || 'Unknown Agent'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

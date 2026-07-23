import React, { useState, useEffect } from 'react';
import { Mail, Send, Save, Check, RefreshCw, Key, ShieldCheck, Server, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

export default function EmailSettingsPage({ triggerToast }: { triggerToast: (msg: string, type: 'success' | 'error') => void }) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailSettings, setEmailSettings] = useState<any>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'notifications@alexdev.io',
    smtpPass: '',
    secure: true,
    preset: 'Gmail SMTP',
    autoReplyEnabled: true,
    contactAlertsEnabled: true,
    adminNotificationsEnabled: true,
    autoReplyTemplate: `Hello {{name}},\n\nThank you for reaching out! I have received your message regarding "{{subject}}" and will get back to you within 24 hours.\n\nBest regards,\nAlex Dev`,
    contactAlertTemplate: `New Contact Submission Received!\nName: {{name}}\nEmail: {{email}}\nSubject: {{subject}}\nMessage:\n{{message}}`
  });

  useEffect(() => {
    fetch('/api/email/settings')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setEmailSettings((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch(() => triggerToast('Failed to load email settings', 'error'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/email/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings)
      });
      if (res.ok) {
        triggerToast('Email system settings updated successfully!', 'success');
      } else {
        throw new Error('Failed to update email settings');
      }
    } catch (e: any) {
      triggerToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailSettings.smtpUser })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(data.message || 'Test email dispatched successfully!', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      triggerToast(e.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Enterprise Email & SMTP Management System
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                SMTP / Mail Templates
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Configure SMTP servers, auto-replies to contact submissions, and instant alert dispatches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestEmail}
            disabled={testing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-400" />}
            <span>Test SMTP Dispatch</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* SMTP Server Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Server className="w-4 h-4" />
          SMTP Server Connection Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Preset Provider</label>
            <select
              value={emailSettings.preset}
              onChange={(e) => {
                const val = e.target.value;
                let host = emailSettings.smtpHost;
                let port = emailSettings.smtpPort;
                if (val === 'Gmail SMTP') { host = 'smtp.gmail.com'; port = 587; }
                else if (val === 'SendGrid') { host = 'smtp.sendgrid.net'; port = 587; }
                else if (val === 'Mailgun') { host = 'smtp.mailgun.org'; port = 587; }
                else if (val === 'AWS SES') { host = 'email-smtp.us-east-1.amazonaws.com'; port = 587; }

                setEmailSettings({ ...emailSettings, preset: val, smtpHost: host, smtpPort: port });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Gmail SMTP">Gmail SMTP</option>
              <option value="SendGrid">SendGrid API</option>
              <option value="Mailgun">Mailgun SMTP</option>
              <option value="AWS SES">AWS SES</option>
              <option value="Custom">Custom SMTP</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">SMTP Host</label>
            <input
              type="text"
              value={emailSettings.smtpHost}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Port</label>
            <input
              type="number"
              value={emailSettings.smtpPort}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) || 587 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">SMTP Username / Email</label>
            <input
              type="text"
              value={emailSettings.smtpUser}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Auto-Response & Notification Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200">Visitor Auto-Reply</span>
            <button
              onClick={() => setEmailSettings({ ...emailSettings, autoReplyEnabled: !emailSettings.autoReplyEnabled })}
              className="text-emerald-400 cursor-pointer"
            >
              {emailSettings.autoReplyEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
            </button>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Automatically send confirmation emails when visitors submit the contact form.
          </p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200">Admin Email Alerts</span>
            <button
              onClick={() => setEmailSettings({ ...emailSettings, contactAlertsEnabled: !emailSettings.contactAlertsEnabled })}
              className="text-emerald-400 cursor-pointer"
            >
              {emailSettings.contactAlertsEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
            </button>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Receive instant email alerts on new contact messages & recruiter leads.
          </p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200">Security Audit Digests</span>
            <button
              onClick={() => setEmailSettings({ ...emailSettings, adminNotificationsEnabled: !emailSettings.adminNotificationsEnabled })}
              className="text-emerald-400 cursor-pointer"
            >
              {emailSettings.adminNotificationsEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
            </button>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Weekly system health summaries and unusual login attempt alerts.
          </p>
        </div>
      </div>

      {/* Email Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto Reply Template */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-400">
            <FileText className="w-4 h-4" />
            Visitor Auto-Reply Template
          </div>
          <p className="text-[11px] font-mono text-slate-400">Available variables: <code className="text-emerald-400 font-bold">&#123;&#123;name&#125;&#125;</code>, <code className="text-emerald-400 font-bold">&#123;&#123;subject&#125;&#125;</code>, <code className="text-emerald-400 font-bold">&#123;&#123;email&#125;&#125;</code></p>
          <textarea
            rows={8}
            value={emailSettings.autoReplyTemplate}
            onChange={(e) => setEmailSettings({ ...emailSettings, autoReplyTemplate: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Contact Alert Template */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-400">
            <FileText className="w-4 h-4" />
            Admin Alert Digest Template
          </div>
          <p className="text-[11px] font-mono text-slate-400">Available variables: <code className="text-emerald-400 font-bold">&#123;&#123;name&#125;&#125;</code>, <code className="text-emerald-400 font-bold">&#123;&#123;email&#125;&#125;</code>, <code className="text-emerald-400 font-bold">&#123;&#123;message&#125;&#125;</code></p>
          <textarea
            rows={8}
            value={emailSettings.contactAlertTemplate}
            onChange={(e) => setEmailSettings({ ...emailSettings, contactAlertTemplate: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}

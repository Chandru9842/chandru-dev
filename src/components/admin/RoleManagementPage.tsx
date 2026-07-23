import React, { useState, useEffect } from 'react';
import { Shield, Plus, Lock, Check, Key, UserCheck, ShieldAlert, Edit2, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function RoleManagementPage({ triggerToast }: { triggerToast: (msg: string, type: 'success' | 'error') => void }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['VIEW_ANALYTICS']);

  const allPermissions = [
    { key: 'MANAGE_PROJECTS', label: 'Manage Projects & Case Studies' },
    { key: 'MANAGE_SKILLS', label: 'Manage Skills & Architecture' },
    { key: 'MANAGE_MESSAGES', label: 'Manage Inbox & Messages' },
    { key: 'VIEW_ANALYTICS', label: 'View Analytics & Metrics' },
    { key: 'MANAGE_USERS', label: 'Manage Administrative Users' },
    { key: 'SYSTEM_BACKUP', label: 'Manage System Backups & Imports' },
    { key: 'SECURITY_AUDIT', label: 'Access Audit Logs & Security' },
    { key: 'ROLE_MANAGEMENT', label: 'Manage Roles & Grant Permissions' }
  ];

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      setRoles(data || []);
    } catch (e) {
      triggerToast('Failed to fetch system roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDesc,
          permissions: selectedPermissions
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(`Role "${newRoleName}" created successfully!`, 'success');
        setNewRoleName('');
        setNewRoleDesc('');
        fetchRoles();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const togglePermission = (key: string) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter(k => k !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Role & Permission Access Matrix
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                RBAC Core
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Granular access control policies across Founder, Admin, Editor, and Viewer levels.
            </p>
          </div>
        </div>

        <button
          onClick={fetchRoles}
          className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Existing Roles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => (
          <div
            key={r.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                r.name === 'Founder' 
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                  : r.name === 'Admin'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {r.name}
              </span>
              {r.isSystem && (
                <span className="text-[9px] font-mono text-slate-500 uppercase">System Locked</span>
              )}
            </div>

            <h3 className="text-sm font-bold text-slate-100">{r.name} Role</h3>
            <p className="text-xs text-slate-400 font-mono line-clamp-2 leading-relaxed">
              {r.description}
            </p>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <p className="text-[10px] font-mono uppercase text-slate-500 font-bold">Granted Permissions ({r.permissions?.length || 0}):</p>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                {(r.permissions || []).map((perm: string) => (
                  <span key={perm} className="text-[9px] font-mono bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-800">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Custom Role */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Custom Access Role
        </h3>

        <form onSubmit={handleCreateRole} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Role Title</label>
              <input
                type="text"
                placeholder="e.g. Content Reviewer"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Role Description</label>
              <input
                type="text"
                placeholder="Scope of authority & responsibilities"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">Permissions Matrix</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {allPermissions.map((perm) => {
                const active = selectedPermissions.includes(perm.key);
                return (
                  <button
                    type="button"
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className={`p-3 rounded-xl border text-left font-mono transition cursor-pointer flex items-center justify-between ${
                      active
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs">{perm.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Deploy Role Definition</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

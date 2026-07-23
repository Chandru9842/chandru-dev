import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Check, RefreshCw, ChevronUp, ChevronDown, 
  Cpu, ShieldAlert, Eye, EyeOff
} from 'lucide-react';
import { notifyCmsUpdate } from '../../utils/notifyCmsSync';

interface TechnologyItem {
  id: number;
  name: string;
  enabled?: boolean;
  order?: number;
  displayOrder?: number;
  category?: string;
  proficiency?: number;
  iconUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TechStackPageProps {
  onTriggerToast: (message: string, type: 'success' | 'error') => void;
  onTechStackUpdated?: () => void;
}

export default function TechStackPage({ onTriggerToast, onTechStackUpdated }: TechStackPageProps) {
  const [technologies, setTechnologies] = useState<TechnologyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [newTechName, setNewTechName] = useState('');
  const [editingTechId, setEditingTechId] = useState<number | null>(null);
  const [editingTechName, setEditingTechName] = useState('');

  const getJwtToken = () =>
    localStorage.getItem("alex_dev_jwt_token") ||
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token");

  const fetchTechnologies = async () => {
    setLoading(true);
    try {
      const cacheBuster = `t=${Date.now()}`;
      const res = await fetch(`/api/technologies?${cacheBuster}`);
      if (res.ok) {
        const data = await res.json();
        const sorted = (data || []).sort(
          (a: any, b: any) => ((a.order ?? a.displayOrder) || 0) - ((b.order ?? b.displayOrder) || 0)
        );
        setTechnologies(sorted);
      } else {
        onTriggerToast("Failed to fetch tech stack list.", "error");
      }
    } catch (err) {
      onTriggerToast("Network error trying to load tech stack.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const handleAddTechnology = async () => {
    const trimmed = newTechName.trim();
    if (!trimmed) {
      onTriggerToast("Technology name cannot be empty.", "error");
      return;
    }

    const token = getJwtToken();
    if (!token) {
      onTriggerToast("Administrative privileges locked. Log in first.", "error");
      return;
    }

    try {
      const maxOrder = technologies.length > 0
        ? Math.max(...technologies.map(t => (t.order ?? t.displayOrder) || 0))
        : 0;

      const payload = {
        name: trimmed,
        techName: trimmed,
        technologyName: trimmed,
        enabled: true,
        order: maxOrder + 1,
        displayOrder: maxOrder + 1
      };

      let res = await fetch('/api/technologies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        res = await fetch('/api/tech-stack', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setNewTechName('');
        onTriggerToast(`Added "${trimmed}" to Hero Tech Stack database.`, "success");
        notifyCmsUpdate();
        await fetchTechnologies();
        if (onTechStackUpdated) onTechStackUpdated();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || "Failed to add technology.", "error");
      }
    } catch (err) {
      onTriggerToast("Gateway connection error.", "error");
    }
  };

  const handleUpdateTechnology = async (id: number, payload: Partial<TechnologyItem>) => {
    const token = getJwtToken();
    if (!token) {
      onTriggerToast("Administrative session locked. Please re-login.", "error");
      return;
    }

    if (payload.name !== undefined && !payload.name.trim()) {
      onTriggerToast("Technology name cannot be empty.", "error");
      return;
    }

    try {
      const res = await fetch(`/api/technologies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEditingTechId(null);
        onTriggerToast("Saved technology adjustments successfully.", "success");
        notifyCmsUpdate();
        await fetchTechnologies();
        if (onTechStackUpdated) onTechStackUpdated();
      } else {
        const errData = await res.json();
        onTriggerToast(errData.error || "Failed to update technology.", "error");
      }
    } catch (err) {
      onTriggerToast("Gateway connection error.", "error");
    }
  };

  const handleToggleEnabled = async (tech: TechnologyItem) => {
    await handleUpdateTechnology(tech.id, {
      enabled: tech.enabled === false ? true : false
    });
  };

  const handleDeleteTechnology = async (id: number, name: string) => {
    const token = getJwtToken();
    if (!token) {
      onTriggerToast("Administrative privileges locked.", "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to purge "${name}" from the tech stack?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/technologies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        onTriggerToast(`Purged "${name}" from Hero Tech Stack.`, "success");
        notifyCmsUpdate();
        await fetchTechnologies();
        if (onTechStackUpdated) onTechStackUpdated();
      } else {
        onTriggerToast("Failed to delete technology from database.", "error");
      }
    } catch (err) {
      onTriggerToast("Gateway connection error.", "error");
    }
  };

  const handleMoveTech = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === technologies.length - 1) return;

    const newList = [...technologies];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    // Swap elements in list
    const temp = newList[index];
    newList[index] = newList[targetIdx];
    newList[targetIdx] = temp;

    // Optimistic local state update
    setTechnologies(newList);

    const token = getJwtToken();
    if (!token) return;

    setSavingOrder(true);
    try {
      const updatedOrders = newList.map((item, idx) => ({
        id: item.id,
        order: idx + 1,
        displayOrder: idx + 1
      }));

      const res = await fetch("/api/technologies/reorder", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orders: updatedOrders }),
      });

      if (res.ok) {
        onTriggerToast("Tech stack rendering hierarchy saved.", "success");
        notifyCmsUpdate();
        if (onTechStackUpdated) onTechStackUpdated();
      } else {
        onTriggerToast("Failed to sync hierarchy order with database.", "error");
        await fetchTechnologies();
      }
    } catch (err) {
      onTriggerToast("Gateway error saving hierarchy display order.", "error");
      await fetchTechnologies();
    } finally {
      setSavingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="font-mono text-xs text-slate-500">Loading Tech Stack schema from JSON store...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-1.5" id="tech-stack-management-container">
      
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/40 border border-slate-900 p-6 rounded-3xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100 font-mono tracking-tight font-display">Hero Tech Stack Manager</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
            Configure specific programming languages, tools, and platforms displayed inside the active Hero 3D orbit universe.
          </p>
        </div>
        <span className="text-xs font-mono px-3.5 py-1.5 bg-slate-950/80 border border-slate-900 rounded-2xl text-slate-400">
          {technologies.length} Techs Configured
        </span>
      </div>

      {/* Inline Form to Add New Tech */}
      <div className="bg-slate-900/20 border border-slate-900/60 p-5 rounded-3xl space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-900/80">
          Register New Technology
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-grow">
            <input 
              type="text" 
              placeholder="Enter tech name (e.g. Java, Spring Boot, React, Kubernetes)..."
              value={newTechName}
              onChange={(e) => setNewTechName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTechnology()}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 transition focus:outline-none"
            />
          </div>
          <button
            onClick={handleAddTechnology}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold font-mono text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Universe</span>
          </button>
        </div>
      </div>

      {/* Main Table List */}
      <div className="bg-slate-900/20 border border-slate-900/60 rounded-3xl overflow-hidden p-1.5">
        
        {technologies.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/20 border border-dashed border-slate-900 rounded-2xl m-3">
            <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-mono">No technologies registered. Populate your tech stack universe above!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-900/60">
            {technologies.map((tech, idx) => {
              const isEditing = editingTechId === tech.id;
              const isEnabled = tech.enabled !== false;
              return (
                <div 
                  key={tech.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-all hover:bg-slate-950/10 ${
                    !isEnabled ? 'opacity-60' : ''
                  }`}
                >
                  
                  {/* Left Name Info */}
                  <div className="flex items-center gap-3.5 flex-grow min-w-0">
                    <span className="text-[10px] font-mono text-slate-600 shrink-0 select-none bg-slate-950/50 border border-slate-900/80 w-6 h-6 rounded-lg flex items-center justify-center">
                      {idx + 1}
                    </span>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full max-w-md">
                        <input 
                          type="text" 
                          value={editingTechName}
                          onChange={(e) => setEditingTechName(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            handleUpdateTechnology(tech.id, { name: editingTechName })
                          }
                          className="bg-slate-950 border border-emerald-500 text-slate-100 text-xs font-mono rounded-xl px-3.5 py-1.5 w-full focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateTechnology(tech.id, { name: editingTechName })}
                          className="p-2 text-emerald-400 hover:text-emerald-300 rounded-xl hover:bg-emerald-500/10 cursor-pointer shrink-0"
                          title="Save Name"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTechId(null)}
                          className="p-2 text-slate-400 hover:text-slate-300 rounded-xl hover:bg-slate-800 cursor-pointer shrink-0"
                          title="Cancel"
                        >
                          <ChevronUp className="w-4 h-4 transform rotate-180" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono font-bold text-slate-200 truncate">
                          {tech.name}
                        </span>
                        {!isEnabled && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            Hidden
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setEditingTechId(tech.id);
                            setEditingTechName(tech.name);
                          }}
                          className="p-1 text-slate-500 hover:text-emerald-400 rounded-lg hover:bg-slate-950 transition cursor-pointer"
                          title="Edit Name"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    
                    {/* Status Pill Toggle */}
                    <button
                      onClick={() => handleToggleEnabled(tech)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                        isEnabled 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                      title={isEnabled ? "Disable technology in Hero" : "Enable technology in Hero"}
                    >
                      {isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{isEnabled ? 'Active' : 'Hidden'}</span>
                    </button>

                    {/* Hierarchy Display Reorder up */}
                    <button
                      onClick={() => handleMoveTech(idx, 'up')}
                      disabled={idx === 0 || savingOrder}
                      className="p-1.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-20 border border-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Hierarchy Display Reorder down */}
                    <button
                      onClick={() => handleMoveTech(idx, 'down')}
                      disabled={idx === technologies.length - 1 || savingOrder}
                      className="p-1.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-20 border border-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Purge Delete */}
                    <button
                      onClick={() => handleDeleteTechnology(tech.id, tech.name)}
                      className="p-1.5 bg-rose-950/10 border border-rose-950/30 hover:bg-rose-500/15 rounded-lg text-rose-400 transition cursor-pointer"
                      title="Purge Tech Tag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}

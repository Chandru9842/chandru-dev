import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, TableProperties, KeyRound, Eye, ChevronDown, ChevronUp, RefreshCw, Layers } from 'lucide-react';

interface ColumnInfo {
  name: string;
  type: string;
  key?: 'PK' | 'FK';
  nullable: boolean;
  notes?: string;
}

interface TableSchema {
  name: string;
  className: string;
  columns: ColumnInfo[];
  indexes: string[];
  relations: string[];
  cascadeRules: string;
}

const schemas: TableSchema[] = [
  {
    name: 'admins',
    className: 'Admin.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false, notes: 'Primary Key' },
      { name: 'username', type: 'VARCHAR(50)', nullable: false, notes: 'UNIQUE Constraint' },
      { name: 'email', type: 'VARCHAR(100)', nullable: false, notes: 'UNIQUE Constraint' },
      { name: 'password_hash', type: 'VARCHAR(255)', nullable: false, notes: 'BCrypt digest' },
      { name: 'full_name', type: 'VARCHAR(100)', nullable: false },
      { name: 'title', type: 'VARCHAR(255)', nullable: true, notes: 'Professional subtitle' },
      { name: 'bio', type: 'TEXT', nullable: true },
      { name: 'avatar_url', type: 'VARCHAR(255)', nullable: true }
    ],
    indexes: ['uq_admins_email (email)', 'uq_admins_username (username)'],
    relations: ['One-to-Many with projects', 'One-to-Many with experiences', 'One-to-Many with certificates', 'One-to-Many with social_links'],
    cascadeRules: 'CascadeType.ALL, orphanRemoval=true (All child records purged on admin delete)'
  },
  {
    name: 'projects',
    className: 'Project.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'title', type: 'VARCHAR(150)', nullable: false },
      { name: 'slug', type: 'VARCHAR(150)', nullable: false, notes: 'UNIQUE for routing' },
      { name: 'description', type: 'TEXT', nullable: false },
      { name: 'category', type: 'VARCHAR(50)', nullable: false, notes: 'Full-Stack, Frontend, Backend, etc.' },
      { name: 'status', type: 'VARCHAR(30)', nullable: false, notes: 'Concept, In Dev, Completed, Archived' },
      { name: 'live_url', type: 'VARCHAR(255)', nullable: true },
      { name: 'github_url', type: 'VARCHAR(255)', nullable: true },
      { name: 'video_url', type: 'VARCHAR(255)', nullable: true, notes: 'YouTube/Vimeo Embed path' },
      { name: 'media_gallery', type: 'TEXT', nullable: true, notes: 'JSON array of CDN images' },
      { name: 'start_date', type: 'DATE', nullable: true },
      { name: 'end_date', type: 'DATE', nullable: true },
      { name: 'is_featured', type: 'BOOLEAN', nullable: false },
      { name: 'display_order', type: 'INT', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false },
      { name: 'admin_id', type: 'BIGINT', key: 'FK', nullable: false, notes: 'FK to admins(id)' }
    ],
    indexes: ['idx_project_slug (slug) UNIQUE', 'idx_project_featured (is_featured)', 'idx_project_category (category)'],
    relations: ['Many-to-One with admins', 'Many-to-Many with skills (via project_skills)', 'One-to-Many with media'],
    cascadeRules: 'CascadeType.ALL on media, CascadeType.PERSIST on skills'
  },
  {
    name: 'skills',
    className: 'Skill.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'name', type: 'VARCHAR(50)', nullable: false, notes: 'UNIQUE' },
      { name: 'category', type: 'VARCHAR(50)', nullable: false, notes: 'Frontend, Backend, etc.' },
      { name: 'proficiency', type: 'INT', nullable: false, notes: '1 to 100 percentage' },
      { name: 'icon_url', type: 'VARCHAR(255)', nullable: true },
      { name: 'display_order', type: 'INT', nullable: false },
      { name: 'admin_id', type: 'BIGINT', key: 'FK', nullable: false, notes: 'FK to admins(id)' }
    ],
    indexes: ['idx_skill_category (category)', 'uq_skills_name (name)'],
    relations: ['Many-to-One with admins', 'Many-to-Many with projects (via project_skills)'],
    cascadeRules: 'CascadeType.PERSIST/MERGE (Skills kept even if project is deleted)'
  },
  {
    name: 'project_skills',
    className: 'ManyToMany Join Table',
    columns: [
      { name: 'project_id', type: 'BIGINT', key: 'PK', nullable: false, notes: 'FK to projects(id)' },
      { name: 'skill_id', type: 'BIGINT', key: 'PK', nullable: false, notes: 'FK to skills(id)' }
    ],
    indexes: ['PRIMARY (project_id, skill_id)', 'idx_proj_skills_skill (skill_id)'],
    relations: ['Maps many-to-many relationship of projects and skills'],
    cascadeRules: 'ON DELETE CASCADE (Join table rows purged on project or skill delete)'
  },
  {
    name: 'certificates',
    className: 'Certificate.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'name', type: 'VARCHAR(150)', nullable: false },
      { name: 'issuing_organization', type: 'VARCHAR(150)', nullable: false },
      { name: 'issue_date', type: 'DATE', nullable: false },
      { name: 'expiration_date', type: 'DATE', nullable: true },
      { name: 'credential_id', type: 'VARCHAR(100)', nullable: true },
      { name: 'credential_url', type: 'VARCHAR(255)', nullable: true },
      { name: 'admin_id', type: 'BIGINT', key: 'FK', nullable: false, notes: 'FK to admins(id)' }
    ],
    indexes: ['PRIMARY (id)'],
    relations: ['Many-to-One with admins'],
    cascadeRules: 'CascadeType.ALL (Purged on admin deletion)'
  },
  {
    name: 'experiences',
    className: 'Experience.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'company', type: 'VARCHAR(100)', nullable: false },
      { name: 'role', type: 'VARCHAR(100)', nullable: false },
      { name: 'description', type: 'TEXT', nullable: false },
      { name: 'company_url', type: 'VARCHAR(255)', nullable: true },
      { name: 'company_logo_url', type: 'VARCHAR(255)', nullable: true },
      { name: 'start_date', type: 'DATE', nullable: false },
      { name: 'end_date', type: 'DATE', nullable: true },
      { name: 'is_current', type: 'BOOLEAN', nullable: false },
      { name: 'location', type: 'VARCHAR(100)', nullable: true },
      { name: 'admin_id', type: 'BIGINT', key: 'FK', nullable: false, notes: 'FK to admins(id)' }
    ],
    indexes: ['idx_exp_dates (start_date, end_date)'],
    relations: ['Many-to-One with admins'],
    cascadeRules: 'CascadeType.ALL (Purged on admin deletion)'
  },
  {
    name: 'education',
    className: 'Education.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'institution', type: 'VARCHAR(150)', nullable: false },
      { name: 'degree', type: 'VARCHAR(100)', nullable: false },
      { name: 'field_of_study', type: 'VARCHAR(100)', nullable: false },
      { name: 'start_date', type: 'DATE', nullable: false },
      { name: 'end_date', type: 'DATE', nullable: true },
      { name: 'is_current', type: 'BOOLEAN', nullable: false },
      { name: 'grade', type: 'VARCHAR(50)', nullable: true },
      { name: 'activities', type: 'TEXT', nullable: true },
      { name: 'admin_id', type: 'BIGINT', key: 'FK', nullable: false, notes: 'FK to admins(id)' }
    ],
    indexes: ['PRIMARY (id)'],
    relations: ['Many-to-One with admins'],
    cascadeRules: 'CascadeType.ALL (Purged on admin deletion)'
  },
  {
    name: 'messages',
    className: 'Message.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'sender_name', type: 'VARCHAR(100)', nullable: false },
      { name: 'sender_email', type: 'VARCHAR(100)', nullable: false },
      { name: 'subject', type: 'VARCHAR(200)', nullable: false },
      { name: 'message_content', type: 'TEXT', nullable: false },
      { name: 'is_read', type: 'BOOLEAN', nullable: false },
      { name: 'is_starred', type: 'BOOLEAN', nullable: false },
      { name: 'ip_address', type: 'VARCHAR(45)', nullable: true, notes: 'IPv4 or IPv6 support' }
    ],
    indexes: ['idx_message_status (is_read)'],
    relations: ['Standalone contact leads database'],
    cascadeRules: 'N/A (Persisted for audit trail)'
  },
  {
    name: 'social_links',
    className: 'SocialLink.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'platform', type: 'VARCHAR(50)', nullable: false },
      { name: 'url', type: 'VARCHAR(255)', nullable: false },
      { name: 'icon_name', type: 'VARCHAR(50)', nullable: true },
      { name: 'display_order', type: 'INT', nullable: false },
      { name: 'is_active', type: 'BOOLEAN', nullable: false },
      { name: 'admin_id', type: 'BIGINT', key: 'FK', nullable: false, notes: 'FK to admins(id)' }
    ],
    indexes: ['PRIMARY (id)'],
    relations: ['Many-to-One with admins'],
    cascadeRules: 'CascadeType.ALL (Purged on admin deletion)'
  },
  {
    name: 'settings',
    className: 'Settings.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'site_name', type: 'VARCHAR(100)', nullable: false },
      { name: 'site_description', type: 'VARCHAR(255)', nullable: true },
      { name: 'meta_keywords', type: 'VARCHAR(255)', nullable: true },
      { name: 'theme_color', type: 'VARCHAR(30)', nullable: true },
      { name: 'analytics_id', type: 'VARCHAR(50)', nullable: true },
      { name: 'is_maintenance_mode', type: 'BOOLEAN', nullable: false },
      { name: 'allow_contact', type: 'BOOLEAN', nullable: false }
    ],
    indexes: ['PRIMARY (id)'],
    relations: ['Global system configuration'],
    cascadeRules: 'N/A (Singleton row 1)'
  },
  {
    name: 'visitors',
    className: 'Visitor.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'visitor_hash', type: 'VARCHAR(64)', nullable: false, notes: 'SHA-256 Unique footprint' },
      { name: 'ip_address', type: 'VARCHAR(45)', nullable: true },
      { name: 'user_agent', type: 'VARCHAR(255)', nullable: true },
      { name: 'country', type: 'VARCHAR(100)', nullable: true },
      { name: 'city', type: 'VARCHAR(100)', nullable: true }
    ],
    indexes: ['uq_visitor_hash (visitor_hash) UNIQUE'],
    relations: ['One-to-Many with analytics'],
    cascadeRules: 'CascadeType.ALL (Purged when visitor audit log rotates)'
  },
  {
    name: 'analytics',
    className: 'Analytics.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'path_accessed', type: 'VARCHAR(255)', nullable: false },
      { name: 'referrer', type: 'VARCHAR(255)', nullable: true },
      { name: 'duration_ms', type: 'BIGINT', nullable: true },
      { name: 'visitor_id', type: 'BIGINT', key: 'FK', nullable: false, notes: 'FK to visitors(id)' }
    ],
    indexes: ['idx_analytics_path (path_accessed)', 'idx_analytics_time (created_at)'],
    relations: ['Many-to-One with visitors'],
    cascadeRules: 'CascadeType.ALL'
  },
  {
    name: 'media',
    className: 'Media.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'public_id', type: 'VARCHAR(150)', nullable: false, notes: 'Cloudinary public hash' },
      { name: 'url', type: 'VARCHAR(255)', nullable: false },
      { name: 'file_name', type: 'VARCHAR(150)', nullable: false },
      { name: 'file_type', type: 'VARCHAR(50)', nullable: false },
      { name: 'file_size', type: 'BIGINT', nullable: false },
      { name: 'project_id', type: 'BIGINT', key: 'FK', nullable: true, notes: 'FK to projects(id) ON DELETE SET NULL' }
    ],
    indexes: ['PRIMARY (id)'],
    relations: ['Many-to-One with projects'],
    cascadeRules: 'Nullifies project relation on delete (No image data is lost)'
  },
  {
    name: 'resumes',
    className: 'Resume.java',
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', key: 'PK', nullable: false },
      { name: 'version', type: 'VARCHAR(50)', nullable: false },
      { name: 'file_url', type: 'VARCHAR(255)', nullable: false },
      { name: 'is_active', type: 'BOOLEAN', nullable: false },
      { name: 'download_count', type: 'INT', nullable: false },
      { name: 'admin_id', type: 'BIGINT', key: 'FK', nullable: false, notes: 'FK to admins(id) One-to-One' }
    ],
    indexes: ['uq_resume_admin (admin_id) UNIQUE'],
    relations: ['One-to-One with admins'],
    cascadeRules: 'CascadeType.ALL (One active resume per admin)'
  }
];

export default function DatabaseERD() {
  const [selectedTable, setSelectedTable] = useState<string | null>('admins');
  const [search, setSearch] = useState('');

  const filteredSchemas = schemas.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.className.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="database-erd-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">MySQL Schema & ERD Model</h2>
            <p className="text-xs text-slate-400">Normalized to Third Normal Form (3NF) relational layout</p>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search tables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs bg-slate-950 text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-44"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* left list */}
        <div className="lg:col-span-5 space-y-2 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredSchemas.map((table) => {
            const isSelected = selectedTable === table.name;
            return (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TableProperties className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-mono text-sm font-bold">{table.name}</div>
                    <div className="text-[10px] text-slate-500">{table.className}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                    {table.columns.length} cols
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* right detail view */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800/80 rounded-xl p-5 min-h-[400px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {selectedTable && (() => {
              const table = schemas.find(s => s.name === selectedTable);
              if (!table) return null;

              return (
                <motion.div
                  key={table.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-xs font-mono">Table</span>
                        <h3 className="text-lg font-mono font-bold text-slate-100">{table.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Entity Class: {table.className}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold font-mono">3NF OK</span>
                  </div>

                  {/* table column list */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-800/60">
                          <th className="pb-2 font-semibold">Column</th>
                          <th className="pb-2 font-semibold">Type</th>
                          <th className="pb-2 font-semibold text-center">Key</th>
                          <th className="pb-2 font-semibold">Constraint</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60">
                        {table.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-slate-900/30">
                            <td className="py-2.5 font-bold text-slate-300 flex items-center gap-1.5">
                              {col.key === 'PK' && <KeyRound className="w-3.5 h-3.5 text-yellow-500" />}
                              {col.key === 'FK' && <KeyRound className="w-3.5 h-3.5 text-cyan-400" />}
                              {col.name}
                            </td>
                            <td className="py-2.5 text-slate-400">{col.type}</td>
                            <td className="py-2.5 text-center font-bold">
                              {col.key ? (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                  col.key === 'PK' ? 'bg-yellow-500/15 text-yellow-500' : 'bg-cyan-500/15 text-cyan-400'
                                }`}>
                                  {col.key}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="py-2.5 text-[10px] text-slate-500 italic max-w-[180px] truncate" title={col.notes}>
                              {col.nullable ? 'NULLABLE' : 'NOT NULL'}{col.notes ? ` • ${col.notes}` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* relational attributes */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Index Constraints</div>
                      <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-300">
                        {table.indexes.map((idx, i) => (
                          <li key={i} className="truncate">{idx}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">JPA Cascade Rules</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{table.cascadeRules}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

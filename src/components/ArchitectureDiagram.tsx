import React from 'react';
import { motion } from 'motion/react';
import { Shield, Layers, Cpu, Database, Network, KeyRound, CheckCircle2 } from 'lucide-react';
import { cleanArchitectureLayers } from '../data/backendCode';

interface Props {
  activePackage: string;
}

export default function ArchitectureDiagram({ activePackage }: Props) {
  return (
    <div id="arch-diagram-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Layers className="w-6 h-6 text-emerald-400 animate-pulse" />
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">Clean Architecture Core</h2>
            <p className="text-xs text-slate-400">Layered separation of concerns & independent business logic</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* presentation layer */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-slate-800 bg-slate-950/60 rounded-xl p-5 relative group"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Presentation / API</span>
              <Network className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h3 className="font-bold text-slate-200 text-sm mb-1">{cleanArchitectureLayers.interface.title}</h3>
            <p className="text-xs text-slate-400 mb-3">{cleanArchitectureLayers.interface.description}</p>
            <div className="flex flex-wrap gap-2">
              {cleanArchitectureLayers.interface.packages.map((pkg) => (
                <span 
                  key={pkg}
                  className={`text-xs font-mono px-2 py-1 rounded transition-all flex items-center gap-1.5 ${
                    pkg === activePackage 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold' 
                      : 'bg-slate-900/80 text-slate-500 border border-slate-800'
                  }`}
                >
                  {pkg === activePackage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {pkg}
                </span>
              ))}
            </div>
          </motion.div>

          {/* domain layer */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="border border-emerald-500/20 bg-emerald-950/5 rounded-xl p-5 relative group"
          >
            <div className="absolute inset-0 bg-emerald-500/[0.01] rounded-xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-900/50">Core Domain</span>
                <Cpu className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="font-bold text-slate-100 text-sm mb-1">{cleanArchitectureLayers.core.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{cleanArchitectureLayers.core.description}</p>
              <div className="flex flex-wrap gap-2">
                {cleanArchitectureLayers.core.packages.map((pkg) => (
                  <span 
                    key={pkg}
                    className={`text-xs font-mono px-2 py-1 rounded transition-all flex items-center gap-1.5 ${
                      pkg === activePackage 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold' 
                        : 'bg-slate-900/80 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {pkg === activePackage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />}
                    {pkg}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* infrastructure layer */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="border border-slate-800 bg-slate-950/60 rounded-xl p-5 relative group"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Data & Infrastructure</span>
              <Database className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <h3 className="font-bold text-slate-200 text-sm mb-1">{cleanArchitectureLayers.infrastructure.title}</h3>
            <p className="text-xs text-slate-400 mb-3">{cleanArchitectureLayers.infrastructure.description}</p>
            <div className="flex flex-wrap gap-2">
              {cleanArchitectureLayers.infrastructure.packages.map((pkg) => (
                <span 
                  key={pkg}
                  className={`text-xs font-mono px-2 py-1 rounded transition-all flex items-center gap-1.5 ${
                    pkg === activePackage 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold' 
                      : 'bg-slate-900/80 text-slate-500 border border-slate-800'
                  }`}
                >
                  {pkg === activePackage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {pkg}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Independent domain layer ensures zero dependency on frameworks or DB.</span>
        </div>
      </div>
    </div>
  );
}

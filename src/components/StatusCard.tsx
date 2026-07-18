import React from 'react';
import { CheckCircle2, Circle, ArrowRight, Play, Loader2 } from 'lucide-react';

interface Props {
  currentStep: string;
}

const packagesSequence = [
  { id: 'entity', name: 'entity', desc: 'JPA entities & 3NF database layout', status: 'completed' },
  { id: 'repository', name: 'repository', desc: 'Spring Data JPA repositories', status: 'pending' },
  { id: 'dto', name: 'dto', desc: 'Request/Response Data Transfer Objects', status: 'pending' },
  { id: 'mapper', name: 'mapper', desc: 'MapStruct / DTO-entity conversion', status: 'pending' },
  { id: 'validation', name: 'validation', desc: 'Custom bean validators & constraint rules', status: 'pending' },
  { id: 'exception', name: 'exception', desc: 'Global exception handler & API error codes', status: 'pending' },
  { id: 'config', name: 'config', desc: 'CORS, Auditing, and App Beans config', status: 'pending' },
  { id: 'security', name: 'security', desc: 'JWT validation & Spring Security context', status: 'pending' },
  { id: 'service', name: 'service', desc: 'Business services implementation & TX rules', status: 'pending' },
  { id: 'controller', name: 'controller', desc: 'REST Controllers & API route schemas', status: 'pending' },
];

export default function StatusCard({ currentStep }: Props) {
  return (
    <div id="status-card-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] tracking-wider uppercase text-emerald-400 font-bold font-mono">Generation Flow Tracker</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight mb-1">Clean Architecture Workflow</h2>
          <p className="text-xs text-slate-400 mb-6">Following strict package-by-package generation directives without skipping layers.</p>

          <div className="space-y-3.5">
            {packagesSequence.map((pkg, idx) => {
              const isCompleted = pkg.id === 'entity';
              const isCurrent = pkg.id === currentStep;

              return (
                <div 
                  key={pkg.id} 
                  className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                    isCompleted 
                      ? 'bg-emerald-950/20 border-emerald-500/30' 
                      : isCurrent 
                      ? 'bg-cyan-950/20 border-cyan-500/30 ring-1 ring-cyan-500/20' 
                      : 'bg-slate-950/20 border-slate-900/60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-700" />
                    )}
                  </div>

                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold ${
                        isCompleted ? 'text-slate-200' : isCurrent ? 'text-cyan-300' : 'text-slate-500'
                      }`}>
                        {pkg.name}
                      </span>
                      <span className="text-[9px] font-mono text-slate-600 font-medium">Layer {idx + 1}</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${
                      isCompleted ? 'text-slate-400' : isCurrent ? 'text-cyan-400/80' : 'text-slate-600'
                    }`}>
                      {pkg.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 bg-slate-950/40 -mx-6 -mb-6 p-6 rounded-b-2xl">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5">
            <h4 className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Package Completed!
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              We completed <strong>package #1: entity</strong> with all 13 mapped schemas in strict 3NF layout. Ready for <strong>package #2: repository</strong> when you request to continue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

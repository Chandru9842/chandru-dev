import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileCode2, Copy, Check, FolderGit2, ArrowRight, CornerDownRight, Code2 } from 'lucide-react';
import { packagesList, CodeFile } from '../data/backendCode';

export default function CodeExplorer() {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(packagesList[0].files[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="code-explorer-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FolderGit2 className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">Active Package Code Explorer</h2>
            <p className="text-xs text-slate-400">Layer 1: Enterprise Spring Boot JPA & Hibernate entities</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            com.portfolio.cms.entity
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* file tree sidebar */}
        <div className="xl:col-span-4 bg-slate-950 border border-slate-800/80 rounded-xl p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3 font-semibold px-1">Files in package</div>
          <div className="space-y-1">
            {packagesList[0].files.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-2.5 group ${
                    isSelected 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-medium' 
                      : 'bg-transparent border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <div className="truncate">
                    <div className="font-semibold">{file.name}</div>
                    <div className="text-[9px] text-slate-600 truncate mt-0.5">{file.path}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* code content and details panel */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col h-[500px]">
            {/* code editor header */}
            <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">{selectedFile.name}</span>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* code content */}
            <div className="p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed grow custom-scrollbar bg-slate-950 select-text">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>

          {/* code explanation block */}
          <div className="bg-emerald-950/15 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3.5">
            <Code2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-mono font-bold text-emerald-300 mb-1">Architectural Review • com.portfolio.cms.entity</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedFile.explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

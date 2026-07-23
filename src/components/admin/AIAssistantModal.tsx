import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Bot, X, Check, Copy, RefreshCw, Wand2, ArrowRight, ShieldCheck, FileText, UserCheck } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText?: (text: string) => void;
  initialPrompt?: string;
  initialContext?: string;
  targetField?: string;
}

export default function AIAssistantModal({
  isOpen,
  onClose,
  onApplyText,
  initialPrompt = '',
  initialContext = '',
  targetField = 'Content'
}: AIAssistantModalProps) {
  const [contentType, setContentType] = useState<'hero' | 'about' | 'bio' | 'project' | 'skills' | 'experience' | 'achievement' | 'rewrite'>('about');
  const [tone, setTone] = useState<'Professional' | 'Student' | 'Recruiter Friendly' | 'ATS Friendly' | 'Creative' | 'Concise'>('Professional');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [existingText, setExistingText] = useState(initialContext);
  const [generatedResult, setGeneratedResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const quickTemplates = [
    { label: 'Generate Hero Tagline', type: 'hero', prompt: 'Senior Full Stack & Cloud Architect with 6+ years experience in Node, React & Microservices' },
    { label: 'Generate About Me', type: 'about', prompt: 'Passionate software engineer specializing in scalable enterprise apps, cloud platforms, and developer experience' },
    { label: 'Generate Project Description', type: 'project', prompt: 'High-throughput microservices gateway built with Node.js, Docker, Kubernetes, and Redis caching' },
    { label: 'Generate Skills Summary', type: 'skills', prompt: 'Expertise in TypeScript, React, Go, PostgreSQL, AWS, Docker, CI/CD, System Architecture' },
    { label: 'ATS-Friendly Experience', type: 'experience', prompt: 'Led team of 5 engineers to modernize legacy monolithic architecture to cloud-native microservices, increasing reliability by 99.99%' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          tone,
          prompt,
          existingText
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setGeneratedResult(data.result || '');
    } catch (err: any) {
      console.error("AI Generation error:", err);
      setErrorMsg(err.message || 'An error occurred while generating content. Please check AI setup.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (generatedResult && onApplyText) {
      onApplyText(generatedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  Enterprise AI Portfolio Copilot
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    Gemini 3.6 Flash
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Target: <span className="text-emerald-400 font-bold">{targetField}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Quick Templates */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quick AI Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {quickTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setContentType(tpl.type as any);
                      setPrompt(tpl.prompt);
                    }}
                    className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-emerald-500/10 hover:border-emerald-500/40 border border-slate-700/60 text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3 text-emerald-400" />
                    <span>{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type & Tone Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="about">About Section</option>
                  <option value="hero">Hero Tagline / Headline</option>
                  <option value="bio">Executive Bio</option>
                  <option value="project">Project Description</option>
                  <option value="skills">Skills & Technical Summary</option>
                  <option value="experience">Experience Highlight</option>
                  <option value="achievement">Key Achievement / Award</option>
                  <option value="rewrite">Rewrite / Polish Existing Text</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tone & Target Audience
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Professional">Professional & Corporate</option>
                  <option value="Recruiter Friendly">Recruiter Friendly (Punchy)</option>
                  <option value="ATS Friendly">ATS Friendly (Keywords Focused)</option>
                  <option value="Student">Student / Academic / Enthusiastic</option>
                  <option value="Creative">Creative & Visionary</option>
                  <option value="Concise">Concise & Bulleted</option>
                </select>
              </div>
            </div>

            {/* Input Prompt / Context */}
            {contentType === 'rewrite' && (
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Existing Text to Polish
                </label>
                <textarea
                  value={existingText}
                  onChange={(e) => setExistingText(e.target.value)}
                  rows={3}
                  placeholder="Paste existing bio, project description, or bullet point here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Instructions / Key Details to Include
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Mention specific tech stack, metrics, achievements, or career goals..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-mono text-rose-400">
                {errorMsg}
              </div>
            )}

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt && !existingText)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Enterprise Copy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Content with Gemini AI</span>
                </>
              )}
            </button>

            {/* Generated Result Output */}
            {generatedResult && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    Generated AI Result
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 transition"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                    {onApplyText && (
                      <button
                        type="button"
                        onClick={handleApply}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply to {targetField}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-xl text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {generatedResult}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

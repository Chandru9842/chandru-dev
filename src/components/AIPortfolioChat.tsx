import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, MessageSquare, X, Send, Bot, User, RefreshCw, 
  ChevronDown, ExternalLink, Mail, FileText, Code2, ArrowRight, CornerDownLeft
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

const SUGGESTED_PROMPTS = [
  "What are Chandru's top scaled projects?",
  "Tell me about his backend & distributed systems skills",
  "How can I contact Chandru for an interview?",
  "Summarize his full tech stack in 60 seconds"
];

export default function AIPortfolioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `👋 Hi there! I'm **Chandru's AI Career Assistant**.\n\nI can answer any questions about Chandru's **projects, tech stack, career background, and availability for software engineering roles**.\n\nWhat would you like to know?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/portfolio-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          messages: messages.concat(userMessage).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply || "I'd be glad to help! Feel free to reach out directly to Chandru at chandrumohan550@gmail.com.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'gemini'
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('API response failed');
      }
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `**Chandru's Core Background:**\n\nChandru is a **Principal Systems Architect & Full-Stack Engineer** specializing in **React 19, TypeScript, Node.js, Spring Boot, and Cloud Architectures**.\n\n* **Direct Email:** [chandrumohan550@gmail.com](mailto:chandrumohan550@gmail.com)\n* Feel free to submit an inquiry through the Contact Form!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'fallback'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `👋 Chat reset! Ask me anything about Chandru's engineering background or project portfolio.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini'
      }
    ]);
  };

  // Helper to format basic markdown (bold, links, bullet points)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          // Bullet point
          if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const content = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{renderInlineStyles(content)}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineStyles(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineStyles = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-emerald-300">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-slate-900 border border-slate-800 text-emerald-300 font-mono text-[11px] px-1.5 py-0.5 rounded">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const linkText = part.substring(1, part.indexOf(']('));
        const url = part.substring(part.indexOf('](') + 2, part.length - 1);
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-medium inline-flex items-center gap-0.5"
          >
            {linkText}
            <ExternalLink className="w-3 h-3 inline ml-0.5" />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Launcher Button */}
      <div className="fixed bottom-6 right-6 md:right-20 z-[90] flex items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 cursor-pointer ${
            isOpen 
              ? 'bg-slate-900 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20 ring-2 ring-emerald-500/20' 
              : 'bg-gradient-to-r from-slate-950/90 via-slate-900/95 to-slate-950/90 hover:from-emerald-950/60 hover:to-slate-900/95 border-emerald-500/30 hover:border-emerald-400/60 text-slate-100 shadow-emerald-500/10'
          }`}
          aria-label="Ask Chandru's AI Career Assistant"
        >
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wide">
            {isOpen ? 'Close AI Chat' : "Ask Chandru's AI"}
          </span>
        </motion.button>
      </div>

      {/* Interactive AI Chat Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-20 right-4 sm:right-6 md:right-20 z-[95] w-[calc(100vw-2rem)] sm:w-[420px] max-h-[580px] h-[82vh] bg-slate-950/95 border border-slate-800/90 shadow-2xl shadow-emerald-950/40 rounded-3xl flex flex-col overflow-hidden backdrop-blur-2xl text-slate-100 font-sans"
          >
            {/* Top Glow Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Chandru's AI Assistant
                    <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold">
                      Gemini 2.5
                    </span>
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Online • Grounded in Portfolio Data
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 border ${
                      isUser 
                        ? 'bg-slate-800 border-slate-700 text-slate-300' 
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[82%] rounded-2xl p-3.5 shadow-sm ${
                      isUser 
                        ? 'bg-gradient-to-tr from-emerald-600 to-emerald-500 text-slate-950 font-medium rounded-tr-none' 
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      {isUser ? (
                        <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        renderFormattedText(msg.content)
                      )}

                      <div className={`mt-1.5 flex items-center gap-1.5 text-[9px] font-mono ${
                        isUser ? 'text-emerald-950/70 justify-end' : 'text-slate-500 justify-start'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {!isUser && msg.source && (
                          <span className="text-[8px] uppercase tracking-wider text-emerald-500/60">• {msg.source}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator while generating */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-slate-400 text-xs pl-9"
                >
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 py-2 px-3 rounded-2xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 animate-pulse">Analyzing portfolio context...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300 text-[10px] font-mono whitespace-nowrap transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-slate-900/80 border-t border-slate-800/80 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about projects, skills, or hiring..."
                disabled={isLoading}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition focus:ring-1 focus:ring-emerald-500/20 font-sans"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition shadow-md shadow-emerald-500/10 cursor-pointer shrink-0"
                title="Send message"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-4 h-4 text-slate-950" />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

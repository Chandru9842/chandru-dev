import React, { useState, useMemo } from 'react';
import { 
  Search, Star, Trash2, MailOpen, Mail, Clock, ArrowLeft, ArrowRight,
  AlertCircle, Check, ShieldAlert, Reply, Archive, ChevronRight
} from 'lucide-react';
import { MessageItem } from '../../data/cmsMockData';

interface MessagesPageProps {
  messages: MessageItem[];
  onToggleRead: (id: number) => Promise<void>;
  onToggleStar: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function MessagesPage({ messages, onToggleRead, onToggleStar, onDelete }: MessagesPageProps) {
  const [selectedMsgId, setSelectedMsgId] = useState<number | null>(messages[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter messages
  const filteredMsgs = useMemo(() => {
    return messages.filter(m => 
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.senderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.messageContent.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  // Paginated inbox
  const paginatedMsgs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMsgs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMsgs, currentPage]);

  const totalPages = Math.ceil(filteredMsgs.length / itemsPerPage) || 1;

  // Find currently active reading message
  const activeMessage = useMemo(() => {
    return messages.find(m => m.id === selectedMsgId) || null;
  }, [messages, selectedMsgId]);

  const handleSelectMessage = (id: number) => {
    setSelectedMsgId(id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.isRead) {
      onToggleRead(id);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Inbox Messages</h2>
          <p className="text-xs text-slate-400">Review, star, and archive job inquiries, feedback packets, and project invitations.</p>
        </div>
      </div>

      {/* Main split dashboard panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Messages List (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Inbox Search toolbar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              placeholder="Filter messages..."
            />
          </div>

          {/* Inbox card container */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            {filteredMsgs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-300">No Messages</h4>
                <p className="text-xs text-slate-500 mt-1">Inbox folder is pristine and empty.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {paginatedMsgs.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg.id)}
                    className={`p-4 cursor-pointer text-left transition-all relative ${
                      selectedMsgId === msg.id 
                        ? 'bg-slate-950/80 border-l-2 border-emerald-500' 
                        : 'hover:bg-slate-950/30'
                    }`}
                  >
                    {/* Unread marker dot */}
                    {!msg.isRead && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}

                    <div className="flex justify-between items-start gap-2 pr-4">
                      <h4 className={`text-xs truncate ${!msg.isRead ? 'font-bold text-slate-100' : 'text-slate-300'}`}>
                        {msg.senderName}
                      </h4>
                      <span className="text-[9px] font-mono text-slate-500 tracking-tighter shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{msg.senderEmail}</p>
                    <p className={`text-xs mt-1.5 truncate ${!msg.isRead ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>
                      {msg.subject}
                    </p>
                    
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 leading-normal">
                      {msg.messageContent}
                    </p>

                    {/* Star toggle indicator inside card */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/35">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(msg.id);
                        }}
                        className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                      
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1 rounded border border-slate-800 hover:bg-slate-900 disabled:opacity-40 text-slate-500 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1 rounded border border-slate-800 hover:bg-slate-900 disabled:opacity-40 text-slate-500 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reading Pane Details (Col 7) */}
        <div className="lg:col-span-7">
          {activeMessage ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleStar(activeMessage.id)}
                    className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-amber-400 transition-all"
                    title="Toggle Starred"
                  >
                    <Star className={`w-4 h-4 ${activeMessage.isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => onToggleRead(activeMessage.id)}
                    className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
                    title={activeMessage.isRead ? "Mark as Unread" : "Mark as Read"}
                  >
                    {activeMessage.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm("Permanently purge this message log record?")) {
                        onDelete(activeMessage.id);
                        setSelectedMsgId(messages.find(m => m.id !== activeMessage.id)?.id || null);
                      }
                    }}
                    className="p-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/25 rounded-xl text-rose-400 transition-all"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Header info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/30 p-4 border border-slate-800/80 rounded-xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{activeMessage.senderName}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{activeMessage.senderEmail}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(activeMessage.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Subject Title</span>
                <h4 className="text-sm font-bold text-slate-200">{activeMessage.subject}</h4>
              </div>

              {/* Content Body */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Message Content Body</span>
                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/60 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activeMessage.messageContent}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <a
                  href={`mailto:${activeMessage.senderEmail}?subject=Re: ${activeMessage.subject}`}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-2 transition-all"
                >
                  <Reply className="w-3.5 h-3.5 text-slate-400" />
                  Reply via Email
                </a>
                <button
                  onClick={() => {
                    alert(`Simulated Archive completed successfully for message ID: ${activeMessage.id}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Quick Archive
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-16 text-center text-slate-600">
              <Mail className="w-10 h-10 mx-auto mb-3 stroke-[1.2]" />
              <p className="text-xs font-mono">Select a message from the list pane to load reading view.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

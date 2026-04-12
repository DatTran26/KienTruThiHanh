'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, Zap } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AiChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: 'Chào Admin, Hệ thống Trí tuệ Nhân tạo nội bộ đã sẵn sàng. Bạn muốn tra cứu công văn, kiểm tra nhóm mục chi phí hay phân tích biến động dòng tiền hôm nay?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 150); // slight delay for animation
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    // Simulated delay for demo
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'AI Engine đang trong kỉ nguyên Beta. Tôi đang được nạp hàng vạn trang thông tư nghị định để có thể hỗ trợ bạn tốt nhất trong tương lai!' 
      }]);
      setLoading(false);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="mb-5 w-[400px] h-[600px] pointer-events-auto bg-white/70 backdrop-blur-3xl rounded-[28px] shadow-[0_20px_80px_-15px_rgba(0,0,0,0.2)] border border-white/80 overflow-hidden flex flex-col animate-in slide-in-from-bottom-12 fade-in zoom-in-95 duration-500 origin-bottom-right">
          
          {/* Advanced Glass Header */}
          <div className="relative px-6 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 overflow-hidden">
            {/* Ambient Glowing Orbs in Header */}
            <div className="absolute top-[-30px] right-[-20px] w-32 h-32 bg-indigo-500 rounded-full blur-[45px] opacity-40 animate-pulse"></div>
            <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-fuchsia-600 rounded-full blur-[40px] opacity-30"></div>
            
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="relative size-11 rounded-full p-[1px] bg-gradient-to-b from-indigo-400 to-indigo-900 shadow-lg shadow-indigo-500/30">
                <div className="absolute inset-0 rounded-full bg-slate-900/50 backdrop-blur-sm"></div>
                <div className="relative h-full w-full rounded-full bg-slate-900 flex items-center justify-center border border-white/5">
                  <div className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-400 border-[2.5px] border-slate-900 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                  <Bot className="size-5 text-indigo-400" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <h3 className="text-[15px] font-extrabold text-white tracking-wide flex items-center gap-2">
                  Aurora AI <Sparkles className="size-3.5 text-amber-300" />
                </h3>
                <div className="flex items-center gap-1.5 opacity-80 text-[11px] mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-slate-300 font-medium tracking-wider uppercase">System Active</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="relative z-10 size-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-all hover:rotate-90"
            >
              <X className="size-4.5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Message List (Glassy Area) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth bg-gradient-to-b from-slate-50/50 to-slate-100/30 relative">
            {/* Background watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
              <Bot className="size-64" />
            </div>

            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`relative z-10 flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 fade-in duration-300`}
              >
                <div className="size-8 shrink-0 rounded-full flex items-center justify-center shadow-sm"
                     style={{ 
                       background: msg.role === 'assistant' ? 'linear-gradient(135deg, #eef2ff, #e0e7ff)' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                       border: '1px solid rgba(255,255,255,0.8)'
                     }}
                >
                  {msg.role === 'assistant' 
                    ? <Zap className="size-4 text-indigo-600" />
                    : <span className="font-bold text-slate-500 text-[10px] uppercase">You</span>
                  }
                </div>
                
                <div className={`p-4 text-[13.5px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/20 shadow-lg border border-indigo-400/30'
                    : 'bg-white/80 backdrop-blur-md border border-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-slate-700 rounded-2xl rounded-tl-sm font-medium'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="relative z-10 flex gap-3 max-w-[85%] animate-in fade-in duration-300">
                <div className="size-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 border border-white flex items-center justify-center shadow-sm">
                  <Zap className="size-4 text-indigo-600" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white shadow-sm text-slate-500 rounded-tl-sm flex items-center gap-1.5 h-[52px]">
                  <div className="flex gap-1.5">
                    <span className="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="size-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="size-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Advanced Input Area */}
          <div className="p-4 bg-white/60 backdrop-blur-xl border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0">
            <div className="relative flex items-center max-w-full group">
              {/* Outer glow on focus-within */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-[20px] opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-300"></div>
              
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tra cứu nghiệp vụ, hỏi AI..."
                className="relative w-full h-[52px] pl-5 pr-14 rounded-[18px] bg-white border border-slate-200/80 text-[14px] outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 text-slate-700 placeholder:text-slate-400 font-medium transition-all shadow-sm"
                disabled={loading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 size-10 rounded-[14px] bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 disabled:opacity-50 disabled:hover:from-indigo-600 disabled:hover:to-violet-500 flex items-center justify-center text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 ml-0.5" />}
              </button>
            </div>
            
            <div className="flex justify-center items-center gap-1.5 mt-3">
              <Sparkles className="size-3 text-indigo-400" />
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-[0.15em]">
                AI Engine - KienTruThiHanh
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Fancy Toggler Pill Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto group relative flex items-center gap-3 h-14 pl-2 pr-6 rounded-full transition-all duration-500 shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.4)] hover:-translate-y-1 overflow-hidden"
        >
          {/* Rotating gradient border trick */}
          <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#c4b5fd_0%,#4f46e5_50%,#c4b5fd_100%)] animate-[spin_3s_linear_infinite]" />
          
          {/* Inner dark pill base */}
          <div className="absolute inset-[2px] bg-slate-900 rounded-full" />

          {/* Button content (z-10) */}
          <div className="relative z-10 flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-inner border border-white/20">
             <Bot className="size-5 text-white animate-pulse" />
          </div>
          
          <div className="relative z-10 flex flex-col items-start leading-tight">
            <span className="text-white text-[13px] font-bold tracking-wide">Trợ lý AI</span>
            <span className="text-indigo-200 text-[10px] font-medium tracking-wider uppercase flex items-center gap-1">
               <span className="size-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online
            </span>
          </div>

          {/* Hover glow overlay */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors z-10 rounded-full" />
        </button>
      )}

    </div>
  );
}

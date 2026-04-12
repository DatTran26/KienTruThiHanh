'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, MessageCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AiChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: 'Xin chào! Tôi là Trợ lý AI nội bộ. Bạn cần tôi hỗ trợ tra cứu mã mục chi phí, giải thuật dữ liệu hay tư vấn quy trình thanh toán?' 
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
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    // TODO: Connect this to an actual API route in the future
    // Simulated delay for demo
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Tính năng trả lời AI hiện đang trong quá trình huấn luyện bằng dữ liệu nghị định nội bộ. Vui lòng quay lại sau nhé!' 
      }]);
      setLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[550px] bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-200/60 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center p-0.5 relative">
                <div className="absolute -top-1 -right-1 size-3.5 rounded-full bg-emerald-400 border-2 border-indigo-600"></div>
                <Bot className="size-5 text-white" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-white tracking-wide">Trợ lý AI</h3>
                <div className="flex items-center gap-1 opacity-90 text-[10px]">
                  <Sparkles className="size-3 text-amber-300" />
                  <span className="text-indigo-100 font-medium tracking-wider uppercase">Sẵn sàng phân tích</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="size-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 space-y-5 scroll-smooth">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className="size-8 shrink-0 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: msg.role === 'assistant' ? '#eef2ff' : '#f1f5f9' }}
                >
                  {msg.role === 'assistant' 
                    ? <Bot className="size-4 text-indigo-600" />
                    : <span className="font-bold text-slate-500 text-[11px] leading-none uppercase">You</span>
                  }
                </div>
                
                <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-sm font-medium'
                    : 'bg-white border border-slate-200/60 text-slate-700 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="size-8 shrink-0 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Bot className="size-4 text-indigo-600" />
                </div>
                <div className="px-4 py-3.5 rounded-2xl bg-white border border-slate-200/60 text-slate-500 rounded-tl-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="relative flex items-center max-w-full">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi AI về mã mục, cách ghi chú..."
                className="w-full h-12 pl-4 pr-12 rounded-2xl bg-slate-50 border border-slate-200 text-[13px] outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 text-slate-700 placeholder:text-slate-400 font-medium transition-all"
                disabled={loading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-1.5 size-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 ml-0.5" />}
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">
                AI có thể mắc sai lầm. Hãy kiểm tra lại thông tin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Toggle Button ── */}
      <button
        onClick={() => setIsOpen(p => !p)}
        className={`relative flex items-center justify-center size-14 rounded-full transition-all duration-300 shadow-xl ${
          isOpen 
            ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rotate-90 scale-90' 
            : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] hover:-translate-y-1'
        }`}
      >
        {isOpen ? (
          <X className="size-6 transition-transform" />
        ) : (
          <>
            <MessageCircle className="size-6 absolute transition-transform" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white"></span>
            </div>
          </>
        )}
      </button>

    </div>
  );
}

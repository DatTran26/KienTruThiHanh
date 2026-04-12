'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, Zap, BrainCircuit, Atom } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AiChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: 'Chào Admin, Hệ thống Trí tuệ Nhân tạo VKS đã sẵn sàng. Bạn muốn tra cứu công văn, kiểm tra nhóm mục chi phí hay phân tích biến động dòng tiền hôm nay?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const currentMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(currentMessages as ChatMessage[]);
    
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages }),
      });

      if (!response.ok) {
        throw new Error('Lỗi kết nối AI Server');
      }

      const data = await response.json();
      if (data && data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        throw new Error('Invalid Response');
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Xin lỗi, kết nối đến Trí tuệ Nhân tạo VKS đang đi qua máy chủ trạm và gặp sự cố. Bạn vui lòng thử lại sau giây lát nhe.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = '56px'; // Reset line height
    e.target.style.height = `${Math.min(e.target.scrollHeight, 104)}px`; // Max 3 lines (104px)
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Overlay Sidebar Chat Window ── */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-[100dvh] w-[460px] max-w-[calc(100vw-16px)] z-50 pointer-events-auto bg-white/70 backdrop-blur-3xl shadow-[-20px_0_80px_-15px_rgba(0,0,0,0.15)] border-l border-white/80 flex flex-col animate-in slide-in-from-right duration-500 sm:rounded-l-[32px]">
          
          {/* Advanced Bright Glass Header */}
          <div className="relative px-7 py-6 bg-gradient-to-r from-indigo-50 to-white/90 border-b border-indigo-100 flex items-center justify-between shrink-0 overflow-hidden sm:rounded-tl-[32px]">
            
            {/* Soft Ambient Orbs */}
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-indigo-300 rounded-full blur-[40px] opacity-40"></div>
            <div className="absolute bottom-[-10px] left-[-20px] w-24 h-24 bg-violet-300 rounded-full blur-[30px] opacity-30"></div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="relative size-14 rounded-full p-[1px] bg-gradient-to-br from-indigo-300 to-violet-400 shadow-lg shadow-indigo-200/50">
                <div className="relative h-full w-full rounded-full bg-white flex items-center justify-center">
                  <div className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-emerald-400 border-[2px] border-white shadow-sm"></div>
                  <Atom className="size-7 text-indigo-600" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <h3 className="text-[18px] font-extrabold text-indigo-950 tracking-tight flex items-center gap-2">
                  Aurora AI
                  <div className="px-2.5 py-0.5 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                    <Sparkles className="size-3.5 text-indigo-500" />
                  </div>
                </h3>
                <div className="flex items-center gap-1.5 text-[12px] mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-600 font-bold tracking-wider uppercase">VKS System Active</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="relative z-10 size-10 rounded-full bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-400 hover:text-indigo-600 transition-all hover:rotate-90 hover:scale-110 shadow-sm border border-indigo-100/50"
            >
              <X className="size-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Message List (Glassy Area) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-7 scroll-smooth bg-gradient-to-b from-slate-50/50 to-slate-100/30 relative">
            {/* Background watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <Atom className="size-80 text-indigo-900 animate-[spin_60s_linear_infinite]" />
            </div>

            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`relative z-10 flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 fade-in duration-300`}
              >
                <div className="size-10 shrink-0 rounded-full flex items-center justify-center shadow-sm"
                     style={{ 
                       background: msg.role === 'assistant' ? 'linear-gradient(135deg, #eef2ff, #c7d2fe)' : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                       border: '2px solid rgba(255,255,255,0.9)'
                     }}
                >
                  {msg.role === 'assistant' 
                    ? <Atom className="size-5 text-indigo-700" />
                    : <span className="font-bold text-slate-500 text-[11px] uppercase">You</span>
                  }
                </div>
                
                <div className={`px-5 py-4 text-[14.5px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'whitespace-pre-wrap bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white rounded-[20px] rounded-tr-[4px] shadow-indigo-500/20 shadow-lg border border-indigo-400/30 font-medium'
                    : 'bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] text-slate-700 rounded-[20px] rounded-tl-[4px] font-medium'
                }`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-2.5 last:mb-0" {...props}/>,
                        strong: ({node, ...props}) => <strong className="font-bold text-indigo-950" {...props}/>,
                        h1: ({node, ...props}) => <h1 className="text-lg font-extrabold text-indigo-950 mt-4 mb-2" {...props}/>,
                        h2: ({node, ...props}) => <h2 className="text-base font-extrabold text-indigo-950 mt-4 mb-2" {...props}/>,
                        h3: ({node, ...props}) => <h3 className="text-[15px] font-bold text-indigo-950 mt-3 mb-1.5" {...props}/>,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1 marker:text-indigo-400" {...props}/>,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1 marker:text-indigo-400" {...props}/>,
                        li: ({node, ...props}) => <li className="pl-0.5 leading-relaxed" {...props}/>,
                        code: ({node, ref, ...props}: any) => {
                          const isInline = !props.className?.includes('language-');
                          return isInline 
                            ? <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[13px] font-mono border border-indigo-100/50" {...props}/> 
                            : <pre className="p-3 bg-slate-900 text-slate-50 rounded-xl max-w-full overflow-x-auto text-[13px] font-mono leading-normal shadow-inner my-3"><code {...props}/></pre>;
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="relative z-10 flex gap-4 max-w-[85%] animate-in fade-in duration-300">
                <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-white flex items-center justify-center shadow-sm">
                  <Atom className="size-5 text-indigo-600" />
                </div>
                <div className="px-5 py-4 rounded-[20px] bg-white/95 backdrop-blur-md border border-slate-100 shadow-sm text-slate-500 rounded-tl-[4px] flex items-center gap-1.5 h-[56px]">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="size-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="size-2.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Advanced Input Area */}
          <div className="px-6 py-6 pb-8 bg-white backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] shrink-0 sm:rounded-bl-[32px]">
            <div className="relative flex items-center max-w-full group">
              {/* Outer glow on focus-within */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-300 to-violet-300 rounded-[22px] opacity-0 group-focus-within:opacity-50 blur transition-opacity duration-300"></div>
              
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Tra cứu nghiệp vụ, hỏi AI..."
                className="relative w-full min-h-[56px] max-h-[104px] py-[16px] pl-6 pr-16 rounded-[20px] bg-slate-50 border-2 border-slate-100 focus:bg-white text-[15px] outline-none focus:border-indigo-400 text-slate-700 placeholder:text-slate-400 font-semibold transition-all shadow-sm resize-none overflow-y-auto leading-[24px]"
                disabled={loading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2.5 size-11 rounded-[16px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5 ml-0.5" />}
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-3.5 px-1">
              <div className="flex items-center gap-1.5 opacity-80">
                <Sparkles className="size-3.5 text-indigo-400" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
                  AI ENGINE - VKS
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                <kbd className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/60 font-sans text-[10px] font-bold shadow-sm">Shift</kbd>
                <span className="text-amber-500/80">+</span>
                <kbd className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/60 font-sans text-[10px] font-bold shadow-sm">Enter</kbd>
                <span className="text-amber-500/80 ml-0.5">để xuống dòng</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Fancy Toggler Pill Button ── */}
      {!isOpen && (
        <div className="fixed bottom-[110px] right-6 z-50 flex flex-col items-end pointer-events-none">
          <button
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto group relative flex items-center gap-3.5 h-[62px] pl-2.5 pr-7 rounded-full transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.3)] hover:-translate-y-1.5 overflow-hidden border border-slate-800/10"
          >
            {/* Background colors */}
            <div className="absolute inset-0 bg-slate-900" />
            
            {/* Subtle slow rotating gradient border trick */}
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_90deg_at_50%_50%,#818cf8_0%,#312e81_50%,#818cf8_100%)] animate-[spin_4s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-[2.5px] bg-slate-900 rounded-full" />

            {/* Button icon content (z-10) */}
            <div className="relative z-10 flex items-center justify-center size-[46px] rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-inner border border-white/20">
              <BrainCircuit className="size-6 text-white group-hover:animate-pulse" />
            </div>
            
            <div className="relative z-10 flex flex-col items-start leading-tight">
              <span className="text-white text-[15px] font-extrabold tracking-wide">Trợ lý AI</span>
              <span className="text-emerald-400 text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5">
                <span className="size-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span> Online
              </span>
            </div>
          </button>
        </div>
      )}
    </>
  );
}

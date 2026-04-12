'use client';
import { useState } from 'react';

import type { AnalysisResult } from '@/types/analysis';
import { Plus, ChevronRight, Info, TrendingUp } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
  isBest?: boolean;
  onAddToReport?: (result: AnalysisResult) => void;
  originalDesc?: string;
  variant?: 'card' | 'list-item';
}

export function ResultCard({ result, isBest = false, onAddToReport, originalDesc, variant = 'card' }: ResultCardProps) {
  const [showReason, setShowReason] = useState(false);
  const pct = Math.round((result.confidence ?? 0) * 100);
  const isHigh = pct >= 85;
  const isMid  = pct >= 60;

  const statusText  = isHigh ? 'Cao' : isMid ? 'Vừa' : 'Thấp';
  const statusColor = isHigh ? 'text-emerald-600' : isMid ? 'text-amber-600' : 'text-red-600';
  const ringColor   = isHigh ? 'stroke-emerald-500' : isMid ? 'stroke-amber-500' : 'stroke-red-500';
  const badgeBg     = isHigh ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : isMid  ? 'bg-amber-50 border-amber-200 text-amber-700'
                    :          'bg-red-50 border-red-200 text-red-700';

  return (
    <div
      className={`relative transition-all duration-300 group ${
        variant === 'card'
          ? `rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xl border ${
              isBest 
                ? 'border-indigo-300/60 ring-4 ring-indigo-500/10 shadow-[0_8px_40px_-12px_rgba(99,102,241,0.3)]' 
                : 'border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_25px_-5px_rgba(15,23,42,0.08)]'
            }`
          : 'bg-transparent'
      }`}
    >
      {/* Background ambient glow if best match */}
      {isBest && (
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
      )}

      {/* Transaction Context Strip */}
      {originalDesc && (
        <div className="relative px-5 py-3 border-b border-indigo-100/60 bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-white backdrop-blur-sm flex items-center gap-3">
          <div className="size-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
          <p className="text-[13px] text-slate-800 leading-tight block">
            <span className="font-medium text-slate-500 uppercase tracking-wider text-[10px] mr-2">Khoản chi đã bóc tách</span>
            <span className="font-extrabold text-indigo-900 tracking-tight">"{originalDesc}"</span>
          </p>
        </div>
      )}

      {/* Codes Header */}
      <div className="relative flex border-b border-slate-200/50 bg-white/40 group/tree cursor-help z-10 hover:z-50">
        <div className="flex-1 flex flex-wrap gap-2.5 items-center px-5 py-3.5">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold bg-white/80 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-sm shrink-0">
            <span className="text-slate-400">MỤC</span>
            <span className="text-slate-800">{result.groupCode}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold bg-indigo-50/80 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100/80 shadow-sm shrink-0">
            <span className="text-indigo-400">TIỂU MỤC</span>
            <span className="text-indigo-800 font-extrabold">{result.subCode}</span>
          </div>
        </div>

        {/* Tree popup */}
        <div className="absolute left-[130px] top-full mt-2 w-[320px] sm:w-[400px] p-4 bg-[#14182B] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-[#1E2442] opacity-0 invisible group-hover/tree:opacity-100 group-hover/tree:visible transition-all duration-300 z-50 pointer-events-none scale-95 group-hover/tree:scale-100 origin-top">
          <div className="absolute left-1/2 -translate-x-1/2 top-[-6px] w-3 h-3 bg-[#14182B] border-[#1E2442] border-l border-t rotate-45" />
          <div className="flex items-center gap-2 mb-3 px-1">
             <Info className="size-3.5 text-indigo-400" />
             <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Worktree Phân loại</span>
          </div>
          <div className="flex flex-col text-[12px] font-sans px-1 text-left">
            <div className="flex items-start gap-2">
              <div className="mt-1.5 size-1.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              <div>
                <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded mr-1.5 leading-none">{result.groupCode}</span>
                <span className="text-slate-300 font-medium leading-tight">{result.groupTitle}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 ml-[3px] border-l border-slate-700 pl-[15px] pb-1 pt-2">
              <div className="mt-1.5 size-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)] -ml-[19.5px]" />
              <div className="flex flex-col gap-1 w-full">
                 <div>
                   <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-1 rounded mr-1.5 leading-none">{result.subCode}</span>
                   <span className="text-white font-bold leading-tight">{result.subTitle}</span>
                 </div>
                 {result.description && (
                   <div className="mt-1.5 text-[11px] text-slate-400 font-normal leading-relaxed border-t border-slate-700/60 pt-2 whitespace-pre-line line-clamp-[8]">
                     <strong className="text-slate-300 font-medium block mb-1">Nội dung bao gồm:</strong>
                     {result.description}
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Circular Meter */}
        <div className="px-5 shrink-0 border-l border-slate-200/50 flex items-center justify-center py-3 bg-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative size-[46px] flex items-center justify-center">
              <svg viewBox="0 0 44 44" className="absolute inset-0 size-full -rotate-90">
                <circle cx="22" cy="22" r="19" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-100" />
                <circle cx="22" cy="22" r="19" fill="none" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="119.38"
                  strokeDashoffset={`${119.38 - (119.38 * pct / 100)}`}
                  className={`${ringColor} ${isHigh ? 'drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]' : ''}`}
                />
              </svg>
              <span className={`text-[12px] font-extrabold ${statusColor}`}>{pct}%</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Xác suất</span>
              <span className={`text-[12px] font-black uppercase tracking-widest ${statusColor}`}>{statusText}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative p-5 sm:p-6 space-y-4">
        
        {/* Titles */}
        <div>
          <p className={`leading-snug mb-2 text-slate-900 ${isBest ? 'text-[17px] font-black tracking-tight' : 'text-[15px] font-extrabold tracking-tight'}`}>
            {result.subTitle}
          </p>
          <div className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 text-slate-400" />
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{result.groupTitle}</p>
          </div>
        </div>

        {/* AI Reason */}
        {result.reason && (
          <div className="mt-4">
            <button
              onClick={() => setShowReason(prev => !prev)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-500 hover:text-indigo-600 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-indigo-50/50"
            >
              <Info className="size-3.5" />
              Cơ sở suy luận AI
              <ChevronRight className={`size-3.5 ml-auto transition-transform duration-200 ${showReason ? 'rotate-90' : ''}`} />
            </button>
            
            {showReason && (
              <div className="relative mt-2 p-4 rounded-xl bg-gradient-to-br from-slate-50/80 to-white border border-slate-200/60 shadow-inner animate-fade-in-up">
                {isBest && <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-400/40 to-indigo-500/0" />}
                <p className="text-[13px] leading-relaxed font-medium text-slate-600 text-justify">
                  {result.reason}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-200/50">
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Giá trị ghi nhận</span>
            <span className="font-mono text-[15px] text-slate-900 font-black tracking-tight flex items-center gap-1.5">
              <TrendingUp className="size-4 text-emerald-500" />
              {result.amount != null ? `${new Intl.NumberFormat('vi-VN').format(result.amount)} VNĐ` : '---'}
            </span>
          </div>

          {onAddToReport && (
            <button
              onClick={() => onAddToReport(result)}
              className={`px-5 py-2.5 flex items-center justify-center font-bold text-[11px] uppercase tracking-wider transition-all rounded-xl shrink-0 gap-2 ${
                isBest
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 hover:shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)] border border-transparent text-white shadow-md hover:-translate-y-0.5'
                  : 'bg-white border-2 border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
              }`}
            >
              <Plus className="size-3.5" />
              Định danh khoản chi
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

'use client';

import type { AnalysisResult } from '@/types/analysis';

interface ResultCardProps {
  result: AnalysisResult;
  isBest?: boolean;
  onAddToReport?: (result: AnalysisResult) => void;
}

export function ResultCard({ result, isBest = false, onAddToReport }: ResultCardProps) {
  const pct = Math.round((result.confidence ?? 0) * 100);
  const isHigh = pct >= 85;
  const isMid = pct >= 60;
  
  // Use Tailwind classes instead of css vars for better vibrant colors
  const statusClasses = isHigh ? 'text-green-600 bg-green-50/50' : isMid ? 'text-amber-600 bg-amber-50/50' : 'text-red-500 bg-red-50/50';

  return (
    <div className={`overflow-hidden transition-all duration-300 group bg-white rounded-3xl
      ${isBest 
        ? 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-slate-900/5 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgb(0,0,0,0.1)]' 
        : 'border border-slate-200 hover:border-slate-300 hover:shadow-lg'}`}
    >
      
      {/* Target Codes Header */}
      <div className={`flex border-b ${isBest ? 'border-slate-100 bg-white' : 'border-slate-100 bg-slate-50/50'}`}>
        <div className="flex-1 p-3.5 flex gap-2 overflow-x-auto no-scrollbar items-center px-5">
           <span className="font-mono text-[11px] font-bold uppercase bg-slate-100 text-slate-700 px-3 py-1 rounded-full shrink-0">
             Mục: <span className="text-slate-900">{result.groupCode}</span>
           </span>
           <span className="font-mono text-[11px] font-bold uppercase bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 shrink-0 shadow-sm">
             Tiểu mục: <span className="text-blue-900">{result.subCode}</span>
           </span>
        </div>
        
        {/* Confidence Indicator */}
        <div className={`px-5 shrink-0 border-l border-slate-100 flex items-center justify-center ${statusClasses}`} title={`Độ tin cậy: ${pct}%`}>
           <div className="flex flex-col items-center justify-center">
             <span className="text-[9px] font-bold uppercase tracking-widest leading-none mb-1 opacity-70">Xác suất</span>
             <span className="font-mono font-bold text-lg leading-none">{pct}%</span>
           </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        
        {/* Titles */}
        <div>
          <p className={`leading-relaxed mb-1.5 text-slate-900 ${isBest ? 'text-lg font-bold' : 'text-base font-semibold'}`}>
            {result.subTitle}
          </p>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">{result.groupTitle}</p>
          </div>
        </div>

        {/* AI Reason string log */}
        {result.reason && (
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Cơ sở suy luận hệ thống
            </span>
            <p className="text-[13.5px] leading-relaxed text-slate-700 text-justify">
               {result.reason}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4">
           <div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Giá trị phát hiện</span>
             <span className="font-mono text-base text-slate-800 font-extrabold tracking-tight">
               {result.amount != null ? `${new Intl.NumberFormat('vi-VN').format(result.amount)} VNĐ` : '---'}
             </span>
           </div>

           {onAddToReport && (
             <button
               onClick={() => onAddToReport(result)}
               className={`px-5 py-2.5 flex items-center justify-center font-bold text-xs uppercase transition-all rounded-xl shrink-0
                  ${isBest 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
             >
               + Định danh khoản chi
             </button>
           )}
        </div>

      </div>
    </div>
  );
}

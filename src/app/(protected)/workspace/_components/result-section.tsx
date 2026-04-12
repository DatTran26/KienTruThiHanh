'use client';

import { useState, useEffect } from 'react';
import { ResultCard } from './result-card';
import type { AnalysisResponse, AnalysisResult } from '@/types/analysis';
import { AlertTriangle, Zap, ListTree, Receipt, Info, Plus, Save, Pencil, Minus, Check, X } from 'lucide-react';

interface ResultSectionProps {
  response: AnalysisResponse;
  onAddToReport: (result: AnalysisResult | AnalysisResult[]) => void;
}

export function ResultSection({ response, onAddToReport }: ResultSectionProps) {
  const isMulti = response.expenseGroups && response.expenseGroups.length > 1;
  
  const bestItems = response.expenseGroups && response.expenseGroups.length > 0 
    ? response.expenseGroups.map(g => g.bestItem) 
    : [response.results[0]].filter(Boolean);
    
  const alternativeItems = response.expenseGroups && response.expenseGroups.length > 0 
    ? response.expenseGroups.flatMap(g => g.alternatives) 
    : response.results.slice(1);

  const [amounts, setAmounts] = useState<number[]>([]);
  const [showReasons, setShowReasons] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [visibleRows, setVisibleRows] = useState<boolean[]>([]);
  // Draft state — only used during edit mode
  const [draftRows, setDraftRows] = useState<boolean[]>([]);
  const [draftAmounts, setDraftAmounts] = useState<number[]>([]);

  useEffect(() => {
    if (isMulti && response.expenseGroups) {
      const initAmounts = response.expenseGroups.map(g => g.amount || 0);
      const initRows = response.expenseGroups.map(() => true);
      setAmounts(initAmounts);
      setVisibleRows(initRows);
    }
  }, [response, isMulti]);

  // Enter edit mode — snapshot current state into draft
  const handleEnterEditMode = () => {
    setDraftRows([...visibleRows]);
    setDraftAmounts([...amounts]);
    setIsEditMode(true);
  };

  // Cancel — restore snapshot, discard all changes
  const handleCancelEdit = () => {
    setVisibleRows([...draftRows]);
    setAmounts([...draftAmounts]);
    setIsEditMode(false);
  };

  // Delete a row in draft only (doesn't affect real state until saved)
  const handleRemoveRow = (index: number) => {
    setVisibleRows(prev => prev.map((v, i) => i === index ? false : v));
  };

  const handleAmountChange = (index: number, val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    const newAmounts = [...amounts];
    newAmounts[index] = isNaN(num) ? 0 : num;
    setAmounts(newAmounts);
  };

  const handleSaveAll = () => {
    if (isMulti && response.expenseGroups) {
      const itemsToSave = response.expenseGroups.map((grp, i) => ({
        ...grp.bestItem,
        amount: amounts[i]
      }));
      onAddToReport(itemsToSave);
    }
  };

  const totalAmount = isMulti 
    ? amounts.reduce((acc, curr, i) => visibleRows[i] !== false ? acc + curr : acc, 0)
    : (response.results[0]?.amount || 0);

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Low confidence warning */}
      {response.confidenceLevel === 'low' && (
        <div className="relative p-5 rounded-2xl flex items-start gap-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border-2 border-amber-200/50 shadow-inner animate-scale-in">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="size-16" />
          </div>
          <div className="size-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle className="size-5 text-amber-600" />
          </div>
          <div className="relative z-10">
            <p className="font-extrabold text-[13px] uppercase tracking-widest text-amber-700 mb-1.5">
              Lưu ý: Một số thông tin chưa rõ ràng
            </p>
            <p className="text-[13px] text-amber-600/90 font-medium leading-relaxed">
              Nội dung chi phí cung cấp chưa đủ chi tiết để hệ thống chốt được một kết quả tốt nhất. Vui lòng kiểm tra kỹ hoặc cung cấp thêm diễn giải.
            </p>
          </div>
        </div>
      )}

      {/* Best matches */}
      {bestItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pl-2">
            <span className="relative flex size-2.5">
              <span className="absolute inset-0 rounded-full bg-indigo-500 opacity-60 animate-ping" />
              <span className="relative size-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            </span>
            <div className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-white/60 border border-slate-200/80 backdrop-blur-sm shadow-sm">
              <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <Zap className="size-3.5 text-indigo-600" />
              </div>
              <h3 className="text-[11.5px] font-black uppercase tracking-[0.15em] text-slate-700">
                Đề xuất ưu tiên hàng đầu {isMulti && `(${bestItems.length})`}
              </h3>
            </div>
          </div>
          
          {isMulti ? (
            /* =========================================
               INVOICE LAYOUT FOR MULTIPLE EXPENSES
               ========================================= */
            <div className="rounded-[24px] overflow-hidden bg-white shadow-2xl shadow-indigo-900/10 border border-slate-200/80 animate-scale-in">
               <div className="bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                  
                  {/* Background FX for Header */}
                  <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                  <div className="absolute -bottom-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

                  <div className="flex items-center gap-4 relative z-10">
                     <div className="size-12 rounded-full bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.4)] backdrop-blur-md">
                        <Receipt className="size-5 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                     </div>
                     <div>
                        <h2 className="font-black uppercase tracking-widest text-[16px] !text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]" style={{color:'#ffffff'}}>
                          Bảng Bóc Tách Chi Phí
                        </h2>
                        <p className="text-indigo-200/90 text-[12px] font-medium mt-0.5 tracking-wide">
                          Xử lý <strong className="text-white">{bestItems.length}</strong> khoản chi tự động
                        </p>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0 relative z-10">
                     <button
                       onClick={isEditMode ? handleCancelEdit : handleEnterEditMode}
                       className={isEditMode
                         ? "flex items-center gap-2 px-4 py-1.5 rounded-lg border h-[38px] text-[10px] font-black uppercase tracking-widest transition-all bg-amber-400 border-amber-300 text-amber-900 shadow-[0_0_20px_rgba(251,191,36,0.7)]"
                         : "flex items-center gap-2 px-4 py-1.5 rounded-lg border h-[38px] text-[10px] font-black uppercase tracking-widest transition-all bg-amber-400/15 border-amber-300/30 text-amber-300 hover:bg-amber-400/25 hover:text-amber-200"
                       }
                     >
                       {isEditMode ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
                       <span>{isEditMode ? 'Thoát' : 'Chỉnh sửa'}</span>
                     </button>
                     <button
                        onClick={() => setShowReasons(!showReasons)}
                        className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg border transition-all duration-300 text-[10px] font-black uppercase tracking-widest h-[38px] ${
                          showReasons 
                            ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                            : 'bg-white/5 border-white/15 text-indigo-100 hover:bg-white/10 hover:border-white/30 hover:text-white'
                        }`}
                     >
                        <Info className="size-3.5" />
                        Đọc suy luận AI
                     </button>
                     <div className="text-left sm:text-right pl-0 sm:pl-5 sm:border-l sm:border-white/15 h-full flex flex-col justify-center">
                        <p className="text-indigo-200/80 text-[9px] uppercase font-bold tracking-[0.2em] mb-1">Tổng Tạm Tính</p>
                        <p className="text-emerald-400 font-mono font-black text-2xl tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] leading-none flex items-baseline justify-end gap-1.5">
                           {new Intl.NumberFormat('vi-VN').format(totalAmount)} 
                           <span className="text-sm text-emerald-500/80 font-sans tracking-widest uppercase">vnđ</span>
                        </p>
                     </div>
                  </div>
               </div>

                <div className="flex flex-col">
                  {response.expenseGroups!.map((grp, i) => {
                     if (visibleRows[i] === false) return null;
                     const pct = Math.round((grp.bestItem.confidence ?? 0) * 100);
                     const isHigh = pct >= 85;
                     const statusColor = isHigh ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.5)]' : 'bg-amber-500 text-white border-amber-400 shadow-[0_2px_8px_-2px_rgba(245,158,11,0.5)]';
                     
                     return (
                       <div key={`inv-${i}`} className={`grid items-center p-4 sm:px-6 sm:py-5 hover:bg-gradient-to-r hover:from-indigo-50/40 hover:to-transparent transition-all border-b border-slate-100 last:border-0 group/row cursor-default ${
                         isEditMode
                           ? 'grid-cols-[auto_auto_1fr_130px_160px]'
                           : 'grid-cols-[auto_1fr_150px] sm:grid-cols-[auto_1fr_130px_160px]'
                       } gap-5`}>
                         
                         {/* 0. DELETE BUTTON (edit mode only) */}
                         {isEditMode && (
                           <button
                             onClick={() => handleRemoveRow(i)}
                             className="flex shrink-0 items-center justify-center w-7 h-7 rounded-full bg-rose-500 border-2 border-rose-400 text-white shadow-[0_0_10px_rgba(225,29,72,0.5)] hover:bg-rose-600 hover:scale-110 active:scale-95 transition-all duration-200"
                             title="Xóa khoản chi này"
                           >
                             <Minus className="size-3.5" strokeWidth={3} />
                           </button>
                         )}

                         {/* 1. STT */}
                         <div className="flex shrink-0">
                           <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 font-mono text-[12px] font-black border border-slate-200/80 shadow-[inset_0_1px_2px_#fff,0_1px_2px_rgba(0,0,0,0.02)] group-hover/row:bg-indigo-600 group-hover/row:text-white group-hover/row:border-indigo-500 group-hover/row:shadow-[0_2px_8px_-2px_rgba(99,102,241,0.6)] transition-all duration-300">
                             {String(i+1).padStart(2, '0')}
                           </div>
                         </div>

                         {/* 2. TRANSACTIONS DETAILS */}
                         <div className="min-w-0 pr-2">
                           <h3 className="text-[14px] font-extrabold text-slate-900 leading-snug line-clamp-2 mb-1.5 group-hover/row:text-indigo-950 transition-colors" title={grp.originalDesc}>{grp.originalDesc}</h3>
                           <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_4px_rgba(99,102,241,0.6)]" />
                             <span className="text-[11.5px] font-semibold text-slate-600 line-clamp-1 group-hover/row:text-slate-800 transition-colors" title={grp.bestItem.subTitle}>{grp.bestItem.subTitle}</span>
                           </div>
                           
                           {grp.bestItem.reason && showReasons && (
                             <div className="mt-3 text-[11.5px] text-slate-700 bg-white/60 backdrop-blur-md border border-indigo-100/60 p-3 rounded-lg shadow-[inset_0_1px_0_#fff,0_1px_3px_rgba(0,0,0,0.02)] leading-relaxed animate-fade-in-up">
                               <strong className="text-indigo-600 block mb-0.5 uppercase tracking-[0.15em] text-[9.5px]">Cơ sở phân tích:</strong>
                               {grp.bestItem.reason}
                             </div>
                           )}
                         </div>

                         {/* 3. MÃ NGÂN SÁCH (Hidden on mobile) */}
                         <div className="hidden sm:flex flex-col items-end justify-center gap-2 border-l border-slate-100 pl-5 h-full">
                           <div className="flex items-center shadow-sm rounded">
                             <span className="font-mono text-[9px] font-black tracking-widest text-white bg-indigo-500 px-2 py-1 rounded-l shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">MỤC</span>
                             <span className="font-mono text-[11.5px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-r border-y border-r border-indigo-100 min-w-[3rem] text-center">{grp.bestItem.groupCode}</span>
                           </div>
                           <div className="flex items-center shadow-sm rounded">
                             <span className="font-mono text-[9px] font-black tracking-widest text-white bg-blue-500 px-2 py-1 rounded-l shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">T/M</span>
                             <span className="font-mono text-[11.5px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-r border-y border-r border-blue-100 min-w-[3rem] text-center">{grp.bestItem.subCode}</span>
                           </div>
                         </div>

                         {/* 4. SỐ TIỀN */}
                         <div className="flex flex-col items-end justify-center gap-2 border-l border-slate-100 pl-5 h-full relative">
                           <div className={`relative flex items-center bg-white border rounded-lg w-full overflow-hidden transition-all ${
                             isEditMode
                               ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                               : 'border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
                           }`}>
                             <div className={`absolute left-0 top-0 bottom-0 px-3 flex items-center justify-center border-r ${
                               isEditMode ? 'bg-amber-50 border-amber-200' : 'bg-slate-100/80 border-slate-200/80'
                             }`}>
                               <span className={`font-mono text-[12px] font-black ${
                                 isEditMode ? 'text-amber-500' : 'text-slate-400'
                               }`}>₫</span>
                             </div>
                             <input
                               type="text"
                               readOnly={!isEditMode}
                               value={amounts[i] !== undefined ? new Intl.NumberFormat('vi-VN').format(amounts[i]) : ''}
                               onChange={(e) => handleAmountChange(i, e.target.value)}
                               className={`w-full text-right font-mono text-[15px] font-black bg-transparent py-2.5 pr-3 pl-10 outline-none transition-colors ${
                                 isEditMode
                                   ? 'text-amber-800 cursor-text'
                                   : 'text-slate-900 cursor-default select-none'
                               }`}
                             />
                           </div>
                           <div className="flex items-center justify-end w-full">
                             <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                               Tin cậy: {pct}%
                             </span>
                           </div>
                         </div>

                       </div>
                     );
                  })}
                </div>
               
               {/* Footer: Save All Actions */}
               <div className="bg-slate-50/80 p-5 border-t border-slate-200/60 flex items-center justify-between gap-4">
                 {/* Edit mode active indicator */}
                 {isEditMode && (
                   <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg text-[11px] font-bold animate-pulse">
                     <Pencil className="size-3" />
                     Đang trong chế độ chỉnh sửa
                   </div>
                 )}
                 {!isEditMode && <span />}

                 <div className="flex items-center gap-3">
                   {isEditMode && (
                     <button
                       onClick={handleCancelEdit}
                       className="px-4 py-2 bg-white border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700 font-black uppercase tracking-widest text-[11px] rounded-xl flex items-center gap-2 transition-all shadow-sm"
                     >
                       <X className="size-3.5" /> Hủy
                     </button>
                   )}
                   <button
                     onClick={isEditMode ? () => setIsEditMode(false) : handleSaveAll}
                     className={`px-6 py-2.5 font-black uppercase tracking-widest text-[12px] rounded-xl flex items-center gap-2 transition-all hover:-translate-y-0.5 ${
                       isEditMode
                         ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-white shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)]'
                         : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-[0_4px_15px_-3px_rgba(16,185,129,0.3)]'
                     }`}
                   >
                     {isEditMode ? <Check className="size-4" /> : <Save className="size-4" />}
                     {isEditMode ? 'Lưu Chỉnh Sửa' : 'Lưu Báo Cáo'}
                   </button>
                 </div>
               </div>
            </div>
          ) : (
            /* =========================================
               STANDARD LAYOUT FOR SINGLE EXPENSE
               ========================================= */
            <div className="grid grid-cols-1 gap-4">
              {bestItems.map((item, i) => (
                <div key={`best-${i}`} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <ResultCard 
                    result={item} 
                    isBest 
                    onAddToReport={onAddToReport} 
                    originalDesc={response.expenseGroups && response.expenseGroups.length > 0 ? response.expenseGroups[i].originalDesc : undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alternatives */}
      {alternativeItems.length > 0 && (
        <div className="space-y-4 mt-8 pt-6 relative">
          <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          
          <div className="flex items-center gap-2 pl-2">
            <div className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-slate-50/80 border border-slate-200/50">
              <div className="size-6 rounded-full bg-slate-200/50 flex items-center justify-center">
                <ListTree className="size-3.5 text-slate-500" />
              </div>
              <h3 className="text-[11.5px] font-black uppercase tracking-[0.15em] text-slate-500">
                Các phương án tham khảo ({alternativeItems.length})
              </h3>
            </div>
          </div>
          <div className="flex flex-col bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm shadow-slate-200/50">
            <div className="flex flex-col">
              {alternativeItems.map((r, i) => {
                const pct = Math.round(r.confidence * 100);
                const statusColor =
                  pct >= 85 ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.5)]' :
                  pct >= 50 ? 'bg-amber-500 text-white border-amber-400 shadow-[0_2px_8px_-2px_rgba(245,158,11,0.5)]' :
                  'bg-rose-500 text-white border-rose-400 shadow-[0_2px_8px_-2px_rgba(225,29,72,0.5)]';

                return (
                  <div key={`alt-${i}`} className="grid grid-cols-[auto_1fr_120px] sm:grid-cols-[auto_1fr_130px_140px] gap-5 items-center p-4 sm:px-6 sm:py-5 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-transparent transition-all border-b border-slate-100 last:border-0 group/row animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                    
                    {/* 1. STT */}
                    <div className="flex shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 font-mono text-[12px] font-black border border-slate-200/80 shadow-[inset_0_1px_2px_#fff,0_1px_2px_rgba(0,0,0,0.02)] group-hover/row:bg-slate-700 group-hover/row:text-white group-hover/row:border-slate-600 group-hover/row:shadow-[0_2px_8px_-2px_rgba(15,23,42,0.6)] transition-all duration-300">
                        {String(i+1).padStart(2, '0')}
                      </div>
                    </div>

                    {/* 2. TITLE & REASON */}
                    <div className="min-w-0 pr-2">
                      <h3 className="text-[14px] font-extrabold text-slate-800 leading-snug line-clamp-2 mb-1" title={r.subTitle}>{r.subTitle}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="text-[11.5px] text-slate-500 font-medium line-clamp-1">Thuộc nhóm: <span className="text-slate-700 font-bold">{r.groupTitle}</span></span>
                      </div>

                      {r.reason && (
                        <details className="mt-2.5 group/details">
                          <summary className="list-none cursor-pointer inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded bg-orange-50/80 hover:bg-orange-100 border border-orange-200/60 transition-colors text-[9.5px] font-black uppercase tracking-wider text-orange-600 select-none shadow-sm">
                            <Info className="size-3" /> Cơ sở AI
                          </summary>
                          <div className="mt-2 text-[11.5px] text-slate-700 bg-white/60 backdrop-blur-md p-3 rounded-xl border border-orange-100/80 shadow-[inset_0_1px_0_#fff,0_1px_3px_rgba(0,0,0,0.02)] leading-relaxed">
                            {r.reason}
                          </div>
                        </details>
                      )}
                    </div>

                    {/* 3. MÃ SỐ */}
                    <div className="hidden sm:flex flex-col items-end justify-center gap-2 border-l border-slate-100 pl-5 h-full">
                      <div className="flex items-center shadow-sm rounded">
                        <span className="font-mono text-[9px] font-black tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-l shadow-[inset_0_1px_0_rgba(255,255,255,1)]">MỤC</span>
                        <span className="font-mono text-[11.5px] font-bold bg-white text-slate-700 px-2 py-1 rounded-r border-y border-r border-slate-200 min-w-[3rem] text-center">{r.groupCode}</span>
                      </div>
                      <div className="flex items-center shadow-sm rounded">
                         <span className="font-mono text-[9px] font-black tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-l shadow-[inset_0_1px_0_rgba(255,255,255,1)]">T/M</span>
                         <span className="font-mono text-[11.5px] font-bold bg-white text-slate-700 px-2 py-1 rounded-r border-y border-r border-slate-200 min-w-[3rem] text-center">{r.subCode}</span>
                      </div>
                    </div>

                    {/* 4. ACTIONS & AMOUNT */}
                    <div className="flex flex-col items-end justify-center gap-2 border-l border-slate-100 pl-5 h-full">
                      <button 
                          onClick={() => onAddToReport(r)}
                          className="px-3.5 py-2 bg-indigo-50 border border-indigo-200/60 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_10px_-2px_rgba(99,102,241,0.5)] transition-all focus:outline-none flex items-center gap-1.5 w-full justify-center group/btn"
                        >
                          <Plus className="size-3.5 transition-transform group-hover/btn:scale-125 group-hover/btn:rotate-90" /> CHỌN VÀO BÁO CÁO
                      </button>
                      <div className="flex flex-wrap items-center w-full justify-between gap-2 mt-1">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {(r.confidence * 100).toFixed(0)}%
                          </span>
                          <span className="font-mono text-[13px] font-black text-slate-800">
                             {r.amount ? new Intl.NumberFormat('vi-VN').format(r.amount) : '---'} <span className="text-[11px] font-sans font-bold text-slate-400">₫</span>
                          </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


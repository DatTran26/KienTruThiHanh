'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { DescriptionForm } from './_components/description-form';
import { ResultSection } from './_components/result-section';
import type { AnalysisResponse, AnalysisResult } from '@/types/analysis';

type PageState = 'idle' | 'loading' | 'results' | 'error';

export default function AnalyzePage() {
  const [state, setState] = useState<PageState>('idle');
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [pendingItem, setPendingItem] = useState<AnalysisResult | null>(null);
  const [reportName, setReportName] = useState('');
  const [addingToReport, setAddingToReport] = useState(false);

  async function handleAnalyze(description: string) {
    setState('loading');
    setResponse(null);
    try {
      const res = await fetch('/api/analyze-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? 'Kết nối máy chủ AI thất bại'); setState('error'); return; }
      setResponse(data as AnalysisResponse);
      setState('results');
    } catch {
      setErrorMsg('Mất kết nối máy chủ');
      setState('error');
    }
  }

  function handleAddToReport(result: AnalysisResult) {
    setPendingItem(result);
    setReportName('');
  }

  async function handleConfirmAdd() {
    if (!pendingItem || !reportName.trim()) return;
    setAddingToReport(true);
    try {
      const reportRes = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_name: reportName.trim() }),
      });
      const reportData = await reportRes.json();
      if (!reportRes.ok) { toast.error(reportData.error ?? 'Lỗi tạo báo cáo'); return; }

      const itemRes = await fetch(`/api/reports/${reportData.reportId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_code: pendingItem.groupCode,
          group_title: pendingItem.groupTitle,
          sub_code: pendingItem.subCode,
          sub_title: pendingItem.subTitle,
          expense_content: `${pendingItem.subCode} – ${pendingItem.subTitle}`,
          amount: pendingItem.amount ?? 0,
        }),
      });
      if (!itemRes.ok) { toast.error('Lỗi lưu trữ dòng dữ liệu'); return; }

      setPendingItem(null);
      toast.success(
        <span className="text-sm font-medium">
          Đã chèn dữ liệu.{' '}
          <Link href={`/reports/${reportData.reportId}`} className="text-primary font-bold hover:underline ml-1">
            Xem Báo cáo
          </Link>
        </span>,
      );
    } catch {
      toast.error('Mất kết nối đường truyền');
    } finally {
      setAddingToReport(false);
    }
  }

  return (
    <div className="min-h-full w-full bg-slate-50/50 relative overflow-x-hidden">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute -top-40 -right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
         <div className="absolute top-40 -left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
      </div>
      
      <div className="p-4 lg:p-8 animate-fade-in-up flex flex-col w-full max-w-4xl mx-auto min-h-full relative z-10 transition-all duration-500">
        
        {/* Dynamic Header */}
        <header className={`transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${state === 'idle' ? 'mt-12 lg:mt-24 text-center' : 'mb-8'}`}>
          <div className={`flex items-center gap-2 mb-4 ${state === 'idle' ? 'justify-center' : 'justify-start'}`}>
             <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] rounded-full font-bold uppercase tracking-wider shadow-md shadow-blue-500/20 flex items-center gap-1.5 border border-white/20">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
               Trợ lý phân tích thông minh
             </span>
          </div>
          <h1 className={`font-extrabold tracking-tight text-slate-900 transition-all duration-500 ${state === 'idle' ? 'text-4xl md:text-5xl mb-4' : 'text-3xl mb-2'}`}>
            Định danh chi phí ngân sách
          </h1>
          <p className={`text-slate-500 font-medium ${state === 'idle' ? 'text-base max-w-lg mx-auto' : 'text-sm'}`}>
            Mô tả nghiệp vụ chi phát sinh, trợ lý AI sẽ đối chiếu và đề xuất tiểu mục theo chuẩn cấu trúc ngân sách nhà nước.
          </p>
        </header>

        {/* Input Form Area */}
        <div className={`w-full transition-all duration-500 ${state === 'idle' ? 'scale-100 shadow-2xl shadow-blue-900/5 rounded-2xl' : 'scale-[0.98] drop-shadow-sm'}`}>
          <DescriptionForm onSubmit={handleAnalyze} isLoading={state === 'loading'} />
        </div>

        {/* Results Workspace */}
        <div className={`w-full mt-8 transition-all duration-500 ease-out ${state === 'idle' ? 'opacity-0 translate-y-12 fixed pointer-events-none scale-95' : 'opacity-100 translate-y-0 relative scale-100'}`}>
          
          {/* Loading Animation */}
          {state === 'loading' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative size-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <svg className="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                  </div>
                  <p className="font-bold text-sm text-slate-600 uppercase tracking-widest animate-pulse">
                    Đang xử lý phân mảnh ngôn ngữ...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-4">
              <div className="p-2 rounded-full bg-red-100/50 shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-base mb-0.5">Xảy ra lỗi trong quá trình xử lý</p>
                <p className="text-sm font-medium opacity-90">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {state === 'results' && response && (
            <ResultSection response={response} onAddToReport={handleAddToReport} />
          )}

          {/* Append to Report (Floating Focus Layer) */}
          {pendingItem && (
            <>
              <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setPendingItem(null)} />
              <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:w-[500px] md:mx-auto z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-fade-in-up">
                 <div className="flex items-center gap-3 mb-5">
                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 leading-none">Lưu vào báo cáo</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Xuất phiếu hạch toán công tác phí</p>
                    </div>
                 </div>
                 
                 <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                   <div className="flex items-start gap-2.5 mb-2">
                     <span className="text-slate-500 font-bold uppercase tracking-wide text-xs mt-0.5 w-16">Tiểu mục</span> 
                     <span className="font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{pendingItem.subCode}</span>
                   </div>
                   <div className="flex items-start gap-2.5">
                     <span className="text-slate-500 font-bold uppercase tracking-wide text-xs mt-0.5 w-16">Nội dung</span> 
                     <span className="font-medium text-slate-800">{pendingItem.subTitle}</span>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Tên phiếu / Mã báo cáo <span className="text-red-500">*</span></label>
                   <input
                     id="new-report-name"
                     value={reportName}
                     onChange={e => setReportName(e.target.value)}
                     placeholder="Ví dụ: Báo cáo công tác HN Q1/2026..."
                     onKeyDown={e => e.key === 'Enter' && handleConfirmAdd()}
                     autoFocus
                     className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm"
                   />
                   
                   <div className="flex gap-3 pt-2">
                     <button
                       onClick={() => setPendingItem(null)}
                       className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                     >
                       Hủy
                     </button>
                     <button
                       onClick={handleConfirmAdd}
                       disabled={addingToReport || !reportName.trim()}
                       className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 text-sm transition-all flex justify-center items-center gap-2"
                     >
                       {addingToReport ? 'Đang tạo báo cáo...' : 'Tạo phiếu ghi nhận kế toán'}
                     </button>
                   </div>
                 </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

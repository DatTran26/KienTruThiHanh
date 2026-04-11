'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DescriptionForm } from './description-form';
import { ResultSection } from './result-section';
import type { AnalysisResponse, AnalysisResult } from '@/types/analysis';
import { Sparkles, FileText, X, Save, AlertCircle, Cpu, ShieldCheck, PencilLine } from 'lucide-react';

import { AdminMasterPanel } from '@/app/(protected)/analyze/_components/admin-master-panel';

type PageState = 'idle' | 'loading' | 'results' | 'error';

interface Props {
  isAdmin?: boolean;
  activeMaster: any; // Type it slightly looser to avoid big refactors
  popularItems?: { sub_code: string, sub_title: string }[];
  aiModel?: string;
}

export default function AnalyzeClient({ 
  isAdmin = false, 
  activeMaster = null, 
  popularItems = [], 
  aiModel = 'gpt-4o-mini' 
}: Props) {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [state, setState]                   = useState<PageState>('idle');
  const [response, setResponse]             = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg]             = useState('');
  const [pendingItem, setPendingItem]       = useState<AnalysisResult | null>(null);
  const [reportName, setReportName]         = useState('');
  const [addingToReport, setAddingToReport] = useState(false);

  async function handleAnalyze(description: string) {
    setState('loading');
    setResponse(null);
    try {
      const res  = await fetch('/api/analyze-description', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ description }),
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
      const reportRes  = await fetch('/api/reports', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ report_name: reportName.trim() }),
      });
      const reportData = await reportRes.json();
      if (!reportRes.ok) { toast.error(reportData.error ?? 'Lỗi tạo báo cáo'); return; }

      const itemRes = await fetch(`/api/reports/${reportData.reportId}/items`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          group_code:      pendingItem.groupCode,
          group_title:     pendingItem.groupTitle,
          sub_code:        pendingItem.subCode,
          sub_title:       pendingItem.subTitle,
          expense_content: `${pendingItem.subCode} – ${pendingItem.subTitle}`,
          amount:          pendingItem.amount ?? 0,
        }),
      });
      if (!itemRes.ok) { toast.error('Lỗi lưu trữ dòng dữ liệu'); return; }

      setPendingItem(null);
      toast.success(
        <span className="text-sm font-medium">
          Đã lưu vào báo cáo.{' '}
          <Link href={`/reports/${reportData.reportId}`} className="text-blue-600 font-bold hover:underline ml-1">
            Xem Báo cáo →
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
    <div className="min-h-full w-full animate-fade-in-up pb-20 lg:pb-8">

      {/* ── Page Header (inline, not sticky) ── */}
      <div className="px-6 py-5 lg:px-8 border-b border-slate-200 bg-[#f8fafc]">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Phân loại AI</span>
          <span className="text-slate-300 text-xs">·</span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-70 animate-ping" />
              <span className="relative size-1.5 rounded-full bg-emerald-500" />
            </span>
            {aiModel} · Online
          </span>
        </div>
        <h1 className="text-[1.4rem] font-bold text-slate-900 tracking-tight">
          Định danh Chi phí Ngân sách
        </h1>
      </div>

      {/* ── Main workspace ── */}
      <div className="px-6 py-6 lg:px-8">

        {/* Input card */}
        <div
          className="rounded-xl border border-slate-200 bg-white mb-6 overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}
        >
          {/* Card header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <div className="size-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Sparkles className="size-3.5 text-blue-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-700 leading-none">Nhập mô tả chi phí</p>
              <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                Hệ thống sẽ đối chiếu và đề xuất mã tiểu mục phù hợp
              </p>
            </div>
            
            {/* Admin trigger */}
            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100 shadow-sm"
                title="Cập nhật Kho dữ liệu chuẩn"
              >
                <div className="flex items-center gap-1.5">
                  <PencilLine size={13} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Kho dữ liệu</span>
                </div>
              </button>
            )}
          </div>

          <div className="p-4">
            <DescriptionForm onSubmit={handleAnalyze} isLoading={state === 'loading'} />
          </div>

          {/* System status bar */}
          <div className="flex items-center gap-4 px-5 py-2.5 border-t border-slate-100 bg-slate-50/50">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <Cpu className="size-3" strokeWidth={2} /> TABMIS · Đồng bộ
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <ShieldCheck className="size-3" strokeWidth={2} /> Mã hóa đầu cuối
            </span>
          </div>
        </div>

        {/* ── Results area ── */}

        {/* Loading */}
        {state === 'loading' && (
          <div
            className="rounded-xl border border-slate-200 bg-white p-10 flex flex-col items-center justify-center animate-fade-in"
            style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}
          >
            <div className="relative size-12 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <Sparkles className="size-4 text-blue-500" />
            </div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-3">
              Đang phân tích dữ liệu...
            </p>
            <div className="w-48 h-1 rounded-full overflow-hidden bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 animate-shimmer" />
            </div>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-3 animate-scale-in">
            <div className="size-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
              <AlertCircle className="size-4 text-red-500" />
            </div>
            <div>
              <p className="font-bold text-[13px] text-red-700 mb-0.5">Xảy ra lỗi xử lý</p>
              <p className="text-[12px] font-medium text-red-500">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {state === 'results' && response && (
          <ResultSection response={response} onAddToReport={handleAddToReport} />
        )}

        {/* ── Idle state guide ── */}
        {state === 'idle' && (
          <div className="mt-7 animate-fade-in-up space-y-5">
            {/* How it works */}
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3.5 pl-0.5">Quy trình tra cứu</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { step: '01', title: 'Nhập mô tả', desc: 'Gõ hoặc dán nội dung hoá đơn, nghiệp vụ kế toán cần tra cứu', color: 'bg-blue-50 border-blue-100 text-blue-600' },
                  { step: '02', title: 'AI phân tích', desc: `${aiModel} đối chiếu với cơ sở dữ liệu chuẩn TABMIS và đề xuất tiểu mục`, color: 'bg-violet-50 border-violet-100 text-violet-600' },
                  { step: '03', title: 'Lưu báo cáo', desc: 'Xác nhận kết quả và ghi nhận vào phiếu hạch toán kế toán', color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
                ].map(({ step, title, desc, color }) => (
                  <div key={step} className="saas-card p-4 flex flex-col gap-2">
                    <span className={`text-[9.5px] font-black tracking-[0.2em] w-fit px-2 py-0.5 rounded-md border ${color}`}>
                      BƯỚC {step}
                    </span>
                    <p className="text-[13px] font-bold text-slate-800">{title}</p>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample expense types */}
            <div className="saas-card p-5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                Ví dụ các loại chi phí thường gặp
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {popularItems.length > 0 ? popularItems.map(({ sub_code, sub_title }) => (
                  <div key={sub_code} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors">
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded shrink-0">
                      {sub_code}
                    </span>
                    <span className="text-[12.5px] font-medium text-slate-700 line-clamp-2 leading-relaxed">{sub_title}</span>
                  </div>
                )) : (
                  <div className="col-span-1 sm:col-span-2 text-[12px] font-medium text-slate-400 italic text-center py-2">
                    Vui lòng tải lên Kho dữ liệu chuẩn để hiện gợi ý thực tế.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>


      {/* ── Save-to-report modal ── */}
      {pendingItem && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
            onClick={() => setPendingItem(null)}
          />
          <div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:w-[480px] md:mx-auto z-50 rounded-xl bg-white border border-slate-200 p-6 animate-scale-in"
            style={{ boxShadow: '0 16px 48px rgba(15,23,42,0.15), 0 4px 12px rgba(15,23,42,0.08)' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Save className="size-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[14px] text-slate-800 leading-none">Lưu vào báo cáo</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">Tạo phiếu hạch toán kế toán</p>
                </div>
              </div>
              <button
                onClick={() => setPendingItem(null)}
                className="size-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Selected item preview */}
            <div className="mb-5 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 w-14">Tiểu mục</span>
                <span className="font-mono font-bold text-[11px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  {pendingItem.subCode}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 w-14 mt-0.5">Nội dung</span>
                <span className="text-[12.5px] font-medium text-slate-700 leading-snug">{pendingItem.subTitle}</span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1.5">
                  Tên phiếu / Mã báo cáo <span className="text-red-400">*</span>
                </label>
                <input
                  value={reportName}
                  onChange={e => setReportName(e.target.value)}
                  placeholder="VD: Báo cáo công tác Hà Nội Q1/2026..."
                  onKeyDown={e => e.key === 'Enter' && handleConfirmAdd()}
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all placeholder:text-slate-300 font-medium"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setPendingItem(null)}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-[13px]"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmAdd}
                  disabled={addingToReport || !reportName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg text-[13px] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {addingToReport
                    ? <><span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang tạo...</>
                    : <><FileText className="size-3.5" /> Tạo phiếu ghi nhận</>
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Admin Master Panel Modal ── */}
      {showAdminPanel && isAdmin && (
        <AdminMasterPanel
          activeMaster={activeMaster}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </div>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, FileText, CheckCircle2, Clock, Receipt, Sparkles, Plus, BrainCircuit, ArrowRight, CalendarDays, Hash, TrendingUp, Database } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ReportItemsManager } from './_components/report-items-manager';
import { ExportButton } from './_components/export-button';

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: report } = await supabase
    .from('reports')
    .select('id, report_name, report_code, total_amount, status, created_at, organization_profile_id')
    .eq('id', reportId)
    .eq('user_id', user!.id)
    .single();

  if (!report) notFound();

  const { data: items } = await supabase
    .from('report_items')
    .select('id, sort_order, group_code, sub_code, expense_content, amount, note')
    .eq('report_id', reportId)
    .order('sort_order', { ascending: true });

  // Fetch recent AI analyses for the sidebar
  const { data: recentAnalyses } = await supabase
    .from('analysis_requests')
    .select('id, raw_description, confidence, extracted_amount, created_at, selected_item_id')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(15);

  const isExported = report.status === 'exported';
  const itemCount = items?.length ?? 0;
  const computedTotal = items?.reduce((s, i) => s + (i.amount ?? 0), 0) ?? 0;

  return (
    <div className="min-h-full pb-20 lg:pb-8 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="relative px-6 py-6 lg:px-8 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30 pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            Danh sách phiếu
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`size-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                  isExported 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                }`}
              >
                {isExported
                  ? <CheckCircle2 className="size-6" />
                  : <FileText className="size-6" />
                }
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {report.report_name}
                  </h1>
                  <span
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                      isExported 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}
                  >
                    {isExported ? 'Đã xuất' : 'Nháp'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {report.report_code && (
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                      Số: {report.report_code}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="size-3" />
                    {formatDate(report.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/analyze?reportId=${reportId}`}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-sm shadow-sm hover:from-violet-400 hover:to-indigo-500 transition-all active:scale-95"
              >
                <BrainCircuit className="size-4" />
                Phân loại AI
              </Link>
              {itemCount > 0 && (
                <ExportButton reportId={reportId} reportName={report.report_name} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="px-4 lg:px-8 py-6 bg-slate-50/50 min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex-1 min-w-0 space-y-5">

            {/* Stats summary row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className="size-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shadow-sm">
                  <Receipt className="size-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khoản mục</p>
                  <p className="text-lg font-bold text-slate-900 leading-none">{itemCount}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className="size-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                  <TrendingUp className="size-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng cộng</p>
                  <p className="text-lg font-bold text-slate-900 leading-none font-mono">{formatCurrency(computedTotal)} VNĐ</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className="size-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shadow-sm">
                  <CalendarDays className="size-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày tạo</p>
                  <p className="text-sm font-bold text-slate-900 leading-none">{formatDate(report.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Items manager — 2 column split */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                    <Receipt className="size-3.5 text-indigo-600" />
                  </div>
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                    Các khoản mục
                    <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                      {itemCount}
                    </span>
                  </h2>
                </div>
              </div>
              <ReportItemsManager
                items={items ?? []}
                reportId={reportId}
                analyses={recentAnalyses ?? []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

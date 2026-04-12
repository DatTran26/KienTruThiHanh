import { createClient } from '@/lib/supabase/server';
import { CreateReportDialog } from './_components/create-report-dialog';
import { ReportListClient } from './_components/report-list-client';
import { formatCurrency } from '@/lib/utils';
import {
  FileText, TrendingUp, CheckCircle2,
  ArrowUp, FolderOpen
} from 'lucide-react';

export default async function ReportsPage() {
  const supabase = await createClient();

  const response = (await supabase
    .from('reports')
    .select('id, report_name, report_code, status, created_at, report_items(amount)')
    .order('created_at', { ascending: false })) as any;
  const reports = response.data as any[];

  const mappedReports = reports?.map(r => {
    const realTotal = (r.report_items as any[])?.reduce((k, i) => k + (i.amount || 0), 0) || 0;
    return { ...r, total_amount: realTotal };
  }) ?? [];

  // Aggregate stats
  const totalAmount = mappedReports.reduce((s, r) => s + r.total_amount, 0);
  const totalCount  = reports?.length ?? 0;
  const draftCount  = reports?.filter(r => r.status === 'draft').length ?? 0;
  const exportedCount = totalCount - draftCount;

  const thisMonth = reports?.filter(r => {
    const d = new Date(r.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length ?? 0;

  const stats = [
    {
      label: 'Tổng báo cáo',
      value: totalCount,
      icon: FolderOpen,
      color: 'text-violet-600',
      bg: 'bg-violet-50 border-violet-100',
    },
    {
      label: 'Tổng giá trị',
      value: totalAmount > 0 ? `${formatCurrency(totalAmount)} VNĐ` : '—',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Đã xuất',
      value: exportedCount,
      icon: CheckCircle2,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
    },
    {
      label: 'Tháng này',
      value: thisMonth,
      icon: ArrowUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">

      {/* ── HEADER ── */}
      <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-2 mb-7 animate-slide-up">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-6 rounded-md bg-violet-50 border border-violet-100 flex items-center justify-center">
              <FileText size={13} strokeWidth={2.3} className="text-violet-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Quản trị Dữ liệu</span>
          </div>
          <h1 className="text-2xl sm:text-[1.8rem] font-bold tracking-tight text-slate-900 leading-tight">
            Kho Báo Cáo
          </h1>
          <p className="text-slate-500 text-[13px] font-medium">
            Quản lý các báo cáo hạch toán chi phí được phân loại tự động bởi AI.
          </p>
        </div>

        <div className="mt-5 sm:mt-0">
          <CreateReportDialog />
        </div>
      </header>

      {/* ── STATS ROW ── */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7 animate-slide-up" style={{ animationDelay: '50ms' }}>
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 px-4 py-4 flex items-center gap-3.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
              <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${bg}`}>
                <Icon size={16} strokeWidth={2.2} className={color} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">{label}</p>
                <p className="text-[20px] font-bold text-slate-900 leading-none tracking-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── REPORTS GRID / EMPTY STATE ── */}
      <div className="flex-1 mt-2">
        <ReportListClient reports={mappedReports} />
      </div>

    </div>
  );
}

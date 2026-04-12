import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Activity, 
  Target, 
  Sparkles, 
  Clock, 
  Calendar,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Zap,
  FolderOpen,
  BrainCircuit,
  ChevronRight,
  Wallet,
  Shield,
  Layers
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ExpensesChart } from './_components/expenses-chart';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: recentAnalyses }, 
    { data: recentReportsRaw }, 
    { count: totalAnalyses }, 
    { data: allReportsRaw }
  ] = await Promise.all([
    supabase
      .from('analysis_requests')
      .select('id, raw_description, confidence, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    (supabase
      .from('reports')
      .select('id, report_name, status, created_at, report_items(amount)')
      .order('created_at', { ascending: false })
      .limit(4) as any),
    supabase
      .from('analysis_requests')
      .select('*', { count: 'exact', head: true }),
    (supabase
      .from('reports')
      .select('created_at, report_items(amount)')
      .order('created_at', { ascending: true }) as any)
  ]);

  const recentReports = (recentReportsRaw || []) as any[];
  const allReports = (allReportsRaw || []) as any[];

  // Aggregate monthly data for chart
  const monthlyData: Record<string, number> = {
    'Thg 1': 0, 'Thg 2': 0, 'Thg 3': 0, 'Thg 4': 0,
    'Thg 5': 0, 'Thg 6': 0, 'Thg 7': 0, 'Thg 8': 0,
    'Thg 9': 0, 'Thg 10': 0, 'Thg 11': 0, 'Thg 12': 0,
  };
  let totalExpectedAmount = 0;
  
  if (allReports) {
    for (const r of allReports) {
      const realTotal = (r.report_items as any[])?.reduce((k, i) => k + (i.amount || 0), 0) || 0;
      if (!realTotal) continue;
      totalExpectedAmount += realTotal;
      const date = new Date(r.created_at);
      const monthLabel = `Thg ${date.getMonth() + 1}`;
      monthlyData[monthLabel] = (monthlyData[monthLabel] || 0) + realTotal;
    }
  }

  const chartData = Object.keys(monthlyData).map(k => ({
    name: k,
    amount: monthlyData[k] || 0
  }));

  const getUserName = (email?: string) => {
    return email?.split('@')[0] ?? 'Cán bộ';
  };

  const avgConfidence = (() => {
    if (!recentAnalyses?.length) return null;
    const avg = recentAnalyses.reduce((s, a) => s + (a.confidence ?? 0), 0) / recentAnalyses.length;
    return Math.round(avg * 100);
  })();

  const mappedRecentReports = recentReports?.map(r => {
    const realTotal = (r.report_items as any[])?.reduce((k, i) => k + (i.amount || 0), 0) || 0;
    return { ...r, total_amount: realTotal };
  }) ?? [];

  const stats = [
    {
      label: 'Tổng Phân Tích',
      value: totalAnalyses ?? 0,
      icon: Search,
      bg: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      borderColor: 'border-blue-200/50',
      textColor: 'text-blue-600',
      textGradient: 'from-blue-600 to-indigo-600',
      change: '+2 tuần này',
    },
    {
      label: 'Báo Cáo Lưu',
      value: allReports?.length ?? 0,
      icon: FileText,
      bg: 'bg-violet-500',
      lightBg: 'bg-violet-50',
      borderColor: 'border-violet-200/50',
      textColor: 'text-violet-600',
      textGradient: 'from-violet-600 to-purple-600',
      change: formatCurrency(totalExpectedAmount) + ' VNĐ',
    },
    {
      label: 'Độ Chính Xác',
      value: avgConfidence != null ? `${avgConfidence}%` : '—',
      icon: Target,
      bg: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      borderColor: 'border-emerald-200/50',
      textColor: 'text-emerald-600',
      textGradient: 'from-emerald-600 to-teal-600',
      change: 'Trung bình AI',
    },
    {
      label: 'Phiên Hoạt Động',
      value: recentAnalyses?.length ?? 0,
      icon: Activity,
      bg: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      borderColor: 'border-amber-200/50',
      textColor: 'text-amber-600',
      textGradient: 'from-amber-500 to-orange-600',
      change: 'Gần đây',
    },
  ];

  const now = new Date();

  return (
    <div className="@container w-full flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

      {/* ══════════════════════════ HERO HEADER ══════════════════════════ */}
      <header className="relative overflow-hidden border-b border-slate-200/60">
        {/* Ambient glow blobs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative max-w-[1480px] mx-auto px-5 @md:px-8 pt-7 pb-6 flex flex-col @md:flex-row items-start @md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Bảng điều khiển</span>
              <span className="size-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                <span className="relative flex size-1.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 animate-ping" />
                  <span className="relative size-1.5 rounded-full bg-emerald-500" />
                </span>
                Trực tuyến
              </span>
            </div>
            <h1 className="text-[26px] @sm:text-[32px] font-black tracking-tight text-slate-900 leading-none">
              Xin chào, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{getUserName(user?.email)}</span>
            </h1>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-md">
              Quản lý hệ thống hạch toán & phân loại chi phí bằng AI.
            </p>
          </div>

          <div className="hidden @md:flex items-center gap-3 relative group">
            {/* Ambient hover glow */}
            <div className="absolute inset-0 bg-indigo-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative flex flex-col items-end bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white shadow-[0_4px_25px_rgba(0,0,0,0.04)] ring-1 ring-slate-200/50 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar className="size-4 text-indigo-500 drop-shadow-sm" strokeWidth={2.5} />
                <p className="text-[14px] font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
                  {now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60">
                <Clock className="size-3 text-slate-500" strokeWidth={2.5} />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest tabular-nums">
                  Cập nhật • {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════ MAIN CONTENT ══════════════════════════ */}
      <div className="max-w-[1480px] mx-auto w-full px-5 @md:px-8 py-6 pb-24 lg:pb-8 flex flex-col gap-6">

        {/* ─── STATS ROW ─── */}
        <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="relative group rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Hover glow */}
              <div className={`absolute -top-10 -right-10 size-32 ${s.bg} opacity-5 group-hover:opacity-15 rounded-full blur-2xl transition-opacity duration-500`} />
              
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 z-10 relative">{s.label}</span>
                <div className={`size-9 flex items-center justify-center rounded-xl bg-white border drop-shadow-sm ${s.borderColor} z-10 relative group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <s.icon size={16} strokeWidth={2.5} className={s.textColor} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 z-10 relative">
                <span className={`text-[32px] @md:text-[38px] font-black tracking-tighter leading-none bg-gradient-to-br ${s.textGradient} bg-clip-text text-transparent drop-shadow-sm`}>
                  {s.value}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-2 z-10 relative">{s.change}</p>
            </div>
          ))}
        </div>

        {/* ─── CHART + CTA ROW ─── */}
        <div className="grid grid-cols-1 @4xl:grid-cols-12 gap-5">
          
          {/* Chart — spanning 8 cols */}
          <div className="@4xl:col-span-8 rounded-2xl bg-white border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden min-h-[340px]">
            <ExpensesChart data={chartData} totalExpectedAmount={totalExpectedAmount} />
          </div>

          {/* CTA + Summary — spanning 4 cols */}
          <div className="@4xl:col-span-4 flex flex-col gap-4">

            {/* AI CTA Card */}
            <Link href="/analyze" className="group block relative rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(79,70,229,0.15)]">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
              {/* Glow orbs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-300/10 rounded-full blur-2xl" />
              
              <div className="relative p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center">
                    <BrainCircuit className="size-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Tác vụ chính</p>
                    <p className="text-[15px] font-black text-white tracking-tight">Phân loại chi phí AI</p>
                  </div>
                </div>
                <p className="text-[12px] text-white/70 leading-relaxed font-medium">
                  Mô tả chi tiết → AI đề xuất mã chuyên mục ngân sách chính xác.
                </p>
                <div className="flex items-center gap-2 text-white/80 group-hover:text-white group-hover:gap-3 transition-all duration-300">
                  <span className="text-[11px] font-bold uppercase tracking-widest">Bắt đầu ngay</span>
                  <ArrowRight className="size-3.5" strokeWidth={3} />
                </div>
              </div>
            </Link>

            {/* Quick Stats Summary */}
            <div className="rounded-2xl bg-white border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex-1 flex flex-col gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Tóm tắt nhanh</p>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                <div className="size-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <Wallet className="size-4 text-indigo-600" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng chi phí</p>
                  <p className="text-[15px] font-black text-indigo-700 tracking-tight tabular-nums">{formatCurrency(totalExpectedAmount)} VNĐ</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                <div className="size-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Shield className="size-4 text-emerald-600" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Độ chính xác AI</p>
                  <p className="text-[15px] font-black text-emerald-700 tracking-tight">{avgConfidence != null ? `${avgConfidence}%` : '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                <div className="size-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Layers className="size-4 text-amber-600" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số phiếu báo cáo</p>
                  <p className="text-[15px] font-black text-amber-700 tracking-tight">{allReports?.length ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM: REPORTS + HISTORY ─── */}
        <div className="grid grid-cols-1 @4xl:grid-cols-12 gap-5">

          {/* Reports Card */}
          <div className="@4xl:col-span-5 rounded-2xl bg-white border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100/80 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                  <FolderOpen size={14} strokeWidth={2.5} className="text-violet-600" />
                </div>
                <span className="font-bold text-[13px] text-slate-800">Hồ Sơ Báo Cáo</span>
              </div>
              <Link href="/reports" className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors group/link">
                Tất cả
                <ChevronRight className="size-3 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="flex-1 p-2">
              {!recentReports?.length ? (
                <div className="min-h-[200px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="size-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-3">
                    <FileText size={22} className="text-slate-300" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-500">Chưa có báo cáo</span>
                  <span className="text-[11px] text-slate-400 mt-1">Phân tích chi phí để tạo báo cáo đầu tiên</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100/80">
                  {mappedRecentReports.map((report) => (
                    <Link
                      key={report.id} href={`/reports/${report.id}`}
                      className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50/80 transition-all group/item"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                          <FileText size={13} className="text-violet-500" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[12.5px] font-bold text-slate-800 truncate group-hover/item:text-indigo-700 transition-colors">{report.report_name}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <span className="font-mono">#{report.id.split('-')[0]}</span>
                            <span className="size-0.5 rounded-full bg-slate-300" />
                            <span>{new Date(report.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11.5px] font-black text-indigo-600 shrink-0 tabular-nums">
                        {formatCurrency(report.total_amount)} VNĐ
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analysis History */}
          <div className="@4xl:col-span-7 rounded-2xl bg-white border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden max-h-[400px]">
            <div className="px-5 py-4 border-b border-slate-100/80 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <BarChart3 size={14} strokeWidth={2.5} className="text-blue-600" />
                </div>
                <span className="font-bold text-[13px] text-slate-800">Nhật ký tra cứu AI</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500 border border-slate-200/60 tabular-nums">
                {recentAnalyses?.length ?? 0} gần nhất
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {!recentAnalyses?.length ? (
                <div className="min-h-[240px] flex flex-col items-center justify-center p-8 text-center">
                  <div className="size-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-3">
                    <Activity size={22} className="text-slate-300" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-500">Đang chờ lệnh</span>
                  <span className="text-[11px] text-slate-400 mt-1">Sử dụng "Phân loại chi phí" để bắt đầu</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100/60">
                  {recentAnalyses.map((item) => (
                    <div key={item.id} className="relative p-3.5 hover:bg-slate-50/50 transition-all flex items-start gap-3 group rounded-xl">
                      {/* Timeline dot */}
                      <div className="mt-1.5 shrink-0 flex flex-col items-center gap-1">
                        <div className="size-2.5 rounded-full bg-blue-200 group-hover:bg-blue-400 ring-[3px] ring-blue-50 group-hover:ring-blue-100 transition-all" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock size={10} className="text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                            {new Date(item.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-[12.5px] font-medium text-slate-700 leading-relaxed line-clamp-2">
                          &ldquo;{item.raw_description}&rdquo;
                        </p>
                      </div>

                      {item.confidence != null && (
                        <div className="shrink-0 flex items-center justify-center mt-1">
                          <div className="relative size-11 flex items-center justify-center">
                            <svg viewBox="0 0 40 40" className="absolute inset-0 size-full -rotate-90">
                              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100" />
                              <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" strokeLinecap="round"
                                strokeDasharray={`${100.5}`} strokeDashoffset={100.5 - (100.5 * item.confidence)}
                                className={item.confidence > 0.8 ? 'stroke-emerald-500' : item.confidence > 0.5 ? 'stroke-amber-500' : 'stroke-red-400'}
                                style={{ transition: 'stroke-dashoffset 1s ease' }}
                              />
                            </svg>
                            <span className={`text-[10px] font-black ${item.confidence > 0.8 ? 'text-emerald-600' : item.confidence > 0.5 ? 'text-amber-600' : 'text-red-500'}`}>
                              {Math.round(item.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

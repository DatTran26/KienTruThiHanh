import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Activity, 
  Target, 
  Sparkles, 
  Clock, 
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

  const [{ data: recentAnalyses }, { data: recentReports }, { count: totalAnalyses }, { data: allReports }] = await Promise.all([
    supabase
      .from('analysis_requests')
      .select('id, raw_description, confidence, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('reports')
      .select('id, report_name, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('analysis_requests')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('reports')
      .select('created_at, total_amount')
      .order('created_at', { ascending: true })
  ]);

  // Aggregate monthly data for chart
  const monthlyData: Record<string, number> = {};
  let totalExpectedAmount = 0;
  
  if (allReports) {
    for (const r of allReports) {
      if (!r.total_amount) continue;
      totalExpectedAmount += r.total_amount;
      const date = new Date(r.created_at);
      const monthLabel = `Thg ${date.getMonth() + 1}`;
      monthlyData[monthLabel] = (monthlyData[monthLabel] || 0) + r.total_amount;
    }
  }

  const chartData = Object.keys(monthlyData).map(k => ({
    name: k,
    amount: monthlyData[k]
  }));

  const getUserName = (email?: string) => {
    return email?.split('@')[0] ?? 'Cán bộ';
  };

  const avgConfidence = (() => {
    if (!recentAnalyses?.length) return null;
    const avg = recentAnalyses.reduce((s, a) => s + (a.confidence ?? 0), 0) / recentAnalyses.length;
    return Math.round(avg * 100);
  })();

  const totalReportAmount = recentReports?.reduce((s, r) => s + (r.total_amount ?? 0), 0) ?? 0;

  const stats = [
    {
      label: 'Tổng Phân Tích',
      value: totalAnalyses ?? 0,
      icon: Search,
      bg: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      borderColor: 'border-blue-100',
      textColor: 'text-blue-600',
      change: '+2 tuần này',
    },
    {
      label: 'Báo Cáo Lưu',
      value: recentReports?.length ?? 0,
      icon: FileText,
      bg: 'bg-violet-500',
      lightBg: 'bg-violet-50',
      borderColor: 'border-violet-100',
      textColor: 'text-violet-600',
      change: formatCurrency(totalReportAmount) + ' đ',
    },
    {
      label: 'Độ Chính Xác',
      value: avgConfidence != null ? `${avgConfidence}%` : '—',
      icon: Target,
      bg: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      textColor: 'text-emerald-600',
      change: 'Trung bình AI',
    },
    {
      label: 'Phiên Hoạt Động',
      value: recentAnalyses?.length ?? 0,
      icon: Activity,
      bg: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      borderColor: 'border-amber-100',
      textColor: 'text-amber-600',
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

          <div className="hidden @md:flex flex-col items-end gap-1 text-right">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-slate-200/60 shadow-sm">
              <p className="text-[12px] font-bold text-slate-700">
                {now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                Lần cập nhật: {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
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
              className="relative group rounded-2xl bg-white border border-slate-200/70 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Hover glow */}
              <div className={`absolute -top-8 -right-8 size-24 ${s.bg} opacity-0 group-hover:opacity-[0.06] rounded-full blur-2xl transition-opacity duration-500`} />
              
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{s.label}</span>
                <div className={`size-8 flex items-center justify-center rounded-xl ${s.lightBg} border ${s.borderColor}`}>
                  <s.icon size={14} strokeWidth={2.5} className={s.textColor} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-[28px] @md:text-[34px] font-black tracking-tight leading-none ${s.textColor}`}>
                  {s.value}
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 mt-2">{s.change}</p>
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
                  <p className="text-[15px] font-black text-indigo-700 tracking-tight tabular-nums">{formatCurrency(totalExpectedAmount)} đ</p>
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
                  <p className="text-[15px] font-black text-amber-700 tracking-tight">{recentReports?.length ?? 0}</p>
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
                  {recentReports.map((r) => (
                    <Link
                      key={r.id} href={`/reports/${r.id}`}
                      className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50/80 transition-all group/item"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                          <FileText size={13} className="text-violet-500" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[12.5px] font-bold text-slate-800 truncate group-hover/item:text-indigo-700 transition-colors">{r.report_name}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <span className="font-mono">#{r.id.split('-')[0]}</span>
                            <span className="size-0.5 rounded-full bg-slate-300" />
                            <span>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11.5px] font-black text-indigo-600 shrink-0 tabular-nums">
                        {formatCurrency(r.total_amount)} đ
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

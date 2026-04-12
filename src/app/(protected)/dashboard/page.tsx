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
  TrendingUp,
  BarChart3,
  Zap,
  FolderOpen
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: recentAnalyses }, { data: recentReports }, { count: totalAnalyses }] = await Promise.all([
    supabase
      .from('analysis_requests')
      .select('id, raw_description, confidence, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('reports')
      .select('id, report_name, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('analysis_requests')
      .select('*', { count: 'exact', head: true }),
  ]);

  const getUserName = (email?: string) => {
    return email?.split('@')[0] ?? 'Cán bộ';
  };

  const avgConfidence = (() => {
    if (!recentAnalyses?.length) return null;
    const avg = recentAnalyses.reduce((s, a) => s + (a.confidence ?? 0), 0) / recentAnalyses.length;
    return `${Math.round(avg * 100)}%`;
  })();

  const stats = [
    {
      label: 'Tổng Yêu Cầu',
      value: totalAnalyses ?? 0,
      icon: Search,
      gradient: 'from-blue-500/10 to-blue-400/5',
      iconColor: 'text-blue-500',
      valueColor: 'text-blue-600',
    },
    {
      label: 'Báo Cáo',
      value: recentReports?.length ?? 0,
      icon: FileText,
      gradient: 'from-indigo-500/10 to-indigo-400/5',
      iconColor: 'text-indigo-500',
      valueColor: 'text-indigo-600',
    },
    {
      label: 'Độ Tin Cậy TB',
      value: avgConfidence ?? '—',
      icon: Target,
      gradient: 'from-emerald-500/10 to-emerald-400/5',
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-600',
    },
    {
      label: 'Phiên Hoạt Động',
      value: recentAnalyses?.length ?? 0,
      icon: Activity,
      gradient: 'from-amber-500/10 to-amber-400/5',
      iconColor: 'text-amber-500',
      valueColor: 'text-amber-600',
    },
  ];

  return (
    <div className="@container w-full flex flex-col p-4 @md:p-6 @lg:p-8 max-w-[1400px] mx-auto pb-24 lg:pb-8">

      {/* ── Header ── */}
      <header className="flex flex-col @md:flex-row items-start @md:items-end justify-between mt-2 mb-8 animate-slide-up">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tổng quan</span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-70 animate-ping" />
                <span className="relative size-1.5 rounded-full bg-emerald-500" />
              </span>
              Hệ thống Online
            </span>
          </div>
          <h1 className="text-2xl @sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            Xin chào, <span className="text-blue-700">{getUserName(user?.email)}</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">Tổng quan hệ thống hạch toán & phân loại bằng trí tuệ nhân tạo.</p>
        </div>

        <div className="hidden @md:flex flex-col items-end text-xs text-slate-500 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
          <p className="font-semibold text-slate-700">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="font-mono mt-1 text-slate-400">Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}</p>
        </div>
      </header>

      {/* ── Dashboard Grid ── */}
      <div className="grid grid-cols-1 @4xl:grid-cols-12 gap-6 pb-10">
        
        {/* STATS ROW */}
        <div className="@4xl:col-span-12 grid grid-cols-2 @3xl:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className="saas-card p-5 animate-slide-up group relative overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{s.label}</span>
                <div className={`size-9 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 ${s.iconColor}`}>
                  <s.icon size={16} strokeWidth={2.3} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl @md:text-4xl font-bold tracking-tight ${s.valueColor}`}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* LEFT COLUMN */}
        <div className="@4xl:col-span-5 flex flex-col gap-5">

          {/* Quick Action Banner */}
          <div className="saas-card overflow-hidden animate-slide-up group" style={{ animationDelay: '60ms' }}>
            <Link href="/analyze" className="block relative p-6 transition-colors">
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200 group-hover:text-blue-300 group-hover:translate-x-1 transition-all duration-200">
                <ArrowRight size={22} strokeWidth={2}/>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Sparkles className="size-3.5 text-blue-600" strokeWidth={2} />
                </div>
                <span className="font-bold text-[10px] tracking-[0.18em] uppercase text-blue-600">Tác vụ mới</span>
              </div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight mb-1">Phân loại chi phí AI</h3>
              <p className="text-[12.5px] text-slate-500 leading-relaxed">Nhập mô tả chi phí, AI sẽ đề xuất mã tiểu mục ngân sách tức thì.</p>
            </Link>
          </div>

          {/* Reports Module */}
          <div className="saas-card flex-1 flex flex-col overflow-hidden animate-slide-up" style={{ animationDelay: '120ms' }}>
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-md bg-violet-50 border border-violet-100 flex items-center justify-center">
                  <FolderOpen size={13} strokeWidth={2.3} className="text-violet-600" />
                </div>
                <span className="font-bold text-[13px] text-slate-700">Hồ Sơ Báo Cáo</span>
              </div>
              <Link href="/reports" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">Xem tất cả →</Link>
            </div>

            <div className="flex-1 p-2">
              {!recentReports?.length ? (
                <div className="min-h-[180px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="size-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-3">
                    <FileText size={20} className="text-slate-300" />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700">Chưa có báo cáo nào</span>
                  <span className="text-[11px] text-slate-400 mt-1">Dữ liệu đã lưu sẽ hiển thị tại đây</span>
                </div>
              ) : (
                <div className="space-y-0.5 p-1">
                  {recentReports.map((r) => (
                    <Link
                      key={r.id} href={`/reports/${r.id}`}
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 transition-colors group/item"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                        <span className="text-[13px] font-semibold text-slate-800 truncate group-hover/item:text-blue-700 transition-colors">{r.report_name}</span>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-medium">
                          <span className="font-mono">#{r.id.split('-')[0]}</span>
                          <span>·</span>
                          <span>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <span className="text-[12px] font-bold text-slate-700 shrink-0 font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                        {formatCurrency(r.total_amount)} đ
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Analysis Log */}
        <div className="@4xl:col-span-7 saas-card flex flex-col overflow-hidden animate-slide-up" style={{ animationDelay: '180ms' }}>
          <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center">
                <BarChart3 size={13} strokeWidth={2.3} className="text-blue-600" />
              </div>
              <span className="font-bold text-[13px] text-slate-700">Lịch sử tra cứu AI</span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-slate-50 text-[10.5px] font-bold text-slate-400 border border-slate-200">
              {recentAnalyses?.length ?? 0} gần nhất
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!recentAnalyses?.length ? (
              <div className="min-h-[280px] flex flex-col items-center justify-center p-8 text-center">
                <div className="size-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-4">
                  <Activity size={24} className="text-slate-300" />
                </div>
                <span className="text-[13px] font-semibold text-slate-700">Hệ thống đang chờ lệnh</span>
                <span className="text-[11.5px] text-slate-400 mt-1 max-w-[200px]">Thực hiện "Phân loại chi phí" để bắt đầu phân tích.</span>
              </div>
            ) : (
              <div className="space-y-0.5 p-1">
                {recentAnalyses.map((item) => (
                  <div key={item.id} className="relative p-3.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-start gap-3.5 group">
                    <div className="size-2 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={11} className="text-slate-400" />
                        <span className="text-[10.5px] font-semibold text-slate-400">
                          {new Date(item.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium text-slate-700 leading-relaxed line-clamp-2">
                        "{item.raw_description}"
                      </p>
                    </div>
                    {item.confidence != null && (
                      <div className="shrink-0 flex items-center justify-center bg-white border border-slate-100 rounded-lg p-1.5 w-14">
                        <div className="relative size-10 flex flex-col items-center justify-center">
                          <svg viewBox="0 0 40 40" className="absolute inset-0 size-full -rotate-90">
                            <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100" />
                            <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" strokeLinecap="round"
                              strokeDasharray="100" strokeDashoffset={100 - (100 * item.confidence)}
                              className={item.confidence > 0.8 ? 'stroke-emerald-500' : 'stroke-amber-500'}
                              style={{ transition: 'stroke-dashoffset 1s ease' }}
                            />
                          </svg>
                          <span className="text-[10px] font-bold text-slate-700">{Math.round(item.confidence * 100)}%</span>
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
  );
}

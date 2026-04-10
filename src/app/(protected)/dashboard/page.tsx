import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Activity, 
  Target, 
  TerminalSquare, 
  Clock, 
  ArrowRight
} from 'lucide-react';

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
    const name = email?.split('@')[0] ?? 'Cán bộ';
    return name;
  };

  const avgConfidence = (() => {
    if (!recentAnalyses?.length) return null;
    const avg = recentAnalyses.reduce((s, a) => s + (a.confidence ?? 0), 0) / recentAnalyses.length;
    return `${Math.round(avg * 100)}%`;
  })();

  const stats = [
    {
      label: 'Tổng Yêu Cầu Đã Xử Lý',
      value: totalAnalyses ?? 0,
      icon: Search,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Báo Cáo Đã Tạo',
      value: recentReports?.length ?? 0,
      icon: FileText,
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
    },
    {
      label: 'Độ Tin Cậy Trung Bình AI',
      value: avgConfidence ?? '—',
      icon: Target,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Phiên Đang Hoạt Động',
      value: recentAnalyses?.length ?? 0,
      icon: Activity,
      color: 'text-slate-700',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
    },
  ];

  return (
    <div className="w-full h-full max-h-[100dvh] flex flex-col p-4 lg:p-6 lg:px-8 overflow-hidden bg-background max-w-[1400px] mx-auto">
      
      {/* ── Header: Official Style ── */}
      <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-2 mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 bg-green-500 rounded-full" />
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">HỆ THỐNG ĐANG HOẠT ĐỘNG</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Xin chào, {getUserName(user?.email)}
          </h1>
          <p className="text-slate-500 mt-1">Tổng quan tình hình xử lý chi phí và báo cáo hạch toán.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col items-end text-sm text-slate-500 font-medium">
          <p>Ngày hệ thống: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}</p>
        </div>
      </header>

      {/* ── Dashboard Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-y-auto pr-2 pb-10">
        
        {/* STATS ROW (Top Section) */}
        <div className="lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, i) => (
            <div 
              key={i} 
              className={`structured-panel p-5 animate-fade-in-up ${s.bg} ${s.border} hover:shadow-md transition-shadow`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{s.label}</span>
                <div className={`${s.color} p-2 bg-white rounded-md shadow-sm border border-slate-100`}>
                  <s.icon size={18} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* LEFT COLUMN: Actions & Reports */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Command Module */}
          <div className="structured-panel border-primary overflow-hidden animate-fade-in-up delay-300 ring-1 ring-primary/10">
            <Link href="/analyze" className="group block relative p-6 bg-white hover:bg-slate-50 transition-colors">
              <div className="absolute right-6 top-6 text-primary group-hover:translate-x-1 transition-transform">
                <ArrowRight size={24} />
              </div>
              <div className="flex items-center gap-2 mb-3 text-primary">
                <TerminalSquare size={20} strokeWidth={2} />
                <span className="font-bold text-sm tracking-wider uppercase">Nghiệp vụ mới</span>
              </div>
              <h3 className="text-xl font-bold text-primary tracking-tight mb-2">Phân loại chi phí AI</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Sử dụng AI để tự động truy xuất và đề xuất mã tiểu mục hạch toán phù hợp từ cơ sở dữ liệu Bộ Tài Chính.</p>
            </Link>
          </div>

          {/* Docs / Reports Module */}
          <div className="structured-panel flex-1 flex flex-col overflow-hidden animate-fade-in-up delay-400">
            <div className="px-5 py-4 border-b border-border bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-700">
                <FileText size={16} strokeWidth={2.5} />
                <span className="font-bold text-sm uppercase tracking-wider">Báo cáo gần đây</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider">Lưu trữ</span>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {!recentReports?.length ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
                  <FileText size={32} className="opacity-20 mb-3" />
                  <span className="text-sm font-semibold">Chưa có báo cáo nào</span>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentReports.map((r) => (
                    <Link 
                      key={r.id} href={`/reports/${r.id}`}
                      className="block p-4 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-sm font-bold text-slate-800 tracking-tight truncate pr-4 group-hover:text-primary transition-colors">{r.report_name}</span>
                        <span className="text-sm font-bold text-primary shrink-0">{new Intl.NumberFormat('vi-VN').format(r.total_amount)} VNĐ</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                        <Clock size={12} />
                        <span>Mã: {r.id.split('-')[0]}</span>
                        <span>•</span>
                        <span>{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Telemetry Log (Recent Analyses) */}
        <div className="lg:col-span-8 structured-panel flex flex-col overflow-hidden animate-fade-in-up delay-400">
          <div className="px-5 py-4 border-b border-border bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-700">
              <Activity size={18} strokeWidth={2.5} />
              <span className="font-bold text-sm uppercase tracking-wider">Lịch sử phân tích hệ thống</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-0">
             {!recentAnalyses?.length ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                  <Activity size={32} className="opacity-20 mb-3" />
                  <span className="text-sm font-semibold">Hệ thống đang chờ dữ liệu...</span>
                </div>
             ) : (
               <div className="divide-y divide-border">
                 {recentAnalyses.map((item, i) => (
                   <div key={item.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-6">
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-2">
                             <Clock size={12} className="text-slate-400" />
                             <span className="text-[11px] font-bold text-slate-500 tracking-wider font-mono">
                               {new Date(item.created_at).toLocaleString('vi-VN')}
                             </span>
                           </div>
                           <p className="text-sm font-medium text-slate-800 leading-relaxed truncate">{item.raw_description}</p>
                         </div>
                         
                         {/* Confidence Indicator */}
                         {item.confidence != null && (
                           <div className="shrink-0 flex items-center gap-3 bg-white p-2 rounded border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Độ tin cậy</span>
                              <div className="relative size-10 flex items-center justify-center rounded-full bg-slate-50">
                                <svg className="absolute inset-0 size-full -rotate-90">
                                  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200" />
                                  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - (100 * item.confidence)} className={item.confidence > 0.8 ? "text-green-500" : "text-amber-500"} style={{ transition: 'stroke-dashoffset 1s ease' }} />
                                </svg>
                                <span className="text-[11px] font-bold text-slate-700">{Math.round(item.confidence * 100)}%</span>
                              </div>
                           </div>
                         )}
                      </div>
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

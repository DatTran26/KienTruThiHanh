import { createClient } from '@/lib/supabase/server';
import { ReportCard } from './_components/report-card';
import { CreateReportDialog } from './_components/create-report-dialog';
import { FileText, Database } from 'lucide-react';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reports } = await supabase
    .from('reports')
    .select('id, report_name, report_code, total_amount, status, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  const totalAmount = reports?.reduce((s, r) => s + (r.total_amount ?? 0), 0) ?? 0;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1200px] mx-auto flex flex-col h-full animate-fade-in-up">

      {/* Header */}
      <header className="mb-2 pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lưu Trữ Sự Kiện</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded font-bold border border-blue-100">KHO DỮ LIỆU</span>
        </div>
        
        <div className="flex items-start justify-between gap-4 flex-wrap mt-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Báo cáo hạch toán
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý danh sách các báo cáo chi phí, đóng gói chứng từ và kết xuất biểu mẫu đề nghị thanh toán.
            </p>
          </div>
          <CreateReportDialog />
        </div>
      </header>

      {/* Main Workspace */}
      <div className="structured-panel p-0 flex flex-col overflow-hidden relative flex-1 bg-white shadow-sm ring-1 ring-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
           <span className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
             <Database size={18} className="text-slate-500"/>
             Danh sách báo cáo
           </span>
           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
             {reports?.length ?? 0} BÁO CÁO · TỔNG: {new Intl.NumberFormat('vi-VN').format(totalAmount)} VNĐ
           </span>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto flex-1 z-10 bg-slate-50/30">
          {!reports?.length ? (
            <div className="h-full flex flex-col items-center justify-center py-16 opacity-40">
              <FileText className="size-16 mb-4 text-slate-400" />
              <p className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-2">Kho dữ liệu trống</p>
              <p className="text-sm text-slate-400 mb-8 max-w-sm text-center">
                Bạn chưa có báo cáo nào. Hãy khởi tạo báo cáo mới hoặc thêm chi phí từ hệ thống AI trực tiếp vào báo cáo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((r, i) => (
                <div key={r.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in-up">
                  <ReportCard {...r} status={r.status as 'draft' | 'exported'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

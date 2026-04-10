import { createClient } from '@/lib/supabase/server';
import { Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { OrgForm } from './_components/org-form';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('organization_profiles')
    .select('unit_name, address, tax_code, validation_status')
    .eq('user_id', user!.id)
    .maybeSingle();

  const isVerified = profile?.validation_status === 'matched';

  const steps = [
    { label: 'Xác thực Đơn vị', done: true },
    { label: 'Kiểm tra Mã số Thuế', done: isVerified },
    { label: 'Thiết lập Liên kết Thuế', done: false },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1000px] animate-fade-in-up h-full flex flex-col w-full mx-auto">

      {/* Page header */}
      <header className="mb-2 pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hồ sơ Cán bộ</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded font-bold border border-blue-100">BẮT BUỘC</span>
        </div>
        
        <div className="flex items-start justify-between gap-4 flex-wrap mt-1">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Định danh Đơn vị sự nghiệp
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Thông tin đơn vị cần được đối chiếu và xác thực với cơ sở dữ liệu quốc gia trước khu sử dụng hệ thống.
            </p>
          </div>
          {isVerified && (
            <div className="structured-panel px-3 py-1.5 flex items-center gap-2 bg-green-50 border-green-200 text-green-700 shadow-sm mt-1 sm:mt-0">
              <ShieldCheck className="size-4" />
              <span className="font-bold text-[11px] tracking-wider uppercase">Đã định danh Hợp lệ</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="structured-panel p-0 flex flex-col overflow-hidden relative bg-white shadow-sm ring-1 ring-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
           <span className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
             <Building2 size={18} className="text-slate-500"/>
             Khai báo thông tin đơn vị
           </span>
        </div>

        <div className="p-6 md:p-8 space-y-8 relative z-10 flex flex-col md:flex-row gap-8">
          
          {/* Form container */}
          <div className="flex-1 order-2 md:order-1">
            <p className="text-sm text-slate-600 mb-6 font-medium">
              Vui lòng cung cấp chính xác tên đơn vị, mã số thuế và địa chỉ đăng ký trên Giấy phép kinh doanh / Quyết định thành lập.
            </p>
            <OrgForm initialValues={profile ?? undefined} isVerified={isVerified} />
          </div>

          {/* Sidebar / Progress */}
          <div className="w-full md:w-64 shrink-0 order-1 md:order-2 space-y-6">
            <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Trạng thái định danh</h3>
              <div className="flex flex-col gap-4">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className="mt-0.5">
                       {step.done ? (
                         <CheckCircle2 size={16} className="text-green-500" />
                       ) : (
                         <div className="size-4 rounded-full border-2 border-slate-300 flex items-center justify-center">
                           {i === 1 && !isVerified && <div className="size-1.5 bg-blue-500 rounded-full" />}
                         </div>
                       )}
                    </div>
                    <div className={`text-sm ${step.done ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-md bg-blue-50 border border-blue-100 text-blue-800 text-xs leading-relaxed">
              <strong>Lưu ý:</strong> Việc tra cứu chi phí trên AI chỉ được mở khóa toàn phần sau khi định danh tổ chức hoàn tất.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { Building2, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
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
    <div className="p-4 lg:p-8 space-y-6 max-w-[1000px] animate-fade-in-up flex flex-col w-full mx-auto pb-24 lg:pb-8">

      {/* Page header */}
      <header className="pb-5 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Hồ sơ Cán bộ</span>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] rounded font-bold border border-emerald-200 tracking-wider">BẮT BUỘC</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap mt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Định danh Đơn vị sự nghiệp
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Thông tin đơn vị cần được đối chiếu và xác thực với cơ sở dữ liệu quốc gia trước khi sử dụng hệ thống.
            </p>
          </div>
          {isVerified && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 mt-1 sm:mt-0">
              <ShieldCheck className="size-4" />
              <span className="font-bold text-[10px] tracking-[0.15em] uppercase">Đã định danh Hợp lệ</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="saas-card p-0 flex flex-col overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
             <Building2 size={13} className="text-slate-400"/>
             Khai báo thông tin đơn vị
           </span>
        </div>

        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">

          {/* Form container */}
          <div className="flex-1 order-2 md:order-1">
            <p className="text-[12.5px] text-slate-500 mb-5 font-medium">
              Vui lòng cung cấp chính xác tên đơn vị, mã số thuế và địa chỉ đăng ký trên Giấy phép kinh doanh / Quyết định thành lập.
            </p>
            <OrgForm initialValues={profile ?? undefined} isVerified={isVerified} />
          </div>

          {/* Sidebar / Progress */}
          <div className="w-full md:w-60 shrink-0 order-1 md:order-2 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-4">Trạng thái định danh</h3>
              <div className="flex flex-col gap-3.5">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className="mt-0.5">
                       {step.done ? (
                         <CheckCircle2 size={15} className="text-emerald-500" />
                       ) : (
                         <div className="size-4 rounded-full border-2 border-slate-200 flex items-center justify-center">
                           {i === 1 && !isVerified && <div className="size-1.5 bg-blue-500 rounded-full" />}
                         </div>
                       )}
                    </div>
                    <div className={`text-[12.5px] ${step.done ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-[11.5px] leading-relaxed">
              <strong className="text-blue-800">Lưu ý:</strong> Việc tra cứu chi phí trên AI chỉ được mở khóa toàn phần sau khi định danh tổ chức hoàn tất.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

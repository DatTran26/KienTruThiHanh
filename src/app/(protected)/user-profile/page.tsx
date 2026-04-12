import { createClient, createServiceClient } from '@/lib/supabase/server';
import { Mail, ShieldCheck, Building2, KeyRound, CalendarDays, Zap, FileSymlink, LogOut, ExternalLink, ShieldAlert, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default async function UserProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const serviceSupabase = createServiceClient();
  const { data: userRow } = await serviceSupabase
    .from('users')
    .select('role')
    .eq('id', user!.id)
    .single();
  const isAdmin = (userRow as any)?.role === 'admin';

  const { data: profile } = await supabase
    .from('organization_profiles')
    .select('unit_name, address, tax_code, validation_status')
    .eq('user_id', user!.id)
    .maybeSingle();

  const isVerified = profile?.validation_status === 'matched';

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1000px] mx-auto animate-fade-in-up pb-24 lg:pb-8 min-h-screen">
      
      {/* App Header */}
      <header className="pb-6 border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">
            Hồ sơ Cá nhân
          </h1>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">
            Quản trị thông tin bảo mật và phân quyền hệ thống.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-bold text-[13px] rounded-xl hover:bg-red-100 transition-colors border border-red-100">
          <LogOut className="size-4" /> Đăng xuất
        </button>
      </header>

      {/* Warning/Required Update Banner */}
      {!isVerified && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-[0_20px_60px_-15px_rgba(2ea,88,12,0.3)] mb-8">
          {/* Glowing orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center md:items-stretch gap-8">
            
            {/* Context Section */}
            <div className={`flex-1 flex flex-col justify-center ${!isAdmin ? 'items-center text-center' : ''}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-[11px] uppercase tracking-widest mb-4 w-fit shadow-inner">
                <ShieldAlert className="size-3.5" />
                Dữ liệu rỗng
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">Hoàn tất định danh Tổ chức</h3>
              <p className={`text-[14px] leading-relaxed text-slate-300 font-medium ${!isAdmin ? 'max-w-2xl' : 'max-w-xl'}`}>
                Tài khoản của bạn lần đầu đăng nhập. Để kích hoạt công cụ phân tích AI và kho dữ liệu Master Data, vui lòng cập nhật chính xác <span className="text-orange-400 font-bold border-b border-orange-400/50 pb-0.5">Mã số thuế</span> và các thông tin cơ quan trực thuộc.
              </p>
              
              <div className={`mt-8 flex ${!isAdmin ? 'justify-center' : 'items-center'}`}>
                <Link href="/workspace" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[14px] rounded-2xl shadow-[0_8px_25px_-8px_rgba(249,115,22,0.6)] hover:shadow-[0_12px_35px_-8px_rgba(249,115,22,0.8)] hover:scale-[1.02] transition-all">
                  Cập nhật ngay bây giờ <ExternalLink className="size-4" />
                </Link>
              </div>
            </div>

            {/* Snippet / Reference Data Section - ONLY FOR ADMIN */}
            {isAdmin && (
              <div className="w-full md:w-[450px] shrink-0">
                <div className="h-full rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-xl p-6 relative overflow-hidden flex flex-col justify-center shadow-2xl">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/80 to-transparent opacity-70" />
                   
                   <div className="space-y-5">
                     <div>
                       <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-2 flex items-center gap-2"><Zap className="size-3 text-amber-400"/> Mã số thuế chuẩn</p>
                       <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5 shadow-inner">
                          <span className="font-mono text-2xl font-bold text-amber-400 tracking-[0.2em]">6000930278</span>
                       </div>
                     </div>

                     <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                     <div>
                       <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1.5">Tên Đơn vị</p>
                       <p className="text-[14px] font-bold text-slate-100">Viện kiểm sát nhân dân khu vực 5 – Đắk Lắk</p>
                     </div>
                     
                     <div>
                       <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1.5">Trụ sở hành chính</p>
                       <p className="text-[13px] font-medium text-slate-400">Khu trung tâm hành chính, xã Dray Bhăng, tỉnh Đắk Lắk</p>
                     </div>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ultra-premium Avatar Banner */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center md:items-center gap-8 shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-slate-200/60 ring-4 ring-slate-50 relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-b from-blue-50 to-indigo-50/50 rounded-full blur-[80px] opacity-70" />
        
        <div className={`size-32 rounded-3xl flex items-center justify-center text-white shadow-2xl shrink-0 border-[6px] border-white ring-1 ring-slate-100 relative group overflow-hidden ${isAdmin ? 'bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-800' : 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600'}`}>
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.1] mix-blend-overlay" />
          <div className="absolute inset-x-0 -bottom-10 h-20 bg-gradient-to-t from-black/40 to-transparent blur-md" />
          <span className="text-5xl font-black drop-shadow-md z-10">{user?.email?.[0].toUpperCase()}</span>
          {isVerified && (
            <div className="absolute -bottom-2 -right-2 size-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-20">
              <ShieldCheck className="size-5" />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm ${isAdmin ? 'text-indigo-600 bg-indigo-50 border border-indigo-100/50' : 'text-slate-600 bg-slate-100 border border-slate-200'}`}>
              {isAdmin ? <Zap className="size-3 text-amber-500" /> : <UserIcon className="size-3" />}
              {isAdmin ? 'System Admin' : 'Thành viên'}
            </span>
            <span className="text-[11px] font-bold text-slate-500 border border-slate-200 bg-slate-50 px-2 py-1 rounded-lg">ID: {user?.id.split('-')[0]}</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isAdmin ? 'Quản trị viên Cấp cao' : 'Người dùng Hệ thống'}</h2>
          <p className="text-[15px] text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-2">
            <Mail className="size-4.5 text-slate-400" /> {user?.email}
          </p>
        </div>
        
        <div className="shrink-0 z-10">
           <button className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[14px] font-bold shadow-[0_8px_20px_rgb(15,23,42,0.3)] hover:bg-slate-800 hover:-translate-y-0.5 transition-all w-full md:w-auto text-center border border-slate-800 border-t-slate-700">
             Đổi ảnh đại diện
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Organization & Identity */}
        <div className="md:col-span-7 space-y-8">
          
          <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200/70">
              <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
                <Building2 className="size-5 text-indigo-600" />
              </div>
              <h3 className="font-black text-lg text-slate-800 tracking-tight">Cơ quan Trực thuộc</h3>
              {isVerified && <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100"><ShieldCheck className="size-3.5" /> ĐÃ XÁC MINH</span>}
            </div>

            <div className="space-y-6">
              <div className="group">
                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-1.5 flex items-center gap-2">Tên đơn vị <FileSymlink className="size-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                <p className="font-semibold text-[16px] text-slate-900">{profile?.unit_name || <span className="text-slate-400 italic font-medium">Bạn chưa cấu hình</span>}</p>
              </div>
              <div className="group">
                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-1.5 flex items-center gap-2">Trụ sở hành chính <FileSymlink className="size-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                <p className="font-medium text-slate-600 text-[14px] leading-relaxed max-w-md">{profile?.address || <span className="text-slate-400 italic">Vui lòng khai báo trong (Hồ sơ Tổ chức)</span>}</p>
              </div>
              <div className="group">
                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.15em] mb-1.5">Mã số thuế</p>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-[16px] font-bold text-slate-800 tracking-widest bg-white shadow-sm px-3.5 py-1.5 rounded-lg border border-slate-200/80 inline-block">{profile?.tax_code || '---'}</p>
                  {isVerified && <div className="text-[11px] text-slate-500 font-medium">Đã đồng bộ Tổng Cục Thuế</div>}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200/70">
               <Link href="/workspace" className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-2 decoration-indigo-300 hover:underline underline-offset-4">
                 Thiết lập Cấu trúc phòng ban <ExternalLink className="size-4" />
               </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Security */}
        <div className="md:col-span-5 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 ring-1 ring-slate-900/5 transition-shadow hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]">
             <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
               <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                 <ShieldCheck className="size-5 text-slate-500" />
               </div>
               <h3 className="font-black text-lg text-slate-800 tracking-tight">Khu vực Bảo mật</h3>
            </div>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/80 transition-all group shadow-sm hover:shadow-md">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-white text-slate-400 rounded-xl group-hover:text-indigo-600 border border-slate-200/60 shadow-sm transition-colors">
                      <KeyRound className="size-5" strokeWidth={2.5} />
                   </div>
                   <div className="text-left">
                     <p className="text-[14px] font-bold text-slate-800">Đổi mật khẩu</p>
                     <p className="text-[12px] text-slate-500 font-medium">Bảo mật cấp độ cao</p>
                   </div>
                 </div>
                 <span className="text-slate-300 group-hover:text-indigo-500 font-bold transition-colors">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/80 transition-all group shadow-sm hover:shadow-md">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-white text-slate-400 rounded-xl group-hover:text-indigo-600 border border-slate-200/60 shadow-sm transition-colors">
                      <CalendarDays className="size-5" strokeWidth={2.5} />
                   </div>
                   <div className="text-left">
                     <p className="text-[14px] font-bold text-slate-800">Lịch sử đăng nhập</p>
                     <p className="text-[12px] text-slate-500 font-medium">Bảo vệ phiên làm việc</p>
                   </div>
                 </div>
                  <span className="text-slate-300 group-hover:text-indigo-500 font-bold transition-colors">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

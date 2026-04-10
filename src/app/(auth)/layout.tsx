import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-slate-50">
      
      {/* Decorative background logo/seal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none z-0">
        <ShieldCheck className="w-[120vw] h-[120vw] md:w-[60vw] md:h-[60vw] text-slate-900" />
      </div>

      <div className="absolute top-8 left-8 hidden lg:block opacity-60 z-0">
        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">Cổng Thông Tin Điện Tử</p>
      </div>

      {/* Main Module */}
      <div className="relative z-10 w-full max-w-5xl md:h-[600px] flex flex-col md:flex-row overflow-hidden animate-fade-in-up bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200">
        
        {/* Left Side: Brand Narrative */}
        <div className="w-full md:w-5/12 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between relative overflow-hidden bg-primary text-white">
          
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-primary to-primary z-0 opacity-90" />
          
          <div className="relative z-10">
             {/* Logo Marker */}
             <div className="flex items-center gap-3 mb-12">
                <div className="size-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="size-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white leading-none mb-1">Tra Cứu Chi Phí</h2>
                  <span className="text-[10px] tracking-widest uppercase text-blue-200 font-bold">Cổng Dữ Liệu Nội Bộ</span>
                </div>
             </div>

             <h1 className="text-3xl md:text-4xl font-bold text-white leading-[1.2] mb-6">
               Hệ thống<br/>
               Tra cứu &<br/>
               Định danh
             </h1>
             <p className="text-sm text-blue-100 mb-8 max-w-xs leading-relaxed font-medium">
               Giao thức phân tích chi phí và danh mục ngân sách nhà nước. Yêu cầu đăng nhập phân quyền để truy xuất dữ liệu.
             </p>
          </div>

          <div className="relative z-10 flex flex-col gap-4">
             <div className="h-0.5 w-12 bg-blue-300/50"></div>
             <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-2">
               TRẠNG THÁI: <span className="text-green-400 drop-shadow-sm flex items-center gap-1.5"><span className="size-2 rounded-full bg-green-400 animate-pulse" /> ONLINE</span>
             </p>
          </div>
        </div>

        {/* Right Side: Form Injection */}
        <div className="w-full md:w-7/12 p-8 md:p-12 lg:px-16 flex items-center justify-center bg-white">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
        
      </div>
    </div>
  );
}

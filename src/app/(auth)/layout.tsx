import { Zap, Cpu, ShieldCheck, FileOutput, CheckCircle } from 'lucide-react';


const FEATURES = [
  { icon: Cpu,         label: 'AI phân loại chi phí tự động',        sub: 'Trí tuệ nhân tạo nhận diện chuyên biệt', colorText: 'text-purple-600', colorBg: 'bg-purple-50', colorBorder: 'border-purple-200' },
  { icon: ShieldCheck, label: 'Khớp chuẩn cấu trúc TABMIS',          sub: 'Đối chiếu mục – tiểu mục chính xác', colorText: 'text-emerald-600', colorBg: 'bg-emerald-50', colorBorder: 'border-emerald-200' },
  { icon: FileOutput,  label: 'Xuất biểu mẫu chuẩn nhà nước',        sub: 'Tích hợp mẫu biểu kế toán công', colorText: 'text-rose-500', colorBg: 'bg-rose-50', colorBorder: 'border-rose-200' },
];

const TRUST_INDICATORS = [
  { label: 'Mã hóa TLS 1.3', colorIcon: 'text-amber-700' }, // Nâu (Brown)
  { label: 'TABMIS Đồng bộ', colorIcon: 'text-purple-500' }, // Tím
  { label: 'Dữ liệu nội bộ', colorIcon: 'text-emerald-500' }, // Xanh lá
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-8 relative"
      style={{ background: '#f1f5f9' }}
    >
      {/* ── Centered two-column card ── */}
      <div
        className="w-full max-w-[1140px] flex flex-col lg:flex-row rounded-[24px] overflow-hidden animate-fade-in-up md:min-h-[640px]"
        style={{
          background: '#ffffff',
          boxShadow: '0 20px 40px -15px rgba(15,23,42,0.05), 0 10px 20px -5px rgba(15,23,42,0.02)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* ════ LEFT: Institutional branding panel (Light & Crisp) ════ */}
        <div className="w-full lg:w-[46%] relative overflow-hidden flex flex-col justify-between p-10 lg:p-14 xl:p-16 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100">
          
          {/* Subtle Ambient Background Mesh */}
          <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-100/50 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-100/40 rounded-full blur-[60px] pointer-events-none" />

          {/* Logo Section */}
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="size-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/20">
              <Zap className="size-5.5" strokeWidth={2.5} />
            </div>
            <div className="pt-0.5">
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 font-extrabold text-[19px] tracking-tight leading-none mb-1">VKS</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500 mt-0.5">
                Cổng Dữ Liệu Nội Bộ
              </p>
            </div>
          </div>

          {/* Main Copy Area */}
          <div className="relative z-10 my-10 lg:my-0">
            <h1 className="font-extrabold tracking-tight leading-[1.15] mb-5 text-[clamp(2.5rem,4vw,3.5rem)] text-slate-900">
              Hệ thống Tra cứu<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 pb-1 inline-block">Định danh Chi phí</span>
            </h1>

            <p className="text-[15px] leading-relaxed font-medium mb-12 text-slate-500 max-w-[340px]">
              Nền tảng phân tích chi phí và đối chiếu tiểu mục ngân sách nhà nước sử dụng công nghệ mở rộng tĩnh tự động.
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-5">
              {FEATURES.map(({ icon: Icon, label, sub, colorText, colorBg, colorBorder }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className={`size-11 flex mt-0.5 rounded-xl items-center justify-center shrink-0 border shadow-sm mix-blend-multiply ${colorBg} ${colorBorder} ${colorText}`}>
                    <Icon className="size-5" strokeWidth={2} />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[14px] font-bold text-slate-800 mb-0.5 tracking-tight">
                      {label}
                    </p>
                    <p className="text-[13px] font-medium text-slate-500 leading-snug">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust indicators */}
          <div className="relative z-10 flex flex-wrap gap-x-5 gap-y-2 pt-6 xl:pt-8 border-t border-slate-200/80">
            {TRUST_INDICATORS.map(({ label, colorIcon }) => (
              <span key={label} className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-slate-500">
                <CheckCircle className={`size-3.5 ${colorIcon}`} strokeWidth={2.5} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ════ RIGHT: Form panel ════ */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-14 xl:p-16 relative bg-[#ffffff]">
          <div className="w-full max-w-[420px] mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Zap, Cpu, ShieldCheck, FileOutput, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: Cpu,         label: 'AI phân loại chi phí tự động',        sub: 'GPT-4o · Phân mảnh ngữ nghĩa' },
  { icon: ShieldCheck, label: 'Khớp chuẩn cấu trúc TABMIS',          sub: 'Đối chiếu mục – tiểu mục chính xác' },
  { icon: FileOutput,  label: 'Xuất biểu mẫu chuẩn nhà nước',        sub: 'Tích hợp mẫu biểu kế toán công' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-8"
      style={{ background: '#eef2f7' }}
    >
      {/* ── Centered two-column card ── */}
      <div
        className="w-full max-w-4xl flex flex-col lg:flex-row rounded-2xl overflow-hidden animate-fade-in-up"
        style={{
          background: '#ffffff',
          boxShadow: '0 8px 40px rgba(15,23,42,0.10), 0 2px 8px rgba(15,23,42,0.06)',
          border: '1px solid #e2e8f0',
          minHeight: '560px',
        }}
      >
        {/* ════ LEFT: Institutional branding panel ════ */}
        <div
          className="w-full lg:w-[44%] flex flex-col justify-between p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100"
          style={{
            background: 'linear-gradient(160deg, #0d1b2a 0%, #1a2f4a 100%)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 2px 12px rgba(245,158,11,0.4)',
              }}
            >
              <Zap className="size-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-bold text-[15px] tracking-tight leading-none">VKS ThiHanh</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] mt-1"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                Cổng Dữ Liệu Nội Bộ
              </p>
            </div>
          </div>

          {/* Main copy */}
          <div className="my-10 lg:my-0">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{
                background: 'rgba(245,158,11,0.18)',
                border: '1px solid rgba(245,158,11,0.3)',
                color: 'rgba(251,191,36,0.9)',
              }}
            >
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-amber-400 opacity-70 animate-ping" />
                <span className="relative size-1.5 rounded-full bg-amber-400" />
              </span>
              Hệ thống đang hoạt động
            </div>

            <h1
              className="font-bold tracking-tight leading-[1.1] mb-4"
              style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.4rem)', color: '#ffffff' }}
            >
              Hệ thống Tra cứu<br />
              <span style={{ color: '#fbbf24' }}>Định danh Chi phí</span>
            </h1>

            <p
              className="text-[13px] leading-relaxed font-medium mb-8"
              style={{ color: 'rgba(255,255,255,0.42)', maxWidth: '260px' }}
            >
              Nền tảng phân tích chi phí và đối chiếu tiểu mục ngân sách nhà nước sử dụng trí tuệ nhân tạo.
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-3.5">
              {FEATURES.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3">
                  <div
                    className="size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
                  >
                    <Icon className="size-3.5" strokeWidth={1.8} style={{ color: 'rgba(147,197,253,0.85)' }} />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>
                      {label}
                    </p>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-5 border-t border-white/[0.08]">
            {['Mã hóa TLS 1.3', 'TABMIS Đồng bộ', 'Dữ liệu nội bộ'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-[10px] font-semibold"
                style={{ color: 'rgba(255,255,255,0.30)' }}>
                <CheckCircle className="size-3 text-emerald-500/60" strokeWidth={2} />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ════ RIGHT: Form panel ════ */}
        <div
          className="flex-1 flex flex-col justify-center p-8 lg:p-12"
          style={{ background: '#ffffff' }}
        >
          <div className="w-full max-w-[360px] mx-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}

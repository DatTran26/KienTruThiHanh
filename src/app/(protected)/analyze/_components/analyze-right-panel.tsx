import {
  Clock, TrendingUp, CheckCircle, Zap,
  BookOpen, ShieldCheck, Cpu, BarChart3,
  Activity, Wifi,
} from 'lucide-react';
import { AdminMasterPanel } from './admin-master-panel';

interface Analysis {
  id: string;
  raw_description: string;
  confidence: number | null;
  extracted_amount: number | null;
  created_at: string;
}

interface MasterVersion {
  id: string;
  file_name: string;
  version_no: number;
  item_count: number | null;
  is_active: boolean;
  doc_title: string | null;
  doc_unit: string | null;
  doc_period: string | null;
  effective_date: string | null;
  ai_model: string | null;
  uploaded_at: string;
  parsed_at: string | null;
}

interface Props {
  recentAnalyses: Analysis[];
  totalAnalyses: number;
  totalReports: number;
  popularItems?: { sub_code: string, sub_title: string }[];
  aiModel?: string;
}

const STATUS_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-100',
  'bg-violet-50 text-violet-700 border-violet-100',
  'bg-amber-50 text-amber-700 border-amber-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-orange-50 text-orange-700 border-orange-100',
  'bg-slate-100 text-slate-600 border-slate-200'
];

const QUICK_TIPS = [
  'Càng mô tả chi tiết (tên hoạt động, địa điểm, đối tượng), AI phân loại càng chính xác.',
  'Nên bao gồm số tiền khi có. VD: "Chi phí xăng xe 200.000 đồng".',
  'Có thể nhập nhiều dòng: tên khoản chi + mô tả hoạt động + đơn vị thụ hưởng.',
];

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}g trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

export function AnalyzeRightPanel({ 
  recentAnalyses, 
  totalAnalyses, 
  totalReports,
  popularItems = [],
  aiModel = 'gpt-4o-mini'
}: Props) {
  const STATUSES = [
    { icon: Zap,        label: `${aiModel} · Phân tích`, badge: 'Online',   cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
    { icon: Cpu,        label: 'TABMIS · Database',   badge: 'Live',     cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
    { icon: Wifi,       label: 'API Gateway',         badge: 'Stable',   cls: 'bg-blue-50   text-blue-600   border-blue-100',    dot: 'bg-blue-500'   },
    { icon: ShieldCheck, label: 'TLS 1.3 · Mã hóa',  badge: 'Secured',  cls: 'bg-slate-50  text-slate-600  border-slate-200',   dot: null            },
  ];

  return (
    <div className="flex flex-col h-full">

      {/* ── Panel header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">
          Bảng điều khiển
        </p>
        <h2 className="text-[14px] font-bold text-slate-900 leading-tight">Thông tin hệ thống</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-2">
          <div className="saas-card p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="size-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <BarChart3 size={13} className="text-blue-600" />
              </div>
              <span className="text-[8.5px] font-bold text-emerald-500 uppercase tracking-wider">↑ Live</span>
            </div>
            <p className="text-2xl font-black text-slate-900 leading-none">{totalAnalyses.toLocaleString()}</p>
            <p className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Lần tra cứu</p>
          </div>

          <div className="saas-card p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="size-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                <TrendingUp size={13} className="text-violet-600" />
              </div>
              <span className="text-[8.5px] font-bold text-violet-400 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl font-black text-slate-900 leading-none">{totalReports.toLocaleString()}</p>
            <p className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Báo cáo</p>
          </div>
        </div>

        {/* ── System status ── */}
        <div className="saas-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Activity size={11} className="text-slate-400" />
            <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái hệ thống</p>
          </div>
          <div className="divide-y divide-slate-50">
            {STATUSES.map(({ icon: Icon, label, badge, cls, dot }) => (
              <div key={label} className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                  <Icon size={11} strokeWidth={2} className="text-slate-400" />
                  {label}
                </div>
                <span className={`flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${cls}`}>
                  {dot && <span className={`size-1.5 rounded-full ${dot}`} />}
                  {badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent analyses ── */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Clock size={11} className="text-slate-400" />
            <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-400">Lịch sử gần đây</p>
          </div>

          {recentAnalyses.length === 0 ? (
            <div className="saas-card p-4 text-center">
              <div className="size-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-2.5">
                <Clock size={15} className="text-slate-300" />
              </div>
              <p className="text-[11.5px] font-semibold text-slate-600 mb-0.5">Chưa có lịch sử</p>
              <p className="text-[10px] text-slate-400">Kết quả tra cứu sẽ xuất hiện tại đây</p>
            </div>
          ) : (
            <div className="saas-card overflow-hidden divide-y divide-slate-50">
              {recentAnalyses.map((item) => {
                const pct = item.confidence ? Math.round(item.confidence * 100) : null;
                const isHigh = pct != null && pct >= 85;
                return (
                  <div key={item.id} className="px-3.5 py-2.5 hover:bg-slate-50 transition-colors cursor-default">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[11.5px] font-medium text-slate-700 line-clamp-1 leading-snug flex-1">
                        {item.raw_description}
                      </p>
                      {pct != null && (
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0 border ${
                          isHigh
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {pct}%
                        </span>
                      )}
                    </div>
                    <p className="text-[9.5px] font-medium text-slate-400">
                      {formatRelativeTime(item.created_at)}
                      {item.extracted_amount
                        ? ` · ${new Intl.NumberFormat('vi-VN').format(item.extracted_amount)} đ`
                        : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Common expense codes ── */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <BookOpen size={11} className="text-slate-400" />
            <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-400">Mã tiểu mục phổ biến</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {popularItems.length > 0 ? popularItems.map((item, idx) => (
              <span
                key={item.sub_code}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[idx % STATUS_COLORS.length]}`}
              >
                <span className="font-mono font-black text-[9.5px]">{item.sub_code}</span>
                <span className="opacity-40">·</span>
                <span className="truncate max-w-[120px]">{item.sub_title}</span>
              </span>
            )) : (
              <span className="text-[11px] text-slate-400 italic py-1">Chưa có dữ liệu</span>
            )}
          </div>
        </div>

        {/* ── Quick tips ── */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle size={11} className="text-slate-400" />
            <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-400">Mẹo nhập liệu</p>
          </div>
          <div className="saas-card overflow-hidden divide-y divide-slate-50">
            {QUICK_TIPS.map((tip, i) => (
              <div key={i} className="px-3.5 py-2.5 flex items-start gap-2.5">
                <span className="text-blue-400 font-black text-[9px] mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-slate-100 shrink-0 flex items-center justify-between">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-slate-300">
          KienTru · v2.0
        </p>
        <div className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[8.5px] font-bold text-emerald-500 uppercase tracking-wider">Online</p>
        </div>
      </div>

    </div>
  );
}

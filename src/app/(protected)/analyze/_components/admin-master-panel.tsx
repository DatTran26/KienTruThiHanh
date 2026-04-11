'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useMemo } from 'react';
import {
  Upload, CheckCircle2, AlertCircle, Loader2,
  Database, FileSpreadsheet, X, ChevronDown, ChevronUp,
  PackageCheck, PencilLine, FolderTree, Layers, Sparkles, Search, ChevronRight
} from 'lucide-react';

const COLOR_SCHEME = [
  { groupBadge: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/50 backdrop-blur-sm', groupIcon: 'from-indigo-500 to-indigo-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_20px_-6px_rgba(99,102,241,0.5)]', line: 'from-indigo-300/70', nodeBorderHover: 'hover:border-indigo-300', childBgMain: 'bg-[linear-gradient(110deg,theme(colors.indigo.50/95),theme(colors.white/95))] border-indigo-200/60 shadow-[inset_0_1px_4px_rgba(255,255,255,0.8),0_4px_16px_-4px_rgba(99,102,241,0.08)]', childBadgeMain: 'text-indigo-700 bg-indigo-100/50 border-indigo-200/60', hoverDot: 'group-hover/item:border-indigo-500 group-hover/item:shadow-[0_0_8px_theme(colors.indigo.400)]' },
  { groupBadge: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/50 backdrop-blur-sm', groupIcon: 'from-emerald-400 to-teal-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_20px_-6px_rgba(16,181,129,0.5)]', line: 'from-emerald-300/70', nodeBorderHover: 'hover:border-emerald-300', childBgMain: 'bg-[linear-gradient(110deg,theme(colors.emerald.50/95),theme(colors.white/95))] border-emerald-200/60 shadow-[inset_0_1px_4px_rgba(255,255,255,0.8),0_4px_16px_-4px_rgba(16,181,129,0.08)]', childBadgeMain: 'text-emerald-700 bg-emerald-100/50 border-emerald-200/60', hoverDot: 'group-hover/item:border-emerald-500 group-hover/item:shadow-[0_0_8px_theme(colors.emerald.400)]' },
  { groupBadge: 'bg-amber-50/80 text-amber-700 border-amber-200/50 backdrop-blur-sm', groupIcon: 'from-amber-400 to-orange-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_20px_-6px_rgba(245,158,11,0.5)]', line: 'from-amber-300/70', nodeBorderHover: 'hover:border-amber-300', childBgMain: 'bg-[linear-gradient(110deg,theme(colors.amber.50/95),theme(colors.white/95))] border-amber-200/60 shadow-[inset_0_1px_4px_rgba(255,255,255,0.8),0_4px_16px_-4px_rgba(245,158,11,0.08)]', childBadgeMain: 'text-amber-700 bg-amber-100/50 border-amber-200/60', hoverDot: 'group-hover/item:border-amber-500 group-hover/item:shadow-[0_0_8px_theme(colors.amber.400)]' },
  { groupBadge: 'bg-rose-50/80 text-rose-700 border-rose-200/50 backdrop-blur-sm', groupIcon: 'from-rose-400 to-pink-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_20px_-6px_rgba(244,63,94,0.5)]', line: 'from-rose-300/70', nodeBorderHover: 'hover:border-rose-300', childBgMain: 'bg-[linear-gradient(110deg,theme(colors.rose.50/95),theme(colors.white/95))] border-rose-200/60 shadow-[inset_0_1px_4px_rgba(255,255,255,0.8),0_4px_16px_-4px_rgba(244,63,94,0.08)]', childBadgeMain: 'text-rose-700 bg-rose-100/50 border-rose-200/60', hoverDot: 'group-hover/item:border-rose-500 group-hover/item:shadow-[0_0_8px_theme(colors.rose.400)]' },
  { groupBadge: 'bg-cyan-50/80 text-cyan-700 border-cyan-200/50 backdrop-blur-sm', groupIcon: 'from-cyan-400 to-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_20px_-6px_rgba(6,182,212,0.5)]', line: 'from-cyan-300/70', nodeBorderHover: 'hover:border-cyan-300', childBgMain: 'bg-[linear-gradient(110deg,theme(colors.cyan.50/95),theme(colors.white/95))] border-cyan-200/60 shadow-[inset_0_1px_4px_rgba(255,255,255,0.8),0_4px_16px_-4px_rgba(6,182,212,0.08)]', childBadgeMain: 'text-cyan-700 bg-cyan-100/50 border-cyan-200/60', hoverDot: 'group-hover/item:border-cyan-500 group-hover/item:shadow-[0_0_8px_theme(colors.cyan.400)]' },
];

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

interface UploadResult {
  versionId: string;
  versionNo: number;
  itemCount: number;
  rawRowCount: number;
  aiModel: string;
  meta: {
    title: string;
    unit: string;
    period: string | null;
    effectiveDate: string | null;
    parsedByModel: string;
    parsedAt: string;
  };
  parseErrors: string[];
  preview: {
    groupCode: string;
    groupTitle: string;
    subCode: string;
    subTitle: string;
    notes: string | null;
  }[];
}

interface Props {
  activeMaster: MasterVersion | null;
  onClose: () => void;
}

function fmt(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function AdminMasterPanel({ activeMaster, onClose }: Props) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingActive, setLoadingActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleViewDetails() {
    if (!activeMaster) return;
    setLoadingActive(true);
    setError(null);
    try {
      const res = await fetch(`/api/master-items?versionId=${activeMaster.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Lỗi tải dữ liệu');
      setResult(json as UploadResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setLoadingActive(false);
    }
  }

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload-master-file', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload thất bại');
      setResult(json as UploadResult);
      
      // Refresh to fetch new activeMaster from server
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const groupedPreview = useMemo(() => {
    if (!result?.preview) return [];

    const query = searchQuery.toLowerCase().trim();
    const filteredPreview = query
      ? result.preview.filter(item => 
          item.subCode.toLowerCase().includes(query) ||
          item.subTitle.toLowerCase().includes(query) ||
          item.groupCode.toLowerCase().includes(query) ||
          item.groupTitle.toLowerCase().includes(query)
        )
      : result.preview;

    // Limit to 3000 to avoid browser slow downs with huge datasets like 10,000+ rows
    const sliceData = filteredPreview.slice(0, 3000);
    const groups: { code: string, title: string, children: typeof result.preview }[] = [];
    sliceData.forEach(item => {
      let group = groups.find(g => g.code === item.groupCode);
      if (!group) {
        group = { code: item.groupCode, title: item.groupTitle, children: [] };
        groups.push(group);
      }
      group.children.push(item);
    });
    return groups;
  }, [result?.preview, searchQuery]);

  return (
    <>
      {/* ── Overlay ── */}
      <div 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose} 
      />

      {/* ── Modal Container ── */}
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl bg-white border border-slate-200 animate-scale-in max-h-[90vh] flex overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          result ? 'w-[95vw] max-w-[1250px]' : 'w-[520px]'
        }`}
        style={{ boxShadow: '0 24px 64px rgba(15,23,42,0.2), 0 8px 24px rgba(15,23,42,0.08)' }}
      >
        
        {/* ── LEFT COLUMN (Upload & Meta) ── */}
        <div className="w-[520px] shrink-0 flex flex-col bg-white">
          <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                <PencilLine size={16} className="text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-500 mb-0.5">
                  Quản trị
                </p>
                <h3 className="font-bold text-[14px] text-slate-800 leading-none">Kho dữ liệu chuẩn</h3>
              </div>
            </div>
            {!result && (
              <button onClick={onClose} className="size-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Active master info */}
            {activeMaster ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <PackageCheck size={18} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        activeMaster.is_active
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {activeMaster.is_active ? '● Đang sử dụng' : '○ Chờ kích hoạt'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Version {activeMaster.version_no}</span>
                    </div>
                    <p className="text-[14px] font-bold text-slate-800 leading-tight pr-2">
                      {activeMaster.doc_title || activeMaster.file_name}
                    </p>
                    {activeMaster.doc_unit && (
                      <p className="text-[11.5px] text-slate-500 font-medium mt-1 leading-snug pr-2">{activeMaster.doc_unit}</p>
                    )}
                  </div>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                  {[
                    { label: 'Số tiểu mục', value: `${activeMaster.item_count ?? 0} mục` },
                    { label: 'Ngày tải', value: fmt(activeMaster.uploaded_at) },
                    ...(activeMaster.effective_date ? [{ label: 'Hiệu lực', value: activeMaster.effective_date }] : []),
                    ...(activeMaster.doc_period ? [{ label: 'Giai đoạn', value: activeMaster.doc_period }] : []),
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                      <p className="text-[12.5px] font-semibold text-slate-700 leading-snug break-words pr-2">{value}</p>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleViewDetails}
                  disabled={loadingActive}
                  className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 rounded-lg bg-white border border-indigo-200 shadow-sm text-indigo-600 font-bold text-[11px] hover:bg-indigo-50 hover:border-indigo-300 transition-[colors,transform] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loadingActive ? <Loader2 size={13} strokeWidth={3} className="animate-spin" /> : <FolderTree size={13} strokeWidth={2.5} />}
                  XEM CẤU TRÚC WORKTREE
                </button>
              </div>
            ) : (
              <div className="saas-card p-6 text-center shadow-sm">
                <Database size={24} className="text-slate-300 mx-auto mb-3" />
                <p className="text-[13px] font-bold text-slate-700">Hệ thống chưa có dữ liệu</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Upload file Excel danh mục MLNS để cấu hình AI nhận diện
                </p>
              </div>
            )}

            <div className="rounded-xl border border-blue-100/80 bg-[linear-gradient(to_bottom,theme(colors.blue.50/50),theme(colors.blue.50/20))] p-5 space-y-4 shadow-[inset_0_2px_10px_rgba(255,255,255,0.8)]">
              <div className="flex items-center gap-2">
                <Upload size={14} className="text-blue-600" />
                <h4 className="text-[13px] font-bold text-blue-900">Tải lên dữ liệu mới</h4>
              </div>

              {/* Upload Zone */}
              <div className="space-y-4">
                <div
                  className={`relative border-[1.5px] border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-white/60 backdrop-blur-sm shadow-sm
                    ${uploading ? 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]' : 'border-blue-200 hover:border-blue-400 hover:bg-white hover:shadow-md'}`}
                  onClick={() => !uploading && inputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".xls,.xlsx"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3 py-2">
                      <Loader2 size={24} className="text-blue-500 animate-spin" />
                      <div>
                        <p className="text-[13px] font-bold text-blue-800">Đang quét & đồng bộ...</p>
                        <p className="text-[11px] text-blue-600/80 mt-1">Dùng công nghệ Hybrid AI quét trong tích tắc</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="size-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-2 shadow-sm text-blue-600">
                        <FileSpreadsheet size={18} />
                      </div>
                      <p className="text-[13px] font-bold text-slate-700">
                        Kéo thả file vào đây hoặc <span className="text-blue-600">tải lên</span>
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">Định dạng .xls, .xlsx</p>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 shadow-sm animate-fade-in">
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-red-800">Tải lên thất bại</p>
                      <p className="text-[11px] text-red-600 mt-0.5 break-words leading-relaxed">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-300 hover:text-red-500 px-1">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Upload Success Alert */}
                {result && (
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 shadow-sm animate-fade-in">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-emerald-800">
                        Phân tích thành công {result.itemCount.toLocaleString('vi-VN')} mục
                      </p>
                      <p className="text-[11px] font-medium text-emerald-700/80 mt-1">
                        Version {result.versionNo} · AI: {result.aiModel}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* AI Context Card */}
                {result?.meta.title && (
                  <div className="relative overflow-hidden rounded-xl border border-indigo-200/60 bg-[linear-gradient(135deg,theme(colors.indigo.50/60),theme(colors.blue.50/20)_100%)] p-5 shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),0_4px_10px_rgba(99,102,241,0.05)] backdrop-blur-md">
                    {/* Glowing blur orb */}
                    <div className="absolute -top-10 -right-10 size-32 rounded-full bg-blue-300 blur-3xl opacity-30 pointer-events-none" />

                    <div className="flex items-center gap-2 mb-4 relative z-10">
                      <div className="size-6 rounded bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-sm">
                        <Sparkles size={11} className="text-white" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-indigo-700">TỔNG HỢP KIẾN THỨC</p>
                    </div>

                    <div className="space-y-2.5 relative z-10">
                      {[
                        { label: 'Tiêu đề', value: result.meta.title },
                        { label: 'Cơ quan', value: result.meta.unit },
                        { label: 'Ngày áp dụng', value: result.meta.effectiveDate },
                      ].filter(r => r.value).map(({ label, value }) => (
                        <div key={label} className="flex gap-4 items-start">
                          <span className="text-[11.5px] font-bold text-amber-600 w-[75px] shrink-0">{label}</span>
                          <span className="text-[13px] font-bold text-slate-800 break-words flex-1 leading-snug">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Extracted Data Tree) ── */}
        {result && (
          <div className="flex-1 bg-[radial-gradient(ellipse_at_top_right,theme(colors.indigo.50/50),transparent_50%),radial-gradient(ellipse_at_bottom_left,theme(colors.blue.50/40),transparent_50%)] bg-slate-50 border-l border-white shadow-[inset_1px_0_10px_rgba(0,0,0,0.02)] flex flex-col min-w-0">
            <div className="p-6 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl shrink-0 flex items-center justify-between z-40">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-white flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(99,102,241,0.2)]">
                  <FolderTree size={16} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-[14px] font-extrabold text-slate-800 leading-none mb-1">Cấu trúc Worktree</h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Toàn bộ dữ liệu trích xuất ({result.itemCount.toLocaleString('vi-VN')} mục)
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="size-8 rounded-full bg-white/80 border border-white flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-[colors,transform] hover:scale-105 active:scale-95">
                <X size={15} />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="px-6 py-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.08)] bg-white/60 backdrop-blur-xl border-b border-white/80 sticky top-0 z-30">
              <div className="relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm tiểu mục, mã số, hoặc tên nhóm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/50 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02),0_1px_2px_rgba(255,255,255,0.8)] border border-white rounded-[14px] py-3 pl-11 pr-4 text-[13px] font-medium text-slate-700 outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 size-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 md:p-8 relative isolate space-y-8">
              {groupedPreview.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                  <FolderTree size={48} className="text-slate-300 mb-4" />
                  <p className="text-[14px] font-bold text-slate-500">Không tìm thấy kết quả</p>
                  <p className="text-[12px] text-slate-400 mt-1">Thử lại với một từ khóa khác</p>
                </div>
              ) : groupedPreview.map((group, gIdx) => {
                const scheme = COLOR_SCHEME[gIdx % COLOR_SCHEME.length];
                return (
                  <div key={group.code} className="relative mt-2">
                    {/* Connection line between groups */}
                    {gIdx !== groupedPreview.length - 1 && (
                      <div className={`absolute left-[25px] top-[40px] bottom-[-48px] w-[2px] bg-gradient-to-b ${scheme.line} via-slate-200/50 to-transparent -z-10 rounded-full`} />
                    )}
                    
                    {/* GROUP HEADER */}
                    <div className="flex items-start gap-4 group">
                      <div className="relative flex flex-col items-center mt-0.5 shrink-0 z-10">
                        {/* Glow effect behind the icon */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${scheme.groupIcon} blur-md opacity-30 rounded-2xl group-hover:opacity-50 transition-opacity`} />
                        <div className={`relative size-[50px] rounded-[16px] bg-gradient-to-br ${scheme.groupIcon} flex items-center justify-center border border-white/40 group-hover:scale-[1.03] transition-transform`}>
                          <Layers size={22} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-1.5 pb-2">
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.15em] inline-flex items-center px-2.5 py-[3px] rounded-md border shadow-[0_2px_4px_rgba(0,0,0,0.02)] mb-2 transition-colors ${scheme.groupBadge}`}>
                          Nhóm {group.code}
                        </h4>
                        <p className="text-[15px] font-extrabold text-slate-800 leading-snug drop-shadow-sm pr-4">
                          {group.title}
                        </p>
                      </div>
                    </div>

                    {/* CHILDREN ITEMS */}
                    <div className="relative pl-[25px] ml-[25px] mt-3 border-l-[2px] border-slate-200/40 space-y-3">
                      {group.children.map((item, i) => {
                        const isMain = item.subCode === group.code;
                        return (
                          <div key={`${item.subCode}-${i}`} className="relative flex items-center gap-4 group/item hover:z-20">
                            {/* horizontal connector */}
                            <div className="absolute left-[-2px] top-1/2 w-[18px] h-[2px] bg-slate-200/50 -translate-y-1/2 -z-10 rounded-r-full" />
                            {/* tiny glowing dot */}
                            <div className={`absolute left-[-5px] top-1/2 size-2.5 rounded-full border-[2px] border-slate-300 bg-white -translate-y-1/2 ${scheme.hoverDot} group-hover/item:scale-[1.3] transition-all duration-300`} />

                            <div className={`flex-1 min-w-0 rounded-2xl p-4 transition-all duration-300 border ${
                              isMain 
                                ? scheme.childBgMain
                                : `bg-white/70 backdrop-blur-md border-white hover:bg-white hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-[1.5px] ${scheme.nodeBorderHover}`
                            }`}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={`font-mono text-[10.5px] font-black px-2 py-0.5 rounded uppercase tracking-[0.1em] border shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
                                  isMain 
                                    ? scheme.childBadgeMain
                                    : 'text-slate-600 bg-slate-100/50 border-slate-200/60'
                                }`}>
                                  {!isMain && <ChevronRight size={10} className="inline-block mr-0.5 text-slate-400 mt-[-1px]" />}
                                  {item.subCode.replace(/-/g, ' ‑ ')}
                                </span>
                              </div>
                              <p className={`text-[13px] leading-snug ${isMain ? 'font-extrabold text-slate-900 drop-shadow-sm' : 'font-bold text-slate-700'}`}>
                                {item.subTitle}
                              </p>
                              {item.notes && (
                                <div className="mt-3 px-3.5 py-2.5 bg-slate-50/70 rounded-xl border border-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
                                  <p className="text-[11.5px] font-medium text-slate-500 italic leading-relaxed">
                                    {item.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {result.preview.length > 3000 && (
                <div className="text-center py-4">
                  <p className="text-[12px] font-bold text-slate-400">...và {result.itemCount - 3000} mục khác (đã ẩn để duy trì độ mượt cho trình duyệt)</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
